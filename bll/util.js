var aniShow = {};
var util = {
	options: {
		active_color: '#1cb937',
		normal_color: '#6f6e6e',
		subpages: [
			'../addressList/index.html',
			'../find/index.html',
			'../my/index.html'
		]
	},
	/**
	 *  简单封装了绘制原生view控件的方法
	 *  绘制内容支持font（文本，字体图标）,图片img , 矩形区域rect
	 */
	drawNative: function(id, styles, tags) {
		var view = new plus.nativeObj.View(id, styles, tags);
		return view;
	},
	/**
	 * 初始化首个tab窗口 和 创建子webview窗口 
	 */
	initSubpage: function() {

		var subpage_style = {
				top: '0px',
				bottom: '51px'
			},
			subpages = util.options.subpages,
			self = plus.webview.currentWebview(),
			temp = {};

		// 初始化第一个tab项为首次显示
		temp[self.id] = "true";
		mui.extend(aniShow, temp);

		// 初始化绘制首个tab按钮
		util.toggleNview(self.getStyle().subNViews[0], 0);

		for(var i = 0, len = subpages.length; i < len; i++) {

			if(!plus.webview.getWebviewById(subpages[i])) {
				var sub = plus.webview.create(subpages[i], subpages[i], subpage_style);
				//初始化隐藏
				sub.hide();
				// append到当前父webview
				self.append(sub);
			}
		}
	},
	/**	
	 * 点击切换tab窗口 
	 */
	changeSubpage: function(targetPage, activePage) {
		//若为iOS平台或非首次显示，则直接显示
		if(mui.os.ios || aniShow[targetPage]) {
			plus.webview.show(targetPage);
		} else {
			//否则，使用fade-in动画，且保存变量
			var temp = {};
			temp[targetPage] = "true";
			mui.extend(aniShow, temp);
			plus.webview.show(targetPage, "fade-in", 300);
		}
		//隐藏当前 除了第一个父窗口
		if(activePage !== plus.webview.getLaunchWebview()) {
			plus.webview.hide(activePage);
		}
	},
	/**
	 * 点击重绘底部tab （view控件）
	 */
	toggleNview: function(currObj, currIndex) {
		var self = plus.webview.currentWebview();
		// 重绘当前nview
		self.updateSubNViews([{
			id: currObj.id,
			tags: [
				util.changeColor(currObj.tags[0], util.options.active_color, 0),
				util.changeColor(currObj.tags[1], util.options.active_color, 1)
			]
		}])

		// 重绘兄弟nview
		for(var i = 0; i < 4; i++) {
			var viewObj = self.getStyle().subNViews[i];

			if(i !== currIndex) {
				util.updateSubNView(viewObj);
			}
		}
	},
	/*
	 * 改变颜色
	 */
	changeColor: function(obj, color, bot) {
		obj.textStyles.color = color;
		if(obj.id == 'tabBar32' && bot == 1) {
			if((plus.storage.getItem("$cart") - 0) > 0) {
				obj.text = '购物车(' + plus.storage.getItem("$cart") + ')';
			}
		} else if(bot == 0) {
			obj.text = obj.ontext;
		}
		return obj
	},
	$changeColor: function(obj, color, bot) {
		obj.textStyles.color = color;
		if(obj.id == 'tabBar32' && bot == 1) {
			if((plus.storage.getItem("$cart") - 0) > 0) {
				obj.text = '购物车(' + plus.storage.getItem("$cart") + ')';
			}

		} else if(bot == 0) {
			obj.text = obj.$text;
		}
		return obj
	},
	/*
	 * 利用 webview 提供的 updateSubNViews 方法更新 view 控件
	 */
	updateSubNView: function(obj) {
		var self = plus.webview.currentWebview();
		self.updateSubNViews([{
			id: obj.id,
			tags: [
				util.$changeColor(obj.tags[0], util.options.normal_color, 0),
				util.$changeColor(obj.tags[1], util.options.normal_color, 1)
			]
		}]);
	}
};

document.addEventListener("plusready", function() {

	function logoutPushMsg(obj) {
		plus.push.createMessage(obj.payload.title + ':' + obj.payload.massage);
	}

	// 监听点击消息事件
	plus.push.addEventListener("'click'", function(msg) {
		// 判断是从本地创建还是离线推送的消息
		switch(msg.payload) {
			case "LocalMSG":
				// outSet("点击本地创建消息启动：");
				break;
			default:
				// outSet("点击离线推送消息启动：");
				break;
		}
		// 处理其它数据
		// logoutPushMsg(msg);
	}, false);

	// 监听在线消息事件
	plus.push.addEventListener("receive", function(msg) {
		if(msg.aps) { // Apple APNS message
			// outSet("接收到在线APNS消息：");
		} else {
			// outSet("接收到在线透传消息：");
			logoutPushMsg(msg);
		}
	}, false);
}, false);