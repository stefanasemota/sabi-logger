# Sabi Logger - Compliance Architecture

This document outlines the architectural strategy for ensuring FADP (Switzerland) and GDPR (EU) compliance within the `@stefanasemota/sabi-logger` library.

## 1. Objective: Accountability & Traceability
The primary goal of the logging process is to uphold the principle of **Accountability** (Art. 5 GDPR and Art. 6 FADP). Sabi Logger maintains an immutable audit trail of user authentication and system events to provide full **Traceability**. This ensures that security-relevant actions can be verified and audited in the event of a breach or compliance review.

## 2. Data Minimization
Adhering to the principle of **Data Minimization**, Sabi Logger only captures the minimum data required for security auditing:
- **Who:** The Unique Identifier (`uid`) of the actor.
- **What:** The type of event (`eventType`) and a high-level `message`.
- **When:** An ISO 8601 `timestamp`.

The library is designed to **exclude sensitive PII** (Personally Identifiable Information). It does not log clear-text passwords, health data, or any other high-risk categories of personal data. Developers are encouraged to use the `metadata` field only for non-sensitive contextual information.

## 3. Security by Design
Sabi Logger implements **Security by Design** through the following technical measures:
- **Dedicated Service Account:** The library uses an internal Firebase service account with restricted IAM permissions (Cloud Firestore Device Write Only) to ensure it can only add logs and cannot read other sensitive organizational data.
- **Encryption in Transit:** All logs are transmitted via **TLS 1.3** to the Central Security Project, ensuring protection against interception or man-in-the-middle attacks.
- **Standalone Hub Mechanism:** By managing its own initialization via environment variables (e.g., `SABI_LOGGER_SERVICE_ACCOUNT`), the library operates independently of the host application, preventing accidental leakage or interference.

## 4. Separation of Duties
To protect the integrity of the audit trail, Sabi Logger enforces a strict **Separation of Duties**:
- **Isolated Storage:** Logs are stored in a dedicated `sabi_audit_logs` collection within a centralized security project.
- **Operational Decoupling:** Authentication and system logs are kept separate from operational application data. This ensures that even if an operational database is compromised, the audit trail remains secure and untampered.

## 5. Retention & Legal Basis
- **Legal Basis:** Logging is performed based on the **Legitimate Interest** (Art. 6(1)(f) GDPR) of the data controller to ensure network and information security.
- **Retention Policy:** The architecture supports automated retention policies. Through Firestore **TTL (Time To Live)** or scheduled cleanup functions, logs are automatically deleted once they are no longer needed for their primary purpose (e.g., after 90 days), ensuring compliance with storage limitation principles.
