const parametrosUrl = new URLSearchParams(window.location.search);
const modeloSolicitado = parametrosUrl.get('modelo') || 'tunel';
const nombreSolicitado = parametrosUrl.get('nombre') || 'Maquinaria';

const visor = document.getElementById('visorModelo');
const nombreUI = document.getElementById('nombreModelo');
const btnCaptura = document.getElementById('btnCaptura');
const loaderOverlay = document.getElementById('loaderModelo');
const loaderSubtitle = document.getElementById('loaderSubtitle');
const loaderBarra = document.getElementById('loaderBarra');
const loaderPorcentaje = document.getElementById('loaderPorcentaje');

import { siteData } from '../../data.js';
const catId = parametrosUrl.get('id') || 'minas';
const data = siteData[catId];

const categoryTitles = {
  'minas': 'Minería',
  'astro': 'Astro',
  'bio': 'Bio',
  'minerales': 'Minerales',
  'dino': 'Dinosaurios'
};

if (data) {
  const shortTitle = categoryTitles[catId] || catId;
  document.title = 'SIED ' + shortTitle + ' - AR Espacial';
}

// ─── Colores del tema (vienen de la URL, con fallback azul) ───
const themeColor = parametrosUrl.get('color') || '#153B82';
const themeColorRgb = parametrosUrl.get('colorRgb') || '21, 59, 130';
// Calcular color oscuro
const hex = themeColor.replace('#', '');
let themeColorDark = themeColor;
if (hex.length === 6) {
  const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - 30);
  const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - 30);
  const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - 30);
  themeColorDark = `rgb(${r}, ${g}, ${b})`;
}
document.documentElement.style.setProperty('--theme-color', themeColor);
document.documentElement.style.setProperty('--theme-color-rgb', themeColorRgb);
document.documentElement.style.setProperty('--theme-color-dark', themeColorDark);

// ─── Escala ───
const escalaSolicitadaStr = parametrosUrl.get('escala') || '1 1 1';
let escalaActual = parseFloat(escalaSolicitadaStr.split(' ')[0]) || 1;
const stepEscala = escalaActual < 0.1 ? 0.001 : 0.02;

// ─── Ruta del modelo ───
const isProduction = window.location.hostname.includes('github.io');
const BASE_PATH = isProduction ? '/AppMindAr/models/' : '/models/';

visor.src = BASE_PATH + modeloSolicitado + '.glb';
nombreUI.textContent = nombreSolicitado;

// Fallback: si no carga con ruta absoluta, probar relativa
visor.addEventListener('error', () => {
  const fallback = 'models/' + modeloSolicitado + '.glb';
  if (visor.src !== fallback && !visor.src.endsWith(fallback)) {
    visor.src = fallback;
  } else {
    setTimeout(() => {
      if (loaderOverlay) loaderOverlay.classList.add('fade-out');
    }, 1000);
  }
}, { once: true });

// Lógica de actualización y ocultación del cargador premium
if (visor) {
  visor.addEventListener('progress', (event) => {
    const progress = Math.round(event.detail.totalProgress * 100);
    if (loaderBarra) loaderBarra.style.width = `${progress}%`;
    if (loaderPorcentaje) loaderPorcentaje.textContent = `${progress}%`;
    
    if (progress === 100) {
      if (loaderSubtitle) loaderSubtitle.textContent = 'Procesando gráficos 3D...';
    } else if (progress > 50) {
      if (loaderSubtitle) loaderSubtitle.textContent = 'Cargando texturas y geometría...';
    } else if (progress > 10) {
      if (loaderSubtitle) loaderSubtitle.textContent = 'Recibiendo datos del modelo...';
    }
  });

  visor.addEventListener('load', () => {
    if (loaderBarra) loaderBarra.style.width = '100%';
    if (loaderPorcentaje) loaderPorcentaje.textContent = '100%';
    if (loaderSubtitle) loaderSubtitle.textContent = '¡Listo!';
    
    setTimeout(() => {
      if (loaderOverlay) loaderOverlay.classList.add('fade-out');
    }, 450);
  });
}

visor.scale = `${escalaActual} ${escalaActual} ${escalaActual}`;

// ─── Órbita de cámara y Orientación ───
let finalOrbit = parametrosUrl.get('orbit') || '-90deg 75deg auto';
let finalOrientation = parametrosUrl.get('orientation');

if (data && data.elementsData) {
  const modelInfo = data.elementsData.find(m => m.arMarker === modeloSolicitado);
  if (modelInfo) {
    if (modelInfo.cameraOrbit) finalOrbit = modelInfo.cameraOrbit;
    if (modelInfo.orientation) finalOrientation = modelInfo.orientation;
  }
}

visor.cameraOrbit = finalOrbit;
if (finalOrientation) {
  visor.orientation = finalOrientation;
}

// ─── USDZ para iOS (si viene en la URL) ───
const tieneUsdz = parametrosUrl.get('usdz') === '1';
if (tieneUsdz) {
  visor.setAttribute('ios-src', BASE_PATH + modeloSolicitado + '.usdz');
}

