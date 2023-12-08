import SNParseUtil from "./SNParseUtil.js"
import {Pagination} from "./pagination.js"
import {zyListInput} from "./zyElement.js"
import {arr} from "./expo.js"
import {Ajax} from "./config.js"
import {showMessage,showTimeout,getPrompt,hideLoading,setzyInput,getzyInput} from './common.js'

const snParseUtil = new SNParseUtil()
const requestBaseURL="./cgi-bin"
const refresh=document.querySelector('.refresh')

var inForm = new Formifr()
let editForm = new Formeditdevice()
let deleteForm = new Formdeletedevice()
var searobj={
    addr: 0xff,
}
var getbak={}
function initlist(){
    return new Promise((resolve, reject) => {
        searobj.time=new Date().getTime()
        Ajax.get(`${requestBaseURL}/search_device?addr=${searobj.addr}`,function(c){
            getbak=JSON.parse(c)
            console.log(getbak)
            try{
                // if(getbak.dev.length==getbak.num){
                    if(getbak.dev.length == 0){
                        // clear previous data
                        console.log(document.querySelectorAll(".gdeviceconn"))
                        if(document.querySelectorAll(".gdeviceconn") != undefined){
                            var prevtr = document.querySelectorAll(".gdeviceconn")
                            for (const i of prevtr) {
                                i.remove()
                            }
                        }
                        // no data
                        if(document.querySelector('.device_nodata')==null){
                            var w=document.createElement('div')
                            w.setAttribute('class','device_nodata')
                            w.innerHTML=`暂无数据`
                            document.querySelector('.device_table_control').appendChild(w)
                            document.querySelector('.listTotalNum').innerHTML='共 0 条'
                        }
                    }else{
                        if(document.querySelector('.device_nodata')!=null){
                            var nodatali=document.querySelector('.device_nodata')
                            nodatali.remove()
                        }
                        devicemodel(getbak,getbak.dev.length)
                        var p=new Pagination({
                            container: '.device_list_page',
                            size: 10,
                            pageNo: 1,
                            total:getbak.num,
                            arr:getbak,
                            listTrInit:'gdeviceconn'
                        })
                        document.querySelector('.listTotalNum').innerHTML=`共 ${getbak.dev.length} 条`
                    }
                // }
                resolve(getbak)
            }catch(d){
                showMessage(getPrompt("requestFailed"),2000)
                console.log(d)
            }
        })
    })
    // return new Promise((resolve, reject) => {
    //     if(arr.dev.length==arr.num){
    //         devicemodel(arr,arr.dev.length)
    //         var p=new Pagination({
    //             container: '.device_list_page',
    //             size: 10,
    //             pageNo: 1,
    //             total:arr.num,
    //             arr:arr,
    //             listTrInit:'gdeviceconn'
    //         })
    //     }
    //     resolve(arr)
    // })
}
// initlist()
initlist().then((res) => {
    if(res){
        editdevice()
        deletedevice()
        disablecanport()
        selectionbutt()
        selectallFunction()
    }
})

const hight = window.screen.height
const width = window.screen.width
// let mask = document.querySelector('.mask')
// mask.style.width = width
// mask.style.height = height
const searchDeviceButt=document.querySelector('.querydevice')
const e=window.parent.document.querySelector('.hbody')
const hc=document.getElementById('body-wrap')

// 存储搜索的结果
var totalarr={}  
var searchlisttr
var searchlistWrap
searchDeviceButt.addEventListener('click',function(){
    inForm.setForm()
    if(inForm.getEl().querySelector('.progressbar') != null){
        clearprogressbar()
    }
    // setTimeout(function(){
        startSearch().then((res) => {
            if(res){
                keyinput()
            }
           
        })
    // },500)
    
})

// 开始搜索
const popcontent=inForm.getEl().querySelector('.popcontent')
const popliwrap=inForm.getEl().querySelector('.popliwrap')
// 一键填写地址
// const oaddassi=inForm.getEl().querySelector('.oaddassi')
// 添加
const oadd=inForm.getEl().querySelector('.oadd')
const ototal=inForm.getEl().querySelector('.ototal')
var obj={num:0,time:0,dev:[]}
function getDataFromAjax(add) {
    return new Promise((resolve, reject) => {
        Ajax.get(`${requestBaseURL}/${add}`, function(result) {
        // 异步操作成功后，将数据传递给 resolve 函数
        resolve(result)
      })
    })
}

