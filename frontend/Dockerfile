FROM node:18-alpine AS build

WORKDIR /app

# In Docker, nginx proxies /api to the backend container by name.
# VITE_API_URL is left empty so the frontend uses relative URLs (/api/...)
# which nginx then forwards to http://backend:5001
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
