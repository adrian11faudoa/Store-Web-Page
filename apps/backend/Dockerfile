FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json ./
COPY packages ./packages
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/frontend/package.json ./apps/frontend/package.json
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate --workspace @store/backend

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 4000
CMD ["npm", "run", "start", "--workspace", "@store/backend"]
