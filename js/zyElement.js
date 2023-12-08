// <zy-input></zy-input>标签

export class zyInput extends HTMLElement{
    constructor(){
        super()  
        this.attachShadow({ mode: 'open' })
        this.hidden=true
    }
    connectedCallback() {
        const title=this.getAttribute('titlename')
        const placeholder=this.getAttribute('placeholder')
        const prompt=this.getAttribute('prompt')
        const inunit=this.getAttribute('inunit')
        const regex=this.getAttribute('regex')
        const disabled=this.getAttribute('disabled')
        this.shadowRoot.innerHTML =`
        <style>
        body{
            font-family: pingfang SC,helvetica neue,arial,hiragino sans gb,microsoft yahei ui,microsoft yahei,simsun,sans-serif!important;
        }
        input{
            border: none;
            background-color: transparent;
            font-family: pingfang SC,helvetica neue,arial,hiragino sans gb,microsoft yahei ui,microsoft yahei,simsun,sans-serif!important;
            font-weight: 340;
            color: #111;
        }
        input:focus{
            outline: none;
        }
        .deInput,.deDropdown{
            display: flex;flex-direction: column;
        }
        .deInput .deItitle{
            font-size: 12px;
            color: rgb(112, 126, 146);
        }
        .deInput .deItext{
            display: flex;flex-direction: row;justify-content: space-around;
            background-color: var(--tbacksun);
            border: 1px solid var(--tborder);
            width: 280px;height: 30px;border-radius: 3px;margin: 9px 0;
            line-height: 30px;
        }
        
        .input_ol{
            vertical-align: middle;
            width: 90%;
            padding-left: 12px;
            font-size: 10px;
        }
        .input_ol::placeholder{
            color: var(--tholder);
        }
        .disabled_input{
            pointer-events: none;
        }
        .iunit{
            width: 10%;
            vertical-align: middle;
            color: var(--tholder);
        }
        .iunit,.deIprompt{
            font-size: 10px;
        }
        .deIprompt{
            color: rgb(174, 187, 206);
            font-weight: 300;
        }
        /* input */</style>
        <div class="deInput">
        <span class="deItitle">${title}</span>
        <div class="deItext">
        <input class="input_ol" type="text" placeholder="${placeholder}">
        <span class="iunit">${inunit}</span>
        </div>
        <span class="deIprompt">${prompt}</span>
        </div>`
        
        const inputElement=this.shadowRoot.querySelector('.input_ol')
        const deInput=this.shadowRoot.querySelector('.deItext')
        // input：enable使能  disable禁能
        if(disabled == 'enable'){
            inputElement.disabled=false
            deInput.style.backgroundColor='#F9FAFC'
            inputElement.style.cursor='auto'
        }else{
            inputElement.disabled=true
            deInput.style.backgroundColor='#EBF0F5'
            inputElement.style.cursor='not-allowed'
        }
        // 在第一个 zyInput 实例中加载样式表
        if (!document.querySelector('.zycustom-loaded')) {
            const styleSheet = document.createElement('link')
            styleSheet.setAttribute('rel', 'stylesheet')
            styleSheet.setAttribute('href', '../css/zycustom.css')
            styleSheet.setAttribute('class', 'zycustom-loaded')
            this.shadowRoot.appendChild(styleSheet)
        }
        inputElement.addEventListener('input',function(event){
            var inputValue=this.value
            var inputregex=new RegExp(regex)
            if (regex !== ''){
                if(inputregex.test(inputValue)){
                    deInput.style.border='1px solid #F5F6F9'
                    // deInput.style.backgroundColor='#F9FAFC'
                }else{
                    deInput.style.border='1px solid #DA4E51'
                    // deInput.style.backgroundColor='#FCF1F1'
                }
            }
        })
        this.hidden=false
    }
    getContent(){
        return this.shadowRoot.querySelector('.input_ol')
    }
    getinputText(){
        return this.shadowRoot.querySelector('.deItext')
    }
    setdisable(e){
        if(e == 'enable'){
            this.shadowRoot.querySelector('.input_ol').disabled=false
            this.shadowRoot.querySelector('.deItext').style.backgroundColor='#F9FAFC'
            this.shadowRoot.querySelector('.input_ol').style.cursor='auto'
        }else{
            this.shadowRoot.querySelector('.input_ol').disabled=true
            this.shadowRoot.querySelector('.deItext').style.backgroundColor='#EBF0F5'
            this.shadowRoot.querySelector('.input_ol').style.cursor='not-allowed'
        }
    }
    // setValue(x){
    //     this.shadowRoot.querySelector('.input_ol').value=x
    // }
}
customElements.define("zy-input",zyInput)
// <zy-input>

