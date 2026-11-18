# Shader: Ondas de cuadrados

**Contenido:**

`shader_tiny.frag`: Versión minificada de **375 bytes**,
`shader_comentado.frag`: Igual que el archivo tiny pero comentada
`captura_shader.png`: Captura en algún instante del shader

Para poder usarlo se puede simplemente pegar o cargar el archivo en el [Editor de Book of shaders](https://editor.thebookofshaders.com/)


Una pequeña vista de lo que es el shader en una secuencia de imágenes:

![Captura del shader](captura_shader.gif)

## Motivación

Quise probar a hacer un shader que se representase mediante patrones en forma de rejilla, ya que son los que, a mi parecer, crean un mejor efecto en la pantalla. Además, para que tuviese más gracia, combiné el cambio de tamaño de los cuadrados para dar esa sensación de movimiento, asemejándose a una onda que se propaga desde el centro hacia fuera. Se puede ver que tiene una estética muy parecida al op art de Vasarely, ya que, de los ejemplos de la práctica, es el que me resultó más curioso.

Además, para los colores me inspiré en el trabajo de Íñigo Quilez, ya que el cambio de color mediante el coseno crea un efecto bastante hipnótico.

## Desarrollo

**Rejilla.** Divido la pantalla en 9×9 celdas cuadradas con floor y fract. Cada celda tiene su propio centro en (0,0).

**Aleatoriedad por celda.** A cada celda le asigno un número aleatorio entre 0 y 1 con la función random del Book of Shaders. Ese número no cambia con el tiempo y lo uso para que cada celda sea distinta.

**Rotación dinámica.** Cada cuadrado gira con una velocidad y un sentido que dependen de su número aleatorio, así unos giran a un lado y otros al contrario.

**Forma y onda radial.** Dibujo un cuadrado en cada celda y su tamaño crece y decrece con un sin que depende del tiempo y de la distancia al centro. Así se forma una onda que se propaga hacia fuera en anillos.

**Color.** Uso una paleta con cos (Iñigo Quilez) cuyo color cambia según el número aleatorio de la celda, el tiempo y la distancia al centro.

**Máscara.** Con smoothstep recorto cada cuadrado y dejo el fondo negro. Como los dos umbrales son iguales (.3,.3), el borde queda abrupto.

### Optimización de tamaño

- Las declaraciones se realizaron en una línea reutilizando variables ya calculadas.
- Se pusieron las onstantes sin cero inicial (`.5`) y sin decimales cuando el compilador lo admite en constructores.
- Un solo main, sin funciones auxiliares ni macros `#ifdef` pero se mantiene `precision mediump float;` para no depender de que el editor la añada.
- Nombres de variable de una letra, sin espacios innecesarios.

El archivo ocupa un total de 374 bytes.

## Uso de IA

En este caso la IA se utilizó para recabar y consultar información dentro de [The Book of Shaders](https://thebookofshaders.com) y como guía para redactar este README.

## Fuentes

- [Patricio Gonzalez Vivo y Jen Lowe, *The Book of Shaders*: cap. 6, 7, 8, 9 y 10 entre otros.](https://thebookofshaders.com)
- [Iñigo Quilez, «Palettes» (paleta coseno)](https://iquilezles.org/articles/palettes/)
- [Guion de la práctica Shaders, GitHub otsedom](https://github.com/otsedom/otsedom.github.io/tree/main/IG/S9)
- Victor Vasarely, como inspiración visual.
