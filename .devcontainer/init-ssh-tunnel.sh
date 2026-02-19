#!/bin/bash
set -euo pipefail

# Generate host keys if missing (needed in fresh containers)
ssh-keygen -A

# Start SSH server
echo "Starting sshd..."
/usr/sbin/sshd -e 2>/tmp/sshd.log || { echo "sshd failed:"; cat /tmp/sshd.log; exit 1; }

# Set password for node user
if [ -n "${SSH_PASSWORD:-}" ]; then
    PASSWORD="${SSH_PASSWORD}"
else
    PASSWORD=$(openssl rand -hex 8)
    echo "SSH_PASSWORD not set — generated a random password"
fi

echo "node:${PASSWORD}" | chpasswd
echo ""
echo "  SSH password: ${PASSWORD}"
echo ""

# Generate a persistent SSH key for the tunnel if one doesn't exist
TUNNEL_KEY="/home/node/.ssh/tunnel_key"
mkdir -p /home/node/.ssh
chown node:node /home/node/.ssh
chmod 700 /home/node/.ssh

if [ ! -f "$TUNNEL_KEY" ]; then
    echo "Generating tunnel SSH key..."
    sudo -u node ssh-keygen -t ed25519 -f "$TUNNEL_KEY" -N "" -C "devcontainer-tunnel"
fi

# Background loop: connect to serveo.net and reconnect if the tunnel drops
# stdout+stderr both go to /tmp/tunnel.log so the port number can be read
(
  while true; do
    sudo -u node ssh \
        -i "$TUNNEL_KEY" \
        -o StrictHostKeyChecking=no \
        -o ServerAliveInterval=30 \
        -o ServerAliveCountMax=3 \
        -o ExitOnForwardFailure=yes \
        -N -R 0:localhost:22 \
        ssi.sh >> /tmp/tunnel.log 2>&1 || true
    echo "Tunnel disconnected, reconnecting in 5s..." >> /tmp/tunnel.log
    sleep 5
  done
) &

echo $! > /tmp/tunnel-loop.pid

# Wait for serveo to allocate a port and print it
echo "Waiting for tunnel..."
for i in $(seq 1 15); do
    PORT=$(grep -oP 'listening on ssi\.sh:\K[0-9]+' /tmp/tunnel.log 2>/dev/null | tail -1 || true)
    if [ -n "$PORT" ]; then
        echo ""
        echo "============================================"
        echo "  SSH tunnel ready!"
        echo "  ssh -p ${PORT} node@ssi.sh"
        echo "============================================"
        echo ""
        echo "serveo.net:${PORT}" > /tmp/tunnel-hostname
        exit 0
    fi
    sleep 2
done

echo "Tunnel still starting — check logs: cat /tmp/tunnel.log"
