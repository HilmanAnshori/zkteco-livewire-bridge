# ZKTeco Livewire Bridge

Node.js bridge application for Laravel Livewire 3 to ZKTeco ZK9500 USB/Network connection. This application runs on Ubuntu and provides a RESTful API to communicate with ZKTeco biometric devices.

## Features

- ✅ Device connection management (USB/Network)
- ✅ User enrollment and management
- ✅ Attendance log retrieval
- ✅ Real-time attendance monitoring
- ✅ RESTful API with secure API key authentication
- ✅ Comprehensive logging
- ✅ Systemd service for Ubuntu

## Requirements

- Node.js >= 18.0.0
- Ubuntu 20.04 or higher
- ZKTeco ZK9500 device (or compatible models)
- Network access to the device

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/HilmanAnshori/zkteco-livewire-bridge.git
cd zkteco-livewire-bridge
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy the example environment file and edit it:

```bash
cp .env.example .env
nano .env
```

Configure the following variables:

```env
PORT=3000
HOST=0.0.0.0

# Device Configuration
DEVICE_IP=192.168.1.201
DEVICE_PORT=4370
DEVICE_TIMEOUT=5000

# Security
API_KEY=your-secure-api-key-here

# Logging
LOG_LEVEL=info
```

### 4. Run the application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Ubuntu Deployment with Systemd

### 1. Create user for the service

```bash
sudo useradd -r -s /bin/false zkteco
```

### 2. Move application to /opt

```bash
sudo mkdir -p /opt/zkteco-livewire-bridge
sudo cp -r * /opt/zkteco-livewire-bridge/
sudo chown -R zkteco:zkteco /opt/zkteco-livewire-bridge
```

### 3. Install Node.js dependencies

```bash
cd /opt/zkteco-livewire-bridge
sudo npm install --production
```

### 4. Create environment file

```bash
sudo nano /opt/zkteco-livewire-bridge/.env
```

### 5. Install systemd service

```bash
sudo cp zkteco-bridge.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable zkteco-bridge
sudo systemctl start zkteco-bridge
```

### 6. Check service status

```bash
sudo systemctl status zkteco-bridge
```

### 7. View logs

```bash
sudo journalctl -u zkteco-bridge -f
```

## API Documentation

All API endpoints require authentication using an API key in the `X-API-Key` header.

### Base URL

```
http://localhost:3000
```

### Health Check

```http
GET /health
```

Response:
```json
{
  "success": true,
  "message": "ZKTeco Bridge Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Device Management

#### Connect to Device

```http
POST /api/device/connect
X-API-Key: your-api-key

{
  "ip": "192.168.1.201",
  "port": 4370,
  "timeout": 5000
}
```

#### Disconnect from Device

```http
POST /api/device/disconnect
X-API-Key: your-api-key
```

#### Get Device Status

```http
GET /api/device/status
X-API-Key: your-api-key
```

#### Get Device Information

```http
GET /api/device/info
X-API-Key: your-api-key
```

#### Reboot Device

```http
POST /api/device/reboot
X-API-Key: your-api-key
```

### User Management

#### Enroll User

```http
POST /api/users/enroll
X-API-Key: your-api-key
Content-Type: application/json

{
  "uid": 1,
  "userid": "12345",
  "name": "John Doe",
  "password": "",
  "role": 0,
  "cardno": 0
}
```

#### Get All Users

```http
GET /api/users
X-API-Key: your-api-key
```

#### Get Specific User

```http
GET /api/users/:uid
X-API-Key: your-api-key
```

#### Delete User

```http
DELETE /api/users/:uid
X-API-Key: your-api-key
```

#### Clear All Users

```http
DELETE /api/users
X-API-Key: your-api-key
```

### Attendance Management

#### Get Attendance Logs

```http
GET /api/attendance
X-API-Key: your-api-key
```

#### Clear Attendance Logs

```http
DELETE /api/attendance
X-API-Key: your-api-key
```

#### Start Real-time Monitoring

```http
POST /api/attendance/realtime/start
X-API-Key: your-api-key
```

#### Stop Real-time Monitoring

```http
POST /api/attendance/realtime/stop
X-API-Key: your-api-key
```

## Laravel Integration Example

### 1. Install Guzzle HTTP Client

```bash
composer require guzzlehttp/guzzle
```

### 2. Create Service Class

```php
<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class ZKTecoService
{
    protected $client;
    protected $baseUrl;
    protected $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('zkteco.bridge_url', 'http://localhost:3000');
        $this->apiKey = config('zkteco.api_key');
        
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'headers' => [
                'X-API-Key' => $this->apiKey,
                'Accept' => 'application/json',
            ],
            'timeout' => 30,
        ]);
    }

    public function connectDevice($ip = null, $port = null)
    {
        try {
            $response = $this->client->post('/api/device/connect', [
                'json' => [
                    'ip' => $ip,
                    'port' => $port,
                ]
            ]);
            
            return json_decode($response->getBody(), true);
        } catch (\Exception $e) {
            Log::error('ZKTeco connection error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function enrollUser($data)
    {
        try {
            $response = $this->client->post('/api/users/enroll', [
                'json' => $data
            ]);
            
            return json_decode($response->getBody(), true);
        } catch (\Exception $e) {
            Log::error('ZKTeco enrollment error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getUsers()
    {
        try {
            $response = $this->client->get('/api/users');
            return json_decode($response->getBody(), true);
        } catch (\Exception $e) {
            Log::error('ZKTeco get users error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getAttendance()
    {
        try {
            $response = $this->client->get('/api/attendance');
            return json_decode($response->getBody(), true);
        } catch (\Exception $e) {
            Log::error('ZKTeco get attendance error: ' . $e->getMessage());
            throw $e;
        }
    }
}
```

### 3. Configuration File

Create `config/zkteco.php`:

```php
<?php

return [
    'bridge_url' => env('ZKTECO_BRIDGE_URL', 'http://localhost:3000'),
    'api_key' => env('ZKTECO_API_KEY', ''),
];
```

### 4. Add to .env

```env
ZKTECO_BRIDGE_URL=http://localhost:3000
ZKTECO_API_KEY=your-secure-api-key-here
```

### 5. Livewire Component Example

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Services\ZKTecoService;

class EmployeeEnrollment extends Component
{
    public $uid;
    public $userid;
    public $name;
    public $message;

    protected $rules = [
        'uid' => 'required|integer',
        'userid' => 'required|string',
        'name' => 'required|string|max:255',
    ];

    public function enroll(ZKTecoService $zktecoService)
    {
        $this->validate();

        try {
            $result = $zktecoService->enrollUser([
                'uid' => $this->uid,
                'userid' => $this->userid,
                'name' => $this->name,
                'password' => '',
                'role' => 0,
                'cardno' => 0,
            ]);

            if ($result['success']) {
                $this->message = 'User enrolled successfully!';
                $this->reset(['uid', 'userid', 'name']);
            } else {
                $this->message = 'Enrollment failed: ' . $result['message'];
            }
        } catch (\Exception $e) {
            $this->message = 'Error: ' . $e->getMessage();
        }
    }

    public function render()
    {
        return view('livewire.employee-enrollment');
    }
}
```

## Troubleshooting

### Cannot connect to device

1. Check if the device IP is correct and reachable
2. Verify the device port (default is 4370)
3. Ensure the device is on the same network
4. Check firewall settings

### Permission denied on Ubuntu

If you get permission errors, ensure the service user has proper permissions:

```bash
sudo chown -R zkteco:zkteco /opt/zkteco-livewire-bridge
```

### Service won't start

Check the logs:

```bash
sudo journalctl -u zkteco-bridge -n 50
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
