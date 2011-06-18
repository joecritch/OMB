(function($) {
	
	$.jc = $.jc || {};
	$.jc.xmb = {
		defaults: {
			offset: 2,
			levels: [
				{
					depth: 0,
					inner: '.xmb',
					items: '> li',
					direction: 'left',
					offset: 0.28,
					currentClass: 'current',
					controls: {
						37: -1,
						39: 1
					}
				},
				{
					depth: 1,
					inner: 'ul',
					items: '> li',
					direction: 'top',
					offset: 0, // 0.30
					currentClass: 'current',
					controls: {
						38: -1,
						40: 1
					}
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
			rules = document.styleSheets[1].rules || document.styleSheets[1].cssRules,
			vectorMap = {
				'left': 'width',
				'top': 'height'
			};
		
		// Constructor	
		self.init = function() {	
			
			var items,
				widthPc,
				level;
			
			// Set current level
			level = settings.levels[currentDepth];
			activeLevel = $(level.inner);
			
			// Find items
			items = activeLevel.find(level.items);
			
			///////////////////////////////////////////////////////////
			
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
			
			///////////////////////////////////////////////////////////
			
			// Move to current item.
			self.move(0, 0);
			
			// Keyboard controls		
			$(window).keyup(function(e) {
				$.each(settings.levels, function(k, v) {
					$.each(v.controls, function(j, direction) {
						var newLevel,
							currentItem;
						if(j == e.which) {
							if(v.depth > currentDepth) {					
								currentItem = self.getCurrent(level, items);
								newLevel = currentItem.find(v.inner);
								self.increaseLevel(newLevel);
							}
							else if(v.depth < currentDepth) {
								self.decreaseLevel();
							}
							
							self.move(currentDepth, direction);
							
						}
					});
				});
			});
			
		};
		
		// Public methods
		
		$.extend(self, {
			
			getCurrent: function(level, items) {
				var currentItem = items.filter('.' + level.currentClass);
				if(!currentItem.length) {
				currentItem = items.first();	
				}
				return currentItem;
			},
						
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
			
			// @todo -- KLUDGED
			getOffset: function(level) {
				var dimension = vectorMap[level.direction];
				var windowPx = (dimension == 'width') ? $(window).width() : $(window).height();
				return (windowPx * level.offset);
			},
			
			
			// @todo -- KLUDGED
			getDimensionValue: function(level, item) {
				var dimension = vectorMap[level.direction];
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
				
				offset = self.getOffset(level);
				
				// Set current 
				items.removeClass(level.currentClass);
				newCurrent.addClass(level.currentClass);
				
				///////////////////////////////////////////////////////////
				
				if(l == 1) {
				
					// Set before current for animations
					// @todo -- This could be in a callback
					items.removeClass('before-current');
					var prev = newCurrent.prev('li');
					if(prev.length) {
						prev.addClass('before-current');
					
					}

					if(newCurrent.index() >= 2) {
						offset -= 50;
					}
			
				}
				
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