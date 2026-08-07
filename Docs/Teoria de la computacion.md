# Diapositivas de Estudio: Teoría de la Computación
## Lenguajes, Lenguajes Regulares y Gramáticas

---

## Diapositiva 1: Alfabeto ($\Sigma$)

**Definición:** Un **alfabeto** es un conjunto finito no vacío de elementos atómicos o indivisibles denominados **símbolos**, que se designa como **$\Sigma$** (Sigma).

---

## Diapositiva 2: Sucesión finita

**Definición:** Una **sucesión finita** es un conjunto ordenado de elementos donde el orden sí importa.
**Distinción:**
- En **sucesiones**, $\{a,b,c\}$ es distinta que $\{b,a,c\}$.
- En **conjuntos**, $\{a,b,c\}$ es igual a $\{b,a,c\}$.
- Dado que las sucesiones son conjuntos ordenados, existen las sucesiones vacías.

---

## Diapositiva 3: Cadena o palabra ($w$)

**Definición:** Una **cadena** o **palabra** designada como $w$, de longitud $|w|=n$ es una sucesión finita de $n$ símbolos de un alfabeto $\Sigma$, tal que para $w=e_1e_2\dots e_n$ con $e_i$ desde $1$ hasta $n$ y $e_i \in \Sigma$.

---

## Diapositiva 4: Cadena vacía o nula ($\epsilon$)

**Definición:** Si la cadena no tiene símbolos, es decir su longitud es 0, entonces se denomina **cadena vacía o nula**, se la denota como $\epsilon$ y $|\epsilon|=0$.

---

## Diapositiva 5: Potencia de un Alfabeto ($\Sigma^k$)

**Definición:** La potencia $k$-ésima de un alfabeto $\Sigma$, denotada por $\Sigma^k$, es el conjunto de todas las posibles cadenas con símbolos de $\Sigma$ de longitud exacta $k$.
**Distinción:**
- $\Sigma$: Conjunto de símbolos.
- $\Sigma^0$: $\{\epsilon\}$ (por convención, para cualquier alfabeto $\Sigma$).
- $\Sigma^1$: Conjunto de cadenas de longitud 1.
- $\Sigma^n$: Conjunto de cadenas de longitud $n$.

---

## Diapositiva 6: Clausura de Kleene de un Alfabeto ($\Sigma^*$)

**Definición:** La **Clausura de Kleene** es el conjunto de todas las posibles cadenas formadas con símbolos de un alfabeto $\Sigma$, incluyendo la cadena vacía $\epsilon$. Es decir, es la union de todas las potencias del alfabeto. Y se denota como $\Sigma^*$ (sigma estrella).

- **Fórmula:** 
$$\Sigma^* = \bigcup_{i=0}^{\infty} \Sigma^i$$
- **Conjunto resultante:**
$$\Sigma^* = \Sigma^0 \cup \Sigma^1 \cup \Sigma^2 \cup \dots$$

---

## Diapositiva 7: Clausura Positiva de un Alfabeto ($\Sigma^+$)

**Definición:** La **Clausura Positiva** es el conjunto de todas las posibles cadenas formadas con símbolos de un alfabeto $\Sigma$, excluyendo la cadena vacía $\epsilon$. Y se denota como $\Sigma^+$ (sigma positiva).
- **Fórmula:** 
$$\Sigma^+ = \bigcup_{i=1}^{\infty} \Sigma^i$$

---

## Diapositiva 8: Relaciones fundamentales entre $\Sigma^*$, $\Sigma^+$ y $\epsilon$

- $\Sigma^* = \Sigma^+ \cup \{\epsilon\}$
- $\Sigma^+ = \Sigma^* - \{\epsilon\}$

---

## Diapositiva 9: Operaciones y Relaciones sobre Cadenas (son 5)

- Concatenación de cadenas ($w_1 w_2$)
- Potencia $k$-ésima de una cadena ($w^k$)
- Igualdad de cadenas ($w_1 = w_2$)
- Subcadena (si $w=w_1w_2w_3$ entonces $w_2$ es subcadena de $w$)
- Prefijo y sufijo (si $w=w_1w_2$ entonces $w_1$ es prefijo de $w$ y $w_2$ es sufijo de $w$)

---

## Diapositiva 10: Operaciones sobre Cadenas: Concatenación

**Definición:** Sean $w_1 = a_1a_2 \dots a_i$ y $w_2 = b_1b_2 \dots b_j$ dos cadenas, entonces la concatenación es la cadena $w_1 w_2 = a_1a_2 \dots a_i b_1b_2 \dots b_j$.
**Longitud resultante:**
$$|w_1 w_2| = |w_1| + |w_2|$$
**Elemento neutro:** La cadena vacía $\epsilon$ es el elemento neutro:
$$\forall w : w\epsilon = \epsilon w = w$$

---

## Diapositiva 11: Operaciones sobre Cadenas: Potencia $k$-ésima de una cadena ($w^k$)

**Definición:** La **potencia $k$-ésima** $w^k$ de una cadena $w$ es la cadena que resulta de concatenar $w^{k-1}$ con $w$ con $w^0 = \epsilon$. La definición recursiva de la potencia $k$-ésima de una cadena $w$ es:
1.  $w^0 = \epsilon$
2.  $w^k = w^{k-1} \cdot w \quad (k \in \mathbb{N})$

$w^k = w^{k-1} w = w^{k-2} w w = \dots = \underbrace{w w w \dots w}_{k \text{ veces}}$ ($k$ cadenas $w$ concatenadas)

---

## Diapositiva 12: Relaciones entre Cadenas: Igualdad ($w_1 = w_2$)

**Definición:** Dos **cadenas son iguales** si y sólo si tienen los mismos símbolos, en el mismo orden y de la misma longitud:
$$w_1 = w_2 \iff (\forall i : 1 \le i \le n \implies a_i = b_i) \land (|w_1| = |w_2|)$$

---

## Diapositiva 13: Relaciones entre Cadenas: Subcadena

**Definición:** La cadena $w_2$ es **subcadena** de una cadena $w$, si existen cadenas $w_1$ y $w_3$ tales que $w = w_1 w_2 w_3$. Las cadenas $w_1$ y $w_3$ pueden ser vacías, por lo tanto cada cadena es subcadena de sí misma.

---

