document.addEventListener('DOMContentLoaded', () => {
  const dayTabs = document.getElementById('dayTabs');
  const scheduleEl = document.getElementById('schedule');
  const searchInput = document.getElementById('search');
  const typeCheckboxes = document.querySelectorAll('.type-filters input');

  let activeDay = 'all';
  let searchTerm = '';
  let activeTypes = new Set(['nextgen', 'official']);

  // Build day tabs
  const allTab = document.createElement('button');
  allTab.className = 'day-tab active';
  allTab.textContent = 'All Days';
  allTab.dataset.day = 'all';
  allTab.onclick = () => setDay('all');
  dayTabs.appendChild(allTab);

  schedule.forEach(day => {
    const tab = document.createElement('button');
    tab.className = 'day-tab';
    tab.textContent = day.dayShort;
    tab.dataset.day = day.date;
    tab.onclick = () => setDay(day.date);
    dayTabs.appendChild(tab);
  });

  function setDay(day) {
    activeDay = day;
    document.querySelectorAll('.day-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.day === day);
    });
    render();
  }

  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase();
    render();
  });

  typeCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) activeTypes.add(cb.value);
      else activeTypes.delete(cb.value);
      render();
    });
  });

  function getMapsLink(location) {
    const query = encodeURIComponent(location + ', Donaueschingen');
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  function matches(event) {
    if (!activeTypes.has(event.type)) return false;
    if (!searchTerm) return true;
    const text = `${event.title} ${event.location} ${event.description || ''}`.toLowerCase();
    return text.includes(searchTerm);
  }

  function render() {
    scheduleEl.innerHTML = '';
    let hasAny = false;

    const daysToShow = activeDay === 'all' 
      ? schedule 
      : schedule.filter(d => d.date === activeDay);

    daysToShow.forEach(day => {
      const filtered = day.events.filter(matches);
      if (filtered.length === 0) return;
      hasAny = true;

      const section = document.createElement('div');
      section.className = 'day-section';

      const header = document.createElement('h2');
      header.className = 'day-header';
      header.innerHTML = `<span>${day.day}</span><span style="font-size:0.85rem;color:var(--text-muted);font-weight:500">${filtered.length} event${filtered.length > 1 ? 's' : ''}</span>`;
      section.appendChild(header);

      filtered.forEach(ev => {
        const card = document.createElement('div');
        card.className = `event ${ev.type}`;
        card.innerHTML = `
          <div class="event-header">
            <div class="event-time">${ev.time}</div>
            <div class="event-title">${ev.title}</div>
            <span class="event-badge badge-${ev.type}">${ev.type === 'nextgen' ? 'Next Gen' : 'Festival'}</span>
          </div>
          <div class="event-location">📍 ${ev.location}</div>
          ${ev.description ? `<div class="event-description">${ev.description}</div>` : ''}
          <div class="event-actions">
            <a href="${getMapsLink(ev.location)}" target="_blank" rel="noopener">Open in Maps</a>
          </div>
        `;
        card.onclick = (e) => {
          if (e.target.tagName === 'A') return;
          card.classList.toggle('expanded');
        };
        section.appendChild(card);
      });

      scheduleEl.appendChild(section);
    });

    if (!hasAny) {
      scheduleEl.innerHTML = '<div class="empty">No events match your filters.</div>';
    }
  }

  render();
});
