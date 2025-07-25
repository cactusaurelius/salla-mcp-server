import { z } from "zod";
import { experimental_PaidMcpAgent as PaidMcpAgent } from "@stripe/agent-toolkit/cloudflare";
import { SallaApi } from "../lib/salla-api";

export function sallaOrdersListTool(agent: PaidMcpAgent<Env, any, any>) {
  const server = agent.server;
  // @ts-ignore
  server.tool(
    "salla-orders-list",
    "📋 Get a list of orders from your Salla store with powerful filtering options. Perfect for finding orders by customer, date range, status, or other criteria. Supports all common AI chat scenarios like 'show me orders from John', 'recent orders', 'pending orders', etc.",
    {
      page: z.number().optional().describe("Page number for pagination (default: 1)"),
      keyword: z.string().optional().describe("🔍 SEARCH: Search by customer mobile number (e.g., '966511804534'), customer name (e.g., 'Del John'), shipping number, order reference ID (e.g., '613398835'), or tag name. Use this when user asks to find orders by customer info or specific identifiers."),
      status: z.array(z.string()).optional().describe("📊 FILTER: Array of order status IDs to filter by. Common statuses: 'pending', 'processing', 'shipped', 'delivered', 'cancelled'. Use when user asks for orders in specific states (e.g., 'show me pending orders')."),
      from_date: z.string().optional().describe("📅 DATE FILTER: Find orders created AFTER this date (YYYY-MM-DD format, e.g., '2024-01-15'). Use when user asks for orders 'since', 'after', or 'from' a specific date."),
      to_date: z.string().optional().describe("📅 DATE FILTER: Find orders created BEFORE this date (YYYY-MM-DD format, e.g., '2024-12-31'). Use when user asks for orders 'until', 'before', or 'up to' a specific date."),
      customer_id: z.number().optional().describe("👤 REQUIRES CUSTOMER ID: Filter by specific customer's unique ID number (obtainable from previous customer list/search). Use when user asks for 'orders from John' and you have John's customer ID from context."),
      reference_id: z.number().optional().describe("🆔 SPECIFIC ORDER: Filter by unique order reference ID number (visible to customers). Use when user provides a specific order number they received."),
      coupon: z.string().optional().describe("🎫 COUPON FILTER: Filter by discount code name (e.g., 'SUMMER2024', 'WELCOME10'). Use when user asks about orders that used a specific coupon."),
      city: z.string().optional().describe("🏙️ LOCATION FILTER: Filter by delivery city name (e.g., 'jeddah', 'riyadh'). Use when user asks for orders in a specific city."),
      country: z.number().optional().describe("🌍 REQUIRES COUNTRY ID: Filter by country ID number (not country name - requires lookup from countries API). Use when user asks for orders from specific country and you have the country ID."),
      product: z.string().optional().describe("📦 PRODUCT FILTER: Filter by product name. Use when user asks for orders containing a specific product (e.g., 'orders with iPhone 15')."),
      payment_method: z.array(z.string()).optional().describe("💳 PAYMENT FILTER: Array of payment method names (e.g., ['bank', 'visa', 'mastercard', 'paypal']). Use when user asks about orders paid with specific methods."),
      source: z.array(z.string()).optional().describe("📱 SOURCE FILTER: Array of order sources (e.g., ['mobile', 'web', 'app']). Use when user asks about orders from specific platforms."),
      selling_channel: z.array(z.string()).optional().describe("🛍️ CHANNEL FILTER: Array of selling channels. Values: 'mobile', 'mobile-app', 'desktop', 'affiliate', 'mahly-app'. Use when user asks about orders from specific sales channels."),
      sort_by: z.enum(['id-asc', 'id-desc', 'total-asc', 'total-desc', 'updated_at-asc', 'updated_at-desc', 'created_at-asc', 'created_at-desc']).optional().describe("⬆️ SORTING: Sort orders by attribute and direction. Use when user asks for 'latest orders' (created_at-desc), 'highest value orders' (total-desc), etc."),
      unread: z.boolean().optional().describe("👁️ ATTENTION FILTER: Set to true to show only unread orders that merchant hasn't opened yet. Use when user asks for 'new orders' or 'orders I haven't seen'."),
      created_by: z.number().optional().describe("👨‍💼 REQUIRES EMPLOYEE ID: Filter by employee ID who created the order (obtainable from employees API). Use when user asks for orders created by specific staff member and you have their employee ID.")
    },
    async ({ page, keyword, status, from_date, to_date, customer_id, reference_id, coupon, city, country, product, payment_method, source, selling_channel, sort_by, unread, created_by }: { 
      page?: number; 
      keyword?: string; 
      status?: string[]; 
      from_date?: string; 
      to_date?: string; 
      customer_id?: number; 
      reference_id?: number; 
      coupon?: string; 
      city?: string; 
      country?: number; 
      product?: string; 
      payment_method?: string[]; 
      source?: string[]; 
      selling_channel?: string[]; 
      sort_by?: string; 
      unread?: boolean; 
      created_by?: number; 
    }) => {
      if (!agent.props?.accessToken) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated with Salla. Please authenticate first." }],
        };
      }

      try {
        const salla = new SallaApi({ accessToken: agent.props.accessToken });
        const orders = await salla.getOrders({ 
          page, 
          keyword, 
          status, 
          from_date, 
          to_date, 
          customer_id, 
          reference_id, 
          coupon, 
          city, 
          country, 
          product, 
          payment_method, 
          source, 
          selling_channel, 
          sort_by, 
          unread, 
          created_by 
        });
        
        return {
          content: [{ 
            type: "text", 
            text: `Successfully retrieved orders:\n\n${JSON.stringify(orders, null, 2)}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error fetching orders: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }],
        };
      }
    }
  );
}

export function sallaOrderDetailsTool(agent: PaidMcpAgent<Env, any, any>) {
  const server = agent.server;
  // @ts-ignore
  server.tool(
    "salla-order-details",
    "🔍 Get comprehensive details about a specific order. Use this when user asks for full order information, customer details, items purchased, shipping info, etc. Usually called after getting order ID from orders list.",
    {
      order_id: z.string().describe("🆔 REQUIRED: The unique Salla order ID (obtainable from orders list API or provided by user). Example: '1017120475'. Use when user asks about a specific order by number/ID.")
    },
    async ({ order_id }: { order_id: string }) => {
      if (!agent.props?.accessToken) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated with Salla. Please authenticate first." }],
        };
      }

      try {
        const salla = new SallaApi({ accessToken: agent.props.accessToken });
        const order = await salla.getOrder(order_id);
        
        return {
          content: [{ 
            type: "text", 
            text: `Order details:\n\n${JSON.stringify(order, null, 2)}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error fetching order: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }],
        };
      }
    }
  );
}

