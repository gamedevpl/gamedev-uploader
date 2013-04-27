define("UploadGallery", [], function() {
	function UploadGallery(images, inputNode, formNode) {
		this.inputNode = inputNode;
		while(formNode.parentNode && formNode.tagName.toLowerCase()!='form')
			formNode = formNode.parentNode;
		this.formNode = formNode.parentNode;
		this.node = dojo.create('div', {
			className : 'img-uploaded',
			style : {
				marginTop : '10px'
			}
		}, dojo.query('div.img-upload', formNode.parentNode)[0], 'last');
		this.node._gallery = this;
		this.reload(images);
	}

	UploadGallery.prototype.reload = function(images) {
		dojo.query('.button, .container, span.gallery', this.node).forEach(function(el) {
			el.parentNode.removeChild(el)
		});
		this.images = images;
		dojo.create('span', {
			innerHTML : 'Wybierz obrazek z galerii',
			style : {
				display : 'block'
			},
			className : 'gallery'
		}, this.node, 'last')
		images.vector.some(function(image) {
			var node = dojo.mixin(dojo.create('div', {
				className : 'container',
				style : {
					background : 'url(/images/m/' + image.alias + ') no-repeat center center'
				},
				onclick : function() {
					var targetHTML = dojo.query('.upload-target-html', this.gallery.formNode)[0];
					if (targetHTML) {
						var maxWidth = dojo.getStyle(targetHTML, 'max-width') || 340;
						var maxHeight = dojo.getStyle(targetHTML, 'max-height') || 340;
						targetHTML.innerHTML = '<img src="/images/' + (dojo.hasClass(targetHTML, 'mini') ? 'm/':'') + this.alias
								+ '"'+(!dojo.hasClass(targetHTML, 'nopad')? ' onload="if(this.offsetHeight < '+maxHeight+') dojo.style(this, {marginTop: ('+maxHeight+'-this.offsetHeight)/2+\'px\'})"':'')+'/>';
						dojo.query('.upload-target-id', this.gallery.formNode)[0].value = this.imageid;
					} else if (this.gallery.inputNode.className.indexOf('dijit') >= 0)
						dijit.byId(this.gallery.inputNode.id).execCommand('inserthtml', ' <a href="/images/l/' + this.alias + '"><img src="/images/' + this.alias + '"/></a>');
					else {
						this.gallery.inputNode.value += ' <a href="/images/l/' + this.alias + '"><img src="/images/' + this.alias + '"/></a>';
						this.gallery.inputNode.focus();
					}
				}
			}, this.node, 'last'), {
				gallery : this,
				alias : image.alias,
				imageid : image.id
			});
			
			dojo.create('span', {innerHTML: '<i class="icon-trash"> </i>', className: 'controls',
					onclick: function(event) {
						event.preventDefault();
						event.stopPropagation();
						dojo.style(this.node, { opacity: 0.5, pointerEvents: 'none' });
						dojo.xhrPost({ url: '/cmd-delete-image', content: {id: image.id} }).then(function() {
							dojo.style(this.node, { opacity: null, pointerEvents: null });
							this.scroll(0);
						}.bind(this));
				}.bind(this)
			}, node);
		}.bind(this));
		dojo.create('div', {
			className : 'clb'
		}, this.node, 'last');
		if (images.prev > 0)
			dojo.create('span', {
				style : {
					"float" : 'left'
				},
				className : 'button',
				innerHTML : 'Poprzednie (' + images.prev + ')',
				onclick : function() {
					this.parentNode._gallery.scroll(-5);
				}
			}, this.node, 'last');
		if (images.next > 0)
			dojo.create('span', {
				style : {
					"float" : 'right'
				},
				className : 'button',
				innerHTML : 'Następne (' + images.next + ')',
				onclick : function() {
					this.parentNode._gallery.scroll(5);
				}
			}, this.node, 'last');
		dojo.create('div', {
			className : 'clb'
		}, this.node, 'last');
	}

	UploadGallery.prototype.scroll = function(v) {
		dojo.query('.button, .container', this.node).forEach(function(el) {
			dojo.style(el, {
				opacity : 0.2
			});
			el.onclick = null;
		});
		return dojo.xhrPost({
			url : '/cmd-my-images',
			gallery : this,
			content : {
				offset : v != 0 ? this.images.offset + v : 0
			},
			load : function(a) {
				var a = _eval(a);
				this.gallery.reload(a);
			}
		});
	}
	

	return UploadGallery;
});
	
	