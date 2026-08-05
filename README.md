# Guía de Estudio y Uso - MemoCard

Esta guía explica cómo estructurar tus apuntes de estudio en formato Markdown para que el script `parse_slides.py` genere correctamente las tarjetas (flashcards) utilizadas en la aplicación web.

---

## ¿Cómo funciona `parse_slides.py`?

El script `parse_slides.py` es un procesador automático escrito en Python. Realiza las siguientes tareas:
1. Lee el archivo de apuntes Markdown ubicado en `Docs/Teoria de la computacion.md`.
2. Divide el documento en bloques de diapositivas individuales utilizando el separador `---`.
3. Para cada diapositiva, genera **exactamente 1 tarjeta de estudio**:
   * **Frente (Front):** El título de la diapositiva (ej. `Cadena ($w$)`).
   * **Reverso (Back):** El contenido completo de la diapositiva (con soporte para listas, texto enriquecido y fórmulas matemáticas).
4. Guarda la base de datos resultante en formato JSON en dos ubicaciones de forma simultánea:
   * `Resources/ColoquioTeoriaComputacion.json` (Reserva/Histórico).
   * `src/data/ColoquioTeoriaComputacion.json` (Leído por la aplicación React en tiempo real).

---

## Formato de Escritura de las Diapositivas

Para que el script analice el archivo correctamente, el documento Markdown debe seguir estas reglas:

### 1. Título y Subtítulo Principal (Opcional)
Al principio del archivo, antes del primer separador `---`, puedes definir el título principal y subtítulo de la sesión de estudio:
```markdown
# Diapositivas de Estudio: Teoría de la Computación
## Lenguajes, Lenguajes Regulares y Gramáticas
```

### 2. Separador de Diapositivas
Cada diapositiva debe estar separada de la anterior y la siguiente mediante tres guiones (`---`) en una línea independiente.

### 3. Título de la Diapositiva
La primera línea de cada diapositiva debe ser un encabezado de segundo nivel (`##`) con el prefijo numérico correspondiente y el nombre de la tarjeta:
```markdown
## Diapositiva X: Nombre del Concepto
```
* **Nota:** El script lee el número y el nombre. Es importante respetar el formato `## Diapositiva [Número]: [Título]`.

### 4. Soporte LaTeX (Matemáticas)
Puedes incluir fórmulas matemáticas complejas usando notación LaTeX estándar:
* **Fórmula en línea (inline):** Rodeada por un solo signo de dólar (ej. `$\Sigma$`, `$w_1 = w_2$`).
* **Fórmula en bloque (display):** Rodeada por doble signo de dólar `$$` en una línea independiente.
  ```markdown
  $$|\epsilon| = 0$$
  ```

---

## Ejemplo Completo de un Archivo Válido

A continuación, se muestra cómo estructurar un archivo Markdown de ejemplo:

```markdown
# Diapositivas de Estudio: Teoría de la Computación
## Lenguajes, Lenguajes Regulares y Gramáticas

---
## Diapositiva 1: Alfabeto ($\Sigma$)

*   **Definición:** Un alfabeto es un conjunto finito no vacío de símbolos (objetos atómicos o indivisibles).
*   **Designación:** Se utiliza comúnmente la letra griega sigma mayúscula ($\Sigma$) para designar un alfabeto.

---
## Diapositiva 2: Cadena ($w$)

*   **Definición:** Sucesión finita de $n$ símbolos de un alfabeto $\Sigma$.
*   **Notación:** $w = e_1 e_2 \dots e_n$, donde cada $e_i \in \Sigma$ ocurre en la posición $i$ ($1 \le i \le n$).

---
## Diapositiva 3: Longitud ($|w|$)

*   **Definición:** Cantidad de símbolos que componen la cadena $w$.
*   **Ejemplo:** Si $w = abb$, entonces su longitud es:
    $$|w| = 3$$
```

---

## Cómo Ejecutar el Procesador y Actualizar la Aplicación

Cada vez que agregues, modifiques o separes diapositivas en `Docs/Teoria de la computacion.md`, sigue estos pasos para actualizar tus tarjetas en el Dashboard:

1. Abre una terminal en la raíz del proyecto.
2. Ejecuta el script de Python:
   ```bash
   python parse_slides.py
   ```
3. Verás un mensaje indicando el éxito del procesamiento y el total de tarjetas creadas:
   ```text
   Reading file: D:\9.Proyectos\Apuntes\MemoCard\Docs\Teoria de la computacion.md
   Parsed 54 slides and 54 cards.
   Successfully saved JSON to: D:\9.Proyectos\Apuntes\MemoCard\Resources\ColoquioTeoriaComputacion.json
   Successfully saved JSON to: D:\9.Proyectos\Apuntes\MemoCard\src\data\ColoquioTeoriaComputacion.json
   ```
4. El servidor de desarrollo de Vite (si está corriendo) detectará el cambio en el JSON y recargará la aplicación web de manera inmediata para reflejar tus nuevas tarjetas de estudio.
