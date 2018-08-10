//这个文件主要是用来控制数据的。
( function DataLeakPrevention() {
	//当想要修改class的时候可以使用它
//8月10日修改：成功的解决了添加class数量不确定的问题
	var changeClass = {
		add: function(target){
			
			//函数中的arguments可以接受所有参数并把它存在一个类数组对象中，需要将它转换成一个数组
			var args = Array.prototype.slice.call(arguments);
			let element = target[0].getAttribute("class");
			//这里之所以slice(1)这里的1的意思是从数组的第二个元素到最后面，因为第一个是目标元素，后面的参数才是我所需要添加的class
			target[0].setAttribute("class", element + args.slice(1).join(" "));
		
			
		},
		del: function(element, target){
			//利用了正则表达式，将所有的class存入数组
			let sta = element[0].getAttribute("class").split(/[\s]/);
			//数组对象并没有提供这个remove方法
			sta.remove(target);
			//join将数组按照规则分割，这里是按照空格
			element[0].setAttribute("class", `${sta.join(" ")}`);
			
		},
		cha: function(element, target, newClass){
			let sta = element[0].getAttribute("class").split(/[\s]/);
			sta.remove(target);
			sta.push(newClass);
			element[0].setAttribute("class", `${sta.join(" ")}`);
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
	function addProject(){
		//添加项目元素名
		let addPro = document.getElementsByClassName("add_p");
		let addPN = document.getElementsByClassName("add_project_name");//通过更改它控制添加页面和添加按钮的出现
		let SubPN = document.getElementsByClassName("sub_project_no");       //取消按钮
		let subPY = document.getElementsByClassName("sub_project_yes");//添加项目按钮
		let subPC = document.getElementsByClassName("sub_project_content");//通过设置contenteditable变成可以输入内容的
		let projectUl = document.getElementById("project");
			
		//点击转到输入项目的位置
		addPro[0].addEventListener("click", () =>{
			changeClass.cha(addPN, "project_open", "project_close");
			subPC[0].focus();
		
		});
		//点击转回添加项目
		SubPN[0].addEventListener("click", () =>{
			changeClass.cha(addPN, "project_close", "project_open");
		});
		//点击了添加项目按钮后
		subPY[0].addEventListener("click", () => {
			let SPCValue = subPC[0].childNodes[0].nodeValue;

			if(SPCValue.match(/^[ ]+$/)){
				changeClass.cha(addPN, "project_close", "project_open");
			}else{
				changeClass.cha(addPN, "project_close", "project_open");
                
				let dbit = {
					name: SPCValue,
					color: "green"
				};
				controlDB.add(dbPName, dbit);
                
				let projectLi = document.createElement("li");
                
				projectLi.innerHTML = ` <div><span class='project_color'> </span><span class='project_name'> ${SPCValue}</span><span class='project_amount'> </span><img src="img/holder.gif"></div>`;
				projectUl.appendChild(projectLi);
			}
			//清除刚才输入的内容
			subPC[0].childNodes[0].nodeValue = "";
			//不添加这个函数，新添加的项目将会无法删除。
			showProject();
            
		});
        


	}
	//利用游标遍历每一个项目，获取每一个项目的名字和id 获取id的目的是为了防止重名时候发生冲突
	function showProject(){
		var objectStore = db.transaction(dbPName).objectStore(dbPName);
		let delP = document.getElementsByClassName("de");
		let deID = document.getElementsByClassName("delete_id");
		let projectUl = document.getElementById("project");
		projectUl.innerHTML = " ";
		objectStore.openCursor().onsuccess = function(e) {
			let cursor = e.target.result;
			
			if(cursor){
				let projectLi = document.createElement("li");
                
				projectLi.innerHTML = ` <div><span class='project_color'> </span><span class='project_name'> ${cursor.value.name}</span><span class='project_amount'> </span></div> <span class = "delete_id" style = "display:none">${cursor.value.id}</span><img class = "de" src="img/holder.gif">`;
				projectUl.appendChild(projectLi);
				
				
				
				cursor.continue();
			}else{
				for(let i = 0;i<deID.length;i++){

					delP[i].addEventListener("click", ()=>{
						
						console.log( deID[i].childNodes[0].nodeValue);
						//这里必须将字符串转换成数字！！！！
						controlDB.del(dbPName, parseInt(deID[i].childNodes[0].nodeValue));
						showProject();
						
					});
	
				}
			
			}
			
			
		
			
		};
		

	}
	

	function main(){

		addProject();
		showProject();
	}
	addLoadEvent(main);
}());