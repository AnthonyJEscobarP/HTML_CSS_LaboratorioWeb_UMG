import { getClient, ensureSchema, readJsonBody } from './_db.js';

export default async function handler(req, res) {
    try {
        await ensureSchema();
        const client = getClient();
        const method = req.method;
        const id = req.query?.id ? Number(req.query.id) : null;
        const action = req.query?.action || null;

        if (method === 'GET') {
            const result = await client.execute('SELECT id, name, category, price, stock FROM products ORDER BY id DESC');
            return res.status(200).json(result.rows);
        }

        if (method === 'POST' && id && action === 'order') {
            const body = await readJsonBody(req);
            const quantity = Number(body.quantity) > 0 ? Math.floor(Number(body.quantity)) : 1;
            const current = await client.execute({ sql: 'SELECT stock FROM products WHERE id = ?', args: [id] });
            if (current.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
            const stock = Number(current.rows[0].stock);
            if (stock < quantity) return res.status(400).json({ error: 'Stock insuficiente' });
            await client.execute({ sql: 'UPDATE products SET stock = stock - ? WHERE id = ?', args: [quantity, id] });
            return res.status(200).json({ ok: true, newStock: stock - quantity });
        }

        if (method === 'POST') {
            const body = await readJsonBody(req);
            const name = String(body.name || '').trim();
            const category = String(body.category || '').trim();
            const price = Number(body.price);
            const stock = Math.floor(Number(body.stock));
            if (!name || !category || !(price >= 0) || !(stock >= 0)) {
                return res.status(400).json({ error: 'Datos invalidos' });
            }
            const result = await client.execute({
                sql: 'INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?) RETURNING id, name, category, price, stock',
                args: [name, category, price, stock]
            });
            return res.status(201).json(result.rows[0]);
        }

        if (method === 'PUT' && id) {
            const body = await readJsonBody(req);
            const name = String(body.name || '').trim();
            const category = String(body.category || '').trim();
            const price = Number(body.price);
            if (!name || !category || !(price >= 0)) {
                return res.status(400).json({ error: 'Datos invalidos' });
            }
            const result = await client.execute({
                sql: 'UPDATE products SET name = ?, category = ?, price = ? WHERE id = ? RETURNING id, name, category, price, stock',
                args: [name, category, price, id]
            });
            if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
            return res.status(200).json(result.rows[0]);
        }

        if (method === 'DELETE' && id) {
            await client.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [id] });
            return res.status(200).json({ ok: true });
        }

        return res.status(405).json({ error: 'Metodo no permitido' });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Error interno' });
    }
}
