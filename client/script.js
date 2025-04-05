function showSection(sectionId) {
  // Switch screen visibility
  const screens = document.querySelectorAll('.screen');
  screens.forEach(s => {
    s.classList.remove('active');
  });

  const newSection = document.getElementById(sectionId);
  if (newSection) {
    newSection.classList.add('active');
  }

  // Highlight active nav tab
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.classList.remove('selected');
    if (item.getAttribute('data-section') === sectionId) {
      item.classList.add('selected');
    }
  });
}

const allNames = [
  "Maria A*******",
  "Jose B********",
  "Liza C********",
  "Ramon D********",
  "Sofia E********",
  "Andres F********",
  "Carla G********",
  "Ben H********",
  "Isabel I********",
  "Miguel Jordan"
];

window.addEventListener("DOMContentLoaded", () => {
  loadCircleData();

  const defaultSection = document.querySelector(".screen.active")?.id || "home-section";
  showSection(defaultSection);

  const contributeBtn = document.querySelector(".btn.contribute");
  if (contributeBtn) {
    contributeBtn.addEventListener("click", () => {
      const name = prompt("Enter your name to contribute:\n\n" + allNames.join("\n"));
      if (!name) return;

      fetch("http://localhost:3001/api/circle/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          loadCircleData();
        })
        .catch(err => {
          alert("Error submitting contribution");
          console.error(err);
        });
    });
  }
});

async function loadCircleData() {
  const res = await fetch("http://localhost:3001/api/circle");
  const data = await res.json();

  document.querySelector('.circle-amount').textContent = `₱${data.totalCollected.toLocaleString()}`;
  document.querySelector('.circle-subtext').textContent = `₱${(data.payoutAmount - data.totalCollected).toLocaleString()} more to payout`;

  const nextDate = new Date(data.nextPayout);
  const today = new Date();
  const daysLeft = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
  document.querySelector('.next-payout strong').textContent = `${daysLeft} day(s)`;

  const list = document.getElementById("circle-list");
  list.innerHTML = "";

  data.participants.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>${p.status === "Claimed" || p.status === "Pending" ? "✔️" : "❌"}</td>
      <td>${p.status === "Claimed" ? "✅" : ""}</td>
      <td>${p.status}</td>
    `;
    list.appendChild(tr);
  });
}


//  profile section added

function openCreditModal() {
  document.getElementById('creditModal').classList.remove('hidden');
}

function closeCreditModal() {
  document.getElementById('creditModal').classList.add('hidden');
}

function closeModalOutside(event) {
  const modal = document.getElementById('creditModal');
  if (event.target === modal) {
    closeCreditModal();
  }
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
  });
  document.getElementById(id)?.classList.remove("hidden");
}


// paluwagan functions

// Dummy Join Button Handler
function joinCircle(button) {
  alert(" You’ve joined the circle!");
  button.innerText = "Joined";
  button.disabled = true;
  button.classList.add("joined");
}

// Dummy Contribute Button Handler
function contributeToCircle(button) {
  alert(" Contribution successful!");
  button.innerText = "Paid";
  button.disabled = true;
  button.classList.add("paid");
}