## Diapositiva 14: Relaciones entre Cadenas: Prefijo y Sufijo

**Definición:** Si la cadena $w = w_1 w_2$ entonces $w_1$ es **prefijo** de $w$ y $w_2$ es **sufijo** de $w$. Como $w_1$ o $w_2$ pueden ser vacías, entonces cada cadena es prefijo y sufijo de sí misma.

---

## Diapositiva 15: Las cadenas tienen 9 propiedades y estas son:

- Propiedad 1: **Longitud no negativa**
- Propiedad 2: **Longitud nula = $\epsilon$**
- Propiedad 3: **Aditividad de longitud en la concatenación**
- Propiedad 4: **Longitud de subcadena**
- Propiedad 5: **Identidad (Neutro) en la concatenación**
- Propiedad 6: **Asociatividad en la concatenación**
- Propiedad 7: **No conmutatividad en la concatenación**
- Propiedad 8: **Cancelación en la concatenación**
- Propiedad 9: **Concatenación nula**

---

## Diapositiva 16: Propiedad de las cadenas 1 de 9: Longitud no negativa

Si $x \in \Sigma^*$ es una cadena arbitraria:
*   **Longitud no negativa:** Toda cadena tiene una longitud mayor o igual a 0. $|x| \ge 0$.

---

## Diapositiva 17: Propiedad de las cadenas 2 de 9: Longitud nula = $\epsilon$

Si $x \in \Sigma^*$ es una cadena arbitraria:
*   **Longitud nula = $\epsilon$:** Si la longitud de una cadena es 0, entonces esa cadena es $\epsilon$. $|x| = 0 \iff x = \epsilon$.

---

## Diapositiva 18: Propiedad de las cadenas 3 de 9: Aditividad de longitud en la concatenación

Si $x, y \in \Sigma^*$ son cadenas arbitrarias:
*   **Aditividad de longitud en la concatenación:** La longitud de la concatenación de dos cadenas es la suma de sus longitudes. $|xy| = |x| + |y|$.

---

## Diapositiva 19: Propiedad de las cadenas 4 de 9: Longitud de subcadena

Si $x, y \in \Sigma^*$ son cadenas arbitrarias:
*   **Longitud de subcadena:** Si $w_1$ es subcadena de $w$, entonces la longitud de $w_1$ es menor o igual a la longitud de $w$. $|w_1| \le |w|$.

---

## Diapositiva 20: Propiedad de las cadenas 5 de 9: Identidad (Neutro) en la concatenación

Si $x \in \Sigma^*$ es una cadena arbitraria:
*   **Identidad (Neutro) en la concatenación:** La cadena vacía $\epsilon$ es el elemento neutro de la concatenación. $x\epsilon = \epsilon x = x$.

---

## Diapositiva 21: Propiedad de las cadenas 6 de 9: Asociatividad en la concatenación

Si $x, y, z \in \Sigma^*$ son cadenas arbitrarias:
*   **Asociatividad en la concatenación:** La concatenación es asociativa. $x(yz) = (xy)z = x y z$.

---

## Diapositiva 22: Propiedad de las cadenas 7 de 9: No conmutatividad en la concatenación

Si $x, y \in \Sigma^*$ son cadenas arbitrarias:
*   **No conmutatividad en la concatenación:** La concatenación no es conmutativa. $xy \neq yx$ en general.

---

## Diapositiva 23: Propiedad de las cadenas 8 de 9: Cancelación en la concatenación

Si $x, y, z \in \Sigma^*$ son cadenas arbitrarias:
*   **Cancelación en la concatenación:** Si una cadena $x$ es igual a la concatenación de dos cadenas $yz$ y $x=y$, entonces la otra cadena es $\epsilon$. Si $x = yz \land x = y \implies z = \epsilon$.

---

## Diapositiva 24: Propiedad de las cadenas 9 de 9: Concatenación nula

Si $x, y \in \Sigma^*$ son cadenas arbitrarias:
*   **Concatenación nula:** Si la concatenación de dos cadenas es $\epsilon$, entonces ambas cadenas son $\epsilon$. $xy = \epsilon \implies x = \epsilon \land y = \epsilon$.

---

## Diapositiva 25: Lenguaje ($L$)

**Definición:** Un lenguaje $L$ sobre un alfabeto $\Sigma$ es un conjunto de cadenas de símbolos de dicho alfabeto:
$$L \subseteq \Sigma^*$$

*Es decir que un lenguaje $L$ es subconjunto de $\Sigma^*$.*

---

## Diapositiva 26: Casos Especiales de Lenguajes (2)
- **Lenguaje vacío:** $L = \emptyset$ (no tiene elementos).
- **Lenguaje unitario vacío:** $L = \{\epsilon\}$ (tiene un elemento: la cadena vacía).
- Tanto el lenguaje vacío como el unitario vacío son lenguajes comunes a todos los alfabetos.
- **Estos dos conjuntos NO SON IGUALES:** $\emptyset \neq \{\epsilon\}$.

---
## Diapositiva 27: Representaciones de los Lenguajes (3)

Las tres formas clásicas de representar un lenguaje son:
- **Por Extensión** (enumeración)
- **Por Comprensión** (predicado lógico)
- **Con Parámetros** (expresión con variables)

---
## Diapositiva 28: Representación de un Lenguaje: Por Extensión

**La representación por extensión** consiste en enumerar las cadenas que forman el lenguaje (esta representación es aplicable sólo a lenguajes finitos).

---
## Diapositiva 29: Representación de un Lenguaje: Por Comprensión

**La representación por compresión** consiste en definir la propiedad lógica o predicado que deben satisfacer las cadenas:
$$L = \{x \in \Sigma^* \mid P(x)\}$$

---
## Diapositiva 30: Representación de un Lenguaje: Con Parámetros

**La representación con parámetros** consiste en definir una expresión con variables (parámetros) que representan las cadenas del lenguaje, y se especifican las restricciones que deben cumplir estos parámetros:
$$L = \{w \in \Sigma^* \mid w = f(\alpha, \beta, \dots) \text{ con condiciones para } \alpha, \beta, \dots\}$$

---

## Diapositiva 31: Representación con Parámetros: Prefijos y Sufijos que se Solapan

