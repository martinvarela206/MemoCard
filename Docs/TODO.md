# Tareas Pendientes (TODO)

# 📌 Roadmap & TODO: Motor de Flashcards Interactivas (Anki-Like)

## 🎯 Visión General
Evolucionar el visor actual de tarjetas estáticas (doble cara, markdown + LaTeX) hacia un motor de estudio interactivo, modular y configurable. Debe admitir clozes (huecos/censura), cards con input de validación en tiempo real, oclusión de imágenes (imprescindible para anatomía) y degradación elegante a modo estándar/doble cara pasivo.

---

---

## 6. 🧠 Algoritmo de Estudio & Navegación (Futuras Fases Anki)
- [ ] **Exportación / Importación:**
  - Capacidad de exportar decks con notas y estadísticas.

---

## 💡 Sugerencias Clave de Diseño y Arquitectura

1. **Evitar conflictos de sintaxis entre LaTeX y Cloze:**
   En Anki se usa `{{c1::...}}`. En expresiones matemáticas como `\bigcup_{i=0}^{\infty}` o arrays de LaTeX se usan llaves `{}` ordinarias. El tokenizer debe validar estrictamente el prefijo `\{\{c\d+::` antes de capturar el bloque para no romper las fórmulas de KaTeX.

2. **Coordenadas porcentuales para Anatomía:**
   En lugar de almacenar píxeles absolutos (`px`), guarda las posiciones de las máscaras anatómicas en porcentajes relativos (`%` de 0 a 100 respecto al ancho y alto original de la imagen). Esto hace que el overlay SVG sea automáticamente responsivo en móviles, tablets y monitores de escritorio sin descalibrar las áreas tapadas.

3. **Flag global de degradación (`interactiveMode: boolean`):**
   Manejar un booleano central en el estado/store global de la app. Si `interactiveMode === false`, los componentes (Input, Cloze, Occlusion) montan automáticamente el layout clásico Front/Back estático, permitiendo alternar con un solo clic entre modo examen interactivo y modo lectura rápida.