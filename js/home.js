const li2=document.querySelectorAll(".second_list")
const navul2=document.querySelectorAll(".nav2ul")
const onclk=document.querySelectorAll(".nav2li")
const linum=[]
const nav1icon=["&#xe650;","&#xe665;","&#xe773;","&#xe660;","&#xe636;","&#xe946;","&#xe634;"]
var currul=0,currli=0
// iframe
var riframe
const exitbutt=document.querySelector('.exit')

// 页面初始化函数
getPageName(currli)

// 二级导航 收缩展开
li2.forEach((e,inx) => {
    // linum[] 记录每个一级下二级导航栏的个数
    linum[inx]=navul2[inx].querySelectorAll(".nav2li").length
    li2[inx].onclick = function(){
        if (currul === inx) {
            return
        } else {
            navul2[currul].style.height="0"
            navul2[inx].style.height=`${linum[inx]*36}px`
            currul=inx
        }
    }
})
// 获取焦点的导航 背景色
for(let i=0;i<onclk.length;i++){
    onclk[i].onclick = function(){
        // 防止冒泡
        onclk[i].addEventListener("click", function (e) {
            window.event ? (window.event.cancelBubble = true) : e.stopPropagation();
        });
        clearPath()
        onclk.forEach(ele => {
            ele.classList.remove("li2clk")
        })
        if(currli === i){
            npath(i)
            onclk[i].classList.add("li2clk")
            getPageName(i)
        }else{
            onclk[i].classList.add("li2clk")
            currli=i
            getPageName(i)
            npath(i)
        }
        
    }
}
// 初始化当前页面路径
npath(currli)
// 页面路径
function npath(i){
    switch(i){
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:  
            getNav2(i)
            return
        case 6:
            getNav1(i)
            return
        case 7:
        case 8:
        case 9:
        case 10:
        case 11:
            getNav2(i)
            return
        case 12:
            getNav1(i)
            return
        case 13:
        case 14:
        case 15:
        case 16:
            getNav2(i)
            return
        case 17:
            getNav1(i)
            return
    }
}

//处于二级导航
function getNav2(i){
    getNav1(i)
    document.querySelector(".csp").innerHTML="&#xeb8b;"
    document.querySelector(".cnav2").innerHTML=onclk[i].querySelector(".navname").innerHTML
}
function getNav1(i){
    var cnavicon=document.querySelector(".cnavicon")
    var cnav1=document.querySelector(".cnav1")
    var navname=onclk[i].querySelector(".navname")
    switch(i){
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
            cnavicon.innerHTML = nav1icon[0]
            getnav1name(i)
            return
        case 6:
            cnavicon.innerHTML= nav1icon[1]
            cnav1.innerHTML= navname.innerHTML
            return
        case 7:
        case 8:
        case 9:
            cnavicon.innerHTML= nav1icon[2]
            getnav1name(i)
            return
        case 10:
        case 11:
            cnavicon.innerHTML= nav1icon[3]
            getnav1name(i)
            return
        case 12:
            cnavicon.innerHTML= nav1icon[4]
            cnav1.innerHTML= navname.innerHTML
            return
        case 13:
        case 14:
        case 15:
        case 16:
            cnavicon.innerHTML= nav1icon[5]
            getnav1name(i)
            return
        case 17:
            cnavicon.innerHTML= nav1icon[6]
            cnav1.innerHTML= navname.innerHTML
            return
    }
}
function getnav1name(i){
    var a=onclk[i].parentElement.parentElement
    var b=a.querySelectorAll(".navname")[0]
    document.querySelector(".cnav1").innerHTML= b.innerHTML
}
// 清除header历史路径
function clearPath(){
    document.querySelector(".cnavicon").innerHTML=null
    document.querySelector(".cnav1").innerHTML=null
    document.querySelector(".csp").innerHTML=null
    document.querySelector(".cnav2").innerHTML=null
}
// 切换导航时，切换加载页面
function changePage(p){
    if(document.querySelector(".iframeCon")){
        var l=document.querySelector(".iframeCon")
        l.remove()
    }
    riframe=document.createElement("iframe")
    riframe.setAttribute("class","iframeCon")
    // riframe.setAttribute("src","./dSubdevice.html")
    riframe.setAttribute("src",p)
    riframe.setAttribute("frameborder","no")
    riframe.setAttribute("marginwidth","0")
    riframe.setAttribute("marginheight","0")
    riframe.setAttribute("scrolling","no")
    // document.querySelector(".right_content_layout").appendChild(riframe)
    document.querySelector(".right_content").appendChild(riframe)
}
function getPageName(i){
    switch(i){
        case 0:
            changePage("./gLoggerpara.html")
            loadingmask()
            return
        case 1:
            changePage("./gTime.html")
            loadingmask()
            return
        case 2:
            changePage("./gDeviceConn.html")
            loadingmask()
            return
        case 3:
            changePage("./gMeter.html")
            loadingmask()
            return
        case 4:
            changePage("./gNetwork.html")
            loadingmask()
            return
        case 5:
            changePage("./gResetPass.html")
            loadingmask()
            return
        case 6:
            changePage("./overview.html")
            loadingmask()
            return
        case 7:
            changePage("./dLogger.html")
            loadingmask()
            return
        case 8:
            changePage("./dSubDevice.html")
            loadingmask()
            return
        case 9:
            changePage("./dFWupgrade.html")
            loadingmask()
            return
        case 10:
            changePage("./pActive.html")
            loadingmask()
            return
        case 11:
            changePage("./pEmergency.html")
            loadingmask()
            return
        case 12:
            changePage("./alarm.html")
            loadingmask()
            return
        case 13:
            changePage("./pRS485.html")
            loadingmask()
            return
        case 14:
            changePage("./pNetwork.html")
            loadingmask()
            return
        case 15:
            changePage("./pAi.html")
            loadingmask()
            return
        case 16:
            changePage("./pDi.html")
            loadingmask()
            return
        case 17:
            changePage("./about.html")
            loadingmask()
            return
    }
}
function loadingmask(){
    // 当页面加载完毕后，显示内容并隐藏遮罩层
    // 创建遮罩层元素
    var overlay = document.createElement('div')
    overlay.classList.add('loading_mask')
    overlay.innerHTML=`<div class="loader"></div>`
    document.querySelector('.right_content').appendChild(overlay)
    riframe.addEventListener('load', function() {
        // 移除遮罩层以及其内部的 loader 元素
        var mask = document.querySelector('.loading_mask')
        if (mask) {
            mask.parentNode.removeChild(mask) // 移除遮罩层及其内部元素
        }
    }) 
}

