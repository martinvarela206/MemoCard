---
trigger: always_on
---

# Project Specific Rules (MemoCard)

This file contains rules specific to the MemoCard interactive study flashcard application (React 19 + Vite SPA). Rules are written in English to optimize context window efficiency and reduce token usage.

---

## Operational Execution

1. **Project Prompt Acknowledgment**:
   - Every response must explicitly include: `Project Prompt Loaded.` right after the Markdown Prompt acknowledgment.
   - Per `Docs/precontexto.md`, include `Precontexto cargado.` as part of the operational acknowledgment sequence.

---

## Code Cleanliness, Deletion & Zero Dead Code Policy

2. **Clean Deletion & Zero Dead Code Policy (Política de Eliminación Limpia y Código Cero Basura)**:
   - When requested to eliminate, remove, or replace any component, page, view, or feature, perform a complete, exhaustive cleanup:
     1. **Eliminate JSX Markup**: Remove all JSX structures and conditional renders in [src/App.jsx](file:///d:/9.Proyectos/Apuntes/MemoCard/src/App.jsx) or dedicated component files.
     2. **Eliminate State & Hooks**: Locate and remove all hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`) created exclusively for the removed feature.
     3. **Eliminate Auxiliary Functions**: Remove handler functions, event listeners, and helper methods associated solely with that element.
     4. **Clean Stylesheets**: Locate and delete all CSS classes, IDs, and style rules exclusive to that element inside [src/App.css](file:///d:/9.Proyectos/Apuntes/MemoCard/src/App.css) and [src/index.css](file:///d:/9.Proyectos/Apuntes/MemoCard/src/index.css).
     5. **Clean Imports & Dependencies**: Remove unused imports at the top of modified files.

---

## Slide Numbering & Deck Data Synchronization

3. **Slide Numbering Policy (Política de Numeración de Diapositivas)**:
   - Every slide created or edited in markdown notes must strictly follow the title format: `## Diapositiva <N>: <Título>` (e.g., `## Diapositiva 1: Introducción`).
   - Maintain continuous, gapless, sequential numbering across all slides.
   - When slides are added, removed, or reorganized:
     - Use or maintain parity with [renumber_slides.py](file:///d:/9.Proyectos/Apuntes/MemoCard/renumber_slides.py).
     - Run or synchronize [parse_slides.py](file:///d:/9.Proyectos/Apuntes/MemoCard/parse_slides.py) to regenerate [src/data/ColoquioTeoriaComputacion.json](file:///d:/9.Proyectos/Apuntes/MemoCard/src/data/ColoquioTeoriaComputacion.json) whenever source notes in `Docs/` change.

---

## Architecture, Componentization & Quality Verification

4. **React Componentization & SOLID Modularization**:
   - MemoCard is a Single Page Application built with React 19 and Vite.
   - Avoid accumulating all state and JSX in a monolithic [src/App.jsx](file:///d:/9.Proyectos/Apuntes/MemoCard/src/App.jsx) (which exceeds 500 lines). Decouple distinct views, drawer navigation, study sessions, and cards into modular components under `src/components/`.
   - Adhere to SOLID principles: separate data transformation (LaTeX / KaTeX parsing), state management, and visual card rendering.

5. **Build & Lint Verification Standard**:
   - After code changes, verify correctness by executing:
     - `pnpm run build`: Validate Vite production bundle compilation.
     - `pnpm run lint`: Validate oxlint rules and syntax hygiene.
   - Never finalize a task with broken builds or unresolved linter errors.

---

## Multi-Item Prompt Decomposition & Atomic Loop Execution

6. **Mandatory Decomposition of Multi-Item Prompts**:
   - Whenever the prompt or active TODO list contains multiple tasks, bullet points, fixes, additions, or refactorings (2 or more distinct items):
     - **NEVER** bundle, combine, or resolve multiple items together in a single step, file edit block, or version bump.
     - Decompose the work into an ordered list of individual, discrete items.
     - Classify each item individually:
       - If the feature already exists or is a fix/refactor of existing behavior: classify as `fix`.
       - If the capability is completely new: classify as `feat`.

7. **Strict Sequential Atomic Execution Loop**:
   - Execute items sequentially, one by one, completing the entire cycle for each item before touching the next:
     1. **Implement Code**: Make code changes strictly for the single active item.
     2. **Update Documentation**:
        - **Clean `Docs/TODO.md`**: Follow `project-docs-rules.md` to completely delete/remove completed items (never leave `[x]`).
        - **Update Component Map**: If components, views, or styles changed, update [Docs/mapa_de_componentes.md](file:///d:/9.Proyectos/Apuntes/MemoCard/Docs/mapa_de_componentes.md).
     3. **Version Bump**: Increment `package.json` (`patch` for `fix`, `minor` for `feat`) following SemVer in `general-rules.md`.
     4. **Build & Lint Verification**: Run `pnpm run build` and `pnpm run lint` to verify application integrity.
     5. **Atomic Commit**: Stage files and commit with simple conventional format in Spanish:
        - `fix: <elemento o problema corregido en español>`
        - `feat: <nuevo elemento o funcionalidad añadida en español>`
     6. **Advance to Next Item**: Only after the commit has been successfully created, proceed to the next item in the list and repeat steps 1 to 5.
