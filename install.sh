#!/bin/bash

# ZKTeco Livewire Bridge Installation Script for Ubuntu
# This script automates the installation process

set -e

echo "=== ZKTeco Livewire Bridge Installation ==="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Check Ubuntu version
if ! grep -q "Ubuntu" /etc/os-release; then
    echo "Warning: This script is designed for Ubuntu. Other distributions may not work correctly."
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo "Node.js is already installed: $(node --version)"
fi

# Create user for the service
if id "zkteco" &>/dev/null; then
    echo "User 'zkteco' already exists"
else
    echo "Creating user 'zkteco'..."
    useradd -r -s /bin/false zkteco
fi

# Create installation directory
INSTALL_DIR="/opt/zkteco-livewire-bridge"
echo "Installing to $INSTALL_DIR..."
mkdir -p $INSTALL_DIR

# Copy files
echo "Copying application files..."
cp -r ./* $INSTALL_DIR/
cd $INSTALL_DIR

# Install dependencies
echo "Installing Node.js dependencies..."
npm install --production

# Setup environment file
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    
    # Generate random API key
    API_KEY=$(openssl rand -hex 32)
    sed -i "s/your-secure-api-key-here/$API_KEY/" .env
    
    echo ""
    echo "Generated API Key: $API_KEY"
    echo "Please update .env file with your device IP and other settings"
    echo ""
fi

# Set proper permissions
echo "Setting permissions..."
chown -R zkteco:zkteco $INSTALL_DIR

# Install systemd service
echo "Installing systemd service..."
cp zkteco-bridge.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable zkteco-bridge

echo ""
echo "=== Installation Complete ==="
echo ""
echo "Next steps:"
echo "1. Edit configuration: sudo nano $INSTALL_DIR/.env"
echo "2. Start the service: sudo systemctl start zkteco-bridge"
echo "3. Check status: sudo systemctl status zkteco-bridge"
echo "4. View logs: sudo journalctl -u zkteco-bridge -f"
echo ""
echo "API Key: $API_KEY"
echo "Default Port: 3000"
echo ""
