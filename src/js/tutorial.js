/**
 * Engine del Tutorial Interactivo Paso a Paso (SIED - AppMindAr) - Solución SVG Cutout Masking
 */

export const TUTORIAL_STORAGE_KEY = 'sied_tutorial_active';
export const TUTORIAL_STEP_KEY = 'sied_tutorial_step';

export const STEPS = [
  // PÁGINA 1: INDEX
  {
    id: 1,
    page: 'index',
    title: '¡Bienvenido al Tutorial!',
    body: 'Te guiaremos paso a paso a través de la aplicación interactiva de Realidad Aumentada de SIED UNSJ.',
    target: null,
    btnLabel: 'Comenzar'
  },
  {
    id: 2,
    page: 'index',
    title: 'Gira el Cubo e Selecciona una Sección',
    body: 'Gira el cubo 3D con el ratón o el dedo y haz clic en una de sus caras (por ejemplo: Dinos) para elegir tu tema de preferencia.',
    target: '#cube-wrapper',
    btnLabel: 'Toca una cara del cubo',
    requireAction: true
  },

  // PÁGINA 2: CATEGORY
  {
    id: 3,
    page: 'category',
    title: 'Información de la Categoría',
    body: 'Aquí verás la presentación y descripción general de la temática elegida.',
    target: '.hero-content',
    btnLabel: 'Siguiente'
  },
  {
    id: 4,
    page: 'category',
    title: 'Botón para Volver Atrás',
    body: 'Este botón en la esquina superior derecha te permite regresar al inicio en cualquier momento.',
    target: '.close-btn',
    btnLabel: 'Siguiente'
  },
  {
    id: 5,
    page: 'category',
    title: 'Ver Colección / Explorar',
    body: 'Toca el botón "Ver colección" para ingresar al catálogo interactivo de elementos.',
    target: '#heroBtn',
    btnLabel: 'Toca "Ver colección"',
    requireAction: true
  },

  // PÁGINA 3: ELEMENTS
  {
    id: 6,
    page: 'elements',
    title: 'Cambiar de Objeto',
    body: 'Usa estas flechas para alternar y navegar rápidamente entre los diferentes objetos o animales de la colección.',
    target: '.machine-nav',
    btnLabel: 'Siguiente'
  },
  {
    id: 7,
    page: 'elements',
    title: 'Menú Lateral Izquierdo',
    body: 'Aquí tienes la lista completa de elementos de la colección. Puedes hacer clic directo en cualquiera para seleccionar el modelo.',
    target: '.sidebar-left',
    btnLabel: 'Siguiente'
  },
  {
    id: 8,
    page: 'elements',
    title: 'Panel de Especificaciones',
    body: 'En el lateral derecho verás las categorías del tema y el cuadro técnico informativo de especificaciones del elemento actual.',
    target: '.sidebar-right',
    btnLabel: 'Siguiente'
  },
  {
    id: 9,
    page: 'elements',
    title: 'Información del Elemento',
    body: 'Debajo del visor encuentras el nombre y el texto descriptivo detallado del modelo seleccionado.',
    target: '.machine-name, .machine-description',
    btnLabel: 'Siguiente'
  },
  {
    id: 10,
    page: 'elements',
    title: 'Volver al Home',
    body: 'Al hacer clic en el logo superior de SIED podrás regresar al inicio de la aplicación.',
    target: '.header-logo',
    btnLabel: 'Siguiente'
  },
  {
    id: 11,
    page: 'elements',
    title: 'Ir al Visor 3D / RA',
    body: 'Presiona el botón "VER EN REALIDAD AUMENTADA" para proyectar y explorar el modelo en 3D interactivo.',
    target: '#arBtn',
    btnLabel: 'Toca el botón AR',
    requireAction: true
  },

  // PÁGINA 4: VISOR ESPACIAL
  {
    id: 12,
    page: 'visor-espacial',
    title: 'Nombre del Modelo',
    body: 'En la parte superior se indica el nombre del modelo 3D que estás observando.',
    target: '#nombreModelo',
    btnLabel: 'Siguiente'
  },
  {
    id: 13,
    page: 'visor-espacial',
    title: 'Controles de Tamaño y Rotación',
    body: 'Utiliza estos botones laterales para aumentar (+), reducir (-), o rotar (↺ ↻) la vista del modelo 3D.',
    target: '.controls-panel',
    btnLabel: 'Siguiente'
  },
  {
    id: 14,
    page: 'visor-espacial',
    title: 'Puntos Informativos (Hotspots)',
    body: 'Toca uno de los círculos flotantes (hotspots) sobre el modelo 3D para desplegar su información detallada.',
    target: '#visorModelo',
    btnLabel: 'Toca un punto flotante',
    requireAction: true,
    padding: 30
  },
  {
    id: 15,
    page: 'visor-espacial',
    title: 'Sacar Foto / Captura',
    body: 'Usa este botón con icono de cámara en la esquina inferior derecha para capturar una foto del modelo.',
    target: '#btnCaptura',
    btnLabel: 'Siguiente'
  },
  {
    id: 16,
    page: 'visor-espacial',
    title: 'Volver Atrás',
    body: 'El botón en la esquina superior derecha te regresa a la vista de detalles de la colección.',
    target: '.header .close-btn',
    btnLabel: 'Siguiente'
  },
  {
    id: 17,
    page: 'visor-espacial',
    title: '¡Tutorial Completado!',
    body: '¡Felicitaciones! Ahora conoces todas las funcionalidades de la app SIED Realidad Aumentada. ¡Disfruta explorando!',
    target: null,
    btnLabel: 'Finalizar'
  }
];

