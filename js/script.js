(function () {
  'use strict';

  // ── Performance detection ──
  var isMobile = window.matchMedia('(max-width: 768px)').matches;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Cover Gate ──
  const cover = document.getElementById('cover');
  const openBtn = document.getElementById('openInvitation');
  const floatingNav = document.getElementById('floatingNav');

  // ── Background Music ──
  const bgMusic = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  const themeToggle = document.getElementById('themeToggle');
  bgMusic.volume = 0.4;

  function playMusic() {
    bgMusic.play().then(function () {
      musicToggle.classList.remove('paused');
      musicToggle.classList.add('playing');
    }).catch(function () {
      musicToggle.classList.add('paused');
      musicToggle.classList.remove('playing');
      musicToggle.setAttribute('title', 'Tap untuk putar musik');
    });
  }

  function pauseMusic() {
    bgMusic.pause();
    musicToggle.classList.add('paused');
    musicToggle.classList.remove('playing');
  }

  musicToggle.addEventListener('click', function () {
    if (bgMusic.paused) {
      playMusic();
    } else {
      pauseMusic();
    }
  });

  // ── Guest Name from URL (?to=Nama+Tamu) ──
  var params = new URLSearchParams(window.location.search);
  var guestName = params.get('to');

  if (guestName) {
    var decoded = decodeURIComponent(guestName).trim();
    if (decoded) {
      var guestEl = document.querySelector('.cover__guest-name');
      if (guestEl) guestEl.textContent = decoded;
      var rsvpInput = document.getElementById('rsvp-name');
      if (rsvpInput) rsvpInput.value = decoded;
    }
  }

  // Reset scroll position on page load
  window.scrollTo(0, 0);
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // ── Asset Preload + Loading Overlay ──
  var loadingOverlay = document.getElementById('loadingOverlay');
  var loadingBarFill = document.getElementById('loadingBarFill');

  var PRELOAD_ASSETS = [
    'assets/images/hero/couple.jpg',
    'assets/images/couple/bride.jpeg',
    'assets/images/couple/groom.jpeg'
  ];

  function preloadAssets(onProgress, onDone) {
    var total = PRELOAD_ASSETS.length;
    var loaded = 0;
    var done = false;

    function finish() {
      if (done) return;
      done = true;
      onDone();
    }

    // Max wait 4s even if assets are slow
    var timeout = setTimeout(function () {
      onProgress(100);
      finish();
    }, 4000);

    PRELOAD_ASSETS.forEach(function (src) {
      var img = new Image();
      img.onload = img.onerror = function () {
        loaded++;
        onProgress(Math.round((loaded / total) * 100));
        if (loaded >= total) {
          clearTimeout(timeout);
          finish();
        }
      };
      img.src = src;
    });
  }

  function showContent() {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, 0);
    floatingNav.classList.remove('hidden');
    musicToggle.classList.remove('hidden'); // Muncul setelah buka undangan
    setTimeout(initReveal, 300);
    playMusic();
  }

  openBtn.addEventListener('click', function () {
    // Hide cover, show loading
    cover.classList.add('hidden');
    loadingOverlay.classList.add('active');

    preloadAssets(
      function onProgress(pct) {
        loadingBarFill.style.width = pct + '%';
      },
      function onDone() {
        // Small delay so 100% is visible
        setTimeout(function () {
          loadingOverlay.classList.remove('active');
          loadingOverlay.classList.add('fade-out');
          showContent();
        }, 400);
      }
    );
  });

  // Lock scroll until cover is opened (iOS-safe)
  document.body.style.position = 'fixed';
  document.body.style.top = '0';
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';

  // ── Dark Mode Toggle ──
  (function initTheme() {
    var saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    themeToggle.addEventListener('click', function () {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      }
    });
  })();

  // Focus trap for cover dialog (iOS accessibility)
  cover.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      // Only openBtn is focusable in cover — trap focus there
      e.preventDefault();
      openBtn.focus();
    }
  });
  openBtn.focus();

  // ── Scroll Reveal ──
  function initReveal() {
    var reveals = document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right, .reveal-scale-up');
    if (!('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ── Active Nav Tracking ──
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.floating-nav__item');
  const navSectionIds = [];
  navItems.forEach(function(item) { navSectionIds.push(item.getAttribute('data-section')); });
  var navUpdateCallbacks = [];
  var lastActiveId = navSectionIds[0] || '';

  function updateActiveNav() {
    var scrollY = window.scrollY + window.innerHeight / 2;
    var currentId = '';

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var bottom = top + section.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        currentId = section.getAttribute('id');
      }
    });

    // If current section has no nav item, keep the last active one
    if (currentId && navSectionIds.indexOf(currentId) === -1) {
      currentId = lastActiveId;
    }
    if (currentId && navSectionIds.indexOf(currentId) !== -1) {
      lastActiveId = currentId;
    }
    if (!currentId) {
      currentId = lastActiveId;
    }

    navItems.forEach(function (item) {
      item.classList.remove('active');
      if (item.getAttribute('data-section') === currentId) {
        item.classList.add('active');
      }
    });

    navUpdateCallbacks.forEach(function(cb) { cb(); });
  }

  // ── Unified Scroll Handler (single rAF for all scroll work) ──
  var scrollCallbacks = [];
  var scrollTicking = false;

  function onScrollFrame() {
    for (var i = 0; i < scrollCallbacks.length; i++) {
      scrollCallbacks[i]();
    }
    scrollTicking = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      requestAnimationFrame(onScrollFrame);
      scrollTicking = true;
    }
  }, { passive: true });

  // Register nav tracking as a scroll callback
  scrollCallbacks.push(updateActiveNav);

  // ── Smooth Navigation ──
  navItems.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      var targetId = this.getAttribute('href').substring(1);
      var target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Supabase REST API ──
  var SUPABASE_URL = 'https://roktkjmmdmbglulapzve.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_V9TVlG-_pnpFSeqRx6B4RQ_nBGyi5GE';

  function supabaseFetch(path, options) {
    var url = SUPABASE_URL + '/rest/v1/' + path;
    var headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    };
    if (options && options.headers) {
      Object.keys(options.headers).forEach(function(k) { headers[k] = options.headers[k]; });
    }
    return fetch(url, {
      method: (options && options.method) || 'GET',
      headers: headers,
      body: (options && options.body) ? JSON.stringify(options.body) : undefined
    });
  }

  // ── RSVP Form + Wishes ──
  var rsvpForm = document.getElementById('rsvpForm');
  var rsvpSuccess = document.getElementById('rsvpSuccess');
  var rsvpAnother = document.getElementById('rsvpAnother');
  var wishesList = document.getElementById('wishesList');
  var wishesEmpty = document.getElementById('wishesEmpty');
  var wishesCount = document.getElementById('wishesCount');
  var wishesMore = document.getElementById('wishesMore');
  var wishesCollapse = document.getElementById('wishesCollapse');
  var allWishes = [];
  var wishesShown = 3;

  function getInitials(name) {
    return name.split(' ').map(function(w) { return w[0]; }).slice(0, 2).join('');
  }

  function formatDate(ts) {
    var d = new Date(ts);
    var months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  function renderWishes() {
    var total = allWishes.length;
    wishesCount.textContent = total > 0 ? total + ' ucapan' : '';

    if (total === 0) {
      wishesEmpty.style.display = 'block';
      wishesList.innerHTML = '';
      wishesList.appendChild(wishesEmpty);
      wishesMore.style.display = 'none';
      wishesCollapse.style.display = 'none';
      return;
    }

    wishesEmpty.style.display = 'none';
    wishesList.innerHTML = '';

    var toShow = allWishes.slice(0, wishesShown);
    toShow.forEach(function(w, i) {
      var bubble = document.createElement('div');
      bubble.className = 'wish-bubble';
      bubble.style.animationDelay = (i * 0.06) + 's';
      bubble.innerHTML =
        '<div class="wish-bubble__header">' +
          '<div class="wish-bubble__avatar">' + escapeHtml(getInitials(w.name)) + '</div>' +
          '<span class="wish-bubble__name">' + escapeHtml(w.name) + '</span>' +
          '<span class="wish-bubble__date">' + formatDate(w.created_at || w.date) + '</span>' +
        '</div>' +
        '<div class="wish-bubble__body">' +
          '<p class="wish-bubble__text">' + escapeHtml(w.message) + '</p>' +
        '</div>';
      wishesList.appendChild(bubble);
    });

    if (wishesShown < total) {
      wishesMore.style.display = 'block';
      wishesMore.textContent = 'Lihat ' + Math.min(5, total - wishesShown) + ' ucapan lainnya';
      wishesCollapse.style.display = wishesShown > 3 ? 'block' : 'none';
    } else {
      wishesMore.style.display = 'none';
      wishesCollapse.style.display = total > 3 ? 'block' : 'none';
    }
  }

  wishesMore.addEventListener('click', function() {
    wishesShown = Math.min(wishesShown + 5, allWishes.length);
    renderWishes();
  });

  wishesCollapse.addEventListener('click', function() {
    wishesShown = 3;
    renderWishes();
    var section = document.querySelector('.wishes');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ── Load wishes from Supabase ──
  function loadWishes() {
    var loadingEl = document.getElementById('wishesLoading');
    if (loadingEl) loadingEl.style.display = '';
    supabaseFetch('rsvp?message=not.is.null&message=not.eq.&select=name,message,created_at&order=created_at.desc')
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (loadingEl) loadingEl.style.display = 'none';
        if (Array.isArray(data)) {
          allWishes = data;
        }
        renderWishes();
      })
      .catch(function(err) {
        if (loadingEl) loadingEl.style.display = 'none';
        console.error('Load wishes error:', err);
        renderWishes();
      });
  }

  // ── Segmented Control (iOS-style) ──
  var segmentBtns = document.querySelectorAll('.rsvp__segment-btn');
  var segmentSlider = document.getElementById('segmentSlider');
  var attendInput = document.getElementById('rsvp-attend');

  function moveSlider(activeBtn) {
    if (!segmentSlider || !activeBtn) return;
    var pad = 3;
    var targetW = activeBtn.offsetWidth;
    var targetX = activeBtn.offsetLeft - pad;

    // If first move (no width yet), just snap
    if (!segmentSlider._currentX && segmentSlider._currentX !== 0) {
      segmentSlider.style.width = targetW + 'px';
      segmentSlider.style.transform = 'translateX(' + targetX + 'px)';
      segmentSlider._currentX = targetX;
      segmentSlider._currentW = targetW;
      segmentSlider.classList.add('visible');
      return;
    }

    var startX = segmentSlider._currentX;
    var startW = segmentSlider._currentW;
    var dist = Math.abs(targetX - startX);
    var dir = targetX > startX ? 1 : -1;
    var startTime = null;
    var stretchDur = 200;
    var settleDur = 380;
    var totalDur = stretchDur + settleDur;

    function animSlider(ts) {
      if (!startTime) startTime = ts;
      var elapsed = ts - startTime;
      var t;

      if (elapsed < stretchDur) {
        // Stretch phase: leading edge races ahead, trailing edge lags
        t = elapsed / stretchDur;
        var ease = t * (2 - t); // easeOut
        var stretch = Math.sin(ease * Math.PI) * 0.25;
        var x = startX + (targetX - startX) * ease;
        var w = targetW + dist * stretch;
        // Offset so stretch goes in movement direction
        var stretchOffset = dir > 0 ? -dist * stretch * 0.3 : dist * stretch * 0.3;
        segmentSlider.style.width = w + 'px';
        segmentSlider.style.transform = 'translateX(' + (x + stretchOffset) + 'px)';
      } else {
        // Settle phase: spring wobble
        t = (elapsed - stretchDur) / settleDur;
        if (t > 1) t = 1;
        var wobble = Math.exp(-5 * t) * Math.sin(10 * t) * 0.08;
        var w2 = targetW * (1 + wobble);
        segmentSlider.style.width = w2 + 'px';
        segmentSlider.style.transform = 'translateX(' + (targetX - wobble * targetW * 0.5) + 'px)';
      }

      if (elapsed < totalDur) {
        requestAnimationFrame(animSlider);
      } else {
        segmentSlider.style.width = targetW + 'px';
        segmentSlider.style.transform = 'translateX(' + targetX + 'px)';
        segmentSlider._currentX = targetX;
        segmentSlider._currentW = targetW;
      }
    }

    segmentSlider.classList.add('visible');
    segmentSlider._currentX = startX;
    segmentSlider._currentW = startW;
    requestAnimationFrame(animSlider);
    // Update final pos immediately for chaining
    segmentSlider._currentX = targetX;
    segmentSlider._currentW = targetW;
  }

  segmentBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      segmentBtns.forEach(function(b) {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      attendInput.value = btn.getAttribute('data-value');
      moveSlider(btn);
    });
  });

  var defaultActiveBtn = document.querySelector('.rsvp__segment-btn.active');
  if (defaultActiveBtn) {
    requestAnimationFrame(function() { moveSlider(defaultActiveBtn); });
  }

  // ── Show success, hide form ──
  function showSuccess() {
    rsvpForm.style.display = 'none';
    rsvpSuccess.style.display = 'block';
  }

  // ── Back to form ──
  rsvpAnother.addEventListener('click', function() {
    rsvpSuccess.style.display = 'none';
    rsvpForm.style.display = 'flex';
    rsvpForm.reset();
    attendInput.value = 'hadir';
    segmentBtns.forEach(function(b) {
      b.classList.remove('active');
      b.setAttribute('aria-checked', 'false');
    });
    var firstBtn = document.querySelector('.rsvp__segment-btn[data-value="hadir"]');
    if (firstBtn) {
      firstBtn.classList.add('active');
      firstBtn.setAttribute('aria-checked', 'true');
      requestAnimationFrame(function() { moveSlider(firstBtn); });
    }
  });

  rsvpForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var nameInput = document.getElementById('rsvp-name');
    var messageInput = document.getElementById('rsvp-message');
    var submitBtn = rsvpForm.querySelector('.rsvp__submit');
    var submitText = submitBtn.querySelector('.rsvp__submit-text');
    var name = nameInput.value.trim();
    var message = messageInput.value.trim();

    if (!name || !attendInput.value) {
      if (!name) {
        var errorEl = document.getElementById('rsvpNameError');
        nameInput.style.outline = '2px solid #ff3b30';
        if (errorEl) {
          errorEl.textContent = 'Nama wajib diisi';
          errorEl.classList.add('rsvp__error--visible');
        }
        setTimeout(function() {
          nameInput.style.outline = '';
          if (errorEl) {
            errorEl.classList.remove('rsvp__error--visible');
          }
        }, 3000);
      }
      return;
    }

    submitBtn.disabled = true;
    if (submitText) submitText.textContent = 'Mengirim...';

    supabaseFetch('rsvp', {
      method: 'POST',
      body: { name: name, attendance: attendInput.value, message: message || null }
    })
      .then(function(res) {
        submitBtn.disabled = false;
        if (submitText) submitText.textContent = 'Kirim Konfirmasi';

        if (!res.ok) {
          return res.text().then(function(t) { console.error('RSVP error:', res.status, t); });
        }

        showSuccess();
        if (message) {
          loadWishes();
        }
      })
      .catch(function(err) {
        submitBtn.disabled = false;
        if (submitText) submitText.textContent = 'Kirim Konfirmasi';
        console.error('Network error:', err);
      });
  });

  loadWishes();

  // ── Gift Card: Copy + Toast + Shimmer ──
  (function initGiftCards() {

    // Copy action button
    document.querySelectorAll('.gift-card__action').forEach(function(btn) {
      var copying = false;
      var originalHTML = btn.innerHTML;
      btn.addEventListener('click', function() {
        if (copying) return;
        copying = true;
        var text = btn.getAttribute('data-copy');

        function onCopied() {
          btn.classList.add('gift-card__action--copied');
          btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg> Tersalin!';

          setTimeout(function() {
            btn.classList.remove('gift-card__action--copied');
            btn.innerHTML = originalHTML;
            copying = false;
          }, 5000);
        }

        try {
          navigator.clipboard.writeText(text).then(onCopied).catch(fallbackCopy);
        } catch(e) { fallbackCopy(); }

        function fallbackCopy() {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          onCopied();
        }
      });
    });

    // Holographic shimmer on scroll (skip on mobile for perf)
    if (!isMobile) {
      var giftCards = document.querySelectorAll('.gift-card');
      var updateShimmer = function() {
        var vh = window.innerHeight;
        giftCards.forEach(function(card) {
          var shimmer = card.querySelector('.gift-card__shimmer');
          if (!shimmer) return;
          var rect = card.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > vh) return; // skip off-screen
          var progress = 1 - (rect.top / vh);
          var pos = Math.max(0, Math.min(100, progress * 100));
          shimmer.style.backgroundPosition = pos + '% 0';
        });
      };
      scrollCallbacks.push(updateShimmer);
    }
  })();

  // ── Copy Address Button ──
  var copyAddrBtn = document.getElementById('copyAddress');
  if (copyAddrBtn) {
    copyAddrBtn.addEventListener('click', function() {
      var address = this.getAttribute('data-address');

      function showCopied() {
        var label = copyAddrBtn.querySelector('span');
        var svgEl = copyAddrBtn.querySelector('svg');
        if (label) label.textContent = 'Tersalin!';
        if (svgEl) svgEl.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>';
        setTimeout(function() {
          if (label) label.textContent = 'Salin';
          if (svgEl) svgEl.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/>';
        }, 2000);
      }

      try {
        navigator.clipboard.writeText(address).then(showCopied).catch(function() {
          fallbackCopy(address);
          showCopied();
        });
      } catch(e) {
        fallbackCopy(address);
        showCopied();
      }

      function fallbackCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    });
  }

  // ── Countdown Timer ──
  var weddingDate = new Date('2026-08-02T07:00:00+07:00').getTime();
  var cdDays = document.getElementById('cdDays');

  function updateCountdown() {
    var now = Date.now();
    var diff = weddingDate - now;

    if (diff <= 0) {
      cdDays.textContent = '0';
      return;
    }

    var d = Math.floor(diff / (1000 * 60 * 60 * 24));
    cdDays.textContent = String(d);
  }

  updateCountdown();
  // Update once per hour since we only show days
  var countdownTimer = setInterval(updateCountdown, 3600000);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      clearInterval(countdownTimer);
    } else {
      updateCountdown();
      countdownTimer = setInterval(updateCountdown, 3600000);
    }
  });

  // ── Save the Date (Calendar) ──
  document.getElementById('saveTheDate').addEventListener('click', function (e) {
    e.preventDefault();
    var title = 'Pernikahan Nova & Fathi';
    var startDate = '20260802T070000';
    var endDate = '20260802T130000';
    var location = 'Masjid At-Taqwa, Pasar Minggu, Jakarta Selatan, DKI Jakarta';
    var details = 'Kami mengundang Bapak/Ibu/Saudara/i untuk hadir di hari pernikahan kami. Nova & Fathi.';

    var gcalUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
      + '&text=' + encodeURIComponent(title)
      + '&dates=' + startDate + '/' + endDate
      + '&ctz=Asia/Jakarta'
      + '&location=' + encodeURIComponent(location)
      + '&details=' + encodeURIComponent(details);

    window.open(gcalUrl, '_blank', 'noopener,noreferrer');
  });

  // ── Live Activity — show/hide on scroll near event section ──
  (function initLiveActivity() {
    var liveEl = document.getElementById('liveActivity');
    var eventSection = document.getElementById('acara');
    if (!liveEl || !eventSection) return;

    var isVisible = false;
    var themeToggle = document.getElementById('themeToggle');
    var musicToggleEl = document.getElementById('musicToggle');

    function checkScroll() {
      var rect = eventSection.getBoundingClientRect();
      var shouldShow = rect.top < window.innerHeight * 0.5;
      if (shouldShow && !isVisible) {
        isVisible = true;
        liveEl.classList.add('visible');
        liveEl.classList.remove('hidden');
        if (themeToggle) themeToggle.classList.add('shifted');
        if (musicToggleEl) musicToggleEl.classList.add('shifted');
      } else if (!shouldShow && isVisible) {
        isVisible = false;
        liveEl.classList.remove('visible');
        liveEl.classList.add('hidden');
        if (themeToggle) themeToggle.classList.remove('shifted');
        if (musicToggleEl) musicToggleEl.classList.remove('shifted');
      }
    }

    scrollCallbacks.push(checkScroll);
    checkScroll();
  })();

  // ── Gallery Lightbox (iOS-style) + Carousel Dots ──
  (function initGallery() {
    var carousel = document.querySelector('.gallery__carousel');
    var items = document.querySelectorAll('.gallery__item');
    var dotsContainer = document.querySelector('.gallery__dots');
    if (!items.length) return;

    // Create page indicator dots
    if (dotsContainer && carousel) {
      items.forEach(function(_, i) {
        var dot = document.createElement('span');
        dot.className = 'gallery__dot' + (i === 0 ? ' active' : '');
        dotsContainer.appendChild(dot);
      });

      var dots = dotsContainer.querySelectorAll('.gallery__dot');

      carousel.addEventListener('scroll', function() {
        requestAnimationFrame(function() {
          var scrollLeft = carousel.scrollLeft;
          var itemWidth = items[0].offsetWidth + 12; // gap
          var activeIndex = Math.round(scrollLeft / itemWidth);
          activeIndex = Math.max(0, Math.min(activeIndex, items.length - 1));
          dots.forEach(function(dot, i) {
            dot.classList.toggle('active', i === activeIndex);
          });
        });
      }, { passive: true });
    }

    // Lightbox
    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Galeri foto');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    var img = document.createElement('img');
    img.className = 'lightbox-img';
    img.alt = '';
    overlay.appendChild(img);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.setAttribute('aria-label', 'Tutup');
    closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>';
    overlay.appendChild(closeBtn);

    // Prev/Next buttons
    var prevBtn = document.createElement('button');
    prevBtn.className = 'lightbox-nav lightbox-nav--prev';
    prevBtn.setAttribute('aria-label', 'Foto sebelumnya');
    prevBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>';
    overlay.appendChild(prevBtn);

    var nextBtn = document.createElement('button');
    nextBtn.className = 'lightbox-nav lightbox-nav--next';
    nextBtn.setAttribute('aria-label', 'Foto berikutnya');
    nextBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>';
    overlay.appendChild(nextBtn);

    // Counter
    var counter = document.createElement('span');
    counter.className = 'lightbox-counter';
    overlay.appendChild(counter);

    var currentIndex = 0;
    var galleryImages = Array.from(items).map(function(item) {
      var photo = item.querySelector('img');
      return photo ? photo.src : '';
    }).filter(Boolean);

    function updateNav() {
      prevBtn.disabled = currentIndex <= 0;
      nextBtn.disabled = currentIndex >= galleryImages.length - 1;
      counter.textContent = (currentIndex + 1) + ' / ' + galleryImages.length;
    }

    function openLightbox(src) {
      if (!src) return;
      currentIndex = galleryImages.indexOf(src);
      if (currentIndex < 0) currentIndex = 0;
      img.src = src;
      updateNav();
      overlay.classList.add('lightbox-overlay--show');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      overlay.classList.remove('lightbox-overlay--show');
      document.body.style.overflow = '';
    }

    function showPrev() {
      if (currentIndex > 0) {
        currentIndex--;
        img.src = galleryImages[currentIndex];
        updateNav();
      }
    }

    function showNext() {
      if (currentIndex < galleryImages.length - 1) {
        currentIndex++;
        img.src = galleryImages[currentIndex];
        updateNav();
      }
    }

    items.forEach(function(item) {
      item.addEventListener('click', function() {
        var photo = item.querySelector('img');
        if (photo) openLightbox(photo.src);
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeLightbox();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeLightbox();
      if (overlay.classList.contains('lightbox-overlay--show')) {
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
      }
    });
  })();

  // ── Easter Egg 2: Long press ✦ divider → secret message ──
  (function() {
    var divider = document.querySelector('.cover__divider');
    if (!divider) return;
    var timer = null;
    var tooltip = null;

    function showSecret() {
      if (tooltip) return;
      tooltip = document.createElement('div');
      tooltip.className = 'ee-secret';
      tooltip.textContent = 'You found a secret! We can\u2019t wait to see you \uD83D\uDC9B';
      divider.style.position = 'relative';
      divider.appendChild(tooltip);
      requestAnimationFrame(function() { tooltip.classList.add('ee-secret--show'); });
      setTimeout(function() {
        if (tooltip) {
          tooltip.classList.remove('ee-secret--show');
          setTimeout(function() { if (tooltip) { tooltip.remove(); tooltip = null; } }, 400);
        }
      }, 3000);
    }

    divider.addEventListener('touchstart', function(e) {
      timer = setTimeout(showSecret, 2000);
    }, { passive: true });
    divider.addEventListener('touchend', function() { clearTimeout(timer); });
    divider.addEventListener('touchmove', function() { clearTimeout(timer); });
    divider.addEventListener('mousedown', function() {
      timer = setTimeout(showSecret, 2000);
    });
    divider.addEventListener('mouseup', function() { clearTimeout(timer); });
    divider.addEventListener('mouseleave', function() { clearTimeout(timer); });
  })();

  // ── Easter Egg 5: Floating thank-you on RSVP message submit ──
  function showFloatingThankYou() {
    var existing = document.querySelector('.ee-floating-thankyou');
    if (existing) existing.remove();

    var el = document.createElement('div');
    el.className = 'ee-floating-thankyou';
    el.textContent = 'Terimakasih atas konfirmasi dan ucapan doanya ya \uD83E\uDD17';
    document.body.appendChild(el);

    requestAnimationFrame(function() {
      el.classList.add('ee-floating-thankyou--show');
    });

    setTimeout(function() {
      el.classList.remove('ee-floating-thankyou--show');
      el.classList.add('ee-floating-thankyou--hide');
      setTimeout(function() { el.remove(); }, 600);
    }, 3500);
  }

  // ── Story Carousel Dots ──
  (function initStoryDots() {
    var carousel = document.querySelector('.story-carousel');
    var dotsContainer = document.querySelector('.story__dots');
    var cards = document.querySelectorAll('.story-card');
    if (!carousel || !dotsContainer || !cards.length) return;

    cards.forEach(function(_, i) {
      var dot = document.createElement('span');
      dot.className = 'story__dot' + (i === 0 ? ' active' : '');
      dotsContainer.appendChild(dot);
    });

    var dots = dotsContainer.querySelectorAll('.story__dot');

    carousel.addEventListener('scroll', function() {
      requestAnimationFrame(function() {
        var scrollLeft = carousel.scrollLeft;
        var itemWidth = cards[0].offsetWidth + 12;
        var activeIndex = Math.round(scrollLeft / itemWidth);
        activeIndex = Math.max(0, Math.min(activeIndex, cards.length - 1));
        dots.forEach(function(dot, i) {
          dot.classList.toggle('active', i === activeIndex);
        });
      });
    }, { passive: true });
  })();

  // ── Parallax Floating Orbs (disabled on mobile for performance) ──
  (function initParallax() {
    // Skip parallax entirely on mobile — too many layout reads per frame
    if (isMobile || prefersReducedMotion) return;

    var orbs = document.querySelectorAll('.parallax-orb');
    if (!orbs.length) return;

    // Section titles for parallax depth
    var titles = document.querySelectorAll('.text-section-title, .hero__header-title');

    function updateParallax() {
      var scrollY = window.pageYOffset;
      var vh = window.innerHeight;
      var speeds = [0.03, -0.02, 0.025, -0.035];
      orbs.forEach(function (orb, i) {
        var speed = speeds[i] || 0.02;
        orb.style.transform = 'translateY(' + (scrollY * speed) + 'px)';
      });

      // Parallax depth on section titles — skip off-screen
      titles.forEach(function(title) {
        var rect = title.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > vh + 100) return;
        var center = rect.top + rect.height / 2;
        var offset = (center - vh / 2) / vh;
        title.style.transform = 'translateY(' + (offset * -12) + 'px)';
      });
    }

    scrollCallbacks.push(updateParallax);
  })();

  // ── Word-by-word Stagger Reveal ──
  (function initStagger() {
    var staggerEls = document.querySelectorAll('.stagger-text');
    staggerEls.forEach(function(el) {
      var text = el.textContent.trim();
      var words = text.split(/\s+/);
      el.innerHTML = '';
      words.forEach(function(word, i) {
        var span = document.createElement('span');
        span.className = 'word';
        span.textContent = word;
        span.style.transitionDelay = (i * 0.05) + 's';
        el.appendChild(span);
        // Add a space text node between words
        if (i < words.length - 1) {
          el.appendChild(document.createTextNode(' '));
        }
      });
    });
  })();

  // ── Floating Nav Pill Morph ──
  (function initNavPill() {
    var pill = document.getElementById('navPill');
    var nav = document.getElementById('floatingNav');
    if (!pill || !nav) return;

    var currentX = -1;
    var animId = null;
    var phase = 'idle'; // idle | stretch | settle
    var startTime = 0;
    var fromX = 0;
    var toX = 0;
    var pillSize = 44;
    var stretchExtra = 0;
    var animX = 0; // current animated X position
    var animW = 44;
    var animH = 44;

    // Timing
    var STRETCH_DUR = 220;
    var SETTLE_DUR = 450;

    function lerp(a, b, t) { return a + (b - a) * t; }
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function animate(time) {
      if (!startTime) startTime = time;
      var elapsed = time - startTime;

      if (phase === 'stretch') {
        var t = Math.min(elapsed / STRETCH_DUR, 1);
        var et = easeOut(t);

        // Position: move toward target
        animX = lerp(fromX, toX, et);
        // Stretch peaks at midpoint of travel
        var stretchT = Math.sin(et * Math.PI);
        var widthMul = 1 + stretchExtra * stretchT;
        var heightMul = 1 - (stretchExtra * 0.55) * stretchT;
        animW = pillSize * widthMul;
        animH = pillSize * heightMul;

        // Center the stretched pill horizontally and vertically
        var offset = animX - (animW - pillSize) / 2;
        var offsetY = (pillSize - animH) / 2;
        pill.style.transform = 'translateX(' + offset + 'px) translateY(' + offsetY + 'px)';
        pill.style.width = animW + 'px';
        pill.style.height = animH + 'px';
        pill.style.borderRadius = Math.min(animH, animW) / 2 + 'px';

        if (t >= 1) {
          phase = 'settle';
          startTime = 0;
          animId = requestAnimationFrame(animate);
          return;
        }
      } else if (phase === 'settle') {
        var t2 = Math.min(elapsed / SETTLE_DUR, 1);

        // Damped spring wobble
        var wobble = Math.exp(-4.5 * t2) * Math.sin(10 * t2);
        var sx = 1 + wobble * 0.15;
        var sy = 1 - wobble * 0.15;
        animW = pillSize * sx;
        animH = pillSize * sy;
        animX = toX;
        var offset2 = toX - (animW - pillSize) / 2;
        var offsetY2 = (pillSize - animH) / 2;

        pill.style.transform = 'translateX(' + offset2 + 'px) translateY(' + offsetY2 + 'px)';
        pill.style.width = animW + 'px';
        pill.style.height = animH + 'px';
        pill.style.borderRadius = Math.min(animH, animW) / 2 + 'px';

        if (t2 >= 1) {
          pill.style.transform = 'translateX(' + toX + 'px)';
          pill.style.width = pillSize + 'px';
          pill.style.height = pillSize + 'px';
          pill.style.borderRadius = '50%';
          animW = pillSize;
          animH = pillSize;
          phase = 'idle';
          animId = null;
          return;
        }
      }

      animId = requestAnimationFrame(animate);
    }

    function movePill() {
      var active = nav.querySelector('.floating-nav__item.active');
      if (!active) {
        pill.classList.remove('visible');
        phase = 'idle';
        if (animId) { cancelAnimationFrame(animId); animId = null; }
        return;
      }

      var navRect = nav.getBoundingClientRect();
      var activeRect = active.getBoundingClientRect();
      var targetX = activeRect.left - navRect.left;
      pillSize = activeRect.width;

      if (currentX < 0 || !pill.classList.contains('visible')) {
        pill.style.width = pillSize + 'px';
        pill.style.height = pillSize + 'px';
        pill.style.borderRadius = '50%';
        pill.style.transform = 'translateX(' + targetX + 'px)';
        pill.classList.add('visible');
        currentX = targetX;
        animX = targetX;
        return;
      }

      var dx = Math.abs(targetX - currentX);
      if (dx < 1) return;

      // Chain from current animated position if mid-animation
      if (phase !== 'idle') {
        fromX = animX;
      } else {
        fromX = currentX;
      }

      toX = targetX;
      // Ensure minimum visible stretch even for adjacent icons
      stretchExtra = Math.max(0.45, Math.min(dx / pillSize * 0.7, 0.8));
      currentX = targetX;
      phase = 'stretch';
      startTime = 0;

      if (animId) cancelAnimationFrame(animId);
      animId = requestAnimationFrame(animate);
    }

    navUpdateCallbacks.push(movePill);
    setTimeout(movePill, 400);
  })();

  // ── Photo Card Parallax Tilt + Jelly Touch + Gyroscope ──
  (function initCardTilt() {
    var cards = document.querySelectorAll('.couple-card, .gallery__item, .story-card');
    if (!cards.length) return;

    function updateTilt() {
      var vh = window.innerHeight;
      cards.forEach(function(card) {
        if (card._jellyActive || card._gyroActive) return;
        var rect = card.getBoundingClientRect();
        // Skip cards far off-screen
        if (rect.bottom < -50 || rect.top > vh + 50) return;
        var center = rect.top + rect.height / 2;
        var offset = (center - vh / 2) / vh;
        var angle = offset * 2.5;
        card.style.transform = 'perspective(1200px) rotateX(' + angle + 'deg)';
      });
    }

    scrollCallbacks.push(updateTilt);

    // Gyroscope tilt on mobile — throttled to ~30fps
    if (window.DeviceOrientationEvent) {
      var gyroCards = document.querySelectorAll('.couple-card, .hero__card');
      var lastBeta = 0, lastGamma = 0;
      var gyroRafId = null;

      window.addEventListener('deviceorientation', function(e) {
        if (e.beta === null || e.gamma === null) return;
        var beta = Math.max(-15, Math.min(15, e.beta - 45));
        var gamma = Math.max(-15, Math.min(15, e.gamma));
        lastBeta += (beta - lastBeta) * 0.1;
        lastGamma += (gamma - lastGamma) * 0.1;

        if (!gyroRafId) {
          gyroRafId = requestAnimationFrame(function() {
            var rx = lastBeta * 0.15;
            var ry = lastGamma * 0.2;
            gyroCards.forEach(function(card) {
              if (card._jellyActive) return;
              card._gyroActive = true;
              card.style.transform = 'perspective(1200px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
            });
            gyroRafId = null;
          });
        }
      }, { passive: true });
    }

    // iOS 26 tap feedback — subtle scale-down on press, spring back on release
    cards.forEach(function(card) {
      card.style.transition = 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)';
      card.addEventListener('pointerdown', function() {
        card.style.transform = 'scale(0.97)';
      });
      card.addEventListener('pointerup', function() {
        card.style.transform = '';
      });
      card.addEventListener('pointerleave', function() {
        card.style.transform = '';
      });
      card.addEventListener('pointercancel', function() {
        card.style.transform = '';
      });
    });
  })();



})();
