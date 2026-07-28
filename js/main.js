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

  // ══════════ At a Glance ══════════
  var glanceSection = document.getElementById('glanceSection');
  if (glanceSection) {
    var counted = false;
    function countUp(el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      var dur = 1800, start = performance.now();
      function tick(now) {
        var p = Math.min(1, (now - start) / dur);
        el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString();
      }
      requestAnimationFrame(tick);
    }
    var obs = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        glanceSection.querySelectorAll('.glance-num').forEach(function(el) {
          setTimeout(function() { countUp(el); }, 150);
        });
      }
    }, { threshold: 0.3 });
    obs.observe(glanceSection);
  }

  // 3D Tilt on cards
  document.querySelectorAll('.glance-card').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = 
        'translateY(-6px) scale(1.03) rotateX(' + (-y * 8) + 'deg) rotateY(' + (x * 12) + 'deg)';
    });
    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
    });
  });

  function esc(t) {
    if (!t) return '';
    var d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
  }
})();