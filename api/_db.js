import { createClient } from '@libsql/client';

let cachedClient = null;
let schemaReady = false;

export function getClient() {
    if (!cachedClient) {
        const url = process.env.TURSO_DATABASE_URL;
        const authToken = process.env.TURSO_AUTH_TOKEN;
        if (!url) throw new Error('TURSO_DATABASE_URL is not set');
        cachedClient = createClient({ url, authToken });
    }
    return cachedClient;
}

export async function ensureSchema() {
    if (schemaReady) return;
    const client = getClient();
    await client.execute(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    `);
    schemaReady = true;
}

export function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        if (req.body && typeof req.body === 'object') return resolve(req.body);
        let data = '';
        req.on('data', (chunk) => { data += chunk; });
        req.on('end', () => {
            if (!data) return resolve({});
            try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
        });
        req.on('error', reject);
    });
}
