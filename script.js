document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initSmoothScroll();
    initNavDropdown();
    initMobileNav();
    initScrollSpy();
    initCounters();
    initHeroGlobe();
    initThemeToggle();
    initCareerMap();
    initStudentsMap();
    initLanguageToggle();
    initPortfolioFilters();
    initLightbox();
    initContactForm();
    init3DTilt();
});

function initReveal() {
    const revealItems = document.querySelectorAll('.reveal');
    if (!revealItems.length) {
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.16 });

    revealItems.forEach((item) => observer.observe(item));
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);
            if (!target) {
                return;
            }

            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function initNavDropdown() {
    const dropdowns = Array.from(document.querySelectorAll('.nav-item-has-submenu'));

    if (!dropdowns.length) {
        return;
    }

    const setOpen = (dropdown, isOpen) => {
        const toggle = dropdown.querySelector('.nav-dropdown-toggle');

        dropdown.classList.toggle('open', isOpen);
        dropdown.classList.toggle('is-suppressed', false);
        toggle?.setAttribute('aria-expanded', String(isOpen));
    };

    dropdowns.forEach((dropdown) => {
        const toggle = dropdown.querySelector('.nav-dropdown-toggle');
        const submenuLinks = dropdown.querySelectorAll('.nav-submenu a');

        toggle?.addEventListener('click', (event) => {
            event.stopPropagation();
            const targetSelector = toggle.dataset.target;
            const target = targetSelector ? document.querySelector(targetSelector) : null;
            const nextOpenState = !dropdown.classList.contains('open');

            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            dropdowns.forEach((item) => {
                setOpen(item, false);
                item.classList.toggle('is-suppressed', item !== dropdown);
            });
            setOpen(dropdown, nextOpenState);
        });

        dropdown.addEventListener('pointerenter', () => {
            dropdown.classList.remove('is-suppressed');
        });

        submenuLinks.forEach((link) => {
            link.addEventListener('click', () => setOpen(dropdown, false));
        });
    });

    document.addEventListener('click', (event) => {
        dropdowns.forEach((dropdown) => {
            if (!dropdown.contains(event.target)) {
                setOpen(dropdown, false);
                dropdown.classList.remove('is-suppressed');
            }
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            dropdowns.forEach((dropdown) => {
                setOpen(dropdown, false);
                dropdown.classList.remove('is-suppressed');
            });
            document.activeElement?.blur();
        }
    });
}

function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const dropdowns = document.querySelectorAll('.nav-item-has-submenu');

    if (!toggle || !navLinks) {
        return;
    }

    toggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        const isOpen = navLinks.classList.contains('open');
        toggle.textContent = isOpen ? '✕' : '☰';
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            dropdowns.forEach((dropdown) => {
                dropdown.classList.remove('open');
                dropdown.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
            });
            toggle.textContent = '☰';
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Abrir menú');
        });
    });
}

function initScrollSpy() {
    const nav = document.querySelector('.site-nav');
    const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
    const aboutToggle = document.querySelector('[aria-controls="about-submenu"]');
    const projectToggle = document.querySelector('[aria-controls="projects-submenu"]');
    const researchToggle = document.querySelector('[aria-controls="research-submenu"]');

    if (!nav || !navLinks.length) {
        return;
    }

    const normalizePath = (path) => {
        const cleanPath = path.replace(/\/$/, '');
        return cleanPath.endsWith('/index.html') || cleanPath === '' ? cleanPath.replace(/\/index.html$/, '') : cleanPath;
    };

    const currentPath = normalizePath(window.location.pathname);

    const navItems = navLinks
        .map((link) => {
            const url = new URL(link.href, window.location.href);
            const targetId = url.hash;
            const isSamePage = normalizePath(url.pathname) === currentPath;

            if (!targetId || !isSamePage) {
                return null;
            }

            return { link, targetId };
        })
        .filter(Boolean);

    const trackedSections = [
        { section: document.querySelector('.hero'), targetId: '#top' },
        { section: document.querySelector('#profile'), targetId: '#profile' },
        { section: document.querySelector('#trajectory'), targetId: '#trajectory' },
        { section: document.querySelector('#recognition'), targetId: '#recognition' },
        { section: document.querySelector('#projects'), targetId: '#projects' },
        { section: document.querySelector('#geoportfolio'), targetId: '#geoportfolio' },
        { section: document.querySelector('#gallery'), targetId: '#gallery' },
        { section: document.querySelector('#map'), targetId: '#map' },
        { section: document.querySelector('#research-teaching'), targetId: '#research-teaching' },
        { section: document.querySelector('#university-teaching'), targetId: '#university-teaching' },
        { section: document.querySelector('#students'), targetId: '#students' },
        { section: document.querySelector('#contact'), targetId: '#contact' }
    ].filter(({ section }) => section);

    if (!navItems.length || !trackedSections.length) {
        return;
    }

    const setActiveLink = (activeId) => {
        navItems.forEach(({ link, targetId }) => {
            const isActive = targetId === activeId;
            link.classList.toggle('is-active', isActive);

            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });

        const isProjectActive = ['#projects', '#geoportfolio', '#gallery', '#map'].includes(activeId);
        projectToggle?.classList.toggle('is-active', isProjectActive);

        const isAboutActive = ['#profile', '#trajectory', '#recognition', '#faq'].includes(activeId);
        aboutToggle?.classList.toggle('is-active', isAboutActive);

        const isResearchActive = ['#research-teaching', '#university-teaching', '#students'].includes(activeId);
        researchToggle?.classList.toggle('is-active', isResearchActive);
    };

    const updateActiveSection = () => {
        const navOffset = nav.offsetHeight + 28;
        let activeId = trackedSections[0].targetId;

        trackedSections.forEach(({ targetId, section }) => {
            const rect = section.getBoundingClientRect();

            if (rect.top <= navOffset && rect.bottom > navOffset) {
                activeId = targetId;
            }
        });

        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
            activeId = trackedSections[trackedSections.length - 1].targetId;
        }

        setActiveLink(activeId);
    };

    let ticking = false;
    const requestUpdate = () => {
        if (ticking) {
            return;
        }

        ticking = true;
        window.requestAnimationFrame(() => {
            updateActiveSection();
            ticking = false;
        });
    };

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            const url = new URL(link.href, window.location.href);

            if (normalizePath(url.pathname) === currentPath && url.hash) {
                setActiveLink(url.hash);
            }

            window.setTimeout(requestUpdate, 180);
        });
    });

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    requestUpdate();
}

function initCounters() {
    const counters = document.querySelectorAll('[data-count]');

    counters.forEach((counter) => {
        const target = Number(counter.dataset.count);
        const start = target - 12;
        const duration = 1200;
        const startTime = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const value = Math.floor(start + (target - start) * progress);
            counter.textContent = String(value);
            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        };

        requestAnimationFrame(tick);
    });
}


