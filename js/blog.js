// Blog listing: fetch posts/index.json, filter, paginate
(function() {
  const blogContainer = document.getElementById('blog-list');
  const filterBtns = document.querySelectorAll('.blog-filter-btn');
  const pagination = document.getElementById('pagination');
  if (!blogContainer) return;

  let allPosts = [];
  const PER_PAGE = 6;
  let currentPage = 1;
  let currentCategory = 'all';

  async function loadPosts() {
    try {
      const res = await fetch('/posts/index.json');
      allPosts = await res.json();
      render();
    } catch (e) {
      blogContainer.innerHTML = '<p style="text-align:center;padding:3rem;">블로그 글을 불러오는 중입니다...</p>';
    }
  }

  function getFiltered() {
    let posts = [...allPosts];
    if (currentCategory !== 'all') {
      posts = posts.filter(p => p.category === currentCategory);
    }
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    return posts;
  }

  function render() {
    const filtered = getFiltered();
    const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * PER_PAGE;
    const pagePosts = filtered.slice(start, start + PER_PAGE);

    if (pagePosts.length === 0) {
      blogContainer.innerHTML = '<p style="text-align:center;padding:3rem;color:#6b7280;">해당 카테고리의 글이 없습니다.</p>';
    } else {
      blogContainer.innerHTML = pagePosts.map(p => `
        <article class="blog-card">
          <div class="blog-card-image" style="background:linear-gradient(135deg,${p.color||'#1a3a5c'},${p.color2||'#0d1f3a'});">
            <span class="blog-card-category">${p.category || 'General'}</span>
          </div>
          <div class="blog-card-body">
            <time class="blog-card-date">${new Date(p.date).toLocaleDateString('ko-KR', {year:'numeric',month:'long',day:'numeric'})}</time>
            <h3><a href="${p.link || '#'}">${p.title}</a></h3>
            <p>${p.excerpt || ''}</p>
            <a href="${p.link || '#'}" class="blog-card-cta">Read more →</a>
          </div>
        </article>
      `).join('');
    }

    // Pagination
    if (pagination) {
      pagination.innerHTML = Array.from({length: totalPages}, (_, i) => `
        <button class="page-btn${i+1 === currentPage ? ' active' : ''}" data-page="${i+1}">${i+1}</button>
      `).join('');
      pagination.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          currentPage = parseInt(btn.dataset.page);
          render();
          window.scrollTo({top: blogContainer.offsetTop - 100, behavior: 'smooth'});
        });
      });
    }
  }

  // Filter buttons
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.filter || 'all';
        currentPage = 1;
        render();
      });
    });
  }

  loadPosts();
})();