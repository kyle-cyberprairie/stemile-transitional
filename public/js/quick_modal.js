// developed using this tutorial: http://www.erichynds.com/jquery/tips-for-developing-jquery-ui-widgets/
$ec.widget("ui.quickModal", {
	_init: function () {
		quickModal.add($ec(this.element));
		quickModal.resizeFreezeScreen();
	},
	close: function () {
		quickModal.close();
	},
	hide: function () {
		quickModal.hideModalAndBlocker();
	},
	closeAll: function () {
		quickModal.closeAll();
	},
});

//static variables here
var quickModal = {};
quickModal.freeze = 0;
quickModal.contents = [];
quickModal.zIndexBase = 1300;

quickModal.add = function ($this) {
	//move the other dialog off the screen
	var oldContent = quickModal.contents[quickModal.contents.length - 1];
	if (oldContent != undefined) {
		quickModal.hideModal(oldContent);
	}

	var zIndex = quickModal.zIndexBase + quickModal.contents.length + 1;
	$this.css({
		zIndex: zIndex,
	});

	quickModal.contents.push($this);
	quickModal.freezeScreen();
	quickModal.showModal($this);
};

//closes the most recently opened dialog
quickModal.close = function () {
	currentContent = quickModal.contents.pop();
	if (currentContent != undefined) {
		currentContent.animate(
			{
				opacity: 0,
			},
			500,
			function () {
				currentContent.remove();
			},
		);
	}
	var oldContent = quickModal.contents[quickModal.contents.length - 1];
	if (oldContent != undefined) {
		quickModal.showModal(oldContent);
		quickModal.blocker.show();
	}
	quickModal.unfreezeScreen();
};

quickModal.closeAll = function () {
	while (quickModal.contents.length) {
		quickModal.close();
	}
};

quickModal.dispose = function (element) {
	element.remove();
};

quickModal.showModal = function (element) {
	element.show();
	element.css({
		opacity: 0,
	});
	element.animate(
		{
			opacity: 1,
		},
		500,
	);
	element.find("input").first().focus();

	quickModal.dialogHelper(element);
};

quickModal.hideModal = function (element) {
	element.animate(
		{
			opacity: 0,
		},
		500,
		function () {
			element.hide();
		},
	);
};

quickModal.hideModalAndBlocker = function () {
	element = quickModal.contents[quickModal.contents.length - 1];
	element.hide();
	quickModal.blocker.hide();
};

quickModal.resizeFreezeScreen = function () {
	if (quickModal.freeze) {
		quickModal.viewportWidth = $ec(window).width();
		quickModal.viewportHeight = $ec(window).height();
		quickModal.blocker.css({
			width: quickModal.viewportWidth,
			height: quickModal.viewportHeight,
		});
	}
};

quickModal.freezeScreen = function () {
	quickModal.freeze++;
	//make sure that the old blocker has finished (possibly removed itself) before creating a new one
	$ec("#quickModalBlocker").finish();
	//track the number of active freeze from all dialogs commands and only freeze one the first
	if (quickModal.freeze == 1) {
		var body = $ec("body");
		var html = $ec("html");
		if (
			navigator.appVersion.indexOf("Trident") == -1 &&
			navigator.appVersion.indexOf("Edge") == -1
		) {
			//not using IE/Edge
			//copied freeze code came from here: http://stackoverflow.com/questions/5485244/jquery-simplemodal-disable-scrolling/6403909#6403909
			quickModal.oldBodyMarginRight = body.css("margin-right");
			var oldBodyOuterWidth = body.outerWidth(true);
			var oldScrollTop = html.scrollTop();
			var newBodyOuterWidth;
			html.css("overflow", "hidden");
			newBodyOuterWidth = body.outerWidth(true);
			body.css(
				"margin-right",
				newBodyOuterWidth -
					oldBodyOuterWidth +
					parseInt(quickModal.oldBodyMarginRight) +
					"px",
			);
			html.scrollTop(oldScrollTop); // necessary for Firefox
			$ec("#simplemodal-overlay").css("width", newBodyOuterWidth + "px");
			//end copied freeze code
		}

		//create the blocker
		quickModal.viewportWidth = $ec(window).width();
		quickModal.viewportHeight = $ec(window).height();
		quickModal.blocker = $ec(document.createElement("div"));
		quickModal.blocker.attr("id", "quickModalBlocker");
		$ec("body").append(quickModal.blocker);
		quickModal.blocker.css({
			position: "fixed",
			top: 0,
			left: 0,
			width: quickModal.viewportWidth,
			height: quickModal.viewportHeight,
			backgroundColor: "#000000",
			opacity: "0",
			zIndex: quickModal.zIndexBase,
		});
		quickModal.blocker.animate(
			{
				opacity: ".70",
			},
			250,
		);

		//set the resize event
		$ec(window).resize(quickModal.resizeFreezeScreen);
		$ec("body").addClass("quickModalVisible");
	}
};

quickModal.unfreezeScreen = function () {
	quickModal.freeze--;
	//track the number of active freeze commands from all dialogs and only unfreeze when they're all gone
	if (quickModal.freeze == 0) {
		var html = $ec("html");
		if (
			navigator.appVersion.indexOf("Trident") == -1 &&
			navigator.appVersion.indexOf("Edge") == -1
		) {
			//not using IE/Edge
			//copied unfreeze code came from here: http://stackoverflow.com/questions/5485244/jquery-simplemodal-disable-scrolling/6403909#6403909
			var oldScrollTop = html.scrollTop(); // necessary for Firefox.
			html.css("overflow-y", "").scrollTop(oldScrollTop);
			$ec("body").css("margin-right", quickModal.oldBodyMarginRight);
			//end copied unfreeze code
		}

		//destroy blocker
		quickModal.blocker.animate(
			{
				opacity: "0",
			},
			250,
			function () {
				quickModal.blocker.remove();
			},
		);

		//destroy the resize event
		$ec(window).off("resize", quickModal.resizeFreezeScreen);
	}
};

//any helper functions to be used on dialogs
quickModal.dialogHelper = function (element) {
	element.find(".inputHolder input[maxlength]").on("keydown", function (e) {
		var $el = $ec(this);
		var keyOffset = e.keyCode == 8 ? -1 : 1;
		if ($el.val().length + keyOffset > $el.prop("maxlength")) {
			$el.parents(".inputHolder").addClass("maxLength");
		} else {
			$el.parents(".inputHolder").removeClass("maxLength");
		}
	});
	element.find(".inputHolder input[maxlength]").on("keyup", function (e) {
		var $el = $ec(this);
		if ($el.val().length < $el.prop("maxlength")) {
			$el.parents(".inputHolder").removeClass("maxLength");
		}
	});
	if (typeof admin != "undefined") {
		admin.autoFillAlias($ec("#navName"), $ec("#pageName"), $ec("#pageAlias"));
	}
};

//convert text into a url compatible slug
//http://dense13.com/blog/2009/05/03/converting-string-to-slug-javascript/
quickModal.stringToSlug = function (str) {
	str = str.replace(/^\s+|\s+$/g, ""); // trim
	str = str.toLowerCase();

	// remove accents, swap ñ for n, etc
	var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
	var to = "aaaaeeeeiiiioooouuuunc------";
	for (var i = 0, l = from.length; i < l; i++) {
		str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
	}

	str = str
		.replace(/[^a-z0-9 -]/g, "") // remove invalid chars
		.replace(/\s+/g, "-") // collapse whitespace and replace by -
		.replace(/-+/g, "-"); // collapse dashes

	return str;
};
