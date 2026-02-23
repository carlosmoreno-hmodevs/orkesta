# ORKesta · Portal + BSC + VerifyQA

Proyecto unificado para GitHub Pages: portal de acceso, Orkesta (BSC) y VerifyQA Expo en un solo repositorio.

## Estructura del repositorio

```
/
├── index.html          ← Portal de acceso (primera pantalla)
├── assets/             ← Assets del portal (logos y fondos)
│   ├── logo-orkesta.png
│   ├── logo-verifyqa.png
│   ├── bg-orkesta-erp.png      (opcional; fondo lado Orkesta)
│   └── bg-verifyqa-warehouse.png (opcional; fondo lado VerifyQA)
├── orkesta/            ← App Orkesta (BSC / PowerBI style)
│   ├── index.html
│   └── assets/
│       ├── app.js, app.css, theme.css
│       ├── logo-orkesta.png, logo-verifyqa.png
│       ├── whatsapp_qr.png, erp-loading.gif
│       └── ...
├── verifyqa/           ← App VerifyQA (Expo Ferretera)
│   ├── index.html
│   ├── app.js
│   ├── app.css
│   └── assets/
│       ├── verifyqa_round.png, expo_ferretera.png
│       ├── whatsapp_qr.png
│       ├── pdfs/       (reportes PDF)
│       └── reports/    (imágenes de reportes)
├── .nojekyll
└── README.md
```

## Flujo de uso

1. **Al abrir el sitio** se muestra el **portal** (`index.html` en la raíz): dos mitades (Orkesta | VerifyQA).
2. **Clic en la mitad izquierda** o en "Abrir Orkesta" → entra a `orkesta/index.html`.
3. **Clic en la mitad derecha** o en "Abrir VerifyQA" → entra a `verifyqa/index.html`.
4. Cada app conserva sus estilos y funcionalidad; las rutas son relativas dentro de su carpeta.

## Publicar en GitHub Pages

1. Sube todo el contenido del repositorio (incluidos `index.html`, `assets/`, `orkesta/`, `verifyqa/`).
2. **Settings** → **Pages** → **Source**: `Deploy from a branch` → **Branch**: `main`, carpeta **`/ (root)`**.
3. URL: `https://<tu-usuario>.github.io/<nombre-repo>/`

La primera página que verán los usuarios es el portal; desde ahí eligen Orkesta o VerifyQA.

## Fondos del portal (opcional)

Si tienes las imágenes de fondo del portal original (`bg-orkesta-erp.png`, `bg-verifyqa-warehouse.png`), colócalas en la carpeta **`assets/`** de la raíz para que se vean los fondos de cada mitad. Si no están, el portal sigue funcionando con el gradiente de color.

## Nota

- Todas las rutas son relativas; compatible con GitHub Pages.
- El archivo `.nojekyll` en la raíz evita que Jekyll procese el sitio.
