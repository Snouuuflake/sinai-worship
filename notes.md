# MSS - React development notes
## song ui
- songs should save last position in their objects.
## config managment
- there is a config sqlite db in extraresources
## style managment
- display window has a style tag, to which the user css, loaded from a file / defined in the main window, gets dumped
- styles can be made with an editor inside the program, which contains information about relevant classes and their numbering.
- a default style can be saved to internal config db
- window reads argv[0] and then loades generates its content from js, and then makes event listeners
    - we could actually just put everything in a template string, since it skips a lot of function calls and only happens once

