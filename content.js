console.log("CHRONOLOCK ACTIVE");

// ---------------------------
// STATE
// ---------------------------

let state = {
  enabled: true,
  cutoffYear: 2018,
  mode: "hidden" // hidden | dim | fade
};

// ensure sane default on load
function normalizeState() {
  if (
    typeof state.cutoffYear !== "number" ||
    isNaN(state.cutoffYear)
  ) {
    state.cutoffYear = 2018;
  }
}

// ---------------------------
// STORAGE
// ---------------------------

function saveState() {
  (browser.storage?.sync || chrome.storage.sync)
    .set({ chronolock: state });
}

function loadState() {
  return (browser.storage?.sync || chrome.storage.sync)
    .get("chronolock")
    .then((res) => {
      if (res && res.chronolock) {
        state = { ...state, ...res.chronolock };
      }
      normalizeState();
    })
    .catch(() => {
      normalizeState();
    });
}

// ---------------------------
// CSS
// ---------------------------

const style = document.createElement("style");
style.textContent = `
.chronolock-hidden {
  display: none !important;
}

.chronolock-dim {
  opacity: 0.15 !important;
  filter: grayscale(1);
  transition: opacity 0.2s ease;
}

.chronolock-fade {
  opacity: 0 !important;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

#chronolock-ui {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 999999;

  width: 260px;

  padding: 12px;
  border-radius: 14px;

  font-size: 12px;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;

  color: rgba(255,255,255,0.92);

  background: rgba(25, 25, 25, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  border: 1px solid rgba(255,255,255,0.14);

  box-shadow:
    0 10px 30px rgba(0,0,0,0.5),
    inset 0 1px 0 rgba(255,255,255,0.06);
}

#chronolock-toggle {
  cursor: pointer;
  user-select: none;

  padding: 10px;
  border-radius: 12px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  font-weight: 650;
  letter-spacing: 0.06em;

  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
}

#chronolock-panel {
  margin-top: 10px;
}

/* centered blocks */
.chronolock-section {
  margin-top: 10px;
  text-align: center;
}

.chronolock-presets {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

/* FIX: proper centering for dropdown */
.chronolock-mode-wrap {
  display: flex;
  justify-content: center;
  margin-top: 6px;
}

#chronolock-mode {
  width: 120px;
}

#chronolock-panel button {
  cursor: pointer;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.06);
  color: inherit;
  padding: 4px 8px;
}

#chronolock-panel input,
#chronolock-panel select {
  background: rgba(0,0,0,0.25);
  color: white;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  padding: 4px;
}
`;
document.head.appendChild(style);

// ---------------------------
// UI
// ---------------------------

function updateToggleText(ui) {
  const toggle = ui.querySelector("#chronolock-toggle");
  if (!toggle) return;

  toggle.innerHTML = `
    <span>
      ${state.enabled ? "🔒" : "🔓"} ${state.cutoffYear}
    </span>
    <span style="opacity:0.85; font-weight:600; letter-spacing:0.12em;">
      CHRONOLOCK
    </span>
  `;
}

function syncControls(ui) {
  const slider = ui.querySelector("#chronolock-slider");
  const input = ui.querySelector("#chronolock-input");
  const mode = ui.querySelector("#chronolock-mode");

  if (slider) slider.value = state.cutoffYear;
  if (input) input.value = state.cutoffYear;
  if (mode) mode.value = state.mode;
}

