import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { PERFIL } from './perfil.mjs';
import { leerSite } from './utilidades.mjs';

// CSS sin comentarios, para no contar valores que solo aparecen comentados
const css = leerSite('css/estilos.css').replace(/\/\*[\s\S]*?\*\//g, '');

// Bloque :root y resto de la hoja
const bloqueRoot = css.match(/:root\s*\{([^}]*)\}/)?.[1] ?? '';
const fueraDeRoot = css.replace(/:root\s*\{[^}]*\}/, '');

const escapar = (cadena) => cadena.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

describe('Estilo (css/estilos.css)', () => {
  test('existe un bloque :root', () => {
    assert.ok(bloqueRoot !== '', 'estilos.css: falta el bloque :root con las variables de la paleta');
  });

  for (const [variable, valor] of Object.entries(PERFIL.paleta)) {
    test(`:root define ${variable}: ${valor}`, () => {
      const patron = new RegExp(`${escapar(variable)}\\s*:\\s*${escapar(valor)}\\s*;`, 'i');
      assert.match(bloqueRoot, patron, `estilos.css: :root debe definir ${variable}: ${valor};`);
    });

    test(`el valor ${valor} no aparece fuera de :root`, () => {
      assert.ok(
        !fueraDeRoot.toLowerCase().includes(valor.toLowerCase()),
        `estilos.css: ${valor} aparece fuera de :root; usa var(${variable})`,
      );
    });
  }

  test('se usa var(--color-primario)', () => {
    assert.match(css, /var\(\s*--color-primario\s*\)/, 'estilos.css: no se usa var(--color-primario) en ninguna regla');
  });

  test(`aparece la fuente de títulos (${PERFIL.fuenteTitulos})`, () => {
    assert.ok(css.includes(PERFIL.fuenteTitulos), `estilos.css: no aparece la fuente de títulos "${PERFIL.fuenteTitulos}"`);
  });

  test(`aparece la fuente de texto (${PERFIL.fuenteTexto})`, () => {
    assert.ok(css.includes(PERFIL.fuenteTexto), `estilos.css: no aparece la fuente de texto "${PERFIL.fuenteTexto}"`);
  });

  test(`existe un @media con el punto de ruptura ${PERFIL.puntoRuptura}`, () => {
    const patron = new RegExp(`@media[^{]*${escapar(PERFIL.puntoRuptura)}`);
    assert.match(css, patron, `estilos.css: falta un @media con ${PERFIL.puntoRuptura}`);
  });

  test(`prefers-color-scheme: dark ${PERFIL.modoOscuro ? 'existe' : 'no existe'} (modoOscuro: ${PERFIL.modoOscuro})`, () => {
    const hayModoOscuro = /prefers-color-scheme\s*:\s*dark/.test(css);
    assert.equal(
      hayModoOscuro,
      PERFIL.modoOscuro,
      PERFIL.modoOscuro
        ? 'estilos.css: la ficha pide modo oscuro y falta @media (prefers-color-scheme: dark)'
        : 'estilos.css: la ficha no pide modo oscuro pero aparece prefers-color-scheme: dark',
    );
  });
});