**Definición:** Cuando un lenguaje exige que sus cadenas tengan un prefijo $P$ y un sufijo $S$ que pueden solaparse o ser idénticos ($P = S = X$), la expresión paramétrica directa $w = X \alpha X$ omitirá la cadena mínima (ya que si $\alpha = \epsilon$ generaría $XX$).
**Regla:** Se debe utilizar la **unión de conjuntos** para contemplar los casos solapados e independientes:
- **Prefijo y sufijo idénticos ($P=S=ta$):**
  $$L = \{w \in \Sigma^* \mid w = ta \alpha ta, \alpha \in \Sigma^*\} \cup \{ta\}$$
- **Prefijo $at$ y sufijo $ta$ (solapamiento parcial en $t$):**
  $$L = \{w \in \Sigma^* \mid w = at \alpha ta, \alpha \in \Sigma^*\} \cup \{ata\}$$

---

## Diapositiva 32: Representación con Parámetros: Longitudes Pares e Impares

**Definición:** Para definir la longitud de las cadenas o partes de ellas sin utilizar lenguaje coloquial (parámetros puros), se utilizan potencias y multiplicadores en los exponentes:
- **Longitud Par ($|w|$ es par):**
  - $L = \{w \in \Sigma^* \mid w = \alpha, \alpha \in (\Sigma^2)^*\}$
  - O bien con exponentes: $L = \{w \in \Sigma^* \mid w \in \Sigma^{2k}, k \ge 0\}$
- **Longitud Impar ($|w|$ es impar):**
  - $L = \{w \in \Sigma^* \mid w = a \alpha, \alpha \in (\Sigma^2)^*\}$ (con $a \in \Sigma$)
  - O bien con exponentes: $L = \{w \in \Sigma^* \mid w \in \Sigma^{2k+1}, k \ge 0\}$
- **Longitud múltiplo de $m$:**
  - $L = \{w \in \Sigma^* \mid w = \alpha, \alpha \in (\Sigma^m)^*\}$

---

## Diapositiva 33: Representación con Parámetros: Regla de Intercalado y Unión en Solapamientos

**Procedimiento:** Cuando un lenguaje requiere prefijo, subcadena y sufijo simultáneos que pueden solaparse:
1. **Caso base (Intercalado estándar):** Se intercalan variables entre patrones:
   $$w = \text{prefijo } \alpha \text{ subcadena } \beta \text{ sufijo}, \quad \alpha, \beta \in \Sigma^*$$
2. **Añadir uniones para cada solapamiento posible:** Para cada forma en que la subcadena o sufijo se superpongan parcialmente.
3. **Unión de la palabra totalmente solapada:** Añadir el conjunto unitario de la cadena mínima completamente solapada.
*Ejemplo en $\Sigma=\{a,b,e,m\}$ para prefijo $bem$, subcadena $emma$ y sufijo $ma$:*
$$L = \{w \in \Sigma^* \mid w = bem\alpha emma\beta ma, \alpha,\beta \in \Sigma^*\} \cup \{bem \delta emma, \delta \in \Sigma^*\} \cup \{bemma\gamma ma, \gamma \in \Sigma^*\} \cup \{bemma\}$$

---
## Diapositiva 34: Operaciones con Lenguajes (7)

Las operaciones fundamentales sobre lenguajes son:
- **Unión**
- **Intersección**
- **Complemento**
- **Diferencia**
- **Concatenación**
- **Potencia $k$-ésima**
- **Clausuras** (de Kleene y Positiva)

---

## Diapositiva 35: Operaciones con Lenguajes: Unión

Sean $L_1$ y $L_2$ lenguajes sobre un mismo alfabeto $\Sigma$:
**Unión ($L_1 \cup L_2$):** Lenguaje cuyas cadenas pertenecen a $L_1$ o a $L_2$:
$$L_1 \cup L_2 = \{w \in \Sigma^* \mid w \in L_1 \lor w \in L_2\}$$

---

## Diapositiva 36: Operaciones con Lenguajes: Intersección

Sean $L_1$ y $L_2$ lenguajes sobre un mismo alfabeto $\Sigma$:
**Intersección ($L_1 \cap L_2$):** Lenguaje cuyas cadenas pertenecen a $L_1$ y a $L_2$:
$$L_1 \cap L_2 = \{w \in \Sigma^* \mid w \in L_1 \land w \in L_2\}$$

---

## Diapositiva 37: Operaciones con Lenguajes: Complemento

Sea $L$ un lenguaje sobre un alfabeto $\Sigma$:
**Complemento ($\overline{L}$):** Lenguaje formado por todas las cadenas de $\Sigma^*$ que no pertenecen a $L$:
- Notación algebraica: $\overline{L} = \Sigma^* - L$
- Notación por compresión: $\overline{L} = \{w \in \Sigma^* \mid w \notin L\}$

---

## Diapositiva 38: Operaciones con Lenguajes: Diferencia (resta)

Sean $L_1$ y $L_2$ lenguajes sobre un mismo alfabeto $\Sigma$:
- **Diferencia ($L_1 - L_2$):** Lenguaje cuyas cadenas pertenecen a $L_1$ pero no pertenecen a $L_2$:
$$L_1 - L_2 = \{w \in \Sigma^* \mid w \in L_1 \land w \notin L_2\}$$

---

## Diapositiva 39: Operaciones con Lenguajes: Concatenación

Sean $L_1$ y $L_2$ lenguajes sobre un alfabeto $\Sigma$:
**Concatenación ($L_1 L_2$):** Lenguaje obtenido al concatenar cadenas de $L_1$ con cadenas de $L_2$:
$$L_1 L_2 = \{w \in \Sigma^* \mid \exists w_1 \in L_1, \exists w_2 \in L_2 : w = w_1 w_2\}$$

---

## Diapositiva 40: Operaciones con Lenguajes: Potencia $k$-ésima de un Lenguaje

Sea $L$ un lenguaje no vacío sobre $\Sigma$:
**Potencia $k$-ésima ($L^k$):** Concatenación de $L$ consigo mismo $k$ veces:
$$L^k = \{w \in \Sigma^* \mid w = w_1 w_2 \dots w_k, \text{ con } w_i \in L \text{ para } 1 \le i \le k\}$$
**Caso base:** $L^0 = \{\epsilon\}$ (la potencia 0 de un lenguaje, es el lenguaje unitario vacío).

