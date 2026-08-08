# Reglas de Codificación del Workspace - MemoCard

Este archivo contiene reglas y directrices que todos los agentes de IA deben seguir estrictamente cuando interactúan con este repositorio.

## 🎯 Política de Eliminación Limpia y Código Cero Basura

Cuando el usuario pida eliminar, remover o borrar un componente, página, vista o funcionalidad del proyecto, debes realizar una limpieza exhaustiva y completa. Queda estrictamente prohibido dejar código "muerto" o huérfano. 

Asegúrate de:
1. **Eliminar el Markup JSX**: Borrar toda la estructura JSX y renderizados condicionales del elemento en [App.jsx](file:///d:/9.Proyectos/Apuntes/MemoCard/src/App.jsx).
2. **Eliminar el Estado**: Buscar y eliminar todos los hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`) creados específicamente para dar soporte al componente o funcionalidad eliminada.
3. **Eliminar Funciones y Métodos Auxiliares**: Remover las funciones y manejadores de eventos asociados únicamente a dicho componente.
4. **Limpieza de Hojas de Estilos**: Localizar y eliminar todas las clases, ID y directrices CSS exclusivas de ese elemento dentro de [App.css](file:///d:/9.Proyectos/Apuntes/MemoCard/src/App.css) y [index.css](file:///d:/9.Proyectos/Apuntes/MemoCard/src/index.css).
5. **Limpieza de Imports y Dependencias**: Eliminar cualquier importación al principio de los archivos que ya no se utilice.
