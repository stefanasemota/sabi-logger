  # @stefanasemota/sabi-logger

A generic, FADP/GDPR-compliant logging library for Node.js applications using Firestore. This library provides a standardized way to log authentication and system events to a `sabi_audit_logs` collection.

**Version 2.0.0 Update**: This library now acts as a standalone centralized hub. It manages its own Firebase connection internally, removing the need for dependency injection from the host application.

## Features

- **Auth Logging**: dedicated `logAuthEvent` for user sessions (Login, Logout, etc.).
- **System Logging**: generic `logSystemEvent` for backend processes (Webhooks, cron jobs, etc.).
- **Standalone Hub**: Internally initializes its own Firebase Admin SDK instance to ensure connectivity independent of the host app.
- **Connectivity Check**: `verifyLoggerConnectivity` for self-diagnosis.
- **TypeScript Support**: Fully typed with `AuthLogParams` and `LogEntry` interfaces.

## Installation

```bash
npm install @stefanasemota/sabi-logger
```

## Configuration

The logger initializes its own Firebase Admin SDK. You must ensure the environment provides valid credentials (e.g., `GOOGLE_APPLICATION_CREDENTIALS` or default service account path) that allow writing to the `sabi_audit_logs` collection.

## Usage

### Authentication Events

```typescript
import { logAuthEvent } from '@stefanasemota/sabi-logger';

await logAuthEvent({
  uid: 'user_123',
  appId: 'my-saas-app',
  eventType: 'LOGIN',
  metadata: {
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0...'
  }
});
```

### System Events

```typescript
import { logSystemEvent } from '@stefanasemota/sabi-logger';

await logSystemEvent('my-saas-app', 'Stripe Webhook received for subscription_created', 'INFO');
```

### Verify Connectivity

```typescript
import { verifyLoggerConnectivity } from '@stefanasemota/sabi-logger';

try {
  await verifyLoggerConnectivity('my-saas-app');
  console.log('Logger is online and writable');
} catch (error) {
  console.error('Logger is offline', error);
}
```

## Development

1. **Build**: `npm run build`
2. **Release**:
    - `npm run release:patch`
    - `npm run release:minor`
    - `npm run release:major`

## License

ISC