export function sallaOrderStatusUpdateTool(agent: PaidMcpAgent<Env, any, any>) {
  const server = agent.server;
  // @ts-ignore
  server.tool(
    "salla-order-status-update",
    "⚡ Update the status of a specific order in your Salla store. Use when user asks to mark orders as shipped, delivered, cancelled, etc. Important: Only use valid Salla status values.",
    {
      order_id: z.string().describe("🆔 REQUIRED: The unique Salla order ID (obtainable from orders list API or provided by user). Example: '1017120475'."),
      status: z.string().describe("📊 REQUIRED: The new order status. Valid Salla statuses include: 'pending', 'under_review', 'in_progress', 'shipped', 'delivered', 'cancelled'. Use exact status names from Salla system - check current status first via order details if unsure.")
    },
    async ({ order_id, status }: { order_id: string; status: string }) => {
      if (!agent.props?.accessToken) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated with Salla. Please authenticate first." }],
        };
      }

      try {
        const salla = new SallaApi({ accessToken: agent.props.accessToken });
        const result = await salla.updateOrderStatus(order_id, status);
        
        return {
          content: [{ 
            type: "text", 
            text: `Successfully updated order ${order_id} status to ${status}:\n\n${JSON.stringify(result, null, 2)}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error updating order status: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }],
        };
      }
    }
  );
} 