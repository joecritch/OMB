(function($) {
	
	// @todo -- Some selectors are still hardcoded
	// @todo -- Have some kind of "standard level", along with its props, which are then overriden. 
	// @todo -- Keyboard controls >> check they're correct, and implement.
	// @todo -- Avoid using the [data] attribute for levels?
	
	$.jc = $.jc || {};
	$.jc.xmb = {
		defaults: {
			statePrefix: 'state-',
			keyboard: true,
			keyboardControls: {
				right: 37,
				up: 38,
				left: 39,
				down: 40
			},
			onInit: function(level, items) {
				var widthPc;
				var rules = document.styleSheets[1].rules || document.styleSheets[1].cssRules;
				
				// Calculate desired width
				for(var i = 0; rules.length; i++) {
					var rule = rules[i];
					if(rule.selectorText.toLowerCase() == level.inner + ' ' + level.items) {
						widthPc = rule.style.getPropertyValue('width');
						break;
					}
				}
				
				// Set to a desired width, manually.
				items.width($(window).width() * (parseInt(widthPc, null) / 100));
				
			},
			levels: [
				{
					state: 'standard',
					depth: 0,
					inner: '.xmb',
					items: '> li',
					direction: 'left',
					offset: function(index) {
						return ($(window).width() * 0.28);
					},
					onMove: function() {
						
					},
					currentClass: 'current'
				},
				{
					state: 'standard',
					depth: 1,
					inner: '> div > ul',
					items: '> li',
					direction: 'top',
					offset: function(newCurrent) {
						if(newCurrent.index() >= 2) {
							return -50;
						}
					},
					onMove: function(items, newCurrent) {
						// Set 'before-current' for animations
						items.removeClass('before-current');
						var prev = newCurrent.prev('li');
						if(prev.length) {
							prev.addClass('before-current');

						}
					},
					currentClass: 'current'
				},
				{
					state: 'pop',
					depth: 2,
					inner: '> div > ul',
					items: '> li',
					direction: 'top',
					offset: '10px',
					onMove: function() {
						
					},
					currentClass: 'current'
				}
			]
		}
	};
	
	function XMB(root, settings) {

		var self = this,
			fire = root.add(self),
			activeLevel,
			parentLevel,
			currentDepth = 0,
			mapping = {
				'left': 'width',
				'top': 'height'
			};
		
		// Constructor	
		self.init = function() {	
			
			var level = settings.levels[currentDepth];
			activeLevel = $(level.inner);
			var items = activeLevel.find(level.items);
			
			
			///////////////////////////////////////////////////////////
			settings.onInit.apply(level, [level, items]); // self, [level, items]
			///////////////////////////////////////////////////////////
			
		
			
			// Move to current item.
			self.move(0, 0);
	
			// Technically, the plugin should be able to access any item, anywhere, at anytime.
			// We'll deal with whether that's viable later.
			root.find('li').click(function(e) {
				var element = $(this);
				self.goTo(element);
				self.openChild(element);
				return false;
			});
			
			/*
			
			if(settings.keyboard) {
			
				// Keyboard controls		
				$(window).keyup(function(e) {
				
					var keyCode = e.keyCode || e.which;

					// Deal with moving around
					// @todo -- ABSTRACT!!!!!
					var done = false;
					$.each(settings.levels, function(k, v) {
						$.each(v.controls, function(j, direction) {
							var newLevel,
								currentItem;
						
							if(j == keyCode) {
							
								console.log('v.depth', v.depth);
								console.log('currentDepth', currentDepth);
							
								if(v.depth > currentDepth) {					
									currentItem = self.getCurrent(level, items);
									newLevel = currentItem.find(v.inner);
									// console.info('increase to', v.depth);
									self.increaseLevel(newLevel);
								}
								else if(v.depth < currentDepth) {
									self.decreaseLevel();
								
								}
							
								if(direction !== 0) {
									self.move(currentDepth, direction);
								}
								else if(v.state) {
									self.changeState(v.state);
								}
						
		
								done = true;
								return false;		
							
							}
						});
						if(done == true) {
							return false;
						}
					});
				
				});
			
			}
			*/
			
		};
		
		// Public methods
		
		$.extend(self, {
			
			goTo: function(element) {
				
				var newLevel = element.parent();

				var levelProps = self.getLevelProperties(newLevel);
				
				// Current index on new level
				var currentIndex = self.getCurrent(levelProps, newLevel.find(levelProps.items)).index();
				var difference = (element.index() - currentIndex);
				
				activeLevel = newLevel;
				currentDepth = newLevel.data('level');
				parentLevel = activeLevel.closest('ul');
				
				self.move(currentDepth, difference);
			
				if(levelProps.state) {
					self.changeState(levelProps.state);
				}
								
			},
			
			getCurrent: function(level, items) {
				var currentItem = items.filter('.' + level.currentClass);
				if(!currentItem.length) {
				currentItem = items.first();	
				}
				return currentItem;
			},
			
			getLevelProperties: function(level) {
				var levelProps;
				$.each(settings.levels, function() {
					if(this.depth == level.data('level')) {
						levelProps = this;
						return false;
					}
				});
				return levelProps;
			},
			
			openChild: function(element) {
				// See if its got any children
				var childMenu = element.find('> div > ul');
				if(childMenu.length) {
					// We want to move
					parentLevel = activeLevel;
					activeLevel = childMenu;
					var childLevel = self.getLevelProperties(activeLevel);
					// We want to change state
					if(childLevel.state) {
						self.changeState(childLevel.state);
					}
				}
			},
			
			/*
						
			increaseLevel: function(newLevel) {
				parentLevel = activeLevel;
				activeLevel = newLevel;
				currentDepth ++;			
			},
			
			decreaseLevel: function() {
				activeLevel = parentLevel;
				parentLevel = parentLevel.closest('ul'); // @todo -- Make this dynamic.
				currentDepth --;
			},
			
			*/
			
			changeState: function(state) {
				$.each(settings.levels, function() {
					if(this.state) {
						$('body').removeClass(settings.statePrefix + this.state);
					}
				});
				$('body').addClass(settings.statePrefix + state);
			},
						
			// @todo -- KLUDGED
			getDimensionValue: function(level, item) {
				var dimension = mapping[level.direction];
				return (dimension == 'width') ? item.outerWidth(true) : item.outerHeight(true);
			},
			
			move: function(l, d) {
				
				var level = settings.levels[l],
					items = activeLevel.find(level.items),
					current = self.getCurrent(level, items),
					itemWidth = items.eq(0).outerWidth(true),
					offset,
					indent;
			
				// Get a new current based off the direction
				var newCurrent = items.eq(current.index() + d);
				if(!newCurrent.length || (current.index() + d) < 0) {
					if(d > 0) {
						newCurrent = items.last();
					}
					else {
						newCurrent = items.first();
					}
				}
				
				///////////////////////////////////////////////////////////
				offset = (typeof level.offset == 'function') ? level.offset.apply(level, [newCurrent]) : level.offset;
				///////////////////////////////////////////////////////////
				
				// Set current 
				items.removeClass(level.currentClass);
				newCurrent.addClass(level.currentClass);
				
				///////////////////////////////////////////////////////////
				level.onMove.apply(level, [newCurrent, items]);
				///////////////////////////////////////////////////////////
				
				indent = parseInt(((newCurrent.index() * self.getDimensionValue(level, items.eq(0))) *-1) +  offset, null);
		
				activeLevel.css(level.direction, indent);
				
				
							
			}
			
		});
				
		// Private methods
		
		
		self.init();
				
	}

	
	// Plugin call
	
	$.fn.xmb = function(options) {
		
		var el = this.data('xmb');
		if(el) {
			return el;
		}
	
		return this.each(function() {
			var settings = $.extend({}, $.jc.xmb.defaults, options);
			el = new XMB($(this), settings);
			$(this).data('xmb', el);
		});
		
	};
	
	

})(this.jQuery);