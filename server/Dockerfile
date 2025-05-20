FROM node:16-alpine as development

RUN apk add --no-cache \
    udev \
    ttf-freefont \
    chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_ENV development

WORKDIR /app

# No need to do this, because external node_modules are mounted
# COPY package*.json /app/
# COPY yarn.lock /app/
# RUN yarn install
# COPY . .

CMD ["yarn", "start:dev"]


FROM node:16-alpine AS builder

RUN  apk add curl bash

WORKDIR /app

COPY package*.json /app/
COPY yarn.lock /app/
COPY .yarnclean /app/

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build


FROM node:16-alpine as production

ENV NODE_ENV production

RUN apk add --no-cache \
    udev \
    ttf-freefont \
    chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app2

COPY --from=builder /app/package*.json .
COPY --from=builder /app/yarn.lock .
COPY --from=builder /app/dist/ ./dist/

RUN yarn install --production --frozen-lockfile

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
