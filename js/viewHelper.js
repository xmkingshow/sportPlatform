var NViewConfig = {
	fontPath: '_www/fonts/iconfont.ttf'
};

// 标签
var NViewTag = {
	font: function(id, text, position, style) {

		style = style || {};
		position = position || {};

		style.fontSrc = NViewConfig.fontPath;

		return {
			tag: "font",
			id: id,
			text: text,
			position: position,
			textStyles: style
		};
	}
};

// 视图
var New = {
	
	View: function(id,style,cb,click,viewObj) {
		
		click = click || function(){};
		
		var self = new plus.nativeObj.View(id, style);
		
		cb(self);
		
		self.addEventListener("click", function(){ click(self); }, false);
		
		viewObj.append(self);
		
		return self;
		
	}
	
};