function startSearch(){
  return new Promise((resolve, reject) => {   
    var insertel
    insertel=document.createElement('zy-progressbar')
    insertel.setAttribute('class','progressbar')
    var counter=0
    var percent=0
    // 扫描设备使用
    var lis={dev:[]}
    var exists=[]
    
    var getarr=[]
    var zyel
    var probar
    // 搜索设备过程中，禁用其他按钮
    // oaddassi.style.cursor='not-allowed'
    oadd.style.backgroundColor='#d8d8d8'
    oadd.style.cursor='not-allowed'
    // 在外部调用函数，并使用 then 方法获取异步操作的结果
    getDataFromAjax('loggerpara_face_post').then((c) => {
    // 在此处对异步操作的结果进行处理，c 已经包含了 ajax 的结果
        c=JSON.parse(c)
        popcontent.insertBefore(insertel,popliwrap)
        zyel=popcontent.querySelector('.progressbar')
        zyel.setAttribute('total',c.sumdevnum)
        probar=insertel.getContent()
        updateData(counter,percent,c)
        function updateData(counter,percent,c) {
            probar.querySelector('.pbtitle').innerHTML=`当前查询${counter}/${c.sumdevnum}`
            percent=Math.floor(counter/c.sumdevnum * 100)
            probar.querySelector('.pbpercent').innerHTML=`${percent}%`
            probar.querySelector('.baranima').style.width=`${percent}%`
            if (counter === c.sumdevnum) {
                zyel.setAttribute('percent', 100);
            }
        }
        Ajax.get(`${requestBaseURL}/scan_device`,function(q){
            getarr=JSON.parse(q)
            function startTimer(){
                // 每隔1秒刷新参数数据
                setTimeout(function() {
                    // counter++;
                    counter=getarr.dev.length //修改为按照回复的设备数量控制ajax请求次数
                    updateData(counter,percent,c)
                    if(getarr.dev.length != 0 && getarr.state == 1){
                        // 第一次请求的回复，若设备数目不为0，则清除no data
                        if(inForm.getEl().querySelector('.device_nodata')){
                            clearnodata()
                        }
                        // lis  exists
                        if(exists.length == 0){
                            exists = getarr.dev
                            totalarr = getarr
                            devicemodel(getarr,getarr.dev.length)
                            // if(exists){
                            //     exists.forEach(e => {
                            //         e.placeholder=getplaceholder(e.inf)
                            //     })
                            // }
                            initsearlist(exists)
                            ototal.innerHTML=`共 ${totalarr.dev.length} 条`
                        }else{
                            for(let i=0;i<getarr.dev.length;i++){
                                var curr=getarr.dev[i]
                                var ifnew=totalarr.dev.some(item => item.sn === curr.sn)
                                if(!ifnew){
                                    lis.dev.push(curr)
                                    totalarr.dev.push(curr)
                                }
                            }
                            devicemodel(lis,lis.dev.length)
                            // if(lis.dev){
                            //     lis.dev.forEach(e => {
                            //         e.placeholder=getplaceholder(e.inf)
                            //     })
                            // }
                            initsearlist(lis.dev)
                            ototal.innerHTML=`共 ${totalarr.dev.length} 条`
                        }
                        Ajax.get(`${requestBaseURL}/scan_device`,function(w){
                            getarr=JSON.parse(w)
                            lis.dev=[]
                            // 继续定时器
                            if (counter <= c.sumdevnum) {
                                startTimer()
                            }else{
                                console.log('循环结束')
                            }
                        })
                    }else if(getarr.dev.length != 0 && getarr.state == 0){
                        // 使用 map 方法从每个设备对象中提取所需属性
                        var modifiedDev = totalarr.dev.map(({ sn, addr }) => ({ sn, addr }));
                        obj={
                            num:0,
                            time:0,
                            dev:modifiedDev
                        }
                        ototal.innerHTML=`共 ${totalarr.dev.length} 条`
                        console.log('无更多设备')
                        searchlisttr = inForm.getEl().querySelectorAll(".searchlist")
                        searchlistWrap = inForm.getEl().querySelector('.searchwrap')
                        // console.log(searchlistWrap)
                        // oaddassi.style.cursor='pointer'
                        resolve(searchlistWrap)
                        addressAssign()
                        enableOrDisableButton()
                        // userdefined()
                    }else if(getarr.dev.length ==0 && getarr.state == 0){
                        if(inForm.getEl().querySelector('.device_nodata') == null){
                            var w=document.createElement('div')
                            w.setAttribute('class','device_nodata')
                            w.innerHTML=`暂无数据`
                            inForm.getEl().querySelector('.searchwrap').appendChild(w)
                        }
                        console.log('未搜索到设备')
                    }
                }, 100);
            }
            // 第一次触发
            startTimer();
        })
    })

 })
}


