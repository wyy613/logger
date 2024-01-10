import { InverterTypeEnum } from './InverterTypeEnum.js'
import { DeviceSNTypeUtil } from './DeviceSNTypeUtil.js'
export class SNInvergerInfo {
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
    // 解析各个位置含义 设备类型等信息 放到全局变量中

    parse (sn) {
        let info = new SNInvergerInfo()
        if (sn.includes('-')) {
            sn = sn.split('-')[1]
        }
        let deviceType = sn.substring(11, 13) // sn的第十二、十三位
        let standard = sn.substring(14, 15)  // sn的第十五位
        let brand = sn.substring(0, 1) // sn的第一位
        let brandDetail = sn.substring(13, 14)  // sn的第十四位
        let subBrand = ''
        let current = null
        let deviceSNTypeUtil = new DeviceSNTypeUtil()
        current = deviceSNTypeUtil.getElement(deviceType, standard, brand, brandDetail)
        // console.log('match value current', current)
        if (current != null) {

            info.brand = current.brand
            info.subBrand = current.subBrand
            info.type = current.type
            let power = current.parentBrand.split('-')[1]
            if (power && power.split('K').length > 0) {
                info.ratedPower = power.split('K')[0] + 'kW';
            } else {
                info.ratedPower = '--'
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
        } else if (sn.charAt(2) === 'M') {
            info.productType = InverterTypeEnum.METER
        } else if (sn.charAt(2) === 'L') {
            info.productType = InverterTypeEnum.LOGGER
        } else {
            info.productType = InverterTypeEnum.TEMPORARY
        }
        info.year = '' + sn.charAt(4) + sn.charAt(5)
        info.month = '' + sn.charAt(15)

        let phase = info.type.substring(0, 2)

        info.phase = SNParseUtil.parseHan(phase.substring(0, 1))

        let mppt = info.type.substring(2, 4)
        if ('AC' === phase) {
            info.mppt = 0
        } else {
            info.mppt = SNParseUtil.parseHan(mppt.substring(0, 1))
        }

        return info
    }
    // han string
    static parseHan (han) {
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
