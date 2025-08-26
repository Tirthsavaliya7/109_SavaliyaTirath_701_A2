# Q3 — Express Login App with Redis Session Store

A minimal Express.js login application that uses **Redis** to persist sessions with `express-session` and `connect-redis`.

## Features
- Login/Logout flow with sessions persisted in Redis
- EJS templates with a tiny, clean UI
- Simple demo user (email: `admin@demo.com`, password: `Pass@123`)
- Environment-based configuration
- Works locally with a Redis server

## 1) Prerequisites
- Node.js 18+
- Redis server running locally (`redis-server`) or via Docker

### Run Redis via Docker (recommended)
```bash
docker run -it --rm -p 6379:6379 redis:7-alpine
```

## 2) Setup
```bash
npm install
cp .env.example .env
# edit .env and set a strong SESSION_SECRET
npm start
# or
npm run dev
```

App will start on: `http://localhost:4000`

## 3) Demo Credentials
- **Email:** `admin@demo.com`
- **Password:** `Pass@123`

## 4) Folder Structure
```
Q3/
  server.js
  package.json
  .env.example
  routes/
    auth.js
  middleware/
    auth.js
  views/
    home.ejs
    login.ejs
    dashboard.ejs
    404.ejs
    partials/
      layout.ejs
  public/
    styles.css
  README.md
```

## 5) Notes
- This is a teaching/demo app. Do **not** store plain-text passwords in real projects.
- Behind HTTPS/proxy, set `app.set('trust proxy', 1)` and `cookie.secure=true`.
- When deploying, ensure your Redis is secured and not publicly exposed.