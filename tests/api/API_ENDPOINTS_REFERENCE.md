# Demoblaze API Endpoints - Quick Reference

## Base URL
```
https://www.demoblaze.com
```

## API Endpoints Reference

### Authentication Endpoints

#### 1. User Registration
```
POST /api/signup
Content-Type: application/json

Request:
{
  "username": "string",
  "password": "string"
}

Response (Success):
{
  "success": true,
  "data": {
    "user_id": number,
    "username": "string"
  },
  "message": "Successfully registered"
}

Response (Error):
{
  "success": false,
  "error": "User already exists",
  "code": "USER_EXISTS"
}
```

#### 2. User Login
```
POST /api/login
Content-Type: application/json

Request:
{
  "username": "string",
  "password": "string"
}

Response (Success):
{
  "success": true,
  "data": {
    "token": "string",
    "user_id": number,
    "username": "string"
  },
  "message": "Login successful"
}

Response (Error):
{
  "success": false,
  "error": "Invalid credentials",
  "code": "INVALID_CREDENTIALS"
}
```

---

### Product Endpoints

#### 3. Get All Products
```
GET /api/products
Authorization: Bearer {token} (optional)

Response:
{
  "success": true,
  "data": [
    {
      "id": number,
      "title": "string",
      "price": number,
      "description": "string",
      "image": "string",
      "category": "string" // phones, laptops, monitors
    },
    ...
  ]
}
```

#### 4. Get Specific Product
```
GET /api/products/{productid}
Authorization: Bearer {token} (optional)

Response:
{
  "success": true,
  "data": {
    "id": number,
    "title": "string",
    "price": number,
    "description": "string",
    "image": "string",
    "category": "string"
  }
}
```

#### 5. Filter Products by Category
```
GET /api/filter/{category}
Authorization: Bearer {token} (optional)

Supported Categories:
- phones
- laptops
- monitors

Response:
{
  "success": true,
  "data": [
    {
      "id": number,
      "title": "string",
      "price": number,
      "category": "string"
    },
    ...
  ]
}
```

---

### Shopping Cart Endpoints

#### 6. Add Product to Cart
```
POST /api/addtocart
Authorization: Bearer {token} (required)
Content-Type: application/json

Request:
{
  "user_id": number,
  "product_id": number,
  "quantity": number
}

Response (Success):
{
  "success": true,
  "data": {
    "cart_id": number,
    "item_id": number
  },
  "message": "Added to cart"
}

Response (Error):
{
  "success": false,
  "error": "Product not found",
  "code": "NOT_FOUND"
}
```

#### 7. Remove Product from Cart
```
POST /api/deletefromcart
Authorization: Bearer {token} (required)
Content-Type: application/json

Request:
{
  "user_id": number,
  "item_id": number
}

Response:
{
  "success": true,
  "message": "Item removed from cart"
}
```

#### 8. View Cart
```
GET /api/viewcart?user_id={userid}
Authorization: Bearer {token} (required)

Response:
{
  "success": true,
  "data": [
    {
      "id": number,
      "product_id": number,
      "quantity": number,
      "title": "string",
      "price": number
    },
    ...
  ]
}
```

---

### Order Endpoints

#### 9. Place Order
```
POST /api/placeorder
Authorization: Bearer {token} (required)
Content-Type: application/json

Request:
{
  "user_id": number,
  "items": [
    {
      "id": number,
      "product_id": number,
      "quantity": number,
      "title": "string",
      "price": number
    }
  ],
  "billing_info": {
    "name": "string",
    "country": "string",
    "city": "string",
    "card": "string",
    "month": "string",
    "year": "string"
  }
}

Response (Success):
{
  "success": true,
  "data": {
    "order_id": number,
    "user_id": number,
    "items": array,
    "total": number,
    "status": "pending",
    "created_at": "ISO8601"
  },
  "message": "Order placed successfully"
}

Response (Error):
{
  "success": false,
  "error": "Cart is empty",
  "code": "EMPTY_CART"
}
```

#### 10. Get User Orders
```
GET /api/orders/{userid}
Authorization: Bearer {token} (required)

Response:
{
  "success": true,
  "data": [
    {
      "id": number,
      "user_id": number,
      "items": array,
      "total": number,
      "status": "string",
      "created_at": "ISO8601"
    },
    ...
  ]
}
```

#### 11. Get Specific Order
```
GET /api/orders/{orderid}
Authorization: Bearer {token} (required)

Response:
{
  "success": true,
  "data": {
    "id": number,
    "user_id": number,
    "items": array,
    "total": number,
    "status": "string",
    "created_at": "ISO8601"
  }
}
```

---

### User Profile Endpoints

#### 12. Get User Profile
```
GET /api/user/{userid}
Authorization: Bearer {token} (required)

Response:
{
  "success": true,
  "data": {
    "user_id": number,
    "username": "string",
    "email": "string",
    "phone": "string",
    "country": "string",
    "city": "string",
    "created_at": "ISO8601"
  }
}
```

