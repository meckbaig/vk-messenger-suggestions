document.getElementById("run").addEventListener("click", () => {
  console.log("[VK-HINT] Нажата кнопка в popup");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        alert("Привет из popup.js!");
      }
    });
  });
});
