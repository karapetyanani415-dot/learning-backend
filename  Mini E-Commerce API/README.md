# Mini E-Commerce API

A small e-commerce REST API built with Express and Node's `fs` module, following the
assignment spec: public product browsing, JWT auth, role-based access (admin/customer),
and stock-safe checkout — all backed by plain JSON files in `data/`.

## Setup & Running

```bash
npm install
```

Create a `.env` file in the project root:

```
PORT=3000
SECRET=your-own-long-random-string
```

Start the server:

```bash
node server.js
```

The API is now running at `http://localhost:3000`.

## Endpoints

All 10 required endpoints from the spec are implemented exactly as specified —
no path, method, or access-rule deviations.

| Method & Path         | Access             | Behavior                                      |
|------------------------|--------------------|------------------------------------------------|
| `POST /auth/register`  | Anyone             | Create a customer account                      |
| `POST /auth/login`     | Anyone             | Returns a signed JWT (expires in 10m)          |
| `GET /products`        | Anyone             | List products; supports `?category=`, `?sort=price`, `?search=` |
| `GET /products/:id`    | Anyone             | Get one product, 404 if missing                |
| `POST /products`       | Admin only         | Create a product                               |
| `PUT /products/:id`    | Admin only         | Replace a product entirely                     |
| `DELETE /products/:id` | Admin only         | Remove a product                               |
| `POST /orders`         | Logged-in user     | Checkout: validates & decrements stock server-side |
| `GET /orders`          | Logged-in user     | Caller's own orders only                       |
| `GET /orders/:id`      | Owner or admin     | 404 if missing, 403 if not yours               |

## Stretch Goals Implemented

These go beyond the required 10 endpoints (not deviations — additions):

- **`PATCH /orders/:id`** (admin only) — updates order status, restricted to the
  forward-only transitions `pending → shipped → delivered`. Any other transition
  returns `400`.
- **`DELETE /orders/:id`** — owner or admin can cancel an order **while it is still
  `pending`**; cancelling restores the reserved stock and removes the order. Trying
  to cancel a `shipped` or `delivered` order returns `400`.
- **`?search=`** on `GET /products` — case-insensitive substring match on product
  name, combinable with `?category=` and `?sort=price`.

Pagination (`?page=`/`?limit=`) was not implemented.

## Notes

- Passwords are hashed with `bcryptjs`; `passwordHash` never appears in any response.
- `authenticate` and `authorize` are separate middlewares — missing/invalid token → `401`,
  known-but-wrong-role → `403`.
- Order totals and prices are always computed server-side from `data/products.json`,
  never trusted from the request body.
- Checkout validates every line item's stock **before** decrementing anything, and
  duplicate `productId` entries in one order are combined before the stock check.