import {Ajax} from "./config.js"
import {zyEditDropDown} from './zyElement.js'
import {showMessage,getResultPrompt} from './common.js'
const requestBaseURL="./cgi-bin"
const lang=document.querySelector('.language')
var curLanguage='en'
// lang.getContent().value='English'
const elementsToTranslate=document.querySelectorAll('.lang-translate')
const pass=document.querySelector('.pass')
const submit=document.querySelector('.login-form-submit')
const forgetpasswd=document.querySelector('.resetpass')
pass.addEventListener('input',function(){
    let allValid = true
    if (!validateInput(pass, '^[a-zA-Z0-9!@#$%^&*()_+]{6,8}$')) {
        allValid = false;
    }
    if(allValid){
        pass.style.border='1px solid #F5F6F9'
        submit.style.cursor='pointer'
        submit.style.backgroundColor='#676cc4'
    }else{
        pass.style.border='1px solid #DA4E51'
        submit.style.cursor='not-allowed'
        submit.style.backgroundColor='#AEBBCE'
    }
})
function validateInput(input, regex) {
    regex=new RegExp(regex)
    return regex.test(input.value);
}

submit.addEventListener('click',function(){
    if(submit.style.cursor='pointer'){
        var obj={}
        obj.time=new Date().getTime()
        obj.passwd=pass.value
        obj.language = (() => {
            var la=''
            if(lang.getContent().value == 'English'){
                la='en'
            }else{
                la='zh'
            }
            return la
        })()
        Ajax.post(`${requestBaseURL}/logger_in`,JSON.stringify(obj),function(c){
            c=JSON.parse(c)
            console.log(c)
            if(c.state == 1){
                sessionStorage.setItem('isLoggedIn', 'true')
                sessionStorage.setItem('language', curLanguage)
                getResultPrompt("result-Succ",lang)
                    .then(translateMessage => {
                        showMessage(translateMessage,2000,'succContent','&#xe616;')
                    })
                window.location.href='home.html'
            }else{
                getResultPrompt("result-Failed",lang)
                    .then(translateMessage => {
                        showMessage(translateMessage,2000,'failedContent','&#xed1b;')
                    })
            }
        },curLanguage)
    }
})

forgetpasswd.addEventListener('click',function(){
    window.location.href='loginResetpass.html'
})

const langDropDown=lang.getOptions()
langDropDown.addEventListener('click',function(event){
    if(event.target.classList.contains('option')){
        const clicklang=event.target.dataset.value
        if(clicklang == 'English'){
            curLanguage='en'
            lang.getContent().value='English'
        }else{
            curLanguage='zh'
            lang.getContent().value='中文简体'
        }
        fetch('../json/' + curLanguage + '.json')
        .then(response => response.json())
        .then(data => {
            elementsToTranslate.forEach(function(element) {
                var langKey = element.getAttribute('data-lang-key')
                // console.log(element.localName)
                if (data[langKey]) {
                    if(element.getAttribute('data-lang-type') == 'input'){
                        element.placeholder = data[langKey]
                    }else if(element.getAttribute('data-lang-type') == 'inputobj'){
                        element.placeholder = data[langKey].placeholder
                        element.value = data[langKey].value
                    }else if(element.getAttribute('data-lang-type') == 'dropdown'){
                        element.getContent().placeholder = data[langKey].placeholder
                        element.getContent().value = data[langKey].value
                    }else{
                        element.textContent = data[langKey]
                    }   
                }
            })
        })
        .catch(error => {
            console.log(error)
        })
    }
})

function loadLanguage() {
    fetch('../json/' + curLanguage + '.json')
      .then(response => response.json())
      .then(data => {
        elementsToTranslate.forEach(function(element) {
            var langKey = element.getAttribute('data-lang-key')
            // console.log(element.localName)
            if (data[langKey]) {
                if(element.getAttribute('data-lang-type') == 'input'){
                    element.placeholder = data[langKey]
                }else if(element.getAttribute('data-lang-type') == 'inputobj'){
                    element.placeholder = data[langKey].placeholder
                    element.value = data[langKey].value
                }else if(element.getAttribute('data-lang-type') == 'dropdown'){
                    element.getContent().placeholder = data[langKey].placeholder
                    element.getContent().value = data[langKey].value
                }else{
                    element.textContent = data[langKey]
                }   
            }
        })
    })
}

// 在页面加载时执行 loadLanguage()
window.onload = loadLanguage

// 会话存储 登录信息

