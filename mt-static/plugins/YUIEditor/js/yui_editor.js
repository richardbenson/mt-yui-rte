// Create root object if it doesn't exist
if (typeof RB == "undefined" || !RB) {
    var RB = {};
}

// Function to aid in making new namespaces
RB.namespace = function() {
    var a=arguments, o=null, i, j, d;
    for (i=0; i<a.length; i=i+1) {
        d=a[i].split(".");
        o=RB;

        // RB is implied, so it is ignored if it is included
        for (j=(d[0] == "RB") ? 1 : 0; j<d.length; j=j+1) {
            o[d[j]]=o[d[j]] || {};
            o=o[d[j]];
        }
    }

    return o;
}

RB.D = YAHOO.util.Dom;
RB.E = YAHOO.util.Event;

RB.namespace("RTE");
RB.namespace("RTE.autotag");

RB.RTE = {
	
	version: "1.4",
	
	useMTAssets: ConfigUseMTAssets,
	stripFormTags: ConfigStripFormTags,
	yahooAppID: ConfigYahooAppID,
	autoHeight: ConfigAutoHeight,
	markupType: ConfigMarkupType,
	
	full: false,
	defaults: {},
	state: "off",

	init: function() {
		this.editor = new YAHOO.widget.Editor('editor-content-textarea', {
			height: '300px',
			width: '577px',
			dompath: true,
			animate: true,
			handleSubmit: false,
			focusAtStart: false,
			autoHeight: this.autoHeight,
			markup: this.markupType
		});
		this.editor._defaultToolbar.titlebar = false;

		//As MT puts all images in a form tag, we need to stop the editor from striping out
		//form tags.  There are two options here, either leave form tags in or remove the tags
		//and leave the contents.
		if (this.stripFormTags) {
			this.editor.invalidHTML.form = { keepContents: true };
		} else {
			delete this.editor.invalidHTML.form;
		}
		
		//Generate our custom toolbar additions
		this.editor.on('toolbarLoaded', function() {
			
			//Replace the YUI Image selector with MT's if the user wants that
			if (RB.RTE.useMTAssets) {
				//Add a listener to tack into MT's image asset control
				this.toolbar.on('insertimageClick', function() {
					//Get the selected element
					var _sel = this._getSelectedElement();
					//If the selected element is an image, do the normal thing so they can manipulate the image
					if (_sel && _sel.tagName && (_sel.tagName.toLowerCase() == 'img')) {
						//Do the normal thing here..
					} else {
						//They don't have a selected image, open MT's default asset interface
						var div = DOM.getElement( "editor-content-enclosure" );
						app.openDialog( "__mode=list_assets&amp;_type=asset&amp;edit_field=" + div.getAttribute( "edit-field" )
							+ "&amp;blog_id=" + div.getAttribute( "mt:blog-id" ) + "&amp;dialog_view=1&amp;filter=class&amp;filter_val=image" );
						//This is important.. Return false here to not fire the rest of the listeners
						return false;
					}
				}, RB.RTE.editor, true);
			
				//We need to add another button to access MT's file asset as well as the image asset
				this.toolbar.addButtonToGroup({ type: 'push', label: 'Insert File', value: 'insertfile' }, 'insertitem');
				this.toolbar.on('insertfileClick', function() {
					var div = DOM.getElement( "editor-content-enclosure" );
					app.openDialog( "__mode=list_assets&amp;_type=asset&amp;edit_field=" + div.getAttribute( "edit-field" )
						+ "&amp;blog_id=" + div.getAttribute( "mt:blog-id" ) + "&amp;dialog_view=1" );
				}, RB.RTE.editor, true);
			};

			//Add auto tag button if a Yahoo! appid exists
			if (RB.RTE.yahooAppID) {
				this.toolbar.addSeparator();
				this.toolbar.addButtonGroup(
					{ group: 'autotag', label:'Tag',
						buttons: [
							{ type: 'push', label: 'Auto Tag', value: 'autotagentry'}
						]
					}
				);
						
				this.toolbar.on('autotagentryClick', function(){
					RB.RTE.autotag.toggle();
				}, this, true);
				
				RB.RTE.autotag.createGutter();
			};

			//Add our view group to the toolbar
			this.toolbar.addSeparator();
			this.toolbar.addButtonGroup(
				{ group: 'viewmenu', label: 'View',
					buttons: [
						{ type: 'push', label: 'Edit HTML Code', value: 'editcode' },
						{ type: 'push', label: 'View Full Screen', value: 'fullscreen' }
					]
				}
			);
			
			//HTML Editor
			this.toolbar.on('editcodeClick', function() {
				var ta = this.get('element'),
					iframe = this.get('iframe').get('element');

				if (RB.RTE.state == 'on') {
					RB.RTE.state = 'off';
					this.toolbar.set('disabled', false);
					this.setEditorHTML(ta.value);
					if (!this.browser.ie) {
						this._setDesignMode('on');
					}
					RB.D.removeClass(iframe, 'editor-hidden');
					RB.D.addClass(ta, 'editor-hidden');
					this.show();
					this._focusWindow();
				} else {
					RB.RTE.state = 'on';
					this.cleanHTML();
					newHeight = this.get('element_cont').getStyle('height');
					RB.D.addClass(iframe, 'editor-hidden');
					RB.D.removeClass(ta, 'editor-hidden');
					this.toolbar.set('disabled', true);
					this.toolbar.getButtonByValue('editcode').set('disabled', false);
					this.toolbar.getButtonByValue('fullscreen').set('disabled', false);
					this.toolbar.selectButton('editcode');
					this.dompath.innerHTML = 'Editing HTML Code';
					this.hide();
					//RB.D.setStyle('editor-content-textarea', 'height', '100%');
					//RB.D.setStyle('editor-content-textarea', 'border', '0');
					//document.getElementById('editor-content-textarea').style.height = oldHeight;
				}
				return false;
			}, this, true);

			//Full Screen
			this.toolbar.on('fullscreenClick', function() {
				if (RB.RTE.full === false) { 
					RB.RTE.full = true; //Make it full screen 
					RB.RTE.editor.toolbar.selectButton('fullscreen');
					RB.RTE.editor.set('autoHeight', false);
					//RB.D.setStyle('editor-content-enclosure', 'position', 'absolute');
					//RB.D.setStyle('editor-content-enclosure', 'top', '0px');
					//RB.D.setStyle('editor-content-enclosure', 'left', '0px');
					RB.D.setStyle('editor-content-enclosure', 'z-index', '99999');
					this.get('element_cont').setStyle('zIndex', '99999'); //For Safari 
					this.get('element_cont').setStyle('position', 'absolute'); 
					this.get('element_cont').setStyle('top', '0'); 
					this.get('element_cont').setStyle('left', '0'); 
					this.get('element_cont').setStyle('width', (RB.D.getClientWidth() - 2) + 'px'); 
					this.get('element_cont').setStyle('height', RB.D.getClientHeight() + 'px'); 
					RB.D.setStyle(this.get('iframe').get('parentNode'), 'height', '100%'); 
					RB.D.setStyle(RB.D.getNextSibling(this.get('element_cont').get('firstChild')), 'height', '91%');
					//YUI's dialogs won't show without this
					RB.D.setStyle(this.get('element_cont').get('firstChild'), 'z-index', '99999');
				} else {
					RB.RTE.full = false; //Make it normal again 
					RB.RTE.editor.toolbar.deselectButton('fullscreen');
					//RB.D.setStyle('editor-content-enclosure', 'position', 'relative');
					//RB.D.setStyle('editor-content-enclosure', 'top', '');
					//RB.D.setStyle('editor-content-enclosure', 'left', '');
					this.get('element_cont').setStyle('position', 'static'); 
					this.get('element_cont').setStyle('top', ''); 
					this.get('element_cont').setStyle('left', ''); 
					this.get('element_cont').setStyle('width', RB.RTE.defaults.width); 
					this.get('element_cont').setStyle('height', ''); 
					//RB.D.setStyle('editor-content-enclosure', 'z-index', ''); //For IE7
					RB.D.setStyle(this.get('iframe').get('parentNode'), 'height', RB.RTE.defaults.height); 
					RB.D.setStyle(RB.D.getNextSibling(this.get('element_cont').get('firstChild')), 'height', '');
					RB.RTE.editor.set('autoHeight', RB.RTE.autoHeight);
				} 
			}, RB.RTE.editor, true);

			this.on('cleanHTML', function(ev) {
				this.get('element').value = ev.html;
			}, RB.RTE.editor, true);
			
			this.on('afterRender', function() {
				var wrapper = this.get('editor_wrapper');
				wrapper.appendChild(this.get('element'));
				this.setStyle('width', '100%');
				this.setStyle('visibility', '');
				this.setStyle('top', '');
				this.setStyle('left', '');
				this.setStyle('position', '');
				this.addClass('editor-hidden');
				RB.RTE.defaults.height = this.get('height'); 
	            RB.RTE.defaults.width = this.get('width');
			}, RB.RTE.editor, true);

		});


		//Adjust the MT div around the editor to match it's size
		RB.RTE.editor.on('editorContentLoaded', function () {
			//clear the height of MT's div so that it will grow around the editor
			document.getElementById('editor-content-enclosure').style.height = '';
			//Run our config based additional options.
			//if (YAHOO.env.ua.ie) {
				//IE is weird, toolbar renders weird and fullscreen is buggy
				//editorRef.toolbar.collapse(true);
				//editorRef.toolbar.destroyButton('fullscreen');
			//}
			afterYUIInit();
		}, RB.RTE.editor, true);
	
		//Render the thing at last
		RB.RTE.editor.render();

	}

}

