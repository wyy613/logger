
class TimeFormatted extends HTMLElement { // (1)

    connectedCallback () {
        let date = new Date(this.getAttribute('datetime') || Date.now());
        this.innerHTML = new Intl.DateTimeFormat("default", {
            year: this.getAttribute('year') || undefined,
            month: this.getAttribute('month') || undefined,
            day: this.getAttribute('day') || undefined,
            hour: this.getAttribute('hour') || undefined,
            minute: this.getAttribute('minute') || undefined,
            second: this.getAttribute('second') || undefined,
            timeZoneName: this.getAttribute('time-zone-name') || undefined,
        }).format(date);
    }
}

customElements.define("time-formatted", TimeFormatted); // (2)



<time-formatted datetime="2019-12-01"
    year="numeric" month="long" day="numeric"
    hour="numeric" minute="numeric" second="numeric"
    time-zone-name="short"
></time-formatted>


class zyInput extends HTMLElement {
    #shadowDom
    title = ""
    placeholder = ""
    prompt = ""
    inunit = ""
    constructor(title, placeholder, prompt, inunit) {
        super()
        let defaultCss = {
            width: "310px",
            height: "36px",
            background_color: "#F9FAFC"
        }
        this.title = title
        this.placeholder = placeholder
        this.prompt = prompt
        this.inunit = inunit
        this.#shadowDom = this.attachShadow({ mode: "open" })

        this.#shadowDom.appendChild(this.createEl())
    }
    createEl (title, placeholder, prompt, inunit) {
        let template = document.createElement("template")
        template.innerHTML = `<div class="deInput">
        <span class="deItitle">${title}</span>
        <div class="deItext">
        <input class="input_ol" type="text" placeholder="${placeholder}">
        <span class="iunit">${inunit}</span>
        </div>
        <span class="deIprompt">${prompt}</span>
        </div>`
        return template
    }
}
customElements.define("zy-input", zyInput)

class configInput {
    constructor() { }

}

document.querySelector(".zy_ssid").onload = () => {
    let transbox = new zyInput
    let transins = transbox.createEl('ssid', '请选择', '没有可用ssid', '')
    console.log(transins)

}
console.log(document.querySelector(".zy_ssid"))

// let va1=new zyInput()
// console.log(va1)
// let zy=document.createElement("zy-input")
// console.log(zy)

// let azy=document.querySelectorAll(".netinfo")

// let bzy=document.querySelector(".zy_pass")
// console.log(bzy)

