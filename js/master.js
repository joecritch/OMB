$(function() {
	
	var $xmb = $('.xmb-outer');
	$xmb.xmb({
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
		levels: {
			0: {
				state: 'standard',
				inner: '.xmb',
				direction: 'left',
				offset: function(index) {
					return ($(window).width() * 0.28);
				}
			},
			1: {
				state: 'standard',
				offset: function(newCurrent) {
					if(newCurrent.index() == 0) {
						return 0;
					}
					else if(newCurrent.index() == 1) {
						return 5;
					}
					else if(newCurrent.index() >= 2) {
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
				}
			},
			2: {
				offset: '10px'
			}
		}
	});
	
	var api = $xmb.data('xmb');

});