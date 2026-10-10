/* =========================================================
   JavaScript DOM Activity: Navbar Dropdown (vanilla JS)
   ========================================================= */

// ---------- 1. Select the elements ----------
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const dropdowns = document.querySelectorAll(".dropdown");
const dropdownItems = document.querySelectorAll(".dropdown-item");
const selectedValue = document.getElementById("selectedValue");
const atomField = document.getElementById("atomField");

// ---------- 2. Dropdown helpers ----------
function closeDropdown(dropdown) {
  dropdown.classList.remove("open");
  dropdown.querySelector(".dropdown-toggle").setAttribute("aria-expanded", "false");
}

function closeAllDropdowns(except = null) {
  dropdowns.forEach((dropdown) => {
    if (dropdown !== except) closeDropdown(dropdown);
  });
}

function toggleDropdown(dropdown) {
  const isOpen = dropdown.classList.toggle("open");
  dropdown.querySelector(".dropdown-toggle").setAttribute("aria-expanded", String(isOpen));
  closeAllDropdowns(dropdown); // only one menu open at a time
}

// ---------- 3. Click a dropdown button to open/close ----------
dropdowns.forEach((dropdown) => {
  const button = dropdown.querySelector(".dropdown-toggle");
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleDropdown(dropdown);
  });
});

// ---------- 4. Pick an item: update the page through the DOM ----------
dropdownItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    selectedValue.textContent = item.textContent.trim();
    closeAllDropdowns();
    closeMobileMenu();
  });
});

// ---------- 5. Close when clicking outside ----------
document.addEventListener("click", (event) => {
  if (!event.target.closest(".dropdown")) closeAllDropdowns();
  if (!event.target.closest(".navbar")) closeMobileMenu();
});

// ---------- 6. Close with the Escape key ----------
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const openDropdown = document.querySelector(".dropdown.open");
  if (openDropdown) {
    closeDropdown(openDropdown);
    openDropdown.querySelector(".dropdown-toggle").focus();
  } else {
    closeMobileMenu();
  }
});

// ---------- 7. Mobile hamburger ----------
function closeMobileMenu() {
  navMenu.classList.remove("open");
  navToggle.classList.remove("active");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open menu");
}

navToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  const isOpen = navMenu.classList.toggle("open");
  navToggle.classList.toggle("active", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  if (!isOpen) closeAllDropdowns();
});

// ---------- 8. Green atoms background (created with the DOM) ----------
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function createAtom() {
  const atom = document.createElement("div");
  atom.className = "atom";

  atom.style.setProperty("--size", `${rand(110, 280)}px`);
  atom.style.setProperty("--alpha", rand(0.22, 0.55).toFixed(2));
  atom.style.setProperty("--spin", `${rand(30, 70)}s`);
  atom.style.left = `${rand(-5, 95)}%`;
  atom.style.top = `${rand(-5, 95)}%`;
  if (Math.random() > 0.5) atom.style.animationDirection = "reverse";

  // three tilted elliptical orbits, each with its own electron
  [0, 60, 120].forEach((angle, i) => {
    const tilt = document.createElement("div");
    tilt.className = "tilt";
    tilt.style.setProperty("--tilt", `${angle}deg`);
    tilt.style.setProperty("--orbit", `${rand(2.4, 4)}s`);
    tilt.style.setProperty("--delay", `${-i * 0.9}s`);
    tilt.innerHTML = `
      <div class="ring"></div>
      <div class="e-x"><div class="e-y"><div class="electron"></div></div></div>
    `;
    atom.appendChild(tilt);
  });

  const nucleus = document.createElement("div");
  nucleus.className = "nucleus";
  atom.appendChild(nucleus);

  return atom;
}

function buildAtoms(count) {
  for (let i = 0; i < count; i++) atomField.appendChild(createAtom());
}

buildAtoms(window.innerWidth < 600 ? 5 : 9);

// ---------- 9. GitHub projects (live from the GitHub API) ----------
const GITHUB_USER = "nadinelyn6-gif";
const repoGrid = document.getElementById("repoGrid");

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function createRepoCard(repo) {
  const card = document.createElement("article");
  card.className = "repo-card";
  card.setAttribute("role", "listitem");

  const top = document.createElement("div");
  top.className = "repo-top";

  const name = document.createElement("a");
  name.className = "repo-name";
  name.href = repo.html_url;
  name.target = "_blank";
  name.rel = "noopener noreferrer";
  name.textContent = repo.name;
  top.appendChild(name);

  if (repo.language) {
    const lang = document.createElement("span");
    lang.className = "repo-lang";
    lang.textContent = repo.language;
    top.appendChild(lang);
  }

  const desc = document.createElement("p");
  desc.className = "repo-desc";
  desc.textContent = repo.description || "No description provided.";

  const meta = document.createElement("div");
  meta.className = "repo-meta";

  const stars = document.createElement("span");
  stars.textContent = `\u2605 ${repo.stargazers_count}`;

  const updated = document.createElement("span");
  updated.textContent = `Updated ${formatDate(repo.updated_at)}`;

  meta.append(stars, updated);

  card.append(top, desc, meta);
  return card;
}

function showRepoStatus(message) {
  repoGrid.innerHTML = "";
  const p = document.createElement("p");
  p.className = "repo-status";
  p.textContent = message;
  repoGrid.appendChild(p);
  repoGrid.setAttribute("aria-busy", "false");
}

async function loadRepos() {
  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100`
    );
    if (!response.ok) throw new Error(`GitHub responded with ${response.status}`);

    const repos = await response.json();

    if (!Array.isArray(repos) || repos.length === 0) {
      showRepoStatus("No public repositories yet.");
      return;
    }

    repoGrid.innerHTML = "";
    repos
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .forEach((repo) => repoGrid.appendChild(createRepoCard(repo)));
    repoGrid.setAttribute("aria-busy", "false");
  } catch (error) {
    console.error("Could not load GitHub repositories:", error);
    showRepoStatus("Could not load projects right now. Please try again later.");
  }
}

if (repoGrid) loadRepos();
