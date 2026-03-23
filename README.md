cat > README.md << 'EOF'
# MyCourses App

## Setup
1. Clone the repo
2. `cd backend && npm install`
3. Create a `.env` file (ask a teammate for the values)
4. `npm run dev`
EOF
git add README.md
git commit -m "docs: add README"
git push

## ENV example
cat > backend/.env.example << 'EOF'
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/mycourses
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
EOF
git add backend/.env.example
git commit -m "chore: add env example"
git push