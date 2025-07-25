export interface SallaApiOptions {
  baseUrl?: string;
  accessToken: string;
}

export class SallaApi {
  private baseUrl: string;
  private accessToken: string;

  constructor(options: SallaApiOptions) {
    this.baseUrl = options.baseUrl || 'https://api.salla.dev/admin/v2';
    this.accessToken = options.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Salla API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Orders API
  async getOrders(params?: {
    page?: number;
    keyword?: string;
    payment_method?: string[];
    status?: string[];
    from_date?: string;
    to_date?: string;
    country?: number;
    city?: string;
    product?: string;
    branch?: string[];
    tags?: string[];
    reference_id?: number;
    coupon?: string;
    customer_id?: number;
    shipping_app_id?: string[];
    source?: string[];
    sort_by?: string;
    accounting_services?: string;
    unread?: boolean;
    assign_employee?: string[];
    selling_channel?: string[];
    created_by?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.keyword) searchParams.append('keyword', params.keyword);
    if (params?.payment_method) params.payment_method.forEach(pm => searchParams.append('payment_method[]', pm));
    if (params?.status) params.status.forEach(s => searchParams.append('status[]', s));
    if (params?.from_date) searchParams.append('from_date', params.from_date);
    if (params?.to_date) searchParams.append('to_date', params.to_date);
    if (params?.country) searchParams.append('country', params.country.toString());
    if (params?.city) searchParams.append('city', params.city);
    if (params?.product) searchParams.append('product', params.product);
    if (params?.branch) params.branch.forEach(b => searchParams.append('branch[]', b));
    if (params?.tags) params.tags.forEach(t => searchParams.append('tags[]', t));
    if (params?.reference_id) searchParams.append('reference_id', params.reference_id.toString());
    if (params?.coupon) searchParams.append('coupon', params.coupon);
    if (params?.customer_id) searchParams.append('customer_id', params.customer_id.toString());
    if (params?.shipping_app_id) params.shipping_app_id.forEach(id => searchParams.append('shipping_app_id[]', id));
    if (params?.source) params.source.forEach(s => searchParams.append('source[]', s));
    if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params?.accounting_services) searchParams.append('accounting_services', params.accounting_services);
    if (params?.unread !== undefined) searchParams.append('unread', params.unread.toString());
    if (params?.assign_employee) params.assign_employee.forEach(e => searchParams.append('assign_employee[]', e));
    if (params?.selling_channel) params.selling_channel.forEach(sc => searchParams.append('selling_channel[]', sc));
    if (params?.created_by) searchParams.append('created_by', params.created_by.toString());
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/orders${query}`);
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Products API
  async getProducts(params?: {
    page?: number;
    keyword?: string;
    status?: 'hidden' | 'sale' | 'out';
    category?: string;
    per_page?: number;
    format?: 'light';
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.keyword) searchParams.append('keyword', params.keyword);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.format) searchParams.append('format', params.format);
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/products${query}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async createProduct(product: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, product: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  // Customers API
  async getCustomers(params?: {
    page?: number;
    keyword?: string;
    date_from?: string;
    date_to?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.keyword) searchParams.append('keyword', params.keyword);
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/customers${query}`);
  }

  async getCustomer(id: string) {
    return this.request(`/customers/${id}`);
  }

  // Categories API
  async getCategories() {
    return this.request('/categories');
  }

  async getCategory(id: string) {
    return this.request(`/categories/${id}`);
  }

  // Store Info API
  async getStoreInfo() {
    return this.request('/store/info');
  }

  // Brands API
  async getBrands(params?: {
    page?: number;
    per_page?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/brands${query}`);
  }

  // Reports API
  async getAbandonedCarts() {
    return this.request('/reports/abandoned-carts');
  }

  async getHourlyVisitors() {
    return this.request('/reports/hourly-visitors');
  }

  async getSummaryReport(params?: {
    period?: 'monthly';
  }) {
    const searchParams = new URLSearchParams();
    if (params?.period) searchParams.append('period', params.period);
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/reports/summery${query}`);
  }

  async getLatestOrders() {
    return this.request('/reports/latest-orders');
  }

  async getGeneralStatistics() {
    return this.request('/reports/general-statistics');
  }
} 