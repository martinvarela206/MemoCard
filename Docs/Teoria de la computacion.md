# Diapositivas de Estudio: Teoría de la Computación
## Lenguajes, Lenguajes Regulares y Gramáticas




---

## Diapositiva 1: Alfabeto ($\Sigma$)

**Definición:** Un **alfabeto** es un conjunto finito no vacío de elementos atómicos o indivisibles denominados **símbolos**, que se designa como **$\Sigma$** (Sigma).

---

## Diapositiva 2: Cadena o palabra ($w$)

**Definición:** Una **cadena** o **palabra** designada como $w$, de longitud $|w|=n$ es una sucesión finita de $n$ símbolos de un alfabeto $\Sigma$, tal que para $w=e_1e_2\dots e_n$ con $e_i$ desde $1$ hasta $n$ y $e_i \in \Sigma$.

---

## Diapositiva 3: Cadena vacía o nula ($\epsilon$)

**Definición:** Si la cadena no tiene símbolos, es decir su longitud es 0, entonces se denomina **cadena vacía o nula**, se la denota como $\epsilon$ y $|\epsilon|=0$.

---

## Diapositiva 4: Potencia de un Alfabeto ($\Sigma^k$)

**Definición:** La potencia $k$-ésima de un alfabeto $\Sigma$, denotada por $\Sigma^k$, es el conjunto de todas las posibles cadenas con símbolos de $\Sigma$ de longitud exacta $k$.
**Distinción:**
- $\Sigma$: Conjunto de símbolos.
- $\Sigma^0$: $\{\epsilon\}$ (por convención, para cualquier alfabeto $\Sigma$).
- $\Sigma^1$: Conjunto de cadenas de longitud 1.
- $\Sigma^n$: Conjunto de cadenas de longitud $n$.

---

## Diapositiva 5: Clausura de Kleene de un Alfabeto ($\Sigma^*$)

**Definición:** La **Clausura de Kleene** es el conjunto de todas las posibles cadenas formadas con símbolos de un alfabeto $\Sigma$, incluyendo la cadena vacía $\epsilon$. Es decir, es la union de todas las potencias del alfabeto.
- **Fórmula:** 
$$\Sigma^* = \bigcup_{i=0}^{\infty} \Sigma^i$$
- **Conjunto resultante:**
$$\Sigma^* = \Sigma^0 \cup \Sigma^1 \cup \Sigma^2 \cup \dots$$

---

## Diapositiva 6: Clausura Positiva de un Alfabeto ($\Sigma^+$)

**Definición:** La **Clausura Positiva** es el conjunto de todas las posibles cadenas formadas con símbolos de un alfabeto $\Sigma$, excluyendo la cadena vacía $\epsilon$.
- **Fórmula:** 
$$\Sigma^+ = \bigcup_{i=1}^{\infty} \Sigma^i$$

---

## Diapositiva 7: Relaciones fundamentales entre $\Sigma^*$, $\Sigma^+$ y $\epsilon$

- $\Sigma^* = \Sigma^+ \cup \{\epsilon\}$
- $\Sigma^+ = \Sigma^* - \{\epsilon\}$

---

## Diapositiva 8: Operaciones y Relaciones sobre Cadenas (son 5)

- Concatenación de cadenas ($w_1 w_2$)
- Potencia $k$-ésima de una cadena ($w^k$)
- Igualdad de cadenas ($w_1 = w_2$)
- Subcadena (si $w=w_1w_2$ entonces $w_1$ es subcadena de $w$)
- Prefijo y sufijo (si $w=w_1w_2$ entonces $w_1$ es prefijo de $w$ y $w_2$ es sufijo de $w$)

---

## Diapositiva 9: Operaciones sobre Cadenas: Concatenación

**Definición:** La concatenación de dos cadenas $w_1 = e^1_1 \dots e^1_{k_1}$ y $w_2 = e^2_1 \dots e^2_{k_2}$ es la cadena $w_1 w_2 = e^1_1 \dots e^1_{k_1} e^2_1 \dots e^2_{k_2}$.
**Longitud resultante:**
$$|w_1 w_2| = |w_1| + |w_2|$$
**Elemento neutro:** La cadena vacía $\epsilon$ es el elemento neutro:
$$\forall w : w\epsilon = \epsilon w = w$$

---

## Diapositiva 10: Operaciones sobre Cadenas: Potencia $k$-ésima de una cadena ($w^k$)