function initHeroGlobe() {
    const canvas = document.getElementById('hero-globe');
    if (!canvas) {
        return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
        return;
    }

    const capitalCities = [
        { name: 'Cobija', lon: -68.77, lat: -11.03 },
        { name: 'Trinidad', lon: -64.9, lat: -14.83 },
        { name: 'Cochabamba', lon: -66.16, lat: -17.39 },
        { name: 'La Paz', lon: -68.15, lat: -16.5 },
        { name: 'Oruro', lon: -67.11, lat: -17.97 },
        { name: 'Potosi', lon: -65.75, lat: -19.58 },
        { name: 'Santa Cruz', lon: -63.18, lat: -17.78 },
        { name: 'Sucre', lon: -65.26, lat: -19.04 },
        { name: 'Tarija', lon: -64.73, lat: -21.53 }
    ];

    let width = 0;
    let height = 0;
    let animationFrameId = 0;
    let time = 0;
    let hoveredCity = null;
    let boliviaShape = [];
    let shapeBounds = {
        minLon: -69.7,
        maxLon: -57.4,
        minLat: -22.95,
        maxLat: -9.65
    };

    function resize() {
        const bounds = canvas.getBoundingClientRect();
        const ratio = window.devicePixelRatio || 1;
        width = bounds.width;
        height = bounds.height;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        if (!animationFrameId) {
            render();
        }
    }

    function getHoveredCity(clientX, clientY) {
        const bounds = canvas.getBoundingClientRect();
        const x = clientX - bounds.left;
        const y = clientY - bounds.top;

        return capitalCities.find((city) => {
            const point = projectBolivia(city.lon, city.lat);
            const radius = city.name === 'La Paz' || city.name === 'Santa Cruz' ? 8 : 7;
            return Math.hypot(point.x - x, point.y - y) <= radius;
        }) || null;
    }

    function projectBolivia(lon, lat) {
        const lonSpan = shapeBounds.maxLon - shapeBounds.minLon;
        const latSpan = shapeBounds.maxLat - shapeBounds.minLat;
        const x = ((lon - shapeBounds.minLon) / lonSpan) * width * 0.66 + width * 0.17;
        const y = ((shapeBounds.maxLat - lat) / latSpan) * height * 0.82 + height * 0.08;
        return { x, y };
    }

    function simplifyPoints(points, step) {
        if (points.length <= step) {
            return points;
        }

        const simplified = points.filter((_, index) => index % step === 0);
        const first = points[0];
        const last = simplified[simplified.length - 1];
        if (last[0] !== first[0] || last[1] !== first[1]) {
            simplified.push(first);
        }
        return simplified;
    }

    async function loadBoliviaShape() {
        try {
            const response = await fetch('data/Bolivia.geojson');
            const geojson = await response.json();
            const features = geojson.features || [];
            const multipolygon = features[0]?.geometry?.coordinates || [];
            const rings = multipolygon
                .flatMap((polygon) => polygon)
                .filter((ring) => Array.isArray(ring) && ring.length > 0);

            if (!rings.length) {
                return;
            }

            const primaryRing = rings.reduce((largest, ring) => (
                ring.length > largest.length ? ring : largest
            ), rings[0]);

            boliviaShape = simplifyPoints(primaryRing, 22);

            const lons = boliviaShape.map(([lon]) => lon);
            const lats = boliviaShape.map(([, lat]) => lat);
            shapeBounds = {
                minLon: Math.min(...lons),
                maxLon: Math.max(...lons),
                minLat: Math.min(...lats),
                maxLat: Math.max(...lats)
            };
            if (!animationFrameId) {
                render();
            }
        } catch (error) {
            console.error('No se pudo cargar Bolivia.geojson', error);
        }
    }
    function createGridPattern() {
        const isLight = document.documentElement.classList.contains('light-theme');
        const patternCanvas = document.createElement('canvas');
        patternCanvas.width = 12;
        patternCanvas.height = 12;
        const patternContext = patternCanvas.getContext('2d');
        if (!patternContext) {
            return null;
        }

        patternContext.fillStyle = isLight ? 'rgba(248, 250, 252, 0.88)' : 'rgba(20, 24, 28, 0.72)';
        patternContext.fillRect(0, 0, 12, 12);

        patternContext.fillStyle = isLight ? 'rgba(148, 163, 184, 0.28)' : 'rgba(230, 232, 234, 0.62)';
        patternContext.fillRect(1, 1, 4, 4);
        patternContext.fillRect(7, 1, 4, 4);
        patternContext.fillRect(1, 7, 4, 4);
        patternContext.fillRect(7, 7, 4, 4);

        return context.createPattern(patternCanvas, 'repeat');
    }

    function drawShapes() {
        if (!boliviaShape.length) {
            return;
        }

        const isLight = document.documentElement.classList.contains('light-theme');

        context.save();
        context.beginPath();
        boliviaShape.forEach(([lon, lat], index) => {
            const point = projectBolivia(lon, lat);
            if (index === 0) {
                context.moveTo(point.x, point.y);
            } else {
                context.lineTo(point.x, point.y);
            }
        });
        context.closePath();

        const pattern = createGridPattern();
        if (pattern) {
            context.fillStyle = pattern;
            context.globalAlpha = 0.52;
        } else {
            context.fillStyle = isLight ? 'rgba(15, 118, 110, 0.08)' : 'rgba(210, 214, 218, 0.26)';
        }
        context.fill();
        context.globalAlpha = 1;
        context.strokeStyle = isLight ? 'rgba(15, 118, 110, 0.72)' : 'rgba(223, 243, 248, 0.72)';
        context.lineWidth = 1.4;
        context.stroke();
        context.restore();
    }

    function drawCapitalNodes() {
        if (!boliviaShape.length) {
            return;
        }

        const isLight = document.documentElement.classList.contains('light-theme');

        context.save();
        capitalCities.forEach((city, index) => {
            const point = projectBolivia(city.lon, city.lat);
            const radius = city.name === 'La Paz' || city.name === 'Santa Cruz' ? 5 : 4;

             if (city.name === 'Santa Cruz') {
                [16, 10].forEach((ring, ringIndex) => {
                    context.beginPath();
                    context.arc(point.x, point.y, ring + Math.sin(time * 0.05) * 1.2, 0, Math.PI * 2);
                    context.strokeStyle = isLight 
                        ? `rgba(234, 88, 12, ${0.2 - ringIndex * 0.07})` 
                        : `rgba(243, 192, 58, ${0.2 - ringIndex * 0.07})`;
                    context.lineWidth = 4 - ringIndex;
                    context.stroke();
                });
            }

            context.beginPath();
            context.arc(point.x, point.y, radius, 0, Math.PI * 2);
            if (isLight) {
                context.fillStyle = index % 2 === 0 ? 'rgba(234, 88, 12, 0.95)' : 'rgba(15, 118, 110, 0.95)';
            } else {
                context.fillStyle = index % 2 === 0 ? 'rgba(243, 192, 58, 0.95)' : 'rgba(223, 243, 248, 0.95)';
            }
            context.fill();

            context.beginPath();
            context.arc(point.x, point.y, radius + 2.2, 0, Math.PI * 2);
            context.strokeStyle = isLight ? 'rgba(15, 118, 110, 0.22)' : 'rgba(223, 243, 248, 0.22)';
            context.lineWidth = 1;
            context.stroke();
        });
        context.restore();
    }

    function drawTooltip() {
        if (!hoveredCity) {
            return;
        }

        const isLight = document.documentElement.classList.contains('light-theme');
        const point = projectBolivia(hoveredCity.lon, hoveredCity.lat);
        const label = hoveredCity.name;
        context.save();
        context.font = "600 13px 'JetBrains Mono'";
        const textWidth = context.measureText(label).width;
        const paddingX = 10;
        const boxWidth = textWidth + paddingX * 2;
        const boxHeight = 30;
        const boxX = Math.min(Math.max(point.x - boxWidth / 2, 12), width - boxWidth - 12);
        const boxY = Math.max(point.y - 42, 12);

        context.fillStyle = isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(31, 42, 49, 0.94)';
        context.strokeStyle = isLight ? 'rgba(15, 118, 110, 0.35)' : 'rgba(243, 201, 138, 0.28)';
        context.lineWidth = 1;
        context.beginPath();
        context.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
        context.fill();
        context.stroke();

        context.fillStyle = isLight ? 'rgba(15, 23, 42, 0.96)' : 'rgba(243, 246, 247, 0.96)';
        context.textBaseline = 'middle';
        context.fillText(label, boxX + paddingX, boxY + boxHeight / 2);
        context.restore();
    }

    function drawBackground() {
        const isLight = document.documentElement.classList.contains('light-theme');

        context.save();
        context.globalAlpha = isLight ? 0.05 : 0.08;
        for (let i = 0; i < 60; i += 1) {
            const y = (i / 60) * height;
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(width, y + Math.sin(i * 0.8) * 10);
            context.strokeStyle = isLight ? 'rgba(15, 118, 110, 0.12)' : 'rgba(243, 201, 138, 0.16)';
            context.lineWidth = 1;
            context.stroke();
        }
        context.restore();
    }

    function render() {
        context.clearRect(0, 0, width, height);
        drawBackground();
        drawShapes();
        drawCapitalNodes();
        drawTooltip();
        time += 1;
        animationFrameId = requestAnimationFrame(render);
    }

    resize();
    loadBoliviaShape();
    cancelAnimationFrame(animationFrameId);
    render();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', (event) => {
        hoveredCity = getHoveredCity(event.clientX, event.clientY);
        canvas.style.cursor = hoveredCity ? 'pointer' : 'default';
    });
    canvas.addEventListener('mouseleave', () => {
        hoveredCity = null;
        canvas.style.cursor = 'default';
    });
    window.addEventListener('beforeunload', () => cancelAnimationFrame(animationFrameId), { once: true });
}


window.activeMaps = [];

function setupMapLayers(map) {
    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    });

    const lightLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    });

    const isLight = document.documentElement.classList.contains('light-theme');
    if (isLight) {
        lightLayer.addTo(map);
    } else {
        darkLayer.addTo(map);
    }

    window.activeMaps.push({ map, darkLayer, lightLayer });

    return { darkLayer, lightLayer };
}

function updateMapThemes(isLight) {
    if (window.activeMaps) {
        window.activeMaps.forEach(({ map, darkLayer, lightLayer }) => {
            if (isLight) {
                if (map.hasLayer(darkLayer)) {
                    map.removeLayer(darkLayer);
                }
                if (!map.hasLayer(lightLayer)) {
                    map.addLayer(lightLayer);
                }
            } else {
                if (map.hasLayer(lightLayer)) {
                    map.removeLayer(lightLayer);
                }
                if (!map.hasLayer(darkLayer)) {
                    map.addLayer(darkLayer);
                }
            }
        });
    }
}

