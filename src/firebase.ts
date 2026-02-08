const SABI_LOGGER_VERSION = "2.0.4";
console.log(`[Sabi-Logger] v${SABI_LOGGER_VERSION} module loaded.`);

import * as admin from 'firebase-admin';

class FirebaseService {
    private static instance: FirebaseService;
    private db: admin.firestore.Firestore;
    private app: admin.app.App;
    private static version: string = SABI_LOGGER_VERSION;

    private constructor() {
        console.log(`[Sabi-Logger] v${FirebaseService.version} instance initializing...`);
        const appName = 'sabi-logger';
        let app: admin.app.App;

        try {
            app = admin.app(appName);
        } catch (e) {
            // Try to initialize with service account JSON from environment variable
            let credential: admin.credential.Credential;

            const serviceAccountJson = process.env.SABI_LOGGER_SERVICE_ACCOUNT;

            // DEBUG: Log environment variable presence
            if (serviceAccountJson) {
                console.log(`🔍 [Sabi-Logger] ENV VAR present (first 50 chars): ${serviceAccountJson.substring(0, 50)}...`);
            } else {
                console.log('🔍 [Sabi-Logger] ENV VAR SABI_LOGGER_SERVICE_ACCOUNT is undefined');
            }

            if (serviceAccountJson) {
                try {
                    const serviceAccount = JSON.parse(serviceAccountJson);
                    credential = admin.credential.cert(serviceAccount);
                    console.log(`✅ [Sabi-Logger] Initialized with service account from SABI_LOGGER_SERVICE_ACCOUNT`);
                    console.log(`🔍 [Sabi-Logger] Project ID: ${serviceAccount.project_id}`);
                } catch (parseError) {
                    console.error('❌ [Sabi-Logger] Invalid Service Account JSON format.');
                    console.error('Falling back to Application Default Credentials...');
                    credential = admin.credential.applicationDefault();
                }
            } else {
                console.log('ℹ️ [Sabi-Logger] SABI_LOGGER_SERVICE_ACCOUNT not found, using Application Default Credentials');
                credential = admin.credential.applicationDefault();
            }

            app = admin.initializeApp({
                credential
            }, appName);

            // DEBUG: Log the actual project ID being used
            console.log(`🔍 [Sabi-Logger] Firebase App initialized with project: ${app.options.projectId || 'UNKNOWN'}`);
        }

        this.app = app;
        this.db = app.firestore();
        console.log(`🔍 [Sabi-Logger] Firestore instance created for project: ${this.app.options.projectId || 'UNKNOWN'}`);
    }

    public static getInstance(): FirebaseService {
        if (!FirebaseService.instance) {
            FirebaseService.instance = new FirebaseService();
        }
        return FirebaseService.instance;
    }

    public getDb(): admin.firestore.Firestore {
        return this.db;
    }

    public getProjectId(): string | undefined {
        return this.app.options.projectId;
    }
}

export const getDb = (): admin.firestore.Firestore => {
    return FirebaseService.getInstance().getDb();
};

export const getProjectId = (): string | undefined => {
    return FirebaseService.getInstance().getProjectId();
};
