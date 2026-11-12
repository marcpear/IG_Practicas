import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

//Recursos del proyecto alojados en GitHub
const URL = {
  heightmap:
    "https://raw.githubusercontent.com/marcpear/IG_Practicas/main/S8/heightmap.png",
  mapaIsla:
    "https://raw.githubusercontent.com/marcpear/IG_Practicas/main/S8/mapa_color2.png",
  mapaCalles:
    "https://raw.githubusercontent.com/marcpear/IG_Practicas/main/S8/mapa_calle.png",
  edificios:
    "https://raw.githubusercontent.com/marcpear/IG_Practicas/main/S8/edificios.osm"
};

//Coordenadas geográficas de la isla y del mapa detallado
const LIMITES = {
  isla: {
    oeste: -15.992468497,
    este: -15.247386626,
    sur: 27.712797589,
    norte: 28.237870506
  },
  calles: {
    oeste: -15.44362,
    este: -15.41905,
    sur: 28.13138,
    norte: 28.14508
  }
};

//Parámetros de escala y límites de la subida del agua
const ESCALA_RELIEVE = 0.2;
const ALTURA_REFERENCIA = 1790;
const SUBIDA_MAXIMA = 1000;
const SUBIDA_MAXIMA_EDIFICIOS = 100;
const DURACION_AUTO = 15;
const GROSOR_AGUA = 0.035;

//Materiales de la parte superior, inferior y laterales del agua
const materialLateralAgua = new THREE.MeshBasicMaterial({
  color: 0x075b91,
  transparent: true,
  opacity: 0.85,
  depthWrite: false,
  side: THREE.DoubleSide
});

const materialSuperiorAgua = new THREE.MeshBasicMaterial({
  color: 0x168eea,
  transparent: true,
  opacity: 0.58,
  depthWrite: false,
  side: THREE.DoubleSide
});

const materialInferiorAgua = new THREE.MeshBasicMaterial({
  color: 0x04334f,
  transparent: true,
  opacity: 0.55,
  depthWrite: false,
  side: THREE.DoubleSide
});

//En BoxGeometry las caras +Z y -Z son los índices 4 y 5
const materialesAgua = [
  materialLateralAgua,
  materialLateralAgua,
  materialLateralAgua,
  materialLateralAgua,
  materialSuperiorAgua,
  materialInferiorAgua
];

//Variables compartidas por las funciones del proyecto
let scene, camera, renderer, orbit;
let terreno, agua, parcheCalles, edificios;
let pixelsAltura, anchoAltura, altoAltura;
let anchoIsla, altoIsla, anchoParche, altoParche;
let centroParcheX, centroParcheY;
let vistaEdificios = false;
let cargaEdificios = false;
let cargaCalles = false;
let tiempoAuto = 0;
let distanciaVistaEdificios = 0;
let posicionGeneral, objetivoGeneral;

let panel, contenidoMenu, selectorModo, sliderNivel;
let textoNivel, textoCalles;
let botonContraer, botonAlternar;

let modo = "manual";
let subida = 0;

const reloj = new THREE.Clock();

iniciar();

//Prepara la escena la cámara las luces y los controles
function iniciar() {
  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x101820);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.001,
    100
  );
  camera.position.set(0, 0, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.body.appendChild(renderer.domElement);

  orbit = new OrbitControls(camera, renderer.domElement);
  posicionGeneral = camera.position.clone();
  objetivoGeneral = orbit.target.clone();

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  const luz = new THREE.DirectionalLight(0xffffff, 0.6);
  luz.position.set(-3, 4, 5);
  scene.add(luz);

  edificios = new THREE.Group();
  scene.add(edificios);

  crearMenu();
  cargarRecursos();

  window.addEventListener("resize", redimensionar);
  animar();
}

