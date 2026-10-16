# Ejercicio 4 — Contador de frecuencia de palabras

Módulo independiente del framework de pruebas Playwright del resto del repo: no usa sus dependencias,
configuración ni reportes. Está hecho en Node.js puro (sin paquetes externos) y la salida es por consola.

## Estructura

```
word-frequency/
├── src/
│   ├── word-frequency.mjs   # lógica pura: tokenizar, contar, ordenar y formatear
│   └── cli.mjs              # lee el archivo e imprime el reporte
├── samples/ejemplo.txt      # texto del enunciado
└── test/                    # tests con node:test (runner nativo de Node)
```

## Uso

Requiere Node.js 18 o superior. Desde la carpeta `word-frequency/`:

```bash
npm start
```

```bash
npm run histogram
```

```bash
npm test
```

Para analizar cualquier otro archivo:

```bash
node src/cli.mjs ruta/al/archivo.txt
```

Agregando `--bars` se dibuja el histograma con barras además de los números.

### Salida con el texto de ejemplo

```
14 words
99 characters

farmatodo: 6
cuida: 3
salud: 2
tu: 2
toda: 1
```

Con `--bars`:

```
farmatodo: ██████ 6
cuida:     ███ 3
salud:     ██ 2
tu:        ██ 2
toda:      █ 1
```

## Criterios

- **Palabra**: secuencia de letras o dígitos Unicode (acentos y ñ incluidos), con apóstrofes o guiones
  internos permitidos (`don't`, `bien-estar`). La puntuación se ignora y todo se pasa a minúsculas, así
  `Hola`, `hola,` y `¡HOLA!` cuentan como la misma palabra.
- **Caracteres**: se cuentan todos (letras, espacios, tabulaciones, puntuación) excepto los saltos de línea
  (`\n`, `\r\n`, `\r`). Se cuentan code points, así un emoji vale 1.
- **Orden**: por frecuencia descendente; ante empate, alfabético (comparación en español, `Intl.Collator`).

## Complejidad computacional

Siendo **n** la cantidad de caracteres del texto, **w** la cantidad de palabras y **u** la cantidad de
palabras distintas (u ≤ w ≤ n):

| Paso                                       | Tiempo        | Espacio |
| ------------------------------------------ | ------------- | ------- |
| Leer el archivo y contar caracteres        | O(n)          | O(n)    |
| Tokenizar con la regex y pasar a minúscula | O(n)          | O(n)    |
| Contar frecuencias con un `Map` (hash)     | O(w) promedio | O(u)    |
| Ordenar las palabras distintas             | O(u log u)    | O(u)    |
| Imprimir                                   | O(u)          | O(u)    |

**Total: O(n + u log u) en tiempo y O(n) en espacio.** Como u ≤ n, el peor caso es O(n log n), pero en
texto real el vocabulario crece mucho más lento que el texto, así que en la práctica domina el recorrido
lineal O(n). (Estrictamente, cada comparación del ordenamiento cuesta O(L) con L el largo de palabra, que
se considera acotado.)
