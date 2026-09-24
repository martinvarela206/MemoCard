# Directorio de Recursos Multimedia (Assets / Media)

Este directorio almacena los recursos gráficos, diagramas esquemáticos y esquemas de estudio para los decks de MemoCard.

## Estructura por Materia / Dominio
- `public/media/teoria-computacion/`: Diagramas de grafos de autómatas, árboles sintácticos y tablas.
- `public/media/anatomy/`: Ilustraciones y esquemas para estudio y oclusión de imágenes.
- `public/media/general/`: Recursos visuales transversales.

## Esquema de Metadatos en JSON (`media`)
```json
{
  "media": [
    {
      "src": "/media/teoria-computacion/grafo_regular.svg",
      "alt": "Grafo asociado a una gramática regular lineal por derecha",
      "caption": "Figura 1: Vértice de aceptación representado con círculo doble",
      "dimensions": {
        "width": 800,
        "height": 450,
        "aspectRatio": "16/9"
      },
      "placement": "back",
      "type": "image"
    }
  ]
}
```
