const parametrosUrl = new URLSearchParams(window.location.search);
const modeloSolicitado = parametrosUrl.get('modelo') || 'tunel';
const nombreSolicitado = parametrosUrl.get('nombre') || 'Maquinaria';

const visor = document.getElementById('visorModelo');
const nombreUI = document.getElementById('nombreModelo');
const btnCaptura = document.getElementById('btnCaptura');

import { siteData } from '../../data.js';
const catId = parametrosUrl.get('id') || 'minas';
const data = siteData[catId];
if (data) {
  document.getElementById('pageTitle').textContent = 'SIED - ' + data.title;
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
  }
}, { once: true });

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