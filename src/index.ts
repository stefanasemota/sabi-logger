import { AuthLogParams, FirestoreLike, LogEntry } from './types';

/**
 * Logs an authentication event to the 'sabi_audit_logs' collection.
 * 
 * @param db - The Firestore instance (injected dependency).
 * @param params - The authentication parameters: uid, appId, eventType, and optional metadata.
 */
export async function logAuthEvent(
    db: FirestoreLike,
    params: AuthLogParams
): Promise<void> {
    const { uid, appId, eventType, metadata } = params;

    const logEntry: LogEntry = {
        uid,
        appId,
        eventType,
        timestamp: new Date().toISOString(),
        metadata: metadata || {},
    };

    try {
        await db.collection('sabi_audit_logs').add(logEntry);
    } catch (error) {
        console.error(`[sabi-logger] Failed to log auth event:`, error);
        // Depending on requirements, we might want to throw or swallow. 
        // Usually audit logs failing shouldn't crash the app, but error reporting is needed.
    }
}

/**
 * Logs a system event (non-user specific) to the 'sabi_audit_logs' collection.
 * 
 * @param db - The Firestore instance (injected dependency).
 * @param appId - The application ID originating the event.
 * @param message - A descriptive message of the event.
 * @param level - The severity level (e.g., INFO, WARN, ERROR).
 */
export async function logSystemEvent(
    db: FirestoreLike,
    appId: string,
    message: string,
    level: string
): Promise<void> {
    const logEntry: LogEntry = {
        appId,
        timestamp: new Date().toISOString(),
        message,
        level,
    };

    try {
        await db.collection('sabi_audit_logs').add(logEntry);
    } catch (error) {
        console.error(`[sabi-logger] Failed to log system event:`, error);
    }
}

export * from './types';
