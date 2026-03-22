// background.js — Lumafold Service Worker

// Open fullscreen tab via keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === "open-fullscreen") {
    chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
  }
});

// When popup icon is clicked and extension is already open as a tab, focus it
// instead of opening a tiny popup — this is handled by default_popup in manifest
