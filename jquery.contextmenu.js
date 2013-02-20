/**
 * jQuery plugin for Pretty looking right click context menu.
 *
 * Requires popup.js and popup.css to be included in your page. And jQuery, obviously.
 *
 * Usage:
 *
 *   $('.something').contextPopup({
 *     title: 'Some title',
 *     items: [
 *       {label:'My Item', icon:'/some/icon1.png', action:function() { alert('hi'); }},
 *       {label:'Item #2', icon:'/some/icon2.png', action:function() { alert('yo'); }},
 *       null, // divider
 *       {label:'Blahhhh', icon:'/some/icon3.png', action:function() { alert('bye'); }},
 *     ]
 *   });
 *
 * Icon needs to be 16x16. I recommend the Fugue icon set from: http://p.yusukekamiyamane.com/ 
 *
 * - Joe Walnes, 2011 http://joewalnes.com/
 *   https://github.com/joewalnes/jquery-simple-context-menu
 *
 * Modified by Oliver Dozsa.
 *
 * MIT License: https://github.com/joewalnes/jquery-simple-context-menu/blob/master/LICENSE.txt
 */
jQuery.fn.contextPopup = function(menuData)
{
	// Define default settings
	var settings = 
	{
		contextMenuClass: 'contextMenuPlugin',
		gutterLineClass: 'gutterLine',
		headerClass: 'header',
		seperatorClass: 'divider',
		title: '',
		items: [],
		currentMenu: undefined,
		bgMenuDrawArea: undefined,
		bgMenuGuard: undefined,
		isRemoveAnimationRunning: false
	};
	
	// merge them
	$.extend(settings, menuData);

	// Build popup menu HTML
	function createMenu(e)
	{
		var menu = 
				$('<ul class="' + settings.contextMenuClass + '"><div class="' + settings.gutterLineClass + '"></div></ul>')
				.appendTo(document.body);
				
		if(settings.title)
		{
			$('<li class="' + settings.headerClass + '"></li>').text(settings.title).appendTo(menu);
		}
		
		settings.items.forEach(function(item)
		{
			if(item)
			{
				var rowCode = '<li><a href="#"><span></span></a></li>';
				
				var row = $(rowCode).appendTo(menu);
				if(item.icon)
				{
					var icon = $('<img>');
					icon.attr('src', item.icon);
					icon.insertBefore(row.find('span'));
				}
				
				row.find('span').text(item.label);
				
				if (item.action)
				{
					row.find('a').click(function(){ item.action(e); });
				}
			}
			else
			{
				$('<li class="' + settings.seperatorClass + '"></li>').appendTo(menu);
			}
	});
	menu.find('.' + settings.headerClass ).text(settings.title);
	
	settings.currentMenu = menu;
  }
  
	/**
	 * Removes the menu.
	 */
	function removeMenu()
	{	
		if(settings.currentMenu != undefined)
		{	
			settings.currentMenu.remove();
			settings.bgMenuDrawArea.remove();
			settings.bgMenuGuard.remove();
			
			settings.currentMenu    = undefined;
			settings.bgMenuDrawArea = undefined;
			settings.bgMenuGuard    = undefined;
		}
	}
	
	/**
	 * Removes the menu with animation.
	 */
	function removeWithAnimation()
	{
		if(!settings.isRemoveAnimationRunning)
		{
			settings.isRemoveAnimationRunning = true;
			
			settings.currentMenu.hide
			(
				"fast",
				function()
				{
					removeMenu();
					
					settings.isRemoveAnimationRunning = false;
				}
			);
		}
	}
	
	/**
	 * Shows the menu (with animation).
	 */
	function showMenu()
	{	
		settings.currentMenu.show("fast");
	}
	
	/**
	 * Event handler function for showing the context menu.
	 */
	function contextMenuHandler(e)
	{
		// If there's a remove animation running, stop it.
		if(settings.isRemoveAnimationRunning)
		{
			settings.currentMenu.stop(true, true);
			settings.isRemoveAnimationRunning = false;
		}
		
		// Remove, if needed.
		removeMenu();
		
		createMenu(e);

		/* Store the menu draw area. */
		settings.bgMenuDrawArea = $("<div></div>")
			.css({position: "absolute", width: "inherit", height: "inherit", zIndex: 1000001})
			.prependTo(this)
			.bind("click", function(){ removeWithAnimation(); });

		var left = e.pageX + 5, /* nudge to the right, so the pointer is covering the title */
			top = e.pageY;
		if(top + settings.currentMenu.height() >= $(window).height())
		{
			top -= settings.currentMenu.height();
		}
		if(left + settings.currentMenu.width() >= $(window).width())
		{
			left -= settings.currentMenu.width();
		}

		// Create and show menu
		settings.currentMenu.css({zIndex:1000002, left:left, top:top})
		  .bind('contextmenu', function() { return false; });

		// Cover rest of page with invisible div that when clicked will cancel the popup.
		settings.bgMenuGuard = $('<div></div>')
		  .css({left:0, top:0, width:'100%', height:'100%', position:'absolute', zIndex:1000000})
		  .appendTo(document.body)
		  .bind('contextmenu click', function() {
			// If click or right click anywhere else on page: remove clean up.
			removeWithAnimation();
			
			return false;
		  });

		// When clicking on a link in menu: clean up (in addition to handlers on link already)
		settings.currentMenu.find('a').click(function()
		{
			removeWithAnimation();
		});
		
		/* Show the menu at last. */
		showMenu();

		// Cancel event, so real browser popup doesn't appear.
		return false;
	}

	// On contextmenu event (right click)
	this.bind('contextmenu', contextMenuHandler);

  return this;
};

