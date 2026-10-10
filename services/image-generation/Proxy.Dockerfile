FROM node:24.19.0-bookworm-slim

WORKDIR /app
RUN useradd --create-home --uid 1001 imageproxy
COPY egress-proxy.mjs ./
USER 1001:1001
EXPOSE 3128
CMD ["node", "egress-proxy.mjs"]
