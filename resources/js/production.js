var prod = {};
prod.slideshowLimit = 15;

prod.navCollapsibleClick = function (collapsible) {
	collapsible.toggleClass("navCollapsed");
	collapsible.find("> ul").slideToggle();
	//when opening, close open siblings
	if (!collapsible.hasClass("navCollapsed")) {
		collapsible
			.siblings(".navCollapsible:not(.navCollapsed)")
			.each(function () {
				$ec(this).toggleClass("navCollapsed");
				$ec(this).find("> ul").slideToggle();
			});
	}
};
prod.navCollapsibleOpenSelected = function (nav) {
	//modify this on closing mobile panel so user doesn't see animation when opening
	if (!$ec("body").hasClass("mobilePanelActive")) {
		nav.find(".sideNavSelected.navCollapsed").each(function () {
			//open all selected collapsible pages and groups
			//this also closes the non-selected ones by consequence
			prod.navCollapsibleClick($ec(this));
		});
		nav
			.find(".navCollapsible:not(.navCollapsed):not(.sideNavSelected)")
			.each(function () {
				//close any child collapsibles that aren't selected
				prod.navCollapsibleClick($ec(this));
			});
	}
};

prod.error = function (handler) {
	return function (jqXHR, status, error) {
		if (status != "success") {
			//sometimes error is incorrectly called, when it is a success
			if (jqXHR.status >= 400 && jqXHR.status <= 599) {
				//This was likely an exception that we formatted
				var html = $ec.parseHTML(jqXHR.responseText.trim());
				var text = "Unknown";
				$ec.each(html, function () {
					if ($ec(this).find(".errorMessage").length > 0) {
						text = $ec(this).find(".errorMessage").html();
					}
				});
				handler("ERROR: " + text);
			} else {
				alert(
					"There was an error communicating with the server:" +
						status +
						": " +
						error,
				);
			}
		}
	};
};

prod.checkMegaMenus = function () {
	var listMegaMenu = $ec(".megaMenu");
	listMegaMenu.each(function (index, element) {
		var ulM = $ec(element).find(">ul");
		ulM.css("display", "block"); //Needs to have a position
		var linkWidth = parseInt(ulM.find(">li").css("width"));
		var leftGroupObj = ulM.find(">li:first-child");
		if (leftGroupObj.length) {
			var leftGroup = leftGroupObj.offset().left;
			var rightGroup = ulM
				.find(">li:last-child")[0]
				.getBoundingClientRect().right;
			var diffGroup = rightGroup - leftGroup;
			var diffSpace = ulM.width(); //does not include padding
			ulM.css("display", "");

			var colSize = parseInt(ulM.css("column-count"));
			while (diffGroup <= diffSpace - linkWidth && colSize > 0) {
				colSize = colSize - 1;
				diffSpace = diffSpace - linkWidth;
			}
			ulM.css("column-count", colSize);
			ulM.css("-moz-column-count", colSize);
			ulM.css("-webkit-column-count", colSize);
		}
	});
};

prod.setOrigSiteWidth = function () {
	prod.origSiteWidth = $ec("#siteWidthIndicator").width();
};
prod.checkMobile = function (isInitialSetup) {
	//the sizeContentDivs stuff needs to run after the core sizing the first time the page loads
	if (prod.isMobile()) {
		if (!isInitialSetup) {
			prod.removeSizeContentDivs();
			prod.setFooterHeight();
			prod.setOrigSiteWidth();
			//set up tabs sections when switching from desktop to mobile
			prod.tabsToAccordion();
		}
		if (
			$ec(".slideshowModule.vimeoMode").length > 0 &&
			!$ec(".slideshowModule.vimeoMode").hasClass("playerControlsOn")
		) {
			//Show controls on mobile
			if ($ec("#vimeoDesktop").attr("src").indexOf("&controls=0") !== -1) {
				$ec("#vimeoDesktop").attr(
					"src",
					$ec("#vimeoDesktop").attr("src").replace("&controls=0", ""),
				);
			}
		}
		prod.checkMobileSmallColumn();
		prod.fixSectionHeights();
		if (!isInitialSetup) {
			prod.reinitFocusPoint();
		}
	} else {
		if (!isInitialSetup) {
			prod.sizeContentDivs();
			prod.setFooterHeight();
			//set up tabs sections when switching from mobile to desktop
			prod.accordionToTabs();
			prod.reinitFocusPoint();
		}
		if (
			$ec(".slideshowModule.vimeoMode").length > 0 &&
			!$ec(".slideshowModule.vimeoMode").hasClass("playerControlsOn")
		) {
			//Hide controls on desktop
			if ($ec("#vimeoDesktop").attr("src").indexOf("&controls=0") == -1) {
				$ec("#vimeoDesktop").attr(
					"src",
					$ec("#vimeoDesktop").attr("src") + "&controls=0",
				);
			}
		}
		if (prod.sticky) {
			prod.initNavSticky();
		}
		//Undo prod.fixSectionHeights(); for resize buttons
		$ec(
			".sectionRegion .sectionButtonModule:not(.sectionButtonMarkedDelete)",
		).removeAttr("style");
	}
	prod.setupMassMode();
	if ($ec("#massModeButtonContainer").length > 0) {
		prod.setupMassModeSticky();
	}
	if (prod.hasMobileNav()) {
		prod.setupMobilePanel();
	} else {
		prod.removeMobilePanel();
	}
	prod.resizeModules($ec("body"));
};

// Whether mobile width or not
prod.isMobile = function () {
	var mobileIndicatorWidth = $ec("#mobileIndicator").width();
	return mobileIndicatorWidth > 0;
};

// Mobile nav can be visible on desktop
prod.hasMobileNav = function () {
	var navIconWidth = $ec("#navicon").width();
	return navIconWidth > 0;
};

prod.mobilePanel = function () {
	try {
		$ec("#background")
			.get(0)
			.addEventListener("click", prod.backgroundClickFunction, true);
	} catch (e) {
		// TODO add handler (but why would the above call fail?)
	}
};

prod.removeMobilePanel = function () {
	var nav = $ec("#nav");
	nav.removeClass("mobile");
	try {
		$ec("#background")
			.get(0)
			.removeEventListener("click", prod.backgroundClickFunction);
	} catch (e) {
		// TODO add handler (but why would the above call fail?)
	}
};

prod.isString = function (value) {
	return typeof value === "string" || value instanceof String;
};

prod.isNumber = function (value) {
	return typeof value === "number" && isFinite(value);
};

//Cookie functions based on those in React
prod.writeCookie = function (name, value, expiration, path, domain, isSecure) {
	var segments = [];
	segments.push(name + "=" + encodeURIComponent(value)),
		prod.isNumber(expiration) &&
			segments.push("expires=" + new Date(expiration).toGMTString()),
		prod.isString(path) && segments.push("path=" + path),
		prod.isString(domain) && segments.push("domain=" + domain),
		isSecure === true && segments.push("secure"),
		(document.cookie = segments.join("; "));
};

prod.setCookie = function (cname, cvalue, exdays) {
	prod.writeCookie(
		cname,
		cvalue,
		Date.now() + exdays * 24 * 60 * 60 * 1000,
		"/",
	);
};

prod.getCookie = function (cname) {
	var i = document.cookie.match(new RegExp("(^|;\\s*)(" + cname + ")=([^;]*)"));
	return i ? decodeURIComponent(i[3]) : "";
};

prod.removeCookie = function (cname, domain, secure) {
	prod.writeCookie(
		cname,
		"",
		Date.now() - 24 * 60 * 60 * 1000,
		"/",
		domain,
		secure,
	);
};

prod.setupMassMode = function () {
	var massMode = $ec("#massModePlaceholder");
	if (massMode.length > 0) {
		var getUrl = massMode.attr("getUrl");
		prod.get(
			getUrl,
			null,
			function (result) {
				var container = $ec(document.createElement("div"));
				container.html(result);

				if (container.find("#massModeToday").length > 0) {
					//get the current date/time in the site time zone
					var timeZoneID = container.find("#massModeToday").data("timezone");
					var currentDateTime = new Date(
						new Date().toLocaleString("en-US", { timeZone: timeZoneID }),
					);

					var day = null;
					var vigil = null;
					container.find("#massModeToday .massModeTimes").each(function () {
						var date = $ec(this).data("date").split("T")[0].replace(/-/g, "/"); //replace dashes with forward slashes for safari compatibility https://stackoverflow.com/a/31732581
						var dayDate = new Date(date);
						if (currentDateTime.getDate() === dayDate.getDate()) {
							day = $ec(this);
							return;
						} else if (currentDateTime.getHours() >= 12) {
							dayDate.setDate(dayDate.getDate() - 1);
							if (currentDateTime.getDate() === dayDate.getDate()) {
								vigil = $ec(this);
								return;
							}
						}
						$ec(this).remove();
					});

					if (day !== null) {
						//remove vigil times
						day.find(".day[class*='VIGIL']").each(function () {
							$ec(this).parent(".sacramentDay").remove();
						});

						//remove any times that have already passed (i.e. started >15 minutes ago)
						day.find(".startTime").each(function () {
							var hr = Math.floor($ec(this).data("start") / 60);
							var min = $ec(this).data("start") % 60;
							var mass = new Date(currentDateTime.getTime());
							mass.setHours(hr);
							mass.setMinutes(min + 15); //add 15 minute adjustment to mass start time
							mass.setSeconds(0);
							if (currentDateTime > mass) {
								$ec(this).parent(".sacramentTime").remove();
							}
						});

						//if left with no times, remove day entirely
						if (day.find(".startTime").length === 0) {
							day.remove();
							day = null;
						} else {
							container
								.find("#massModeToday.massModeSacramentTimes")
								.addClass("onlyHolyDay");
							if (vigil !== null) {
								vigil.remove();
								vigil = null;
							}
						}
					}
					if (day === null && vigil !== null) {
						//remove any past vigil times
						vigil
							.find(".day[class*='VIGIL'] + .sacramentGroup .startTime")
							.each(function () {
								var hr = Math.floor($ec(this).data("start") / 60);
								var min = $ec(this).data("start") % 60;
								var mass = new Date(currentDateTime.getTime());
								mass.setHours(hr);
								mass.setMinutes(min + 15); //add 15 minute adjustment to mass start time
								mass.setSeconds(0);
								if (currentDateTime > mass) {
									$ec(this).parent(".sacramentTime").remove();
								}
							});
						if (
							vigil.find(".day[class*='VIGIL'] + .sacramentGroup .startTime")
								.length === 0
						) {
							vigil.find(".sacramentDay:first-child").remove();
						}

						//if all times gone then remove day
						//(this would be a weird case where there are only vigil masses entered)
						if (vigil.find(".startTime").length === 0) {
							vigil.remove();
						}
					}

					//if tab is empty, remove the tab
					if (container.find("#massModeToday .massModeTimes").length === 0) {
						if (container.find("#massModeToday").hasClass("alertsOnly")) {
							//if set to display alerts only, do not display button
							return;
						} else {
							container.find("#massModeToday").remove();
							container.find("a[href='#massModeToday']").parent("li").remove();
						}
					} else {
						container.find("#massModeContainer").addClass("hasActiveDay");
					}
				}

				$ec("#massModePlaceholder").replaceWith(container.html());

				massMode = $ec("#massModeContainer");
				if (massMode.length === 0) {
					return;
				}
				$ec("#background").addClass("hasMassTimes");

				if (massMode.find(".massModeTabs").data("ui-tabs")) {
					return;
				}
				let setCookieOnClose = false;
				if (massMode.hasClass("hasActiveDay") && typeof admin === "undefined") {
					//if has active day, then need to open by default
					//and need to save cookie upon closing
					const closed = prod.getCookie("closedMassMode");
					if (!closed) {
						setTimeout(function () {
							$ec("body").addClass("massModeActive");
						}, 1000);
						setCookieOnClose = true;
					}
				}
				massMode.find(".massModeTabs").tabs({
					heightStyle: "auto",
				});
				$ec(
					"#massModeModalBackground, #massModeContainer .massModeTitle, #massModeButton",
				).click(function () {
					if (!$ec("body").hasClass("massModeActive")) {
						$ec("body").addClass("massModeActive");
					} else {
						massMode.scrollTop(0);
						$ec("body").removeClass("massModeActive");
						if (setCookieOnClose) {
							prod.setCookie("closedMassMode", true, 1);
							setCookieOnClose = false;
						}
					}
				});
				//when clicking on video link, need to save cookie so it doesn't open again on new page
				$ec("#massModeContainer .videoIconLink a").click(function () {
					prod.setCookie("closedMassMode", true, 1);
				});
				if (typeof admin !== "undefined") {
					admin.activateEditable($ec("#massModeButtonContainer"));
					admin.activateHoverable($ec("#massModeButtonContainer"));
					admin.activateAdminModuleButtons($ec("#massModeButtonContainer"));
				}
				prod.setupMassModeSticky();
			},
			function () {
				$ec("#massModePlaceholder").remove();
			},
		);
	}
};

prod.setupMassModeSticky = function () {
	if (
		!prod.isMobile() &&
		$ec(window).width() <
			$ec("#core").width() + 2 * $ec("#massModeButtonContainer").width()
	) {
		$ec(window).off("scroll", prod.updateMassModeSticky);
		var adminBarHeight = 0;
		if (
			$ec("#background.admin").length ||
			$ec("body.preview.showPreviewToolbar").length
		) {
			if ($ec("#adminToolbar").length) {
				adminBarHeight += $ec("#adminToolbar").height();
			}
			if ($ec("#adminMessage").length) {
				adminBarHeight += $ec("#adminMessage").height();
			}
		}
		prod.massModeStickyBottom =
			$ec(window).height() +
			$ec(window).scrollTop() -
			adminBarHeight -
			($ec("#massModeButtonContainer").offset().top +
				$ec("#massModeButtonContainer").outerHeight());
		$ec(window).scroll(prod.updateMassModeSticky);
	} else {
		$ec(window).off("scroll", prod.updateMassModeSticky);
	}
};

prod.updateMassModeSticky = function () {
	//on scroll, check if MassMode button covers the login or brand info
	var footerBrand = $ec("#footerBrand");
	var footerLogin = $ec("#footerLinks");
	var massModeButton = $ec("#massModeButtonContainer");

	//gather all edge coordinates based on the origin in the top left
	var footerTopEdge = footerBrand.offset().top;
	var footerLeftEdge = footerLogin.offset().left;
	var footerBottomEdge = footerBrand.offset().top + footerBrand.outerHeight();
	var footerRightEdge = footerBrand.offset().left + footerBrand.outerWidth();
	var buttonLeftEdge = massModeButton.offset().left;
	var buttonRightEdge =
		massModeButton.offset().left + massModeButton.outerWidth();

	//get top and bottom coordinates from original button positioning
	var adminBarHeight = 0;
	if (
		$ec("#background.admin").length ||
		$ec("body.preview.showPreviewToolbar").length
	) {
		if ($ec("#adminToolbar").length) {
			adminBarHeight += $ec("#adminToolbar").height();
		}
		if ($ec("#adminMessage").length) {
			adminBarHeight += $ec("#adminMessage").height();
		}
	}
	var contentHeight =
		$ec(window).height() + $ec(window).scrollTop() - adminBarHeight;
	var buttonTopEdge =
		contentHeight - (prod.massModeStickyBottom + massModeButton.outerHeight());
	var buttonBottomEdge = buttonTopEdge + massModeButton.outerHeight();

	//if overlaps horizontally and vertically, bump up button so that it is above the footer login
	var horizontalOverlap =
		buttonRightEdge > footerLeftEdge && buttonLeftEdge < footerRightEdge;
	var verticalOverlap =
		buttonBottomEdge > footerTopEdge && buttonTopEdge < footerBottomEdge;
	if (horizontalOverlap && verticalOverlap) {
		var stickyBottom = contentHeight - footerTopEdge;
		massModeButton.css("bottom", stickyBottom + "px");
		massModeButton.addClass("movedUp");
	} else if (massModeButton.hasClass("movedUp")) {
		//reset to original value
		massModeButton.css("bottom", prod.massModeStickyBottom + "px");
		massModeButton.removeClass("movedUp");
	}
};

prod.isMobileSetup = false;
prod.closeMobileNavOnDesktopClick = false;
prod.setupMobilePanel = function () {
	if (!prod.isMobileSetup) {
		prod.isMobileSetup = true;
		if (prod.isMobile()) {
			prod.removeNavSticky();
		}

		//copy header elements to the mobile panel
		var panel = $ec("#mobilePanel");
		var search = $ec("#search").clone();
		search.attr("id", "mobileSearch");
		prod.initSearch(search.find(".searchBox"));
		prod.initSearchBoxSubmit(search.find(".searchBoxSubmit"));
		panel.append(search);
		var qls = $ec("#quickLinks").clone();
		qls.attr("id", "mobileQuickLinks");
		panel.append(qls);
		//mobile nav - move to end
		var nav = $ec("#mobileNav");
		panel.append(nav);

		//create function to be executed on background click
		prod.backgroundClickFunction = function (e) {
			if ($ec("body").hasClass("mobilePanelActive") && prod.hasMobileNav()) {
				//navicon should always close mobile panel
				//on mobile, clicking a background element that is outside of the mobile panel should close mobile panel
				if (
					(e.target.id === "#navicon" ||
						((prod.closeMobileNavOnDesktopClick || prod.isMobile()) &&
							$ec(e.target).parents("#mobilePanel").length === 0)) &&
					!$ec(e.target).parents("#socialMediaBody").length
				) {
					$ec("body").toggleClass("mobilePanelActive");
					prod.navCollapsibleOpenSelected($ec("#mobileNav"));
					e.preventDefault();
					e.stopPropagation();
				}
			}
		};

		prod.mobilePanel();
	} else {
		prod.mobilePanel();
	}
};

prod.checkMobileSmallColumn = function () {
	//if side nav is only module in column and is hidden on mobile, then hide column
	var modules = $ec("#content2 > li");
	if (modules.length == 1) {
		if (!modules.first().is(":visible")) {
			$ec("#content2").addClass("hideMobileColumn");
		}
	}
};

