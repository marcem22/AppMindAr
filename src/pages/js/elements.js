import { siteData } from "../../data.js";
    const isProduction = window.location.hostname.includes('github.io');
    const BASE_PATH = isProduction ? '/AppMindAr' : '';

    // The machines data is now loaded dynamically from src/data.js


    const urlParams = new URLSearchParams(window.location.search);
    const catId = urlParams.get('id') || 'minas';
    const data = siteData[catId];
    document.documentElement.style.setProperty('--theme-color', data.themeColor);
    if (data.themeColorRgb) {
      document.documentElement.style.setProperty('--theme-color-rgb', data.themeColorRgb);
    }

    // Support the background changing
    document.body.style.background = data.bgGradient || `radial-gradient(circle at center, #0f0f10 0%, #000 100%)`; // Base background

    // For elements, we usually don't set the hero image background, but let's see. 
    // Usually elements.html has a plain dark background for 3d models.


    const machines = data.elementsData;

    // Apply specific labels if present
    if (data.specLabels) {
      document.querySelectorAll('.spec-label-1').forEach(el => el.textContent = data.specLabels[0]);
      document.querySelectorAll('.spec-label-2').forEach(el => el.textContent = data.specLabels[1]);
      document.querySelectorAll('.spec-label-3').forEach(el => el.textContent = data.specLabels[2]);
      document.querySelectorAll('.spec-label-4').forEach(el => el.textContent = data.specLabels[3]);
    }


    const groups = ["Todas", ...Array.from(new Set(machines.map(m => m.group)))];

    let currentGroup = "Todas";
    let filteredIndexes = machines.map((_, i) => i);
    let currentFilteredIndex = 0;

    const listEl = document.getElementById('machineryList');
    const categoriesEl = document.getElementById('categories');
    const machineImage = document.getElementById('machineImage');
    const machineName = document.getElementById('machineName');
    const machineDesc = document.getElementById('machineDesc');
    const machineCategory = document.getElementById('machineCategory');
    const specCapacity = document.getElementById('specCapacity');
    const specPower = document.getElementById('specPower');
    const specWeight = document.getElementById('specWeight');
    const specApplication = document.getElementById('specApplication');
    const pageIndicator = document.getElementById('pageIndicator');
    const wrapper = document.getElementById('machineWrapper');
    const arBtn = document.getElementById('arBtn');

    function renderCategories() {
      categoriesEl.innerHTML = "";
      groups.forEach(g => {
        const btn = document.createElement('button');
        btn.className = 'cat-btn' + (g === currentGroup ? ' active' : '');
        btn.textContent = g;
        btn.onclick = () => { filterByGroup(g); };
        categoriesEl.appendChild(btn);
      });
    }

    function renderList() {
      listEl.innerHTML = "";
      if (filteredIndexes.length === 0) {
        const li = document.createElement('li');
        li.className = 'empty-msg';
        li.textContent = 'No hay elementos en esta categoría.';
        listEl.appendChild(li);
        return;
      }
      filteredIndexes.forEach((machineIdx, pos) => {
        const m = machines[machineIdx];
        const li = document.createElement('li');
        li.dataset.idx = machineIdx;
        li.innerHTML = `<span>${m.name}<span class="small-model">${m.category}</span></span>`;
        if (pos === currentFilteredIndex) li.classList.add('active');
        li.onclick = () => {
          currentFilteredIndex = filteredIndexes.indexOf(machineIdx);
          updateToCurrentFiltered();
        };
        listEl.appendChild(li);
      });
    }

    function filterByGroup(group) {
      currentGroup = group;
      if (group === "Todas") filteredIndexes = machines.map((_, i) => i);
      else filteredIndexes = machines.map((m, i) => m.group === group ? i : -1).filter(i => i !== -1);

      currentFilteredIndex = 0;
      renderCategories();
      renderList();
      updateToCurrentFiltered();
    }

    function updateToCurrentFiltered() {
      if (filteredIndexes.length === 0) {
        machineImage.src = "";
        machineName.textContent = "";
        machineDesc.textContent = "";
        machineCategory.textContent = currentGroup.toUpperCase();
        specCapacity.textContent = "-";
        specPower.textContent = "-";
        specWeight.textContent = "-";
        specApplication.textContent = "-";
        pageIndicator.innerHTML = `00 <span>/ ${String(filteredIndexes.length).padStart(2, '0')}</span>`;
        return;
      }

      const globalIndex = filteredIndexes[currentFilteredIndex];
      const m = machines[globalIndex];

      wrapper.classList.remove('fade-in');
      wrapper.classList.add('fade-out');

      setTimeout(() => {
        machineImage.src = m.image;
        machineName.textContent = m.name;
        machineDesc.textContent = m.description;
        machineCategory.textContent = m.category.toUpperCase();
        specCapacity.textContent = m.capacity;
        specPower.textContent = m.power;
        specWeight.textContent = m.weight;
        specApplication.textContent = m.application;

        document.querySelectorAll('.machinery-list li').forEach((li) => li.classList.remove('active'));
        const listItems = document.querySelectorAll('.machinery-list li');
        if (listItems[currentFilteredIndex]) listItems[currentFilteredIndex].classList.add('active');

        pageIndicator.innerHTML = `${String(currentFilteredIndex + 1).padStart(2, '0')} <span>/ ${String(filteredIndexes.length).padStart(2, '0')}</span>`;

        wrapper.classList.remove('fade-out');
        wrapper.classList.add('fade-in');
      }, 260);
    }

    function changeMachine(delta) {
      if (filteredIndexes.length === 0) return;
      currentFilteredIndex = (currentFilteredIndex + delta + filteredIndexes.length) % filteredIndexes.length;
      updateToCurrentFiltered();
    }

    document.getElementById('prevBtn').addEventListener('click', () => changeMachine(-1));
    document.getElementById('nextBtn').addEventListener('click', () => changeMachine(1));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') changeMachine(-1);
      if (e.key === 'ArrowRight') changeMachine(1);
    });

    function irAExperienciaEspacial() {
      if (filteredIndexes.length === 0) return;
      const m = machines[filteredIndexes[currentFilteredIndex]];
      const orbit = m.cameraOrbit || '-90deg 75deg auto';
      const escala = m.escala || '1 1 1';
      let url = `${BASE_PATH}/src/pages/visor-espacial.html?id=${catId}&modelo=${m.arMarker}&nombre=${encodeURIComponent(m.name)}&orbit=${encodeURIComponent(orbit)}&escala=${encodeURIComponent(escala)}&color=${encodeURIComponent(data.themeColor)}&colorRgb=${encodeURIComponent(data.themeColorRgb)}`;
      if (m.orientation) url += `&orientation=${encodeURIComponent(m.orientation)}`;
      if (m.tieneUsdz) url += '&usdz=1';
      if (m.sonido) url += `&sonido=${encodeURIComponent(m.sonido)}`;
      window.location.href = url;
    }

    arBtn.addEventListener('click', irAExperienciaEspacial);

    // ========== MOBILE MENU FUNCTIONALITY ==========
    const menuToggle = document.getElementById('menuToggle');
    const mobileSidebar = document.getElementById('mobileSidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const mobileMachineryList = document.getElementById('mobileMachineryList');
    const arBtnMobile = document.getElementById('arBtnMobile');

    // Toggle mobile menu
    function toggleMobileMenu() {
      menuToggle.classList.toggle('active');
      mobileSidebar.classList.toggle('active');
      mobileOverlay.classList.toggle('active');
      document.body.style.overflow = mobileSidebar.classList.contains('active') ? 'hidden' : 'auto';
    }

    menuToggle.addEventListener('click', toggleMobileMenu);
    mobileOverlay.addEventListener('click', toggleMobileMenu);

    arBtnMobile.addEventListener('click', irAExperienciaEspacial);

    // Render mobile machinery list
    function renderMobileList() {
      mobileMachineryList.innerHTML = "";
      filteredIndexes.forEach((machineIdx, pos) => {
        const m = machines[machineIdx];
        const li = document.createElement('li');
        li.dataset.idx = machineIdx;
        li.innerHTML = `<span>${m.name}</span>`;
        if (pos === currentFilteredIndex) li.classList.add('active');
        li.addEventListener('click', () => {
          currentFilteredIndex = pos;
          updateToCurrentFiltered();
          toggleMobileMenu();
        });
        mobileMachineryList.appendChild(li);
      });
    }

    // Sync mobile specs with current machine
    function syncMobileSpecs() {
      if (filteredIndexes.length === 0) return;
      const m = machines[filteredIndexes[currentFilteredIndex]];
      document.getElementById('mobileSpecCapacity').textContent = m.capacity;
      document.getElementById('mobileSpecPower').textContent = m.power;
      document.getElementById('mobileSpecWeight').textContent = m.weight;
      document.getElementById('mobileSpecApplication').textContent = m.application;
    }

    // Initialize mobile menu content
    renderMobileList();
    syncMobileSpecs();

    // Update mobile content when machine changes
    const originalUpdateFunction = updateToCurrentFiltered;
    updateToCurrentFiltered = function () {
      originalUpdateFunction();
      renderMobileList();
      syncMobileSpecs();
    };

    renderCategories();
    filterByGroup('Todas');