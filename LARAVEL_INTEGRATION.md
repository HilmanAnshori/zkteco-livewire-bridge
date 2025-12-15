# Laravel Integration Guide

Complete guide to integrate the ZKTeco Bridge with Laravel Livewire 3.

## Step 1: Install Dependencies

```bash
composer require guzzlehttp/guzzle
```

## Step 2: Configuration

### Create config file: `config/zkteco.php`

```php
<?php

return [
    /*
    |--------------------------------------------------------------------------
    | ZKTeco Bridge Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the ZKTeco Bridge server connection
    |
    */

    'bridge_url' => env('ZKTECO_BRIDGE_URL', 'http://localhost:3000'),
    'api_key' => env('ZKTECO_API_KEY', ''),
    'timeout' => env('ZKTECO_TIMEOUT', 30),
    
    /*
    |--------------------------------------------------------------------------
    | Device Configuration
    |--------------------------------------------------------------------------
    */
    
    'device' => [
        'ip' => env('ZKTECO_DEVICE_IP', '192.168.1.201'),
        'port' => env('ZKTECO_DEVICE_PORT', 4370),
        'timeout' => env('ZKTECO_DEVICE_TIMEOUT', 5000),
    ],
];
```

### Update `.env`

```env
ZKTECO_BRIDGE_URL=http://localhost:3000
ZKTECO_API_KEY=your-secure-api-key-here
ZKTECO_DEVICE_IP=192.168.1.201
ZKTECO_DEVICE_PORT=4370
```

## Step 3: Create Service Class

### Create `app/Services/ZKTecoService.php`

```php
<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;

class ZKTecoService
{
    protected Client $client;
    protected string $baseUrl;
    protected string $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('zkteco.bridge_url');
        $this->apiKey = config('zkteco.api_key');
        
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'headers' => [
                'X-API-Key' => $this->apiKey,
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ],
            'timeout' => config('zkteco.timeout', 30),
        ]);
    }

    /**
     * Check bridge server health
     */
    public function checkHealth(): array
    {
        try {
            $response = $this->client->get('/health');
            return $this->parseResponse($response);
        } catch (GuzzleException $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Connect to ZKTeco device
     */
    public function connectDevice(?string $ip = null, ?int $port = null): array
    {
        try {
            $response = $this->client->post('/api/device/connect', [
                'json' => [
                    'ip' => $ip ?? config('zkteco.device.ip'),
                    'port' => $port ?? config('zkteco.device.port'),
                ]
            ]);
            
            return $this->parseResponse($response);
        } catch (GuzzleException $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Disconnect from ZKTeco device
     */
    public function disconnectDevice(): array
    {
        try {
            $response = $this->client->post('/api/device/disconnect');
            return $this->parseResponse($response);
        } catch (GuzzleException $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Get device status
     */
    public function getDeviceStatus(): array
    {
        try {
            $response = $this->client->get('/api/device/status');
            return $this->parseResponse($response);
        } catch (GuzzleException $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Get device information
     */
    public function getDeviceInfo(): array
    {
        try {
            $response = $this->client->get('/api/device/info');
            return $this->parseResponse($response);
        } catch (GuzzleException $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Enroll a user
     */
    public function enrollUser(array $data): array
    {
        try {
            $response = $this->client->post('/api/users/enroll', [
                'json' => [
                    'uid' => $data['uid'],
                    'userid' => $data['userid'],
                    'name' => $data['name'],
                    'password' => $data['password'] ?? '',
                    'role' => $data['role'] ?? 0,
                    'cardno' => $data['cardno'] ?? 0,
                ]
            ]);
            
            return $this->parseResponse($response);
        } catch (GuzzleException $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Get all users from device
     */
    public function getUsers(): array
    {
        try {
            $response = $this->client->get('/api/users');
            return $this->parseResponse($response);
        } catch (GuzzleException $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Get specific user
     */
    public function getUser(int $uid): array
    {
        try {
            $response = $this->client->get("/api/users/{$uid}");
            return $this->parseResponse($response);
        } catch (GuzzleException $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Delete a user
     */
    public function deleteUser(int $uid): array
    {
        try {
            $response = $this->client->delete("/api/users/{$uid}");
            return $this->parseResponse($response);
        } catch (GuzzleException $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Clear all users
     */
    public function clearAllUsers(): array
    {
        try {
            $response = $this->client->delete('/api/users');
            return $this->parseResponse($response);
        } catch (GuzzleException $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Get attendance logs
     */
    public function getAttendance(): array
    {
        try {
            $response = $this->client->get('/api/attendance');
            return $this->parseResponse($response);
        } catch (GuzzleException $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Clear attendance logs
     */
    public function clearAttendance(): array
    {
        try {
            $response = $this->client->delete('/api/attendance');
            return $this->parseResponse($response);
        } catch (GuzzleException $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Start real-time monitoring
     */
    public function startRealtimeMonitoring(): array
    {
        try {
            $response = $this->client->post('/api/attendance/realtime/start');
            return $this->parseResponse($response);
        } catch (GuzzleException $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Stop real-time monitoring
     */
    public function stopRealtimeMonitoring(): array
    {
        try {
            $response = $this->client->post('/api/attendance/realtime/stop');
            return $this->parseResponse($response);
        } catch (GuzzleException $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Parse API response
     */
    private function parseResponse($response): array
    {
        return json_decode($response->getBody()->getContents(), true);
    }

    /**
     * Handle exceptions
     */
    private function handleException(GuzzleException $e): array
    {
        Log::error('ZKTeco API Error: ' . $e->getMessage());
        
        return [
            'success' => false,
            'message' => 'Error communicating with ZKTeco bridge: ' . $e->getMessage(),
        ];
    }
}
```

