import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import datosDidacticos from "./datos_planetas.json";

const URLS = {
    sol: "https://raw.githubusercontent.com/marcpear/IG_Practicas/main/S7/Resultados/sun.jpg",
    estrellas: "https://raw.githubusercontent.com/marcpear/IG_Practicas/main/S7/Resultados/stars.jpg",
    mercurio: "https://raw.githubusercontent.com/marcpear/IG_Practicas/main/S7/Resultados/mercury.jpg",
    venusSuperficie: "https://raw.githubusercontent.com/marcpear/IG_Practicas/main/S7/Resultados/venus_surface.jpg",
    venusAtmosfera: "https://raw.githubusercontent.com/marcpear/IG_Practicas/main/S7/Resultados/venus_atmosphere.jpg",
    tierra: "https://raw.githubusercontent.com/marcpear/IG_Practicas/main/S7/Resultados/earth.jpg",
    nubes: "https://raw.githubusercontent.com/marcpear/IG_Practicas/main/S7/Resultados/earth_clouds.jpg",
    luna: "https://raw.githubusercontent.com/marcpear/IG_Practicas/main/S7/Resultados/moon.jpg",
    marte: "https://raw.githubusercontent.com/marcpear/IG_Practicas/main/S7/Resultados/mars.jpg",
    jupiter: "https://raw.githubusercontent.com/marcpear/IG_Practicas/main/S7/Resultados/jupiter.jpg",
    saturno: "https://raw.githubusercontent.com/marcpear/IG_Practicas/main/S7/Resultados/saturn.jpg",
    anilloSaturno: "https://raw.githubusercontent.com/marcpear/IG_Practicas/main/S7/Resultados/saturn_ring.jpg",
    urano: "https://raw.githubusercontent.com/marcpear/IG_Practicas/main/S7/Resultados/uranus.jpg",
    neptuno: "https://raw.githubusercontent.com/marcpear/IG_Practicas/main/S7/Resultados/neptune.jpg"
};

const panelInfo = document.createElement('div');
panelInfo.style.position = 'absolute';
panelInfo.style.bottom = '30px';
panelInfo.style.left = '30px';
panelInfo.style.padding = '20px';
panelInfo.style.background = 'rgba(10, 20, 40, 0.85)';
panelInfo.style.color = '#ffffff';
panelInfo.style.border = '1px solid #4da6ff';
panelInfo.style.borderRadius = '10px';
panelInfo.style.fontFamily = 'sans-serif';
panelInfo.style.fontSize = '14px';
panelInfo.style.lineHeight = '1.5';
panelInfo.style.maxWidth = '300px';
panelInfo.style.display = 'none';
panelInfo.style.pointerEvents = 'none';
document.body.appendChild(panelInfo);

//escena
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; 
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const ancho = window.innerWidth;
const alto = window.innerHeight;

const camaraGeneral = new THREE.PerspectiveCamera(45, ancho / alto, 0.1, 2000);
camaraGeneral.position.set(0, 150, 300);
camaraGeneral.lookAt(0, 0, 0);

const camaraNave = new THREE.PerspectiveCamera(45, ancho / alto, 0.1, 1000);

//texturas
const texLoader = new THREE.TextureLoader();
const texturas = {};
for (const [key, url] of Object.entries(URLS)) {
    texturas[key] = texLoader.load(url);
}
scene.background = texturas.estrellas;

//Iluminación
const luzHemisferio = new THREE.HemisphereLight(0xffffff, 0x111122, 0.3);
scene.add(luzHemisferio);

const luzSol = new THREE.PointLight(0xffffff, 2.5, 1000);
luzSol.position.set(0, 0, 0);
luzSol.castShadow = true;
luzSol.shadow.bias = -0.005;
luzSol.shadow.normalBias = 0.5;
luzSol.shadow.mapSize.set(2048, 2048);
luzSol.shadow.camera.near = 1;
luzSol.shadow.camera.far = 400;
scene.add(luzSol);

const astros = []; 
const mapaPlanetas = {}; 
const mallasInteractivas = [];

function crearAstro(nombre, radio, color, distancia, vRotacion, vOrbita, mapas = {}, depthWrite = true) {
    const pivote = new THREE.Object3D();
    
    const geom = new THREE.SphereGeometry(radio, 32, 32);
    const mat = new THREE.MeshPhongMaterial({ 
        color: mapas.map ? 0xffffff : color,
        depthWrite: depthWrite 
    }); 
    
    if (mapas.map) mat.map = mapas.map;
    if (mapas.bumpMap) { mat.bumpMap = mapas.bumpMap; mat.bumpScale = 0.5; }
    if (mapas.specularMap) { mat.specularMap = mapas.specularMap; mat.specular = new THREE.Color('grey'); }
    
    if (mapas.alphaMap) {
        mat.alphaMap = mapas.alphaMap;
        mat.transparent = true;
        mat.side = THREE.DoubleSide;
        mat.opacity = 1.0;
    }

    const mesh = new THREE.Mesh(geom, mat);
    
    mesh.userData = { nombre: nombre };

    const esCapa = !!mapas.alphaMap;
    mesh.castShadow = !esCapa;
    mesh.receiveShadow = !esCapa;
    mesh.position.x = distancia;
    
    pivote.add(mesh);
    mallasInteractivas.push(mesh);

    return { pivote, mesh, vRotacion, vOrbita };
}

