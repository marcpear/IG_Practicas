
precision mediump float;

uniform vec2  u_resolution;   // tamano de la ventana
uniform float u_time;         // segundos desde el inicio

void main() {
  // Rejilla de 9x9 celdas
  vec2 q = gl_FragCoord.xy / u_resolution.y * 9.;
  vec2 i = floor(q);          // indice (columna, fila) de la celda
  vec2 p = fract(q) - .5;     // coordenadas locales, centro de celda en (0,0)

  // Aleatoriedad por celda (hash del Book of Shaders, cap. 10)
  float t = u_time;
  float r = fract(sin(dot(i, vec2(13, 80))) * 5000.);

  // Magnitudes auxiliares
  float a = t * (r - .5) * 3. + r * 6.5;  // giro propio del ángulo de cada celda
                                          // (signo y velocidad segun r)
  float l = length(q - 4.5);              // distancia al centro de la rejilla

  // Rotacion 2D de la celda (Book of Shaders, cap. 8)
  p *= mat2(cos(a), sin(a), -sin(a), cos(a));

  // Cuadrado por distancia de Chebyshev (cap. 7)
  // El factor con sin(t*2 - l) hace que cambie el tamaño
  float d = max(abs(p.x), abs(p.y)) * (1. + .5 * sin(t * 2. - l));

  // Paleta coseno de Inigo Quilez (cap. 6 / iquilezles.org)
  // Fase: hash de la celda + deriva temporal + distancia al centro.
  vec3 col = .5 + .5 * cos(6.3 * (r * .3 + vec3(0, 0.3, 0.4) + t * .05 + l * .1));

  // Mascara y salida
  float m = 1. - smoothstep(.3, .3, d);
  gl_FragColor = vec4(col, 1.) * m;
}
