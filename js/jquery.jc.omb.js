(function($) {

	$.jc = $.jc || {};
	$.jc.omb = {
		defaults: {
			statePrefix: 'state-',
			onInit: function(level, items) { },
			level: {
				state: 'pop',
				inner: '> div > ul',
				items: '> li',
				direction: 'top',
				currentClass: 'current',
				offset: null,
				onMove: function(items, newCurrent) { }
			}
		}
	};
	
	function OMB(root, settings) {
		
		var self = this,
			fire = root.add(self),
			activeLevel,
			parentLevel,
			currentDepth = 0,
			mapping = {
				'left': 'width',
				'top': 'height'
			};
		
		// Merge individual depths with level template
		var levels = [];
		$.each(settings.levels, function(k, v) {
			var mergedLevel = $.extend({}, settings.level, this);
			mergedLevel.depth = parseInt(k);
			levels.push(mergedLevel);
		});
		
		// Constructor	
		self.init = function() {	
			
			var level = levels[currentDepth];
			activeLevel = $(level.inner);
			var items = activeLevel.find(level.items);
			
			///////////////////////////////////////////////////////////
			settings.onInit.apply(level, [level, items]); 
			///////////////////////////////////////////////////////////
			
			// Move to current item.
			self.move(0, 0);
	
			// Technically, the plugin should be able to access any item, anywhere, at anytime.
			// We'll deal with whether that's viable later.
			root.find('li').click(function(e) {
				var element = $(this);
				var currentLevel = levels[currentDepth];
				var currentItems = activeLevel.find(currentLevel.items);
				var currentElement = self.getCurrent(currentLevel, currentItems);
				self.goTo(element);
				
	
				if(currentElement[0].isSameNode(element[0])) {
					self.openChild(element);
				}	
				return false;
			});
			
		};
		
		// Public methods
		
		$.extend(self, {
			
			getActiveLevel: function() {
				return activeLevel;
			},
			
			getRoot: function() {
				return root;
			},
			
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
				$.each(levels, function() {
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
					childMenu.find(childLevel.items).removeClass(childLevel.currentClass);
					childMenu.find(childLevel.items).eq(0).addClass(childLevel.currentClass);
					self.move(childLevel.depth, null, 0);
				}
			},
			
			changeState: function(state) {
				$.each(levels, function() {
					if(this.state) {
						$('body').removeClass(settings.statePrefix + this.state);
					}
				});
				$('body').addClass(settings.statePrefix + state);
			},
						
			getDimensionValue: function(level, item) {
				var dimension = mapping[level.direction];
				return (dimension == 'width') ? item.outerWidth(true) : item.outerHeight(true);
			},
			
			move: function(l, d, i) {
				
				var level = levels[l],
					items = activeLevel.find(level.items),
					current = self.getCurrent(level, items),
					offset,
					indent;
				
				// Get a new current based off the direction
				if(d !== null) {
					var newCurrent = items.eq(current.index() + d);
					if(!newCurrent.length || (current.index() + d) < 0) {
						if(d > 0) {
							newCurrent = items.last();
						}
						else {
							newCurrent = items.first();
						}
					}
				}
				// A particular index has been provided.
				else if(i !== null) {
					newCurrent = items.eq(i);
				}
				
				
	
				///////////////////////////////////////////////////////////
				offset = (typeof level.offset == 'function') ? level.offset.apply(level, [newCurrent]) : parseInt(level.offset, null);
				///////////////////////////////////////////////////////////
				
				// Set current 
				items.removeClass(level.currentClass);
				newCurrent.addClass(level.currentClass);
				
				///////////////////////////////////////////////////////////
				level.onMove.apply(level, [items, newCurrent]);
				///////////////////////////////////////////////////////////
				
				var totalToCurrent = 0;
				items.each(function(i) {
					if($(this).hasClass(level.currentClass)) {
						return false;
					}
					totalToCurrent += level.itemHeight;			
				});

				indent = parseInt((0 - totalToCurrent) + offset, null)
				
				activeLevel.css(level.direction, indent);
									
			}
			
		});

	}

	
	// Plugin call
	
	$.fn.omb = function(options) {
		
		var el = this.data('omb');
		if(el) {
			return el;
		}
	
		return this.each(function() {
			var settings = $.extend({}, $.jc.omb.defaults, options);
			el = new OMB($(this), settings);
			el.init();
			$(this).data('omb', el);
		});
		
	};
	
	

})(this.jQuery);