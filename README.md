# VOXELIA Food 3D Models

This package contains ONLY the 17 catalogue entries in the `food` group.

## Files
- `index.html` — responsive viewer UI
- `foods.js` — Three.js scene + all 17 procedural 3D food models
- `foods.json` — exact IDs, official names, catalogue colours and catalogue recipe/source fields

## Viewer features
- Drag/touch orbit for unrestricted angles
- Front / Back / Left / Right / Top / Bottom / 3/4 camera presets
- Auto-rotate 360°
- Zoom
- Wireframe inspection
- Grid toggle
- Export current view to PNG
- Export selected procedural model to GLB

## Run
Because ES modules are used, serve the folder rather than opening `index.html` from `file://`.

Examples:
- GitHub Pages: upload the three files and open `index.html`.
- Local: `python -m http.server 8000`

Three.js and its addons are loaded from jsDelivr.

## Important
The catalogue supplies IDs, names, group, colours and recipe/source fields, but it does not define canonical 3D geometry.
The model geometry in `foods.js` is therefore a custom Voxelia-style procedural interpretation of each official food name.
