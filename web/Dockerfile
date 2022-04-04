FROM node:16.14.0 as build
ARG REACT_APP_API_BASE_URL

WORKDIR /apps

COPY yarn.lock .
COPY package.json .
RUN yarn install
COPY . .