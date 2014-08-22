## Using plugin
### Requires

* jquery.js
* bootstrap.js
* bootstrap.css

Adding search of coordinates control.

    searchControl = L.control.searchcoords();
    map.addControl(searchControl);
    
Format coordinates:

    dd.ddddd
    
or
    
    dd mm ss.sss