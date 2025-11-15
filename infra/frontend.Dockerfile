FROM node:20-slim AS base
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

FROM nginx:1.25-alpine
COPY --from=base /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