---
## Diapositiva 41: Operaciones con Lenguajes: Clausuras (2)

Las dos operaciones de clausura de un lenguaje son:
- **Clausura de Kleene de un Lenguaje ($L^*$)**
- **Clausura Positiva de un Lenguaje ($L^+$)**

---
## Diapositiva 42: Operaciones con Lenguajes: Clausura de Kleene de un Lenguaje ($L^*$)

Sea un lenguaje $L \neq \emptyset$ (un lenguaje no vacío) sobre $\Sigma$:
**Clausura de Kleene de un Lenguaje ($L^*$):** Es la unión de todas las potencias del lenguaje:
$$L^* = \bigcup_{i=0}^{\infty} L^i$$

---
## Diapositiva 43: Operaciones con Lenguajes: Clausura Positiva de un Lenguaje ($L^+$)

Sea un lenguaje $L \neq \emptyset$ (un lenguaje no vacío) sobre $\Sigma$:
**Clausura Positiva de un Lenguaje ($L^+$):** Es la unión de todas las potencias del lenguaje excluyendo la potencia cero:
$$L^+ = \bigcup_{i=1}^{\infty} L^i$$

---
## Diapositiva 44: Relaciones entre $L^*$, $L^+$ y $\{\epsilon\}$

Para cualquier lenguaje $L \neq \emptyset$ (un lenguaje no vacío) sobre $\Sigma$ se cumplen las siguientes relaciones fundamentales:
- **$L^* = L^+ \cup \{\epsilon\}$**
- **$L^+ = L^* - \{\epsilon\}$**

---
## Diapositiva 45: Propiedades de las Operaciones de Lenguajes (12)

* **Propiedades de la Concatenación de Lenguajes:** Propiedades 1, 2 y 3.
* **Propiedades de la Concatenación respecto de otras operaciones:** Propiedades 4 y 5.
* **Propiedades de la Unión e Intersección de Lenguajes:** Propiedad 6.
* **Propiedades de la Clausura Positiva:** Propiedades 7 y 11.
* **Propiedades de las Potencias y de la Clausura de Kleene:** Propiedades 8, 9, 10 y 12.


---
## Diapositiva 46: Propiedades de la Concatenación de Lenguajes (3)

- **Propiedad 1 — Elemento neutro:** La cadena vacía $\epsilon$ es el elemento neutro para la concatenación: $L{\epsilon} = {\epsilon}L = L$.
- **Propiedad 2 — Asociatividad:** La concatenación es asociativa: $L_1(L_2L_3) = (L_1L_2)L_3 = L_1L_2L_3$.
- **Propiedad 3 — No conmutatividad:** La concatenación no es conmutativa: $L_1L_2 \neq L_2L_1$.

---
## Diapositiva 47: Propiedades de la Concatenación (distributiva) respecto de la Unión e Intersección (2)

- **Propiedad 4 — Distributividad respecto de la unión:** La concatenación es distributiva respecto de la unión: $L_1(L_2 \cup L_3) = L_1L_2 \cup L_1L_3$.
- **Propiedad 5 — No distributividad respecto de la intersección:** La concatenación no es distributiva respecto de la intersección: $L_1(L_2 \cap L_3) \neq L_1L_2 \cap L_1L_3$.

---
## Diapositiva 48: Propiedades de la Unión e Intersección de Lenguajes (7)

Como los lenguajes son conjuntos, la unión ($\cup$) y la intersección ($\cap$) verifican las siguientes propiedades algebraicas fundamentales:
- **Asociativa**
- **Conmutativa**
- **Distributiva** (de cada una respecto de la otra)
- **Idempotencia**
- **Absorción**
- **Elementos Neutros** (de la unión y de la intersección)

---
## Diapositiva 49: Propiedades de la Unión e Intersección: Asociativa y Conmutativa

Sean $L_1$, $L_2$ y $L_3$ lenguajes sobre un mismo alfabeto $\Sigma$:
- **Asociativa:**
  - Unión: $L_1 \cup (L_2 \cup L_3) = (L_1 \cup L_2) \cup L_3$
  - Intersección: $L_1 \cap (L_2 \cap L_3) = (L_1 \cap L_2) \cap L_3$
- **Conmutativa:**
  - Unión: $L_1 \cup L_2 = L_2 \cup L_1$
  - Intersección: $L_1 \cap L_2 = L_2 \cap L_1$

---
## Diapositiva 50: Propiedades de la Unión e Intersección: Distributiva e Idempotencia

Sean $L_1$, $L_2$ y $L_3$ lenguajes sobre un mismo alfabeto $\Sigma$:
- **Distributiva (de cada una respecto de la otra):**
  - Unión respecto a intersección: $L_1 \cup (L_2 \cap L_3) = (L_1 \cup L_2) \cap (L_1 \cup L_3)$
  - Intersección respecto a unión: $L_1 \cap (L_2 \cup L_3) = (L_1 \cap L_2) \cup (L_1 \cap L_3)$
- **Idempotencia:**
  - Unión: $L \cup L = L$
  - Intersección: $L \cap L = L$

---
## Diapositiva 51: Propiedades de la Unión e Intersección: Absorción y Elementos Neutros

Sean $L$, $L_1$ y $L_2$ lenguajes sobre un mismo alfabeto $\Sigma$:
- **Absorción:**
  - $L_1 \cup (L_1 \cap L_2) = L_1$
  - $L_1 \cap (L_1 \cup L_2) = L_1$
- **Elementos Neutros:**
  - Elemento neutro de la unión ($\emptyset$): $L \cup \emptyset = \emptyset \cup L = L$
  - Elemento neutro de la intersección ($\Sigma^*$): $L \cap \Sigma^* = \Sigma^* \cap L = L$

---
## Diapositiva 52: Propiedades de la Clausura Positiva

* **Propiedad 7 — Cadena vacía:**
  $$\epsilon \in L \iff \epsilon \in L^+$$

*Esto sucede porque $\epsilon \in L^1$, y como $L^1 \subseteq L^+$, entonces $\epsilon \in L^+$.*

---
## Diapositiva 53: Propiedades de la Clausura de Kleene

* **Propiedad 8 — Las potencias de $L$ son subconjunto de $L^*$:**
  $$\forall i:\quad L^i \subseteq L^*$$