prod.resizeNav = function (secondRun) {
	if (!prod.noResize) {
		if ($ec("#nav").width() <= 5 || $ec("#nav").height() <= 5) {
			//[DEV-549] - Otherwise runs infinitely
			$ec(window).on("load", function () {
				prod.resizeNav(secondRun);
			});
		} else {
			$ec("#nav").removeClass("resize");
			for (var i = $ec("#nav > ul > li").length - 1; i >= 0; i--) {
				if ($ec("#nav").width() < $ec("#nav > ul").width()) {
					$ec($ec("#nav > ul > li").get(i)).hide();
					$ec("#sideTabNav").addClass("navDropped");
				} else {
					break;
				}
			}
			$ec("#nav").addClass("resize");
		}
		if (!secondRun) {
			$ec("#nav > ul > li").hover(function () {
				var submenu = $ec(this).children("ul");
				var width = submenu.outerWidth() + $ec(this).position().left;
				var moveLeft = $ec("#nav").width() - width;
				if (moveLeft > 0) {
					moveLeft = "0px";
				}
				submenu.css({ marginLeft: moveLeft });
			});
			//Rerun after fonts have loaded
			$ec(window).on("load", function () {
				var hiddenItems = $ec("#nav > ul > li");
				if (hiddenItems.length > 0) {
					hiddenItems.show();
				}
				prod.resizeNav(true);
			});
		}
	}
};

prod.initNavSticky = function () {
	prod.removeNavSticky();
	var adminBarHeight = 0;
	if (
		$ec("#background.admin").length ||
		$ec("body.preview.showPreviewToolbar").length
	) {
		if ($ec("#adminToolbar").length) {
			adminBarHeight += $ec("#adminToolbar").height();
		}
		if ($ec("#adminMessage").length) {
			adminBarHeight += $ec("#adminMessage").height();
		}
	}
	prod.stickyNavTop = $ec("#nav").offset().top - adminBarHeight;
	prod.origStickyNavTop = parseInt($ec("#nav").css("top"));
	$ec(window).scroll(prod.updateNavSticky);
	prod.updateNavSticky();
};
prod.updateNavSticky = function () {
	var scrollTop = $ec(window).scrollTop();
	var navBar = $ec("#nav").width();

	if (scrollTop > prod.stickyNavTop) {
		var windowOffset = parseInt($ec("#background").css("border-top-width"));
		//position on the top
		$ec("#nav").css("position", "fixed");
		$ec("#nav").css("top", windowOffset + "px");
		$ec("#nav").css("left", "50%");
		$ec("#nav").css("margin-left", "-" + navBar / 2 + "px");
		$ec("#navBackground").css("position", "fixed");
		$ec("#navBackground").css("top", windowOffset + "px");
		$ec("#navBackground").addClass("navSticky");
	} else {
		//original value
		$ec("#nav").css("position", "absolute");
		$ec("#nav").css("top", prod.stickyNavTop + "px");
		$ec("#navBackground").css("position", "absolute");
		$ec("#navBackground").css("top", prod.stickyNavTop + "px");
		$ec("#navBackground").removeClass("navSticky");
	}
};
prod.removeNavSticky = function () {
	$ec("#nav").css("position", "");
	$ec("#nav").css("top", "");
	$ec("#nav").css("left", "");
	$ec("#nav").css("margin-left", "");
	$ec("#navBackground").css("position", "");
	$ec("#navBackground").css("top", "");
};
prod.placeAdminFooterItems = function () {
	var footerBackground = $ec("#footerBackground");
	var footerOffset = footerBackground.offset();
	var footer = footerBackground.find("#footer");
	if (footer.css("position") !== "static") {
		footerOffset = footer.offset();
	}
	var placeFooterItem = function (item, placeholder, parentRelativeOffset) {
		if (placeholder.length) {
			item.css("position", "absolute").addClass("relocated");
			placeholder.css({ width: item.width(), height: item.height() });
			if (placeholder.is("span")) {
				placeholder.css({ display: "inline-block" });
			}
			if (!parentRelativeOffset) {
				parentRelativeOffset = footerOffset;
			}
			var destination = placeholder.offset();
			item.css({
				top: destination.top - parentRelativeOffset.top,
				bottom: "auto",
				left: destination.left - parentRelativeOffset.left,
				margin: 0,
			});
		} else {
			placeholder.removeAttr("style");
			item.removeClass("relocated").removeAttr("style");
		}
	};
	placeFooterItem(
		footer.find("#footerGroup"),
		footer.find("#insertFooterGroup"),
	);
	var footerSocialMedia = footer.find("#footerSocialMedia");
	if (footerSocialMedia.length) {
		placeFooterItem(footerSocialMedia, footer.find("#insertFooterSocialMedia"));
	}
	var insertFooterYear = footer
		.find(".insertFooterYear")
		.html("&ZeroWidthSpace;");
};
prod.moveFooterItems = function () {
	var footer = $ec("#footer");
	var fsmPlaceholder = footer.find("#insertFooterSocialMedia");
	var fgPlaceholder = footer.find("#insertFooterGroup");
	var yPlaceholder = footer.find(".insertFooterYear");
	// Add year CSS variable
	$ec("body")
		.get(0)
		.style.setProperty("--currentYear", new Date().getFullYear());
	if (!fsmPlaceholder.length && !fgPlaceholder.length && !yPlaceholder.length) {
		return;
	}
	if ($ec("#background.admin").length) {
		// Positions the footer social media and footer group over the footer text element
		prod.placeAdminFooterItems();
		$ec(window).on("resize", prod.placeAdminFooterItems);
		// Manually defined in admin_moduleTray.js for Froala
	} else {
		// Inserts the footer social media and footer group in footer text element
		if (fsmPlaceholder.length && footer.find("#footerSocialMedia").length) {
			footer
				.find("#footerSocialMedia")
				.detach()
				.appendTo(fsmPlaceholder.text(""));
		}
		if (fgPlaceholder.length) {
			footer.find("#footerGroup").detach().appendTo(fgPlaceholder.text(""));
		}
		if (yPlaceholder.length) {
			yPlaceholder.text(new Date().getFullYear());
		}
	}
};
prod.setFooterHeight = function () {
	var footerBackground = $ec("#footerBackground");
	var footerHeight = footerBackground.outerHeight(true);
	if (document.getElementById("background") != null) {
		var pseudoAfterHeight = parseInt(
			window
				.getComputedStyle(document.getElementById("background"), ":after")
				.getPropertyValue("height"),
		); //getting height of pseudo element - https://stackoverflow.com/a/44912365/8821716
		if (footerHeight != pseudoAfterHeight) {
			footerBackground.css("position", "absolute");
			//avoid adding to <head> if the value hasn't changed
			$ec("head").append(
				"<style>#background:after{height:" + footerHeight + "px}</style>",
			); //generated content is not in the DOM so jquery can't touch it - you need to insert CSS to change it
			if ($ec("#background.admin").length) {
				prod.placeAdminFooterItems();
			}
		}
	}
};
prod.sizeCore = function () {
	var core = $ec("#core");

	// FIXME the administration page doesn't have a core; do we need to be doing any resizing that may be getting skipped because of this?
	if (!core.length || core.hasClass("section")) {
		return;
	}

	var footer = $ec("#footer");
	//coreBottom: height and bottom margin (include margin then subtract margin top to avoid duplication)
	var coreBottom =
		core.offset().top +
		core.outerHeight(true) -
		core.css("margin-top").replace("px", "");
	var footerBottom = footer.offset().top;
	var diff = footerBottom - coreBottom;
	// stick height to at least 10px if there's little or no content
	var newHeight = core.height() + diff;
	if (newHeight < 50) {
		core.css("min-height", 50);
	} else {
		core.css("min-height", newHeight);
	}
};
//section region module heights on mobile need to be fixed to preserve visible content
prod.fixSectionHeights = function () {
	var sectionRegion = $ec(".sectionRegion");

	if (!sectionRegion.length) {
		return;
	}

	//for fixed height sections, calculate and set height of modules
	sectionRegion
		.find(".sectionInner.hasFixedHeight:not(.buttonsSection)")
		.each(function () {
			var height = $ec(this)[0].style.height.replace("px", "");
			if (height == 0) {
				var sectionClone = $ec(this)
					.clone()
					.insertAfter($ec(this))
					.css("width", prod.origSiteWidth)
					.addClass("clonedMobileSection");
				height = sectionClone.height();
				sectionClone.remove();
			}

			//create temporary clones of header and footer and make full width to calculate their height on desktop
			//classes added for mobile styling exclusion
			var headerClone = $ec(this)
				.find("> header")
				.clone()
				.appendTo($ec(this))
				.css("width", prod.origSiteWidth)
				.addClass("clonedMobileHeader");
			var headerHeight = headerClone.outerHeight();
			headerClone.remove();
			var footerClone = $ec(this)
				.find("> footer")
				.clone()
				.appendTo($ec(this))
				.css("width", prod.origSiteWidth)
				.addClass("clonedMobileFooter");
			var footerHeight = footerClone.outerHeight();
			footerClone.remove();

			height = height - headerHeight - footerHeight;
			$ec(this)
				.find(".modulePosition > li")
				.each(function () {
					var moduleInner = $ec(this).find(".moduleInner");
					if (!moduleInner.is(".markedDelete, .buttonModule")) {
						$ec(this).css("height", height);
					}
				});
		});

	//for section button modules, calculate and set height of modules
	sectionRegion.find(".sectionInner").each(function () {
		var section = $ec(this);
		if (
			section.find(".sectionButtonModule:not(.sectionButtonMarkedDelete)")
				.length
		) {
			//create temporary clone of section and make full width to calculate its height on desktop
			//class added for mobile styling exclusion
			var sectionClone = section
				.clone()
				.css("width", prod.origSiteWidth)
				.addClass("clonedMobileSection")
				.insertAfter(section);
			section
				.find(".sectionButtonModule:not(.sectionButtonMarkedDelete)")
				.each(function () {
					if ($ec(this).attr("id")) {
						var clonedItem = sectionClone
							.find("#" + $ec(this).attr("id"))
							.removeAttr("style")
							.parent();
						var desktopHeight = clonedItem.innerHeight();
						var desktopWidth = clonedItem.innerWidth();
						var maxWidth = $ec(this).closest(".sectionBody").innerWidth();
						if (desktopWidth > maxWidth) {
							$ec(this).css("width", desktopWidth);
							$ec(this).css(
								"transform",
								"scale(" + maxWidth / desktopWidth + ")",
							);
							$ec(this).css(
								"margin-left",
								($ec(this).parent().innerWidth() - maxWidth) / 2,
							);
							$ec(this).css(
								"margin-top",
								desktopHeight * (maxWidth / desktopWidth - 1),
							);
						} else {
							$ec(this).removeAttr("style");
						}
						$ec(this).css("height", desktopHeight);
					}
				});
			sectionClone.remove();
		}
	});
};
prod.sizeContentDivs = function () {
	var core = $ec("#core");

	// FIXME the administration page doesn't have a core; do we need to be doing any resizing that may be getting skipped because of this?
	if (!core.length || core.hasClass("section")) {
		return;
	}

	var contents = $ec("#content1, #content2, #content3, #section1");
	var bottomHorizontals = $ec("#bottomHorizontal1, #bottomHorizontal2");
	//coreBottom: height and padding/border on only the top (include it all and subtract off the bottom)
	var coreBottom =
		core.offset().top +
		core.outerHeight() -
		core.css("padding-bottom").replace("px", "") -
		core.css("border-bottom-width").replace("px", "");
	var bottomHorizontalHeight = 0;
	bottomHorizontals.each(function () {
		var bottomHorizontal = $ec(this);
		bottomHorizontalHeight += bottomHorizontal.outerHeight(true);
	});
	contents.each(function () {
		var content = $ec(this);
		//contentbottom: height and bottom margin (include margin then subtract margin top to avoid duplication)
		var contentbottom =
			content.offset().top +
			content.outerHeight(true) -
			content.css("margin-top").replace("px", "");
		var diff = coreBottom - contentbottom - bottomHorizontalHeight;
		// stick height to at least 10px if there's little or no content
		var newHeight = content.outerHeight() + diff;
		if (newHeight < 50) {
			content.css("min-height", 50);
		} else {
			content.css("min-height", newHeight);
		}
	});
};
prod.removeSizeContentDivs = function () {
	var contents = $ec("#content1, #content2, #content3, #section1");
	contents.css("min-height", "");
};

