# VoteSnap 🗳️

A modern, responsive online voting application built with React, Node.js, and MongoDB.

## Features

- Create polls with up to 5 options
- Anonymous voting (1 vote per IP/device)
- Live results visualization with Chart.js
- Poll expiration system
- Modern UI with TailwindCSS
- Mobile-first design
- Light/dark mode support
- Shareable poll links

## Tech Stack

### Frontend
- React
- TailwindCSS
- Chart.js
- React Router
- Axios

### Backend
- Node.js
- Express
- MongoDB
- Mongoose

## Project Structure

```
votesnap/
├── client/             # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── utils/
└── server/             # Node.js backend
    ├── controllers/
    ├── models/
    ├── routes/
    └── config/
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/votesnap.git
cd votesnap
```

2. Install frontend dependencies
```bash
cd client
npm install
```

3. Install backend dependencies
```bash
cd ../server
npm install
```

4. Create a .env file in the server directory
```
MONGODB_URI=your_mongodb_uri
PORT=5000
```

5. Start the development servers

Frontend:
```bash
cd client
npm start
```

Backend:
```bash
cd server
npm run dev
```

## License

MIT 