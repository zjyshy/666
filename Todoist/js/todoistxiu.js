(function(){
 var addValue;
 var da = new Date();
 const week = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
 
 //首先建好数据库
 const dbN = "TODO";
 const verson = 1;
 const dbPN = "Pro";
 const dbTN ="Tas";
 var db;
 var DBOpenRequest = window.indexedDB.open(dbN, verson);
 DBOpenRequest.onerror = function(){
  console.log("打开失败");
 };
 DBOpenRequest.onsuccess = function(e){
  console.log("成了");
  db = e.target.result;
  //只有当inbox不存在
  addInBox();
  controlDB.show(dbPN, "pro", 2);
  todayTaskS(); 
 };

 DBOpenRequest.onupgradeneeded =function(e){
  db = e.target.result;

  var objectStoreT = db.createObjectStore(dbTN, { 
   keyPath: "id",
   autoIncrement: true
  });
  var objectStoreP = db.createObjectStore(dbPN, {
   keyPath: "id",
   autoIncrement: true
  });

  objectStoreT.createIndex("id", "id", {
   unique: true,
  });

  objectStoreP.createIndex("id", "id", {
   unique: true,
  });
  
  objectStoreT.createIndex("content", "content");
  objectStoreT.createIndex("date", "date");
  objectStoreT.createIndex("pro", "pro");
  objectStoreP.createIndex("content", "content");
  objectStoreP.createIndex("task", "task");
  location.reload();
 };
 //将收件箱添加进项目数据库，作用是利用其id 来为后续创造价值
 function addInBox(){
  var transaction = db.transaction([dbPN], "readwrite");
  var objectStore = transaction.objectStore(dbPN);
  console.log(objectStore.get(1));
  var objectStore = db.transaction(dbPN).objectStore(dbPN);

  objectStore.openCursor().onsuccess = function(e) {
   let cursor = e.target.result;
   //将收件箱作为一个project添加进来,只有当dbPNamne为空的时候才可以添加
   if(!cursor){
    let inbox = {
     content: 2,
     task: 1
    };
    db.transaction([dbPN], "readwrite").objectStore(dbPN).add(inbox);
   } 
  };  
 }

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

  },
  get: function(storeName, id, value, callback){
   var objectStore = db.transaction(storeName, "readwrite").objectStore(storeName);
   var objectStoreRequest = objectStore.get(id);
   objectStoreRequest.onsuccess =function(e){
    var myRecord = e.target.result;
    addValue = myRecord[value];
    if(callback)callback(addValue); // when sth. is ready, plz do sth.
   };
  
  },

  //按照一定的要求游历数据库中的内容，可设置上界下界,这里sel是用来选择具体是为项目还是任务创建列表
  show: function(storeName, sel){
   let args = Array.prototype.slice.call(arguments);
   let objectStore = db.transaction(storeName).objectStore(storeName);
   //只有上界没有下界
   if(args[1]&&!args[3]){
    var upperBoundOpenKeyRange = IDBKeyRange.lowerBound(args[2]);
    objectStore.openCursor(upperBoundOpenKeyRange).onsuccess = function(e){
     let cursor = e.target.result;
     var tas;
     if(cursor){
      if(cursor.value.task){
       tas = cursor.value.task;
      }else{
       tas = 0;
      }
      //为project创建列表
      if(sel == "pro"){
       createLi(cursor.value.id, cursor.value.content, "project", tas);

      }
      cursor.continue();

     }else{
      deleProject();
      clickCW();
      addProjectTask();
      ProjectTaskAmount();


     }
    };
   }
  }
 };



 //创建项目list
 function createLi(dele, content, target){
  let projectUl = document.querySelector("#project");
  let projectLi = document.createElement("li");
  projectLi.setAttribute("class", "tag_background pro_li");
  let taskUL = document.querySelector(".today_task_list");
  let taskLi = document.createElement("li");
  let projectContentUl = document.querySelector(".project_task_list");
  let projectContentLi = document.createElement("li");
  taskLi.setAttribute("class", "task_list");
  let projectAddTaskMainName = document.querySelector(".project_add_task_main_name");
  //函数中的arguments可以接受所有参数并把它存在一个类数组对象中，需要将它转换成一个数组
  let args = Array.prototype.slice.call(arguments);
  if(target == "project"){
   if(!args[3]){args[3] = 0;}
   projectLi.innerHTML = 
   `<div>
     <span class='project_color'></span>
     <span class='project_name'>${content}</span>
     <span class='project_amount'>${args[3]}</span>
    </div>
    <span class = "delete_id" style = "display:none">${dele}</span>
    <img class = "de" src="img/holder.gif">`;
   projectUl.appendChild(projectLi);

  }else if(target == "today"){
   if(!args[3]){args[3] = "收件箱";}
   taskLi.innerHTML = 
   `<div>
     <span class="task_content_del"></span>
     <span class = "task_content_d">${dele}</span>
     <span class="task_name">${content}</span>
     <span class="task_project">${args[3]}</span>
    </div>`;
   taskUL.appendChild(taskLi);
  }else if(target == "projectContent"){
   projectContentLi.innerHTML = 
   `<div>
     <span class="project_content_del"></span>
     <span class = "project_task_content_del" style="display:none">${dele}</span>
     <span class = "project_task_content">${content}</span>
     <span class = "project_task_date">${args[3]}</span>
    </div>`;
   projectContentUl.appendChild(projectContentLi);
  }
 }


 //点击后变白
 function clickCW(){
  let TB = document.querySelectorAll(".tag_background");
  for(let i = 0; i < TB.length ;i++){
   TB[i].addEventListener("click", ()=>{
    let TBW = document.querySelector(".tag_background_white");
    if(TBW){
     changeClass.del(TBW, "tag_background_white");
    }
    changeClass.add(TB[i], "tag_background_white");
   });
  }
 }



 function addTodayTaskShow(){
  let menuT = document.querySelector(".menu_today_page");
  let MH = document.querySelectorAll(".main_hide");
  menuT.addEventListener("click", ()=>{
   let MS = document.querySelector(".main_show");
   if(MS){
    changeClass.del(MS, "main_show");
   }
   changeClass.add(MH[1], "main_show");
  });
 }



 function addProjectTask(){
  let proL = document.querySelectorAll(".pro_li");
  let MH = document.querySelectorAll(".main_hide");
  let PATNM = document.querySelector(".project_add_task_main_name");
  let PN = document.querySelectorAll(".project_name");
  let projectAddTaskId = document.querySelector(".project_add_task_id");
  let deleteId = document.querySelectorAll(".delete_id");
  for(let i = 0 ; i < proL.length ; i++){
   proL[i].addEventListener("click", ()=>{
    let MS = document.querySelector(".main_show");
    if(MS){
     changeClass.del(MS, "main_show");
    }
    changeClass.add(MH[3], "main_show");
    PATNM.childNodes[0].nodeValue = `${PN[i].childNodes[0].nodeValue}`;
    projectAddTaskId.childNodes[0].nodeValue = `${deleteId[i].childNodes[0].nodeValue}`;
    projectContentShow(parseInt(deleteId[i].childNodes[0].nodeValue));
   });
   

  }  
 }

 function addInboxShow(){

  let menuInbox = document.querySelector(".menu_inbox_page");
  let MH = document.querySelectorAll(".main_hide");
  menuInbox.addEventListener("click", ()=>{
   let MS = document.querySelector(".main_show");
   if(MS){
    changeClass.del(MS, "main_show");
   }
   changeClass.add(MH[0], "main_show");
   inboxContentShow();
  });

 }

 function setTime(){
  let todaytime = document.querySelectorAll(".today_time");
  let todayAddTaskDateInp = document.querySelector(".today_add_task_date input");//today日期框的内容
  //左侧日历图标里面的日期
  const tspan = document.querySelector("tspan");
  tspan.childNodes[0].nodeValue = da.getDate();    
  console.log(`${week[da.getDay()]} ${da.getMonth() + 1}月${da.getDate()}日`);
  todaytime[0].childNodes[0].nodeValue = `${week[da.getDay()]} ${da.getMonth() + 1}月${da.getDate()}日`;
  todayAddTaskDateInp.value = `${da.getMonth() + 1}月${da.getDate()}日`;

 }

 function addProject(){
  const projectOpen = document.querySelector(".project_open");
  const addProjectSub = document.querySelector(".add_p");
  const PCS = document.querySelector(".sub_project_content");
  const yes = document.querySelector(".sub_project_yes");
  const no = document.querySelector(".sub_project_no");
  const reg = /^\s*$/; 
  addProjectSub.addEventListener("click", ()=>{
   changeClass.cha(projectOpen, "project_open", "project_close");
   PCS.focus();

  });
  yes.addEventListener("click", ()=>{
   if(PCS.childNodes[0] && !reg.test(PCS.childNodes[0].nodeValue)){
    controlDB.get(dbPN, 1, "content");
    var objectStore = db.transaction(dbPN, "readwrite").objectStore(dbPN);
    var objectStoreRequest = objectStore.get(1);
    objectStoreRequest.onsuccess = function(){
     createLi(addValue, PCS.childNodes[0].nodeValue, "project");
     let item1 = {
      content: PCS.childNodes[0].nodeValue,
     };
     let item2 = {
      content: addValue + 1
     };
     controlDB.add(dbPN, item1);
     controlDB.edit(dbPN, 1, item2);
     clickCW();
     deleProject();
     addProjectTask();
     changeClass.cha(projectOpen, "project_close", "project_open");
     PCS.childNodes[0].nodeValue = " ";
    };
   }else{
    changeClass.cha(projectOpen, "project_close", "project_open");
   }
  });
  no.addEventListener("click", ()=>{
   changeClass.cha(projectOpen, "project_close", "project_open");
   if(PCS.childNodes[0])PCS.childNodes[0].nodeValue = " ";
  });
 }
 function todayAddTask(){
  let TTL = document.querySelector(".today_task_list");//放today 任务的列表
  let todayAddTaskContentInp = document.querySelector(".today_add_task_content input");//今天任务内容
  let todayAddTaskDateInp = document.querySelector(".today_add_task_date input");//today日期框的内容
  let subTodayTaskNo = document.querySelector(".sub_today_task_no");//today 取消添加按钮
  let subTodayTaskYes = document.querySelector(".sub_today_task_yes");//today 添加任务按钮
  let regTestDate = /^(\d|1[0-2])月(\d|[012]\d|3[01])日$/;//测试是否符合日期形式如1月1日
  let todayAddTaskMain = document.querySelector(".today_add_task_main");//获取今天的添加任务一块
  let addT = document.querySelector(".add_t p");

  let regSetDate = /\d+/g;//提取出来所有的数字
  todayAddTaskContentInp.addEventListener("click", ()=>{
   todayAddTaskContentInp.select();
  });
  todayAddTaskDateInp.addEventListener("click", ()=>{
   todayAddTaskDateInp.select();
  });
  
  subTodayTaskYes.addEventListener("click", ()=>{
   if(todayAddTaskContentInp.value&&!(/^\s*$/).test(todayAddTaskContentInp.value)&&regTestDate.test(todayAddTaskDateInp.value)){
    let arr = todayAddTaskDateInp.value.match(regSetDate);

    
    controlDB.get(dbPN, 1, "task");
    var objectStore = db.transaction(dbPN, "readwrite").objectStore(dbPN);
    var objectStoreRequest = objectStore.get(1);
    objectStoreRequest.onsuccess = function(){


     if(parseInt(arr[0]) == (da.getMonth()+1)&&parseInt(arr[1]) ==(da.getDate())){
      createLi(addValue, todayAddTaskContentInp.value, "today"); 
     }
    
     let item = {
      "content": todayAddTaskContentInp.value,
      "date": todayAddTaskDateInp.value,
      "pro": 1
     };
     let item2 = {
      task: addValue + 1
     };
     controlDB.edit(dbPN, 1, item2);
   
     controlDB.add(dbTN, item);
    
     deleteTodayT();

     clickCTTC();
     addT.style.display = "block";
     changeClass.cha(todayAddTaskMain, "today_add_task_main_show", "today_add_task_main");
     todayAddTaskContentInp.value = " ";

    };
    
   }else{
    addT.style.display = "block";
    changeClass.cha(todayAddTaskMain, "today_add_task_main_show", "today_add_task_main");

   }
  });
  subTodayTaskNo.addEventListener("click", ()=>{

   if(!document.querySelector(".today_add_task_main")){
    changeClass.cha(todayAddTaskMain, "today_add_task_main_show", "today_add_task_main");
    todayAddTaskContentInp.value = " ";
    todayAddTaskDateInp.value = `${da.getMonth() + 1}月${da.getDate()}日`;
    addT.style.display = "block";

   }
  });



 }



 function todayTaskS(){
  let objectStore = db.transaction(dbTN).objectStore(dbTN);
  let regSetDate = /\d+/g;//提取出来所有的数字
  let  todayTaskL = document.querySelector(".today_task_list");
  todayTaskL.innerHTML = "";
  objectStore.openCursor().onsuccess = function(e){
   let cursor = e.target.result;
   
   if(cursor){
    let dateArr = cursor.value.date.match(regSetDate);
    if(parseInt(dateArr[0])==(da.getMonth()+1) && parseInt(dateArr[1]) == da.getDate()){


     if(cursor.value.pro == 1){
      createLi(cursor.value.id, cursor.value.content, "today");
     }else{
      createLi(cursor.value.id, cursor.value.content, "today", cursor.value.pro[0]);
     }


    }
    
    cursor.continue();
   }else{
    deleteTodayT();
    clickCTTC();
   }
  };

 }



 //点击后修改今天的任务内容
 function clickCTTC(){


  let TL = document.querySelectorAll(".task_list");
  let TN = document.querySelectorAll(".task_name");
  let taskDelete = document.querySelectorAll(".task_content_d");

  for(let i = 0; i<TL.length ; i++){
   TL[i].onclick  = function(){

    let promptValue = prompt("你想改成啥");
    if(promptValue &&!(/^\s*$/).test(promptValue)){
     TN[i].childNodes[0].nodeValue = promptValue;
     let itemT = {
      "content": promptValue
     };

     controlDB.edit(dbTN, parseInt(taskDelete[i].childNodes[0].nodeValue), itemT);
    }
   };
  }
 } 
 function clickCPTC(){

  let TL = document.querySelectorAll(".project_task_list li");
  let proTaskCon = document.querySelectorAll(".project_task_content");
  let taskDel = document.querySelectorAll(".project_task_content_del");

  for(let i = 0; i<TL.length ; i++){
   TL[i].onclick  = function(){
    let promptValue = prompt("你想改成啥");
    if(promptValue &&!(/^\s*$/).test(promptValue)){
     proTaskCon[i].childNodes[0].nodeValue = promptValue;
     let itemT = {
      "content": promptValue
     };
     controlDB.edit(dbTN, parseInt(taskDel[i].childNodes[0].nodeValue), itemT);
     todayTaskS();


    }
   };
  }

 }


 function clickCITC(){

  let TL = document.querySelectorAll(".inbox_task_list li");
  let TN = document.querySelectorAll(".inbox_task_name");
  let taskDelete = document.querySelectorAll(".inbox_task_id");

  for(let i = 0; i<TL.length ; i++){
   TL[i].onclick  = function(){

    let promptValue = prompt("你想改成啥");
    if(promptValue &&!(/^\s*$/).test(promptValue)){
     TN[i].childNodes[0].nodeValue = promptValue;
     let itemT = {
      "content": promptValue
     };

     controlDB.edit(dbTN, parseInt(taskDelete[i].childNodes[0].nodeValue), itemT);
     todayTaskS();
    }
   };
  }
 } 

 

 function deleProject(){
  
  let deBtn = document.querySelectorAll(".de");
  let PL = document.querySelectorAll("#project li");
  let D = document.querySelectorAll(".delete_id");
  let projectAddTId = document.querySelector(".project_add_task_id");
  
  for(let i =0; i < PL.length; i++){
   //这里必须使用onclik ，使用addlistener的时候会因为监听多次导致错误
   deBtn[i].onclick = function(e){
    e.cancelBubble = true;

    
    if(projectAddTId.childNodes[0].nodeValue == D[i].childNodes[0].nodeValue){
     let mainShow = document.querySelector(".main_show");
     changeClass.del(mainShow, "main_show");
    }

    PL[i].parentNode.removeChild(PL[i]);  

    controlDB.del(dbPN, parseInt(D[i].childNodes[0].nodeValue));

    deleteProjectContent(parseInt(D[i].childNodes[0].nodeValue));

    
    clickCW();
   };
  }
 } 

 function deleteProjectContent(value){

  let objectStore = db.transaction(dbTN).objectStore(dbTN);




  objectStore.openCursor().onsuccess = function(e){


   let cursor = e.target.result;

   if(cursor){
    if(cursor.value.pro[1] == value){

     controlDB.del(dbTN, cursor.value.id);


    }

    cursor.continue();
   }else{
    todayTaskS(); 

   }


  };


 }


 function deleteTodayT(){
  var todayTDelete = document.querySelectorAll(".task_content_del");
  var taskDelete = document.querySelectorAll(".task_content_d");
  var todayTaskListLi = document.querySelectorAll(".today_task_list li");
  var todayTaskListUl = document.querySelector(".today_task_list");
  for(let i = 0 ; i< todayTDelete.length; i++){
   todayTDelete[i].onclick = function(e){
    e.cancelBubble = true;

    todayTaskListUl.removeChild(todayTaskListLi[i]);
    controlDB.del(dbTN, parseInt(taskDelete[i].childNodes[0].nodeValue));
    ProjectTaskAmount();
    
   };
  }
 }





 function projectAddTask(){
  let projectAddT = document.querySelector(".project_add_t");
  let projectAddTas = document.querySelector(".project_add_task");
  let projectAddTaskMain = document.querySelector(".project_add_task_main");
  let subProYes = document.querySelector(".sub_project_task_yes");
  let subProNo = document.querySelector(".sub_project_task_no");
  let projectAddTP = document.querySelector(".project_add_t p");
  let projectAddTaskContnetInp = document.querySelector(".project_add_task_content input");
  let projectAddTastdateInp = document.querySelector(".project_add_task_date input");
  const reg = /^\s*$/; 
  let regTestDate = /^(\d|1[0-2])月(\d|[012]\d|3[01])日$/;//测试是否符合日期形式如1月1日
  let projectAddTaskId = document.querySelector(".project_add_task_id");
  let proTaskMainName = document.querySelector(".project_add_task_main_name");

  projectAddTas.addEventListener("click", ()=>{
   let projectAddTaskMainShow = document.querySelector(".project_add_task_main_show");
   if(!projectAddTaskMainShow){
    changeClass.cha(projectAddTaskMain, "project_add_task_main", "project_add_task_main_show");
    projectAddTP.style = "display: none;";

   }
  
   

  });
  subProYes.addEventListener("click", ()=>{
   if(projectAddTaskContnetInp.value&&!reg.test(projectAddTaskContnetInp.value)){

    if( regTestDate.test(projectAddTastdateInp.value)){

     controlDB.get(dbPN, 1, "task");
     var objectStore = db.transaction(dbPN, "readwrite").objectStore(dbPN);
     var objectStoreRequest = objectStore.get(1);

     objectStoreRequest.onsuccess = function(){
      
      createLi(addValue, projectAddTaskContnetInp.value, "projectContent", projectAddTastdateInp.value);
      
      let item = {
       "content": projectAddTaskContnetInp.value,
       "date": projectAddTastdateInp.value,
       "pro": [proTaskMainName.childNodes[0].nodeValue, parseInt(projectAddTaskId.childNodes[0].nodeValue)]
      };
      let item2 = {
       task: addValue + 1
      };

      controlDB.add(dbTN, item);
      controlDB.edit(dbPN, 1, item2);
      projectAddTP.style = "display: block;";
      changeClass.cha(projectAddTaskMain, "project_add_task_main_show", "project_add_task_main");
      todayTaskS();
      deleteTodayT();
      clickCTTC();
      clickCPTC();

      projectAddTaskContnetInp.value = "";
      projectAddTastdateInp.value = "";
      projectTaskDelete();
      ProjectTaskAmount();
      

     };
     

    }else{
     alert("请你输入正确的日期哦");
    }

   }else{
    alert("请输入任务");
   }
  });
  subProNo.addEventListener("click", ()=>{
   projectAddTP.style = "display: block;";
   changeClass.cha(projectAddTaskMain, "project_add_task_main_show", "project_add_task_main");
   projectAddTaskContnetInp.value = "";
   projectAddTastdateInp.value = "";
  });

 }



 function projectContentShow(target){
  let objectStore = db.transaction(dbTN, "readwrite").objectStore(dbTN);
  let projectTaskList = document.querySelector(".project_task_list");

  projectTaskList.innerHTML = " "; 
  objectStore.openCursor().onsuccess = function(e){
   let cursor = e.target.result;

   if(cursor){
    let pr = cursor.value.pro[1];

    if(pr == target){
     createLi(cursor.value.id, cursor.value.content, "projectContent", cursor.value.date);
    }
    
    cursor.continue();

   }else{
    clickCPTC();
    projectTaskDelete();
   }
  };
 }


 function projectTaskDelete(){
  let projectTDelete = document.querySelectorAll(".project_content_del");
  let taskDelete = document.querySelectorAll(".project_task_content_del");
  let projectTaskListLi = document.querySelectorAll(".project_task_list li");
  let projectTaskListUl = document.querySelector(".project_task_list");
  for(let i = 0 ; i< projectTDelete.length; i++){
  
   projectTDelete[i].onclick = function(e){
  
    e.cancelBubble = true;
    projectTaskListUl.removeChild(projectTaskListLi[i]);
    controlDB.del(dbTN, parseInt(taskDelete[i].childNodes[0].nodeValue));
    ProjectTaskAmount();
    todayTaskS();
   };
  }

  
 }

 function ProjectTaskAmount(){

  let proAm = document.querySelectorAll(".project_amount");
  let deleteId = document.querySelectorAll(".delete_id");
  let objectStore = db.transaction(dbTN).objectStore(dbTN);
  let arr = new Array; 
  
  objectStore.openCursor().onsuccess = function(e){

   let cursor = e.target.result;
   if(cursor){
    
    if(arr[cursor.value.pro[1]]){
     
     arr[cursor.value.pro[1]] += 1;

    }else{

     arr[cursor.value.pro[1]] = 1;

    }
    
    cursor.continue();

   }else{
    for(let i = 0; i< deleteId.length; i++){
     if(!arr[parseInt(deleteId[i].childNodes[0].nodeValue)]){
     
      arr[parseInt(deleteId[i].childNodes[0].nodeValue)] = 0;
     
     }
     
     proAm[i].childNodes[0].nodeValue = arr[parseInt(deleteId[i].childNodes[0].nodeValue)];

    }
   }
  };
 }

 function inboxContentShow(){

  let inboxList = document.querySelector(".inbox_task_list");
  let objectStore = db.transaction(dbTN).objectStore(dbTN);
  inboxList.innerHTML = " ";

  objectStore.openCursor().onsuccess = function(e){

   let cursor = e.target.result;

   
   if(cursor){
    
    if(cursor.value.pro == 1){
     let inboxLi = document.createElement("li");
     
     inboxLi.innerHTML = `<div>
        <span class="inbox_task_de"></span>
        <span class="inbox_task_name">${cursor.value.content}</span>
        <span class="inbox_task_date">${cursor.value.date}</span>
        <span class="inbox_task_id">${cursor.value.id}</span>
        </div>`;

     inboxList.appendChild(inboxLi); 
   
    }

    cursor.continue();

   }else{
    inboxTaskD();
    clickCITC();
   }
   

  };

 }


 function inboxTaskD(){

  let inboxTaskDelete = document.querySelectorAll(".inbox_task_de");
  let inboxTaskLi = document.querySelectorAll(".inbox_task_list li");
  let inboxTaskUl = document.querySelector(".inbox_task_list");
  let inboxTaskDeId = document.querySelectorAll(".inbox_task_id");

  for(let i = 0; i < inboxTaskDelete.length; i++){
   inboxTaskDelete[i].addEventListener("click", (e)=>{
    e.cancelBubble = true;
    controlDB.del(dbTN, parseInt(inboxTaskDeId[i].childNodes[0].nodeValue));
    inboxTaskUl.removeChild(inboxTaskLi[i]);  
   
    todayTaskS();


   });
  }


 }

 
 function inboxTaskChange(){


 }

 addLoadEvent(addProject);
 addLoadEvent(addTodayTaskShow);
 addLoadEvent(addInboxShow);
 addLoadEvent(setTime);
 addLoadEvent(todayAddTask);
 addLoadEvent(projectAddTask);
 addLoadEvent(inboxContentShow);
 
}());