//Sol
const geomSol = new THREE.SphereGeometry(12, 32, 32);
const matSol = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texturas.sol });
const sol = new THREE.Mesh(geomSol, matSol);
sol.userData = { nombre: "Sol" };
scene.add(sol);
mallasInteractivas.push(sol);

//planetas
const configPlanetas = [
    { nombre: "Mercurio", radio: 0.8, color: 0xffffff, dist: 22, rot: 0.010, orb: 0.0070, tex: { map: texturas.mercurio } },
    { nombre: "Venus", radio: 1.3, color: 0xffffff, dist: 32, rot: 0.005, orb: 0.0050, tex: { map: texturas.venusSuperficie } }, 
    { nombre: "Tierra", radio: 1.4, color: 0xffffff, dist: 46, rot: 0.020, orb: 0.0036, tex: { map: texturas.tierra } },
    { nombre: "Marte", radio: 0.9, color: 0xffffff, dist: 60, rot: 0.018, orb: 0.0028, tex: { map: texturas.marte } },
    { nombre: "Júpiter", radio: 4.8, color: 0xffffff, dist: 85, rot: 0.040, orb: 0.0018, tex: { map: texturas.jupiter } },
    { nombre: "Saturno", radio: 3.8, color: 0xffffff, dist: 115, rot: 0.038, orb: 0.0012, anillos: true, tex: { map: texturas.saturno } },
    { nombre: "Urano", radio: 2.5, color: 0xffffff, dist: 145, rot: 0.025, orb: 0.0008, tex: { map: texturas.urano } },
    { nombre: "Neptuno", radio: 2.4, color: 0xffffff, dist: 175, rot: 0.022, orb: 0.0006, tex: { map: texturas.neptuno } }
];

configPlanetas.forEach((datos) => {
    const planeta = crearAstro(datos.nombre, datos.radio, datos.color, datos.dist, datos.rot, datos.orb, datos.tex);
    scene.add(planeta.pivote);
    astros.push(planeta);

    mapaPlanetas[datos.nombre] = { 
        pivote: planeta.pivote, mesh: planeta.mesh, radio: datos.radio, dist: datos.dist 
    };

    const geomLinea = new THREE.RingGeometry(datos.dist - 0.2, datos.dist + 0.2, 128); 
    const matLinea = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const linea = new THREE.Mesh(geomLinea, matLinea);
    linea.rotation.x = Math.PI / 2;
    scene.add(linea);

    if (datos.nombre === "Venus") {
        const atmosferaVenus = crearAstro("Venus", 1.35, 0xffffff, 0, 0.008, 0, { 
            map: texturas.venusAtmosfera, alphaMap: texturas.venusAtmosfera 
        }, false);
        planeta.mesh.add(atmosferaVenus.pivote);
        astros.push(atmosferaVenus); 
    }

    if (datos.nombre === "Tierra") {
        const nubes = crearAstro("Tierra", 1.43, 0xffffff, 0, 0.025, 0, { 
            map: texturas.nubes, alphaMap: texturas.nubes 
        }, false);
        planeta.mesh.add(nubes.pivote);
        astros.push(nubes);

        const luna = crearAstro("Luna", 0.4, 0xffffff, 3.5, 0.03, 0.008, { map: texturas.luna });
        planeta.mesh.add(luna.pivote); 
        astros.push(luna);
    }

    if (datos.anillos) {
        const geomAnillo = new THREE.RingGeometry(datos.radio + 1, datos.radio + 3.5, 64);
        const texturaAnillo = texturas.anilloSaturno;
        texturaAnillo.wrapS = THREE.RepeatWrapping;
        texturaAnillo.wrapT = THREE.RepeatWrapping;
        texturaAnillo.repeat.set(1, 1);

        const matAnillo = new THREE.MeshPhongMaterial({ 
            map: texturaAnillo, color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.8 
        });
        const anillo = new THREE.Mesh(geomAnillo, matAnillo);
        anillo.rotation.x = Math.PI / 2;
        anillo.userData = { nombre: datos.nombre }; 
        planeta.mesh.add(anillo);
        mallasInteractivas.push(anillo);
    }
});

const opciones = { vistaActiva: 'Global', planetaNave: 'Tierra' };

const raycaster = new THREE.Raycaster();
const raton = new THREE.Vector2();

