# Copilot Metrics Viewer — static documentation (Docusaurus)
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG DOCUSAURUS_URL=https://docs.example.com
ARG DOCUSAURUS_BASE_URL=/
ENV DOCUSAURUS_URL=$DOCUSAURUS_URL
ENV DOCUSAURUS_BASE_URL=$DOCUSAURUS_BASE_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
