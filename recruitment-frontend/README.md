# Recruitment Frontend — Step 2

React (Vite + Tailwind) app: public application form (also serves as the QR intake form), recruiter login, dashboard, and candidate screening.

## Setup

1. Make sure the backend (Step 1) is already running — this app talks to it.
2. `cd recruitment-frontend`
3. `npm install`
4. Copy `.env.example` to `.env`. Set `VITE_API_URL` to match your backend's port (default assumes `http://localhost:4001/api` — change the `4001` if yours differs).
5. `npm run dev` — opens at `http://localhost:5173`

## Pages

- `/` — public application form. Add `?src=qr` to the URL for the version tagged as a QR-code submission (e.g. `http://localhost:5173/?src=qr`) — this is the link your QR code should point to.
- `/login` — recruiter login (use the account you registered via curl in Step 1, or register more via the API).
- `/dashboard` — funnel overview (protected, recruiter login required).
- `/candidates` — search, filter, and screen candidates by updating their status (protected).

## Note on Khmer translations

The Khmer copy is a first-pass translation — worth a native-speaker review before this goes live with real candidates.
