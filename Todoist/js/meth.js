
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
//8月10日修改：成功的解决了添加class数量不确定的问题
var changeClass = {
 add: function(target){
		
  //函数中的arguments可以接受所有参数并把它存在一个类数组对象中，需要将它转换成一个数组
  var args = Array.prototype.slice.call(arguments);
  let element = target.getAttribute("class");
  if(element){
   
   //这里之所以slice(1)这里的1的意思是从数组的第二个元素到最后面，因为第一个是目标元素，后面的参数才是我所需要添加的class
   target.setAttribute("class", element +" "+ args.slice(1).join(" "));

  }
  else target.setAttribute("class", args.slice(1).join(" "));
		
 },
 del: function(element, target){
  //利用了正则表达式，将所有的class存入数组
  let sta = element.getAttribute("class").split(/[\s]/);
  //数组对象并没有提供这个remove方法
  sta.remove(target);
  //join将数组按照规则分割，这里是按照空格
  element.setAttribute("class", sta.join(" "));
		
 },
 cha: function(element, target, newClass){
  let sta = element.getAttribute("class").split(/[\s]/);
  sta.remove(target);
  sta.push(newClass);
  element.setAttribute("class", `${sta.join(" ")}`);
 }

};