function LoadYUI() {
	
	//Load the YUI CSS
	document.write(unescape("%3Clink rel='stylesheet' href='" + ConfigYUIBase + "assets/skins/sam/skin.css' type='text/css'%3E"));
	
	//Utility dependencies
	document.write(unescape("%3Cscript src='" + ConfigYUIBase + "yahoo-dom-event/yahoo-dom-event.js' type='text/javascript'%3E%3C/script%3E"));
	document.write(unescape("%3Cscript src='" + ConfigYUIBase + "element/element-min.js' type='text/javascript'%3E%3C/script%3E"));
	//Needed for Menus, Buttons and Overlays used in the Toolbar
	document.write(unescape("%3Cscript src='" + ConfigYUIBase + "container/container_core-min.js' type='text/javascript'%3E%3C/script%3E"));
	document.write(unescape("%3Cscript src='" + ConfigYUIBase + "menu/menu-min.js' type='text/javascript'%3E%3C/script%3E"));
	document.write(unescape("%3Cscript src='" + ConfigYUIBase + "button/button-min.js' type='text/javascript'%3E%3C/script%3E"));
	//Source file for Rich Text Editor
	document.write(unescape("%3Cscript src='" + ConfigYUIBase + "editor/editor-min.js' type='text/javascript'%3E%3C/script%3E"));

};