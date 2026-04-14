/**
 * مُوجز 24 — News Store (localStorage)
 * Shared by admin.html, category.html, and index.html
 */

const MojazNewsStore = (() => {
  const STORAGE_KEY = 'mojaz24-news';

  function getAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function save(news) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(news));
  }

  function add(item) {
    const news = getAll();
    news.unshift({
      id: Date.now().toString(),
      title: item.title || '',
      content: item.content || '',
      category: item.category || '',
      image: item.image || '',
      video: item.video || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    save(news);
    return news[0];
  }

  function update(id, item) {
    const news = getAll();
    const idx = news.findIndex(n => n.id === id);
    if (idx === -1) return null;
    news[idx] = {
      ...news[idx],
      title: item.title || news[idx].title,
      content: item.content || news[idx].content,
      category: item.category || news[idx].category,
      image: item.image !== undefined ? item.image : news[idx].image,
      video: item.video !== undefined ? item.video : news[idx].video,
      updatedAt: new Date().toISOString()
    };
    save(news);
    return news[idx];
  }

  function remove(id) {
    const news = getAll().filter(n => n.id !== id);
    save(news);
  }

  function getById(id) {
    return getAll().find(n => n.id === id) || null;
  }

  function getByCategory(category) {
    return getAll().filter(n => n.category === category);
  }

  function getCategories() {
    const all = getAll();
    const cats = {};
    all.forEach(n => {
      cats[n.category] = (cats[n.category] || 0) + 1;
    });
    return cats;
  }

  return { STORAGE_KEY, getAll, getById, add, update, remove, getByCategory, getCategories };
})();

// Make available globally
window.MojazNewsStore = MojazNewsStore;