RB.RTE.autotag = {
	
	addTag: function(i, el) {
		var elTags = RB.D.get('tags');
		elTags.value += ", " + RB.RTE.autotag.tags[i];
		el.parentNode.removeChild(el);
	},
	
	//tags: [],
	
	handleResponse: function(o) {
		var messages =[];
		var strTags = "";
		messages = YAHOO.lang.JSON.parse(o.responseText);
		//alert(messages["ResultSet"]["Result"]);
		RB.RTE.autotag.tags = messages["ResultSet"]["Result"];
		for (var i=0, len=RB.RTE.autotag.tags.length; i<len; ++i) {
			strTags += "<a href='javascript:void(0)' onClick='RB.RTE.autotag.addTag(" + i + ", this);return false;'>" + RB.RTE.autotag.tags[i] + "<br /></a>";
		}
		var el = RB.D.get('tag_results');
		el.innerHTML = "<p>" + strTags +"</p>";
	},
	
	callback: {
		success: function(o){
			RB.RTE.autotag.handleResponse(o);
		},
		failure: function(o){
			alert("Failed");
		}
	},
	
	generateTags: function() {
		//Get the text content out of the editor
		var myContent = RB.RTE.editor._getDoc().body.innerHTML.replace(/(<([^>]+))/ig,"");
	
		//Build our POST request
		var myPostData = "appid=" + RB.RTE.editor.yahooAppID + "&content=" + escape(myContent);
	
		//Send the request to our proxy
		var myRequest = YAHOO.util.Connect.asyncRequest('POST', 'plugins/YUIEditor/php/proxy.php', RB.RTE.autotag.callback, myPostData);
	},
	
	//The current status of the gutter (true is open)
	status: false,
	
	//Placeholder for the Overlay control
	gutter: null,

	createGutter: function() {
		//Creating the Overlay
		RB.RTE.autotag.gutter = new YAHOO.widget.Overlay('gutter1', {
			height: '435px',
			width: '300px',
			//Setting it the context of the Editor's container
			context: [
				RB.RTE.editor.get('element'),
				'tl',
				'tr'
			],
			//Set the position
			position: 'absolute',
			//Hide by default
			visible: false
		});

		RB.RTE.autotag.gutter.hideEvent.subscribe(function() {
			//Deselect the autotag button in the toolbar
			RB.RTE.editor.toolbar.deselectButton('autotagentry');
			RB.D.setStyle('gutter1', 'visibility', 'visible');                
			RB.D.setStyle('gutter1', 'visibility', 'hidden');
		}, this, true);

		RB.RTE.autotag.gutter.showEvent.subscribe(function() {
			//Select the autotag button in the toolbar
			RB.RTE.editor.toolbar.selectButton('autotagentry');
			//Set the context of the panel (in case it was lost in the animation)
			//RB.RTE.autotag.gutter.cfg.setProperty('context',[
			//	RB.RTE.editor.get('element'),
			//	'tl',
			//	'tr'
			//]);
		}, this, true);

		//Set the body of the gutter to hold the HTML needed to render the autocomplete
		RB.RTE.autotag.gutter.setBody('<h2>Select Tags</h2><div id="tag_intro"><strong>Click a tag to add it to your entry</strong></div>'+
			'<div id="tag_results"><p>Retrieving tags...<p></div>');
		RB.RTE.autotag.gutter.render(document.body);
	},
	/*
	* Open the gutter using Overlay's show method
	*/
	open: function() {
		RB.RTE.autotag.gutter.show();
		RB.RTE.autotag.generateTags();
		RB.RTE.autotag.status = true;
	},
	/*
	* Close the gutter using Overlay's close method
	*/
	close: function() {
		RB.RTE.autotag.gutter.hide();
		RB.RTE.autotag.status = false;
	},
	/*
	* Check the state of the gutter and close it if it's open
	* or open it if it's closed.
	*/
	toggle: function() {
		if (RB.RTE.autotag.status) {
			RB.RTE.autotag.close();
		} else {
			RB.RTE.autotag.open();
		}
	}

}

