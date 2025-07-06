browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "start-auth") {
      const redirectUri = 'https://oauth.vk.com/blank.html';
      const authUrl = `https://oauth.vk.com/authorize?client_id=${window.CONFIG.API.VK_APP_ID}&display=popup&redirect_uri=${encodeURIComponent(redirectUri)}&scope=offline&response_type=token&v=5.131`; // OAuth URL
      const authWindow = window.open(authUrl, "vk_auth", "width=600,height=600");
  
      const interval = setInterval(() => {
        try {
          const href = authWindow.location.href;
          if (href.includes("access_token")) {
            const params = new URLSearchParams(href.split('#')[1]);
            const token = params.get("access_token");
            const userId = params.get("user_id");
  
            browser.storage.local.set({ vkToken: token, vkUserId: userId });
            clearInterval(interval);
            authWindow.close();
          }
        } catch (e) {}
      }, 500);
    }
  });
  