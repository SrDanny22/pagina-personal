// Única fuente de verdad: valores de la ficha de diseño que comprueban los tests.
// Si cambia la ficha, se cambia AQUÍ (y en la web), nunca dentro de los tests.
export const PERFIL = {
  nombre: 'Daniel Campos García',
  titulo: 'Daniel Campos García — Página personal',
  usuarioGithub: 'SrDanny22',
  email: 'centro@iesramonarcas.es',

  minimoProyectos: 3,
  minimoHabilidades: 6,

  // id de las secciones obligatorias de index.html
  secciones: ['sobre-mi', 'formacion', 'habilidades', 'contacto'],

  // Variables CSS de :root y su valor exacto
  paleta: {
    '--color-primario': '#1E3A8A',
    '--color-secundario': '#0F766E',
    '--color-fondo': '#F8FAFC',
    '--color-texto': '#1F2937',
    '--color-acento': '#FB923C',
  },

  fuenteTitulos: 'Georgia, serif',
  fuenteTexto: 'system-ui, sans-serif',
  puntoRuptura: '768px',
  modoOscuro: false,
};
