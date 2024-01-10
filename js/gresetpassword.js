import { Ajax } from "./config.js"
import { zyInput } from './zyElement.js'
import { showMessage, getPrompt, setzyInput, getzyInput } from './common.js'
const set_butt = document.querySelector(".set_butt")

const inputs = document.querySelectorAll('.currpass, .newpass')
function validateInput (input, regex) {
    regex = new RegExp(regex)
    return regex.test(input.value)
}

function checkAllInputs () {
    let allValid = true
    inputs.forEach((input, i) => {
        if (!validateInput(input.getContent(), '^[a-zA-Z0-9!@#$%^&*()_+]{6,8}$')) {
            allValid = false
        }
    });
    return allValid
}
function handleInputChange (event) {
    if (event.target.matches('.currpass, .newpass')) {
        enableOrDisableButton()
    }
}
inputs.forEach(input => {
    input.addEventListener('input', handleInputChange)
})
function enableOrDisableButton () {
    if (checkAllInputs()) {
        set_butt.style.cursor = 'pointer'
        set_butt.style.backgroundColor = '#676cc4'
    } else {
        set_butt.style.cursor = 'not-allowed'
        set_butt.style.backgroundColor = '#d8d8d8'
    }
}
set_butt.addEventListener("click", function () {
    if (set_butt.style.cursor == 'pointer') {
        var obj = {}
        obj.opasswd = document.querySelector('.currpass').getContent().value
        obj.npasswd = document.querySelector('.newpass').getContent().value
        Ajax.post(`/reset_password`, JSON.stringify(obj), function (c) {
            c = JSON.parse(c)
            console.log(c)
            if (c.state == 1) {
                showMessage(getPrompt("setSucc"), 2000, 'succContent', '&#xe616;')
            } else if (c.state == 0) {
                showMessage(getPrompt("setFailed"), 2000, 'failedContent', '&#xed1b;')
            } else {
                showMessage('原始密码有误', 2000, 'failedContent', '&#xed1b;')
            }
        })
    }
})










// change to previous page
const prepage = document.querySelector('.prepage')
prepage.addEventListener('click', function () {
    const parentDoc = window.parent.document;
    parentDoc.querySelectorAll('.nav2li')[4].click()
    // parentDoc.querySelector('.iframeCon').src='../html/gNetwork.html'
    // const onclk=parentDoc.querySelectorAll('.nav2li')
    // onclk[5].classList.remove("li2clk")
    // onclk[4].classList.add("li2clk")
    // parentDoc.querySelector(".cnav2").innerHTML=onclk[4].querySelector(".navname").innerHTML
})
