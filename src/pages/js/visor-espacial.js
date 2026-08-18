import { siteData } from '../../data.js';

const parametrosUrl = new URLSearchParams(window.location.search);
const isProduction = window.location.hostname.includes('github.io');
const HOME_URL = isProduction ? '/AppMindAr/' : '/';
function getModelFolder(cat) {
  const map = { 'dino': 'dinos' };
  return map[cat] || cat || 'minas';
}

/** Links compartidos usan un solo param (?ref=cat.modelo) para que iOS Quick Look no trunque la URL. */
function resolverDesdeRef(ref) {
  if (!ref || !ref.includes('.')) return null;
  const dot = ref.indexOf('.');
  const cat = ref.slice(0, dot);
  const modelo = ref.slice(dot + 1);
  const catData = siteData[cat];
  if (!catData || !catData.elementsData) return null;
  const item = catData.elementsData.find((m) => m.arMarker === modelo);
  if (!item) return null;
  return { catId: cat, catData, item, modelo };
}

const refParam = parametrosUrl.get('ref');
const desdeCompartido = Boolean(refParam);
const resolvedShare = resolverDesdeRef(refParam);

let catId = parametrosUrl.get('id') || 'minas';
let modeloSolicitado = parametrosUrl.get('modelo') || 'tunel';
let nombreSolicitado = parametrosUrl.get('nombre') || 'Maquinaria';
let data = siteData[catId];

if (resolvedShare) {
  catId = resolvedShare.catId;
  data = resolvedShare.catData;
  modeloSolicitado = resolvedShare.modelo;
  nombreSolicitado = resolvedShare.item.name;
  parametrosUrl.set('id', catId);
  parametrosUrl.set('modelo', modeloSolicitado);
  parametrosUrl.set('nombre', nombreSolicitado);
  if (data.themeColor) parametrosUrl.set('color', data.themeColor);
  if (data.themeColorRgb) parametrosUrl.set('colorRgb', data.themeColorRgb);
  if (resolvedShare.item.tieneUsdz) parametrosUrl.set('usdz', '1');
  if (resolvedShare.item.sonido) parametrosUrl.set('sonido', resolvedShare.item.sonido);
  if (resolvedShare.item.orientation) parametrosUrl.set('orientation', resolvedShare.item.orientation);
  if (resolvedShare.item.cameraOrbit) parametrosUrl.set('orbit', resolvedShare.item.cameraOrbit);
  if (resolvedShare.item.escala) parametrosUrl.set('escala', resolvedShare.item.escala);
}

const modelFolder = getModelFolder(catId);
const BASE_PATH = isProduction ? `/AppMindAr/models/${modelFolder}/` : `/models/${modelFolder}/`;

const visor = document.getElementById('visorModelo');
const nombreUI = document.getElementById('nombreModelo');
const btnCaptura = document.getElementById('btnCaptura');
const btnVolver = document.getElementById('btnVolver');
const loaderOverlay = document.getElementById('loaderModelo');
const loaderSubtitle = document.getElementById('loaderSubtitle');
const loaderBarra = document.getElementById('loaderBarra');
const loaderPorcentaje = document.getElementById('loaderPorcentaje');

const modelInfo =
  data && data.elementsData
    ? data.elementsData.find((m) => m.arMarker === modeloSolicitado)
    : null;

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

visor.src = BASE_PATH + modeloSolicitado + '.glb';
nombreUI.textContent = nombreSolicitado;

/** Link corto del objeto: un solo query param (compatible con share de AR Quick Look). */
function construirLinkObjeto() {
  const limpio = new URL(window.location.pathname, window.location.origin);
  limpio.searchParams.set('ref', `${catId}.${modeloSolicitado}`);
  return limpio.href;
}

const linkObjeto = construirLinkObjeto();

// ─── Volver: si entró por link compartido (o sin historial), ir al inicio ───
function irAlInicio() {
  window.location.href = HOME_URL;
}

function handleVolver() {
  if (desdeCompartido) {
    irAlInicio();
    return;
  }

  let mismoSitio = false;
  try {
    mismoSitio = Boolean(document.referrer) &&
      new URL(document.referrer).hostname === window.location.hostname;
  } catch (_) {
    mismoSitio = false;
  }

  if (mismoSitio && window.history.length > 1) {
    window.history.back();
    return;
  }

  irAlInicio();
}

if (btnVolver) {
  btnVolver.addEventListener('click', handleVolver);
}

