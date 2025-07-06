if ('VKIDSDK' in window) {
const VKID = window.VKIDSDK;

VKID.Config.init({
app: window.CONFIG.API.VK_APP_ID,
redirectUrl: 'https://oauth.vk.com/blank.html',
responseMode: VKID.ConfigResponseMode.Callback,
source: VKID.ConfigSource.LOWCODE,
scope: '', // Заполните нужными доступами по необходимости
mode: VKID.ConfigAuthMode.InNewWindow,
});


const oneTap = new VKID.OneTap();

oAuth.render({
container: document.currentScript.parentElement,
oauthList: [
    'vkid'
]
})
.on(VKID.WidgetEvents.ERROR, vkidOnError)
.on(VKID.OAuthListInternalEvents.LOGIN_SUCCESS, function (payload) {
    const code = payload.code;
    const deviceId = payload.device_id;

    VKID.Auth.exchangeCode(code, deviceId)
        .then(vkidOnSuccess)
        .catch(vkidOnError);
});

function vkidOnSuccess(data) {
    browser.storage.local.set({ vkUserId: data.user.id, vkToken: data.token });
    console.log(data);  
}

function vkidOnError(error) {
    console.error(error);
// Обработка ошибки
}
}