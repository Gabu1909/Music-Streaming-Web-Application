# 🎵 Music Streaming Web Application

Welcome to the **Music Streaming Web Application** project. This is a full-stack web platform that allows users to explore, stream, and manage music tracks. The project is architected with a decoupled frontend and backend for scalability and maintainability.

## Project Architecture

The repository is divided into two main applications:

* **`backend-api`**: The RESTful API server handling data, business logic, file uploads, and database connections.
* **`frontend-spa`**: A Single Page Application (SPA) providing the user interface for the music player, library, and admin dashboard.

## Features

* **Music Streaming:** High-quality audio streaming with playback controls.
* **Library Management:** Browse songs (`views/Library`), view details (`views/Detail`), and manage playlists.
* **Admin Dashboard:** Dedicated interface (`components/admin`) for managing tracks, albums, and artists.
* **Media Uploads:** Support for uploading audio files and cover images (`public/uploads`).
* **Secure Authentication:** User login and registration system.
* **Search & Explore:** Find tracks and artists easily.

## Tech Stack

### Backend (`backend-api`)
* **Runtime:** Node.js
* **Framework:** Express.js (implied)
* **Database:** MongoDB / SQL (managed via `database/`)
* **Architecture:** MVC (Model-View-Controller) with Service layer.

### Frontend (`frontend-spa`)
* **Framework:** React.js / Vue.js (Modern SPA framework)
* **State Management:** Managed via `store/`
* **Routing:** Client-side routing via `router/`
* **Styling:** CSS/SCSS with responsive design.

## Folder Structure

```text
├── backend-api/             # API Server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── database/        # DB connection & models
│   │   ├── middlewares/     # Auth & validation middleware
│   │   ├── routes/          # API endpoints
│   │   ├── schemas/         # Data validation schemas
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helper functions
│   └── public/uploads/      # Stored media files
│
├── frontend-spa/            # Client Application
│   ├── src/
│   │   ├── assets/          # Static assets
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom hooks
│   │   ├── layout/          # Layout wrappers
│   │   ├── router/          # Route definitions
│   │   ├── services/        # API calls
│   │   ├── store/           # State management
│   │   └── views/           # Page views (Detail, Library)
│   └── dist/                # Production build

Installation & Setup
To run the project, you need to set up both the backend and frontend terminals.

1. Backend Setup
Navigate to the backend directory and install dependencies:

Bash

cd backend-api
npm install
# Configure your .env file (Database URI, PORT, Secrets)
npm start
2. Frontend Setup
Open a new terminal, navigate to the frontend directory:

Bash

cd frontend-spa
npm install
# Configure .env if necessary (API Base URL)
npm run dev

Developed by Tran Thi Kim Phung & Huynh Tu Phuong