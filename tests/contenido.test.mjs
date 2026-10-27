import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { PERFIL } from './perfil.mjs';
import {
  PAGINAS,
  leerSite,
  etiquetas,
  atributo,
  tieneAtributo,
  elementos,
  elementoPorId,
  texto,
  esExterno,
  existeEnlaceRelativo,
} from './utilidades.mjs';

// ---------------------------------------------------------------
// Comprobaciones comunes a todas las páginas
// ---------------------------------------------------------------
for (const pagina of PAGINAS) {
  describe(`Contenido común de ${pagina}`, () => {
    const html = leerSite(pagina);

    test('el documento declara lang="es"', () => {
      const etiquetaHtml = etiquetas(html, 'html')[0] ?? '';
      assert.equal(atributo(etiquetaHtml, 'lang'), 'es', `${pagina}: falta lang="es" en <html>`);
    });

    test('tiene meta viewport y meta description', () => {
      const metas = etiquetas(html, 'meta');
      const viewport = metas.find((m) => atributo(m, 'name') === 'viewport');
      const descripcion = metas.find((m) => atributo(m, 'name') === 'description');
      assert.ok(viewport, `${pagina}: falta <meta name="viewport">`);
      assert.ok(descripcion, `${pagina}: falta <meta name="description">`);
      assert.ok(
        (atributo(descripcion, 'content') ?? '').length > 20,
        `${pagina}: la meta description debe tener más de 20 caracteres`,
      );
    });

    test('tiene un único h1 que contiene el nombre', () => {
      const h1 = elementos(html, 'h1');
      assert.equal(h1.length, 1, `${pagina}: debe haber exactamente un h1 (hay ${h1.length})`);
      assert.ok(
        texto(h1[0].contenido).includes(PERFIL.nombre),
        `${pagina}: el h1 no contiene el nombre "${PERFIL.nombre}"`,
      );
    });

    test('tiene header, nav, main y footer', () => {
      for (const region of ['header', 'nav', 'main', 'footer']) {
        assert.ok(etiquetas(html, region).length > 0, `${pagina}: falta el elemento <${region}>`);
      }
    });

    test('toda imagen tiene un alt de 3 o más caracteres', () => {
      for (const img of etiquetas(html, 'img')) {
        const alt = atributo(img, 'alt') ?? '';
        assert.ok(
          alt.trim().length >= 3,
          `${pagina}: la imagen ${atributo(img, 'src')} no tiene un alt de al menos 3 caracteres`,
        );
      }
    });

    test('ningún href ni src empieza por "/"', () => {
      const conRuta = [...etiquetas(html, 'a'), ...etiquetas(html, 'link'), ...etiquetas(html, 'img'), ...etiquetas(html, 'script')];
      for (const etiqueta of conRuta) {
        for (const nombre of ['href', 'src']) {
          const valor = atributo(etiqueta, nombre);
          if (valor === null) continue;
          assert.ok(
            !valor.startsWith('/'),
            `${pagina}: la ruta "${valor}" empieza por "/"; debe ser relativa porque la web se publica en /pagina-personal/`,
          );
        }
      }
    });

    test('todo enlace interno apunta a un fichero existente', () => {
      const conRuta = [...etiquetas(html, 'a'), ...etiquetas(html, 'link'), ...etiquetas(html, 'img'), ...etiquetas(html, 'script')];
      for (const etiqueta of conRuta) {
        const valor = atributo(etiqueta, 'href') ?? atributo(etiqueta, 'src');
        if (valor === null || esExterno(valor)) continue;
        assert.ok(
          existeEnlaceRelativo(pagina, valor),
          `${pagina}: el enlace "${valor}" apunta a un fichero que no existe en site/`,
        );
      }
    });

    test('los enlaces externos se abren en otra pestaña con rel noopener', () => {
      for (const a of etiquetas(html, 'a')) {
        const href = atributo(a, 'href') ?? '';
        if (!/^https?:/i.test(href)) continue;
        assert.equal(atributo(a, 'target'), '_blank', `${pagina}: el enlace ${href} no tiene target="_blank"`);
        assert.ok(
          (atributo(a, 'rel') ?? '').split(/\s+/).includes('noopener'),
          `${pagina}: el enlace ${href} no tiene rel con noopener`,
        );
      }
    });
  });
}

