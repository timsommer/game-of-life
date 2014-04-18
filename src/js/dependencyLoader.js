/* Author: Tim Sommer
 Load all dependencies for the GoL engine.
 Usage:  just include in script tag, Pyramid takes care of the rest.
 */

Pyramid.rootPath = './';

//note that no template was defined?  This means that the code will be inserted directly into the page
Pyramid.setTypeRenderer(
{ name: 'view',
    isExtension: true
});


//Set up file dependencies
Pyramid.newDependency({
    name: 'main',
    files: [
        'js/libs/jquery-1.7.2.min.js',
	    'js/libs/html5slider.js',
	    'js/libs/blackbird.js'
    ]
});

Pyramid.newDependency({
    name: 'util',
    files: [
        'js/util/namespace.js',
        'js/util/messenger.js',
        'js/util/guid.js',
        'js/util/events.js'
    ]
});

Pyramid.newDependency({
    name: 'GoL',
    files: [
	    'js/gameoflife/namespace.js',
        'js/gameoflife/cell.js',
	    'js/gameoflife/organism.js',
        'js/gameoflife/gameoflife.js',
	    'js/gameoflife/factory.js'
    ],
    dependencies: ['util']
});

Pyramid.newDependency({
name:'GoLExampleView',
files: [
	    'js/viewmodel/example.js'
    ],
    dependencies: ['main', 'util', 'GoL']
});




