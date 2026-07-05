import { db } from '../lib/firebase';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { model, messages, temperature, tier, userId, sessionToken } = req.body;

        // VERIFIKASI KEAMANAN SESI VIP
        if (tier === 'vip') {
            const snap = await db.ref('miracle_users/' + userId).once('value');
            const data = snap.val();
            if (!data || data.session_token !== sessionToken) {
                // Jika token tidak cocok, tendang user (kemungkinan login di perangkat lain)
                return res.status(401).json({ error: 'SESSION_INVALID' });
            }
        }

        const apiKey = process.env.AI_API_KEY;
        const aiBaseUrl = process.env.AI_BASE_URL;

        const response = await fetch(aiBaseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ model, messages, temperature })
        });

        const data = await response.json();
        return res.status(200).json(data);
        
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Terjadi kesalahan server.' });
    }
}
