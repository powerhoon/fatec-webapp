/* ═══════════════════════════════════════════════════════
   Fatec System — Main JavaScript
   ASML-style interactions
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ── DOM refs ──
  const header = document.getElementById('siteHeader');
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const searchToggle = document.getElementById('searchToggle');
  const searchBar = document.getElementById('searchBar');

  // ── Header scroll effect ──
  if (header) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ── Mobile menu toggle ──
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function() {
      const isOpen = mainNav.classList.contains('active');
      menuToggle.classList.toggle('active');
      mainNav.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', !isOpen);
    });

    // Close menu when clicking nav links (mobile)
    mainNav.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        if (mainNav.classList.contains('active')) {
          menuToggle.classList.remove('active');
          mainNav.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // ── Search toggle ──
  if (searchToggle && searchBar) {
    searchToggle.addEventListener('click', function() {
      const isOpen = searchBar.classList.contains('active');
      if (isOpen) {
        searchBar.classList.remove('active');
      } else {
        searchBar.classList.add('active');
        const input = searchBar.querySelector('input');
        if (input) input.focus();
      }
    });

    // Close search on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && searchBar.classList.contains('active')) {
        searchBar.classList.remove('active');
      }
    });
  }

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Scroll-based animation ──
  if ('IntersectionObserver' in window) {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' };

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.partner-card, .product-card, .service-item, .press-card').forEach(function(el) {
      observer.observe(el);
    });
  }

  // ── Blog preview loader ──
  const blogContainer = document.getElementById('blog-posts');
  if (blogContainer) {
    loadBlogPosts();
  }

  function loadBlogPosts() {
    fetch('/posts/index.json')
      .then(function(response) {
        if (!response.ok) throw new Error('No posts');
        return response.json();
      })
      .then(function(posts) {
        if (!posts || posts.length === 0) {
          blogContainer.innerHTML = '<p class="blog-empty">Blog posts will appear here once published.</p>';
          return;
        }
        blogContainer.innerHTML = posts.slice(0, 6).map(function(post) {
          const date = post.date ? new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          }) : '';
          return '<article class="press-card">' +
            '<p class="press-date">' + date + '</p>' +
            '<h3><a href="/posts/' + escapeHtml(post.slug || '') + '">' + escapeHtml(post.title) + '</a></h3>' +
            '</article>';
        }).join('');
      })
      .catch(function() {
        if (blogContainer) blogContainer.remove();
      });
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

})();