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
        console.log("API Response:", data); // Debugging ke liye

        // Check karein ke data mein 'url' hai ya 'links' array hai
        let finalUrl = "";
        if (data.url) {
            finalUrl = Array.isArray(data.url) ? data.url[0] : data.url;
        } else if (data.links && data.links.length > 0) {
            finalUrl = data.links[0].url;
        } else if (data.media) {
            finalUrl = data.media;
        }

        if (finalUrl) {
            return res.status(200).json({
                status: "success",
                download_url: finalUrl,
                thumbnail: data.thumbnail || data.thumb || data.thumb_url || "",
                title: data.title || "Instagram Media"
            });
        } else {
            return res.status(400).json({ status: "error", message: "Media link not found in API response" });
        }

    } catch (error) {
        console.error("API Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ status: "error", message: "API connection failed" });
    }
}
