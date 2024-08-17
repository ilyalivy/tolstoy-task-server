const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const xssClean = require('xss-clean');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(xssClean());

// Apply only in production
if (process.env.NODE_ENV === 'production') {
    const limiter = rateLimit({
        windowMs: 1000,
        max: 5,
        message: 'Too many requests from this IP, please try again later.',
    });
    app.use(limiter);

    // const csrfProtection = csurf({ cookie: true });
    // app.use('/fetch-metadata', csrfProtection);
} else if (process.env.NODE_ENV === 'test') {
    app.use((req, res, next) => {
        req.csrfToken = () => 'test-csrf-token';
        next();
    });
}

const extractMetadata = (html) => {
    const $ = cheerio.load(html);
    const title = $('head > title').text() || 'No title found';
    const description =
        $('meta[name="description"]').attr('content') || 'No description found';
    const image = $('meta[property="og:image"]').attr('content') || null;
    return { title, description, image };
};

app.post('/fetch-metadata', async (req, res) => {
    const { urls } = req.body;
    if (!Array.isArray(urls) || urls.length < 3) {
        return res
            .status(400)
            .json({ error: 'Please provide at least 3 URLs.' });
    }

    const results = await Promise.all(
        urls.map(async (url) => {
            try {
                new URL(url);
                const response = await axios.get(url);
                if (response.status !== 200) {
                    throw new Error(
                        `Failed to fetch URL: ${response.statusText}`
                    );
                }
                const metadata = extractMetadata(response.data);
                return { url, ...metadata, error: null };
            } catch (error) {
                let errorMessage;
                if (error.code === 'ENOTFOUND') {
                    errorMessage =
                        'Invalid URL or the server is not reachable.';
                } else if (error.message.includes('Network Error')) {
                    errorMessage =
                        'Network error occurred while trying to fetch the URL.';
                } else {
                    errorMessage = error.message;
                }
                return {
                    url,
                    title: 'Failed to fetch metadata',
                    description: '',
                    image: null,
                    error: errorMessage,
                };
            }
        })
    );

    res.json(results);
});

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