**Definición:** La **potencia $k$-ésima** $w^k$ de una cadena $w$ es la cadena que resulta de concatenar $w^{k-1}$ con $w$. La definición recursiva de la potencia $k$-ésima de una cadena $w$ es:
1.  $w^0 = \epsilon$
2.  $w^k = w^{k-1} \cdot w \quad (k \in \mathbb{N})$

$w^k = w^{k-1} w = w^{k-2} w w = \dots = \underbrace{w w w \dots w}_{k \text{ veces}}$ ($k$ cadenas $w$ concatenadas)

---

## Diapositiva 11: Relaciones entre Cadenas: Igualdad ($w_1 = w_2$)

**Definición:** Dos **cadenas son iguales** si y sólo si tienen los mismos símbolos, en el mismo orden y de la misma longitud:
$$w_1 = w_2 \iff (\forall i : 1 \le i \le n \implies a_i = b_i) \land (|w_1| = |w_2|)$$

---

## Diapositiva 12: Relaciones entre Cadenas: Subcadena

**Definición:** La cadena $w_1$ es **subcadena** de una cadena $w$, si existen cadenas $w_2$ y $w_3$ tales que $w = w_2 w_1 w_3$. Las cadenas $w_2$ y $w_3$ pueden ser vacías, por lo tanto cada cadena es subcadena de sí misma.

---

## Diapositiva 13: Relaciones entre Cadenas: Prefijo y Sufijo

**Definición:** Si la cadena $w = w_1 w_2$ entonces $w_1$ es **prefijo** de $w$ y $w_2$ es **sufijo** de $w$.

---

## Diapositiva 14: Las cadenas tienen 9 propiedades y estas son:

- Propiedad 1: **Longitud no negativa**
- Propiedad 2: **Longitud nula**
- Propiedad 3: **Aditividad de longitud**
- Propiedad 4: **Longitud de subcadena**
- Propiedad 5: **Identidad (Neutro)**
- Propiedad 6: **Asociatividad**
- Propiedad 7: **No conmutatividad**
- Propiedad 8: **Cancelación**
- Propiedad 9: **Descomposición nula**

---

## Diapositiva 15: Propiedad de las cadenas 1 de 9: Longitud no negativa

Si $x \in \Sigma^*$ es una cadena arbitraria:
*   **Longitud no negativa:** Toda cadena tiene una longitud mayor o igual a 0. $|x| \ge 0$.

---

## Diapositiva 16: Propiedad de las cadenas 2 de 9: Longitud nula

Si $x \in \Sigma^*$ es una cadena arbitraria:
*   **Longitud nula:** Si la longitud de una cadena es 0, entonces esa cadena es $\epsilon$. $|x| = 0 \iff x = \epsilon$.

---

## Diapositiva 17: Propiedad de las cadenas 3 de 9: Aditividad de longitud

Si $x, y \in \Sigma^*$ son cadenas arbitrarias:
*   **Aditividad de longitud:** La longitud de la concatenación de dos cadenas es la suma de sus longitudes. $|xy| = |x| + |y|$.

---

## Diapositiva 18: Propiedad de las cadenas 4 de 9: Longitud de subcadena

Si $x, y \in \Sigma^*$ son cadenas arbitrarias:
*   **Longitud de subcadena:** Si $w_1$ es subcadena de $w$, entonces la longitud de $w_1$ es menor o igual a la longitud de $w$. $|w_1| \le |w|$.

---

## Diapositiva 19: Propiedad de las cadenas 5 de 9: Identidad (Neutro)

Si $x \in \Sigma^*$ es una cadena arbitraria:
*   **Identidad (Neutro):** La cadena vacía $\epsilon$ es el elemento neutro de la concatenación. $x\epsilon = \epsilon x = x$.

---

## Diapositiva 20: Propiedad de las cadenas 6 de 9: Asociatividad

Si $x, y, z \in \Sigma^*$ son cadenas arbitrarias:
*   **Asociatividad:** La concatenación es asociativa. $x(yz) = (xy)z = x y z$.

---

## Diapositiva 21: Propiedad de las cadenas 7 de 9: No conmutatividad

Si $x, y \in \Sigma^*$ son cadenas arbitrarias:
*   **No conmutatividad:** La concatenación no es conmutativa. $xy \neq yx$ en general.

---

## Diapositiva 22: Propiedad de las cadenas 8 de 9: Cancelación

