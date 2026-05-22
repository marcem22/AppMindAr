    const parametrosUrl = new URLSearchParams(window.location.search);
    const modeloSolicitado = parametrosUrl.get('modelo') || 'tunel';
    const nombreSolicitado = parametrosUrl.get('nombre') || 'Maquinaria';

    const visor = document.getElementById('visorModelo');
    const nombreUI = document.getElementById('nombreModelo');
    const btnCaptura = document.getElementById('btnCaptura');

    const escalaSolicitadaStr = parametrosUrl.get('escala') || '1 1 1';
    let escalaActual = parseFloat(escalaSolicitadaStr.split(' ')[0]) || 1;
    const stepEscala = escalaActual < 0.1 ? 0.001 : 0.02;

    const isProduction = window.location.hostname.includes('github.io');
    const BASE_PATH = isProduction ? '/AppMindAr/models/' : 'models/';

    visor.src = BASE_PATH + modeloSolicitado + '.glb';
    nombreUI.textContent = nombreSolicitado;

    visor.scale = `${escalaActual} ${escalaActual} ${escalaActual}`;

    // LÓGICA DE LOS BOTONES
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
      if (el) {
        el.addEventListener('mousedown', () => iniciarAccion(acciones[id]));
        el.addEventListener('touchstart', (e) => { e.preventDefault(); iniciarAccion(acciones[id]); }, { passive: false });
        el.addEventListener('mouseup', detenerAccion);
        el.addEventListener('mouseleave', detenerAccion);
        el.addEventListener('touchend', detenerAccion);
      }
    });

    // FOTO
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
        btnCaptura.style.background = "";
      }, 500);
    });