MT.App.Editor = new Class( Object, {
	
    mode: "iframe",
    changed: false,
    
    init: function() {
		
		RB.RTE.init();
		
	},
	
    /* Called to save the content when the save button is pressed */
    autoSave: function( event ) {
        app.autoSave();    
        return false;
    },
	
    /* Toggle the editor mode */
    toggleMode: function() {
		
		var ta = RB.RTE.editor.get('element'),
		iframe = RB.RTE.editor.get('iframe').get('element');

		if (this.mode == 'iframe') {
            this.mode = 'textarea';
            RB.RTE.editor.saveHTML();
            var stripHTML = /<\S[^><]*>/g;
            RB.RTE.editor.get('textarea').value = RB.RTE.editor.get('textarea').value.replace(/<br>/gi, '\n').replace(stripHTML, '');
			RB.D.addClass(iframe, 'editor-hidden');
			RB.D.removeClass(ta, 'editor-hidden');
			RB.RTE.editor.toolbar.set('disabled', true);
			RB.RTE.editor.dompath.innerHTML = 'RTE Disabled';
        } else {
            this.mode = 'iframe';
			RB.D.removeClass(iframe, 'editor-hidden');
			RB.D.addClass(ta, 'editor-hidden');
			RB.RTE.editor.toolbar.set('disabled', false);
            RB.RTE.editor._setDesignMode('on');
            RB.RTE.editor.setEditorHTML(RB.RTE.editor.get('textarea').value.replace(/\n/g, '<br>'));
        }
    },
	
	/* Set the editor mode ( textarea | iframe ) between plain and rich text */
    setMode: function( mode ) {
        if ( this.mode == mode )
            return;
        this.toggleMode();
    },

    focus: function() {
        RB.RTE.editor._focusWindow();
    },

    /* Clear the dirty flag on the editor ( dirty == modified ) */
    clearDirty: function() {
		RB.RTE.editor.editorDirty = false;
    },

    /* Check the dirty status */
    isDirty: function() {
        return RB.RTE.editor.editorDirty;
    },

    /* Called to set the dirty bit on the editor and call */
    setChanged: function() {
        this.changed = true;
        app.setDirty();
    },

	/* Proxy for the editor */
    //execCommand: function( command, userInterface, argument ) {
    //    this.setChanged();
    //    return this.fck.execCommand( command, userInterface, argument );
    //},

    /* Get the editor content as html/xhtml */
    getHTML: function() {
        return RB.RTE.editor.getEditorHTML();
    },
    
    
    /* Get the editor content as xhtml ( if possible, else return html ) */
    getXHTML: function() {
        return RB.RTE.editor.getEditorHTML();
    },

    
    /* Set the html content of the editor */
    setHTML: function() {
        return RB.RTE.editor.setEditorHTML( arguments[0] );
    },

    
    /* Insert html into the editor, the editor should insert it at the cursor */
    insertHTML: function(strHTML) {
		RB.RTE.editor.execCommand('inserthtml', strHTML);
    }

} );


