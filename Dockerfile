# Stage 1: Dependencies
FROM node:20-slim AS deps
WORKDIR /app

COPY package*.json ./
RUN npm install

# Stage 2: Builder
FROM node:20-slim AS builder
WORKDIR /app

# Set environment variables for build time
ENV NEXT_PUBLIC_SUPABASE_URL=https://wzzudkjvytjmhhxhxirl.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6enVka2p2eXRqbWhoeGh4aXJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzMzk1MjIsImV4cCI6MjA1MDkxNTUyMn0.9ofo6bGvyOsiheDQL_hq3j_QxehsJxIIZm3Mx1e0VfU
ENV NEXT_PUBLIC_MEILISEARCH_URL=https://meilisearch-bmw.jineshb.app
ENV NEXT_PUBLIC_MEILISEARCH_KEY=j1kT71ELtayufIaOe4cFMF1sK3gGjR5O
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Stage 3: Runner
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
# Set environment variables for runtime
ENV NEXT_PUBLIC_SUPABASE_URL=https://wzzudkjvytjmhhxhxirl.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6enVka2p2eXRqbWhoeGh4aXJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzMzk1MjIsImV4cCI6MjA1MDkxNTUyMn0.9ofo6bGvyOsiheDQL_hq3j_QxehsJxIIZm3Mx1e0VfU
ENV NEXT_PUBLIC_MEILISEARCH_URL=https://meilisearch-bmw.jineshb.app
ENV NEXT_PUBLIC_MEILISEARCH_KEY=j1kT71ELtayufIaOe4cFMF1sK3gGjR5O

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]