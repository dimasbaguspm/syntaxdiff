#!/usr/bin/env bash
# Runs after the container is created (devcontainer postCreateCommand).
# Ensures the Node/pnpm toolchain is ready and dependencies are installed.
set -euo pipefail

echo "==> Enabling pnpm (corepack)"
corepack enable pnpm
corepack prepare pnpm@latest --activate

echo "==> Installing dependencies"
pnpm install --frozen-lockfile || pnpm install

echo "==> Toolchain ready"
node --version
pnpm --version