* **Propiedad 9 — Idempotencia de la clausura de Kleene:**
  $$(L^*)^* = L^*$$

* **Propiedad 10 — Conmutatividad con la clausura de Kleene:**
  $$LL^* = L^*L$$

---

## Diapositiva 54: Propiedades entre las Clausuras
* **Propiedad 11 — Relación entre $L^+$ y $L^*$:**
  $$L^+ \subseteq L^*$$
* **Propiedad 12 — Relación con la Clausura de Kleene:**
  $$L^+ = LL^* = L^*L$$

---

## Diapositiva 55: Definición de Problema

**Definición de Problema:** En teoría de la computación, un problema se define formalmente como: El proceso de determinar si una cadena de caracteres pertenece o no a un lenguaje $L$ determinado, sobre un alfabeto $\Sigma$.
$$w \in L ?$$

---
## Diapositiva 56: Lenguajes infinitos y descripciones finitas

Dado que los lenguajes pueden ser potencialmente infinitos, el problema central es encontrar una **descripción finita** que permita definir si una palabra pertenece o no a un lenguaje.

Una **descripción finita** consiste en definir un lenguaje potencialmente infinito aplicando una cantidad finita de operaciones a un número finito de lenguajes básicos.

---

## Diapositiva 57: Lenguaje Regular (LR)

Un **lenguaje $L$**, sobre un alfabeto $\Sigma$, **es regular** si se puede generar a partir de:
- **Los lenguajes básicos:** **$\emptyset$** (lenguaje vacío), **$\{\epsilon\}$** (lenguaje unitario vacío) y **$\{x \mid x \in \Sigma\}$** (lenguajes unitarios de los símbolos de $\Sigma$).
- **Utilizando las operaciones:** unión, concatenación, clausura de Kleene y/o clausura positiva, aplicadas un número finito de veces.

---
## Diapositiva 58: Lenguajes Regulares finitos o infinitos

Los lenguajes regulares pueden ser finitos o infinitos, pero siempre se deben generar a partir de un número finito de operaciones. Esto permite que los Autómatas Finitos puedan reconocerlos, ya que presentan regularidades o repeticiones de sus elementos.

*Recordar que un Autómata Finito tiene memoria finita y no puede contar infinitamente.*

---

## Diapositiva 59: Propiedades de los Lenguajes Regulares (1 a 6)

Si $L_1$ y $L_2$ son lenguajes regulares sobre $\Sigma$, entonces también son regulares:
1.  **Unión:** $L_1 \cup L_2$
2.  **Intersección:** $L_1 \cap L_2$
3.  **Concatenación:** $L_1 L_2$
4.  **Complemento:** $\overline{L_1} = \Sigma^* - L_1$
5.  **Clausura de Kleene:** $L_1^*$
6.  **Clausura Positiva:** $L_1^+$

---

## Diapositiva 60: Propiedades de los Lenguajes Regulares (Generalizaciones)

Se derivan por inducción matemática a partir de las propiedades básicas:
*   La **unión finita** de lenguajes regulares es un lenguaje regular.
*   La **intersección finita** de lenguajes regulares es un lenguaje regular.
*   La **concatenación finita** de lenguajes regulares es un lenguaje regular.

---

## Diapositiva 61: Lenguajes NO Regulares

Existen lenguajes que puede definirse de forma finita (por medio de formulas matemáticas finitas), pero NO SON regulares (ya que no se construyen a partir de los conjuntos básicos y de las operaciones mencionadas). Cualquier lenguajes que requiera contar infinitamente no es regular, ya que los AF tienen memoria limitada.

---

## Diapositiva 62: Ejemplos de Lenguajes No Regulares

- $L_1=\{a^i b^i\mid i\in\mathbb{N}\}$, no es regular porque los AF no pueden contar que la cantidad de b's sea igual a la cantidad de a's.
- Sobre $\Sigma = \{0,1\}$ $L_2=\{\text{las palabras cuyo número de unos es mayor al número de ceros}\}$, no es regular porque los AF no pueden contar infinitamente que la cantidad de 1's sea mayor a la cantidad de 0's.
- Sobre $\Sigma = \{0, 1, \dots, 9\}$, $L_3 = \{\text{palabras que son sufijos de la expansión decimal del número } \pi\}$, no es regular porque la regla debe ser finita y determinística, mientras que la secuencia de decimales de $\pi$ es infinita e irracional (no periódica).

---

## Diapositiva 63: Expresión Regular (ER)

Dada una expresión regular sobre un alfabeto $\Sigma$, se define inductivamente como:
1.  **Caso Base 1:** El lenguaje vacío $\emptyset$ es una ER.
2.  **Caso Base 2:** La cadena vacía $\epsilon$ es una ER.
3.  **Caso Base 3:** $x$ es una ER, para cualquier $x \in \Sigma$.
4.  **Paso Inductivo:** Si $E_1$ y $E_2$ son ER, entonces $(E_1)$, $(E_2)$, $E_1 E_2$, $(E_1 + E_2)$, $(E_1)^*$ y $(E_2)^*$ son expresiones regulares.

*Si E es una ER, entonces su forma agrupada (usando paréntesis) es también una ER.*

---

## Diapositiva 64: Lenguajes generados por ER elementales

*   $L(\emptyset) = \emptyset$: El lenguaje generado por la ER vacía es el lenguaje vacío.
*   $L(\epsilon) = \{\epsilon\}$: El lenguaje generado por la ER de la cadena vacía es el lenguaje unitario vacío, que solo contiene a la cadena vacía $\epsilon$.
*   $L(x) = \{x\} \quad (\forall x \in \Sigma)$ El lenguaje generado por la ER que contiene a un único símbolo $x$ es el lenguaje unitario que contiene a $x$, siendo $x$ cada uno de los símbolos de $\Sigma$.

> Ojo con $L(x)=\{x \mid x \in \Sigma\}$, ya que esto generaría el conjunto de todos los símbolos del alfabeto y no los conjuntos unitarios para cada símbolo del alfabeto.
---

