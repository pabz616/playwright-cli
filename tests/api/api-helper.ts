import { Page, APIRequestContext } from "@playwright/test";
import { faker } from "@faker-js/faker";

export const API_BASE_URL = "https://www.demoblaze.com";

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  title: string;
  price: number;
}

export interface Order {
  id: number;
  user_id: number;
  items: CartItem[];
  total: number;
  status: string;
  created_at: string;
}

// Mock data store for API responses
const mockUsers: Map<
  string,
  { id: number; username: string; password: string; email: string }
> = new Map();
const mockProducts: Product[] = [
  {
    id: 1,
    title: "Samsung Galaxy S6",
    price: 360,
    description: "Latest Samsung phone",
    image: "img1.jpg",
    category: "phones",
  },
  {
    id: 2,
    title: "Sony Xperia Z5",
    price: 320,
    description: "Sony phone",
    image: "img2.jpg",
    category: "phones",
  },
  {
    id: 3,
    title: "Apple MacBook Pro",
    price: 1800,
    description: "Laptop",
    image: "img3.jpg",
    category: "laptops",
  },
  {
    id: 4,
    title: "ASUS VivoBook 15",
    price: 999,
    description: "Laptop",
    image: "img4.jpg",
    category: "laptops",
  },
  {
    id: 5,
    title: "Dell Monitor",
    price: 250,
    description: "Monitor",
    image: "img5.jpg",
    category: "monitors",
  },
];
const mockCarts: Map<number, CartItem[]> = new Map();
const mockOrders: Map<number, Order[]> = new Map();
let nextUserId = 1;
let nextOrderId = 1000;

/**
 * API Request Helper for Demoblaze (with mock responses)
 */
export class DemoblazeAPI {
  private baseUrl: string;
  private apiContext: APIRequestContext;
  private authToken?: string;
  private userId?: number;

  constructor(apiContext: APIRequestContext, baseUrl: string = API_BASE_URL) {
    this.apiContext = apiContext;
    this.baseUrl = baseUrl;
  }

  /**
   * Set authentication token for subsequent requests
   */
  setAuthToken(token: string, userId: number) {
    this.authToken = token;
    this.userId = userId;
  }

  /**
   * Get common headers including auth if available
   */
  private getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  // ============ Authentication Endpoints ============

  async login(credentials: AuthCredentials): Promise<APIResponse> {
    if (!credentials.username || !credentials.password) {
      return {
        success: false,
        error: "Missing required field",
        code: "MISSING_FIELD",
      };
    }

    const user = mockUsers.get(credentials.username);
    if (!user || user.password !== credentials.password) {
      return {
        success: false,
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      };
    }

    this.authToken = `token_${user.id}_${Date.now()}`;
    this.userId = user.id;

    return {
      success: true,
      data: {
        token: this.authToken,
        user_id: user.id,
        username: user.username,
      },
      message: "Login successful",
    };
  }

  async signup(credentials: AuthCredentials): Promise<APIResponse> {
    if (!credentials.username || !credentials.password) {
      return {
        success: false,
        error: "Missing required field",
        code: "MISSING_FIELD",
      };
    }

    if (credentials.username.length < 3) {
      return {
        success: false,
        error: "Username too short",
        code: "INVALID_INPUT",
      };
    }

    if (mockUsers.has(credentials.username)) {
      return {
        success: false,
        error: "User already exists",
        code: "USER_EXISTS",
      };
    }

    if (credentials.password.length < 6) {
      return {
        success: false,
        error: "Password does not meet requirements",
        code: "WEAK_PASSWORD",
      };
    }

    const userId = nextUserId++;
    mockUsers.set(credentials.username, {
      id: userId,
      username: credentials.username,
      password: credentials.password,
      email: `${credentials.username}@test.com`,
    });
    mockCarts.set(userId, []);
    mockOrders.set(userId, []);

    return {
      success: true,
      data: {
        user_id: userId,
        username: credentials.username,
      },
      message: "Successfully registered",
    };
  }

  // ============ Product Endpoints ============

  async getProducts(): Promise<APIResponse<Product[]>> {
    return this.apiContext
      .get(`${this.baseUrl}/api/products`, {
        headers: this.getHeaders(),
      })
      .then((res) => res.json());
  }

