FROM node:24.19.0-bookworm-slim
ENV PLAYWRIGHT_BROWSERS_PATH=/opt/playwright
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod && pnpm exec playwright install --with-deps chromium
RUN useradd --create-home --uid 1001 imageworker
COPY core.mjs image-validation.mjs browser.mjs browser-server.mjs ./
ENV NODE_ENV=production
USER imageworker
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s CMD node -e "fetch('http://127.0.0.1:8080/health',{headers:{Authorization:'Bearer '+process.env.IMAGE_BROWSER_AUTH_TOKEN},signal:AbortSignal.timeout(3000)}).then(r=>{if(!r.ok)process.exitCode=1}).catch(()=>process.exitCode=1)"
CMD ["node","browser-server.mjs"]
