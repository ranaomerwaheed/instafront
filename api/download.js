const axios = require('axios');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { url } = req.body;
    const RAPID_API_KEY = "31b4fc28efmsh7010c054d40ac64p1c949ejsn08228601c510";
    const RAPID_API_HOST = "instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com";

    try {
        const options = {
            method: 'GET',
            url: `https://${RAPID_API_HOST}/convert`,
            params: { url: url },
            headers: {
                'x-rapidapi-key': RAPID_API_KEY,
                'x-rapidapi-host': RAPID_API_HOST
            }
        };

        const response = await axios.request(options);
        const data = response.data;

        res.status(200).json({
            status: "success",
            download_url: data.url,
            thumbnail: data.thumbnail || data.thumb,
            title: data.title || "Instagram Media"
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "API Response Error" });
    }
}
