import {Ajax} from "./config.js"
import {zyInput} from './zyElement.js'
import {showMessage,getPrompt,setzyInput,getzyInput} from './common.js'
const setbutt = document.querySelector(".set_butt")
const refresh=document.querySelector('.refresh')
var obj={
    online_num : '',
    time:0,
}
var alloptionsvalue=[]
// 校验输入框数值是否合法
const inputs = document.querySelectorAll('.invOnline')
const selects=document.querySelectorAll('zy-dropdown')

var regexinv=new RegExp(document.querySelector('.invOnline').getAttribute('regex'))
var inputRegexMap=[regexinv]

selects.forEach((ele,i) => {
    alloptionsvalue.push([...ele.getOption()].map((option) => option.dataset.value))
})
function initInvNum(){
    Ajax.get(`/logger_face_get`,function(c){
        c=JSON.parse(c)
        console.log(c)
        try{
            setzyInput('.invOnline',c.sumdevnum)
            setzyInput('.usbFlash',getoptionValue(c.usb_mode,0))
            setzyInput('.com4mode',getoptionValue(c.com4_funelete,1))
            setzyInput('.enable485',getoptionValue(c.matchR485,2))
            setzyInput('.enable12V1Apowersupply',getoptionValue(c.power_supply,3))
        }catch(d){
            console.log(d)
        }
    })
}
initInvNum()
function getoptionValue(val,id){
    return alloptionsvalue[id][val]
}
// 若页面参数存在null或undefined
var invOnline=getinputdom('.invOnline')
var regex=new RegExp(document.querySelector('.invOnline').getAttribute('regex'))
var inputtext=getzyInputtext('.invOnline')
// invOnline.addEventListener('input',function(event){
//     var inputValue=getzyInput('.invOnline')
//     console.log(inputValue)
//     if (regex !== ''){
//         if(regex.test(inputValue)){
//             inputtext.style.border='1px solid #F5F6F9'
//             setbutt.style.cursor='pointer'
//             setbutt.style.backgroundColor='#676cc4'
//         }else{
//             inputtext.style.border='1px solid #DA4E51'
//             setbutt.style.cursor='not-allowed'
//             setbutt.style.backgroundColor='#d8d8d8'
//         }
//     }
// })
function ifFilled(){
    let allValid = true
    if(getzyInput('.invOnline') != '' && getzyInput('.invOnline') != undefined){
        var inputValue=getzyInput('.invOnline')
        if (regex !== ''){
            if(regex.test(inputValue)){
                inputtext.style.border='1px solid #F5F6F9'
                setbutt.style.cursor='pointer'
                setbutt.style.backgroundColor='#676cc4'
            }else{
                inputtext.style.border='1px solid #DA4E51'
                setbutt.style.cursor='not-allowed'
                setbutt.style.backgroundColor='#d8d8d8'
            }
        }
    }
    return allValid;
}


function validateInput(input, regex) {
    return regex.test(input.value);
}
function checkAllSelect(){
    let allValid = true
    const usbFlash=document.querySelector('.usbFlash').getContent().value
    const com4mode=document.querySelector('.com4mode').getContent().value
    const enable485=document.querySelector('.enable485').getContent().value
    const enable12V1Apowersupply=document.querySelector('.enable12V1Apowersupply').getContent().value
    if(usbFlash == '' || com4mode == '' || enable485 == '' || enable12V1Apowersupply == ''){
        allValid = false
    }
    return allValid
}
selects.forEach((ele,i) => {
    var options=ele.getOptions()
    options.addEventListener('click',function(){
        enableOrDisableButton()
    })
})

function checkAllInputs() {
    let allValid = true;
    inputs.forEach((input,i) => {
        if (!validateInput(input.getContent(), inputRegexMap[i])) {
            allValid = false;
        }
    })
    return allValid
}
function enableOrDisableButton() {
    if(checkAllInputs() && checkAllSelect()){
        setbutt.style.cursor='pointer'
        setbutt.style.backgroundColor='#676cc4'
    }else{
        setbutt.style.cursor='not-allowed'
        setbutt.style.backgroundColor='#d8d8d8'
    }
}