Si $x, y, z \in \Sigma^*$ son cadenas arbitrarias:
*   **Cancelación:** Si una cadena $x$ es igual a la concatenación de dos cadenas $yz$ y $x=y$, entonces la otra cadena es $\epsilon$. Si $x = yz \land x = y \implies z = \epsilon$.

---

## Diapositiva 23: Propiedad de las cadenas 9 de 9: Descomposición nula

Si $x, y \in \Sigma^*$ son cadenas arbitrarias:
*   **Descomposición nula:** Si la concatenación de dos cadenas es $\epsilon$, entonces ambas cadenas son $\epsilon$. $xy = \epsilon \implies x = \epsilon \land y = \epsilon$.

---

## Diapositiva 24: Lenguaje ($L$)

**Definición:** Un lenguaje $L$ sobre un alfabeto $\Sigma$ es un conjunto de cadenas de símbolos de dicho alfabeto:
$$L \subseteq \Sigma^*$$

*Es decir que un lenguaje $L$ es subconjunto de $\Sigma^*$.*

---

## Diapositiva 25: Casos Especiales de Lenguajes (2)
- **Lenguaje vacío:** $L = \emptyset$ (no tiene elementos).
- **Lenguaje unitario vacío:** $L = \{\epsilon\}$ (tiene un elemento: la cadena vacía).
- Tanto el lenguaje vacío como el unitario vacío son lenguajes comunes a todos los alfabetos.
- **Estos dos conjuntos NO SON IGUALES:** $\emptyset \neq \{\epsilon\}$.

---
## Diapositiva 26: Representaciones de los Lenguajes (3)

Las tres formas clásicas de representar un lenguaje son:
- **Por Extensión**
- **Por Comprensión**
- **Con Parámetros**

---
## Diapositiva 27: Representación de un Lenguaje: Por Extensión

**Definición:** Se enumeran las cadenas que forman el lenguaje (esta representación es aplicable sólo a lenguajes finitos).

---
## Diapositiva 28: Representación de un Lenguaje: Por Comprensión

**Definición:** Se establece la propiedad lógica o predicado que deben satisfacer las cadenas:
$$L = \{x \in \Sigma^* \mid P(x)\}$$

---
## Diapositiva 29: Representación de un Lenguaje: Con Parámetros

**Definición:** Se reemplaza la cadena por una expresión con variables (parámetros) sujetas a restricciones:
$$L = \{w \in \Sigma^* \mid w = f(\alpha, \beta, \dots) \text{ con condiciones para } \alpha, \beta, \dots\}$$

---
## Diapositiva 30: Operaciones con Lenguajes (7)

Las operaciones fundamentales sobre lenguajes son:
- **Unión**
- **Intersección**
- **Complemento**
- **Diferencia**
- **Concatenación**
- **Potencia $k$-ésima**
- **Clausuras** (de Kleene y Positiva)

---

## Diapositiva 31: Operaciones con Lenguajes: Unión

Sean $L_1$ y $L_2$ lenguajes sobre un mismo alfabeto $\Sigma$:
**Unión ($L_1 \cup L_2$):** Lenguaje cuyas cadenas pertenecen a $L_1$ o a $L_2$:
$$L_1 \cup L_2 = \{w \in \Sigma^* \mid w \in L_1 \lor w \in L_2\}$$

---

## Diapositiva 32: Operaciones con Lenguajes: Intersección

Sean $L_1$ y $L_2$ lenguajes sobre un mismo alfabeto $\Sigma$:
**Intersección ($L_1 \cap L_2$):** Lenguaje cuyas cadenas pertenecen a $L_1$ y a $L_2$:
$$L_1 \cap L_2 = \{w \in \Sigma^* \mid w \in L_1 \land w \in L_2\}$$

---

## Diapositiva 33: Operaciones con Lenguajes: Complemento

Sea $L$ un lenguaje sobre un alfabeto $\Sigma$:
**Complemento ($\overline{L}$):** Lenguaje formado por todas las cadenas de $\Sigma^*$ que no pertenecen a $L$:
$$\overline{L} = \Sigma^* - L$$

---

## Diapositiva 34: Operaciones con Lenguajes: Diferencia

Sean $L_1$ y $L_2$ lenguajes sobre un mismo alfabeto $\Sigma$:
- **Diferencia ($L_1 - L_2$):** Lenguaje cuyas cadenas pertenecen a $L_1$ pero no pertenecen a $L_2$:
$$L_1 - L_2 = \{w \in \Sigma^* \mid w \in L_1 \land w \notin L_2\}$$

