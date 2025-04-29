FROM node:18-alpine as development

RUN apk add git

WORKDIR /app

# COPY package*.json /app/
# COPY yarn.lock /app/

# RUN yarn install

# COPY . .

CMD ["yarn", "start"]


FROM node:18-alpine AS builder

RUN apk add git

ARG REACT_APP_API_URL
ENV NODE_ENV production

WORKDIR /app

COPY package*.json /app/
COPY yarn.lock /app/

RUN yarn install --production

COPY . .

RUN yarn build


FROM nginx:alpine as production

WORKDIR /usr/share/nginx/html

RUN rm -rf *

COPY --from=builder /app/dist .
COPY --from=builder /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]
