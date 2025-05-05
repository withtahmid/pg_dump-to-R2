FROM node:18-alpine AS builder

RUN apk add --no-cache postgresql-client
RUN corepack enable && corepack prepare pnpm@8.9.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install

COPY tsconfig.json ./
COPY src ./src

RUN pnpm build

FROM node:18-alpine

RUN apk add --no-cache postgresql-client
RUN corepack enable && corepack prepare pnpm@8.9.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --prod

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]