// <zy-dropdown></zy-dropdown>标签
/* <zy-dropdown class='invselect' placeholder="请选择一个选项" titlename="逆变器在线台数">
    <option value="RMM">RMM</option>
    <option value="DTSD1352" >DTSD1352</option>
    <option value="AC10H">AC10H</option>
</zy-dropdown> */
class zyDropDown extends HTMLElement{
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
      }
    connectedCallback() {
        const title = this.getAttribute('titlename')
        const placeholder = this.getAttribute('placeholder')
        var options = Array.from(this.getElementsByTagName('option'))
        // <div class="placeholder">${placeholder}</div>
        this.shadowRoot.innerHTML = `<style>/* dropdown */
        body{
            font-family: pingfang SC,helvetica neue,arial,hiragino sans gb,microsoft yahei ui,microsoft yahei,simsun,sans-serif!important;
        }
        input{
            border: none;
            background-color: var(--tbacksun);
            vertical-align: middle;
        }
        input:focus{
            outline: none;
        }
        .dropdown {
            display: flex;
            flex-direction: column;
            background-color: var(--tbacksun);
            border: 1px solid var(--tborder);
            width: 280px;height: 30px;
            border-radius: 3px;
            line-height: 30px;
            margin: 9px 0;
        }
        .title{
            font-size: 12px;
        }
        .title{
            color: rgb(112, 126, 146);
        }
        .selectinput{
            display: flex;flex-direction: row;justify-content: space-between;
        }
        .options{
            margin-top: 6px;
            display: none;
            background-color: #ffffff;
            min-width: 160px;
            box-shadow: 0px 2px 11px 0px rgba(23, 23, 23, 0.2);
            z-index: 1;
            border-radius: 3px;
        
        }
        .option {
            padding: 3px 12px;
            display: block;
            cursor: pointer;
            font-size: 11px;
            height: 24px;
            line-height: 24px;
            color: rgb(85, 96, 111);
            font-weight: 350;
        }
        
        .option:hover {
            background-color: var(--gray7);
        }
        .selecticon{
            margin-right: 12px;
            color: var(--tholder);
        }
        /* dropdown */</style>
        <link rel="stylesheet" href="../css/zycustom.css" class='zycustom-loaded'>
            <div class="deDropdown">
                <div class="title">${title}</div>
                <div class="dropdown">
                    <div class="selectinput">
                        <input class="input_ol disabled_input" placeholder="${placeholder}">
                        <span class="iconfont selecticon">&#xeb06;</span>
                    </div>
                    <div class="options">
                    ${options.map(option => `<div class="option" title='' data-value="${option.value}">${option.textContent}</div>`).join('')}
                    </div> 
                </div>
            </div>`
        const pholderElement = this.shadowRoot.querySelector('.selectinput')
        const optionsElement = this.shadowRoot.querySelector('.options')
        var inputol = this.shadowRoot.querySelector('.input_ol')
        pholderElement.style.cursor='pointer'
        pholderElement.addEventListener('click', () => {
            optionsElement.style.display = optionsElement.style.display === 'block' ? 'none' : 'block'
        })
        inputol.addEventListener('keydown',function(e){
            e.preventDefault() //阻止键盘输入
        })
        optionsElement.addEventListener('click', (event) => {
            if (event.target.classList.contains('option')) {
            const selectedValue = event.target.dataset.value
            var selectedOption = options.find(option => option.value === selectedValue)
            if(options.length == 0){
                options=Array.from(this.getElementsByTagName('option'))
                selectedOption = options.find(option => option.value === selectedValue)
                inputol.value = selectedOption.textContent
            }else{
                inputol.value = selectedOption.textContent
            }
            optionsElement.style.display = 'none'
            // pholderElement.style.color = 'black'
            }
        })
    }
    getContent() {
        return this.shadowRoot.querySelector('.input_ol')
    }
    getOptions() {
        return this.shadowRoot.querySelector('.options')
    }
    getOption() {
        return this.shadowRoot.querySelectorAll('.option')
    }
    dynamicsetoption(e) {
        const wrap = this.shadowRoot.querySelector('.options')
        wrap.innerHTML=e.map(option => `<div class="option" title='' data-value="${option.value}">${option.textContent}</div>`).join('')
    }
}
customElements.define('zy-dropdown', zyDropDown);
// <zy-dropdown></zy-dropdown>标签
// zy-step
class zystep extends HTMLElement{
    constructor(){
        super()
        this.attachShadow({ mode: 'open' }); 
    }
    connectedCallback() {
        const stepnum=this.getAttribute("stepnum")
        this.shadowRoot.innerHTML=`
        <div class="g_wrap">
            <div class="line"></div>
            <div class="g_step">
                <div class="step_n">
                    <span class="step_title">采集器</span>
                    <span class="step_icon iconfont"></span>
                </div>
                <div class="step_n">
                    <span class="step_title">时间</span>
                    <span class="step_icon iconfont"></span>
                </div>
                <div class="step_n">
                    <span class="step_title">设备接入</span>
                    <span class="step_icon iconfont"></span>
                </div>
                <div class="step_n">
                    <span class="step_title">电表</span>
                    <span class="step_icon iconfont"></span>
                </div>
                <div class="step_n">
                    <span class="step_title">网络</span>
                    <span class="step_icon iconfont"></span>
                </div>
                <div class="step_n">
                    <span class="step_title">重置密码</span>
                    <span class="step_icon iconfont"></span>
                </div>
            </div>
        </div>`
        const steparr=this.shadowRoot.querySelectorAll('.step_icon')
        for(var i=0;i<steparr.length;i++){
            if(i == stepnum){
                steparr[i].innerHTML='&#xe8b5;'
                steparr[i].classList.add('curstep')  
            }else{
                steparr[i].innerHTML='&#xe601;'
                steparr[i].classList.remove('curstep')
            }
        }
        // 在第一个实例中加载样式表
        if (!document.querySelector('.zycustom-loaded')) {
            const styleSheet = document.createElement('link')
            styleSheet.setAttribute('rel', 'stylesheet')
            styleSheet.setAttribute('href', '../css/zycustom.css')
            styleSheet.setAttribute('class', 'zycustom-loaded')
            this.shadowRoot.appendChild(styleSheet)
        }
    }
}
customElements.define("zy-step",zystep)
// zy-step

