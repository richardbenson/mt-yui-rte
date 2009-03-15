//Config file for MT YUI integration

//Set so that you can use a local copy of YUI for your build folder
var ConfigYUIBase = "http://yui.yahooapis.com/2.6.0/build/"; //Using Yahoo! servers
//var ConfigYUIBase = StaticURI + 'plugins/yui/'; //Local

//Set this to false to use the default YUI image loader
var ConfigUseMTAssets = true;

//true = remove form tags but leave contents, false = leave form tags alone
var ConfigStripFormTags = true;

//true makes the editor window automatically resize to fit content
var ConfigAutoHeight = true;

//Adjust the markup for the following types: semantic, css, default or xhtml
var ConfigMarkupType = "xhtml";

function afterYUIInit() {
	//Function for your own customisations to YUI, called after load
	var YUIEditor = app.editor.myEditor;
	/*All the functions, objects, contructors etc of YUI are available by referencing YUIEditor e.g.:
	//YUIEditor.toolbar.addButtonToGroup({ type: 'push', label: 'Test Button', value: 'testbutton' }, 'insertitem')*/
};