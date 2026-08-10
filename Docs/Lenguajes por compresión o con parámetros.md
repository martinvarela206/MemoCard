# Definición de Lenguajes Formales

Existen dos enfoques principales para definir lenguajes mediante conjuntos: **Por Compresión** y **Con Parámetros**.

---

### 1. Definición por Compresión (Propiedades)

- Siempre comienza con $L = \{w \in \Sigma^* \mid \dots \}$ o bien $L = \{w \in \Sigma^* \mid \dots}$ cuando la longitud sea fija.
- Consiste en definir el lenguajes utilizando condiciones lógicas y lenguaje técnico, sin introducir parámetros ni exponentes.
- Se deben usar términos como: *"tiene longitud"*, *"tiene prefijo..."*, *"tiene sufijo..."*, *"comienza con..."*, *"termina con..."*, etc.
- Los conectores lógicos también se escriben en lenguaje natural.
- Si alguna regla no puede escribirse de forma sencilla en lenguaje técnico, hay que recurrir al uso de parámetros.

---

### 2. Definición con Parámetros (Constructiva)

- Siempre comienza con $L = \{w \in \Sigma^* \mid \dots \}$ o bien $L = \{w \in \Sigma^k \mid \dots}$ cuando la longitud sea fija.
- Consiste en definir el lenguaje mediante una ecuación con parámetros de subcadena y variables de potencia.
- Representar las subcadenas utilizando **letras griegas** ($\alpha, \beta, \delta$, etc.) y declarar explícitamente a qué conjunto pertenecen (ej: $\alpha \in \Sigma^*$, $\alpha \in \Sigma^2$, $\alpha,\beta \in \{y,z\}$).
- **Nunca** usar subcadenas del tipo $w_i$.
- Para potencias o repeticiones de símbolos/subcadenas, usar variables numéricas ($n, i, j, k$, etc.) y aclarar a qué conjunto pertenecen (ej. $n \in \mathbb{N}_0$, $n \ge 1$).

---

## Ejemplos

### $L_1$ sobre $\Sigma = \{x,y,z\}$ esta formado por las cadenas de longitud 5 y prefijo zyx.

1. $L_1 = \{w \in \Sigma^* \mid w \text{ tiene longitud 5 y prefijo con zyx}\}$ (Cuando se utilice lenguaje natural hay que usar lenguaje técnico como prefijo, sufijo, longitud, etc.)
2. $L_1 = \{w \in \Sigma^5 \mid w \text{ comienza con zyx}\}$ (Cuando la longitud es fija, puede cambiarse la clausura por la potencia.)
3. $L_1 = \{w \in \Sigma^* \mid w=zyx\alpha,\alpha \in \Sigma^2\}$ (Nunca hay que usar $w_i$ como cadena variable, si o si hay que usar parámetros $\alpha$.)

### $L_2$ sobre $\Sigma = \{x,y,z\}$ esta formado por cadenas de longitud 3 que no repiten símbolos y tienen sufijo x.

1. $L_2 =\{w \in \Sigma^* \mid w \text{ tiene longitud 3, no repite símbolos y tiene sufijo x}\}$
2. $L_2 =\{w \in \Sigma^3 \mid w = \alpha\beta x, \alpha,\beta \in \{y,z\} \land \alpha \ne \beta\}$

### $L_3$ sobre $\Sigma = \{x,y,z\}$ esta formado por cadenas que comienzan por x y terminan con z.

1. $L_3 = \{w \in \Sigma^* \mid w \text{ tiene prefijo x y sufijo con z}\}$
2. $L_3 = \{w \in \Sigma^* \mid w=x\alpha z, \alpha \in \Sigma^*\}$

### $L_4$ sobre $\Sigma = \{x,y,z\}$ esta formado por las cadenas que tienen prefijo z y es seguido por subcadenas xy un número par de veces.

1. $L_4 = \{w \in \Sigma^* \mid w \text{ tiene prefijo z y es seguido por subcadenas xy un número par de veces}\}$
2. $L_4 = \{w \in \Sigma^* \mid w=z\alpha, \alpha \in \{xy\}^{2n}, n \in \mathbb{N}_0\}$ (Cuando se use otro tipo de variables hay que aclarar a que conjunto pertenecen.)
3. $L_4 = \{w \in \Sigma^* \mid w=z\alpha, \alpha = (xy)^{2n}, n \in \mathbb{N}_0 \}$ (esto no se va hacia ERs? y por lo tanto no sería por compresión?)

### $L_5$ sobre $\Sigma = \{a,b,c\}$ esta formado por cadenas con prefijo de a lo sumo 3 b consecutivas.

1. $L_5 = \{w \in \Sigma^* \mid w=\alpha\beta\delta, \alpha \in \{\epsilon,b,bb,bbb\}, \beta \in \{a,c\}^+, \delta \in \Sigma^* \}$ (Ojo: Esto fuerza que exista un sufijo, y por lo tanto bbb no puede ser una palabra, cuando en realidad si lo es)
2. $L_5 = \{w \in \Sigma^* \mid w=\alpha\beta\delta \lor w=\alpha, \alpha \in \{\epsilon,b,bb,bbb\}, \beta \in \{a,c\}^+, \delta \in \Sigma^*\}$
3. En este caso, hablar de "a lo sumo" no es sencillo en lenguaje natural técnico, por lo tanto si o si hay que recurrir a parámetros.

### $L_6$ sobre $\Sigma = \{a,b,c\}$ esta formado por cadenas que tienen prefijo baca y sufijo caba.
1. $L_6 = \{w \in \Sigma^* \mid w=baca\alpha caba, \alpha \in \Sigma^* : \} \cup \{bacaba\}$ (Ojo, a diferencia del $L_3$, el prefijo y el sufijo se solapan.)

### $L_7$ sobre $\Sigma = \{a,c,n,t\}$ esta formado por cadenas de longitud menor a 6 y prefijo aca.

1. $L_7 = \{w \in \Sigma^* \mid w \text{ es de longitud menor a 6 y tiene prefijo } aca\}$
2. $L_7 = \{w \in \Sigma^* \mid w=aca\alpha, \alpha \in (\Sigma^0 \cup \Sigma^1 \cup \Sigma^2)\}$


### $L_8$ sobre $\Sigma = \{a,c,n,t\}$ esta formado por cadenas de longitud menor a 3, que no repiten símbolos y que terminan en n.

1. Por compresión es muy complejo, conviene hacerlo por parámetros.
2. $L_8 = \{w \in \Sigma^* \mid w=\alpha n \land |w|<3, \alpha \in \{a,c,t\}\}$ 

### $L_9$ sobre $\Sigma = \{a,c,n,t\}$ esta formado por cadenas con sufijo tana, longitud impar y menor que 6.

1. Por compresión es muy complejo.
2. $L_9 = \{ w \in \Sigma^5 \mid w=\alpha tana, \alpha \in \Sigma^1\}$

### $L_{10}$ sobre $\Sigma = \{a,c,n,t\}$ esta formado por cadenas que comienzan por a.

1. $L_{10} = \{w \in \Sigma^* \mid w \text{ comienza por } a\}$
2. $L_{10} = \{w \in \Sigma^* \mid w=a\alpha, \alpha \in \Sigma^*\}$