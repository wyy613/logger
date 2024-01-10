import { Ajax } from "./config.js"
import { zyInput } from './zyElement.js'
import { showMessage, getPrompt, setzyInput, getzyInput } from './common.js'
const set_butt = document.querySelector(".set_butt")
const refresh = document.querySelector('.refresh')
var inputRegexMap = []
function initInvNum () {
    return new Promise((res) => {
        Ajax.get(`/logger_face_post`, function (c) {
            c = JSON.parse(c)
            console.log(c)
            if (c.com4_funelete == 0) {
                if (document.querySelector('.nometerport') != null) {
                    var nometerport = document.querySelector('.nometerport')
                    nometerport.parentNode.removeChild(nometerport)
                }
                document.querySelector('.gparawrap').innerHTML = `
                <zy-input class="comport" titlename="COM口" placeholder="COM4" prompt='电表及其他第三方设备只能接在COM4下' inunit="" regex="" disabled="">
                </zy-input>
                <zy-dropdown class="baud_rate" placeholder="请选择" titlename="波特率">
                    <option value="9600">9600</option>
                    <option value="115200">115200</option>
                </zy-dropdown>
                <zy-dropdown class="metertype" placeholder="请选择一个选项" titlename="电表类型">
                    <option value="RMM">RMM</option>
                    <option value="DTSD1352" >DTSD1352</option>
                    <option value="AC10H">AC10H</option>
                </zy-dropdown>
                <zy-dropdown class="protocoltype" placeholder="请选择协议类型" titlename="协议类型">
                    <option value="Modbus-RTU">Modbus-RTU</option>
                    <option value="RTU">RTU</option>
                </zy-dropdown>
                <zy-input class="modbusaddr" titlename="地址" placeholder="[1, 247]" prompt='范围：[1, 247]' inunit="" regex="^(0*[1-9]\d?|[1-9][0-9]{1,2}|1\d{2}|2[0-3]\d|24[0-7])$" disabled="enable">
                </zy-input>
                <zy-input class="volRatio"  titlename="电压变比" placeholder="[0, 6000]" prompt="范围：[0, 6000]" inunit=": 1" regex="^([0-9]\\d{0,2}|[1-5]\\d{3}|6000)$" disabled='enable'>          
                </zy-input>
                <zy-input class="currRatio"  titlename="CT变比" placeholder="[0, 6000]" prompt="范围：[0, 6000]" inunit=": 1" regex="^([0-9]\\d{0,2}|[1-5]\\d{3}|6000)$" disabled='enable'>
                </zy-input>`

            } else {
                // 清除之前的组件
                const gparawrapElement = document.querySelector('.gparawrap');
                if (gparawrapElement.hasChildNodes()) {
                    while (gparawrapElement.firstChild) {
                        gparawrapElement.removeChild(gparawrapElement.firstChild);
                    }
                }
                var wrap = document.createElement('div')
                wrap.setAttribute('class', 'nometerport')
                wrap.innerHTML = `<span class="notemeter">
                若要进行电表配置，请先转到<span class="goinvset">采集器参数</span>页面，将“COM4功能选择”设为“接入电表”
                </span><span class='elsenote'>若不需要进行电表设置，可点击“下一步”</span>`
                gparawrapElement.appendChild(wrap)
            }
            res(c)
        })
    })

}
initInvNum().then((res) => {
    if (res) {
        getpara()
        setpara()
    }
})

function getpara () {
    if (document.querySelectorAll('zy-dropdown') != null) {
        var obj = {
            time: 0,
        }
        var alloptionsvalue = []
        // 校验输入框数值是否合法
        setzyInput('.comport', 'COM4')
        const inputs = document.querySelectorAll('.modbusaddr, .volRatio, .currRatio')
        const selects = document.querySelectorAll('zy-dropdown')

        var regexmodbusadd = new RegExp(document.querySelector('.modbusaddr').getAttribute('regex'))
        var regexvolradio = new RegExp(document.querySelector('.volRatio').getAttribute('regex'))
        var regexcurrRatio = new RegExp(document.querySelector('.currRatio').getAttribute('regex'))
        inputRegexMap = [regexmodbusadd, regexvolradio, regexcurrRatio]

        selects.forEach((ele, i) => {
            alloptionsvalue.push([...ele.getOption()].map((option) => option.dataset.value))
        })
        console.log(alloptionsvalue)
        // init page value
        Ajax.get(`/meter_face_post`, function (c) {
            c = JSON.parse(c)
            console.log(c)
            try {
                setzyInput('.modbusaddr', c.addr)
                setzyInput('.volRatio', c.vratio)
                setzyInput('.currRatio', c.ctratio)
                setzyInput('.baud_rate', getoptionValue(c.bautrate, 0))
                setzyInput('.metertype', getoptionValue(c.metertype, 1))
                setzyInput('.protocoltype', getoptionValue(c.agreement, 2))
            } catch (d) {
                console.log(d)
            }
        })
        function getoptionValue (val, id) {
            return alloptionsvalue[id][val]
        }
    }
}

