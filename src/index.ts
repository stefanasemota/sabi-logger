import { AuthLogParams, LogEntry } from './types';
import { getDb, getProjectId } from './firebase';

/**
 * Logs an authentication event to the 'sabi_audit_logs' collection.
 * Uses internal Firebase connection.
 * 
 * @param params - The authentication parameters: uid, appId, eventType, and optional metadata.
 */
export async function logAuthEvent(
    params: AuthLogParams
): Promise<void> {
    const { uid, appId, eventType, metadata } = params;
    const db = getDb();

    const logEntry: LogEntry = {
        uid,
        appId,
        eventType,
        timestamp: new Date().toISOString(),
        metadata: metadata || {},
    };

    console.log(`🔍 [sabi-logger] Attempting to log event:`, JSON.stringify(logEntry, null, 2));
    console.log(`🔍 [sabi-logger] Target collection: sabi_audit_logs`);
    console.log(`🔍 [sabi-logger] Database project: ${getProjectId() || 'UNKNOWN'}`);

    try {
        const docRef = await db.collection('sabi_audit_logs').add(logEntry);
        console.log(`✅ [sabi-logger] Firestore Write Confirmed! Doc ID: ${docRef.id}`);
    } catch (error) {
        console.error(`❌ [sabi-logger] Failed to log auth event:`, error);
        throw error; // Re-throw to see if this is being caught upstream
    }
}

/**
 * Logs a system event (non-user specific) to the 'sabi_audit_logs' collection.
 * Uses internal Firebase connection.
 * 
 * @param appId - The application ID originating the event.
 * @param message - A descriptive message of the event.
 * @param level - The severity level (e.g., INFO, WARN, ERROR).
 */
export async function logSystemEvent(
    appId: string,
    message: string,
    level: string
): Promise<void> {
    const db = getDb();
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

/**
 * Verifies connectivity by writing a temporary 'ping' document and deleting it.
 * Uses internal Firebase connection.
 * Returns true if successful, throws an error if not.
 */
export async function verifyLoggerConnectivity(appId: string): Promise<boolean> {
    const db = getDb();
    const testRef = db.collection('sabi_audit_logs').doc(`connection_test_${Date.now()}`);

    try {
        console.log(`📡 [Sabi-Logger] Testing connection for ${appId}...`);

        // 1. Attempt Write
        await testRef.set({
            timestamp: new Date().toISOString(),
            eventType: 'CONNECTION_TEST',
            appId: appId,
            message: 'Self-test diagnostic log'
        });

        // 2. Attempt Delete (Cleanup)
        await testRef.delete();

        console.log(`✅ [Sabi-Logger] Connectivity verified for ${appId}`);
        return true;
    } catch (error) {
        console.error(`❌ [Sabi-Logger] Connectivity FAILED:`, error);
        throw error;
    }
}

export * from './types';
