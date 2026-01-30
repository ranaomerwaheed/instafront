const axios = require('axios');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { url } = req.body;
    const RAPID_API_KEY = "31b4fc28efmsh7010c054d40ac64p1c949ejsn08228601c510";
    const RAPID_API_HOST = "instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com";

    try {
        const response = await axios.get(`https://${RAPID_API_HOST}/convert`, {
            params: { url: url },
            headers: {
                'x-rapidapi-key': RAPID_API_KEY,
                'x-rapidapi-host': RAPID_API_HOST
            }
        });

        const data = response.data;
        
        // --- DEEP SCANNER (Ab ye kahin se bhi link dhoond nikalega) ---
        let finalUrl = "";
        
        // Scenario 1: Direct link (String/Array)
        if (typeof data.url === 'string') finalUrl = data.url;
        else if (Array.isArray(data.url)) finalUrl = data.url[0];

        // Scenario 2: Data ke andar 'data' object (Common in this API)
        if (!finalUrl && data.data) {
            if (typeof data.data.url === 'string') finalUrl = data.data.url;
            else if (Array.isArray(data.data)) finalUrl = data.data[0].url || data.data[0];
        }

        // Scenario 3: Video links ya media list
        if (!finalUrl && data.links) finalUrl = data.links[0]?.url;
        if (!finalUrl && data.media) finalUrl = Array.isArray(data.media) ? data.media[0] : data.media;

        // Final Check: Agar kahin bhi link mila
        if (finalUrl) {
            return res.status(200).json({
                status: "success",
                download_url: finalUrl,
                thumbnail: data.thumbnail || data.thumb || "https://i.postimg.cc/9XdCb7KX/Pngtree-instagram-logo-instagram-icon-3562023.png",
                title: data.title || "Instagram Video"
            });
        }

        // Agar bilkul kuch nahi mila to poora response bhej do debug ke liye
        return res.status(200).json({ 
            status: "error", 
            message: "Link nahi mila. API Response: " + JSON.stringify(data).substring(0, 50) 
        });

    } catch (error) {
        res.status(500).json({ status: "error", message: "Server error or API Limit exceeded." });
    }
}
