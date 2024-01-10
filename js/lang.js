var curLangeage = "en";
loadLanguage();
// 判断浏览器当前语言
function loadLanguage () {
    var c = navigator.language || navigator.userLanguage;
    c = c.substr(0, 2);
    if (c == "zh") {
        curLangeage = "zh"
    } else {
        curLangeage = "en"
    }
    for (var a = 0; a < constHtmlLang.length; a++) {
        var b = constHtmlLang[a];
        if (b.type == "input") {
            setInputByLang(b.id, b[curLangeage]);
            continue
        }
        setTextByLang(b.id, b[curLangeage])
    }
}
function setTextByLang (b, a) {
    document.getElementById(b).innerText = a
}
function setInputByLang (b, a) {
    document.getElementById(b).setAttribute("placeholder", a)
}
function getPrompt (a) {
    return constPromptInfo[a][curLangeage]
}

const htmlLang = [
    { zh: "--", en: "--", id: "--", type: "text" },
    { zh: "--", en: "--", id: "--", type: "input" },
]
const promptInfo = {
    succ: { zh: "", en: "" },

}