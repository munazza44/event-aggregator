const API_URL = "https://event-aggregator-backend-api.onrender.com/events";
let eventsData = [];
let savedEventIds = JSON.parse(localStorage.getItem('savedEvents')) || [];
async function loadEvents() {
  try {
    const res = await fetch(API_URL);
    eventsData = await res.json();
    renderEvents(eventsData);
  } catch (err) {
    console.error("Failed to load events:", err);
  }
}


function renderEvents(list = eventsData) {
    const container = document.getElementById('event-list');
    const countLabel = document.getElementById('event-count-label');
    if (!container) return;
    
    container.innerHTML = '';
    if (countLabel) countLabel.textContent = `${list.length} events`;

    list.forEach(event => {
        const isSaved = savedEventIds.includes(event.id);
        const heartSymbol = isSaved ? '❤️' : '🤍';
        const savedClass = isSaved ? 'saved' : '';

        const card = document.createElement('div');
        card.className = 'event-card';

        card.innerHTML = `
            <div class="card-image-wrapper">
                <img src="${event.image}" class="event-image" alt="${event.title}">
                <div class="date-badge">
                    <span class="day">${event.day || '15'}</span>
                    <span class="month">${event.month || 'SEP'}</span>
                </div>
                <span class="category-tag">${event.category}</span>
            </div>
            <div class="card-content">
                <h3>${event.title}</h3>
                <div class="card-meta">
                    <span><i class="fa-regular fa-clock"></i> ${event.time || '10:00 AM'}</span>
                    <span><i class="fa-solid fa-location-dot"></i> ${event.location || 'Campus Center'}</span>
                </div>
                <p class="card-description">${event.description}</p>
                <div class="card-footer">
                    <button class="register-btn" onclick="registerEvent('${event.title.replace(/'/g, "\\'")}')">Register</button>
                    <button class="calendar-btn" onclick="addToGoogleCalendar('${event.title.replace(/'/g, "\\'")}', '${event.date}', '${event.description.replace(/'/g, "\\'")}')"><i class="fa-regular fa-calendar-plus"></i></button>
                    <button class="bookmark-btn ${savedClass}" onclick="toggleBookmark('${event.id}', this)">${heartSymbol}</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

window.searchEvents = function() {
    const query = document.getElementById('search-box').value.toLowerCase();
    const filtered = eventsData.filter(evt => evt.title.toLowerCase().includes(query) || evt.category.toLowerCase().includes(query));
    renderEvents(filtered);
};

window.filterEvents = function(category, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    if (category === 'All') {
        renderEvents(eventsData);
    } else if (category === 'Saved') {
        const savedList = eventsData.filter(evt => savedEventIds.includes(evt.id));
        renderEvents(savedList);
    } else {
        const filtered = eventsData.filter(evt => evt.category === category);
        renderEvents(filtered);
    }
};

window.toggleBookmark = function(eventId, btnElement) {
    if (savedEventIds.includes(eventId)) {
        savedEventIds = savedEventIds.filter(id => id !== eventId);
        btnElement.classList.remove('saved');
        btnElement.textContent = '🤍';
    } else {
        savedEventIds.push(eventId);
        btnElement.classList.add('saved');
        btnElement.textContent = '❤️';
    }
    localStorage.setItem('savedEvents', JSON.stringify(savedEventIds));
};

window.addToGoogleCalendar = function(title, dateStr, description) {
    const formattedDate = dateStr.replace(/-/g, '');
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formattedDate}T090000Z/${formattedDate}T170000Z&details=${encodeURIComponent(description)}`;
    window.open(calendarUrl, '_blank');
};

window.toggleMode = function() {
    const organizerSection = document.getElementById('organizer-section');
    if (organizerSection) {
        organizerSection.style.display = organizerSection.style.display === 'none' ? 'block' : 'none';
        organizerSection.scrollIntoView({ behavior: 'smooth' });
    }
};

window.registerEvent = function(eventTitle) {
    document.getElementById('modal-event-title').textContent = `Register for: ${eventTitle}`;
    document.getElementById('register-modal').style.display = 'flex';
};

window.closeModal = function() {
    document.getElementById('register-modal').style.display = 'none';
};

window.handleRegistration = function(e) {
    e.preventDefault();
    const name = document.getElementById('student-name').value;
    closeModal();
    alert(`🎉 Registered successfully for ${name}!`);
};

document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
});
window.addEvent = async function() {
  const title = document.getElementById('input-title').value;
  const category = document.getElementById('input-category').value;
  const date = document.getElementById('input-date').value;
  const description = document.getElementById('input-description').value;
  const image = document.getElementById('input-image').value || "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=500&q=80";

  if (!title || !date || !description) {
    alert("Please fill in all required fields.");
    return;
  }

  const dateObj = new Date(date);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = dateObj.toLocaleString('default', { month: 'short' });

  const newEvent = { title, category, date, day, month, time: "10:00 AM", location: "Campus Center", description, image };

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent)
    });

    document.getElementById('input-title').value = "";
    document.getElementById('input-date').value = "";
    document.getElementById('input-description').value = "";
    document.getElementById('input-image').value = "";

    await loadEvents();
  } catch (err) {
    console.error("Failed to add event:", err);
    alert("Could not add event. Check console for details.");
  }
};
