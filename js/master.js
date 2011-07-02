$(function() {
	

	/**
	 * Initiate XMB
	 */
	
	var $omb = $('.omb-outer');
	$omb.omb({
		onInit: function(level, items) {
			
			var self = this;
			
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
			var newWidth = $(window).width() * (parseInt(widthPc, null) / 100);
			items.width(newWidth);
			level.itemHeight = newWidth;
					
		},
		levels: {
			0: {
				state: 'standard',
				inner: '.omb',
				direction: 'left',
				offset: function(index) {
					return ($(window).width() * 0.2); // (2x 10%)
				}
			},
			1: {
				state: 'standard',
				itemHeight: 46,
				offset: function(newCurrent) {
					if(newCurrent.index() == 0) {
						return 0;
					}
					else {
						return -160;
					}
				}
			},
			2: {
				offset: '0px',
				itemHeight: 39
			}
		}
	});
	
	// Keyboard controls

	var keyboardControls = {
		right: 39,
		up: 38,
		left: 37,
		down: 40,
		enter: 13
	};
	
	var api = $omb.data('omb');

	$(window).keyup(function(e, fakeKey) {

		var activeLevel = api.getActiveLevel(),
			currentLevel = api.getLevelProperties(activeLevel),
			root = api.getRoot(),
			which = fakeKey || e.which;
		
		switch(which) {
			
			case keyboardControls.right:
				if(currentLevel.depth < 2) {
					var element = root.find('> ul > li').filter('.current').next('li');
					if(element.length) {
						api.goTo(element);
					}
				}
			break;
			
			case keyboardControls.up:
				var currentItem;
				if(currentLevel.depth == 0) {
					currentItem = activeLevel.find('li.current > div > ul > li.current');
				}
				else {
					currentItem = activeLevel.find('li.current');
				}
				var newCurrent = currentItem.prev('li');
				if(newCurrent.length) {
					api.goTo(newCurrent);
				}	
			break;
			
			case keyboardControls.left:
				if(currentLevel.depth < 2) {
					var element = root.find('> ul > li').filter('.current').prev('li');
					
				}
				else {
					var element = root.find('> ul > li.current > div > ul > li.current');
					
				}
				if(element.length) {
					api.goTo(element);
				}
			break;
			
			case keyboardControls.down:
				var currentItem;
				if(currentLevel.depth == 0) {
					 currentItem = activeLevel.find('li.current > div > ul > li.current');
				}
				else {
					currentItem = activeLevel.find('li.current');
				}
				var newCurrent = currentItem.next('li');
				if(newCurrent.length) {
					api.goTo(newCurrent);
				}
			break;
			
			case keyboardControls.enter:
				var childMenu;
				// Go slightly deeper if its on the top level.
				if(currentLevel.depth == 0) {
					childMenu = activeLevel.find('li.current > div > ul > li.current > div > ul');
					api.openChild(activeLevel.find('li.current > div > ul > li.current'));
				}
				else {
					childMenu = activeLevel.find('li.current > div > ul');
					api.openChild(activeLevel.find('li.current'));
				}
			break;
		}
		
	});
	
	
	window.scrollTo(0, 1);

		touchMove = function(event) {
			// Prevent scrolling on this element
			event.preventDefault();
		}
	
	$omb.bind('swipeleft', function(e) {
		// console.log
		$(window).trigger('keyup', [keyboardControls.right]);
		return false;
	}).bind('swiperight', function(e) {
		$(window).trigger('keyup', [keyboardControls.left]);
		return false;
	}).bind('swipeup', function(e) {
		e.preventDefault();
		$(window).trigger('keyup', [keyboardControls.down]);
		return false;
	}).bind('swipedown', function(e) {
		e.preventDefault();
		$(window).trigger('keyup', [keyboardControls.up]);
		return false;
	});
	
});