---

## Diapositiva 35: Operaciones con Lenguajes: Concatenación

Sean $L_1$ y $L_2$ lenguajes sobre un alfabeto $\Sigma$:
**Concatenación ($L_1 L_2$):** Lenguaje obtenido al concatenar cadenas de $L_1$ con cadenas de $L_2$:
$$L_1 L_2 = \{w \in \Sigma^* \mid \exists w_1 \in L_1, \exists w_2 \in L_2 : w = w_1 w_2\}$$

---

## Diapositiva 36: Operaciones con Lenguajes: Potencia $k$-ésima

Sea $L$ un lenguaje sobre $\Sigma$ ($L \neq \emptyset$):
**Potencia $k$-ésima ($L^k$):** Concatenación de $L$ consigo mismo $k$ veces:
$$L^k = \{w \in \Sigma^* \mid w = w_1 w_2 \dots w_k, \text{ con } w_i \in L \text{ para } 1 \le i \le k\}$$
**Caso base:** $L^0 = \{\epsilon\}$.

---

## Diapositiva 37: Operaciones con Lenguajes: Clausuras

Sea un lenguaje $L \neq \emptyset$ sobre $\Sigma$:
**Clausura de Kleene ($L^*$):** Unión de todas las potencias del lenguaje:
$$L^* = \bigcup_{i=0}^{\infty} L^i$$
**Clausura Positiva ($L^+$):** Unión de las potencias excluyendo la potencia cero:
$$L^+ = \bigcup_{i=1}^{\infty} L^i$$
**Relaciones:**
**$L^* = L^+ \cup \{\epsilon\}$**
**$L^+ = L^* - \{\epsilon\}$**

---

## Diapositiva 38: Propiedades de Operaciones con Lenguajes (1 a 7)

Sean $L, L_1, L_2, L_3$ lenguajes sobre $\Sigma$:
1.  **Identidad (Neutro):** $L\{\epsilon\} = \{\epsilon\}L = L$.
2.  **Asociatividad:** $L_1(L_2 L_3) = (L_1 L_2)L_3 = L_1 L_2 L_3$.
3.  **No conmutatividad:** $L_1 L_2 \neq L_2 L_1$ en general.
4.  **Distributividad de concatenación respecto a unión:**
    $$L_1(L_2 \cup L_3) = L_1 L_2 \cup L_1 L_3$$
5.  **No distributividad:** La concatenación no es distributiva respecto de la intersección.
6.  **Propiedades de conjuntos:** La unión y la intersección son conmutativas, asociativas, distributivas entre sí, idempotentes y cumplen absorción.
7.  **Neutro de conjuntos:** $\emptyset$ es neutro para la unión; $\Sigma^*$ es neutro para la intersección.

---

## Diapositiva 39: Propiedades de Operaciones con Lenguajes (8 a 14)

Sean $L, L_1, L_2$ lenguajes sobre $\Sigma$:
8.  **Pertenencia de vacío:** $\epsilon \in L \iff \epsilon \in L^+$.
9.  **Inclusión de potencias:** $\forall i : L^i \subseteq L^*$.
10. **Inclusión de clausura positiva:** $L^+ \subseteq L^*$.
11. **Conmutación con clausura:** $L L^* = L^* L$.
12. **Identidad de clausura positiva:** $L^+ = L L^* = L^* L$.
13. **Idempotencia de clausura:** $(L^*)^* = L^*$.

---

## Diapositiva 40: Lenguajes y Problemas

**Definición de Problema:** En teoría de la computación, un problema se define formalmente como el proceso de determinar si una cadena de caracteres pertenece o no a un lenguaje determinado $L$, sobre un alfabeto $\Sigma$.
$$w \in L \quad ?$$

---

## Diapositiva 41: Lenguaje Regular (LR)

**Definición:** Un lenguaje $L$ sobre un alfabeto $\Sigma$ es **regular** si y sólo si se puede generar a partir de los lenguajes básicos:
1. El lenguaje vacío: $\Phi$
2. El lenguaje unitario vacío: $\{\epsilon\}$
3. Los lenguajes unitarios de símbolos: $\{x\}$ para cada $x \in \Sigma$
**Operaciones permitidas:** Unión, concatenación, clausura de Kleene y/o clausura positiva, aplicadas un número finito de veces.

---

