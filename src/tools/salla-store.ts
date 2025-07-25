import { z } from "zod";
import { experimental_PaidMcpAgent as PaidMcpAgent } from "@stripe/agent-toolkit/cloudflare";
import { SallaApi } from "../lib/salla-api";


export function sallaStoreInfoTool(agent: PaidMcpAgent<Env, any, any>) {
  const server = agent.server;
  // @ts-ignore
  server.tool(
    "salla-store-info",
    "Get information about your Salla store, including store name, settings, and configuration.",
    {},
    async ({}: {}, { user }: { user: any }) => {
      if (!agent.props?.accessToken) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated with Salla. Please authenticate first." }],
        };
      }

      try {
        const salla = new SallaApi({ accessToken: agent.props.accessToken });
        const storeInfo = await salla.getStoreInfo();
        
        return {
          content: [{ 
            type: "text", 
            text: `Store information:\n\n${JSON.stringify(storeInfo, null, 2)}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error fetching store info: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }],
        };
      }
    }
  );
}

export function sallaCategoriesListTool(agent: PaidMcpAgent<Env, any, any>) {
  const server = agent.server;
  // @ts-ignore
  server.tool(
    "salla-categories-list",
    "Get a list of product categories from your Salla store.",
    {},
    async ({}: {}, { user }: { user: any }) => {
      if (!agent.props?.accessToken) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated with Salla. Please authenticate first." }],
        };
      }

      try {
        const salla = new SallaApi({ accessToken: agent.props.accessToken });
        const categories = await salla.getCategories();
        
        return {
          content: [{ 
            type: "text", 
            text: `Categories:\n\n${JSON.stringify(categories, null, 2)}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error fetching categories: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }],
        };
      }
    }
  );
}

export function sallaCategoryDetailsTool(agent: PaidMcpAgent<Env, any, any>) {
  const server = agent.server;
  // @ts-ignore
  server.tool(
    "salla-category-details",
    "Get detailed information about a specific category by its ID.",
    {
      category_id: z.string().describe("The ID of the category to retrieve")
    },
    async ({ category_id }: { category_id: string }, { user }: { user: any }) => {
      if (!agent.props?.accessToken) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated with Salla. Please authenticate first." }],
        };
      }

      try {
        const salla = new SallaApi({ accessToken: agent.props.accessToken });
        const category = await salla.getCategory(category_id);
        
        return {
          content: [{ 
            type: "text", 
            text: `Category details:\n\n${JSON.stringify(category, null, 2)}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error fetching category: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }],
        };
      }
    }
  );
}

export function sallaBrandsListTool(agent: PaidMcpAgent<Env, any, any>) {
  const server = agent.server;
  // @ts-ignore
  server.tool(
    "salla-brands-list",
    "Get a list of brands from your Salla store.",
    {
      page: z.number().optional().describe("Page number for pagination (default: 1)"),
      per_page: z.number().optional().describe("Number of brands per page (default: 15, max: 50)")
    },
    async ({ page, per_page }: { page?: number; per_page?: number }, { user }: { user: any }) => {
      if (!agent.props?.accessToken) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated with Salla. Please authenticate first." }],
        };
      }

      try {
        const salla = new SallaApi({ accessToken: agent.props.accessToken });
        const brands = await salla.getBrands({ page, per_page });
        
        return {
          content: [{ 
            type: "text", 
            text: `Brands:\n\n${JSON.stringify(brands, null, 2)}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error fetching brands: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }],
        };
      }
    }
  );
} 