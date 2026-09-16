// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDqmTmbV6rGrh_9ls83r8maqNUvamXHWCs",
  authDomain: "event-aggregator-9f462.firebaseapp.com",
  projectId: "event-aggregator-9f462",
  storageBucket: "event-aggregator-9f462.firebasestorage.app",
  messagingSenderId: "185454018433",
  appId: "1:185454018433:web:e694de8d87851a7649b280"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const eventsCollection = collection(db, "events");

let events = []; // will be filled from Firestore
let editingId = null;
let currentCategory = "All";

// Sample events to add to Firestore ONLY the first time (if database is empty)
const defaultEvents = [
  { title: "Web Dev Workshop", category: "Workshop", date: "2026-09-20", description: "Learn HTML, CSS and JS basics in 2 hours.", image: "" },
  { title: "Code Sprint Hackathon", category: "Hackathon", date: "2026-09-25", description: "24-hour coding competition with prizes.", image: "" },
  { title: "AI Seminar", category: "Seminar", date: "2026-09-22", description: "Guest talk on real-world AI applications.", image: "" },
  { title: "Cultural Fest Night", category: "Cultural", date: "2026-09-28", description: "Music, dance, and drama performances by students.", image: "" },
  { title: "App Design Bootcamp", category: "Workshop", date: "2026-10-02", description: "Hands-on UI/UX design workshop using Figma.", image: "" },
  { title: "Robotics Challenge", category: "Hackathon", date: "2026-10-05", description: "Build and race your own robot in this competition.", image: "" },
  { title: "Career Guidance Seminar", category: "Seminar", date: "2026-09-30", description: "Industry experts share career tips and Q&A.", image: "" },
  { title: "Annual Dance Competition", category: "Cultural", date: "2026-10-08", description: "Solo and group dance battles across categories.", image: "" }
];

async function loadEvents() {
  const snapshot = await getDocs(eventsCollection);

  if (snapshot.empty) {
    // Database is empty — add default events once
    for (const ev of defaultEvents) {
      await addDoc(eventsCollection, ev);
    }
    // Reload after adding
    const newSnapshot = await getDocs(eventsCollection);
    events = newSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } else {
    events = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  applyFilters();
  showNotifications();
}

function renderEvents(eventsToShow) {
  const listDiv = document.getElementById("event-list");
  listDiv.innerHTML = "";

  const sorted = [...eventsToShow].sort((a, b) => new Date(a.date) - new Date(b.date));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  sorted.forEach(event => {
    const card = document.createElement("div");
    card.className = "event-card";

    const eventDate = new Date(event.date);
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let statusHtml = "";
    if (diffDays < 0) {
      statusHtml = `<span class="status-tag past">Past</span>`;
    } else if (diffDays === 0) {
      statusHtml = `<span class="status-tag today">Today</span>`;
    } else {
      statusHtml = `<span class="status-tag upcoming">${diffDays} day${diffDays > 1 ? "s" : ""} left</span>`;
    }

    const imageHtml = event.image
      ? `<img src="${event.image}" class="event-image" onerror="this.style.display='none'">`
      : "";

    card.innerHTML = `
      ${imageHtml}
      <div class="tag-row">
        <span class="category-tag ${event.category.toLowerCase()}">${event.category}</span>
        ${statusHtml}
      </div>
      <h2>${event.title}</h2>
      <p><strong>Date:</strong> ${event.date}</p>
      <p>${event.description}</p>
      <button class="register-btn" onclick="registerEvent('${event.title}')">Register</button>
    `;

    listDiv.appendChild(card);
  });
}

function filterEvents(category) {
  currentCategory = category;
  applyFilters();
}

function searchEvents() {
  applyFilters();
}

function applyFilters() {
  const searchText = document.getElementById("search-box").value.toLowerCase();

  let result = events;

  if (currentCategory !== "All") {
    result = result.filter(event => event.category === currentCategory);
  }

  if (searchText !== "") {
    result = result.filter(event => event.title.toLowerCase().includes(searchText));
  }

  renderEvents(result);
}

async function addEvent() {
  const title = document.getElementById("input-title").value;
  const category = document.getElementById("input-category").value;
  const date = document.getElementById("input-date").value;
  const description = document.getElementById("input-description").value;
  const image = document.getElementById("input-image").value;

  if (title === "" || date === "" || description === "") {
    alert("Please fill in all fields.");
    return;
  }

  const newEvent = { title, category, date, description, image };

  if (editingId !== null) {
    const eventRef = doc(db, "events", editingId);
    await updateDoc(eventRef, newEvent);
    editingId = null;
    document.querySelector("#add-event-form button").textContent = "Add Event";
  } else {
    await addDoc(eventsCollection, newEvent);
  }

  clearForm();
  await loadEvents();
}

function clearForm() {
  document.getElementById("input-title").value = "";
  document.getElementById("input-date").value = "";
  document.getElementById("input-description").value = "";
  document.getElementById("input-image").value = "";
}

function startEdit(id) {
  const event = events.find(e => e.id === id);
  document.getElementById("input-title").value = event.title;
  document.getElementById("input-category").value = event.category;
  document.getElementById("input-date").value = event.date;
  document.getElementById("input-description").value = event.description;
  document.getElementById("input-image").value = event.image;

  editingId = id;
  document.querySelector("#add-event-form button").textContent = "Update Event";
  window.scrollTo(0, document.body.scrollHeight);
}

async function deleteEvent(id) {
  if (!confirm("Delete this event?")) return;
  await deleteDoc(doc(db, "events", id));
  await loadEvents();
}

function registerEvent(title) {
  alert("You have registered for: " + title);
}

function showNotifications() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const soonEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  });

  const banner = document.getElementById("notification-banner");

  if (soonEvents.length === 0) {
    banner.style.display = "none";
    return;
  }

  const names = soonEvents.map(e => e.title).join(", ");
  banner.innerHTML = `🔔 ${soonEvents.length} event${soonEvents.length > 1 ? "s" : ""} coming up soon: ${names}`;
  banner.style.display = "block";
}

// Expose functions to window so onclick="..." in HTML can find them
// (required because this file is now a module, which hides functions by default)
window.filterEvents = filterEvents;
window.searchEvents = searchEvents;
window.addEvent = addEvent;
window.registerEvent = registerEvent;
window.startEdit = startEdit;
window.deleteEvent = deleteEvent;

// Load events from Firestore when page opens
loadEvents();
