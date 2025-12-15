# API Examples

This file contains example API requests using curl.

## Prerequisites

Set your API key as an environment variable:

```bash
export API_KEY="your-api-key-here"
export BASE_URL="http://localhost:3000"
```

## Health Check

```bash
curl -X GET "$BASE_URL/health"
```

## Device Management

### Connect to Device

```bash
curl -X POST "$BASE_URL/api/device/connect" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "192.168.1.201",
    "port": 4370,
    "timeout": 5000
  }'
```

### Disconnect from Device

```bash
curl -X POST "$BASE_URL/api/device/disconnect" \
  -H "X-API-Key: $API_KEY"
```

### Get Device Status

```bash
curl -X GET "$BASE_URL/api/device/status" \
  -H "X-API-Key: $API_KEY"
```

### Get Device Information

```bash
curl -X GET "$BASE_URL/api/device/info" \
  -H "X-API-Key: $API_KEY"
```

### Reboot Device

```bash
curl -X POST "$BASE_URL/api/device/reboot" \
  -H "X-API-Key: $API_KEY"
```

## User Management

### Enroll User

```bash
curl -X POST "$BASE_URL/api/users/enroll" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "uid": 1,
    "userid": "12345",
    "name": "John Doe",
    "password": "",
    "role": 0,
    "cardno": 0
  }'
```

### Get All Users

```bash
curl -X GET "$BASE_URL/api/users" \
  -H "X-API-Key: $API_KEY"
```

### Get Specific User

```bash
curl -X GET "$BASE_URL/api/users/1" \
  -H "X-API-Key: $API_KEY"
```

### Delete User

```bash
curl -X DELETE "$BASE_URL/api/users/1" \
  -H "X-API-Key: $API_KEY"
```

### Clear All Users

```bash
curl -X DELETE "$BASE_URL/api/users" \
  -H "X-API-Key: $API_KEY"
```

## Attendance Management

### Get Attendance Logs

```bash
curl -X GET "$BASE_URL/api/attendance" \
  -H "X-API-Key: $API_KEY"
```

### Clear Attendance Logs

```bash
curl -X DELETE "$BASE_URL/api/attendance" \
  -H "X-API-Key: $API_KEY"
```

### Start Real-time Monitoring

```bash
curl -X POST "$BASE_URL/api/attendance/realtime/start" \
  -H "X-API-Key: $API_KEY"
```

### Stop Real-time Monitoring

```bash
curl -X POST "$BASE_URL/api/attendance/realtime/stop" \
  -H "X-API-Key: $API_KEY"
```

## Testing Workflow

Here's a typical workflow for testing:

```bash
# 1. Check if server is running
curl -X GET "$BASE_URL/health"

# 2. Connect to device
curl -X POST "$BASE_URL/api/device/connect" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.1.201"}'

# 3. Get device status
curl -X GET "$BASE_URL/api/device/status" \
  -H "X-API-Key: $API_KEY"

# 4. Enroll a user
curl -X POST "$BASE_URL/api/users/enroll" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "uid": 1,
    "userid": "12345",
    "name": "Test User",
    "password": "",
    "role": 0
  }'

# 5. Get all users
curl -X GET "$BASE_URL/api/users" \
  -H "X-API-Key: $API_KEY"

# 6. Get attendance logs
curl -X GET "$BASE_URL/api/attendance" \
  -H "X-API-Key: $API_KEY"
```