window.addEventListener('click', (event) => {
    if (event.target !== renderer.domElement) return;
    if (isDragging) return;

    raton.x = (event.clientX / window.innerWidth) * 2 - 1;
    raton.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const camaraActiva = opciones.vistaActiva === 'Global' ? camaraGeneral : camaraNave;
    camaraActiva.updateMatrixWorld();
    
    raycaster.setFromCamera(raton, camaraActiva);

    const intersecciones = raycaster.intersectObjects(mallasInteractivas);

    if (intersecciones.length > 0) {
        const objetoTocado = intersecciones[0].object;
        const nombreAstro = objetoTocado.userData.nombre;
        
        if (datosDidacticos[nombreAstro]) {
            panelInfo.innerHTML = datosDidacticos[nombreAstro];
            panelInfo.style.display = 'block';
        }
    } else {
        panelInfo.style.display = 'none';
    }
});

//control
let naveRotX = 0; 
let naveRotY = 0.3; 
let multiplicadorZoom = 5;

function reanclarCamaraNave(nombrePlaneta) {
    const astro = mapaPlanetas[nombrePlaneta];
    if (astro) {
        astro.pivote.add(camaraNave);
        naveRotX = 0;
        naveRotY = 0.3;
        multiplicadorZoom = 5;

        if (opciones.vistaActiva === 'Nave' && datosDidacticos[nombrePlaneta]) {
            panelInfo.innerHTML = datosDidacticos[nombrePlaneta];
            panelInfo.style.display = 'block';
        }
    }
}
reanclarCamaraNave("Tierra");

//Gui
const gui = new GUI();

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

window.addEventListener('mousedown', (event) => {
    if (opciones.vistaActiva === 'Nave' && event.target === renderer.domElement) {
        isDragging = true;
    }
    previousMousePosition = { x: event.clientX, y: event.clientY };
});

window.addEventListener('mousemove', (event) => {
    if (isDragging && opciones.vistaActiva === 'Nave') {
        const deltaMove = { x: event.clientX - previousMousePosition.x, y: event.clientY - previousMousePosition.y };
        naveRotX -= deltaMove.x * 0.01;
        naveRotY -= deltaMove.y * 0.01;
        naveRotY = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, naveRotY));
        previousMousePosition = { x: event.clientX, y: event.clientY };
    }
});

window.addEventListener('mouseup', () => {
    setTimeout(() => { isDragging = false; }, 50);
});

window.addEventListener('wheel', (event) => {
    if (opciones.vistaActiva === 'Nave') {
        multiplicadorZoom += event.deltaY * 0.005;
        multiplicadorZoom = Math.max(1.5, Math.min(multiplicadorZoom, 15)); 
    }
});

const orbitControls = new OrbitControls(camaraGeneral, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.05;
orbitControls.minDistance = 20;
orbitControls.maxDistance = 800;

gui.add(opciones, 'vistaActiva', ['Global', 'Nave']).name('Cámara').onChange((vista) => {
    const aspect = window.innerWidth / window.innerHeight;
    camaraGeneral.aspect = aspect;
    camaraGeneral.updateProjectionMatrix();
    camaraNave.aspect = aspect;
    camaraNave.updateProjectionMatrix();
    orbitControls.enabled = (vista === 'Global');

    if (vista === 'Nave') {
        const planetaActual = opciones.planetaNave;
        if (datosDidacticos[planetaActual]) {
            panelInfo.innerHTML = datosDidacticos[planetaActual];
            panelInfo.style.display = 'block';
        }
    } else {
        panelInfo.style.display = 'none';
    }
});

gui.add(opciones, 'planetaNave', configPlanetas.map(p => p.nombre))
   .name('Planeta Nave').onChange((nombreSeleccionado) => reanclarCamaraNave(nombreSeleccionado));

const carpetaLuz = gui.addFolder('Iluminación');
carpetaLuz.add(luzHemisferio, 'intensity', 0, 1, 0.05).name('Luz de Relleno');
carpetaLuz.add(luzSol, 'intensity', 0, 5, 0.1).name('Luz del Sol');

const vectorDestino = new THREE.Vector3(); 

function render() {
    requestAnimationFrame(render);

    astros.forEach(astro => {
        astro.pivote.rotation.y += astro.vOrbita;
        astro.mesh.rotation.y += astro.vRotacion;
    });

    if (opciones.vistaActiva === 'Global') {
        orbitControls.update();
        renderer.render(scene, camaraGeneral);
    } else {
        const astroActual = mapaPlanetas[opciones.planetaNave];
        if (astroActual) {
            const R = astroActual.radio * multiplicadorZoom;
            const offsetX = R * Math.cos(naveRotY) * Math.sin(naveRotX);
            const offsetY = R * Math.sin(naveRotY);
            const offsetZ = R * Math.cos(naveRotY) * Math.cos(naveRotX);
            
            camaraNave.position.set(astroActual.dist + offsetX, offsetY, offsetZ);
            astroActual.mesh.getWorldPosition(vectorDestino);
            camaraNave.lookAt(vectorDestino);
        }
        renderer.render(scene, camaraNave);
    }
}

window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camaraGeneral.aspect = width / height;
    camaraGeneral.updateProjectionMatrix();
    camaraNave.aspect = width / height;
    camaraNave.updateProjectionMatrix();
});

render();