function initCareerMap() {
    const mapElement = document.getElementById('career-map');
    if (!mapElement || typeof L === 'undefined') {
        return;
    }

    const isMobile = window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window);

    const map = L.map(mapElement, {
        center: [-17.2, -62.8],
        zoom: 6,
        scrollWheelZoom: !isMobile,
        tap: !isMobile
    });

    setupMapLayers(map);

    let boliviaLayer = null;
    let regionsLayer = null;
    let departmentLayer = null;
    let departmentsBoliviaLayer = null;
    const featuredRegions = new Set([
        'metropolitana',
        'norte integrado',
        'chiquitania',
        'valles',
        'chaco cruceno'
    ]);
    const regionProjects = {
        metropolitana: {
            title: 'Metropolitana',
            projects: [
                'Investigacion sobre CORS RENA.',                
                'Analisis de la serie temporal de la estacion GNSS SCRZ.',
                'Docente en la materia de Rutas y Mapas digitales.',
                'Docente de postgrado en el módulo de catastro multifinalitario y desarrollo urbano.'
            ]
        },
        'norte integrado': {
            title: 'Norte Integrado',
            projects: [
                'Actualizacion catastral urbana con equipos GNSS, migracion de información territorial a SIG',
                'Asistencia en proyectos de delimitación y homologación de áreas urbanas.',
                'Apoyo a la formulación de propuesta para la creación de nuevos distritos urbanos-rurales.'
            ]
        },
        chiquitania: {
            title: 'Chiquitanía',
            projects: [
                'Asistencia SIG en la crisis de incendios forestales de 2020.',
                'Adminitración del sistema municipal de alerta temprana (SMAT)',
                'Cartografia y urbanismo municipal en San Miguel de Velasco.',
                'Catastro, drones y alerta temprana para gestion territorial municipal.',
                'Estructuración del catastro multifinalitario en SIG libre'
            ]
        },
        valles: {
            title: 'Valles',
            projects: [
                'Levantamiento topografia para proyectos de sistemas de riego.'
            ]
        },
        'chaco cruceno': {
            title: 'Chaco Cruceño',
            projects: [
                'Levantamiento topografico para planta de tratamiento de aguas residuales.'
            ]
        }
    };

    function normalizeRegionName(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toLowerCase();
    }

    function getRegionLayerStyle(feature) {
        const regionName = normalizeRegionName(feature?.properties?.Regiones);
        const isFeatured = featuredRegions.has(regionName);

        return {
            color: isFeatured ? 'rgba(243, 201, 138, 0.9)' : 'rgba(130, 196, 172, 0.18)',
            weight: isFeatured ? 1.6 : 0.8,
            fillColor: isFeatured ? '#d6723f' : '#5a8b63',
            fillOpacity: isFeatured ? 0.16 : 0.02
        };
    }

    function getDepartmentLayerStyle() {
        const isLight = document.documentElement.classList.contains('light-theme');

        return {
            color: isLight ? '#9c653c' : '#fff4d6',
            weight: isLight ? 1.9 : 2,
            opacity: isLight ? 0.88 : 0.95,
            fillColor: isLight ? '#d6b374' : '#fff4d6',
            fillOpacity: isLight ? 0.08 : 0
        };
    }

    function getDepartmentsBoliviaLayerStyle() {
        return {
            color: 'rgba(243, 201, 138, 0.42)',
            weight: 0.95,
            opacity: 0.8,
            fillColor: '#76a5a0',
            fillOpacity: 0.03
        };
    }

    function getBoliviaLayerStyle() {
        return {
            color: 'rgba(173, 191, 201, 0.45)',
            weight: 1.6,
            opacity: 0.85,
            fillOpacity: 0
        };
    }

    function getRegionPopupHtml(feature) {
        const regionName = normalizeRegionName(feature?.properties?.Regiones);
        const regionInfo = regionProjects[regionName];
        if (!regionInfo) {
            return '';
        }

        const projectsHtml = regionInfo.projects
            .map((project) => `<li style="margin-bottom:6px;">${project}</li>`)
            .join('');

        return `
            <div style="min-width:240px; font-family: Manrope, sans-serif;">
                <div style="font-family: JetBrains Mono, monospace; color:#f0c36a; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:6px;">Region</div>
                <div style="font-size:18px; margin-bottom:10px; color:#f5ecdb;">${regionInfo.title}</div>
                <div style="font-size:13px; line-height:1.6; color:rgba(245,236,219,0.9); margin-bottom:6px;">Proyectos desarrollados:</div>
                <ul style="margin:0; padding-left:18px; font-size:13px; line-height:1.6; color:rgba(245,236,219,0.9);">
                    ${projectsHtml}
                </ul>
            </div>
        `;
    }

    function onEachRegionFeature(feature, layer) {
        const regionName = normalizeRegionName(feature?.properties?.Regiones);
        if (!featuredRegions.has(regionName)) {
            return;
        }

        const popupHtml = getRegionPopupHtml(feature);
        if (!popupHtml) {
            return;
        }

        layer.bindPopup(popupHtml);
        layer.on('mouseover', () => {
            layer.setStyle({
                color: '#f3c98a',
                weight: 2.2,
                fillOpacity: 0.22
            });
        });
        layer.on('mouseout', () => {
            regionsLayer?.resetStyle(layer);
        });
    }

    async function ensureRegionsLayer() {
        if (regionsLayer) {
            return regionsLayer;
        }

        try {
            const response = await fetch('data/regiones_SC.geojson');
            if (!response.ok) {
                throw new Error('No se pudo cargar data/regiones_SC.geojson');
            }

            const geojson = await response.json();
            regionsLayer = L.geoJSON(geojson, {
                interactive: true,
                style: (feature) => getRegionLayerStyle(feature),
                onEachFeature: onEachRegionFeature
            });

            return regionsLayer;
        } catch (error) {
            console.error('No se pudo cargar el GeoJSON de regiones de Santa Cruz.', error);
            regionsLayer = null;
            return null;
        }
    }

    async function ensureBoliviaLayer() {
        if (boliviaLayer) {
            return boliviaLayer;
        }

        try {
            const response = await fetch('data/Bolivia.geojson');
            if (!response.ok) {
                throw new Error('No se pudo cargar data/Bolivia.geojson');
            }

            const geojson = await response.json();
            boliviaLayer = L.geoJSON(geojson, {
                interactive: false,
                style: () => getBoliviaLayerStyle()
            });

            return boliviaLayer;
        } catch (error) {
            console.error('No se pudo cargar el GeoJSON de Bolivia.', error);
            boliviaLayer = null;
            return null;
        }
    }

    async function ensureDepartmentLayer() {
        if (departmentLayer) {
            return departmentLayer;
        }

        try {
            const response = await fetch('data/SC_DEP.geojson');
            if (!response.ok) {
                throw new Error('No se pudo cargar data/SC_DEP.geojson');
            }

            const geojson = await response.json();
            departmentLayer = L.geoJSON(geojson, {
                interactive: false,
                style: () => getDepartmentLayerStyle()
            });

            return departmentLayer;
        } catch (error) {
            console.error('No se pudo cargar el GeoJSON del departamento de Santa Cruz.', error);
            departmentLayer = null;
            return null;
        }
    }

    async function ensureDepartmentsBoliviaLayer() {
        if (departmentsBoliviaLayer) {
            return departmentsBoliviaLayer;
        }

        try {
            const response = await fetch('data/departamentosBolivia.geojson');
            if (!response.ok) {
                throw new Error('No se pudo cargar data/departamentosBolivia.geojson');
            }

            const geojson = await response.json();
            departmentsBoliviaLayer = L.geoJSON(geojson, {
                interactive: false,
                style: () => getDepartmentsBoliviaLayerStyle()
            });

            return departmentsBoliviaLayer;
        } catch (error) {
            console.error('No se pudo cargar el GeoJSON de departamentos de Bolivia.', error);
            departmentsBoliviaLayer = null;
            return null;
        }
    }

    async function showMunicipalityBoundaries() {
        const nationalLayer = await ensureBoliviaLayer();
        if (nationalLayer && !map.hasLayer(nationalLayer)) {
            nationalLayer.addTo(map);
        }

        const boliviaDepartmentsLayer = await ensureDepartmentsBoliviaLayer();
        if (boliviaDepartmentsLayer && !map.hasLayer(boliviaDepartmentsLayer)) {
            boliviaDepartmentsLayer.addTo(map);
        }

        const baseRegionsLayer = await ensureRegionsLayer();
        if (baseRegionsLayer && !map.hasLayer(baseRegionsLayer)) {
            baseRegionsLayer.addTo(map);
        }

        const santaCruzDepartmentLayer = await ensureDepartmentLayer();
        if (santaCruzDepartmentLayer && !map.hasLayer(santaCruzDepartmentLayer)) {
            santaCruzDepartmentLayer.addTo(map);
            santaCruzDepartmentLayer.bringToFront();
            const departmentBounds = santaCruzDepartmentLayer.getBounds();
            if (departmentBounds.isValid()) {
                map.fitBounds(departmentBounds.pad(0.38), { padding: [26, 26], maxZoom: 5.8 });
            }
        }
    }

    showMunicipalityBoundaries().then(() => {
        document.getElementById('career-map-loader')?.classList.add('is-hidden');
    }).catch(() => {
        document.getElementById('career-map-loader')?.classList.add('is-hidden');
    });

    document.addEventListener('themechange', () => {
        boliviaLayer?.setStyle(getBoliviaLayerStyle());
        regionsLayer?.setStyle(getRegionLayerStyle);
        departmentLayer?.setStyle(getDepartmentLayerStyle());
        departmentsBoliviaLayer?.setStyle(getDepartmentsBoliviaLayerStyle());
    });
}

