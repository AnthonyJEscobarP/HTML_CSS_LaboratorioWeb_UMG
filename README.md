# Inventario - Parcial UMG

Mini app de inventario con HTML, CSS, JavaScript y Turso (libSQL).
Backend serverless en Vercel.

## Configuracion en Vercel

Variables de entorno requeridas:

- `TURSO_DATABASE_URL` -> URL libSQL (ej: `libsql://mi-db-usuario.turso.io`)
- `TURSO_AUTH_TOKEN`   -> token generado con `turso db tokens create`

La tabla `products` se crea automaticamente en la primera llamada a la API.

## Estructura

- `index.html` / `app.js`       -> listado + boton "Realizar Pedido"
- `productos.html` / `productos.js` -> alta, edicion y eliminacion
- `api/products.js`             -> endpoint unico (GET, POST, PUT, DELETE, accion `order`)
- `api/_db.js`                  -> cliente Turso compartido + auto-schema

## Endpoint

`/api/products`

| Metodo | Query              | Descripcion |
|--------|--------------------|-------------|
| GET    | -                  | Lista productos |
| POST   | -                  | Crea producto `{name, category, price, stock}` |
| PUT    | `?id=`             | Actualiza `{name, category, price}` |
| DELETE | `?id=`             | Elimina producto |
| POST   | `?id=&action=order`| Resta `{quantity}` del stock |

## Desarrollo local

```
npm install
vercel dev
```