// Fallback: si no carga con ruta absoluta, probar relativa
visor.addEventListener('error', () => {
  const fallback = 'models/' + modelFolder + '/' + modeloSolicitado + '.glb';
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

if (modelInfo) {
  if (modelInfo.cameraOrbit) finalOrbit = modelInfo.cameraOrbit;
  if (modelInfo.orientation) finalOrientation = modelInfo.orientation;
}

visor.cameraOrbit = finalOrbit;
if (finalOrientation) {
  visor.orientation = finalOrientation;
}

// ─── USDZ para iOS + canonicalWebPageURL (share en AR manda el link, no el .usdz) ───
const tieneUsdz = parametrosUrl.get('usdz') === '1' || Boolean(modelInfo && modelInfo.tieneUsdz);
if (tieneUsdz) {
  const usdzPath = BASE_PATH + modeloSolicitado + '.usdz';
  visor.setAttribute(
    'ios-src',
    `${usdzPath}#canonicalWebPageURL=${encodeURIComponent(linkObjeto)}`
  );
}

// ─── Sonido (si viene en la URL / catálogo) ───
const sonidoUrl = parametrosUrl.get('sonido') || (modelInfo && modelInfo.sonido) || null;
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

// ─── Compartir nativo: solo el link del objeto + imagen de preview ───
const btnCompartir = document.getElementById('btnCompartir');
const shareToast = document.getElementById('shareToast');
let shareToastTimer = null;

function absolutizarUrl(pathOrUrl) {
  if (!pathOrUrl) return '';
  try {
    return new URL(pathOrUrl, window.location.origin).href;
  } catch {
    return pathOrUrl;
  }
}

const imagenObjeto = absolutizarUrl(modelInfo && modelInfo.image);
const descripcionObjeto =
  (modelInfo && modelInfo.description
    ? modelInfo.description.replace(/<[^>]+>/g, '').trim()
    : '') || `Explorá ${nombreSolicitado} en realidad aumentada con SIED AR.`;

function actualizarMetaPreview() {
  document.title = `${nombreSolicitado} | SIED AR`;

  const metaDescription = document.getElementById('metaDescription');
  if (metaDescription) metaDescription.setAttribute('content', descripcionObjeto);

  const ogTitle = document.getElementById('ogTitle');
  if (ogTitle) ogTitle.setAttribute('content', nombreSolicitado);

  const ogDescription = document.getElementById('ogDescription');
  if (ogDescription) ogDescription.setAttribute('content', descripcionObjeto);

  const ogImage = document.getElementById('ogImage');
  if (ogImage && imagenObjeto) ogImage.setAttribute('content', imagenObjeto);

  const ogUrl = document.getElementById('ogUrl');
  if (ogUrl) ogUrl.setAttribute('content', linkObjeto);

  const twitterTitle = document.getElementById('twitterTitle');
  if (twitterTitle) twitterTitle.setAttribute('content', nombreSolicitado);

  const twitterDescription = document.getElementById('twitterDescription');
  if (twitterDescription) twitterDescription.setAttribute('content', descripcionObjeto);

  const twitterImage = document.getElementById('twitterImage');
  if (twitterImage && imagenObjeto) twitterImage.setAttribute('content', imagenObjeto);
}

actualizarMetaPreview();

function mostrarToastCompartir(mensaje) {
  if (!shareToast) return;
  shareToast.hidden = false;
  shareToast.textContent = mensaje;
  void shareToast.offsetWidth;
  shareToast.classList.add('visible');
  clearTimeout(shareToastTimer);
  shareToastTimer = setTimeout(() => {
    shareToast.classList.remove('visible');
    setTimeout(() => {
      shareToast.hidden = true;
    }, 250);
  }, 2200);
}

async function copiarLinkAlPortapapeles(url) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(url);
    return;
  }
  const input = document.createElement('textarea');
  input.value = url;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  input.style.left = '-9999px';
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
}

function nombreArchivoPreview() {
  return `${nombreSolicitado
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .toLowerCase() || modeloSolicitado}.png`;
}

async function obtenerArchivoPreview() {
  if (!imagenObjeto) return null;
  const response = await fetch(imagenObjeto, { mode: 'cors' });
  if (!response.ok) throw new Error(`No se pudo cargar la preview (${response.status})`);
  const blob = await response.blob();
  const type = blob.type && blob.type.startsWith('image/') ? blob.type : 'image/png';
  return new File([blob], nombreArchivoPreview(), { type });
}

// Prefetch: en iOS/Android share con files debe ir en el mismo gesto del tap
let previewFileListo = null;
if (imagenObjeto) {
  obtenerArchivoPreview()
    .then((file) => {
      previewFileListo = file;
    })
    .catch((err) => {
      console.warn('No se pudo precargar la preview para compartir:', err);
    });
}

