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

RB.namespace("autotag");

RB.autotag = function() {
	var x = {
		addTag: function(i, el) {
			var elTags = YAHOO.util.Dom.get('tags');
			elTags.value += ", " + RB.autotag.tags[i];
			el.parentNode.removeChild(el);
		},
		
		//tags: [],
		
		handleResponse: function(o) {
			var messages =[];
			var strTags = "";
			messages = YAHOO.lang.JSON.parse(o.responseText);
			//alert(messages["ResultSet"]["Result"]);
			RB.autotag.tags = messages["ResultSet"]["Result"];
			for (var i=0, len=RB.autotag.tags.length; i<len; ++i) {
				strTags += "<a href='javascript:void(0)' onClick='RB.autotag.addTag(" + i + ", this);return false;'>" + RB.autotag.tags[i] + "<br /></a>";
			}
			var el = YAHOO.util.Dom.get('tag_results');
			el.innerHTML = "<p>" + strTags +"</p>";
		},
		
		callback: {
			success: function(o){
				RB.autotag.handleResponse(o);
			},
			failure: function(o){
				alert("Failed");
			}
		},
		
		generateTags: function() {
			//Get the text content out of the editor
			var myContent = app.editor.myEditor._getDoc().body.innerHTML.replace(/(<([^>]+))/ig,"");
		
			//Build our POST request
			var myPostData = "appid=" + app.editor.yahooAppID + "&content=" + escape(myContent);
		
			//Send the request to our proxy
			var myRequest = YAHOO.util.Connect.asyncRequest('POST', 'plugins/YUIEditor/php/proxy.php', RB.autotag.callback, myPostData);
		},
		
	    //The current status of the gutter (true is open)
	    status: false,
		
	    //Placeholder for the Overlay control
	    gutter: null,

	    createGutter: function() {
	        //Creating the Overlay
	        this.gutter = new YAHOO.widget.Overlay('gutter1', {
	            height: '435px',
	            width: '300px',
	            //Setting it the context of the Editor's container
	            context: [
	                app.editor.myEditor.get('element'),
	                'tl',
	                'tr'
	            ],
	            //Set the position
	            position: 'absolute',
	            //Hide by default
	            visible: false
	        });

	        this.gutter.hideEvent.subscribe(function() {
	            //Deselect the autotag button in the toolbar
	            app.editor.myEditor.toolbar.deselectButton('autotagentry');
	            Dom.setStyle('gutter1', 'visibility', 'visible');                
                Dom.setStyle('gutter1', 'visibility', 'hidden');
		    }, this, true);

	        this.gutter.showEvent.subscribe(function() {
	            //Select the autotag button in the toolbar
	            myEditor.toolbar.selectButton('autotagentry');
	            //Set the context of the panel (in case it was lost in the animation)
	            this.gutter.cfg.setProperty('context',[
	                myEditor.get('element'),
	                'tl',
	                'tr'
	            ]);
	        }, this, true);
	
	        //Set the body of the gutter to hold the HTML needed to render the autocomplete
	        this.gutter.setBody('<h2>Select Tags</h2><div id="tag_intro"><strong>Click a tag to add it to your entry</strong></div>'+
				'<div id="tag_results"><p>Retrieving tags...<p></div>');
	        this.gutter.render(document.body);
	    },
	    /*
	    * Open the gutter using Overlay's show method
	    */
	    open: function() {
	        this.gutter.show();
			this.generateTags();
	        this.status = true;
	    },
	    /*
	    * Close the gutter using Overlay's close method
	    */
	    close: function() {
	        this.gutter.hide();
	        this.status = false;
	    },
	    /*
	    * Check the state of the gutter and close it if it's open
	    * or open it if it's closed.
	    */
	    toggle: function() {
	        if (this.status) {
	            this.close();
	        } else {
	            this.open();
	        }
	    }
	}
	
	return x;
}();