function createUI() {
  if (document.getElementById("chronolock-ui")) return;

  normalizeState();

  const ui = document.createElement("div");
  ui.id = "chronolock-ui";

  ui.innerHTML = `
    <div id="chronolock-toggle"></div>

    <div id="chronolock-panel" style="display:none;">

      <div class="chronolock-section">
        Cutoff Year
      </div>

      <div style="display:flex; gap:6px; align-items:center; margin-top:6px;">
        <input id="chronolock-slider"
          type="range"
          min="2005"
          max="2026"
          style="flex:1;"
        />

        <input id="chronolock-input"
          type="number"
          min="2005"
          max="2026"
          style="width:70px;"
        />
      </div>

      <div class="chronolock-section">
        Presets
        <div class="chronolock-presets">
          <button data-year="2005">05'</button>
          <button data-year="2007">07'</button>
          <button data-year="2012">2012</button>
          <button data-year="2016">2016</button>
          <button data-year="2018">2018</button>
        </div>
      </div>

      <div class="chronolock-section">
        Mode
        <div class="chronolock-mode-wrap">
          <select id="chronolock-mode">
            <option value="hidden">Hide</option>
            <option value="dim">Dim</option>
            <option value="fade">Fade</option>
          </select>
        </div>
      </div>

      <div style="margin-top:10px;">
        <button id="chronolock-enable" style="width:100%;">
          Toggle
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(ui);

  const toggle = ui.querySelector("#chronolock-toggle");
  const panel = ui.querySelector("#chronolock-panel");
  const slider = ui.querySelector("#chronolock-slider");
  const input = ui.querySelector("#chronolock-input");
  const mode = ui.querySelector("#chronolock-mode");
  const enableBtn = ui.querySelector("#chronolock-enable");

  updateToggleText(ui);
  syncControls(ui);

  toggle.addEventListener("click", () => {
    panel.style.display =
      panel.style.display === "none" ? "block" : "none";
  });

  enableBtn.addEventListener("click", () => {
    state.enabled = !state.enabled;
    updateToggleText(ui);
    saveState();
    runFilter();
  });

  slider.addEventListener("input", (e) => {
    state.cutoffYear = parseInt(e.target.value, 10);
    syncControls(ui);
    updateToggleText(ui);
    saveState();
    runFilter();
  });

  input.addEventListener("input", (e) => {
    state.cutoffYear = parseInt(e.target.value, 10);
    syncControls(ui);
    updateToggleText(ui);
    saveState();
    runFilter();
  });

  ui.querySelectorAll("button[data-year]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.cutoffYear = parseInt(btn.dataset.year, 10);
      syncControls(ui);
      updateToggleText(ui);
      saveState();
      runFilter();
    });
  });

  mode.addEventListener("change", (e) => {
    state.mode = e.target.value;
    saveState();
    runFilter();
  });
}

// ---------------------------
// VIDEO COLLECTION
// ---------------------------

function getVideos() {
  return Array.from(
    document.querySelectorAll("ytd-rich-item-renderer, ytd-video-renderer")
  );
}

// ---------------------------
// YEAR PARSING
// ---------------------------

function getYear(text) {
  if (!text) return null;

  text = text.toLowerCase();

  const now = new Date();
  const currentYear = now.getFullYear();

  let m = text.match(/(\d+)\s+year[s]?\s+ago/);
  if (m) return currentYear - parseInt(m[1], 10);

  m = text.match(/(\d+)\s+(month|week|day|hour|minute)[s]?\s+ago/);
  if (m) return currentYear;

  if (text.includes("streamed") || text.includes("today")) {
    return currentYear;
  }

  return null;
}

// ---------------------------
// FILTERING (UNCHANGED)
// ---------------------------

function resetVideo(v) {
  v.classList.remove(
    "chronolock-hidden",
    "chronolock-dim",
    "chronolock-fade"
  );
}

function applyMode(v) {
  v.classList.remove(
    "chronolock-hidden",
    "chronolock-dim",
    "chronolock-fade"
  );

  if (state.mode === "dim") {
    v.classList.add("chronolock-dim");
  } else if (state.mode === "fade") {
    v.classList.add("chronolock-fade");
  } else {
    v.classList.add("chronolock-hidden");
  }
}

function runFilter() {
  const videos = getVideos();

  console.log("VIDEOS FOUND:", videos.length);

  videos.forEach((v) => {
    resetVideo(v);

    const text = v.innerText || "";
    const year = getYear(text);

    if (
      state.enabled &&
      year !== null &&
      year > state.cutoffYear
    ) {
      applyMode(v);
    }
  });
}

// ---------------------------
// OBSERVER
// ---------------------------

let filterTimeout = null;

function startObserver() {
  const observer = new MutationObserver(() => {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(runFilter, 150);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  runFilter();
  console.log("CHRONOLOCK OBSERVER ACTIVE");
}

// ---------------------------
// INIT
// ---------------------------

loadState().then(() => {
  createUI();
  startObserver();
});