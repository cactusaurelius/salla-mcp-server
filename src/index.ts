import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { SallaHandler } from "./auth/salla-handler";
import { McpServer, McpAgent } from "@modelcontextprotocol/sdk";
import * as tools from './tools';

// Define our MCP agent with tools
export class SallaMCP extends McpAgent {
	server = new McpServer({
		name: "Salla",
		version: "1.0.0",
		description: "Connect to your Salla store to manage products, orders, customers, and analytics through AI assistants.",
		logo: "https://accounts.salla.sa/./accounts/images/salla-smile.svg",
	});

	async init() {
		// Salla API Tools
		tools.sallaOrdersListTool(this);
		tools.sallaOrderDetailsTool(this);
		tools.sallaOrderStatusUpdateTool(this);
		tools.sallaProductsListTool(this);
		tools.sallaProductDetailsTool(this);
		tools.sallaProductCreateTool(this);
		tools.sallaProductUpdateTool(this);
		tools.sallaCustomersListTool(this);
		tools.sallaCustomerDetailsTool(this);
		tools.sallaStoreInfoTool(this);
		tools.sallaCategoriesListTool(this);
		tools.sallaCategoryDetailsTool(this);
		tools.sallaBrandsListTool(this);

		// Salla Reports Tools
		tools.sallaAbandonedCartsTool(this);
		tools.sallaHourlyVisitorsTool(this);
		tools.sallaSummaryReportTool(this);
		tools.sallaLatestOrdersTool(this);
		tools.sallaGeneralStatisticsTool(this);
	}
}

// Create an OAuth provider instance for auth routes
const oauthProvider = new OAuthProvider({
	apiRoute: "/sse",
	apiHandler: SallaMCP.mount("/sse") as any,
	defaultHandler: SallaHandler as any,
	authorizeEndpoint: "/authorize",
	tokenEndpoint: "/token",
	clientRegistrationEndpoint: "/register",
});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;
		
		// Handle homepage
		if (path === "/" || path === "") {
			// @ts-ignore
			const homePage = await import('./pages/index.html');
			return new Response(homePage.default, {
				headers: { "Content-Type": "text/html" },
			});
		}
		
		// All other routes go to OAuth provider
		return oauthProvider.fetch(request, env, ctx);
	},
};
