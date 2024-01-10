// document.querySelector(".page1_click").addEventListener("click",function (){
//     document.querySelector(".page1").innerHTML="更改后的page1"
//   }) 


function Pagination (obj) {
    this.init(obj)
}
Pagination.prototype = {
    pages: {
        pageCount: 0,//页面总数
        size: 15,//单页面数据量
        pageNo: 1,//当前页
        currList: [],
    },
    init: function (obj) {
        var pages = this.pages
        pages.total = obj.total//总数据量
        obj.pageCount = Math.ceil(obj.total / obj.size)
    }
}
var p = new Pagination({
    container: '.device_list_page',
    size: 15,
    pageNo: 1,
    // total:arr.num,
    // arr:arr,
})
console.log(p)


class DeviceType {
    brand = "";
    subBrand = "";
    type = '';
    bitVals = [];
    constructor(brand, subBrand, type, bitVals) {
        this.brand = brand;
        this.subBrand = subBrand;
        this.type = type;
        this.bitVals = bitVals;
    }
}

var type01_1_ODM = new DeviceType('ODM', 'O-1P-1.5K', '单相单路1-3k并网逆变器', ['01', '1', '0', '0']);
console.log(type01_1_ODM)


// 
function createObj (o) {
    function F () { }
    F.prototype = o;
    return new F();
}
var person = {
    name: 'kevin',
    friends: ['daisy', 'kelly']
}

var person1 = createObj(person);
var person2 = createObj(person);

person1.name = 'person1';
console.log(person1.name);
console.log(person2.name);



// 调用异步函数开始加载 CSS 文件
loadAllCSS();
// 创建 link 元素并返回 Promise 对象
function loadCSS (url, retryCount = 3) {
    return new Promise(function (resolve, reject) {
        var link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = url

        // 在 link 元素加载完成后 resolve Promise
        link.onload = function () {
            resolve()
        }

        // 在 link 元素加载失败时进行重试
        link.onerror = function () {
            if (retryCount > 0) {
                // 重试加载样式文件
                console.warn('CSS load error, retrying: ' + url)
                loadCSS(url, retryCount - 1)
                    .then(resolve)
                    .catch(reject)
            } else {
                reject(new Error('CSS load error: ' + url))
            }
        };

        // 将 link 元素添加到 head 中
        document.head.appendChild(link)
    });
}

// 异步函数，用于顺序加载多个 CSS 文件
async function loadAllCSS () {
    try {
        // 依次加载多个 CSS 文件，等待上一个加载完成再加载下一个
        await loadCSS('../css/font_icon/iconfont.css')
        await loadCSS('../css/config.css')
        await loadCSS('../css/guide.css')

        // 所有 CSS 文件加载完成后执行其他交互脚本
        // 这里放置其他 JavaScript 交互逻辑
        console.log('All CSS files loaded!')
    } catch (error) {
        console.error(error)
    }
}
