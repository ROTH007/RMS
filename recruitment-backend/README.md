# Recruitment Backend — Step 1

Express API + PostgreSQL for the Recruitment Management System.

## Setup

1. Install Node.js 18+ and PostgreSQL (or create a free Postgres DB on Railway/Render/Supabase).
2. `cd recruitment-backend`
3. `npm install`
4. Copy `.env.example` to `.env` and fill in your real `DATABASE_URL` and a random `JWT_SECRET`.
5. Create the database, then load the schema:
   `psql "$DATABASE_URL" -f src/db/schema.sql`
6. `npm run dev` — starts the API on `http://localhost:4000`.

## Test it

```
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Recruiter","email":"test@example.com","password":"password123"}'
```

That returns a JWT token. Use it as `Authorization: Bearer <token>` to call the protected routes like `GET /api/candidates`.

Public candidate submission (no token needed):
```
curl -X POST http://localhost:4000/api/candidates \
  -F "english_name=Sok Dara" \
  -F "phone=012345678" \
  -F "position_applied=Sales Associate"
```
