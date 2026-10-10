FROM node:24.19.0-bookworm-slim
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
RUN useradd --create-home --uid 1001 imageworker
COPY core.mjs browser.mjs remote-browser.mjs worker.mjs health.mjs ./
ENV NODE_ENV=production
USER imageworker
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s CMD node health.mjs
CMD ["node","worker.mjs"]