// zyListInput
export class zyListInput extends HTMLElement{
    constructor(){
        super()  
        this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        const inunit=this.getAttribute('inunit')
        const regex=this.getAttribute('regex')
        const disabled=this.getAttribute('disabled')
        this.shadowRoot.innerHTML =`
        <style>/* zy-listinput */
        body{
            font-family: pingfang SC,helvetica neue,arial,hiragino sans gb,microsoft yahei ui,microsoft yahei,simsun,sans-serif!important;
        }
        input{
            border: none;
            background-color: var(--tbacksun);
            vertical-align: middle;
        }
        input:focus{
            outline: none;
        }
        .listItext{
            display: flex;flex-direction: row;justify-content: space-around;
            background-color: var(--tbacksun);
            border: 1px solid var(--tborder);
            width: 80%;height: 26px;border-radius: 3px;margin: 9px 0;
            line-height: 26px;
        }
        .list_input{
            vertical-align: middle;
            width: 90%;
            padding-left: 12px;
            font-size: 10px;
        }
        .list_input::placeholder{
            color: var(--tholder);
        }
        .liunit{
            width: 10%;
            vertical-align: middle;
            color: var(--tholder);
            font-size: 12px;
        }
        /* zy-listinput */</style>
        <div class="listItext">
        <input class="list_input" type="text">
        <span class="liunit">${inunit}</span>
        </div>
        </div>`
        
        const inputElement=this.shadowRoot.querySelector('.list_input')
        const listItext=this.shadowRoot.querySelector('.listItext')
        // input：enable使能  disable禁能
        if(disabled == 'enable'){
            this.shadowRoot.querySelector('.list_input').disabled=false
            listItext.style.backgroundColor='#F9FAFC'
            inputElement.style.cursor='auto'
        }else{
            this.shadowRoot.querySelector('.list_input').disabled=true
            listItext.style.backgroundColor='#EBF0F5'
            inputElement.style.cursor='not-allowed'
        }
        
        // inputElement.addEventListener('input',function(event){
        //     var inputValue=parseInt(this.value)
        //     var inputregex=new RegExp(regex)
        //     if (regex !== ''){
        //         if(inputregex.test(inputValue)){
        //             listItext.style.border='1px solid #F5F6F9'
        //         }else{
        //             listItext.style.border='1px solid #DA4E51'
        //         }
        //     }
        // })
    }
    getContent() {
        return this.shadowRoot.querySelector('.list_input')
    }
    getinputText(){
        return this.shadowRoot.querySelector('.listItext')
    }
}
customElements.define("zy-listinput",zyListInput)
// zyListInput

