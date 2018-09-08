(function h(){
//简易版，完整版的bug实在是太多了，头都大了。姑且先做个简易版，
 const da = new Date();
 //加载完成后在执行
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
 //数据库
 const dbName = "Todoist";
 //存储空间名称
 const dbTName = "dbTask";
 // 数据库版本
 var version = 1;
 // 数据库数据结果
 var db;
 // 打开数据库
 var DBOpenRequest = window.indexedDB.open(dbName, version);
 DBOpenRequest.onsuccess = function(e){
  db = e.target.result;     

  console.log("success");
  showTaksContent(); 

 };
 DBOpenRequest.onerror = function(){
  console.log("def");
 };
 DBOpenRequest.onupgradeneeded = function(e){
  db = e.target.result;  
  //create tast store
  var objectStoreT = db.createObjectStore(dbTName, { 
   keyPath: "id",
   autoIncrement: true
  });
  //create key
  objectStoreT.createIndex("id", "id", {
   unique: true
  });
  objectStoreT.createIndex("content", "content");
  objectStoreT.createIndex("date", "date");
 };


 //control db function
 var dbControl = {
  add: function(storeName, newItem){

   db.transaction([storeName], "readwrite").objectStore(storeName).add(newItem);
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

  }, del: function(storeName, target){
   db.transaction([storeName], "readwrite").objectStore(storeName).delete(target);	
  }

 };
 //只有当输入内容都符合标准才能存入数据库
 function showTaksContent(){
  const taskList = document.querySelector("#task_list");
  var objectStore = db.transaction(dbTName).objectStore(dbTName);
  const enter = document.querySelector(".enter");
  const taskReg = /^\s*$/;
  const dateReg = /^(\d|1[0-2])月(\d|[012]\d|3[01])日$/;
  const addTask = document.querySelector(".add_task");
  const addDate = document.querySelector(".add_date");
  var record = 0 ;
  var count = 0;
  objectStore.openCursor().onsuccess = function(e){
   const cursor = e.target.result;
   
   if(cursor){
    let taskLi = document.createElement("li");
    taskLi.innerHTML = `<span class = "task">${cursor.value.content}</span> ${cursor.value.date} <button class = "delete_task">删除</button><button class = "alter">修改</button> <span class = "D" style = "display : none">${cursor.value.id}</span>`;
    taskList.appendChild(taskLi);
    record = cursor.value.id+1 ;
    cursor.continue();
   
   }else{
    //enter button 

    enter.addEventListener("click", ()=>{
     if(!taskReg.test(addTask.value)){
      if(dateReg.test(addDate.value)){
       let addT = {
        content: addTask.value,
        date: addDate.value
       };
       dbControl.add(dbTName, addT);
       let taskLi = document.createElement("li");
       taskLi.innerHTML = `<span class = "task">${addTask.value}</span> ${addDate.value} <button class = "delete_task">删除</button> <button class = "alter">修改</button><span class = "D" style = "display : none">${record + count++}</span>`;
       taskList.appendChild(taskLi);
       dele();
       alt();
   
      }
     }
    });
    dele();
    alt();
   }
    

  };
 }

 function todayDate(){
  const addDate = document.querySelector(".add_date");
  const addTask = document.querySelector(".add_task");
  console.log(` ${da.getMonth() + 1}月${da.getDate()}日`);
  addDate.value = `${da.getMonth() + 1}月${da.getDate()}日`;
  addDate.addEventListener("click", ()=>{
   addDate.select();
  });
  addTask.addEventListener("click", ()=>{
   addTask.select();
  });

 }
 function dele(){
  let deleteTask = document.querySelectorAll(".delete_task");
  let ul = document.querySelector("ul");
  let lili = document.querySelectorAll("li");
  let D = document.querySelectorAll(".D");

  for(let i = 0 ; i < deleteTask.length ; i++){
   deleteTask[i].onclick = function(){

    console.log(i);
    ul.removeChild(lili[i]);
    dbControl.del(dbTName, parseInt(D[i].childNodes[0].nodeValue) );
   };

   

  }
 }
 function alt(){
  let al = document.querySelectorAll(".alter");
  let T = document.querySelectorAll(".task");
  let D = document.querySelectorAll(".D");

  const taskReg = /^\s*$/;

  for(let i = 0; i < al.length ; i++){
   al[i].onclick = function(){
    var val =  prompt("之前的任务:"+T[i].childNodes[0].nodeValue);
    if(!taskReg.test(val) && val != null){
     T[i].childNodes[0].nodeValue = val;
     let se = {
      content: val
     };
     dbControl.edit(dbTName, parseInt(D[i].childNodes[0].nodeValue), se);
    }
   };
  }
  
 }
 function main(){
 
 
  todayDate();

 }
 addLoadEvent(main);
}());