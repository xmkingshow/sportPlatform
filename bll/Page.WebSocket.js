﻿
var HelperParas = {
	main: null,
	mainJs: null,
	mainSrc: null
};

(function($tool) {

	var $noop = function() {};

	$tool.config = {
		time: 10,
		get: 'get',
		post: 'post',
		text: 'text',
		json: 'json',

		Dome: {

			header: document.getElementsByTagName('head')[0],

			script: function(path) {

				var script = document.createElement('script');

				script.setAttribute('type', 'text/javascript');

				script.setAttribute('src', path);

				$tool.config.Dome.header.appendChild(script);

				return script;

			},

			div: function() {

				return document.createElement('div');

			}
		}
	};

	$tool.Create = {

		Script: function(path, fun) {

			var script = $tool.config.Dome.script(path);

			script.onload = script.onreadystatechange = function() {

				if(!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') fun();

				script.onload = script.onreadystatechange = null;

			}
		}

	};

	$tool.AJAX = function(severPath, data, callbackSuccess, acllbackError, options) {
		//		console.log('过期时间：',options.time)
		plus.nativeUI.showWaiting('正在加载...');
		$.ajax(severPath.Sever(), {
			data: data,
			dataType: options.dataType, //服务器返回json格式数据
			type: options.type, //HTTP请求类型
			timeout: options.time * 1000, //超时时间设置为10秒；
			success: function(e) {
				plus.nativeUI.closeWaiting();
				callbackSuccess(e);
			},
			error: function(xhr, type, errorThrown) {
				//异常处理； 可取值："timeout", "error", "abort", "parsererror"、"null"
				plus.nativeUI.closeWaiting();
				acllbackError();

				switch(type) {

					case 'timeout':
						$.toast('响应请求超时');
						break;

					case 'error':
						$.toast('服务器发生错误');
						break;

					case 'abort':
						$.toast('请求被中断');
						break;

					case 'parsererror':
						$.toast('返回数据类型不符合指定数据类型');
						break;

				}
			}
		});
	};

	$tool.GET = function(severPath, data, callbackSuccess, acllbackError) {
		callbackSuccess = callbackSuccess || $noop;
		acllbackError = acllbackError || $noop;
		$tool.AJAX(severPath, data, callbackSuccess, acllbackError, {
			dataType: this.config.text,
			time: this.config.time,
			type: this.config.get
		});
	};

	$tool.POST = function(severPath, data, callbackSuccess, acllbackError) {
		callbackSuccess = callbackSuccess || $noop;
		acllbackError = acllbackError || $noop;
		$tool.AJAX(severPath, data, callbackSuccess, acllbackError, {
			dataType: this.config.text,
			time: this.config.time,
			type: this.config.post
		});
	};

	$tool.GETJSON = function(severPath, data, callbackSuccess, acllbackError) {
		callbackSuccess = callbackSuccess || $noop;
		acllbackError = acllbackError || $noop;
		$tool.AJAX(severPath, data, callbackSuccess, acllbackError, {
			dataType: this.config.json,
			time: this.config.time,
			type: this.config.post
		});
	};

	$tool.Each = function(data, fun) {
		data = data || {};
		fun = fun || $noop;
		for(var name in data) {
			fun(name, data[name])
		};
	};

	$tool.EachEvent = function(data) {
		if(!data) return;
		$tool.Each(data, function(name, item) {
			item();
		});
	};

	this.fn = this.prototype = {
		init: function(selected) {
			this.elements = [];
			this.ele = null;

			switch(typeof selected) {
				case 'function':
					window.onload = selected;
					break;
				case 'string':
					try {
						this.elements = document.querySelectorAll(selected);
					} catch(e) {

						var top1Str = selected.substring(0, 1);
						selected = selected.replace(top1Str, '');
						switch(top1Str) {
							case '#':
								this.elements[0] = document.getElementById(selected);
								break;

							case '.':
								this.elements = document.getElementsByClassName(selected);
								break;

							default:
								this.elements = document.getElementsByTagName(selected);
								break;
						}
					}
					break;
				case 'object':
					this.elements.push(selected);
			}
		},
		eq: function(index) {
			this.ele = this.elements[index];
			return this;
		}
	};

	this.fn.init.prototype = this.fn;

	this.extend = this.fn.extend = function(obj, prop) {

		if(!prop) {
			prop = obj;
			obj = this;
		}

		for(var o in prop) {
			obj[o] = prop[o];
		}
	};

	this.fn.extend({
		html: function(obj) {
			var ele = this.element || this.elements[0];
			if(obj) {
				ele.innerHTML = obj;
			} else {
				return ele.innerHTML;
			}
		},
		on: function(eve, callback, evebing) {

			evebing = evebing || false;

			var ele = this.element || this.elements;

			if(!ele || !ele.length) return;

			for(var i = 0; i < ele.length; i++) {

				ele[i].addEventListener(eve, callback, evebing);
			}

		},
		off: function(eve, callback, evebing) {

			evebing = evebing || false;

			var ele = this.element || this.elements;

			if(!ele || !ele.length) return;

			ele.removeEventListener(eve, callback, evebing);

			for(var i = 0; i < ele.length; i++) {

				ele[i].removeEventListener(eve, callback, evebing);

			}
		},
		attr: function(name, val) {

			var ele = this.element || this.elements[0];

			if(val) {
				ele.setAttribute(name, val);
			} else {
				switch(typeof name) {
					case 'string':
						return ele.getAttribute(name);
						break;
					case 'object':
						for(key in name) {
							ele.setAttribute(key, name[key]);
						}
						break;
				}
			}
		}
	});

	HelperParas.main = ITOOL('[data-main]');
	HelperParas.mainJs = HelperParas.main.attr('data-main');
	HelperParas.mainSrc = HelperParas.main.attr('src')+'?v='+new Date().getTime();

	if(HelperParas.main) {
		ITOOL({
			init: {
				active: function() {
					ITOOL.Create.Script(HelperParas.mainJs, function() {
						console.log('Load:', HelperParas.mainJs, 'success!');
					});
				}
			}
		});
	}

})(window.ITOOL = function(obj) {

	var that = this;

	switch(typeof(obj)) {
		// DOM 操作
		case "string":
		case "function":
			return new that.fn.init(obj);
			break;

			// 页面Page事件初始化
		case "object":

			if(obj) {

				if(obj.plusReady || obj.init || obj.reg) {

					// 移动端 HBuilder和 WEB判断
					// tap.reg.date.load.addEventListener.setdate.getdate
					// ios.android.wap

					var clientType = false;

					if(navigator.userAgent.indexOf("Html5Plus") > -1) clientType = true;

					that.pageElement = [];

					that.pageElement[0] = obj;

					that.pageDate = {
						viewAll: null,
						self: null,
						home: null
					};

					that.$setDate = function(obj) {
						ITOOL.Each(obj, function(name, item) {
							localStorage.setItem(name, item);
						});
					};

					that.$getDate = function(obj) {
						return localStorage.getItem(obj);
					};

					switch(clientType) {
						// APP
						case true:

							// 取消浏览器的所有事件，使得active的样式在手机上正常生效
							document.addEventListener('touchstart', function() {
								return false;
							}, true);

							/**
							 * 删除指定[viewAll]视图
							 * */
							that.$closeView = function(viewAll, fun) {
								fun = fun || $noop;
								viewAll.forEach(function(item, index) {
									plus.webview.close(item);
								});
								fun();
							};

							/**
							 * 删除指定[viewAll、首页]之外的视图
							 * */
							that.$closeViews = function(viewAll, fun) {

								fun = fun || $noop();

								$date['viewAll'].forEach(function(item, index) {
									plus.webview.close(item);
								});

								fun();
							};

							/**
							 * 指定页面触发事件
							 * @param {view} 视图
							 * @param {event} 指定事件
							 * @param {obj} 传参数
							 * */
							that.$fire = function(view, event, obj) {
								try {
									if(view) {
										var fView = null;
										switch(typeof view) {
											case 'string':
												fView = plus.webview.getWebviewById(view);
												break;
											case 'object':
												fView = view;
												break;
										}
										if(fView) {
											if(event) {
												obj = obj || {};
												mui.fire(fView, event, obj);
											} else {
												console.error('请指定监听事件视图', '[event]')
											}
										} else {
											console.error('未找到指定视图', view, '请检查是否正确不存在')
										}
									} else {
										console.error('请指定触发视图', '[View]')
									}
								} catch(e) {
									console.error('发生错误:', e)
								}

							};

							/**
							 * 刷新指定页面
							 * */
							that.$refresh = function(view) {
								if(view) {
									var fView = null;
									switch(typeof view) {
										case 'string':
											fView = plus.webview.getWebviewById(view);
											break;
										case 'object':
											fView = view;
											break;
									}
									if(fView) {
										that.$fire(fView, '___refresh');
									}
								}
							};

							var plusReady = function() {

								that.pageDate.viewAll = plus.webview.all();

								that.pageDate.self = plus.webview.currentWebview();

								that.pageDate.home = plus.webview.getLaunchWebview();

								ITOOL.Each(obj.plusReady, function(name, item) {
									item(that.pageDate.self);
								});

								window.addEventListener('___refresh', function(event) {
									plus.webview.currentWebview().reload();
								});

								window.addEventListener("autoBackButton", function(event) {
									mui.back();
								});

							};

							if(window.plus) {
								plusReady();
							} else {
								document.addEventListener('plusready', plusReady, false);
							}

							break;

						case false:

							break;
					}

					if(obj.Socket) {
						ITOOL.Create.Script(HelperParas.mainSrc.replace('Page.WebSocket','WebSocket'), function() {
							ITOOL.Create.Script(HelperParas.mainSrc.replace('Page.WebSocket','WebSocket.Rely'), function() {
								SocketHelper(obj.Socket);
							});
						});
					}

					if(obj.tap) {
						mui.each(obj.tap, function(item, index) {
							mui('body').on('tap', item, function() {
								index(this);
							});
						});
					}

					ITOOL.Each(obj.tap, function(item, evet) {
						ITOOL(item).on('tap', function(e) {
							evet(e.target);
						});
					});

					ITOOL.Each(obj.reg, function(name, evet) {
						if(clientType)
							ITOOL('[z-tap=' + name + ']').on('click', function(e) {
								evet(e.target);
							});
						else
							ITOOL('[z-tap=' + name + ']').on('tap', function(e) {
								evet(e.target);
							});
						ITOOL('[z-change=' + name + ']').on('change', function(e) {
							evet(e.target);
						});
						ITOOL('[z-dblclick=' + name + ']').on('dblclick', function(e) {
							evet(e.target);
						});
						ITOOL('[z-focus=' + name + ']').on('focus', function(e) {
							evet(e.target);
						});
						ITOOL('[z-blur=' + name + ']').on('blur', function(e) {
							evet(e.target);
						});
						ITOOL('[z-mouseout=' + name + ']').on('mouseout', function(e) {
							evet(e.target);
						});
						ITOOL('[z-mouseover=' + name + ']').on('mouseover', function(e) {
							evet(e.target);
						});
					});

					if(obj.addEventListener) {
						mui.each(obj.addEventListener, function(item, index) {
							window.addEventListener(item, function(e) {
								index(e.detail);
							});
						});
					}

					window.onload = ITOOL.EachEvent(obj.init);

					window.Page = that.pageElement[0];

				} else {

					return new that.fn.init(obj);

				}
			} else {

				console.log("ITOOL(obj) obj Is Null");

			}

			break;
	}
});

$.fn.serializeJSON = function() {
	var o = {};
	$.each(this, function() {

		var name = this.name || $(this).attr('name');

		if(o[name]) {

			if(!o[name].push)
				o[name] = [o[name]];

			o[name].push(this.value || $(this).html() || $(this).attr("date") || '');

		} else {
			o[name] = this.value || $(this).html() || $(this).attr("date") || '';
		}
	});
	return o;
}