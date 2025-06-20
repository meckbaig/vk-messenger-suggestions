document.getElementById("run").addEventListener("click", () => {
  console.log("[VK-HINT] Нажата кнопка в popup");

  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.executeScript(tabs[0].id, {
      code: 
        'alert("Привет из popup.js!");'
    });
  });
});