//Crea el menú y conecta sus controles con las funciones
function crearMenu() {
  panel = document.createElement("div");
  panel.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    width: 280px;
    color: white;
    background: rgba(0, 0, 0, 0.78);
    font: 14px monospace;
    z-index: 10;
  `;

  panel.innerHTML = `
    <div id="cabeceraMenu"
      style="display:flex;align-items:center;justify-content:space-between;padding:12px">
      <strong>Subida del nivel del mar</strong>
      <button id="contraerMenu" aria-label="Contraer menú"
        style="font-size:18px;padding:0 8px;cursor:pointer">−</button>
    </div>

    <div id="contenidoMenu" style="padding:0 12px 12px">
      <label for="modoControl">Modo de control</label>
      <select id="modoControl"
        style="display:block;width:100%;padding:6px;margin:6px 0 10px">
        <option value="manual">Manual: usar el slider</option>
        <option value="automatico">Automático: subida animada</option>
      </select>

      <input id="sliderNivel" type="range" min="0" max="${SUBIDA_MAXIMA}"
        step="1" value="0" style="width:100%">

      <div id="textoNivel" style="margin-top:7px"></div>
      <div id="textoCalles" style="font-size:12px;margin-top:10px">
        Cargando mapa de calles…
      </div>

      <button id="alternarVista" disabled
        style="width:100%;padding:7px;margin-top:9px">
        Ver edificios
      </button>
    </div>
  `;

  document.body.appendChild(panel);

  contenidoMenu = panel.querySelector("#contenidoMenu");
  selectorModo = panel.querySelector("#modoControl");
  sliderNivel = panel.querySelector("#sliderNivel");
  textoNivel = panel.querySelector("#textoNivel");
  textoCalles = panel.querySelector("#textoCalles");
  botonContraer = panel.querySelector("#contraerMenu");
  botonAlternar = panel.querySelector("#alternarVista");

  selectorModo.addEventListener("change", cambiarModo);
  sliderNivel.addEventListener("input", cambiarSlider);
  botonAlternar.addEventListener("click", alternarVista);

  botonContraer.addEventListener("click", () => {
    const contraido = contenidoMenu.style.display === "none";
    contenidoMenu.style.display = contraido ? "block" : "none";
    botonContraer.textContent = contraido ? "−" : "+";
    botonContraer.setAttribute(
      "aria-label",
      contraido ? "Contraer menú" : "Expandir menú"
    );
  });

  actualizarTextoNivel();
}

//Carga el relieve y los mapas y después crea el terreno y el agua
function cargarRecursos() {
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");

  loader.load(
    URL.heightmap,
    (heightmap) => {
      heightmap.colorSpace = THREE.NoColorSpace;
      guardarAlturas(heightmap.image);

      loader.load(
        URL.mapaIsla,
        (texturaIsla) => {
          texturaIsla.colorSpace = THREE.SRGBColorSpace;
          crearTerreno(heightmap, texturaIsla);
          crearAgua();
          cargarMapaCalles(loader);
          cargarEdificios();
        },
        undefined,
        (error) => {
          console.error("No se pudo cargar mapa_color2.png:", error);
          textoCalles.textContent = "Error al cargar el mapa de la isla.";
        }
      );
    },
    undefined,
    (error) => {
      console.error("No se pudo cargar heightmap.png:", error);
      textoCalles.textContent = "Error al cargar el heightmap.";
    }
  );
}

//Usa la imagen de alturas para dar relieve al plano de la isla
function crearTerreno(heightmap, texturaIsla) {
  const aspecto = heightmap.image.width / heightmap.image.height;
  altoIsla = 4;
  anchoIsla = altoIsla * aspecto;

  terreno = new THREE.Mesh(
    new THREE.PlaneGeometry(anchoIsla, altoIsla, 200, 140),
    new THREE.MeshPhongMaterial({
      map: texturaIsla,
      displacementMap: heightmap,
      displacementScale: ESCALA_RELIEVE
    })
  );

  scene.add(terreno);
}

//Crea el agua como una caja para que tenga grosor visible
function crearAgua() {
  agua = new THREE.Mesh(
    new THREE.BoxGeometry(anchoIsla, altoIsla, GROSOR_AGUA),
    materialesAgua
  );

  agua.position.z = alturaAgua() - GROSOR_AGUA / 2;
  scene.add(agua);
}

//Carga la textura detallada y crea su parche sobre el terreno
function cargarMapaCalles(loader) {
  loader.load(
    URL.mapaCalles,
    (textura) => {
      textura.colorSpace = THREE.SRGBColorSpace;
      textura.anisotropy = renderer.capabilities.getMaxAnisotropy();

      crearParcheCalles(textura);
      cargaCalles = true;
      textoCalles.textContent = "Mapa de calles cargado.";
      actualizarBoton();
    },
    undefined,
    (error) => {
      console.error("No se pudo cargar mapa_calle.png:", error);
      textoCalles.textContent = "Error al cargar el mapa de calles.";
    }
  );
}

//Coloca el mapa detallado sobre el relieve de la zona de edificios
function crearParcheCalles(textura) {
  const { oeste, este, sur, norte } = LIMITES.calles;

  anchoParche =
    0.005 + ((este - oeste) / (LIMITES.isla.este - LIMITES.isla.oeste)) *
    anchoIsla;

  altoParche =
   0.005 + ((norte - sur) / (LIMITES.isla.norte - LIMITES.isla.sur)) *
    altoIsla;

  const esquinaSO = aEscena(oeste, sur);
  const esquinaNE = aEscena(este, norte);
  centroParcheX = (esquinaSO.x + esquinaNE.x) / 2;
  centroParcheY = (esquinaSO.y + esquinaNE.y) / 2;

  const segmentosX = 160;
  const segmentosY = Math.max(
    60,
    Math.round(segmentosX * altoParche / anchoParche)
  );
  const posiciones = [];
  const uvs = [];
  const indices = [];
  const puntosPorFila = segmentosX + 1;

  //Cada vértice sigue la altura del terreno y recibe una coordenada de textura
  for (let fila = 0; fila <= segmentosY; fila++) {
    const v = fila / segmentosY;
    const lat = sur + v * (norte - sur);

    for (let col = 0; col <= segmentosX; col++) {
      const u = col / segmentosX;
      const lon = oeste + u * (este - oeste);
      const punto = aEscena(lon, lat);

      posiciones.push(punto.x, punto.y, alturaEn(lon, lat) + 0.0002);
      uvs.push(u, v);
    }
  }

  for (let fila = 0; fila < segmentosY; fila++) {
    for (let col = 0; col < segmentosX; col++) {
      const a = fila * puntosPorFila + col;
      const b = a + 1;
      const c = a + puntosPorFila;
      const d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
  }

  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(posiciones, 3)
  );
  geometria.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometria.setIndex(indices);
  geometria.computeVertexNormals();

  parcheCalles = new THREE.Mesh(
    geometria,
    new THREE.MeshBasicMaterial({
      map: textura,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    })
  );

  parcheCalles.visible = false;
  scene.add(parcheCalles);
}

//Guarda los píxeles del heightmap para consultar alturas por coordenada
function guardarAlturas(imagen) {
  const canvas = document.createElement("canvas");
  canvas.width = imagen.width;
  canvas.height = imagen.height;

  const contexto = canvas.getContext("2d", { willReadFrequently: true });
  contexto.drawImage(imagen, 0, 0);

  pixelsAltura = contexto.getImageData(
    0,
    0,
    imagen.width,
    imagen.height
  ).data;

  anchoAltura = imagen.width;
  altoAltura = imagen.height;
}

//Descarga los edificios de OpenStreetMap
function cargarEdificios() {
  fetch(URL.edificios)
    .then((respuesta) => {
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      return respuesta.text();
    })
    .then(procesarOSM)
    .catch((error) => {
      console.error("No se pudo cargar edificios.osm:", error);
    });
}

//Lee los edificios del archivo OSM y crea una forma 3D para cada uno
function procesarOSM(xml) {
  const documento = new DOMParser().parseFromString(xml, "application/xml");

  if (documento.getElementsByTagName("parsererror").length) {
    console.error("No se pudo interpretar el archivo OSM.");
    return;
  }

  const nodos = new Map(
    [...documento.getElementsByTagName("node")].map((nodo) => [
      nodo.getAttribute("id"),
      {
        lat: Number(nodo.getAttribute("lat")),
        lon: Number(nodo.getAttribute("lon"))
      }
    ])
  );

  let total = 0;

  for (const way of documento.getElementsByTagName("way")) {
    const tags = Object.fromEntries(
      [...way.getElementsByTagName("tag")].map((tag) => [
        tag.getAttribute("k"),
        tag.getAttribute("v")
      ])
    );

    if (!tags.building || tags.building === "no") continue;

    const puntos = [...way.getElementsByTagName("nd")]
      .map((nd) => nodos.get(nd.getAttribute("ref")))
      .filter(Boolean);

    if (puntos.length < 3) continue;

    const fuera = puntos.some(
      (punto) =>
        punto.lon < LIMITES.isla.oeste ||
        punto.lon > LIMITES.isla.este ||
        punto.lat < LIMITES.isla.sur ||
        punto.lat > LIMITES.isla.norte
    );

    if (fuera) continue;

    crearEdificio(puntos, tags);
    total++;
  }

  cargaEdificios = total > 0;
  actualizarBoton();
}

//Extruye la silueta del edificio y la coloca sobre la altura del terreno
function crearEdificio(puntos, tags) {
  const coordenadas = puntos.map((punto) => aEscena(punto.lon, punto.lat));
  const forma = new THREE.Shape();

  forma.moveTo(coordenadas[0].x, coordenadas[0].y);
  coordenadas.slice(1).forEach((punto) => forma.lineTo(punto.x, punto.y));
  forma.closePath();

  const centro = puntos.reduce(
    (resultado, punto) => ({
      lon: resultado.lon + punto.lon / puntos.length,
      lat: resultado.lat + punto.lat / puntos.length
    }),
    { lon: 0, lat: 0 }
  );

  const altura = parseFloat(String(tags.height || "").replace(",", "."));
  const niveles = parseFloat(tags["building:levels"]);
  const metros =
    Number.isFinite(altura) && altura > 0
      ? altura
      : Number.isFinite(niveles) && niveles > 0
        ? niveles * 3
        : 6;

  const tipo = String(tags.building).toLowerCase();
  const color =
    tipo.includes("industrial") || tipo.includes("warehouse")
      ? 0x9eaaa8
      : tipo.includes("commercial") || tipo.includes("retail")
        ? 0xd3b98b
        : 0xc9c2ad;

  const edificio = new THREE.Mesh(
    new THREE.ExtrudeGeometry(forma, {
      depth:
        (THREE.MathUtils.clamp(metros, 3, 120) / ALTURA_REFERENCIA) *
        ESCALA_RELIEVE,
      bevelEnabled: false
    }),
    new THREE.MeshPhongMaterial({
      color,
      side: THREE.DoubleSide
    })
  );

  edificio.position.z = alturaEn(centro.lon, centro.lat);
  edificios.add(edificio);
}

//Convierte longitud y latitud en posiciones dentro de la escena 3D
function aEscena(longitud, latitud) {
  const fx =
    (longitud - LIMITES.isla.oeste) /
    (LIMITES.isla.este - LIMITES.isla.oeste);

  const fy =
    (latitud - LIMITES.isla.sur) /
    (LIMITES.isla.norte - LIMITES.isla.sur);

  return {
    x: (fx - 0.5) * anchoIsla,
    y: (fy - 0.5) * altoIsla,
    fx,
    fy
  };
}

//Consulta el heightmap para obtener la altura del terreno
function alturaEn(longitud, latitud) {
  if (!pixelsAltura) return 0;

  const punto = aEscena(longitud, latitud);
  const x = THREE.MathUtils.clamp(
    Math.round(punto.fx * (anchoAltura - 1)),
    0,
    anchoAltura - 1
  );

  const y = THREE.MathUtils.clamp(
    Math.round((1 - punto.fy) * (altoAltura - 1)),
    0,
    altoAltura - 1
  );

  return (
    (pixelsAltura[(y * anchoAltura + x) * 4] / 255) *
    ESCALA_RELIEVE
  );
}

//Cambia al mapa detallado y limita la subida del agua a 100 m
function verEdificios() {
  if (!cargaEdificios || !cargaCalles || !parcheCalles) return;

  vistaEdificios = true;
  terreno.visible = false;
  parcheCalles.visible = true;

  agua.geometry.dispose();
  agua.geometry = new THREE.BoxGeometry(
    anchoParche,
    altoParche,
    GROSOR_AGUA
  );
  agua.position.set(
    centroParcheX,
    centroParcheY,
    alturaAgua() - GROSOR_AGUA / 2
  );

  //Reinicia la animación o limita el nivel manual al máximo de esta vista
  if (modo === "automatico") {
    tiempoAuto = 0;
    subida = 0;
  } else {
    subida = Math.min(subida, SUBIDA_MAXIMA_EDIFICIOS);
  }

  actualizarLimiteSlider();
  actualizarAgua();
  actualizarTextoNivel();

  const caja = new THREE.Box3().setFromObject(parcheCalles);
  const centro = caja.getCenter(new THREE.Vector3());
  const fovV = THREE.MathUtils.degToRad(camera.fov);
  const fovH = 2 * Math.atan(Math.tan(fovV / 2) * camera.aspect);

  distanciaVistaEdificios = Math.max(
    anchoParche / (2 * Math.tan(fovH / 2)),
    altoParche / (2 * Math.tan(fovV / 2))
  ) * 1.08;

  orbit.target.copy(centro);
  camera.position.set(
    centro.x,
    centro.y,
    centro.z + distanciaVistaEdificios
  );

  orbit.minDistance = distanciaVistaEdificios * 0.72;
  orbit.maxDistance = distanciaVistaEdificios * 1.12;
  orbit.enablePan = false;
  orbit.update();

  actualizarBoton();
}

//Vuelve al terreno completo y restaura el límite de 1000 m
function verGeneral() {
  vistaEdificios = false;
  terreno.visible = true;
  parcheCalles.visible = false;

  agua.geometry.dispose();
  agua.geometry = new THREE.BoxGeometry(
    anchoIsla,
    altoIsla,
    GROSOR_AGUA
  );
  agua.position.set(
    0,
    0,
    alturaAgua() - GROSOR_AGUA / 2
  );

  //Reinicia la animación para evitar saltos al cambiar de vista
  if (modo === "automatico") {
    tiempoAuto = 0;
    subida = 0;
  }

  actualizarLimiteSlider();
  actualizarAgua();
  actualizarTextoNivel();

  orbit.minDistance = 0;
  orbit.maxDistance = Infinity;
  orbit.enablePan = true;

  camera.position.copy(posicionGeneral);
  orbit.target.copy(objetivoGeneral);
  orbit.update();

  actualizarBoton();
}

//Alterna entre la vista general y la vista de edificios
function alternarVista() {
  if (vistaEdificios) {
    verGeneral();
  } else {
    verEdificios();
  }
}

function actualizarBoton() {
  const listo = cargaEdificios && cargaCalles && parcheCalles;
  botonAlternar.disabled = !listo;
  botonAlternar.textContent = vistaEdificios
    ? "Volver a vista general"
    : "Ver edificios";
}

//Devuelve el máximo de subida permitido en la vista activa
function maximoSubidaActual() {
  return vistaEdificios ? SUBIDA_MAXIMA_EDIFICIOS : SUBIDA_MAXIMA;
}

function actualizarLimiteSlider() {
  if (!sliderNivel) return;

  sliderNivel.max = String(maximoSubidaActual());
  sliderNivel.value = String(Math.round(subida));
}

//Cambia entre control manual y automático
function cambiarModo() {
  modo = selectorModo.value;

  if (modo === "automatico") {
    tiempoAuto = 0;
    subida = 0;
    sliderNivel.disabled = true;
  } else {
    sliderNivel.disabled = false;
    subida = Math.min(Number(sliderNivel.value), maximoSubidaActual());
  }

  actualizarLimiteSlider();
  actualizarAgua();
  actualizarTextoNivel();
}

//Lee el slider y actualiza la posición del agua
function cambiarSlider() {
  if (modo !== "manual") return;

  subida = THREE.MathUtils.clamp(
    Number(sliderNivel.value),
    0,
    maximoSubidaActual()
  );

  actualizarAgua();
  actualizarTextoNivel();
}

//Convierte los metros de subida en altura dentro de la escena 3D
function alturaAgua() {
  return 0.0001 + (subida / ALTURA_REFERENCIA) * ESCALA_RELIEVE;
}

function actualizarAgua() {
  if (!agua) return;
  agua.position.z = alturaAgua() - GROSOR_AGUA / 2;
}

function actualizarTextoNivel() {
  if (!textoNivel) return;

  const nombre = modo === "automatico" ? "Automático" : "Manual";
  textoNivel.textContent =
    `${nombre} · escenario visual: +${subida.toFixed(0)} m`;
}

//Anima el agua si está seleccionado el modo automático y dibuja cada fotograma
function animar() {
  requestAnimationFrame(animar);

  const delta = Math.min(reloj.getDelta(), 0.05);

  if (modo === "automatico") {
    tiempoAuto = (tiempoAuto + delta) % DURACION_AUTO;
    subida = (tiempoAuto / DURACION_AUTO) * maximoSubidaActual();
    sliderNivel.value = String(Math.round(subida));
    actualizarAgua();
    actualizarTextoNivel();
  }

  orbit.update();
  renderer.render(scene, camera);
}

//Ajusta la cámara y el renderizado al tamaño de la ventana
function redimensionar() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (vistaEdificios) verEdificios();
}