// 搜索设备窗体
function Formifr(){
    var w=document.createElement('div')
    w.innerHTML=`
    <link rel="stylesheet" href="../css/gsearchdevice.css">
    <div class="popForm">
    <div class="pophead">
        <span class="poptitle">搜索设备</span>
        <span class="popclose iconfont">&#xe64f;</span>
    </div>
    <div class="popcontent">
        <div class="popliwrap">
            <div class="device_form_th">
                <div class="device_form_thtd sfirsttd"><span class="device_form_th_paraname">Modbus地址</span></div>
                <div class="device_form_thtd ssecondtd"><span class="device_form_th_paraname">SN</span></div>
                <div class="device_form_thtd sthirdtd"><span class="device_form_th_paraname">设备型号</span></div>
                <div class="device_form_thtd sfourtd"><span class="device_form_th_paraname">COM Port</span></div>
                <div class="scrollw"></div>
            </div>
            <div class="searchwrap">
                <div class="device_nodata">暂无数据</div> 
            </div>
        </div>
    </div>
    <div class="popfoot">
        <span class="ototal">共 -- 条</span>
        <span class="oadd">添加</span>
    </div>
    </div>`
    w.setAttribute('class','mask')
    this.setForm = function(){
        e.appendChild(w)
    }   
    this.getEl = function(){
        return w
    }
}
// 右上角关闭窗口按钮
function gclosehtml(){
    var inEl = inForm.getEl()
    inEl.remove()
    clearPrevList()
    totalarr={}
}
// 当关闭弹窗时 删除列表内的内容
function clearPrevList(){
    if(inForm.getEl().querySelectorAll(".searchlist") != undefined){
        var prevtr = inForm.getEl().querySelectorAll(".searchlist")
        for (const i of prevtr) {
            i.remove()
        }
    }
}
const closeButt=inForm.getEl().querySelector(".popclose")
closeButt.addEventListener('click',function(){
    gclosehtml()
})
// 清除"no data"
function clearnodata(){
    var nodatali=inForm.getEl().querySelector('.device_nodata')
    nodatali.remove()
}
// 清除进度条
function clearprogressbar(){
    var bar=inForm.getEl().querySelector('.progressbar')
    bar.remove()
}

// 生产list
function initsearlist(x){
    // <div class="searchwrap"></div>
    // 如果不存在 .searchwrap 元素，则创建一个新的
    // var wrap=document.createElement('div')
    // wrap.setAttribute('class','searchwrap')
    for(var u=0;u<x.length;u++){
        var s=document.createElement("div")
        s.setAttribute("class",'searchlist')
        var tr=document.createElement("div")
            tr.innerHTML=`
            <zy-listinput class="device_list_trtd sfirsttd modbusinput" placeholder="" inunit="" regex="" disabled='enable'></zy-listinput>
            <div class="device_list_trtd ssecondtd"><span class="deli_sn tdvalue">${x[u].sn}</span></div>
            <div class="device_list_trtd  sthirdtd"><span class="deli_subBrand tdvalue">${x[u].subBrand}</span></div>
            <div class="device_list_trtd sfourtd"><span class="deli_inf  tdvalue">${x[u].inf}</span></div>`
        tr.setAttribute("class","device_list_tr")
        s.appendChild(tr)
        inForm.getEl().querySelector(".searchwrap").appendChild(s) 
    } 
    // this.settr = function(){
    //     inForm.getEl().querySelector(".popliwrap").appendChild(wrap)
    // }
    // this.gettr = function(){
    //     return wrap
    // }     
}

