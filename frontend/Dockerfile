# syntax=docker/dockerfile:1

# ---------- Build stage ----------
# Bangun aset statis dengan Node, lalu disajikan oleh nginx di stage berikutnya.
FROM node:22-alpine AS build
WORKDIR /app

# Install dependency lebih dulu agar layer ini ter-cache selama lockfile tetap.
COPY package.json package-lock.json ./
RUN npm ci

# Build (tsc -b && vite build) → output ke /app/dist.
# `COPY . .` menyertakan file .env, sehingga Vite memakai env yang SAMA dengan
# dev (VITE_* disuntik ke bundle saat build).
COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:1.27-alpine AS runtime

# Konfigurasi SPA (fallback ke index.html) + caching aset hashed.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
