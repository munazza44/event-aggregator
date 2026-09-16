// Default sample events — used only if nothing is saved yet
let defaultEvents = [
  {
    title: "Web Dev Workshop",
    category: "Workshop",
    date: "2026-09-20",
    description: "Learn HTML, CSS and JS basics in 2 hours."
  },
  {
    title: "Code Sprint Hackathon",
    category: "Hackathon",
    date: "2026-09-25",
    description: "24-hour coding competition with prizes."
  },
  {
    title: "AI Seminar",
    category: "Seminar",
    date: "2026-09-22",
    description: "Guest talk on real-world AI applications."
  }
];

// Load events from localStorage if they exist, otherwise use defaults
let events = JSON.parse(localStorage.getItem("events")) || defaultEvents;

function saveEvents() {
  localStorage.setItem("events", JSON.stringify(events));
}

function renderEvents(eventsToShow) {
  const listDiv = document.getElementById("event-list");
  listDiv.innerHTML = "";

  eventsToShow.forEach(event => {
    const card = document.createElement("div");
    card.className = "event-card";

        card.innerHTML = `
      <span class="category-tag">${event.category}</span>
      <h2>${event.title}</h2>
      <p><strong>Date:</strong> ${event.date}</p>
      <p>${event.description}</p>
      <button class="register-btn" onclick="registerEvent('${event.title}')">Register</button>
    `;

    listDiv.appendChild(card);
  });
}

function filterEvents(category) {
  if (category === "All") {
    renderEvents(events);
  } else {
    const filtered = events.filter(event => event.category === category);
    renderEvents(filtered);
  }
}

function addEvent() {
  const title = document.getElementById("input-title").value;
  const category = document.getElementById("input-category").value;
  const date = document.getElementById("input-date").value;
  const description = document.getElementById("input-description").value;

  if (title === "" || date === "" || description === "") {
    alert("Please fill in all fields.");
    return;
  }

  const newEvent = { title, category, date, description };
  events.push(newEvent);
  saveEvents();
  renderEvents(events);

  // Clear the form
  document.getElementById("input-title").value = "";
  document.getElementById("input-date").value = "";
  document.getElementById("input-description").value = "";
}

// Show all events when page first loads
renderEvents(events);
function registerEvent(title) {
  alert("You have registered for: " + title);
}