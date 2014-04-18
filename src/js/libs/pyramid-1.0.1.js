/*
Pyramid Dependency Manager
Copyright (c) 2011, Joel Wenzel
http://joel.inpointform.net

All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * The names of the Pyramid Dependency Manager's contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL Joel Wenzel BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
*/



var Pyramid = new (function () {
	//=======================================
	//__UniqueArray (private class)
	//Array that ensures that each key is only included once.
	//Only works for string and ints and not for objects
	//=======================================
	function __UniqueArray() {
	    var _vals = new Array();
	    var _indices = new Array();
	
	    _vals.add = function (val) {
	        if (_vals.contains(val))
	            return;
	
	        _indices[val] = _vals.length;
	        _vals[_vals.length] = val;
	    };
	
	    _vals.remove = function (val) {
	        _vals.splice(_indices[val], 1);
	        _indices[val] = undefined;
	    };
	
	    _vals.contains = function (val) {
	        return _indices[val] != undefined;
	    };
	
	    return _vals;
	}
	//=======================================
	//__OrderedHashArray (private class)
	//The purpose of this object is to ensure that the keys can always be retrieved in the order they are added
	//Not all implimentations of associative arrays are traversed in the order the items are added
	//=======================================
	function __OrderedHashArray() {
	    var _vals = new Array();
	    _vals.keys = new __UniqueArray();
	
	    _vals.set = function (key, val) {
	        _vals[key] = val;
	
	        if (!_vals.keys.contains(key))
	            _vals.keys.add(key);
	    };
	
	    _vals.containsKey = function (key) {
	        return _vals.keys.contains(key);
	    };
	
	    _vals.size = function () {
	        return _vals.keys.length;
	    };
	
	    return _vals;
	}
    
	//=======================================
    // Renderer(Private class) - writes a file to a webpage according to a template
    //=======================================
    __Renderer = function (rootPath) {
        var _thatDepManRend = this;
        this.template = undefined;

        this.getRenderedString = function (file) {
            if (_thatDepManRend.template)
                return (new String(_thatDepManRend.template)).replace('${file}', file);
            return getUrlText(file);
        };
    };

    //=======================================
    // TypeRenderers(Private class) - tracks all the various renderers
    //=======================================
    __TypeRenderers = function () {
        var _renderers = new __OrderedHashArray();

        this.get = function (name) { var lookupName = (new String(name)).toLowerCase(); return _renderers[lookupName]; };

        this.set = function (name, isExtension, template) {
            var lookupName = (new String(name)).toLowerCase();
            if (!_renderers.containsKey(lookupName))
                _renderers.set(lookupName, new __Renderer());
            _renderers[lookupName].template = template
        };
    };

    //=======================================
    // Dependency(Private class) - manages tracking the various files associated With
	//		a single dependency group. 
    //=======================================
    __Dependency = function (name) {
        this.name = name;
        var _thatDepManDep = this;
        var _files = new __OrderedHashArray();
        var _dependencyNames = new __UniqueArray();

        File = function (fname, rendererLookUp) {
            this.uniqueHashKey = (new String(fname)).toLowerCase();
            this.filePath = fname;
            this.rendererLookUp = rendererLookUp;
        }

		/*--------------------------------------------------
		addDependency(dependencyName)
		
		Adds a new dependency group to the current dependency.  These added dependency groups will be loaded
		before 'this' dependency
		
		dependencyName - name of dependency group
		--------------------------------------------------*/
        this.addDependency = function (dependencyName) {
            _dependencyNames.add(dependencyName);
        };

		/*--------------------------------------------------
		addFiles(filesToAdd, typeRendererName)
		
		Adds to the list of files that will be rendered when this dependency is loaded
		
		filesToAdd - array of path's to the files
		typeRendererName (optional) - name of type render to used to display the files.  If no type render is
			specified, one will be chose based on the extension. 
		--------------------------------------------------*/
        this.addFiles = function (filesToAdd, typeRendererName) {
            var renderToUse = typeRendererName;
            for (var i = 0; i < filesToAdd.length; i++) {
                if (!typeRendererName)
                    renderToUse = getExtension(filesToAdd[i]);

                _files.set(new String(filesToAdd[i]).toLowerCase(),
                new File(filesToAdd[i], renderToUse));
            }
        };

        this.__getFiles = function (dupsArray, noRecursion) {
            var filesArray = new Array();

            //noRecursion is false, or undefined
            if (!noRecursion) {
                for (var i = 0; i < _dependencyNames.length; i++) {
                    var dependency = _dependenciesMasterList[_dependencyNames[i]];
                    filesArray = filesArray.concat(dependency.__getFiles(dupsArray));
                }
            }

            for (var i = 0; i < _files.keys.length; i++) {
                var file = _files[_files.keys[i]];
                if (!dupsArray[file.uniqueHashKey]) {
                    filesArray.push(file.filePath);
                    dupsArray[file.uniqueHashKey] = true;
                }
            }

            return filesArray;
        }

		/*--------------------------------------------------
		getFiles(previouslyLoadedFiles, noRecursion)
		
		previouslyLoadedFiles - array of files that were previously loaded.  This prevents the same file from being
			loaded multiple times
		noRecursion - when set to true, then only the files for 'this' dependency are returned.  None of the files
			from the parent dependency groups will be retrieved
		return: an array of file paths
		--------------------------------------------------*/
        this.getFiles = function (previouslyLoadedFiles, noRecursion) {
            if (!previouslyLoadedFiles)
                previouslyLoadedFiles = new Array();
            return _thatDepManDep.__getFiles(previouslyLoadedFiles, noRecursion);
        };

        this.__render = function (dupsArray, rootPath, noRecursion) {
            var html = '';
            //noRecursion is false, or undefined
            if (!noRecursion) {
                for (var i = 0; i < _dependencyNames.length; i++) {
                    var dependency = _dependenciesMasterList[_dependencyNames[i]];
                    html += dependency.__render(dupsArray, rootPath);
                }
            }

            for (var i = 0; i < _files.keys.length; i++) {
                var file = _files[_files.keys[i]];
                if (!dupsArray[file.uniqueHashKey]) {

                    var rendererLookUp = file.rendererLookUp;
                    var renderer = _typeRenderers.get(rendererLookUp);
                    if (!renderer)
                        throw 'Missing required type renderer for file "' + file.filePath + '"';

                    html += renderer.getRenderedString(rootPath + file.filePath);
                    dupsArray[file.uniqueHashKey] = true;
                }
            }

            return html;
        }

		/*--------------------------------------------------
		render()
		
		Writes the dependencies to the html page
		
		rootPath - Root directory that is combined with the relative paths for all the added files
		previouslyLoadedFiles - array of files that were previously loaded.  This prevents the same file from being
			loaded multiple times
		noRecursion - when set to true, then only the files for 'this' dependency are returned.  None of the files
			from the parent dependency groups will be retrieved
		
		--------------------------------------------------*/
        this.render = function (rootPath, previouslyLoadedFiles, noRecursion) {
            if (!previouslyLoadedFiles)
                previouslyLoadedFiles = new Array();

            var html = _thatDepManDep.__render(previouslyLoadedFiles, rootPath, noRecursion);
            _thatDepMan.insertContentMethod(html);
        };
    };

	//=======================================
    // Utility Functions
    //=======================================
	/*--------------------------------------------------
	getExtension(filename)
	
	filename - file name/path
	Return: Retrieves the extension of a given file
	--------------------------------------------------*/
    getExtension = function (filename) {
        return /[^.]+$/.exec(filename)
    };

	/*--------------------------------------------------
	getUrlText(url)
	
	url - address of file to retrive
	Return: Retrieves the text from a given Url
	--------------------------------------------------*/
    function getUrlText(url) {
        var xmlhttp;
        if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        }
        else {// code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        xmlhttp.open("GET", url, false);
        xmlhttp.send();
        return xmlhttp.responseText;
    }

	/*--------------------------------------------------
	indexOf(needle, arr)
	
	needle - search key
	arr - array  to search
	Return: Returns the index of an item in an array
	--------------------------------------------------*/
    function indexOf(needle, arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == needle) {
                return i;
            }
        }
        return -1;
    }
	
    //=======================================
    // Pyramid
    //=======================================
    var _thatDepMan = this;
    
    var _typeRenderers = new __TypeRenderers();
    var _dependenciesMasterList = new __OrderedHashArray();
    var _previouslyLoadedFiles = new Array();

	//base reference path for the dependencies
	this.rootPath = "/";
	
	//method which determines where the dependencies are included in the file
	this.insertContentMethod = function (content) { document.write(content); };

    
	/*--------------------------------------------------
	
	Determines how a file is rendered for inclusion in a webpage
	
	options.name - name of the renderer
	options.isExtension - determines if the name is an extension
	options.template - template used to render a file for inclusion.  Template uses the variable ${file} to
	     represent the path to the file to be used for rendering.
	--------------------------------------------------*/
    this.setTypeRenderer = function (options) {
        if (options.name == undefined)
            throw 'options.name is a required parameter';

        var isExtension = true;
        if (options.isExtension)
            isExtension = options.isExtension;

        _typeRenderers.set(options.name, isExtension, options.template);
        return _thatDepMan;
    };

	/*--------------------------------------------------
	getFiles(dependencyGroup)
	
	dependencyGroup - name of the dependency which we want to get the files from
	
	return: an array of all the files required for a particular dependencyGroup.  
	Note that parents are recursed so files for parent groups are returned as well.
	--------------------------------------------------*/
    this.getFiles = function (dependencyGroup) {
        var dep = _dependenciesMasterList[dependencyGroup];
        if (!dep)
            throw 'No dependency group:' + dependencyGroup;
        return dep.getFiles();
    };

    /*--------------------------------------------------
    saveDependency(options)
	
	Creates a dependency group
	
	options.name(required): dependency group name 
    options.files(optional): array of file paths relative to root 
    options.dependencies(optional): array of parent dependency group names.  These dependencies will be loaded before the newly created dependency
    options.filesRenderer(optional): render used to insert files
    --------------------------------------------------*/
    this.saveDependency = function (options) {

        if (!options.name || (!options.files && !options.dependencies))
            throw 'create/saveDependency requires options.name and (options.files and/or options.dependencies) as parameters';

        if (!_dependenciesMasterList.containsKey(options.name))
            _dependenciesMasterList.set(options.name, new __Dependency(options.name, _dependenciesMasterList, _typeRenderers));

        var newDep = _dependenciesMasterList[options.name];

        //add dependency groups
        if (options.dependencies) {
            for (var i = 0; i < options.dependencies.length; i++) {

                var prevDependency = _dependenciesMasterList[options.dependencies[i]];
                if (!prevDependency)
                    throw 'Dependency "' + options.dependencies[i] + '" is not defined';

                newDep.addDependency(options.dependencies[i]);
            }
        }

        //add files
        if (options.files) {
            newDep.addFiles(options.files, options.filesRenderer);
        }

        //allow chaining
        return _thatDepMan;
    };

    
	/*--------------------------------------------------
    newDependency(options)
	
	Throws an error if group already exists
	
	options.name(required): dependency group name 
    options.files(optional): array of file paths relative to root 
    options.dependencies(optional): array of parent dependency group names.  These dependencies will be loaded before the newly created dependency
    options.filesRenderer(optional): render used to insert files - this feature is still in testing so don't use in production
    --------------------------------------------------*/
    this.newDependency = function (options) {
        if (_dependenciesMasterList.containsKey(options.name))
            throw 'Cannot create dependency "' + options.name + '" as it already exists';

        return _thatDepMan.saveDependency(options);
    };

    /*--------------------------------------------------
	joinFiles(options)
	
	Joins files into a single file for each renderer.  For example, joins the content from all js files and puts it in a
	variable, and joins the content from the various css files and puts it in a different variable
	
    options.name: dependency group name to combine
	options.include: files to include (instead of using options.name)
    options.excludeDependencies: list of files to exclude
    options.excludeFiles: list of files to exclude
	
	return: an associative array containing the joined content.  Each content type can be retrieved by it's extension
    --------------------------------------------------*/
    this.joinFiles = function (options) {

        var files = [];

        //populate the files array
        if (options.name) {
            files = _thatDepMan.getFiles(options.name);
            for (var i = 0; i < files.length; i++) {
                files[i] = _thatDepMan.rootPath + files[i];
            }
        }

        if (options.include) {
            for (var i = 0; i < options.include.length; i++) {
                if (indexOf(options.include[i], files) == -1)
                    files.push(options.include[i]);
            }
        }

        if (options.excludeFiles) {
            for (var i = 0; i < options.excludeFiles.length; i++) {
                var index = indexOf(options.excludeFiles[i], files);
                if (index > -1)
                    files.splice(index, 1);
            }
        }

        if (options.excludeDependencies) {
            for (var i = 0; i < options.excludeDependencies.length; i++) {
                var depName = options.excludeDependencies[i];
                var excludeFiles = _thatDepMan.getFiles(depName, true);

                for (var j = 0; j < excludeFiles.length; j++) {

                    var index = indexOf(_thatDepMan.rootPath + excludeFiles[j], files);
                    if (index > -1)
                        files.splice(index, 1);
                }
            }
        }

        //join files
        var aText = [];
        for (var i = 0; i < files.length; i++) {
            var path = files[i];
            var ex = getExtension(path);
            if (!aText[ex])
                aText[ex] = '';

            aText[ex] += '\n\n' + getUrlText(path);
        }

        return aText;
    };

	/*--------------------------------------------------
	getIncludeString(depName)
	
	gets include string of all renderers combined
	eg <script...> ...
	
	Params:
	 depName - Name of dependencies group
	Return: string containing include text
	--------------------------------------------------*/
    this.getIncludeString = function (depName) {
        if (!_dependenciesMasterList[depName]) {
            throw 'Could not load dependency "' + depName + '" as it has not been added as a dependency';
        }

        return _dependenciesMasterList[depName].__render(_thatDepMan.rootPath, _previouslyLoadedFiles);
    };

	/*--------------------------------------------------
	load()
	
	loads the dependencies passed as arguments
	
	Params:
	  each dependency group name to be loaded
	--------------------------------------------------*/
    this.load = function () {
        for (var i = 0; i < arguments.length; i++) {
            var depName = arguments[i];
            if (!_dependenciesMasterList[depName]) {
                throw 'Could not load dependency "' + depName + '" as it has not been added as a dependency';
            }

            _dependenciesMasterList[depName].render(_thatDepMan.rootPath, _previouslyLoadedFiles);
        }
        return _thatDepMan;
    };
})();

/*==========================================
These type renderers determine how various dependencies will be printed when
included in an html file
============================================*/
Pyramid.setTypeRenderer({
	name: 'js',
	isExtension: true,
	template: '<script type="text/javascript" src="${file}"></script>\n'
	});

Pyramid.setTypeRenderer({
	name: 'css',
	isExtension: true,
	template: '<link rel="stylesheet" href="${file}" type="text/css"/>\n'
	});

//if the file has no extension, then the text from the file will be included
Pyramid.setTypeRenderer({
	name: '',
	isExtension: true
	});