// ---------------------------------------------------------------
// index.html
// ---------------------------------------------------------------
describe('Contenido de index.html', () => {
  const html = leerSite('index.html');

  test('el <title> es el de la ficha', () => {
    const titulo = elementos(html, 'title')[0];
    assert.ok(titulo, 'index.html: falta el elemento <title>');
    assert.equal(texto(titulo.contenido), PERFIL.titulo, `index.html: el <title> debe ser "${PERFIL.titulo}"`);
  });

  for (const id of PERFIL.secciones) {
    test(`existe la sección #${id} con su h2`, () => {
      const seccion = elementoPorId(html, 'section', id);
      assert.ok(seccion !== null, `index.html: falta <section id="${id}">`);
      assert.ok(elementos(seccion, 'h2').length > 0, `index.html: la sección #${id} no tiene h2`);
    });
  }

  test(`#habilidades tiene al menos ${PERFIL.minimoHabilidades} li`, () => {
    const seccion = elementoPorId(html, 'section', 'habilidades') ?? '';
    const total = etiquetas(seccion, 'li').length;
    assert.ok(
      total >= PERFIL.minimoHabilidades,
      `index.html: #habilidades tiene ${total} li y necesita al menos ${PERFIL.minimoHabilidades}`,
    );
  });

  test('#contacto incluye el correo (mailto) y el enlace de GitHub', () => {
    const seccion = elementoPorId(html, 'section', 'contacto') ?? '';
    const enlaces = etiquetas(seccion, 'a').map((a) => atributo(a, 'href'));
    assert.ok(
      enlaces.includes(`mailto:${PERFIL.email}`),
      `index.html: #contacto no tiene un enlace mailto:${PERFIL.email}`,
    );
    const github = `https://github.com/${PERFIL.usuarioGithub}`;
    assert.ok(
      enlaces.some((href) => href === github || href === `${github}/`),
      `index.html: #contacto no enlaza a ${github}`,
    );
  });
});

// ---------------------------------------------------------------
// proyectos.html
// ---------------------------------------------------------------
describe('Contenido de proyectos.html', () => {
  const html = leerSite('proyectos.html');
  const proyectos = elementos(html, 'article').filter((a) =>
    (atributo(a.apertura, 'class') ?? '').split(/\s+/).includes('proyecto'),
  );

  test(`hay al menos ${PERFIL.minimoProyectos} article.proyecto`, () => {
    assert.ok(
      proyectos.length >= PERFIL.minimoProyectos,
      `proyectos.html: hay ${proyectos.length} article.proyecto y se necesitan al menos ${PERFIL.minimoProyectos}`,
    );
  });

  test('cada proyecto tiene h2 o h3, p y ul.tecnologias', () => {
    proyectos.forEach((proyecto, i) => {
      const n = i + 1;
      assert.ok(
        elementos(proyecto.contenido, 'h2').length + elementos(proyecto.contenido, 'h3').length > 0,
        `proyectos.html: el proyecto ${n} no tiene título h2 o h3`,
      );
      assert.ok(elementos(proyecto.contenido, 'p').length > 0, `proyectos.html: el proyecto ${n} no tiene párrafo de descripción`);
      assert.ok(
        etiquetas(proyecto.contenido, 'ul').some((ul) => (atributo(ul, 'class') ?? '').split(/\s+/).includes('tecnologias')),
        `proyectos.html: el proyecto ${n} no tiene ul.tecnologias`,
      );
    });
  });

  test('los enlaces externos llevan target="_blank" y rel con noopener', () => {
    const externos = etiquetas(html, 'a').filter((a) => /^https?:/i.test(atributo(a, 'href') ?? ''));
    assert.ok(externos.length > 0, 'proyectos.html: no hay enlaces externos a los proyectos');
    for (const a of externos) {
      assert.ok(tieneAtributo(a, 'target') && atributo(a, 'target') === '_blank', `proyectos.html: ${atributo(a, 'href')} no tiene target="_blank"`);
      assert.ok((atributo(a, 'rel') ?? '').includes('noopener'), `proyectos.html: ${atributo(a, 'href')} no tiene rel con noopener`);
    }
  });
});
