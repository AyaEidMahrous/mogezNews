/**
 * مُوجز 24 — Admin News Builder
 * Manages: add, edit, delete news via localStorage
 */

(function () {
  /* ---- Elements ---- */
  const form          = document.getElementById('adminNewsForm');
  const titleInput    = document.getElementById('newsTitle');
  const contentInput  = document.getElementById('newsContent');
  const categoryInput = document.getElementById('newsCategory');
  const imageInput    = document.getElementById('newsImage');
  const videoInput    = document.getElementById('newsVideo');
  const editIdInput   = document.getElementById('editNewsId');
  const submitBtn     = document.getElementById('submitBtn');
  const cancelBtn     = document.getElementById('cancelEditBtn');
  const formTitleEl   = document.getElementById('formTitle');
  const newsFeed      = document.getElementById('adminNewsFeed');
  const newsCountEl   = document.getElementById('newsCount');
  const statTotal     = document.getElementById('statTotal');
  const statCatCards  = document.getElementById('statCatCards');
  const filterSelect  = document.getElementById('filterCategory');
  const imagePreview  = document.getElementById('imagePreview');
  const imageFileName = document.getElementById('imageFileName');
  const deleteConfirmOverlay = document.getElementById('deleteConfirmOverlay');
  const deleteConfirmYes = document.getElementById('deleteConfirmYes');
  const deleteConfirmNo = document.getElementById('deleteConfirmNo');

  // In-memory image data for current form
  let currentImageData = '';
  let pendingDeleteId = null;

  /* ---- Image Upload Preview ---- */
  imageInput?.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (!file) return;
    imageFileName.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      currentImageData = e.target.result;
      if (imagePreview) {
        imagePreview.innerHTML = `<img src="${currentImageData}" alt="preview">`;
        imagePreview.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  });

  /* ---- Form Submit (Add / Edit) ---- */
  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const title    = titleInput.value.trim();
    const content  = contentInput.value.trim();
    const category = categoryInput.value;
    const video    = videoInput.value.trim();
    const id       = editIdInput.value;

    if (!title || !content || !category) {
      showToast('⚠️ يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const imageToUse = currentImageData || (id ? (MojazNewsStore.getAll().find(n => n.id === id)?.image || '') : '');

    if (id) {
      // Edit mode
      MojazNewsStore.update(id, { title, content, category, image: imageToUse, video });
      showToast('✅ تم تحديث الخبر بنجاح');
    } else {
      // Add mode
      MojazNewsStore.add({ title, content, category, image: imageToUse, video });
      showToast('✅ تم نشر الخبر بنجاح');
    }

    resetForm();
    renderAll();
  });

  /* ---- Cancel Edit ---- */
  cancelBtn?.addEventListener('click', () => {
    resetForm();
  });

  /* ---- Reset Form ---- */
  function resetForm() {
    form?.reset();
    editIdInput.value = '';
    currentImageData = '';
    if (imagePreview) { imagePreview.innerHTML = ''; imagePreview.style.display = 'none'; }
    if (imageFileName) imageFileName.textContent = 'اختر صورة...';
    if (formTitleEl) formTitleEl.textContent = 'إضافة خبر جديد';
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (submitBtn) submitBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg> نشر الخبر';
  }

  /* ---- Load into Edit Form ---- */
  function loadForEdit(id) {
    const news = MojazNewsStore.getAll().find(n => n.id === id);
    if (!news) return;

    editIdInput.value      = id;
    titleInput.value       = news.title;
    contentInput.value     = news.content;
    categoryInput.value    = news.category;
    videoInput.value       = news.video || '';
    currentImageData       = news.image || '';

    if (imagePreview && news.image) {
      imagePreview.innerHTML = `<img src="${news.image}" alt="preview">`;
      imagePreview.style.display = 'block';
      if (imageFileName) imageFileName.textContent = 'صورة محفوظة';
    }

    if (formTitleEl) formTitleEl.textContent = 'تعديل الخبر';
    if (cancelBtn)  cancelBtn.style.display = 'inline-flex';
    if (submitBtn)  submitBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg> حفظ التعديلات';

    // Scroll to form
    document.getElementById('adminFormCard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---- Delete ---- */
  function openDeleteConfirm(id) {
    pendingDeleteId = id;
    if (!deleteConfirmOverlay) return;
    deleteConfirmOverlay.classList.add('open');
    deleteConfirmOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    deleteConfirmYes?.focus();
  }

  function closeDeleteConfirm() {
    pendingDeleteId = null;
    if (!deleteConfirmOverlay) return;
    deleteConfirmOverlay.classList.remove('open');
    deleteConfirmOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function deleteNews(id) {
    openDeleteConfirm(id);
  }

  /* ---- Format Date ---- */
  function formatDate(ts) {
    return new Date(ts).toLocaleString('ar-EG', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  }

  /* ---- Escape HTML ---- */
  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  /* ---- Render Stats ---- */
  function renderStats() {
    const allNews = MojazNewsStore.getAll();
    if (statTotal) statTotal.textContent = allNews.length;

    if (!statCatCards) return;
    const cats = MojazNewsStore.getCategories();
    const topCats = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 4);
    statCatCards.innerHTML = topCats.map(([cat, count]) =>
      `<div class="admin-stat-sub"><span class="admin-stat-sub-num">${count}</span><span>${esc(cat)}</span></div>`
    ).join('');
    if (topCats.length > 0) statCatCards.style.display = 'flex';
  }

  /* ---- Populate Filter Select ---- */
  function populateFilter() {
    if (!filterSelect) return;
    const cats = MojazNewsStore.getCategories();
    // Keep "all" option
    filterSelect.innerHTML = '<option value="">كل التصنيفات</option>';
    Object.keys(cats).sort().forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = `${cat} (${cats[cat]})`;
      filterSelect.appendChild(opt);
    });
  }

  /* ---- Render News Feed ---- */
  function renderNewsFeed() {
    if (!newsFeed) return;
    const filterVal = filterSelect ? filterSelect.value : '';
    let allNews = MojazNewsStore.getAll();
    if (filterVal) allNews = allNews.filter(n => n.category === filterVal);

    if (newsCountEl) newsCountEl.textContent = `${allNews.length} خبر`;

    if (!allNews.length) {
      newsFeed.innerHTML = `<div class="comment-empty">لا توجد أخبار منشورة بعد. استخدم النموذج أعلاه لإضافة خبر.</div>`;
      return;
    }

    newsFeed.innerHTML = '';
    allNews.forEach(news => {
      const item = document.createElement('article');
      item.className = 'admin-news-item';
      item.innerHTML = `
        <div class="admin-news-item-inner">
          ${news.image ? `<div class="admin-news-thumb"><img src="${esc(news.image)}" alt="${esc(news.title)}" loading="lazy"></div>` : '<div class="admin-news-thumb admin-news-thumb-empty"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>'}
          <div class="admin-news-body">
            <div class="admin-news-meta">
              <span class="cat-card-badge">${esc(news.category)}</span>
              ${news.video ? '<span class="admin-has-video"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="6 3 20 12 6 21 6 3"/></svg> فيديو</span>' : ''}
              <time class="comment-time">${formatDate(news.createdAt)}</time>
              ${news.updatedAt !== news.createdAt ? `<span class="admin-edited">معدّل</span>` : ''}
            </div>
            <h4 class="admin-news-title">${esc(news.title)}</h4>
            <p class="admin-news-excerpt">${esc(news.content.length > 150 ? news.content.slice(0, 150) + '...' : news.content)}</p>
            <a href="article.html?id=${encodeURIComponent(news.id)}" class="admin-read-more">
              اقرأ المزيد
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
            </a>
          </div>
          <div class="admin-news-actions">
            <button class="admin-action-btn admin-edit-btn" data-id="${news.id}" title="تعديل">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              تعديل
            </button>
            <a href="article.html?id=${encodeURIComponent(news.id)}" class="admin-action-btn admin-view-btn" title="عرض الخبر">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              عرض
            </a>
            <button class="admin-action-btn admin-delete-btn" data-id="${news.id}" title="حذف">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              حذف
            </button>
          </div>
        </div>`;
      newsFeed.appendChild(item);
    });

    // Bind action buttons
    newsFeed.querySelectorAll('.admin-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => loadForEdit(btn.dataset.id));
    });
    newsFeed.querySelectorAll('.admin-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteNews(btn.dataset.id));
    });
  }

  /* ---- Render All ---- */
  function renderAll() {
    renderStats();
    populateFilter();
    renderNewsFeed();
  }

  /* ---- Filter change ---- */
  filterSelect?.addEventListener('change', renderNewsFeed);

  deleteConfirmYes?.addEventListener('click', () => {
    if (!pendingDeleteId) {
      closeDeleteConfirm();
      return;
    }
    MojazNewsStore.remove(pendingDeleteId);
    closeDeleteConfirm();
    showToast('🗑️ تم حذف الخبر');
    renderAll();
  });

  deleteConfirmNo?.addEventListener('click', closeDeleteConfirm);
  deleteConfirmOverlay?.addEventListener('click', (e) => {
    if (e.target === deleteConfirmOverlay) closeDeleteConfirm();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && deleteConfirmOverlay?.classList.contains('open')) {
      closeDeleteConfirm();
    }
  });

  /* ---- Initial Render ---- */
  renderAll();

  /* ---- Cross-tab sync ---- */
  window.addEventListener('storage', (e) => {
    if (e.key === MojazNewsStore.STORAGE_KEY) renderAll();
  });

})();