prod.initModules = function (selector) {
	prod.initCalendar(selector.find(".calendarModule"));
	prod.initMail(selector.find(".mail"));
	prod.initSlideshow();
	initPhotoSwipeFromDOM(".galleryAlbum");
	prod.initSearch($ec(".searchBox"));
	prod.initSearchBoxSubmit($ec(".searchBoxSubmit"));
	prod.initSearchPopup();
	prod.initEventLocation(selector.find(".locationNameButton"));
	prod.initOnlineForm(selector.find(".onlineFormModule"));
	selector
		.find(".registrationModule, .reRegistrationModule, .connectModule")
		.each(function () {
			prod.initRegistrationForm($ec(this));
		});
	prod.initFlocknoteSignup(selector.find(".flocknoteSignups"));

	prod.initFacebookInstagramModule(selector);

	prod.initTwitter(selector.find(".twitterModule"));
	prod.initInfoButtons();
	prod.paymentForm.init();
	selector.find(".eCatholicLiveCountdownModule").each(function () {
		prod.initLiveCountdown($ec(this));
	});
	prod.initDynamicThumbs(selector);
	selector.find(".tabsSection").each(function () {
		prod.initTabsSection($ec(this));
	});
	selector.find(".focusPointImage").each(function () {
		prod.initFocusPoint($ec(this));
	});
	if (!$ec("#background.admin").length) {
		selector.find(".moduleInner").each(function () {
			var $this = $ec(this);
			if (!$this.find(".moduleTitle").length) {
				$this.addClass("moduleTitleHidden");
			}
			if (!$this.find(".moduleSubtitle").length) {
				$this.addClass("moduleSubtitleHidden");
			}
		});
		selector.find(".sectionInner").each(function () {
			var $this = $ec(this);
			if (!$this.find(".sectionTitle").length) {
				$this.addClass("sectionTitleHidden");
			}
			if (!$this.find(".sectionSubtitle").length) {
				$this.addClass("sectionSubtitleHidden");
			}
		});
	}
	if (
		prod.customInitModules !== undefined &&
		prod.customInitModules instanceof Function
	) {
		try {
			prod.customInitModules(selector);
		} catch (e) {
			console.log(e);
		}
	}
};
prod.initInfoButtons = function () {
	prod.activateInfo($ec(".infoHolder"));
};
prod.calendarButtonLock = false;
prod.initCalendar = function (selector) {
	selector.each(function () {
		$ec(this)
			.find(".hasEvents")
			.click(function () {
				var eventRepository = $ec(this).find(".eventRepository");
				var dayCalendar = $ec(this)
					.parents(".calendarModule")
					.find(".dayCalendar");
				dayCalendar.html(eventRepository.clone(true));
				dayCalendar.removeClass("disabled");
				var monthCalendar = $ec(this)
					.parents(".calendarModule")
					.find(".monthCalendar");
				monthCalendar.addClass("disabled");
				prod.initDynamicThumbs(dayCalendar);
				dayCalendar.find(".backButton").click(function () {
					dayCalendar.addClass("disabled");
					monthCalendar.removeClass("disabled");
				});
			});
		$ec(this)
			.find(".nextButton")
			.click(function () {
				if (!prod.calendarButtonLock) {
					prod.calendarButtonLock = true;
					var module = $ec(this).parents(".calendarModule");
					var monthCalendar = module.find(".monthCalendar");
					var nextMonthUrl = monthCalendar.data("nextmonthurl");
					prod.updateCalendar(nextMonthUrl, monthCalendar);
				}
			});
		$ec(this)
			.find(".lastButton")
			.click(function () {
				if (!prod.calendarButtonLock) {
					prod.calendarButtonLock = true;
					var module = $ec(this).parents(".calendarModule");
					var monthCalendar = module.find(".monthCalendar");
					var lastMonthUrl = monthCalendar.data("lastmonthurl");
					prod.updateCalendar(lastMonthUrl, monthCalendar);
				}
			});
	});
};
prod.updateCalendar = function (url, monthCalendar) {
	var module = monthCalendar.parents(".calendarModule");
	prod.get(
		url,
		null,
		function (result) {
			monthCalendar.after(prod.noscript(result));
			monthCalendar.remove();
			prod.initCalendar(module);
			prod.initInfoButtons();
			if (
				typeof admin != "undefined" &&
				typeof admin.resetupCalendar != "undefined"
			) {
				//code for admin
				admin.resetupCalendar();
				if (
					admin.saveMonthCalendarDate != undefined &&
					admin.saveMonthCalendarDate != ""
				) {
					$ec(
						'.dayCalendarTitle[calendarDay="' +
							admin.saveMonthCalendarDate +
							'"]',
					).click();
					admin.saveMonthCalendarDate = "";
				}
			}
			prod.calendarButtonLock = false;
		},
		null,
	);
};
prod.initMail = function (selector) {
	selector.mouseenter(function () {
		var $this = $ec(this);
		var localMail = $this.find(".localMail").html();
		var domainMail = $this.find(".domainMail").html();
		$this.attr("href", "mailto:" + localMail + "@" + domainMail);
	});
};
prod.initSlideshow = function () {
	var slideshow = $ec(".slideshowModule");
	if (slideshow.hasClass("broadcastOn")) {
		var time = slideshow.find(".broadcastTime").html();
		if (time && typeof moment !== "undefined") {
			//uses moment.js to handle timezones because js Date support is inconsistent
			//get broadcast time from module html in cms timezone
			var cmsTime = moment.tz(time, "America/Chicago");
			//convert broadcast time to browser's timezone
			var broadcastTime = cmsTime.tz(moment.tz.guess()).toDate();
			//calculate time remaining to broadcast and add ten second delay
			var now = moment().toDate();
			var timeToBroadcast = broadcastTime.getTime() - now.getTime();
			timeToBroadcast += 10000;

			//if less than a day away, set timer to replace slideshow with player - very large numbers can cause an exception that replaces the slideshow immediately
			if (timeToBroadcast > 0 && timeToBroadcast < 86400000) {
				setTimeout(function () {
					//replace the slideshow with the player iframe
					var embed = slideshow.find(".broadcastEmbed").html();
					if (embed) {
						slideshow.addClass("broadcasting");
						slideshow.find("#rotator").hide();
						slideshow.find(".moduleBody").hide();
						embed = embed.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
						$ec("<div class='moduleBody livePlayerContainer'></div>")
							.html(embed)
							.appendTo(slideshow);
						prod.resizeModules(slideshow);
					} else {
						//fallback to refreshing the page
						location.reload(true);
					}
				}, timeToBroadcast);
			}
		}
	}
	if (slideshow.hasClass("videoMode")) {
		slideshow.parent().parent().addClass("hasVideo");
		if (slideshow.hasClass("captionOn")) {
			slideshow.parent().parent().addClass("hasVideoCaption");
		}
		prod.resizeModules(slideshow);
		prod.resizeWidthAndHeight(slideshow.find(".captionPositioner"));
		slideshow.parent().parent().removeClass("hasCallToActionSlide"); //class added in photorotator.js
		if (slideshow.hasClass("vimeoMode")) {
			if (typeof Vimeo != "undefined") {
				if (slideshow.hasClass("autoplayOn")) {
					var video = $ec("#vimeoDesktop");
					var player = new Vimeo.Player(video[0]);
					player.setVolume(0); //mute fallback for videos from free Vimeo accounts
				} else {
					if (!slideshow.hasClass("playerControlsOn")) {
						var video = slideshow.find("#vimeoDesktop");
						var overlay = slideshow.find("#vimeoBlocker");
						var player = new Vimeo.Player(video);
						player.ready().then(function () {
							$ec(overlay)
								.off()
								.on("click", function () {
									player.getPaused().then(function (paused) {
										if (paused) {
											player.play();
											overlay.removeClass("play");
											overlay.addClass("pause");
										} else {
											player.pause();
											overlay.removeClass("pause");
											overlay.addClass("play");
										}
									});
								});
						});
					}
				}
			}
		}
		if (slideshow.hasClass("callToActionOn")) {
			prod.initializeSVG($ec("#featureSlideshow .callToActionArrow"));
		}
	} else if (typeof Rotator != "undefined") {
		slideshow.parent().parent().removeClass("hasVideo");
		prod.initializeSVG($ec("#featureSlideshow .callToActionArrow"));
	}
	//Load slideshow / gallery
	if ($ec(".rotator").length > 0) {
		var rotatorDivs = $ec(".rotator").each(function () {
			if (
				$ec(this).parent().find(".slideshowPhotoHolder").children().length > 0
			) {
				//has the rotator been loaded?
				var slides = new Array();
				$ec(this)
					.parent()
					.find(".slideshowPhotoHolder")
					.each(function () {
						var slide = new Object();
						$this = $ec(this);
						if ($this.attr("additionalclass") != "") {
							slide.additionalclass = $this.attr("additionalclass");
						}
						slide.img = $this.find(".img").prop("href");
						if ($this.find(".srcset")) {
							slide.srcset = $this.find(".srcset").prop("href");
						}
						if ($this.find(".title")) {
							slide.title = $this.find(".title").html();
						}
						if ($this.find(".caption")) {
							slide.caption = $this.find(".caption").html();
						}
						if ($this.find(".callToAction")) {
							slide.callToAction = $this.find(".callToAction").html();
						}
						if ($this.find(".href")) {
							slide.href = $this.find(".href").text();
							if ($ec("body.preview").length) {
								slide.href = prod.createPreviewLink(slide.href);
							}
						}
						if ($this.find(".target")) {
							slide.target = $this.find(".target").html();
						}
						slides.push(slide);
						$this.remove();
					});
				var slideshowSettings = $ec(this).parent().find(".slideshowSettings");
				var timingSeconds = slideshowSettings.find(".timingSeconds").html();
				if (timingSeconds < 1) {
					timingSeconds = 1;
				}
				var effect = slideshowSettings.find(".effect").html();
				var myRotator = new Rotator(
					slides,
					timingSeconds,
					effect,
					100,
					$ec(this),
					"backBtn",
					"fwdBtn",
					"pauseBtn",
					"shortcuts",
					1,
					1,
				);
			}
		});
	}
};
prod.resizeSiteName = function (siteName, failed) {
	var siteNameBody = siteName.find("#siteNameBody");
	if (siteNameBody.length === 0) {
		return;
	}
	var siteNameHeight = siteName.height();
	var siteNameLines = siteNameBody.find(".line1, .line2");
	var siteNameContainers = siteNameLines.children(".editText, a");
	if (!failed) {
		// Sometimes the old textfill data messes with the calculations
		siteNameBody.css("flex-wrap", "");
		siteNameLines.css("font-size", "");
		siteNameContainers.css("font-size", "");
	}
	var siteNameBodyHeight = siteNameBody.height();
	var siteNameLineWidth1,
		siteNameLineWidth2,
		siteNameLineHeight1,
		siteNameLineHeight2;
	if (siteNameBody.css("display").indexOf("flex") > -1) {
		if (siteNameBody.css("flex-direction") === "row") {
			siteNameLineWidth1 = siteNameBody.find(".line1").width();
			siteNameLineWidth2 = siteNameBody.find(".line2").width();
		} else if (siteNameBody.css("flex-direction") === "column") {
			siteNameBody.css("height", "100%");
			siteNameLineHeight1 = Math.floor(siteNameBody.find(".line1").height());
			siteNameLineHeight2 = Math.floor(siteNameBody.find(".line2").height());
		}
	} else if (siteNameBodyHeight > siteNameHeight) {
		siteNameLineHeight1 = siteNameBody.find(".line1").height();
		siteNameLineHeight2 = siteNameBody.find(".line2").height();
		siteNameBodySpacing = Math.max(
			siteNameBodyHeight - siteNameLineHeight1 - siteNameLineHeight2,
			0,
		);
		siteNameLineHeight1 = Math.floor(
			(siteNameLineHeight1 / (siteNameBodyHeight - siteNameBodySpacing)) *
				(siteNameHeight - siteNameBodySpacing),
		);
		siteNameLineHeight2 = Math.floor(
			(siteNameLineHeight2 / (siteNameBodyHeight - siteNameBodySpacing)) *
				(siteNameHeight - siteNameBodySpacing),
		);
	}
	var failedSizing = false;
	siteNameLines.each(function () {
		var siteNameLine = $ec(this);
		var siteNameFontSize = parseFloat(siteNameLine.css("font-size"), 10); // base 10
		var explicitWidth = null;
		var explicitHeight = null;
		if (siteNameLineWidth1) {
			if (siteNameLine.hasClass("line1")) {
				explicitWidth = siteNameLineWidth1;
			} else {
				explicitWidth = siteNameLineWidth2;
			}
		} else if (siteNameLineHeight1) {
			if (siteNameLine.hasClass("line1")) {
				explicitHeight = siteNameLineHeight1;
			} else {
				explicitHeight = siteNameLineHeight2;
			}
		}
		siteNameLine.textfill({
			innerTag: ".editText, a",
			maxFontPixels: Math.max(siteNameFontSize, 12),
			minFontPixels: 10,
			explicitWidth: explicitWidth,
			explicitHeight: explicitHeight || siteNameHeight,
			changeLineHeight: true,
			fail: function () {
				if (!failed) {
					//An issue happened, set this to the minimum font-size and run again
					siteNameLine.css("font-size", 10);
					siteNameLine.children(".editText, a").css("font-size", 10);
					failedSizing = true;
				} else if (
					explicitWidth != null &&
					siteNameBody.css("flex-wrap") !== "wrap"
				) {
					// Last ditch effort for inline items, set it to wrap
					siteNameBody.css("flex-wrap", "wrap");
					failedSizing = true;
				}
				// If this fails twice in a row, just keep the 10px font-size
			},
		});
		if (failedSizing) {
			prod.resizeSiteName(siteName, true);
			return false; // break out of this loop
		}
	});
};
prod.initSearch = function (element) {
	element.keyup(function (e) {
		if (e.keyCode == 13) {
			//enter key
			prod.search($ec(this));
		}
	});
};
prod.initSearchBoxSubmit = function (element) {
	element.click(function () {
		var searchBox = $ec(this).parent().children(".searchBox");
		prod.search(searchBox);
	});
};
prod.initSearchPopup = function (element) {
	$ec("#searchPopup").on("click", function (event) {
		$ec("#search").addClass("open");
		setTimeout(function () {
			$ec("#header #searchField").get(0).focus();
		}, 1000);
	});
	$ec("#search").on("click keyup", function (event) {
		if (event.target == this || event.keyCode == 27) {
			$ec(this).removeClass("open");
		}
	});
};
prod.search = function (element) {
	var val = element.val();
	if (val != "") {
		var baseUrl = $ec("body").attr("baseUrl");
		var url = baseUrl + "search?query=" + encodeURIComponent(val);
		if (/[\?&]preview$/.test(window.location)) {
			url += "&preview";
		}
		window.location = url;
	}
};
prod.initEventLocation = function (selector) {
	$ec(".toggledLocationContent").hide();
	selector.click(function (e) {
		e.preventDefault();
		$ec(".toggledLocationContent").toggle();
	});
};
prod.initDynamicThumbs = function (selector) {
	selector
		.find(".dynamicThumbImage.load")
		.one("load", function () {
			var $this = $ec(this);
			var parent = $this.parents(".dynamicThumb");
			if (!parent.is(":visible")) {
				return;
			}

			// Constants
			const REF_SIZE = 128; // Reference thumbnail size (128x128)
			const REF_CENTER = REF_SIZE / 2; // Center of original thumbnail (64)

			// Original thumbnail properties
			let zoomFactor = parseFloat($this.attr("zoom"));
			let posX = parseFloat($this.attr("posx")); // Original posX (based on left side)
			let posY = parseFloat($this.attr("posy")); // Original posY (based on top side)

			// Original image dimensions
			let originalWidth = $this[0].naturalWidth;
			let originalHeight = $this[0].naturalHeight;

			// New thumbnail dimensions
			let thumbWidth = parent.width();
			let thumbHeight = parent.height();

			// Find the new scaling factor
			let scaleX = thumbWidth / originalWidth;
			let scaleY = thumbHeight / originalHeight;
			let finalZoom = Math.max(scaleX, scaleY); // Use max to ensure full coverage

			// Normalize posX and posY based on the original zoom factor to the center of the image
			let normalizedPosX = (posX + REF_CENTER) / zoomFactor;
			let normalizedPosY = (posY + REF_CENTER) / zoomFactor;

			// Calculate new scaled dimensions
			let scaledWidth = originalWidth * finalZoom;
			let scaledHeight = originalHeight * finalZoom;

			// Adjust the positions to account for the new zoom and ensure centering remains correct
			let finalPosX = normalizedPosX * finalZoom - thumbWidth / 2;
			let finalPosY = normalizedPosY * finalZoom - thumbHeight / 2;

			// Ensure positions do not exceed bounds
			finalPosX = Math.round(
				Math.max(0, Math.min(finalPosX, scaledWidth - thumbWidth)),
			);
			finalPosY = Math.round(
				Math.max(0, Math.min(finalPosY, scaledHeight - thumbHeight)),
			);

			// Ensure scaled width & height are valid
			let roundedScaledWidth = Math.max(1, Math.round(scaledWidth));
			let roundedScaledHeight = Math.max(1, Math.round(scaledHeight));

			// Final bounds checking
			let boundedFinalPosX = Math.max(
				0,
				Math.min(finalPosX, roundedScaledWidth - Math.round(thumbWidth)),
			);
			let boundedFinalPosY = Math.max(
				0,
				Math.min(finalPosY, roundedScaledHeight - Math.round(thumbHeight)),
			);

			// Apply CSS to position and scale the image
			$this
				.css({
					left: `-${(boundedFinalPosX / roundedScaledWidth) * 100}%`,
					top: `-${(boundedFinalPosY / roundedScaledHeight) * 100}%`,
					width: `${(roundedScaledWidth / thumbWidth) * 100}%`,
					height: `${(roundedScaledHeight / thumbHeight) * 100}%`,
				})
				.removeClass("load")
				.show();
		})
		.each(function () {
			// Fire load event if the image was already cached
			if (this.complete) {
				$ec(this).trigger("load");
			}
		});
};
prod.initTabsSection = function (selector) {
	if (selector.hasClass("tabsView")) {
		prod.initTabsInSection(selector);
	} else {
		prod.initAccordionInSection(selector);
	}
	if (prod.isMobile()) {
		prod.tabsToAccordion();
	}
};
prod.initTabsInSection = function (selector) {
	var tabsBody = selector.find(".sectionBody");
	tabsBody.find(".focusPointImage").each(function () {
		prod.initFocusPoint($ec(this));
	});
	tabsBody.tabs({
		create: function (event, ui) {
			//if admin, switch height to min height to accommodate editing
			if (typeof admin != "undefined") {
				ui.panel.css("min-height", ui.panel.outerHeight());
				ui.panel.height("");
			}
			//remove class that overrides site link styling
			tabsBody.removeClass("ui-widget-content");
			tabsBody.find(".tabContent").removeClass("ui-widget-content");
			prod.openTabByHash();
		},
		activate: function (event, ui) {
			//when switching tabs, reload iframes to avoid videos playing in tabs that are not visible
			ui.oldPanel.find("iframe").each(function () {
				$ec(this).attr("src", $ec(this).attr("src"));
			});
			ui.newPanel.find(".focusPointImage").each(function () {
				prod.initFocusPoint($ec(this));
			});
			//if admin, update height then switch to min height to accommodate editing
			if (typeof admin != "undefined") {
				tabsBody.find(".tabContent").css("min-height", "");
				tabsBody.tabs("refresh");
				ui.newPanel.css("min-height", ui.newPanel.outerHeight());
				ui.newPanel.height("");
			}
			//resize any iframe modules that are now visible
			prod.resizeModules(ui.newPanel);
		},
		heightStyle: "auto",
	});
	//disable any tabs that are marked delete
	selector.find(".tabArea .tab.markedDelete").each(function () {
		tabsBody.tabs("disable", $ec(this).children(".name").attr("href"));
	});
	//activate the first enabled tab
	prod.activateFirstTab(tabsBody);
	//start auto-scroll if turned on
	if (tabsBody.hasClass("autoScrollOn")) {
		var autoScroll = setInterval(
			function () {
				prod.advanceTab(tabsBody);
			},
			tabsBody.attr("data-timingSeconds") * 1000,
		);
		tabsBody.attr("data-interval", autoScroll);
		//stop interval when interacting with tabs
		tabsBody.mousedown(function () {
			clearInterval(autoScroll);
		});
		tabsBody.find("iframe").hover(function () {
			clearInterval(autoScroll);
		});
	}
	prod.openTabByHash();
};
prod.openTabByHash = function () {
	//open tab section's tab if the hash is inside it
	var hash = location.hash;
	if (!hash) {
		return;
	}
	var tab = $ec("body .tabsSection").find(hash).closest(".tabContent");
	if (!tab.length) {
		return;
	}
	var tabsBody = tab.closest(".sectionBody");
	var index = tabsBody
		.find('a[href="#' + tab.attr("id") + '"]')
		.parent()
		.index();
	if (index < 0) {
		return;
	}
	clearInterval(tabsBody.attr("data-interval"));
	tabsBody.tabs("option", "active", index);
	prod.scrollTo(tabsBody.closest(".sectionInner"));
};
prod.activateFirstTab = function (tabsBody) {
	if (tabsBody.data("ui-tabs")) {
		var firstTab = tabsBody
			.find(".tabArea .tab:not(.markedDelete) .name")
			.first();
		var index = tabsBody
			.find('a[href="' + firstTab.attr("href") + '"]')
			.parent()
			.index();
		tabsBody.tabs("option", "active", index);
	}
};
prod.initAccordionInSection = function (selector) {
	var tabsBody = selector.find(".sectionBody");
	var active = tabsBody.hasClass("openFirstAccordion") ? 0 : false;
	tabsBody.accordion({
		header: ".tabContent .tab",
		heightStyle: "content",
		active: active,
		icons: false,
		collapsible: true,
		create: function (event, ui) {
			//remove class that overrides site link styling
			tabsBody.find(".tabContentHolder").removeClass("ui-widget-content");
		},
		activate: function (event, ui) {
			//resize any iframe modules that are now visible
			prod.resizeModules(ui.newPanel);
			ui.newPanel.find(".focusPointImage").each(function () {
				prod.initFocusPoint($ec(this));
			});
		},
	});
	//check url and open accordion if tab id is present
	var hash = location.hash;
	if (hash.indexOf("tabContent_") >= 0) {
		var index = tabsBody
			.find('a[href="' + hash + '"]')
			.parents("li")
			.index();
		if (index >= 0) {
			tabsBody.accordion("option", "active", index);
			prod.scrollTo(tabsBody.closest(".sectionInner"));
		}
	}
};
prod.tabsToAccordion = function () {
	$ec(".tabsSection.tabsView").each(function () {
		var tabsBody = $ec(this).find(".sectionBody");
		//turn tabs into accordions
		if (tabsBody.data("ui-tabs")) {
			clearInterval(tabsBody.attr("data-interval"));
			tabsBody.tabs("destroy");
			prod.initAccordionInSection($ec(this));
		}
	});
};
prod.accordionToTabs = function () {
	$ec(".tabsSection.tabsView").each(function () {
		var tabsBody = $ec(this).find(".sectionBody");
		//turn accordions into tabs
		if (tabsBody.data("ui-accordion")) {
			tabsBody.accordion("destroy");
			prod.initTabsInSection($ec(this));
		}
	});
};
prod.advanceTab = function (tabsBody) {
	if (tabsBody.data("ui-tabs")) {
		var tabs = tabsBody.find(".tabArea .tab");
		var index = tabsBody.tabs("option", "active");
		var iter = 0; //keep track of iterations to prevent infinite loop
		do {
			index++;
			if (index >= tabs.length) {
				index = 0;
			}
			iter++;
		} while (tabs.eq(index).hasClass("markedDelete") && iter < tabs.length);
		//set new active tab
		tabsBody.tabs("option", "active", index);
	}
};
prod.reinitFocusPoint = function () {
	//Delay until after css changes have been made
	setTimeout(function () {
		$ec(".focusPointImage.fixedHeight").removeClass("fixedHeight");
		$ec(".focusPointImage").each(function () {
			prod.initFocusPoint($ec(this));
		});
	}, 500);
};
prod.initFocusPoint = function (selector) {
	// Fixed - Constant height / width
	// Inset - Image height / width
	// edgeToEdge - Based on monitor height / width
	var imagePositioner = selector.find(".focusPointImagePositioner");
	if (imagePositioner.length > 0) {
		var imageContainer = imagePositioner.find(".focusPointImageContainer");
		var image = imagePositioner.find(".focusPointImageHolder");
		if (image.prop("complete")) {
			image.removeClass("imageLoaded");
			var heightMultiplier = 1;
			if (selector.hasClass("sectionHeightSmall")) {
				heightMultiplier = 0.5;
			} else if (selector.hasClass("sectionHeightMedium")) {
				heightMultiplier = 0.75;
			} else if (
				selector.hasClass("fixed") &&
				imageContainer.innerHeight() > image.height()
			) {
				selector.addClass("fixedHeight");
			}
			var buttonScaling = null;
			var buttonModule = null;
			if (prod.isMobile()) {
				buttonModule = selector.closest(
					".sectionButtonModule[style*=transform]",
				);
				if (buttonModule.length > 0) {
					buttonScaling = buttonModule.css("transform");
					buttonModule.css("transform", "");
				}
			}
			if (prod.isMobile() && !selector.hasClass("fixed")) {
				var imageHeight = image.height();
				if (selector.hasClass("inset")) {
					imageContainer.css("padding-top", "");
					if (selector.hasClass("imageModule")) {
						imageHeight = Math.min(imageHeight, imageContainer.innerHeight());
					}
				}
				imageHeight =
					(imageHeight / image.width()) *
					imageContainer.innerWidth() *
					heightMultiplier;
				imageContainer.css("height", imageHeight);
				if (selector.hasClass("twoThirds")) {
					var overlap = imageHeight / 3;
					var maxOverlap = selector
						.find(".headlineContentHolder")
						.innerHeight(); //do not allow overlap to exceed caption height
					selector
						.find(".focusPointImageArea")
						.css("margin-bottom", -Math.min(overlap, maxOverlap));
				}
			} else {
				imageContainer.css("height", "");
				if (selector.hasClass("twoThirds")) {
					selector.find(".focusPointImageArea").css("margin-bottom", "");
				}
				if (selector.hasClass("inset")) {
					var imagePadding =
						(image.innerHeight() / image.width()) * heightMultiplier;
					if (selector.hasClass("headlineSection")) {
						imagePadding = Math.min(
							imagePadding,
							$ec(window).height() / imageContainer.width(),
						); //do not allow height to exceed monitor height
					} else if (selector.parents(".hasFixedHeight").length) {
						var containerPadding =
							selector.parents(".modulePosition").innerHeight() / image.width();
						imagePadding = Math.min(imagePadding, containerPadding);
					}
					imageContainer.css("padding-top", imagePadding * 100 + "%");
				}
			}
			image.addClass("imageLoaded");
			if (!imageContainer.data("focusPoint")) {
				imageContainer.focusPoint({
					reCalcOnWindowResize: selector.hasClass("edgeToEdge"),
				});
			} else {
				imageContainer.adjustFocus();
			}
			if (buttonScaling !== null) {
				buttonModule.css("transform", buttonScaling);
			}
		} else {
			image.on("load", function () {
				//try again after image has loaded
				prod.initFocusPoint(selector);
			});
		}
	}
};
// absolutely, positively squash an event in the most cross-browser way imaginable, all the way back to IE8
// see http://www.quirksmode.org/js/events_order.html for a fun read
prod.killEvent = function (e) {
	e = e || window.event;
	e.cancelBubble = true;
	e.returnValue = false;
	if (e.stopPropagation) {
		e.stopPropagation();
		e.preventDefault();
	}
	return false;
};
// eases up/down to the given selector, usually an <a> with an id; mostly useful for returning to the top of a long form after submitting
// also tries to account for online form field titles when focusing fields with errors
// NOTE duration is optional, and defaults to 800ms, because that feels about right
// NOTE only scrolls if the element is not already visible
prod.scrollTo = function (selector, duration) {
	var $el = $ec(selector);
	var $fieldWrapper = $el.closest(".ofField");
	if ($fieldWrapper.length) {
		$el = $fieldWrapper;
	}
	while ($el.css("position") === "static" && !$el.is(":root")) {
		$el = $el.parent();
	}
	var scrollDistance = $el.offset().top - 15;
	var header = $ec("#header");
	if (header.css("position") === "fixed" && header.outerHeight() < 400) {
		// account for fixed headers but exclude very tall / full height ones
		scrollDistance -= header.outerHeight();
	} else if ($ec("#navBackground.navSticky").length) {
		scrollDistance -= $ec("#navBackground.navSticky").outerHeight();
	}
	if ($ec("#adminToolbar").length) {
		scrollDistance -= $ec("#adminToolbar").outerHeight();
	}
	if ($fieldWrapper.length || !$el.visible()) {
		$ec("html,body").animate({ scrollTop: scrollDistance }, duration || 800);
	}
};
prod.onlineFormSubmitted = false;

