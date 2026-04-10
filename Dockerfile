# Use the official Node.js 20 lightweight image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to cache dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Build the Nuxt application for production
RUN npm run build

# --- THIS IS THE FIX ---
# Force Nuxt/Nitro to listen on all network interfaces
ENV HOST=0.0.0.0
# Tell Cloud Run which port we expect to use
ENV PORT=8080

# Expose the port so Cloud Run knows where to route traffic
EXPOSE 8080

# Start the built Nuxt server
CMD ["node", ".output/server/index.mjs"]