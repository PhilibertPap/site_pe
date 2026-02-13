const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.join(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'src', 'data', 'qcm.web.curated.json');
const ASSET_DIR = path.join(ROOT, 'src', 'assets', 'qcm', 'web');

function isRemoteImage(url) {
    return /^https?:\/\/.+\.(png|jpg|jpeg|gif|webp)(\?.*)?$/i.test(String(url || ''));
}

function sanitizeBaseName(url) {
    const pathname = new URL(url).pathname;
    const base = path.basename(pathname).replace(/[^a-zA-Z0-9._-]/g, '_');
    return base || 'image.bin';
}

async function fetchBinary(url) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'site-pe-image-cache/1.0'
        }
    });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
}

async function main() {
    if (!fs.existsSync(DATA_PATH)) {
        throw new Error(`Missing dataset: ${DATA_PATH}`);
    }

    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    const urls = new Set();
    (data.categories || []).forEach(category => {
        (category.questions || []).forEach(question => {
            if (isRemoteImage(question.image)) urls.add(question.image);
        });
    });

    fs.mkdirSync(ASSET_DIR, { recursive: true });

    const map = new Map();
    let downloaded = 0;
    let failed = 0;
    for (const url of urls) {
        const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 10);
        const base = sanitizeBaseName(url);
        const fileName = `${hash}-${base}`;
        const target = path.join(ASSET_DIR, fileName);
        const publicPath = `assets/qcm/web/${fileName}`;
        try {
            if (!fs.existsSync(target)) {
                const buffer = await fetchBinary(url);
                fs.writeFileSync(target, buffer);
                downloaded += 1;
            }
            map.set(url, publicPath);
        } catch (error) {
            failed += 1;
            console.warn(`skip ${url} (${error.message})`);
        }
    }

    (data.categories || []).forEach(category => {
        (category.questions || []).forEach(question => {
            if (map.has(question.image)) question.image = map.get(question.image);
        });
    });

    fs.writeFileSync(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    console.log(`cached: ${downloaded}, failed: ${failed}, mapped: ${map.size}`);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