## Diapositiva 65: Lenguajes generados por operaciones de las ER
*   **$L((E_1)) = L(E_1)$:** El lenguaje generado por la **agrupación** de una ER es el lenguaje generado simplemente por la ER.
*   **$L(E_1 E_2) = L(E_1)L(E_2)$:** El lenguaje generado por la **concatenación** de dos ER es la concatenación de los lenguajes generados por cada ER.
*   **$L((E_1 + E_2)) = L(E_1) \cup L(E_2)$:** El lenguaje generado por la **suma** de dos ER es la unión de los lenguajes generados por cada ER.
*   **$L((E_1)^*) = (L(E_1))^*$:** El lenguaje generado por la **clausura de Kleene** de una ER es la clausura de Kleene del lenguaje generado por la ER.

---

## Diapositiva 66: Prioridad de Operaciones en ER

En la escritura de ER los parentesis se pueden omitir si se sigue la siguiente prioridad de operaciones:
1.  **Clausura de Kleene ($^*$)** (Máxima prioridad)
2.  **Concatenación** (Prioridad intermedia)
3.  **Suma ($+$)** (Mínima prioridad)

---

## Diapositiva 67: Expresiones Regulares Equivalentes

**Definición:** Dos expresiones regulares $E_1$ y $E_2$ son equivalentes si y sólo si definen el mismo lenguaje regular.
**Fórmula:**
$$E_1 \equiv E_2 \iff L(E_1) = L(E_2)$$
**Nota:** Por abuso de lenguaje se suele escribir $E_1 = E_2$.

---

## Diapositiva 68: Guía Práctica de Construcción de Expresiones Regulares

Patrones fundamentales para construir Expresiones Regulares a partir de descripciones coloquiales:
- **Universo del Alfabeto ($\Sigma^*$):** Si $\Sigma = \{a,b\}$, la ER es `(a + b)*`.
- **Prefijo fijo $P$:** $P \cdot \Sigma^*$ (ejemplo con prefijo $aca$ en $\Sigma=\{a,b,c\}$: `aca(a + b + c)*`).
- **Sufijo fijo $S$:** $\Sigma^* \cdot S$ (ejemplo con sufijo $ca$ en $\Sigma=\{a,b,c\}$: `(a + b + c)*ca`).
- **Subcadena fija $Sub$:** $\Sigma^* \cdot Sub \cdot \Sigma^*$ (ejemplo con subcadena $aa$: `(a + b + c)*aa(a + b + c)*`).
- **Solapamiento en ER ($P = S = X$):** $X + X \cdot \Sigma^* \cdot X$ (ejemplo con prefijo y sufijo $baca$: `baca + baca(a + b + c)*baca`).

---

## Diapositiva 69: Construcción de ERs: Conteo de Símbolos y Restricciones Numéricas

- **Definición $\Sigma_{resto}$:** Alfabeto excluyendo el símbolo $x$ a contar ($\Sigma - \{x\}$).
- **Exactamente una ocurrencia de $x$:** $\Sigma_{resto}^* \cdot x \cdot \Sigma_{resto}^*$ (ejemplo en $\Sigma = \{a,b\}$ con una sola $b$: `a* b a*`).
- **Número par de $x$:** $(\Sigma_{resto}^* \cdot x \Sigma_{resto}^* \cdot x \Sigma_{resto}^*)^*$ ó bien $(\Sigma_{resto}^* + x \Sigma_{resto}^* x)^*$.
- **Número impar de $x$:** $\Sigma_{resto}^* \cdot x \cdot \Sigma_{resto}^* \cdot (\Sigma_{resto}^* \cdot x \Sigma_{resto}^* \cdot x \Sigma_{resto}^*)^*$.
- **Dígitos sin ceros a la izquierda (Números naturales):** En $\Sigma = \{0, 1, 2, 3\}$, un número no comienza con $0$ salvo el número $0$ por sí solo:
  $$\text{ER} = 0 + (1 + 2 + 3)(0 + 1 + 2 + 3)^*$$

---

## Diapositiva 70: Gramática ($G$): Definición algebraica

Una gramática $G$ es una estructura algebraica definida por la 4-tupla:
$$G = (N, \Sigma, P, S)$$
Donde:
*   **$N$:** Conjunto finito de símbolos no terminales.
*   **$\Sigma$:** Conjunto finito de símbolos terminales (alfabeto, tal que $N \cap \Sigma = \emptyset$).
*   **$P$:** Reglas de producción finitas (reglas gramaticales o simplemente producciones).
*   **$S$:** Símbolo inicial o axioma ($S \in N$).

---

## Diapositiva 71: Convenciones de Notación en Gramáticas

Para facilitar la representación y lectura de las reglas gramaticales $G = (N, \Sigma, P, S)$, se adoptan las siguientes convenciones sintácticas:
- **Símbolos No Terminales ($N$):** Letras mayúsculas $A, B, C, \dots, S, X, Y, Z$. Se utilizan $X, Y, Z$ como comodines/variables generales.
- **Símbolos Terminales ($\Sigma$):** Letras minúsculas $a, b, c, \dots, x, y, z$. Se utilizan $x, y, z$ como comodines.
- **Cadenas de Terminales ($\Sigma^*$):** Se representan con la letra $w$.
- **Cadenas Mixtas ($(N \cup \Sigma)^*$):** Se representan con letras griegas $\alpha, \beta, \gamma, \delta, \pi, \rho$ (y la cadena vacía con $\epsilon$).

---

## Diapositiva 72: Definición de las reglas de producción