// 解析设备型号
function devicemodel(x,r){
    if(r!=0){
        for(var u=0;u<x.dev.length;u++){
            x.dev[u].productType=snParseUtil.parse(x.dev[u].sn).productType
            x.dev[u].subBrand=snParseUtil.parse(x.dev[u].sn).subBrand
            if(x.dev[u].status != undefined){
                deviceStatus(x.dev[u],parseInt(x.dev[u].status))
            }
            if(x.dev[u].inf != undefined){
                devicePort(x.dev[u],x.dev[u].inf)
            }
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
function showLoading(){
    var d=document.createElement("div")
    d.innerHTML='<link rel="stylesheet" href="../css/guide.css"><div class="load"><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>';
    d.setAttribute("class","msg")
    d.setAttribute("id","msg-load")
    e.appendChild(d)
}
// oaddassi.addEventListener('click',function(){
//     if(oaddassi.style.cursor != 'not-allowed'){
//         addressAssign()
//         enableOrDisableButton()
//     }
// })
function addressAssign(){
    // searchlisttr
    var c1=0,c2=0,c3=0,c4=0,c5=0
    searchlisttr.forEach((e,i) => {
        var td = e.querySelector('.sfirsttd')
        switch (totalarr.dev[i].inf){
            case 'COM1':
                td.getContent().value=1+c1
                c1++
                break
            case 'COM2':
                td.getContent().value=31+c2
                c2++
                break
            case 'COM3':
                td.getContent().value=61+c3
                c3++
                break
            case 'COM4':
                td.getContent().value=91+c4
                c4++
                break
            case 'CAN':
                td.getContent().value=121+c5
                c5++
                break
            default:
                break
        }
    })
}
// user-defined input
function keyinput(){
    var tr=searchlistWrap.querySelectorAll('.modbusinput')
    tr.forEach((e,i) => {
        e.getContent().addEventListener('input',function(){
            enableOrDisableButton(e,i)
        })
    })
}

// check the input value, is it legal
function validateInput(input, regex) {
    var regex1=new RegExp(regex)
    return regex1.test(input.value)
}

function checkAllInputs() {
    let allValid = true;
    var modbusInputs=searchlistWrap.querySelectorAll('.modbusinput')
    modbusInputs.forEach((input,i) => {
        if (validateInput(input.getContent(), getcomport(i,input.getContent()))){
            input.getinputText().style.border='1px solid #F5F6F9'
            var exarr=[]
            searchlisttr.forEach((e,j) => {
                exarr[j]=e.querySelector('.sfirsttd').getContent().value
            })
            for(var q=0;q<exarr.length;q++){
                if(exarr[q] === input.getContent().value && (i !== q)){
                    showMessage('地址不可重复',3000,'failedContent','&#xed1b;')
                    input.getinputText().style.border='1px solid #DA4E51'
                    allValid = false
                }
            }
        }else{
            input.getinputText().style.border='1px solid #DA4E51'
            allValid = false
        }
    })
    return allValid
}

function enableOrDisableButton(dom,i) {
    if(checkAllInputs()){
        oadd.style.backgroundColor='#676cc4'
        oadd.style.cursor='pointer'
        if(dom){
            if(checkExistAddress(dom.getContent().value,i)){
                oadd.style.backgroundColor='#d8d8d8'
                oadd.style.cursor='not-allowed'
                dom.getinputText().style.border='1px solid #DA4E51'
                showMessage('地址不可重复',3000,'failedContent','&#xed1b;')
            }
        }
    }else{
        oadd.style.backgroundColor='#d8d8d8'
        oadd.style.cursor='not-allowed'
    }
}
// when type the addr, need be no duplication with existing addresses 
function checkExistAddress(val,inx){
    var res=false
    var exarr=[]
    searchlisttr.forEach((e,i) => {
        exarr[i]=e.querySelector('.sfirsttd').getContent().value
    })
    for(var j=0;j<exarr.length;j++){
        if(exarr[j] === val && j !== inx){
            res=true
        }
    }
    return res
}
// When entering the modbus address, get the com port of the line , return the regexvalue
function getcomport(i,input){
    var regexmodbus=0
    switch (totalarr.dev[i].inf){
        case 'COM1':
            input.placeholder='[1, 30]'
            return regexmodbus='^(0?[1-9]|[12]\\d|30)$'
        case 'COM2':
            input.placeholder='[31, 60]'
            return regexmodbus='^(3[1-9]|[4-5][0-9]|60)$'
        case 'COM3':
            input.placeholder='[61, 90]'
            return regexmodbus='^(6[1-9]|[7-8][0-9]|90)$'
        case 'COM4':
            input.placeholder='[91, 120]'
            return regexmodbus='^((9[1-9])|(10[0-9])|(11[0-9])|(120))$'
        case 'CAN':
            input.placeholder='[121, 130]'
            return regexmodbus='^(12[1-9]|130)$'
        default:
            break
    }
}
// get placeholder
function getplaceholder(inf){
    switch (inf){
        case 'COM1':
            return '[1, 30]'
        case 'COM2':
            return '[31, 60]'
        case 'COM3':
            return '[61, 90]'
        case 'COM4':
            return '[91, 120]'
        case 'CAN':
            return '[121, 130]'
        default:
            break
    }
}
// batch set device modbus address
oadd.addEventListener('click',function(){
    if(oadd.style.cursor != 'not-allowed'){
        obj.time=new Date().getTime()
        obj.num=obj.dev.length
        searchlisttr.forEach((e,i) => {
            var ad = e.querySelector('.sfirsttd')
            obj.dev[i].addr=ad.getContent().value
            obj.dev[i].sn=totalarr.dev[i].sn
        })
        Ajax.post(`${requestBaseURL}/dev_addrset`,JSON.stringify(obj),function(c){
            c=JSON.parse(c)
            console.log(c)
            if(c.state == 1){
                showSecondMessage(getPrompt("setSucc"),2000,'succContent','&#xe616;')
                setTimeout(function(){
                    gclosehtml()
                    initlist().then((res) => {
                        if(res){
                            editdevice()
                            deletedevice()
                            disablecanport()
                            selectionbutt()
                        }
                    })
                },2200)
                
            }else{
                showSecondMessage(getPrompt("setFailed"),2000,'failedContent','&#xed1b;')
            }
        })
    }
})

function showSecondMessage(f,h,r,icon){
    var e=inForm.getEl()
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


function editdevice(){
    var connarr= document.querySelectorAll('.gdeviceconn')
    connarr.forEach((ele,inx) => {
        var i = ele.querySelector('.opearteedit')
        var comport=ele.querySelector('.deli_inf')
        if(comport.innerHTML != 'CAN'){
            i.addEventListener('click',function(){
                editForm.setForm()
                var sn=ele.querySelector('.deli_sn').innerHTML
                var addr=ele.querySelector('.deli_addr').innerHTML
                var com=ele.querySelector('.deli_inf').innerHTML
                const sndom=editForm.getEl().querySelector('.psnvalue')
                const addrdom=editForm.getEl().querySelector('.edit_addr')
                const comdom=editForm.getEl().querySelector('.edit_comport')
                const closeEditButt=editForm.getEl().querySelector(".edit_bu_close")
                const ensureEditButt=editForm.getEl().querySelector(".edit_bu_submit")
                var placeholder=getplaceholder(com)
                sndom.textContent=sn
                addrdom.getContent().value=addr
                addrdom.getContent().placeholder=placeholder
                addrdom.geteditprompt().innerHTML=placeholder
                comdom.getContent().value=com

                var options=comdom.getOptions()
                options.addEventListener('click',function(event){
                    enableOrDisableButton(event.target.dataset.value)
                    addrdom.getContent().placeholder=getplaceholder(event.target.dataset.value)
                    addrdom.geteditprompt().innerHTML=getplaceholder(event.target.dataset.value)
                })
                function enableOrDisableButton(val){
                    if(typeof(val) == 'string'){
                        if(checkAllInputs(val)){
                            ensureEditButt.style.cursor='pointer'
                            ensureEditButt.style.color='#5A5EA6'
                            addrdom.getlistItext().style.border='1px solid #F5F6F9'
                        }else{
                            ensureEditButt.style.cursor='not-allowed'
                            ensureEditButt.style.color='#d8d8d8'
                            addrdom.getlistItext().style.border='1px solid #DA4E51'
                        }
                    }else{
                        if(checkAllInputs(comdom.getContent().value)){
                            if(checkDuplicateAddress(addrdom.getContent().value,inx)){
                                ensureEditButt.style.cursor='not-allowed'
                                ensureEditButt.style.color='#d8d8d8'
                                addrdom.getlistItext().style.border='1px solid #DA4E51'
                                showMessage('地址不可重复',3000,'failedContent','&#xed1b;')
                            }else{
                                ensureEditButt.style.cursor='pointer'
                                ensureEditButt.style.color='#5A5EA6'
                                addrdom.getlistItext().style.border='1px solid #F5F6F9'
                            }
                        }else{
                            ensureEditButt.style.cursor='not-allowed'
                            ensureEditButt.style.color='#d8d8d8'
                            addrdom.getlistItext().style.border='1px solid #DA4E51'
                        }
                    }
                }
                function validateInput(input, regex) {
                    regex=new RegExp(regex)
                    return regex.test(input.value)
                }
                function checkAllInputs(val) {
                    let allValid = true
                    if (!validateInput(addrdom.getContent(), getRegexAddr(val))) {
                        allValid = false
                    }
                    return allValid
                }
                function checkDuplicateAddress(val,inx){
                    var res=false
                    getbak.dev.forEach(e => {
                        if(e.addr === val && e.addr !== getbak.dev[inx].addr){
                            res=true
                        }
                    })
                    return res
                }
                addrdom.getContent().addEventListener('input', enableOrDisableButton)
                closeEditButt.addEventListener('click',function(){
                    gcloseedit(editForm)
                })
                ensureEditButt.addEventListener('click',function(){
                    var obj={}
                    obj.time=new Date().getTime()
                    obj.sn=editForm.getEl().querySelector('.psnvalue').innerHTML
                    obj.inf=changeinf(editForm.getEl().querySelector('.edit_comport').getContent().value)
                    obj.addr=editForm.getEl().querySelector('.edit_addr').getContent().value
                    if(ensureEditButt.style.cursor='not-allowed'){
                        Ajax.post(`${requestBaseURL}/edit_device`,JSON.stringify(obj),function(c){
                            c=JSON.parse(c)
                            ensureEditButt.style.cursor='pointer'
                            console.log(c)
                            if(c.state == 1){
                                showMessage(getPrompt("setSucc"),2000,'succContent','&#xe616;')
                                initlist().then((res) => {
                                    if(res){
                                        editdevice()
                                        deletedevice()
                                        disablecanport()
                                        selectionbutt()
                                    }
                                })
                                gcloseedit(editForm)
                            }else{
                                showMessage(getPrompt("setFailed"),2000,'failedContent','&#xed1b;')
                                initlist().then((res) => {
                                    if(res){
                                        editdevice()
                                        deletedevice()
                                        disablecanport()
                                        selectionbutt()
                                    }
                                })
                            }
                            
                        })
                        
                    }
                })
            })
        }
    })
}
// delete device
function deletedevice(){
    var connarr= document.querySelectorAll('.gdeviceconn')
    connarr.forEach(bindDeleteEvent)
}
function bindDeleteEvent(ele){
    var i = ele.querySelector('.opeartedelete')
    var comport=ele.querySelector('.deli_inf')
    if(comport.innerHTML != 'CAN'){
        i.addEventListener('click', async function () {
            await openDeleteForm(ele)
        })
    }
}
async function openDeleteForm(ele){
    return new Promise((res) => {
        deleteForm.setForm()
        var sn= ele.querySelector('.deli_sn').innerHTML
        const sndom=deleteForm.getEl().querySelector('.delete_sn')
        sndom.innerHTML=sn
        const closeDeleteButt = deleteForm.getEl().querySelector(".delete_bu_close")
        const ensureDeleteButt = deleteForm.getEl().querySelector(".delete_bu_submit")

        const handleCloseDelete = () => {
            gcloseedit(deleteForm)
            res(deleteForm)
        }
        closeDeleteButt.addEventListener('click', handleCloseDelete, { once: true })
        ensureDeleteButt.addEventListener('click', function(){
            var obj={
            }
            obj.time=new Date().getTime()
            obj.num=1
            obj.dev=[]
            obj.dev[0]={sn:deleteForm.getEl().querySelector('.delete_sn').innerHTML}
            if(ensureDeleteButt.style.cursor='not-allowed'){
                Ajax.post(`${requestBaseURL}/delete_device`,JSON.stringify(obj),function(c){
                    c=JSON.parse(c)
                    console.log(c)
                    if(c.state == 1){
                        showMessage(getPrompt("setSucc"),2000,'succContent','&#xe616;')
                        initlist().then((res) => {
                            if(res){
                                editdevice()
                                deletedevice()
                                disablecanport()
                                selectionbutt()
                            }
                        })
                        gcloseedit(deleteForm)
                    }else{
                        showMessage(getPrompt("setFailed"),2000,'failedContent','&#xed1b;')
                        initlist().then((res) => {
                            if(res){
                                editdevice()
                                deletedevice()
                                disablecanport()
                                selectionbutt()
                            }
                        })
                    }
                })
                
                res(deleteForm)
            }
        })
    })
}
function getRegexAddr(com){
    var regexmodbus=0
    switch (com){
        case 'COM1':
            return regexmodbus='^(0?[1-9]|[12]\\d|30)$'
        case 'COM2':
            return regexmodbus='^(3[1-9]|[4-5][0-9]|60)$'
        case 'COM3':
            return regexmodbus='^(6[1-9]|[7-8][0-9]|90)$'
        case 'COM4':
            return regexmodbus='^((9[1-9])|(10[0-9])|(11[0-9])|(120))$'
        case 'CAN':
            return regexmodbus='^(12[1-9]|130)$'
        default:
            break
    }
}
// 关闭编辑设备窗口
function gcloseedit(form){
    form.getEl().remove()
}
// change inf to int type
function changeinf(e){
    switch (e){
        case 'COM1':
            return 1
        case 'COM2':
            return 2
        case 'COM3':
            return 3
        case 'COM4':
            return 4
        case 'CAN':
            return 5
        default:
            break
    }
}
// 编辑设备窗体
function Formeditdevice(){
    var w=document.createElement('div')
    w.innerHTML=`<style>
    /* edit device */
        .editbackground{
            position: fixed;
            height: 100%;
            width: 100%;
            left: 0;
            top: 0;
            background: rgba(0,0,0,.1);
            z-index: 9;
        }
        .edit_wrap{
            position:absolute;top:15%;left:calc((100% - 450px)/2);padding:18px 25px;
            background-color: #fff;
            font-weight: 400;
            display: flex;flex-direction: column;
        }
        .edit_title{
            font-size: 16px;
            color: #111;
            margin-bottom: 13px;
        }
        .edit_form{
            width: 420px;
            height: auto;
        }
        .edit_form .para{
            width: 100%;
            height: 46px;
            line-height: 46px;
            display: flex;
            flex-direction: row;
            justify-content: space-around;
        }
        .edit_form .paraname{
            font-size: 14px;
            color: rgba(0,0,0,0.6);
            width: 45%;
            vertical-align: middle;
        }
        .edit_form .paravalue{
            width: 55%;
            font-size: 14px;
            vertical-align: middle;
        }
        .psnvalue{
            color: rgba(0,0,0,0.6);
            font-weight: 400;
            padding-left: 13px;
        }
        .edit_butt{
            width: 100%;
            margin-top: 10px;
            display: flex;
            flex-direction: row;
            justify-content:flex-end;
        }
        .edit_butt span{
            font-size: 14px;
            font-weight: 360;
            height: 26px;
            line-height: 26px;
            cursor: pointer;
        }
        .edit_butt .edit_bu_close{
            margin-right: 28px;
            color:#5A5EA6;
        }
        .edit_butt .edit_bu_submit{
            color: #5A5EA6;
        }
        /* edit device */</style>
        <div class="edit_wrap">
            <div class="edit_title">编辑</div>
            <div class="edit_form">
                <div class="para">
                    <span class="paraname parasn">SN</span>
                    <span class="paravalue psnvalue">210342785300302</span>
                </div>
                <div class="para">
                    <span class="paraname paracomport">COM口</span>
                    <zy-edit-dropdown class="edit_comport paravalue" placeholder="请选择">
                        <option value="COM1">COM1</option>
                        <option value="COM2">COM2</option>
                        <option value="COM3">COM3</option>
                        <option value="COM4">COM4</option>
                    </zy-edit-dropdown>
                </div>
                <div class="para">
                    <span class="paraname paramodbus">Modbus地址</span>
                    <zy-edit-input class="paravalue edit_addr" placeholder="" inunit="" regex="" disabled='enable'></zy-edit-input>
                    <!-- <span class="paravalue"></span> -->
                </div>
            </div>
            <div class="edit_butt">
                <span class="edit_bu_close">关闭</span>
                <span class="edit_bu_submit">确定</span>
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
// 删除设备窗体
function Formdeletedevice(){
    var w=document.createElement('div')
    w.innerHTML=`<style>/*delete device  */
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
    <div class="deletebackground">
        <div class="delete_wrap">
            <div class="delete_title">删除</div>
            <div class="delete_form">
                <span class="delete_text">确认删除：</span><span class="delete_sn"></span><span class="delete_text">?</span>
            </div>
            <div class="delete_butt">
                <span class="delete_bu_close">关闭</span>
                <span class="delete_bu_submit">确定</span>
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

// disable the edit and delete icon under CAN port
export function disablecanport(){
    var connarr= document.querySelectorAll('.gdeviceconn')
    connarr.forEach((e,i) => {
        var comport=e.querySelector('.deli_inf')
        var li_opera=e.querySelector('.deli_opera')
        var li_select=e.querySelector('.deli_select')
        if(comport.innerHTML == 'CAN'){
            li_opera.style.color='#AEBBCE'
            li_opera.title='禁止变更CAN通讯下的设备'
            li_select.innerHTML='<i class="iconfont selecticon">&#xe61c;</i>'
            li_select.style.color='#AEBBCE'
            li_select.classList.add('canport')
            li_select.title='禁止修改CAN通讯下的设备'
            var everli=e.querySelectorAll('.device_list_trtd')
            everli.forEach(v => {
                v.style.backgroundColor='#FBFBFB'
            })
        }
    })
}
// change the status of selection
function selectionbutt(){
    var connarr= document.querySelectorAll('.gdeviceconn')
    connarr.forEach((e,i) => {
        var icon=e.querySelector('.deli_select')
        icon.addEventListener('click',function(){
            if(!icon.classList.contains('canport')){
                if(icon.classList.contains('enabled')){
                    icon.innerHTML='<i class="iconfont selecticon">&#xe610;</i>'
                    icon.style.color='#111'
                    icon.classList.toggle('enabled')
                }else{
                    icon.innerHTML='<i class="iconfont selecticon">&#xe65e;</i>'
                    icon.style.color='#676CC4'
                    icon.classList.toggle('enabled')
                }
            }
            
        })
    })
}
// batch delete device
const bdelete=document.querySelector('.deletedevice')
const selectall=document.querySelector('.selectalls')
// select all
function selectallFunction(){
    selectall.addEventListener('click',function(){
        var connarr= document.querySelectorAll('.gdeviceconn')
        if(selectall.classList.contains('enabled')){
            selectall.innerHTML='<i class="iconfont selectallicon">&#xe610;</i>选择'
            selectall.querySelector('.selectallicon').style.color='#111'
            selectall.classList.toggle('enabled')
            if(connarr.length!=0){
                connarr.forEach((e,i) => {
                    var icon=e.querySelector('.deli_select')
                    if(!icon.classList.contains('canport')){
                        if(icon.classList.contains('enabled')){
                            icon.innerHTML='<i class="iconfont selecticon">&#xe610;</i>'
                            icon.style.color='#111'
                            icon.classList.toggle('enabled')
                        }
                    }
                })
            }
        }else{
            selectall.innerHTML='<i class="iconfont selectallicon">&#xe65e;</i>选择'
            selectall.querySelector('.selectallicon').style.color='#676CC4'
            selectall.classList.toggle('enabled')
            if(connarr.length!=0){
                connarr.forEach((e,i) => {
                    var icon=e.querySelector('.deli_select')
                    if(!icon.classList.contains('canport')){
                        if(!icon.classList.contains('enabled')){
                            icon.innerHTML='<i class="iconfont selecticon">&#xe65e;</i>'
                            icon.style.color='#676CC4'
                            icon.classList.toggle('enabled')
                        }
                    }
                })
            }
        }
    })
}
bdelete.addEventListener('click',function(){
    const connarr= document.querySelectorAll('.gdeviceconn')
    if(connarr.length!=0){
        var i=0
        var postarr={
            num:0,
            dev:[]
        }
        connarr.forEach(e => {
            const select=e.querySelector('.deli_select')
            if(select.classList.contains('enabled')){
                postarr.dev[i]={sn: `${e.querySelector('.deli_sn').innerHTML}`}
                i++
            }
        })
        if(postarr.dev.length != 0){
            postarr.num=postarr.dev.length
            postarr.time=new Date().getTime()
            Ajax.post(`${requestBaseURL}/delete_device`,JSON.stringify(postarr),function(c){
                c=JSON.parse(c)
                if(c.state == 1){
                    showMessage(getPrompt("setSucc"),2000,'succContent','&#xe616;')
                    initlist().then((res) => {
                        if(res){
                            editdevice()
                            deletedevice()
                            disablecanport()
                            selectionbutt()
                        }
                    })
                }else{
                    showMessage(getPrompt("setFailed"),2000,'failedContent','&#xed1b;')
                    initlist().then((res) => {
                        if(res){
                            editdevice()
                            deletedevice()
                            disablecanport()
                            selectionbutt()
                        }
                    })
                }
            })
        }else{
            showMessage(getPrompt("deleteprompt"),2000,'failedContent','&#xed1b;')
        }
    }else{
        showMessage('暂无设备',2000,'failedContent','&#xed1b;')
    }
    
})

// change to next page
const nextpage=document.querySelector('.nextpage')
nextpage.addEventListener('click',function(){
    const parentDoc = window.parent.document;
    parentDoc.querySelector('.iframeCon').src='../html/gMeter.html'
    const onclk=parentDoc.querySelectorAll('.nav2li')
    onclk[2].classList.remove("li2clk")
    onclk[3].classList.add("li2clk")
    parentDoc.querySelector(".cnav2").innerHTML=onclk[3].querySelector(".navname").innerHTML
})
// refresh page
refresh.addEventListener('click',function(){
    initlist().then((res) => {
        if(res){
            editdevice()
            deletedevice()
            disablecanport()
            selectionbutt()
        }
    })
})

