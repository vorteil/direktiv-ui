FROM node:alpine as gui-build

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY public ./public
COPY src ./src
COPY package.json ./
COPY yarn.lock ./
COPY config-overrides.js ./

RUN yarn install
RUN ls .
RUN yarn build

FROM golang:1.16-buster as server-build

WORKDIR /go/src/app
ADD ./reactjs-embed/. /go/src/app
COPY --from=gui-build /app/build /go/src/app/build
RUN ls .

RUN go get -d -v
RUN CGO_ENABLED=0 go build -o /server -ldflags="-s -w" main.go


FROM alpine:latest

RUN apk add shadow
RUN /usr/sbin/groupadd -g 22222 direktivg && /usr/sbin/useradd -s /bin/sh -g 22222 -u 33333 direktivu

COPY --from=server-build /server /
CMD ["/server"]

