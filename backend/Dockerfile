FROM golang:1.24.3 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
COPY config/ config/

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main ./cmd

FROM alpine:latest

# Install Python3, pip, ffmpeg and other necessary packages
RUN apk add --no-cache \
    python3 \
    py3-pip \
    ffmpeg \
    && python3 -m pip install --break-system-packages --upgrade pip

WORKDIR /app

# Copy the main binary and config
COPY --from=builder /app/main .
COPY --from=builder /app/config ./config

# Copy Python scripts and requirements
COPY utils/ ./utils/
COPY requirements.txt .

# Install Python dependencies
RUN python3 -m pip install --break-system-packages -r requirements.txt

EXPOSE 8000

CMD ["./main"]