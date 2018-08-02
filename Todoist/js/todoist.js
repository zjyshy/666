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

    
    //定义数据库有关的内容
    //数据库名称
    const dbName = "Todoist";
    //存储空间名称
    const dbTName = "dbTask";
    const dbPName = "dbProject";
    // 数据库版本
    var version = 1;
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
        //为task存储空间创建索引
        objectStoreT.createIndex("id","id",{
            unique : true
        });

        objectStoreT.createIndex("priority","priority");
        objectStoreT.createIndex("date","date");
        objectStoreT.createIndex("project","project");
        objectStoreT.createIndex("content","content");
        objectStoreT.createIndex("order","order");
        objectStoreT.createIndex("hide","hide");

        //创建存储项目的数据库 
        var objectStoreP = db.createObjectStore(dbPName,{
            keyPath: "id",
            autoIncrement: true
        });
        //为project存储空间创建索引
        objectStoreP.createIndex("id","id",{
            unique : true
        });
        //为项目和优先级以及标签创建
        objectStoreP.createIndex("pro","pro");
        objectStoreP.createIndex("prio","prio");
        objectStoreP.createIndex("tag","tag");




    };  



    function main(){


    }
    addLoadEvent(main);
}());