(function($) {
	
	// Static constructs
	$.jc = $.jc || {};
	$.jc.videoGallery = {
		conf: {
			cols: 3, // Items per row.
			ySpace: 400, // Y Space between items (stack state)
			zSpace: 200, // Z Space between items (stack state)
			tiltGrid: true,	// Whether the grid should be tilted (grid state)
			minGridDeg: -10, // Minimum degrees of tilt (grid state)
			maxGridDeg: 10, // Maximum degrees of tilt (grid state)
			keyboard: true, // Enable/disabled keyboard controls
			items: 'li', // Selector used for items
			stateHolder: 'body', // Element used for state control,
			controls: '.control', // Class used for controls
			currentClass: 'current', // Class used for current item
			backButton: '#back', // Back button selector
			loadedClass: 'loaded' // Loaded class
		}
	};
	
	function VideoGallery(root, conf) {
			
		var self = this, // Class reference
			gallery = root, // Root element
			fire = root.add(self), // Used for callbacks
			items = gallery.find(conf.items), // Caches all items
			zIndex = items.length, // Used for reverse stacking
			fromGrid = true, // Used for transitiond delays
			cols = conf.cols, // Number of items per row
			c = 0, // Column counter
			r = 0; // Row counter
		
		$.extend(self, {
					
			// (getter)	
			getItems: function() {
				return items;
			},			
						
			// Grid layout
			// (This is already done with floats from the start, but we need to match the position of the floated elements with absolutes, ready for future transforms.)
			gridLayout: function(init) {
				
				var gridInit = init || false;

				items.each(function(i) {

					var that = $(this),
						newTop = (that.outerHeight(true) * r ),
						newLeft = (that.outerWidth(true) * c);

					// Store the position for going back to grid view later			
					if(gridInit) {
						that.data('top', newTop);
						that.data('left', newLeft);
					}

					// Inject an absolute position, based on the current position
					that.css({
						position: 'absolute',
						top: that.data('top'),
						left: that.data('left'),
						opacity: 1,
						zIndex: zIndex
					});

					// Calculate which column and row the next item is on.
					if(c == cols-1) {
						c = 0;
						r ++;
					}
					else {
						c ++;
					}	

					zIndex--; // Elements need to be 'reverse stacked'
				});	

				$(conf.stateHolder).removeClass('stack').addClass('grid');
				
			},
			
			// Stack layout
			// CSS3 'time machine' effect
			stackLayout: function(e) {
				
				e.preventDefault();
				e.stopPropagation();

				var ySpace = conf.ySpace,
					zSpace = conf.zSpace,
					translateY = 0,
					translateZ = 0,
					target = $(this),
					currentIndex = target.index(),
					totalDelayTime = 0;

				// Add some extra animation delay if it's coming in from the 'grid' state
				if(fromGrid) {	
					items.each(function(i) {
						if(i !== currentIndex) {
							var delay = (i/10)*2;
							this.style['-webkit-transition-delay'] = delay + 's';
							totalDelayTime += delay;
						}
					});

					// Reset this as soon as possible.
					setTimeout(function() {
						items.each(function(i) {
							this.style['-webkit-transition-delay'] = '0s';
						});
					}, totalDelayTime);
				}

				$(conf.stateHolder).removeClass('grid')
				.addClass('stack');

				items.each(function(i) {
					var that = $(this);
					that.show();

					that.data('translate_y', translateY);
					that.data('translate_z', translateZ);

					translateY -= ySpace;
					translateZ -= zSpace;
				});	

				// Animate each of the items separately
				// Move them a certain value, based on which item was clicked.
				items.each(function() {
					self.animateItem(this, (ySpace*currentIndex), (zSpace*currentIndex));
				});		

				var currentItem = items.filter(':nth-child(' + (currentIndex+1) + ')');	
				currentItem.prevAll(conf.items).css('opacity', 0).addClass('disabled');
				currentItem.nextAll(conf.items).andSelf().css('opacity', 1).removeClass('disabled');
				
			},
			
			// This is called for EACH of the items, every time the stack is re-animated.
			animateItem: function(obj, y, z) {
				
				var that = $(obj),
					newY = that.data('translate_y') + y,
					newZ = that.data('translate_z') + z;

				that.removeClass('current');
				if(newZ === 0) {
					that.addClass('current');
				}

				that[0].style['-webkit-transform'] = 'translate3d(0px, ' + newY + 'px, ' + newZ + 'px)';

				that.data('translate_y', newY)
					.data('translate_z', newZ);
					
			},
			
			move: function(modify) {
				
				var newIndex;
				
				// Move items forward
				items.each(function() {
					if($(this).hasClass(conf.currentClass)) {
						newIndex = $(this).index() + modify;
						return false;
					}
				});

				if(newIndex == items.length) {
					// Reached the end... start again
					newIndex = 0;
				}
				else if(newIndex < 0) {
					// Reached the beginning .. cycle back
					newIndex = (items.length - 1);
				}

				// Trigger custom event
				items.eq(newIndex).trigger('stack');
				
				// onStart
				var e = $.Event("onMove"); 
				fire.trigger(e);				
				if (e.isDefaultPrevented()) {
					return self;
				}
				
			},
			
			toggleVideo: function(item, video) {
				
				var body = $(conf.stateHolder),
					that = $(item);
				if(!body.hasClass('stack')) {
					return;
				}
				if(that.hasClass(conf.currentClass)) {
					var videoNode = video[0];
					if(body.hasClass('playing')) {
						// Stop the video.
						videoNode.pause();
						videoNode.currentTime = 0;
						body.removeClass('playing');
					}
					else {
						// Play the video
						videoNode.play();
						body.addClass('playing');
					}
				}
				
			}
			
		});
		
		// Callbacks
		$.each(['onMove', 'onStart'], function(i, name) {
					
        	// configuration
        	if ($.isFunction(conf[name])) { 
        		$(self).bind(name, conf[name]); 
        	}
			
        	self[name] = function(fn) {
        		if (fn) {
					$(self).bind(name, fn);
				}
        		return self;
        	};

        });
		
		// This moves the grid layout in 3D space, based on the cursor position
		if(conf.tiltGrid) {		
			var leftDeg = conf.minGridDeg,
				rightDeg = conf.maxGridDeg,
				windowWidth = $(window).width(),
				onePerc = (windowWidth / 100);

			$(window).mousemove(function(e) {
				if($(conf.stateHolder).hasClass('grid')) {
					var mouseXPerc = parseInt(e.pageX / onePerc, null);
					var currentDeg = parseInt((20 / 100) * mouseXPerc, null) - 10;
					if(currentDeg < -4) { currentDeg = -4; }
					if(currentDeg > 4) { currentDeg = 4; }
					gallery[0].style['-webkit-transform'] = 'rotate3d(1,0,1,' + currentDeg + 'deg)';
				}
			});	
		}
		
		// Up and down to cycle through videos
		if(conf.keyboard) {
			$(window).keyup(function(e) {
				var newIndex;
				var modify;
				
				if(e.keyCode != 38 && e.keyCode != 40) {
					return false;
				}
				else if(e.keyCode == 38) {
					modify = 1;
				} else if(e.keyCode == 40) {
					modify = -1;
				}
			
				self.move(modify);
			});
		}
		
		// Click the body to return 
		$(conf.backButton).click(function(e) {
			var body = $(conf.stateHolder);
			if(!body.hasClass('grid')) {
				e.preventDefault();
				self.gridLayout();
				fromGrid = true;
			}
		});
		
		// State control
		setTimeout(function() {
			items.bind('stack', self.stackLayout)
			.bind('click', function() {
				$(this).trigger('stack');
				fromGrid = false;
			});
			$(conf.stateHolder).addClass('init').addClass('grid');
			// Initiate the grid layout.
			self.gridLayout(true);
		}, 600);
		
		// Add basic video functionality.
		items.each(function() {
			var that = $(this);
			var video = that.find('video');
			if(video.length) {
				that.find('section').append('<span class="play"></span>');
			}
			that.click(function(e) {
				self.toggleVideo(this, video);
			});
		});
		
		// Control handler
		$(conf.controls).click(function() {
			var body = $(conf.stateHolder),
				that = $(this);
			
			// Stop any video that is being played
			// whenever you use a control.
			if(body.hasClass('playing')) {
				items.filter('.'+conf.currentClass).find('.play').trigger('click');
			}
			
			// Move the stack if it has a 'modify' property (e.g. prev, next)
			if(that.data('modify') !== null) {
				self.move(that.data('modify'));
			}
			
		});
		
		$(window).load(function() {
			
			$(conf.stateHolder).addClass(conf.loadedClass);

			// onStart
			var e = $.Event("onStart"); 
			fire.trigger(e);				
						
		});

	}
	
	$.fn.videoGallery = function(userConf) {
		
		var el = this.data('videoGallery');
		if(el) {
			return el;
		}
		
		var conf = $.extend({}, $.jc.videoGallery.conf, userConf);
		
		return this.each(function() {
			el = new VideoGallery($(this), conf);
			$(this).data('videoGallery', el);
		});
		
	};
	
})(this.jQuery);