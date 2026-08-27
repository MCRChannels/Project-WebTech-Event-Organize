# 🎟️ Event Organizer

A full-stack web application for discovering, creating, and booking events — built with Node.js, Express, MongoDB, and EJS. Features user authentication, event management, image uploads, booking system, and QR code check-in.

---

## ✨ Features

- **User Authentication** — Secure sign up and login with JWT and bcrypt password hashing.
- **Event Browsing** — Browse all available events from the landing page without logging in.
- **Event Booking** — Registered users can book events and manage their reservations.
- **Event Management** — Create, edit, and delete events with image uploads via Cloudinary.
- **Admin Panel** — Administrators can manage all events and oversee user bookings.
- **QR Code Scanner** — Scan and validate booking QR codes for event check-in.
- **Profile Management** — Users can view and update their profile information.
- **Payment Page** — Integrated payment flow for paid event registrations.

---

## 🛠️ Tech Stack

**Backend:**
- Node.js
- Express.js (v5)
- MongoDB (Mongoose)
- EJS (Templating Engine)
- JWT (JSON Web Tokens)
- bcryptjs (Password Hashing)

**Storage & Media:**
- Cloudinary (Image Storage)
- Multer + multer-storage-cloudinary

**Dev Tools:**
- Nodemon
- dotenv
- cookie-parser
- validator

---

## 📁 Project Structure

```
├── server.js               # App entry point
├── package.json
├── public/                 # Static assets (CSS, JS, images)
├── views/                  # EJS templates
│   ├── index.ejs           # Landing / event listing page
│   ├── login.ejs
│   ├── dashboard.ejs       # User dashboard
│   ├── create-event.ejs
│   ├── edit-event.ejs
│   ├── my-bookings.ejs
│   ├── payment.ejs
│   ├── profile.ejs
│   ├── scanner.ejs         # QR scanner page
│   └── admin-panel.ejs
└── src/
    ├── config/             # Database and Cloudinary config
    ├── controllers/        # Route handlers
    ├── middleware/         # Auth middleware
    ├── models/             # Mongoose schemas (User, Event, Booking)
    └── routes/
        ├── apiRoutes.js    # REST API routes
        └── viewRoutes.js   # Page rendering routes
```

---

## 🔌 API Overview

All API routes are prefixed with `/api/v1`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Login and receive JWT |
| `GET` | `/api/v1/events` | Get all events |
| `POST` | `/api/v1/events` | Create a new event (admin) |
| `PUT` | `/api/v1/events/:id` | Update an event (admin) |
| `DELETE` | `/api/v1/events/:id` | Delete an event (admin) |
| `POST` | `/api/v1/bookings` | Book an event |
| `GET` | `/api/v1/bookings/my` | Get current user's bookings |

---

## 🌐 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — browse all events |
| `/login` | Login / Register page |
| `/dashboard` | User dashboard |
| `/my-bookings` | View your bookings |
| `/profile` | User profile |
| `/admin` | Admin panel |
| `/scanner` | QR code check-in scanner |

---

## 📦 Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `PORT` | Port the server listens on |
| `MONGODB_URI` | MongoDB connection string |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `JWT_SECRET` | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | JWT expiration duration (e.g. `90d`) |

---

## 📄 License

This project is for educational purposes as part of a Web Technology and Web Service course.
