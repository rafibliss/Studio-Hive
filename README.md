# 🎥 StudioSpace — Creative Workspace & Production Studio Sharing Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-Session-blue?style=for-the-badge)](https://www.better-auth.com/)

StudioSpace is a high-performance peer-to-peer marketplace designed for creators, filmmakers, photographers, podcasters, and musicians. Studio owners and hosts can list their creative spaces—ranging from photography cyc walls and cinema sound stages to podcast lounges, music recording suites, and art workshops. Fellow creators can discover, filter, inspect dynamic availability, and reserve studio slots with transparent pricing and real-time booking management.

---

## 🌐 Live Site & Repository Links

- **Live Web Application**: [https://studiospace.vercel.app](https://studiospace.vercel.app) *(Replace with your actual deployed URL)*
- **Client Repository**: [https://github.com/your-username/studio-space-client](https://github.com/your-username/studio-space-client)
- **Server Repository**: [https://github.com/your-username/studio-space-server](https://github.com/your-username/studio-space-server)

---

## ✨ Key Features

- 🔐 **Hybrid Authentication System**: Robust authentication featuring Better Auth for session management combined with server-side JWT in `HttpOnly` cookies for API security. Includes Google Social Login.
- 🖼️ **Dynamic Gallery & Carousel**: Studio listings support multi-image array galleries with interactive sliders on the details page, complete with backward-compatibility fallbacks for single-image records.
- 🗓️ **Double-Booking Prevention Engine**: Smart time-overlap validation query (`startTime < newEndTime AND endTime > newStartTime`) preventing conflicting reservations for any confirmed studio schedule.
- ⚡ **Dynamic Booking Lifecycle Management**: Complete lifecycle tracking with distinct status badges (`Pending`, `Confirmed`, `Completed`, `Cancelled`) and an in-place `PATCH` cancellation route.
- 🌓 **Full System Light/Dark Theme Customization**: Seamless global theme toggle ensuring optimal user experience across all devices and UI states.
- 🎨 **Modern UX & Empty States**: Polished UI built with Tailwind CSS, featuring skeleton loaders during data fetch, toast notifications for all feedback, and descriptive empty states.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router, React 19, TypeScript)
- **Styling & UI**: Tailwind CSS, Lucide React Icons
- **Components**: Custom UI Components with Radix primitives & Sonner Toast notifications

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB 
- **Authentication**: Better Auth (Google OAuth) + JWT Cookie Security

---

## 🔑 Examiner Test Credentials

Use these credentials to test private routes and authenticated features:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Demo User** | `user@example.com` | `Password123` |
| **Demo Host** | `host@example.com` | `Password123` |

---

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js (v18.x or higher)
- npm or yarn
- MongoDB Connection String (Atlas or local instance)
- Google Cloud Console OAuth Credentials

---

### 1. Backend Setup (`studio-space-server`)

```bash
# Clone the repository
git clone https://github.com/your-username/studio-space-server.git
cd studio-space-server

# Install dependencies
npm install

# Create environment file (.env)
cp .env.example .env
```

Configure your `.env` file:
```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/studiospace?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:8000
CLIENT_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Start the backend server:
```bash
npm run dev
```

---

### 2. Frontend Setup (`studio-space-client`)

```bash
# In a new terminal window, clone the client repository
git clone https://github.com/your-username/studio-space-client.git
cd studio-space-client

# Install dependencies
npm install

# Create environment file (.env.local)
cp .env.example .env.local
```

Configure your `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:8000
```

Start the Next.js development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📂 API Routes Summary

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :---: |
| `GET` | `/studios` | Fetch all studio listings (with limit & search filters) | ❌ |
| `GET` | `/studios/:id` | Get detailed specifications for a single studio | ❌ |
| `POST` | `/studios` | Create a new studio listing | 🔒 |
| `PUT` | `/studios/:id` | Update an existing studio listing | 🔒 |
| `DELETE` | `/studios/:id` | Delete a studio listing | 🔒 |
| `GET` | `/bookings` | Get bookings for the authenticated user | 🔒 |
| `POST` | `/bookings` | Create a new booking (with double-booking check) | 🔒 |
| `PATCH` | `/bookings/:id` | Update booking status (e.g. Cancel booking) | 🔒 |

---

© 2026 StudioSpace. All Rights Reserved.
