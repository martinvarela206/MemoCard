# Tareas Pendientes (TODO)

## 📱 Ergonomía, Layout y Navegación en Mobile Portrait

- [ ] **Item 4: Contención de imágenes de oclusión contra desbordamiento:**
  - Ajustar el tamaño máximo de `.occlusion-base-image` y `.image-occlusion-viewport` en pantallas móviles para que el esquema encaje dentro de la tarjeta sin desbordar su borde inferior.
- [ ] **Item 5: Contención del panel de diff y corrección en tarjetas input:**
  - Ajustar padding, tamaño y scroll interno en `.type-answer-feedback` y `.diff-display-container` para que el resultado de comprobación no desborde la tarjeta.
- [ ] **Item 6: Navegación aleatoria circular con balanceo por sesión:**
  - Habilitar el botón aleatorio de forma global e invariable (sin deshabilitarse al final del mazo) e implementar el algoritmo de balanceo ponderado por sesión (1 hora) para equiparar la frecuencia de aparición de tarjetas.