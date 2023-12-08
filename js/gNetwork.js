import {Ajax} from "./config.js"
import {zyInput} from './zyElement.js'
import {showMessage,getPrompt,setzyInput,getzyInput} from './common.js'
const requestBaseURL="./cgi-bin"
const set_butt = document.querySelector(".set_butt")
const refresh=document.querySelector('.refresh')
var alloptionsvalue=[]
var obj={}
const parentElement = document.querySelector('.gparawrap')
// 创建新的子节点
const wlanNodes = `
<zy-dropdown class="wlanname netdetail" placeholder="请选择" titlename="网络">
</zy-dropdown>
<zy-input class="wlanpass netdetail" titlename="密码" placeholder="请输入" prompt='支持数字、大小写字母、特殊字符' inunit="" regex="" disabled="enable">
</zy-input>
<zy-dropdown class="wlandhcp netdetail" placeholder="请选择" titlename="DHCP"><option value="关闭">关闭</option><option value="开启">开启</option></zy-dropdown>
`
const lanNodes = `
<zy-dropdown class="wlandhcp netdetail" placeholder="请选择" titlename="DHCP"><option value="关闭">关闭</option><option value="开启">开启</option></zy-dropdown>
`
const net4G=`
<zy-input class="net4G netdetail" titlename="接入点名称(APN)" placeholder="请输入" prompt='支持数字、大小写字母、特殊符号' inunit="" regex="" disabled="enable">
</zy-input>
`
const disableDhcp=`
<zy-input class="wlanip netdetail" titlename="IP地址" placeholder="" prompt='请输入有效的ip地址' inunit="" regex="^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$" disabled="enable">
</zy-input>
<zy-input class="wlannetmask netdetail" titlename="子网掩码" placeholder="" prompt='请输入有效的子网掩码' inunit="" regex="^(?:(?:255\.){3}(?:0|128|192|224|240|248|252|254|255))|(?:(?:255\.){2}(?:0|128|192|224|240|248|252|254|255)\.0)|(?:255\.(?:0|128|192|224|240|248|252|254|255)\.0\.0)|(?:(?:0|128|192|224|240|248|252|254|255)\.0\.0\.0)$" disabled="enable">
</zy-input>
<zy-input class="wlangateway netdetail" titlename="默认网关" placeholder="" prompt='请输入有效的网关地址' inunit="" regex="^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$" disabled="enable">
</zy-input>
<zy-input class="wlanencryption netdetail" titlename="加密方式" placeholder="" prompt='' inunit="" regex="" disabled="">
</zy-input>
`

