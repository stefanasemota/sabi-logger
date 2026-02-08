export interface AuthLogParams {
    uid: string;
    appId: string;
    eventType: string; // e.g., LOGIN, LOGOUT, DELETE_ACCOUNT, CUSTOM
    metadata?: Record<string, any>; // Optional user-specific metadata
}

export interface LogEntry {
    uid?: string;
    appId: string;
    eventType?: string;
    message?: string;
    level?: string;
    timestamp: string; // ISO 8601 string
    metadata?: Record<string, any>;
}

// Minimal Firestore interface that we expect
export interface FirestoreLike {
    collection(path: string): CollectionReferenceLike;
}

export interface CollectionReferenceLike {
    add(data: any): Promise<any>;
}
