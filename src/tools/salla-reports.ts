import { z } from "zod";
import { experimental_PaidMcpAgent as PaidMcpAgent } from "@stripe/agent-toolkit/cloudflare";
import { SallaApi } from "../lib/salla-api";

export function sallaAbandonedCartsTool(agent: PaidMcpAgent<Env, any, any>) {
  const server = agent.server;
  // @ts-ignore
  server.tool(
    "salla-abandoned-carts",
    "Get a report of abandoned carts from your Salla store.",
    {
      random_string: z.string().optional().describe("Dummy parameter for no-parameter tools")
    },
    async ({ random_string }: { random_string?: string }) => {
      if (!agent.props?.accessToken) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated with Salla. Please authenticate first." }],
        };
      }

      try {
        const salla = new SallaApi({ accessToken: agent.props.accessToken });
        const abandonedCarts = await salla.getAbandonedCarts();
        
        return {
          content: [{ 
            type: "text", 
            text: `Abandoned carts report:\n\n${JSON.stringify(abandonedCarts, null, 2)}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error fetching abandoned carts: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }],
        };
      }
    }
  );
}

export function sallaHourlyVisitorsTool(agent: PaidMcpAgent<Env, any, any>) {
  const server = agent.server;
  // @ts-ignore
  server.tool(
    "salla-hourly-visitors",
    "Get hourly visitors report from your Salla store.",
    {
      random_string: z.string().optional().describe("Dummy parameter for no-parameter tools")
    },
    async ({ random_string }: { random_string?: string }) => {
      if (!agent.props?.accessToken) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated with Salla. Please authenticate first." }],
        };
      }

      try {
        const salla = new SallaApi({ accessToken: agent.props.accessToken });
        const visitors = await salla.getHourlyVisitors();
        
        return {
          content: [{ 
            type: "text", 
            text: `Hourly visitors report:\n\n${JSON.stringify(visitors, null, 2)}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error fetching hourly visitors: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }],
        };
      }
    }
  );
}

export function sallaSummaryReportTool(agent: PaidMcpAgent<Env, any, any>) {
  const server = agent.server;
  // @ts-ignore
  server.tool(
    "salla-summary-report",
    "Get a summary report from your Salla store. Only the 'monthly' period is supported.",
    {
      period: z.enum(['monthly']).optional().describe("Report period (only 'monthly' is supported)")
    },
    async ({ period }: { period?: 'monthly' }) => {
      if (!agent.props?.accessToken) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated with Salla. Please authenticate first." }],
        };
      }

      try {
        const salla = new SallaApi({ accessToken: agent.props.accessToken });
        const summary = await salla.getSummaryReport({ period });
        
        return {
          content: [{ 
            type: "text", 
            text: `Summary report:\n\n${JSON.stringify(summary, null, 2)}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error fetching summary report: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }],
        };
      }
    }
  );
}

export function sallaLatestOrdersTool(agent: PaidMcpAgent<Env, any, any>) {
  const server = agent.server;
  // @ts-ignore
  server.tool(
    "salla-latest-orders",
    "Get the latest orders report from your Salla store.",
    {
      random_string: z.string().optional().describe("Dummy parameter for no-parameter tools")
    },
    async ({ random_string }: { random_string?: string }) => {
      if (!agent.props?.accessToken) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated with Salla. Please authenticate first." }],
        };
      }

      try {
        const salla = new SallaApi({ accessToken: agent.props.accessToken });
        const latestOrders = await salla.getLatestOrders();
        
        return {
          content: [{ 
            type: "text", 
            text: `Latest orders report:\n\n${JSON.stringify(latestOrders, null, 2)}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error fetching latest orders: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }],
        };
      }
    }
  );
}

export function sallaGeneralStatisticsTool(agent: PaidMcpAgent<Env, any, any>) {
  const server = agent.server;
  // @ts-ignore
  server.tool(
    "salla-general-statistics",
    "Get general statistics report from your Salla store.",
    {
      random_string: z.string().optional().describe("Dummy parameter for no-parameter tools")
    },
    async ({ random_string }: { random_string?: string }) => {
      if (!agent.props?.accessToken) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated with Salla. Please authenticate first." }],
        };
      }

      try {
        const salla = new SallaApi({ accessToken: agent.props.accessToken });
        const statistics = await salla.getGeneralStatistics();
        
        return {
          content: [{ 
            type: "text", 
            text: `General statistics report:\n\n${JSON.stringify(statistics, null, 2)}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error fetching general statistics: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }],
        };
      }
    }
  );
} 