let netlist=[
    {
        name: 'solinteg',
        rssi: 89,
    },
    {
        name: 'solinteg-office',
        rssi: 89,
    },
    {
        name: 'xiaomi_1713',
        rssi: 89,
    },
    {
        name: '昊华传动',
        rssi: 89,
    },
    {
        name: 'chinanet-yxIN',
        rssi: 89,
    },
]
function initInvNum(){
        Ajax.get(`${requestBaseURL}/net_face_post`,function(c){
            c=JSON.parse(c)
            console.log(c)
            if(c.type == 4){
                console.log('当前暂未设置网络')
            }else if(c.type == 0){
                if(document.querySelector('.netdetail') != null){
                    var netdetailNodes = Array.from(document.querySelectorAll('.netdetail'));
                    netdetailNodes.forEach(node => node.remove());
                }
                parentElement.insertAdjacentHTML('beforeend', wlanNodes)
                parentElement.insertAdjacentHTML('beforeend', disableDhcp)
                var selects=document.querySelector('.wlandhcp')
                alloptionsvalue=[...selects.getOption()].map((option) => option.dataset.value)
                setzyInput('.wlanname',c.name)
                setzyInput('.wlanpass',c.passwd)
                setzyInput('.wlandhcp',alloptionsvalue[c.dhcp])
                if(c.dhcp == 0){
                    document.querySelector('.wlanip').setdisable('enable')
                    document.querySelector('.wlannetmask').setdisable('enable')
                    document.querySelector('.wlangateway').setdisable('enable')
                }else if(c.dhcp == 1){
                    document.querySelector('.wlanip').setdisable('')
                    document.querySelector('.wlannetmask').setdisable('')
                    document.querySelector('.wlangateway').setdisable('')
                }
                setzyInput('.wlanip',c.ip)
                setzyInput('.wlannetmask',c.netmask)
                setzyInput('.wlangateway',c.gateway)
                setzyInput('.wlanencryption',c.encryption)
            }else if(c.type == 1){
                if(document.querySelector('.netdetail') != null){
                    var netdetailNodes = Array.from(document.querySelectorAll('.netdetail'));
                    netdetailNodes.forEach(node => node.remove());
                }
                parentElement.insertAdjacentHTML('beforeend', lanNodes)
                parentElement.insertAdjacentHTML('beforeend', disableDhcp)
                var selects=document.querySelector('.wlandhcp')
                alloptionsvalue=[...selects.getOption()].map((option) => option.dataset.value)
                setzyInput('.wlandhcp',alloptionsvalue[c.dhcp])
                if(c.dhcp == 0){
                    document.querySelector('.wlanip').setdisable('enable')
                    document.querySelector('.wlannetmask').setdisable('enable')
                    document.querySelector('.wlangateway').setdisable('enable')
                }else if(c.dhcp == 1){
                    document.querySelector('.wlanip').setdisable('')
                    document.querySelector('.wlannetmask').setdisable('')
                    document.querySelector('.wlangateway').setdisable('')
                }
            }else{
                if(document.querySelector('.netdetail') != null){
                    var netdetailNodes = Array.from(document.querySelectorAll('.netdetail'));
                    netdetailNodes.forEach(node => node.remove());
                }
                parentElement.insertAdjacentHTML('beforeend', net4G)
                setzyInput('.net4G',c.apn)
            }
        })
}
initInvNum()
const selecttype=document.querySelector('.networktype')
const options=Array.from(selecttype.getElementsByTagName('option'))
selecttype.getOptions().addEventListener('click', (event) => {
    if (event.target.classList.contains('option')) {
        const selectedValue = event.target.dataset.value
        var selectedOption = options.find(option => option.value === selectedValue)
        if(selectedOption.textContent == 'WLAN'){
            if(document.querySelector('.netdetail') != null){
                var netdetailNodes = Array.from(document.querySelectorAll('.netdetail'))
                netdetailNodes.forEach(node => node.remove())
            }
            // 在参考节点之后插入新节点
            parentElement.insertAdjacentHTML('beforeend', wlanNodes)
            scanwifi()
            const wlanname=document.querySelector('.wlanname')
            const wlannameoptions=Array.from(wlanname.getElementsByTagName('option'))
            const dhcpValue=document.querySelector('.wlandhcp')
            wlanname.getOptions().addEventListener('click',(event) =>{
                if (event.target.classList.contains('option')) {
                    opendhcp()
                }
                if(dhcpValue.getContent().value == '开启'){
                    set_butt.style.cursor='pointer'
                    set_butt.style.backgroundColor='#676cc4'
                }
            })
            dhcpValue.getOptions().addEventListener('click',function(event){
                if(dhcpValue.getContent().value == '关闭' && selecttype.getContent().value == 'WLAN'){
                    if(document.querySelectorAll('.wlanip, .wlannetmask, .wlangateway, .wlanencryption').length==0){
                        parentElement.insertAdjacentHTML('beforeend', disableDhcp)
                    }
                }else if(dhcpValue.getContent().value == '开启' && selecttype.getContent().value == 'WLAN'){
                    if(document.querySelectorAll('.wlanip, .wlannetmask, .wlangateway, .wlanencryption')!=null){
                        var ipset=document.querySelectorAll('.wlanip, .wlannetmask, .wlangateway, .wlanencryption')
                        ipset.forEach(e => {
                            e.remove()
                        })
                    }
                }
            })
        }else if(selectedOption.textContent == 'LAN'){
            if(document.querySelector('.netdetail') != null){
                var netdetailNodes = Array.from(document.querySelectorAll('.netdetail'))
                netdetailNodes.forEach(node => node.remove())
            }
            parentElement.insertAdjacentHTML('beforeend', lanNodes)
            opendhcp()
        }else{
            if(document.querySelector('.netdetail') != null){
                var netdetailNodes = Array.from(document.querySelectorAll('.netdetail'))
                netdetailNodes.forEach(node => node.remove())
            }
            parentElement.insertAdjacentHTML('beforeend', net4G)
            enable4g()
        }
    }
})

