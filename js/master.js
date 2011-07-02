$(function() {
	

	/**
	 * Initiate XMB
	 */
	
	var $xmb = $('.xmb-outer');
	$xmb.xmb({
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
				inner: '.xmb',
				direction: 'left',
				offset: function(index) {
					return ($(window).width() * 0.2); // (2x 10%)
				}
			},
			1: {
				state: 'standard',
				itemHeight: 60,
				offset: function(newCurrent) {
					if(newCurrent.index() == 0) {
						return 0;
					}
					else {
						return -160;
					}
				},
				/*
				offset: function(newCurrent) {
					if(newCurrent.index() == 0) {
						return 0;
					}
					else if(newCurrent.index() == 1) {
						return 10;
					}
					else if(newCurrent.index() >= 2) {
						return -120;
					}
				},
				*/
				onMove: function(items, newCurrent) {
					// Set 'before-current' for animations
					/* items.removeClass('before-current');
					var prev = newCurrent.prev('li');
					if(prev.length) {
						prev.addClass('before-current');

					} */
				}
			},
			2: {
				offset: '-17px'
			}
		}
	});
	
	var api = $xmb.data('xmb');

});