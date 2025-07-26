# Use the official Node.js 20 image as base
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --ignore-scripts

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Remove dev dependencies after build
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
