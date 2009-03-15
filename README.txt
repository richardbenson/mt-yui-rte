YUI Editor for Movabletype 4.1
v0.9 with YUI 2.5.2
-------------------------------
Developed by Richard Benson
http://www.richardbenson.co.uk/
-------------------------------

To install:

1) Copy contents of zip to your MT directory keeping folders intact
2) Edit mt-config.cgi and add the following line:
	RichTextEditor YUIEditor
3) Upload and enjoy!

-------------------------------
VERSION NOTES:
-------------------------------

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