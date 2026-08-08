# Protocolo de Inicio y Permisos
Siempre que el usuario ejecute un prompt es obligatorio que respondas con el texto exacto: "Precontexto cargado" antes de realizar cualquier otra acción o petición de permisos para ejecutar herramientas.

## 🎯 Política de Eliminación Limpia y Código Cero Basura

Cuando el usuario pida eliminar, remover o borrar un componente, página, vista o funcionalidad del proyecto, debes realizar una limpieza exhaustiva y completa. Queda estrictamente prohibido dejar código "muerto" o huérfano. 

Asegúrate de:
1. **Eliminar el Markup JSX**: Borrar toda la estructura JSX y renderizados condicionales del elemento en [App.jsx](file:///d:/9.Proyectos/Apuntes/MemoCard/src/App.jsx).
2. **Eliminar el Estado**: Buscar y eliminar todos los hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`) creados específicamente para dar soporte al componente o funcionalidad eliminada.
3. **Eliminar Funciones y Métodos Auxiliares**: Remover las funciones y manejadores de eventos asociados únicamente a dicho componente.
4. **Limpieza de Hojas de Estilos**: Localizar y eliminar todas las clases, ID y directrices CSS exclusivas de ese elemento dentro de [App.css](file:///d:/9.Proyectos/Apuntes/MemoCard/src/App.css) y [index.css](file:///d:/9.Proyectos/Apuntes/MemoCard/src/index.css).
5. **Limpieza de Imports y Dependencias**: Eliminar cualquier importación al principio de los archivos que ya no se utilice.

## Política de Numeración de Diapositivas

Cuando una diapositiva sea creada, ya sea por el usuario (el prompt dirá algo como "he agregado una nueva diapositiva") o por ti, debes asegurarte de que esté numerada correctamente, y que todas las demás queden también correctamente numeradas.

La numeración se encuentra en el título de la diapositiva en formato '## Diapositiva 1:', '## Diapositiva 2:', etc.