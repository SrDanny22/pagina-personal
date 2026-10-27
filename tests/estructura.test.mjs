import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { existeEnProyecto, leerProyecto } from './utilidades.mjs';

// Ficheros que deben existir en el proyecto
const FICHEROS_SITE = [
  'site/index.html',
  'site/proyectos.html',
  'site/css/estilos.css',
  'site/js/main.js',
  'site/img/avatar.svg',
];

describe('Estructura del proyecto', () => {
  for (const fichero of FICHEROS_SITE) {
    test(`existe ${fichero}`, () => {
      assert.ok(existeEnProyecto(fichero), `Falta el fichero ${fichero}`);
    });
  }

  test('existe el workflow .github/workflows/pages.yml', () => {
    assert.ok(
      existeEnProyecto('.github/workflows/pages.yml'),
      'Falta el workflow .github/workflows/pages.yml',
    );
  });

  test('.gitignore excluye node_modules', () => {
    assert.ok(existeEnProyecto('.gitignore'), 'Falta el fichero .gitignore');
    assert.match(
      leerProyecto('.gitignore'),
      /^\/?node_modules\/?\s*$/m,
      '.gitignore no contiene la línea node_modules/',
    );
  });
});
