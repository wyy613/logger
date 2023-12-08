
export {showMessage,showTimeout,showLoading,getPrompt,hideLoading,setzyInput,getzyInput}

const constPromptInfo={
    prompt:{zh:"提示",en:"Prompt"},
    confirm:{zh:"确定",en:"OK"},
    cancel:{zh:"取消",en:"Cancel"},
    requestFailed:{zh:"数据请求失败",en:"Data request failed"},
    setFailed:{zh:"设置失败, 请重试",en:"Set failed"},
    setSucc:{zh:"设置成功",en:"Set Success"},
    deleteprompt:{zh:"请先选择设备",en:"Please select device first"}
}
const constHtmlLang=[
    {zh:"设备配网",en:"Wi-Fi",id:"wifi-at-link",type:"text"},
]
var curLangeage="zh"

function showMessage(f,h,r,icon){
    var e=window.parent.document.querySelector('.hbody')
    // var e=document.getElementById("body-wrap")
    var g=document.createElement("div")
    g.innerHTML=`<div class="content ${r}">
    <i class='result iconfont'>${icon}</i>
    <span class='description'>${f}</span>
    </div>`
    g.setAttribute("class","msg")
    e.appendChild(g)
    if(h){
        setTimeout(function(){
            e.removeChild(g)
        },h)
    }
}

function showTimeout(){
    hideLoading("msg-load");
    var h=document.getElementById("body-wrap");
    var f=document.createElement("div");
    f.innerHTML='<div id="timeoutId" class="content-time">'+getPrompt("closedWeb")+"</div>";
    f.setAttribute("class","msg");
    h.appendChild(f);
    var g=5;
    var e=setInterval(function(){
        g--;
        // document.getElementById("timeout-info").innerText=g;
        if(g<0){
            h.removeChild(f);      //删除成功提示词
            // closeWindow();      //关闭浏览器窗口
            clearInterval(e);   //删除本次循环体
        }
    },1000)
}

function showLoading(){
    var c=document.getElementById("body-wrap");
    var d=document.createElement("div");
    d.innerHTML='<div class="load"><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>';
    d.setAttribute("class","msg");
    d.setAttribute("id","msg-load");
    c.appendChild(d)
}
function showConfirm(h,i,j){
    var g=document.getElementById("body-wrap");
    var e=document.createElement("div");
    e.innerHTML='<div class="mask"></div><div class="content"><div class="header">'+h+'</div><div class="content-info">'+i+'</div><div onclick="removeConfirm()" class="footer-btn"><button>'+j+"</button></div></div>";
    e.setAttribute("class","msg-confirm");
    e.setAttribute("id","msg-confirm");
    g.appendChild(e)
}
function removeConfirm(){
    document.getElementById("body-wrap").removeChild(document.getElementById("msg-confirm"))
}
function hideLoading(d){
    var c=document.getElementById(d);
    if(c){
        c.setAttribute("class","msg hide");
        document.getElementById("body-wrap").removeChild(c)
    }
}



// loadLanguage();
// 判断浏览器当前语言
function loadLanguage(){
    var c=navigator.language||navigator.userLanguage;
    c=c.substr(0,2);
    if(c=="zh"){
        curLangeage="zh"
    }else{
        curLangeage="en"
    }
    for(var a=0;a<constHtmlLang.length;a++){
        var b=constHtmlLang[a];
        if(b.type=="input"){
            setInputByLang(b.id,b[curLangeage]);
            continue
        }
        setTextByLang(b.id,b[curLangeage])
    }
}
function setTextByLang(b,a){
    document.getElementById(b).innerText=a
}
function setInputByLang(b,a){
    document.getElementById(b).setAttribute("placeholder",a)
}
function getPrompt(a){
    return constPromptInfo[a][curLangeage]
}

// 获取input组件，并设置
function setzyInput(name,value){
    const customDropdown = document.querySelector(`${name}`)
    const innerDivContent = customDropdown.getContent() 
    innerDivContent.value = value
}
function getzyInput(name){
    const customDropdown = document.querySelector(`${name}`)
    const innerDivContent = customDropdown.getContent() 
    return innerDivContent.value
}