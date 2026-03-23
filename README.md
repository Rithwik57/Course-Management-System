cat > README.md << 'EOF'
# MyCourses App

A university course management system with Student, Faculty, and Admin roles.
Built with Node.js, Express, MongoDB, and React.

---

## Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) v18 or above
- [Git](https://git-scm.com/)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free account

Verify your installs:

    node --version
    npm --version
    git --version

---

## Getting Started

### 1. Clone the repo

    git clone https://github.com/<YOUR_USERNAME>/Course-Management-System.git
    cd Course-Management-System

### 2. Install backend dependencies

    cd backend
    npm install

### 3. Set up environment variables

    cp .env.example .env

Open .env and fill in the values. Ask a teammate for the MongoDB URI and JWT secret.

### 4. Run the backend server

    npm run dev

Server runs at http://localhost:5000
You should see:

    Connected to MongoDB Atlas
    Server running on http://localhost:5000

### 5. Set up the frontend (coming soon)

    cd ../frontend
    npm install
    npm run dev

---

## Environment Variables

| Variable     | Description                            |
|--------------|----------------------------------------|
| PORT         | Port the server runs on                |
| MONGODB_URI  | Your MongoDB Atlas connection string   |
| JWT_SECRET   | Secret key for signing JWT tokens      |
| NODE_ENV     | development or production              |

---

## Project Structure

    Course-Management-System/
    backend/
        src/
            config/
            controllers/
            middleware/
            models/
            routes/
            index.js
        .env.example
        package.json
    frontend/
    README.md

---

## Collaboration

- Never commit your .env file
- Always pull before you start working: git pull origin main
- Create a new branch for your feature: git checkout -b feature/<your-feature-name>
- Open a pull request when your feature is ready

---

## .env.example

    PORT=<port_number>
    MONGODB_URI=mongodb+srv://<db_username>:<db_password>@<cluster_name>.mongodb.net/<db_name>?retryWrites=true&w=majority
    JWT_SECRET=<your_jwt_secret>
    NODE_ENV=<development_or_production>

---

## Team

Built for the Virtualization and Cloud Computing course project.
EOF
git add README.md
git commit -m "docs: add full project README"
git push