Las reglas de producción son pares que pertenecen al conjunto $P$, tal que $(\alpha, \alpha') \in P$. Por comodidad, se expresan como relaciones de producción, tal que $\alpha \to \alpha'$.

> Se lee "alfa produce alfa prima" o "alfa se reescribe como alfa prima".

---

## Diapositiva 73: Cabeza y Cuerpo de las reglas de producción

Las reglas de producción tienen dos partes:
- **Cabeza ($\alpha$):** Es una **cadena** con por lo menos un símbolo no terminal:
$$\alpha \in (N \cup \Sigma)^* N (N \cup \Sigma)^*$$
- **Cuerpo ($\alpha'$):** Es una **cadena** de símbolos terminales y/o no terminales, o la cadena vacía:
$$\alpha' \in (N \cup \Sigma)^*$$

---

## Diapositiva 74: Notación de Backus

**Definición:** Notación abreviada utilizada para agrupar múltiples reglas de producción que comparten exactamente la misma cabeza.
**Representación:** Las reglas $\alpha \to \alpha_1, \alpha \to \alpha_2, \dots, \alpha \to \alpha_n$ se abrevian como:
$$\alpha \to \alpha_1 \mid \alpha_2 \mid \dots \mid \alpha_n$$

---

## Diapositiva 75: Relación Deriva

Sean las cadenas $\beta, \delta, \sigma, \mu, \alpha, \alpha' \in (N \cup \Sigma)^*$:
**Deriva Directa ($\underset{G}{\Rightarrow}$):** Proceso de sustitución directa de una cabeza por su cuerpo:
$$\beta \delta \sigma \underset{G}{\Rightarrow} \beta \mu \sigma \iff (\delta \to \mu) \in P$$
**Derivación en Múltiples Pasos ($\overset{*}{\underset{G}{\Rightarrow}}$):** Clausura reflexiva y transitiva de la deriva directa:
$$\alpha \overset{*}{\underset{G}{\Rightarrow}} \alpha' \iff \alpha = \alpha_0 \underset{G}{\Rightarrow} \alpha_1 \underset{G}{\Rightarrow} \dots \underset{G}{\Rightarrow} \alpha_n = \alpha' \quad (n \ge 0)$$

---

## Diapositiva 76: Forma Sentencial

**Forma Sentencial:** Dada una gramática $G$, cualquier cadena que posea símbolos no terminales, que se pueda derivar desde el axioma, se denomina **forma sentencial**.
**Fórmula:**
$$\alpha \in (N \cup \Sigma)^* \text{ es forma sentencial} \iff S \overset{*}{\underset{G}{\Rightarrow}} \alpha$$

---

## Diapositiva 77: Sentencia

**Sentencia:** Dada una gramática $G$, cualquier cadena compuesta solo por simbolos terminales y que se deriva desde el axioma, se denomina **sentencia**.
**Fórmula:**
$$w \in \Sigma^* \text{ es sentencia} \iff S \overset{*}{\underset{G}{\Rightarrow}} w$$

---

## Diapositiva 78: Lenguaje Generado por una Gramática ($L(G)$)

**Definición:** $L(G)$ es el lenguaje generado por la gramática $G = (N, \Sigma, P, S)$, es decir, es el conjunto de todas las sentencias derivables a partir del axioma $S$:
$$L(G) = \{w \in \Sigma^* \mid S \overset{*}{\underset{G}{\Rightarrow}} w\}$$

---

## Diapositiva 79: Lenguaje Reverso o Reflexo ($L^{-1}(G)$)

**Definición:** El lenguaje reverso o reflexo $L^{-1}(G)$ de un lenguaje $L(G)$ es el conjunto formado por las cadenas reversas de $L(G)$, tal que para $w = a_1 a_2 \dots a_n \in L(G) \implies w^{-1} = a_n \dots a_2 a_1 \in L^{-1}(G)$.
**Propiedad fundamental:** Si $L(G_1) = L^{-1}(G_2)$ con $L(G_1) \neq L(G_2)$, las gramáticas $G_1$ y $G_2$ **no son gramáticas equivalentes** (generan lenguajes distintos, uno reverso del otro).

---

## Diapositiva 80: Gramática de Estructura de Frase

**Definición:** Una gramática se dice que es **Gramática de estructura de frase** si en la cabeza de sus reglas de producción $P$ tienen partes invariantes a izquierda ($\alpha$) y derecha ($\beta$) del símbolo no terminal $X$ a derivar:
$$\alpha X \beta \to \alpha \delta \beta \quad (X \in N \quad \text{y} \quad \alpha, \beta, \delta \in (N \cup \Sigma)^*)$$
**Casos especiales:**
*   **Regla no generativa:** $X \to \epsilon$ (cuando $\alpha = \beta = \delta = \epsilon$).
*   **Regla compresora:** $\alpha X \beta \to \alpha \beta$ (cuando $\delta = \epsilon$).

---

## Diapositiva 81: Gramática de Estructura de Frase: Contraejemplo de Invariancia

**Regla general GEF:** La regla $\alpha X \beta \to \alpha \delta \beta$ exige que la parte izquierda ($\alpha$) y derecha ($\beta$) del símbolo no terminal $X$ sean **invariantes** (no cambien de lado ni de forma en el cuerpo).
**Contraejemplo de regla NO GEF ($CB \to BC$):**
- **Si $X = C$:** En la cabeza $\alpha = \epsilon$ y $\beta = B$. En el cuerpo la parte derecha debería ser $B$, pero $B$ aparece a la izquierda ($BC$). No es invariante.
- **Si $X = B$:** En la cabeza $\alpha = C$ y $\beta = \epsilon$. En el cuerpo la parte izquierda debería ser $C$, pero $C$ aparece a la derecha ($BC$). Tampoco es invariante.
**Conclusión:** La regla $CB \to BC$ no cumple la condición GEF.

---

## Diapositiva 82: Jerarquía de Chomsky: Clasificación General

Clasificación de las gramáticas en cuatro niveles en función de las restricciones aplicadas sobre la cabeza y el cuerpo de sus producciones:
1.  **Tipo 0:** Gramáticas Irrestrictas o Recursivamente Enumerables.
2.  **Tipo 1:** Gramáticas Dependientes del Contexto.
3.  **Tipo 2:** Gramáticas Libres de Contexto.
4.  **Tipo 3:** Gramáticas Regulares.
**Relación de contención:** $\text{Tipo } 3 \subset \text{Tipo } 2 \subset \text{Tipo } 1 \subset \text{Tipo } 0$.

---

## Diapositiva 83: Jerarquía: Gramática Tipo 0 (Irrestrictas)

**Gramática Tipo 0 (Irrestrictas / Recursivamente Enumerables):**
**Restricción:** Ninguna. Producciones de la forma $\alpha \to \beta$ con $\alpha \in (N \cup \Sigma)^* N (N \cup \Sigma)^*$ y $\beta \in (N \cup \Sigma)^*$

---

## Diapositiva 84: Jerarquía: Gramática Tipo 1 (Dependientes del Contexto)

**Gramática Tipo 1 (Dependientes del Contexto):**
**Restricción:** Estructura de frase y no compresora. Sus reglas $\alpha X \beta \to \alpha \delta \beta$ verifican $\delta \neq \epsilon$.
**Propiedad:** Para toda regla $\alpha \to \beta$ se cumple $|\alpha| \le |\beta|$ (excepto $S \to \epsilon$).

---

## Diapositiva 85: Jerarquía: Gramática Tipo 2 (Libres de Contexto)

**Gramática Tipo 2 (Libres de Contexto / Independientes del Contexto):**
**Restricción:** Estructura de frase donde el miembro izquierdo consta únicamente de un único símbolo no terminal aislado (sin contexto):
$$X \to \alpha \quad (X \in N, \alpha \in (N \cup \Sigma)^*)$$

---

## Diapositiva 86: Jerarquía: Gramática Tipo 3 (Regulares)

**Gramática Tipo 3 (Gramáticas Regulares):**
**Restricción:** Estructura de frase con producciones de un único tipo de linealidad:
- **Lineal por Derecha:**
    $$X \to x \quad \text{ó} \quad X \to xY \quad (X, Y \in N, x \in \Sigma)$$
- **Lineal por Izquierda:**
    $$X \to x \quad \text{ó} \quad X \to Yx \quad (X, Y \in N, x \in \Sigma)$$
*(Se admite $S \to \epsilon$ en el axioma si el lenguaje contiene a $\epsilon$).*

---

## Diapositiva 87: Impacto de la Regla $S \to \epsilon$ según la Jerarquía de Chomsky

La regla $S \to \epsilon$ permite que un lenguaje incluya la cadena vacía ($\epsilon \in L(G)$). Su comportamiento según la clasificación es:
- **Gramática de Estructura de Frase:** Actúa como una regla compresora (cuando $\alpha = \beta = \delta = \epsilon$).
- **Tipo 0 (Irrestrictas):** Cumple directamente la definición general ($\text{cabeza} = S \in N$, $\text{cuerpo} = \epsilon$).
- **Tipo 1 (Dependientes del Contexto):** Excepción explícita a la restricción no compresora ($|\alpha| \le |\beta|$).
- **Tipo 2 (Libres de Contexto):** Cumple la restricción formal ($X \to \alpha$ con $X = S$ y $\alpha = \epsilon$).
- **Tipo 3 (Regulares):** Es la única excepción permitida donde el cuerpo no contiene símbolos terminales ni no terminales.

---

## Diapositiva 88: Grafo Asociado a una Gramática Regular Lineal por Derecha

Dada una **gramática regular lineal por derecha** **($G_{LD} = (N, \Sigma, P, S)$)**, su **grafo asociado** es un grafo dirigido etiquetado $H = (N \cup \{\epsilon\}, R)$ (donde $N \cup \{\epsilon\}$ son los vértices y $R$ es el conjunto de aristas) y el vértice de aceptación es $\epsilon$ (el cual se representa con un círculo doble).

> Los vértices son el conjunto de símbolos no terminales más el estado de aceptación ($\epsilon$).
> Las aristas se etiquetan con símbolos terminales y los símbolos no terminales definen que nodos son unidos por las aristas.

---

## Diapositiva 89: Grafo Asociado a una Gramática Regular Lineal por Izquierda

Dada una **gramática regular lineal por izquierda** **($G_{LI} = (N, \Sigma, P, S)$)**, su **grafo asociado** es un grafo dirigido etiquetado $H = (N \cup \{\epsilon\}, R)$ (donde $N \cup \{\epsilon\}$ son los vértices y $R$ es el conjunto de aristas) y el vértice de aceptación es $\epsilon$ (el cual se representa con un círculo doble).

> La lectura tanto para por derecha como por izquierda es igual, mas alla que la produccion sea $X -> xY$ o $X -> Yx$, se lee como "de X se puede llegar a Y con el terminal x".

---

## Diapositiva 90: Definición de Aristas del Grafo Asociado a una Gramática Regular

**Definición de Aristas:**
1.  Si $S \to \epsilon \in P \implies$ Aristas etiquetadas con $\epsilon$ de $S$ al nodo $\epsilon$.
2.  Si $X \to x \in P \implies$ Aristas etiquetadas con $x$ de $X$ al nodo $\epsilon$.
3.  Para Derecha: Si $X \to xY \in P \implies$ Aristas etiquetadas con $x$ de $X$ al nodo $Y$.
4.  Para Izquierda: Si $X \to Yx \in P \implies$ Aristas etiquetadas con $x$ de $X$ al nodo $Y$.

---

## Diapositiva 91: Árbol de Derivación (Árbol de Parser)

**Árbol de Derivación (Árbol de Parser):** Es la representación gráfica ordenada de la derivación de **una palabra** en una Gramática Tipo 2 o Tipo 3.
**Raíz e internos:** Nodos etiquetados con símbolos no terminales que pertenecen a $N$.
**Hojas:** Nodos etiquetados con símbolos terminales que pertenecen a $\Sigma$ o con la cadena vacía $\epsilon$.

---

## Diapositiva 92: Gramática Ambigua

**Gramática Ambigua:** Una gramática es ambigua si y sólo si existe al menos una palabra en su lenguaje que posee dos o más árboles de derivación diferentes.

---

## Diapositiva 93: Construcción del Árbol de Derivación

Reglas algorítmicas de construcción:
1.  **Raíz:** Se etiqueta con el axioma $S$ de la gramática.
2.  **Expansión de producciones:** Para cada nodo etiquetado con un no terminal $A$, al aplicar la regla $A \to Y_1 Y_2 \dots Y_k$, se dibujan $k$ descendientes ordenados de izquierda a derecha etiquetados con $Y_1, \dots, Y_k$.
3.  **Hojas:** Los descendientes etiquetados con terminales o la cadena vacía $\epsilon$ actúan como hojas (nodos terminales sin descendientes).
4.  **Criterio de finalización:** El proceso concluye cuando todos los nodos hoja pertenecen a $\Sigma \cup \{\epsilon\}$.

---

## Diapositiva 94: Lectura del Árbol de Derivación (Frontera)

**Algoritmo de lectura:** Se realiza una búsqueda en profundidad del árbol (de izquierda a derecha por niveles).
**Frontera (Resultado del árbol):** Sucesión de símbolos terminales que etiquetan las hojas recolectadas durante la búsqueda en profundidad.
**Pertenencia:** La cadena obtenida representa la sentencia que pertenece al lenguaje $L(G)$.
