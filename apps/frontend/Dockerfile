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
RUN npm run build --workspace @store/frontend

FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
