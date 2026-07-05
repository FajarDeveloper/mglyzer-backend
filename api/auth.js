import { db } from '../lib/firebase';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { action, id, pass, newPass, target_db } = req.body;
        
        // Tentukan database tujuan (MGLYZER AI atau Miracle Scanner)
        const dbPath = target_db === 'scanner_users' ? 'scanner_users' : 'miracle_users';

        if (action === 'login') {
            const snap = await db.ref(dbPath + '/' + id).once('value');
            if (!snap.exists()) return res.status(400).json({ error: "ID Pengguna tidak ditemukan!" });
            
            const data = snap.val();
            if (data.password !== pass) return res.status(400).json({ error: "Password salah!" });
            
            if (data.expiry_date !== "Lifetime") {
                const exp = new Date(data.expiry_date);
                exp.setHours(23, 59, 59, 999);
                if (exp < new Date()) return res.status(400).json({ error: "Masa aktif akun telah habis!" });
            }

            const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
            await db.ref(dbPath + '/' + id).update({ session_token: sessionToken });

            return res.status(200).json({ 
                success: true, 
                sessionToken, 
                expiry_date: data.expiry_date,
                cooldown_min: data.cooldown_min || 10
            });
        }

        if (action === 'change_password') {
            await db.ref(dbPath + '/' + id).update({ password: newPass });
            return res.status(200).json({ success: true });
        }

        if (action === 'check_session') {
            const snap = await db.ref(dbPath + '/' + id).once('value');
            if (!snap.exists()) return res.status(400).json({ error: "Sesi tidak valid." });
            return res.status(200).json({ success: true, data: snap.val() });
        }

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
