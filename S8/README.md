# Autor

Marcos Peña Armario [GitHub](https://github.com/marcpear)

## Proyecto

[Repositorio de CodeSandbox](https://codesandbox.io/p/sandbox/throbbing-worker-tqz82h)

Los archivos se cargan directamente desde el Github, es por eso que no se encuentran en el repositorio de CodeSandbox

[Repositorio con los recursos del proyecto](https://github.com/marcpear/IG_Practicas/tree/main/S8)

[Enlace para la ejecución](https://tqz82h.csb.app/)

## Descripción del proyecto

Este proyecto es una aplicación web interactiva en 3D que representa el relieve de Gran Canaria y permite visualizar escenarios de subida del nivel del mar. Está desarrollada con Three.js y combina un mapa de alturas, texturas cartográficas y edificios de OpenStreetMap.

**Características**

- Terreno de Gran Canaria creado a partir de un heightmap y una textura de la isla.
- Vista detallada de una zona urbana con una textura de calles y edificios extruidos a partir de datos OSM.
- Agua representada como un volumen rectangular semitransparente.
- Control manual del nivel del agua mediante un slider y modo automático animado.
- La subida máxima es de 1000 m en la vista general y de 100 m en la vista de edificios.
- Botón para alternar entre la vista general y la vista de edificios, con un menú que se puede contraer.

Los niveles y alturas se muestran como una visualización didáctica. El proyecto no calcula una inundación física ni constituye una predicción científica.

## Controles

- **Modo de control:** selecciona la subida manual o automática.
- **Slider:** cambia el nivel del agua cuando está seleccionado el modo manual.
- **Ver edificios / Volver a vista general:** alterna entre las dos vistas.
- **Botón − / +:** contrae o expande el menú.
- **Cámara:** arrastra con el botón izquierdo para orbitar y usa la rueda del ratón para acercar o alejar.

En la vista de edificios, el zoom está limitado para mantener la zona urbana dentro de la pantalla.

## Ejecución

**Vista general:**

![Vista general](Resultados/Resultado_vistaGeneral.gif)

**Vista edificios**

![Vista Edificios](Resultados/Resultado_vistaCalle.gif)


## Uso de IA

La IA se utilizó como apoyo durante el desarrollo para adaptar ejemplos de Three.js, integrar las texturas y los edificios, y resolver errores de ejecución. También ayudó a documentar las funciones principales del código. La integración y los cambios se revisaron durante el trabajo en CodeSandbox.

## Referencias

- [Three.js](https://threejs.org/)
- [Documentación de Three.js](https://threejs.org/docs/)
- [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [QGIS Documentation](https://docs.qgis.org/)
- [Recursos del proyecto en GitHub](https://github.com/marcpear/IG_Practicas/tree/main/S8)

### Librerías usadas

- [Three.js](https://threejs.org/)
- OrbitControls, incluido en los ejemplos de Three.js