App.singletonConstructor =
MT.App = new Class( MT.App, {


    /* set up the editor instance, and get the body, and extended fields */
    initEditor: function() {
        var mode = DOM.getElement( "convert_breaks" );
        DOM.addEventListener( mode, "change", this.getIndirectEventListener( "setTextareaMode" ) );

        this.editor = new this.constructor.Editor();
        this.editorInput = {
            content: DOM.getElement( "editor-input-content" ),
            extended: DOM.getElement( "editor-input-extended" )
        };
    },

    /* Called to fix the html in the editor before a save, or an insert.
     * inserted will be defined if called to fix inserted text
     */
    fixHTML: function( inserted ) { },
    

    /* called to switch the editor text between 'content' and 'extended' */
    setEditor: function( name ) {
		this.saveHTML( false );
        this.currentEditor = name;
        this.editor.setHTML( this.editorInput[ this.currentEditor ].value );
    },
	
	insertHTML: function() {
		this.editor.insertHTML(arguments[0]);
	},


    /* This is called when the user leaves the page
     * if the text in the editor has changed ( isDirty ) then
     * return text that will be used in a javascript confirm()
     */
    eventBeforeUnload: function( event ) {
        if ( this.editor.isDirty() )
            this.changed = true;
        if ( this.changed ) {
            if ( this.constructor.Editor )
                return event.returnValue = Editor.strings.unsavedChanges;
            else if ( window.Editor )
                return event.returnValue = window.Editor.strings.unsavedChanges;
        }
        
        return undefined;
    },


    /* This clears the editor's dirty flag */
    clearDirty: function() {
        this.editor.clearDirty();
        return arguments.callee.applySuper( this, arguments );
    },


    /* Called to set the editor html and switch to rich text */
    setEditorIframeHTML: function() {
        this.editor.setHTML( this.editorInput[ app.currentEditor ].value );
        this.editor.setMode( "iframe" );
        this.editor.focus();
    },

    /* Called to set the editor to non rich text mode */
    setTextareaMode: function( event ) {
        this.editor.setMode( "textarea" );
    }


} );