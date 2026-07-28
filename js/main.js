/* ═══════════════════════════════════════════════════════
   Fatec System — Main JavaScript
   ASML Dark Header Edition
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const searchToggle = document.getElementById('searchToggle');
  const searchBar = document.getElementById('searchBar');

  // ── Mobile menu toggle ──
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function() {
      const isOpen = mainNav.classList.contains('open');
      menuToggle.classList.toggle('open');
      mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', !isOpen);
    });

    mainNav.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        menuToggle.classList.remove('open');
        mainNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ── Search toggle ──
  if (searchToggle && searchBar) {
    searchToggle.addEventListener('click', function() {
      const isOpen = searchBar.classList.contains('open');
      if (isOpen) {
        searchBar.classList.remove('open');
      } else {
        searchBar.classList.add('open');
        const input = searchBar.querySelector('input');
        if (input) input.focus();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && searchBar.classList.contains('open')) {
        searchBar.classList.remove('open');
      }
    });
  }

  // ── Smooth scroll ──
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Scroll reveal ──
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) entry.target.classList.add('animate-in');
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.partner-card, .product-card, .service-item, .press-card').forEach(function(el) {
      observer.observe(el);
    });
  }

  // ── Blog preview ──
  const blogContainer = document.getElementById('blog-posts');
  if (blogContainer) {
    fetch('/posts/index.json')
      .then(function(r) { return r.ok ? r.json() : []; })
      .then(function(posts) {
        if (!posts.length) {
          blogContainer.innerHTML = '<p class="blog-empty">Blog posts will appear here once published.</p>';
          return;
        }
        blogContainer.innerHTML = posts.slice(0, 6).map(function(post) {
          var d = post.date ? new Date(post.date).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : '';
          return '<article class="press-card"><p class="press-date">' + d + '</p><h3><a href="/posts/' + esc(post.slug) + '">' + esc(post.title) + '</a></h3></article>';
        }).join('');
      })
      .catch(function() { blogContainer && blogContainer.remove(); });
  }

  // ══════════ ASML-style Count-Up Animation ══════════
  var glanceGrid = document.getElementById('glanceGrid');
  var glanceBg = document.getElementById('glanceBg');
  var glanceSection = document.getElementById('glanceSection');

  if (glanceSection && glanceBg) {
    function updateZoom() {
      var rect = glanceSection.getBoundingClientRect();
      var sectionTop = rect.top;
      var sectionHeight = rect.height;
      var viewHeight = window.innerHeight;

      // Calculate how much of the section is visible (0 to 1)
      var visibleTop = Math.max(0, 0 - sectionTop);
      var progress = Math.min(1, visibleTop / (sectionHeight * 0.5));

      // Scale from 1.25 down to 1.0 as user scrolls
      var scale = 1.25 - (progress * 0.25);
      glanceBg.style.transform = 'scale(' + scale + ')';

      // Fade overlay opacity
      var overlay = glanceSection.querySelector('.glance-overlay');
      if (overlay) {
        overlay.style.opacity = Math.min(1, progress * 1.3);
      }
    }
    window.addEventListener('scroll', updateZoom, { passive: true });
    updateZoom();
  }

  if (glanceGrid) {
    var counted = false;
    function countUp(el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      var duration = 2000;
      var start = performance.now();
      function tick(now) {
        var elapsed = now - start;
        var progress = Math.min(elapsed / duration, 1);
        // Ease-out curve
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(eased * target);
        el.textContent = current.toLocaleString();
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString();
      }
      requestAnimationFrame(tick);
    }
    var observer = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        glanceGrid.querySelectorAll('.glance-number').forEach(function(el) {
          setTimeout(function() { countUp(el); }, 200);
        });
      }
    }, { threshold: 0.3 });
    observer.observe(glanceGrid);
  }

  function esc(t) {
    if (!t) return '';
    var d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
  }
})();