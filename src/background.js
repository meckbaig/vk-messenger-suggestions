if (typeof browser === "undefined") {
  globalThis.browser = chrome;
}

browser.action.onClicked.addListener(() => {
  browser.windows.create({
    url: browser.runtime.getURL("popup/popup.html"),
    type: "popup",
    width: 420,
    height: 700,
    focused: true
  });
});