function handleInputChange(event) {
    if (event.target.matches('.invOnline')) {
        enableOrDisableButton();
    }
}

inputs.forEach(input => {
    input.addEventListener('input', handleInputChange);
});

enableOrDisableButton(); // 初始化时检查输入框状态

//获取input组件 外边框
function getzyInputtext(name){
    const custominput = document.querySelector(`${name}`)
    return custominput.getinputText()
}
// 或如input组件 input
function getinputdom(name){
    const custominput = document.querySelector(`${name}`)
    return custominput.getContent()
}

setbutt.addEventListener("click",function(){
    if(setbutt.style.cursor == 'pointer'){
        obj.time=new Date().getTime()
        obj.online_num = getzyInput('.invOnline')
        getoptionid('usb_mode','.usbFlash', 0)
        getoptionid('com4_funelete','.com4mode', 1)
        getoptionid('matchR485','.enable485', 2)
        getoptionid('power_supply','.enable12V1Apowersupply', 3)
        console.log(obj)
        Ajax.post(`/device_online_num`,JSON.stringify(obj),function(c){
            c=JSON.parse(c)
            console.log(c)
            if(c.state == 1){
                showMessage(getPrompt("setSucc"),2300,'succContent','&#xe616;')
            }else{
                showMessage(getPrompt("setFailed"),2300,'failedContent','&#xe60f;')
                initInvNum()
            }
        })
    }else{
        console.log('The button is disabled at this time.')
    }
})
function getoptionid(e,name,id){
    console.log(id)
    const usbFlashValue = document.querySelector(`${name}`).getContent().value
    obj[e] = alloptionsvalue[id].indexOf(usbFlashValue)
    console.log(alloptionsvalue[id].indexOf(usbFlashValue))
    return obj
}
// change to next page
const nextpage=document.querySelector('.nextpage')
nextpage.addEventListener('click',function(){
    const parentDoc = window.parent.document;
    parentDoc.querySelectorAll('.nav2li')[1].click()
    // parentDoc.querySelector('.iframeCon').src='../html/gTime.html'
    // const onclk=parentDoc.querySelectorAll('.nav2li')
    // onclk[0].classList.remove("li2clk")
    // onclk[1].classList.add("li2clk")
    // parentDoc.querySelector(".cnav2").innerHTML=onclk[1].querySelector(".navname").innerHTML
})
// refresh page
refresh.addEventListener('click',function(){
    initInvNum()
})




// 异步请求静态资源时，会导致加载蒙版失效，暂时不考虑这种处理方式
// async function loadCSS(url, maxRetries = 3) {
//     let retries = 0
//     while (retries < maxRetries) {
//         try {
//             const response = await fetch(url) // 发送请求获取样式表
//             if (response.ok) {
                // 设置样式表内容
                // const cssText = await response.text() 
                // const style = document.createElement('style')
                // style.textContent = cssText 
                // document.head.appendChild(style)
                // 添加link标签
//                 const cssURL = URL.createObjectURL(await response.blob())// 获取样式表的 URL
//                 const link = document.createElement('link')
//                 link.rel = 'stylesheet'
//                 link.href = cssURL 
//                 document.head.appendChild(link) // 将 link 元素添加到页面中
//                 return // 请求成功则结束函数
//             }
//         } catch (error) {
//             console.error('Error loading CSS:', error)
//         }
//         retries++
//     }
//     console.error(`Failed to load CSS after ${maxRetries} attempts.`)
// }

// async function loadStyles() {
//     await loadCSS('../css/font_icon/iconfont.css')
//     await loadCSS('../css/config.css')
//     await loadCSS('../css/guide.css')
//     console.log('All stylesheets loaded successfully!')
// }

// loadStyles();
