"use strict";
// Theme switcher works on every page.
const themeButton = document.querySelector('[data-theme-toggle]');
const savedTheme = localStorage.getItem('portfolio-theme');
function applyTheme(theme) {
  document.body.dataset.theme = theme;
  if (themeButton) {
    themeButton.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
    themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
  }
}
applyTheme(savedTheme === 'dark' ? 'dark' : 'light');
if (themeButton) themeButton.addEventListener('click', () => {
  const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('portfolio-theme', next);
  applyTheme(next);
});

const projectList = document.querySelector('[data-project-list]');
if (projectList) {
  const filterButtons = [...document.querySelectorAll('[data-category]')];
  const searchInput = document.querySelector('[data-project-search]');
  const status = document.querySelector('[data-project-status]');
  let allProjects = [];
  let activeCategory = 'All';

  // Text is inserted via textContent rather than HTML for safe rendering.
  function makeElement(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function renderProjects() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const visible = allProjects.filter(project => {
      const categoryMatches = activeCategory === 'All' || project.category === activeCategory;
      const searchable = [project.title, project.description, project.category, ...(project.technologies || [])].join(' ').toLowerCase();
      return categoryMatches && searchable.includes(query);
    });
    projectList.replaceChildren();
    for (const project of visible) {
      const col = makeElement('div', 'col-md-6 col-lg-4');
      const card = makeElement('article', 'card project-card h-100');
      const body = makeElement('div', 'card-body d-flex flex-column');
      body.append(makeElement('span', 'badge project-category align-self-start mb-3', project.category));
      body.append(makeElement('h2', 'card-title h5', project.title));
      body.append(makeElement('p', 'card-text flex-grow-1', project.description));
      const tech = makeElement('div', 'd-flex flex-wrap gap-2 mt-2');
      for (const technology of project.technologies) tech.append(makeElement('span', 'badge project-tech', technology));
      body.append(tech); card.append(body); col.append(card); projectList.append(col);
    }
    if (!visible.length) projectList.append(makeElement('div', 'col-12 empty-state', 'No projects match your filters. Try another category or search.'));
    if (status) status.textContent = `${visible.length} project${visible.length === 1 ? '' : 's'} displayed.`;
  }
  for (const button of filterButtons) button.addEventListener('click', () => {
    activeCategory = button.dataset.category;
    for (const item of filterButtons) {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.classList.toggle('btn-primary', selected);
      item.classList.toggle('btn-outline-primary', !selected);
      item.setAttribute('aria-pressed', String(selected));
    }
    renderProjects();
  });
  searchInput?.addEventListener('input', renderProjects);
  fetch('data/projects.json')
    .then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
    .then(data => {
      if (!Array.isArray(data)) throw new Error('Projects JSON must be an array');
      allProjects = data;
      renderProjects();
    })
    .catch(error => {
      console.error('Unable to load projects:', error);
      if (status) status.textContent = 'Projects could not be loaded.';
      projectList.append(makeElement('div', 'col-12 empty-state', 'Unable to load projects. Open this site using Live Server, not file://.'));
    });
}
