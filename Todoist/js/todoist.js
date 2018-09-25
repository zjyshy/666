//这个文件主要是用来控制数据的。
(function DataLeakPrevention() {
 //关于时间的一些定义
 var da = new Date();
 const week = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
 
 //这个标志是为了检测究竟是在删除还是在添加项目，由于添加和删除的机制问题，必须要检测添加 = 1；删除等于0
 var projectFlag = 1;
    
 //删除或者添加project的标志
 var projectadd = 0;
 var projectdelete = -1;

 //这个的作用是刚开始需要一个默认背景为白色的标签，用于menuContent函数
 var preinstall = -1;

 //存储today任务的各项内容
 function todayTask(content, date, project, id){
  this.content = content;
  this.project = project;
  this.date = date;
  this.id = id;
 }
 function todayProject(name, id){
  this.name = name;
  this.id = id;
 }

 //创建数组索引
 

 //控制数据库的方法 
 var controlDB = {

  add: function(storeName, newItem){

   db.transaction([storeName], "readwrite").objectStore(storeName).add(newItem);
  },
  del: function(storeName, target){
   db.transaction([storeName], "readwrite").objectStore(storeName).delete(target);	
  },
  edit: function(storeName, id, data){
   var transaction = db.transaction([storeName], "readwrite");
   // 打开已经存储的数据对象
   var objectStore = transaction.objectStore(storeName);
   // 获取存储的对应键的存储对象
   var objectStoreRequest = objectStore.get(id);

   objectStoreRequest.onsuccess = function(event){
    //当前数据
    var myRecord = objectStoreRequest.result;
    for (let key in data){
     if(typeof myRecord[key] != "undefined"){
      myRecord[key] = data[key];
     }
    }
    objectStore.put(myRecord);
   };

  }
 };




  //定义数据库有关的内容
  //数据库名称
 const dbName = "Todoist";
 //存储空间名称
 const dbTName = "dbTask";
 const dbPName = "dbProject";//项目的存储空间名
 // 数据库版本
 var version = 5;
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
  //这里的两种DBOpenRequset.result和target.result结果是一样的
  console.log(DBOpenRequest.result);
  console.log(e.target.result);
  db = e.target.result;     
  console.log("数据库打开成功");
  var objectStore = db.transaction(dbPName).objectStore(dbPName);
  objectStore.openCursor().onsuccess = function(e) {
   let cursor = e.target.result;
   //将收件箱作为一个project添加进来,只有当dbPNamne为空的时候才可以添加
   if(!cursor){
    let inbox = {
     name: "收件箱",
     color: "green"
    };
    db.transaction([dbPName], "readwrite").objectStore(dbPName).add(inbox);
   } 
  }; 
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
 //数据库刚创建的时候就把inbox放进去

 
 //点击添加项目以后，将相应的项目添加到数据库
    
 //利用游标遍历每一个项目，获取每一个项目的名字和id 获取数据库中存储的id的目的是为了防止重名时候发生冲突
 function showProject(){
        
 
  var objectStore = db.transaction(dbPName).objectStore(dbPName);
  let delP = document.getElementsByClassName("de");//删除project的按钮 
  let projectUl = document.getElementById("project");
  let addPro = document.getElementsByClassName("add_p");
  let addPN = document.getElementsByClassName("add_project_name");//通过更改它控制添加页面和添加按钮的出现
  let SubPN = document.getElementsByClassName("sub_project_no");       //取消按钮
  let subPY = document.getElementsByClassName("sub_project_yes");//添加项目按钮
  let subPC = document.getElementsByClassName("sub_project_content");//通过设置contenteditable变成可以输入内容的
  let test ;	
  let ooooo =1;

  projectUl.innerHTML = " ";
  //这里的IDBKeyRange.lowerBound(key)作用是设定一个下界，就是从第二个开始游，因为第一个是邮件箱，不应该在这里显示
  objectStore.openCursor(IDBKeyRange.lowerBound(2)).onsuccess = function(e) {
            
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
      let deID = document.getElementsByClassName("delete_id");
      let projectLi = document.querySelectorAll("#project li");
      let titleName = document.querySelectorAll(".title_name");
      console.log(this);
      console.log(delP[i]);
      //这里必须将字符串转换成数字！！！！
      controlDB.del(dbPName, parseInt(deID[i].childNodes[0].nodeValue));
      
      changeClass.cha(projectLi[i], "tag_background", "tag_background_hide");
      changeClass.cha(titleName[i+3], "title_name", "title_name_hide");
      if(i+3 == projectFlag) document.title = "Todoist";
      projectdelete = i;	
      projectUl.removeChild(projectLi[projectdelete]);

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
                    
     if((/^\s*$/).test(SPCValue)){
      changeClass.cha(addPN[0], "project_close", "project_open");
     }else{
                    
      let delP = document.getElementsByClassName("de"); 
               
      changeClass.cha(addPN[0], "project_close", "project_open");
      let projectLi = document.createElement("li");
      //这个的作用是给每个里添加一个class
      changeClass.add(projectLi, "tag_background");

      let dbit = {
       name: SPCValue,
       color: "green"
      };
      controlDB.add(dbPName, dbit);
      projectLi.innerHTML = ` <div><span class='project_color'> </span><span class='project_name title_name'> ${SPCValue}</span><span class='project_amount'> </span></div> <span class = "delete_id" style = "display:none">${test+ooooo++}</span><img class = "de" src="img/holder.gif">`;
      projectUl.appendChild(projectLi);

      //这里不能只单纯给新的元素绑定一个事件，会导致无效，估计是因为使用了e.cancelBubble = true;
      for(let i = 0; i<delP.length; i++){
       delP[i].onclick = function(e){
        //当点击删除的按钮时，会同时点击到他的父元素，会先触发删除，再触发背景更改，添加了这个就会保证只有删除被触发 
        e.cancelBubble = true;
        let projectLi = document.querySelectorAll("#project li");
        let deID = document.getElementsByClassName("delete_id");
        let titleName = document.querySelectorAll(".title_name");
        if(i+2 == projectFlag){document.title = "Todoist";} 
        changeClass.cha(titleName[i+2], "title_name", "title_name_hide");
        console.log(this);
        //这里必须将字符串转换成数字！！！！
        controlDB.del(dbPName, parseInt(deID[i].childNodes[0].nodeValue));
        changeClass.cha(projectLi[i], "tag_background", "tag_background_hide");
        projectdelete = i;	
        projectUl.removeChild(projectLi[projectdelete]);

       };
      }
      //下面这一部分一定要写在添加的下面，因为还没添加好是获取不到的
      let tagBackgroundColor = document.querySelectorAll(".tag_background");
      let titleName = document.querySelectorAll(".title_name");

      tagBackgroundColor[tagBackgroundColor.length-1].addEventListener ("click", () => {
       let tagBackgroundWhite = document.querySelector(".tag_background_white");
       let mainShow = document.querySelector(".main_show");
       projectFlag = tagBackgroundColor.length;
       if(tagBackgroundWhite){
        changeClass.cha(tagBackgroundWhite, "tag_background_white", "tag_background");

       }
       if(mainShow){
        changeClass.cha(mainShow, "main_show", "main_hide"); 
       }
       //这里有个很有趣的现象，如果在点击之前获取，有可能获取不到mainHide[3]因为每次点击重新获取mainHide[3]的时候如果当前class是mainShow就会导致获取不到哦
       let mainHide = document.querySelectorAll(".main_hide");

       changeClass.cha(mainHide[3], "main_hide", "main_show");
       changeClass.cha(tagBackgroundColor[tagBackgroundColor.length-1], "tag_background", "tag_background_white");
       document.title = titleName[titleName.length-1].childNodes[0].nodeValue+":Todoist";    
                
      });
     }
     //清除刚才输入的内容
     subPC[0].childNodes[0].nodeValue = "";
                    
                
    });

   }else{
    //这里面是会重复多次的，写在if(!cursor)里面的就不会重复多次
    let projectLi = document.createElement("li");
    changeClass.add(projectLi, "tag_background");
    projectLi.innerHTML = ` <div ><span class='project_color'> </span><span class='project_name title_name'> ${cursor.value.name}</span><span class='project_amount'> </span></div> <span class = "delete_id" style = "display:none">${cursor.value.id}</span><img id = ${cursor.value.id} class = "de" src="img/holder.gif">`;
    projectUl.appendChild(projectLi);
    test = cursor.value.id;
    console.log(cursor.value.id);
    cursor.continue();
   }
            
    
   //这里位置非常重要，要是把这个函数写在这里会循环数据库中存储的项目的次数
    

  };
    
 }
 //1， 左侧菜单每个标签点击后变色   2， 点击后更改网页标题
 function menuContent(){
        
  const tagBackgroundColor = document.querySelectorAll(".tag_background");
  let mainHide = document.querySelectorAll(".main_hide");
  let titleName = document.querySelectorAll(".title_name");
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
    document.title = titleName[i].childNodes[0].nodeValue+":Todoist";            
                
                
                
   });
  }
 }
    


 //显示今天的日期
 function setTime(){
  let todaytime = document.querySelectorAll(".today_time");
  
  //左侧日历图标里面的日期
  const tspan = document.querySelector("tspan");
  tspan.childNodes[0].nodeValue = da.getDate();    
  console.log(`${week[da.getDay()]} ${da.getMonth() + 1}月${da.getDate()}日`);
  todaytime[0].childNodes[0].nodeValue = `${week[da.getDay()]} ${da.getMonth() + 1}月${da.getDate()}日`;

 }
 //当today添加任务的主体显示出来以后，在检测是否输入了内容
 function todayAddTask(){
  let todayAddTaskContentInp = document.querySelector(".today_add_task_content input");//今天任务内容
  let todayAddTaskDateInp = document.querySelector(".today_add_task_date input");//today日期框的内容
  let todayAddTaskProjectInp = document.querySelector(".today_add_task_project input");//today项目框的内容
  let subTodayTaskNo = document.querySelector(".sub_today_task_no");//today 取消添加按钮
  let subTodayTaskYes = document.querySelector(".sub_today_task_yes");//today 添加任务按钮
  subTodayTaskNo.addEventListener("click", ()=>{
   settaskcontents();
   let todayAddTaskMainShow = document.querySelector(".today_add_task_main_show");
   changeClass.cha(todayAddTaskMainShow, "today_add_task_main_show", "today_add_task_main");
  });
  subTodayTaskYes.addEventListener("click", ()=>{
  //检测today任务是否为空
   if((/^\s+$/).test(todayAddTaskContentInp.value)||!todayAddTaskContentInp.value){
    let todayAddTaskMainShow = document.querySelector(".today_add_task_main_show");
    changeClass.cha(todayAddTaskMainShow, "today_add_task_main_show", "today_add_task_main");
    settaskcontents();
    
   }else{
    let regTestDate = /^(\d|1[0-2])月(\d|[012]\d|3[01])日$/;//测试是否符合日期形式如1月1日
    let regSetDate = /\d/g;//提取出来所有的数字
    //检测日期是否符合形式
    if(regTestDate.test(todayAddTaskDateInp.value)){
     let arr = todayAddTaskDateInp.value.match(regSetDate);//可以直接存储数组形式
     var arrmo = parseInt(arr[0]);//这是月份下面是日期 ，都需要转换成数字
     var arrday = parseInt(arr[1]);
     var objectStore = db.transaction(dbPName).objectStore(dbPName);
     var todayAddTaskProject = new Array();
     var projectF = 0;
     //today 项目名不为空的时候触发
     if(!(/^\s*$/).test(todayAddTaskProjectInp.value)){
      objectStore.openCursor().onsuccess = function(e) {
            
       let cursor = e.target.result;
       if(cursor){
        todayAddTaskProject[projectF++] = new todayProject(cursor.value.name, cursor.value.id);
        cursor.continue();
       }else{
        for(let i = 0 ; i < todayAddTaskProject.length; i++){
        
         if( todayAddTaskProject[i].name == todayAddTaskProjectInp.value){
          //作用是存储当前的项目
          var todayAddTaskFlag = i;
          break;
         }else if(i == todayAddTaskProject.length ){
          alert("这个项目还没有创建哦");
            
         }
        }
       }
      
      };
     }else{
      alert("要选一个项目");
     }
    

    }else{
     alert("请按照日期格式输入");
    }
    //是否在今天显示
    if(arrmo == (da.getMonth()+1) && arrday == da.getDate()){
    }
    
   }
  });

 }
 //为today添加任务的部分设置预先的内容
 function settaskcontents(){
  let todayAddTaskContentInp = document.querySelector(".today_add_task_content input");//今天任务内容
  let todayAddTaskDateInp = document.querySelector(".today_add_task_date input");//today日期框的内容
  let todayAddTaskProjectInp = document.querySelector(".today_add_task_project input");//today项目框的内容
  todayAddTaskDateInp.value = `${da.getMonth() + 1}月${da.getDate()}日`;    
  todayAddTaskContentInp.value = " ";
  todayAddTaskProjectInp.value = "收件箱";
  todayAddTaskDateInp.addEventListener("click", ()=>{
   todayAddTaskDateInp.select();
  });
  todayAddTaskProjectInp.addEventListener("click", ()=>{
   todayAddTaskProjectInp.select();
  });

 }
 //将获取的时间提取出来
 function takeAddTaskTime(){

  
 }
 
 function main(){
  settaskcontents();  
  setTime();
  
  todayAddTask();
  takeAddTaskTime();
  
 }
 addLoadEvent(main);
}());