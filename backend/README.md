# Delhi Canteen Backend

Express REST API for the Admin, Customer and Delivery Boy panels. MongoDB data is separated into `admins`, `customers`, and `delivery_boys` collections, with role-specific schemas and persistent login records.

## Run

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Server: `http://localhost:5000`.

## Demo credentials

| Role | Identifier | Password |
| --- | --- | --- |
| admin | admin@delhicanteen.com | admin123 |
| customer | 9876543210 | customer123 |
| delivery | 9810010010 | delivery123 |

Login request:

```json
POST /api/auth/login
{ "identifier": "9810010010", "password": "delivery123", "role": "delivery" }
```

Send the returned token with protected requests:

```text
Authorization: Bearer <token>
```

## Main API endpoints

- `POST /api/auth/login`, `POST /api/auth/customer/register`
- `GET/POST/PUT/DELETE /api/products`, `GET/POST/PUT/DELETE /api/categories`
- `POST /api/orders` (customer), `GET /api/orders` (admin)
- `GET /api/admin/dashboard`, `GET /api/admin/customers`
- `GET/POST/PUT /api/admin/delivery-boys`
- `PATCH /api/admin/orders/:id/assign`
- `PATCH /api/admin/orders/:id/unassign`
- `GET/PUT /api/customer/profile`, `GET /api/customer/orders`
- `GET /api/delivery/profile`, `/api/delivery/dashboard`, `/api/delivery/orders/today`
- `POST /api/delivery/orders/:id/reached`, `POST /api/delivery/orders/:id/complete`

Order workflow: customer creates an order → admin assigns an active delivery partner → partner marks reached → sends all verified item IDs and COD collection details → order becomes delivered.

Passwords are stored as bcrypt hashes. Set a secure `JWT_SECRET` and a valid `MONGODB_URI` in `.env` before production deployment.

