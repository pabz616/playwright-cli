import { Page, APIRequestContext } from "@playwright/test";
import testData from "../../utils/testData";
interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

interface SuccessResponseNoData {
  success: true;
  message?: string;
}

interface ErrorResponse {
  success: false;
  data: null;
  error: string;
  code: string;
  message?: string;
}

export type APIResponse<T = any> = SuccessResponse<T> | ErrorResponse;
export type APIResponseNoData = SuccessResponseNoData | ErrorResponse;

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

// Response data types
export interface LoginData {
  token: string;
  user_id: number;
  username: string;
}

export interface SignupData {
  user_id: number;
  username: string;
}

export interface CartActionData {
  cart_id: number;
  item_id?: number;
}

export interface ProfileData {
  user_id: number;
  username: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  created_at: string;
}

export interface PlaceOrderData extends Order {
  order_id: number;
}

// Mock data store for API responses
interface MockUser {
  id: number;
  username: string;
  password: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
}

const mockUsers: Map<string, MockUser> = new Map();
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
  private requestCount = 0;
  private failedLoginAttempts: Map<string, number> = new Map();

  constructor(
    apiContext: APIRequestContext,
    baseUrl: string = testData.BASE_URL,
  ) {
    this.apiContext = apiContext;
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string, userId: number) {
    this.authToken = token;
    this.userId = userId;
  }

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

  async login(credentials: AuthCredentials): Promise<APIResponse<LoginData>> {
    if (!credentials.username || !credentials.password) {
      return {
        success: false,
        error: "Missing required field",
        code: "MISSING_FIELD",
      };
    }

    const username = credentials.username;
    const failedAttempts = this.failedLoginAttempts.get(username) ?? 0;
    if (failedAttempts >= 10) {
      this.failedLoginAttempts.set(username, failedAttempts + 1);
      return {
        success: false,
        error: "Too many login attempts",
        code: "RATE_LIMITED",
      };
    }

    const user = mockUsers.get(username);
    if (!user) {
      this.failedLoginAttempts.set(username, failedAttempts + 1);
      return {
        success: false,
        error: "User not found",
        code: "USER_NOT_FOUND",
      };
    }

    if (user.password !== credentials.password) {
      this.failedLoginAttempts.set(username, failedAttempts + 1);
      return {
        success: false,
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      };
    }

    this.authToken = `token_${user.id}_${Date.now()}`;
    this.userId = user.id;
    this.failedLoginAttempts.delete(username);

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

  async signup(credentials: AuthCredentials): Promise<APIResponse<SignupData>> {
    if (!credentials.username || !credentials.password) {
      return {
        success: false,
        error: "Missing required field",
        code: "MISSING_FIELD",
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.username)) {
      return {
        success: false,
        error: "Invalid email format",
        code: "INVALID_EMAIL",
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
    this.requestCount += 1;
    if (this.requestCount > 20) {
      return {
        success: false,
        error: "Rate limit exceeded",
        code: "RATE_LIMITED",
      };
    }

    return {
      success: true,
      data: mockProducts,
    };
  }

  async getProductById(productId: number): Promise<APIResponse<Product>> {
    const product = mockProducts.find((p) => p.id === productId);
    if (!product) {
      return {
        success: false,
        error: "Product not found",
        code: "NOT_FOUND",
      };
    }

    return {
      success: true,
      data: product,
    };
  }

  async getProductsByCategory(
    category: string,
  ): Promise<APIResponse<Product[]>> {
    this.requestCount += 1;

    const suspiciousCategory = /[;|`$&]|<script>|javascript:/i;
    const lowerCategory = category.toLowerCase().trim();
    const validCategories = new Set(
      mockProducts.map((product) => product.category.toLowerCase()),
    );

    if (this.requestCount > 20) {
      return {
        success: false,
        error: "Rate limit exceeded",
        code: "RATE_LIMITED",
      };
    }

    if (
      suspiciousCategory.test(category) ||
      !validCategories.has(lowerCategory)
    ) {
      return {
        success: false,
        error: "Category not found",
        code: "NOT_FOUND",
      };
    }

    const filtered = mockProducts.filter(
      (p) => p.category.toLowerCase() === lowerCategory,
    );
    if (filtered.length === 0) {
      return {
        success: false,
        error: "Category not found",
        code: "NOT_FOUND",
      };
    }

    return {
      success: true,
      data: filtered,
    };
  }

  // ============ Shopping Cart Endpoints ============

  async addToCart(
    productId: number,
    quantity: number = 1,
  ): Promise<APIResponse<CartActionData>> {
    if (!this.userId) throw new Error("User not authenticated");

    if (quantity < 0) {
      return {
        success: false,
        error: "Invalid quantity",
        code: "INVALID_QUANTITY",
      };
    }

    if (quantity === 0) {
      return {
        success: false,
        error: "Quantity must be greater than 0",
        code: "INVALID_QUANTITY",
      };
    }

    const product = mockProducts.find((p) => p.id === productId);
    if (!product) {
      return {
        success: false,
        error: "Product not found",
        code: "NOT_FOUND",
      };
    }

    const cart = mockCarts.get(this.userId) || [];
    const existingItem = cart.find((item) => item.product_id === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: cart.length + 1,
        product_id: productId,
        quantity,
        title: product.title,
        price: product.price,
      });
    }

    mockCarts.set(this.userId, cart);

    return {
      success: true,
      data: {
        cart_id: this.userId,
        item_id: cart[cart.length - 1].id,
      },
      message: "Added to cart",
    };
  }

  async removeFromCart(itemId: number): Promise<APIResponseNoData> {
    if (!this.userId) throw new Error("User not authenticated");

    const cart = mockCarts.get(this.userId) || [];
    const index = cart.findIndex((item) => item.id === itemId);

    if (index === -1) {
      return {
        success: false,
        error: "Item not found",
        code: "ITEM_NOT_FOUND",
      };
    }

    cart.splice(index, 1);
    mockCarts.set(this.userId, cart);

    return {
      success: true,
      message: "Item removed from cart",
    };
  }

  async viewCart(): Promise<APIResponse<CartItem[]>> {
    if (!this.userId) throw new Error("User not authenticated");

    const cart = mockCarts.get(this.userId) || [];
    return {
      success: true,
      data: cart,
    };
  }

  // ============ Order Endpoints ============

  async placeOrder(items: CartItem[]): Promise<APIResponse<PlaceOrderData>> {
    if (!this.userId) throw new Error("User not authenticated");

    if (!items || items.length === 0) {
      return {
        success: false,
        error: "Cart is empty",
        code: "EMPTY_CART",
      };
    }

    const orderId = nextOrderId++;
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order: Order = {
      id: orderId,
      user_id: this.userId,
      items,
      total,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    const userOrders = mockOrders.get(this.userId) || [];
    userOrders.push(order);
    mockOrders.set(this.userId, userOrders);

    // Clear cart after order
    mockCarts.set(this.userId, []);

    return {
      success: true,
      data: {
        order_id: order.id,
        ...order,
      },
      message: "Order placed successfully",
    };
  }

  async getOrders(): Promise<APIResponse<Order[]>> {
    if (!this.userId) throw new Error("User not authenticated");

    const orders = mockOrders.get(this.userId) || [];
    return {
      success: true,
      data: orders,
    };
  }

  async getOrderById(orderId: number): Promise<APIResponse<Order>> {
    if (!this.userId) throw new Error("User not authenticated");

    const orders = mockOrders.get(this.userId) || [];
    const order = orders.find((o) => o.id === orderId);

    if (!order) {
      return {
        success: false,
        error: "Order not found",
        code: "NOT_FOUND",
      };
    }

    return {
      success: true,
      data: order,
    };
  }

  // ============ User Endpoints ============

  async getProfile(): Promise<APIResponse<ProfileData>> {
    if (!this.userId) {
      return {
        success: false,
        error: "Unauthorized",
        code: "UNAUTHORIZED",
      };
    }

    if (!this.authToken || !this.authToken.startsWith("token_")) {
      return {
        success: false,
        error: "Unauthorized",
        code: "UNAUTHORIZED",
      };
    }

    let profile = null;
    for (const [user_name, user] of mockUsers) {
      if (user.id === this.userId) {
        profile = user;
        break;
      }
    }

    if (!profile) {
      return {
        success: false,
        error: "User not found",
        code: "NOT_FOUND",
      };
    }

    return {
      success: true,
      data: {
        user_id: profile.id,
        username: profile.username,
        email: profile.email,
        phone: profile.phone || testData.PHONE,
        country: testData.COUNTRY,
        city: profile.city || testData.CITY,
        created_at: new Date().toISOString(),
      },
    };
  }

  async updateProfile(profileData: any): Promise<APIResponse<ProfileData>> {
    if (!this.userId) throw new Error("User not authenticated");

    if (profileData.user_id && profileData.user_id !== this.userId) {
      return {
        success: false,
        error: "Unauthorized",
        code: "UNAUTHORIZED",
      };
    }

    let userRecord: MockUser | null = null;
    for (const [username, user] of mockUsers) {
      if (user.id === this.userId) {
        userRecord = user;
        if (profileData.email) {
          user.email = profileData.email;
        }
        if (profileData.phone) {
          user.phone = profileData.phone;
        }
        if (profileData.country) {
          user.country = profileData.country;
        }
        if (profileData.city) {
          user.city = profileData.city;
        }
        mockUsers.set(username, user);
        break;
      }
    }

    if (!userRecord) {
      return {
        success: false,
        error: "User not found",
        code: "NOT_FOUND",
      };
    }

    return {
      success: true,
      data: {
        user_id: userRecord.id,
        username: userRecord.username,
        email: userRecord.email,
        phone: userRecord.phone,
        country: userRecord.country,
        city: userRecord.city,
        created_at: new Date().toISOString(),
      },
      message: "Profile updated",
    };
  }

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