function opendhcp(){
    const dhcp=document.querySelector('.wlandhcp')
    const dhcpopt=Array.from(dhcp.getElementsByTagName('option'))
    var resi=-1
    dhcp.getOptions().addEventListener('click',function(event){
        if (event.target.classList.contains('option')) {
            const options=Array.from(dhcp.getElementsByTagName('option'))
            const selectedValue = event.target.dataset.value
            var selectedOption = options.find(option => option.value === selectedValue)
            alloptionsvalue=[...dhcp.getOption()].map((option) => option.dataset.value)
            resi = alloptionsvalue.indexOf(selectedOption.textContent)
            if(resi == 0 && selecttype.getContent().value == 'WLAN'){
                if(document.querySelectorAll('.wlanip, .wlannetmask, .wlangateway, .wlanencryption')==null){
                    parentElement.insertAdjacentHTML('beforeend', disableDhcp)
                }
                set_butt.style.cursor='not-allowed'
                set_butt.style.backgroundColor='#d8d8d8'
                wlanset()
            }else if(resi == 0 && selecttype.getContent().value == 'LAN'){
                if(document.querySelectorAll('.wlanip, .wlannetmask, .wlangateway, .wlanencryption')!=null){
                    parentElement.insertAdjacentHTML('beforeend', disableDhcp)
                }
                lanset()
            }else if(resi == 1 && selecttype.getContent().value == 'WLAN'){
                if(document.querySelectorAll('.wlanip, .wlannetmask, .wlangateway, .wlanencryption')!=null){
                    var ipset=document.querySelectorAll('.wlanip, .wlannetmask, .wlangateway, .wlanencryption')
                    ipset.forEach(e => {
                        e.remove()
                    })
                }
                wlandhcpButton()
            }if(resi == 1 && selecttype.getContent().value == 'LAN'){
                if(document.querySelectorAll('.wlanip, .wlannetmask, .wlangateway, .wlanencryption')!=null){
                    var ipset=document.querySelectorAll('.wlanip, .wlannetmask, .wlangateway, .wlanencryption')
                    ipset.forEach(e => {
                        e.remove()
                    })
                }
                landhcpButton()
            }
        }
    })
}
function scanwifi(){
    if(document.querySelector('.wlanname')!=null){
        document.querySelector('.wlanname').addEventListener('click',function(){
            Ajax.get(`${requestBaseURL}/scan_wifi`,function(c){
                c=JSON.parse(c)
                console.log(c)
                try{
                    document.querySelector('.wlanname').innerHTML=`${c.wifiinfo.map(option => `<option value="${option.name}">${option.name}</option>`).join('')}`
                    const options = Array.from(document.querySelector('.wlanname').getElementsByTagName('option'))
                    document.querySelector('.wlanname').dynamicsetoption(options)
                }catch(d){
                    console.log(d)
                }
            })
            // 自测使用
            // document.querySelector('.wlanname').innerHTML=`${netlist.map(option => `<option value="${option.name}">${option.name}</option>`).join('')}`
            // const options = Array.from(document.querySelector('.wlanname').getElementsByTagName('option'))
            // document.querySelector('.wlanname').dynamicsetoption(options)
        })
    }
}

function wlanset(){
    var ipRegex=new RegExp(document.querySelector('.wlanip').getAttribute('regex'))
    var subnetMaskRegex=new RegExp(document.querySelector('.wlannetmask').getAttribute('regex'))
    var defaultGatewayRegex=new RegExp(document.querySelector('.wlangateway').getAttribute('regex'))
    var inputRegexMap=[ipRegex,subnetMaskRegex,defaultGatewayRegex]
    var inputs = document.querySelectorAll('.wlanip, .wlannetmask, .wlangateway')
    var selects=document.querySelectorAll('.wlanname, .wlandhcp')
    selects.forEach((ele,i) => {
        alloptionsvalue.push([...ele.getOption()].map((option) => option.dataset.value))
    })
    inputs.forEach(input => {
        input.addEventListener('input', handleInputChange)
    })
    // check if select the option
    function checkAllSelect(){
        let allValid = true
        const nettype=document.querySelector('.networktype').getContent().value
        const wlanname=document.querySelector('.wlanname').getContent().value
        const wlandhcp=document.querySelector('.wlandhcp').getContent().value
        if(nettype == '' || wlanname == '' || wlandhcp == ''){
            allValid = false
        }
        return allValid
    }
    selects.forEach((ele) => {
        var options=ele.getOptions()
        options.addEventListener('click',function(){
            enableOrDisableButton()
        })
    })
    // check if select the option
    // check the input value, is it legal?
    function validateInput(input, regex) {
        return regex.test(input.value)
    }
    function checkAllInputs() {
        let allValid = true;
        inputs.forEach((input,i) => {
            if (!validateInput(input.getContent(), inputRegexMap[i])) {
                allValid = false
            }
        })
        return allValid
    }
    function enableOrDisableButton() {
        const dhcpValue = document.querySelector('.wlandhcp').getContent().value
        var res = alloptionsvalue.indexOf(dhcpValue)
        if(res == 0){
            if(checkAllInputs() && checkAllSelect()){
                set_butt.style.cursor='pointer'
                set_butt.style.backgroundColor='#676cc4'
            }else{
                set_butt.style.cursor='not-allowed'
                set_butt.style.backgroundColor='#d8d8d8'
            }
        }else{
            if(checkAllSelect()){
                set_butt.style.cursor='pointer'
                set_butt.style.backgroundColor='#676cc4'
            }else{
                set_butt.style.cursor='not-allowed'
                set_butt.style.backgroundColor='#d8d8d8'
            }
        }
    }
    function handleInputChange(event) {
        if (event.target.matches('.wlanip, .wlannetmask, .wlangateway')) {
            enableOrDisableButton();
        }
    }
    
    enableOrDisableButton()
    // submit data
    // set_butt.addEventListener('click',function(){
    set_butt.onclick=function(){
        if(set_butt.style.cursor=='pointer'){
            var diswlanobj={}
            diswlanobj.time=new Date().getTime()
            diswlanobj.type=0
            diswlanobj.name=document.querySelector('.wlanname').getContent().value
            diswlanobj.passwd=getzyInput('.wlanpass')
            const usbFlashValue = document.querySelector('.wlandhcp').getContent().value
            var res = alloptionsvalue.indexOf(usbFlashValue)
            diswlanobj.dhcp=res
            if(res == 0){
                diswlanobj.ip=getzyInput('.wlanip')
                diswlanobj.netmask=getzyInput('.wlannetmask')
                diswlanobj.gateway=getzyInput('.wlangateway')
            }
            Ajax.post(`${requestBaseURL}/net_set`,JSON.stringify(diswlanobj),function(c){
                c=JSON.parse(c)
                console.log(c)
                if(c.state == 1){
                    showMessage(getPrompt("setSucc"),2000,'succContent','&#xe616;')
                }else{
                    showMessage(getPrompt("setFailed"),2000,'failedContent','&#xed1b;')
                    initInvNum()
                }
            })
        }
    }
}     