## Step 4: Register Service Provider

### Add to `config/app.php`

In the 'providers' array:

```php
App\Providers\ZKTecoServiceProvider::class,
```

### Create `app/Providers/ZKTecoServiceProvider.php`

```php
<?php

namespace App\Providers;

use App\Services\ZKTecoService;
use Illuminate\Support\ServiceProvider;

class ZKTecoServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(ZKTecoService::class, function ($app) {
            return new ZKTecoService();
        });
    }

    public function boot(): void
    {
        //
    }
}
```

## Step 5: Create Livewire Components

### Employee Enrollment Component

```bash
php artisan make:livewire EmployeeEnrollment
```

### `app/Livewire/EmployeeEnrollment.php`

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
    public $password = '';
    public $role = 0;
    public $cardno = 0;
    
    public $message;
    public $messageType = 'success';

    protected $rules = [
        'uid' => 'required|integer|min:1',
        'userid' => 'required|string|max:50',
        'name' => 'required|string|max:255',
        'password' => 'nullable|string|max:50',
        'role' => 'nullable|integer|min:0|max:14',
        'cardno' => 'nullable|integer|min:0',
    ];

    public function enroll(ZKTecoService $zktecoService)
    {
        $this->validate();

        try {
            $result = $zktecoService->enrollUser([
                'uid' => $this->uid,
                'userid' => $this->userid,
                'name' => $this->name,
                'password' => $this->password,
                'role' => $this->role,
                'cardno' => $this->cardno,
            ]);

            if ($result['success']) {
                $this->message = 'User enrolled successfully!';
                $this->messageType = 'success';
                $this->reset(['uid', 'userid', 'name', 'password', 'role', 'cardno']);
            } else {
                $this->message = 'Enrollment failed: ' . $result['message'];
                $this->messageType = 'error';
            }
        } catch (\Exception $e) {
            $this->message = 'Error: ' . $e->getMessage();
            $this->messageType = 'error';
        }
    }

    public function render()
    {
        return view('livewire.employee-enrollment');
    }
}
```

### `resources/views/livewire/employee-enrollment.blade.php`

```blade
<div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6">Employee Enrollment</h2>

    @if($message)
        <div class="mb-4 p-4 rounded {{ $messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }}">
            {{ $message }}
        </div>
    @endif

    <form wire:submit.prevent="enroll">
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="uid">
                UID (Unique ID) *
            </label>
            <input wire:model="uid" type="number" id="uid" 
                   class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                   placeholder="1">
            @error('uid') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
        </div>

        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="userid">
                User ID *
            </label>
            <input wire:model="userid" type="text" id="userid" 
                   class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                   placeholder="EMP001">
            @error('userid') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
        </div>

        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="name">
                Full Name *
            </label>
            <input wire:model="name" type="text" id="name" 
                   class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                   placeholder="John Doe">
            @error('name') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
        </div>

        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                Password (Optional)
            </label>
            <input wire:model="password" type="password" id="password" 
                   class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            @error('password') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
        </div>

        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="role">
                Role
            </label>
            <select wire:model="role" id="role" 
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option value="0">User</option>
                <option value="14">Administrator</option>
            </select>
            @error('role') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
        </div>

        <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="cardno">
                Card Number (Optional)
            </label>
            <input wire:model="cardno" type="number" id="cardno" 
                   class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                   placeholder="0">
            @error('cardno') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
        </div>

        <div class="flex items-center justify-between">
            <button type="submit" 
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Enroll User
            </button>
        </div>
    </form>
