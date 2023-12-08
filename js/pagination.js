import {disablecanport} from "./gDeviceConn.js"
export function Pagination(obj){
    this.init(obj)
}
Pagination.prototype={
    pages:{
        pageCount:0,//页面总数
        size:10,//单页面数据量
        pageNo:1,//当前页
        currList:[],
        listTrInit:''//trlist classname
    },
    //初始化页面数据,参数:obj
    init:function(obj){
        var pages=this.pages
        pages.total=obj.total//总数据量
        obj.pageCount=Math.ceil(obj.total/obj.size)//总页码数
        pages.container=obj.container//外部容器
        pages.listTrInit=obj.listTrInit //列表tr容器
        pages.pageNo=obj.pageNo//当前页
        pages.pageCount=obj.pageCount//总页码数
        pages.eleHtml=obj.eleHtml//标签内部值
        pages.prevPage=obj.prevPage || 'prevPage'//上一页按钮
        pages.nextPage=obj.nextPage || 'nextPage'//下一页按钮
        pages.arr=obj.arr
        this.renderPage(pages)
        
    },
    //构建页面,参数:args
    renderPage(args){
        this.initListContent(args)
        this.initDeviceList(args.currList,args.currList.length,args.listTrInit,args.pageNo)
        var pageContainer=this.selectEle(args.container)
        var pageStr='',start,end
        //构建左侧点击按钮
        if(args.pageNo>1){
            pageStr=`<a class="prevPage"><i class="iconfont">&#xe663;</i></a>`
        }else{
            pageStr=`<a class="disabled"><i class="iconfont">&#xe663;</i></a>`
        }
        //构建中间页面按钮区域
        if(args.pageCount<6){//当总页码数小于6时
            for(start=0;start<args.pageCount;start++){
                end=start+1
                if(end==args.pageNo){
                    pageStr+='<a class="current">'+end+'</a>'
                }else{
                    pageStr+='<a>'+end+'</a>'
                }
            }
        }else{//当总页码大于等于6时
            start=args.pageNo-1//确认遍历的起始位置为当前页的前一页
            end=args.pageNo+1//确认遍历的结束位置为当前页的后一页
            if(args.pageNo>2){pageStr+='<a>'+1+'</a>'}//当前页大于2时，将页面1按钮写死
            else {end =4}//当前页小于等于2时，将遍历的结束位置写死为4
            if(args.pageNo>args.pageCount-3){start=args.pageCount-3}//当前页为最后四个页面时，将遍历的起始位置写死为倒数第四个页面值
            if(args.pageNo>3){pageStr+='<a>...</a>'}//当前页大于第三个页面时，将省略号按钮展现出来
            //对中间按钮进行遍历
            for(;start<=end;start++){
                if(start<=args.pageCount && start>0){
                    if(start==args.pageNo){
                        pageStr+='<a class="current">'+start+'</a>'
                    }else{
                        pageStr+='<a>'+start+'</a>'
                    }
                }
            }
            if(args.pageNo<args.pageCount-2){pageStr += '<a>...</a>'}//当前页面小于倒数第三个页面时，将省略号按钮展现出来
            if(args.pageNo<args.pageCount-1){pageStr+='<a>'+args.pageCount+'</a>'}//当前页面小于倒数第二个页面，将最后的页面按钮锁死
        }
        //构建右侧按钮
        if(args.pageNo<args.pageCount){
            pageStr+=`<a class="nextPage"><i class="iconfont">&#xe8d4;</i></a>`
        }else{
            pageStr+=`<a class="disabled"><i class="iconfont">&#xe8d4;</i></a>`
        }
        pageContainer.innerHTML=pageStr
        this.switchPage()
    },
    // 初始化当前页面
    initListContent(pages){
        // var pages=this.pages,g=this
        let currPage=pages.pageNo
        if(currPage<pages.pageCount){
            pages.currList=[]
            var start=(currPage-1)*pages.size 
            var end=start+10
            for(let i=0;start<end;start++){
                pages.currList[i]=pages.arr.dev[start]
                i++
            }
        }else{
            pages.currList=[]
            var start=(currPage-1)*pages.size
            var end=pages.total
            for(let i=0;start<end;start++){
                pages.currList[i]=pages.arr.dev[start]
                i++
            }
        }
        return pages.currList
        
    },
    //切换页面
    switchPage(){
        var pages=this.pages,g=this
        var aList=this.selectEle(pages.container+" a",true)//获取所有的a标签
        var current//定义一个当前页的标识
        g.initListContent(pages)
        //对所有的a标签遍历，绑定点击事件
        for(let i in aList){
            if(i<aList.length){
                aList[i].addEventListener("click",function(){
                    var eleHtml=this.innerHTML//定义一个属性值来获取数字按钮
                    if(this.className==pages.prevPage){
                        pages.pageNo>1 && (pages.pageNo=pages.pageNo-1)
                    }else if(this.className==pages.nextPage){
                        pages.pageNo<pages.pageCount && (pages.pageNo=pages.pageNo+1)
                    }else{
                        pages.pageNo=parseInt(eleHtml)
                    }
                    pages.pageNo && g.gotoPage(pages.pageNo)
                    disablecanport()
                })
            }
        }
        
        // 
    },
    
    // 初始化列表div
    // initDeviceList(x,r,p,cl="device_listtr-wrap")

    initDeviceList(x,r,clname,n){
        // 清空之前的列表数据
        var listtr=document.querySelectorAll("."+clname)
        // if(n !== 0){
            for(const tr of listtr){
                tr.remove()
            }   
        // }
        if(r!=0){
            for(var u=0;u<x.length;u++){
                // var p=[];
                var s=document.createElement("div");
                // s.setAttribute("id",cl);
                s.setAttribute("class",clname);
                var tr=document.createElement("div");
                if(clname == 'device_listtr-wrap'){
                    tr.innerHTML=`<div class="device_list_trtd device_firstcol"><span class="deli_select">${x[u].status}</span></div>
                    <div class="device_list_trtd device_secondcol"><span class="deli_status  tdvalue">${x[u].inf}-${x[u].addr}</span></div>
                    <div class="device_list_trtd device_thirdcol"><span class="deli_dename tdvalue">${x[u].sn}</span></div>
                    <div class="device_list_trtd  device_fourcol"><span class="deli_sn tdvalue">${x[u].subBrand}</span></div>
                    <div class="device_list_trtd device_fivecol"><span class="deli_detype tdvalue">${x[u].productType}</span></div>
                    <div class="device_list_trtd device_sixcol"><span class="deli_devers tdvalue">${x[u].ver}</span></div>
                    <div class="device_list_trtd device_sevencol"><span class="deli_derepo tdvalue">${x[u].ap}</span></div>
                    <div class="device_list_trtd device_eightcol"><span class="deli_degen tdvalue">${x[u].de}</span></div>
                    <div class="device_list_trtd device_ninecol"><span class="deli_deoper"><i class="iconfont iconopera1">&#xe660;</i><i class="iconfont">&#xe659;</i></span></div>`;
                }else if(clname == 'gdeviceconn'){
                    tr.innerHTML=`<div class="device_list_trtd device_firstcol"><span class="deli_select"><i class="iconfont selecticon">&#xe610;</i></span></div>
                    <div class="device_list_trtd device_secondcol"><span class="deli_addr tdvalue">${x[u].addr}</span></div>
                    <div class="device_list_trtd device_thirdcol"><span class="deli_sn tdvalue">${x[u].sn}</span></div>
                    <div class="device_list_trtd  device_fourcol"><span class="deli_subBrand tdvalue">${x[u].subBrand}</span></div>
                    <div class="device_list_trtd device_fivecol"><span class="deli_inf  tdvalue">${x[u].inf}</span></div>
                    <div class="device_list_trtd device_sixcol"><span class="deli_opera tdvalue"><i class="iconfont opearteedit">&#xe65f;</i><i class="iconfont opeartedelete">&#xe659;</i></span></div>`
                }
                tr.setAttribute("class","device_list_tr")
                s.appendChild(tr)
                document.querySelector(".device_table_control").appendChild(s)
            }
            document.querySelector('.selectalls').innerHTML='<i class="iconfont selectallicon">&#xe610;</i>选择'
            document.querySelector('.selectalls').classList.remove('enabled')
        }else{
            alert("设备数目为0");
        }
        
    },  
    //跳转页面,参数:current
    gotoPage(current){
        this.pages.pageNo=current
        this.renderPage(this.pages)
        this.initDeviceList(this.pages.currList,this.pages.currList.length,this.pages.listTrInit)
    },
    //获取页面元素
    selectEle(select,all){
        return all ? document.querySelectorAll(select) : document.querySelector(select)
    }
}
