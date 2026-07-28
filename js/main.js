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

  // ══════════ At a Glance — Mouse Parallax ══════════
  var glanceImg = document.getElementById('glanceImg');
  var glanceSection = document.getElementById('glanceSection');
  if (glanceImg && glanceSection) {
    glanceSection.addEventListener('mousemove', function(e) {
      var rect = glanceSection.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      glanceImg.style.transform = 'scale(1.12) translate(' + (x * -100) + 'px, ' + (y * -70) + 'px)';
    });
    glanceSection.addEventListener('mouseleave', function() {
      glanceImg.style.transform = 'scale(1.12)';
    });
  }

  // ══════════ Story Image Rotation — Mosaic Dissolve ══════════
  var slider = document.getElementById('storySlider');
  if (slider) {
    var imgs = slider.querySelectorAll('img');
    var canvas = document.getElementById('tileCanvas');
    var ctx = canvas.getContext('2d');
    var idx = 0;
    var busy = false;
    var COLS = 8, ROWS = 5;

    function mosaicSwitch() {
      if (busy) return;
      busy = true;
      var cur = imgs[idx];
      idx = (idx + 1) % imgs.length;
      var next = imgs[idx];

      // Setup canvas
      var w = slider.offsetWidth;
      var h = 500;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(cur, 0, 0, w, h);
      canvas.style.opacity = '1';

      var tw = w / COLS, th = h / ROWS;
      var tiles = [];
      for (var r = 0; r < ROWS; r++)
        for (var c = 0; c < COLS; c++)
          tiles.push({ r: r, c: c });
      // Shuffle for random dissolve
      tiles.sort(function() { return Math.random() - 0.5; });

      // Show the next image underneath
      next.classList.add('active');
      cur.classList.remove('active', 'exit');

      // Animate tiles fading out
      var start = performance.now();
      function anim(ts) {
        var elapsed = (ts - start) / 1000;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(cur, 0, 0, w, h);
        ctx.globalCompositeOperation = 'destination-out';

        for (var i = 0; i < tiles.length; i++) {
          var t = tiles[i];
          var delay = i * 0.015;
          if (elapsed > delay) {
            var p = Math.min(1, (elapsed - delay) / 0.3);
            p = 1 - Math.pow(1 - p, 2);
            ctx.globalAlpha = p;
            ctx.fillStyle = '#000';
            ctx.fillRect(t.c * tw, t.r * th, tw, th);
          }
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;

        if (elapsed < tiles.length * 0.015 + 0.3) {
          requestAnimationFrame(anim);
        } else {
          canvas.style.opacity = '0';
          busy = false;
        }
      }
      requestAnimationFrame(anim);
    }

    setInterval(mosaicSwitch, 4000);
  }

  function esc(t) {
    if (!t) return '';
    var d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
  }
})();