prod.initReplicatorCounters = function (form) {
	var isPaymentForm = form.find("#paymentsItemizedOrder");
	function init() {
		var el = $ec(this);
		var n = +el.val();
		if (el.val() !== "") {
			// allow deletion of the field
			if (n > +el.attr("max")) {
				el.val((n = +el.attr("max")));
			} else if (n < +el.attr("min")) {
				el.val((n = +el.attr("min")));
			}
		}
		el.closest("li")
			.siblings(".ofFieldGroup")
			.each(function () {
				!!n
					? $ec(this).removeClass("ofReplicatorHidden") &&
					  $ec(this)
							.find(
								'input:not([data-field-limit="0"]), textarea:not([data-field-limit="0"]), select:not([data-field-limit="0"])',
							)
							.prop("disabled", false) &&
					  n--
					: $ec(this).addClass("ofReplicatorHidden");
			});
		$ec(document).trigger("ofReplicatorInit");
		if (isPaymentForm) {
			prod.paymentForm.init();
		}
	}
	var ctrs = form.find(".replicatorCounter");
	ctrs.off("input").on("input", init);
	ctrs.off("blur").on("blur", function () {
		// this field is required, but the user is allowed to clear it
		// fill a 0 if the user clears it and leaves it blank
		if ($ec(this).val() === "") {
			$ec(this).val("0");
		}
	});
	ctrs.each(init);
};
prod.clearHiddenReplicatorFields = function (form) {
	form
		.find(".ofReplicatorHidden")
		.find("input, textarea, select")
		.each(function () {
			$ec(this).val("");
			$ec(this).prop("checked", false);
			$ec(this).find("option").first().prop("selected", true);
			$ec(this).prop("disabled", true);
		});
};
prod.initOnlineForm = function (selector) {
	var onlineForm = selector.find("#onlineForm");
	var form = onlineForm.find("#saveOnlineForm");
	var targetSubmitButton = null;
	onlineForm.find(".date").datepicker({
		showOtherMonths: true,
		selectOtherMonths: true,
	});
	prod.initReplicatorCounters(onlineForm);
	form
		.find('input[type="number"]')
		.off("input.numberInput")
		.on("input.numberInput", function () {
			var el = $ec(this);
			var n = +el.val();
			if (el.val() === "") {
				return;
			}
			if (el.get(0).hasAttribute("max") && n > +el.attr("max")) {
				el.val((n = +el.attr("max")));
			} else if (el.get(0).hasAttribute("min") && n < +el.attr("min")) {
				el.val((n = +el.attr("min")));
			}
		});

	var recaptchaKeyV2 = null;
	var recaptchaKeyV3 = null;
	var widgetId = null;

	var submit = function (token) {
		try {
			// build the payload
			var paymentTotal = prod.paymentForm.getTotal();
			var paymentSubtotal = prod.paymentForm.getAggregatedSubtotal();

			var dataToSend = prod.serializeForm(form);
			dataToSend.total = paymentTotal;
			dataToSend.subtotal = paymentSubtotal;
			if (token !== null) {
				dataToSend.recaptchaToken = token;
			}
			var data = JSON.stringify(dataToSend);

			var saveUrl = onlineForm.attr("postUrl");

			var isPayLater = $ec(targetSubmitButton).hasClass("payLater");
			if (isPayLater) {
				saveUrl += "?paylater=true";
			}

			prod.postForm(
				saveUrl,
				{ data: data },
				function (response) {
					// success
					var json = JSON.parse(response);
					if (json.hasOwnProperty("captchaFailure")) {
						prod.onlineFormSubmitted = false;
						var message =
							"Captcha challenge failed. Please refresh this page and try again.";
						onlineForm.html('<div class="aggregate">' + message + "</div>");
						prod.scrollTo("#formTop");
						return;
					} else if (json.hasOwnProperty("returnMessage")) {
						prod.onlineFormSubmitted = false;
						var aggregate = $ec('<div class="aggregate"></div>');
						aggregate.text(json.returnMessage);
						onlineForm.html("").append(aggregate);
						prod.scrollTo("#formTop");
					} else if (json.hasOwnProperty("fieldLimitFailure")) {
						handleFieldLimitFailure(onlineForm);
						return;
					}
					if (
						json.hasOwnProperty("submitMessage") ||
						(json.hasOwnProperty("paymentURL") && paymentTotal === 0) ||
						isPayLater
					) {
						// regular form, or no payment due, or user selected "Pay Later"
						var message =
							json.submitMessage || "Thank you. Your form has been submitted.";
						if (json.hasOwnProperty("paymentURL")) {
							if (paymentTotal) {
								message +=
									"<br><br><b>Total Due:</b> $" +
									prod.formatCurrency(paymentTotal);
								message +=
									'<br><br><a href="' +
									json.payLaterLink +
									'">Click here to complete your payment</a>';
							} else if ($ec(".paymentAmount,.paymentMultiplier").length) {
								message += "<br><br><b>Total Paid:</b> $0.00";
							}
						}
						onlineForm.html(
							'<div class="aggregate fr-view">' + message + "</div>",
						);
					} else if (json.hasOwnProperty("paymentURL")) {
						// payment form
						$ec("#saveOnlineForm").hide();
						$ec("#onlineFormSidePanel").remove();
						if (json.hasOwnProperty("paymentParams")) {
							$ec("#paymentParameters").html(json.paymentParams);
						}
						$ec("#paymentForm")
							.show()
							.attr("src", prod.getUrlAbsoluteOrRelative(json.paymentURL));
					}
					prod.scrollTo("#formTop");
				},
				function (jqxhr, status, error) {
					// error
					console.log("error submitting online form");
					prod.onlineFormSubmitted = false;
					var message =
						"There was an error submitting your form. An error report has been sent. Please refresh this page and try again.";
					if (error || status) {
						message += "<br><br>";
						if (error) {
							message += error;
							if (status) {
								message += " (" + status + ")";
							}
						} else if (status) {
							message += status;
						}
					}
					onlineForm.html('<div class="aggregate">' + message + "</div>");
					prod.scrollTo("#formTop");
					prod.paymentFormError(message);
				},
			);
		} catch (err) {
			console.log(err);
		}
	};
	if (onlineForm.find("#googleRecaptchaScript").length > 0) {
		recaptchaKeyV2 = onlineForm
			.find("#googleRecaptchaScript")
			.data("sitekeyv2");
		recaptchaKeyV3 = onlineForm
			.find("#googleRecaptchaScript")
			.data("sitekeyv3");
		if (recaptchaKeyV2 != null) {
			var interval = setInterval(function () {
				if (window.grecaptcha) {
					grecaptcha.ready(function () {
						widgetId = grecaptcha.render(
							onlineForm.find(".onlineFormCaptchaPlaceholder")[0],
							{
								sitekey: recaptchaKeyV2,
								callback: submit,
								size: "invisible",
							},
						);
					});
					clearInterval(interval);
				}
			}, 100);
		}
	}
	onlineForm.find(".submitForm").click(function () {
		// keep the form from getting submitted twice
		if (prod.onlineFormSubmitted) {
			return;
		}
		prod.onlineFormSubmitted = true;

		targetSubmitButton = this;
		// determine whether or not the limit broke under our feet
		$ec
			.get(onlineForm.data("checklimiturl"))
			.done(function (data) {
				if (data.limit === "true") {
					$ec("#onlineForm").addClass("submissionLimitReached");
				} else {
					validateAndSubmit.call(targetSubmitButton);
				}
			})
			.fail(function () {
				// fail-open by default
				validateAndSubmit.call(targetSubmitButton);
			});

		function validateAndSubmit() {
			form
				.find(".paymentDataAmount")
				.siblings()
				.find('input[type="text"]')
				.each(function () {
					$ec(this).val(prod.unformatCurrency($ec(this).val()));
				});
			prod.clearHiddenReplicatorFields(form);
			if (!prod.validateForm(form)) {
				console.log("online form not valid!");
				prod.onlineFormSubmitted = false;
				return;
			}
			if (onlineForm.hasClass("paidSubmissionsForLimit")) {
				form
					.find(".ofField.fieldLimit")
					.removeClass("limitError")
					.find(".limitErrorText")
					.remove();
				let firstLimitError = handleReplicatorFieldLimits(onlineForm, null);
				if (firstLimitError != null) {
					prod.onlineFormSubmitted = false;
					prod.scrollTo(firstLimitError);
					return;
				}
			}

			$ec(targetSubmitButton).text("Sending...");

			if (recaptchaKeyV2 != null || recaptchaKeyV3 != null) {
				if (typeof grecaptcha !== "undefined") {
					if (recaptchaKeyV2 != null) {
						grecaptcha.ready(function () {
							grecaptcha.execute(widgetId);
						});
					} else {
						grecaptcha.ready(function () {
							grecaptcha
								.execute(recaptchaKeyV3, { action: "submit" })
								.then(function (token) {
									submit(token);
								});
						});
					}
				} else {
					//script did not load properly for some reason -- reject submission
					console.log("recaptcha script missing");
					prod.onlineFormSubmitted = false;
					return;
				}
			} else {
				//form captcha is disabled for site
				submit(null);
			}
		}
	});
	onlineForm.find(".submitForm").on("keypress", function (e) {
		var code = e.keyCode || e.which;
		if (code == 13) {
			$ec(this).click();
		}
	});

	// prevent clicks on help popups from being captured by the body and errantly dismissing help dialogs
	// also, prevent (possible) double registration by offing before we on
	$ec("body")
		.off("click", ".fieldHelp")
		.on("click", ".fieldHelp", function (e) {
			if ($ec(e.target).not("a").length) {
				return prod.killEvent(e);
			}
		});

	// register help popup listeners
	$ec(".ofField").each(function () {
		prod.activateInfo($ec(this));
	});
};

function handleReplicatorFieldLimits(onlineForm, firstLimitError) {
	const limitedFields = onlineForm.find(
		".ofReplicatorMaster:not(.ofReplicatorHidden) .fieldLimit, .ofReplicatorChild:not(.ofReplicatorHidden) .fieldLimit",
	);

	let fieldLimits = {};

	const getFieldID = function (item) {
		if (item.is('option, input[type="radio"]')) {
			return (
				item.closest(".ofField").attr("fieldid") +
				"_" +
				item.val().replace(" ", "-")
			);
		}
		return item.closest(".ofField").attr("fieldid");
	};
	onlineForm
		.find(".ofReplicatorMaster .fieldLimit [data-field-limit]")
		.each(function () {
			fieldLimits[getFieldID($ec(this))] = $ec(this).data("field-limit");
		});

	const $fields = limitedFields.find(
		'select, input[type="radio"]:checked, input[type="number"]',
	);

	$fields.each(function () {
		const element = $ec(this);
		let fieldID = 0;
		let elementLimitError = "";

		if (element.is("select")) {
			const selectedValue = element.val();
			if (selectedValue) {
				const selectedOption = element.find("option:selected");
				fieldID = getFieldID(selectedOption);
				fieldLimits[fieldID] -= 1;
				if (fieldLimits[fieldID] < 0) {
					const otherOptions = selectedOption.siblings().filter(function () {
						return $ec(this).val() !== "";
					});
					const allOtherOptionsDisabled =
						otherOptions.length === 0 ||
						otherOptions.filter(":disabled").length === otherOptions.length;

					if (allOtherOptionsDisabled) {
						elementLimitError =
							"Last available was selected above. None remaining.";
					} else {
						elementLimitError =
							"Last available was selected above. Please choose another option.";
					}
				}
			}
		} else if (element.is('input[type="radio"]')) {
			const radioValue = element.val();
			if (radioValue) {
				fieldID = getFieldID(element);
				fieldLimits[fieldID] -= 1;
				if (fieldLimits[fieldID] < 0) {
					let inputHolder = element.closest(".inputHolder");
					const otherOptions = inputHolder.find(`input:not(:checked)`);
					const allOtherOptionsDisabled =
						otherOptions === 0 ||
						otherOptions.filter(":disabled").length === otherOptions.length;

					if (allOtherOptionsDisabled) {
						elementLimitError =
							"Last available was selected above. None remaining.";
						element.prop("checked", false);
						inputHolder.change();
					} else {
						elementLimitError =
							"Last available was selected above. Please choose another option.";
					}
				}
			}
		} else if (element.is('input[type="number"]')) {
			const intValue = element.val();
			if (intValue) {
				const integerValue = parseInt(intValue, 10) || 0;
				fieldID = getFieldID(element);
				fieldLimits[fieldID] -= integerValue;

				if (fieldLimits[fieldID] < 0) {
					elementLimitError =
						"Exceeds number remaining. Please enter a smaller amount.";
				}
			}
		}

		if (elementLimitError) {
			if (firstLimitError == null) {
				firstLimitError = element;
			}
			element
				.closest(".inputHolder")
				.addClass("limitError")
				.append(
					`<span class="limitErrorText">` + elementLimitError + `</span>`,
				);
		}
	});
	return firstLimitError;
}

