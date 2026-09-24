---
trigger: always_on
---

# Project Documentation Standards & Lifecycle Rules (MemoCard)

This file contains the rules governing the lifecycle, directory structure, task tracking, and synchronization of MemoCard's project documentation located in `Docs/`. Rules are written in English to optimize context window efficiency and reduce token usage.

---

## Operational Execution

1. **Project Documentation Prompt Acknowledgment**:
   - Every response must explicitly include: `Project Docs Prompt Loaded.` right after the Project Prompt acknowledgment.

---

## Documentation Ecosystem & Directory Governance

2. **MemoCard `Docs/` Ecosystem & File Responsibilities**:
   - `Docs/TODO.md`: The active roadmap and atomic task registry. Must be continuously synchronized during feature development, refactoring, and bug fixing.
   - `Docs/mapa_de_componentes.md`: Authoritative map of components, views, React hooks, CSS style blocks, and state architecture in the MemoCard SPA.
   - `Docs/precontexto.md`: Initialization protocol, clean deletion policy (zero dead code), and slide numbering standards.
   - `Docs/rules.md`: Workspace coding guidelines and clean removal protocols.
   - `Docs/Teoria de la computacion.md`: Source slide notes in Markdown format used to generate study decks.
   - `Docs/Lenguajes por compresión o con parámetros.md`: Theoretical topic notes and supplementary academic material.

---

## Task Registry Lifecycle & `Docs/TODO.md` Hygiene

3. **Dynamic Task Ingestion into `Docs/TODO.md`**:
   - Whenever a user prompt mentions, enumerates, or identifies problems, bugs, corrections, missing functionality, or new features, these items MUST be cataloged and added to `Docs/TODO.md` before execution.
   - **Exception / Direct Flow**: If `Docs/TODO.md` has no pending items (empty list) and a problem is diagnosed, do not leave it parked in the TODO; immediately initiate the required implementation to resolve it.

4. **Strict Deletion & Zero-Item Goal for `Docs/TODO.md`**:
   - Completely DELETE / REMOVE completed or solved items from `Docs/TODO.md`.
   - NEVER leave items marked with checkboxes (`[x]`).
   - `Docs/TODO.md` must remain strictly clean, with the ultimate objective of achieving a zero-item (empty) TODO.

---

## Catalog & Deck Synchronization & Language Standards

5. **Component Map & Slide Notes Synchronization**:
   - Whenever React components, views, state hooks, or CSS classes are created, modified, or deleted, immediately update [Docs/mapa_de_componentes.md](file:///d:/9.Proyectos/Apuntes/MemoCard/Docs/mapa_de_componentes.md) to reflect the active application structure.
   - Whenever slide definitions or deck cards are created or updated, ensure consistency between [Docs/Teoria de la computacion.md](file:///d:/9.Proyectos/Apuntes/MemoCard/Docs/Teoria de la computacion.md), [parse_slides.py](file:///d:/9.Proyectos/Apuntes/MemoCard/parse_slides.py), and [src/data/ColoquioTeoriaComputacion.json](file:///d:/9.Proyectos/Apuntes/MemoCard/src/data/ColoquioTeoriaComputacion.json).

6. **Documentation Language & Technical Tone**:
   - All user-facing documents, manuals, study materials, and task lists inside `Docs/` must be authored in professional Spanish to maintain stylistic parity with the existing project documentation.
   - Rule definition files (`.agents/rules/`) and in-code technical comments remain in English for optimal token efficiency.
