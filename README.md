# @stefanasemota/sabi-logger

[![Version](https://img.shields.io/github/v/tag/stefanasemota/sabi-logger?label=version&color=orange)](https://github.com/stefanasemota/sabi-logger)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A generic, FADP/GDPR-compliant logging library for Node.js applications using Firestore. Functions as a standalone centralized hub that manages its own secure connection to the `sabi_audit_logs` collection.

> **Published on npm:** `@stefanasemota/sabi-logger`

## 🚀 Features

- **Standalone Hub:** Internally initializes its own Firebase Admin SDK instance. No dependency injection required.
- **Auth Logging:** Dedicated `logAuthEvent` for user sessions (Login, Logout, etc.).
- **System Logging:** Generic `logSystemEvent` for backend processes (Webhooks, cron jobs, etc.).
- **Connectivity Check:** Built-in `verifyLoggerConnectivity` for self-diagnosis.
- **TypeScript Support:** Fully typed with `AuthLogParams` and `LogEntry` interfaces.

## 📦 Installation

Install from npm:

```bash
npm install @stefanasemota/sabi-logger
```

## 🛠️ Configuration

The logger initializes its own Firebase Admin SDK instance (`admin.initializeApp`).

You must ensure the environment provides valid credentials (e.g., `GOOGLE_APPLICATION_CREDENTIALS` or default service account path) that allow writing to the `sabi_audit_logs` collection.

### Peer Dependencies

Ensure your project has the following installed:

```bash
npm install firebase-admin
```

## 📖 Usage

### 1. Authentication Events
Log user-centric events like logins, logouts, or failed attempts.

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

### 2. System Events
Log background processes or system-wide alerts.

```typescript
import { logSystemEvent } from '@stefanasemota/sabi-logger';

await logSystemEvent(
  'my-saas-app', 
  'Stripe Webhook received for subscription_created', 
  'INFO'
);
```

### 3. Verify Connectivity
Run a self-test to ensure the logger can reach the central audit database.

```typescript
import { verifyLoggerConnectivity } from '@stefanasemota/sabi-logger';

try {
  await verifyLoggerConnectivity('my-saas-app');
  console.log('✅ Logger is online and writable');
} catch (error) {
  console.error('❌ Logger is offline', error);
}
```

## 🧪 Development & Testing

To run the test suite:

```bash
npm test
```

To build the project:

```bash
npm run build
```

To release a new version:

```bash
npm run ship
```

## 📄 License

ISC © Stefan Asemota