// zyProgressBar
export class zyProgressBar extends HTMLElement{
    constructor(){
        super()  
        this.attachShadow({ mode: 'open' })
    }
    connectedCallback() {
        const curr=this.getAttribute('curr')
        const total=this.getAttribute('total')
        const percent=this.getAttribute('percent')
        const barwidth=this.getAttribute('width')
        this.shadowRoot.innerHTML =`
        <link rel="stylesheet" href="../css/zycustom.css">
        <div class="probar">
        <span class="pbtitle">当前查询</span>
        <span class="pbpercent"></span>
        <div class="progress_bar" id="myProgressBar">
            <span class="baranima"></span>
        </div>
        </div>`
        // const baranima=this.shadowRoot.querySelector('.baranima')
        // baranima.style.width=`${percent}%`
    }
    getContent() {
        return this.shadowRoot.querySelector('.probar')
    }
}
customElements.define("zy-progressbar",zyProgressBar)
// zyProcessBar




// </zy-edit-dropdown> 
class zyEditDropDown extends HTMLElement{
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
      }
    connectedCallback() {
        const placeholder = this.getAttribute('placeholder');
        var options = Array.from(this.getElementsByTagName('option'));
        // <div class="placeholder">${placeholder}</div>
        this.shadowRoot.innerHTML = `<style>/* dropdown */
        body{
            font-family: pingfang SC,helvetica neue,arial,hiragino sans gb,microsoft yahei ui,microsoft yahei,simsun,sans-serif!important;
        }
        input{
            border: none;
            background-color: #F9FAFC;
            vertical-align: middle;
        }
        input:focus{
            outline: none;
        }
        .input_ol::placeholder{
            color: #AEBBCE;
        }
        .dropdown {
            display: flex;
            flex-direction: column;
            background-color: #F9FAFC;
            border: 1px solid #F5F6F9;
            width: 100%;height: 26px;
            border-radius: 3px;
            line-height: 26px;
            margin: 9px 0;
        }
        .selectinput{
            display: flex;flex-direction: row;justify-content: space-between;
            height: 26px;line-height:26px;
        }
        .options{
            margin-top: 6px;
            display: none;
            background-color: #ffffff;
            min-width: 160px;
            box-shadow: 0px 2px 11px 0px rgba(23, 23, 23, 0.2);
            z-index: 1;
            border-radius: 3px;
        }
        .option {
            padding: 3px 12px;
            display: block;
            cursor: pointer;
            font-size: 11px;
            height: 24px;
            line-height: 24px;
            color: rgb(85, 96, 111);
            font-weight: 350;
        }
        .option:hover {
            background-color: #F7F7F7;
        }
        .selecticon{
            margin-right: 12px;
            color: #AEBBCE;
        }
        .input_ol{
            padding-left:9px;
            font-size:12px;
            font-weight:400;
            color:#111;
            cursor:pointer;
            font-family: pingfang SC,helvetica neue,arial,hiragino sans gb,microsoft yahei ui,microsoft yahei,simsun,sans-serif!important;
        }
        /* dropdown */</style>
        <div class="dropdown">
            <div class="selectinput">
                <input class="input_ol disabled_input" placeholder="${placeholder}" readonly>
                <span class="iconfont selecticon">&#xeb06;</span>
            </div>
            <div class="options">
            ${options.map(option => `<div class="option" title='' data-value="${option.value}">${option.textContent}</div>`).join('')}
            </div> 
        </div>`
        const pholderElement = this.shadowRoot.querySelector('.selectinput')
        const optionsElement = this.shadowRoot.querySelector('.options')
        const inputol = this.shadowRoot.querySelector('.input_ol')
        pholderElement.style.cursor='pointer'
        pholderElement.addEventListener('click', () => {
            optionsElement.style.display = optionsElement.style.display === 'block' ? 'none' : 'block'
        })
        
        optionsElement.addEventListener('click', (event) => {
            if (event.target.classList.contains('option')) {
            const selectedValue = event.target.dataset.value
            var selectedOption = options.find(option => option.value === selectedValue)
            if(options.length == 0){
                options=Array.from(this.getElementsByTagName('option'))
                selectedOption = options.find(option => option.value === selectedValue)
                inputol.value = selectedOption.textContent
            }else{
                inputol.value = selectedOption.textContent
            }
            optionsElement.style.display = 'none'
            }
        })
    }
    getContent() {
        return this.shadowRoot.querySelector('.input_ol')
    }
    getOptions() {
        return this.shadowRoot.querySelector('.options')
    }
    getOption() {
        return this.shadowRoot.querySelectorAll('.option')
    }
    dynamicsetoption(e) {
        const wrap = this.shadowRoot.querySelector('.options')
        wrap.innerHTML=e.map(option => `<div class="option" title='' data-value="${option.value}">${option.textContent}</div>`).join('')
    }
}
customElements.define('zy-edit-dropdown', zyEditDropDown);
// <zy-edit-dropdown></zy-edit-dropdown>标签



