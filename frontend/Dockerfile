FROM node:21.7.0-alpine3.19 AS build-stage

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY . .

RUN npm run build

FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build-stage /app/build/ /usr/share/nginx/html

EXPOSE 80 

CMD ["nginx", "-g", "daemon off;"]
