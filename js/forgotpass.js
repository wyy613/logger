import {Ajax} from "./config.js"
import {showMessage,getPrompt} from './common.js'
const requestBaseURL="./cgi-bin"
const inputFields = document.querySelectorAll('.checknumber')
const confirmButton = document.querySelector('.check-form-submit')

// 遍历输入框并为每个输入框添加事件监听器
inputFields.forEach(function(input, index) {
  input.addEventListener('focus', function() {
    input.style.borderColor = '#7F868F' // 当输入框获得焦点时改变边框颜色
  })

  input.addEventListener('input', function() {
    var currentValue = input.value
    // 确保输入框只接受数字
    if (!(/^\d+$/.test(currentValue))) {
      input.value = ''  // 清除非数字字符
      return
    }

    if (currentValue.length === 1) {
      // 如果输入了一个数字，自动跳转到下一个输入框（如果有）
      if (index < inputFields.length - 1) {
        inputFields[index + 1].focus()
      }
    }

    // 检查所有输入框是否都已输入内容
    var allInputsFilled = true;
    inputFields.forEach(function(field) {
      if (field.value.length !== 1) {
        allInputsFilled = false
      }
    });

    // 如果所有输入框都有输入内容，启用确认按钮
    if (allInputsFilled) {
        confirmButton.style.backgroundColor = '#676CC4'
        confirmButton.style.cursor='pointer'
    } else {
        confirmButton.style.backgroundColor = '#AEBBCE'
        confirmButton.style.cursor='not-allowed'
    }
  })
})
document.addEventListener('keydown', function(event) {
  if (event.key === 'Backspace') {
    confirmButton.style.backgroundColor = '#AEBBCE'
    confirmButton.style.cursor='not-allowed'
    inputFields.forEach((input, index) => {
        if (input.value === '' && index > 0 && inputFields[index - 1].value !== '') {
            input.style.borderColor = '#AEBBCE'
            inputFields[index - 1].focus()
        }
    })
  }
})

confirmButton.addEventListener('click',function(){
    if(confirmButton.style.cursor='pointer'){
        var obj={}
        obj.time=new Date().getTime()
        obj.checkcode=''
        inputFields.forEach((field) => {
            obj.checkcode += field.value
        })
        
        Ajax.post(`${requestBaseURL}/forgetpasswd`,JSON.stringify(obj),function(c){
            c=JSON.parse(c)
            console.log(c)
            if(c.state == 1){
                showMessage(getPrompt("setSucc"),2000,'succContent','&#xe616;')
            }else if(c.state == 2){
                skipCountdown('已重置为默认密码：123456','去登录','succWhitebak','&#xe616;')
                document.querySelector('.actionevent')
                    .addEventListener("click",function(){
                        window.location.href = 'login.html'
                    })
            }else{
                showMessage(getPrompt("setFailed"),2000,'failedContent','&#xe60f;')
                initInvNum()
            }
        })
    }
})

function skipCountdown(res,text,classname,icon){
    var e=window.parent.document.querySelector('.hbody')
    var g=document.createElement("div")
    g.innerHTML=`<div class="content ${classname}">
    <i class='result iconfont'>${icon}</i>
    <span class='description'>${res}</span><span class='actionevent'>${text}</span>
    </div>`
    g.setAttribute("class","msg")
    e.appendChild(g)
}