class TutorialManager {
  constructor() {
    this.svgContainer = null;
    this.spotlightBorder = null;
    this.card = null;
    this.confirmModal = null;
    this.currentStepIndex = 0;
  }

  isTutorialActive() {
    return sessionStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true';
  }

  getCurrentStepNumber() {
    const val = sessionStorage.getItem(TUTORIAL_STEP_KEY);
    return val ? parseInt(val, 10) : 1;
  }

  startTutorial() {
    sessionStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    sessionStorage.setItem(TUTORIAL_STEP_KEY, '1');
    this.showStep(1);
  }

  endTutorial() {
    sessionStorage.setItem(TUTORIAL_STORAGE_KEY, 'false');
    sessionStorage.removeItem(TUTORIAL_STEP_KEY);
    this.removeDOM();
  }

  confirmEndTutorial() {
    if (this.confirmModal) return;

    this.confirmModal = document.createElement('div');
    this.confirmModal.className = 'tutorial-confirm-overlay';
    this.confirmModal.innerHTML = `
      <div class="tutorial-confirm-modal">
        <div class="tutorial-confirm-icon">⚠️</div>
        <h4>¿Deseas salir del tutorial?</h4>
        <p>Puedes reiniciar la guía interactiva cuando quieras con el botón superior.</p>
        <div class="tutorial-confirm-actions">
          <button class="tutorial-confirm-btn-no" id="tutConfirmNo">Continuar Tutorial</button>
          <button class="tutorial-confirm-btn-yes" id="tutConfirmYes">Sí, salir</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.confirmModal);

    document.getElementById('tutConfirmYes').addEventListener('click', () => {
      this.confirmModal.remove();
      this.confirmModal = null;
      this.endTutorial();
    });

    document.getElementById('tutConfirmNo').addEventListener('click', () => {
      this.confirmModal.remove();
      this.confirmModal = null;
    });
  }

  checkAndInit(currentPageName) {
    if (!this.isTutorialActive()) return;
    let stepNum = this.getCurrentStepNumber();
    let stepData = STEPS.find(s => s.id === stepNum);

    // Si el paso guardado no es de esta página pero el tutorial está activo,
    // sincronizar con el primer paso de la página actual
    if (!stepData || stepData.page !== currentPageName) {
      stepData = STEPS.find(s => s.page === currentPageName);
      if (stepData) {
        stepNum = stepData.id;
      }
    }

    if (stepData) {
      setTimeout(() => this.showStep(stepNum), 300);
    }
  }

  showStep(stepNumber) {
    const stepData = STEPS.find(s => s.id === stepNumber);
    if (!stepData) {
      this.endTutorial();
      return;
    }

    sessionStorage.setItem(TUTORIAL_STEP_KEY, stepNumber.toString());
    this.currentStepIndex = STEPS.indexOf(stepData);

    this.renderDOM(stepData);
  }

  prevStep() {
    const currentNum = this.getCurrentStepNumber();
    if (currentNum <= 1) return;
    const prevNum = currentNum - 1;
    const prevStepData = STEPS.find(s => s.id === prevNum);
    const currentStepData = STEPS.find(s => s.id === currentNum);

    // Si el paso anterior pertenece a una página distinta, navegar hacia esa página
    if (prevStepData && currentStepData && prevStepData.page !== currentStepData.page) {
      sessionStorage.setItem(TUTORIAL_STEP_KEY, prevNum.toString());
      if (prevStepData.page === 'index') {
        window.location.href = '../../index.html';
      } else if (prevStepData.page === 'category') {
        window.history.back();
      } else if (prevStepData.page === 'elements') {
        window.history.back();
      }
      return;
    }

    this.showStep(prevNum);
  }

  nextStep() {
    const currentNum = this.getCurrentStepNumber();
    const nextNum = currentNum + 1;
    const nextStepData = STEPS.find(s => s.id === nextNum);
    const currentStepData = STEPS.find(s => s.id === currentNum);

    if (nextNum > STEPS.length) {
      this.endTutorial();
      return;
    }

    // Si el paso siguiente pertenece a una página distinta, el usuario debe interactuar con el botón/elemento de la página
    if (nextStepData && currentStepData && nextStepData.page !== currentStepData.page) {
      sessionStorage.setItem(TUTORIAL_STEP_KEY, nextNum.toString());
      return;
    }

    this.showStep(nextNum);
  }

  removeDOM() {
    if (this.svgContainer) {
      this.svgContainer.remove();
      this.svgContainer = null;
    }
    if (this.spotlightBorder) {
      this.spotlightBorder.remove();
      this.spotlightBorder = null;
    }
    if (this.card) {
      this.card.remove();
      this.card = null;
    }
    if (this.confirmModal) {
      this.confirmModal.remove();
      this.confirmModal = null;
    }
  }

  renderDOM(step) {
    let targetEls = [];
    if (step.target) {
      targetEls = Array.from(document.querySelectorAll(step.target));
    }

    // 1. Render/Update SVG Cutout Masking
    this.renderSVGCutout(targetEls, step.padding || 10);

    const isFirstStep = step.id === 1;

    // 2. Reuse or Create Card Modal
    if (!this.card) {
      this.card = document.createElement('div');
      this.card.className = 'tutorial-card';
      document.body.appendChild(this.card);
    }

    this.card.innerHTML = `
      <button class="tutorial-close-x" id="tutCloseXBtn" title="Cerrar tutorial">✖</button>
      <div class="tutorial-card-header">
        <span class="tutorial-badge">TUTORIAL PASO A PASO</span>
        <span class="tutorial-step-counter">${step.id} / ${STEPS.length}</span>
      </div>
      <h3 class="tutorial-title">${step.title}</h3>
      <div class="tutorial-body">${step.body}</div>
      <div class="tutorial-footer">
        <div class="tutorial-left-actions">
          ${isFirstStep 
            ? `<button class="tutorial-btn-cancel" id="tutCancelBtn">Cancelar</button>` 
            : `<button class="tutorial-btn-prev" id="tutPrevBtn">← Anterior</button>`}
        </div>
        ${!step.requireAction ? `<button class="tutorial-btn-next" id="tutNextBtn">${step.btnLabel || 'Siguiente'}</button>` : `<div class="tutorial-notice-action">👉 Realiza la acción destacada</div>`}
      </div>
    `;

    document.getElementById('tutCloseXBtn').addEventListener('click', () => {
      if (isFirstStep) {
        this.endTutorial();
      } else {
        this.confirmEndTutorial();
      }
    });

    if (isFirstStep) {
      document.getElementById('tutCancelBtn').addEventListener('click', () => this.endTutorial());
    }

    if (!isFirstStep) {
      const prevBtn = document.getElementById('tutPrevBtn');
      if (prevBtn) {
        prevBtn.addEventListener('click', () => this.prevStep());
      }
    }

    const nextBtn = document.getElementById('tutNextBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (step.id === 17) {
          this.endTutorial();
        } else {
          this.nextStep();
        }
      });
    }

    // Si el paso requiere una acción obligatoria del usuario (ej: tocar hotspot), avanzar tras la interacción
    if (step.requireAction && targetEls.length > 0) {
      const waitTime = step.id === 14 ? 2600 : 400; // Dar 2.6 segundos para leer la información desplegada del hotspot
      const interactiveEls = step.id === 14 
        ? Array.from(document.querySelectorAll('.punto-contenedor, #visorModelo'))
        : targetEls;

      interactiveEls.forEach(el => {
        const handler = () => {
          el.removeEventListener('click', handler);
          setTimeout(() => this.nextStep(), waitTime);
        };
        el.addEventListener('click', handler);
      });
    }

    const combinedRect = this.getCombinedBoundingRect(targetEls);

    if (combinedRect) {
      this.positionCardNearTarget(combinedRect);
    } else {
      this.card.style.top = '50%';
      this.card.style.left = '50%';
      this.card.style.transform = 'translate(-50%, -50%)';
    }
  }

  getCombinedBoundingRect(elements) {
    if (!elements || elements.length === 0) return null;
    let minLeft = Infinity, minTop = Infinity, maxRight = -Infinity, maxBottom = -Infinity;

    elements.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.left < minLeft) minLeft = r.left;
      if (r.top < minTop) minTop = r.top;
      if (r.right > maxRight) maxRight = r.right;
      if (r.bottom > maxBottom) maxBottom = r.bottom;
    });

    return {
      left: minLeft,
      top: minTop,
      right: maxRight,
      bottom: maxBottom,
      width: maxRight - minLeft,
      height: maxBottom - minTop
    };
  }

  renderSVGCutout(targetEls, customPad = 10) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let pathD = `M 0,0 L ${vw},0 L ${vw},${vh} L 0,${vh} Z`;

    const rect = this.getCombinedBoundingRect(targetEls);

    if (rect) {
      const pad = customPad;
      const x = Math.max(0, rect.left - pad);
      const y = Math.max(0, rect.top - pad);
      const w = rect.width + pad * 2;
      const h = rect.height + pad * 2;
      const r = 16;

      pathD += ` M ${x + r},${y}
        h ${w - 2 * r}
        a ${r},${r} 0 0 1 ${r},${r}
        v ${h - 2 * r}
        a ${r},${r} 0 0 1 -${r},${r}
        h -${w - 2 * r}
        a ${r},${r} 0 0 1 -${r},-${r}
        v -${h - 2 * r}
        a ${r},${r} 0 0 1 ${r},-${r} Z`;

      if (!this.spotlightBorder) {
        this.spotlightBorder = document.createElement('div');
        this.spotlightBorder.className = 'tutorial-spotlight-border';
        document.body.appendChild(this.spotlightBorder);
      }
      this.spotlightBorder.style.top = `${y}px`;
      this.spotlightBorder.style.left = `${x}px`;
      this.spotlightBorder.style.width = `${w}px`;
      this.spotlightBorder.style.height = `${h}px`;
    } else if (this.spotlightBorder) {
      this.spotlightBorder.remove();
      this.spotlightBorder = null;
    }

    if (!this.svgContainer) {
      this.svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      this.svgContainer.setAttribute("class", "tutorial-svg-mask");
      this.svgContainer.setAttribute("viewBox", `0 0 ${vw} ${vh}`);

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathD);
      path.setAttribute("fill", "rgba(10, 15, 25, 0.82)");
      path.setAttribute("fill-rule", "evenodd");

      this.svgContainer.appendChild(path);
      document.body.appendChild(this.svgContainer);
    } else {
      const path = this.svgContainer.querySelector('path');
      if (path) {
        path.setAttribute("d", pathD);
      }
    }
  }

  positionCardNearTarget(rect) {
    const cardRect = this.card.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Si el elemento objetivo es muy grande (como el contenedor del cubo 3D o visor de modelo), posicionar inteligentemente
    if (rect.height > viewportHeight * 0.5) {
      let top = Math.max(30, rect.top + 30);
      let left = rect.left + (rect.width / 2) - (cardRect.width / 2);

      // Ajustes de límites de pantalla
      if (left + cardRect.width > viewportWidth - 20) {
        left = viewportWidth - cardRect.width - 20;
      }
      if (left < 20) left = 20;

      this.card.style.top = `${top}px`;
      this.card.style.left = `${left}px`;
      return;
    }

    let top = rect.bottom + 15;
    let left = rect.left + (rect.width / 2) - (cardRect.width / 2);

    if (top + cardRect.height > viewportHeight - 20) {
      top = rect.top - cardRect.height - 15;
    }
    if (top < 20) {
      top = 20;
    }

    if (left + cardRect.width > viewportWidth - 20) {
      left = viewportWidth - cardRect.width - 20;
    }
    if (left < 20) {
      left = 20;
    }

    this.card.style.top = `${top}px`;
    this.card.style.left = `${left}px`;
  }
}

export const tutorial = new TutorialManager();
