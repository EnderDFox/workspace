!function(e){e.extend({cookie:function(n,t){var o={duration:30,name:null,value:""};if("undefined"==typeof t)var t=o;return t=e.extend(o,t),"undefined"==typeof n?(console.log("Cookie jQuery plugin: Missing method name"),!1):null==t.name||0==t.name.length?(console.log("Cookie jQuery plugin: Missing cookie name"),!1):(this.get=function(e){for(var n=e.name+"=",t=document.cookie.split(";"),o=0;o<t.length;o++){for(var i=t[o];" "==i.charAt(0);)i=i.substring(1,i.length);if(0==i.indexOf(n))return i.substring(n.length,i.length)}return null},this.set=function(e){if(e.duration){var n=new Date;n.setTime(n.getTime()+864e5*e.duration);var t="; expires="+n.toGMTString()}else var t="";return document.cookie=e.name+"="+e.value+t+"; path=/",!0},this["delete"]=function(n){return e.cookie("set",{name:n.name,duration:-1,value:""}),!0},this.exist=function(n){return null==e.cookie("get",{name:n.name})?!1:!0},"function"==typeof this[n]?this[n](t):(console.log("Cookie jQuery plugin: Unrecognized method: "+n),!1))}})}(jQuery);