import { z } from "zod";
import { experimental_PaidMcpAgent as PaidMcpAgent } from "@stripe/agent-toolkit/cloudflare";
import { SallaApi } from "../lib/salla-api";

export function sallaCustomersListTool(agent: PaidMcpAgent<Env, any, any>) {
  const server = agent.server;
  // @ts-ignore
  server.tool(
    "salla-customers-list",
    "Get a list of customers from your Salla store. You can search by name or email and paginate through results.",
    {
      page: z.number().optional().describe("Page number for pagination (default: 1)"),
      keyword: z.string().optional().describe("Search query to filter customers by mobile number, name, shipping number, reference ID, or tag name"),
      date_from: z.string().optional().describe("Fetch customers created before a specific date (format: YYYY-MM-DD)"),
      date_to: z.string().optional().describe("Fetch customers created after a specific date (format: YYYY-MM-DD)")
    },
    async ({ page, keyword, date_from, date_to }: { page?: number; keyword?: string; date_from?: string; date_to?: string }) => {
      if (!agent.props?.accessToken) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated with Salla. Please authenticate first." }],
        };
      }

      try {
        const salla = new SallaApi({ accessToken: agent.props.accessToken });
        const customers = await salla.getCustomers({ page, keyword, date_from, date_to });
        
        return {
          content: [{ 
            type: "text", 
            text: `Successfully retrieved customers:\n\n${JSON.stringify(customers, null, 2)}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error fetching customers: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }],
        };
      }
    }
  );
}

export function sallaCustomerDetailsTool(agent: PaidMcpAgent<Env, any, any>) {
  const server = agent.server;
  // @ts-ignore
  server.tool(
    "salla-customer-details",
    "Get detailed information about a specific customer by their ID.",
    {
      customer_id: z.string().describe("The ID of the customer to retrieve")
    },
    async ({ customer_id }: { customer_id: string }) => {
      if (!agent.props?.accessToken) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated with Salla. Please authenticate first." }],
        };
      }

      try {
        const salla = new SallaApi({ accessToken: agent.props.accessToken });
        const customer = await salla.getCustomer(customer_id);
        
        return {
          content: [{ 
            type: "text", 
            text: `Customer details:\n\n${JSON.stringify(customer, null, 2)}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error fetching customer: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }],
        };
      }
    }
  );
} 