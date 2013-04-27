define("Uploader", [], function(Uploader) {
	return new function () { 
	
		var imageFilter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;
		var isImageType = this.isImageType = function(type) {
			return imageFilter.test(type);
		}
		
		var readFile = this.readFile = function(file) {
			var deferred = new dojo.Deferred();
			
			var reader = new FileReader();
			reader.onload = function(event) {
				deferred.resolve(event.target.result);
			}
			reader.readAsText(file);
			
			return deferred;
		}
		
	
		var connectDropEvents = this.connectDropEvents = function(node, handler) {	
			node.addEventListener("dragenter", function dragenter(e) {
				  e.stopPropagation();
				  e.preventDefault();
				}, false);
			node.addEventListener("dragover", function dragenter(e) {
				e.stopPropagation();
				e.preventDefault();
				dojo.query(node).parents('.drag-drop').addClass('drag-over');
			}, false);
			node.addEventListener("dragleave", function dragenter(e) {
				dojo.query(node).parents('.drag-drop').removeClass('drag-over');
			});					
			node.addEventListener("drop", function (e) {
				e.stopPropagation();
				e.preventDefault();
				handler(e.dataTransfer.files);
			});
		}
		
		this.cropDialog = function(file) {
			var deferred = new dojo.Deferred();
		
			require([ "dijit/Dialog", "dojox/layout/ResizeHandle", "dojo/dnd/move" ], function(Dialog, ResizeHandle, move){
			  	var cropDialog = new Dialog({
		            title: "Upload",
		            content: "",
		            style: "width: 800px; z-index: 10000; text-align: center; background: white; box-shadow: 0px 0px 10px rgba(0,0,0,0.3)"
		        });
			  	
			  	dojo.style(cropDialog.containerNode, {margin: "10px 8px", padding: "0px"});
			  	
			  	var img = dojo.create('img', {src: window.URL.createObjectURL(file), style: {width: '100%'}}, cropDialog.containerNode, 'first');
			  	
			  	dojo.connect(img, 'load', function() {						  	
				  	var rect = [img.offsetWidth/4, img.offsetHeight/4, img.offsetWidth/4*3, img.offsetHeight/4*3];
				  	var rectEl = dojo.create('div', {style: {position: "absolute", background: "rgba(0,0,0,0.1)", border: '1px solid red',
				  		left: img.width/4+'px', top: img.height/4+'px',
				  		width: img.width/4*2+'px', height: img.height/4*2+'px'}}, cropDialog.containerNode, 'first');
				  	var resizeHandle = new ResizeHandle({targetContainer: rectEl, animateSizing: false,
				  		constrainMax: true, maxWidth: img.width - rect[0], maxHeight: img.height - rect[1] });
				  	resizeHandle.placeAt(rectEl);
				  	
				  	var constraint = {l : 0, t: 0, w: img.width - (rect[2]-rect[0]), h: img.height - (rect[3]-rect[1])};
				  	var moveable = new move.constrainedMoveable(rectEl, {constraints: function() { 
				  		return constraint;
					}});		
				  	
				  	resizeHandle.onResize = function(event) {
				  		rect = [rectEl.offsetLeft, rectEl.offsetTop, rectEl.offsetLeft + rectEl.offsetWidth, rectEl.offsetTop  + rectEl.offsetHeight]
				  		constraint = {l : 0, t: 0, w: img.width - (rect[2]-rect[0]), h: img.height - (rect[3]-rect[1])};
				  	}
				  	
				  	moveable.onMoved = function() {
				  		rect = [rectEl.offsetLeft, rectEl.offsetTop, rectEl.offsetLeft + rectEl.offsetWidth, rectEl.offsetTop  + rectEl.offsetHeight];
				  		resizeHandle.maxSize = { w : img.width-rect[0], h: img.height-rect[1] };
				  	}
				  	
				  	require(["dijit/form/Button"], function(Button){
				  			var buttons = [];
				  	        buttons.push(new Button({
				  	            label: "<i class=\"icon-upload\"> </i> Upload",
				  	            onClick: function(){
				  	            	var rect = [rectEl.offsetLeft, rectEl.offsetTop, 
				  	            				Math.min(rectEl.offsetLeft + rectEl.offsetWidth, img.width), 
				  	            				Math.min(rectEl.offsetTop  + rectEl.offsetHeight, img.height)];
				  	            	
				  	            	/* return result */
				  	            	deferred.resolve({ rect: rect.map(function(el, idx) { return el / (idx % 2 == 0 ? img.offsetWidth : img.offsetHeight) }), 
				  	            	                   cropDialog: cropDialog });					  	            					  	            			
									
									buttons.some(function(button) { button.setAttribute("disabled", true) });
									
									dojo.style(rectEl, { background: "rgba(0,0,0,0.5)", pointerEvents: "none"});
									dojo.style(img, { pointerEvents: "none"});
				  	            }
				  	        }, dojo.create('span', {}, cropDialog.containerNode, 'last')));
				  	        
				  	      buttons.push(new Button({
				  	            label: "Anuluj",
				  	            onClick: function(){
				  	            	cropDialog.destroy();
				  	            }
				  	        }, dojo.create('span', {}, cropDialog.containerNode, 'last')));
				  	});
			  	})
				
			  	cropDialog.show();
			  	
			  
			});
			
			return deferred;
		};
		
		this.gistDialog = function(file, withInline) {
			var deferred = new dojo.Deferred();
		
			require([ "dijit/Dialog"], function(Dialog) {
		        var gistDialog = new Dialog({
		            title: "Gist",
		            content: "",
		            style: "width: 800px; z-index: 10000; text-align: center"								
		        });
		        
		        var textarea = dojo.create('textarea', { placeholder: 'Przeciągnij plik źródłowy z pulpitu lub wklej jego fragment, aby stworzyć nowego Gista.',
		        	style: { width: '100%', height: '200px', fontSize: '11px' } }, gistDialog.containerNode);
		        
		        if(file)
			        readFile(file).then(function(content) {
						textarea.value = content;
					});
					
		        
		        connectDropEvents(textarea, function(files) {
		        	readFile(files[0]).then(function(content) {
						textarea.value = content;
					});
		        });
		        
		        require(["dijit/form/Button"], function(Button){
		  			var buttons = [];
		  	        buttons.push(new Button({
		  	            label: "<i class=\"icon-github-alt\"> </i> Upload na Gist",
		  	            onClick: function(){		  	            	
		  	        		deferred.resolve({ file: new Blob([textarea.value], {type: 'text/plain'}), gistDialog: gistDialog });							
							buttons.some(function(button) { button.setAttribute("disabled", true) });
		  	            }
		  	        }, dojo.create('span', {}, gistDialog.containerNode, 'last')));
		  	        
		  	        if(withInline)
			  	        buttons.push(new Button({
			  	            label: "<i class=\"icon-quote-right\"> </i> Dołącz",
			  	            onClick: function(){
			  	            	deferred.resolve({ content: textarea.value, inline: true, gistDialog: gistDialog });
			  	            	gistDialog.destroy();
			  	            }
			  	        }, dojo.create('span', {}, gistDialog.containerNode, 'last')));
		  	        
		  	        buttons.push(new Button({
		  	            label: "Anuluj",
		  	            onClick: function(){
		  	            	gistDialog.destroy();
		  	            }
		  	        }, dojo.create('span', {}, gistDialog.containerNode, 'last')));
		  	    });
		        
		        gistDialog.show();
			});
			
			return deferred;
		};		
		
		var mapFiles = this.mapFiles = function(files, fn) {
			return Object.keys(files).slice(0, 5).filter(function(key) { return key >= 0 }).map(function(key) { return files[key] }).map(fn);
		};		
	
		this.uploadListener = function(files, crops) {
 			var result = new dojo.Deferred();
			require(['dojo/DeferredList'], function(DeferredList) {
				new DeferredList(mapFiles(files, function(file, idx) {
					if(isImageType(file.type))					
						return fileToDataURL(file, "image/jpg", (crops||[])[idx]);
					else {
						var reader = new FileReader();
						var deferred = new dojo.Deferred();
						reader.onload = function(event) {
							deferred.resolve(event.target.result);
						}
						reader.readAsText(file);
						return deferred;
					}
				})).then(function(dataList) {
					new DeferredList(dataList.map(function(data, idx) {
						if(isImageType(files[idx].type))	
							return dojo.xhrPost({url: '/cmd-jpg-upload', content: {name: files[idx].name||Math.random(), data: data[1] }});
						else {
							var deferred = new dojo.Deferred();
							var gistRequest = {
							  "public": true,
							  "description": "Gist upload from Warsztat, http://www.gamedev.pl",
							  "files": {}
							};
							gistRequest.files[files[idx].name] = {content: data[1]};							
							dojo.xhrPost({url: 'https://api.github.com/gists', postData: JSON.stringify(gistRequest)}).then(function(result) {
								deferred.resolve(JSON.parse(result).html_url);
							});
							return deferred;
						}
					})).then(function(aliases){
						result.resolve(aliases.map(function(a, idx) { 
							if(isImageType(files[idx].type))
								return document.location.protocol+"//"+document.location.host+'/images/l/'+a[1]
							else
								return a[1];
						}));
		 			});	
				});		
			});
			 			
 			return result;
		};
	
		return this;
	};
	
});