function handleFieldLimitFailure(onlineForm) {
	prod.onlineFormSubmitted = false;
	let module = onlineForm.closest(".moduleInner").parent("li");
	let moduleID = module.attr("id");
	let $reloadedFormFields = $ec("<div>");
	$reloadedFormFields.load(" #" + moduleID, function () {
		let $onlineFormFields = onlineForm.find("#onlineFormFields");
		const origFormElements = $onlineFormFields.find("textarea, select, input");
		let origFormElementsMap = {};
		origFormElements.each(function () {
			const id = $ec(this).attr("id");
			if (id) {
				origFormElementsMap[id] = $ec(this);
			}
		});

		const newFormElements = $reloadedFormFields
			.find("#onlineFormFields")
			.find("textarea, select, input");
		let firstLimitError = null;
		let replicatorsToUpdate = [];

		newFormElements.each(function () {
			const element = $ec(this);
			const origElement = origFormElementsMap[element.attr("id")];

			let elementLimitError = "";

			if (element.attr("type") === "radio") {
				element.prop("checked", origElement.prop("checked"));
				if (element.is(":checked:disabled")) {
					element.prop("checked", "");
					//if other options remaining and not required
					const otherOptions = $ec(
						`input[type="radio"][name="${element.attr("name")}"]:not(:checked)`,
					);
					const allOtherOptionsDisabled =
						otherOptions === 0 ||
						otherOptions.filter(":disabled").length === otherOptions.length;

					if (allOtherOptionsDisabled) {
						elementLimitError =
							"None remaining. Your selection has been removed.";
					} else {
						elementLimitError = "Option unavailable. Please choose another.";
					}
				}
			} else {
				element.val(origElement.val());
				if (element.is("select")) {
					const selectedOption = element.find("option:selected");
					if (selectedOption.length && selectedOption.is(":disabled")) {
						//remove the default "None" option
						const otherOptions = selectedOption.siblings().filter(function () {
							return $ec(this).val() !== "";
						});

						const allOtherOptionsDisabled =
							otherOptions.length === 0 ||
							otherOptions.filter(":disabled").length === otherOptions.length;

						if (allOtherOptionsDisabled) {
							elementLimitError =
								"None remaining. Please remove your selection.";
						} else {
							elementLimitError = "Option unavailable. Please choose another.";
						}
					}
				} else if (element.is("input") && element.attr("type") === "number") {
					if (element.val() > element.attr("max")) {
						if (element.attr("max") > 0) {
							elementLimitError =
								"Amount no longer available. Please enter a smaller amount.";
						} else {
							elementLimitError =
								"None remaining. Please remove your selection.";
						}
						if (element.is(".replicatorCounter")) {
							// Temporarily increase the max due to js limiting
							element
								.data("orig-max", element.attr("max"))
								.attr("max", element.val());
							replicatorsToUpdate.push(element);
						}
					}
				}
			}

			if (elementLimitError) {
				if (firstLimitError == null) {
					firstLimitError = element;
				}
				element
					.closest(".inputHolder")
					.addClass("limitError")
					.append(`<span class="limitErrorText">${elementLimitError}</span>`);
			}
		});

		let newOnlineFormModule = $reloadedFormFields.find("#" + moduleID);
		newOnlineFormModule
			.find("#saveOnlineForm")
			.append(module.find("#googleRecaptchaScript"));
		module.replaceWith(newOnlineFormModule);
		module = newOnlineFormModule;
		if (typeof admin != "undefined") {
			admin.activateModules(module);
		}
		prod.initModules(module);
		prod.resizeModules(module);
		firstLimitError = handleReplicatorFieldLimits(module, firstLimitError);
		replicatorsToUpdate.forEach(function (replicator) {
			replicator.attr("max", replicator.data("orig-max"));
		});
		prod.scrollTo(firstLimitError == null ? "#formTop" : firstLimitError);
	});
}

prod.registrationFormSubmitted = false;
prod.initRegistrationForm = function (selector) {
	var module = selector;
	var formStyling = module.find(".formStyling");
	formStyling.find(".date").datepicker({
		showOtherMonths: true,
		selectOtherMonths: true,
	});
	prod.initReplicatorCounters(formStyling);

	var recaptchaKeyV2 = null;
	var recaptchaKeyV3 = null;
	var widgetId = null;

	var submit = function (token) {
		try {
			var dataToSend = prod.serializeForm(module.find(".formTag"));
			dataToSend.recaptchaToken = token;
			var data = JSON.stringify(dataToSend);
			var saveUrl = formStyling.attr("postUrl");
			prod.postForm(
				saveUrl,
				{ data: data },
				function (response) {
					var json = JSON.parse(response);
					var message = "Thank you. Your form has been submitted.";
					if (json.hasOwnProperty("captchaFailure")) {
						message =
							"Captcha challenge failed. Please refresh this page and try again.";
					} else if (json.hasOwnProperty("submitMessage")) {
						message = json.submitMessage || message;
					}
					prod.registrationFormSubmitted = false;
					if (module.is(".connectGroupModule")) {
						module.find(".groupDescription").hide();
					}
					formStyling.html(
						'<div class="aggregate fr-view">' + message + "</div>",
					);
					prod.scrollTo(module.parent());
				},
				function (jqxhr, status, error) {
					// error
					console.log("error submitting form");
					prod.registrationFormSubmitted = false;
					var message = "There was an error submitting your form.";
					if (error || status) {
						message += "<br><br>";
						if (error) {
							message += error;
							if (status) {
								message += " (" + status + ")";
							}
						} else if (status) {
							message += status;
						}
					}
					formStyling.html('<div class="aggregate">' + message + "</div>");
					prod.scrollTo(module.parent());
				},
			);
		} catch (err) {
			prod.registrationFormSubmitted = false;
			console.log(err);
		}
	};
	var recaptchaScript = module.find(".googleRecaptchaScript");
	if (recaptchaScript.length > 0) {
		recaptchaKeyV2 = recaptchaScript.data("sitekeyv2");
		recaptchaKeyV3 = recaptchaScript.data("sitekeyv3");
		if (recaptchaKeyV2 != null) {
			var interval = setInterval(function () {
				if (window.grecaptcha) {
					grecaptcha.ready(function () {
						widgetId = grecaptcha.render(
							module.find(".formCaptchaPlaceholder")[0],
							{
								sitekey: recaptchaKeyV2,
								callback: submit,
								size: "invisible",
							},
						);
					});
					clearInterval(interval);
				}
			}, 100);
		}
	}
	module.find(".submitForm").click(function () {
		// keep the form from getting submitted twice
		if (prod.registrationFormSubmitted) {
			return;
		}
		prod.registrationFormSubmitted = true;
		var targetSubmitButton = this;
		var form = module.find(".formTag");
		prod.clearHiddenReplicatorFields(form);
		if (!prod.validateForm(form)) {
			console.log("form is not valid!");
			prod.registrationFormSubmitted = false;
			return;
		} else {
			$ec(targetSubmitButton).text("Sending...");
		}

		if (recaptchaKeyV2 != null || recaptchaKeyV3 != null) {
			if (typeof grecaptcha !== "undefined") {
				if (recaptchaKeyV2 != null) {
					grecaptcha.ready(function () {
						grecaptcha.execute(widgetId);
					});
				} else {
					grecaptcha.ready(function () {
						grecaptcha
							.execute(recaptchaKeyV3, { action: "submit" })
							.then(function (token) {
								submit(token);
							});
					});
				}
			} else {
				//script did not load properly for some reason -- reject submission
				console.log("recaptcha script missing");
				prod.registrationFormSubmitted = false;
				return;
			}
		}
	});
	module.find(".submitForm").on("keypress", function (e) {
		var code = e.keyCode || e.which;
		if (code == 13) {
			$ec(this).click();
		}
	});
};

prod.activateInfo = function (field) {
	field
		.find(".fieldHelpButton,.infoButton")
		.off("click")
		.click(function (e) {
			prod.killEvent(e);
			// since the help context is toggleable and we've killed the click event, nix any other visible contexts
			$ec(".fieldHelp, .fieldDisabledHelp").fadeOut(400);
			var button = $ec(this);
			var holder = button.closest(".inputHolder,.infoHolder");
			var help = holder.find(".fieldHelp");
			if (help.is(":hidden")) {
				var pos = button.position();
				if (button.is(".fieldHelpButton")) {
					help.css("top", pos.top);
					var leftOfButtonSpace = pos.left - holder.position().left;
					var rightOfButtonSpace =
						holder.outerWidth() - button.outerWidth() - leftOfButtonSpace;
					if (
						leftOfButtonSpace > rightOfButtonSpace &&
						help.outerWidth() > rightOfButtonSpace * 0.9
					) {
						help
							.css("right", "calc(100% - " + (pos.left - 10) + "px)")
							.css("left", "auto");
						help.addClass("rightAligned");
					} else {
						help
							.css("right", "auto")
							.css("left", pos.left + button.outerWidth() + 5);
					}
				} else {
					// button.is('.infoButton.')
					help.css("right", 0).css("top", pos.top + button.outerHeight() + 10);
				}
				help.fadeIn(400);
				var marginTop = parseInt(help.css("margin-top"));
				var heightOffset =
					button[0].getBoundingClientRect().top -
					help[0].getBoundingClientRect().top +
					Math.min(marginTop, 0);
				if (heightOffset > 10) {
					// Fix issues with scrolled dialogs
					help.css("top", pos.top + heightOffset);
				}
				$ec("body").one("click", function () {
					help.fadeOut(400);
				});
			} else {
				help.fadeOut(400);
			}
		});
};

prod.activateCount = function (field) {
	function updateCount() {
		var $el = $ec(this);
		var counter = $el.parents(".inputHolder").find(".fieldCounter");
		counter.find(".fieldCounterNumber").text($el.val().length);
	}
	field.find("textarea,input").each(updateCount);
	field.find("textarea,input").on("input", updateCount);
};

