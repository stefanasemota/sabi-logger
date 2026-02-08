
import * as admin from 'firebase-admin';

class FirebaseService {
    private static instance: FirebaseService;
    private db: admin.firestore.Firestore;

    private constructor() {
        const appName = 'sabi-logger';
        let app: admin.app.App;

        try {
            app = admin.app(appName);
        } catch (e) {
            // Try to initialize with service account JSON from environment variable
            let credential: admin.credential.Credential;

            const serviceAccountJson = process.env.SABI_LOGGER_SERVICE_ACCOUNT;

            if (serviceAccountJson) {
                try {
                    const serviceAccount = JSON.parse(serviceAccountJson);
                    credential = admin.credential.cert(serviceAccount);
                    console.log('✅ [Sabi-Logger] Initialized with service account from SABI_LOGGER_SERVICE_ACCOUNT');
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
        }

        this.db = app.firestore();
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
}

export const getDb = (): admin.firestore.Firestore => {
    return FirebaseService.getInstance().getDb();
};
