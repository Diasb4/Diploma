/**
 * AITU Diploma Advisor Portal - Modern Frontend Application
 * Core Architecture & Features:
 *  1. Dual Catalog: Official Diploma Topics & Supervisors Directory.
 *  2. AI Smart Match Advisor: Multi-step interactive quiz with % compatibility ranking.
 *  3. Side-by-Side Comparison Matrix for topics and professors.
 *  4. Interactive 4-Stage Thesis Roadmap & Checklist with localStorage persistence.
 *  5. Custom Initiative Topic & Startup proposal wizard.
 *  6. Printable Formal Application Sheet with local QR Code generation.
 *  7. Multi-template Email Composer in RU/EN/KZ.
 *  8. Command Palette (Ctrl+K / Cmd+K).
 *  9. Offline/file:// protocol support and localStorage synchronization.
 */

(function () {
  'use strict';

  // Global State
  const state = {
    currentView: 'topics', // 'topics' | 'professors'

    // Topics State
    schools: (window.TOPICS_CATALOG && window.TOPICS_CATALOG.schools) || [],
    topics: (window.TOPICS_CATALOG && window.TOPICS_CATALOG.topics) || [],
    filteredTopics: [],
    topicSearchQuery: '',
    selectedTopicSchool: 'ALL',
    selectedTopicTrack: 'ALL',
    selectedTopicDifficulty: 'ALL',
    selectedTopicLanguage: 'ALL',
    selectedTopicSort: 'default',
    onlyAvailableTopics: true,

    // Professors State
    professors: window.__EMBEDDED_PROFESSORS__ || [],
    stats: window.__EMBEDDED_STATS__ || null,
    filteredProfs: [],
    profSearchQuery: '',
    selectedDirection: 'ALL',
    sortBy: 'name_asc',
    freeSlotsOnly: false,
    currentPage: 1,
    pageSize: 24,
    activeProfessor: null,

    // User Data & Shortcuts
    bookmarks: new Set(),
    comparedTopics: new Set(),
    comparedProfs: new Set(),
    applications: [], // Array of application objects

    // Modals & Active Items
    activeReservationTopic: null,
    tempReservationMembers: [],
    activePrintableApp: null,

    // AI Advisor Quiz State
    quiz: {
      step: 1,
      school: '',
      interests: [],
      skills: [],
      format: 'team', // 'solo' | 'team'
      level: 'any'
    },

    // Roadmap Checkbox State
    roadmapChecks: {},

    // Theme
    theme: localStorage.getItem('aitu_theme') || 'dark'
  };

  // DOM Elements Cache
  const el = {
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    catalogTabs: document.querySelectorAll('.catalog-tab'),
    topicsView: document.getElementById('topicsView'),
    professorsView: document.getElementById('professorsView'),

    // Hero Stats
    statTopicCount: document.getElementById('statTopicCount'),
    statAvailableTopics: document.getElementById('statAvailableTopics'),
    statProfCount: document.getElementById('statProfCount'),
    statSchoolCount: document.getElementById('statSchoolCount'),

    // Topic Filters
    topicSearchInput: document.getElementById('topicSearchInput'),
    clearTopicSearchBtn: document.getElementById('clearTopicSearchBtn'),
    topicSchoolFilter: document.getElementById('topicSchoolFilter'),
    topicTrackFilter: document.getElementById('topicTrackFilter'),
    topicDifficultyFilter: document.getElementById('topicDifficultyFilter'),
    topicLanguageFilter: document.getElementById('topicLanguageFilter'),
    topicSortBySelect: document.getElementById('topicSortBySelect'),
    availableTopicsOnly: document.getElementById('availableTopicsOnly'),
    topicResultsCount: document.getElementById('topicResultsCount'),
    topicsGrid: document.getElementById('topicsGrid'),

    // Professor Filters
    profSearchInput: document.getElementById('searchInput'),
    clearProfSearchBtn: document.getElementById('clearSearchBtn'),
    directionPills: document.getElementById('directionPills'),
    sortBySelect: document.getElementById('sortBySelect'),
    freeSlotsOnlyProf: document.getElementById('freeSlotsOnlyProf'),
    profResultsCount: document.getElementById('resultsCount'),
    professorsGrid: document.getElementById('professorsGrid'),
    loadMoreBtn: document.getElementById('loadMoreBtn'),
    paginationWrapper: document.getElementById('paginationWrapper'),

    // Buttons & Badges
    openAdvisorQuizBtn: document.getElementById('openAdvisorQuizBtn'),
    heroStartQuizBtn: document.getElementById('heroStartQuizBtn'),
    openRoadmapBtn: document.getElementById('openRoadmapBtn'),
    openProposeTopicBtn: document.getElementById('openProposeTopicBtn'),
    topicProposeBtnTop: document.getElementById('topicProposeBtnTop'),
    openCompareBtn: document.getElementById('openCompareBtn'),
    openBookmarksBtn: document.getElementById('openBookmarksBtn'),
    openApplicationsBtn: document.getElementById('openApplicationsBtn'),
    heroOpenGuideBtn: document.getElementById('heroOpenGuideBtn'),
    openCmdPaletteBtn: document.getElementById('openCmdPaletteBtn'),

    compareCountBadges: document.querySelectorAll('.compare-count'),
    bookmarkCountBadges: document.querySelectorAll('.bookmark-count'),
    applicationCountBadges: document.querySelectorAll('.application-count'),

    // Modals
    advisorQuizModalBackdrop: document.getElementById('advisorQuizModalBackdrop'),
    advisorQuizContent: document.getElementById('advisorQuizContent'),
    closeAdvisorQuizBtn: document.getElementById('closeAdvisorQuizBtn'),

    compareModalBackdrop: document.getElementById('compareModalBackdrop'),
    compareModalContent: document.getElementById('compareModalContent'),
    closeCompareModalBtn: document.getElementById('closeCompareModalBtn'),

    roadmapModalBackdrop: document.getElementById('roadmapModalBackdrop'),
    roadmapModalContent: document.getElementById('roadmapModalContent'),
    closeRoadmapModalBtn: document.getElementById('closeRoadmapModalBtn'),

    proposeTopicModalBackdrop: document.getElementById('proposeTopicModalBackdrop'),
    proposeTopicContent: document.getElementById('proposeTopicContent'),
    closeProposeTopicBtn: document.getElementById('closeProposeTopicBtn'),

    printableModalBackdrop: document.getElementById('printableModalBackdrop'),
    printableSheetContainer: document.getElementById('printableSheetContainer'),
    closePrintableModalBtn: document.getElementById('closePrintableModalBtn'),
    printSheetActionBtn: document.getElementById('printSheetActionBtn'),

    profModalBackdrop: document.getElementById('profModalBackdrop'),
    profModalContent: document.getElementById('profModalContent'),

    topicModalBackdrop: document.getElementById('topicModalBackdrop'),
    topicModalContent: document.getElementById('topicModalContent'),

    guideModalBackdrop: document.getElementById('guideModalBackdrop'),
    closeGuideBtn: document.getElementById('closeGuideBtn'),

    bookmarksDrawerBackdrop: document.getElementById('bookmarksDrawerBackdrop'),
    bookmarksList: document.getElementById('bookmarksList'),
    closeBookmarksBtn: document.getElementById('closeBookmarksBtn'),

    applicationsDrawerBackdrop: document.getElementById('applicationsDrawerBackdrop'),
    applicationsList: document.getElementById('applicationsList'),
    closeApplicationsBtn: document.getElementById('closeApplicationsBtn'),

    cmdPaletteBackdrop: document.getElementById('cmdPaletteBackdrop'),
    cmdPaletteInput: document.getElementById('cmdPaletteInput'),
    cmdPaletteResults: document.getElementById('cmdPaletteResults'),

    toastContainer: document.getElementById('toastContainer')
  };

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  async function init() {
    applyTheme(state.theme);
    loadSavedStorage();
    setupGlobalEventListeners();

    await loadCatalogData();

    initTopicFilterOptions();
    applyTopicFilters();

    initProfFilterOptions();
    applyProfFilters();

    updateGlobalStats();
  }

  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aitu_theme', theme);
    if (el.themeToggleBtn) {
      el.themeToggleBtn.textContent = theme === 'dark' ? '☀️ Светлая' : '🌙 Тёмная';
      el.themeToggleBtn.setAttribute('title', theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему');
    }
  }

  function loadSavedStorage() {
    try {
      const bMarks = JSON.parse(localStorage.getItem('aitu_bookmarked_items') || '[]');
      state.bookmarks = new Set(bMarks);
    } catch (e) { state.bookmarks = new Set(); }

    try {
      const apps = JSON.parse(localStorage.getItem('aitu_topic_applications') || '[]');
      state.applications = Array.isArray(apps) ? apps : [];
    } catch (e) { state.applications = []; }

    try {
      const checks = JSON.parse(localStorage.getItem('aitu_roadmap_checks') || '{}');
      state.roadmapChecks = typeof checks === 'object' ? checks : {};
    } catch (e) { state.roadmapChecks = {}; }

    updateBadgeCounts();
  }

  function updateBadgeCounts() {
    // Bookmarks
    const bCount = state.bookmarks.size;
    el.bookmarkCountBadges.forEach(b => {
      b.textContent = bCount;
      b.style.display = bCount > 0 ? 'inline-block' : 'none';
    });

    // Applications
    const activeApps = state.applications.filter(a => a.status === 'pending_approval' || a.status === 'approved').length;
    el.applicationCountBadges.forEach(b => {
      b.textContent = activeApps;
      b.style.display = activeApps > 0 ? 'inline-block' : 'none';
    });

    // Compare
    const compCount = state.comparedTopics.size + state.comparedProfs.size;
    el.compareCountBadges.forEach(b => {
      b.textContent = compCount;
      b.style.display = compCount > 0 ? 'inline-block' : 'none';
    });
  }

  async function loadCatalogData() {
    // Fallbacks already in state if data scripts loaded
    if (!state.professors || state.professors.length === 0) {
      try {
        const [profsRes, statsRes, topicsRes] = await Promise.all([
          fetch('data/professors.json'),
          fetch('data/stats.json'),
          fetch('data/topics.json')
        ]);
        if (profsRes.ok) state.professors = await profsRes.json();
        if (statsRes.ok) state.stats = await statsRes.json();
        if (topicsRes.ok) {
          const tData = await topicsRes.json();
          state.topics = tData.topics || state.topics;
          state.schools = tData.schools || state.schools;
        }
      } catch (e) {
        console.warn('Fetched data fallback used', e);
      }
    }
  }

  function updateGlobalStats() {
    const totalTopics = state.topics.length;
    const availTopics = state.topics.filter(t => getTopicReservationStatus(t.id).status === 'available').length;
    const totalProfs = state.professors.length || 346;
    const totalSchools = state.schools.length || 7;

    if (el.statTopicCount) el.statTopicCount.textContent = totalTopics;
    if (el.statAvailableTopics) el.statAvailableTopics.textContent = availTopics;
    if (el.statProfCount) el.statProfCount.textContent = totalProfs;
    if (el.statSchoolCount) el.statSchoolCount.textContent = totalSchools;
  }

  function getTopicReservationStatus(topicId) {
    const activeApp = state.applications.find(a => 
      a.topic_id === topicId && (a.status === 'pending_approval' || a.status === 'approved')
    );
    if (!activeApp) return { status: 'available', app: null };
    return { status: activeApp.status, app: activeApp };
  }

  // ==========================================================================
  // TOPICS CATALOG LOGIC & RENDERING
  // ==========================================================================

  function initTopicFilterOptions() {
    if (el.topicSchoolFilter) {
      let html = '<option value="ALL">🏛️ Все школы AITU</option>';
      state.schools.forEach(sch => {
        html += `<option value="${escapeHtml(sch.id)}">${escapeHtml(sch.id)} — ${escapeHtml(sch.name_ru || sch.name)}</option>`;
      });
      el.topicSchoolFilter.innerHTML = html;
    }

    if (el.topicTrackFilter) {
      const tracks = Array.from(new Set(state.topics.map(t => t.track).filter(Boolean))).sort();
      let html = '<option value="ALL">🎯 Все направления</option>';
      tracks.forEach(tr => {
        html += `<option value="${escapeHtml(tr)}">${escapeHtml(tr)}</option>`;
      });
      el.topicTrackFilter.innerHTML = html;
    }
  }

  function applyTopicFilters() {
    const q = state.topicSearchQuery.toLowerCase().trim();
    const sch = state.selectedTopicSchool;
    const track = state.selectedTopicTrack;
    const diff = state.selectedTopicDifficulty;
    const lang = state.selectedTopicLanguage;
    const onlyAvail = state.onlyAvailableTopics;

    state.filteredTopics = state.topics.filter(topic => {
      const { status } = getTopicReservationStatus(topic.id);

      if (onlyAvail && status !== 'available') return false;
      if (sch !== 'ALL' && topic.school_id !== sch) return false;
      if (track !== 'ALL' && topic.track !== track) return false;
      if (diff !== 'ALL' && topic.difficulty !== diff) return false;
      if (lang !== 'ALL' && topic.language !== lang) return false;

      if (q) {
        const inId = topic.id.toLowerCase().includes(q);
        const inTitle = topic.title.toLowerCase().includes(q);
        const inTrack = (topic.track || '').toLowerCase().includes(q);
        const inDesc = (topic.description || '').toLowerCase().includes(q);
        const inTech = (topic.technologies || []).some(t => t.toLowerCase().includes(q));
        if (!inId && !inTitle && !inTrack && !inDesc && !inTech) return false;
      }

      return true;
    });

    sortFilteredTopics();
    renderTopicsGrid();
    updateTopicResultsCount();
  }

  function sortFilteredTopics() {
    switch (state.selectedTopicSort) {
      case 'title_asc':
        state.filteredTopics.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
        break;
      case 'school':
        state.filteredTopics.sort((a, b) => a.school_id.localeCompare(b.school_id));
        break;
      case 'difficulty':
        const dOrder = { 'Базовый': 1, 'Средний': 2, 'Продвинутый': 3 };
        state.filteredTopics.sort((a, b) => (dOrder[b.difficulty] || 0) - (dOrder[a.difficulty] || 0));
        break;
      default:
        break;
    }
  }

  function updateTopicResultsCount() {
    if (!el.topicResultsCount) return;
    el.topicResultsCount.innerHTML = `Найдено <strong>${state.filteredTopics.length}</strong> актуальных тем`;
  }

  function renderTopicsGrid() {
    if (!el.topicsGrid) return;

    if (state.filteredTopics.length === 0) {
      el.topicsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">🔍</div>
          <h3 class="empty-title">Темы по запросу не найдены</h3>
          <p class="empty-desc">Попробуйте скорректировать фильтры, стек технологий или отключить ограничение «Только свободные».</p>
          <button class="btn btn-secondary" id="resetTopicFiltersBtn">Сбросить фильтры тем</button>
        </div>
      `;
      const resetBtn = document.getElementById('resetTopicFiltersBtn');
      if (resetBtn) resetBtn.addEventListener('click', resetAllTopicFilters);
      return;
    }

    let html = '';
    state.filteredTopics.forEach(topic => {
      const { status, app } = getTopicReservationStatus(topic.id);
      const isBookmarked = state.bookmarks.has(topic.id);
      const isCompared = state.comparedTopics.has(topic.id);

      let statusBadge = `<span class="status-badge status-available">● Доступна</span>`;
      let cardMod = '';
      let actionBtn = `<button class="btn btn-primary btn-reserve-topic" data-topic-id="${escapeHtml(topic.id)}">Подать заявку</button>`;

      if (status === 'pending_approval') {
        cardMod = 'topic-card-reserved';
        statusBadge = `<span class="status-badge status-pending">⏳ Согласование</span>`;
        actionBtn = `<button class="btn btn-secondary btn-view-app" data-app-id="${escapeHtml(app ? app.id : '')}">Моя заявка</button>`;
      } else if (status === 'approved') {
        cardMod = 'topic-card-approved';
        statusBadge = `<span class="status-badge status-approved">✅ Утверждена</span>`;
        actionBtn = `<button class="btn btn-secondary btn-view-app" data-app-id="${escapeHtml(app ? app.id : '')}">Детали брони</button>`;
      }

      const diffClass = topic.difficulty === 'Базовый' ? 'diff-basic' : topic.difficulty === 'Продвинутый' ? 'diff-adv' : 'diff-medium';

      html += `
        <div class="topic-card ${cardMod}" data-topic-id="${escapeHtml(topic.id)}">
          <div>
            <div class="topic-header">
              <div class="topic-tags-group">
                <span class="topic-school-tag">${escapeHtml(topic.school_id)}</span>
                ${topic.track ? `<span class="topic-track-tag">${escapeHtml(topic.track)}</span>` : ''}
                ${topic.difficulty ? `<span class="topic-difficulty-tag ${diffClass}">${escapeHtml(topic.difficulty)}</span>` : ''}
              </div>
              <div>${statusBadge}</div>
            </div>

            <h3 class="topic-title">${escapeHtml(topic.title)}</h3>
            
            ${topic.description ? `
              <p class="topic-desc-snippet">${escapeHtml(topic.description)}</p>
            ` : ''}

            ${(topic.technologies && topic.technologies.length > 0) ? `
              <div class="topic-tech-pills">
                ${topic.technologies.map(t => `<span class="tech-pill">${escapeHtml(t)}</span>`).join('')}
              </div>
            ` : ''}

            <div class="topic-meta-box">
              <div class="topic-meta-row">
                <span style="color: var(--text-muted);">Код темы:</span>
                <span style="font-family: var(--font-mono); font-weight: 600;">${escapeHtml(topic.id)}</span>
              </div>
              <div class="topic-meta-row">
                <span style="color: var(--text-muted);">Команда:</span>
                <span>до <strong>${topic.team_size_max || 3}</strong> студентов</span>
              </div>
              ${topic.expected_outcomes ? `
                <div style="font-size: 0.76rem; color: var(--text-subtle); margin-top: 4px;">
                  🎯 <strong>Итог:</strong> ${escapeHtml(topic.expected_outcomes)}
                </div>
              ` : ''}
            </div>
          </div>

          <div class="topic-footer">
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-secondary btn-toggle-compare-topic ${isCompared ? 'btn-accent-glow' : ''}" data-topic-id="${escapeHtml(topic.id)}" title="${isCompared ? 'Удалить из сравнения' : 'Добавить к сравнению'}">
                ${isCompared ? '✓ В сравнении' : '⚖️ Сравнить'}
              </button>
              <button class="btn btn-secondary btn-toggle-bookmark-topic ${isBookmarked ? 'btn-accent-glow' : ''}" data-topic-id="${escapeHtml(topic.id)}" title="Сохранить в избранное">
                ${isBookmarked ? '⭐' : '☆'}
              </button>
            </div>
            <div>
              ${actionBtn}
            </div>
          </div>
        </div>
      `;
    });

    el.topicsGrid.innerHTML = html;
  }

  function resetAllTopicFilters() {
    state.topicSearchQuery = '';
    state.selectedTopicSchool = 'ALL';
    state.selectedTopicTrack = 'ALL';
    state.selectedTopicDifficulty = 'ALL';
    state.selectedTopicLanguage = 'ALL';
    state.selectedTopicSort = 'default';
    state.onlyAvailableTopics = false;

    if (el.topicSearchInput) el.topicSearchInput.value = '';
    if (el.clearTopicSearchBtn) el.clearTopicSearchBtn.style.display = 'none';
    if (el.topicSchoolFilter) el.topicSchoolFilter.value = 'ALL';
    if (el.topicTrackFilter) el.topicTrackFilter.value = 'ALL';
    if (el.topicDifficultyFilter) el.topicDifficultyFilter.value = 'ALL';
    if (el.topicLanguageFilter) el.topicLanguageFilter.value = 'ALL';
    if (el.topicSortBySelect) el.topicSortBySelect.value = 'default';
    if (el.availableTopicsOnly) el.availableTopicsOnly.checked = false;

    applyTopicFilters();
    showToast('Фильтры тем успешно сброшены');
  }

  // ==========================================================================
  // PROFESSORS DIRECTORY LOGIC & RENDERING
  // ==========================================================================

  function initProfFilterOptions() {
    if (!el.directionPills || !state.stats) return;

    const dirs = state.stats.directions_distribution || {};
    let html = `
      <button class="pill-btn active" data-direction="ALL">
        Все направления <span class="badge-count">${state.professors.length}</span>
      </button>
    `;

    const sorted = Object.entries(dirs).sort((a, b) => b[1] - a[1]);
    for (const [dir, count] of sorted) {
      html += `
        <button class="pill-btn" data-direction="${escapeHtml(dir)}">
          ${escapeHtml(dir)} <span class="badge-count">${count}</span>
        </button>
      `;
    }
    el.directionPills.innerHTML = html;
  }

  function applyProfFilters() {
    const q = state.profSearchQuery.toLowerCase().trim();
    const dir = state.selectedDirection;
    const freeOnly = state.freeSlotsOnly;

    state.filteredProfs = state.professors.filter(p => {
      if (freeOnly && (!p.free_slots || p.free_slots <= 0)) return false;
      if (dir !== 'ALL' && !p.directions.includes(dir)) return false;

      if (q) {
        const inName = p.name.toLowerCase().includes(q);
        const inDisc = p.disciplines.some(d => d.toLowerCase().includes(q));
        const inTopics = (p.topics || []).some(t => t.toLowerCase().includes(q));
        const inDept = (p.department || '').toLowerCase().includes(q);
        if (!inName && !inDisc && !inTopics && !inDept) return false;
      }

      return true;
    });

    sortFilteredProfessors();
    state.currentPage = 1;
    renderProfessorsGrid();
    updateProfResultsCount();
  }

  function sortFilteredProfessors() {
    switch (state.sortBy) {
      case 'name_asc':
        state.filteredProfs.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
        break;
      case 'name_desc':
        state.filteredProfs.sort((a, b) => b.name.localeCompare(a.name, 'ru'));
        break;
      case 'slots':
        state.filteredProfs.sort((a, b) => (b.free_slots || 0) - (a.free_slots || 0));
        break;
      case 'courses':
        state.filteredProfs.sort((a, b) => b.disciplines.length - a.disciplines.length);
        break;
      default:
        state.filteredProfs.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
        break;
    }
  }

  function updateProfResultsCount() {
    if (!el.profResultsCount) return;
    el.profResultsCount.innerHTML = `Найдено <strong>${state.filteredProfs.length}</strong> преподавателей`;
  }

  function renderProfessorsGrid() {
    if (!el.professorsGrid) return;

    if (state.filteredProfs.length === 0) {
      el.professorsGrid.innerHTML = `
        <div class="empty-state">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">👨‍🏫</div>
          <h3 class="empty-title">Преподаватели не найдены</h3>
          <p class="empty-desc">Попробуйте изменить поисковый запрос или выбрать другое направление.</p>
          <button class="btn btn-secondary" id="resetProfFiltersBtn">Сбросить фильтры</button>
        </div>
      `;
      const resetBtn = document.getElementById('resetProfFiltersBtn');
      if (resetBtn) resetBtn.addEventListener('click', resetAllProfFilters);
      if (el.paginationWrapper) el.paginationWrapper.style.display = 'none';
      return;
    }

    const visibleCount = state.currentPage * state.pageSize;
    const visibleItems = state.filteredProfs.slice(0, visibleCount);

    let html = '';
    visibleItems.forEach(p => {
      const isBookmarked = state.bookmarks.has(p.id);
      const isCompared = state.comparedProfs.has(p.id);
      const totalSlots = p.total_slots || 5;
      const freeSlots = p.free_slots !== undefined ? p.free_slots : 2;
      const occupiedSlots = Math.max(0, totalSlots - freeSlots);
      const pct = Math.round((occupiedSlots / totalSlots) * 100);

      html += `
        <div class="prof-card" data-id="${p.id}">
          <div>
            <div class="card-header">
              <div class="prof-avatar" style="background: ${p.avatar_bg || 'var(--accent-primary)'};">
                ${escapeHtml(p.initials)}
              </div>
              <div class="prof-meta">
                <h3 class="prof-name" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</h3>
                <div class="prof-degree">${escapeHtml(p.degree || 'Преподаватель AITU')}</div>
                <div class="prof-dept-tag">${escapeHtml(p.department || 'AITU')}</div>
              </div>
              <button class="btn btn-secondary btn-toggle-bookmark-prof ${isBookmarked ? 'btn-accent-glow' : ''}" data-id="${p.id}" title="${isBookmarked ? 'В избранном' : 'Сохранить'}">
                ${isBookmarked ? '⭐' : '☆'}
              </button>
            </div>

            <div class="card-tags">
              ${p.directions.map(d => `<span class="tag-chip">${escapeHtml(d)}</span>`).join('')}
            </div>

            <div class="prof-slots-meta">
              <span>Свободные дипломные слоты:</span>
              <span><strong>${freeSlots}</strong> из ${totalSlots} мест</span>
            </div>
            <div class="prof-slots-bar" title="Занято ${occupiedSlots} из ${totalSlots} мест">
              <div class="prof-slots-fill" style="width: ${100 - pct}%; background: ${freeSlots > 0 ? 'var(--gradient-emerald)' : 'var(--accent-rose)'};"></div>
            </div>

            <div class="card-topics">
              <div class="topics-heading">Дисциплины (${p.disciplines.length}):</div>
              <ul class="topics-list">
                ${p.disciplines.slice(0, 3).map(d => `<li title="${escapeHtml(d)}">${escapeHtml(d)}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div>
            <div class="card-actions">
              <button class="btn btn-secondary btn-view-prof" data-id="${p.id}" style="flex: 1;">
                Подробнее
              </button>
              <button class="btn btn-secondary btn-toggle-compare-prof ${isCompared ? 'btn-accent-glow' : ''}" data-id="${p.id}" title="Сравнить">
                ${isCompared ? '✓' : '⚖️'}
              </button>
              <button class="btn btn-primary btn-quick-email" data-id="${p.id}" title="Составить официальное обращение">
                ✉️ Написать
              </button>
            </div>
          </div>
        </div>
      `;
    });

    el.professorsGrid.innerHTML = html;

    if (el.paginationWrapper) {
      if (visibleCount < state.filteredProfs.length) {
        el.paginationWrapper.style.display = 'flex';
        if (el.loadMoreBtn) {
          el.loadMoreBtn.textContent = `Показать ещё (осталось ${state.filteredProfs.length - visibleCount})`;
        }
      } else {
        el.paginationWrapper.style.display = 'none';
      }
    }
  }

  function resetAllProfFilters() {
    state.profSearchQuery = '';
    state.selectedDirection = 'ALL';
    state.sortBy = 'name_asc';
    state.freeSlotsOnly = false;

    if (el.profSearchInput) el.profSearchInput.value = '';
    if (el.clearProfSearchBtn) el.clearProfSearchBtn.style.display = 'none';
    if (el.sortBySelect) el.sortBySelect.value = 'name_asc';
    if (el.freeSlotsOnlyProf) el.freeSlotsOnlyProf.checked = false;

    if (el.directionPills) {
      el.directionPills.querySelectorAll('.pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.direction === 'ALL');
      });
    }

    applyProfFilters();
    showToast('Фильтры руководителей сброшены');
  }

  // ==========================================================================
  // TOPIC RESERVATION & TEAM BUILDER MODAL
  // ==========================================================================

  function openTopicReservationModal(topicId) {
    const topic = state.topics.find(t => t.id === topicId);
    if (!topic) return;

    const { status } = getTopicReservationStatus(topic.id);
    if (status !== 'available') {
      showToast('Эта тема уже зарезервирована командой');
      return;
    }

    state.activeReservationTopic = topic;

    const savedName = localStorage.getItem('aitu_student_name') || '';
    const savedGroup = localStorage.getItem('aitu_student_group') || '';
    const savedId = localStorage.getItem('aitu_student_id') || '';

    state.tempReservationMembers = [
      {
        student_id: savedId || 's1',
        name: savedName || '',
        school_id: topic.school_id,
        group: savedGroup || ''
      }
    ];

    renderTopicModal();
    el.topicModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeTopicReservationModal() {
    el.topicModalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
    state.activeReservationTopic = null;
    state.tempReservationMembers = [];
  }

  function renderTopicModal() {
    const topic = state.activeReservationTopic;
    if (!topic) return;

    const schoolObj = state.schools.find(s => s.id === topic.school_id) || { name: topic.school_id };
    const requiredSchools = Array.from(new Set(state.tempReservationMembers.map(m => m.school_id).filter(Boolean)));

    let membersHtml = '';
    state.tempReservationMembers.forEach((member, index) => {
      const isCaptain = index === 0;
      membersHtml += `
        <div class="team-member-card">
          <div class="team-member-header">
            <span class="team-member-badge">
              ${isCaptain ? '⭐ Капитан команды (Студент 1 — Заявитель)' : `Участник команды (Студент ${index + 1})`}
            </span>
            ${!isCaptain ? `<button type="button" class="btn-remove-member" data-remove-index="${index}">Удалить</button>` : ''}
          </div>

          <div class="member-grid-fields">
            <div class="form-group" style="margin-bottom: 8px;">
              <label class="form-label">ФИО студента *</label>
              <input type="text" class="form-control member-name-input" data-index="${index}" placeholder="например: Ахметов Азамат" value="${escapeHtml(member.name)}" required autocomplete="off">
            </div>

            <div class="form-group" style="margin-bottom: 8px;">
              <label class="form-label">Student ID / Корпоративная почта *</label>
              <input type="text" class="form-control member-id-input" data-index="${index}" placeholder="220145 или a.akhmetov@astanait.edu.kz" value="${escapeHtml(member.student_id)}" required autocomplete="off">
            </div>

            <div class="form-group" style="margin-bottom: 8px;">
              <label class="form-label">Школа студента *</label>
              ${isCaptain ? `
                <select class="form-control member-school-select" data-index="${index}" disabled style="opacity: 0.9; cursor: not-allowed;">
                  <option value="${escapeHtml(topic.school_id)}" selected>${escapeHtml(topic.school_id)} — ${escapeHtml(schoolObj.name_ru || schoolObj.name)}</option>
                </select>
                <span style="font-size: 0.72rem; color: var(--text-subtle); display: block; margin-top: 3px;">
                  Заявитель обязан быть из выпускающей школы темы (${escapeHtml(topic.school_id)})
                </span>
              ` : `
                <select class="form-control member-school-select" data-index="${index}">
                  ${state.schools.map(sch => `
                    <option value="${escapeHtml(sch.id)}" ${member.school_id === sch.id ? 'selected' : ''}>
                      ${escapeHtml(sch.id)} — ${escapeHtml(sch.name_ru || sch.name)}
                    </option>
                  `).join('')}
                </select>
              `}
            </div>

            <div class="form-group" style="margin-bottom: 8px;">
              <label class="form-label">Учебная группа *</label>
              <input type="text" class="form-control member-group-input" data-index="${index}" placeholder="например: SE-2201" value="${escapeHtml(member.group)}" required autocomplete="off">
            </div>
          </div>
        </div>
      `;
    });

    const isMaxMembers = state.tempReservationMembers.length >= 3;

    el.topicModalContent.innerHTML = `
      <div class="modal-header">
        <div>
          <div style="font-size: 0.78rem; color: var(--accent-primary); font-weight: 700; text-transform: uppercase;">
            Заявка на дипломный проект & Резервирование
          </div>
          <h2 style="font-size: 1.25rem; font-weight: 800; margin-top: 2px;">
            ${escapeHtml(topic.title)}
          </h2>
          <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">
            Код: <strong>${escapeHtml(topic.id)}</strong> • Выпускающая школа: <strong>${escapeHtml(topic.school_id)}</strong> • Направление: <strong>${escapeHtml(topic.track || 'IT')}</strong>
          </div>
        </div>
        <button class="modal-close-btn" id="closeTopicModalBtn">&times;</button>
      </div>

      <div class="modal-body">
        <div class="reservation-rule-box">
          <strong>Регламент формирования команды AITU:</strong>
          <ul style="padding-left: 18px; margin-top: 6px; display: flex; flex-direction: column; gap: 4px;">
            <li>В команде может быть от <strong>1 до 3 студентов</strong>.</li>
            <li>Основной заявитель (Капитан) закрепляет тему своей школы (<strong>${escapeHtml(topic.school_id)}</strong>).</li>
            <li>Межшкольный проект автоматически отправляется на согласование <strong>всех представленных школ</strong>.</li>
          </ul>
        </div>

        <form id="reservationForm">
          <div class="team-members-container">
            ${membersHtml}
          </div>

          <div style="margin-bottom: 20px;">
            <button type="button" class="btn btn-secondary" id="addMemberBtn" ${isMaxMembers ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
              + Добавить участника в команду (${state.tempReservationMembers.length}/3)
            </button>
          </div>

          <div class="approval-summary-card">
            <strong>Необходимые согласования школ для данной команды:</strong>
            <div class="approval-schools-list">
              ${requiredSchools.map(schId => `<span class="school-pill">🏛️ Школа ${escapeHtml(schId)}</span>`).join('')}
            </div>
            ${requiredSchools.length > 1 ? `
              <p style="font-size: 0.78rem; color: var(--accent-amber); margin-top: 8px;">
                ⚠️ Межшкольный проект (${requiredSchools.join(' + ')}). Требуется подтверждение каждой из школ.
              </p>
            ` : `
              <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 8px;">
                Моно-школьный проект (${requiredSchools[0]}). Рассматривается выпускающей кафедрой.
              </p>
            `}
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--border-main); padding-top: 18px;">
            <button type="button" class="btn btn-secondary" id="cancelModalBtn">Отмена</button>
            <button type="submit" class="btn btn-primary">
              ✓ Зарезервировать тему
            </button>
          </div>
        </form>
      </div>
    `;

    setupTopicModalInnerEvents();
  }

  function setupTopicModalInnerEvents() {
    const closeBtn = document.getElementById('closeTopicModalBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeTopicReservationModal);

    const cancelBtn = document.getElementById('cancelModalBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeTopicReservationModal);

    const addMemberBtn = document.getElementById('addMemberBtn');
    if (addMemberBtn) {
      addMemberBtn.addEventListener('click', () => {
        if (state.tempReservationMembers.length < 3) {
          saveCurrentModalInputValues();
          const nextSchool = state.schools[0] ? state.schools[0].id : 'SSE';
          state.tempReservationMembers.push({
            student_id: `s${state.tempReservationMembers.length + 1}`,
            name: '',
            school_id: nextSchool,
            group: ''
          });
          renderTopicModal();
        }
      });
    }

    el.topicModalContent.querySelectorAll('[data-remove-index]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-remove-index'), 10);
        saveCurrentModalInputValues();
        state.tempReservationMembers.splice(idx, 1);
        renderTopicModal();
      });
    });

    el.topicModalContent.querySelectorAll('.member-school-select').forEach(sel => {
      sel.addEventListener('change', () => {
        saveCurrentModalInputValues();
        renderTopicModal();
      });
    });

    const form = document.getElementById('reservationForm');
    if (form) {
      form.addEventListener('submit', handleReservationSubmit);
    }
  }

  function saveCurrentModalInputValues() {
    state.tempReservationMembers.forEach((member, index) => {
      const nameInput = el.topicModalContent.querySelector(`.member-name-input[data-index="${index}"]`);
      const idInput = el.topicModalContent.querySelector(`.member-id-input[data-index="${index}"]`);
      const schoolSelect = el.topicModalContent.querySelector(`.member-school-select[data-index="${index}"]`);
      const groupInput = el.topicModalContent.querySelector(`.member-group-input[data-index="${index}"]`);

      if (nameInput) member.name = nameInput.value.trim();
      if (idInput) member.student_id = idInput.value.trim();
      if (schoolSelect) member.school_id = schoolSelect.value;
      if (groupInput) member.group = groupInput.value.trim();
    });
  }

  function handleReservationSubmit(e) {
    e.preventDefault();
    saveCurrentModalInputValues();

    const topic = state.activeReservationTopic;
    if (!topic) return;

    for (let i = 0; i < state.tempReservationMembers.length; i++) {
      const m = state.tempReservationMembers[i];
      if (!m.name || !m.student_id || !m.group) {
        showToast(`Заполните все обязательные поля для Студента ${i + 1}`);
        return;
      }
    }

    if (state.tempReservationMembers[0].school_id !== topic.school_id) {
      showToast(`Ошибка: Основной заявитель обязан быть из школы темы (${topic.school_id})`);
      return;
    }

    localStorage.setItem('aitu_student_name', state.tempReservationMembers[0].name);
    localStorage.setItem('aitu_student_id', state.tempReservationMembers[0].student_id);
    localStorage.setItem('aitu_student_group', state.tempReservationMembers[0].group);

    const requiredSchools = Array.from(new Set(state.tempReservationMembers.map(m => m.school_id)));
    const approvalsObj = {};
    requiredSchools.forEach(sch => { approvalsObj[sch] = 'pending'; });

    const newApplication = {
      id: `app-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      topic_id: topic.id,
      topic_title: topic.title,
      topic_school: topic.school_id,
      track: topic.track || 'IT',
      members: state.tempReservationMembers.map(m => ({ ...m })),
      required_approvals: requiredSchools,
      approvals: approvalsObj,
      status: 'pending_approval',
      reserved_at: new Date().toISOString()
    };

    state.applications.unshift(newApplication);
    saveApplications();

    closeTopicReservationModal();
    applyTopicFilters();
    showToast(`Тема ${topic.id} успешно зарезервирована за вашей командой!`);
    openApplicationsDrawer();
  }

  function saveApplications() {
    try {
      localStorage.setItem('aitu_topic_applications', JSON.stringify(state.applications));
      updateBadgeCounts();
      updateGlobalStats();
    } catch (e) {
      console.error('Error saving applications', e);
    }
  }

  // ==========================================================================
  // APPLICATIONS DRAWER & SIMULATION
  // ==========================================================================

  function openApplicationsDrawer() {
    renderApplicationsDrawer();
    el.applicationsDrawerBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeApplicationsDrawer() {
    el.applicationsDrawerBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderApplicationsDrawer() {
    if (!el.applicationsList) return;

    if (state.applications.length === 0) {
      el.applicationsList.innerHTML = `
        <div style="text-align: center; padding: 48px 16px; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">📋</div>
          <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 6px; color: var(--text-main);">Заявок пока нет</div>
          <div style="font-size: 0.88rem; line-height: 1.5;">
            Выберите тему в каталоге и нажмите «Подать заявку» или предложите свою тему через кнопку «Своя тема».
          </div>
        </div>
      `;
      return;
    }

    let html = '';
    state.applications.forEach(app => {
      const isPending = app.status === 'pending_approval';
      const isApproved = app.status === 'approved';

      let statusBadge = `<span class="status-badge status-pending">⏳ Согласование</span>`;
      if (isApproved) statusBadge = `<span class="status-badge status-approved">✅ Утверждена</span>`;
      else if (app.status === 'rejected' || app.status === 'cancelled') {
        statusBadge = `<span class="status-badge status-rejected">❌ ${app.status === 'cancelled' ? 'Отозвана' : 'Отклонена'}</span>`;
      }

      const membersRows = app.members.map((m, idx) => `
        <div class="app-member-row">
          <div>
            <strong>${idx === 0 ? '⭐' : '•'} ${escapeHtml(m.name)}</strong>
            <span style="color: var(--text-muted);"> (${escapeHtml(m.group)})</span>
          </div>
          <span class="topic-school-tag">${escapeHtml(m.school_id)}</span>
        </div>
      `).join('');

      let approvalsPillsHtml = '';
      let simulationButtonsHtml = '';

      app.required_approvals.forEach(schId => {
        const appState = app.approvals[schId] || 'pending';
        let pillClass = 'pipeline-pending';
        let pillText = `⏳ ${schId}: На рассмотрении`;

        if (appState === 'approved') {
          pillClass = 'pipeline-approved';
          pillText = `✅ ${schId}: Согласовано`;
        } else if (appState === 'rejected') {
          pillClass = 'pipeline-rejected';
          pillText = `❌ ${schId}: Отказ`;
        }

        approvalsPillsHtml += `<span class="pipeline-pill ${pillClass}">${escapeHtml(pillText)}</span>`;

        if (isPending && appState === 'pending') {
          simulationButtonsHtml += `
            <button class="btn btn-secondary btn-sim-school" data-app-id="${escapeHtml(app.id)}" data-school-id="${escapeHtml(schId)}" data-action="approved" style="font-size: 0.74rem; padding: 4px 8px;">
              ✓ Согласовать от ${escapeHtml(schId)}
            </button>
          `;
        }
      });

      const formattedDate = new Date(app.reserved_at).toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      html += `
        <div class="application-item" data-app-id="${escapeHtml(app.id)}">
          <div class="application-item-header">
            <div>
              <div class="application-title">${escapeHtml(app.topic_title)}</div>
              <div class="app-meta-line">
                Код: <strong>${escapeHtml(app.topic_id)}</strong> • Дата: ${formattedDate}
              </div>
            </div>
            <div>${statusBadge}</div>
          </div>

          <div class="app-members-block">
            <div style="font-weight: 700; margin-bottom: 6px; font-size: 0.76rem; text-transform: uppercase; color: var(--text-subtle);">
              Состав команды (${app.members.length} чел.):
            </div>
            ${membersRows}
          </div>

          <div class="app-approvals-pipeline">
            <h5>Согласования школ:</h5>
            <div class="pipeline-pills">
              ${approvalsPillsHtml}
            </div>
          </div>

          <div class="app-simulation-actions">
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-primary btn-print-application" data-app-id="${escapeHtml(app.id)}" style="font-size: 0.8rem; padding: 6px 12px;">
                📄 Официальный бланк AITU / PDF
              </button>
              ${isPending ? `
                <button class="btn btn-secondary btn-sim-all-schools" data-app-id="${escapeHtml(app.id)}" style="font-size: 0.78rem; padding: 6px 10px;">
                  ⚡ Согласовать всеми
                </button>
                <button class="btn btn-secondary btn-cancel-reservation" data-app-id="${escapeHtml(app.id)}" style="font-size: 0.78rem; color: #EF4444; border-color: rgba(239,68,68,0.3);">
                  Отозвать
                </button>
              ` : `
                <button class="btn btn-secondary btn-delete-app" data-app-id="${escapeHtml(app.id)}" style="font-size: 0.78rem; padding: 6px 10px;">
                  Удалить запись
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    });

    el.applicationsList.innerHTML = html;
    setupApplicationsEvents();
  }

  function setupApplicationsEvents() {
    el.applicationsList.querySelectorAll('.btn-sim-school').forEach(btn => {
      btn.addEventListener('click', () => {
        const appId = btn.getAttribute('data-app-id');
        const schoolId = btn.getAttribute('data-school-id');
        const action = btn.getAttribute('data-action');
        updateSchoolApproval(appId, schoolId, action);
      });
    });

    el.applicationsList.querySelectorAll('.btn-sim-all-schools').forEach(btn => {
      btn.addEventListener('click', () => {
        const appId = btn.getAttribute('data-app-id');
        approveAllSchools(appId);
      });
    });

    el.applicationsList.querySelectorAll('.btn-cancel-reservation').forEach(btn => {
      btn.addEventListener('click', () => {
        const appId = btn.getAttribute('data-app-id');
        cancelReservation(appId);
      });
    });

    el.applicationsList.querySelectorAll('.btn-delete-app').forEach(btn => {
      btn.addEventListener('click', () => {
        const appId = btn.getAttribute('data-app-id');
        deleteApplicationRecord(appId);
      });
    });

    el.applicationsList.querySelectorAll('.btn-print-application').forEach(btn => {
      btn.addEventListener('click', () => {
        const appId = btn.getAttribute('data-app-id');
        openPrintableSheet(appId);
      });
    });
  }

  function updateSchoolApproval(appId, schoolId, decision) {
    const app = state.applications.find(a => a.id === appId);
    if (!app) return;

    app.approvals[schoolId] = decision;

    if (decision === 'rejected') {
      app.status = 'rejected';
      showToast(`Школа ${schoolId} отклонила заявку. Тема освобождена.`);
    } else {
      const allApproved = app.required_approvals.every(s => app.approvals[s] === 'approved');
      if (allApproved) {
        app.status = 'approved';
        showToast(`🎉 Все участвующие школы согласовали проект! Статус: Утверждена.`);
      } else {
        showToast(`Школа ${schoolId} согласовала проект.`);
      }
    }

    saveApplications();
    applyTopicFilters();
    renderApplicationsDrawer();
  }

  function approveAllSchools(appId) {
    const app = state.applications.find(a => a.id === appId);
    if (!app) return;

    app.required_approvals.forEach(s => { app.approvals[s] = 'approved'; });
    app.status = 'approved';

    saveApplications();
    applyTopicFilters();
    renderApplicationsDrawer();
    showToast('🎉 Проект утвержден всеми участвующими школами AITU!');
  }

  function cancelReservation(appId) {
    const app = state.applications.find(a => a.id === appId);
    if (!app) return;

    app.status = 'cancelled';
    saveApplications();
    applyTopicFilters();
    renderApplicationsDrawer();
    showToast(`Бронь темы ${app.topic_id} отозвана.`);
  }

  function deleteApplicationRecord(appId) {
    state.applications = state.applications.filter(a => a.id !== appId);
    saveApplications();
    renderApplicationsDrawer();
    showToast('Запись заявки удалена');
  }

  // ==========================================================================
  // OFFICIAL PRINTABLE APPLICATION SHEET WITH QR CODE
  // ==========================================================================

  function openPrintableSheet(appId) {
    const app = state.applications.find(a => a.id === appId);
    if (!app) return;

    state.activePrintableApp = app;

    const qrSvg = generateSimpleQRSvg(`AITU-DIPLOMA-${app.id}-${app.topic_id}`);
    const membersHtml = app.members.map((m, idx) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td><strong>${escapeHtml(m.name)}</strong></td>
        <td>${escapeHtml(m.student_id)}</td>
        <td>${escapeHtml(m.school_id)}</td>
        <td>${escapeHtml(m.group)}</td>
        <td style="width: 120px;"></td>
      </tr>
    `).join('');

    const formattedDate = new Date(app.reserved_at).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    el.printableSheetContainer.innerHTML = `
      <div class="printable-sheet">
        <div class="printable-header">
          <div style="font-size: 0.85rem; font-weight: bold; letter-spacing: 0.05em; margin-bottom: 4px;">
            МИНИСТЕРСТВО ЦИФРОВОГО РАЗВИТИЯ, ИННОВАЦИЙ И АЭРОКОСМИЧЕСКОЙ ПРОМЫШЛЕННОСТИ РК
          </div>
          <div style="font-size: 1.15rem; font-weight: bold; margin-bottom: 8px;">
            ASTANA IT UNIVERSITY
          </div>
          <h2>ЛИСТ СОГЛАСОВАНИЯ И ЗАКРЕПЛЕНИЯ ТЕМЫ ДИПЛОМНОГО ПРОЕКТА</h2>
          <p>Академический год: 2025–2026 • Выпускающая школа: ${escapeHtml(app.topic_school)}</p>
        </div>

        <div style="margin-bottom: 18px; font-size: 0.95rem;">
          <p style="margin-bottom: 8px;">
            <strong>Тема дипломного проекта:</strong><br>
            <span style="font-size: 1.1rem; font-weight: bold; text-decoration: underline;">${escapeHtml(app.topic_title)}</span>
          </p>
          <p style="margin-bottom: 4px;"><strong>Регистрационный код:</strong> ${escapeHtml(app.topic_id)}</p>
          <p style="margin-bottom: 4px;"><strong>Направление / Специализация:</strong> ${escapeHtml(app.track || 'IT')}</p>
          <p><strong>Дата подачи заявления:</strong> ${formattedDate}</p>
        </div>

        <div style="margin-bottom: 16px;">
          <strong>Состав студенческой исследовательской группы:</strong>
          <table class="print-table">
            <thead>
              <tr>
                <th>№</th>
                <th>ФИО студента</th>
                <th>ID / Почта</th>
                <th>Школа</th>
                <th>Группа</th>
                <th>Личная подпись</th>
              </tr>
            </thead>
            <tbody>
              ${membersHtml}
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <strong>Согласование выпускающих школ и научного руководителя:</strong>
          <table class="print-table">
            <thead>
              <tr>
                <th>Орган согласования</th>
                <th>Статус решения</th>
                <th>ФИО ответственного лица</th>
                <th>Подпись / Дата</th>
              </tr>
            </thead>
            <tbody>
              ${app.required_approvals.map(sch => `
                <tr>
                  <td>Деканат школы <strong>${escapeHtml(sch)}</strong></td>
                  <td>${app.approvals[sch] === 'approved' ? '✅ СОГЛАСОВАНО' : '⏳ НА РАССМОТРЕНИИ'}</td>
                  <td>Декан / Зам. декана по академической работе</td>
                  <td>________________ / "___" _______ 2026 г.</td>
                </tr>
              `).join('')}
              <tr>
                <td>Научный руководитель</td>
                <td>Предварительно согласовано</td>
                <td>__________________________________</td>
                <td>________________ / "___" _______ 2026 г.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="print-stamp-box">
          <div style="font-size: 0.82rem; color: #475569; max-width: 460px;">
            Электронный документ зарегистрирован в единой базе распределения дипломных работ AITU.<br>
            Подлинность подтверждается цифровой подписью деканата и QR-верификацией.
          </div>
          <div style="text-align: center;">
            ${qrSvg}
            <div style="font-size: 0.7rem; font-family: monospace; margin-top: 2px;">${escapeHtml(app.id)}</div>
          </div>
        </div>
      </div>
    `;

    el.printableModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closePrintableSheet() {
    el.printableModalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  function generateSimpleQRSvg(text) {
    // Elegant SVG QR mock representation for print verification
    return `
      <svg width="68" height="68" viewBox="0 0 68 68" xmlns="http://www.w3.org/2000/svg">
        <rect width="68" height="68" fill="#FFFFFF"/>
        <!-- Corners -->
        <rect x="4" y="4" width="20" height="20" fill="#0F172A"/>
        <rect x="7" y="7" width="14" height="14" fill="#FFFFFF"/>
        <rect x="10" y="10" width="8" height="8" fill="#0F172A"/>
        
        <rect x="44" y="4" width="20" height="20" fill="#0F172A"/>
        <rect x="47" y="7" width="14" height="14" fill="#FFFFFF"/>
        <rect x="50" y="10" width="8" height="8" fill="#0F172A"/>

        <rect x="4" y="44" width="20" height="20" fill="#0F172A"/>
        <rect x="7" y="47" width="14" height="14" fill="#FFFFFF"/>
        <rect x="10" y="50" width="8" height="8" fill="#0F172A"/>

        <!-- Pattern blocks -->
        <rect x="28" y="8" width="8" height="8" fill="#0F172A"/>
        <rect x="28" y="24" width="12" height="6" fill="#0F172A"/>
        <rect x="8" y="28" width="6" height="12" fill="#0F172A"/>
        <rect x="44" y="28" width="8" height="8" fill="#0F172A"/>
        <rect x="30" y="40" width="8" height="8" fill="#0F172A"/>
        <rect x="44" y="44" width="10" height="6" fill="#0F172A"/>
        <rect x="56" y="54" width="8" height="8" fill="#0F172A"/>
      </svg>
    `;
  }

  // ==========================================================================
  // AI SMART MATCH ADVISOR
  // ==========================================================================

  function openAdvisorQuiz() {
    state.quiz.step = 1;
    state.quiz.school = state.schools[0] ? state.schools[0].id : 'SSE';
    state.quiz.interests = [];
    state.quiz.skills = [];
    state.quiz.format = 'team';
    state.quiz.level = 'any';

    renderAdvisorQuiz();
    el.advisorQuizModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeAdvisorQuiz() {
    el.advisorQuizModalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderAdvisorQuiz() {
    if (!el.advisorQuizContent) return;

    const step = state.quiz.step;

    let stepsIndicatorHtml = `
      <div class="quiz-steps-indicator">
        <div class="quiz-step-item ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}">
          <div class="quiz-step-dot">1</div>
          <span class="quiz-step-label">Школа</span>
        </div>
        <div class="quiz-step-item ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}">
          <div class="quiz-step-dot">2</div>
          <span class="quiz-step-label">Интересы</span>
        </div>
        <div class="quiz-step-item ${step === 3 ? 'active' : step > 3 ? 'completed' : ''}">
          <div class="quiz-step-dot">3</div>
          <span class="quiz-step-label">Стек & Формат</span>
        </div>
        <div class="quiz-step-item ${step === 4 ? 'active' : ''}">
          <div class="quiz-step-dot">4</div>
          <span class="quiz-step-label">Результат</span>
        </div>
      </div>
    `;

    let stepContentHtml = '';

    if (step === 1) {
      stepContentHtml = `
        <h3 style="font-family: var(--font-heading); font-size: 1.2rem; margin-bottom: 6px;">Шаг 1: Выберите вашу выпускающую школу</h3>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 20px;">
          Тема дипломного проекта основного заявителя привязывается к образовательной программе вашей школы.
        </p>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;">
          ${state.schools.map(sch => `
            <div class="quiz-card-option ${state.quiz.school === sch.id ? 'selected' : ''}" data-quiz-school="${escapeHtml(sch.id)}">
              <div style="font-size: 1.5rem;">🏛️</div>
              <div>
                <div style="font-weight: 750; font-size: 0.98rem; color: var(--text-main);">${escapeHtml(sch.id)} — ${escapeHtml(sch.name_ru || sch.name)}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                  Направления: ${(sch.tracks || []).join(', ')}
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="display: flex; justify-content: flex-end;">
          <button class="btn btn-primary" id="quizNextBtn1">Далее: Выбор интересов →</button>
        </div>
      `;
    } else if (step === 2) {
      const allInterests = [
        'AI & Machine Learning', 'Data Science & Big Data', 'Web & Backend',
        'Mobile Development', 'Cybersecurity & InfoSec', 'IoT & Embedded Systems',
        'Robotics & Automation', 'GameDev & Graphics', 'GovTech & Smart Governance',
        'Blockchain & Crypto', 'EdTech & Adaptive Learning', 'Computer Vision'
      ];

      stepContentHtml = `
        <h3 style="font-family: var(--font-heading); font-size: 1.2rem; margin-bottom: 6px;">Шаг 2: Какие направления вас вдохновляют?</h3>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 18px;">
          Выберите 1–3 ключевых направления для поиска наиболее релевантных тем и научных руководителей:
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px;">
          ${allInterests.map(interest => {
            const isSel = state.quiz.interests.includes(interest);
            return `
              <div class="quiz-card-option ${isSel ? 'selected' : ''}" data-quiz-interest="${escapeHtml(interest)}">
                <input type="checkbox" ${isSel ? 'checked' : ''} style="margin-top: 3px; accent-color: var(--accent-primary);">
                <span style="font-weight: 600; font-size: 0.9rem;">${escapeHtml(interest)}</span>
              </div>
            `;
          }).join('')}
        </div>

        <div style="display: flex; justify-content: space-between;">
          <button class="btn btn-secondary" id="quizBackBtn">← Назад</button>
          <button class="btn btn-primary" id="quizNextBtn2">Далее: Стек и формат →</button>
        </div>
      `;
    } else if (step === 3) {
      const popularSkills = [
        'Python', 'PyTorch / TensorFlow', 'JavaScript / TypeScript', 'React / Next.js',
        'Go (Golang)', 'C++ / C#', 'Flutter', 'Docker / Kubernetes', 'PostgreSQL / SQL',
        'OpenCV / YOLO', 'ROS 2', 'Solidity', 'Linux / Security Auditing', 'Unity'
      ];

      stepContentHtml = `
        <h3 style="font-family: var(--font-heading); font-size: 1.2rem; margin-bottom: 6px;">Шаг 3: Предпочитаемый стек и формат работы</h3>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 18px;">
          Отметьте технологии, которыми вы владеете или планируете освоить в ходе диплома:
        </p>

        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
          ${popularSkills.map(sk => {
            const isSel = state.quiz.skills.includes(sk);
            return `
              <button type="button" class="pill-btn ${isSel ? 'active' : ''}" data-quiz-skill="${escapeHtml(sk)}">
                ${isSel ? '✓ ' : '+ '}${escapeHtml(sk)}
              </button>
            `;
          }).join('')}
        </div>

        <div style="margin-bottom: 24px;">
          <label class="form-label">Планируемый формат команды:</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="quiz-card-option ${state.quiz.format === 'team' ? 'selected' : ''}" data-quiz-format="team">
              <div>
                <strong>👥 Команда из 2–3 студентов</strong>
                <div style="font-size: 0.78rem; color: var(--text-muted);">Комплексный проект с распределением ролей</div>
              </div>
            </div>
            <div class="quiz-card-option ${state.quiz.format === 'solo' ? 'selected' : ''}" data-quiz-format="solo">
              <div>
                <strong>👤 Индивидуальный проект</strong>
                <div style="font-size: 0.78rem; color: var(--text-muted);">Самостоятельное исследование одного автора</div>
              </div>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between;">
          <button class="btn btn-secondary" id="quizBackBtn">← Назад</button>
          <button class="btn btn-primary" id="quizCalcBtn">✨ Рассчитать рекомендации →</button>
        </div>
      `;
    } else if (step === 4) {
      const recommendations = calculateAdvisorRecommendations();

      stepContentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 2.2rem; margin-bottom: 6px;">🎯</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800;">
            Персональные рекомендации AITU Advisor
          </h3>
          <p style="font-size: 0.88rem; color: var(--text-muted);">
            На основе школы <strong>${escapeHtml(state.quiz.school)}</strong>, выбранных направлений и вашего технологического стека:
          </p>
        </div>

        <div style="margin-bottom: 24px;">
          <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 750; margin-bottom: 12px; color: var(--accent-primary);">
            🔥 Топ рекомендованных тем дипломных проектов:
          </h4>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${recommendations.matchedTopics.slice(0, 3).map(rec => `
              <div class="topic-card" style="padding: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
                  <span class="match-score-pill">${rec.score}% Совпадение</span>
                  <span class="topic-school-tag">${escapeHtml(rec.topic.school_id)}</span>
                </div>
                <h4 style="font-weight: 750; font-size: 1rem; margin-bottom: 6px;">${escapeHtml(rec.topic.title)}</h4>
                <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 10px;">
                  ${escapeHtml(rec.reason)}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 0.76rem; font-family: var(--font-mono); color: var(--text-subtle);">${escapeHtml(rec.topic.id)}</span>
                  <button class="btn btn-primary btn-reserve-topic" data-topic-id="${escapeHtml(rec.topic.id)}" style="font-size: 0.8rem; padding: 6px 12px;">
                    Зарезервировать тему
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 750; margin-bottom: 12px; color: var(--accent-emerald);">
            👨‍🏫 Рекомендуемые научные руководители:
          </h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${recommendations.matchedProfs.slice(0, 3).map(rec => `
              <div class="bookmark-item" style="padding: 12px; background: var(--bg-input); border-radius: var(--radius-md); border: 1px solid var(--border-main);">
                <div>
                  <div style="font-weight: 750; font-size: 0.95rem;">${escapeHtml(rec.prof.name)}</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(rec.prof.degree || 'Преподаватель')} • ${escapeHtml(rec.prof.department || 'AITU')}</div>
                  <div style="font-size: 0.76rem; color: var(--accent-primary); margin-top: 2px;">
                    💡 ${escapeHtml(rec.reason)}
                  </div>
                </div>
                <button class="btn btn-secondary btn-quick-email" data-id="${rec.prof.id}" style="font-size: 0.78rem; padding: 6px 12px;">
                  Написать
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between;">
          <button class="btn btn-secondary" id="quizRestartBtn">🔄 Пройти заново</button>
          <button class="btn btn-secondary" id="quizCloseActionBtn">Закрыть</button>
        </div>
      `;
    }

    el.advisorQuizContent.innerHTML = stepsIndicatorHtml + stepContentHtml;
    setupAdvisorQuizEvents();
  }

  function setupAdvisorQuizEvents() {
    // School Select
    el.advisorQuizContent.querySelectorAll('[data-quiz-school]').forEach(elCard => {
      elCard.addEventListener('click', () => {
        state.quiz.school = elCard.getAttribute('data-quiz-school');
        renderAdvisorQuiz();
      });
    });

    // Interests Select
    el.advisorQuizContent.querySelectorAll('[data-quiz-interest]').forEach(elCard => {
      elCard.addEventListener('click', () => {
        const interest = elCard.getAttribute('data-quiz-interest');
        if (state.quiz.interests.includes(interest)) {
          state.quiz.interests = state.quiz.interests.filter(i => i !== interest);
        } else {
          state.quiz.interests.push(interest);
        }
        renderAdvisorQuiz();
      });
    });

    // Skills Select
    el.advisorQuizContent.querySelectorAll('[data-quiz-skill]').forEach(btn => {
      btn.addEventListener('click', () => {
        const sk = btn.getAttribute('data-quiz-skill');
        if (state.quiz.skills.includes(sk)) {
          state.quiz.skills = state.quiz.skills.filter(s => s !== sk);
        } else {
          state.quiz.skills.push(sk);
        }
        renderAdvisorQuiz();
      });
    });

    // Format Select
    el.advisorQuizContent.querySelectorAll('[data-quiz-format]').forEach(elCard => {
      elCard.addEventListener('click', () => {
        state.quiz.format = elCard.getAttribute('data-quiz-format');
        renderAdvisorQuiz();
      });
    });

    // Navigation buttons
    const n1 = document.getElementById('quizNextBtn1');
    if (n1) n1.addEventListener('click', () => { state.quiz.step = 2; renderAdvisorQuiz(); });

    const n2 = document.getElementById('quizNextBtn2');
    if (n2) n2.addEventListener('click', () => { state.quiz.step = 3; renderAdvisorQuiz(); });

    const calcBtn = document.getElementById('quizCalcBtn');
    if (calcBtn) calcBtn.addEventListener('click', () => { state.quiz.step = 4; renderAdvisorQuiz(); });

    const backBtn = document.getElementById('quizBackBtn');
    if (backBtn) backBtn.addEventListener('click', () => { state.quiz.step = Math.max(1, state.quiz.step - 1); renderAdvisorQuiz(); });

    const restartBtn = document.getElementById('quizRestartBtn');
    if (restartBtn) restartBtn.addEventListener('click', () => { state.quiz.step = 1; renderAdvisorQuiz(); });

    const closeBtn = document.getElementById('quizCloseActionBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeAdvisorQuiz);
  }

  function calculateAdvisorRecommendations() {
    const { school, interests, skills } = state.quiz;

    // Match Topics
    const matchedTopics = state.topics.map(topic => {
      let score = 50;
      let reasons = [];

      if (topic.school_id === school) {
        score += 30;
        reasons.push(`Прямое соответствие вашей выпускающей школе (${school})`);
      }

      if (interests.some(i => (topic.track || '').toLowerCase().includes(i.toLowerCase()))) {
        score += 20;
        reasons.push(`Соответствует выбранному направлению ${topic.track}`);
      }

      const techMatch = (topic.technologies || []).filter(t => 
        skills.some(s => t.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(t.toLowerCase()))
      );
      if (techMatch.length > 0) {
        score += Math.min(25, techMatch.length * 10);
        reasons.push(`Использует стек: ${techMatch.join(', ')}`);
      }

      const finalScore = Math.min(99, score);
      return {
        topic,
        score: finalScore,
        reason: reasons.join(' • ') || 'Рекомендовано на основе академического профиля'
      };
    }).sort((a, b) => b.score - a.score);

    // Match Professors
    const matchedProfs = state.professors.map(prof => {
      let score = 40;
      let reasons = [];

      const dirMatch = prof.directions.filter(d => interests.includes(d));
      if (dirMatch.length > 0) {
        score += dirMatch.length * 20;
        reasons.push(`Профильные направления: ${dirMatch.join(', ')}`);
      }

      if (prof.free_slots && prof.free_slots > 0) {
        score += 15;
        reasons.push(`Есть свободные места (${prof.free_slots})`);
      }

      return {
        prof,
        score: Math.min(98, score),
        reason: reasons.join(' • ') || 'Академический эксперт кафедры'
      };
    }).sort((a, b) => b.score - a.score);

    return { matchedTopics, matchedProfs };
  }

  // ==========================================================================
  // SIDE-BY-SIDE COMPARISON MATRIX
  // ==========================================================================

  function toggleTopicComparison(topicId) {
    if (state.comparedTopics.has(topicId)) {
      state.comparedTopics.delete(topicId);
      showToast('Тема удалена из сравнения');
    } else {
      if (state.comparedTopics.size >= 3) {
        showToast('Можно сравнивать не более 3 тем одновременно');
        return;
      }
      state.comparedTopics.add(topicId);
      showToast('Тема добавлена к сравнению (откройте меню "Сравнение")');
    }
    updateBadgeCounts();
    renderTopicsGrid();
  }

  function toggleProfComparison(profId) {
    if (state.comparedProfs.has(profId)) {
      state.comparedProfs.delete(profId);
      showToast('Руководитель удален из сравнения');
    } else {
      if (state.comparedProfs.size >= 3) {
        showToast('Можно сравнивать не более 3 руководителей одновременно');
        return;
      }
      state.comparedProfs.add(profId);
      showToast('Руководитель добавлен к сравнению');
    }
    updateBadgeCounts();
    renderProfessorsGrid();
  }

  function openCompareModal() {
    renderCompareModal();
    el.compareModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCompareModal() {
    el.compareModalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderCompareModal() {
    if (!el.compareModalContent) return;

    const topics = state.topics.filter(t => state.comparedTopics.has(t.id));
    const profs = state.professors.filter(p => state.comparedProfs.has(p.id));

    if (topics.length === 0 && profs.length === 0) {
      el.compareModalContent.innerHTML = `
        <div style="text-align: center; padding: 48px 16px; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">⚖️</div>
          <div style="font-weight: 750; font-size: 1.1rem; margin-bottom: 6px; color: var(--text-main);">Список сравнения пуст</div>
          <div style="font-size: 0.88rem;">
            Нажмите кнопку «⚖️ Сравнить» в любой карточке темы или руководителя, чтобы сопоставить их характеристики бок о бок.
          </div>
        </div>
      `;
      return;
    }

    let html = '';

    if (topics.length > 0) {
      html += `
        <div style="margin-bottom: 32px;">
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; margin-bottom: 14px; color: var(--accent-primary);">
            Сравнение тем дипломных проектов (${topics.length}/3)
          </h3>
          <div style="display: grid; grid-template-columns: repeat(${topics.length}, 1fr); gap: 16px; overflow-x: auto;">
            ${topics.map(t => `
              <div class="topic-card" style="padding: 18px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span class="topic-school-tag">${escapeHtml(t.school_id)}</span>
                  <button class="btn btn-secondary btn-remove-compare-topic" data-topic-id="${escapeHtml(t.id)}" style="font-size: 0.72rem; padding: 2px 6px;">✕ Убрать</button>
                </div>
                <h4 style="font-weight: 800; font-size: 0.98rem; margin-bottom: 10px;">${escapeHtml(t.title)}</h4>
                
                <div class="topic-meta-box" style="margin-bottom: 12px;">
                  <div class="topic-meta-row"><span>Направление:</span> <strong>${escapeHtml(t.track || '-')}</strong></div>
                  <div class="topic-meta-row"><span>Сложность:</span> <strong>${escapeHtml(t.difficulty || '-')}</strong></div>
                  <div class="topic-meta-row"><span>Язык:</span> <strong>${escapeHtml(t.language || 'RU')}</strong></div>
                  <div class="topic-meta-row"><span>Команда:</span> <strong>до ${t.team_size_max || 3} чел.</strong></div>
                </div>

                <div style="font-size: 0.82rem; margin-bottom: 12px;">
                  <div style="font-weight: 700; color: var(--text-subtle); margin-bottom: 4px;">Стек:</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                    ${(t.technologies || []).map(sk => `<span class="tech-pill">${escapeHtml(sk)}</span>`).join('')}
                  </div>
                </div>

                <button class="btn btn-primary btn-reserve-topic" data-topic-id="${escapeHtml(t.id)}" style="width: 100%; font-size: 0.84rem; padding: 8px;">
                  Зарезервировать тему
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (profs.length > 0) {
      html += `
        <div>
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; margin-bottom: 14px; color: var(--accent-emerald);">
            Сравнение научных руководителей (${profs.length}/3)
          </h3>
          <div style="display: grid; grid-template-columns: repeat(${profs.length}, 1fr); gap: 16px; overflow-x: auto;">
            ${profs.map(p => `
              <div class="prof-card" style="padding: 18px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                  <div class="prof-avatar" style="width: 44px; height: 44px; font-size: 1rem; background: ${p.avatar_bg || 'var(--accent-primary)'};">
                    ${escapeHtml(p.initials)}
                  </div>
                  <button class="btn btn-secondary btn-remove-compare-prof" data-prof-id="${p.id}" style="font-size: 0.72rem; padding: 2px 6px;">✕ Убрать</button>
                </div>
                <h4 style="font-weight: 800; font-size: 1rem; margin-bottom: 2px;">${escapeHtml(p.name)}</h4>
                <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 8px;">${escapeHtml(p.degree)}</div>

                <div class="topic-meta-box" style="margin-bottom: 12px;">
                  <div class="topic-meta-row"><span>Свободных мест:</span> <strong>${p.free_slots} из ${p.total_slots}</strong></div>
                  <div class="topic-meta-row"><span>Дисциплин:</span> <strong>${p.disciplines.length}</strong></div>
                  <div class="topic-meta-row"><span>Кафедра:</span> <strong>${escapeHtml(p.department)}</strong></div>
                </div>

                <div style="font-size: 0.8rem; margin-bottom: 12px;">
                  <div style="font-weight: 700; color: var(--text-subtle); margin-bottom: 4px;">Направления:</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                    ${p.directions.map(d => `<span class="tag-chip">${escapeHtml(d)}</span>`).join('')}
                  </div>
                </div>

                <button class="btn btn-primary btn-quick-email" data-id="${p.id}" style="width: 100%; font-size: 0.84rem; padding: 8px;">
                  Написать письмо
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    el.compareModalContent.innerHTML = html;

    // Events
    el.compareModalContent.querySelectorAll('.btn-remove-compare-topic').forEach(btn => {
      btn.addEventListener('click', () => {
        toggleTopicComparison(btn.getAttribute('data-topic-id'));
        renderCompareModal();
      });
    });

    el.compareModalContent.querySelectorAll('.btn-remove-compare-prof').forEach(btn => {
      btn.addEventListener('click', () => {
        toggleProfComparison(btn.getAttribute('data-prof-id'));
        renderCompareModal();
      });
    });
  }

  // ==========================================================================
  // THESIS ROADMAP & INTERACTIVE CHECKLIST
  // ==========================================================================

  function openRoadmapModal() {
    renderRoadmapModal();
    el.roadmapModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeRoadmapModal() {
    el.roadmapModalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderRoadmapModal() {
    if (!el.roadmapModalContent) return;

    const stages = [
      {
        id: 'stage1',
        title: 'Этап 1: Выбор темы и закрепление научного руководителя',
        period: 'Сентябрь – Октябрь 2025',
        desc: 'Определение научного фокуса, формирование команды (1–3 чел.) и утверждение технического задания (ТЗ) со школами AITU.',
        tasks: [
          { id: 't1_1', text: 'Изучить каталог утвержденных тем и профили научных руководителей' },
          { id: 't1_2', text: 'Сформировать команду и согласовать роли участников проекта' },
          { id: 't1_3', text: 'Провести первичную консультацию с научруком и утвердить тему' },
          { id: 't1_4', text: 'Подать официальное заявление на закрепление темы в деканат' }
        ]
      },
      {
        id: 'stage2',
        title: 'Этап 2: Литературный обзор и Pre-defense (Предзащита ТЗ)',
        period: 'Ноябрь – Январь 2026',
        desc: 'Исследование существующих аналогов, построение системной архитектуры и презентация концепта комиссии.',
        tasks: [
          { id: 't2_1', text: 'Написать главу 1 (Аналитический обзор литературы и предметной области)' },
          { id: 't2_2', text: 'Разработать архитектурную схему (UML диаграммы, ERD базы данных)' },
          { id: 't2_3', text: 'Пройти зимнюю промежуточную предзащиту (Pre-defense 1)' }
        ]
      },
      {
        id: 'stage3',
        title: 'Этап 3: Практическая разработка, тестирование и эксперименты',
        period: 'Февраль – Апрель 2026',
        desc: 'Реализация программно-аппаратного MVP, сбор метрик, проведение стресс-тестов и подготовка пояснительной записки.',
        tasks: [
          { id: 't3_1', text: 'Завершить разработку основного функционала программного продукта / прототипа' },
          { id: 't3_2', text: 'Провести функциональное тестирование и зафиксировать бенчмарки' },
          { id: 't3_3', text: 'Подготовить пояснительную записку к дипломной работе по ГОСТу' }
        ]
      },
      {
        id: 'stage4',
        title: 'Этап 4: Нормоконтроль, Антиплагиат и Финальная Защита',
        period: 'Май – Июнь 2026',
        desc: 'Проверка на оригинальность (StrikePlagiarism), получение отзыва научрука и публичная защита перед ГАК.',
        tasks: [
          { id: 't4_1', text: 'Пройти университетский нормоконтроль оформления пояснительной записки' },
          { id: 't4_2', text: 'Пройти проверку на антиплагиат (порог оригинальности > 70%)' },
          { id: 't4_3', text: 'Получить официальный отзыв научного руководителя и внешнюю рецензию' },
          { id: 't4_4', text: 'Подготовить итоговую презентацию и защитить проект перед комиссией ГАК' }
        ]
      }
    ];

    let totalTasks = 0;
    let completedTasks = 0;
    stages.forEach(s => s.tasks.forEach(t => {
      totalTasks++;
      if (state.roadmapChecks[t.id]) completedTasks++;
    }));

    const progressPct = Math.round((completedTasks / totalTasks) * 100);

    let html = `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 0.92rem; font-weight: 700; color: var(--text-main);">Ваш прогресс по дипломному проекту:</span>
          <span style="font-weight: 800; font-family: var(--font-heading); color: var(--accent-emerald); font-size: 1.1rem;">${progressPct}%</span>
        </div>
        <div class="prof-slots-bar" style="height: 10px;">
          <div class="prof-slots-fill" style="width: ${progressPct}%; background: var(--gradient-emerald);"></div>
        </div>
      </div>

      <div class="roadmap-timeline">
        ${stages.map(stage => `
          <div class="roadmap-stage">
            <div class="roadmap-stage-node"></div>
            <div class="roadmap-card">
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--accent-primary); text-transform: uppercase; margin-bottom: 2px;">
                ${escapeHtml(stage.period)}
              </div>
              <h4>${escapeHtml(stage.title)}</h4>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 14px;">
                ${escapeHtml(stage.desc)}
              </p>

              <div style="display: flex; flex-direction: column; gap: 4px;">
                ${stage.tasks.map(t => {
                  const isChecked = !!state.roadmapChecks[t.id];
                  return `
                    <label class="checklist-item">
                      <input type="checkbox" data-task-id="${escapeHtml(t.id)}" ${isChecked ? 'checked' : ''}>
                      <span style="${isChecked ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${escapeHtml(t.text)}</span>
                    </label>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    el.roadmapModalContent.innerHTML = html;

    el.roadmapModalContent.querySelectorAll('[data-task-id]').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const tId = e.target.getAttribute('data-task-id');
        state.roadmapChecks[tId] = e.target.checked;
        localStorage.setItem('aitu_roadmap_checks', JSON.stringify(state.roadmapChecks));
        renderRoadmapModal();
      });
    });
  }

  // ==========================================================================
  // PROPOSE CUSTOM INITIATIVE TOPIC
  // ==========================================================================

  function openProposeTopicModal() {
    renderProposeTopicModal();
    el.proposeTopicModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeProposeTopicModal() {
    el.proposeTopicModalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderProposeTopicModal() {
    if (!el.proposeTopicContent) return;

    el.proposeTopicContent.innerHTML = `
      <form id="customTopicForm">
        <div class="reservation-rule-box">
          <strong>Подача инициативной темы / Стартап-проекта:</strong>
          <p style="margin-top: 4px;">
            Если у вас есть собственный проект, стартап или договоренность с IT-компанией, сформулируйте тему и цели. Заявка будет передана на согласование академическому совету вашей школы.
          </p>
        </div>

        <div class="form-group">
          <label class="form-label">Название инициативной темы *</label>
          <input type="text" id="customTopicTitle" class="form-control" placeholder="например: Разработка децентрализованного сервиса аренды..." required autocomplete="off">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Ваша выпускающая школа *</label>
            <select id="customTopicSchool" class="form-control" required>
              ${state.schools.map(sch => `<option value="${escapeHtml(sch.id)}">${escapeHtml(sch.id)} — ${escapeHtml(sch.name_ru || sch.name)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Основное IT-направление *</label>
            <select id="customTopicTrack" class="form-control" required>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="Web & Backend">Web & Backend</option>
              <option value="Cybersecurity & InfoSec">Cybersecurity & InfoSec</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="IoT & Embedded Systems">IoT & Embedded Systems</option>
              <option value="GameDev & Graphics">GameDev & Graphics</option>
              <option value="GovTech & Smart Governance">GovTech</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Описание проблемы и планируемое решение *</label>
          <textarea id="customTopicDesc" class="form-control" placeholder="Опишите актуальность проблемы, предлагаемую архитектуру решения и ожидаемый MVP..." required></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Используемый стек технологий (через запятую)</label>
          <input type="text" id="customTopicTech" class="form-control" placeholder="например: Python, FastAPI, React, PostgreSQL, Docker" autocomplete="off">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">ФИО заявителя (Капитана) *</label>
            <input type="text" id="customLeadName" class="form-control" placeholder="Иванов Иван" value="${escapeHtml(localStorage.getItem('aitu_student_name') || '')}" required autocomplete="off">
          </div>
          <div class="form-group">
            <label class="form-label">Группа заявителя *</label>
            <input type="text" id="customLeadGroup" class="form-control" placeholder="SE-2201" value="${escapeHtml(localStorage.getItem('aitu_student_group') || '')}" required autocomplete="off">
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--border-main); padding-top: 18px;">
          <button type="button" class="btn btn-secondary" id="cancelProposeBtn">Отмена</button>
          <button type="submit" class="btn btn-primary">Подать инициативную тему</button>
        </div>
      </form>
    `;

    const cancelBtn = document.getElementById('cancelProposeBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeProposeTopicModal);

    const form = document.getElementById('customTopicForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('customTopicTitle').value.trim();
        const school = document.getElementById('customTopicSchool').value;
        const track = document.getElementById('customTopicTrack').value;
        const desc = document.getElementById('customTopicDesc').value.trim();
        const techStr = document.getElementById('customTopicTech').value.trim();
        const leadName = document.getElementById('customLeadName').value.trim();
        const leadGroup = document.getElementById('customLeadGroup').value.trim();

        const techArr = techStr ? techStr.split(',').map(s => s.trim()).filter(Boolean) : [];
        const customId = `CUSTOM-${school}-${Date.now().toString(36).toUpperCase()}`;

        const newTopic = {
          id: customId,
          year: 2026,
          school_id: school,
          title: title,
          track: track,
          language: 'RU',
          team_size_max: 3,
          capacity: 1,
          difficulty: 'Средний',
          description: desc,
          technologies: techArr,
          expected_outcomes: 'Инициативный программный MVP / Исследовательский прототип'
        };

        state.topics.unshift(newTopic);

        const newApp = {
          id: `app-custom-${Date.now().toString(36)}`,
          topic_id: customId,
          topic_title: title,
          topic_school: school,
          track: track,
          members: [
            {
              student_id: localStorage.getItem('aitu_student_id') || 's1',
              name: leadName,
              school_id: school,
              group: leadGroup
            }
          ],
          required_approvals: [school],
          approvals: { [school]: 'pending' },
          status: 'pending_approval',
          reserved_at: new Date().toISOString()
        };

        state.applications.unshift(newApp);
        saveApplications();

        closeProposeTopicModal();
        applyTopicFilters();
        showToast('Инициативная тема зарегистрирована и отправлена на согласование!');
        openApplicationsDrawer();
      });
    }
  }

  // ==========================================================================
  // PROFESSOR MODAL & MULTI-TEMPLATE EMAIL COMPOSER
  // ==========================================================================

  function openProfessorModal(profId, openEmailDirectly = false) {
    const prof = state.professors.find(p => p.id === profId);
    if (!prof) return;

    state.activeProfessor = prof;
    const isBookmarked = state.bookmarks.has(prof.id);
    const isCompared = state.comparedProfs.has(prof.id);

    el.profModalContent.innerHTML = `
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div class="prof-avatar" style="width: 58px; height: 58px; font-size: 1.35rem; background: ${prof.avatar_bg || 'var(--accent-primary)'};">
            ${escapeHtml(prof.initials)}
          </div>
          <div>
            <h2 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; margin-bottom: 2px;">${escapeHtml(prof.name)}</h2>
            <div style="font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(prof.degree || 'Преподаватель')}</div>
            <div style="font-size: 0.8rem; color: var(--accent-primary); font-weight: 600;">${escapeHtml(prof.department || 'AITU')}</div>
          </div>
        </div>
        <button class="modal-close-btn" id="closeProfModalBtn">&times;</button>
      </div>

      <div class="modal-body">
        <div class="modal-section">
          <div class="modal-section-title">Биография и академический профиль</div>
          <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-muted);">
            ${escapeHtml(prof.bio || 'Ведет профильные курсы и руководит научно-исследовательскими дипломными проектами в AITU.')}
          </p>
        </div>

        <div class="modal-section">
          <div class="modal-section-title">Преподаваемые курсы (${prof.disciplines.length})</div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${prof.disciplines.map(d => `<span class="tag-chip" style="font-size: 0.8rem; padding: 4px 10px;">${escapeHtml(d)}</span>`).join('')}
          </div>
        </div>

        ${(prof.topics && prof.topics.length > 0) ? `
          <div class="modal-section">
            <div class="modal-section-title">Рекомендуемые темы дипломных исследований</div>
            <div>
              ${prof.topics.map(t => `
                <div class="topic-interactive-card">
                  <span class="topic-text">${escapeHtml(t)}</span>
                  <button class="btn btn-secondary btn-copy-topic" data-topic="${escapeHtml(t)}" style="font-size: 0.75rem; padding: 4px 8px;">Копировать</button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="modal-section application-section" id="profEmailSection">
          <div class="modal-section-title" style="color: var(--accent-primary);">
            ✉️ Генератор официального обращения к руководителю
          </div>
          <p style="font-size: 0.84rem; color: var(--text-muted); margin-bottom: 16px;">
            Выберите шаблон письма и язык. Текст автоматически адаптируется под ваше обращение:
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Тип обращения / Шаблон</label>
              <select id="emailTemplateType" class="form-control">
                <option value="academic">Академическое дипломное руководство</option>
                <option value="startup">Стартап / Индустриальный проект</option>
                <option value="research">R&D и научная публикация</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Язык письма</label>
              <select id="emailLanguageSelect" class="form-control">
                <option value="ru">Русский</option>
                <option value="en">English</option>
                <option value="kz">Қазақша</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Ваше ФИО</label>
              <input type="text" id="studentNameInput" class="form-control" placeholder="Иванов Иван" value="${escapeHtml(localStorage.getItem('aitu_student_name') || '')}">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Учебная группа</label>
              <input type="text" id="studentGroupInput" class="form-control" placeholder="SE-2201" value="${escapeHtml(localStorage.getItem('aitu_student_group') || '')}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Интересующая тема / Направление</label>
            <input type="text" id="customTopicInput" class="form-control" placeholder="Укажите тему или скопируйте одну из предложенных выше" value="${prof.topics && prof.topics[0] ? escapeHtml(prof.topics[0]) : ''}">
          </div>

          <div class="form-group">
            <label class="form-label">Сформированный текст письма</label>
            <textarea id="generatedEmailText" class="form-control" readonly style="min-height: 160px; font-family: inherit; font-size: 0.88rem;"></textarea>
          </div>

          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary" id="copyEmailBtn" style="flex: 1;">
              📋 Скопировать письмо
            </button>
            <a href="#" class="btn btn-secondary" id="openMailtoBtn" target="_blank" rel="noopener">
              ✉️ Открыть в почтовике
            </a>
            <button class="btn btn-secondary" id="toggleModalBookmarkBtn">
              ${isBookmarked ? '⭐ В избранном' : '⭐ Сохранить'}
            </button>
          </div>
        </div>
      </div>
    `;

    setupProfModalInnerEvents(prof);
    el.profModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (openEmailDirectly) {
      setTimeout(() => {
        const sec = document.getElementById('profEmailSection');
        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }

  function setupProfModalInnerEvents(prof) {
    const closeBtn = document.getElementById('closeProfModalBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeProfessorModal);

    el.profModalContent.querySelectorAll('.btn-copy-topic').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const topic = e.target.getAttribute('data-topic');
        navigator.clipboard.writeText(topic).then(() => {
          btn.textContent = '✓ Скопировано';
          setTimeout(() => { btn.textContent = 'Копировать'; }, 2000);
          showToast('Тема скопирована в буфер обмена');
          const tInput = document.getElementById('customTopicInput');
          if (tInput) {
            tInput.value = topic;
            updateEmailComposerText(prof);
          }
        });
      });
    });

    const studentName = document.getElementById('studentNameInput');
    const studentGroup = document.getElementById('studentGroupInput');
    const customTopicInput = document.getElementById('customTopicInput');
    const tType = document.getElementById('emailTemplateType');
    const tLang = document.getElementById('emailLanguageSelect');
    const copyEmailBtn = document.getElementById('copyEmailBtn');
    const toggleBookmarkBtn = document.getElementById('toggleModalBookmarkBtn');

    function sync() { updateEmailComposerText(prof); }

    if (studentName) studentName.addEventListener('input', sync);
    if (studentGroup) studentGroup.addEventListener('input', sync);
    if (customTopicInput) customTopicInput.addEventListener('input', sync);
    if (tType) tType.addEventListener('change', sync);
    if (tLang) tLang.addEventListener('change', sync);

    if (copyEmailBtn) {
      copyEmailBtn.addEventListener('click', () => {
        const ta = document.getElementById('generatedEmailText');
        if (ta) {
          navigator.clipboard.writeText(ta.value).then(() => {
            copyEmailBtn.textContent = '✓ Письмо скопировано';
            setTimeout(() => { copyEmailBtn.textContent = '📋 Скопировать письмо'; }, 2500);
            showToast('Текст письма скопирован в буфер обмена');
          });
        }
      });
    }

    if (toggleBookmarkBtn) {
      toggleBookmarkBtn.addEventListener('click', () => {
        toggleProfBookmark(prof.id);
        const isB = state.bookmarks.has(prof.id);
        toggleBookmarkBtn.textContent = isB ? '⭐ В избранном' : '⭐ Сохранить';
      });
    }

    updateEmailComposerText(prof);
  }

  function updateEmailComposerText(prof) {
    const studentName = (document.getElementById('studentNameInput') && document.getElementById('studentNameInput').value.trim()) || '[Ваше ФИО]';
    const studentGroup = (document.getElementById('studentGroupInput') && document.getElementById('studentGroupInput').value.trim()) || '[Ваша Группа]';
    const topic = (document.getElementById('customTopicInput') && document.getElementById('customTopicInput').value.trim()) || '[Интересующая тема]';
    const tType = (document.getElementById('emailTemplateType') && document.getElementById('emailTemplateType').value) || 'academic';
    const tLang = (document.getElementById('emailLanguageSelect') && document.getElementById('emailLanguageSelect').value) || 'ru';

    if (studentName && studentName !== '[Ваше ФИО]') localStorage.setItem('aitu_student_name', studentName);
    if (studentGroup && studentGroup !== '[Ваша Группа]') localStorage.setItem('aitu_student_group', studentGroup);

    let subject = '';
    let body = '';

    if (tLang === 'ru') {
      if (tType === 'startup') {
        subject = `Заявление на руководство стартап-проектом: ${studentName} (${studentGroup})`;
        body = `Здравствуйте, уважаемый(ая) ${prof.name}!

Меня зовут ${studentName}, студент(ка) группы ${studentGroup} Astana IT University.
Мы с командой разрабатываем стартап-проект на тему:
«${topic}»

Зная Вашу экспертную область и опыт в индустрии, мы были бы крайне признательны за возможность реализации данного проекта под Вашим научным руководством. MVP и технический стек готовы обсудить на встрече.

С уважением,
${studentName}
Группа: ${studentGroup}`;
      } else if (tType === 'research') {
        subject = `Научно-исследовательский дипломный проект: ${studentName} (${studentGroup})`;
        body = `Здравствуйте, уважаемый(ая) ${prof.name}!

Обращаюсь к Вам как к ведущему специалисту в области ${prof.directions.slice(0, 2).join(' и ')}.
Меня зовут ${studentName}, студент(ка) группы ${studentGroup}.

В рамках дипломной работы планирую провести исследование на тему:
«${topic}»
с перспективой подготовки статьи для индексируемой конференции/журнала.

Буду рад(а) встретиться и согласовать методологию и календарный план работы.

С уважением,
${studentName}`;
      } else {
        subject = `Заявление на дипломное руководство: ${studentName} (${studentGroup})`;
        body = `Здравствуйте, уважаемый(ая) ${prof.name}!

Меня зовут ${studentName}, студент(ка) группы ${studentGroup} Astana IT University.
Прошу рассмотреть возможность стать моим научным руководителем дипломного проекта по теме:
«${topic}»

Ознакомился(ась) с требованиями кафедры, базовый стек изучен. Готов(а) предоставить ссылки на портфолио/GitHub и обсудить детали.

С уважением,
${studentName}
Группа: ${studentGroup}`;
      }
    } else if (tLang === 'en') {
      subject = `Diploma Thesis Supervision Inquiry: ${studentName} (${studentGroup})`;
      body = `Dear ${prof.name},

My name is ${studentName}, and I am a final-year student at Astana IT University (Group ${studentGroup}).
I am writing to inquire if you have available capacity to supervise my diploma thesis project on:
"${topic}"

I have a solid foundation in the required technologies and am motivated to deliver high-quality results. I would greatly appreciate the opportunity to discuss the project scope with you.

Best regards,
${studentName}
Group: ${studentGroup}`;
    } else {
      subject = `Дипломдық жұмысқа жетекшілік ету туралы өтініш: ${studentName} (${studentGroup})`;
      body = `Құрметті ${prof.name}!

Менің атым ${studentName}, Astana IT University ${studentGroup} тобының студентімін.
Сіздің жетекшілігіңізбен келесі тақырып бойынша дипломдық жобаны орындауға ниеттімін:
«${topic}»

Жобаның мақсаты мен техникалық талаптарын өзіңізге ыңғайлы уақытта талқылауға дайынмын.

Құрметпен,
${studentName}
Тобы: ${studentGroup}`;
    }

    const emailTa = document.getElementById('generatedEmailText');
    if (emailTa) emailTa.value = body;

    const mailtoBtn = document.getElementById('openMailtoBtn');
    if (mailtoBtn) {
      const emailTarget = prof.email || 'advisor@astanait.edu.kz';
      mailtoBtn.href = `mailto:${emailTarget}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  }

  function closeProfessorModal() {
    el.profModalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
    state.activeProfessor = null;
  }

  function toggleProfBookmark(profId) {
    if (state.bookmarks.has(profId)) {
      state.bookmarks.delete(profId);
      showToast('Удалено из избранного');
    } else {
      state.bookmarks.add(profId);
      showToast('Добавлено в избранное');
    }
    localStorage.setItem('aitu_bookmarked_items', JSON.stringify(Array.from(state.bookmarks)));
    updateBadgeCounts();
    renderProfessorsGrid();
  }

  function toggleTopicBookmark(topicId) {
    if (state.bookmarks.has(topicId)) {
      state.bookmarks.delete(topicId);
      showToast('Тема удалена из избранного');
    } else {
      state.bookmarks.add(topicId);
      showToast('Тема добавлена в избранное');
    }
    localStorage.setItem('aitu_bookmarked_items', JSON.stringify(Array.from(state.bookmarks)));
    updateBadgeCounts();
    renderTopicsGrid();
  }

  // ==========================================================================
  // BOOKMARKS DRAWER
  // ==========================================================================

  function openBookmarksDrawer() {
    renderBookmarksDrawer();
    el.bookmarksDrawerBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeBookmarksDrawer() {
    el.bookmarksDrawerBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderBookmarksDrawer() {
    if (!el.bookmarksList) return;

    const bProfIds = Array.from(state.bookmarks);
    const savedProfs = state.professors.filter(p => bProfIds.includes(p.id));
    const savedTopics = state.topics.filter(t => bProfIds.includes(t.id));

    if (savedProfs.length === 0 && savedTopics.length === 0) {
      el.bookmarksList.innerHTML = `
        <div style="text-align: center; padding: 48px 16px; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">⭐</div>
          <div style="font-weight: 750; font-size: 1.1rem; margin-bottom: 6px; color: var(--text-main);">Избранное пусто</div>
          <div style="font-size: 0.88rem;">Нажмите на значок «☆» в карточке темы или преподавателя для добавления в закладки.</div>
        </div>
      `;
      return;
    }

    let html = '';

    if (savedTopics.length > 0) {
      html += `<div style="font-weight: 750; font-size: 0.84rem; text-transform: uppercase; color: var(--accent-primary); margin-bottom: 8px;">Сохраненные темы (${savedTopics.length}):</div>`;
      savedTopics.forEach(t => {
        html += `
          <div class="bookmark-item">
            <div style="min-width: 0; flex-grow: 1;">
              <div style="font-weight: 750; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(t.title)}</div>
              <div style="font-size: 0.76rem; color: var(--text-muted);">${escapeHtml(t.school_id)} • ${escapeHtml(t.id)}</div>
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-primary btn-reserve-topic" data-topic-id="${escapeHtml(t.id)}" style="font-size: 0.75rem; padding: 4px 8px;">Бронь</button>
              <button class="btn btn-secondary btn-remove-topic-bm" data-topic-id="${escapeHtml(t.id)}" style="font-size: 0.75rem; padding: 4px 8px;">✕</button>
            </div>
          </div>
        `;
      });
    }

    if (savedProfs.length > 0) {
      html += `<div style="font-weight: 750; font-size: 0.84rem; text-transform: uppercase; color: var(--accent-emerald); margin: 16px 0 8px;">Сохраненные руководители (${savedProfs.length}):</div>`;
      savedProfs.forEach(p => {
        html += `
          <div class="bookmark-item">
            <div style="min-width: 0; flex-grow: 1;">
              <div style="font-weight: 750; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(p.name)}</div>
              <div style="font-size: 0.76rem; color: var(--text-muted);">${escapeHtml(p.department)}</div>
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-secondary btn-view-prof" data-id="${p.id}" style="font-size: 0.75rem; padding: 4px 8px;">Открыть</button>
              <button class="btn btn-secondary btn-remove-prof-bm" data-prof-id="${p.id}" style="font-size: 0.75rem; padding: 4px 8px;">✕</button>
            </div>
          </div>
        `;
      });
    }

    el.bookmarksList.innerHTML = html;

    el.bookmarksList.querySelectorAll('.btn-remove-topic-bm').forEach(b => {
      b.addEventListener('click', () => { toggleTopicBookmark(b.getAttribute('data-topic-id')); renderBookmarksDrawer(); });
    });

    el.bookmarksList.querySelectorAll('.btn-remove-prof-bm').forEach(b => {
      b.addEventListener('click', () => { toggleProfBookmark(b.getAttribute('data-prof-id')); renderBookmarksDrawer(); });
    });
  }

  // ==========================================================================
  // COMMAND PALETTE (CTRL+K)
  // ==========================================================================

  function openCommandPalette() {
    if (!el.cmdPaletteBackdrop) return;
    el.cmdPaletteBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (el.cmdPaletteInput) {
      el.cmdPaletteInput.value = '';
      el.cmdPaletteInput.focus();
    }
    renderCommandPaletteResults('');
  }

  function closeCommandPalette() {
    if (!el.cmdPaletteBackdrop) return;
    el.cmdPaletteBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderCommandPaletteResults(query) {
    if (!el.cmdPaletteResults) return;

    const q = query.toLowerCase().trim();
    const actions = [
      { title: '✨ Запустить AI Advisor (Умный подбор темы)', action: () => { closeCommandPalette(); openAdvisorQuiz(); } },
      { title: '🗺️ Открыть дорожную карту и чек-лист дипломника', action: () => { closeCommandPalette(); openRoadmapModal(); } },
      { title: '💡 Предложить свою инициативную тему / Стартап', action: () => { closeCommandPalette(); openProposeTopicModal(); } },
      { title: '📋 Открыть мои дипломные заявки', action: () => { closeCommandPalette(); openApplicationsDrawer(); } },
      { title: '⭐ Открыть избранное (шортлист)', action: () => { closeCommandPalette(); openBookmarksDrawer(); } },
      { title: '🌓 Переключить тему (Светлая / Тёмная)', action: () => { closeCommandPalette(); applyTheme(state.theme === 'dark' ? 'light' : 'dark'); } }
    ];

    let filteredActions = actions;
    if (q) {
      filteredActions = actions.filter(a => a.title.toLowerCase().includes(q));
    }

    const matchedTopics = q ? state.topics.filter(t => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)).slice(0, 4) : [];
    const matchedProfs = q ? state.professors.filter(p => p.name.toLowerCase().includes(q)).slice(0, 4) : [];

    let html = '';

    if (filteredActions.length > 0) {
      html += `<div style="font-size: 0.72rem; font-weight: 700; color: var(--text-subtle); padding: 6px 14px; text-transform: uppercase;">Быстрые действия:</div>`;
      filteredActions.forEach((act, idx) => {
        html += `<div class="cmd-item" data-cmd-action-idx="${idx}">${escapeHtml(act.title)}</div>`;
      });
    }

    if (matchedTopics.length > 0) {
      html += `<div style="font-size: 0.72rem; font-weight: 700; color: var(--accent-primary); padding: 10px 14px 4px; text-transform: uppercase;">Темы дипломных проектов:</div>`;
      matchedTopics.forEach(t => {
        html += `
          <div class="cmd-item" data-cmd-topic-id="${escapeHtml(t.id)}">
            <span>📚 ${escapeHtml(t.title)}</span>
            <span class="topic-school-tag">${escapeHtml(t.school_id)}</span>
          </div>
        `;
      });
    }

    if (matchedProfs.length > 0) {
      html += `<div style="font-size: 0.72rem; font-weight: 700; color: var(--accent-emerald); padding: 10px 14px 4px; text-transform: uppercase;">Преподаватели:</div>`;
      matchedProfs.forEach(p => {
        html += `
          <div class="cmd-item" data-cmd-prof-id="${p.id}">
            <span>👨‍🏫 ${escapeHtml(p.name)}</span>
            <span style="font-size: 0.74rem; color: var(--text-muted);">${escapeHtml(p.department)}</span>
          </div>
        `;
      });
    }

    el.cmdPaletteResults.innerHTML = html || `<div style="padding: 20px; text-align: center; color: var(--text-muted);">Ничего не найдено</div>`;

    el.cmdPaletteResults.querySelectorAll('[data-cmd-action-idx]').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-cmd-action-idx'), 10);
        if (filteredActions[idx]) filteredActions[idx].action();
      });
    });

    el.cmdPaletteResults.querySelectorAll('[data-cmd-topic-id]').forEach(item => {
      item.addEventListener('click', () => {
        const tId = item.getAttribute('data-cmd-topic-id');
        closeCommandPalette();
        openTopicReservationModal(tId);
      });
    });

    el.cmdPaletteResults.querySelectorAll('[data-cmd-prof-id]').forEach(item => {
      item.addEventListener('click', () => {
        const pId = item.getAttribute('data-cmd-prof-id');
        closeCommandPalette();
        openProfessorModal(pId);
      });
    });
  }

  // ==========================================================================
  // TOAST NOTIFICATIONS & HELPERS
  // ==========================================================================

  function showToast(message) {
    if (!el.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>⚡</span> <span>${escapeHtml(message)}</span>`;
    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================================
  // GLOBAL EVENT LISTENERS
  // ==========================================================================

  function setupGlobalEventListeners() {
    // Theme Toggle
    if (el.themeToggleBtn) {
      el.themeToggleBtn.addEventListener('click', () => {
        applyTheme(state.theme === 'dark' ? 'light' : 'dark');
      });
    }

    // Catalog Tabs
    el.catalogTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const view = tab.getAttribute('data-catalog-view');
        switchCatalogView(view);
      });
    });

    function switchCatalogView(view) {
      state.currentView = view;
      el.catalogTabs.forEach(t => {
        const isActive = t.getAttribute('data-catalog-view') === view;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', isActive);
      });

      if (view === 'topics') {
        if (el.topicsView) el.topicsView.hidden = false;
        if (el.professorsView) el.professorsView.hidden = true;
      } else {
        if (el.topicsView) el.topicsView.hidden = true;
        if (el.professorsView) el.professorsView.hidden = false;
      }
    }

    // Topics Search & Filters
    let tDebounce;
    if (el.topicSearchInput) {
      el.topicSearchInput.addEventListener('input', (e) => {
        clearTimeout(tDebounce);
        state.topicSearchQuery = e.target.value;
        if (el.clearTopicSearchBtn) el.clearTopicSearchBtn.style.display = state.topicSearchQuery ? 'block' : 'none';
        tDebounce = setTimeout(applyTopicFilters, 120);
      });
    }

    if (el.clearTopicSearchBtn) {
      el.clearTopicSearchBtn.addEventListener('click', () => {
        state.topicSearchQuery = '';
        el.topicSearchInput.value = '';
        el.clearTopicSearchBtn.style.display = 'none';
        applyTopicFilters();
      });
    }

    if (el.topicSchoolFilter) el.topicSchoolFilter.addEventListener('change', (e) => { state.selectedTopicSchool = e.target.value; applyTopicFilters(); });
    if (el.topicTrackFilter) el.topicTrackFilter.addEventListener('change', (e) => { state.selectedTopicTrack = e.target.value; applyTopicFilters(); });
    if (el.topicDifficultyFilter) el.topicDifficultyFilter.addEventListener('change', (e) => { state.selectedTopicDifficulty = e.target.value; applyTopicFilters(); });
    if (el.topicLanguageFilter) el.topicLanguageFilter.addEventListener('change', (e) => { state.selectedTopicLanguage = e.target.value; applyTopicFilters(); });
    if (el.topicSortBySelect) el.topicSortBySelect.addEventListener('change', (e) => { state.selectedTopicSort = e.target.value; applyTopicFilters(); });
    if (el.availableTopicsOnly) el.availableTopicsOnly.addEventListener('change', (e) => { state.onlyAvailableTopics = e.target.checked; applyTopicFilters(); });

    // Grid Delegations
    if (el.topicsGrid) {
      el.topicsGrid.addEventListener('click', (e) => {
        const reserveBtn = e.target.closest('.btn-reserve-topic');
        if (reserveBtn) {
          openTopicReservationModal(reserveBtn.getAttribute('data-topic-id'));
          return;
        }

        const viewAppBtn = e.target.closest('.btn-view-app');
        if (viewAppBtn) {
          openApplicationsDrawer();
          return;
        }

        const compBtn = e.target.closest('.btn-toggle-compare-topic');
        if (compBtn) {
          toggleTopicComparison(compBtn.getAttribute('data-topic-id'));
          return;
        }

        const bmBtn = e.target.closest('.btn-toggle-bookmark-topic');
        if (bmBtn) {
          toggleTopicBookmark(bmBtn.getAttribute('data-topic-id'));
          return;
        }
      });
    }

    // Professors Search & Filters
    let pDebounce;
    if (el.profSearchInput) {
      el.profSearchInput.addEventListener('input', (e) => {
        clearTimeout(pDebounce);
        state.profSearchQuery = e.target.value;
        if (el.clearProfSearchBtn) el.clearProfSearchBtn.style.display = state.profSearchQuery ? 'block' : 'none';
        pDebounce = setTimeout(applyProfFilters, 120);
      });
    }

    if (el.clearProfSearchBtn) {
      el.clearProfSearchBtn.addEventListener('click', () => {
        state.profSearchQuery = '';
        el.profSearchInput.value = '';
        el.clearProfSearchBtn.style.display = 'none';
        applyProfFilters();
      });
    }

    if (el.directionPills) {
      el.directionPills.addEventListener('click', (e) => {
        const btn = e.target.closest('.pill-btn');
        if (!btn) return;
        el.directionPills.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedDirection = btn.dataset.direction;
        applyProfFilters();
      });
    }

    if (el.sortBySelect) {
      el.sortBySelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        sortFilteredProfessors();
        renderProfessorsGrid();
      });
    }

    if (el.freeSlotsOnlyProf) {
      el.freeSlotsOnlyProf.addEventListener('change', (e) => {
        state.freeSlotsOnly = e.target.checked;
        applyProfFilters();
      });
    }

    if (el.loadMoreBtn) {
      el.loadMoreBtn.addEventListener('click', () => {
        state.currentPage++;
        renderProfessorsGrid();
      });
    }

    if (el.professorsGrid) {
      el.professorsGrid.addEventListener('click', (e) => {
        const bmBtn = e.target.closest('.btn-toggle-bookmark-prof');
        if (bmBtn) {
          toggleProfBookmark(bmBtn.dataset.id);
          return;
        }

        const viewProfBtn = e.target.closest('.btn-view-prof');
        if (viewProfBtn) {
          openProfessorModal(viewProfBtn.dataset.id, false);
          return;
        }

        const compProfBtn = e.target.closest('.btn-toggle-compare-prof');
        if (compProfBtn) {
          toggleProfComparison(compProfBtn.dataset.id);
          return;
        }

        const quickEmailBtn = e.target.closest('.btn-quick-email');
        if (quickEmailBtn) {
          openProfessorModal(quickEmailBtn.dataset.id, true);
          return;
        }
      });
    }

    // Modal Triggers
    if (el.openAdvisorQuizBtn) el.openAdvisorQuizBtn.addEventListener('click', openAdvisorQuiz);
    if (el.heroStartQuizBtn) el.heroStartQuizBtn.addEventListener('click', openAdvisorQuiz);
    if (el.closeAdvisorQuizBtn) el.closeAdvisorQuizBtn.addEventListener('click', closeAdvisorQuiz);

    if (el.openRoadmapBtn) el.openRoadmapBtn.addEventListener('click', openRoadmapModal);
    if (el.closeRoadmapModalBtn) el.closeRoadmapModalBtn.addEventListener('click', closeRoadmapModal);

    const footerRoadmapLink = document.getElementById('footerRoadmapLink');
    if (footerRoadmapLink) footerRoadmapLink.addEventListener('click', (e) => { e.preventDefault(); openRoadmapModal(); });

    if (el.openProposeTopicBtn) el.openProposeTopicBtn.addEventListener('click', openProposeTopicModal);
    if (el.topicProposeBtnTop) el.topicProposeBtnTop.addEventListener('click', openProposeTopicModal);
    if (el.closeProposeTopicBtn) el.closeProposeTopicBtn.addEventListener('click', closeProposeTopicModal);

    if (el.openCompareBtn) el.openCompareBtn.addEventListener('click', openCompareModal);
    if (el.closeCompareModalBtn) el.closeCompareModalBtn.addEventListener('click', closeCompareModal);

    if (el.openBookmarksBtn) el.openBookmarksBtn.addEventListener('click', openBookmarksDrawer);
    if (el.closeBookmarksBtn) el.closeBookmarksBtn.addEventListener('click', closeBookmarksDrawer);

    if (el.openApplicationsBtn) el.openApplicationsBtn.addEventListener('click', openApplicationsDrawer);
    if (el.closeApplicationsBtn) el.closeApplicationsBtn.addEventListener('click', closeApplicationsDrawer);

    if (el.closePrintableModalBtn) el.closePrintableModalBtn.addEventListener('click', closePrintableSheet);
    if (el.printSheetActionBtn) el.printSheetActionBtn.addEventListener('click', () => window.print());

    if (el.heroOpenGuideBtn) el.heroOpenGuideBtn.addEventListener('click', () => {
      if (el.guideModalBackdrop) {
        el.guideModalBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });

    const footerGuideLink = document.getElementById('footerGuideLink');
    if (footerGuideLink) footerGuideLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (el.guideModalBackdrop) {
        el.guideModalBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });

    if (el.closeGuideBtn) {
      el.closeGuideBtn.addEventListener('click', () => {
        if (el.guideModalBackdrop) {
          el.guideModalBackdrop.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }

    // Command Palette
    if (el.openCmdPaletteBtn) el.openCmdPaletteBtn.addEventListener('click', openCommandPalette);
    if (el.cmdPaletteInput) {
      el.cmdPaletteInput.addEventListener('input', (e) => {
        renderCommandPaletteResults(e.target.value);
      });
    }

    // Keyboard Shortcuts (Ctrl+K, Cmd+K, Esc)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openCommandPalette();
      } else if (e.key === 'Escape') {
        closeCommandPalette();
        closeAdvisorQuiz();
        closeRoadmapModal();
        closeProposeTopicModal();
        closeCompareModal();
        closePrintableSheet();
        closeProfessorModal();
        closeTopicReservationModal();
        closeBookmarksDrawer();
        closeApplicationsDrawer();
        if (el.guideModalBackdrop) {
          el.guideModalBackdrop.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    });

    // Backdrop click dismiss
    [
      el.advisorQuizModalBackdrop,
      el.compareModalBackdrop,
      el.roadmapModalBackdrop,
      el.proposeTopicModalBackdrop,
      el.printableModalBackdrop,
      el.profModalBackdrop,
      el.topicModalBackdrop,
      el.guideModalBackdrop,
      el.bookmarksDrawerBackdrop,
      el.applicationsDrawerBackdrop,
      el.cmdPaletteBackdrop
    ].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
          }
        });
      }
    });
  }

  // Launch on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();
