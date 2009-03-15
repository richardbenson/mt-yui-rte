
MT.App.Editor = new Class( Object, {

	version: '0.9.7',
	
	useMTAssets: ConfigUseMTAssets,
	stripFormTags: ConfigStripFormTags,
	
    mode: "iframe",
    changed: false,
    
    init: function() {
		this.myEditor = new YAHOO.widget.Editor('editor-content-textarea', {
			height: '300px',
			width: '100%',
			dompath: true,
			animate: true,
			handleSubmit: false,
			focusAtStart: false,
			autoHeight: ConfigAutoHeight,
			collapse: false,
			draggable: false
		});
		this.myEditor._defaultToolbar.titlebar = false;
		
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
			var codeConfig = {
				type: 'push', label: 'Edit HTML Code', value: 'editcode'
			};
			YAHOO.log('Create the (editcode) Button', 'info', 'example');
			this.toolbar.addButtonToGroup(codeConfig, 'insertitem');
			
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
						//They don't have a selected image, open the image browser window
						var div = DOM.getElement( "editor-content-enclosure" );
						app.openDialog( "__mode=list_assets&amp;_type=asset&amp;edit_field=" + div.getAttribute( "edit-field" )
							+ "&amp;blog_id=" + div.getAttribute( "mt:blog-id" ) + "&amp;dialog_view=1&amp;filter=class&amp;filter_val=image" );
						//This is important.. Return false here to not fire the rest of the listeners
						return false;
					}
				}, this, true);
			};

			this.toolbar.on('editcodeClick', function() {
				var ta = this.get('element'),
					iframe = this.get('iframe').get('element');

				if (state == 'on') {
					state = 'off';
					this.toolbar.set('disabled', false);
					//YAHOO.log('Show the Editor', 'info', 'example');
					//YAHOO.log('Inject the HTML from the textarea into the editor', 'info', 'example');
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
					//YAHOO.log('Show the Code Editor', 'info', 'example');
					this.cleanHTML();
					//YAHOO.log('Save the Editors HTML', 'info', 'example');
					YUIDom.addClass(iframe, 'editor-hidden');
					YUIDom.removeClass(ta, 'editor-hidden');
					this.toolbar.set('disabled', true);
					this.toolbar.getButtonByValue('editcode').set('disabled', false);
					this.toolbar.selectButton('editcode');
					this.dompath.innerHTML = 'Editing HTML Code';
					this.hide();
				}
				return false;
			}, this, true);

			this.on('cleanHTML', function(ev) {
				YAHOO.log('cleanHTML callback fired..', 'info', 'example');
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
			}, this, true);
			

		}, this.myEditor, true);
		
		//Adjust the MT div around the editor to match it's size
		this.myEditor.on('editorContentLoaded', function () {
			this.on('heightChange', document.getElementById('editor-content-enclosure').style.height = document.getElementById('editor-content-textarea_container').style.height);
		}, this.myEditor, true);
	
		//Render the thing
		this.myEditor.render();
		
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
        this.editor.setHTML( this.myEditorInput[ this.currentEditor ].value );
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