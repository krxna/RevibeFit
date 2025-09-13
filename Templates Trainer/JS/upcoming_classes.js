// /JS/upcoming_classes.js

document.addEventListener("DOMContentLoaded", loadTrainerClasses);

async function loadTrainerClasses() {
  try {
    const res = await fetch("http://localhost:3001/api/classes/created", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to load classes");
    const classes = await res.json();

    const grid = document.querySelector(".classes-grid");
    grid.innerHTML = "";
    classes.forEach(renderClassCard);
  } catch (err) {
    console.error("Error loading trainer classes:", err);
    alert("Could not load your classes.");
  }
}

function renderClassCard(cls) {
  const grid = document.querySelector(".classes-grid");
  const card = document.createElement("div");
  card.className = "class-card";
  card.dataset.id = cls._id;

  card.innerHTML = `
    <div class="class-info">
      <div class="class-type">${cls.classType}</div>
      <h3 class="class-title">
        ${cls.classType} — ${formatDate(cls.scheduledAt)}
      </h3>
      <div class="class-meta">
        <span class="meta-item">⏰ ${cls.duration}</span>
        <span class="meta-item">📊 ${cls.difficultyLevel}</span>
        <span class="meta-item">👥 ${cls.maxParticipants} spots</span>
      </div>
    </div>
    <div class="class-actions">
      <button class="btn-update">Update</button>
      <button class="btn-delete">Delete</button>
      <button class="btn-participants">See Participants</button>
    </div>
  `;
  grid.appendChild(card);

  // DELETE
  card.querySelector(".btn-delete").addEventListener("click", async () => {
    if (!confirm("Delete this class?")) return;
    try {
      const res = await fetch(`http://localhost:3001/api/classes/${cls._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      card.remove();
      alert("Class deleted");
    } catch (e) {
      console.error(e);
      alert("Could not delete class");
    }
  });

  // UPDATE → open edit modal
  card.querySelector(".btn-update").addEventListener("click", () => {
    showUpdateModal(cls);
  });

  // SEE PARTICIPANTS
  card
    .querySelector(".btn-participants")
    .addEventListener("click", async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/classes/${cls._id}/participants`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Fetch failed");
        const participants = await res.json();
        const names = participants.map((u) => u.name || u._id);
        showParticipantsModal(names);
      } catch (e) {
        console.error(e);
        alert("Could not load participants");
      }
    });
}

function formatDate(dt) {
  return new Date(dt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Full edit form modal
 */
function showUpdateModal(cls) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "modal-container";

  modal.innerHTML = `
    <h2>Edit Class</h2>
    <form class="update-form">
      <label>
        Class Type
        <select name="classType">
          <option value="HIIT">HIIT</option>
          <option value="Strength Training">Strength Training</option>
          <option value="Yoga">Yoga</option>
          <option value="Cardio">Cardio</option>
        </select>
      </label>
      <label>
        Date
        <input type="date" name="date" />
      </label>
      <label>
        Duration (minutes)
        <select name="duration">
          <option value="30">30</option>
          <option value="45">45</option>
          <option value="60">60</option>
          <option value="90">90</option>
        </select>
      </label>
      <label>
        Difficulty Level
        <select name="difficultyLevel">
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </label>
      <label>
        Max Participants
        <input type="number" name="maxParticipants" min="1" />
      </label>
      <label>
        Description
        <textarea name="description"></textarea>
      </label>
      <div class="modal-actions">
        <button type="submit" class="btn-primary">Save</button>
        <button type="button" class="btn-secondary">Cancel</button>
      </div>
    </form>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Pre-fill
  const form = modal.querySelector(".update-form");
  form.elements.classType.value = cls.classType;
  form.elements.date.value = cls.scheduledAt.slice(0, 10);
  form.elements.duration.value = parseInt(cls.duration, 10);
  form.elements.difficultyLevel.value = cls.difficultyLevel;
  form.elements.maxParticipants.value = cls.maxParticipants;
  form.elements.description.value = cls.description || "";

  // Cancel
  modal.querySelector(".btn-secondary").addEventListener("click", () => {
    overlay.remove();
  });

  // Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      scheduledAt: new Date(fd.get("date")).toISOString(),
      classType: fd.get("classType"),
      duration: `${fd.get("duration")} minutes`,
      difficultyLevel: fd.get("difficultyLevel"),
      maxParticipants: Number(fd.get("maxParticipants")),
      description: fd.get("description"),
    };

    try {
      const res = await fetch(`http://localhost:3001/api/classes/${cls._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Update failed");
      }
      alert("Class updated");
      overlay.remove();
      loadTrainerClasses();
    } catch (err) {
      console.error("Update error:", err);
      alert(err.message);
    }
  });
}

/**
 * Participants modal (unchanged)
 */
function showParticipantsModal(names) {
  // Overlay
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  // Modal
  const modal = document.createElement("div");
  modal.className = "modal-container";

  // Title
  const h2 = document.createElement("h2");
  h2.textContent = "Participants";
  modal.appendChild(h2);

  // Scrollable list
  const list = document.createElement("div");
  list.className = "modal-list";
  if (names.length === 0) {
    const none = document.createElement("div");
    none.textContent = "No one has enrolled yet.";
    list.appendChild(none);
  } else {
    names.forEach((n) => {
      const item = document.createElement("div");
      item.className = "modal-list-item";
      item.textContent = n;
      list.appendChild(item);
    });
  }
  modal.appendChild(list);

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.className = "modal-close";
  closeBtn.textContent = "Close";
  closeBtn.addEventListener("click", () => overlay.remove());
  modal.appendChild(closeBtn);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}
