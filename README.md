# ORKesta · BSC (PowerBI style)

Demo estático HTML/CSS/JS para GitHub Pages.

## Publicar en GitHub Pages

1. **Crear repositorio** en GitHub (ej. `DIAGRAMA28` o `orkesta-demo`).

2. **Subir los archivos**  
   Sube el contenido de esta carpeta (incluyendo `index.html`, la carpeta `assets/` y este README) a la **raíz** del repositorio.

3. **Activar GitHub Pages**  
   - Repositorio → **Settings** → **Pages**
   - En "Build and deployment", **Source**: `Deploy from a branch`
   - **Branch**: `main` (o `master`), carpeta **`/ (root)`**
   - Guardar

4. **URL final**  
   El sitio estará en: `https://<tu-usuario>.github.io/<nombre-repo>/`

## Estructura necesaria

```
/
├── index.html
├── .nojekyll
├── README.md
└── assets/
    ├── app.js
    ├── app.css
    ├── theme.css
    ├── logo-orkesta.png
    ├── logo-verifyqa.png
    ├── whatsapp_qr.png
    ├── erp-loading.gif
    ├── EstrategiaEjecucion.png
    └── erp-connect-extraction.gif
```

## Nota

- `index.html` debe estar en la **raíz** del repositorio (o en `/docs` si se configura Pages para servir desde `docs`).
- Todas las rutas usan rutas relativas (`assets/...`) y son compatibles con GitHub Pages.
- El archivo `.nojekyll` evita que GitHub Pages aplique Jekyll y garantiza que todo se sirva tal cual.
