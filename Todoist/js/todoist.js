//这个文件主要是用来控制数据的。
(function DataLeakPrevention() {
 //关于时间的一些定义
 var da = new Date();
 const week = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
 
 //这个标志是为了检测究竟是在删除还是在添加项目，由于添加和删除的机制问题，必须要检测添加 = 1；删除等于0
 var projectFlag = 1;
    
 //删除或者添加project的标志
 projectadd = 0;
 projectdelete = -1;

 //这个的作用是刚开始需要一个默认背景为白色的标签，用于menuContent函数
 var preinstall = -1;
 //创建数组索引
 

 //控制数据库的方法 
 var controlDB = {

  add: function(storeName, newItem){

   db.transaction([storeName], "readwrite").objectStore(storeName).add(newItem);
  },
  del: function(storeName, target){
   db.transaction([storeName], "readwrite").objectStore(storeName).delete(target);	
  }
 };




  //定义数据库有关的内容
  //数据库名称
 const dbName = "Todoist";
 //存储空间名称
 const dbTName = "dbTask";
 const dbPName = "dbProject";//项目的存储空间名
 // 数据库版本
 var version = 3;
 // 数据库数据结果
 var db;

 // 打开数据库
 var DBOpenRequest = window.indexedDB.open(dbName, version);
   
 // 如果数据库打开失败
 DBOpenRequest.onerror = function(e) {
        
  console.log("数据库打开失败");
 };

 //数据库打开成功
 DBOpenRequest.onsuccess = function(e) {   
  db = DBOpenRequest.result;     
  console.log("数据库打开成功");
  showProject();

    
 };
 // 下面事情执行于：数据库首次创建版本，或者window.indexedDB.open传递的新版本（版本数值要比现在的高）
    
 DBOpenRequest.onupgradeneeded = function(e){

  db = e.target.result;


  //创建存出任务的数据库
  var objectStoreT = db.createObjectStore(dbTName, { 
   keyPath: "id",
   autoIncrement: true
  });
       
  objectStoreT.createIndex("id", "id", {
   unique: true
  }); //为task存储空间创建索引

        
  objectStoreT.createIndex("date", "date");
  objectStoreT.createIndex("project", "project");
  objectStoreT.createIndex("content", "content");
       
  objectStoreT.createIndex("hide", "hide");



  //创建存储项目的数据库 
  var objectStoreP = db.createObjectStore(dbPName, {
   keyPath: "id",
   autoIncrement: true
  });
  objectStoreP.createIndex("id", "id", {
   unique: true
  }); //为project存储空间创建索引
  objectStoreP.createIndex("name", "name");
  objectStoreP.createIndex("color", "color");
        
       


  //创建存储标签的数据库
  //由于标签属于高级功能暂时不做
  //优先级功能暂时不考虑


 };  
 //点击添加项目以后，将相应的项目添加到数据库
    
 //利用游标遍历每一个项目，获取每一个项目的名字和id 获取数据库中存储的id的目的是为了防止重名时候发生冲突
 function showProject(){
        
 
  var objectStore = db.transaction(dbPName).objectStore(dbPName);
  let delP = document.getElementsByClassName("de"); 
  let deID = document.getElementsByClassName("delete_id");
  let projectUl = document.getElementById("project");
  let addPro = document.getElementsByClassName("add_p");
  let addPN = document.getElementsByClassName("add_project_name");//通过更改它控制添加页面和添加按钮的出现
  let SubPN = document.getElementsByClassName("sub_project_no");       //取消按钮
  let subPY = document.getElementsByClassName("sub_project_yes");//添加项目按钮
  let subPC = document.getElementsByClassName("sub_project_content");//通过设置contenteditable变成可以输入内容的
  let test ;	
        
  projectUl.innerHTML = " ";
  objectStore.openCursor().onsuccess = function(e) {
            
   let cursor = e.target.result;
   //这里面的内容只会执行一次
   if(!cursor){
    //因为project的li是异步创建出来的所以这个只能写在这
    menuContent();
    //这里的作用是点击小锁会删除
                
    for(let i = 0; i<delP.length; i++){
     delP[i].onclick = function(e){
      //当点击删除的按钮时，会同时点击到他的父元素，会先触发删除，再触发背景更改，添加了这个就会保证只有删除被触发 
      e.cancelBubble = true;
      let projectLi = document.querySelectorAll("#project li");
      console.log(this);
      console.log(delP[i]);
      //这里必须将字符串转换成数字！！！！
      controlDB.del(dbPName, parseInt(deID[i].childNodes[0].nodeValue));
      changeClass.cha(projectLi[i], "tag_background", "tag_background_hide");

      projectdelete = i;	

     };
    }
            
    //点击转到输入项目的位置
    addPro[0].addEventListener("click", () =>{
     changeClass.cha(addPN[0], "project_open", "project_close");
     subPC[0].focus();
                
    });
    //点击转回添加项目
    SubPN[0].addEventListener("click", () =>{
     changeClass.cha(addPN[0], "project_close", "project_open");
     subPC[0].childNodes[0].nodeValue = "";
    });
    //点击了添加项目按钮后
    subPY[0].addEventListener("click", () => {

     let SPCValue = subPC[0].childNodes[0].nodeValue;
                    
     if(SPCValue.match(/^[ ]+$/)){
      changeClass.cha(addPN[0], "project_close", "project_open");
     }else{
                    
                        
      changeClass.cha(addPN[0], "project_close", "project_open");
      let projectLi = document.createElement("li");
      //这个的作用是给每个里添加一个class
      changeClass.add(projectLi, "tag_background");

      let dbit = {
       name: SPCValue,
       color: "green"
      };
      controlDB.add(dbPName, dbit);
      projectLi.innerHTML = ` <div><span class='project_color'> </span><span class='project_name'> ${SPCValue}</span><span class='project_amount'> </span></div> <span class = "delete_id" style = "display:none">${test+1}</span><img class = "de" src="img/holder.gif">`;
      projectUl.appendChild(projectLi);

      //这里不能只单纯给新的元素绑定一个事件，会导致无效，估计是因为使用了e.cancelBubble = true;
                                    
      for(let i = 0; i<delP.length; i++){
       delP[i].onclick = function(e){
        //当点击删除的按钮时，会同时点击到他的父元素，会先触发删除，再触发背景更改，添加了这个就会保证只有删除被触发 
        e.cancelBubble = true;
        let projectLi = document.querySelectorAll("#project li");
        console.log(this);
        console.log(delP[i]);
        //这里必须将字符串转换成数字！！！！
        controlDB.del(dbPName, parseInt(deID[i].childNodes[0].nodeValue));
        changeClass.cha(projectLi[i], "tag_background", "tag_background_hide");

        projectdelete = i;	

       };
      }
      //下面这一部分一定要写在添加的下面，因为还没添加好是获取不到的
      let tagBackgroundColor = document.querySelectorAll(".tag_background");
      tagBackgroundColor[tagBackgroundColor.length-1].addEventListener ("click", () => {
       let tagBackgroundWhite = document.querySelector(".tag_background_white");

       if(tagBackgroundWhite){
        changeClass.cha(tagBackgroundWhite, "tag_background_white", "tag_background");

       }
       changeClass.cha(tagBackgroundColor[tagBackgroundColor.length-1], "tag_background", "tag_background_white");
                
      });
     }
     //清除刚才输入的内容
     subPC[0].childNodes[0].nodeValue = "";
                    
                
    });

   }else{
    let projectLi = document.createElement("li");
    changeClass.add(projectLi, "tag_background");
    projectLi.innerHTML = ` <div ><span class='project_color'> </span><span class='project_name'> ${cursor.value.name}</span><span class='project_amount'> </span></div> <span class = "delete_id" style = "display:none">${cursor.value.id}</span><img id = ${cursor.value.id} class = "de" src="img/holder.gif">`;
    projectUl.appendChild(projectLi);
    test = cursor.value.id;
    console.log(cursor.value.id);
                
            
                
                

    //作用是点击左侧标签会改变背景颜色（灰变成白色），因为这时候新添加的标签并没有进入循环
    cursor.continue();
   }
            
    
   //这里位置非常重要，要是把这个函数写在这里会循环数据库中存储的项目的次数
    

  };
    
 }
 //1， 左侧菜单每个标签点击后变色   2， 点击后更改网页标题
 function menuContent(){
        
  const tagBackgroundColor = document.querySelectorAll(".tag_background");
  const mainHide = document.querySelectorAll(".main_hide");
  //每次刷新都会讲projectFlag赋值为1，也就是今天这一标签
  if(projectFlag){
   changeClass.cha(tagBackgroundColor[projectFlag], "tag_background", "tag_background_white");
   changeClass.cha(mainHide[projectFlag], "main_hide", "main_show");
  }
  for(let i = 0; i < tagBackgroundColor.length; i++){
   console.log(i);
   tagBackgroundColor[i].addEventListener("click", ()=> {
    projectFlag = i;
    let tagBackgroundWhite = document.querySelector(".tag_background_white");
    let mainShow = document.querySelector(".main_show");
    //这里是为了防止反复点击同一个标签，但是此标签却不存在tag_background_white这一class属性
    if(tagBackgroundWhite){
     changeClass.cha(tagBackgroundWhite, "tag_background_white", "tag_background");

    }
    if(mainShow){
     changeClass.cha(mainShow, "main_show", "main_hide"); 
    }
    if(i<3){
     changeClass.cha(mainHide[i], "main_hide", "main_show");
    }else if(i>=3){
     changeClass.cha(mainHide[3], "main_hide", "main_show");
    }
    changeClass.cha(tagBackgroundColor[i], "tag_background", "tag_background_white");
                
                
                
                
   });
  }
 }
    



 function setTime(){
  let todaytime = document.querySelectorAll(".today_time");
  //左侧日历图标里面的日期
  const tspan = document.querySelector("tspan");
  tspan.childNodes[0].nodeValue = da.getDate();    
  console.log(`${week[da.getDay()]} ${da.getMonth() + 1}月${da.getDate()}日`);
  todaytime[0].childNodes[0].nodeValue = `${week[da.getDay()]} ${da.getMonth() + 1}月${da.getDate()}日`;

 }
    

 function main(){
  setTime();
 }
 addLoadEvent(main);
}());