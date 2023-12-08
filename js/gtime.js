import {Ajax} from "./config.js"
import {zyInput} from './zyElement.js'
import {showMessage,getPrompt,getzyInput} from './common.js'
const requestBaseURL="./cgi-bin"

const getTime = document.querySelector('.getTime')
const date = document.querySelector('.ymd')
const time = document.querySelector('.hms')
const set_butt = document.querySelector('.set_butt')


var obj={
    time:0,
    timeset:0,
    timezone:'UTC+08:00',
}

function parseTimestamp(t) {
    var date = new Date(t * 1000);
    var hours = ('0' + date.getHours()).slice(-2)
    var minutes = ('0' + date.getMinutes()).slice(-2)
    var seconds = ('0' + date.getSeconds()).slice(-2)
    var day = ('0' + date.getDate()).slice(-2)
    var month = ('0' + (date.getMonth() + 1)).slice(-2)
    var year = date.getFullYear()
    var timeString = hours + ':' + minutes + ':' + seconds;
    var dateString = day + '-' + month + '-' + year;
    var combinedString = timeString + ' ' + dateString;    
    return [timeString, dateString, combinedString];
}
getTime.addEventListener('click', function(){
    getDeviceTime()
})
// 获取input组件，并设置
function setzyInput(name,value){
    const customDropdown = document.querySelector(`${name}`)
    const innerDivContent = customDropdown.getContent() 
    innerDivContent.value = value
}
// 初始化页面参数
function initTime(){
    getDeviceTime()
}
initTime()

// 获取设备时间
function getDeviceTime(){
    Ajax.get(`${requestBaseURL}/time_face_post`,function(c){
        c=JSON.parse(c)
        console.log(c)
        try{
            var parsedArray = parseTimestamp(c.nowtime);
            setzyInput('.currtime',parsedArray[2])
            setzyInput('.ymd',parsedArray[1])
            setzyInput('.hms',parsedArray[0])
        }catch(d){
            console.log(d)
        }
    })
}

function setDeviceTime(){
    var t = getzyInput('.hms')
    var d = getzyInput('.ymd')
    let timeArray = d.split('-');
    var dateStr = `${timeArray[2]}-${timeArray[1]}-${timeArray[0]} ${t}`// 特定日期格式
    var date1 = new Date(dateStr) // 转换为Date对象
    obj.time = Math.floor(date1.getTime() / 1000) // 转换为时间戳
    obj.timeset = Math.floor(date1.getTime() / 1000)
    Ajax.post(`${requestBaseURL}/time_set`,JSON.stringify(obj),function(c){
        c=JSON.parse(c)
        if(c.state == 1){
            showMessage(getPrompt("setSucc"),2300)
        }else{
            showMessage(getPrompt("setFailed"),2300)
            initTime()
        }
    })
}
set_butt.addEventListener('click',function(){
    setDeviceTime()
})

// 校验输入框数值是否合法
const inputs = document.querySelectorAll('.ymd, .hms');
var regexymd=new RegExp(document.querySelector('.ymd').getAttribute('regex'))
var regexhms=new RegExp(document.querySelector('.hms').getAttribute('regex'))
var inputRegexMap=[regexymd,regexhms]

function validateInput(input, regex) {
    return regex.test(input.value);
}

function checkAllInputs() {
    let allValid = true;
    inputs.forEach((input,i) => {
        if (!validateInput(input.getContent(), inputRegexMap[i])) {
            console.log(input.getContent().value)
            allValid = false;
        }
    });
    return allValid;
}

function enableOrDisableButton() {
    if(checkAllInputs()){
        set_butt.style.cursor='pointer'
        set_butt.style.backgroundColor='#676cc4'
    }else{
        set_butt.style.cursor='not-allowed'
        set_butt.style.backgroundColor='#d8d8d8'
    }
}

function handleInputChange(event) {
    if (event.target.matches('.ymd, .hms')) {
        enableOrDisableButton();
    }
}

inputs.forEach(input => {
    input.addEventListener('input', handleInputChange);
});

enableOrDisableButton(); // 初始化时检查输入框状态


const nextpage=document.querySelector('.nextpage')
nextpage.addEventListener('click',function(){
    const parentDoc = window.parent.document;
    parentDoc.querySelector('.iframeCon').src='../html/gDeviceConn.html'
    const onclk=parentDoc.querySelectorAll('.nav2li')
    onclk[1].classList.remove("li2clk")
    onclk[2].classList.add("li2clk")
    parentDoc.querySelector(".cnav2").innerHTML=onclk[2].querySelector(".navname").innerHTML
})


