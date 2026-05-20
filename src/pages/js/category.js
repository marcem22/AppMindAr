import { siteData } from '../../data.js';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const catId = params.get('id') || 'minas';
    const data = siteData[catId];

    if (data) {
        // Update text
        const pageTitleText = 'SIED - ' + (data.shortTitle || data.title);
        document.title = pageTitleText;
        if (document.getElementById('pageTitle')) {
            document.getElementById('pageTitle').textContent = pageTitleText;
        }
        document.getElementById('heroSubtitle').textContent = data.subtitle;
        document.getElementById('heroTitle').innerHTML = data.title;
        document.getElementById('heroDesc').innerHTML = data.description;
        document.getElementById('btnText').textContent = data.buttonText;

        // Update links
        document.getElementById('heroBtn').href = data.buttonLink ? data.buttonLink : 'elements.html?id=' + catId;

        // Precarga proactiva en segundo plano de los 2 primeros modelos de la categoría usando Cache API
        if (data.elementsData && data.elementsData.length > 0) {
            const isProd = window.location.hostname.includes('github.io');
            const BASE = isProd ? '/AppMindAr/models/' : '/models/';
            
            data.elementsData.slice(0, 2).forEach(async (item) => {
                const modelUrl = BASE + item.arMarker + '.glb';
                try {
                    if ('caches' in window) {
                        const cache = await caches.open('models-cache');
                        const cachedResponse = await cache.match(modelUrl);
                        if (!cachedResponse) {
                            console.log(`[Category Cache Preload] Descargando proactivamente: ${item.arMarker}`);
                            const response = await fetch(modelUrl, { priority: 'low' });
                            if (response.ok) {
                                await cache.put(modelUrl, response);
                                console.log(`[Category Cache Preload] Guardado en caché: ${item.arMarker}`);
                            }
                        } else {
                            console.log(`[Category Cache Preload] Ya existe en caché: ${item.arMarker}`);
                        }
                    } else {
                        fetch(modelUrl, { priority: 'low' });
                    }
                } catch(e) {
                    console.warn(`[Category Cache Preload] Error:`, e);
                }
                
                if (item.tieneUsdz) {
                    const usdzUrl = BASE + item.arMarker + '.usdz';
                    try {
                        if ('caches' in window) {
                            const cache = await caches.open('models-cache');
                            const cachedUsdz = await cache.match(usdzUrl);
                            if (!cachedUsdz) {
                                const response = await fetch(usdzUrl, { priority: 'low' });
                                if (response.ok) await cache.put(usdzUrl, response);
                            }
                        } else {
                            fetch(usdzUrl, { priority: 'low' });
                        }
                    } catch(e) {}
                }
            });
        }

        // Update CSS variables and styles
        document.documentElement.style.setProperty('--theme-color', data.themeColor);
        if (data.themeColorRgb) {
            document.documentElement.style.setProperty('--theme-color-rgb', data.themeColorRgb);
        }
        document.body.style.background = `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url("${data.bgImage}") no-repeat center center/cover`;

        // Handle different layouts (e.g., minerales has no hero image but full screen image)
        const backdrop = document.getElementById('backdrop');
        const heroImg = document.getElementById('heroImage');

        backdrop.className = data.backdropClass;

        if (data.heroImage) {
            heroImg.src = data.heroImage;
            heroImg.className = data.heroImageClass;
            heroImg.style.display = 'block';
        } else {
            heroImg.style.display = 'none';
            // Special case for minerales background if needed
            if (data.backdropClass === 'color-backdrop') {
                document.body.style.background = '#000';
                const fullImg = document.createElement('img');
                fullImg.src = data.bgImage;
                fullImg.className = data.heroImageClass;
                document.getElementById('home').insertBefore(fullImg, backdrop);

                backdrop.style.background = `linear-gradient(to right, rgba(0, 0, 0, 0.9) 20%, ${data.themeColor}33 60%, rgba(0, 0, 0, 0.7))`;

                // Remove before from subtitle
                const style = document.createElement('style');
                style.innerHTML = '.hero-subtitle::before { display: none !important; } .hero-description { background-color: rgba(0, 0, 0, 0.65); backdrop-filter: blur(6px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5); border-radius: 8px; }';
                document.head.appendChild(style);
            }
        }

        // Prevent FOUC: wait for background image to load
        const loadHero = () => {
            if (data.heroImage) {
                const hImg = new Image();
                hImg.src = data.heroImage;
                hImg.onload = () => document.body.classList.add('ready');
                hImg.onerror = () => document.body.classList.add('ready');
            } else {
                document.body.classList.add('ready');
            }
        };

        if (data.bgImage) {
            const img = new Image();
            img.src = data.bgImage;
            img.onload = loadHero;
            img.onerror = loadHero;
        } else {
            document.body.style.background = 'radial-gradient(circle at center, #1a120b 0%, #000 100%)';
            loadHero();
        }
    } else {
        // Default fallback
        document.body.classList.add('ready');
    }
});