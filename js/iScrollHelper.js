// 测试通过 
// IOS 11.1 Ipone 6

// 上拉状态
// iScrollHelper.stateScrollUp(true|false,cb);

// 下拉状态 
// iScrollHelper.stateScrollDown(true|false,cb);

// Dome
//	iScrollHelper.init({
//		// 监听对象
//		eveDome: 'dome(id)',
//	
//		up: {
//			// 上拉触发距离
//			disi: 50,
//	
//			// 上拉触发事件
//			callback: function() {
//	
//				// 事件完成执行
//				iScrollHelper.refreshState(function() {});
//			},
//	
//			// 上拉动画
//			view: function(e) {
//				if(e > 0.99) {
//					imInputView.setInputFocusById("msgInput", true);
//				}
//			}
//		}
//	});

window.iScrollHelper = function() {};

(function($, window) {

	var that = {};

	// 游标
	that.lasty = 0;

	// true 正在执行
	that.state = false;

	// 控件相关参数
	that.Params = {

		// 监听对象
		eveDome: null,

		// 上拉 Param
		up: {
			// 状态
			state: true,

			// 上拉触发距离
			disi: 100,

			// 上拉触发事件
			callback: null,

			// 上拉动画
			view: function(e) {
				// console.log('上拉:', e)
			}
		},

		// 下拉 Param
		down: {
			// 状态
			state: true,

			// 下拉触发距离
			disi: 100,

			// 下拉书法事件
			callback: null,

			// 下拉动画
			view: function(e) {
				// console.log('下拉:', e)
			}
		}

	};

	that.endscroll = function(e) {

		$.touchstate = false;

		// 下拉被暂停
		if(!that.Params.down.state || that.lasty < 10) return;

		// 下拉超过设定值
		if(that.lasty > that.Params.down.disi) {

			// 初始化 游标
			that.lasty = 0;

			// 进入工作状态
			that.state = true;

			// 执行下拉事件
			that.Params.down.callback();

		} else {
			if(that.Params.down.callmiss) that.Params.down.callmiss();
		}
	}

	that.scroll = function(e) {

		if(!e.detail) return;
		//		console.log(.offsetTop,$.offsetTop)
		for(var i in e.detail.srcElement) {
			console.log(e.detail.srcElement[i])
		}

		if(that.Params.change) that.Params.change({
			y: 0 - e.detail.lastY,
			maxy: 0 - e.detail.maxScrollY
		});

		// 正在执行
		if(that.state) return;

		// 上拉下拉都被暂停
		if(!that.Params.up.state && !that.Params.down.state) return;

		if(e.detail.lastY > 0) {

			if(that.lasty < 0) {
				if(e.detail.lastY - that.lasty > 100) {
					return;
				}
			}

			// 滚动超过顶部

			// 下拉被暂停
			if(!that.Params.down.state) return;

			// 调整视图
			that.Params.down.view((e.detail.lastY / that.Params.down.disi));

			that.lasty = e.detail.lastY;

		} else if(e.detail.maxScrollY > e.detail.lastY) {

			// 滚动超过底部 

			// 上拉被暂停
			if(!that.Params.up.state) return;

			that.lasty = e.detail.lastY;

			var upDisi = e.detail.maxScrollY - e.detail.lastY;

			that.Params.up.view((upDisi / that.Params.up.disi));

		} else {
			that.lasty = e.detail.lastY;
		}
	};

	// 滚动到底部
	that.scrollbottom = function(e) {

		// 正在执行
		if(that.state) return;

		// 停用状态
		if(!that.Params.up.state) return;

		var upDisi = e.detail.lastY - that.lasty;

		if(upDisi > that.Params.up.disi) {

			// 进入工作状态
			that.state = true;

			// 回调函数
			that.Params.up.callback();
		}

	};

	// 初始化滚动条位置
	$.offsetTop = 0;

	// 调整上拉控件状态
	$.stateScrollUp = function(state, cb) {
		that.Params.up.state = state;
		cb && cb();
	};

	// 调整下拉控件状态 [true false]
	$.stateScrollDown = function(state, cb) {
		that.Params.down.state = state;
		cb && cb();
	};

	// 取消正在执行状态
	$.refreshState = function(cb) {
		that.state = false;
		cb && cb();
	};

	// 初始化控件
	that.initialize = function() {

		document.getElementById(that.Params.eveDome).addEventListener("scroll", that.scroll, false);

		document.getElementById(that.Params.eveDome).addEventListener("touchend", that.endscroll, false);

		document.getElementById(that.Params.eveDome).addEventListener("touchstart", function() {
			$.touchstate = true;
		}, false);

		document.getElementById(that.Params.eveDome).addEventListener("scrollbottom", that.scrollbottom, false);

	};

	that.extend = function(target, source, deep) {
		if(mui) {
			return mui.extend(target, source, deep);
		} else if(jQuery) {
			return jQuery.extend(target, source, deep);
		} else {
			console.error('please use mui or jQuery or definition extend.');
		}
	};

	$.init = function(obj) {

		if(!obj) return console.error('init Paras is null');

		if(!obj.eveDome) return console.error('init eveDome is null');

		if(obj.up) {
			obj.up.state = true;
			if(!obj.up.callback) return console.error('init up.callback is null');
		} else {
			obj.up = {
				state: false
			};
		}

		if(obj.down) {
			obj.down.state = true;
			if(!obj.down.callback) return console.error('init down.callback is null');
		} else {
			obj.down = {
				state: false
			};
		}

		// 合并对象
		that.Params = that.extend(that.Params, obj, false);

		// 控件初始化
		that.initialize();

	};

}(iScrollHelper, window));