prod.validateForm = function (form) {
	$ec("[id*='fieldOptIn']").each(function () {
		const $checkbox = $ec(this);
		const $inputHolder = $checkbox
			.closest("[id*='formField']")
			.find(".inputHolder");
		const $emailField = $checkbox
			.closest("[id*='formField']")
			.find("[id*='fieldEmail']");
		const isCheckboxChecked = $checkbox.is(":checked");
		const isInputEmpty = $emailField.val().trim() === "";
		const isInputRequired = $inputHolder.find(".required").length > 0;

		if (!isInputRequired && isCheckboxChecked && isInputEmpty) {
			$emailField.attr("required", true);
			$inputHolder.append(
				"<span class='emailError requiredErrorText'>An email address must be entered in order to subscribe.</span>",
			);
		}
	});

	form.find("input[required],textarea[required]").each(function () {
		//trim whitespace from required fields
		$ec(this).val($ec(this).val().trim());
	});
	// TODO: If form[0].checkValidity does not exist, assumes the form is valid.
	var valid = !form[0].checkValidity || form[0].checkValidity();
	// Check checkbox groups
	if (valid) {
		form
			.find(".ofField")
			.not(".ofFieldGroup, .markedDelete, .ofReplicatorHidden")
			.find(".checkbox.requiredCheckbox")
			.each(function () {
				if (
					valid &&
					!(
						$ec(this).closest(".markedDelete").length ||
						$ec(this).closest(".ofReplicatorHidden").length ||
						$ec(this).find(":checkbox:checked").length != 0
					)
				) {
					valid = false;
				}
			});
	}
	var invalidField = null;
	var returnValid = true;

	if (!valid) {
		form
			.find(".ofField")
			.not(".ofFieldGroup, .markedDelete, .ofReplicatorHidden")
			.find("input, textarea, select")
			.each(function () {
				var $this = $ec(this);
				var parent = $this.parents(".inputHolder");
				parent.removeClass("requiredError validateError limitError");
				if (
					!(
						$this.closest(".markedDelete").length ||
						$this.closest(".ofReplicatorHidden").length ||
						this.validity.valid
					)
				) {
					returnValid = false;
					if (!invalidField) {
						invalidField = $this;
					}
					if (this.validity.valueMissing) {
						parent.addClass("requiredError");
					} else {
						parent.addClass("validateError");
					}
				}
			});

		// Check checkbox groups
		form
			.find(".ofField")
			.not(".ofFieldGroup, .markedDelete, .ofReplicatorHidden")
			.find(".inputHolder.checkbox.requiredCheckbox")
			.each(function () {
				var $this = $ec(this);
				$this.removeClass("requiredError validateError limitError");
				if (
					!(
						$this.closest(".markedDelete").length ||
						$this.closest(".ofReplicatorHidden").length ||
						$this.find(":checkbox:checked").length != 0
					)
				) {
					returnValid = false;
					if (!invalidField) {
						invalidField = $this;
					}
					$this.addClass("requiredError");
				}
			});
		// Check replicator counters
		form.find(".ofField.ofReplicator .replicatorCounter").each(function () {
			var $this = $ec(this);
			var parent = $ec(this).parents(".inputHolder");
			if ($this.val() < $this.prop("min")) {
				returnValid = false;
				if (!invalidField) {
					invalidField = $this;
				}
				parent.addClass("requiredError");
			}
		});
		if (invalidField) {
			prod.scrollTo(invalidField);
		}
	}
	return returnValid;
};
prod.initFlocknoteSignup = function (selector) {
	selector.find("form").submit(function () {
		$ec(".flocknoteSignupsSubmitSuccess").css("display", "inline");
	});
	selector.find("input").on("input", function () {
		$ec(".flocknoteSignupsSubmitSuccess").css("display", "none");
	});
	var $email = selector.find("#email");
	var $phone = selector.find("#mobile_phone");
	function checkEmailOrPhone() {
		!!$email.val()
			? $phone.prop("required", false)
			: $phone.prop("required", true);
		!!$phone.val()
			? $email.prop("required", false)
			: $email.prop("required", true);
	}
	$email.on("blur", checkEmailOrPhone);
	$phone.on("blur", checkEmailOrPhone);
};
prod.renderFacebookModule = function (selector, FB) {
	const width = prod.getModuleWidth(selector.find(".facebook"));
	selector.find(".fb-page").attr("data-width", Math.floor(width) + "px");

	FB.Event.subscribe("xfbml.render", function () {
		let iframe = selector.find(".fb-page iframe");
		if (iframe.length) {
			let height = 130;
			if (selector.find(".fb-page").attr("data-tabs") === "timeline") {
				if (selector.find(".fb-page").attr("data-show-facepile") === "false") {
					height = 385;
				} else {
					height = 565;
				}
			}
			let scaleTarget = null;
			if (width < 180) {
				scaleTarget = 180;
			} else if (width > 500) {
				scaleTarget = 500;
			}
			let scale = scaleTarget ? width / scaleTarget : 1;
			iframe.css("transform-origin", "top left");
			iframe.css("transform", "scale(" + scale + ")");
			selector.find(".facebook").css("height", height * scale);
		}
	});
};
prod.initFacebookInstagramModule = async function (selector) {
	const isFacebookModulePresent = !!selector.find(
		".facebookModule:not(.markedDelete)",
	).length;
	const isInstagramModulePresent = !!selector.find(
		".instagramModule:not(.markedDelete)",
	).length;

	let facebookSDKloaded = !!window.FB;
	let instagramScriptLoaded = !!window.instgrm;

	if (!isFacebookModulePresent && !isInstagramModulePresent) {
		return;
	}
	if (isInstagramModulePresent) {
		if (!instagramScriptLoaded) {
			try {
				await prod.loadScript("//www.instagram.com/embed.js");
			} catch (err) {
				console.log("instagram script failed to load", err);
			}
		}
		if (!!window.instgrm) {
			window.instgrm.Embeds.process();
		}
	}
	if (isFacebookModulePresent) {
		const facebookSelector = selector.find(
			".facebookModule:not(.markedDelete)",
		);
		if (!facebookSDKloaded) {
			try {
				await prod.loadScript("//connect.facebook.net/en_US/sdk.js");
			} catch (err) {
				console.log("facebook sdk did not load", err);
			}
		}
		if (!!window.FB) {
			FB.init({
				xfbml: 1,
				version: "v14.0",
			});
			prod.renderFacebookModule(facebookSelector, FB);
		}
	}
};
prod.initLiveCountdown = function (selector) {
	var countdown = selector.find(".liveCountdown");
	var daysSpan = countdown.find(".days");
	var hoursSpan = countdown.find(".hours");
	var minutesSpan = countdown.find(".minutes");
	var secondsSpan = countdown.find(".seconds");
	if (
		selector.find(".countdownTime").html() !== "" &&
		typeof moment !== "undefined"
	) {
		//uses moment.js to handle timezones because js Date support is inconsistent
		//get broadcast time from module html in cms timezone
		var cmsTime = moment.tz(
			selector.find(".countdownTime").html(),
			"America/Chicago",
		);
		//convert broadcast time to browser's timezone
		var broadcastTime = cmsTime.tz(moment.tz.guess()).toDate();
		initializeClock();
	}
	countdown.show();

	//lightweight countdown code modified from https://www.sitepoint.com/build-javascript-countdown-timer-no-dependencies/
	function getTimeRemaining() {
		var t = broadcastTime.getTime() - new Date().getTime();
		var seconds = Math.floor((t / 1000) % 60);
		var minutes = Math.floor((t / 1000 / 60) % 60);
		var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
		var days = Math.floor(t / (1000 * 60 * 60 * 24));
		return {
			total: t,
			days: days,
			hours: hours,
			minutes: minutes,
			seconds: seconds,
		};
	}

	function initializeClock() {
		function updateClock() {
			var t = getTimeRemaining();

			if (t.total <= 0) {
				clearInterval(timeinterval);
				var countdownLink = countdown.find(".countdownLink");
				if (countdownLink.length == 0) {
					countdown.html("<span class='countdownText'>Broadcasting Now</span>");
				} else {
					countdown.html(
						"<div class='linkWrapper'><a href='" +
							countdownLink.attr("href") +
							"' target='" +
							countdownLink.attr("target") +
							"' class='countdownLink'>Watch Now</a></div>",
					);
				}
			}

			daysSpan.html(("0" + t.days).slice(-2));
			hoursSpan.html(("0" + t.hours).slice(-2));
			minutesSpan.html(("0" + t.minutes).slice(-2));
			secondsSpan.html(("0" + t.seconds).slice(-2));
		}

		updateClock();
		var timeinterval = setInterval(updateClock, 1000);
	}
};
// add entries here as necessary
// TODO is it possible to select resizable elements by class, or only resize modules that need it, rather than add one function/call per resizable element?
prod.resizeModules = function (selector) {
	prod.resizeSiteName(selector.find("#siteName"));
	prod.resizeWidthAndHeight(selector.find(".video.youtube"));
	prod.resizeWidthAndHeight(selector.find(".video.vimeo"));
	prod.resizeFacebook(selector.find(".facebookModule"));
	prod.resizeEmbed(selector.find(".embedModule"));
	prod.resizeWidth(
		selector.find(
			".paymentModule:not(.paymentCustom) iframe, iframe#paymentForm",
		),
	);
	prod.resizeCustomWidth(selector.find(".paymentModule.paymentCustom iframe"));
	prod.resizeWidthAndHeight(
		selector.find(".mapsModule iframe, .livePlayerContainer iframe"),
	);
	prod.resizeWidthAndHeight(
		selector.find(".slideshowModule.captionOverlayOn .captionPositioner"),
	);
	if (selector.find(".paymentModule iframe, iframe#paymentForm").length > 0) {
		prod.setupPaymentMessaging();
	}

	// NOTE the code that cares about this event exists in admin_edit.js
	$ec(document).trigger("resizeOnlineForm");
};
prod.getModuleWidth = function (element) {
	var parent = element.parents(".moduleInner");
	var moduleBody = parent.find(".moduleBody");
	var modWidth =
		parent.width() -
		moduleBody.css("marginLeft").replace("px", "") -
		moduleBody.css("marginRight").replace("px", "") -
		moduleBody.css("borderLeftWidth").replace("px", "") -
		moduleBody.css("borderRightWidth").replace("px", "") -
		moduleBody.css("paddingLeft").replace("px", "") -
		moduleBody.css("paddingRight").replace("px", "");
	return modWidth;
};
prod.resizeWidthAndHeight = function (selector) {
	selector.each(function () {
		var element = $ec(this);
		var origWidth = element.attr("width");
		if (origWidth === undefined) {
			origWidth = element.width();
		}
		var origHeight = element.attr("height");
		if (origHeight === undefined) {
			origHeight = element.height();
		}
		var modWidth = prod.getModuleWidth(element);
		var modHeight = (modWidth / origWidth) * origHeight;
		element.width(modWidth);
		element.height(modHeight);
	});
};
prod.resizeWidth = function (selector) {
	selector.each(function () {
		var element = $ec(this);
		var modWidth = prod.getModuleWidth(element);
		element.width(modWidth);
	});
};
prod.resizeCustomWidth = function (selector) {
	selector.each(function () {
		var element = $ec(this);
		var iFrameWidth = element.closest(".formGroup").width();
		element.width(iFrameWidth);
	});
};
prod.initTwitter = function (selector) {
	prod.createTwitter(selector);
};
// scale the Facebook plugin and set the module height to match
function scaleFacebookIFrame(mod, frame, iframeWidth, scaleTarget) {
	var scale = scaleTarget ? iframeWidth / scaleTarget : 1;
	frame.css("transform-origin", "top left");
	frame.css("transform", "scale(" + scale + ")");
	mod.css("height", frame.height() * scale);
}
prod.scaleFacebook = function (selector) {
	selector.each(function () {
		// Facebook plugin iframe lives inside a module
		var el = $ec(this),
			fbModule = el.find(".facebook"),
			fbFrame = el.find(".fb-page iframe");

		// fail fast if we don't find a plugin
		if (!fbFrame.length) {
			return;
		}

		// the width of the plugin that Facebook ships is constrained to 180 < width < 500;
		// modules can scale up to 650 and down to...? below 180, at least
		var moduleWidth = prod.getModuleWidth(fbModule);
		var iframeWidth =
			moduleWidth -
			fbFrame.css("marginLeft").replace("px", "") -
			fbFrame.css("marginRight").replace("px", "") -
			fbFrame.css("borderLeftWidth").replace("px", "") -
			fbFrame.css("borderRightWidth").replace("px", "");
		if (iframeWidth < 180) {
			scaleFacebookIFrame(fbModule, fbFrame, iframeWidth, 180);
		} else if (iframeWidth > 500) {
			scaleFacebookIFrame(fbModule, fbFrame, iframeWidth, 500);
		} else {
			scaleFacebookIFrame(fbModule, fbFrame, iframeWidth);
		}
	});
};
prod.resizeFacebook = function (selector) {
	var iframe = selector.find(".fb-page iframe");
	if (iframe.length) {
		//reload the iframe's content with a new target width - this is because the facebook plugin is a pain
		var src = iframe.attr("src");
		var width = selector.find(".fb-page").parent().width();
		src = src.replace(/width=\d*/g, "width=" + Math.floor(width));
		iframe.attr("src", src);
	}
	prod.scaleFacebook(selector);
};
prod.resizeEmbed = function (selector) {
	selector.each(function () {
		var $this = $ec(this);
		if ($this.hasClass("RESIZE_ALL")) {
			prod.resizeWidthAndHeight($this.find("iframe"));
		} else if ($this.hasClass("RESIZE_WIDTH")) {
			prod.resizeWidth($this.find("iframe"));
		}
	});
};
prod.sendPaymentMessage = function (message) {
	var iframe = $ec(
		".paymentModule:not(.markedDelete) iframe, .onlineFormModule iframe#paymentForm, .paymentFormContainer iframe",
	)[0];
	if (!iframe) {
		iframe = $ec(
			".paymentModule iframe, .onlineFormModule iframe#paymentForm, .paymentFormContainer iframe",
		)[0];
	}
	if (iframe) {
		var iframeWindow = iframe.contentWindow
			? iframe.contentWindow
			: iframe.contentDocument.defaultView;
		iframeWindow.postMessage(message, "*");
	}
};
//this is just to make sure that there are no race conditions in sending settings to the BluePay iframe
prod.sendFirstPaymentMessagingInit = function () {
	prod.sendPaymentMessage("paymentMessagingInit");
};
prod.paymentMessagingInit = function () {
	var settings = $ec(
		".paymentModule #paymentParameters, .onlineFormModule #paymentParameters, .paymentFormContainer #paymentParameters",
	).html();
	prod.sendPaymentMessage("settings=" + settings);
	prod.initParentSwipe && prod.initParentSwipe();
};
prod.sendSwitchToCC = function () {
	prod.sendPaymentMessage("switchToCC");
};
prod.sendSwitchToACH = function () {
	prod.sendPaymentMessage("switchToACH");
};
prod.initSwipe = function () {
	prod.sendPaymentMessage("initSwipe");
};
prod.sendSwipe = function (swipe) {
	prod.sendPaymentMessage("swipe=" + swipe);
};
//Use like this: var styling = {form: {}, field: {}, label: {display:'none'}, input: {color:"#F00"}}; prod.sendSetStyling(JSON.stringify(styling));
prod.sendSetStyling = function (jsonMessage) {
	prod.sendPaymentMessage("setStyling=" + jsonMessage);
};
prod.sendPaymentMessageUpdate = function (jsonMessage) {
	prod.sendPaymentMessage("jsonMessage=" + jsonMessage);
};
prod.sendValidateForm = function () {
	prod.sendPaymentMessage("validateForm");
};
prod.sendPaymentSubmit = function (jsonMessage) {
	prod.sendPaymentMessage("submitForm");
};
prod.setupPaymentMessaging = function () {
	$ec(window)
		.off("message onmessage")
		.on("message onmessage", function (e) {
			var data = e.originalEvent.data;
			if (typeof data.indexOf !== "undefined") {
				if (data.indexOf("height=") > -1) {
					var height = data.replace("height=", "");
					$ec(
						".paymentModule:not(.markedDelete) iframe, iframe#paymentForm",
					).height(height);
					$ec(".paymentModule.markedDelete iframe").height(0);
				} else if (data.indexOf("scrollTop") > -1) {
					prod.scrollTo("#formTop", 800);
				} else if (data.indexOf("paymentMessagingInit") > -1) {
					prod.paymentMessagingInit();
				} else if (data.indexOf("paymentMinMessagingInit") > -1) {
					if (prod.paymentCustom !== undefined) {
						prod.sendSetStyling(prod.paymentCustom.getMinimalStyling());
						prod.initParentSwipe && prod.initParentSwipe();
					} else {
						setTimeout(function () {
							if (prod.paymentCustom !== undefined) {
								prod.sendSetStyling(prod.paymentCustom.getMinimalStyling());
								prod.initParentSwipe && prod.initParentSwipe();
							}
						}, 1000);
					}
				} else if (data.indexOf("paymentOrderID=") > -1) {
					var orderID = data.replace("paymentOrderID=", "");
					$ec("#ORDER_ID").val(orderID);
				} else if (data.indexOf("orgID=") > -1) {
					var orgID = data.replace("orgID=", "");
					prod.setURLPaymentOrgID(orgID);
				} else if (data.indexOf("paymentTokenFormChanged") > -1) {
					admin.paymentAdministration.paymentTokenFormChanged();
				} else if (data.indexOf("paymentTokenFormResponse=") > -1) {
					var response = data.replace("paymentTokenFormResponse=", "");
					admin.paymentAdministration.paymentTokenFormResponse(response);
				} else if (data.indexOf("paymentFormResponse=") > -1) {
					var response = data.replace("paymentFormResponse=", "");
					prod.paymentCustom.paymentFormResponse(response);
				} else if (data.indexOf("paymentFormError=") > -1) {
					var error = data.replace("paymentFormError=", "");
					prod.paymentFormError(error);
				} else if (data.indexOf("paymentCCType=") > -1) {
					var ccType = data.replace("paymentCCType=", "");
					prod.ccType(ccType);
				} else if (data.indexOf("paymentACHType=") > -1) {
					var achType = data.replace("paymentACHType=", "");
					prod.achType(achType);
				} else if (data.indexOf("formValid=") > -1) {
					var formValid = data.replace("formValid=", "");
					prod.paymentCustom.updateFormValidity(formValid);
				} else if (data.indexOf("internalSwipe=") > -1) {
					var insecureFields = data
						.replace("internalSwipe=", "")
						.replace("&lt;", "<");
					prod.paymentCustom.updateInsecureFields(JSON.parse(insecureFields));
				} else if (data.indexOf("paymentCaptchaVisible=") > -1) {
					var captchaVisible = data
						.replace("paymentCaptchaVisible=", "")
						.replace("&lt;", "<");
					prod.paymentCustom.processCaptchaCallback(captchaVisible);
				}
			}
		});
	prod.sendFirstPaymentMessagingInit();
};
prod.paymentFormSuccess = function () {
	prod.paymentCustom.paymentSuccess();
};
prod.paymentFormError = function (error) {
	$ec.ajax({
		type: "POST",
		headers: prod.csrfHeaders(),
		url: "/ecpayments/error",
		data: "message=" + error,
	});
};
prod.ccType = function (ccType) {
	prod.paymentCustom.ccType(ccType);
};
prod.achType = function (achType) {
	prod.paymentCustom.achType(achType);
};
prod.setURLPaymentOrgID = function (orgID) {
	var loc = location.href;
	if (loc.indexOf("paymentOrgID=") === -1) {
		//add parameter
		if (loc.indexOf("?") === -1) {
			loc += "?";
		} else {
			loc += "&";
		}
		loc = loc + "paymentOrgID=" + orgID;
	} else {
		//update parameter
		try {
			loc = loc.replace(/(paymentOrgID=)[^\&]+/, "$1" + orgID);
		} catch (err) {
			console.log(err);
		}
	}
	window.history.pushState("", document.title, loc);
};

prod.createTwitter = function (selector) {
	if (selector.length === 0) {
		return;
	}
	selector.find(".twitter-timeline").remove();
	$ec("#twitter-wjs").remove();
	var newTwitterLink = selector
		.find(".twitter-timeline-backup")
		.clone()
		.removeClass("twitter-timeline-backup")
		.addClass("twitter-timeline");
	$ec(".twitter-timeline-backup").after(newTwitterLink);
	var newTwitterScript = selector.find("script").clone();
	newTwitterLink.after(newTwitterScript);

	//code from twitter
	var initTwit = function (d, s, id) {
		var js,
			fjs = d.getElementsByTagName(s)[0],
			p = /^http:/.test(d.location) ? "http" : "https";
		if (!d.getElementById(id)) {
			js = d.createElement(s);
			js.id = id;
			js.src = p + "://platform.twitter.com/widgets.js";
			fjs.parentNode.insertBefore(js, fjs);
		}
	};
	initTwit(document, "script", "twitter-wjs");
};

prod.paymentForm = (function () {
	// registries of payment fields
	var amounts, multipliers;
	let debouncePrint = debounce(printItemizedList, 300);

	function calculateLineItemTotal(lineItem) {
		return parseFloat(
			(
				lineItem.amount *
				(lineItem.multiplier && $ec.isNumeric(lineItem.multiplier.amount)
					? lineItem.multiplier.amount
					: 1)
			).toFixed(2),
		);
	}

	function calculateTotal(list) {
		return list.reduce(function (total, lineItem) {
			return total + calculateLineItemTotal(lineItem);
		}, 0);
	}

	function fieldChange(field) {
		var element = field.forField;
		if (element.is('input[type="text"]')) {
			var val;
			field.amount = isNaN(
				(val = parseFloat(element.val().replace(/[^0-9.]/g, ""))),
			)
				? null
				: val;
			if (field.amount) {
				element.val(prod.formatCurrency(field.amount, true));
			} else {
				element.val("");
			}
		} else if (element.is(".radio")) {
			var selected = element.find(":checked");
			field.value = selected.val();
			field.amount = parseFloat(selected.data("amount"));
		} else if (element.is('input[type="checkbox"]')) {
			field.value = element.val();
			field.amount = element.prop("checked")
				? parseFloat(element.data("amount"))
				: null;
		} else if (element.is("select")) {
			field.value = element.val();
			field.amount = parseFloat(element.find("option:selected").data("amount"));
		} else if (element.is(".static")) {
			var $el = element.find(".staticValue");
			field.amount = parseFloat($el.text().replace(/[\$\,]/g, ""));
			$el.text(prod.formatCurrency(field.amount));
		} else if (element.is('input[type="number"]')) {
			var val;
			field.amount = isNaN(
				(val = parseFloat(element.val().replace(/[^0-9.]/g, ""))),
			)
				? null
				: val;
			if (field.amount) {
				//Non-zero
				if (element.attr("validate") === "amount") {
					element.val(prod.formatCurrency(field.amount, true));
					return;
				}
				element.val(field.amount);
				return;
			}
			// Zero and Null
			if (
				field.amount === 0 &&
				(!element.prop("required") || element.hasClass("replicatorCounter"))
			) {
				element.val("0");
			} else {
				field.amount = 0;
				element.val(""); //Firefox bug - DEV-1426 - 3/14/19
			}
		}
	}

	function getItemizedList() {
		return amounts.filter(function (item) {
			return (
				item.amount &&
				!item.forField.closest(".markedDelete").length &&
				!item.forField.closest(".ofReplicatorHidden").length &&
				(!item.multiplier || item.multiplier.amount !== 0)
			);
		});
	}

	function getMultiplierList() {
		return Object.keys(multipliers).map(function (k) {
			return multipliers[k];
		});
	}

	function init() {
		amounts = [];
		multipliers = {};

		var form = $ec("#saveOnlineForm");
		if (!form.length) {
			return;
		}
		$ec("#paymentsItemizedTotal").hide();
		$ec("#paymentForm").hide();

		form.find(".paymentDataMultiplier").each(function () {
			initMultiplierField($ec(this));
		});
		form.find(".paymentDataAmount").each(function () {
			initAmountField($ec(this));
		});
		$ec(".asCurrency").each(function () {
			$ec(this).text(prod.formatCurrency($ec(this).text(), true, true));
		});
		debouncePrint();

		// change submit button text depending on the existence and/or visibility of a payment field
		var atLeastOneVisible = amounts.reduce(function (a, c) {
			return a || !c.forField.closest(".ofReplicatorHidden").length;
		}, false);
		var nonReplicatorMultipliers = Object.keys(multipliers).reduce(function (
			a,
			c,
		) {
			return a || !multipliers[c].forField.is(".replicatorCounter");
		}, false);
		if (
			form.find(".paymentSubmit").length &&
			((amounts.length && atLeastOneVisible) || nonReplicatorMultipliers)
		) {
			form.find(".normalSubmit").hide();
			form.find(".paymentSubmit").show();
		} else {
			form.find(".paymentSubmit").hide();
			form.find(".normalSubmit").show();
		}
	}

	function initAmountField(field) {
		var fieldObj = {};
		var forField = field.data("forfield");
		var description = field.data("description");
		var multiplierId = field.data("multiplier");

		if (forField) {
			fieldObj.forField = $ec(
				"#" + forField.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1"),
			);
			if (fieldObj.forField.closest(".markedDelete").length) {
				return;
			}
			// init defaults for non-static fields
			fieldChange(fieldObj);
			fieldObj.forField.change(function () {
				fieldChange(fieldObj);
				debouncePrint();
			});
		}
		if (description) {
			fieldObj.description = description;
		}
		if (multiplierId) {
			fieldObj.multiplier = multipliers[multiplierId];
		}
		// special-case checkboxes for proper subtotal handling
		if (fieldObj.forField.is('input[type="checkbox"]')) {
			var $parent = fieldObj.forField
				.parents(".checkbox")
				.find(".fieldLabel")
				.clone();
			$parent.find(".required").remove();
			fieldObj.description = $parent.text().trim();
		}

		amounts.push(fieldObj);
	}

	function initMultiplierField(field) {
		var fieldObj = {};
		// set a special flag to identify multipliers as necessary
		fieldObj.isMultiplier = true;
		var forField = field.data("forfield");
		var description = field.data("description");

		if (forField) {
			fieldObj.id = forField.split("_")[1];
			fieldObj.forField = $ec("#" + forField);
			if (fieldObj.forField.closest(".markedDelete").length) {
				return;
			}
			// init defaults for non-static fields
			fieldChange(fieldObj);
			fieldObj.forField.change(function () {
				fieldChange(fieldObj);
				debouncePrint();
			});
		}
		if (description) {
			fieldObj.description = description;
		}

		multipliers[fieldObj.id] = fieldObj;
	}

	function printItemizedList() {
		var list = getItemizedList();
		var $el = $ec("#paymentsItemizedOrder");
		$el.find(".subtotals").empty();
		if (!list.length) {
			$el.hide();
		} else {
			$el.show();
			var total = calculateTotal(list);
			$ec("#paymentsTotal").text(
				prod.formatCurrency(total < 0 ? 0 : total, false, true),
			);
			// no need to show an itemized list for one item
			if (
				list.length > 1 ||
				list.filter(function (item) {
					return item.multiplier;
				}).length >= 1
			) {
				list.forEach(function (item) {
					var leader = "";
					if (item.forField.closest(".ofReplicator").length) {
						leader =
							item.forField.closest(".ofFieldGroup").find(".groupName").text() +
							"\u00a0\u2013\u00a0";
					}
					var $subtotal = $ec("#subtotalTemplate")
						.clone()
						.removeAttr("id")
						.addClass("subtotalLineItem")
						.show();
					$subtotal
						.find(".description")
						.text(
							leader + (item.value ? item.description + ":" : item.description),
						);
					$subtotal.find(".selectedValue").text(item.value ? item.value : "");
					$subtotal
						.find(".multiplier")
						.text(
							item.multiplier && $ec.isNumeric(item.multiplier.amount)
								? prod.formatCurrency(item.amount, false, true) +
										"\u00a0\u00d7\u00a0" +
										item.multiplier.amount
								: "",
						);
					$subtotal
						.find(".subtotal")
						.text(
							prod.formatCurrency(calculateLineItemTotal(item), false, true),
						);
					$ec(".subtotals").append($subtotal);
				});
			}
			if (total < 0) {
				// add an adjustment item to the subtotal to account for the added amount
				var $subtotal = $ec("#subtotalTemplate")
					.clone()
					.removeAttr("id")
					.addClass("subtotalLineItem negativeAdjustment")
					.show();
				$subtotal.find(".description").text("Adjustment");
				$subtotal
					.find(".subtotal")
					.text(prod.formatCurrency(total * -1, false, true));
				$ec(".subtotals").append($subtotal);
			} else {
				$ec(".negativeAdjustment").remove();
			}
		}
	}

	// public API
	return {
		init: init,
		getMultiplierList: getMultiplierList,
		printItemizedList: printItemizedList,
		getTotal: function () {
			var total = calculateTotal(getItemizedList());
			return total < 0 ? 0 : total;
		},
		getAggregatedSubtotal: function () {
			var aggregatedList = getItemizedList()
				.map(function (item) {
					var rtn = "";
					var leader = "";
					if (item.forField.closest(".ofReplicator").length) {
						leader =
							item.forField.closest(".ofFieldGroup").find(".groupName").text() +
							"-";
						leader.toString().replace(/[:;]/g, " ");
					}
					rtn += leader;
					rtn += item.description.toString().replace(/[:;]/g, " ");
					rtn += item.value
						? "-" + item.value.toString().replace(/[:;]/g, " ")
						: "";
					rtn += ": ";
					rtn += item.amount;
					if (item.multiplier && $ec.isNumeric(item.multiplier.amount)) {
						rtn += " x ";
						rtn += item.multiplier.amount;
						rtn += " = ";
						rtn += item.amount * item.multiplier.amount;
					}
					return rtn;
				})
				.join("; ");
			// adjustments for negative amounts are not listed in the field object and need to be handled manually
			var $adjustment = $ec(".negativeAdjustment");
			if ($adjustment.length) {
				aggregatedList += "; Adjustment: ";
				aggregatedList += $adjustment.find(".subtotal").text().replace("$", "");
			}
			return aggregatedList;
		},
	};
})();

