// Game Translations - Main JavaScript
let gamesData = [];
let filteredGames = [];

const categoryTranslations = {
    'action': 'أكشن',
    'adventure': 'مغامرات',
    'rpg': 'تقمص ادوار',
    'strategy': 'استراتيجية',
    'simulation': 'محاكاة',
    'sports': 'رياضية',
    'puzzle': 'أحجية'
};

function getGameSlug(title) {
    return title
        .replace(/[:\-–—]/g, ' ')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

function getGameUrl(game) {
    return `${getGameSlug(game.title)}-Localization.html`;
}

// ===== MAIN PAGE =====
function initMainPage() {
    loadGames();
    setupEventListeners();
    setupScrollEffect();
}

function setupScrollEffect() {
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }, { passive: true });
}

async function loadGames() {
    showLoading(true);
    try {
        const response = await fetch('games.json');
        if (!response.ok) throw new Error('Failed to load');
        gamesData = await response.json();
    } catch (e) {
        gamesData = [];
    }
    filteredGames = [...gamesData];
    displayGames(filteredGames);
    updateStats();
    showLoading(false);
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    searchBtn.addEventListener('click', handleSearch);
    document.getElementById('categoryFilter').addEventListener('change', handleFilter);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
}

function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    applyFilters(searchTerm);
}

function handleFilter() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    applyFilters(searchTerm);
}

function applyFilters(searchTerm = '') {
    const category = document.getElementById('categoryFilter').value;
    filteredGames = gamesData.filter(game => {
        const matchesSearch = !searchTerm ||
            game.title.toLowerCase().includes(searchTerm) ||
            game.shortDescription.toLowerCase().includes(searchTerm) ||
            game.fullDescription.toLowerCase().includes(searchTerm) ||
            (game.tags && game.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
            (game.seoKeywords && game.seoKeywords.toLowerCase().includes(searchTerm));
        const matchesCategory = category === 'all' || game.category === category;
        return matchesSearch && matchesCategory;
    });
    displayGames(filteredGames);
    showNoResults(filteredGames.length === 0);
}

function displayGames(games) {
    const container = document.getElementById('gamesContainer');
    container.innerHTML = '';
    games.forEach((game, index) => {
        container.appendChild(createGameCard(game, index));
    });
}

function createGameCard(game, index) {
    const a = document.createElement('a');
    a.className = `game-card ${game.featured ? 'featured' : ''}`;
    a.style.animationDelay = `${index * 0.05}s`;
    a.href = getGameUrl(game);

    const imageUrl = game.image || '';
    const categoryText = categoryTranslations[game.category] || game.category;

    a.innerHTML = `
        <div class="game-image-wrapper">
            <img src="${imageUrl}" alt="${game.title}" class="game-image"
                 onerror="this.onerror=null;this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 200%22><rect fill=%22%23111827%22 width=%22400%22 height=%22200%22/><text fill=%22%2300d4aa%22 font-family=%22sans-serif%22 font-size=%2224%22 x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22>🎮</text></svg>'">
        </div>
        <div class="game-info">
            <h3 class="game-title">${game.title}</h3>
            <p class="game-description">${game.shortDescription}</p>
            <div class="game-meta">
                <span class="category-badge">${categoryText}</span>
            </div>
        </div>
    `;
    return a;
}

function updateStats() {
    document.getElementById('totalGames').textContent = gamesData.length;
    const featuredCount = gamesData.filter(game => game.featured).length;
    document.getElementById('totalFeatured').textContent = featuredCount;
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
    document.getElementById('gamesContainer').style.display = show ? 'none' : 'grid';
}

function showNoResults(show) {
    document.getElementById('noResults').style.display = show ? 'block' : 'none';
    document.getElementById('gamesContainer').style.display = show ? 'none' : 'grid';
}

// ===== GAME PAGE =====
async function initGamePage() {
    try {
        const response = await fetch('games.json');
        if (!response.ok) throw new Error('Failed to load');
        gamesData = await response.json();
    } catch (e) {
        gamesData = [];
    }

    const params = new URLSearchParams(window.location.search);
    const gameId = parseInt(params.get('id'));

    if (gameId) {
        const game = gamesData.find(g => g.id === gameId);
        if (game) {
            setGameSEO(game);
            renderGamePage(game);
            return;
        }
    }

    const currentFile = window.location.pathname.split('/').pop();
    if (currentFile.endsWith('-Localization.html')) {
        const slug = currentFile.replace('-Localization.html', '');
        const game = gamesData.find(g => getGameSlug(g.title) === slug);
        if (game) {
            setGameSEO(game);
            renderGamePage(game);
            return;
        }
    }

    window.location.href = 'index.html';
}

function setGameSEO(game) {
    const title = game.seoTitle || `${game.title} | سنونو`;
    const desc = game.seoDescription || game.fullDescription;
    const keywords = game.seoKeywords || game.tags.join(', ');
    const url = `https://snono-dev.github.io/ta3reebat/${getGameUrl(game)}`;

    document.title = title;

    const metaDesc = document.getElementById('metaDescription');
    if (metaDesc) metaDesc.setAttribute('content', desc);

    const metaKeywords = document.getElementById('metaKeywords');
    if (metaKeywords) metaKeywords.setAttribute('content', keywords);

    const ogTitle = document.getElementById('ogTitle');
    if (ogTitle) ogTitle.setAttribute('content', title);

    const ogDesc = document.getElementById('ogDescription');
    if (ogDesc) ogDesc.setAttribute('content', desc);

    const twTitle = document.getElementById('twTitle');
    if (twTitle) twTitle.setAttribute('content', title);

    const twDesc = document.getElementById('twDescription');
    if (twDesc) twDesc.setAttribute('content', desc);

    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": game.title,
        "description": desc,
        "applicationCategory": "GameApplication",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }
    };

    const schemaScript = document.getElementById('gameSchema');
    if (schemaScript) schemaScript.textContent = JSON.stringify(schema);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
    }
    canonical.href = url;
}

