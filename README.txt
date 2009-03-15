YUI Editor for Movabletype 4.1
v0.9.8
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
they are explained in there.

-------------------------------
VERSION NOTES:
-------------------------------
To-Do:
    ~ Add option for local or yahoo hosted JS
    ~ Get text area to expand with the iframe if autoheight is on
    ~ Find out what is going on with IE7 and the button problem

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