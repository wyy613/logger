import { DeviceSNTypeUtil } from "./expo.js";
import { InverterTypeEnum } from "./expo.js";

export class SNInverterInfo {
    // 品牌 "Solinteg", "OGS-1.5K", "单相单路1-3k并网逆变器",
    brand = ""
    subBrand = ""
    type = ""
    // 出货区域
    region = ""
    // 产品类型 0 并网逆变器 1储能逆变器 2预留 C临时给老化模块治具用
    productType = InverterTypeEnum
    // 年 月
    year = ""
    month = ""
    // 客退机标志位 默认0,首次返厂维修A 依次类推
    afterSales = '0'
    // 额定功率
    ratedPower = ""
    // 相
    phase = new Number
    // 路
    mppt = new Number
}

export default class SNParseUtil {
    constructor() { }
    // 解析SN 每位含义 及设备类型等信息 放到全局变量中
    parse (sn) {
        let info = new SNInverterInfo()
        if (sn.includes('-')) {
            sn = sn.split('-')[1]
        }
        let brand = sn.substring(0, 1) //sn第1位
        let subBrand = ''
        let deviceType = sn.substring(11, 13) //sn第12,13位
        let standard = sn.sn.substring(14, 15) //sn第15位
        let brandDetail = sn.substring(13, 14) //sn第14位
        let current
        let DeviceSNTypeUtil = new DeviceSNTypeUtil()
        current = DeviceSNTypeUtil.getElement(deviceType, standard, brand, brandDetail)
        console.log('match value current', current)
        if (current != null) {

            info.brand = current.brand
            info.subBrand = current.subBrand
            info.type = current.type
            let power = current.parentBrand.split('-')[1]
            if (power && power.split('K').length > 0) {
                info.standardPower = power.split('K')[0] + 'kW';
            } else {
                info.standardPower = '--'
            }
        }
        if (sn.charAt(1) === '0') {
            info.region = '国内'
        } else if (sn.charAt(1) === '1') {
            info.region = '国外'
        } else if (sn.charAt(1) === '2') {
            info.region = '预留'
        } else {
            info.region = ''
        }
        if (sn.charAt(2) === '0') {
            info.productType = InverterTypeEnum.GRID_INVERTER
        } else if (sn.charAt(2) === '1') {
            info.productType = InverterTypeEnum.STORAGE_INVERTER
        } else if (sn.charAt(2) === '2') {
            info.productType = InverterTypeEnum.RESERVE
        } else {
            info.productType = InverterTypeEnum.TEMPORARY
        }
        info.year = '' + sn.charAt(4) + sn.charAt(5)
        info.month = '' + sn.charAt(15)

        let xiang = info.type.substring(0, 2)

        info.xiang = SNParseUtil.parseHan(xiang.substring(0, 1))

        let lu = info.type.substring(2, 4)
        if ('AC' === xiang) {
            info.lu = 0
        } else {
            info.lu = SNParseUtil.parseHan(lu.substring(0, 1))
        }

        return info
    }

    private static parseHan (han: String): number {
        switch (han) {
            case '单':
                return 1
            case '双':
                return 2
            case '三':
                return 3
            case '四':
            case '4':
                return 4
            case '10':
            case '十':
                return 10
        }
        return 0
    }
}


let testsn = "A1L2300341ER035"
let testlog = testsn.substring(11, 13);
console.log(testlog);



document.querySelector(".page1_click").onclick() = function () {
    document.querySelector(".page1").innerHTML = "更改后的page1"
}