// 当页面加载完毕后，显示内容并隐藏遮罩层
// 创建遮罩层元素
var overlay = document.createElement('div')
overlay.classList.add('loading_mask')
overlay.innerHTML=`<div class="loader"></div>`
document.querySelector('.right_content').appendChild(overlay);
riframe.addEventListener('load', function() {
    // 移除遮罩层以及其内部的 loader 元素
    var mask = document.querySelector('.loading_mask');
    if (mask) {
        mask.parentNode.removeChild(mask); // 移除遮罩层及其内部元素
    }
}) 

// 禁止回退
history.pushState(null, null, location.href)
window.onpopstate = function () {
    history.go(1);
};

// 1.0
// (function noback() {
//     history.pushState(null, null, document.URL);
//     window.addEventListener('popstate', function() {
//          history.pushState(null, null, document.URL)
//     })
// })()

exitbutt.addEventListener('click',function(){

})

// 删除设备窗体
function Formexitweb(){
    var w=document.createElement('div')
    w.innerHTML=`<style>/*exit web page */
    .deletebackground{
        position: fixed;
        height: 100%;
        width: 100%;
        left: 0;
        top: 0;
        background: rgba(0,0,0,.1);
        z-index: 9;
    }
    .delete_wrap{
        position:absolute;top:15%;left:calc((100% - 450px)/2);padding:18px 25px;
        background-color: #fff;
        font-weight: 400;
        display: flex;flex-direction: column;
    }
    .delete_title{
        font-size: 16px;
        color: #111;
        margin-bottom: 13px;
    }
    .delete_form{
        width: 420px;
        height:auto;
        display:flex;
        flex-direction:row;
    }
    .delete_form span{
        font-size: 14px;
        font-weight: 400;
        height: 40px;
        line-height:40px;
    }
    .delete_text{
        color: rgba(0,0,0,0.6);
    }
    .delete_sn{
        color: rgba(0,0,0,0.6);
    }
    .delete_butt{
        width: 100%;
        margin-top: 10px;
        display: flex;
        flex-direction: row;
        justify-content:flex-end;
    }
    .delete_butt span{
        font-size: 14px;
        font-weight: 360;
        height: 26px;
        line-height: 26px;
        cursor: pointer;
    }
    .delete_butt .delete_bu_close{
        margin-right: 28px;
        color:#5A5EA6;
    }
    .delete_butt .delete_bu_submit{
        color: #5A5EA6;
    }
    </style>
    <div class="exitbackground">
        <div class="exit_wrap">
            <div class="exit_title">删除</div>
            <div class="exit_form">
                <span class="exit_text">确认删除：</span><span class="exit_text">?</span>
            </div>
            <div class="exit_butt">
                <span class="exit_bu_close">关闭</span>
                <span class="exit_bu_submit">确定</span>
            </div>
        </div>
    </div>
    `
    w.setAttribute('class','editbackground')
    this.setForm = function(){
        e.appendChild(w)
    }   
    this.getEl = function(){
        return w
    }
}