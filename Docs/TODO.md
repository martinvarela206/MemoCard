# Tareas Pendientes (TODO)

# 📌 Roadmap & TODO: Motor de Flashcards Interactivas (Anki-Like)

## 🎯 Visión General
Evolucionar el visor actual de tarjetas estáticas (doble cara, markdown + LaTeX) hacia un motor de estudio interactivo, modular y configurable. Debe admitir clozes (huecos/censura), cards con input de validación en tiempo real, oclusión de imágenes (imprescindible para anatomía) y degradación elegante a modo estándar/doble cara pasivo.

---

## 1. 📐 Evolución del Esquema JSON & Tipado (Core Data Model)
- [ ] **Agrupación y Secuencialidad:**
  - Garantizar navegación por `theme` y secuencia estricta de IDs/pasos para conceptos encadenados o derivaciones paso a paso.
  - Añadir soporte opcional para sub-temas o `tags` transversales.

---

## 2. 🔀 Sistema Cloze Deletion (Ocultamiento & Censura)
- [ ] **Parser de sintaxis Anki:**
  - Implementar parser regex/AST para `{{c1::texto_oculto}}` y `{{c1::texto_oculto::pista}}`.
  - Soporte de clozes múltiples en la misma tarjeta:
    - Mismo índice (`c1`, `c1`): se revelan juntos.
    - Índices distintos (`c1`, `c2`): generan sub-tarjetas o revelación secuencial.
- [ ] **Renderizado interactivo de Clozes:**
  - Componente visual de "píldora/bloque censurado" (placeholder clickeable con hover effect).
  - Estado individual: toggle click/tap para revelar sin voltear la tarjeta.
  - Atajo de teclado (p. ej., `Espacio` o tecla numérica) para revelar clozes progresivamente.
- [ ] **Modo fallback (desactivación de interactividad):**
  - Switch/toggle global o por deck: *"Desactivar interacción / Modo clásico"*.
  - Comportamiento en modo clásico:
    - **Front:** muestra el texto con el hueco reemplazado por `[...]` o la pista.
    - **Back:** muestra el texto completo sin censura con el término destacado.

---

## 3. ⌨️ Cards Interactivas con Input de Texto (Type-in-the-Answer)
- [ ] **Mapeo de respuestas aceptadas:**
  - Soporte en JSON para variantes válidas: `answers: ["Sigma*", "Σ*", "\\Sigma^*"]`.
  - Normalización de strings: trim de espacios, indiferencia de mayúsculas/minúsculas opcional, normalización de acentos/diacríticos.
- [ ] **Módulo de corrección visual estilo Anki:**
  - Comparación de caracteres (Diff visual):
    - Caracteres correctos en verde.
    - Faltantes o erróneos en rojo/tachado.
- [ ] **Degradación a modo pasivo:**
  - Cuando la interactividad está apagada, el input desaparece y la respuesta correcta se traslada directamente al dorso (Back) sin requerir escritura.

---

## 4. 🫀 Oclusión de Imágenes (Image Occlusion) — Crucial para Anatomía
- [ ] **Estructura JSON de oclusión:**
  - Definir campos: `image` (URL/path), `mode` (`hide_all_guess_one` o `hide_one_guess_one`).
  - Definir arreglo `masks`: objetos con `id`, `x`, `y`, `width`, `height` (coordenadas relativas en porcentaje 0-100%) y `label`.
- [ ] **Canvas / SVG Overlay responsivo:**
  - Renderizar capas vectoriales (`<svg>` con elementos `<rect>`) escaladas porcentualmente sobre la imagen para adaptarse a cualquier resolución o pantalla móvil.
- [ ] **Lógica de estudio de oclusión:**
  - Clic en una máscara para alternar entre visible/oculta.
  - Botón *"Revelar todas"* para repaso de contexto general anatómico.
  - Modo fallback: la cara frontal muestra todas las cajas de oclusión; la trasera muestra la imagen sin ninguna máscara.

---

## 5. ⚙️ Renderizado Híbrido: Markdown + KaTeX / MathJax + Medios
- [ ] **Aislamiento de renderizado:**
  - Asegurar que el parser de Markdown no rompa delimitadores de KaTeX (`$..$`, `$$..$$`).
  - Prevenir conflictos entre la sintaxis de clozes `{{...}}` y expresiones LaTeX con dobles llaves `{{a_i}}` asegurando que el parser busque estrictamente `\{\{c\d+::`.
- [ ] **Visor de Imágenes y Zoom:**
  - Componente modal/lightbox con pan-and-zoom para esquemas anatómicos densos o con texto pequeño.
- [ ] **Modo Oscuro / Alto Contraste:**
  - Inversión selectiva o estilización de diagramas/fórmulas para evitar fatiga visual en sesiones nocturnas.

---

## 6. 🧠 Algoritmo de Estudio & Navegación (Futuras Fases Anki)
- [ ] **Navegación secuencial por temas (Modo Lectura / Aprendizaje guiado).**
- [ ] **Modo Repaso Espaciado (SRS):**
  - Implementación inicial de algoritmo **SM-2** o **FSRS** (intervalos, factor de facilidad, botones: *Otra vez*, *Difícil*, *Bien*, *Fácil*).
- [ ] **Persistencia Local:**
  - Almacenar progreso, estadísticas de aciertos y estados de repaso en `localStorage` o `IndexedDB` para funcionamiento 100% offline.
- [ ] **Exportación / Importación:**
  - Capacidad de exportar decks con notas y estadísticas.

---

## 7. Control por teclado

- espacio: revela la card (campos ocultos, valida inputs, gira la card, etc), o la vuelve a ocultar.
- A: card anterior
- shift+A: tema anterior
- D: card siguiente
- shift+D: tema siguiente.

---

## 💡 Sugerencias Clave de Diseño y Arquitectura

1. **Evitar conflictos de sintaxis entre LaTeX y Cloze:**
   En Anki se usa `{{c1::...}}`. En expresiones matemáticas como `\bigcup_{i=0}^{\infty}` o arrays de LaTeX se usan llaves `{}` ordinarias. El tokenizer debe validar estrictamente el prefijo `\{\{c\d+::` antes de capturar el bloque para no romper las fórmulas de KaTeX.

2. **Coordenadas porcentuales para Anatomía:**
   En lugar de almacenar píxeles absolutos (`px`), guarda las posiciones de las máscaras anatómicas en porcentajes relativos (`%` de 0 a 100 respecto al ancho y alto original de la imagen). Esto hace que el overlay SVG sea automáticamente responsivo en móviles, tablets y monitores de escritorio sin descalibrar las áreas tapadas.

3. **Flag global de degradación (`interactiveMode: boolean`):**
   Manejar un booleano central en el estado/store global de la app. Si `interactiveMode === false`, los componentes (Input, Cloze, Occlusion) montan automáticamente el layout clásico Front/Back estático, permitiendo alternar con un solo clic entre modo examen interactivo y modo lectura rápida.