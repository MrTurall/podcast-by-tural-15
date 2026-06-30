(() => {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  let lockedScrollY = 0;

  const ONE_FINCAN_CATEGORIES = [
    { id: 'Qidalanma', icon: '🍽️', title: 'Qidalanma', description: 'Səhər yeməyi, şəkər, fast food, süd məhsulları, şokolad və sağlam seçimlər.' },
    { id: 'Çəki idarəetməsi', icon: '⚖️', title: 'Çəki idarəetməsi', description: 'Arıqlamaq, kökəlmək, kalori balansı, porsiya və davamlı nəticələr.' },
    { id: 'İdman və hərəkət', icon: '🏃', title: 'İdman və hərəkət', description: 'Qaçış, gəzinti, məşq, tərləmə və gündəlik aktivlik seçimləri.' },
    { id: 'Enerji və bərpa', icon: '🌙', title: 'Enerji və bərpa', description: 'Yuxu, yorğunluq, kofein, hormonlar, stress və bədənin özünü toplaması.' },
    { id: 'Su və gündəlik içkilər', icon: '💧', title: 'Su və gündəlik içkilər', description: 'Su, qəhvə, enerji içkiləri, Coca-Cola və gündəlik içki vərdişləri.' },
    { id: 'Sağlamlıq mifləri', icon: '✦', title: 'Sağlamlıq mifləri', description: 'Detoks, möcüzəvi üsullar, yarımçıq məsləhətlər və şişirdilmiş sağlamlıq iddiaları.' }
  ];

  const GOALS = [
    { id: 'weight', title: 'Arıqlamaq istəyirəm', description: 'Çəki, kalori, porsiya, ofis qarını və davamlı nəticələr haqqında epizodlar.', cta: 'Arıqlama epizodları' },
    { id: 'nutrition', title: 'Sağlam qidalanmağa başlamaq istəyirəm', description: 'Gündəlik qidalanma, səhər yeməyi, şəkər, fast food və balanslı seçimlər.', cta: 'Qidalanma epizodları' },
    { id: 'energy', title: 'Daha enerjili olmaq istəyirəm', description: 'Yuxu, kofein, su, stress və gün boyu enerjini stabil saxlamaq.', cta: 'Enerji epizodları' },
    { id: 'sport', title: 'İdmanla bağlı qərarsızam', description: 'Qaçmaq, yerimək, məşqə başlamaq və bədəni hərəkətdə saxlamaq.', cta: 'İdman epizodları' },
    { id: 'drinks', title: 'Gündəlik içkiləri anlamaq istəyirəm', description: 'Su, qəhvə, enerji içkiləri, qazlı su və kofeinlə bağlı praktik izahlar.', cta: 'İçki epizodları' },
    { id: 'myths', title: 'Mifləri ayırd etmək istəyirəm', description: 'Detoks, limonlu su, şəkərsiz məhsullar və internetdə yayılan sağlamlıq iddiaları.', cta: 'Mif epizodları' }
  ];

  const isMobileMenu = () => window.innerWidth <= 760;
  const lockMenuScroll = () => {
    lockedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    body.dataset.navLocked = 'true';
    body.style.position = 'fixed';
    body.style.top = `-${lockedScrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
  };
  const unlockMenuScroll = () => {
    const restoreY = lockedScrollY || Math.abs(parseInt(body.style.top || '0', 10)) || 0;
    delete body.dataset.navLocked;
    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.right = '';
    body.style.width = '';
    window.scrollTo(0, restoreY);
  };
  const setMenuOpen = open => {
    const nextOpen = Boolean(open && isMobileMenu());
    if (nextOpen && body.dataset.navLocked !== 'true') lockMenuScroll();
    body.classList.toggle('nav-open', nextOpen);
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(nextOpen));
      toggle.setAttribute('aria-label', nextOpen ? 'Menyunu bağla' : 'Menyunu aç');
    }
    if (nav) {
      const hidden = isMobileMenu() && !nextOpen;
      nav.toggleAttribute('inert', hidden);
      nav.setAttribute('aria-hidden', String(hidden));
    }
    if (!nextOpen && body.dataset.navLocked === 'true') unlockMenuScroll();
  };
  const closeMenu = () => setMenuOpen(false);

  if (toggle && nav) {
    setMenuOpen(false);
    toggle.addEventListener('click', () => setMenuOpen(!body.classList.contains('nav-open')));
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && body.classList.contains('nav-open')) closeMenu();
    });
    document.addEventListener('click', event => {
      if (!isMobileMenu() || !body.classList.contains('nav-open')) return;
      if (event.target instanceof Element && (nav.contains(event.target) || toggle.contains(event.target))) return;
      closeMenu();
    });
    window.addEventListener('resize', () => setMenuOpen(isMobileMenu() && body.classList.contains('nav-open')));
  }

  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  let revealObserver = null;
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .1 });
  }

  const observeReveals = root => {
    (root || document).querySelectorAll('.reveal:not(.visible)').forEach(el => {
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add('visible');
    });
  };
  observeReveals(document);

  const escapeHtml = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const normalize = value => (value || '')
    .toLocaleLowerCase('az')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u');

  const SEARCH_SYNONYM_GROUPS = [
    ['kofein', 'kafein', 'qəhvə', 'qehve', 'coffee', 'espresso', 'çay', 'cay', 'enerji içkisi', 'enerji içkiləri', 'enerji ickisi', 'enerji ickileri', 'Su və gündəlik içkilər'],
    ['arıqlamaq', 'ariqlamaq', 'çəki', 'ceki', 'çəki atmaq', 'ceki atmaq', 'kilo', 'kilo vermək', 'kilo vermek', 'kalori', 'pəhriz', 'pehriz', 'diet', 'porsiya', 'ofis qarını', 'ofis qarini', 'Çəki idarəetməsi'],
    ['protein', 'zülal', 'zulal', 'protein tozu', 'əzələ', 'ezele'],
    ['idman', 'məşq', 'mesq', 'hərəkət', 'hereket', 'qaçış', 'qacis', 'yerimək', 'yerimek', 'İdman və hərəkət'],
    ['enerji', 'yorğunluq', 'yorgunluq', 'yuxu', 'bərpa', 'berpa', 'stress', 'hormon', 'Enerji və bərpa'],
    ['şəkər', 'seker', 'şokolad', 'sokolad', 'fast food', 'səhər yeməyi', 'seher yemeyi', 'qidalanma', 'Qidalanma'],
    ['detoks', 'limonlu su', 'mif', 'miflər', 'mifler', 'möcüzə', 'mocuze', 'Sağlamlıq mifləri']
  ];

  const normalizeSearchText = value => normalize(value)
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const expandedSearchTerms = value => {
    const phrase = normalizeSearchText(value);
    if (!phrase) return [];
    const queryParts = phrase.split(' ').filter(Boolean);
    const terms = new Set([phrase, ...queryParts]);
    SEARCH_SYNONYM_GROUPS
      .map(group => group.map(normalizeSearchText).filter(Boolean))
      .filter(group => group.some(alias => phrase.includes(alias) || queryParts.includes(alias) || alias.includes(phrase)))
      .forEach(group => group.forEach(alias => terms.add(alias)));
    return [...terms].filter(term => term.length > 1);
  };

  const episodeSearchText = episode => normalizeSearchText([
    displayTitle(episode.title),
    episode.summary,
    episode.category,
    tagList(episode.tags).join(' '),
    goalList(episode.goals).join(' '),
    episode.searchKeywords
  ].join(' '));

  const seriesName = series => series === 'ob' ? 'Ordan/Burdan' : '1 Fincan Qəhvə';
  const displayTitle = title => String(title || '').replace(/\s*[|—–-]\s*(1\s*Fincan\s*Qəhvə|1\s*Fincan\s*Qehve|Ordan\/Burdan)\s*$/i, '').trim();
  const formatDate = value => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return '';
    return new Intl.DateTimeFormat('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  };

  const cleanDuration = value => {
    if (!value) return '';
    if (/dəq|min/i.test(value)) return value.replace(/min/gi, 'dəq');
    if (/^\d+$/.test(value)) {
      const total = Number(value);
      return `${Math.max(1, Math.round(total / 60))} dəq`;
    }
    const parts = String(value).split(':').map(Number);
    if (parts.every(Number.isFinite)) {
      const minutes = parts.length === 3 ? parts[0] * 60 + parts[1] : parts[0];
      return `${Math.max(1, minutes)} dəq`;
    }
    return value;
  };

  const cleanEpisodePart = value => String(value ?? '').trim();
  const episodeNumberMeta = episode => {
    const season = cleanEpisodePart(episode.season);
    const number = cleanEpisodePart(episode.episode);
    if (!season && !number) return null;
    const label = [season ? `M${season}` : '', number ? `B${number}` : ''].filter(Boolean).join(' · ');
    const title = [season ? `Mövsüm ${season}` : '', number ? `Buraxılış ${number}` : ''].filter(Boolean).join(' · ');
    return { label, title };
  };

  const getEpisodesFallback = () => Array.isArray(window.PODCAST_EPISODES) ? window.PODCAST_EPISODES : [];
  const countBy = (episodes, predicate) => episodes.filter(predicate).length;
  const makeUrl = (path, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => { if (value) query.set(key, value); });
    const qs = query.toString();
    return `${path}${qs ? `?${qs}` : ''}`;
  };

  const tagList = tags => Array.isArray(tags) ? tags : [];
  const goalList = goals => Array.isArray(goals) ? goals : [];

  const makeEpisodeCard = (episode, index) => {
    const date = formatDate(episode.published);
    const duration = cleanDuration(episode.duration);
    const meta = [date, duration].filter(Boolean).join(' · ');
    const spotifyLabel = episode.spotifyDirect === false ? 'Spotify-da tap' : 'Spotify-da dinlə';
    const appleLabel = episode.appleDirect === false ? 'Apple Podcasts-da tap' : 'Apple Podcasts-da dinlə';
    const summary = episode.summary || 'Buraxılışın mövzusu və əsas fikirləri haqqında ətraflı məlumat dinləmə platformasında mövcuddur.';
    const numberMeta = episodeNumberMeta(episode);
    const tags = tagList(episode.tags).slice(0, 5).map(tag => `
      <a class="tag-chip" href="${escapeHtml(makeUrl('episodes.html', { tag }))}" data-tag-click="${escapeHtml(tag)}">${escapeHtml(tag)}</a>`).join('');
    const audio = episode.audioUrl ? `
      <div class="episode-audio">
        <audio controls preload="none" aria-label="${escapeHtml(episode.title)} audio pleyeri">
          <source src="${escapeHtml(episode.audioUrl)}" type="audio/mpeg">
        </audio>
      </div>` : '';

    return `
      <article class="episode-card episode-card-v3 reveal" data-episode-card data-show="${escapeHtml(episode.series || '1fq')}" data-index="${index}">
        <div class="episode-badge">
          <span>${escapeHtml(seriesName(episode.series))}</span>
          ${numberMeta ? `<span class="episode-number-meta" title="${escapeHtml(numberMeta.title)}">${escapeHtml(numberMeta.label)}</span>` : ''}
        </div>
        <h3>${escapeHtml(displayTitle(episode.title))}</h3>
        <p>${escapeHtml(summary)}</p>
        ${audio}
        ${tags ? `<div class="tag-row">${tags}</div>` : ''}
        <div class="episode-meta-row">
          <span>${escapeHtml(episode.category || 'Mövzu')}</span>
          ${meta ? `<span>${escapeHtml(meta)}</span>` : ''}
        </div>
        <div class="episode-platforms">
          <a href="${escapeHtml(episode.spotifyUrl)}" target="_blank" rel="noopener noreferrer" class="episode-platform spotify-link">${spotifyLabel}</a>
          <a href="${escapeHtml(episode.appleUrl)}" target="_blank" rel="noopener noreferrer" class="episode-platform apple-link">${appleLabel}</a>
          <a href="${escapeHtml(episode.linktreeUrl || 'https://linktr.ee/mr.turalll')}" target="_blank" rel="noopener noreferrer" class="episode-platform linktree-link">Digər platformalar</a>
        </div>
      </article>`;
  };

  const makeMiniEpisode = episode => {
    const numberMeta = episodeNumberMeta(episode);
    return `
    <article class="start-card reveal">
      <div class="episode-badge start-card-badge">
        <span>${escapeHtml(seriesName(episode.series))}</span>
        ${numberMeta ? `<span class="episode-number-meta" title="${escapeHtml(numberMeta.title)}">${escapeHtml(numberMeta.label)}</span>` : ''}
      </div>
      <span class="start-label">${escapeHtml(episode.category || seriesName(episode.series))}</span>
      <h3>${escapeHtml(displayTitle(episode.title))}</h3>
      <p>${escapeHtml(episode.summary || '')}</p>
      <div class="tag-row">${tagList(episode.tags).slice(0, 5).map(tag => `<span class="tag-chip tag-chip-static">${escapeHtml(tag)}</span>`).join('')}</div>
      <a class="text-link" href="${escapeHtml(episode.spotifyUrl || episode.appleUrl || 'episodes.html') }" rel="noopener noreferrer" target="_blank">Dinlə <span>↗</span></a>
    </article>`;
  };

  const renderSeriesBlocks = episodes => {
    const oneFincan = episodes.filter(e => e.series === '1fq');
    const goalGrid = document.querySelector('[data-goal-grid]');
    if (goalGrid) {
      goalGrid.innerHTML = GOALS.map((goal, idx) => {
        const count = countBy(oneFincan, e => goalList(e.goals).includes(goal.id));
        return `<a class="goal-card reveal delay-${idx % 3}" href="${escapeHtml(makeUrl('../episodes.html', { series: '1fq', goal: goal.id }))}">
          <span class="goal-count">${count || '—'} epizod</span>
          <h3>${escapeHtml(goal.title)}</h3>
          <p>${escapeHtml(goal.description)}</p>
          <strong>${escapeHtml(goal.cta)} <span>↗</span></strong>
        </a>`;
      }).join('');
      observeReveals(goalGrid);
    }

    const categoryGrid = document.querySelector('[data-onefincan-category-grid]');
    if (categoryGrid) {
      categoryGrid.innerHTML = ONE_FINCAN_CATEGORIES.map((cat, idx) => {
        const count = countBy(oneFincan, e => e.category === cat.id);
        return `<a class="category-card category-card-rich reveal delay-${idx % 3}" href="${escapeHtml(makeUrl('../episodes.html', { series: '1fq', category: cat.id }))}">
          <div class="category-card-top"><span>${escapeHtml(cat.icon)}</span><small>${count || 0} epizod</small></div>
          <h3>${escapeHtml(cat.title)}</h3>
          <p>${escapeHtml(cat.description)}</p>
          <strong>Epizodlara bax <span>↗</span></strong>
        </a>`;
      }).join('');
      observeReveals(categoryGrid);
    }

    const startGrid = document.querySelector('[data-start-grid]');
    if (startGrid) {
      const picked = oneFincan.filter(e => e.startHere).slice(0, 6);
      startGrid.innerHTML = picked.map(makeMiniEpisode).join('');
      observeReveals(startGrid);
    }

    const ordanGrid = document.querySelector('[data-ordan-start-grid]');
    if (ordanGrid) {
      const picked = episodes.filter(e => e.series === 'ob').slice(0, 4);
      ordanGrid.innerHTML = picked.map(makeMiniEpisode).join('');
      observeReveals(ordanGrid);
    }
  };

  const search = document.querySelector('[data-episode-search]');
  const filter = document.querySelector('[data-episode-filter]');
  const categoryFilter = document.querySelector('[data-episode-category-filter]');
  const sort = document.querySelector('[data-episode-sort]');
  const grid = document.querySelector('[data-episode-grid]');
  const empty = document.querySelector('[data-empty-state]');
  const count = document.querySelector('[data-episode-count]');
  const sourceNote = document.querySelector('[data-source-note]');
  const activeFilters = document.querySelector('[data-active-filters]');
  let allEpisodes = [];
  const getArchiveParams = () => new URLSearchParams(location.search);
  let activeTag = getArchiveParams().get('tag') || '';
  let activeGoal = getArchiveParams().get('goal') || '';

  const updateArchiveUrl = () => {
    if (!grid || !window.history?.replaceState) return;
    const params = new URLSearchParams();
    const query = search?.value?.trim();
    if (query) params.set('q', query);
    if (filter?.value && filter.value !== 'all') params.set('series', filter.value);
    if (categoryFilter?.value && categoryFilter.value !== 'all') params.set('category', categoryFilter.value);
    if (activeTag) params.set('tag', activeTag);
    if (activeGoal) params.set('goal', activeGoal);
    if (sort?.value && sort.value !== 'newest') params.set('sort', sort.value);
    const queryString = params.toString();
    const nextUrl = `${location.pathname}${queryString ? `?${queryString}` : ''}${location.hash}`;
    if (nextUrl !== `${location.pathname}${location.search}${location.hash}`) {
      history.replaceState(null, '', nextUrl);
    }
  };

  const renderActiveFilters = () => {
    if (!activeFilters) return;
    const chips = [];
    if (filter?.value && filter.value !== 'all') chips.push(['Seriya', seriesName(filter.value)]);
    if (categoryFilter?.value && categoryFilter.value !== 'all') chips.push(['Mövzu', categoryFilter.value]);
    if (activeTag) chips.push(['Tag', activeTag]);
    if (activeGoal) chips.push(['Başlamaq', GOALS.find(g => g.id === activeGoal)?.title || activeGoal]);
    activeFilters.innerHTML = chips.length ? `${chips.map(([k, v]) => `<button class="active-filter" type="button" data-clear-filter="${escapeHtml(k)}" aria-label="${escapeHtml(`${k} filtrini sil: ${v}`)}"><small>${escapeHtml(k)}</small>${escapeHtml(v)} ×</button>`).join('')}` : '';
  };

  const applyEpisodeFilters = () => {
    if (!grid) return;
    const searchTerms = expandedSearchTerms(search?.value);
    const selectedSeries = filter?.value || 'all';
    const selectedCategory = categoryFilter?.value || 'all';
    let filtered = allEpisodes.filter(episode => {
      const haystack = episodeSearchText(episode);
      const matchesTerm = !searchTerms.length || searchTerms.some(term => haystack.includes(term));
      const matchesSeries = selectedSeries === 'all' || episode.series === selectedSeries;
      const matchesCategory = selectedCategory === 'all' || episode.category === selectedCategory;
      const matchesTag = !activeTag || tagList(episode.tags).some(tag => normalize(tag) === normalize(activeTag));
      const matchesGoal = !activeGoal || goalList(episode.goals).includes(activeGoal);
      return matchesTerm && matchesSeries && matchesCategory && matchesTag && matchesGoal;
    });

    if ((sort?.value || 'newest') === 'oldest') filtered = [...filtered].reverse();
    grid.innerHTML = filtered.map(makeEpisodeCard).join('');
    if (count) count.textContent = `${filtered.length} buraxılış`;
    if (empty) empty.style.display = filtered.length ? 'none' : 'block';
    renderActiveFilters();
    updateArchiveUrl();
    observeReveals(grid);
  };

  const fillCategoryFilter = () => {
    if (!categoryFilter) return;
    const series = filter?.value || 'all';
    const categories = [...new Set(allEpisodes
      .filter(e => series === 'all' || e.series === series)
      .map(e => e.category)
      .filter(Boolean))];
    const preferred = series === '1fq' ? ONE_FINCAN_CATEGORIES.map(c => c.id) : [];
    categories.sort((a, b) => {
      const ai = preferred.indexOf(a);
      const bi = preferred.indexOf(b);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return a.localeCompare(b, 'az');
    });
    const current = categoryFilter.value;
    categoryFilter.innerHTML = `<option value="all">Bütün mövzular</option>` + categories.map(cat => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join('');
    if (categories.includes(current)) categoryFilter.value = current;
  };

  const loadEpisodes = async () => {
    let payload = null;
    if ((grid || document.querySelector('[data-goal-grid]')) && location.protocol !== 'file:') {
      try {
        const response = await fetch('/api/episodes', { headers: { Accept: 'application/json' } });
        if (response.ok) payload = await response.json();
      } catch (_) {
        payload = null;
      }
    }

    if (payload?.episodes?.length) {
      allEpisodes = payload.episodes;
      if (sourceNote) {
        sourceNote.textContent = payload.spotifyAutomaticMatching
          ? 'Buraxılış məlumatları Acast-dan, platforma keçidləri isə Spotify və Apple Podcasts-dan avtomatik yenilənir.'
          : 'Buraxılış məlumatları Acast-dan avtomatik yenilənir. Spotify keçidləri mövcud birbaşa keçid və ya dəqiq başlıq axtarışı ilə açılır.';
      }
    } else {
      allEpisodes = getEpisodesFallback();
      if (sourceNote) sourceNote.textContent = 'Hazırda saxlanmış arxiv göstərilir. Sayt yayımlandıqdan sonra məlumatlar Acast RSS vasitəsilə avtomatik yenilənəcək.';
    }

    renderSeriesBlocks(allEpisodes);
    if (!grid) return;
    const params = getArchiveParams();
    const requestedSearch = params.get('q');
    const requestedSeries = params.get('series');
    const requestedCategory = params.get('category');
    const requestedSort = params.get('sort');
    if (search && requestedSearch) search.value = requestedSearch;
    if (filter && ['1fq', 'ob'].includes(requestedSeries)) filter.value = requestedSeries;
    if (sort && ['newest', 'oldest'].includes(requestedSort)) sort.value = requestedSort;
    fillCategoryFilter();
    if (categoryFilter && requestedCategory && [...categoryFilter.options].some(option => option.value === requestedCategory)) {
      categoryFilter.value = requestedCategory;
    }
    applyEpisodeFilters();
  };

  search?.addEventListener('input', applyEpisodeFilters);
  filter?.addEventListener('change', () => { activeTag = ''; activeGoal = ''; if (categoryFilter) categoryFilter.value = 'all'; fillCategoryFilter(); applyEpisodeFilters(); });
  categoryFilter?.addEventListener('change', () => { activeTag = ''; activeGoal = ''; applyEpisodeFilters(); });
  sort?.addEventListener('change', applyEpisodeFilters);
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const tag = event.target.closest('[data-tag-click]');
    if (tag && grid) {
      event.preventDefault();
      activeTag = tag.getAttribute('data-tag-click') || '';
      activeGoal = '';
      applyEpisodeFilters();
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const clear = event.target.closest('[data-clear-filter]');
    if (clear) {
      const type = clear.getAttribute('data-clear-filter');
      if (type === 'Seriya' && filter) filter.value = 'all';
      if (type === 'Mövzu' && categoryFilter) categoryFilter.value = 'all';
      if (type === 'Tag') activeTag = '';
      if (type === 'Başlamaq') activeGoal = '';
      fillCategoryFilter();
      applyEpisodeFilters();
    }
  });
  loadEpisodes();

  const latestCard = document.querySelector('[data-latest-episode]');
  const renderLatest = episodes => {
    if (!latestCard || !episodes?.length) return;
    const episode = episodes[0];
    latestCard.querySelector('[data-latest-series]')?.replaceChildren(document.createTextNode(seriesName(episode.series)));
    latestCard.querySelector('[data-latest-title]')?.replaceChildren(document.createTextNode(displayTitle(episode.title)));
    latestCard.querySelector('[data-latest-summary]')?.replaceChildren(document.createTextNode(episode.summary || 'Ən yeni buraxılışı dinlə.'));
    const number = latestCard.querySelector('[data-latest-number]');
    const numberMeta = episodeNumberMeta(episode);
    if (number) {
      number.textContent = numberMeta?.label || '';
      if (numberMeta?.title) number.setAttribute('title', numberMeta.title);
      else number.removeAttribute('title');
    }
    const link = latestCard.querySelector('[data-latest-link]');
    if (link) link.href = episode.spotifyUrl || 'episodes.html';
  };

  if (latestCard) {
    const fallback = getEpisodesFallback();
    renderLatest(fallback);
    if (location.protocol !== 'file:') {
      fetch('/api/episodes').then(r => r.ok ? r.json() : null).then(data => renderLatest(data?.episodes)).catch(() => {});
    }
  }
})();

// Ordan/Burdan interactive topic selector
(() => {
  const content = {
    relation: {
      label: 'Münasibətlər',
      title: 'Niyə bəzi münasibətlər insanı böyüdür, bəziləri isə tükəndirir?',
      text: 'Bu xətt gələcəkdə sevgi, hörmət, bağlanma, məsafə, gözlənti və emosional yetkinlik kimi mövzular üçün əsas istiqamətlərdən biri olacaq.'
    },
    discipline: {
      label: 'İntizam',
      title: 'Motivasiya bitəndə insanı yolda saxlayan nədir?',
      text: 'Burada vərdiş, məsuliyyət, sistem qurmaq, uzunmüddətli düşünmək və özünə verdiyin sözləri tutmaq kimi mövzular açılacaq.'
    },
    behaviour: {
      label: 'İnsan davranışı',
      title: 'Niyə eyni səhvləri təkrar edirik?',
      text: 'Davranışların arxasında duran ehtiyacları, qorxuları, bəhanələri və görməməzliyə vurduğumuz siqnalları daha dürüst şəkildə düşünmək üçün.'
    },
    life: {
      label: 'Həyat ritmi',
      title: 'Ambisiya, yorğunluq və gündəlik həyat arasında balans necə qurulur?',
      text: 'İş, pul, böyümək, müqayisə, yorğunluq və insanın həyat tempini necə idarə etdiyi bu istiqamətin əsas suallarıdır.'
    }
  };
  const buttons = document.querySelectorAll('[data-ob-topic]');
  const focus = document.querySelector('[data-ob-focus]');
  if (!buttons.length || !focus) return;
  const escapeHtml = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  buttons.forEach(btn => btn.addEventListener('click', () => {
    buttons.forEach(item => item.classList.remove('is-active'));
    btn.classList.add('is-active');
    const item = content[btn.dataset.obTopic];
    if (!item) return;
    focus.innerHTML = `<span>${escapeHtml(item.label)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p>`;
  }));
})();