function lanset(){
    var ipRegex=new RegExp(document.querySelector('.wlanip').getAttribute('regex'))
    var subnetMaskRegex=new RegExp(document.querySelector('.wlannetmask').getAttribute('regex'))
    var defaultGatewayRegex=new RegExp(document.querySelector('.wlangateway').getAttribute('regex'))
    var inputRegexMap=[ipRegex,subnetMaskRegex,defaultGatewayRegex]
    var inputs = document.querySelectorAll('.wlanip, .wlannetmask, .wlangateway')
    var selects=document.querySelectorAll('.wlandhcp')
    selects.forEach((ele,i) => {
        alloptionsvalue.push([...ele.getOption()].map((option) => option.dataset.value))
    })
    inputs.forEach(input => {
        input.addEventListener('input', handleInputChange)
    })
    // check if select the option
    function checkAllSelect(){
        let allValid = true
        const wlandhcp=document.querySelector('.wlandhcp').getContent().value
        if(wlandhcp == ''){
            allValid = false
        }
        return allValid
    }
    selects.forEach((ele) => {
        var options=ele.getOptions()
        options.addEventListener('click',function(){
            enableOrDisableButton()
        })
    })
    // check if select the option
    // check the input value, is it legal?
    function validateInput(input, regex) {
        return regex.test(input.value)
    }
    function checkAllInputs() {
        let allValid = true;
        inputs.forEach((input,i) => {
            if (!validateInput(input.getContent(), inputRegexMap[i])) {
                allValid = false
            }
        })
        return allValid
    }
    function enableOrDisableButton() {
        const dhcpValue = document.querySelector('.wlandhcp').getContent().value
        var res = alloptionsvalue.indexOf(dhcpValue)
        if(res == 0){
            if(checkAllInputs() && checkAllSelect()){
                set_butt.style.cursor='pointer'
                set_butt.style.backgroundColor='#676cc4'
            }else{
                set_butt.style.cursor='not-allowed'
                set_butt.style.backgroundColor='#d8d8d8'
            }
        }else{
            set_butt.style.cursor='pointer'
            set_butt.style.backgroundColor='#676cc4'
        }
    }
    function handleInputChange(event) {
        if (event.target.matches('.wlanip, .wlannetmask, .wlangateway')) {
            enableOrDisableButton();
        }
    }
    
    enableOrDisableButton()
    // submit data
    // set_butt.addEventListener('click',function(){
    set_butt.onclick=function(){
        if(set_butt.style.cursor=='pointer'){
            obj.time=new Date().getTime()
            obj.type=1
            const usbFlashValue = document.querySelector('.wlandhcp').getContent().value
            var res = alloptionsvalue.indexOf(usbFlashValue)
            obj.dhcp=res
            if(res == 0){
                obj.ip=getzyInput('.wlanip')
                obj.netmask=getzyInput('.wlannetmask')
                obj.gateway=getzyInput('.wlangateway')
            }
            Ajax.post(`${requestBaseURL}/net_set`,JSON.stringify(obj),function(c){
                c=JSON.parse(c)
                console.log(c)
                if(c.state == 1){
                    showMessage(getPrompt("setSucc"),2000,'succContent','&#xe616;')
                }else{
                    showMessage(getPrompt("setFailed"),2000,'failedContent','&#xed1b;')
                    initInvNum()
                }
            })
        }
    }
}

