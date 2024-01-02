import {showLoading,hideLoading,showMessage,getPrompt,getResultPrompt} from './common.js'
export var Ajax={
    get:function(e,d,lang,key){
        var f;
        if(window.XMLHttpRequest){
            f=new XMLHttpRequest()
        }else{
            if(window.ActiveObject){
                f=new ActiveXobject("Microsoft.XMLHTTP")
            }
        }
        f.open("GET",e,true);
        f.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
        if(key){
            f.setRequestHeader('Object',key)
        }
        f.timeout = 5000
        f.ontimeout = function(){
            console.log('Request timeout')
        }
        f.onreadystatechange=function(){
            if(f.readyState==4){
                if(f.status==200||f.status==304){
                    d.call(this,f.responseText)
                }else{
                    getResultPrompt("result-Failed",lang)
                    .then(translateMessage => {
                        showMessage(translateMessage,2000,'failedContent','&#xed1b;')
                    })
                }
            }
        };
        f.send(key)
    },
    post:function(e,g,h,lang,key,isAsync=true){
        var f
        if(window.XMLHttpRequest){
            f=new XMLHttpRequest()
        }else{
            if(window.ActiveObject){
                f=new ActiveXobject("Microsoft.XMLHTTP")
            }
        }
        f.open("POST",e,isAsync);
        // f.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
        f.setRequestHeader("Content-Type","application/json; charset=utf-8")
        if(key){
            f.setRequestHeader('Object',key)
        }
        f.onreadystatechange=function(){
            if(f.readyState==4){
                if(f.status==200||f.status==304){
                    h.call(this,f.responseText)
                }else{
                    // hideLoading("msg-load");
                    getResultPrompt("result-Failed",lang)
                    .then(translateMessage => {
                        showMessage(translateMessage,2000,'failedContent','&#xed1b;')
                    })
                }
            }
        };
        f.send(g)
    },
    postFile:function(e,g,h,key){
        // showLoading();
        var f;
        if(window.XMLHttpRequest){
            f=new XMLHttpRequest()
        }else{
            if(window.ActiveObject){
                f=new ActiveXobject("Microsoft.XMLHTTP")
            }
        }
        f.open("POST",e,true);
        f.setRequestHeader("Content-Type","application/octet-stream;charset=UTF-8");
        if(key){
            f.setRequestHeader('Object',key)
        }
        f.onreadystatechange=function(){
            if(f.readyState==4){
                if(f.status==200||f.status==304){
                    h.call(this,f.responseText)
                }else{
                    hideLoading("msg-load");
                    showConfirm(getPrompt("prompt"),getPrompt("otaFailed"),getPrompt("confirm"))
                }
            }
        };
        f.send(g)
    }
};