// ─── Sonido (si viene en la URL) ───
const sonidoUrl = parametrosUrl.get('sonido');
if (sonidoUrl) {
  const SOUND_BASE = isProduction ? '/AppMindAr/' : '/';
  const reproductorAudio = new Audio();
  reproductorAudio.src = SOUND_BASE + sonidoUrl;

  document.body.addEventListener('click', () => {
    if (reproductorAudio && reproductorAudio.paused) {
      reproductorAudio.play().catch(() => { });
    }
  }, { once: true });
}


// ─── Lógica de botones de control (requestAnimationFrame para fluidez) ───
let animFrameId = null;
let activeAction = null;

function iniciarAccion(accion) {
  activeAction = accion;
  function step() {
    if (activeAction) {
      activeAction();
      animFrameId = requestAnimationFrame(step);
    }
  }
  step();
}

function detenerAccion() {
  activeAction = null;
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
}

const acciones = {
  plus: () => { escalaActual += stepEscala; visor.scale = `${escalaActual} ${escalaActual} ${escalaActual}`; },
  minus: () => { if (escalaActual > stepEscala) escalaActual -= stepEscala; visor.scale = `${escalaActual} ${escalaActual} ${escalaActual}`; },
  left: () => { const o = visor.getCameraOrbit(); visor.cameraOrbit = `${o.theta - 0.03}rad ${o.phi}rad ${o.radius}m`; },
  right: () => { const o = visor.getCameraOrbit(); visor.cameraOrbit = `${o.theta + 0.03}rad ${o.phi}rad ${o.radius}m`; }
};

['plus', 'minus', 'left', 'right'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('mousedown', () => iniciarAccion(acciones[id]));
    el.addEventListener('touchstart', (e) => { e.preventDefault(); iniciarAccion(acciones[id]); }, { passive: false });
    el.addEventListener('mouseup', detenerAccion);
    el.addEventListener('mouseleave', detenerAccion);
    el.addEventListener('touchend', detenerAccion);
    el.addEventListener('touchcancel', detenerAccion);
  }
});

// ─── Captura de foto ───
btnCaptura.addEventListener('click', async () => {
  btnCaptura.style.background = "orange";
  try {
    const blob = await visor.toBlob({ idealAspect: true });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Limpiamos el nombre para el archivo
    const nombreArchivo = nombreSolicitado
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s\-_]/g, "")
      .trim()
      .replace(/\s+/g, '_');

    // Fecha formateada
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear();
    const hora = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');

    const fechaFormateada = `${dia}-${mes}-${anio}_${hora}-${minutos}-${segundos}`;

    link.download = `${nombreArchivo}_${fechaFormateada}.png`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
  }
  setTimeout(() => {
    btnCaptura.style.background = `rgba(${themeColorRgb}, 0.9)`;
  }, 500);
});


console.log("🚀 SCRIPT INICIADO. Buscando modelo...");

const params = new URLSearchParams(window.location.search);
const modeloActual = params.get('modelo');

if (modeloActual) {
  const visor = document.getElementById('visorModelo');
  
  if (visor) {
    const isProd = window.location.hostname.includes('github.io');
    
    const rutaModelo = isProd ? `/AppMindAr/models/${modeloActual}.glb` : `/models/${modeloActual}.glb`;
    visor.src = rutaModelo;

    const rutaJson = isProd ? '/AppMindAr/assets/data.json' : '/assets/data.json';
    
    fetch(rutaJson)
      .then(response => {
          if (!response.ok) {
              throw new Error(response.status);
          }
          return response.json();
      })
      .then(data => {
        if (data[modeloActual]) {
          data[modeloActual].forEach(punto => {
              const btnContenedor = document.createElement('button');
              btnContenedor.className = 'punto-contenedor';
              btnContenedor.slot = punto.slot;
              btnContenedor.dataset.position = punto.position;
              btnContenedor.dataset.normal = punto.normal;

              const divVisual = document.createElement('div');
              divVisual.className = 'punto-visual';

              const divTexto = document.createElement('div');
              divTexto.className = 'info-texto';
              divTexto.textContent = punto.texto;

              btnContenedor.appendChild(divVisual);
              btnContenedor.appendChild(divTexto);
              visor.appendChild(btnContenedor);
          });
        }
      })
      .catch(error => console.error(error));
  }
}
// HERRAMIENTA TEMPORAL PARA SACAR COORDENADAS
const visorHerramienta = document.getElementById('visorModelo');

if (visorHerramienta) {
  visorHerramienta.addEventListener('click', (event) => {
    // Calcula dónde tocó el mouse en el espacio 3D
    const hit = visorHerramienta.positionAndNormalFromPoint(event.clientX, event.clientY);
    
    if (hit) {
      console.log(`%c📍 PUNTO ENCONTRADO. Copiá esto en tu JSON:`, 'color: #779B2C; font-weight: bold; font-size: 14px;');
      console.log(`"position": "${hit.position.x} ${hit.position.y} ${hit.position.z}",\n"normal": "${hit.normal.x} ${hit.normal.y} ${hit.normal.z}"`);
    } else {
      console.log('Hiciste clic fuera del modelo.');
    }
  });
}