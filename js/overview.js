import { Ajax } from "./config.js"
import { showMessage } from './common.js'
// 获取html高度(实际获取的是pcontent的高度)
const html = document.documentElement;
const clientH = html.clientHeight;
console.log(clientH)
const realtimeinfo = document.querySelector('.realtimeinfo');
// pcontent的高度减去basicinfo高度及padding高度
realtimeinfo.style.height = clientH - 125 + 'px'
// 获取设备参数
function getDeviceParams () {
    Ajax.get(`/logger_overview`, function (res) {
        const data = JSON.parse(res)
        console.log('overview', res)
        Object.keys(data).forEach((item) => {
            const dom = document.querySelector(`.${item}_value`)
            if (dom) {
                dom.innerHTML = `${data[item]}`
            }
        })
    })
}
getDeviceParams()