// Removes the dollar sign and commas
prod.unformatCurrency = function (value) {
	if (value) {
		return value.replace(/$|\,/g, "");
	}
	return value;
};

prod.formatCurrency = function (value, noSeparator, withLabel) {
	var parsed = parseFloat(value.replace ? value.replace(/[\$\,]/g, "") : value);
	var fixed = withLabel && parsed < 0 ? parsed * -1 : parsed;
	fixed = fixed.toFixed(2);
	fixed = fixed.replace(/(\d)(?=(\d{3})+\.)/g, "$1" + (noSeparator ? "" : ","));
	fixed =
		withLabel && parsed < 0 ? "-$" + fixed : withLabel ? "$" + fixed : fixed;

	return fixed;
};

prod.openLogin = function () {
	if (
		navigator.appVersion.indexOf("MSIE") != -1 ||
		navigator.appVersion.indexOf("Trident") != -1
	) {
		alert(
			"Internet Explorer is no longer allowed for login. Try Chrome or Firefox.",
		);
	} else if (location.protocol != "https:") {
		alert(
			"Login is only allowed for secure connections under HTTPS. You are about to be redirected, then try again.",
		);
		location.protocol = "https:";
	} else {
		//TEMP remove later - allow just clicking login to set the cookie
		if (!prod.getCookie("proxy-mode")) {
			prod.setCookie("proxy-mode", 0, 14);
		}
		let loginLink = $ec("#login");
		if (loginLink.is(".engageLogin")) {
			$ec.ajax("/csrf-token", {
				success: function (result, status, xhr) {
					var isModifyHeader = xhr.getResponseHeader("X-Security-IsModify");

					if (isModifyHeader === "true") {
						// user is logged in, but this is a cached page so hard-refresh
						window.location.reload(true);
						return;
					}

					sessionStorage.setItem("redirectUrl", window.location.href);
					window.location.href = loginLink.attr("loginUrl");
				},
				error: function () {
					sessionStorage.setItem("redirectUrl", window.location.href);
					window.location.href = loginLink.attr("loginUrl");
				},
				dataType: "text",
				cache: false,
				traditional: true,
			});
		} else {
			//load stylesheet
			var headContent =
				'<link rel="stylesheet" href="' +
				prod.getUrl("/resources/css/admin.css") +
				'" type="text/css" />';
			$ec("head").append(headContent);
			prod.waitForLoginLoad();
		}
	}
};

