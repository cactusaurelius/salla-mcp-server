import type { AuthRequest, OAuthHelpers } from '@cloudflare/workers-oauth-provider'
import { Hono, Context } from 'hono'
import { fetchUpstreamAuthToken, getUpstreamAuthorizeUrl, Props } from './oauth'
import { clientIdAlreadyApproved, parseRedirectApproval, renderApprovalDialog } from './workers-oauth-utils'

const app = new Hono<{ Bindings: Env & { OAUTH_PROVIDER: OAuthHelpers } }>()

app.get('/authorize', async (c) => {
  const oauthReqInfo = await c.env.OAUTH_PROVIDER.parseAuthRequest(c.req.raw)
  const { clientId } = oauthReqInfo
  if (!clientId) {
    return c.text('Invalid request', 400)
  }

  if (await clientIdAlreadyApproved(c.req.raw, oauthReqInfo.clientId, c.env.COOKIE_ENCRYPTION_KEY)) {
    return redirectToSalla(c, oauthReqInfo)
  }

  return renderApprovalDialog(c.req.raw, {
    client: await c.env.OAUTH_PROVIDER.lookupClient(clientId),
    server: {
        provider: "salla",
        name: 'Salla MCP Server',
        logo: "https://accounts.salla.sa/./accounts/images/salla-smile.svg",
        description: 'Connect to your Salla store to manage products, orders, customers, and analytics through AI assistants.',
    },
    state: { oauthReqInfo },
  })
})

app.post('/authorize', async (c) => {
  const { state, headers } = await parseRedirectApproval(c.req.raw, c.env.COOKIE_ENCRYPTION_KEY)
  if (!state.oauthReqInfo) {
    return c.text('Invalid request', 400)
  }

  return redirectToSalla(c, state.oauthReqInfo, headers)
})

async function redirectToSalla(c: Context, oauthReqInfo: AuthRequest, headers: Record<string, string> = {}) {
  const redirectUri = new URL('/callback/salla', c.req.raw.url).href
  console.log('Salla OAuth redirect URI:', redirectUri)
  
  const authUrl = getUpstreamAuthorizeUrl({
    upstream_url: c.env.SALLA_AUTH_URL,
    scope: 'offline_access',
    client_id: c.env.SALLA_CLIENT_ID,
    redirect_uri: redirectUri,
    state: btoa(JSON.stringify(oauthReqInfo)),
  })
  
  console.log('Salla OAuth authorization URL:', authUrl)
  
  return new Response(null, {
    status: 302,
    headers: {
      ...headers,
      location: authUrl,
    },
  })
}

/**
 * OAuth Callback Endpoint
 *
 * This route handles the callback from Salla after user authentication.
 * It exchanges the temporary code for an access token, then stores some
 * user metadata & the auth token as part of the 'props' on the token passed
 * down to the client. It ends by redirecting the client back to _its_ callback URL
 */
app.get('/callback/salla', async (c) => {
  console.log('🎯 Salla callback received at:', c.req.url)
  console.log('🎯 Query parameters:', c.req.query())
  
  // Get the oathReqInfo out of state
  const oauthReqInfo = JSON.parse(atob(c.req.query('state') as string)) as AuthRequest
  if (!oauthReqInfo.clientId) {
    return c.text('Invalid state', 400)
  }

  // Exchange the code for an access token
  const code = c.req.query('code')
  if (!code) {
    return c.text('Missing code', 400)
  }

  const [accessToken, sallaErrResponse] = await fetchUpstreamAuthToken({
    upstream_url: c.env.SALLA_TOKEN_URL,
    client_id: c.env.SALLA_CLIENT_ID,
    client_secret: c.env.SALLA_CLIENT_SECRET,
    code,
    redirect_uri: new URL('/callback/salla', c.req.url).href,
    grant_type: 'authorization_code',
  })
  if (sallaErrResponse) {
    return sallaErrResponse
  }

  // Fetch the user info from Salla
  const userResponse = await fetch(`${c.env.SALLA_BASE_URL}/oauth2/user/info`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
  if (!userResponse.ok) {
    return c.text(`Failed to fetch user info: ${await userResponse.text()}`, 500)
  }

  const userData = await userResponse.json() as {
    data?: {
      id: string | number;
      name?: string;
      email?: string;
      store?: {
        id: string | number;
        name?: string;
        email?: string;
        url?: string;
      };
    };
    id?: string | number;
    name?: string;
    email?: string;
    store?: {
      id: string | number;
      name?: string;
      email?: string;
      url?: string;
    };
  }
  
  const userInfo = userData.data || userData
  const { id, name, email, store } = userInfo

  if (!id) {
    return c.text('Failed to get user ID from Salla', 500)
  }

  // Return back to the MCP client a new token
  const { redirectTo } = await c.env.OAUTH_PROVIDER.completeAuthorization({
    request: oauthReqInfo,
    userId: id.toString(),
    metadata: {
      label: name || store?.name || 'Salla User',
    },
    scope: oauthReqInfo.scope,
    props: {
      login: id.toString(),
      name: name || store?.name || 'Salla User',
      email: email || store?.email || '',
      userEmail: email || store?.email || '',
      accessToken,
    } as Props,
  })

  return Response.redirect(redirectTo)
})

export { app as SallaHandler } 