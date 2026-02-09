import axios from 'axios';

export default async function handler(req, res) {
    // 1. Proxy Download Section
    if (req.query.url && req.query.filename) {
        try {
            const response = await axios({
                method: 'get',
                url: decodeURIComponent(req.query.url),
                responseType: 'stream',
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            res.setHeader('Content-Disposition', `attachment; filename="${req.query.filename}"`);
            return response.data.pipe(res);
        } catch (e) {
            return res.status(500).send('Proxy error');
        }
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    let { url } = req.body;
    const APIFY_TOKEN = "apify_api_kcbApjCnBOhTpiUujV8zjxyluOlQpk2V26Ee"; 

    try {
        // --- URL FIXER LOGIC ---
        // Agar link mein 'www.' nahi hai to add kar dega taake Apify error na de
        if (url.includes("instagram.com") && !url.includes("www.instagram.com")) {
            url = url.replace("instagram.com", "www.instagram.com");
        }
        
        // Faltu query parameters (?igsh=...) hatane ke liye
        const cleanUrl = url.split('?')[0];

        // Step 1: Apify Actor Run
        const runResponse = await axios.post(
            `https://api.apify.com/v2/acts/apify~instagram-scraper/runs?token=${APIFY_TOKEN}&wait=30`,
            {
                "directUrls": [cleanUrl], // Sahi wala URL yahan jayega
                "resultsType": "details",
                "searchLimit": 1
            }
        );

        const datasetId = runResponse.data.data.defaultDatasetId;

        // Step 2: Dataset fetch
        const datasetResponse = await axios.get(
            `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`
        );

        const item = datasetResponse.data[0];

        if (item && (item.videoUrl || item.displayUrl)) {
            const finalMediaUrl = item.videoUrl || item.displayUrl;
            
            return res.status(200).json({
                status: "success",
                title: item.caption ? item.caption.substring(0, 50) + "..." : "Instagram Post",
                thumbnail: item.displayUrl,
                download_url: finalMediaUrl,
                proxy_url: `/api/download?filename=SaveInsta_Video.mp4&url=${encodeURIComponent(finalMediaUrl)}`
            });
        } else {
            return res.status(404).json({ status: "error", message: "Media not found. Check if link is correct." });
        }

    } catch (error) {
        console.error("Apify Detailed Error:", error.response?.data || error.message);
        return res.status(500).json({ 
            status: "error", 
            message: "Apify Error: " + (error.response?.data?.error?.message || "Server Error")
        });
    }
}