function wlandhcpButton(){
    set_butt.style.cursor='pointer'
    set_butt.style.backgroundColor='#676cc4'
    
    // set_butt.addEventListener('click',function(){
    set_butt.onclick=function(){
        if(set_butt.style.cursor=='pointer'){
            obj.time=new Date().getTime()
            obj.type=0
            obj.name=document.querySelector('.wlanname').getContent().value
            obj.passwd=getzyInput('.wlanpass')
            const usbFlashValue = document.querySelector('.wlandhcp').getContent().value
            var res = alloptionsvalue.indexOf(usbFlashValue)
            obj.dhcp=res
            console.log('wlandhcpButton')
            Ajax.post(`${requestBaseURL}/net_set`,JSON.stringify(obj),function(c){
                c=JSON.parse(c)
                console.log(c)
                if(c.state == 1){
                    showMessage(getPrompt("setSucc"),2000,'succContent','&#xe616;')
                }else{
                    showMessage(getPrompt("setFailed"),2000,'failedContent','&#xed1b;')
                    initInvNum()
                }
            })
        }
    }
}
function landhcpButton() {
    var objlan={}
    set_butt.style.cursor='pointer'
    set_butt.style.backgroundColor='#676cc4'
    // set_butt.addEventListener('click',function(){
    set_butt.onclick=function(){
        if(set_butt.style.cursor=='pointer'){
            objlan.time=new Date().getTime()
            objlan.type=1
            const usbFlashValue = document.querySelector('.wlandhcp').getContent().value
            var res = alloptionsvalue.indexOf(usbFlashValue)
            objlan.dhcp=res
            Ajax.post(`${requestBaseURL}/net_set`,JSON.stringify(objlan),function(c){
                c=JSON.parse(c)
                console.log(c)
                if(c.state == 1){
                    showMessage(getPrompt("setSucc"),2000,'succContent','&#xe616;')
                }else{
                    showMessage(getPrompt("setFailed"),2000,'failedContent','&#xed1b;')
                    initInvNum()
                }
            })
        }
    }
}

function enable4g(){
    function checkAllSelect(){
        let allValid = true
        const networktype=document.querySelector('.networktype').getContent().value
        if(networktype == ''){
            allValid = false
        }
        return allValid
    }
    document.querySelector('.net4G').addEventListener('input',function(){
        var apnvalue=document.querySelector('.net4G').getContent().value
        if(checkAllSelect() && apnvalue !== ''){
            set_butt.style.cursor='pointer'
            set_butt.style.backgroundColor='#676cc4'
        }else{
            set_butt.style.cursor='not-allowed'
            set_butt.style.backgroundColor='#d8d8d8'
        }
    })
    // set_butt.addEventListener('click',function(){
    set_butt.onclick=function(){
        var obj4g={}
        if(set_butt.style.cursor=='pointer'){
            obj4g.time=new Date().getTime()
            obj4g.type=2
            obj4g.apn=document.querySelector('.net4G').getContent().value
            Ajax.post(`${requestBaseURL}/net_set`,JSON.stringify(obj4g),function(c){
                c=JSON.parse(c)
                console.log(c)
                if(c.state == 1){
                    showMessage(getPrompt("setSucc"),2000,'succContent','&#xe616;')
                }else{
                    showMessage(getPrompt("setFailed"),2000,'failedContent','&#xed1b;')
                    initInvNum()
                }
            })
        }
    }
}


// change to next page
const nextpage=document.querySelector('.nextpage')
nextpage.addEventListener('click',function(){
    const parentDoc = window.parent.document;
    parentDoc.querySelector('.iframeCon').src='../html/gResetPass.html'
    const onclk=parentDoc.querySelectorAll('.nav2li')
    onclk[4].classList.remove("li2clk")
    onclk[5].classList.add("li2clk")
    parentDoc.querySelector(".cnav2").innerHTML=onclk[5].querySelector(".navname").innerHTML
})
// refresh page
refresh.addEventListener('click',function(){
    initInvNum()
})