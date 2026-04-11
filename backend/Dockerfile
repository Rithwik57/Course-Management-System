FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port (will be overridden by $PORT if set in Heroku/Render)
EXPOSE 5000

# Use the standard start script
CMD ["npm", "start"]
