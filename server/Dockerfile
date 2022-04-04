FROM golang:1.17.8-alpine

WORKDIR /app

COPY go.mod .
COPY go.sum .
RUN go mod download
COPY . .
RUN go build -o /main ./cmd/suvanosa