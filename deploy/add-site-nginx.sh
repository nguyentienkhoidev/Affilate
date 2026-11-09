#!/usr/bin/env bash
# =============================================================================
# Auto-generate Nginx reverse proxy config for a new duplicate site (web2, web3...)
# Usage (Domain):    ./deploy/add-site-nginx.sh <app_slug> <domain>
#   Example:         ./deploy/add-site-nginx.sh web2 dealradar.com
# Usage (Server IP): ./deploy/add-site-nginx.sh <app_slug> _ <port>
#   Example:         ./deploy/add-site-nginx.sh web2 _ 81
# =============================================================================
set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage (Domain):    $0 <app_slug> <domain>"
  echo "Usage (Server IP): $0 <app_slug> _ <port>"
  exit 1
fi

APP_SLUG="$1"
DOMAIN="$2"
LISTEN_PORT="${3:-80}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONF_PATH="${SCRIPT_DIR}/nginx/conf.d/${APP_SLUG}.conf"

if [ "${DOMAIN}" = "_" ]; then
  SERVER_NAME_LINE="server_name _;"
else
  SERVER_NAME_LINE="server_name ${DOMAIN} www.${DOMAIN};"
fi

cat > "${CONF_PATH}" <<EOF
# Auto-generated Nginx config for ${APP_SLUG} (domain=${DOMAIN}, port=${LISTEN_PORT})
server {
    listen ${LISTEN_PORT};
    ${SERVER_NAME_LINE}

    resolver 127.0.0.11 valid=10s ipv6=off;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location ~ ^/api/v1/auth/(login|verify-2fa)\$ {
        limit_req zone=auth_limit burst=10 nodelay;

        set \$backend_upstream http://${APP_SLUG}-backend:8080;
        proxy_pass \$backend_upstream;

        proxy_http_version 1.1;
        proxy_set_header Host \$http_host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$proxy_x_forwarded_proto;
    }

    location /api/ {
        client_max_body_size 25M;

        set \$backend_upstream http://${APP_SLUG}-backend:8080;
        proxy_pass \$backend_upstream;

        proxy_http_version 1.1;
        proxy_set_header Host \$http_host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$proxy_x_forwarded_proto;
        proxy_read_timeout 60s;
        proxy_connect_timeout 10s;
    }

    location ~ ^/media/(.*)\$ {
        set \$minio_upstream http://shared-minio:9000/\$1\$is_args\$args;
        proxy_pass \$minio_upstream;

        proxy_http_version 1.1;
        proxy_set_header Host \$http_host;
        proxy_set_header Connection "";
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /_next/static/ {
        set \$frontend_upstream http://${APP_SLUG}-frontend:3000;
        proxy_pass \$frontend_upstream;

        proxy_http_version 1.1;
        proxy_set_header Host \$http_host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        set \$frontend_upstream http://${APP_SLUG}-frontend:3000;
        proxy_pass \$frontend_upstream;

        proxy_http_version 1.1;
        proxy_set_header Host \$http_host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$proxy_x_forwarded_proto;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        proxy_read_timeout 60s;
    }
}
EOF

echo "Created Nginx config: ${CONF_PATH}"

if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' | grep -qx 'shared-nginx'; then
  docker exec shared-nginx nginx -t
  docker exec shared-nginx nginx -s reload
  echo "Reloaded shared-nginx with zero downtime!"
else
  echo "Note: shared-nginx is not running yet. Start it with: docker compose -f docker-compose.nginx.yml up -d"
fi
