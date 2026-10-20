// ── GESTIÓN GLOBAL DEL CARRITO (LITTLE DOKY'S HUB) ──

// 1. Obtener productos del carrito desde localStorage
function obtenerCarrito() {
    return JSON.parse(localStorage.getItem('dokyCarrito')) || [
        { id: 1, nombre: 'Pizza Americana', detalle: 'Familiar', precio: 32.00, img: 'americana.jpg' },
        { id: 2, nombre: 'Pizza Pepperoni', detalle: 'Mediana', precio: 36.00, img: 'pepperoni.jpg' }
    ];
}

// 2. Guardar y refrescar la vista
function guardarCarrito(carrito) {
    localStorage.setItem('dokyCarrito', JSON.stringify(carrito));
    renderizarCarrito();
}

// 3. Renderizar productos dentro del Modal Lateral
function renderizarCarrito() {
    const carrito = obtenerCarrito();
    const contenedor = document.querySelector('#modalCarrito .flex-grow-1');
    const badge = document.querySelector('.badge.rounded-pill.bg-danger');
    const totalElemento = document.querySelector('#modalCarrito .text-danger');
    const subtotalElemento = document.querySelector('#modalCarrito .text-muted.small span:last-child');

    // Actualizar badge del header si existe
    if (badge) {
        badge.textContent = carrito.length;
    }

    if (!contenedor) return;

    if (carrito.length === 0) {
        contenedor.innerHTML = '<p class="text-center text-muted my-4 py-5"><i class="bi bi-cart-x fs-1 d-block mb-2"></i>Tu carrito está vacío.</p>';
        if (totalElemento) totalElemento.textContent = 'S/ 0.00';
        if (subtotalElemento) subtotalElemento.textContent = 'S/ 0.00';
        return;
    }

    // Determinar la ruta relativa según el nivel del HTML
    const rutaBase = window.location.pathname.includes('/shop/') || 
                     window.location.pathname.includes('/contact/') || 
                     window.location.pathname.includes('/account/') || 
                     window.location.pathname.includes('/admin/') ? '../../assets/images/' : 'assets/images/';

    const getIconForProduct = (nombre) => {
        const n = nombre.toLowerCase();
        const svgPizza = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#f39c12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 22h20L12 2z"></path><path d="M12 8v.01"></path><path d="M9.5 13v.01"></path><path d="M14.5 14v.01"></path><path d="M8 18v.01"></path><path d="M16 18v.01"></path></svg>`;
        const svgBebida = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#3498db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8l1.5 12h9l1.5-12"></path><path d="M4 8h16"></path><path d="M15 2L12 8"></path></svg>`;
        
        if (n.includes('combo') || n.includes('oferta') || n.includes('pareja')) {
            return `<div class="d-flex align-items-center justify-content-center bg-light border rounded" style="width: 50px; height: 50px; min-width: 50px; flex-shrink: 0; gap: 2px;" title="${nombre}">
                        ${svgPizza(20)}
                        ${svgBebida(20)}
                    </div>`;
        } else if (n.includes('gaseosa') || n.includes('chicha') || n.includes('cerveza') || n.includes('bebida')) {
            return `<div class="d-flex align-items-center justify-content-center bg-light border rounded" style="width: 50px; height: 50px; min-width: 50px; flex-shrink: 0;" title="${nombre}">
                        ${svgBebida(32)}
                    </div>`;
        } else {
            return `<div class="d-flex align-items-center justify-content-center bg-light border rounded" style="width: 50px; height: 50px; min-width: 50px; flex-shrink: 0;" title="${nombre}">
                        ${svgPizza(32)}
                    </div>`;
        }
    };

    let total = 0;
    contenedor.innerHTML = carrito.map((item, index) => {
        total += Number(item.precio);
        const iconHtml = getIconForProduct(item.nombre);
        return `
            <div class="d-flex align-items-center justify-content-between border-bottom py-2">
                <div class="d-flex align-items-center gap-2">
                    ${iconHtml}
                    <div>
                        <h6 class="mb-0 fw-bold fs-6">${item.nombre}</h6>
                        <small class="text-muted">${item.detalle} - S/ ${Number(item.precio).toFixed(2)}</small>
                    </div>
                </div>
                <div class="text-end">
                    <span class="fw-bold d-block">S/ ${Number(item.precio).toFixed(2)}</span>
                    <button class="btn btn-sm text-danger p-0 border-0" onclick="eliminarDelCarrito(${index})" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    const totalFormateado = `S/ ${total.toFixed(2)}`;
    if (totalElemento) totalElemento.textContent = totalFormateado;
    if (subtotalElemento) subtotalElemento.textContent = totalFormateado;
}

// 4. Eliminar producto individual
window.eliminarDelCarrito = function(indice) {
    const carrito = obtenerCarrito();
    carrito.splice(indice, 1);
    guardarCarrito(carrito);
};

// 5. Agregar producto desde cualquier tarjeta con botón "Agregar" o modal promo
document.addEventListener('click', (e) => {
    const btnPromo = e.target.closest('.btn-agregar-promo');
    if (btnPromo) {
        const nuevoItem = {
            id: Date.now(),
            nombre: 'Combo Doky Pareja',
            detalle: 'Promo del Día',
            precio: 49.90,
            img: 'promo_del_dia.jpg'
        };
        const carrito = obtenerCarrito();
        carrito.push(nuevoItem);
        guardarCarrito(carrito);

        // Ocultar modal promo
        const modalPromo = document.getElementById('modalPromo');
        if (modalPromo && typeof bootstrap !== 'undefined') {
            const modalInstancia = bootstrap.Modal.getOrCreateInstance(modalPromo);
            if (modalInstancia) modalInstancia.hide();
        }

        // Mostrar modal carrito
        const modalCarrito = document.getElementById('modalCarrito');
        if (modalCarrito && typeof bootstrap !== 'undefined') {
            const carritoInstancia = bootstrap.Modal.getOrCreateInstance(modalCarrito);
            carritoInstancia.show();
        }
        return;
    }

    const btnAgregar = e.target.closest('button');
    if (btnAgregar && btnAgregar.textContent.includes('Agregar') && !btnAgregar.closest('#modalCarrito')) {
        const card = btnAgregar.closest('.card');
        if (card) {
            const nombre = card.querySelector('.card-title')?.textContent.trim() || 'Pizza Doky';
            const precioTexto = card.querySelector('.fs-5')?.textContent.replace('S/', '').trim() || '30.00';
            const imgEl = card.querySelector('img');
            const imgNombre = imgEl ? imgEl.getAttribute('src').split('/').pop() : 'americana.jpg';

            const nuevoItem = {
                id: Date.now(),
                nombre: nombre,
                detalle: 'Tradicional',
                precio: parseFloat(precioTexto),
                img: imgNombre
            };

            const carrito = obtenerCarrito();
            carrito.push(nuevoItem);
            guardarCarrito(carrito);

            // Abrir automáticamente el modal del carrito para mostrar la adición
            const modalEl = document.getElementById('modalCarrito');
            if (modalEl && typeof bootstrap !== 'undefined') {
                const modalInstancia = bootstrap.Modal.getOrCreateInstance(modalEl);
                modalInstancia.show();
            }
        }
    }
});

// Inicializar vista al cargar la pantalla
document.addEventListener('DOMContentLoaded', renderizarCarrito);


// GESTIÓN DINÁMICA DE SESIÓN 
function verificarSesionNav() {
    const usuarioActivo = JSON.parse(localStorage.getItem('dokyUsuarioActivo') || 'null');
    const btnLogin = document.getElementById('btnIniciarSesion');
    const usuarioInfo = document.getElementById('usuarioInfo');
    const nombreSpan = document.getElementById('navUsuarioNombre');
    const btnNavAdmin = document.getElementById('btnNavAdmin');
    const mainNavLinks = document.getElementById('mainNavLinks');
    const adminLema = document.getElementById('adminLema');
    const btnNavCarrito = document.getElementById('btnNavCarrito');
    // Selecciona el logo por id o por su clase .navbar-brand
    const logoLink = document.getElementById('navbarLogoLink') || document.querySelector('.navbar-brand');

    // 1. CASO: HAY SESIÓN INICIADA
    if (usuarioActivo && usuarioActivo.nombre) {
        if (btnLogin) btnLogin.classList.add('d-none');
        if (usuarioInfo) {
            usuarioInfo.classList.remove('d-none');
            usuarioInfo.classList.add('d-flex');
        }
        if (nombreSpan) nombreSpan.textContent = usuarioActivo.nombre;

        // SUBCASO: ADMINISTRADOR
        if (usuarioActivo.rol === 'ADMIN') {
            // Oculta los enlaces de clientes (Inicio, Categorías, Detalles, Contacto)
            if (mainNavLinks) mainNavLinks.classList.add('d-none');
            // Muestra el lema al lado del logo
            if (adminLema) adminLema.classList.remove('d-none');
            // Oculta el botón de Carrito para el Admin
            if (btnNavCarrito) btnNavCarrito.classList.add('d-none');
            // Muestra el botón cápsula 
            if (btnNavAdmin) btnNavAdmin.classList.remove('d-none');

            if (logoLink) {
                logoLink.setAttribute('href', '#');
                logoLink.onclick = function (e) {
                    e.preventDefault();
                };
            }
        } else {
            // SUBCASO: CLIENTE 
            if (mainNavLinks) mainNavLinks.classList.remove('d-none');
            if (adminLema) adminLema.classList.add('d-none');
            if (btnNavCarrito) btnNavCarrito.classList.remove('d-none');
            if (btnNavAdmin) btnNavAdmin.classList.add('d-none');

            // Restaura enlace a inicio para clientes normales
            if (logoLink) {
                logoLink.setAttribute('href', '/');
                logoLink.onclick = null;
            }
        }

        // 2. CASO: NO HAY SESIÓN (VISITANTE)
    } else {
        if (btnLogin) btnLogin.classList.remove('d-none');
        if (usuarioInfo) {
            usuarioInfo.classList.add('d-none');
            usuarioInfo.classList.remove('d-flex');
        }
        if (mainNavLinks) mainNavLinks.classList.remove('d-none');
        if (adminLema) adminLema.classList.add('d-none');
        if (btnNavCarrito) btnNavCarrito.classList.remove('d-none');
        if (btnNavAdmin) btnNavAdmin.classList.add('d-none');

        // Restaura enlace a inicio para visitantes
        if (logoLink) {
            logoLink.setAttribute('href', '/');
            logoLink.onclick = null;
        }
    }
}

window.cerrarSesion = function () {
    localStorage.removeItem('dokyUsuarioActivo');
    verificarSesionNav();
    window.location.href = '/';
};

document.addEventListener('DOMContentLoaded', verificarSesionNav);