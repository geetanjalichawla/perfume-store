FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Compile TypeScript code
RUN npm run build

# Run the application
CMD ["node", "dist/server.js"]
