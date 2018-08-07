//这个文件主要是用来控制数据的。
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


    //当想要修改class的时候可以使用它
    var changeClass = {
        add:function(classContent,addContnet){

            let a = classContent[0].getAttribute("class");
            a+=" "+ addContnet;
            classContent[0].setAttribute("class",`${a}`);
        },
        del:function(classContent,delContent){
            //利用了正则表达式，将所有的class存入数组
            let sta = classContent[0].getAttribute("class").split(/[\s]/);
            //数组对象并没有提供这个remove方法
            sta.remove(delContent);
            //join将数组按照规则分割，这里是按照空格
            classContent[0].setAttribute("class",`${sta.join(" ")}`);
            
        },
        cha:function(classContent,targetClass,resultClass){
            let sta = classContent[0].getAttribute("class").split(/[\s]/);
            sta.remove(targetClass);
            sta.push(resultClass);
            classContent[0].setAttribute("class",`${sta.join(" ")}`);
        }

    };
    //创建数组索引
    Array.prototype.indexOf = function(val) {
        for (var i = 0; i < this.length; i++) {
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
    
    //控制数据库的方法
    var controlDB  ={

        add:function(storeName,newItem){

            db.transaction([storeName],"readwrite").objectStore(storeName).add(newItem);
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
    
    };
    // 下面事情执行于：数据库首次创建版本，或者window.indexedDB.open传递的新版本（版本数值要比现在的高）
    
    DBOpenRequest.onupgradeneeded = function(e){

        db = e.target.result;


        //创建存出任务的数据库
        var objectStoreT = db.createObjectStore(dbTName, { 
            keyPath: "id",
            autoIncrement: true
        });
       
        objectStoreT.createIndex("id","id",{
            unique : true
        }); //为task存储空间创建索引

        
        objectStoreT.createIndex("date","date");
        objectStoreT.createIndex("project","project");
        objectStoreT.createIndex("content","content");
       
        objectStoreT.createIndex("hide","hide");



        //创建存储项目的数据库 
        var objectStoreP = db.createObjectStore(dbPName,{
            keyPath: "id",
            autoIncrement: true
        });
        objectStoreP.createIndex("id","id",{
            unique : true
        }); //为project存储空间创建索引
        objectStoreP.createIndex("name","name");
        objectStoreP.createIndex("color","color");
        
       


        //创建存储标签的数据库
        //由于标签属于高级功能暂时不做
        //优先级功能暂时不考虑


    };  
    //点击添加项目以后，将相应的项目添加到数据库
    function addProject(){
        //添加项目元素名
        let addPro = document.getElementsByClassName("add_p");
        let addPN = document.getElementsByClassName("add_project_name");//通过更改它控制添加页面和添加按钮的出现
        let SubPN = document.getElementsByClassName("sub_project_no");       //取消按钮
        let subPY = document.getElementsByClassName("sub_project_yes");//添加项目按钮
        let subPC = document.getElementsByClassName("sub_project_content");//通过设置contenteditable变成可以输入内容的
        let projectUl = document.getElementById("project");
        //点击转到输入项目的位置
        addPro[0].addEventListener("click",() =>{
            changeClass.cha(addPN,"project_open","project_close");
            subPC[0].focus();

        });
        //点击转回添加项目
        SubPN[0].addEventListener("click",() =>{
            changeClass.cha(addPN,"project_close","project_open");
        });
        //点击了添加项目按钮后
        subPY[0].addEventListener("click",() => {
            let SPCValue = subPC[0].childNodes[0].nodeValue;

            if(SPCValue.match(/^[ ]+$/)){
                changeClass.cha(addPN,"project_close","project_open");
            }else{
                changeClass.cha(addPN,"project_close","project_open");
                
                let dbit = {
                    name:SPCValue,
                    color:"green"
                };
                controlDB.add(dbPName,dbit);
                
                let projectLi = document.createElement("li");
                
                projectLi.innerHTML = ` <div><span class='project_color'> </span><span class='project_name'> ${SPCValue}</span><span class='project_amount'> </span></div>`;
                projectUl.appendChild(projectLi);
            }
            //清除刚才输入的内容
            subPC[0].childNodes[0].nodeValue = "";
            
        });
        


    }
    function showProject(){
        var objectStore = db.transaction(dbPName).objectStore(dbPName);
        objectStore.openCursor().onsuccess = function(e) {
            let cursor = e.target.result;
            let projectUl = document.getElementById("project");
            if(cursor){

                cursor.continue();
                
                let projectLi = document.createElement("li");
                
                projectLi.innerHTML = ` <div><span class='project_color'> </span><span class='project_name'> ${cursor.value.name}</span><span class='project_amount'> </span></div>`;
                projectUl.appendChild(projectLi);
            }
        };
        

    }


    function main(){
        addProject();
        showProject();

    }
    addLoadEvent(main);
}());