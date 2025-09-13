// take_classes.js
document.addEventListener("DOMContentLoaded", function () {
  // Initialize Flatpickr Calendar
  const calendar = flatpickr("#calendar", {
    inline: true,
    minDate: "today",
    dateFormat: "Y-m-d",
    onChange: function (selectedDates, dateStr) {
      console.log(
        "📅 Flatpickr onChange, selectedDates:",
        selectedDates,
        "dateStr:",
        dateStr
      );
    },
  });

  // Handle class scheduling
  const scheduleBtn = document.querySelector(".schedule-btn");
  scheduleBtn.addEventListener("click", scheduleClass);

  // Load upcoming classes
  loadUpcomingClasses();
});

async function scheduleClass() {
  console.log("🚀 scheduleClass invoked");
  const classData = {
    type: document.getElementById("classType").value,
    duration: document.getElementById("classDuration").value,
    level: document.getElementById("classLevel").value,
    maxParticipants: document.getElementById("maxParticipants").value,
    description: document.getElementById("classDescription").value,
    // DEBUG: check if this selector actually finds something
    dateElement: document.querySelector(".flatpickr-input"),
    date: document.querySelector(".flatpickr-input")?.value,
  };
  console.log("📝 Captured classData:", classData);

  // Validate form
  if (!validateClassData(classData)) {
    console.warn("❌ Validation failed:", classData);
    return;
  }

  try {
    // Build payload
    const payload = {
      scheduledAt: new Date(classData.date).toISOString(),
      classType: classData.type,
      duration: `${classData.duration} minutes`,
      difficultyLevel:
        classData.level.charAt(0).toUpperCase() + classData.level.slice(1),
      maxParticipants: Number(classData.maxParticipants),
      description: classData.description,
    };
    console.log("📤 Sending payload to API:", payload);

    // Send to API
    const res = await fetch("http://localhost:3001/api/classes", {
      method: "POST",
      credentials: "include", // send session cookie
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    console.log("⬅️ Fetch returned, status:", res.status);

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.error("⚠️ Server error body:", errBody);
      throw new Error(errBody.message || "Server rejected the request");
    }

    const created = await res.json();
    console.log("✅ Created class returned:", created);

    // Update the UI
    addClassToGrid({
      type: created.classType,
      date: created.scheduledAt,
      duration: parseInt(created.duration, 10),
      level: created.difficultyLevel,
      maxParticipants: created.maxParticipants,
    });
    resetForm();
    showNotification("Class scheduled successfully!");
  } catch (error) {
    console.error("💥 Failed to schedule class:", error);
    showNotification(error.message, "error");
  }
}

function validateClassData(data) {
  if (!data.type) {
    showNotification("Please select a class type", "error");
    return false;
  }
  if (!data.date) {
    showNotification("Please select a date", "error");
    return false;
  }
  return true;
}

function addClassToGrid(classData) {
  const classesGrid = document.querySelector(".classes-grid");
  const classCard = document.createElement("div");
  classCard.className = "class-card";

  classCard.innerHTML = `
      <div class="class-info">
        <div class="class-type">${classData.type}</div>
        <h3 class="class-title">${classData.type} Class - ${formatDate(
    classData.date
  )}</h3>
        <div class="class-meta">
          <span class="meta-item">
            <i class="far fa-clock"></i> ${classData.duration} mins
          </span>
          <span class="meta-item">
            <i class="fas fa-signal"></i> ${classData.level}
          </span>
          <span class="meta-item">
            <i class="fas fa-users"></i> ${classData.maxParticipants} spots
          </span>
        </div>
      </div>
    `;

  classesGrid.insertBefore(classCard, classesGrid.firstChild);
}

function loadUpcomingClasses() {
  // Sample data - replace with actual data from your backend
  const upcomingClasses = [
    {
      type: "HIIT",
      date: "2024-03-20",
      duration: 45,
      level: "Intermediate",
      maxParticipants: 20,
    },
    // Add more sample classes
  ];

  upcomingClasses.forEach((classData) => addClassToGrid(classData));
}

function resetForm() {
  document.getElementById("classType").value = "";
  document.getElementById("classDuration").value = "30";
  document.getElementById("classLevel").value = "beginner";
  document.getElementById("maxParticipants").value = "20";
  document.getElementById("classDescription").value = "";
}

function showNotification(message, type = "success") {
  // Implement your notification system here
  alert(message);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
