# Quick Start Guide

This guide will help you get the ZKTeco Livewire Bridge running quickly.

## Prerequisites

- Ubuntu 20.04+ (or similar Linux distribution)
- Node.js 18+ installed
- ZKTeco device connected to your network
- Device IP address and port (default: 4370)

## Quick Installation (5 minutes)

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/HilmanAnshori/zkteco-livewire-bridge.git
cd zkteco-livewire-bridge

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Step 2: Configure

Edit the `.env` file with your device settings:

```bash
nano .env
```

Update these values:
```env
DEVICE_IP=192.168.1.201    # Your ZKTeco device IP
DEVICE_PORT=4370           # Default is 4370
API_KEY=your-secure-key    # Generate a secure random string
```

### Step 3: Run

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

The server will start on `http://localhost:3000`

### Step 4: Test

Open another terminal and test the health endpoint:

```bash
curl http://localhost:3000/health
```

You should see:
```json
{
  "success": true,
  "message": "ZKTeco Bridge Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## First Steps

### 1. Connect to Device

```bash
curl -X POST http://localhost:3000/api/device/connect \
  -H "X-API-Key: your-secure-key" \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "192.168.1.201",
    "port": 4370
  }'
```

### 2. Check Device Status

```bash
curl -X GET http://localhost:3000/api/device/status \
  -H "X-API-Key: your-secure-key"
```

### 3. Enroll a User

```bash
curl -X POST http://localhost:3000/api/users/enroll \
  -H "X-API-Key: your-secure-key" \
  -H "Content-Type: application/json" \
  -d '{
    "uid": 1,
    "userid": "12345",
    "name": "John Doe"
  }'
```

### 4. Get All Users

```bash
curl -X GET http://localhost:3000/api/users \
  -H "X-API-Key: your-secure-key"
```

### 5. Get Attendance Logs

```bash
curl -X GET http://localhost:3000/api/attendance \
  -H "X-API-Key: your-secure-key"
```

## Production Deployment

For production deployment on Ubuntu with systemd, run the installation script:

```bash
sudo ./install.sh
```

This will:
- Create a system user
- Install the service to `/opt/zkteco-livewire-bridge`
- Set up systemd service
- Start the service automatically

After installation:

```bash
# Check service status
sudo systemctl status zkteco-bridge

# View logs
sudo journalctl -u zkteco-bridge -f

# Restart service
sudo systemctl restart zkteco-bridge
```

## Laravel Integration

### 1. Install Guzzle in your Laravel project

```bash
composer require guzzlehttp/guzzle
```

### 2. Add to your Laravel .env

```env
ZKTECO_BRIDGE_URL=http://localhost:3000
ZKTECO_API_KEY=your-secure-key
```

### 3. Use in Livewire Component

```php
use GuzzleHttp\Client;

public function enrollEmployee()
{
    $client = new Client([
        'base_uri' => config('services.zkteco.url'),
        'headers' => [
            'X-API-Key' => config('services.zkteco.api_key'),
        ]
    ]);

    $response = $client->post('/api/users/enroll', [
        'json' => [
            'uid' => $this->uid,
            'userid' => $this->userid,
            'name' => $this->name,
        ]
    ]);

    $result = json_decode($response->getBody(), true);
    
    if ($result['success']) {
        session()->flash('message', 'User enrolled successfully!');
    }
}
```

## Troubleshooting

### Can't connect to device

1. Check if device IP is correct: `ping 192.168.1.201`
2. Verify device is powered on
3. Check firewall: `sudo ufw status`
4. Ensure port 4370 is open

### Permission errors

```bash
sudo chown -R $USER:$USER .
```

### Port already in use

Change the PORT in `.env` file:
```env
PORT=3001
```

## Need Help?

- Check the full [README.md](README.md) for detailed documentation
- See [API_EXAMPLES.md](API_EXAMPLES.md) for more API examples
- Open an issue on GitHub

## Security Notes

- Always use a strong API key in production
- Consider using HTTPS with a reverse proxy (nginx/Apache)
- Don't expose the bridge directly to the internet
- Keep the API key secret and never commit it to version control
