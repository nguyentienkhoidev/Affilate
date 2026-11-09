#!/usr/bin/env bash
set -e

ACTION="${1:-up}"

cd "$(dirname "$0")/.."

case "$ACTION" in
  up)
    echo "Starting infrastructure containers (PostgreSQL 16, Redis 7, MinIO S3)..."
    docker compose up -d postgres redis minio create-bucket
    echo "Infrastructure ready!"
    ;;
  down)
    echo "Stopping infrastructure containers..."
    docker compose stop postgres redis minio
    ;;
  status)
    docker compose ps postgres redis minio
    ;;
  *)
    echo "Usage: $0 [up|down|status]"
    exit 1
    ;;
esac

