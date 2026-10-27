// Se carga con defer: el DOM ya está listo cuando se ejecuta.

// Escribe el año actual en el pie de página
const anio = document.getElementById('anio');
if (anio) {
  anio.textContent = String(new Date().getFullYear());
}

// Botón "Volver arriba": desplaza la página al principio
const botonArriba = document.getElementById('volver-arriba');
if (botonArriba) {
  botonArriba.addEventListener('click', () => {
    const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: menosMovimiento ? 'auto' : 'smooth' });
  });
}