// zyEditInput
export class zyEditInput extends HTMLElement{
    constructor(){
        super()  
        this.attachShadow({ mode: 'open' })
    }
    connectedCallback() {
        const inunit=this.getAttribute('inunit')
        const regex=this.getAttribute('regex')
        const disabled=this.getAttribute('disabled')
        this.shadowRoot.innerHTML =`
        <style>/* zy-listinput */
        body{
            font-family: pingfang SC,helvetica neue,arial,hiragino sans gb,microsoft yahei ui,microsoft yahei,simsun,sans-serif!important;
        }
        input{
            border: none;
            background-color: var(--tbacksun);
            vertical-align: middle;
        }
        input:focus{
            outline: none;
        }
        .editinput{
            width:100%;display:flex;flex-direction:column;height:40px;
        }
        .listItext{
            display: flex;flex-direction: row;justify-content: space-around;
            background-color: var(--tbacksun);
            border: 1px solid var(--tborder);
            width: 100%;height: 26px;border-radius: 3px;margin: 6px 0;
            line-height: 26px;
        }
        .list_input{
            box-sizing: border-box;
            vertical-align: middle;
            width: 90%;
            padding-left: 9px;
            font-size: 12px;
            font-weight: 400;height: 26px;line-height: 26px;
        }
        .list_input::placeholder{
            color: #AEBBCE;
        }
        .liunit{
            width: 10%;
            vertical-align: middle;
            color: #AEBBCE;
            font-size: 12px;
        }
        .editprompt{
            width: 100%;color: #AEBBCE;font-size: 11px;line-height:12px;
        }
        /* zy-listinput */</style>
        <div class='editinput'>
            <div class="listItext">
                <input class="list_input" type="text">
                <span class="liunit">${inunit}</span>
            </div>
            <span class="editprompt"></span>
        </div>`
        
        const inputElement=this.shadowRoot.querySelector('.list_input')
        const listItext=this.shadowRoot.querySelector('.listItext')
        // input：enable使能  disable禁能
        if(disabled == 'enable'){
            this.shadowRoot.querySelector('.list_input').disabled=false
            listItext.style.backgroundColor='#F9FAFC'
            inputElement.style.cursor='auto'
        }else{
            this.shadowRoot.querySelector('.list_input').disabled=true
            listItext.style.backgroundColor='#EBF0F5'
            inputElement.style.cursor='not-allowed'
        }
    }
    getContent() {
        return this.shadowRoot.querySelector('.list_input')
    }
    getlistItext(){
        return this.shadowRoot.querySelector('.listItext')
    }
    geteditprompt(){
        return this.shadowRoot.querySelector('.editprompt')
    }
}
customElements.define("zy-edit-input",zyEditInput)
// zyEditInput