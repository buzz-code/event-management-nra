#!/bin/sh
# Runs curl-based endpoint smoke tests against a running backend.
# Requires BACKEND_URL and ADMIN_USER env vars, or uses defaults.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
. "$SCRIPT_DIR/../helpers/endpoints.env"
exec "$SCRIPT_DIR/../shared/utils/testing/test-all-endpoints-runner.sh"
