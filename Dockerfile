# transpile ts
FROM --platform=linux/amd64 node:16.9.1-alpine3.11 as ts-compiler

WORKDIR doke-bot

COPY src ./src

COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .

RUN npm i

RUN npm run build

# grab node deps
FROM --platform=linux/amd64 node:16.9.1-alpine3.11 as node-builder

WORKDIR doke-bot

COPY package.json .
COPY package-lock.json .
COPY --from=ts-compiler /doke-bot/dist/ .

RUN npm ci

# distroless final stage
FROM --platform=linux/amd64 gcr.io/distroless/nodejs:16

WORKDIR doke-bot

COPY --from=node-builder doke-bot/ .

CMD ["/doke-bot/doke-bot.js"]