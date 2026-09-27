# 3-Tier DevSecOps Project

This repository contains a simple Node.js API and a React client used for a user management demo. Follow the steps below to get the project running locally.

## Setup

1. Install Node.js (version 18 or later is recommended).
2. Install dependencies for both the API and client:

   ```bash
   cd api && npm install
   cd ../client && npm install
   ```

3. Copy the environment templates and fill in real values (never commit the real `.env` files):

   ```bash
   cp api/.env.example api/.env
   cp .env.example .env   # used by docker-compose
   ```

   Generate a strong `JWT_SECRET` with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

4. Start the API server:

   ```bash
   cd api
   npm start
   ```

5. In a separate terminal, start the React client:

   ```bash
   cd client
   npm start
   ```

6. Open `http://localhost:3000` in your browser to use the application.

The client now displays an animated banner welcoming you to **DevOps Shack**.

## Security notes

- Real secrets (DB passwords, `JWT_SECRET`, Slack tokens) must never be committed to this repo or pasted into shared docs/PDFs. Use `.env` files locally and Jenkins credentials / a secrets manager in CI/CD.
- If any credential in this project's history was ever exposed (shared in a chat, screenshot, doc, or committed to git), rotate it immediately rather than just changing the file.
- The backend connects to MySQL with a dedicated `crud_app_user`, not `root` — see `docker-compose.yaml` and `.env.example`.
