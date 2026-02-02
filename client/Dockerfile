FROM node:18-alpine AS development

RUN apk add --no-cache git

ENV NODE_ENV development

WORKDIR /app

# No need to do this, because external node_modules are mounted
# COPY package*.json yarn.lock ./
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

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

ENTRYPOINT ["nginx", "-g", "daemon off;"]
