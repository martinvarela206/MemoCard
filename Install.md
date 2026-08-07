# Guía de Instalación y Configuración — MemoCard

Esta guía contiene los requisitos y pasos necesarios para instalar el entorno de ejecución, el gestor de paquetes **pnpm** y poner en marcha la aplicación **MemoCard**.

---

## 1. ¿Por qué usamos `pnpm` en lugar de `npm`?

**pnpm** (Performant npm) es actualmente la alternativa recomendada por la comunidad por varias razones clave:

1. **Mayor Seguridad y Aislamiento de Dependencias:**
   * `npm` utiliza una estructura plana en `node_modules`, permitiendo que paquetes de código accedan implícitamente a dependencias de otros paquetes ("fantasma" / *phantom dependencies*).
   * `pnpm` utiliza un sistema basado en enlaces simbólicos (*symlinks*) y un almacenamiento direccionable por contenido. Cada paquete solo puede acceder a las dependencias explícitamente declaradas en su `package.json`, reduciendo significativamente la superficie de ataques en la cadena de suministro (*supply chain security*).

2. **Ahorro de Espacio en Disco:**
   * Los paquetes se guardan en un repositorio global único en tu sistema (`~/.local/share/pnpm/store`). Si varios proyectos usan la misma versión de una librería, solo se almacena **una copia física** en el disco duro.

3. **Velocidad de Instalación:**
   * Es hasta 2x–3x más rápido que `npm` y `yarn` al paralelizar descargas y evitar copias repetitivas de archivos.

---

## 2. Requisitos Previos

 Para ejecutar esta aplicación web necesitas:
* **Node.js** (Versión LTS recomendada: v20 o v22)
* **pnpm** (Gestor de paquetes)
* **Python 3** (Opcional, solo si deseas actualizar las flashcards mediante `python parse_slides.py`)

---

## 3. Instalación de Node.js y pnpm (Linux / Ubuntu)

A continuación se presentan los dos métodos más limpios para instalar **Node.js** y **pnpm** sin necesidad de instalar `npm` del sistema ni otorgar permisos `sudo` innecesarios.

### Método 1: Instalación Autónoma con Script Oficial de pnpm (Recomendado)

Este método instala **pnpm** de forma directa en el usuario y utiliza pnpm para gestionar e instalar la versión LTS de Node.js.

#### Paso 1: Descargar e instalar pnpm
Abre tu terminal y ejecuta:
```bash
curl -fsSL https://get.pnpm.io/install.sh | sh
```

#### Paso 2: Cargar las variables de entorno
Actualiza la configuración de tu terminal (o cierra y vuelve a abrir la terminal):
```bash
source ~/.bashrc
```

#### Paso 3: Instalar Node.js LTS mediante pnpm
Ejecuta el siguiente comando para que `pnpm` descargue y configure Node.js automáticamente:
```bash
pnpm env use --global lts
```

#### Paso 4: Verificar la instalación
```bash
node -v
pnpm -v
```
*(Deberías ver las versiones de Node.js y pnpm instaladas correctamente).*

---

### Método 2: Usando FNM (Fast Node Manager) + pnpm

Si prefieres gestionar múltiples versiones de Node.js fácilmente:

```bash
# 1. Instalar FNM (Fast Node Manager)
curl -fsSL https://fnm.vercel.app/install | bash

# 2. Recargar configuración de la terminal
source ~/.bashrc

# 3. Instalar e usar la última versión LTS de Node.js
fnm install --lts
fnm use lts

# 4. Instalar pnpm autónomo
curl -fsSL https://get.pnpm.io/install.sh | sh
source ~/.bashrc
```

---

## 4. Instalación de Dependencias del Proyecto

Una vez que tengas `pnpm` instalado, navega a la carpeta raíz del proyecto (`MemoCard`) e instala todas las dependencias requeridas (React, Vite, KaTeX, Oxlint, etc.):

```bash
pnpm install
```

Este comando creará el archivo `pnpm-lock.yaml` garantizando reproducibilidad exacta e integridad de todos los paquetes.

---

## 5. Comandos para Ejecutar y Construir la Aplicación

| Acción | Comando | Descripción |
| :--- | :--- | :--- |
| **Desarrollo** | `pnpm dev` | Inicia el servidor de desarrollo local con Vite (normalmente en `http://localhost:5173`). |
| **Compilar (Build)** | `pnpm build` | Compila el código React para producción en la carpeta `dist/`. |
| **Vista Previa** | `pnpm preview` | Permite probar localmente la build de producción generada. |
| **Linter** | `pnpm lint` | Analiza el código buscando posibles errores con Oxlint. |
| **Generar Tarjetas** | `python parse_slides.py` | (Opcional) Procesa `Docs/Teoria de la computacion.md` y actualiza las tarjetas JSON en `src/data/`. |

---

## 6. Solución de Problemas Frecuentes

* **`pnpm: command not found` tras la instalación:**
  Asegúrate de haber ejecutado `source ~/.bashrc` o `source ~/.zshrc`. Si persiste, verifica que `~/.local/share/pnpm` esté en tu `$PATH`.

* **Permisos denegados:**
  No utilices `sudo pnpm install`. Todo el entorno pnpm está diseñado para ejecutarse a nivel de usuario sin requerir elevación de privilegios de administrador.
