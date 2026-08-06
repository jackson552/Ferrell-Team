/* ================================================
   K MOORE TEAM — Main JavaScript
   - Sticky header shadow
   - Mobile hamburger menu
   - Smooth anchor scrolling (with header offset)
   - Contact form validation + KW redirect
================================================ */

(function () {
  'use strict';

  /* ---- Element references ---- */
  const header     = document.getElementById('header');
  const hamburger  = document.getElementById('hamburger');
  const nav        = document.getElementById('nav');
  const form       = document.getElementById('contactForm');
  const formError  = document.getElementById('formError');
  const searchForm = document.getElementById('homeSearchForm');
  const imageBackedSections = document.querySelectorAll('.section--image-bg');
  const statsGroup = document.querySelector('.about__pillars');
  const statCounters = document.querySelectorAll('.stat-counter');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let statsHaveAnimated = false;

  /* ================================================
     STICKY HEADER — add shadow on scroll
  ================================================ */
  function handleHeaderScroll() {
    header.classList.toggle('scrolled', window.scrollY > 8);
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll(); // run once on load in case page is pre-scrolled

  if (imageBackedSections.length) {
    window.addEventListener('scroll', updateImageBackgroundShift, { passive: true });
    window.addEventListener('resize', updateImageBackgroundShift);
    updateImageBackgroundShift();
  }

  if (statCounters.length) {
    setupStatCounters();
  }

  /* ================================================
     HAMBURGER MENU
  ================================================ */
  function openNav() {
    nav.classList.add('is-open');
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  function closeNav() {
    nav.classList.remove('is-open');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    const isOpen = nav.classList.contains('is-open');
    isOpen ? closeNav() : openNav();
  });

  // Close when any nav link is clicked
  nav.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  // Close when clicking outside the nav or hamburger
  document.addEventListener('click', function (e) {
    if (
      nav.classList.contains('is-open') &&
      !nav.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeNav();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      closeNav();
      hamburger.focus();
    }
  });

  /* ================================================
     SMOOTH SCROLL — anchor links with header offset
  ================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const headerHeight = header ? header.offsetHeight : 0;
      const targetTop    = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });

  /* ================================================
     HOME SEARCH FORM — BUY/RENT toggle + KW redirect
  ================================================ */
  if (searchForm) {
    let searchType = 'buy';
    const toggleBtns = searchForm.querySelectorAll('.search-toggle__btn');
    const searchInput = document.getElementById('homeSearchInput');
    const autocomplete = document.getElementById('searchAutocomplete');
    const suggestionsPanel = document.getElementById('homeSearchSuggestions');
    const searchStatus = document.getElementById('searchStatus');
    const latitudeInput = document.getElementById('homeSearchLatitude');
    const longitudeInput = document.getElementById('homeSearchLongitude');
    const mapboxTokenMeta = document.querySelector('meta[name="mapbox-token"]');
    const mapboxToken = mapboxTokenMeta ? mapboxTokenMeta.content.trim() : '';
    const localLocations = [
      { label: 'West Chester, OH', type: 'Community', keywords: 'butler county west chester township 45069' },
      { label: 'Liberty Township, OH', type: 'Community', keywords: 'butler county liberty center 45044 45011' },
      { label: 'Mason, OH', type: 'Community', keywords: 'warren county 45040' },
      { label: 'Cincinnati, OH', type: 'Community', keywords: 'hamilton county greater cincinnati' },
      { label: 'Fairfield, OH', type: 'Community', keywords: 'butler county 45014' },
      { label: 'Hamilton, OH', type: 'Community', keywords: 'butler county 45011 45013' },
      { label: 'Blue Ash, OH', type: 'Community', keywords: 'hamilton county 45242' },
      { label: 'Loveland, OH', type: 'Community', keywords: 'hamilton clermont warren county 45140' },
      { label: 'Montgomery, OH', type: 'Community', keywords: 'hamilton county 45242' },
      { label: 'Sharonville, OH', type: 'Community', keywords: 'hamilton butler county 45241' },
      { label: 'Hyde Park, Cincinnati', type: 'Neighborhood', keywords: '45208 cincinnati' },
      { label: 'Oakley, Cincinnati', type: 'Neighborhood', keywords: '45209 cincinnati' },
      { label: 'Mount Adams, Cincinnati', type: 'Neighborhood', keywords: '45202 cincinnati' },
      { label: 'Over-the-Rhine, Cincinnati', type: 'Neighborhood', keywords: 'otr 45202 cincinnati' },
      { label: 'Downtown Cincinnati', type: 'Neighborhood', keywords: 'central business district 45202' },
      { label: 'Butler County, OH', type: 'County', keywords: 'west chester liberty fairfield hamilton' },
      { label: 'Warren County, OH', type: 'County', keywords: 'mason lebanon springboro' },
      { label: 'Hamilton County, OH', type: 'County', keywords: 'cincinnati blue ash montgomery' },
      { label: 'Lakota Local School District', type: 'School District', keywords: 'west chester liberty township' },
      { label: 'Mason City School District', type: 'School District', keywords: 'mason ohio' },
      { label: 'Fairfield City School District', type: 'School District', keywords: 'fairfield ohio' },
      { label: 'Hamilton City School District', type: 'School District', keywords: 'hamilton ohio' },
      { label: 'Sycamore Community School District', type: 'School District', keywords: 'blue ash montgomery cincinnati' },
      { label: '45069', type: 'ZIP Code', keywords: 'west chester ohio' },
      { label: '45040', type: 'ZIP Code', keywords: 'mason ohio' },
      { label: '45044', type: 'ZIP Code', keywords: 'liberty township middletown ohio' },
      { label: '45014', type: 'ZIP Code', keywords: 'fairfield ohio' },
      { label: '45208', type: 'ZIP Code', keywords: 'hyde park cincinnati ohio' }
    ];
    const groupOrder = ['Community', 'Neighborhood', 'County', 'School District', 'ZIP Code', 'Address'];
    let renderedSuggestions = [];
    let activeSuggestionIndex = -1;
    let debounceTimer;
    let requestController;
    let sessionToken = createSessionToken();

    toggleBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        toggleBtns.forEach(function (b) {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        this.classList.add('is-active');
        this.setAttribute('aria-pressed', 'true');
        searchType = this.dataset.type; // 'buy' or 'rent'
      });
    });

    searchInput.addEventListener('focus', function () {
      updateSuggestions(searchInput.value.trim());
    });

    searchInput.addEventListener('input', function () {
      latitudeInput.value = '';
      longitudeInput.value = '';
      window.clearTimeout(debounceTimer);
      updateSuggestions(searchInput.value.trim(), true);
    });

    searchInput.addEventListener('keydown', function (event) {
      if (suggestionsPanel.hidden || !renderedSuggestions.length) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveSuggestion((activeSuggestionIndex + 1) % renderedSuggestions.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveSuggestion(activeSuggestionIndex <= 0 ? renderedSuggestions.length - 1 : activeSuggestionIndex - 1);
      } else if (event.key === 'Enter' && activeSuggestionIndex >= 0) {
        event.preventDefault();
        chooseSuggestion(renderedSuggestions[activeSuggestionIndex]);
      } else if (event.key === 'Escape') {
        closeSuggestions();
      }
    });

    // Keep wheel and trackpad momentum inside the results panel. Without this,
    // reaching either edge can scroll the page and trigger the image parallax.
    suggestionsPanel.addEventListener('wheel', function (event) {
      if (suggestionsPanel.hidden) return;

      event.preventDefault();
      event.stopPropagation();
      if (suggestionsPanel.scrollHeight <= suggestionsPanel.clientHeight) return;
      const deltaMultiplier = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? suggestionsPanel.clientHeight : 1;
      suggestionsPanel.scrollTop += event.deltaY * deltaMultiplier;
    }, { passive: false });

    document.addEventListener('click', function (event) {
      if (!autocomplete.contains(event.target)) closeSuggestions();
    });

    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      closeSuggestions();
      const query = searchInput.value.trim();
      const searchPath = searchType === 'rent' ? 'rent' : 'sale';
      const redirectUrl = new URL(`https://kmooreteam.kw.com/search/${searchPath}`);
      if (query) {
        redirectUrl.searchParams.set('q', query);
      }
      window.location.href = redirectUrl.toString();
    });

    function updateSuggestions(query, allowRemote) {
      const localResults = findLocalLocations(query);
      renderSuggestions(localResults, false, query);

      if (!allowRemote || !mapboxToken || query.length < 3) {
        if (requestController) requestController.abort();
        autocomplete.classList.remove('is-loading');
        return;
      }
      autocomplete.classList.add('is-loading');
      debounceTimer = window.setTimeout(function () {
        fetchMapboxSuggestions(query, localResults);
      }, 250);
    }

    function findLocalLocations(query) {
      if (!query) return localLocations.slice(0, 6);
      const normalizedQuery = normalizeText(query);

      return localLocations
        .map(function (location) {
          const label = normalizeText(location.label);
          const searchable = label + ' ' + normalizeText(location.keywords);
          let score = 4;
          if (label === normalizedQuery) score = 0;
          else if (label.startsWith(normalizedQuery)) score = 1;
          else if (label.split(' ').some(function (word) { return word.startsWith(normalizedQuery); })) score = 2;
          else if (searchable.includes(normalizedQuery)) score = 3;
          return { location: location, score: score };
        })
        .filter(function (entry) { return entry.score < 4; })
        .sort(function (a, b) { return a.score - b.score || a.location.label.localeCompare(b.location.label); })
        .slice(0, 6)
        .map(function (entry) { return Object.assign({ source: 'local' }, entry.location); });
    }

    async function fetchMapboxSuggestions(query, localResults) {
      if (requestController) requestController.abort();
      requestController = new AbortController();

      const params = new URLSearchParams({
        q: query,
        access_token: mapboxToken,
        session_token: sessionToken,
        country: 'US',
        language: 'en',
        limit: '5',
        proximity: '-84.5167,39.1031',
        bbox: '-85.30,38.45,-83.45,40.35',
        types: 'address,street,postcode,place,locality,neighborhood,district'
      });

      try {
        const response = await fetch('https://api.mapbox.com/search/searchbox/v1/suggest?' + params.toString(), {
          signal: requestController.signal
        });
        if (!response.ok) throw new Error('Location service returned ' + response.status);
        const data = await response.json();
        if (searchInput.value.trim() !== query) return;

        const localLabels = new Set(localResults.map(function (item) { return normalizeText(item.label); }));
        const remoteResults = (data.suggestions || []).map(function (suggestion) {
          const label = suggestion.full_address || [suggestion.name, suggestion.place_formatted].filter(Boolean).join(', ');
          return {
            label: label,
            type: mapboxTypeLabel(suggestion.feature_type),
            meta: suggestion.place_formatted || 'Greater Cincinnati region',
            source: 'mapbox',
            mapboxId: suggestion.mapbox_id
          };
        }).filter(function (item) {
          return item.label && !localLabels.has(normalizeText(item.label));
        });

        renderSuggestions(localResults.concat(remoteResults), remoteResults.length > 0, query);
      } catch (error) {
        if (error.name !== 'AbortError') renderSuggestions(localResults, false, query);
      } finally {
        if (searchInput.value.trim() === query) autocomplete.classList.remove('is-loading');
      }
    }

    function renderSuggestions(items, hasMapboxResults, query) {
      renderedSuggestions = groupOrder.reduce(function (ordered, groupName) {
        return ordered.concat(items.filter(function (item) { return item.type === groupName; }));
      }, []);
      activeSuggestionIndex = -1;
      suggestionsPanel.textContent = '';
      searchInput.setAttribute('aria-activedescendant', '');

      if (!items.length) {
        const empty = document.createElement('p');
        empty.className = 'search-suggestions__empty';
        empty.textContent = mapboxToken && query.length >= 3 ? 'No matching locations found. You can still search using the text you entered.' : 'Keep typing, or search using the location you entered.';
        suggestionsPanel.appendChild(empty);
      } else {
        groupOrder.forEach(function (groupName) {
          const groupItems = renderedSuggestions.filter(function (item) { return item.type === groupName; });
          if (!groupItems.length) return;

          const group = document.createElement('div');
          group.className = 'search-suggestions__group';
          const heading = document.createElement('p');
          heading.className = 'search-suggestions__heading';
          const groupLabels = { 'Community': 'Communities', 'Neighborhood': 'Neighborhoods', 'County': 'Counties', 'School District': 'School Districts', 'ZIP Code': 'ZIP Codes', 'Address': 'Addresses & Places' };
          heading.textContent = groupLabels[groupName];
          group.appendChild(heading);

          groupItems.forEach(function (item) {
            const index = renderedSuggestions.indexOf(item);
            const option = document.createElement('button');
            option.type = 'button';
            option.className = 'search-suggestion';
            option.id = 'search-suggestion-' + index;
            option.setAttribute('role', 'option');
            option.setAttribute('aria-selected', 'false');
            option.dataset.index = String(index);

            const icon = document.createElement('span');
            icon.className = 'search-suggestion__icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = suggestionIcon(item.type);
            const copy = document.createElement('span');
            copy.className = 'search-suggestion__copy';
            const label = document.createElement('span');
            label.className = 'search-suggestion__label';
            label.textContent = item.label;
            const meta = document.createElement('span');
            meta.className = 'search-suggestion__meta';
            meta.textContent = item.source === 'mapbox' ? item.meta : localMeta(item.type);
            copy.append(label, meta);
            option.append(icon, copy);
            option.addEventListener('mousedown', function (event) { event.preventDefault(); });
            option.addEventListener('click', function () { chooseSuggestion(item); });
            option.addEventListener('mousemove', function () { setActiveSuggestion(index); });
            group.appendChild(option);
          });
          suggestionsPanel.appendChild(group);
        });
      }

      if (hasMapboxResults) {
        const credit = document.createElement('p');
        credit.className = 'search-suggestions__credit';
        credit.textContent = 'Address results © Mapbox';
        suggestionsPanel.appendChild(credit);
      }

      suggestionsPanel.hidden = false;
      searchInput.setAttribute('aria-expanded', 'true');
      searchStatus.textContent = items.length ? items.length + ' location suggestions available.' : 'No location suggestions found.';
    }

    function setActiveSuggestion(index) {
      activeSuggestionIndex = index;
      suggestionsPanel.querySelectorAll('.search-suggestion').forEach(function (option) {
        const isActive = Number(option.dataset.index) === index;
        option.classList.toggle('is-active', isActive);
        option.setAttribute('aria-selected', String(isActive));
        if (isActive) keepOptionInsidePanel(option);
      });
      searchInput.setAttribute('aria-activedescendant', 'search-suggestion-' + index);
    }

    function keepOptionInsidePanel(option) {
      const optionTop = option.offsetTop;
      const optionBottom = optionTop + option.offsetHeight;
      const visibleTop = suggestionsPanel.scrollTop;
      const visibleBottom = visibleTop + suggestionsPanel.clientHeight;

      if (optionTop < visibleTop) {
        suggestionsPanel.scrollTop = optionTop;
      } else if (optionBottom > visibleBottom) {
        suggestionsPanel.scrollTop = optionBottom - suggestionsPanel.clientHeight;
      }
    }

    function chooseSuggestion(item) {
      searchInput.value = item.label;
      closeSuggestions();
      searchInput.focus();
      if (item.source === 'mapbox' && item.mapboxId) retrieveMapboxLocation(item.mapboxId);
    }

    async function retrieveMapboxLocation(mapboxId) {
      try {
        const params = new URLSearchParams({ access_token: mapboxToken, session_token: sessionToken, language: 'en' });
        const response = await fetch('https://api.mapbox.com/search/searchbox/v1/retrieve/' + encodeURIComponent(mapboxId) + '?' + params.toString());
        if (!response.ok) return;
        const data = await response.json();
        const coordinates = data.features && data.features[0] && data.features[0].geometry.coordinates;
        if (coordinates) {
          longitudeInput.value = coordinates[0];
          latitudeInput.value = coordinates[1];
        }
      } catch (error) {
        // The selected text remains usable if coordinate lookup is unavailable.
      } finally {
        sessionToken = createSessionToken();
      }
    }

    function closeSuggestions() {
      suggestionsPanel.hidden = true;
      searchInput.setAttribute('aria-expanded', 'false');
      searchInput.setAttribute('aria-activedescendant', '');
      activeSuggestionIndex = -1;
      autocomplete.classList.remove('is-loading');
    }

    function createSessionToken() {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
      return Date.now().toString(36) + Math.random().toString(36).slice(2);
    }

    function normalizeText(value) {
      return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    }

    function mapboxTypeLabel(type) {
      if (type === 'neighborhood') return 'Neighborhood';
      if (type === 'postcode') return 'ZIP Code';
      if (type === 'district') return 'County';
      if (type === 'place' || type === 'locality') return 'Community';
      return 'Address';
    }

    function suggestionIcon(type) {
      const icons = { 'Community': 'C', 'Neighborhood': 'N', 'County': 'CO', 'School District': 'S', 'ZIP Code': '#', 'Address': '⌖' };
      return icons[type] || '⌖';
    }

    function localMeta(type) {
      const descriptions = { 'Community': 'Greater Cincinnati community', 'Neighborhood': 'Cincinnati neighborhood', 'County': 'Southwest Ohio county', 'School District': 'Local school district', 'ZIP Code': 'Postal code' };
      return descriptions[type] || 'Local market area';
    }
  }

  /* ================================================
     CONTACT FORM — validation + redirect to KW
  ================================================ */
  if (form) {

    // Clear error styling when user fixes a field
    form.querySelectorAll('.form__input, .form__textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        this.classList.remove('is-invalid');
        hideError();
      });
    });

    form.querySelectorAll('.form__checkbox').forEach(function (cb) {
      cb.addEventListener('change', function () {
        // Re-run validation quietly so error clears if now valid
        if (allValid()) hideError();
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!allValid()) {
        markInvalidFields();
        showError();
        return;
      }

      /*
        Redirect to the KW contact page.
        Update this URL if KW provides a specific contact form page.
      */
      window.location.href = 'https://kmooreteam.kw.com/';
    });
  }

  /* --- Helpers --- */

  function updateImageBackgroundShift() {
    if (reduceMotion.matches) {
      imageBackedSections.forEach(function (section) {
        section.style.setProperty('--bg-shift', '0px');
      });
      return;
    }

    const viewportCenter = window.innerHeight / 2;

    imageBackedSections.forEach(function (section) {
      const rect = section.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const distanceFromCenter = sectionCenter - viewportCenter;
      const shift = Math.max(-36, Math.min(36, distanceFromCenter * -0.08));

      section.style.setProperty('--bg-shift', shift.toFixed(1) + 'px');
    });
  }

  function setupStatCounters() {
    if (!('IntersectionObserver' in window) || reduceMotion.matches) {
      showFinalCounterValues();
      return;
    }

    window.addEventListener('scroll', maybeAnimateCounters, { passive: true });
    window.addEventListener('resize', maybeAnimateCounters);
    window.addEventListener('pageshow', maybeAnimateCounters);
    maybeAnimateCounters();

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        animateAllCounters();
        observer.disconnect();
      });
    }, { rootMargin: '0px 0px -15% 0px', threshold: 0.2 });

    observer.observe(statsGroup || statCounters[0]);
  }

  function maybeAnimateCounters() {
    if (statsHaveAnimated) return;

    const target = statsGroup || statCounters[0];
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const triggerLine = window.innerHeight * 0.9;

    if (rect.top < triggerLine && rect.bottom > 0) {
      animateAllCounters();
    }
  }

  function animateCounter(counter) {
    const target = Number(counter.dataset.target);
    const duration = 1300;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(target * easedProgress);

      counter.textContent = formatCounterValue(counter, currentValue);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  function animateAllCounters() {
    if (statsHaveAnimated) return;
    statsHaveAnimated = true;
    window.removeEventListener('scroll', maybeAnimateCounters);
    window.removeEventListener('resize', maybeAnimateCounters);
    window.removeEventListener('pageshow', maybeAnimateCounters);

    statCounters.forEach(function (counter) {
      animateCounter(counter);
    });
  }

  function showFinalCounterValues() {
    statCounters.forEach(function (counter) {
      counter.textContent = formatCounterValue(counter, Number(counter.dataset.target));
    });
  }

  function formatCounterValue(counter, value) {
    const prefix = counter.dataset.prefix || '';
    const suffix = counter.dataset.suffix || '';

    return prefix + value.toLocaleString() + suffix;
  }

  function allValid() {
    let valid = true;
    form.querySelectorAll('[required]').forEach(function (field) {
      if (field.type === 'checkbox') {
        if (!field.checked) valid = false;
      } else {
        if (!field.value.trim()) valid = false;
      }
    });
    return valid;
  }

  function markInvalidFields() {
    form.querySelectorAll('[required]').forEach(function (field) {
      if (field.type === 'checkbox') return; // checkboxes styled via parent
      if (!field.value.trim()) {
        field.classList.add('is-invalid');
      }
    });
  }

  function showError() {
    if (!formError) return;
    formError.hidden = false;
    formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideError() {
    if (!formError) return;
    // Only hide if all required fields are now satisfied
    if (allValid()) formError.hidden = true;
  }

})();
