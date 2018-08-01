( function IIFE() {

    function addLoadEvent(func) {
        const oldonload = window.onload;
        if (typeof window.onload !== "function") {
            window.onload = func;
        } else {
            window.onload = function () {
                oldonload();
                func();
            };
        }
    }

    //控制主体内容的高度
    function contentH(){
        //huqu

    }



    function main(){


    }
    addLoadEvent(main);
}());