## Diapositiva 42: Propiedades de Clausura de Lenguajes Regulares (1 a 6)

Si $L_1$ y $L_2$ son lenguajes regulares sobre $\Sigma$, entonces también son regulares:
1.  **Unión:** $L_1 \cup L_2$
2.  **Intersección:** $L_1 \cap L_2$
3.  **Concatenación:** $L_1 L_2$
4.  **Complemento:** $\overline{L_1} = \Sigma^* - L_1$
5.  **Clausura de Kleene:** $L_1^*$
6.  **Clausura Positiva:** $L_1^+$

---

## Diapositiva 43: Clausura de Lenguajes Regulares (Generalizaciones)

Se derivan por inducción matemática a partir de las propiedades básicas:
*   La **unión finita** de lenguajes regulares es un lenguaje regular.
*   La **intersección finita** de lenguajes regulares es un lenguaje regular.
*   La **concatenación finita** de lenguajes regulares es un lenguaje regular.

---

## Diapositiva 44: Expresión Regular (ER)

Dada una expresión regular sobre un alfabeto $\Sigma$, se define inductivamente como:
1.  **Caso Base 1:** El lenguaje vacío $\Phi$ es una ER.
2.  **Caso Base 2:** La cadena vacía $\epsilon$ es una ER.
3.  **Caso Base 3:** $x$ es una ER, para cualquier $x \in \Sigma$.
4.  **Paso Inductivo:** Si $E_1$ y $E_2$ son ER, entonces $(E_1)$, $(E_2)$, $E_1 E_2$, $(E_1 + E_2)$, $(E_1)^* y (E_2)^*$ son expresiones regulares.

---

## Diapositiva 45: Lenguajes definidos por Expresiones Regulares

El lenguaje regular $L(E)$ representado por la expresión regular $E$ se define como:
*   $L(\Phi) = \Phi$
*   $L(\epsilon) = \{\epsilon\}$
*   $L(x) = \{x\} \quad (\forall x \in \Sigma)$
*   $L((E_1)) = L(E_1)$
*   $L(E_1 E_2) = L(E_1)L(E_2)$
*   $L(E_1 + E_2) = L(E_1) \cup L(E_2)$
*   $L(E_1^*) = (L(E_1))^*$

---

## Diapositiva 46: Prioridad de Operaciones en ER

Jerarquía de prioridad decreciente establecida para omitir paréntesis en la escritura de expresiones regulares:
1.  **Clausura de Kleene ($^*$)** (Máxima prioridad)
2.  **Concatenación** (Prioridad intermedia)
3.  **Suma ($+$)** (Mínima prioridad)

---

## Diapositiva 47: Expresiones Regulares Equivalentes

**Definición:** Dos expresiones regulares $E_1$ y $E_2$ son equivalentes si y sólo si definen el mismo lenguaje regular.
**Fórmula:**
$$E_1 \equiv E_2 \iff L(E_1) = L(E_2)$$
**Nota:** Por abuso de lenguaje se suele escribir $E_1 = E_2$.

---

## Diapositiva 48: Gramática ($G$): Definición algebraica

Una gramática $G$ es una estructura algebraica definida por la 4-tupla:
$$G = (N, \Sigma, P, S)$$
Donde:
*   **$N$:** Conjunto finito de símbolos no terminales.
*   **$\Sigma$:** Conjunto finito de símbolos terminales (alfabeto, tal que $N \cap \Sigma = \emptyset$).
*   **$S$:** Símbolo inicial o axioma ($S \in N$).
*   **$P$:** Relación de producción finita (reglas gramaticales).

---

## Diapositiva 49: Reglas de Producción: Cabeza

