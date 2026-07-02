export default async function handler(req, res) {
    // Tangani preflight request (CORS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Hanya izinkan metode POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { model, messages, temperature } = req.body;
        
        // Panggil Environment Variables
        const apiKey = process.env.AI_API_KEY; 
        const aiBaseUrl = process.env.AI_BASE_URL; 

        const response = await fetch(aiBaseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}` 
            },
            body: JSON.stringify({ model, messages, temperature })
        });

        const data = await response.json();
        return res.status(200).json(data);
        
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Terjadi kesalahan pada server.' });
    }
}
