
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
            app = admin.initializeApp({
                credential: admin.credential.applicationDefault()
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