Cada regla de producción de una gramática $G$ se expresa como un par $(\alpha, \alpha') \in P$, denotado por $\alpha \to \alpha'$:
**Cabeza ($\alpha$):** Cadena con por lo menos un símbolo no terminal:
$$\alpha \in (N \cup \Sigma)^* N (N \cup \Sigma)^*$$

---

## Diapositiva 50: Reglas de Producción: Cuerpo

Cada regla de producción de una gramática $G$ se expresa como un par $(\alpha, \alpha') \in P$, denotado por $\alpha \to \alpha'$:
**Cuerpo ($\alpha'$):** Cadena de símbolos terminales y/o no terminales, o cadena vacía:
$$\alpha' \in (N \cup \Sigma)^*$$

---

## Diapositiva 51: Notación de Backus

**Definición:** Notación abreviada utilizada para agrupar múltiples reglas de producción que comparten exactamente la misma cabeza.
**Representación:** Las reglas $\alpha \to \alpha_1, \alpha \to \alpha_2, \dots, \alpha \to \alpha_n$ se abrevian como:
$$\alpha \to \alpha_1 \mid \alpha_2 \mid \dots \mid \alpha_n$$

---

## Diapositiva 52: Relación Deriva

Sean las cadenas $\beta, \delta, \sigma, \mu, \alpha, \alpha' \in (N \cup \Sigma)^*$:
**Deriva Directa ($\underset{G}{\Rightarrow}$):** Proceso de sustitución directa de una cabeza por su cuerpo:
$$\beta \delta \sigma \underset{G}{\Rightarrow} \beta \mu \sigma \iff (\delta \to \mu) \in P$$
**Derivación en Múltiples Pasos ($\overset{*}{\underset{G}{\Rightarrow}}$):** Clausura reflexiva y transitiva de la deriva directa:
$$\alpha \overset{*}{\underset{G}{\Rightarrow}} \alpha' \iff \alpha = \alpha_0 \underset{G}{\Rightarrow} \alpha_1 \underset{G}{\Rightarrow} \dots \underset{G}{\Rightarrow} \alpha_n = \alpha' \quad (n \ge 0)$$

---

## Diapositiva 53: Forma Sentencial

Dada una gramática $G$:
**Forma Sentencial:** Cualquier cadena de símbolos terminales y/o no terminales que puede derivarse desde el axioma $S$:
$$\alpha \in (N \cup \Sigma)^* \text{ es forma sentencial} \iff S \overset{*}{\underset{G}{\Rightarrow}} \alpha$$

---

## Diapositiva 54: Sentencia

Dada una gramática $G$:
**Sentencia:** Una forma sentencial compuesta únicamente por símbolos terminales:
$$w \in \Sigma^* \text{ es sentencia} \iff S \overset{*}{\underset{G}{\Rightarrow}} w$$

---

## Diapositiva 55: Lenguaje Generado por una Gramática ($L(G)$)

**Definición:** El lenguaje $L(G)$ generado por la gramática $G = (N, \Sigma, P, S)$ es el conjunto de todas las sentencias derivables a partir del axioma $S$:
$$L(G) = \{w \in \Sigma^* \mid S \overset{*}{\underset{G}{\Rightarrow}} w$$

---

## Diapositiva 56: Gramática de Estructura de Frase

**Definición:** Gramática cuyas reglas de producción $P$ tienen invariantes a izquierda y derecha del no terminal a derivar:
$$\alpha X \beta \to \alpha \delta \beta \quad (X \in N \quad \text{y} \quad \alpha, \beta, \delta \in (N \cup \Sigma)^*)$$
**Casos especiales:**
*   **Regla no generativa:** $X \to \epsilon$ (cuando $\alpha = \beta = \delta = \epsilon$).
*   **Regla compresora:** $\alpha X \beta \to \alpha \beta$ (cuando $\delta = \epsilon$).

---

## Diapositiva 57: Jerarquía de Chomsky: Clasificación General

Clasificación de las gramáticas en cuatro niveles en función de las restricciones aplicadas sobre la cabeza y el cuerpo de sus producciones:
1.  **Tipo 0:** Gramáticas Irrestrictas o Recursivamente Enumerables.
2.  **Tipo 1:** Gramáticas Dependientes del Contexto.
3.  **Tipo 2:** Gramáticas Libres de Contexto.
4.  **Tipo 3:** Gramáticas Regulares.
**Relación de contención:** $\text{Tipo } 3 \subset \text{Tipo } 2 \subset \text{Tipo } 1 \subset \text{Tipo } 0$.

---

## Diapositiva 58: Jerarquía: Gramática Tipo 0 (Irrestrictas)

**Gramática Tipo 0 (Irrestrictas / Recursivamente Enumerables):**
**Restricción:** Ninguna. Producciones de la forma $\alpha \to \beta$ con $\alpha \in (N \cup \Sigma)^* N (N \cup \Sigma)^*$ y $\beta \in (N \cup \Sigma)^*$

---

## Diapositiva 59: Jerarquía: Gramática Tipo 1 (Dependientes del Contexto)

**Gramática Tipo 1 (Dependientes del Contexto):**
**Restricción:** Estructura de frase y no compresora. Sus reglas $\alpha X \beta \to \alpha \delta \beta$ verifican $\delta \neq \epsilon$.
**Propiedad:** Para toda regla $\alpha \to \beta$ se cumple $|\alpha| \le |\beta|$ (excepto $S \to \epsilon$).

---

## Diapositiva 60: Jerarquía: Gramática Tipo 2 (Libres de Contexto)

**Gramática Tipo 2 (Libres de Contexto / Independientes del Contexto):**
**Restricción:** Estructura de frase donde el miembro izquierdo consta únicamente de un único símbolo no terminal aislado (sin contexto):
$$X \to \alpha \quad (X \in N, \alpha \in (N \cup \Sigma)^*)$$

---

## Diapositiva 61: Jerarquía: Gramática Tipo 3 (Regulares)

**Gramática Tipo 3 (Gramáticas Regulares):**
**Restricción:** Estructura de frase con producciones de un único tipo de linealidad:
- **Lineal por Derecha:**
    $$X \to x \quad \text{ó} \quad X \to xY \quad (X, Y \in N, x \in \Sigma)$$
- **Lineal por Izquierda:**
    $$X \to x \quad \text{ó} \quad X \to Yx \quad (X, Y \in N, x \in \Sigma)$$
*(Se admite $S \to \epsilon$ en el axioma si el lenguaje contiene a $\epsilon$).*

---

## Diapositiva 62: Grafo de Gramática Regular Lineal por Derecha

Dada $G_{LD} = (N, \Sigma, P, S)$, su grafo asociado es un grafo dirigido etiquetado $H = (N \cup \{\epsilon\}, R)$, donde $\epsilon$ representa el nodo de aceptación (doble círculo).
**Definición de arcos:**
1.  Si $S \to \epsilon \in P \implies$ Arco etiquetado con $\epsilon$ de $S$ al nodo $\epsilon$.
2.  Si $X \to x \in P \implies$ Arco etiquetado con $x$ de $X$ al nodo $\epsilon$.
3.  Si $X \to xY \in P \implies$ Arco etiquetado con $x$ de $X$ al nodo $Y$.

---

## Diapositiva 63: Grafo de Gramática Regular Lineal por Izquierda

**Definición:** El grafo asociado a una gramática lineal por izquierda ($G_{LI}$) se define siguiendo los mismos principios estructurales que la lineal por derecha.
**Diferencia de lectura:** Los arcos que involucran un no terminal a la izquierda en el cuerpo ($X \to Yx$) se interpretan según la precedencia espacial del no terminal con respecto al terminal en el proceso de generación.

---

## Diapositiva 64: Árbol de Derivación (Árbol de Parser)

**Árbol de Derivación (Árbol de Parser):** Representación gráfica ordenada de la derivación de una palabra en una Gramática Tipo 2 o Tipo 3.
**Raíz e internos:** Etiquetados con no terminales ($N$).
**Hojas:** Etiquetadas con terminales ($\Sigma$) o $\epsilon$.

---

## Diapositiva 65: Gramática Ambigua

**Gramática Ambigua:** Una gramática es ambigua si y sólo si existe al menos una palabra en su lenguaje que posee dos o más árboles de derivación diferentes.

---

## Diapositiva 66: Construcción del Árbol de Derivación

Reglas algorítmicas de construcción:
1.  **Raíz:** Se etiqueta con el axioma $S$ de la gramática.
2.  **Expansión de producciones:** Para cada nodo etiquetado con un no terminal $A$, al aplicar la regla $A \to Y_1 Y_2 \dots Y_k$, se dibujan $k$ descendientes ordenados de izquierda a derecha etiquetados con $Y_1, \dots, Y_k$.
3.  **Hojas:** Los descendientes etiquetados con terminales o la cadena vacía $\epsilon$ actúan como hojas (nodos terminales sin descendientes).
4.  **Criterio de finalización:** El proceso concluye cuando todos los nodos hoja pertenecen a $\Sigma \cup \{\epsilon\}$.

---

## Diapositiva 67: Lectura del Árbol de Derivación (Frontera)

**Algoritmo de lectura:** Se realiza una búsqueda en profundidad del árbol (de izquierda a derecha por niveles).
**Frontera (Resultado del árbol):** Sucesión de símbolos terminales que etiquetan las hojas recolectadas durante la búsqueda en profundidad.
**Pertenencia:** La cadena obtenida representa la sentencia que pertenece al lenguaje $L(G)$.
