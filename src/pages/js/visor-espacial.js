import { siteData } from "../../data.js";
    const parametrosUrl = new URLSearchParams(window.location.search);
    const modeloSolicitado = parametrosUrl.get('modelo') || 'tunel';
    const nombreSolicitado = parametrosUrl.get('nombre') || 'Maquinaria';

    const visor = document.getElementById('visorModelo');
    const nombreUI = document.getElementById('nombreModelo');
    const btnCaptura = document.getElementById('btnCaptura');

    
    const catId = parametrosUrl.get('id') || 'minas';
    const data = siteData[catId];
    
    if (data) {
        document.documentElement.style.setProperty('--theme-color', data.themeColor);
        // Assuming hex color for themeColor, let's extract RGB
        const hex = data.themeColor.replace('#', '');
        if (hex.length === 6) {
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            document.documentElement.style.setProperty('--theme-color-rgb', `${r}, ${g}, ${b}`);
            // Set dark color slightly darker
            document.documentElement.style.setProperty('--theme-color-dark', `rgb(${Math.max(0, r-30)}, ${Math.max(0, g-30)}, ${Math.max(0, b-30)})`);
        }
    }
    
    // Add ready class to prevent FOUC
    document.body.classList.add('ready');

    const isProduction = window.location.hostname.includes('github.io');
    const BASE_PATH = isProduction ? '/AppMindAr/models/' : '/models/';
    const SOUND_BASE = isProduction ? '/AppMindAr/' : '/';

    visor.src = BASE_PATH + modeloSolicitado + '.glb';
    const orbitSolicitada = parametrosUrl.get('orbit') || '-90deg 75deg auto';
    visor.cameraOrbit = orbitSolicitada;

    const escalaSolicitadaStr = parametrosUrl.get('escala') || '1 1 1';
    let escalaActual = parseFloat(escalaSolicitadaStr.split(' ')[0]) || 1;
    const stepEscala = escalaActual < 0.1 ? 0.001 : 0.02;
    
    visor.scale = `${escalaActual} ${escalaActual} ${escalaActual}`;

    // ─── USDZ support (iOS Quick Look animated models) ───
    // Buscar el elemento actual en la data para saber si tiene USDZ
    let elementoActual = null;
    if (data && data.elementsData) {
      elementoActual = data.elementsData.find(e => e.arMarker === modeloSolicitado);
    }

    if (elementoActual && elementoActual.tieneUsdz) {
      visor.setAttribute('ios-src', BASE_PATH + modeloSolicitado + '.usdz');
    }

    // ─── Sonido (solo para la categoría dino) ───
    let reproductorAudio = null;
    if (catId === 'dino' && elementoActual && elementoActual.sonido) {
      reproductorAudio = new Audio();
      reproductorAudio.src = SOUND_BASE + elementoActual.sonido;

      // Reproducir al primer toque/click del usuario (requerido por navegadores)
      document.body.addEventListener('click', () => {
        if (reproductorAudio && reproductorAudio.paused) {
          reproductorAudio.play().catch(() => { });
        }
      }, { once: true });
    }

    let timer;
    function iniciarAccion(accion) { accion(); timer = setInterval(accion, 40); }
    function detenerAccion() { clearInterval(timer); }

    const acciones = {
      plus: () => { escalaActual += stepEscala; visor.scale = `${escalaActual} ${escalaActual} ${escalaActual}`; },
      minus: () => { if (escalaActual > stepEscala) escalaActual -= stepEscala; visor.scale = `${escalaActual} ${escalaActual} ${escalaActual}`; },
      left: () => { const o = visor.getCameraOrbit(); visor.cameraOrbit = `${o.theta - 0.05}rad ${o.phi}rad ${o.radius}m`; },
      right: () => { const o = visor.getCameraOrbit(); visor.cameraOrbit = `${o.theta + 0.05}rad ${o.phi}rad ${o.radius}m`; }
    };

    ['plus', 'minus', 'left', 'right'].forEach(id => {
      const el = document.getElementById(id);
      if(el) {
          el.addEventListener('mousedown', () => iniciarAccion(acciones[id]));
          el.addEventListener('touchstart', (e) => { e.preventDefault(); iniciarAccion(acciones[id]); }, { passive: false });
          el.addEventListener('mouseup', detenerAccion);
          el.addEventListener('mouseleave', detenerAccion);
          el.addEventListener('touchend', detenerAccion);
      }
    });

    nombreUI.textContent = nombreSolicitado;

    btnCaptura.addEventListener('click', async () => {
      btnCaptura.style.background = "orange";
      try {
        const blob = await visor.toBlob({ idealAspect: true });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        // Limpiamos el nombre para el archivo (quitamos acentos, caracteres especiales y reemplazamos espacios por guiones bajos)
        const nombreArchivo = nombreSolicitado
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9\s-_]/g, "")
          .trim()
          .replace(/\s+/g, '_');

        // Formateamos la fecha actual de forma entendible para el usuario (DD-MM-YYYY_HH-mm-ss)
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
        btnCaptura.style.background = "rgba(var(--theme-color-rgb), 0.9)";
      }, 500);
    });