function renderGamePage(game) {
    const categoryText = categoryTranslations[game.category] || game.category;
    const pageContainer = document.getElementById('gamePage');

    const imgSrc = game.image || '';
    const fallbackImg = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 600 400%22><rect fill=%22%23111827%22 width=%22600%22 height=%22400%22/><text fill=%22%2300d4aa%22 font-family=%22sans-serif%22 font-size=%2240%22 x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22>🎮</text></svg>";

    pageContainer.innerHTML = `
        <div class="game-page-header">
            <img src="${imgSrc}" class="game-page-banner" alt="${game.title}"
                 onerror="this.onerror=null;this.src='${fallbackImg}'">
            <div class="game-page-banner-overlay"></div>
        </div>
        <div class="game-page-container">
            <a href="index.html" class="game-page-back">
                <i class="fas fa-arrow-right"></i> العودة للموقع
            </a>
            <div class="game-page-card">
                <div class="game-page-top">
                    <img src="${imgSrc}" class="game-page-thumb" alt="${game.title}"
                         onerror="this.onerror=null;this.src='${fallbackImg}'">
                    <div class="game-page-info">
                        <h1 class="game-page-title">${game.title}</h1>
                        <div class="game-page-badges">
                            <span class="game-page-badge cat">${categoryText}</span>
                            ${game.featured ? '<span class="game-page-badge feat">★ مميزة</span>' : ''}
                        </div>
                    </div>
                </div>
                <div class="game-page-body">
                    <h3 class="game-page-section-title">
                        <i class="fas fa-info-circle"></i> وصف التعريب
                    </h3>
                    <p class="game-page-description">${game.fullDescription}</p>

                    <h3 class="game-page-section-title">
                        <i class="fas fa-list-ul"></i> تفاصيل
                    </h3>
                    <div class="game-page-details-grid">
                        <div class="game-page-detail">
                            <i class="fas fa-code-branch"></i>
                            <div>
                                <div class="game-page-detail-label">الإصدار</div>
                                <div class="game-page-detail-value">${game.version || '-'}</div>
                            </div>
                        </div>
                        <div class="game-page-detail">
                            <i class="fas fa-hdd"></i>
                            <div>
                                <div class="game-page-detail-label">الحجم</div>
                                <div class="game-page-detail-value">${game.size || '-'}</div>
                            </div>
                        </div>
                        <div class="game-page-detail">
                            <i class="fas fa-calendar"></i>
                            <div>
                                <div class="game-page-detail-label">التاريخ</div>
                                <div class="game-page-detail-value">${game.releaseDate || '-'}</div>
                            </div>
                        </div>
                        <div class="game-page-detail">
                            <i class="fas fa-users"></i>
                            <div>
                                <div class="game-page-detail-label">المصدر</div>
                                <div class="game-page-detail-value">${game.source || 'غير محدد'}</div>
                            </div>
                        </div>
                    </div>

                    <button class="game-page-download" onclick="downloadGame('${game.downloadUrl}')">
                        <i class="fas fa-download"></i>
                        تحميل التعريب
                    </button>
                </div>
            </div>
        </div>
    `;
}

function downloadGame(url) {
    if (url && url !== '#') {
        window.open(url, '_blank');
    } else {
        alert('رابط التحميل غير متاح حالياً');
    }
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}