MT.App.Editor = new Class( Object, {

	version: '1.3.1',
	
	useMTAssets: ConfigUseMTAssets,
	stripFormTags: ConfigStripFormTags,
	yahooAppID: ConfigYahooAppID,
	
    mode: "iframe",
    changed: false,
	initialised: false,
    
    init: function() {
		if (!MT.App.Editor.initialised) {
			MT.App.Editor.initialised = true;

			var full = false,
			defaults = {};
			
			this.myEditor = new YAHOO.widget.Editor('editor-content-textarea', {
				height: '350px',
				//width: '100%',
				dompath: true,
				animate: true,
				handleSubmit: false,
				focusAtStart: false,
				autoHeight: ConfigAutoHeight,
				collapse: false,
				draggable: false,
				markup: ConfigMarkupType
			});
			//this.myEditor._defaultToolbar.titlebar = false;
			
			editorRef = this.myEditor;
			
			//As MT puts all images in a form tag, we need to stop the editor from striping out
			//form tags.  There are two options here, either leave form tags in or remove the tags
			//and leave the contents.
			if (this.stripFormTags) {
				this.myEditor.invalidHTML.form = { keepContents: true };
			} else {
				delete this.myEditor.invalidHTML.form;
			}
			
			//HTML Editor and Image editor substitution
			var YUIDom = YAHOO.util.Dom,
			Event = YAHOO.util.Event;
	
			var useMTAssets = this.useMTAssets;
	
			this.myEditor.on('toolbarLoaded', function() {
				
				var state = "off";
				
				if (useMTAssets) {
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
					}, this, true);
				
					//We need to add another button to access MT's file asset as well as the image asset
					this.toolbar.addButtonToGroup({ type: 'push', label: 'Insert File', value: 'insertfile' }, 'insertitem');
					this.toolbar.on('insertfileClick', function() {
						var div = DOM.getElement( "editor-content-enclosure" );
						app.openDialog( "__mode=list_assets&amp;_type=asset&amp;edit_field=" + div.getAttribute( "edit-field" )
							+ "&amp;blog_id=" + div.getAttribute( "mt:blog-id" ) + "&amp;dialog_view=1" );
					}, this, true);
				};
				
				//Add auto tag button if a Yahoo! appid exists
				if (app.editor.yahooAppID) {
					this.toolbar.addSeparator();
					this.toolbar.addButtonGroup(
						{ group: 'autotag', label:'Tag',
							buttons: [
								{ type: 'push', label: 'Auto Tag', value: 'autotagentry'}
							]
						}
					);
							
					this.toolbar.on('autotagentryClick', function(){
						RB.autotag.toggle();
					}, this, true);
					
					RB.autotag.createGutter();
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
	
					if (state == 'on') {
						state = 'off';
						this.toolbar.set('disabled', false);
						this.setEditorHTML(ta.value);
						if (!this.browser.ie) {
							this._setDesignMode('on');
						}
						YUIDom.removeClass(iframe, 'editor-hidden');
						YUIDom.addClass(ta, 'editor-hidden');
						this.show();
						this._focusWindow();
					} else {
						state = 'on';
						this.cleanHTML();
						newHeight = this.get('element_cont').getStyle('height');
						YUIDom.addClass(iframe, 'editor-hidden');
						YUIDom.removeClass(ta, 'editor-hidden');
						this.toolbar.set('disabled', true);
						this.toolbar.getButtonByValue('editcode').set('disabled', false);
						this.toolbar.getButtonByValue('fullscreen').set('disabled', false);
						this.toolbar.selectButton('editcode');
						this.dompath.innerHTML = 'Editing HTML Code';
						this.hide();
						//YUIDom.setStyle('editor-content-textarea', 'height', '100%');
						//YUIDom.setStyle('editor-content-textarea', 'border', '0');
						//document.getElementById('editor-content-textarea').style.height = oldHeight;
					}
					return false;
				}, this, true);
				
				//Full Screen
				this.toolbar.on('fullscreenClick', function() {
					if (full === false) { 
						full = true; //Make it full screen 
						//this.toolbar.selectButton('fullscreen');
						this.set('autoHeight', false);
						this.get('element_cont').setStyle('zIndex', '99999'); //For Safari 
						this.get('element_cont').setStyle('position', 'absolute'); 
						this.get('element_cont').setStyle('top', '0px'); 
						this.get('element_cont').setStyle('left', '0px'); 
						this.get('element_cont').setStyle('width', YUIDom.getClientWidth() - 2 + 'px'); 
						this.get('element_cont').setStyle('height', YUIDom.getClientHeight() + 'px'); 
						YUIDom.setStyle('editor-content-enclosure', 'position', 'absolute');
						YUIDom.setStyle('editor-content-enclosure', 'top', '0px');
						YUIDom.setStyle('editor-content-enclosure', 'left', '0px');
						if (YAHOO.env.ua.ie) {YUIDom.setStyle('editor-content-enclosure', 'z-index', '99999')}; //For IE7
						YUIDom.setStyle(this.get('iframe').get('parentNode'), 'height', '100%'); 
						YUIDom.setStyle(this.get('element_cont').get('firstChild'), 'height', '89%');
					} else {
						full = false; //Make it normal again 
						//this.toolbar.deselectButton('fullscreen');
						YUIDom.setStyle('editor-content-enclosure', 'position', 'relative');
						YUIDom.setStyle('editor-content-enclosure', 'top', '');
						YUIDom.setStyle('editor-content-enclosure', 'left', '');
						this.get('element_cont').setStyle('position', 'static'); 
						this.get('element_cont').setStyle('top', ''); 
						this.get('element_cont').setStyle('left', ''); 
						this.get('element_cont').setStyle('width', '561px'); 
						this.get('element_cont').setStyle('height', ''); 
						if (YAHOO.env.ua.ie) {YUIDom.setStyle('editor-content-enclosure', 'z-index', '')}; //For IE7
						YUIDom.setStyle(this.get('iframe').get('parentNode'), 'height', defaults.height); 
						YUIDom.setStyle(this.get('element_cont').get('firstChild'), 'height', '');
						this.set('autoHeight', ConfigAutoHeight);
					} 
				}, this, true);
	
				this.on('cleanHTML', function(ev) {
					this.get('element').value = ev.html;
				}, this, true);
				
				this.on('afterRender', function() {
					var wrapper = this.get('editor_wrapper');
					wrapper.appendChild(this.get('element'));
					this.setStyle('width', '100%');
					this.setStyle('visibility', '');
					this.setStyle('top', '');
					this.setStyle('left', '');
					this.setStyle('position', '');
					this.addClass('editor-hidden');
					defaults.height = this.get('height'); 
					defaults.width = this.get('width');
				}, this, true);
				
	
			}, this.myEditor, true);
			
			//Adjust the MT div around the editor to match it's size
			this.myEditor.on('editorContentLoaded', function () {
				//clear the height of MT's div so that it will grow around the editor
				document.getElementById('editor-content-enclosure').style.height = '';
				//Run our config based additional options.
				//if (YAHOO.env.ua.ie) {
					//IE is weird, toolbar renders weird and fullscreen is buggy
					//editorRef.toolbar.collapse(true);
					//editorRef.toolbar.destroyButton('fullscreen');
				//}
				afterYUIInit();
			}, this.myEditor, true);
		
			//Render the thing at last
			this.myEditor.render();
			
		}
	},
	
    /* Called to save the content when the save button is pressed */
    autoSave: function( event ) {
        app.autoSave();    
        return false;
    },
	
    /* Toggle the editor mode */
    toggleMode: function() {
		var YUIDom = YAHOO.util.Dom
		
		var ta = this.myEditor.get('element'),
		iframe = this.myEditor.get('iframe').get('element');

		if (this.mode == 'iframe') {
            this.mode = 'textarea';
            this.myEditor.saveHTML();
            var stripHTML = /<\S[^><]*>/g;
            this.myEditor.get('textarea').value = this.myEditor.get('textarea').value.replace(/<br>/gi, '\n').replace(stripHTML, '');
			YUIDom.addClass(iframe, 'editor-hidden');
			YUIDom.removeClass(ta, 'editor-hidden');
			this.myEditor.toolbar.set('disabled', true);
			this.myEditor.dompath.innerHTML = 'RTE Disabled';
        } else {
            this.mode = 'iframe';
			YUIDom.removeClass(iframe, 'editor-hidden');
			YUIDom.addClass(ta, 'editor-hidden');
			this.myEditor.toolbar.set('disabled', false);
            this.myEditor._setDesignMode('on');
            this.myEditor.setEditorHTML(this.myEditor.get('textarea').value.replace(/\n/g, '<br>'));
        }
    },
	
	/* Set the editor mode ( textarea | iframe ) between plain and rich text */
    setMode: function( mode ) {
        if ( this.mode == mode )
            return;
        this.toggleMode();
    },

    focus: function() {
        this.myEditor._focusWindow();
    },

    /* Clear the dirty flag on the editor ( dirty == modified ) */
    clearDirty: function() {
		this.myEditor.editorDirty = false;
    },

    /* Check the dirty status */
    isDirty: function() {
        return this.myEditor.editorDirty;
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
        return this.myEditor.getEditorHTML();
    },
    
    
    /* Get the editor content as xhtml ( if possible, else return html ) */
    getXHTML: function() {
        return this.myEditor.getEditorHTML();
    },

    
    /* Set the html content of the editor */
    setHTML: function() {
        return this.myEditor.setEditorHTML( arguments[0] );
    },

    
    /* Insert html into the editor, the editor should insert it at the cursor */
    insertHTML: function(strHTML) {
		this.myEditor.execCommand('inserthtml', strHTML);
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