prod.initializeSVG = function (selector) {
	selector.each(function () {
		var icon = $ec(this);
		var url = icon
			.css("background-image")
			.replace(/^url\(['"]?/, "")
			.replace(/['"]?\)$/, "");
		var index = url.indexOf("?");
		var ending = "";
		if (index != -1) {
			ending = "#" + url.substring(index + 1);
			url = url.substring(0, index);
		}
		if (url.split(".").pop() == "svg" && ending != "") {
			if ($ec(".svg-defs " + ending).length == 0) {
				$ec.get(url, function (data) {
					var defs = $ec(".svg-defs");
					if (defs.length == 0) {
						var div = document.createElement("div");
						div.setAttribute("class", "svg-defs");
						div.innerHTML = new XMLSerializer().serializeToString(
							data.documentElement,
						);
						document.body.insertBefore(div, document.body.childNodes[0]);
					} else if ($ec(".svg-defs " + ending).length == 0) {
						defs.append(
							new XMLSerializer().serializeToString(data.documentElement),
						);
					}
				});
			}
			icon.css("background-image", "none");
			icon.prepend(
				'<svg class="icon"><use xlink:href="' + ending + '" /></svg>',
			);
		}
	});
};

prod.waitForLoginLoad = function () {
	if (typeof quickModal != "undefined") {
		//run after quickModal has loaded
		var url = $ec("#login:not(.disableLoginButton)").attr("loginUrl");
		// Check for redirects which indicate a cached page
		// https://stackoverflow.com/questions/9177252/detecting-a-redirect-in-ajax-request
		var xhr;
		var _orgAjax = $ec.ajaxSettings.xhr;
		$ec.ajaxSettings.xhr = function () {
			xhr = _orgAjax.call($ec.ajaxSettings);
			return xhr;
		};
		$ec.ajax(url, {
			success: function (result) {
				if (xhr.responseURL && xhr.responseURL.indexOf(url) === -1) {
					// this is a cached page, hard-refresh
					window.location.reload(true);
					return;
				}
				prod.loginDialog(result);
			},
			error: null,
			dataType: "text",
			cache: false,
			traditional: true,
		});
	} else {
		setTimeout(function () {
			//timer to wait for quickModal to load
			prod.waitForLoginLoad();
		}, 100);
	}
};

prod.getUrlAbsoluteOrRelative = function (url) {
	if (url.toLowerCase().indexOf("http") === 0) {
		return url;
	} else {
		return prod.getUrl(url);
	}
};

prod.getUrl = function (endUrl) {
	baseUrl = $ec("body").attr("baseUrl");
	var baseFinalUrl = "";
	var semiPosition = baseUrl.indexOf(";");
	if (semiPosition != -1) {
		//this moves the jsessionid to its proper place at the end of the URL
		baseFinalUrl = baseUrl.substring(semiPosition);
		baseUrl = baseUrl.substring(0, semiPosition);
	}
	var url = endUrl;
	if (endUrl == undefined) {
		return baseUrl;
	}
	if (url.charAt(0) == "/") {
		//remove the first character
		url = url.substring(1);
	}
	return baseUrl + url + baseFinalUrl;
};

prod.loginDialog = function (result) {
	// Now try to get the CSRF since we have a valid JSessionID
	if (!prod.initCSRFToken) {
		prod.loadCSRFScript();
	}

	var container = $ec(document.createElement("div"));
	container.html(prod.noscript(result));

	var dialog = $ec(container.find("#dialogContent").children(".quickModal"));
	$ec("body").append(dialog);

	dialog.quickModal();
	prod.setDialogTimeout(dialog);

	prod.setupLogin(dialog);
};

prod.shieldSuccess = function (element) {
	return function (returnValue) {
		returnValue = JSON.parse(returnValue);
		if (returnValue.result == "success") {
			location.reload(true);
		} else {
			element.find(".loginError").show();
		}
	};
};

prod.shieldError = function (errorMessage) {
	$ec(".loginError").html(prod.noscript(errorMessage)).show();
};

prod.setupShieldLogin = function (element) {
	var $shieldPassword = element.find("#shieldPassword");
	var $shieldSiteID = element.find("#shieldSiteID");
	var $submit = element.find(".submit");
	element.find(".loginError").hide();
	element.find("#shieldPassword").focus();
	element.find(".submit").on("click", function () {
		element.find(".loginError").hide();
		var password = element.find("#shieldPassword").val();
		var data = element.find("form").serialize();
		var saveUrl = $shieldSiteID.attr("loginUrl");
		if (saveUrl.match(/jsessionid/) == null) {
			prod.postForm(
				saveUrl,
				data,
				prod.shieldSuccess(element),
				prod.error(prod.shieldError),
			);
		} else {
			prod.badSessionWorkaround(element, saveUrl, data, password);
		}
	});
	$shieldPassword.on("keypress", function (e) {
		var code = e.keyCode || e.which; // Should be unnecessary with JQuery.
		if (code == 13) {
			$submit.click();
		}
	});
};

prod.badSessionWorkaround = function (element, saveUrl, data, password) {
	saveUrl = saveUrl.replace(/\;jsessionid.*$/, "");
	prod.postForm(
		saveUrl,
		data,
		prod.badSessionWorkaroundReceiver(element, saveUrl, data, password),
		prod.error(prod.shieldError),
	);
};
prod.badSessionWorkaroundReceiver = function (
	element,
	saveUrl,
	data,
	password,
) {
	return function (returnValue) {
		returnValue = JSON.parse(returnValue);
		if (returnValue.result == "success") {
			location.reload(true);
		} else {
			data = data.replace(/shieldPassword=[^&]/, "shieldPassword=" + password);
			prod.postForm(
				saveUrl,
				data,
				prod.shieldSuccess(element),
				prod.error(prod.shieldError),
			);
		}
	};
};

prod.setupLogin = function (dialog) {
	$ec("#loginError").hide();
	$ec("#rememberMe").not(".donorRememberMe").prop("checked", true);
	$ec("#password").attr("type", "password");

	dialog.find("input").first().focus();

	dialog.find(".cancel").click(function () {
		//close the dialog
		dialog.quickModal("close");
		prod.clearDialogTimeout();
	});
	dialog.find(".save").click(function () {
		var pageID = $ec("#core").attr("pageid");
		dialog.find("#pageID").val(pageID);
		prod.loginSecurity(dialog);
		var data = dialog.find("form").serialize();

		//send dialog info to server
		var saveUrl = dialog.find("#siteID").attr("loginUrl");

		prod.postForm(saveUrl, data, prod.loginSuccess, prod.loginError);
	});

	const legacyLoginBtn = dialog.find(".js-legacy-login-btn");
	const legacyLoginContainer = dialog.find(".js-legacy-login-container");

	if (legacyLoginBtn.length) {
		legacyLoginBtn.click(function () {
			legacyLoginBtn.toggleClass("active");
			legacyLoginContainer.toggleClass("active");
		});
	}

	//properly setup secureUrl to take you to this page
	$ec("#secureUrl").attr(
		"href",
		$ec("#secureUrl").attr("href") + window.location.pathname,
	);

	function toggleRememberMeParamForEngageLoginUrl() {
		let engageLoginButton = $ec(".engageLoginButton");
		if (!engageLoginButton.length) {
			return;
		}
		let currentHref = engageLoginButton.attr("href");
		if ($ec("#rememberMe").is(":checked")) {
			currentHref += "?remember-me=on";
		} else {
			currentHref = currentHref.replace("?remember-me=on", "");
		}

		engageLoginButton.attr("href", currentHref);
	}
	$ec("#rememberMe")
		.change(toggleRememberMeParamForEngageLoginUrl)
		.trigger("change");
};

prod.adminLoginAuto = function () {
	$ec(document).keypress(function (e) {
		var code = e.keyCode ? e.keyCode : e.which; // Should be unnecessary with JQuery.
		if (code == 13) {
			//enter: click the login button
			$ec(".save").each(function () {
				$ec(this).click();
			});
			e.preventDefault();
		}
	});
};

//turn off the login dialog after the timeout
prod.dialogTimeoutID = 0;
prod.dialogTimeout = 180000; //timeout at 3 minutes
prod.setDialogTimeout = function (dialog) {
	prod.dialogTimeoutID = setTimeout(function () {
		//close the dialog
		dialog.quickModal("close");
	}, prod.dialogTimeout);
};
prod.clearDialogTimeout = function () {
	if (prod.dialogTimeoutID != 0) {
		clearTimeout(prod.dialogTimeoutID);
		prod.dialogTimeoutID = 0;
	}
};

prod.loginSecurity = function (dialog) {
	var password = dialog.find("#password").val();
	dialog.find("#j_password").val(password);

	//reset the password field so that it isn't sent
	dialog.find("#password").val("");

	var username = dialog.find("#username").val();
	if (dialog.find("#siteID").val() != "") {
		username = dialog.find("#siteID").val() + "_" + username;
	}
	if ($ec("body").is(".donorLogin")) {
		username = "d_" + username;
	}
	dialog.find("#j_username").val(username);
};

prod.loginSuccess = function (response) {
	if (response.indexOf("success") === -1) {
		if (response.indexOf("engageWarning") !== -1) {
			prod.clearDialogTimeout();
			var container = $ec(document.createElement("div"));
			container.html(prod.noscript(response));
			var dialog = $ec(
				container.find("#dialogContent").children(".quickModal"),
			);
			$ec("body").append(dialog);
			dialog.quickModal();
			dialog.find(".cancel").click(function () {
				dialog.quickModal("close");
			});
			return;
		}
		prod.loginError();
	} else {
		if (!prod.getCookie("proxy-mode")) {
			prod.setCookie("proxy-mode", 0, 14);
		}
		//refresh
		location.reload(true);
	}
};

prod.loginError = function (jqXHR, textStatus, errorThrown) {
	if (errorThrown != undefined && errorThrown.indexOf("Internal") >= 0) {
		if (
			window.location.pathname.indexOf("adminlogin") >= 0 ||
			window.location.pathname.indexOf("dashboard") >= 0
		) {
			// this is actually a superadmin success
			$ec("#loginError").html("Success");
			location.reload(true);
		} else if (window.location.pathname.indexOf("payments") >= 0) {
			// this is actually a payment donor success
			$ec("#loginError").html("Success");
			location.reload(true);
		}
	}
	$ec("#loginError").show();
};

prod.usernameType = function () {
	var username = $ec(this).val();
	var donorID = $ec("#donorID").val();
	var resetCode = $ec("#resetCode").val();
	var dataObject = {
		username: username,
		donorID: donorID,
		resetCode: resetCode,
	};
	var data = JSON.stringify(dataObject);

	//send info to server
	$ec.ajax("/payments/donorManagement/createAccount/checkUsername", {
		type: "POST",
		headers: prod.csrfHeaders(),
		data: {
			data: data,
		},
		success: function () {
			prod.setLockFlag("usernameExists", false);
			$ec("#usernameExistsErrorText").hide();
		},
		error: prod.error(function (text) {
			prod.setLockFlag("usernameExists", true);
			$ec("#usernameExistsErrorText").text(text).show();
		}),
		cache: false,
		traditional: true,
	});
};

prod.passwordType = function () {
	var $el = $ec(this);
	$el.addClass("passwordEdited");
	var password = $el.val();
	var result = zxcvbn(password);
	var passwordSuggestions = "";
	var strength = {
		0: "Bad",
		1: "Not Good Enough",
		2: "Weak",
		3: "Good",
		4: "Very Strong",
	};
	$ec("#passwordStrengthLabel").html(strength[result.score]);
	$ec("#passwordStrengthLabel")
		.removeClass("pw0 pw1 pw2 pw3 pw4")
		.addClass("pw" + result.score);
	prod.setLockFlag("passwordWeak", result.score < 2); //if the score is too low, don't allow the password to change
	$ec("#passwordMeter").val(result.score);
	if (result.feedback.warning.length > 0) {
		passwordSuggestions +=
			"<p class='passwordWarning'>" + result.feedback.warning + "</p>";
	}
	for (var i = 0; i < result.feedback.suggestions.length; i++) {
		passwordSuggestions +=
			"<p class='passwordSuggestion'>" +
			result.feedback.suggestions[i] +
			"</p>";
	}
	if (passwordSuggestions.length > 0) {
		$ec("#passwordSuggestions").addClass("warning").html(passwordSuggestions);
	} else {
		$ec("#passwordSuggestions").removeClass("warning").html("");
	}
};

prod.passwordConfirm = function () {
	if ($ec("#password").val() !== $ec("#confirm").val()) {
		prod.setLockFlag("passwordMismatch", true);
		$ec("#passwordMismatchErrorText").show();
	} else {
		prod.setLockFlag("passwordMismatch", false);
		$ec("#passwordMismatchErrorText").hide();
	}
};

// ensure users can't submit a password form until the locks have been overcome
prod.passwordSubmitLocked = true;
prod.passwordSubmitClicked = false;

// each lock is enabled by default and must be overcome to enable the form
// some locks are automatically disabled based on the dialog mode
prod.passwordLockFlags = {
	passwordWeak: true,
	usernameExists: !!$ec("#username").length,
	passwordMismatch: !!$ec("#confirm").length,
};

prod.setLockFlag = function (k, v) {
	// set lock flag
	prod.passwordLockFlags[k] = v;
	// if any lock flags are on, the form is locked
	// NOTE can't use Object.values because it's not the future and IE 11 still exists
	prod.passwordSubmitLocked = Object.keys(prod.passwordLockFlags)
		.map(function (e) {
			return prod.passwordLockFlags[e];
		})
		.reduce(function (a, c) {
			return a || c;
		}, false);
};

//strips any script tags from html code
prod.noscript = function (strCode) {
	var html = $ec(strCode.bold());
	html.find("script").remove();
	return html.html();
};

//serializes a form into an object
//modified from: http://stackoverflow.com/questions/1184624/convert-form-data-to-js-object-with-jquery
prod.serializeForm = function (form) {
	var o = {};
	o.data = {};
	form.find(".paymentAmount").each(function () {
		//Don't show results for hidden replicated payments
		if (!$ec(this).parents(".ofReplicatorHidden").length) {
			staticValue = $ec(this).find(".staticValue");
			staticValue
				.parent()
				.append(
					'<input hidden name="' +
						$ec(this).find(".static").attr("id") +
						'" value="' +
						staticValue.text() +
						'" />',
				);
		}
	});
	var a = form.serializeArray();
	$ec.each(a, function () {
		if (o[form.name] !== undefined) {
			if (!o[this.name].push) {
				o[this.name] = [o[this.name]];
			}
			o[this.name].push(this.value || "");
		} else {
			if (this.value) {
				if (o[this.name] !== undefined) {
					o[this.name] = o[this.name] + "|" + this.value; //this is really for checkboxes, so the get aggregated into the same field
				} else {
					o[this.name] = this.value;
				}
			} else {
				if (!o[this.name]) {
					o[this.name] = "";
				}
			}
		}
	});
	return o;
};

// Spring generates CSRF tokens which are included on every page via head.jsp (and in one case, adminLogin.jsp).
// These tokens need to be sent with every POST request to the server.
prod.csrfHeaders = function () {
	var token = $ec("meta[name='_csrf']").attr("content");
	var header = $ec("meta[name='_csrf_header']").attr("content");
	if (!header || !token || (prod.initCSRFToken && !prod.isCSRFTokenValid)) {
		alert(
			"An error occurred while retrieving a new security token, please reload this page",
		);
		throw new Error("An error occurred while retrieving a new security token");
	}
	var headers = {};
	headers[header] = token;
	return headers;
};

// Load the CSRF token, since we will need it
prod.loadCSRFScript = function () {
	if (!prod.initCSRFToken) {
		$ec.getScript(prod.getUrl("/resources/scripts/csrf.js"), function () {
			prod.initCSRFToken && prod.initCSRFToken();
		});
	}
};

//put without blocking the screen
prod.postForm = function (url, data, success, error) {
	$ec.ajax(url, {
		type: "POST",
		headers: prod.csrfHeaders(),
		data: data,
		success: success,
		error: error,
		dataType: "text",
		cache: false,
		traditional: true,
	});
};

prod.get = function (url, data, success, error) {
	$ec.ajax(url, {
		data: data,
		success: success,
		error: error,
		dataType: "text",
		cache: false,
		traditional: true,
	});
};

prod.printCalendar = function (el) {
	var $el = $ec(el.target);
	var $module = $el.closest(".calendarModule");
	var printUrl =
		$el.closest(".calendarExportContainer").data("printurl") +
		"&page=" +
		$ec("#core").attr("pageid") +
		"&printView=" +
		($el.is(".calendarView") ? "calendar" : "list");
	var $printLink = $ec("<a>")
		.attr({
			href: printUrl,
			target: "_blank",
			id: "printCalendarDispatcher",
		})
		.css({
			display: "none",
		});
	var $body = $ec("body");
	$body.append($printLink);
	document.getElementById("printCalendarDispatcher").click();
	$printLink.remove();
};

prod.jimoLogout = function (e) {
	// Clear localstorage data related to Jimo
	if (window.jimo) {
		window.jimo.push(["do", "storage:reset"]);
	}
};

// Load a script from given `url`
prod.loadScript = function (url) {
	return new Promise(function (resolve, reject) {
		const script = document.createElement("script");
		script.src = url;
		document.head.appendChild(script);

		script.addEventListener("load", function () {
			// The script is loaded completely
			resolve(true);
		});
	});
};

$ec(function () {
	if ($ec("#shieldLogin").length > 0) {
		// Secure Page login
		prod.setupShieldLogin($ec("#shieldLogin"));
	}
	if ($ec("#adminLogin").length > 0) {
		//admin login page
		prod.setupLogin($ec("#adminLogin"));
		prod.adminLoginAuto();
		prod.initCSRFToken && prod.initCSRFToken();
	} else if ($ec("#resetPassword").is("*")) {
		//nothing runs for this yet
	} else {
		//normal page
		if ($ec("#nav").length > 0) {
			prod.setOrigSiteWidth();
			prod.sticky = $ec("#nav").hasClass("sticky");
			prod.noResize = $ec("#nav").hasClass("noResize");
			prod.checkMegaMenus();
			prod.checkMobile(true);
			$ec(window).resize(function () {
				prod.checkMobile(false);
			});
			prod.resizeNav(false);

			$ec("#navicon").click(function () {
				$ec("body").toggleClass("mobilePanelActive");
				prod.navCollapsibleOpenSelected($ec("#mobileNav"));
				//if possible, scroll to current page at vertical center of mobile panel
				var center = $ec("#mobilePanel").height() / 2;
				var top = $ec("#mobileNav .sideNavCurrent").offset().top;
				if (top > center) {
					$ec("#mobilePanel").scrollTop(top - center);
				}
				return false;
			});
			$ec(".navCollapsible.navCollapsed > ul").slideToggle(0); //Initalize the Toggle off collapsibles
			//apply to group names and not group's collapsible icon to avoid double call on one click
			$ec(
				".navCollapsible:not(.navPage) > .navName, .navCollapsible.navFirstLevelGroup > .navName",
			).click(function () {
				prod.navCollapsibleClick($ec(this).parent());
			});
			//apply to collapsible icons on pages and prevent following the link
			$ec(
				".navCollapsible.navPage:not(.navFirstLevelGroup) > .navName > .collapsibleIcon",
			).click(function (event) {
				event.preventDefault();
				prod.navCollapsibleClick($ec(this).closest(".navCollapsible"));
			});

			prod.resizeModules($ec("body")); //this was moved to the ready event to prevent videos from changing size on the screen
			//Rerun sitename sizing after fonts have loaded
			$ec(window).on("load", function () {
				prod.resizeSiteName($ec("#siteName"));
			});
			// run here at page load to mitigate the delay of a slow computer
			prod.paymentForm.init();
			prod.setupPaymentMessaging();
		}
		prod.moveFooterItems();
		//this opens the link in data-url in a new window and prevents the original click event from going through
		$ec("#footerBrand a").click(function (event) {
			event.preventDefault();
			let url = $ec(this).data("url");
			if (event.originalEvent.shiftKey && $ec(this).data("uuid-host")) {
				let poweredByUrl = new URL(window.location.href);
				poweredByUrl.host = $ec(this).data("uuid-host");
				url = poweredByUrl;
			}
			window.open(url, "_blank");
		});
		prod.setFooterHeight();
		//Try setting up SVGs, even though the CSS may not be completely rendered yet.
		prod.initializeSVG(
			$ec(
				".socialMediaBody a, .personSocialMedia a, #navicon, #header #searchSubmit, #header #searchPopup, .buttonModuleButton .buttonLabelContainer, .rssLink, #quickLinks a, .htmlButton, .aggregateMore",
			),
		);
		$ec("body").on("click", ".printCalendar", prod.printCalendar);
		prod.initCSRFToken && prod.initCSRFToken();
		if (!prod.initCSRFToken && $ec("form, .paymentModule").length > 0) {
			prod.loadCSRFScript();
		}
	}
});

//run after the load event
$ec(window).on("load", function () {
	if (!($ec("#adminLogin").length > 0 || $ec("#resetPassword").is("*"))) {
		//normal page
		prod.initializeSVG(
			$ec(
				".socialMediaBody a, .personSocialMedia a, #navicon, .searchBoxSubmit, .buttonModuleButton .buttonLabelContainer, .rssLink, #quickLinks a, .htmlButton, .aggregateMore",
			),
		);
		prod.setFooterHeight();
		prod.sizeCore();
		if (typeof less !== "undefined") {
			less.refresh().then(function (result) {
				$ec(window).trigger("resize");
			});
		}

		if (!prod.isMobile()) {
			prod.sizeContentDivs();
		}
		if (prod.sticky) {
			prod.initNavSticky();
		}

		prod.initModules($ec("body"));
		if ($ec(".infinite-more-link").length > 0) {
			var debouncedHandler;
			var infiniteScrolling = function () {
				var link = $ec(".infinite-more-link").first();
				if (link.length > 0) {
					const scrollTop = $ec(window).scrollTop();
					const buffer = 300;
					if (
						link.offset().top <=
						Math.floor($ec(window).height() + scrollTop) + buffer
					) {
						$ec.ajax({
							dataType: "html",
							url: link.prop("href"),
							success: function (html) {
								html = $ec($ec.parseHTML(html))
									.find(".infinite-container")
									.addBack(".infinite-container")
									.html();
								$ec(".infinite-container").first().append(html);
								link.remove();
								// Ensure the browser didn't scroll
								$ec(window).scrollTop(scrollTop);

								if (typeof admin != "undefined") {
									admin.setupInactiveTags();
								}
								//Add lightbox for new items
								initPhotoSwipeFromDOM(".photoAlbum");

								prod.initDynamicThumbs($ec("body"));
							},
						});
					}
				} else {
					// no more items, so remove this listener
					$ec(window).off("scroll", debouncedHandler);
				}
			};
			debouncedHandler = debounce(infiniteScrolling, 250);
			$ec(window).on("scroll", debouncedHandler);
		}
		$ec("#login:not(.disableLoginButton)").click(prod.openLogin);
		$ec("#calendarPageSelection").change(function () {
			window.location = $ec(this).val();
		});
	}
});

/*
 * JavaScript Pretty Date
 * Copyright (c) 2011 John Resig (ejohn.org)
 * Licensed under the MIT and GPL licenses.
 */

// Takes an ISO time and returns a string representing how
// long ago the date represents.
function prettyDate(time) {
	var date = new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " ")),
		diff = (new Date().getTime() - date.getTime()) / 1000,
		day_diff = Math.floor(diff / 86400);

	if (isNaN(day_diff) || day_diff < 0 || day_diff >= 365) {
		return "";
	}

	return (
		(day_diff == 0 &&
			((diff < 60 && "just now") ||
				(diff < 120 && "1 minute ago") ||
				(diff < 3600 && Math.floor(diff / 60) + " minutes ago") ||
				(diff < 7200 && "1 hour ago") ||
				(diff < 86400 && Math.floor(diff / 3600) + " hours ago"))) ||
		(day_diff == 1 && "Yesterday") ||
		(day_diff < 7 && day_diff + " days ago") ||
		(day_diff < 365 && Math.ceil(day_diff / 7) + " weeks ago")
	);
}

// jquery-visible plugin: detect if an element is visible in the viewport
// Source: https://github.com/customd/jquery-visible
// Copyright (c) 2012 Digital Fusion, http://teamdf.com/
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
(function (e) {
	e.fn.visible = function (t, n, r) {
		var i = e(this).eq(0),
			s = i.get(0),
			o = e(window),
			u = o.scrollTop(),
			a = u + o.height(),
			f = o.scrollLeft(),
			l = f + o.width(),
			c = i.offset().top,
			h = c + i.height(),
			p = i.offset().left,
			d = p + i.width(),
			v = t === true ? h : c,
			m = t === true ? c : h,
			g = t === true ? d : p,
			y = t === true ? p : d,
			b = n === true ? s.offsetWidth * s.offsetHeight : true,
			r = r ? r : "both";
		if (r === "both") {
			return !!b && m <= a && v >= u && y <= l && g >= f;
		} else if (r === "vertical") {
			return !!b && m <= a && v >= u;
		} else if (r === "horizontal") {
			return !!b && y <= l && g >= f;
		}
	};
})($ec);

/**
 * Copyright Marc J. Schmidt. See the LICENSE file at the top-level directory of this distribution and at https://github.com/marcj/css-element-queries/blob/master/LICENSE.
 */
!(function () {
	(window.ResizeSensor = function (e, t) {
		function s() {
			(this.q = []),
				(this.add = function (e) {
					this.q.push(e);
				});
			var e, t;
			this.call = function () {
				for (e = 0, t = this.q.length; t > e; e++) {
					this.q[e].call();
				}
			};
		}
		function i(e, t) {
			return e.currentStyle
				? e.currentStyle[t]
				: window.getComputedStyle
				? window.getComputedStyle(e, null).getPropertyValue(t)
				: e.style[t];
		}
		function o(e, t) {
			if (e.resizedAttached) {
				if (e.resizedAttached) {
					return void e.resizedAttached.add(t);
				}
			} else {
				(e.resizedAttached = new s()), e.resizedAttached.add(t);
			}
			(e.resizeSensor = document.createElement("div")),
				(e.resizeSensor.className = "resize-sensor");
			var o =
					"position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: scroll; z-index: -1; visibility: hidden;",
				n = "position: absolute; left: 0; top: 0;";
			(e.resizeSensor.style.cssText = o),
				(e.resizeSensor.innerHTML =
					'<div class="resize-sensor-expand" style="' +
					o +
					'"><div style="' +
					n +
					'"></div></div><div class="resize-sensor-shrink" style="' +
					o +
					'"><div style="' +
					n +
					' width: 200%; height: 200%"></div></div>'),
				e.appendChild(e.resizeSensor),
				{ fixed: 1, absolute: 1 }[i(e, "position")] ||
					(e.style.position = "relative");
			var r,
				d,
				l = e.resizeSensor.childNodes[0],
				c = l.childNodes[0],
				h = e.resizeSensor.childNodes[1],
				f =
					(h.childNodes[0],
					function () {
						(c.style.width = l.offsetWidth + 10 + "px"),
							(c.style.height = l.offsetHeight + 10 + "px"),
							(l.scrollLeft = l.scrollWidth),
							(l.scrollTop = l.scrollHeight),
							(h.scrollLeft = h.scrollWidth),
							(h.scrollTop = h.scrollHeight),
							(r = e.offsetWidth),
							(d = e.offsetHeight);
					});
			f();
			var a = function () {
					e.resizedAttached && e.resizedAttached.call();
				},
				u = function (e, t, s) {
					e.attachEvent ? e.attachEvent("on" + t, s) : e.addEventListener(t, s);
				},
				z = function () {
					(e.offsetWidth > r ||
						e.offsetHeight > d ||
						e.offsetWidth < r ||
						e.offsetHeight < d) &&
						a(),
						f();
				};
			u(l, "scroll", z), u(h, "scroll", z);
		}
		if (
			"[object Array]" === Object.prototype.toString.call(e) ||
			("undefined" != typeof $ec && e instanceof $ec) ||
			("undefined" != typeof Elements && e instanceof Elements)
		) {
			for (var n = 0, r = e.length; r > n; n++) {
				o(e[n], t);
			}
		} else {
			o(e, t);
		}
		this.detach = function () {
			window.ResizeSensor.detach(e);
		};
	}),
		(window.ResizeSensor.detach = function (e) {
			e.resizeSensor &&
				(e.removeChild(e.resizeSensor),
				delete e.resizeSensor,
				delete e.resizedAttached);
		});
})();

/*
 * Debounce function taken from Underscore.js
 * http://underscorejs.org/docs/underscore.html#section-83
 *
 * Parameters are:
 * function to debounce
 * wait interval
 * optional boolean to trigger the function on the leading edge, instead of the trailing
 */
function debounce(n, u, t) {
	var e,
		l,
		o,
		r,
		i,
		a = function () {
			var c = Date.now() - r;
			c < u && c >= 0
				? (e = setTimeout(a, u - c))
				: ((e = null), t || ((i = n.apply(o, l)), e || (o = l = null)));
		};
	return function () {
		(o = this), (l = arguments), (r = Date.now());
		var c = t && !e;
		return (
			e || (e = setTimeout(a, u)), c && ((i = n.apply(o, l)), (o = l = null)), i
		);
	};
}
