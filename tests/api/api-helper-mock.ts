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
    const invalidCategories = ["invalidcategory", "<script>", "../", "| cat"];
    if (invalidCategories.some((inv) => category.includes(inv))) {
      return {
        success: false,
        error: "Category not found",
        code: "NOT_FOUND",
      };
    }

    const filtered = mockProducts.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase(),
    );
    return {
      success: true,
      data: filtered,
    };
  }

  // ============ Shopping Cart Endpoints ============

  async addToCart(
    productId: number,
    quantity: number = 1,
  ): Promise<APIResponse> {
    if (!this.userId) throw new Error("User not authenticated");

    if (quantity <= 0) {
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

  async removeFromCart(itemId: number): Promise<APIResponse> {
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

  async placeOrder(items: CartItem[]): Promise<APIResponse<Order>> {
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
      data: order,
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

  async getProfile(): Promise<APIResponse> {
    if (!this.userId) throw new Error("User not authenticated");

    let username = "";
    for (const [user_name, user] of mockUsers) {
      if (user.id === this.userId) {
        username = user_name;
        break;
      }
    }

    return {
      success: true,
      data: {
        user_id: this.userId,
        username,
        email: `${username}@test.com`,
        phone: faker.phone.number(),
        country: "USA",
        city: faker.location.city(),
        created_at: new Date().toISOString(),
      },
    };
  }

  async updateProfile(profileData: any): Promise<APIResponse> {
    if (!this.userId) throw new Error("User not authenticated");

    return {
      success: true,
      data: {
        user_id: this.userId,
        ...profileData,
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