async function compartirExperiencia() {
  if (!btnCompartir || btnCompartir.classList.contains('is-sharing')) return;

  btnCompartir.classList.add('is-sharing');
  try {
    if (typeof navigator.share === 'function') {
      // Preferido: imagen del objeto como adjunto + solo el link en el mensaje
      if (previewFileListo) {
        const conAdjunto = { files: [previewFileListo], text: linkObjeto };
        if (typeof navigator.canShare !== 'function' || navigator.canShare(conAdjunto)) {
          await navigator.share(conAdjunto);
          return;
        }
      }

      // Fallback nativo: únicamente el link del objeto
      const soloLink = { url: linkObjeto };
      if (typeof navigator.canShare !== 'function' || navigator.canShare(soloLink)) {
        await navigator.share(soloLink);
        return;
      }

      // Algunos browsers aceptan text pero no url
      const soloTexto = { text: linkObjeto };
      if (typeof navigator.canShare !== 'function' || navigator.canShare(soloTexto)) {
        await navigator.share(soloTexto);
        return;
      }
    }

    await copiarLinkAlPortapapeles(linkObjeto);
    mostrarToastCompartir('Link copiado. ¡Listo para compartir!');
  } catch (error) {
    if (error && error.name === 'AbortError') return;
    try {
      await copiarLinkAlPortapapeles(linkObjeto);
      mostrarToastCompartir('Link copiado. ¡Listo para compartir!');
    } catch (clipboardError) {
      console.error('No se pudo compartir ni copiar el link:', clipboardError || error);
      mostrarToastCompartir('No se pudo compartir. Probá de nuevo.');
    }
  } finally {
    btnCompartir.classList.remove('is-sharing');
  }
}

if (btnCompartir) {
  btnCompartir.addEventListener('click', () => {
    compartirExperiencia();
  });
}

// Ocultar compartir al proyectar en AR; volver a mostrarlo al salir
function setShareVisibleEnVisor(visible) {
  if (!btnCompartir) return;
  btnCompartir.classList.toggle('is-hidden-ar', !visible);
  btnCompartir.setAttribute('aria-hidden', visible ? 'false' : 'true');
  if (visible) btnCompartir.removeAttribute('tabindex');
  else btnCompartir.tabIndex = -1;
}

let arHideFallbackTimer = null;

const btnProyectar = document.querySelector('.btn-proyectar');
if (btnProyectar) {
  btnProyectar.addEventListener('click', () => {
    setShareVisibleEnVisor(false);
    clearTimeout(arHideFallbackTimer);
    // Si cancela permisos / no entra a AR, reponer el botón
    arHideFallbackTimer = setTimeout(() => {
      if (document.visibilityState !== 'visible') return;
      const status = visor && visor.getAttribute('ar-status');
      if (status === 'session-started' || status === 'object-placed') return;
      setShareVisibleEnVisor(true);
    }, 3000);
  });
}

if (visor) {
  visor.addEventListener('ar-status', (event) => {
    const status = event.detail && event.detail.status;
    if (status === 'session-started' || status === 'object-placed') {
      clearTimeout(arHideFallbackTimer);
      setShareVisibleEnVisor(false);
    } else if (status === 'not-presenting' || status === 'failed') {
      clearTimeout(arHideFallbackTimer);
      setShareVisibleEnVisor(true);
    }
  });
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    clearTimeout(arHideFallbackTimer);
    setShareVisibleEnVisor(true);
  }
});

window.addEventListener('pageshow', () => {
  clearTimeout(arHideFallbackTimer);
  setShareVisibleEnVisor(true);
});

console.log("🚀 SCRIPT INICIADO. Buscando modelo...");

const params = new URLSearchParams(window.location.search);
const modeloActual = params.get('modelo');

if (modeloActual) {
  const visor = document.getElementById('visorModelo');
  
  if (visor) {
    const rutaModelo = BASE_PATH + modeloActual + '.glb';
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
// funcion temporal para sacar coordenadas de hotspots (consultar como funciona)
const visorHerramienta = document.getElementById('visorModelo');

if (visorHerramienta) {
  visorHerramienta.addEventListener('click', (event) => {

    const hit = visorHerramienta.positionAndNormalFromPoint(event.clientX, event.clientY);
    
    if (hit) {
      console.log(`%c📍 PUNTO ENCONTRADO. Copiá esto en tu JSON:`, 'color: #779B2C; font-weight: bold; font-size: 14px;');
      console.log(`"position": "${hit.position.x} ${hit.position.y} ${hit.position.z}",\n"normal": "${hit.normal.x} ${hit.normal.y} ${hit.normal.z}"`);
    } else {
      console.log('Hiciste clic fuera del modelo.');
    }
  });
}

import('../../js/tutorial.js').then(({ tutorial }) => {
  tutorial.checkAndInit('visor-espacial');
});