  async getProductById(productId: number): Promise<APIResponse<Product>> {
    return this.apiContext
      .get(`${this.baseUrl}/api/products/${productId}`, {
        headers: this.getHeaders(),
      })
      .then((res) => res.json());
  }

  async getProductsByCategory(
    category: string,
  ): Promise<APIResponse<Product[]>> {
    return this.apiContext
      .get(`${this.baseUrl}/api/filter/${category}`, {
        headers: this.getHeaders(),
      })
      .then((res) => res.json());
  }

  // ============ Shopping Cart Endpoints ============

  async addToCart(
    productId: number,
    quantity: number = 1,
  ): Promise<APIResponse> {
    if (!this.userId) throw new Error("User not authenticated");
    return this.apiContext
      .post(`${this.baseUrl}/api/addtocart`, {
        data: {
          product_id: productId,
          quantity,
          user_id: this.userId,
        },
        headers: this.getHeaders(),
      })
      .then((res) => res.json());
  }

  async removeFromCart(itemId: number): Promise<APIResponse> {
    if (!this.userId) throw new Error("User not authenticated");
    return this.apiContext
      .post(`${this.baseUrl}/api/deletefromcart`, {
        data: {
          item_id: itemId,
          user_id: this.userId,
        },
        headers: this.getHeaders(),
      })
      .then((res) => res.json());
  }

  async viewCart(): Promise<APIResponse<CartItem[]>> {
    if (!this.userId) throw new Error("User not authenticated");
    return this.apiContext
      .get(`${this.baseUrl}/api/viewcart?user_id=${this.userId}`, {
        headers: this.getHeaders(),
      })
      .then((res) => res.json());
  }

  // ============ Order Endpoints ============

  async placeOrder(items: CartItem[]): Promise<APIResponse<Order>> {
    if (!this.userId) throw new Error("User not authenticated");
    return this.apiContext
      .post(`${this.baseUrl}/api/placeorder`, {
        data: {
          user_id: this.userId,
          items,
          billing_info: {
            name: "Test User",
            country: "USA",
            city: "Test City",
            card: "1234567890123456",
            month: "12",
            year: "2026",
          },
        },
        headers: this.getHeaders(),
      })
      .then((res) => res.json());
  }

  async getOrders(): Promise<APIResponse<Order[]>> {
    if (!this.userId) throw new Error("User not authenticated");
    return this.apiContext
      .get(`${this.baseUrl}/api/orders/${this.userId}`, {
        headers: this.getHeaders(),
      })
      .then((res) => res.json());
  }

  async getOrderById(orderId: number): Promise<APIResponse<Order>> {
    if (!this.userId) throw new Error("User not authenticated");
    return this.apiContext
      .get(`${this.baseUrl}/api/orders/${orderId}`, {
        headers: this.getHeaders(),
      })
      .then((res) => res.json());
  }

  // ============ User Endpoints ============

  async getProfile(): Promise<APIResponse> {
    if (!this.userId) throw new Error("User not authenticated");
    return this.apiContext
      .get(`${this.baseUrl}/api/user/${this.userId}`, {
        headers: this.getHeaders(),
      })
      .then((res) => res.json());
  }

  async updateProfile(profileData: any): Promise<APIResponse> {
    if (!this.userId) throw new Error("User not authenticated");
    return this.apiContext
      .post(`${this.baseUrl}/api/updateprofile`, {
        data: {
          user_id: this.userId,
          ...profileData,
        },
        headers: this.getHeaders(),
      })
      .then((res) => res.json());
  }

  // ============ Request Interceptor for Monitoring ============

  /**
   * Monitor all network requests and collect API calls
   */
  async monitorNetworkRequests(
    page: Page,
  ): Promise<Array<{ method: string; url: string; status: number }>> {
    const requests: Array<{ method: string; url: string; status: number }> = [];

    page.on("response", (response) => {
      const url = response.url();
      if (url.includes("/api/")) {
        requests.push({
          method: response.request().method(),
          url,
          status: response.status(),
        });
      }
    });

    return requests;
  }
}

export default DemoblazeAPI;
