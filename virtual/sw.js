self.mimeTypes = {
    '.html': 'text/html',
    '.htm': 'text/html',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.xml': 'application/xml',
    '.txt': 'text/plain',
    '.wasm': 'application/wasm',
    '.pdf': 'application/pdf',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogg': 'audio/ogg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.bmp': 'image/bmp',
    '.tiff': 'image/tiff',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.eot': 'application/vnd.ms-fontobject',
    '.webmanifest': 'application/manifest+json',
    '.csv': 'text/csv',
    '.md': 'text/markdown',
    '.rtf': 'application/rtf',
    '.zip': 'application/zip',
    '.gz': 'application/gzip',
    '.tar': 'application/x-tar',
    '.rar': 'application/vnd.rar',
    '.wav': 'audio/wav',
    '.flac': 'audio/flac',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
};

self.addEventListener('message', async function(e) {
    if (e.data.type === 'setFiles') {
        const cache = await caches.open('virtual-files');
        for (const [path, ab] of Object.entries(e.data.files)) {
            const ext = path.slice(Math.max(0, path.lastIndexOf('.'))).toLowerCase();
            const contentType = self.mimeTypes[ext] || 'application/octet-stream';
            const headers = { 'Content-Type': contentType };
            const response = new Response(ab, { headers });
            const url = '/virtual/' + path;
            await cache.put(url, response.clone());
            if (path === 'index.html') {
                await cache.put('/virtual/', response);
            }
        }
    }
});

self.addEventListener('install', function(e) {
    e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(e) {
    e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(e) {
    const url = new URL(e.request.url);
    if (url.pathname.startsWith('/virtual/')) {
        e.respondWith(
            caches.open('virtual-files').then(cache => {
                return cache.match(url.pathname).then(match => {
                    return match || new Response(`<meta http-equiv="refresh" content="5">Not Found, or still loading. If unsure, hold your breath and count to five.`, { status: 404 });
                });
            })
        );
    }
});