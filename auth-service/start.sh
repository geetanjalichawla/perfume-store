#!/bin/sh

# Run Prisma migrations
npx prisma migrate deploy

# Start the Node.js application
node dist/server.js