function setpara () {
    // init page value
    // check if select the option
    var alloptionsvalue = []
    var obj = {}
    const inputs = document.querySelectorAll('.modbusaddr, .volRatio, .currRatio')
    const selects = document.querySelectorAll('zy-dropdown')
    var regexmodbusadd = new RegExp(document.querySelector('.modbusaddr').getAttribute('regex'))
    var regexvolradio = new RegExp(document.querySelector('.volRatio').getAttribute('regex'))
    var regexcurrRatio = new RegExp(document.querySelector('.currRatio').getAttribute('regex'))
    inputRegexMap = [regexmodbusadd, regexvolradio, regexcurrRatio]
    function checkAllSelect () {
        let allValid = true
        const baud_rate = document.querySelector('.baud_rate').getContent().value
        const metertype = document.querySelector('.metertype').getContent().value
        const protocoltype = document.querySelector('.protocoltype').getContent().value
        if (baud_rate == '' || metertype == '' || protocoltype == '') {
            allValid = false
        }
        return allValid
    }
    selects.forEach((ele) => {
        var options = ele.getOptions()
        options.addEventListener('click', function () {
            enableOrDisableButton()
        })
    })
    // check if select the option

    // check the input value, is it legal?
    function validateInput (input, regex) {
        return regex.test(input.value)
    }

    function checkAllInputs () {
        let allValid = true
        inputs.forEach((input, i) => {
            if (!validateInput(input.getContent(), inputRegexMap[i])) {
                allValid = false
            }
        });
        return allValid
    }

    function enableOrDisableButton () {
        if (checkAllInputs() && checkAllSelect()) {
            set_butt.style.cursor = 'pointer'
            set_butt.style.backgroundColor = '#676cc4'
        } else {
            set_butt.style.cursor = 'not-allowed'
            set_butt.style.backgroundColor = '#d8d8d8'
        }
    }

    function handleInputChange (event) {
        if (event.target.matches('.modbusaddr, .volRatio, .currRatio')) {
            enableOrDisableButton()
        }
    }

    inputs.forEach(input => {
        input.addEventListener('input', handleInputChange)
    })

    enableOrDisableButton()
    // Checking the state of the input box at initialisation

    // submit data
    selects.forEach((ele, i) => {
        alloptionsvalue.push([...ele.getOption()].map((option) => option.dataset.value))
    })
    set_butt.addEventListener("click", function () {
        obj.time = new Date().getTime()
        obj.addr = getzyInput('.modbusaddr')
        obj.vratio = getzyInput('.volRatio')
        obj.ctratio = getzyInput('.currRatio')
        getoptionid('bautrate', '.baud_rate', 0)
        getoptionid('metertype', '.metertype', 1)
        getoptionid('agreement', '.protocoltype', 2)
        console.log(obj)
        Ajax.post(`/meter_set`, JSON.stringify(obj), function (c) {
            c = JSON.parse(c)
            console.log(c)
            if (c.state == 1) {
                showMessage(getPrompt("setSucc"), 2000, 'succContent', '&#xe616;')
            } else {
                showMessage(getPrompt("setFailed"), 2000, 'failedContent', '&#xed1b;')
                initInvNum()
            }
        })
    })
    function getoptionid (e, name, id) {
        const usbFlashValue = document.querySelector(`${name}`).getContent().value
        obj[e] = alloptionsvalue[id].indexOf(usbFlashValue)
        return obj
    }
    // submit data
}



// turn to gLoggerpara.html
if (document.querySelector('.goinvset') != null) {
    const goinvset = document.querySelector('.goinvset')
    goinvset.addEventListener('click', function () {
        const parentDoc = window.parent.document;
        parentDoc.querySelector('.iframeCon').src = '../html/gLoggerpara.html'
        const onclk = parentDoc.querySelectorAll('.nav2li')
        onclk[3].classList.remove("li2clk")
        onclk[0].classList.add("li2clk")
        parentDoc.querySelector(".cnav2").innerHTML = onclk[0].querySelector(".navname").innerHTML
    })
}

// change to next page
const nextpage = document.querySelector('.nextpage')
nextpage.addEventListener('click', function () {
    const parentDoc = window.parent.document;
    parentDoc.querySelectorAll('.nav2li')[4].click()
    // parentDoc.querySelector('.iframeCon').src='../html/gNetwork.html'
    // const onclk=parentDoc.querySelectorAll('.nav2li')
    // onclk[3].classList.remove("li2clk")
    // onclk[4].classList.add("li2clk")
    // parentDoc.querySelector(".cnav2").innerHTML=onclk[4].querySelector(".navname").innerHTML
})
// refresh page
refresh.addEventListener('click', function () {
    // initInvNum()
})


