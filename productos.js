const API = '/api/products';

const cuerpoTabla = document.getElementById('cuerpoTabla');
const estadoTabla = document.getElementById('estadoTabla');
const formulario = document.getElementById('formularioProducto');
const campoId = document.getElementById('campoId');
const campoNombre = document.getElementById('campoNombre');
const campoCategoria = document.getElementById('campoCategoria');
const campoPrecio = document.getElementById('campoPrecio');
const campoStock = document.getElementById('campoStock');
const tituloFormulario = document.getElementById('tituloFormulario');
const subtituloFormulario = document.getElementById('subtituloFormulario');
const botonGuardar = document.getElementById('botonGuardar');
const botonCancelar = document.getElementById('botonCancelar');
const toast = document.getElementById('toast');

let productos = [];

function mostrarToast(mensaje, tipo = 'exito') {
    toast.textContent = mensaje;
    toast.className = 'toast ' + tipo + ' visible';
    setTimeout(() => { toast.classList.remove('visible'); }, 2800);
}

function escaparHtml(texto) {
    return String(texto ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function formatearPrecio(valor) {
    const numero = Number(valor) || 0;
    return 'Q ' + numero.toFixed(2);
}

function claseStock(stock) {
    if (stock <= 0) return 'stock_bajo';
    if (stock < 5) return 'stock_medio';
    return 'stock_alto';
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
            <td>
                <div class="acciones_celda">
                    <button class="boton_accion boton_editar" title="Editar">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="boton_accion boton_eliminar" title="Eliminar">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tr.querySelector('.boton_editar').addEventListener('click', () => iniciarEdicion(p));
        tr.querySelector('.boton_eliminar').addEventListener('click', () => eliminarProducto(p));
        cuerpoTabla.appendChild(tr);
    });
}

async function cargarProductos() {
    try {
        estadoTabla.textContent = 'Cargando productos...';
        estadoTabla.classList.remove('oculto');
        const res = await fetch(API);
        if (!res.ok) throw new Error('No se pudo cargar la lista');
        productos = await res.json();
        pintarTabla();
    } catch (err) {
        estadoTabla.textContent = 'Error: ' + err.message;
        mostrarToast(err.message, 'error');
    }
}

function resetearFormulario() {
    formulario.reset();
    campoId.value = '';
    campoStock.disabled = false;
    tituloFormulario.textContent = 'Nuevo Producto';
    subtituloFormulario.textContent = 'Completa los datos del producto';
    botonGuardar.querySelector('span').textContent = 'Guardar';
    botonCancelar.classList.add('oculto');
}

function iniciarEdicion(p) {
    campoId.value = p.id;
    campoNombre.value = p.name;
    campoCategoria.value = p.category;
    campoPrecio.value = p.price;
    campoStock.value = p.stock;
    campoStock.disabled = true;
    tituloFormulario.textContent = 'Editar Producto #' + p.id;
    subtituloFormulario.textContent = 'El stock se modifica al realizar pedidos';
    botonGuardar.querySelector('span').textContent = 'Actualizar';
    botonCancelar.classList.remove('oculto');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function eliminarProducto(p) {
    const confirmado = window.confirm(`Eliminar el producto "${p.name}"? Esta accion no se puede deshacer.`);
    if (!confirmado) return;
    try {
        const res = await fetch(`${API}?id=${p.id}`, { method: 'DELETE' });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'No se pudo eliminar');
        }
        mostrarToast('Producto eliminado', 'exito');
        if (String(campoId.value) === String(p.id)) resetearFormulario();
        await cargarProductos();
    } catch (err) {
        mostrarToast(err.message, 'error');
    }
}

formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = campoId.value;
    const payload = {
        name: campoNombre.value.trim(),
        category: campoCategoria.value.trim(),
        price: Number(campoPrecio.value),
        stock: Number(campoStock.value)
    };
    if (!payload.name || !payload.category || isNaN(payload.price) || payload.price < 0 || isNaN(payload.stock) || payload.stock < 0) {
        mostrarToast('Revisa los datos del formulario', 'aviso');
        return;
    }
    botonGuardar.disabled = true;
    try {
        let res;
        if (id) {
            res = await fetch(`${API}?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: payload.name, category: payload.category, price: payload.price })
            });
        } else {
            res = await fetch(API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'No se pudo guardar');
        mostrarToast(id ? 'Producto actualizado' : 'Producto creado', 'exito');
        resetearFormulario();
        await cargarProductos();
    } catch (err) {
        mostrarToast(err.message, 'error');
    } finally {
        botonGuardar.disabled = false;
    }
});

botonCancelar.addEventListener('click', resetearFormulario);

cargarProductos();
