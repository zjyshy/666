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
            sta.remove(delContent);
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
    
    //定义数据库有关的内容
    //数据库名称
    const dbName = "Todoist";
    //存储空间名称
    const dbTName = "dbTask";
    const dbPName = "dbProject";//项目的存储空间名
    const dbPrioName = "dbpriority";//优先级存储空间名
    const dbTagName = "dbTag";//标签存储空间名
    // 数据库版本
    var version = 2;
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
       
        objectStoreT.createIndex("id","id",{
            unique : true
        }); //为task存储空间创建索引

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
        objectStoreP.createIndex("id","id",{
            unique : true
        }); //为project存储空间创建索引
        objectStoreP.createIndex("name","name");
        objectStoreP.createIndex("color","color");
        objectStoreP.createIndex("order","order");


        //创建存储标签的数据库
        //由于标签属于高级功能暂时不做

        var objectStorePriority = db.createObjectStore(dbPrioName,{

            keyPath:"id",
            autoIncrement: true
        });
        objectStorePriority.createIndex("id","id",{
            unique : true
        });

        


        //优先级功能暂时不考虑
       






    };  



    function main(){
       

    }
    addLoadEvent(main);
}());