import { z } from "zod";
import { experimental_PaidMcpAgent as PaidMcpAgent } from "@stripe/agent-toolkit/cloudflare";
import { SallaApi } from "../lib/salla-api";

export function sallaProductsListTool(agent: PaidMcpAgent<Env, any, any>) {
  const server = agent.server;
  // @ts-ignore
  server.tool(
    "salla-products-list",
    "📦 Get a list of products from your Salla store with advanced filtering options. Perfect for inventory management, product searches, and category browsing. Supports all common AI chat scenarios like 'show me hidden products', 'products on sale', 'search for iPhone', etc.",
    {
      page: z.number().optional().describe("Page number for pagination (default: 1)"),
      keyword: z.string().optional().describe("🔍 SEARCH: Search keyword to filter products by name or SKU. Use when user asks to find specific products (e.g., 'iPhone', 'Samsung Galaxy', 'SKU123'). Matches product names and SKU values."),
      status: z.enum(['hidden', 'sale', 'out']).optional().describe("📊 STATUS FILTER: Filter products by their current status. Values: 'hidden' (not visible to customers), 'sale' (products on sale/discount), 'out' (out of stock). Use when user asks for products in specific states."),
      category: z.string().optional().describe("🏷️ CATEGORY FILTER: Filter products by category name or ID. Use when user asks for products from specific categories (e.g., 'Electronics', 'Clothing', 'Books'). Requires exact category identifier."),
      per_page: z.number().optional().describe("📄 PAGINATION: Number of products per page (default: 15, max: 50). Use when user wants to control result size."),
      format: z.enum(['light']).optional().describe("⚡ PERFORMANCE: Set to 'light' to fetch simplified product data for faster response. Use when user only needs basic product info (name, price, status) without detailed descriptions.")
    },
    async ({ page, keyword, status, category, per_page, format }: { page?: number; keyword?: string; status?: 'hidden' | 'sale' | 'out'; category?: string; per_page?: number; format?: 'light' }) => {
      if (!agent.props?.accessToken) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated with Salla. Please authenticate first." }],
        };
      }

      try {
        const salla = new SallaApi({ accessToken: agent.props.accessToken });
        const products = await salla.getProducts({ page, keyword, status, category, per_page, format });
        
        return {
          content: [{ 
            type: "text", 
            text: `Successfully retrieved products:\n\n${JSON.stringify(products, null, 2)}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error fetching products: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }],
        };
      }
    }
  );
}

export function sallaProductDetailsTool(agent: PaidMcpAgent<Env, any, any>) {
  const server = agent.server;
  // @ts-ignore
  server.tool(
    "salla-product-details",
    "Get detailed information about a specific product by its ID.",
    {
      product_id: z.string().describe("The ID of the product to retrieve")
    },
    async ({ product_id }: { product_id: string }) => {
      if (!agent.props?.accessToken) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated with Salla. Please authenticate first." }],
        };
      }

      try {
        const salla = new SallaApi({ accessToken: agent.props.accessToken });
        const product = await salla.getProduct(product_id);
        
        return {
          content: [{ 
            type: "text", 
            text: `Product details:\n\n${JSON.stringify(product, null, 2)}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error fetching product: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }],
        };
      }
    }
  );
}

export function sallaProductCreateTool(agent: PaidMcpAgent<Env, any, any>) {
  const server = agent.server;
  // @ts-ignore
  server.tool(
    "salla-product-create",
    "Create a new product in your Salla store.",
    {
      name: z.string().describe("Product name"),
      description: z.string().optional().describe("Product description"),
      price: z.number().describe("Product price"),
      sale_price: z.number().optional().describe("Sale price (if on sale)"),
      sku: z.string().optional().describe("Product SKU"),
      quantity: z.number().optional().describe("Available quantity"),
      status: z.string().optional().describe("Product status (e.g., 'active', 'out-of-stock', 'hidden')")
    },
    async ({ name, description, price, sale_price, sku, quantity, status }: { 
      name: string; 
      description?: string; 
      price: number; 
      sale_price?: number; 
      sku?: string; 
      quantity?: number; 
      status?: string; 
    }) => {
      if (!agent.props?.accessToken) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated with Salla. Please authenticate first." }],
        };
      }

      try {
        const salla = new SallaApi({ accessToken: agent.props.accessToken });
        const product = await salla.createProduct({
          name,
          description,
          price,
          sale_price,
          sku,
          quantity,
          status
        });
        
        return {
          content: [{ 
            type: "text", 
            text: `Successfully created product:\n\n${JSON.stringify(product, null, 2)}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error creating product: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }],
        };
      }
    }
  );
}

export function sallaProductUpdateTool(agent: PaidMcpAgent<Env, any, any>) {
  const server = agent.server;
  // @ts-ignore
  server.tool(
    "salla-product-update",
    "Update an existing product in your Salla store.",
    {
      product_id: z.string().describe("The ID of the product to update"),
      name: z.string().optional().describe("Product name"),
      description: z.string().optional().describe("Product description"),
      price: z.number().optional().describe("Product price"),
      sale_price: z.number().optional().describe("Sale price (if on sale)"),
      sku: z.string().optional().describe("Product SKU"),
      quantity: z.number().optional().describe("Available quantity"),
      status: z.string().optional().describe("Product status (e.g., 'active', 'out-of-stock', 'hidden')")
    },
    async ({ product_id, name, description, price, sale_price, sku, quantity, status }: { 
      product_id: string;
      name?: string; 
      description?: string; 
      price?: number; 
      sale_price?: number; 
      sku?: string; 
      quantity?: number; 
      status?: string; 
    }) => {
      if (!agent.props?.accessToken) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated with Salla. Please authenticate first." }],
        };
      }

      try {
        const salla = new SallaApi({ accessToken: agent.props.accessToken });
        const product = await salla.updateProduct(product_id, {
          name,
          description,
          price,
          sale_price,
          sku,
          quantity,
          status
        });
        
        return {
          content: [{ 
            type: "text", 
            text: `Successfully updated product:\n\n${JSON.stringify(product, null, 2)}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error updating product: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }],
        };
      }
    }
  );
} 