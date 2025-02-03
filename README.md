# Raster - a model railroad control panel creator

The application consists of a webserver that serves static content files and handles API requests. It provides a web based (HTML + pure Javascript) frontend,
that consists of a grid, where different icons (schematic track items like turnouts, straights, curves..) can be places, moved and deleted. Every change in the
frontend triggers a http API call to the webserver that processes these changes.
