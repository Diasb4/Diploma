/**
 * Diploma Supervisor Portal - Frontend Logic
 * Standalone SPA with client-side filtering, search, bookmarks & email generator
 */

(function () {
  'use strict';

  // State
  const state = {
    professors: [],
    stats: null,
    filtered: [],
    searchQuery: '',
    selectedDirection: 'ALL',
    selectedDepartment: 'ALL',
    onlyAvailable: false,
    sortBy: 'rating',
    currentPage: 1,
    pageSize: 24,
    bookmarks: new Set(),
    activeProfessor: null,
    theme: localStorage.getItem('aitu_theme') || 'dark'
  };

  // DOM Elements
  const el = {
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    directionPills: document.getElementById('directionPills'),
    deptFilter: document.getElementById('deptFilter'),
    availableOnlyToggle: document.getElementById('availableOnlyToggle'),
    sortBySelect: document.getElementById('sortBySelect'),
    professorsGrid: document.getElementById('professorsGrid'),
    resultsCount: document.getElementById('resultsCount'),
    loadMoreBtn: document.getElementById('loadMoreBtn'),
    paginationWrapper: document.getElementById('paginationWrapper'),
    
    // Stats
    statTotalProfs: document.getElementById('statTotalProfs'),
    statAvailableSlots: document.getElementById('statAvailableSlots'),
    statDepartments: document.getElementById('statDepartments'),
    statDirections: document.getElementById('statDirections'),

    // Modals & Drawers
    profModalBackdrop: document.getElementById('profModalBackdrop'),
    profModalContent: document.getElementById('profModalContent'),
    guideModalBackdrop: document.getElementById('guideModalBackdrop'),
    bookmarksDrawerBackdrop: document.getElementById('bookmarksDrawerBackdrop'),
    bookmarksList: document.getElementById('bookmarksList'),
    bookmarkCountBadges: document.querySelectorAll('.bookmark-count'),
    openBookmarksBtn: document.getElementById('openBookmarksBtn'),
    openGuideBtn: document.getElementById('openGuideBtn'),
    toastContainer: document.getElementById('toastContainer')
  };

  // Initialize
  async function init() {
    applyTheme(state.theme);
    loadBookmarks();
    setupEventListeners();
    await fetchData();
    renderDirectionPills();
    renderDepartmentOptions();
    renderStats();
    applyFilters();
  }

  // Apply Theme
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aitu_theme', theme);
    if (el.themeToggleBtn) {
      el.themeToggleBtn.textContent = theme === 'dark' ? 'Светлая тема' : 'Тёмная тема';
      el.themeToggleBtn.setAttribute('title', theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему');
    }
  }

  // Load Bookmarks from LocalStorage
  function loadBookmarks() {
    try {
      const saved = JSON.parse(localStorage.getItem('aitu_bookmarked_profs') || '[]');
      state.bookmarks = new Set(saved);
      updateBookmarkBadges();
    } catch (e) {
      state.bookmarks = new Set();
    }
  }

  function saveBookmarks() {
    try {
      localStorage.setItem('aitu_bookmarked_profs', JSON.stringify(Array.from(state.bookmarks)));
      updateBookmarkBadges();
    } catch (e) {
      console.error('Error saving bookmarks', e);
    }
  }

  function updateBookmarkBadges() {
    const count = state.bookmarks.size;
    el.bookmarkCountBadges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    });
  }

  // Fetch Professors and Stats
  async function fetchData() {
    try {
      const [profsRes, statsRes] = await Promise.all([
        fetch('data/professors.json'),
        fetch('data/stats.json')
      ]);

      if (profsRes.ok && statsRes.ok) {
        state.professors = await profsRes.json();
        state.stats = await statsRes.json();
      } else {
        throw new Error('Failed to fetch static JSON files');
      }
    } catch (err) {
      console.warn('Fallback: checking if data is embedded or using fallback', err);
      if (window.__EMBEDDED_PROFESSORS__) {
        state.professors = window.__EMBEDDED_PROFESSORS__;
        state.stats = window.__EMBEDDED_STATS__;
      }
    }
  }

  // Render Stats
  function renderStats() {
    if (!state.stats) return;
    if (el.statTotalProfs) el.statTotalProfs.textContent = state.stats.total_professors || state.professors.length;
    if (el.statAvailableSlots) el.statAvailableSlots.textContent = `${state.stats.available_slots} / ${state.stats.total_slots}`;
    if (el.statDepartments) el.statDepartments.textContent = state.stats.departments_count || '8';
    if (el.statDirections) el.statDirections.textContent = Object.keys(state.stats.directions_distribution || {}).length || '12';
  }

  // Render Direction Quick Filter Pills
  function renderDirectionPills() {
    if (!el.directionPills || !state.stats) return;

    const dirs = state.stats.directions_distribution || {};
    let html = `
      <button class="pill-btn active" data-direction="ALL">
        Все направления <span class="badge-count">${state.professors.length}</span>
      </button>
    `;

    const sortedDirs = Object.entries(dirs).sort((a, b) => b[1] - a[1]);
    for (const [dirName, count] of sortedDirs) {
      html += `
        <button class="pill-btn" data-direction="${escapeHtml(dirName)}">
          ${escapeHtml(dirName)} <span class="badge-count">${count}</span>
        </button>
      `;
    }

    el.directionPills.innerHTML = html;
  }

  // Render Department Dropdown Options
  function renderDepartmentOptions() {
    if (!el.deptFilter || !state.stats) return;

    const depts = state.stats.department_distribution || {};
    let html = `<option value="ALL">Все департаменты (${state.professors.length})</option>`;

    const sortedDepts = Object.entries(depts).sort((a, b) => b[1] - a[1]);
    for (const [deptName, count] of sortedDepts) {
      html += `<option value="${escapeHtml(deptName)}">${escapeHtml(deptName)} (${count})</option>`;
    }

    el.deptFilter.innerHTML = html;
  }

  // Filter & Search Logic
  function applyFilters() {
    const q = state.searchQuery.toLowerCase().trim();
    const dir = state.selectedDirection;
    const dept = state.selectedDepartment;
    const onlyAvail = state.onlyAvailable;

    state.filtered = state.professors.filter(p => {
      // Available slots filter
      if (onlyAvail && p.free_slots <= 0) return false;

      // Department filter
      if (dept !== 'ALL' && p.department !== dept) return false;

      // Direction filter
      if (dir !== 'ALL' && !p.directions.includes(dir)) return false;

      // Search Query filter (matches Name, Disciplines, Topics, Directions, Department, Bio)
      if (q) {
        const inName = p.name.toLowerCase().includes(q);
        const inDegree = p.degree.toLowerCase().includes(q);
        const inDept = p.department.toLowerCase().includes(q);
        const inDiscipline = p.disciplines.some(d => d.toLowerCase().includes(q));
        const inTopics = p.topics.some(t => t.toLowerCase().includes(q));
        const inDirections = p.directions.some(d => d.toLowerCase().includes(q));
        const inEmail = p.email.toLowerCase().includes(q);

        if (!inName && !inDegree && !inDept && !inDiscipline && !inTopics && !inDirections && !inEmail) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    sortFiltered();

    // Reset pagination to first page
    state.currentPage = 1;
    renderProfessorsGrid();
    updateResultsCount();
  }

  // Sort Filtered Array
  function sortFiltered() {
    switch (state.sortBy) {
      case 'rating':
        state.filtered.sort((a, b) => b.rating - a.rating || b.free_slots - a.free_slots);
        break;
      case 'name_asc':
        state.filtered.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
        break;
      case 'name_desc':
        state.filtered.sort((a, b) => b.name.localeCompare(a.name, 'ru'));
        break;
      case 'slots':
        state.filtered.sort((a, b) => b.free_slots - a.free_slots || b.rating - a.rating);
        break;
      case 'courses':
        state.filtered.sort((a, b) => b.disciplines.length - a.disciplines.length);
        break;
      default:
        break;
    }
  }

  // Render Grid of Professors
  function renderProfessorsGrid() {
    if (!el.professorsGrid) return;

    if (state.filtered.length === 0) {
      el.professorsGrid.innerHTML = `
        <div class="empty-state">
          <h3 class="empty-title">Преподаватели не найдены</h3>
          <p class="empty-desc">Попробуйте изменить поисковый запрос или сбросить активные фильтры.</p>
          <button class="btn btn-secondary" id="resetFiltersBtn">Сбросить все фильтры</button>
        </div>
      `;
      const resetBtn = document.getElementById('resetFiltersBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', resetAllFilters);
      }
      if (el.paginationWrapper) el.paginationWrapper.style.display = 'none';
      return;
    }

    const visibleItemsCount = state.currentPage * state.pageSize;
    const visibleProfs = state.filtered.slice(0, visibleItemsCount);

    let html = '';
    for (const p of visibleProfs) {
      const isBookmarked = state.bookmarks.has(p.id);
      const capacityStatusClass = p.free_slots > 2 ? 'status-available' : (p.free_slots > 0 ? 'status-limited' : 'status-full');
      const capacityStatusText = p.free_slots > 0 ? `Свободно ${p.free_slots} из ${p.total_slots} мест` : `Набор закрыт (${p.total_slots}/${p.total_slots})`;

      html += `
        <div class="prof-card" data-id="${p.id}">
          <div>
            <div class="card-header">
              <div class="prof-avatar">
                ${p.initials}
              </div>
              <div class="prof-meta">
                <h3 class="prof-name" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</h3>
                <div class="prof-degree">${escapeHtml(p.degree)}</div>
                <div class="prof-dept-tag" title="${escapeHtml(p.department)}">${escapeHtml(p.department)}</div>
              </div>
              <button class="btn-bookmark ${isBookmarked ? 'bookmarked' : ''}" data-bookmark-id="${p.id}" aria-pressed="${isBookmarked}" title="${isBookmarked ? 'Удалить из сохраненных' : 'Добавить в избранное'}">
                ${isBookmarked ? 'Сохранено' : 'Сохранить'}
              </button>
            </div>

            <div class="card-tags">
              ${p.directions.map(d => `<span class="tag-chip">${escapeHtml(d)}</span>`).join('')}
            </div>

            <div class="card-topics">
              <div class="topics-heading">Примерные темы дипломных проектов:</div>
              <ul class="topics-list">
                ${p.topics.slice(0, 2).map(t => `<li title="${escapeHtml(t)}">${escapeHtml(t)}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div>
            <div class="card-capacity ${capacityStatusClass}">
              <div class="capacity-text">
                <span class="status-dot"></span>
                <span>${capacityStatusText}</span>
              </div>
              <span class="capacity-badge">Рейтинг ${p.rating.toFixed(1)}</span>
            </div>

            <div class="card-actions">
              <button class="btn btn-secondary btn-view-prof" data-id="${p.id}">
                Подробнее о темах
              </button>
              <button class="btn btn-primary btn-quick-email" data-id="${p.id}" title="Связаться / Подать заявку">
                Подать заявку
              </button>
            </div>
          </div>
        </div>
      `;
    }

    el.professorsGrid.innerHTML = html;

    // Show/hide load more button
    if (el.paginationWrapper) {
      if (visibleItemsCount < state.filtered.length) {
        el.paginationWrapper.style.display = 'flex';
        if (el.loadMoreBtn) {
          el.loadMoreBtn.textContent = `Показать ещё (осталось ${state.filtered.length - visibleItemsCount})`;
        }
      } else {
        el.paginationWrapper.style.display = 'none';
      }
    }
  }

  // Update Results Count Label
  function updateResultsCount() {
    if (!el.resultsCount) return;
    el.resultsCount.innerHTML = `Найдено <strong>${state.filtered.length}</strong> руководителей`;
  }

  // Reset Filters
  function resetAllFilters() {
    state.searchQuery = '';
    state.selectedDirection = 'ALL';
    state.selectedDepartment = 'ALL';
    state.onlyAvailable = false;
    state.sortBy = 'rating';

    if (el.searchInput) el.searchInput.value = '';
    if (el.clearSearchBtn) el.clearSearchBtn.style.display = 'none';
    if (el.deptFilter) el.deptFilter.value = 'ALL';
    if (el.availableOnlyToggle) el.availableOnlyToggle.checked = false;
    if (el.sortBySelect) el.sortBySelect.value = 'rating';

    // Update active pill
    if (el.directionPills) {
      el.directionPills.querySelectorAll('.pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.direction === 'ALL');
      });
    }

    applyFilters();
    showToast('Фильтры успешно сброшены');
  }

  // Open Professor Profile Modal
  function openProfessorModal(profId, openEmailDirectly = false) {
    const prof = state.professors.find(p => p.id === profId);
    if (!prof) return;

    state.activeProfessor = prof;
    const isBookmarked = state.bookmarks.has(prof.id);
    const capacityStatusClass = prof.free_slots > 2 ? 'status-available' : (prof.free_slots > 0 ? 'status-limited' : 'status-full');
    const capacityStatusText = prof.free_slots > 0 ? `Свободно ${prof.free_slots} из ${prof.total_slots} мест` : `Набор закрыт (${prof.total_slots}/${prof.total_slots})`;

    const html = `
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div class="prof-avatar" style="width: 56px; height: 56px; font-size: 1.3rem;">
            ${prof.initials}
          </div>
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 2px;">${escapeHtml(prof.name)}</h2>
            <div style="font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(prof.degree)}</div>
            <div style="font-size: 0.78rem; color: var(--accent-blue);">${escapeHtml(prof.department)}</div>
          </div>
        </div>
        <button class="modal-close-btn" id="closeProfModalBtn">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Capacity & Status Banner -->
        <div class="card-capacity ${capacityStatusClass}" style="margin-bottom: 20px; padding: 12px 16px;">
          <div class="capacity-text">
            <span class="status-dot"></span>
            <span>${capacityStatusText}</span>
          </div>
          <div style="display: flex; gap: 12px; align-items: center;">
            <span style="font-size: 0.85rem; color: var(--text-muted);">Рейтинг: <strong>${prof.rating.toFixed(1)}</strong></span>
            <span style="font-size: 0.85rem; color: var(--text-muted);">Офис: <strong>${escapeHtml(prof.office)}</strong></span>
          </div>
        </div>

        <!-- Academic Bio -->
        <div class="modal-section">
          <div class="modal-section-title">Академический профиль и специализация</div>
          <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.6;">${escapeHtml(prof.bio)}</p>
        </div>

        <!-- Taught Disciplines -->
        <div class="modal-section">
          <div class="modal-section-title">Преподаваемые университетские курсы (${prof.disciplines.length})</div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${prof.disciplines.map(d => `<span class="tag-chip" style="font-size: 0.78rem; padding: 4px 10px;">${escapeHtml(d)}</span>`).join('')}
          </div>
        </div>

        <!-- Diploma Topics with 1-click copy -->
        <div class="modal-section">
          <div class="modal-section-title">Рекомендуемые темы дипломных проектов</div>
          <div>
            ${prof.topics.map(t => `
              <div class="topic-interactive-card">
                <span class="topic-text">${escapeHtml(t)}</span>
                <button class="btn-copy-topic" data-topic="${escapeHtml(t)}">Копировать</button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Requirements -->
        <div class="modal-section">
          <div class="modal-section-title">Требования к студенту-дипломнику</div>
          <ul style="padding-left: 20px; font-size: 0.88rem; color: var(--text-muted); line-height: 1.6;">
            ${prof.requirements.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
          </ul>
        </div>

        <!-- Interactive Email Generator Section -->
        <div class="modal-section application-section">
          <div class="modal-section-title" style="color: var(--accent-blue);">
            Генератор официального обращения к научному руководителю
          </div>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 16px;">
            Заполните ваши данные, выберите тему, и система автоматически сформирует корректное письмо для отправки на официальную почту <strong>${prof.email}</strong>.
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Ваше ФИО:</label>
              <input type="text" class="form-control" id="studentNameInput" placeholder="Иванов Арман Даниярович" value="${escapeHtml(localStorage.getItem('aitu_student_name') || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">Ваша учебная группа / Специальность:</label>
              <input type="text" class="form-control" id="studentGroupInput" placeholder="SE-2104 / Software Engineering" value="${escapeHtml(localStorage.getItem('aitu_student_group') || '')}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Выбранная тема диплома:</label>
            <select class="form-control" id="selectedTopicSelect">
              ${prof.topics.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('')}
              <option value="custom">-- Предложить собственную тему --</option>
            </select>
          </div>

          <div class="form-group" id="customTopicGroup" style="display: none;">
            <label class="form-label">Ваша тема дипломной работы:</label>
            <input type="text" class="form-control" id="customTopicInput" placeholder="Введите название вашей темы">
          </div>

          <div class="form-group">
            <label class="form-label">Текст готового письма (автоматически обновляется):</label>
            <textarea class="form-control" id="generatedEmailText" readonly></textarea>
          </div>

          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary" id="copyEmailBtn">Скопировать письмо</button>
            <a class="btn btn-secondary" id="openMailtoBtn" href="#" target="_blank">Открыть в почте</a>
            <button class="btn btn-secondary" id="toggleModalBookmarkBtn">
              ${isBookmarked ? 'В избранном' : 'Сохранить руководителя'}
            </button>
          </div>
        </div>
      </div>
    `;

    el.profModalContent.innerHTML = html;
    el.profModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Setup interactive events inside modal
    setupModalEvents(prof);

    if (openEmailDirectly) {
      const emailSection = el.profModalContent.querySelector('.modal-section:last-child');
      if (emailSection) {
        setTimeout(() => emailSection.scrollIntoView({ behavior: 'smooth' }), 200);
      }
    }
  }

  // Setup Modal Inner Event Handlers
  function setupModalEvents(prof) {
    const closeBtn = document.getElementById('closeProfModalBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeProfessorModal);
    }

    // Topic copy buttons
    el.profModalContent.querySelectorAll('.btn-copy-topic').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const topic = e.target.getAttribute('data-topic');
        navigator.clipboard.writeText(topic).then(() => {
          btn.textContent = 'Скопировано';
          setTimeout(() => { btn.textContent = 'Копировать'; }, 2000);
          showToast(`Тема скопирована в буфер обмена`);
        });
      });
    });

    // Email generator inputs
    const studentName = document.getElementById('studentNameInput');
    const studentGroup = document.getElementById('studentGroupInput');
    const topicSelect = document.getElementById('selectedTopicSelect');
    const customTopicGroup = document.getElementById('customTopicGroup');
    const customTopicInput = document.getElementById('customTopicInput');
    const emailTextarea = document.getElementById('generatedEmailText');
    const copyEmailBtn = document.getElementById('copyEmailBtn');
    const openMailtoBtn = document.getElementById('openMailtoBtn');
    const toggleBookmarkBtn = document.getElementById('toggleModalBookmarkBtn');

    function updateEmailText() {
      const sName = studentName.value.trim() || '[Ваше ФИО]';
      const sGroup = studentGroup.value.trim() || '[Ваша Группа]';
      let topic = topicSelect.value;
      if (topic === 'custom') {
        topic = customTopicInput.value.trim() || '[Ваша предлагаемая тема]';
      }

      // Save student credentials to localstorage for convenience
      if (studentName.value.trim()) localStorage.setItem('aitu_student_name', studentName.value.trim());
      if (studentGroup.value.trim()) localStorage.setItem('aitu_student_group', studentGroup.value.trim());

      const subject = `Заявление на дипломное руководство: ${sName} (${sGroup})`;
      const body = `Здравствуйте, уважаемый(ая) ${prof.name}!

Меня зовут ${sName}, я студент(ка) группы ${sGroup}. 

Обращаюсь к Вам с просьбой рассмотреть возможность стать моим научным руководителем дипломного проекта. 
В качестве приоритетной темы работы я хотел(а) бы исследовать направление:
«${topic}»

Я ознакомился(ась) с требованиями к дипломным проектам Вашего направления и обладаю необходимыми базовыми компетенциями. Буду признателен(на) за возможность обсудить детали исследования и план работы в удобное для Вас время (онлайн или на кафедре: ${prof.office}).

Резюме и ссылки на портфолио/GitHub готов(а) предоставить по первому требованию.

С уважением,
${sName}
Группа: ${sGroup}
Email: [Ваш студенческий email]`;

      emailTextarea.value = body;
      const mailtoUrl = `mailto:${prof.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      openMailtoBtn.setAttribute('href', mailtoUrl);
    }

    if (topicSelect) {
      topicSelect.addEventListener('change', () => {
        customTopicGroup.style.display = topicSelect.value === 'custom' ? 'block' : 'none';
        updateEmailText();
      });
    }

    if (studentName) studentName.addEventListener('input', updateEmailText);
    if (studentGroup) studentGroup.addEventListener('input', updateEmailText);
    if (customTopicInput) customTopicInput.addEventListener('input', updateEmailText);

    if (copyEmailBtn) {
      copyEmailBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(emailTextarea.value).then(() => {
          copyEmailBtn.textContent = 'Письмо скопировано';
          setTimeout(() => { copyEmailBtn.textContent = 'Скопировать письмо'; }, 2500);
          showToast('Текст официального письма скопирован!');
        });
      });
    }

    if (toggleBookmarkBtn) {
      toggleBookmarkBtn.addEventListener('click', () => {
        toggleBookmark(prof.id);
        const isBookmarked = state.bookmarks.has(prof.id);
        toggleBookmarkBtn.textContent = isBookmarked ? 'В избранном' : 'Сохранить руководителя';
      });
    }

    updateEmailText();
  }

  function closeProfessorModal() {
    el.profModalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
    state.activeProfessor = null;
  }

  // Toggle Bookmark
  function toggleBookmark(profId) {
    if (state.bookmarks.has(profId)) {
      state.bookmarks.delete(profId);
      showToast('Удалено из сохраненных');
    } else {
      state.bookmarks.add(profId);
      showToast('Добавлено в сохраненные');
    }
    saveBookmarks();
    renderProfessorsGrid();
    renderBookmarksDrawer();
  }

  // Render Bookmarks Drawer
  function renderBookmarksDrawer() {
    if (!el.bookmarksList) return;

    if (state.bookmarks.size === 0) {
      el.bookmarksList.innerHTML = `
        <div style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
          <div style="font-weight: 700; margin-bottom: 4px;">Список пуст</div>
          <div style="font-size: 0.85rem;">Нажмите «Сохранить» в карточке преподавателя, чтобы добавить его в список.</div>
        </div>
      `;
      return;
    }

    const bookmarkedProfs = state.professors.filter(p => state.bookmarks.has(p.id));
    let html = '';

    for (const p of bookmarkedProfs) {
      html += `
        <div class="bookmark-item">
          <div style="min-width: 0; flex-grow: 1;">
            <div style="font-weight: 700; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(p.name)}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(p.department)}</div>
            <div style="font-size: 0.76rem; color: ${p.free_slots > 0 ? 'var(--accent-blue)' : 'var(--text-subtle)'}; font-weight: 600;">
              ${p.free_slots > 0 ? `Свободно ${p.free_slots} из ${p.total_slots} мест` : 'Мест нет'}
            </div>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-secondary btn-view-prof" data-id="${p.id}" title="Открыть профиль">
              Открыть
            </button>
            <button class="btn btn-secondary" data-remove-bookmark="${p.id}" title="Удалить">
              Удалить
            </button>
          </div>
        </div>
      `;
    }

    el.bookmarksList.innerHTML = html;

    // Attach events inside drawer
    el.bookmarksList.querySelectorAll('[data-remove-bookmark]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-remove-bookmark');
        toggleBookmark(id);
      });
    });
  }

  // Toast Notification
  function showToast(message) {
    if (!el.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // Setup Main Event Listeners
  function setupEventListeners() {
    // Theme Toggle
    if (el.themeToggleBtn) {
      el.themeToggleBtn.addEventListener('click', () => {
        applyTheme(state.theme === 'dark' ? 'light' : 'dark');
      });
    }

    // Live Search with Debounce
    let debounceTimer;
    if (el.searchInput) {
      el.searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        state.searchQuery = e.target.value;
        if (el.clearSearchBtn) {
          el.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
        }
        debounceTimer = setTimeout(applyFilters, 180);
      });
    }

    if (el.clearSearchBtn) {
      el.clearSearchBtn.addEventListener('click', () => {
        state.searchQuery = '';
        el.searchInput.value = '';
        el.clearSearchBtn.style.display = 'none';
        applyFilters();
      });
    }

    // Direction Pills Filter
    if (el.directionPills) {
      el.directionPills.addEventListener('click', (e) => {
        const btn = e.target.closest('.pill-btn');
        if (!btn) return;

        el.directionPills.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        state.selectedDirection = btn.dataset.direction;
        applyFilters();
      });
    }

    // Department Filter
    if (el.deptFilter) {
      el.deptFilter.addEventListener('change', (e) => {
        state.selectedDepartment = e.target.value;
        applyFilters();
      });
    }

    // Available Slots Only Toggle
    if (el.availableOnlyToggle) {
      el.availableOnlyToggle.addEventListener('change', (e) => {
        state.onlyAvailable = e.target.checked;
        applyFilters();
      });
    }

    // Sort Select
    if (el.sortBySelect) {
      el.sortBySelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        sortFiltered();
        renderProfessorsGrid();
      });
    }

    // Load More / Pagination
    if (el.loadMoreBtn) {
      el.loadMoreBtn.addEventListener('click', () => {
        state.currentPage++;
        renderProfessorsGrid();
      });
    }

    // Grid Delegation for Card Actions
    if (el.professorsGrid) {
      el.professorsGrid.addEventListener('click', (e) => {
        const bookmarkBtn = e.target.closest('.btn-bookmark');
        if (bookmarkBtn) {
          const id = bookmarkBtn.dataset.bookmarkId;
          toggleBookmark(id);
          return;
        }

        const viewProfBtn = e.target.closest('.btn-view-prof');
        if (viewProfBtn) {
          const id = viewProfBtn.dataset.id;
          openProfessorModal(id, false);
          return;
        }

        const quickEmailBtn = e.target.closest('.btn-quick-email');
        if (quickEmailBtn) {
          const id = quickEmailBtn.dataset.id;
          openProfessorModal(id, true);
          return;
        }

        const card = e.target.closest('.prof-card');
        if (card && !e.target.closest('button')) {
          const id = card.dataset.id;
          openProfessorModal(id, false);
        }
      });
    }

    // Bookmarks Drawer
    if (el.openBookmarksBtn) {
      el.openBookmarksBtn.addEventListener('click', () => {
        renderBookmarksDrawer();
        el.bookmarksDrawerBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }

    const closeBookmarksBtn = document.getElementById('closeBookmarksBtn');
    if (closeBookmarksBtn) {
      closeBookmarksBtn.addEventListener('click', () => {
        el.bookmarksDrawerBackdrop.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    if (el.bookmarksDrawerBackdrop) {
      el.bookmarksDrawerBackdrop.addEventListener('click', (e) => {
        if (e.target === el.bookmarksDrawerBackdrop) {
          el.bookmarksDrawerBackdrop.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }

    // Guide Modal
    if (el.openGuideBtn) {
      el.openGuideBtn.addEventListener('click', () => {
        el.guideModalBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }

    const closeGuideBtn = document.getElementById('closeGuideBtn');
    if (closeGuideBtn) {
      closeGuideBtn.addEventListener('click', () => {
        el.guideModalBackdrop.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    if (el.guideModalBackdrop) {
      el.guideModalBackdrop.addEventListener('click', (e) => {
        if (e.target === el.guideModalBackdrop) {
          el.guideModalBackdrop.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }

    // Modal Backdrop Close
    if (el.profModalBackdrop) {
      el.profModalBackdrop.addEventListener('click', (e) => {
        if (e.target === el.profModalBackdrop) {
          closeProfessorModal();
        }
      });
    }

    // Keyboard ESC to close any modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (el.profModalBackdrop && el.profModalBackdrop.classList.contains('active')) closeProfessorModal();
        if (el.guideModalBackdrop && el.guideModalBackdrop.classList.contains('active')) {
          el.guideModalBackdrop.classList.remove('active');
          document.body.style.overflow = '';
        }
        if (el.bookmarksDrawerBackdrop && el.bookmarksDrawerBackdrop.classList.contains('active')) {
          el.bookmarksDrawerBackdrop.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    });
  }

  // Escape HTML helper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Start app on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', init);
})();
