        var ConfigYUIBase = "http://yui.yahooapis.com/2.7.0/build/";
        var ConfigUseMTAssets = true;
        var ConfigStripFormTags = true;
        var ConfigAutoHeight = true;
        var ConfigMarkupType = "xhtml";
        var ConfigYahooAppID = "nmX1J8TV34ErpYjds0Kk18_i9hCQM9OqtBoeuS6PYdSm0hm6d3L0xbRz6WZdsw--";

//Config file for MT YUI integration

function afterYUIInit() {
	//Function for your own customisations to YUI, called after load
	var YUIEditor = app.editor.myEditor;
	/*All the functions, objects, contructors etc of YUI are available by referencing YUIEditor e.g.:
	//YUIEditor.toolbar.addButtonToGroup({ type: 'push', label: 'Test Button', value: 'testbutton' }, 'insertitem')*/
};