#### 13. Update User Profile
```
POST /api/updateprofile
Authorization: Bearer {token} (required)
Content-Type: application/json

Request:
{
  "user_id": number,
  "email": "string",
  "phone": "string",
  "country": "string",
  "city": "string"
}

Response:
{
  "success": true,
  "data": {
    "user_id": number,
    "email": "string",
    ...
  },
  "message": "Profile updated"
}
```

---

## API Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (e.g., duplicate user) |
| 429 | Too Many Requests (Rate Limited) |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## Common Error Codes

| Code | Description |
|------|-------------|
| INVALID_CREDENTIALS | Username or password incorrect |
| USER_EXISTS | User already registered |
| USER_NOT_FOUND | User doesn't exist |
| NOT_FOUND | Resource not found |
| MISSING_FIELD | Required field missing |
| INVALID_QUANTITY | Invalid product quantity |
| EMPTY_CART | Cart is empty |
| UNAUTHORIZED | Not authenticated/authorized |
| RATE_LIMITED | Too many requests |
| INVALID_TOKEN | Authentication token invalid |

---

## Authentication

All authenticated endpoints require the `Authorization` header:

```
Authorization: Bearer {token}
```

Tokens are obtained from the login endpoint and are required for:
- Adding/removing items from cart
- Viewing cart
- Placing orders
- Viewing orders
- Getting/updating user profile

---

## Performance SLAs

| Endpoint | Target |
|----------|--------|
| GET /api/products | 2000ms |
| GET /api/products/{id} | 1500ms |
| POST /api/login | 1000ms |
| POST /api/addtocart | 800ms |
| POST /api/placeorder | 2500ms |
| GET /api/filter/{category} | 1800ms |

---

## Rate Limiting

- Default rate limit: 100 requests per minute per IP
- Burst limit: 10 requests per second
- Rate limit headers:
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Pagination (if applicable)

For large result sets:

```
GET /api/products?page=1&limit=20
GET /api/orders?page=1&limit=10
```

Response headers:
- `X-Total-Count`: Total items
- `X-Page`: Current page
- `X-Limit`: Items per page

---

## Filtering & Sorting

For product endpoints:

```
GET /api/products?category=phones&sort=price&order=asc
GET /api/products?search=samsung&limit=10
```

---

## Security Headers

Expected response headers:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000
X-XSS-Protection: 1; mode=block
```

---

## Webhook Endpoints (if implemented)

```
POST /api/webhooks/subscribe
POST /api/webhooks/unsubscribe
```

Events:
- order.created
- order.shipped
- order.delivered
- user.registered
- product.updated

---

## API Versioning

Current API Version: v1

Future versions may be available at:
- `/api/v2/...`
- `/api/v3/...`

---

## Testing Tool Usage

```typescript
// Using DemoblazeAPI helper in tests
import { DemoblazeAPI } from './api-helper';

const api = new DemoblazeAPI(apiContext);

// Authentication
const signup = await api.signup({ username: 'test', password: 'Test123!' });
const login = await api.login({ username: 'test', password: 'Test123!' });
api.setAuthToken(login.data.token, login.data.user_id);

// Products
const products = await api.getProducts();
const product = await api.getProductById(1);
const phonesonly = await api.getProductsByCategory('phones');

// Cart
await api.addToCart(1, 2);
const cart = await api.viewCart();
await api.removeFromCart(itemId);

// Orders
const order = await api.placeOrder(cartItems);
const orders = await api.getOrders();

// Profile
const profile = await api.getProfile();
await api.updateProfile({ email: 'new@example.com' });
```

---

## Postman Collection

For manual API testing, you can import the following collection structure:

```
Demoblaze API
├── Authentication
│   ├── Signup
│   └── Login
├── Products
│   ├── Get All Products
│   ├── Get Product by ID
│   └── Filter by Category
├── Shopping Cart
│   ├── Add to Cart
│   ├── Remove from Cart
│   └── View Cart
├── Orders
│   ├── Place Order
│   ├── Get Orders
│   └── Get Order by ID
└── User Profile
    ├── Get Profile
    └── Update Profile
```

---

## API Documentation Standards

All endpoints follow RESTful conventions:
- `GET` - Retrieve resource(s)
- `POST` - Create/update resource
- `PUT` - Replace resource
- `DELETE` - Remove resource
- `PATCH` - Partial update

---

## Support & Issues

For API issues:
1. Check error response codes and messages
2. Verify authentication token is valid
3. Ensure required fields are provided
4. Check rate limiting status
5. Review API response structure
6. Check server status and availability

---

**Last Updated:** May 2026  
**API Version:** v1  
**Total Endpoints:** 13  
**Total Tests:** 77
