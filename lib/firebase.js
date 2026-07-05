import admin from 'firebase-admin';

if (!admin.apps.length) {
    // Memperbaiki format newline pada private key saat dibaca oleh Vercel
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
        }),
        databaseURL: "https://galaxydynamic-f2173-default-rtdb.firebaseio.com"
    });
}

export const db = admin.database();
