YUI Editor for Movabletype 4.x
v1.0
-------------------------------
Developed by Richard Benson
http://www.richardbenson.co.uk/
-------------------------------

To install:

1) Copy contents of zip to your MT directory keeping folders intact
2) Edit mt-config.cgi and add the following line:
	RichTextEditor YUIEditor
3) Upload and enjoy!


To configure:

Several options are available in mt-static/plugins/YUIEditor/config.js,
they are explained in there and at the following web address:

http://www.richardbenson.co.uk/projects/yui-rich-text-editor-in-movabl.html

-------------------------------
VERSION NOTES:
-------------------------------
1.0
    ~ Adjusted width to make toolbar acceptable in IE6

0.9.10
    ~ Seem to have fixed the IE7 display issues
    ~ Tweaks here and there for layout in IE

0.9.9
    ~ Added 'ConfigYUIBase' to config.js so that you can host the YUI build
      files locally (this will negate the need for different versions of my plugin)
    ~ Moved to dynamic loading of required JS and CSS files to enable above,
      stopped short of the YUI loader for performance reasons
    ~ Added a function to config.js with a reference to the editor object that
      is called after load so that your own customisations can be added
    ~ Added full screen view
    ~ Fixed HTML editor box showing wrong size in FF (still an issue in IE)
    ~ Added insert file option that uses MT's asset dialog (if you have
      ConfigUseMTAssets set true)
    ~ Rearranged new buttons on menu
    ~ Fixed code to adjust containing DIV that was wrong, but somehow worked.
      Thanks to Dav.
    ~ Various tweaks and bits to existing code/functions and additional comments

0.9.8
    ~ Added option in config.js for xhtml compliant code. Default is
      set to xhtml, but other options are available, see the config
      file for details.

0.9.7
    ~ Fixed Dirty flag always being true and showing you the "are you sure
      you want to leave this page" dialog
    ~ Got the turning RTE off and on through MT drop-down working
    ~ Added config file for easy configuration
    ~ Switched to using Yahoo! hosted JS files
    ~ IE7 problem still exists


0.9.5
    ~ Now uses MT's asset managment as an option (default is on)
    ~ IE7 still throws a wobbly with the toolbar every now and then,
      some times it just lays the alignment buttons in column, other
      times the buttons are all over the place.
    ~ Removed the MT convert_breaks drop down as have built in a HTML
      editor and having this AND the HTML edit function was not compatible.
    ~ Form tags are still removed, but the contents left behind, this can be
      changed easily, let me know.


0.9 - First public release
    ~ Works in entries and pages and allows switch between body and extended
    ~ Removed content area sizer as RTE will now stretch automaticallt to fit
      content.
    ~ Doesn't use MT's built in asset management
    ~ Doesn't allow switching between RTE and plain text using MT drop-down,
      you can however view in HTML edit mode
    ~ Weird layout issues in IE7
    ~ Form elements will be removed from entry/page content by YUI - still don't
      know why it would do this!
    ~ Tested in FF2, IE7, Opera 9

------------------------------
Special Note:
None of this would have been possible without the FCK Editor plugin from
David Davis (http://xantus.vox.com/) as MT's documentation on all of this
is non-existant!
------------------------------