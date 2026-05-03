# Stage 1: Build React frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# Stage 2: Build Go backend
FROM golang:1.25-alpine AS backend-builder
WORKDIR /app
RUN apk add --no-cache gcc musl-dev
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# Copy the built frontend from Stage 1
COPY --from=frontend-builder /app/client/dist ./client/dist
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/web

# Stage 3: Final minimal image
FROM alpine:latest
RUN apk add --no-cache ca-certificates
WORKDIR /root/
# Copy the Go binary
COPY --from=backend-builder /app/main .
# Copy the static assets
COPY --from=backend-builder /app/client/dist ./client/dist

# Create data directory for SQLite if needed (though we use in-memory for now)
RUN mkdir -p data

# Expose port 8080
EXPOSE 8080

# Command to run the application
CMD ["./main"]
