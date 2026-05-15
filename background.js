let state = {
  enabled: true,
  cutoffYear: 2018,
  mode: "vanish"
};

chrome.runtime.onInstalled?.addListener(() => {
  chrome.storage.sync.get(["chronolock"], (res) => {
    if (res.chronolock) state = { ...state, ...res.chronolock };
  });
});

browser.browserAction.onClicked.addListener((tab) => {
  state.enabled = !state.enabled;

  chrome.storage.sync.set({ chronolock: state });

  chrome.tabs.sendMessage(tab.id, {
    type: "CHRONOLOCK_TOGGLE",
    state
  });
});