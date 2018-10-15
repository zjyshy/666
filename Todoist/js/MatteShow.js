(function I(){

 //当想要修改class的时候可以使用它
//8月10日修改：成功的解决了添加class数量不确定的问题
 var flags = 0;
 let flag = 0;
 //创建数组索引
 Array.prototype.indexOf = function(val) {
  for (let i = 0; i < this.length; i++) {
   if (this[i] == val) return i;
  }
  return -1;
 };
 //构建删除数组内指定内容的函数
 Array.prototype.remove = function(val) {
  var index = this.indexOf(val);
  if (index > -1) {
   this.splice(index, 1);
  }
 };

 //当文档视图调整大小时触发的一系列函数
 function resize(){
  //监听resize事件，
  window.addEventListener("resize", () =>{
   //控制左侧和主体内容的高度
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
  const MHS = document.querySelector(".left_menu_show");
  let top = document.getElementsByClassName("app_background");
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
  if(AHW <= 750 && flags == 0){
			
   changeClass.add(top[0], "small");		
   //flags的作用是防止每一次宽度变化都会添加一个small
   flags = 1;
			
  }else if(AHW > 750 && flags==1){
   changeClass.del(top[0], "small");
   flags = 0;
   //为了防止宽度大于750后叉号不会变回去
   changeClass.cha(MHS, "menu_appear", "menu_hide");
   changeClass.del(top[0], "click");

  }
		
 }

	
 //控制右侧主体内容的高度以及左侧菜单的高度
 function contentAndLeftH(){
  //获取网页可见区域的高
  const RCH = document.documentElement.clientHeight;
  const LeftMenu = document.getElementById("left_menu");
  const MContent = document.getElementById("main_content");
  //当宽度缩小到750左边菜单出现时会出现这个遮挡物
  const shutter = document.getElementsByClassName("shutter");
  //这里的min-height非常重要如果用了height 就会导致内部元素过大时不能撑开背景
  MContent.style = `min-height:${RCH}px;`;
  LeftMenu.style = `height:${RCH-50}px`;
  shutter[0].style = `height:${RCH}px`;
 }

 //控制quick_find的内容
 function QFChange(){
  const QF = document.getElementsByClassName("quick_find");
  const QFInput = document.getElementsByClassName("quick_find_input");
  //当quick_find_input获得焦点
  QFInput[0].onclick = function() {
   QF[0].setAttribute("class", "quick_find quick_find_click");
  };
  //当它失去焦点
  QFInput[0].onblur = function(){
   QF[0].setAttribute("class", "quick_find");
  };
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
  for(let i = 0; i < 1; i++){

   MLS[i].addEventListener("click", () =>{
    //!flg[i]为true undefined == false !undefined == true 点击第一次将对应数组赋1 1 == true !1 == false
                
    if(!flg[i]){
     MLP[i].setAttribute("class", "menu_low_panel expand");
     CW[i].style = `height:${CWI[i].scrollHeight}px`; 

     setTimeout(() => {
      CW[i].style = "height:auto";  
     }, 300);
     flg[i] = 1;
     //!flg[i]为fales时触发 点击第二次 0 == false !0 == true
    }else{
     MLP[i].setAttribute("class", "menu_low_panel");
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
 //点击顶部的图标，显示/隐藏左侧菜单 
 function clickToplogo(){
		
  //当视口宽度小于750的时候会出现这个
  const LMH = document.getElementsByClassName("left_menu_hide");
  const MHS = document.querySelector(".left_menu_show");
  const appB = document.getElementsByClassName("app_background");
  const shutter = document.getElementsByClassName("shutter");
  LMH[0].addEventListener("click", () =>{
   if(flag == 0){
    changeClass.cha(MHS, "menu_hide", "menu_appear");
    changeClass.add(appB[0], "click");
    flag = 1;

   }
   else{
    changeClass.cha(MHS, "menu_appear", "menu_hide");
    changeClass.del(appB[0], "click");
    flag = 0;
   }
   shutter[0].addEventListener("click", ()=>{
    changeClass.cha(MHS, "menu_appear", "menu_hide");
    changeClass.del(appB[0], "click");
    flag = 0;
   });
  });
		

 }

 //点击today的添加任务按钮
 function todayAddTask(){
  let addTaskBtn = document.querySelector(".add_task");//today的添加任务按钮
  let todayAddTaskMain = document.querySelector(".today_add_task_main");//获取今天的添加任务一块
  let todayAddTaskMainTable = document.querySelector(".today_add_task_main table");
  let todayAddTaskContentInp = document.querySelector(".today_add_task_content input");//今天任务内容
  let addT = document.querySelector(".add_t p");
  
  addTaskBtn.addEventListener("click", ()=>{
   if(!document.querySelector(".today_add_task_main_show")){
    changeClass.cha(todayAddTaskMain, "today_add_task_main", "today_add_task_main_show");
    addT.style.display = "none";
    todayAddTaskContentInp.focus();



   }
  });
  
 }
  

 function main(){
  contentAndLeftH();
  appBodyAndTopM();
  resize();
  QFChange();
		
  menuExpand();
  clickToplogo();
  todayAddTask();


 }
 addLoadEvent(main);
}());

