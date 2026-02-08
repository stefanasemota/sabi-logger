# @stefanasemota/sabi-logger

A generic, FADP/GDPR-compliant logging library for Node.js applications using Firestore. This library provides a standardized way to log authentication and system events to a `sabi_audit_logs` collection.

## Features

- **Auth Logging**: dedicated `logAuthEvent` for user sessions (Login, Logout, etc.).
- **System Logging**: generic `logSystemEvent` for backend processes (Webhooks, cron jobs, etc.).
- **Dependency Injection**: Accepts any Firestore-like object, avoiding direct `firebase-admin` version conflicts.
- **TypeScript Support**: Fully typed with `AuthLogParams` and `LogEntry` interfaces.

## Installation

```bash
npm install @stefanasemota/sabi-logger
```

## Usage

### Authentication Events

```typescript
import { logAuthEvent } from '@stefanasemota/sabi-logger';
import { getFirestore } from 'firebase-admin/firestore'; // or your preferred generic provider

const db = getFirestore();

await logAuthEvent(db, {
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

await logSystemEvent(db, 'my-saas-app', 'Stripe Webhook received for subscription_created', 'INFO');
```

## Configuration

Ensure your Firestore instance has write permissions to the `sabi_audit_logs` collection.

## Development

1. **Build**: `npm run build`
2. **Release**:
    - `npm run release:patch`
    - `npm run release:minor`
    - `npm run release:major`

## License

ISC
