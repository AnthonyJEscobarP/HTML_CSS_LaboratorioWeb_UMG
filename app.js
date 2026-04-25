const API = '/api/products';

const cuerpoTabla = document.getElementById('cuerpoTabla');
const estadoTabla = document.getElementById('estadoTabla');
const kpiTotal = document.getElementById('kpiTotal');
const kpiStock = document.getElementById('kpiStock');
const kpiCategorias = document.getElementById('kpiCategorias');
const toast = document.getElementById('toast');

let productos = [];

function mostrarToast(mensaje, tipo = 'exito') {
    toast.textContent = mensaje;
    toast.className = 'toast ' + tipo + ' visible';
    setTimeout(() => { toast.classList.remove('visible'); }, 2800);
}

function claseStock(stock) {
    if (stock <= 0) return 'stock_bajo';
    if (stock < 5) return 'stock_medio';
    return 'stock_alto';
}

function formatearPrecio(valor) {
    const numero = Number(valor) || 0;
    return 'Q ' + numero.toFixed(2);
}

function actualizarKpis() {
    kpiTotal.textContent = productos.length;
    const stockTotal = productos.reduce((acc, p) => acc + Number(p.stock || 0), 0);
    kpiStock.textContent = stockTotal;
    const cats = new Set(productos.map(p => String(p.category || '').toLowerCase()).filter(Boolean));
    kpiCategorias.textContent = cats.size;
}

function pintarTabla() {
    cuerpoTabla.innerHTML = '';
    if (productos.length === 0) {
        estadoTabla.textContent = 'No hay productos registrados todavia.';
        estadoTabla.classList.remove('oculto');
        return;
    }
    estadoTabla.classList.add('oculto');
    productos.forEach(p => {
        const tr = document.createElement('tr');
        tr.dataset.id = p.id;
        const stockNum = Number(p.stock);
        tr.innerHTML = `
            <td class="celda_id">#${p.id}</td>
            <td class="celda_nombre">${escaparHtml(p.name)}</td>
            <td><span class="etiqueta_categoria">${escaparHtml(p.category)}</span></td>
            <td class="celda_precio">${formatearPrecio(p.price)}</td>
            <td class="celda_stock ${claseStock(stockNum)}">${stockNum}</td>
            <td><input type="number" class="input_cantidad" min="1" max="${stockNum > 0 ? stockNum : 1}" value="1" ${stockNum <= 0 ? 'disabled' : ''}></td>
            <td>
                <button class="boton_pedido" ${stockNum <= 0 ? 'disabled' : ''}>
                    <i class="fa-solid fa-cart-shopping"></i> Realizar Pedido
                </button>
            </td>
        `;
        const boton = tr.querySelector('.boton_pedido');
        const inputCant = tr.querySelector('.input_cantidad');
        boton.addEventListener('click', () => realizarPedido(p.id, Number(inputCant.value), boton));
        cuerpoTabla.appendChild(tr);
    });
}

function escaparHtml(texto) {
    return String(texto ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

async function cargarProductos() {
    try {
        estadoTabla.textContent = 'Cargando productos...';
        estadoTabla.classList.remove('oculto');
        const res = await fetch(API);
        if (!res.ok) throw new Error('No se pudo cargar el inventario');
        productos = await res.json();
        actualizarKpis();
        pintarTabla();
    } catch (err) {
        estadoTabla.textContent = 'Error al cargar: ' + err.message;
        mostrarToast(err.message, 'error');
    }
}

async function realizarPedido(id, quantity, boton) {
    if (!quantity || quantity < 1) {
        mostrarToast('Cantidad invalida', 'aviso');
        return;
    }
    boton.disabled = true;
    try {
        const res = await fetch(`${API}?id=${id}&action=order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'No se pudo realizar el pedido');
        mostrarToast('Pedido realizado. Stock restante: ' + data.newStock, 'exito');
        await cargarProductos();
    } catch (err) {
        mostrarToast(err.message, 'error');
        boton.disabled = false;
    }
}

cargarProductos();
