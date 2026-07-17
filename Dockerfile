FROM node:20-alpine
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and lockfile (since pnpm-lock.yaml exists)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy application source code
COPY . .

# Expose port (from .env it is 3007)
EXPOSE 3007

# Run application using node directly
CMD ["node", "index.js"]
