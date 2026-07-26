/* ============================================
   Fatec System — Main JavaScript
   Handles: header scroll, mobile menu, search,
            carousel, blog loading from CMS
   ============================================ */

(function() {
  'use strict';

  // ---- Header scroll effect ----
  var header = document.getElementById('siteHeader');
  if (header) {
    var lastScroll = 0;
    window.addEventListener('scroll', function() {
      var currentScroll = window.pageYOffset;
      if (currentScroll > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastScroll = currentScroll;
    });
  }

  // ---- Mobile menu toggle ----
  var menuToggle = document.getElementById('menuToggle');
  var mainNav = document.getElementById('mainNav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function() {
      menuToggle.classList.toggle('active');
      mainNav.classList.toggle('active');
      var expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !expanded);
    });
  }

  // ---- Search toggle ----
  var searchToggle = document.getElementById('searchToggle');
  var searchBar = document.getElementById('searchBar');
  if (searchToggle && searchBar) {
    searchToggle.addEventListener('click', function() {
      searchBar.classList.toggle('active');
      if (searchBar.classList.contains('active')) {
        var input = searchBar.querySelector('input');
        if (input) input.focus();
      }
    });
  }

  // ---- Carousel ----
  var carousel = document.getElementById('globalCarousel');
  if (carousel) {
    var track = carousel.querySelector('.carousel-track');
    var items = carousel.querySelectorAll('.carousel-item');
    var prevBtn = document.getElementById('carouselPrev');
    var nextBtn = document.getElementById('carouselNext');
    var currentIndex = 0;
    var itemsPerView = 3;

    function updateItemsPerView() {
      if (window.innerWidth <= 768) {
        itemsPerView = 1;
      } else if (window.innerWidth <= 1024) {
        itemsPerView = 2;
      } else {
        itemsPerView = 3;
      }
    }

    function updateCarousel() {
      var maxIndex = Math.max(0, items.length - itemsPerView);
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      if (currentIndex < 0) currentIndex = 0;

      var itemWidth = items[0].offsetWidth + 16;
      var offset = -currentIndex * itemWidth;
      track.style.transform = 'translateX(' + offset + 'px)';

      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        currentIndex--;
        updateCarousel();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        currentIndex++;
        updateCarousel();
      });
    }

    window.addEventListener('resize', function() {
      updateItemsPerView();
      updateCarousel();
    });

    // Touch/swipe support
    var touchStartX = 0;
    var touchEndX = 0;

    track.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          currentIndex++;
        } else {
          currentIndex--;
        }
        updateCarousel();
      }
    }

    updateItemsPerView();
    updateCarousel();
  }

  // ---- Blog posts loader (Decap CMS / GitHub) ----
  var blogContainer = document.getElementById('blog-posts');
  if (blogContainer) {
    loadBlogPosts();
  }

  function loadBlogPosts() {
    fetch('/posts/index.json')
      .then(function(response) {
        if (!response.ok) throw new Error('No posts found');
        return response.json();
      })
      .then(function(posts) {
        if (!posts || posts.length === 0) {
          blogContainer.innerHTML = '<p class="blog-empty">No blog posts yet. Visit <a href="/admin/">CMS admin</a> to create one.</p>';
          return;
        }

        var html = posts.map(function(post) {
          var date = post.date ? new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          }) : '';
          var excerpt = post.body ? post.body.substring(0, 120) + '...' : '';

          return '<article class="blog-post-card">' +
            '<div class="post-date">' + date + '</div>' +
            '<h3>' + escapeHtml(post.title) + '</h3>' +
            '<p>' + escapeHtml(excerpt) + '</p>' +
            '<a href="/posts/' + post.slug + '" class="btn-link">Read more →</a>' +
            '</article>';
        }).join('');

        blogContainer.innerHTML = html;
      })
      .catch(function(err) {
        blogContainer.innerHTML = '<p class="blog-empty">Blog posts will appear here once published via the <a href="/admin/">CMS admin</a>.</p>';
      });
  }

  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

})();
