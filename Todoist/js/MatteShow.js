(function IIFE(){
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

    //当文档视图调整大小时触发的一系列函数
    function resize(){
        //监听resize事件，
        window.addEventListener("resize", () =>{
            //控制右侧主体内容的高度
            contentAndLeftH();
            appBodyAndTopM();
        });
    } 
    //控制app_head和app_body的左边距
    function appBodyAndTopM(){
        //获取网页可见区域的宽度
        const AHW = document.documentElement.clientWidth;
        //页面的主体
        const appBody = document.getElementById("app_body");
        //获取负责包住头部内容的标签
        const topInner = document.getElementById("top_inner");
        //如果不这样会导致margin变成负的
        if(AHW>=980)
        {
            appBody.style = `margin-left:${(AHW-980)/2}px;`;
            topInner.style = `margin-left:${(AHW-950)/2}px;`;
        }
        else{
            appBody.style = "margin-left:0;";
            topInner.style = "margin-left:0;";
        }
        
    }
    //控制右侧主体内容的高度以及左侧菜单的高度
    function contentAndLeftH(){
        //获取网页可见区域的高
        const RCH = document.documentElement.clientHeight;
        const LeftMenu = document.getElementById("left_menu");
        const MContent = document.getElementById("main_content");
        MContent.style = `height:${RCH}px;`;
        LeftMenu.style = `height:${RCH-50}px`;
    }

    //控制quick_find的内容
    function QFChange(){
        const QF = document.getElementsByClassName("quick_find");
        const QFInput = document.getElementsByClassName("quick_find_input");
        //当quick_find_input获得焦点
        QFInput[0].onclick = function() {
            QF[0].setAttribute("class","quick_find quick_find_click");
        };
        //当它失去焦点
        QFInput[0].onblur = function(){
            QF[0].setAttribute("class","quick_find");
        };
    }
    //左侧菜单每个标签点击后变色
    function menuContent(){
        //每个id都有对应的css属性，选中谁，
        const menuTopMain = document.getElementsByClassName("menu_top_main");
        //分别是收件箱、今天以及未来七天
        const menuCo = document.getElementsByClassName("menu_content");
        for(let i = 0; i < 3; i++){
            //点击谁就将容器的id改成与其相对应的
            menuCo[i].onclick = function(){

                menuTopMain[0].setAttribute("id",`menu_top_main${i}`);
            };

        }
    }

    //左侧的项目等标签点击后
    function menuExpand(){
        //不给数组赋初值，
        let flg = Array;
        const MLS = document.getElementsByClassName("menu_low_summary");
        const MLP = document.getElementsByClassName("menu_low_panel");
        const CW = document.getElementsByClassName("collapse__wrapper");
        const CWI = document.getElementsByClassName("collapse__wrapper_inner");
        //增加一个class expand使得隐藏的内容展现出来
        for(let i = 0; i < 3; i++){

            MLS[i].addEventListener("click", () =>{
                //!flg[i]为true undefined == false !undefined == true 点击第一次将对应数组赋1 1 == true !1 == false
                
                if(!flg[i]){
                    MLP[i].setAttribute("class","menu_low_panel expand");
                    CW[i].style = `height:${CWI[i].scrollHeight}px`; 

                    setTimeout(() => {
                        CW[i].style = "height:auto";  
                    }, 300);
                    flg[i] = 1;
                    //!flg[i]为fales时触发 点击第二次 0 == false !0 == true
                }else{
                    MLP[i].setAttribute("class","menu_low_panel");
                    setTimeout(() => {
                        
                        CW[i].style = "height:0";
                    }, 100);
                    CW[i].style = `height:${CWI[i].scrollHeight}px`; 

                  
                    flg[i] = 0;
                }
            }
            );
        }
    }
    

    function main(){
        contentAndLeftH();
        appBodyAndTopM();
        resize();
        QFChange();
        menuContent();
        menuExpand();

    }
    addLoadEvent(main);
}());