async function initStudentsMap() {
    const mapElement = document.getElementById('students-map');
    if (!mapElement || typeof L === 'undefined') {
        return;
    }

    const statTotal = document.getElementById('students-total');
    const statMunicipalities = document.getElementById('students-municipalities');
    const boliviaBounds = L.latLngBounds(
        L.latLng(-22.95, -69.8),
        L.latLng(-9.5, -57.3)
    );

    const isMobile = window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window);

    const map = L.map(mapElement, {
        center: [-17.35, -64.65],
        zoom: 5.9,
        preferCanvas: true,
        scrollWheelZoom: !isMobile,
        minZoom: 1,
        maxZoom: 18,
        tap: !isMobile
    });

    map.createPane('studentsDepartments');
    map.getPane('studentsDepartments').style.zIndex = '410';

    map.createPane('studentsMarkers');
    map.getPane('studentsMarkers').style.zIndex = '430';

    setupMapLayers(map);

    try {
        const boliviaResponse = await fetch('data/Bolivia.geojson');
        if (!boliviaResponse.ok) {
            throw new Error('No se pudo cargar data/Bolivia.geojson');
        }

        const boliviaGeojson = await boliviaResponse.json();
        L.geoJSON(boliviaGeojson, {
            interactive: false,
            style: () => ({
                color: 'rgba(243, 201, 138, 0.5)',
                weight: 1.4,
                opacity: 0.85,
                fillOpacity: 0
            })
        }).addTo(map);
    } catch (error) {
        console.error('No se pudo cargar el limite de Bolivia para el mapa de estudiantes.', error);
    }

    try {
        const departmentsResponse = await fetch('data/departamentosBolivia.geojson');
        if (!departmentsResponse.ok) {
            throw new Error('No se pudo cargar data/departamentosBolivia.geojson');
        }

        const departmentsGeojson = await departmentsResponse.json();
        const departmentsLayer = L.geoJSON(departmentsGeojson, {
            pane: 'studentsDepartments',
            style: () => ({
                color: 'rgba(243, 201, 138, 0.72)',
                weight: 1.1,
                opacity: 0.9,
                fillColor: '#76a5a0',
                fillOpacity: 0.04
            }),
            onEachFeature: (feature, layer) => {
                const departmentName = feature?.properties?.departamen || 'Departamento';

                layer.bindTooltip(escapeHtml(departmentName), {
                    sticky: true,
                    direction: 'top',
                    opacity: 0.92
                });

                layer.on('mouseover', () => {
                    layer.setStyle({
                        color: '#f3c98a',
                        weight: 1.6,
                        fillOpacity: 0.1
                    });
                });

                layer.on('mouseout', () => {
                    departmentsLayer.resetStyle(layer);
                });
            }
        }).addTo(map);
    } catch (error) {
        console.error('No se pudo cargar la capa de departamentos para el mapa de estudiantes.', error);
    }

    try {
        const sources = [
            { group: 'G2 ESAM LATAM', path: 'data/G2_ESAM LATAM.csv' },
            { group: 'G3 ESAM LATAM', path: 'data/G3_ESAM LATAM.csv' }
        ];

        const datasets = await Promise.all(sources.map(async (source) => {
            const response = await fetch(source.path);
            if (!response.ok) {
                throw new Error(`No se pudo cargar ${source.path}`);
            }

            const csvText = await response.text();
            const rows = parseCSV(csvText);

            return rows.map((row) => ({
                group: source.group,
                municipality: getStudentMunicipality(row),
                profession: getStudentProfession(row),
                latLng: getStudentLatLng(row.x, row.y)
            }));
        }));

        const unifranzPregrado = createUnifranzPregradoStudents();
        const allStudents = [...datasets.flat(), ...unifranzPregrado];

        const students = allStudents
            .filter((student) => student.latLng);

        if (!students.length) {
            throw new Error('No se encontraron estudiantes con coordenadas válidas.');
        }

        const municipalityCounts = new Set();
        const markerBounds = [];

        students.forEach((student) => {
            municipalityCounts.add(normalizeMunicipalityKey(student.municipality));
            markerBounds.push(student.latLng);

            const customIcon = L.divIcon({
                className: 'custom-geodetic-marker',
                html: `
                    <div class="geodetic-pulse-marker">
                        <div class="geodetic-pulse-ring"></div>
                        <div class="geodetic-pulse-center"></div>
                    </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            const marker = L.marker(student.latLng, {
                pane: 'studentsMarkers',
                icon: customIcon
            }).addTo(map);

            marker.bindPopup(`
                <div style="min-width:220px; font-family: Manrope, sans-serif;">
                    <div style="font-size:17px; margin-bottom:8px; color:#f5ecdb;">${escapeHtml(student.profession)}</div>
                    <div style="font-size:13px; line-height:1.65; color:rgba(245,236,219,0.9);">
                        <strong style="color:#f3c98a;">Municipio:</strong> ${escapeHtml(student.municipality)}
                    </div>
                </div>
            `);
        });

        const fitTarget = markerBounds.length ? L.latLngBounds(markerBounds) : boliviaBounds;
        map.fitBounds(fitTarget.pad(0.16), { padding: [26, 26], maxZoom: 6.2 });
        window.setTimeout(() => {
            map.invalidateSize();
            map.fitBounds(fitTarget.pad(0.16), { padding: [26, 26], maxZoom: 6.2 });
        }, 180);

        if (statMunicipalities) {
            statMunicipalities.textContent = String(municipalityCounts.size);
        }
        document.getElementById('students-map-loader')?.classList.add('is-hidden');
    } catch (error) {
        console.error('No se pudo construir el mapa de estudiantes.', error);
        document.getElementById('students-map-loader')?.classList.add('is-hidden');
    }
}

function getStudentMunicipality(row) {
    return (
        row['Municipio de residencia'] ||
        row['¿ En qué Gobierno Autónomo Municipal (GAM) ha trabajado? Menciona el últiimo'] ||
        'Municipio no especificado'
    ).trim();
}

function createUnifranzPregradoStudents() {
    const baseLat = -17.77405861149061;
    const baseLng = -63.192474787793884;
    const offsets = [
        [0, 0],
        [0.00022, 0.00012],
        [-0.0002, 0.00011],
        [0.00016, -0.00019],
        [-0.00018, -0.00014],
        [0.00009, 0.00024],
        [-0.00008, 0.00023],
        [0.00024, -0.00007]
    ];

    return offsets.map(([latOffset, lngOffset]) => ({
        group: 'UNIFRANZ Santa Cruz · Pregrado',
        municipality: 'Santa Cruz de la Sierra',
        profession: 'Estudiante',
        professionCategory: 'Otros',
        latLng: L.latLng(baseLat + latOffset, baseLng + lngOffset)
    }));
}

function getStudentProfession(row) {
    const profession = (row['Profesión o área de formación'] || '').trim();
    const otherProfession = (row['Otro - Profesión o área de formación'] || '').trim();

    if (!profession || profession.toLowerCase() === 'other') {
        return otherProfession || 'Profesión no especificada';
    }

    return profession;
}

function getStudentLatLng(rawX, rawY) {
    const lon = Number.parseFloat(rawX);
    const lat = Number.parseFloat(rawY);

    if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
        return null;
    }

    return L.latLng(lat, lon);
}

function normalizeMunicipalityKey(value) {
    return String(value || 'Municipio no especificado')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
}

function getProfessionSummary(professions) {
    const items = [...professions].filter(Boolean);

    if (!items.length) {
        return 'No especificada';
    }

    if (items.length <= 3) {
        return items.join(', ');
    }

    return `${items.slice(0, 3).join(', ')} y otras`;
}

function parseCSV(csvText) {
    const rows = [];
    let currentField = '';
    let currentRow = [];
    let insideQuotes = false;

    for (let i = 0; i < csvText.length; i += 1) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                currentField += '"';
                i += 1;
            } else {
                insideQuotes = !insideQuotes;
            }
            continue;
        }

        if (char === ',' && !insideQuotes) {
            currentRow.push(currentField);
            currentField = '';
            continue;
        }

        if ((char === '\n' || char === '\r') && !insideQuotes) {
            if (char === '\r' && nextChar === '\n') {
                i += 1;
            }

            currentRow.push(currentField);
            currentField = '';

            if (currentRow.some((field) => field !== '')) {
                rows.push(currentRow);
            }

            currentRow = [];
            continue;
        }

        currentField += char;
    }

    if (currentField !== '' || currentRow.length) {
        currentRow.push(currentField);
        rows.push(currentRow);
    }

    const [headers = [], ...dataRows] = rows;
    return dataRows.map((row) => {
        const entry = {};
        headers.forEach((header, index) => {
            entry[header] = row[index] || '';
        });
        return entry;
    });
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

/* ==========================================================================
   PREMIUM FEATURES ENGINE IMPLEMENTATION
   ========================================================================= */

/* 1. Theme Control Engine */
function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;

    // Read stored theme preference or use system preference
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isLight = storedTheme === 'light' || (!storedTheme && !systemPrefersDark);
    
    if (isLight) {
        document.documentElement.classList.add('light-theme');
        themeBtn.setAttribute('aria-pressed', 'true');
    } else {
        document.documentElement.classList.remove('light-theme');
        themeBtn.setAttribute('aria-pressed', 'false');
    }

    themeBtn.addEventListener('click', () => {
        const nextLight = document.documentElement.classList.toggle('light-theme');
        localStorage.setItem('theme', nextLight ? 'light' : 'dark');
        themeBtn.setAttribute('aria-pressed', String(nextLight));
        
        // Sincronizar mapas de Leaflet con el tema seleccionado
        if (typeof updateMapThemes === 'function') {
            updateMapThemes(nextLight);
        }
        document.dispatchEvent(new CustomEvent('themechange', { detail: { isLight: nextLight } }));

        // Dynamic animation/scale effect
        themeBtn.style.transform = 'scale(0.92)';
        setTimeout(() => themeBtn.style.transform = '', 150);
    });
}

/* 2. localized Multilingual Engine */
const translations = {
    es: {
        "nav-home": "Inicio",
        "nav-about": "Sobre mí",
        "nav-trajectory": "Trayectoria",
        "nav-recognition": "Reconocimientos y afiliaciones",
        "nav-projects": "Proyectos",
        "nav-geoportfolio": "Geoportafolio",
        "nav-gallery": "Galería",
        "nav-map": "Alcance territorial",
        "nav-research-teaching": "Investigación y docencia",
        "nav-research-lines": "Líneas de investigación",
        "nav-university-teaching": "Docencia universitaria",
        "nav-students": "Alcance formativo",
        "nav-faq": "Preguntas clave",
        "nav-contact": "Contacto",
        "hero-eyebrow": "Ingeniero Agrimensor | Catastro | SIG | Geodesia | Cartografía",
        "hero-motto": "¡Entre la teoría y la realidad!",
        "hero-lead": "Me interesa que la información territorial deje de ser un producto estático y se convierta en un sistema vivo: útil para planificar, decidir y actuar.",
        "hero-cta-portfolio": "Ver geoportafolio",
        "hero-cta-about": "Sobre mí",
        "hero-cta-cv": "Descargar CV",
        "hero-panel-label": "Líneas activas",
        "hero-line-1": "Procesamiento GNSS con GAMIT/GLOBK",
        "hero-line-2": "Estructuración de catastro multifinalitario en SIG libre",
        "hero-line-3": "Cartografía para planificación urbana-rural y gestión ambiental",
        "about-kicker": "Sobre mí",
        "about-title": "Sobre mí",
        "about-text-1": "Soy Ingeniero Agrimensor con experiencia en cartografía, geodesia, planificación territorial, catastro y sistemas de información geográfica. He desarrollado investigaciones sobre modelos de trayectoria de estaciones GNSS y he participado en proyectos vinculados al desarrollo urbano, el monitoreo geoespacial y la actualización catastral. Mi trabajo se ha orientado a la innovación aplicada, especialmente mediante el uso de SIG libre para el fortalecimiento del catastro multifinalitario.",
        "about-text-2": "Asimismo, he brindado asistencia técnica en gestión del riesgo de incendios forestales, trabajos de gravimetría y docencia en programas de pregrado y postgrado. He liderado procesos de análisis urbano-rural y modernización catastral, promoviendo la implementación de sistemas de referencia geodésicos modernos y enfoques de catastro multifinalitario, con un firme compromiso con la formulación y aplicación de políticas territoriales y ambientales.",
        "pill-catastro": "Catastro multifinalitario",
        "pill-geodesia": "Geodesia",
        "pill-cartografia": "Cartografía",
        "pill-sig": "SIG",
        "pill-politicas": "Políticas territoriales y ambientales",
        "trajectory-kicker": "Trayectoria",
        "trajectory-title": "Trayectoria",
        "traj-item1-year": "Actualidad",
        "traj-item1-status": "En curso",
        "traj-item1-title": "Docente de Rutas y Mapas Digitales",
        "traj-item1-role": "Unifranz · Docencia universitaria aplicada al turismo y los SIG",
        "traj-item1-h1": "Formación en levantamiento, depuración y análisis de datos territoriales.",
        "traj-item1-h2": "Visualización cartográfica y publicación de información geoespacial.",
        "traj-item1-h3": "Integración de SIG para planificación, gestión y comunicación de rutas y destinos turísticos.",
        "traj-item2-year": "2025",
        "traj-item2-title": "Docente de Diplomado en Catastro Multifinalitario",
        "traj-item2-role": "Módulo: \"Catastro Multifinalitario y Desarrollo Urbano\"",
        "traj-item2-h1": "Diseño y desarrollo del módulo para gobiernos autónomos municipales.",
        "traj-item2-h2": "Articulación de componentes físicos, jurídicos, económicos, sociales y ambientales.",
        "traj-item2-h3": "Aplicación de SIG, datos abiertos, planificación urbana, tributación y sostenibilidad territorial.",
        "traj-item3-year": "2024 · 2026",
        "traj-item3-title": "Técnico de Catastro en Santa Rosa del Sara",
        "traj-item3-role": "Gobierno Municipal · Gestión catastral y ordenamiento territorial",
        "traj-item3-h1": "Actualización de áreas urbanas dispersas y migración CAD-SIG.",
        "traj-item3-h2": "Cartografía, geodesia y soporte técnico para delimitaciones territoriales.",
        "traj-item3-h3": "Propuestas para distritos urbanos-rurales y organización del territorio.",
        "traj-item4-year": "2023",
        "traj-item4-title": "Catastro, Drones y Alerta Temprana",
        "traj-item4-role": "Proyecto municipal · Gestión territorial y respuesta ante incendios",
        "traj-item4-h1": "Estructuración metodológica de un catastro multifinalitario.",
        "traj-item4-h2": "Actualizaciones catastrales con dron y regularización predial.",
        "traj-item4-h3": "Apoyo al SMAT frente a incendios y monitoreo territorial.",
        "traj-item5-year": "2021 · 2022",
        "traj-item5-title": "Cartografía y Urbanismo Municipal",
        "traj-item5-role": "San Miguel de Velasco · Análisis territorial y SIG",
        "traj-item5-h1": "Análisis de accesibilidad educativa y evaluación del crecimiento urbano.",
        "traj-item5-h2": "Cartografía base municipal e implementación de SIG.",
        "traj-item5-h3": "Soporte para planificación urbana y rural.",
        "traj-item6-year": "2021",
        "traj-item6-title": "Investigación Geodésica en el IGM",
        "traj-item6-role": "Instituto Geográfico Militar · GNSS y marco vertical",
        "traj-item6-h1": "Modelo de trayectoria para la estación GNSS SCRZ.",
        "traj-item6-h2": "Análisis de velocidad por componentes.",
        "traj-item6-h3": "Apoyo al levantamiento gravimétrico para el marco vertical MARGEV.",
        "traj-item7-year": "2020",
        "traj-item7-title": "Asistencia SIG en la Chiquitania",
        "traj-item7-role": "Comité de Crisis Permanente · Incendios forestales",
        "traj-item7-h1": "Priorización de comunidades y soporte técnico geoespacial.",
        "traj-item7-h2": "Reporte de perímetro activo y áreas quemadas.",
        "traj-item7-h3": "Simulación y seguimiento de incendios.",
        "traj-item8-year": "2019 · 2020",
        "traj-item8-title": "UMIG · Autoridad de Bosques y Tierra",
        "traj-item8-role": "Chuquisaca y Santa Cruz · Teledetección y monitoreo",
        "traj-item8-h1": "Evaluación de incidencia antrópica con técnicas de teledetección.",
        "traj-item8-h2": "Monitoreo de información geoespacial para gestión territorial.",
        "traj-item9-year": "2018",
        "traj-item9-title": "Topografía para Infraestructura Hídrica",
        "traj-item9-role": "Saipina y Vallegrande · Obras de agua y micro riego",
        "traj-item9-h1": "Apoyo topográfico para mejora del sistema de agua potable de Saipina.",
        "traj-item9-h2": "Trabajo técnico en el sistema de micro riego San Gerónimo-Coloradillo.",
        "rec-kicker": "Reconocimiento e institucionalidad",
        "rec-title": "Reconocimientos y afiliaciones",
        "rec-feat1-label": "Reconocimiento 2024",
        "rec-feat1-title": "Distinción del Concejo Municipal de San Miguel de Velasco",
        "rec-feat1-desc": "A inicios de 2024 recibí un reconocimiento por mis contribuciones técnicas y sociales en proyectos municipales, destacando mi capacidad para integrar innovación, desarrollo urbano y enfoque humano en beneficio de la población.",
        "rec-feat2-label": "Afiliación",
        "rec-feat2-title": "SIB-SC",
        "rec-feat2-desc": "Soy miembro de la Sociedad de Ingenieros de Bolivia, Regional Santa Cruz, y del Colegio de Ingenieros Agrimensores.",
        "projects-kicker": "Proyectos",
        "projects-title": "Proyectos",
        "filter-all": "Todos",
        "filter-catastro": "Catastro",
        "filter-geodesia": "Geodesia / GNSS",
        "filter-sig": "SIG / Cartografía",
        "filter-teledeteccion": "Teledetección",
        "filter-storymaps": "StoryMaps",
        "filter-webmaps": "Mapas Interactivos",
        "filter-map3d": "Mapas 3D",
        "filter-field": "Campo",
        "filter-aerial": "Drones / Aérea",
        "filter-technical": "Gabinete / Técnico",
        "exp-catastro-tag": "Catastro y gestión municipal",
        "exp-catastro-desc": "Registro, actualización y organización parcelaria para la gestión territorial y municipal.",
        "exp-pill-catastro": "CATASTRO",
        "exp-pill-normas": "NORMAS",
        "exp-pill-sig": "SIG",
        "exp-pill-gestion": "GESTIÓN MUNICIPAL",
        "exp-geodesia-tag": "Geodesia y GNSS",
        "exp-geodesia-desc": "Levantamientos, redes GNSS y control técnico con enfoque en precisión y referencia espacial.",
        "exp-pill-gnss": "GNSS",
        "exp-pill-rtk": "RTK",
        "exp-pill-et": "ESTACIÓN TOTAL",
        "exp-pill-control": "CONTROL",
        "exp-sig-tag": "SIG y análisis territorial",
        "exp-sig-desc": "Visualización, modelado y análisis territorial para apoyar decisiones basadas en datos.",
        "exp-pill-qgis": "QGIS",
        "exp-pill-arcgis": "ARCGIS PRO",
        "exp-pill-analisis": "ANÁLISIS ESPACIAL",
        "exp-pill-python": "PYTHON",
        "exp-cartografia-tag": "Cartografía temática",
        "exp-cartografia-desc": "Mapas temáticos orientados al análisis espacial y la lectura precisa del territorio.",
        "exp-pill-blender": "BLENDER",
        "exp-pill-web": "MAPAS WEB",
        "exp-tele-tag": "Teledetección y fotogrametría aérea",
        "exp-tele-desc": "Interpretación de imágenes y productos fotogramétricos para monitoreo y análisis territorial.",
        "exp-pill-sentinel": "SENTINEL",
        "exp-pill-landsat": "LANDSAT",
        "exp-pill-gee": "GEE",
        "exp-pill-drones": "DRONES",
        "exp-plan-tag": "Planificación y ordenamiento territorial",
        "exp-plan-desc": "Diseño de propuestas territoriales para orientar el crecimiento urbano y rural.",
        "exp-pill-suelo": "USO DEL SUELO",
        "exp-pill-zonificacion": "ZONIFICACIÓN",
        "exp-pill-ptdi": "PTDI",
        "exp-pill-gurbana": "GESTIÓN URBANA",
        "geo-kicker": "Mapas web y StoryMaps",
        "geo-title": "Geoportafolio",
        "geo-elec-title": "Mapa interactivo de electricidad",
        "geo-elec-desc": "Comunidades, viviendas sin energía eléctrica y evidencia de campo para proyectos de energía solar.",
        "geo-link-view": "Ver mapa interactivo",
        "geo-chore-title": "StoryMap El Choré",
        "geo-chore-desc": "Reserva Forestal El Choré: 40 años de transformación visualizados con datos de cobertura y uso del suelo.",
        "geo-link-story": "Visitar StoryMap",
        "geo-sc3d-title": "Mapa 3D de población en Santa Cruz",
        "geo-sc3d-desc": "Mapa 3D sobre población en Santa Cruz y lectura territorial del crecimiento metropolitano.",
        "geo-link-view3d": "Ver mapa 3D",
        "geo-digital-title": "Mapas Digitales",
        "geo-digital-desc": "Visor web de cartografía digital para explorar información territorial de Santa Cruz.",
        "geo-link-viewdigital": "Ver mapa digital",
        "gal-kicker": "Registro visual",
        "gal-title": "Galería",
        "gal-img1-title": "Geodesia y topografía",
        "gal-img1-desc": "Participación en talleres regionales sobre sistemas de referencia geodésicos modernos.",
        "gal-img2-title": "Teledetección y fotogrametría aérea",
        "gal-img2-desc": "Análisis del territorio a partir de información aérea en contextos urbano-rurales.",
        "gal-img3-title": "Planificación y ordenamiento territorial",
        "gal-img3-desc": "Mi trabajo territorial también se vincula con actores locales, lectura social y realidad comunitaria.",
        "gal-img4-title": "Planificación y ordenamiento territorial",
        "gal-img4-desc": "Proyectos de planificación en comunidades rurales vulnerables.",
        "gal-img5-title": "Gravimetría",
        "gal-img5-desc": "Trabajos técnicos de gravimetría para el cálculo de números geopotenciales con el fin de definir el marco vertical de referencia nacional (MARGEV).",
        "gal-img6-title": "Geodesia y topografía",
        "gal-img6-desc": "Levantamiento topográfico para determinar volúmenes de materiales en bancos de tierra.",
        "gal-img7-title": "Geodesia y topografía",
        "gal-img7-desc": "Levantamientos catastrales de bienes inmuebles en áreas urbanas extensivas.",
        "gal-img8-title": "Geodesia y topografía",
        "gal-img8-desc": "Replanteo topográfico de bienes inmuebles en áreas urbanas extensivas.",
        "map-kicker": "Alcance territorial",
        "map-title": "Alcance territorial",
        "map-desc": "Mi trayectoria se concentra en Santa Cruz, donde he desarrollado experiencia en gestión municipal, monitoreo ambiental, incendios forestales, cartografía urbana y redes geodésicas. Este mapa sintetiza el alcance geográfico de mi trabajo y los principales regiones del departamento donde he desarrollado proyectos.",
        "map-stat1-label": "Regiones recorridas",
        "map-stat2-label": "Municipios visitados",
        "map-loading": "Cargando mapa territorial...",
        "res-kicker": "Investigación y docencia",
        "res-title": "Líneas de investigación",
        "res-status-process": "En proceso",
        "res-card1-title": "Estimación y validación del retardo troposférico cenital (ZTD) y del vapor de agua precipitable (PWV)",
        "res-card1-desc": "Mediante el análisis de datos de la estación CORS SCRZ, se estima el Retardo Troposférico Cenital (ZTD) para derivar el Vapor de Agua Precipitable (PWV). Este proceso permite un monitoreo hidroclimático preciso y casi en tiempo real, fundamental para entender la dinámica atmosférica de la región y mejorar los pronósticos locales.",
        "res-card2-title": "Determinación de un modelo de velocidades regional para el área metropolitana de Santa Cruz con GAMIT/GLOBK",
        "res-card2-desc": "El objetivo es desarrollar un modelo que cuantifique el desplazamiento de las estaciones a través del tiempo, permitiendo mantener la precisión del marco geodésico frente a la deformación de la corteza y proporcionando datos clave para estudios de tectónica y planificación urbana en Santa Cruz.",
        "res-card3-title": "SIG de código abierto como soporte metodológico para la planificación, difusión y monitoreo de productos turísticos",
        "res-card3-desc": "La propuesta busca contribuir al fortalecimiento técnico de los productos turísticos mediante el uso de herramientas accesibles, replicables y de bajo costo. La incorporación de SIG de código abierto ofrecen una alternativa para organizar, representar, difundir y monitorear productos turísticos, ampliando su utilidad tanto en contextos académicos como profesionales.",
        "teach-kicker": "Docencia universitaria",
        "teach-title": "Docencia universitaria",
        "teach-status-now": "Actualidad",
        "teach-status-2025": "2025",
        "teach-status-focus": "Enfoque",
        "teach-card1-title": "Docente de Rutas y Mapas Digitales",
        "teach-card1-desc": "Docencia universitaria aplicada al turismo y los SIG, con énfasis en levantamiento, depuración, análisis, visualización y publicación de información geoespacial.",
        "teach-card2-title": "Diplomado en Catastro Multifinalitario",
        "teach-card2-desc": "Diseño y desarrollo del módulo \"Catastro Multifinalitario y Desarrollo Urbano\", orientado a gobiernos autónomos municipales y gestión territorial.",
        "teach-card3-title": "Formación técnica aplicada",
        "teach-card3-desc": "Integración de SIG, datos abiertos, planificación urbana, tributación, sostenibilidad territorial y comunicación cartográfica en procesos formativos.",
        "stu-kicker": "Alcance formativo",
        "stu-title": "Alcance formativo",
        "stu-desc": "Este espacio presenta una síntesis del alcance formativo. En ella se encuentra la ubicación geográfica y la procedencia municipal de los estudiantes registrados.",
        "stu-stat1-label": "Estudiantes",
        "stu-stat2-label": "Estudiantes georreferenciados",
        "stu-stat3-label": "Municipios registrados",
        "faq-kicker": "Preguntas clave",
        "faq-title": "Preguntas clave",
        "faq-q1": "¿Quién es Gustavo Abel Cáceres Martínez?",
        "faq-a1": "Gustavo Abel Cáceres Martínez es Ingeniero Agrimensor en Bolivia, con experiencia en SIG, catastro multifinalitario, geodesia, cartografía, GNSS, planificación territorial y análisis geoespacial.",
        "faq-q2": "¿En qué áreas trabaja Gustavo Cáceres?",
        "faq-a2": "Trabaja en catastro y gestión municipal, geodesia y GNSS, cartografía temática, SIG, teledetección, fotogrametría aérea, planificación urbana-rural, docencia e investigación aplicada.",
        "faq-q3": "¿Dónde se concentra su experiencia territorial?",
        "faq-a3": "Su experiencia se concentra principalmente en Santa Cruz, Bolivia, con proyectos municipales, monitoreo ambiental, gestión de incendios forestales, cartografía urbana y redes geodésicas.",
        "faq-q4": "¿Qué tipo de geoportafolio presenta?",
        "faq-a4": "El geoportafolio incluye mapas web, StoryMaps y visores interactivos sobre electricidad rural, transformación de cobertura del suelo, población metropolitana y cartografía digital de Santa Cruz.",
        "footer-kicker": "Contacto",
        "footer-desc": "Estoy disponible para proyectos técnicos, docencia, investigación aplicada y colaboración institucional.",
        "footer-mail-label": "Correo",
        "footer-mail-action": "Enviar mensaje",
        "footer-phone-label": "Teléfono",
        "footer-phone-action": "Llamar ahora",
        "footer-linkedin-action": "Abrir perfil ↗",
        "footer-portfolio-action": "Ver trabajos ↗",
        "footer-orcid-action": "Ver identidad académica ↗",
        "footer-researchgate-action": "Ver perfil académico ↗",
        "footer-github-action": "Ver código y proyectos ↗",
        "footer-job": "Ingeniero Agrimensor",
        "footer-loc": "Santa Cruz, Bolivia",
        "footer-copy": "©2026. Todos los derechos reservados.",
        "form-title": "Envíame un mensaje",
        "form-name-label": "Nombre completo",
        "form-email-label": "Correo electrónico",
        "form-msg-label": "Mensaje",
        "form-submit": "Enviar mensaje",
        "form-name-placeholder": "Ingresa tu nombre",
        "form-email-placeholder": "tu@correo.com",
        "form-msg-placeholder": "Escribe tu mensaje detallado aquí..."
    },
    en: {
        "nav-home": "Home",
        "nav-about": "About me",
        "nav-trajectory": "Trajectory",
        "nav-recognition": "Awards & Affiliations",
        "nav-projects": "Projects",
        "nav-geoportfolio": "Geoportfolio",
        "nav-gallery": "Gallery",
        "nav-map": "Territorial Scope",
        "nav-research-teaching": "Research & Teaching",
        "nav-research-lines": "Research Lines",
        "nav-university-teaching": "University Teaching",
        "nav-students": "Educational Scope",
        "nav-faq": "Key Questions",
        "nav-contact": "Contact",
        "hero-eyebrow": "Land Surveyor | Catastre | GIS | Geodesy | Cartography",
        "hero-motto": "Between theory and reality!",
        "hero-lead": "I am interested in ensuring that territorial information ceases to be a static product and becomes a living system: useful for planning, deciding, and acting.",
        "hero-cta-portfolio": "View geoportfolio",
        "hero-cta-about": "About me",
        "hero-cta-cv": "Download CV",
        "hero-panel-label": "Active Lines",
        "hero-line-1": "GNSS processing with GAMIT/GLOBK",
        "hero-line-2": "Structuring of multifinalitary cadastres in free GIS",
        "hero-line-3": "Cartography for urban-rural planning and environmental management",
        "about-kicker": "About me",
        "about-title": "About me",
        "about-text-1": "I am a Land Surveyor with experience in cartography, geodesy, territorial planning, cadastre, and geographic information systems. I have developed research on GNSS station trajectory models and participated in projects related to urban development, geospatial monitoring, and cadastral updating. My work focuses on applied innovation, particularly using open-source GIS to strengthen multifinalitary cadastres.",
        "about-text-2": "Additionally, I have provided technical assistance in forest fire risk management, gravimetry, and university teaching in both undergraduate and postgraduate programs. I have led urban-rural analysis and cadastral modernization processes, promoting the implementation of modern geodetic reference systems and multifinalitary cadastre approaches, with a strong commitment to territorial and environmental policy formulation and application.",
        "pill-catastro": "Multifinalitary Cadastre",
        "pill-geodesia": "Geodesy",
        "pill-cartografia": "Cartography",
        "pill-sig": "GIS",
        "pill-politicas": "Territorial & Environmental Policies",
        "trajectory-kicker": "Trajectory",
        "trajectory-title": "Trajectory",
        "traj-item1-year": "Present",
        "traj-item1-status": "Ongoing",
        "traj-item1-title": "Lecturer in Routes and Digital Maps",
        "traj-item1-role": "Unifranz · University teaching applied to tourism and GIS",
        "traj-item1-h1": "Training in territorial data collection, cleaning, and analysis.",
        "traj-item1-h2": "Cartographic visualization and geospatial information publication.",
        "traj-item1-h3": "GIS integration for planning, managing, and communicating tourist routes and destinations.",
        "traj-item2-year": "2025",
        "traj-item2-title": "Postgraduate Lecturer in Multifinalitary Cadastre",
        "traj-item2-role": "Module: \"Multifinalitary Cadastre and Urban Development\"",
        "traj-item2-h1": "Design and development of the module for municipal autonomous governments.",
        "traj-item2-h2": "Integration of physical, legal, economic, social, and environmental components.",
        "traj-item2-h3": "Application of GIS, open data, urban planning, taxation, and territorial sustainability.",
        "traj-item3-year": "2024 · 2026",
        "traj-item3-title": "Cadastre Technician at Santa Rosa del Sara",
        "traj-item3-role": "Municipal Government · Cadastral management and land use planning",
        "traj-item3-h1": "Updating scattered urban areas and CAD-to-GIS migration.",
        "traj-item3-h2": "Cartography, geodesy, and technical support for territorial boundary delimitations.",
        "traj-item3-h3": "Proposals for urban-rural districts and territorial organization.",
        "traj-item4-year": "2023",
        "traj-item4-title": "Cadastre, Drones and Early Warning",
        "traj-item4-role": "Municipal project · Territorial management and fire response",
        "traj-item4-h1": "Methodological structuring of a multifinalitary cadastre.",
        "traj-item4-h2": "Cadastral updates using drones and property legalization.",
        "traj-item4-h3": "Support to SMAT for fire control and territorial monitoring.",
        "traj-item5-year": "2021 · 2022",
        "traj-item5-title": "Municipal Cartography and Urbanism",
        "traj-item5-role": "San Miguel de Velasco · Territorial analysis and GIS",
        "traj-item5-h1": "Educational accessibility analysis and urban growth assessment.",
        "traj-item5-h2": "Municipal base cartography and GIS implementation.",
        "traj-item5-h3": "Support for urban and rural planning.",
        "traj-item6-year": "2021",
        "traj-item6-title": "Geodetic Research at IGM",
        "traj-item6-role": "Military Geographic Institute · GNSS and vertical framework",
        "traj-item6-h1": "Trajectory model for the SCRZ GNSS station.",
        "traj-item6-h2": "Velocity analysis by components.",
        "traj-item6-h3": "Support for gravimetric survey for the MARGEV vertical reference framework.",
        "traj-item7-year": "2020",
        "traj-item7-title": "GIS Assistance in the Chiquitania",
        "traj-item7-role": "Permanent Crisis Committee · Forest fires",
        "traj-item7-h1": "Community prioritization and geospatial technical support.",
        "traj-item7-h2": "Reporting active perimeters and burned areas.",
        "traj-item7-h3": "Fire simulation and tracking.",
        "traj-item8-year": "2019 · 2020",
        "traj-item8-title": "UMIG · Forest and Land Authority",
        "traj-item8-role": "Chuquisaca and Santa Cruz · Remote sensing and monitoring",
        "traj-item8-h1": "Assessment of anthropogenic impact using remote sensing techniques.",
        "traj-item8-h2": "Monitoring geospatial information for territorial management.",
        "traj-item9-year": "2018",
        "traj-item9-title": "Topography for Water Infrastructure",
        "traj-item9-role": "Saipina and Vallegrande · Water and micro-irrigation works",
        "traj-item9-h1": "Topographical support for the drinking water system improvement of Saipina.",
        "traj-item9-h2": "Technical work on the San Gerónimo-Coloradillo micro-irrigation system.",
        "rec-kicker": "Recognition & Institutional Presence",
        "rec-title": "Awards & Affiliations",
        "rec-feat1-label": "Recognition 2024",
        "rec-feat1-title": "Distinction by the Municipal Council of San Miguel de Velasco",
        "rec-feat1-desc": "At the beginning of 2024, I received recognition for my technical and social contributions in municipal projects, highlighting my ability to integrate innovation, urban development, and a human approach for the benefit of the population.",
        "rec-feat2-label": "Affiliation",
        "rec-feat2-title": "SIB-SC",
        "rec-feat2-desc": "I am a member of the Society of Engineers of Bolivia, Santa Cruz Regional, and the College of Land Surveyors.",
        "projects-kicker": "Projects",
        "projects-title": "Projects",
        "filter-all": "All",
        "filter-catastro": "Cadastre",
        "filter-geodesia": "Geodesy / GNSS",
        "filter-sig": "GIS / Cartography",
        "filter-teledeteccion": "Remote Sensing",
        "filter-storymaps": "StoryMaps",
        "filter-webmaps": "Interactive Maps",
        "filter-map3d": "3D Maps",
        "filter-field": "Field",
        "filter-aerial": "Drones / Aerial",
        "filter-technical": "Office / Technical",
        "exp-catastro-tag": "Cadastre & Municipal Management",
        "exp-catastro-desc": "Registration, updating, and parcel organization for territorial and municipal management.",
        "exp-pill-catastro": "CADASTRE",
        "exp-pill-normas": "REGULATIONS",
        "exp-pill-sig": "GIS",
        "exp-pill-gestion": "MUNICIPAL MANAGEMENT",
        "exp-geodesia-tag": "Geodesy & GNSS",
        "exp-geodesia-desc": "Surveys, GNSS networks, and technical control focusing on precision and spatial reference.",
        "exp-pill-gnss": "GNSS",
        "exp-pill-rtk": "RTK",
        "exp-pill-et": "TOTAL STATION",
        "exp-pill-control": "CONTROL",
        "exp-sig-tag": "GIS & Territorial Analysis",
        "exp-sig-desc": "Visualization, modeling, and territorial analysis to support data-driven decisions.",
        "exp-pill-qgis": "QGIS",
        "exp-pill-arcgis": "ARCGIS PRO",
        "exp-pill-analisis": "SPATIAL ANALYSIS",
        "exp-pill-python": "PYTHON",
        "exp-cartografia-tag": "Thematic Cartography",
        "exp-cartografia-desc": "Thematic maps oriented towards spatial analysis and precise territorial reading.",
        "exp-pill-blender": "BLENDER",
        "exp-pill-web": "WEB MAPS",
        "exp-tele-tag": "Remote Sensing & Aerial Photogrammetry",
        "exp-tele-desc": "Image interpretation and photogrammetric products for territorial monitoring and analysis.",
        "exp-pill-sentinel": "SENTINEL",
        "exp-pill-landsat": "LANDSAT",
        "exp-pill-gee": "GEE",
        "exp-pill-drones": "DRONES",
        "exp-plan-tag": "Land-use Planning & Territorial Organization",
        "exp-plan-desc": "Design of territorial proposals to guide urban and rural growth.",
        "exp-pill-suelo": "LAND USE",
        "exp-pill-zonificacion": "ZONING",
        "exp-pill-ptdi": "PTDI",
        "exp-pill-gurbana": "URBAN MANAGEMENT",
        "geo-kicker": "Web maps & StoryMaps",
        "geo-title": "Geoportfolio",
        "geo-elec-title": "Interactive Electricity Map",
        "geo-elec-desc": "Communities, dwellings without electric energy, and field evidence for solar energy projects.",
        "geo-link-view": "View interactive map",
        "geo-chore-title": "El Choré StoryMap",
        "geo-chore-desc": "El Choré Forest Reserve: 40 years of transformation visualized with cover and land use data.",
        "geo-link-story": "Visit StoryMap",
        "geo-sc3d-title": "3D Population Map of Santa Cruz",
        "geo-sc3d-desc": "3D map on Santa Cruz population and territorial reading of metropolitan growth.",
        "geo-link-view3d": "View 3D map",
        "geo-digital-title": "Digital Maps",
        "geo-digital-desc": "Web viewer of digital cartography to explore Santa Cruz territorial information.",
        "geo-link-viewdigital": "View digital map",
        "gal-kicker": "Visual record",
        "gal-title": "Gallery",
        "gal-img1-title": "Geodesy & surveying",
        "gal-img1-desc": "Participation in regional workshops on modern geodetic reference systems.",
        "gal-img2-title": "Remote sensing & aerial photogrammetry",
        "gal-img2-desc": "Territorial analysis based on aerial information in urban-rural contexts.",
        "gal-img3-title": "Land-use planning & territorial organization",
        "gal-img3-desc": "My territorial work is also linked with local actors, social readings, and community reality.",
        "gal-img4-title": "Land-use planning & territorial organization",
        "gal-img4-desc": "Planning projects in vulnerable rural communities.",
        "gal-img5-title": "Gravimetry",
        "gal-img5-desc": "Technical gravimetry works for calculating geopotential numbers in order to define the national vertical reference framework (MARGEV).",
        "gal-img6-title": "Geodesy & surveying",
        "gal-img6-desc": "Topographical survey to determine volumes of materials in earth banks.",
        "gal-img7-title": "Geodesy & surveying",
        "gal-img7-desc": "Cadastral surveys of real estate in urban areas.",
        "gal-img8-title": "Geodesy & surveying",
        "gal-img8-desc": "Topographical survey and control on site.",
        "map-kicker": "Territorial scope",
        "map-title": "Territorial scope",
        "map-desc": "My career is focused on Santa Cruz, where I have developed experience in municipal management, environmental monitoring, forest fires, urban cartography, and geodetic networks. This map synthesizes the geographical scope of my work and the main regions of the department where I have carried out projects.",
        "map-stat1-label": "Regions traveled",
        "map-stat2-label": "Municipalities visited",
        "map-loading": "Loading territorial map...",
        "res-kicker": "Research & teaching",
        "res-title": "Research Lines",
        "res-status-process": "In progress",
        "res-card1-title": "Estimation and validation of Zenith Tropospheric Delay (ZTD) and Precipitable Water Vapor (PWV)",
        "res-card1-desc": "Through the analysis of data from the CORS SCRZ station, the Zenith Tropospheric Delay (ZTD) is estimated to derive the Precipitable Water Vapor (PWV). This process enables precise, near-real-time hydroclimatic monitoring, crucial for understanding the region's atmospheric dynamics and improving local forecasts.",
        "res-card2-title": "Determination of a regional velocity model for the metropolitan area of Santa Cruz with GAMIT/GLOBK",
        "res-card2-desc": "The goal is to develop a model that quantifies the displacement of stations over time, allowing the geodetic reference framework accuracy to be maintained against crustal deformation and providing key data for tectonic and urban planning studies in Santa Cruz.",
        "res-card3-title": "Open-source GIS as methodological support for tourist product planning, dissemination, and monitoring",
        "res-card3-desc": "The proposal aims to contribute to the technical strengthening of tourism products through accessible, replicable, and low-cost tools. The integration of open-source GIS offers an alternative to organize, represent, disseminate, and monitor tourism products, expanding their utility in both academic and professional contexts.",
        "teach-kicker": "University teaching",
        "teach-title": "University teaching",
        "teach-status-now": "Present",
        "teach-status-2025": "2025",
        "teach-status-focus": "Focus",
        "teach-card1-title": "Lecturer in Routes and Digital Maps",
        "teach-card1-desc": "University teaching applied to tourism and GIS, emphasizing spatial data collection, debugging, analysis, visualization, and publication.",
        "teach-card2-title": "Diploma in Multifinalitary Cadastre",
        "teach-card2-desc": "Design and development of the \"Multifinalitary Cadastre and Urban Development\" module, oriented towards municipal autonomous governments and territorial management.",
        "teach-card3-title": "Applied technical training",
        "teach-card3-desc": "Integration of GIS, open data, urban planning, taxation, territorial sustainability, and cartographic communication in educational processes.",
        "stu-kicker": "Educational scope",
        "stu-title": "Educational scope",
        "stu-desc": "This section presents a synthesis of the educational scope. It shows the geographical location and municipal origin of the registered students.",
        "stu-stat1-label": "Students",
        "stu-stat2-label": "Georeferenced students",
        "stu-stat3-label": "Registered municipalities",
        "faq-kicker": "Key questions",
        "faq-title": "Key questions",
        "faq-q1": "Who is Gustavo Abel Cáceres Martínez?",
        "faq-a1": "Gustavo Abel Cáceres Martínez is a Land Surveyor in Bolivia, with experience in GIS, multifinalitary cadastre, geodesy, cartography, GNSS, territorial planning, and geospatial analysis.",
        "faq-q2": "In which fields does Gustavo Cáceres work?",
        "faq-a2": "He works in cadastre and municipal management, geodesy and GNSS, thematic cartography, GIS, remote sensing, aerial photogrammetry, urban-rural planning, teaching, and applied research.",
        "faq-q3": "Where is his territorial experience focused?",
        "faq-a3": "His experience is mainly focused on Santa Cruz, Bolivia, with municipal projects, environmental monitoring, forest fire management, urban cartography, and geodetic networks.",
        "faq-q4": "What kind of geoportfolio does he present?",
        "faq-a4": "The geoportfolio includes web maps, StoryMaps, and interactive viewers on rural electricity, land cover transformation, metropolitan population, and digital cartography of Santa Cruz.",
        "footer-kicker": "Contact",
        "footer-desc": "I am available for technical projects, teaching, applied research, and institutional collaboration.",
        "footer-mail-label": "Email",
        "footer-mail-action": "Send message",
        "footer-phone-label": "Phone",
        "footer-phone-action": "Call now",
        "footer-linkedin-action": "Open profile ↗",
        "footer-portfolio-action": "View works ↗",
        "footer-orcid-action": "View academic identity ↗",
        "footer-researchgate-action": "View academic profile ↗",
        "footer-github-action": "View code and projects ↗",
        "footer-job": "Land Surveyor",
        "footer-loc": "Santa Cruz, Bolivia",
        "footer-copy": "©2026. All rights reserved.",
        "form-title": "Send me a message",
        "form-name-label": "Full Name",
        "form-email-label": "Email Address",
        "form-msg-label": "Message",
        "form-submit": "Send message",
        "form-name-placeholder": "Enter your name",
        "form-email-placeholder": "you@email.com",
        "form-msg-placeholder": "Write your detailed message here..."
    }
};

function initLanguageToggle() {
    const langBtn = document.getElementById('lang-toggle');
    if (!langBtn) return;

    // Read stored language or default to 'es'
    const storedLang = localStorage.getItem('language') || 'es';
    translatePage(storedLang);
    langBtn.textContent = storedLang === 'es' ? 'EN' : 'ES';

    langBtn.addEventListener('click', () => {
        const currentLang = localStorage.getItem('language') || 'es';
        const nextLang = currentLang === 'es' ? 'en' : 'es';
        
        translatePage(nextLang);
        localStorage.setItem('language', nextLang);
        langBtn.textContent = nextLang === 'es' ? 'EN' : 'ES';
        
        // dynamic visual feedback
        langBtn.style.transform = 'scale(0.85)';
        setTimeout(() => langBtn.style.transform = '', 150);
    });
}

function translatePage(lang) {
    const dict = translations[lang];
    if (!dict) return;

    // Update document language tag
    document.documentElement.setAttribute('lang', lang);

    // Translate content elements
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.textContent = dict[key];
        }
    });

    // Translate placeholder elements
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) {
            el.setAttribute('placeholder', dict[key]);
        }
    });
}

/* 3. Grid Filters Engine */
function initPortfolioFilters() {
    const setups = [
        { filtersId: 'projects-filters', itemsClass: 'expertise-card' },
        { filtersId: 'geo-filters', itemsClass: 'gallery-card' },
        { filtersId: 'gallery-filters', itemsClass: 'gallery-card' }
    ];

    setups.forEach(({ filtersId, itemsClass }) => {
        const filterContainer = document.getElementById(filtersId);
        if (!filterContainer) return;

        const buttons = filterContainer.querySelectorAll('.filter-btn');
        const parentSection = filterContainer.closest('section');
        if (!parentSection) return;

        const items = parentSection.querySelectorAll(`.${itemsClass}`);

        buttons.forEach((btn) => {
            btn.addEventListener('click', () => {
                // Toggle active state
                buttons.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');

                const filterVal = btn.getAttribute('data-filter');

                items.forEach((item) => {
                    const cat = item.getAttribute('data-category');
                    if (filterVal === 'all' || cat === filterVal) {
                        // Smooth scale-fade reveal
                        item.classList.remove('is-hidden');
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        // Smooth scale-fade hide
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.92)';
                        setTimeout(() => {
                            if (item.style.opacity === '0') {
                                item.classList.add('is-hidden');
                            }
                        }, 350);
                    }
                });
            });
        });
    });
}

/* 4. Touch & Keyboard Responsive Gallery Lightbox */
function initLightbox() {
    const gallery = document.getElementById('lightbox-gallery');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    
    if (!gallery || !lightbox || !lightboxImg || !lightboxCaption) return;

    const cards = Array.from(gallery.querySelectorAll('.gallery-card'));
    const images = cards.map(c => c.querySelector('img')).filter(Boolean);
    let currentIndex = -1;

    // Attach click listeners to cards
    cards.forEach((card, index) => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            // Prevent interference with internal links (if any)
            if (e.target.closest('a')) return;
            
            currentIndex = index;
            openLightbox(images[currentIndex]);
        });
    });

    function openLightbox(imgEl) {
        if (!imgEl) return;
        
        lightboxImg.src = imgEl.src;
        lightboxImg.alt = imgEl.alt;
        
        const fig = imgEl.closest('figure');
        const captionStrong = fig?.querySelector('figcaption strong')?.textContent || '';
        const captionSpan = fig?.querySelector('figcaption span')?.textContent || '';
        
        lightboxCaption.innerHTML = captionStrong ? `<strong>${captionStrong}</strong><br><span>${captionSpan}</span>` : '';
        
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Lock scrolling
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        setTimeout(() => {
            lightboxImg.src = '';
            lightboxCaption.textContent = '';
        }, 300);
    }

    function showNext() {
        if (currentIndex === -1 || images.length === 0) return;
        currentIndex = (currentIndex + 1) % images.length;
        
        // Smooth slide cross-fade
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
            openLightbox(images[currentIndex]);
            lightboxImg.style.opacity = '1';
        }, 150);
    }

    function showPrev() {
        if (currentIndex === -1 || images.length === 0) return;
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
            openLightbox(images[currentIndex]);
            lightboxImg.style.opacity = '1';
        }, 150);
    }

    // Modal control actions
    lightbox.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev')?.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
    lightbox.querySelector('.lightbox-next')?.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
    
    // Close on click outside content
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
            closeLightbox();
        }
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowRight') showNext();
        else if (e.key === 'ArrowLeft') showPrev();
    });

    // Swipe touch navigation support
    let touchStartX = 0;
    let touchEndX = 0;
    
    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const threshold = 50;
        if (touchEndX < touchStartX - threshold) {
            showNext(); // Swipe left -> Next image
        } else if (touchEndX > touchStartX + threshold) {
            showPrev(); // Swipe right -> Previous image
        }
    }
}

/* 5. Asynchronous AJAX Contact Form Submission */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const statusDiv = document.getElementById('form-status');
    
    if (!form || !statusDiv) return;

    const submitBtn = form.querySelector('.form-submit-btn');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnSpinner = submitBtn?.querySelector('.btn-spinner');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Loading state styling
        statusDiv.className = 'form-status is-hidden';
        if (btnText && btnSpinner) {
            btnText.classList.add('is-hidden');
            btnSpinner.classList.remove('is-hidden');
            submitBtn.disabled = true;
        }

        const formData = new FormData(form);
        const currentLang = localStorage.getItem('language') || 'es';

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok) {
                // Success message
                statusDiv.classList.remove('is-hidden', 'error');
                statusDiv.classList.add('success');
                statusDiv.textContent = currentLang === 'es' 
                    ? '¡Tu mensaje ha sido enviado con éxito! Gustavo se pondrá en contacto pronto.' 
                    : 'Your message has been sent successfully! Gustavo will contact you soon.';
                form.reset();
            } else {
                // Error response
                throw new Error(result.message || 'Error en el servidor');
            }
        } catch (error) {
            console.error('Submission error:', error);
            // Error message
            statusDiv.classList.remove('is-hidden', 'success');
            statusDiv.classList.add('error');
            statusDiv.textContent = currentLang === 'es'
                ? 'Lo sentimos, hubo un problema al enviar tu mensaje. Por favor intenta de nuevo o comunícate vía correo directo.'
                : 'Sorry, there was a problem sending your message. Please try again or contact via direct email.';
        } finally {
            // Restore button state
            if (btnText && btnSpinner) {
                btnText.classList.remove('is-hidden');
                btnSpinner.classList.add('is-hidden');
                submitBtn.disabled = false;
            }
        }
    });
}

/* 6. Dynamic 3D Parallax Tilt Effect Engine for Desktop Grid Cards */
function init3DTilt() {
    const isTouch = window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window);
    if (isTouch) {
        return; // Disable on touch devices for mobile performance and scroll ease
    }

    const cards = document.querySelectorAll('.expertise-card, .gallery-card');
    cards.forEach((card) => {
        card.style.transformStyle = 'preserve-3d';
        card.style.perspective = '1000px';

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Limit tilt angle to a subtle, premium 8 degrees
            const rotateX = ((centerY - y) / centerY) * 8;
            const rotateY = ((x - centerX) / centerX) * 8;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            
            // Push internal elements in 3D space
            const innerImg = card.querySelector('img');
            if (innerImg) {
                innerImg.style.transform = 'translate3d(0, 0, 12px) scale(1.03)';
            }
            
            const content = card.querySelector('figcaption, .expertise-content');
            if (content) {
                content.style.transform = 'translate3d(0, 0, 20px)';
            }
        });

        card.addEventListener('mouseleave', () => {
            // Restore styles with smooth easing
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            
            const innerImg = card.querySelector('img');
            if (innerImg) {
                innerImg.style.transform = '';
            }
            
            const content = card.querySelector('figcaption, .expertise-content');
            if (content) {
                content.style.transform = '';
            }
        });
    });
}
