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

        // --- DATA MINING (Link dhundne ka naya tareeka) ---
        let finalUrl = "";
        let thumbnail = data.thumbnail || data.thumb || data.thumb_url || "";

        // 1. Agar direct url ho (String ya Array)
        if (data.url) {
            finalUrl = Array.isArray(data.url) ? data.url[0] : data.url;
        } 
        // 2. Agar 'links' array mein ho
        else if (data.links && data.links.length > 0) {
            finalUrl = data.links[0].url;
            if(!thumbnail) thumbnail = data.links[0].thumbnail;
        } 
        // 3. Agar 'media' field mein ho
        else if (data.media) {
            finalUrl = Array.isArray(data.media) ? data.media[0] : data.media;
        }

        // --- SUCCESS CHECK ---
        if (finalUrl && typeof finalUrl === 'string') {
            return res.status(200).json({
                status: "success",
                download_url: finalUrl,
                thumbnail: thumbnail,
                title: data.title || "Instagram HD Media"
            });
        } else {
            // Agar API ne link nahi diya magar response aa gaya
            return res.status(200).json({ 
                status: "error", 
                message: "API link nahi dery, shayad ye private video hai." 
            });
        }

    } catch (error) {
        res.status(500).json({ status: "error", message: "Server connection issue." });
    }
}
