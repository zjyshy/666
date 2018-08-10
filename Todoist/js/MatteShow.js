(function I(){

	//当想要修改class的时候可以使用它
//8月10日修改：成功的解决了添加class数量不确定的问题
	var flags = 0;
	let flag = 0;
	var changeClass = {
		add: function(target){
        
			//函数中的arguments可以接受所有参数并把它存在一个类数组对象中，需要将它转换成一个数组
			var args = Array.prototype.slice.call(arguments);
			let element = target[0].getAttribute("class");
			//这里之所以slice(1)这里的1的意思是从数组的第二个元素到最后面，因为第一个是目标元素，后面的参数才是我所需要添加的class
			target[0].setAttribute("class", element +" "+ args.slice(1).join(" "));		
		},
		del: function(classContent, delContent){
			//利用了正则表达式，将所有的class存入数组
			let sta = classContent[0].getAttribute("class").split(/[\s]/);
			//数组对象并没有提供这个remove方法
			sta.remove(delContent);
			//join将数组按照规则分割，这里是按照空格
			classContent[0].setAttribute("class", `${sta.join(" ")}`);
			
		},
		cha: function(element, targetClass, resultClass){
			let sta = element[0].getAttribute("class").split(/[\s]/);
			sta.remove(targetClass);
			sta.push(resultClass);
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
		const MHS = document.getElementsByClassName("left_menu_show");
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
		if(AHW <= 750&& flags == 0){
			
			changeClass.add(top, "small");		
			//flags的作用是防止每一次宽度变化都会添加一个small
			flags = 1;
			
		}else if(AHW > 750 && flags==1){
			changeClass.del(top, "small");
			flags = 0;
			//为了防止宽度大于750后叉号不会变回去
			changeClass.cha(MHS, "menu_appear", "menu_hide");
			changeClass.del(top, "click");

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
		MContent.style = `height:${RCH}px;`;
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
	//左侧菜单每个标签点击后变色
	function menuContent(){
		//每个id都有对应的css属性，选中谁，
		const menuTopMain = document.getElementsByClassName("menu_top_main");
		//分别是收件箱、今天以及未来七天
		const menuCo = document.getElementsByClassName("menu_content");
		for(let i = 0; i < 3; i++){
			//点击谁就将容器的id改成与其相对应的
			menuCo[i].onclick = function(){

				menuTopMain[0].setAttribute("id", `menu_top_main${i}`);
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
		const MHS = document.getElementsByClassName("left_menu_show");
		const appB = document.getElementsByClassName("app_background");
		const shutter = document.getElementsByClassName("shutter");
		LMH[0].addEventListener("click", () =>{
			if(flag == 0){
				changeClass.cha(MHS, "menu_hide", "menu_appear");
				changeClass.add(appB, "click");
				flag = 1;

			}
			else{
				changeClass.cha(MHS, "menu_appear", "menu_hide");
				changeClass.del(appB, "click");
				flag = 0;
			}
			shutter[0].addEventListener("click", ()=>{
				changeClass.cha(MHS, "menu_appear", "menu_hide");
				changeClass.del(appB, "click");
				flag = 0;
			});
		});
		

	}
	function main(){
		contentAndLeftH();
		appBodyAndTopM();
		resize();
		QFChange();
		menuContent();
		menuExpand();
		clickToplogo();

	}
	addLoadEvent(main);
}());

