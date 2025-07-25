# Salla MCP Server: E-commerce AI Integration

This project provides a Model Context Protocol (MCP) server that connects AI assistants like Claude and Cursor to your Salla e-commerce store. It enables AI-powered store management, product operations, order processing, and customer analytics through natural language interactions.

> [!NOTE]
> This is a specialized MCP server for Salla stores built on the MCP Boilerplate foundation. You'll need a Salla store and Partner Portal access to use this server.

## What You'll Get

- An MCP server that connects your Salla store to AI assistants
- Secure OAuth authentication with Salla
- AI-powered tools for:
  - Product management (create, update, list products)
  - Order processing (view, update order status)
  - Customer management (view customer details)
  - Store analytics and information
- Optional payment processing for premium features

## Prerequisites

Before starting, make sure you have:

- Node.js installed (download from [nodejs.org](https://nodejs.org/))
- A Cloudflare account (sign up at [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up))
- A Salla store and Partner Portal account ([salla.partners](https://salla.partners/))
- An active Salla OAuth application configured in the Partner Portal

## Step-by-Step Setup

### Step 1: Get the Code

1. Clone this repository to your computer:
```bash
git clone https://github.com/your-username/salla-mcp-server.git
cd salla-mcp-server
```

2. Install everything needed:
```bash
npm install
```

### Step 2: Set Up the Database

1. Install Wrangler (Cloudflare's tool) if you haven't already:
```bash
npm install -g wrangler
```

2. Create the required KV namespaces:
```bash
npx wrangler kv namespace create "OAUTH_KV"
npx wrangler kv namespace create "OAUTH_KV" --preview
npx wrangler kv namespace create "TOKENS"
npx wrangler kv namespace create "TOKENS" --preview
```

3. After running these commands, you'll see output with `id` and `preview_id` values

4. Open the `wrangler.jsonc` file and update the KV namespace bindings with your IDs:
```json
"kv_namespaces": [
  {
    "binding": "OAUTH_KV",
    "id": "your-oauth-kv-id",
    "preview_id": "your-oauth-kv-preview-id"
  },
  {
    "binding": "TOKENS",
    "id": "your-tokens-id", 
    "preview_id": "your-tokens-preview-id"
  }
]
```

### Step 3: Configure Your Salla OAuth Application

1. Go to the [Salla Partner Portal](https://salla.partners/)
2. Navigate to your OAuth application or create a new one
3. Configure the OAuth application settings:
   - **Application Name**: Your MCP Server name
   - **Redirect URI**: `http://localhost:8787/callback/salla` (for local development)
   - **Scopes**: Ensure you have the necessary permissions for:
     - Store information access
     - Products management
     - Orders management  
     - Customers access
4. Note your **Client ID** and **Client Secret** from the application settings

### Step 4: Set Up Your Local Settings

1. Create your environment variables file:
```bash
cp .dev.vars.example .dev.vars
```

2. Open the `.dev.vars` file and configure it with your Salla credentials:
```ini
# Base configuration
BASE_URL="http://localhost:8787"
WORKER_URL="http://localhost:8787"
COOKIE_ENCRYPTION_KEY="generate-a-random-string-at-least-32-characters"

# Salla OAuth Configuration
SALLA_CLIENT_ID="your-salla-client-id"
SALLA_CLIENT_SECRET="your-salla-client-secret"
SALLA_BASE_URL="https://api.salla.dev"
SALLA_AUTH_URL="https://accounts.salla.sa/oauth2/auth"
SALLA_TOKEN_URL="https://accounts.salla.sa/oauth2/token"

# Optional: Stripe configuration (if using premium features)
# STRIPE_SECRET_KEY=""
# STRIPE_SUBSCRIPTION_PRICE_ID=""
# STRIPE_ONE_TIME_PRICE_ID=""
# STRIPE_METERED_PRICE_ID=""
```

For the `COOKIE_ENCRYPTION_KEY`, generate a secure random string:
```bash
openssl rand -hex 32
```

### Step 5: Start Your Server Locally

1. Run the development server:
```bash
npm run dev
```

2. Your server will be available at `http://localhost:8787`
3. The MCP endpoint will be at `http://localhost:8787/sse`

### Step 6: Test Your Setup

You can test your Salla MCP server with various AI assistants:

#### With Claude Desktop:

1. Open Claude Desktop
2. Go to Settings > Developer > Edit Config
3. Add your server configuration:
```json
{
  "mcpServers": {
    "salla_store": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:8787/sse"
      ]
    }
  }
}
```
4. Restart Claude Desktop
5. You'll be prompted to authenticate with your Salla store
6. After authentication, you can use natural language to manage your store:
   - "Show me my recent orders"
   - "List my top products"
   - "Create a new product called 'Premium T-Shirt'"
   - "Update order #12345 status to shipped"

#### With MCP Inspector:

1. Run MCP Inspector:
```bash
npx @modelcontextprotocol/inspector@0.11.0
```
2. Enter your server URL: `http://localhost:8787/sse`
3. Use the web interface to test individual tools
4. Debug request/response data during development

#### With Cursor:

1. Configure Cursor to connect to your MCP server
2. Use AI-powered code assistance with access to your Salla store data
3. Generate store reports, analyze customer data, or automate store operations

## Available Tools

Your Salla MCP server provides these AI tools:

### Store Management
- **`salla-store-info`**: Get general information about your store
- **`salla-categories-list`**: List all product categories
- **`salla-brands-list`**: List all brands in your store

### Product Management  
- **`salla-products-list`**: List products with search and pagination
- **`salla-product-details`**: Get detailed information about a specific product
- **`salla-product-create`**: Create new products
- **`salla-product-update`**: Update existing products

### Order Management
- **`salla-orders-list`**: List orders with filtering and pagination
- **`salla-order-details`**: Get detailed order information
- **`salla-order-status-update`**: Update order status

### Customer Management
- **`salla-customers-list`**: List customers with search capabilities
- **`salla-customer-details`**: Get detailed customer information

### Basic Tools
- **`add`**: Simple addition tool (example)
- **`calculate`**: Basic calculator (example)

## Going Live (Deployment)

When you're ready to deploy your server:

1. Deploy to Cloudflare Workers:
```bash
npx wrangler deploy
```

2. You'll get a production URL like `https://your-worker-name.your-account.workers.dev`

3. Update your Salla OAuth application:
   - Add the production redirect URI: `https://your-worker-name.your-account.workers.dev/callback/salla`
   - Publish your OAuth application if it's in testing mode

4. Set your production environment variables:
```bash
npx wrangler secret put SALLA_CLIENT_ID
npx wrangler secret put SALLA_CLIENT_SECRET  
npx wrangler secret put COOKIE_ENCRYPTION_KEY
npx wrangler secret put BASE_URL
npx wrangler secret put WORKER_URL
npx wrangler secret put SALLA_BASE_URL
npx wrangler secret put SALLA_AUTH_URL
npx wrangler secret put SALLA_TOKEN_URL
```

For `BASE_URL` and `WORKER_URL`, use your production Cloudflare URL.

## Adding Custom Tools

You can extend your Salla MCP server with custom tools:

### Creating a Free Tool

1. Create a new file in `src/tools/` (e.g., `myCustomTool.ts`):

```typescript
import { z } from "zod";
import { experimental_PaidMcpAgent as PaidMcpAgent } from "@stripe/agent-toolkit/cloudflare";

export function myCustomTool(agent: PaidMcpAgent<Env, any, any>) {
  const server = agent.server;
  
  server.tool(
    "my_custom_tool",
    "Description of what your tool does",
    {
      input: z.string().describe("Input parameter description"),
    },
    async ({ input }: { input: string }) => {
      // Your tool logic here
      return {
        content: [{ type: "text", text: `Processed: ${input}` }],
      };
    }
  );
}
```

2. Export your tool in `src/tools/index.ts`:
```typescript
export * from './myCustomTool';
```

3. Register your tool in `src/index.ts`:
```typescript
// Inside the init() method:
tools.myCustomTool(this);
```

### Using Salla API in Custom Tools

Access the authenticated user's Salla store data in your custom tools:

```typescript
export function myStoreTool(agent: PaidMcpAgent<Env, any, any>) {
  const server = agent.server;
  
  server.tool(
    "my_store_analysis",
    "Analyze store performance", 
    {},
    async () => {
      const props = agent.props as any;
      const accessToken = props.accessToken;
      
      // Make authenticated requests to Salla API
      const response = await fetch(`${agent.env.SALLA_BASE_URL}/admin/v2/products`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      return {
        content: [{ type: "text", text: `Found ${data.data.length} products` }],
      };
    }
  );
}
```

## API Reference

### Salla API Endpoints

Your tools can access these Salla API endpoints with the user's authenticated token:

- **Products**: `/admin/v2/products`
- **Orders**: `/admin/v2/orders` 
- **Customers**: `/admin/v2/customers`
- **Store Info**: `/admin/v2/store/info`
- **Categories**: `/admin/v2/categories`
- **Brands**: `/admin/v2/brands`

See the [Salla API Documentation](https://docs.salla.dev/) for complete endpoint details.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SALLA_CLIENT_ID` | Your Salla OAuth application client ID | Yes |
| `SALLA_CLIENT_SECRET` | Your Salla OAuth application client secret | Yes |
| `SALLA_BASE_URL` | Salla API base URL (`https://api.salla.dev`) | Yes |
| `SALLA_AUTH_URL` | Salla OAuth authorization URL | Yes |
| `SALLA_TOKEN_URL` | Salla OAuth token exchange URL | Yes |
| `BASE_URL` | Your server's base URL | Yes |
| `WORKER_URL` | Your Cloudflare Worker URL | Yes |
| `COOKIE_ENCRYPTION_KEY` | Random 32+ character encryption key | Yes |

## Troubleshooting

### Common Issues

**OAuth Redirect Error**: Ensure your Salla OAuth application's redirect URI exactly matches your server URL + `/callback/salla`

**Authentication Failed**: Verify your Salla client ID and secret are correct and your OAuth application is published (not in testing mode)

**Tools Not Working**: Check that your Salla store has the necessary permissions for the operations you're trying to perform

**Server Errors**: Check the console logs for detailed error messages and ensure all environment variables are set correctly

### Development Tips

- Use MCP Inspector for testing individual tools during development
- Check browser network requests to debug OAuth flow issues  
- Enable console logging in the Salla handler for debugging authentication
- Verify your Salla OAuth application scopes include all needed permissions

## Contributing

This Salla MCP server is built on the MCP Boilerplate foundation. Contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with a real Salla store
5. Submit a pull request

## Support

For issues specific to this Salla MCP implementation, please submit an issue on the GitHub repository. For general Salla API questions, refer to the [Salla Documentation](https://docs.salla.dev/).

## License

This project is provided as-is under the MIT License.
