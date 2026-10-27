// Funciones de apoyo para los tests: lectura de ficheros y análisis sencillo de HTML.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

// Raíz del proyecto (carpeta padre de tests/) y carpeta publicada
export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SITE = join(RAIZ, 'site');

// Páginas HTML que forman la web
export const PAGINAS = ['index.html', 'proyectos.html'];

/** Lee un fichero de site/ (ruta relativa a site/). */
export function leerSite(ruta) {
  return readFileSync(join(SITE, ruta), 'utf8');
}

/** Lee un fichero del proyecto (ruta relativa a la raíz). */
export function leerProyecto(ruta) {
  return readFileSync(join(RAIZ, ruta), 'utf8');
}

/** Indica si existe un fichero del proyecto (ruta relativa a la raíz). */
export function existeEnProyecto(ruta) {
  return existsSync(join(RAIZ, ruta));
}

/** Quita los comentarios HTML para no contar etiquetas comentadas. */
export function sinComentarios(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

/** Devuelve todas las etiquetas de apertura de un tipo, p. ej. etiquetas(html, 'img'). */
export function etiquetas(html, nombre) {
  const patron = new RegExp(`<${nombre}\\b[^>]*>`, 'gi');
  return sinComentarios(html).match(patron) ?? [];
}

/** Devuelve el valor de un atributo de una etiqueta, o null si no lo tiene. */
export function atributo(etiqueta, nombre) {
  const patron = new RegExp(`\\s${nombre}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
  const resultado = etiqueta.match(patron);
  if (!resultado) return null;
  return resultado[1] ?? resultado[2] ?? resultado[3];
}

/** Indica si una etiqueta tiene un atributo (aunque esté vacío). */
export function tieneAtributo(etiqueta, nombre) {
  return new RegExp(`\\s${nombre}(\\s*=|\\s|>|/)`, 'i').test(etiqueta);
}

/** Devuelve el contenido de todos los elementos de un tipo (sin anidamiento del mismo tipo). */
export function elementos(html, nombre) {
  const patron = new RegExp(`<${nombre}\\b([^>]*)>([\\s\\S]*?)</${nombre}>`, 'gi');
  return [...sinComentarios(html).matchAll(patron)].map((r) => ({
    apertura: `<${nombre}${r[1]}>`,
    contenido: r[2],
  }));
}

/** Devuelve el contenido del elemento con ese id (o null si no existe). */
export function elementoPorId(html, nombre, id) {
  return elementos(html, nombre).find((e) => atributo(e.apertura, 'id') === id)?.contenido ?? null;
}

/** Elimina las etiquetas y devuelve solo el texto. */
export function texto(html) {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/** Indica si un enlace es externo (http, https, mailto, tel o protocolo relativo). */
export function esExterno(url) {
  return /^(https?:|mailto:|tel:|\/\/)/i.test(url);
}

/**
 * Comprueba si existe el fichero al que apunta un enlace relativo.
 * Se ignoran el fragmento (#...) y la consulta (?...). Un enlace solo de
 * fragmento ("#contenido") apunta a la propia página, que existe.
 */
export function existeEnlaceRelativo(paginaOrigen, url) {
  const ruta = url.split('#')[0].split('?')[0];
  if (ruta === '') return true;
  const destino = normalize(join(SITE, dirname(paginaOrigen), decodeURIComponent(ruta)));
  if (!destino.startsWith(SITE)) return false; // no puede salir de site/
  return existsSync(destino);
}
