let panelOpen = false;

const DEFAULT_STATE = {
  enabled: true,
  cutoffYear: 2018,
  mode: "vanish",
  presets: [2007, 2012, 2016, 2018]
};

let state = { ...DEFAULT_STATE };

chrome.storage.sync.get(["chronolock"], (res) => {
  if (res.chronolock) {
    state = {
      ...state,
      ...res.chronolock
    };
  }

  initUI();
});

function sync() {
  chrome.storage.sync.set({ chronolock: state });

  window.dispatchEvent(
    new CustomEvent("chronolock:update", {
      detail: state
    })
  );

  renderState();
}

function initUI() {
  injectIndicator();
  injectPanel();
  renderState();
}

function injectIndicator() {
  const el = document.createElement("div");
  el.id = "cl-indicator";

  Object.assign(el.style, {
    position: "fixed",
    top: "12px",
    right: "12px",
    zIndex: "999999",
    background: "rgba(0,0,0,0.85)",
    color: "white",
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontFamily: "sans-serif",
    cursor: "pointer",
    userSelect: "none"
  });

  el.onclick = () => {
    panelOpen = !panelOpen;

    document.getElementById("cl-panel").style.display =
      panelOpen ? "block" : "none";
  };

  document.body.appendChild(el);
}

function injectPanel() {
  const panel = document.createElement("div");

  panel.id = "cl-panel";

  Object.assign(panel.style, {
    position: "fixed",
    top: "44px",
    right: "12px",
    width: "230px",
    background: "#111",
    color: "white",
    padding: "12px",
    borderRadius: "10px",
    zIndex: "999999",
    display: "none",
    fontSize: "12px",
    fontFamily: "sans-serif"
  });

  panel.innerHTML = `
    <div style="font-weight:bold;margin-bottom:8px;">
      CHRONOLOCK
    </div>

    <div>Year</div>

    <input
      id="cl-range"
      type="range"
      min="2007"
      max="2025"
      step="1"
      style="width:100%;"
    >

    <input
      id="cl-number"
      type="number"
      style="width:100%;margin-top:6px;"
    >

    <div style="margin-top:10px;">
      Presets
    </div>

    <div
      id="cl-presets"
      style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px;"
    ></div>

    <div style="margin-top:10px;">
      Mode
    </div>

    <select id="cl-mode" style="width:100%;">
      <option value="vanish">vanish</option>
      <option value="dim">dim</option>
    </select>

    <button
      id="cl-toggle"
      style="width:100%;margin-top:10px;"
    >
      toggle
    </button>
  `;

  document.body.appendChild(panel);

  const range = panel.querySelector("#cl-range");
  const number = panel.querySelector("#cl-number");
  const mode = panel.querySelector("#cl-mode");

  range.value = state.cutoffYear;
  number.value = state.cutoffYear;
  mode.value = state.mode;

  range.oninput = (e) => {
    state.cutoffYear = parseInt(e.target.value, 10);
    number.value = state.cutoffYear;
    sync();
  };

  number.oninput = (e) => {
    state.cutoffYear = parseInt(e.target.value, 10);
    range.value = state.cutoffYear;
    sync();
  };

  mode.onchange = (e) => {
    state.mode = e.target.value;
    sync();
  };

  panel.querySelector("#cl-toggle").onclick = () => {
    state.enabled = !state.enabled;
    sync();
  };

  const presetBox = panel.querySelector("#cl-presets");

  state.presets.forEach((y) => {
    const b = document.createElement("button");

    b.textContent = y;

    b.onclick = () => {
      state.cutoffYear = y;
      range.value = y;
      number.value = y;
      sync();
    };

    presetBox.appendChild(b);
  });
}

function renderState() {
  const el = document.getElementById("cl-indicator");

  if (!el) return;

  el.textContent = state.enabled
    ? `🔒 CHRONOLOCK ${state.cutoffYear}`
    : "🔓 CHRONOLOCK";
}