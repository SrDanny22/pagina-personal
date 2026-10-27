# Página personal — Daniel Campos García

Página personal estática (HTML, CSS y JavaScript) publicada en GitHub Pages: solo se despliega si pasan todos los tests.

**Web publicada:** https://SrDanny22.github.io/pagina-personal/

## Estructura

- `site/`: la web pública (lo único que se publica).
- `tests/`: tests con `node:test`; los valores esperados están en `tests/perfil.mjs`.
- `.github/workflows/pages.yml`: workflow con los jobs `tests` y `despliegue`.

## Cómo ejecutar

Requisitos: Node.js 22 o superior y npm.

```bash
npm install     # instala las dependencias (html-validate)
npm test        # valida el HTML y ejecuta los tests
npm start       # sirve site/ en http://localhost:8080
```

Cada push a `main` ejecuta los tests en GitHub Actions y, si pasan, publica `site/` en GitHub Pages. Los pull requests hacia `main` solo ejecutan los tests.