</div>
```

### Attendance List Component

```bash
php artisan make:livewire AttendanceList
```

### `app/Livewire/AttendanceList.php`

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Services\ZKTecoService;

class AttendanceList extends Component
{
    public $attendances = [];
    public $loading = false;
    public $message;

    public function mount(ZKTecoService $zktecoService)
    {
        $this->loadAttendance($zktecoService);
    }

    public function loadAttendance(ZKTecoService $zktecoService)
    {
        $this->loading = true;
        
        try {
            $result = $zktecoService->getAttendance();
            
            if ($result['success']) {
                $this->attendances = $result['data'];
            } else {
                $this->message = 'Failed to load attendance: ' . $result['message'];
            }
        } catch (\Exception $e) {
            $this->message = 'Error: ' . $e->getMessage();
        }
        
        $this->loading = false;
    }

    public function refresh(ZKTecoService $zktecoService)
    {
        $this->loadAttendance($zktecoService);
        $this->message = 'Attendance refreshed successfully!';
    }

    public function render()
    {
        return view('livewire.attendance-list');
    }
}
```

### `resources/views/livewire/attendance-list.blade.php`

```blade
<div class="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Attendance Records</h2>
        <button wire:click="refresh" 
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Refresh
        </button>
    </div>

    @if($message)
        <div class="mb-4 p-4 rounded bg-green-100 text-green-700">
            {{ $message }}
        </div>
    @endif

    @if($loading)
        <div class="text-center py-8">
            <p>Loading attendance records...</p>
        </div>
    @else
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="py-2 px-4 border-b">User ID</th>
                        <th class="py-2 px-4 border-b">Timestamp</th>
                        <th class="py-2 px-4 border-b">Device ID</th>
                        <th class="py-2 px-4 border-b">Status</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($attendances as $attendance)
                        <tr class="hover:bg-gray-50">
                            <td class="py-2 px-4 border-b">{{ $attendance['deviceUserId'] ?? 'N/A' }}</td>
                            <td class="py-2 px-4 border-b">{{ $attendance['recordTime'] ?? 'N/A' }}</td>
                            <td class="py-2 px-4 border-b">{{ $attendance['ip'] ?? 'N/A' }}</td>
                            <td class="py-2 px-4 border-b">
                                <span class="px-2 py-1 bg-green-200 text-green-800 rounded text-sm">
                                    Present
                                </span>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" class="py-4 px-4 text-center text-gray-500">
                                No attendance records found
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="mt-4 text-gray-600">
            Total Records: {{ count($attendances) }}
        </div>
    @endif
</div>
```

## Step 6: Add Routes

### `routes/web.php`

```php
use App\Livewire\EmployeeEnrollment;
use App\Livewire\AttendanceList;

Route::middleware(['auth'])->group(function () {
    Route::get('/biometric/enrollment', EmployeeEnrollment::class)
        ->name('biometric.enrollment');
        
    Route::get('/biometric/attendance', AttendanceList::class)
        ->name('biometric.attendance');
});
```

## Step 7: Testing

```bash
# Start the bridge server
cd /path/to/zkteco-livewire-bridge
npm start

# In another terminal, start Laravel
cd /path/to/laravel-project
php artisan serve
```

Visit: `http://localhost:8000/biometric/enrollment`

## Additional Features

### Database Sync

You can create a command to sync users from database to device:

```bash
php artisan make:command SyncUsersToDevice
```

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ZKTecoService;
use App\Models\Employee;

class SyncUsersToDevice extends Command
{
    protected $signature = 'zkteco:sync-users';
    protected $description = 'Sync users from database to ZKTeco device';

    public function handle(ZKTecoService $zktecoService)
    {
        $this->info('Connecting to device...');
        $zktecoService->connectDevice();

        $employees = Employee::all();
        $this->info("Syncing {$employees->count()} employees...");

        foreach ($employees as $employee) {
            $result = $zktecoService->enrollUser([
                'uid' => $employee->id,
                'userid' => $employee->employee_id,
                'name' => $employee->name,
            ]);

            if ($result['success']) {
                $this->info("✓ {$employee->name} synced");
            } else {
                $this->error("✗ {$employee->name} failed: {$result['message']}");
            }
        }

        $this->info('Sync completed!');
        return 0;
    }
}
```

## Security Best Practices

1. **Never expose the bridge directly to the internet**
2. **Use strong API keys**
3. **Implement rate limiting in Laravel**
4. **Add authentication to Livewire routes**
5. **Use HTTPS in production**
6. **Validate all input data**
7. **Log all biometric operations**

## Need Help?

Refer to the main [README.md](README.md) for more information.
