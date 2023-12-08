import SNParseUtil from "./SNParseUtil.js"
import {Pagination} from "./pagination.js"
import {arr} from "./expo.js"
import {Ajax} from "./config.js"

// var screenHeight = window.innerHeight-252
const teststr1= 'OGS-1.5K'
const teststr2='H-3P-50K-100-P'
let po1=teststr1.split('-')[1]
let po2=teststr2.split('-')[1]
console.log(po1)
console.log(po2)
// window.addEventListener('load', function() {
//     document.querySelector('.device_table_control').style.maxHight = `${screenHeight}`+"px"
//     let aa=document.querySelector('.device_table_control')
//     aa.cssText=`max-hight:${screenHeight}px`
// })
// console.log(`${screenHeight}`+"px")

var isShowDeviceList = false;
var deviceList={
    time:"",
    num:"",
    dev:[],
}

const snParseUtil = new SNParseUtil()
const requestBaseURL="./cgi-bin"
// 分段请求设备
const requestListNum=30


// console.log(arr.dev[1].subBrand="13r")
// let snParseUtil = new SNParseUtil()
// let r=snParseUtil.parse("Z11210010253014C").subBrand
// console.log(arr.dev[1].subBrand=r)


// 设备列表页面 查询设备 测试
let querydevice=document.querySelector(".querydevice")
querydevice.addEventListener("click", function(){
    var i=1
    let sen=`freq=${i}`
    Ajax.get(`${requestBaseURL}/query_device?+freq=${i}`,function(c){
        c=JSON.parse(c)
        console.log(c)
        let pageCount=Math.ceil(c.num/requestListNum)
        deviceList=c
        if(pageCount>1){
            for(;i<pageCount;i++){
                searchdevice(i)
            }
        }
        console.log(deviceList.dev.length)
        if((deviceList.dev.length+1)==deviceList.num){
            devicemodel(deviceList,deviceList.dev.length)
            var p=new Pagination({
                container: '.device_list_page',
                size: 10,
                pageNo: 1,
                total:deviceList.num,
                arr:deviceList,
                // total:arr.num,
                // arr:arr,
            })
        }
        document.querySelector(".listTotalNum").innerHTML="共 "+c.num+" 条"
        document.querySelector(".listUpgradeTime").innerHTML="更新时间："+c.time
    },sen);
    
    // devicemodel(arr,arr.dev.length)
    // if(arr.dev.length==arr.num){
    //     devicemodel(arr,arr.dev.length)
    //     var p=new Pagination({
    //         container: '.device_list_page',
    //         size: 15,
    //         pageNo: 1,
    //         total:arr.num,
    //         arr:arr,
    //         listTrInit:'device_listtr-wrap'
    //     })
    // }
    // document.querySelector(".listTotalNum").innerHTML="共 "+arr.num+" 条"
    // document.querySelector(".listUpgradeTime").innerHTML="更新时间："+arr.time
})
// 解析设备型号
function devicemodel(x,r){
    if(r!=0){
        for(var u=0;u<x.dev.length;u++){
            x.dev[u].productType=snParseUtil.parse(x.dev[u].sn).productType
            x.dev[u].subBrand=snParseUtil.parse(x.dev[u].sn).subBrand
            deviceStatus(x.dev[u],parseInt(x.dev[u].status))
            console.log(parseInt(x.dev[u].status))
            devicePort(x.dev[u],x.dev[u].inf)
        }
    }
}

//解析设备状态
function deviceStatus(para,sta){
    switch (sta) {
        case 0:
        case 1:
            return para.status="Standby"
        case 2:
            return para.status="Working"
        case 3:
            return para.status="Alarm"
        case 4:
            return para.status="FW Updating"
        }
        return para.status="Offline"
}
// 解析接入端口
function devicePort(para,sta){
    switch (sta) {
        case 1:
            return para.inf="COM1"
        case 2:
            return para.inf="COM2"
        case 3:
            return para.inf="COM3"
        case 4:
            return para.inf="COM4"
        case 5:
            return para.inf="CAN"
        }
        return para.inf="--"
}

// 按 requestListNum 进行轮询请求接口
function searchdevice(i){
    let sen=`freq=${i+1}`
    Ajax.get(`${requestBaseURL}/query_device?+freq=${i+1}`,function(c){
        c=JSON.parse(c)
        for(var n=0;n<c.dev.length;n++){
            deviceList.dev[i*requestListNum+n]=c.dev[n]
        }
        
    },sen);
}

//动态显示及删除提示词
function showMessage(f,h){
    var e=document.getElementById("body-wrap");
    var g=document.createElement("div");
    g.innerHTML='<div class="content">'+f+"</div>";
    g.setAttribute("class","msg");
    e.appendChild(g);
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

function getPrompt(a){
    return constPromptInfo[a][curLangeage]
}