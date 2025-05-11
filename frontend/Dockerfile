FROM node:24-alpine@sha256:7804c7734b3e0cf647ab8273a1d4cda776123145da5952732f3dca9e742ddca0 AS build

WORKDIR /build

COPY package.json package-lock.json ./

RUN npm ci

COPY . ./

RUN npm run build

FROM nginx

COPY --from=build /build/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
