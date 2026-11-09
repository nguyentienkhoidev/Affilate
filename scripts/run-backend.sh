#!/usr/bin/env bash
set -e

# Detect Java 21 Home on macOS
if [ -z "$JAVA_HOME" ]; then
  if [ -d "/Users/khoinguyen/Library/Java/JavaVirtualMachines/ms-21.0.10/Contents/Home" ]; then
    export JAVA_HOME="/Users/khoinguyen/Library/Java/JavaVirtualMachines/ms-21.0.10/Contents/Home"
  elif /usr/libexec/java_home -v 21 >/dev/null 2>&1; then
    export JAVA_HOME="$(/usr/libexec/java_home -v 21)"
  fi
fi

MVN_BIN="mvn"
if command -v /opt/homebrew/bin/mvn >/dev/null 2>&1; then
  MVN_BIN="/opt/homebrew/bin/mvn"
fi

echo "=========================================================="
echo " Starting HeyGoodly Spring Boot 3 Backend Locally..."
echo " Java: $($JAVA_HOME/bin/java -version 2>&1 | head -n 1)"
echo " Maven: $($MVN_BIN -version 2>&1 | head -n 1)"
echo " Database: PostgreSQL on localhost:5432"
echo " Cache: Redis on localhost:6379"
echo " Storage: MinIO on localhost:9000"
echo " URL: http://127.0.0.1:8080"
echo "=========================================================="

cd "$(dirname "$0")/../backend"
exec "$MVN_BIN" spring-boot:run

