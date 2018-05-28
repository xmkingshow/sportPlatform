var HelperParas = {
	main: null,
	mainJs: null,
	mainSrc: null
};

var clientType = navigator.userAgent.indexOf("Html5Plus") > -1;

var helperParams = {
	serverImagePath: 'https://file.help-itool.com/', // 文件服务器
	serverUserApi: 'https://www.help-itool.com/', // 用户系统
	appstoresever: 'https://app.help-itool.com/' // APPStore
};

(function($) {
	$.Img120 = function(str) {
		if(str) {
			if(this.indexOf(str) > -1) {
				return this;
			}
		}
		if(this.indexOf('Images_120') > -1) return this;
		return this.replace("ComPress/Images_300", "Images").replace("Images", "ComPress/Images_120");
	}
	$.Img300 = function(str) {
		if(str) {
			if(this.indexOf(str) > -1) {
				return this;
			}
		}
		if(this.indexOf('Images_300') > -1) return this;
		return this.replace("Images", "ComPress/Images_300");
	}
	$.Img500 = function(str) {
		if(str) {
			if(this.indexOf(str) > -1) {
				return this;
			}
		}
		if(this.indexOf('Images_500') > -1) return this;
		return this.replace("Images", "ComPress/Images_500");
	}

	$.FileSever = function(str) {
		if(str) {
			if(this.indexOf(str) > -1) {
				return this;
			}
		}
		if(this.indexOf('http') > -1) {
			return this;
		} else {
			try {
				return helperParams.serverImagePath + JSON.parse(this)[0];
			} catch(e) {
				return helperParams.serverImagePath + this;
			}
		}

	}

	$.AppStoreSever = function() {

		if(this.indexOf('https://') > -1) {
			return this.replace(/"/g, '').split('>')[0];
		} else {
			return helperParams.appstoresever + this.replace(/"/g, '').split('>')[0];
		}
	}

	$.Sever = function() {
		if(this.indexOf('https://') > -1) {
			return this.replace(/"/g, '').split('>')[0];
		} else {
			return helperParams.serverUserApi + this.replace(/"/g, '').split('>')[0];
		}
	}

	$.utf16toIcon = function() {
		var patt = /[\ud800-\udbff][\udc00-\udfff]/g; // 检测utf16字符正则  
		return this.replace(patt, function(char) {
			var H, L, code;
			if(char.length === 2) {
				H = char.charCodeAt(0); // 取出高位  
				L = char.charCodeAt(1); // 取出低位  
				code = (H - 0xD800) * 0x400 + 0x10000 + L - 0xDC00; // 转换算法  
				return "%26%23" + code + ";";
			} else {
				return char;
			}
		});
	}

	$.toutf16toIcon = function() {
		return this.replace(/%26%23/g, '&#');
	}

}(String.prototype));

(function($tool) {

	var $ = {};

	$.noop = function() {};

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

			css: function(path) {
				var link = document.createElement('link');
				link.href = path;
				link.rel = 'stylesheet';
				link.type = 'text/css';
				$tool.config.Dome.header.appendChild(link);
			},

			div: function() {

				return document.createElement('div');

			}
		}
	};

	$tool.Create = {

		Script: function(path, fun) {
			var script = $tool.config.Dome.script(path);
			var fileloaded = false;
			script.onload = script.onreadystatechange = function() {
				if((!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') && !fileloaded) {
					fileloaded = true;
					if(fun)
						fun();
				}
			}
		},

		css: function(path) {
			$tool.config.Dome.css(path);
		}

	};

	$tool.AJAX = function(severPath, data, callbackSuccess, acllbackError, options, waiting, err) {
		try {
			if(plus && waiting) plus.nativeUI.showWaiting('正在加载...');
		} catch(e) {
			//TODO handle the exception
			plus = null;
		}

		mui.ajax(severPath, {
			data: data,
			dataType: options.dataType, //服务器返回json格式数据
			type: options.type, //HTTP请求类型
			timeout: options.time * 1000, //超时时间设置为10秒；
			success: function(e) {
				if(plus && waiting) plus.nativeUI.closeWaiting();
				callbackSuccess(e);
			},
			error: function(xhr, type, errorThrown) {
				//异常处理； 可取值："timeout", "error", "abort", "parsererror"、"null"
				if(!err) {
					
					console.log('异常:准备1s后重新请求')
					console.log(module.date.home.id)
					console.log(severPath)
					console.log(JSON.stringify(data))
					
					setTimeout(function() {
						$tool.AJAX(severPath, data, callbackSuccess, acllbackError, options, waiting, true);
					}, 1500);
					return;
				} else {
					console.log('异常:服务器返回错误')
					console.log(module.date.home.id)
					console.log(severPath)
					console.log(JSON.stringify(data))
				}

				if(plus && waiting) plus.nativeUI.closeWaiting();

				acllbackError();

				switch(type) {

					case 'timeout':
						mui.toast('响应请求超时');
						break;

					case 'error':
						mui.toast('服务器发生错误');
						break;

					case 'abort':
						mui.toast('请求被中断');
						break;

					case 'parsererror':
						mui.toast('返回数据类型不符合指定数据类型');
						break;

				}
			}
		});
	};

	$tool.GET = function(severPath, data, callbackSuccess, acllbackError, waiting) {
		callbackSuccess = callbackSuccess || $.noop;
		acllbackError = acllbackError || $.noop;
		waiting = waiting || false;
		$tool.AJAX(severPath, data, callbackSuccess, acllbackError, {
			dataType: this.config.text,
			time: this.config.time,
			type: this.config.get
		}, waiting);
	};

	$tool.POST = function(severPath, data, callbackSuccess, acllbackError, waiting) {
		callbackSuccess = callbackSuccess || $.noop;
		acllbackError = acllbackError || $.noop;
		waiting = waiting || false;
		$tool.AJAX(severPath, data, callbackSuccess, acllbackError, {
			dataType: this.config.text,
			time: this.config.time,
			type: this.config.post
		}, waiting);
	};

	$tool.GETJSON = function(severPath, data, callbackSuccess, acllbackError, waiting) {
		callbackSuccess = callbackSuccess || $.noop;
		acllbackError = acllbackError || $.noop;
		waiting = waiting || false;
		$tool.AJAX(severPath, data, callbackSuccess, acllbackError, {
			dataType: this.config.json,
			time: this.config.time,
			type: this.config.post
		}, waiting);
	};

	$tool.Each = function(data, fun, size, index) {

		data = data || {};
		fun = fun || $.noop;
		var selectDate = null;

		if(index) {
			if(index == 1) {
				selectDate = data.slice((index - 1) * size, size * index);
			} else {
				selectDate = data.slice(((index - 1) * size) + 1, size * index);
			}
		} else {
			if(size) {
				selectDate = data.slice(0, size);
			} else {
				selectDate = data;
			}
		}

		for(var name in selectDate) {
			fun(name, selectDate[name])
		};

	};

	// 数组是否包含某值
	$tool.Contains = function(arr, obj) {
		var i = arr.length;
		while(i--) {
			if(arr[i] === obj) {
				return true;
			}
		}
		return false;
	};

	$tool.EachEvent = function(data) {
		if(!data) return;
		$tool.Each(data, function(name, item) {
			item();
		});
	};

	$tool.setDate = function(obj, bot) {
		if(bot != false) bot = true;
		ITOOL.Each(obj, function(name, item) {

			var val = '';

			if(typeof item === 'object') {
				val = JSON.stringify(item);
			} else {
				val = item + '';
			}

			if(clientType && bot)
				plus.storage.setItem(name, val);
			else
				localStorage.setItem(name, val);

		});
	};

	$tool.getDate = function(name, bot) {
		if(bot != false) bot = true;
		if(clientType && bot) {
			return plus.storage.getItem(name);
		} else {
			return localStorage.getItem(name);
		}
	};

	$tool.getDateJSON = function(name, bot) {

		var val = '';
		if(bot != false) bot = true;

		if(clientType && bot) {
			val = plus.storage.getItem(name);
		} else {
			val = localStorage.getItem(name);
		}

		try {
			return JSON.parse(val);
		} catch(e) {
			return val;
		}
	}

	this.fn = this.prototype = {
		init: function(selected) {
			this.elements = [];
			this.ele = null;
			this.domName = null;

			switch(typeof selected) {
				case 'function':
					window.onload = selected;
					break;
				case 'string':
					this.domName = selected;
					try {
						this.elements = document.querySelectorAll(selected);
					} catch(e) {

						var top1Str = selected.substring(0, 1);
						selected = selected.replace(top1Str, '');
						switch(top1Str) {
							case '#':
								this.dom = this.elements[0] = document.getElementById(selected);
								break;

							case '.':
								this.dom = this.elements = document.getElementsByClassName(selected);
								break;

							default:
								this.dom = this.elements = document.getElementsByTagName(selected);
								break;
						}
					}
					break;
				case 'object':
					if(selected.length) {
						for(var i = 0; i < selected.length; i++) {
							this.elements.push(selected[i]);
						}
					} else {
						this.elements.push(selected);
					}
					this.dom = this.elements;
					break;

			}
		},
		eq: function(index) {
			this.dom = this.ele = this.elements[index];
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

	$tool.fn = this.fn;

	// 返回第一个字符串
	$.strSubOne = function(str) {

		if(typeof str === "string") {
			return str.substring(0, 1);
		}

		return str;
	};

	// 指定添加监听事件
	$.addEvent = function(type, dom, cb, evebing) {
		evebing = evebing || false;
		dom.addEventListener(type, function(e) {
			cb && cb(this, e.target);
		}, evebing);
	}

	// 添加监听事件
	$.addEventList = function(type, doms, cb, evebing) {
		for(var i = 0; i < doms.length; i++) {
			$.addEvent(type, doms[i], cb, evebing);
		}
	};

	// DOM监听变化绑定事件
	$.addEventBind = function(type, target, targetName, selected, fn) {

		if(targetName) {
			var classNameArr = targetName.split(' ');
			var isBot = false;
			for(var i = 0; i < classNameArr.length; i++) {
				if(classNameArr[i] == selected) {
					isBot = true;
					continue;
				}
			}
			if(isBot) return $.addEvent(type, target, fn, false);
		}
	};

	$.getChildsDate = [];

	$.getChilds = function(eve) {

		var nodeList = eve.childNodes;

		for(var i = 0; i < nodeList.length; i++) {

			var curNode = nodeList[i];

			if(curNode.nodeType === 1) {

				$.getChildsDate.push(curNode);

				if(curNode.childNodes.length > 1) {
					$.getChilds(curNode);
				}

			}

		}
	}

	this.fn.extend({

		// 监听事件 [可监听DOM变化]
		bind: function(type, selected, fn, evebing) {

			evebing = evebing || false;

			var
				that = this,
				ele = that.ele || that.elements,
				select = selected;

			// 绑定指定元素
			if(typeof selected === 'function' && !fn) {
				fn = selected;
				selected = this.domName;
				select = this.domName;
				ele = [document.body];
			}

			if(!ele || !ele.length) return;

			var
				strSubOne = $.strSubOne(selected);

			switch(strSubOne) {
				case '#':
					console.log('err:', '无法为ID绑定监听事件', selected)
					break;

				case '.':
					selected = selected.replace(strSubOne, '');

					for(var i = 0; i < ele.length; i++) {

						// 监听DOM变化
						ele[i].addEventListener('DOMNodeInserted', function(e) {
							$.addEventBind(type, e.target, e.target.className, selected, fn);
						}, evebing);

						$.addEventList(type, ITOOL(ele[i]).find(select).elements, fn, evebing);

					}
					break;

				default:

					var seles = [],
						bot = 0;

					if(selected.indexOf('.') >= 0) {
						bot = 1;
					} else if(selected.indexOf('#') >= 0) {
						bot = 2;
					}

					for(var i = 0; i < ele.length; i++) {

						switch(bot) {
							case 1:
								ele[i].addEventListener('DOMNodeInserted', function(e) {
									return $.addEventBind(type, e.target, e.target.localName + '.' + e.target.className, selected, fn);
								}, false);

							case 2:
								ele[i].addEventListener('DOMNodeInserted', function(e) {
									return $.addEventBind(type, e.target, e.target.localName + '#' + e.target.id, selected, fn);
								}, false);

							default:
								ele[i].addEventListener('DOMNodeInserted', function(e) {
									return $.addEventBind(type, e.target, e.target.localName, selected, fn);
								}, false);

						}

						$.addEventList(type, ITOOL(ele[i]).find(select).elements, fn, false);
					}
					break;
			}

		},
		on: function(eve, callback, evebing) {

			evebing = evebing || false;

			var ele = this.ele || this.elements;

			if(!ele || !ele.length) return;

			for(var i = 0; i < ele.length; i++) {
				ele[i].addEventListener(eve, callback, evebing);
			}

		},
		off: function(eve, callback, evebing) {

			evebing = evebing || false;

			var ele = this.ele || this.elements;

			if(!ele || !ele.length) return;

			ele.removeEventListener(eve, callback, evebing);

			for(var i = 0; i < ele.length; i++) {

				ele[i].removeEventListener(eve, callback, evebing);

			}
		},
		attr: function(name, val) {

			var ele = this.ele || this.elements[0];

			if(!ele) return;

			if(val || val == false) {
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
		},

		// 返回所有子元素
		childs: function() {

			var ele = this.ele || this.elements;

			if(!ele || !ele.length) return;

			$.getChildsDate = [];

			for(var n = 0; n < ele.length; n++) {
				$.getChilds(ele[n]);
			}

			this.elements = $.getChildsDate;

			this.ele = null;

			return this;
		},
		// 获取指定子元素
		find: function(selected) {

			var ele = this.ele || this.elements;

			if(!selected) {
				this.elements = ele;
				return this;
			}

			var ary = ITOOL(ele).childs().elements;

			var strSubOne = $.strSubOne(selected);

			switch(strSubOne) {
				case '#':

					selected = selected.replace(strSubOne, '');

					for(var k = 0; k < ary.length; k++) {

						curTag = ary[k];

						if(curTag.id !== selected) {
							ary.splice(k, 1);
							k--;
						}
					}

					break;

				case '.':

					selected = selected.replace(strSubOne, '');

					for(var k = 0; k < ary.length; k++) {

						curTag = ary[k];

						if(curTag) {

							var classNameArr = curTag.className.split(' ');
							var isBot = false;

							for(var i = 0; i < classNameArr.length; i++) {
								if(classNameArr[i] == selected) {
									isBot = true;
									continue;
								}
							}

							if(!isBot) {
								ary.splice(k, 1);
								k--;
							}
						}
					}

					break;

				default:

					var seles = [];

					if(selected.indexOf('.') >= 0) {

						seles = selected.split('.');

						for(var k = 0; k < ary.length; k++) {

							curTag = ary[k];
							if(curTag.localName !== seles[0] || curTag.className !== seles[1]) {
								ary.splice(k, 1);
								k--;
							}
						}

					} else if(selected.indexOf('#') >= 0) {

						seles = selected.split('#');

						for(var k = 0; k < ary.length; k++) {

							curTag = ary[k];

							if(curTag.localName !== seles[0] || curTag.id !== seles[1]) {
								ary.splice(k, 1);
								k--;
							}
						}

					} else {

						for(var k = 0; k < ary.length; k++) {

							curTag = ary[k];

							if(curTag.localName !== selected) {
								ary.splice(k, 1);
								k--;
							}
						}

					}

					break;
			}

			this.elements = ary;

			return this;
		}

	});

	HelperParas.main = ITOOL('[data-main]');

	var itoolFile = null;

	if(HelperParas.main) {
		itoolFile = HelperParas.main.eq(0);
	}

	if(itoolFile && itoolFile.attr('src') && itoolFile.attr('src').indexOf('itool') > -1) {

		HelperParas.mainJs = itoolFile.attr('data-main');

		HelperParas.bll = itoolFile.attr('data-bll');

		HelperParas.mainSrc = itoolFile.attr('src') + '?v=' + new Date().getTime();

		if(HelperParas.bll) {

			var bllArr = HelperParas.bll.split(',');

			for(var i = 0; i < bllArr.length; i++) {

				if((bllArr.length - 1) == i) {

					ITOOL.Create.Script(HelperParas.mainSrc.replace('itool', bllArr[i]), function() {
						if(HelperParas.mainJs) ITOOL.Create.Script(HelperParas.mainJs);
					});

				} else {
					ITOOL.Create.Script(HelperParas.mainSrc.replace('itool', bllArr[i]));
				}

			}
		} else {
			ITOOL.Create.Script(HelperParas.mainJs);
		}

	}

})(window.ITOOL = window.itool = window.IT = function(obj) {

	var $ = {};

	$.noop = function() {};

	switch(typeof(obj)) {
		// DOM 操作
		case "string":
		case "function":
			return new this.fn.init(obj);
			break;

			// 页面Page事件初始化
		case "object":

			if(obj) {
				$.moduleinit = false;
				try {
					var moduleinit = module.init;
					$.moduleinit = true;
				} catch(e) {
					//TODO handle the exception
					$.moduleinit = false;
				}

				if((obj.plusReady || obj.init || obj.reg) && $.moduleinit == false) {

					// 移动端 HBuilder和 WEB判断
					// tap.reg.date.load.addEventListener.setdate.getdate
					// ios.android.wap

					// IE判断
					var ie = !!window.ActiveXObject;

					that = obj;

					that.date = {};

					that.log = function(val) {
						if(!obj.Debug) return;
						if(typeof val === 'object') {
							console.log(JSON.stringify(val))
						} else {
							console.log(val)
						}
					}

					// 序列化 JSON [data-from = true]
					that.getForm = function(obj) {
						return ITOOL("[" + obj + "]").serialize();
					};

					window.module = that;

					window.onload = function() {

						if(that.datas) {

							$.datas = obj.datas;

							var $vue = {

								// 双向绑定
								upDateModel: function(key) {
									IT('[b-model=' + key + ']').on('input', function(e) {
										switch(e.target.localName) {
											case 'input':
											case 'textarea':
												that.datas[key] = e.target.value;
												break;
											default:
												break;
										}
									});
								},

								// 更新页面
								updateDome: function(key, value) {

									var dom = document.querySelectorAll('[b-date=' + key + '],[b-model=' + key + ']');

									var dom2 = document.querySelectorAll('[bind]');

									for(var i in dom2) {

										var bindObj = IT(dom2[i]);

										if(bindObj) {
											if(bindObj.attr('bind')) {
												var bindAttr = bindObj.attr('bind').split('.');
												if(bindAttr[1] == key) {
													switch(bindAttr[0]) {
														case 'html':
															dom2[i].innerHTML = value;
															break;

														case 'val':
															dom2[i].value = value;
															break;

														default:
															bindObj.attr(bindAttr[0], value);
															break;
													}
												}
											}

										}

									}

									for(var i in dom) {
										switch(dom[i].localName) {
											case 'input':
											case 'textarea':
												dom[i].value = value;
												break;
											default:
												dom[i].innerHTML = value;
												break;
										}
									}
								},

								// 定义构造函数
								define: function(key) {
									return {
										get: function() {

											return $.datas[key].date;

										},
										set: function(value) {

											// 异步操作
											setTimeout(function() {

												// 对象映射到DOME
												if(typeof value !== 'object') {
													$vue.updateDome(key, value);
												}

												// 触发监听事件
												if($.datas[key].change) {
													$.datas[key].change(value);
												}

											}, 0);

											$.datas[key].date = value;
										}
									};
								}
							};

							// 初始化模型
							function Person() {
								for(var key in $.datas) {
									Object.defineProperty(this, key, $vue.define(key));
								}
							}

							// 实例模型
							that.datas = new Person();

							// 初始化值
							for(var key in $.datas) {
								that.datas[key] = $.datas[key].date;
								$vue.upDateModel(key);
							}

						}

						ITOOL.EachEvent(obj.init);

						switch(clientType) {
							// APP
							case true:

								var loadingmuieve = function() {

									console.log('Load:', 'mui.min.js', 'success!');

									/**
									 * 删除指定[viewAll]视图
									 * */
									that.closeView = function(viewAll, fun) {
										fun = fun || $.noop;
										viewAll.forEach(function(item, index) {
											try {
												plus.webview.close(plus.webview.getWebviewById(item));
											} catch(e) {
												//TODO handle the exception
											}
										});
										fun();
									};

									/**
									 * 删除指定[viewAll、首页]之外的视图
									 * */
									that.closeViews = function(fun) {

										fun = fun || $.noop();

										that.date.viewAll.forEach(function(item, index) {
											if(that.date.home != item && that.date.self != item)
												plus.webview.close(item);
										});

										fun();

										plus.webview.close(that.date.self);

									};

									// 获取指定视图
									that.view = function(key) {
										return plus.webview.getWebviewById(key);
									}

									var closefneve = function(fn, Id) {
										var viewCloseSetInterval = setInterval(function() {
											var viewObj = module.view(Id);
											if(viewObj) {
												clearInterval(viewCloseSetInterval);
												viewObj.addEventListener('close', fn);
											}
										}, 200);
									}

									that.open = function(Url, Id, Obj, anShow, closefn, showfn) {

										if(showfn) showfn();

										var param = {
											url: Url,
											id: Id,
											show: {
												anShow: anShow ? 'slide-in-' + anShow + '' : 'slide-in-right'
											},
											extras: Obj || {},
											waiting: {
												autoShow: false
											}
										};

										mui.openWindow(param);

										if(closefn) closefneve(closefn, Id);

									}

									var viewButtons = function(buttons, Id, anshow, share) {

										if(!buttons) {
											buttons = [{
												text: "\ue60b",
												float: 'left',
												fontSrc: '_www/fonts/iconfont.ttf',
												fontSize: '24px',
												onclick: function() {
													plus.webview.getWebviewById(Id).close(anshow, 200);
												}
											}];
										} else {
											buttons.push({
												text: "\ue60b",
												float: 'left',
												fontSrc: '_www/fonts/iconfont.ttf',
												fontSize: '24px',
												onclick: function() {
													plus.webview.getWebviewById(Id).close(anshow, 200);
												}
											});
										}

										if(share) {

											console.log('分享为', typeof(share))

											switch(typeof(share)) {
												case 'boolean':
													break;
												case 'function':
													break;
											}
											buttons.push({
												text: "\ue640",
												float: 'right',
												fontSrc: '_www/fonts/iconfont.ttf',
												fontSize: '30px',
												onclick: function() {
													console.log('点击了分享')
												}
											});
										}

										return buttons;
									}

									that.openNative = function(Url, Id, Obj, anShow, title, splitLine, buttons, closefn, share) {

										mui.openWindow({
											url: Url,
											id: Id,
											show: {
												aniShow: anShow ? 'slide-in-' + anShow + '' : 'slide-in-right'
											},
											extras: Obj || {},
											styles: {
												titleNView: {
													backgroundColor: '#fff',
													titleText: title,
													titleColor: '#000',
													autoBackButton: mui.os.android ? true : false,
													buttons: mui.os.android ? [] : viewButtons(buttons, Id, anShow ? 'slide-out-' + anShow + '' : 'slide-out-right', share),
													splitLine: {
														color: splitLine ? '#fff' : '#ddd'
													}
												}
											},
											waiting: {
												autoShow: true
											}
										});

										if(closefn) closefneve(closefn, Id);

									}

									var muiwaitingobj = null;

									function waitinghelper(param) {

										jQuery(document.body).append(waitingtemphtml(param.title, param.img));

										muiwaitingobj = jQuery(".mui-waiting");

										muiwaitingobj.fadeIn(300);

									}

									function waitingtemphtml(title, img) {
										return '<div class="mui-waiting">' +
											'<img src="' + img + '" class="mui-waiting-img" />' +
											'<h4>' + title + '</h4>' +
											'<div class="loader-inner ball-pulse">' +
											'<div></div><div></div><div></div>' +
											'</div>' +
											'</div>';
									}

									that.openHome = function(url, obj, parm, closefn, showfn, outtime) {

										var thiswebview = plus.webview.create(url, url);

										// 预加载JS
										thiswebview.setJsFile("_www/bll/mui.min.js");
										thiswebview.setJsFile("_www/pageinit.js");

										waitinghelper({
											title: parm.title,
											img: parm.logo,
											webview: thiswebview
										});

										// 防止超时
										var openviewtime = setTimeout(function() {
											thiswebview.close();
											mui.toast('页面打开超时');
											setTimeout(function() {
												muiwaitingobj.fadeOut(300, function() {
													muiwaitingobj.remove();
													if(outtime) outtime();
												});
											}, 500);
										}, 8000);

										thiswebview.addEventListener('close', closefn);

										thiswebview.addEventListener('loaded', function(e) { //页面加载完成后才显示

											// 防止白屏
											setTimeout(function() {
												thiswebview.show('fade-in');
												setTimeout(function() {
													muiwaitingobj.remove();
												}, 500);
											}, 1000);

											clearTimeout(openviewtime);

											if(showfn) showfn();

										}, false);

									}

									// 打开网络页面
									that.openNet = function(Url, Id, Obj, parm, anShow, closefn, showfn, showWaiting) {

										anShow = anShow ? 'slide-in-' + anShow + '' : 'slide-in-right';

										// 阻塞网络图片模式打开页面
										if(parm) {
											parm.blockNetworkImage = true;
										} else {
											parm = {
												blockNetworkImage: true
											};
										}

										if(showWaiting) plus.nativeUI.showWaiting();

										var thiswebview = plus.webview.create(Url, Id || {}, parm || {}, Obj || {});

										// 预加载JS
										thiswebview.setJsFile("_www/test.js");

										// 会覆盖
										// thiswebview.loadData('<html><body>Hello! loadData!</body></html>');

										if(showWaiting) {

											// 防止超时
											var openviewtime = setTimeout(function() {
												plus.nativeUI.closeWaiting();
												thiswebview.close();
												mui.toast('页面打开超时');
											}, 8000);

											thiswebview.addEventListener('loaded', function(e) { //页面加载完成后才显示

												// 加载网络图片
												thiswebview.setBlockNetworkImage(false);

												// 防止白屏
												setTimeout(function() {
													plus.nativeUI.closeWaiting();
													clearTimeout(openviewtime);
													thiswebview.show(anShow);
												}, 500);

												if(showfn) showfn();

												thiswebview.addEventListener('close', closefn);

											}, false);

										} else {

											thiswebview.show(anShow);

											setTimeout(function() {
												// 加载网络图片
												thiswebview.setBlockNetworkImage(false);
											}, 300);

											if(showfn) showfn();

											thiswebview.addEventListener('close', closefn);

										}

									}

									// 打开网络页面[使用进度条 原生头部]
									that.openNetNative = function(Url, Id, Obj, parm, anShow, closefn, showfn) {
										parm = parm || {};
										that.openNet(Url, Id, Obj, {
											titleNView: {
												progress: {
													color: parm.progressColor ? parm.progressColor : '#3385ff',
													height: '2px',
												},
												splitLine: {
													color: parm.borderColor ? parm.borderColor : '#cccccc',
													height: '1px'
												},
												titleSize: '18px',
												titleColor: parm.titleColor ? parm.titleColor : '#000000', //
												titleOverflow: 'ellipsis',
												titleText: parm.titleText ? parm.titleText : null,
												backgroundColor: parm.backgroundColor ? parm.backgroundColor : '#F9F9F9',
												autoBackButton: mui.os.android ? true : false,
												buttons: mui.os.android ? [] : viewButtons(parm.buttons, Id, anShow ? 'slide-out-' + anShow + '' : 'slide-out-right', parm.share),
											}
										}, anShow, closefn, showfn, false);
									}

									/**
									 * 指定页面触发事件
									 * @param {view} 视图
									 * @param {event} 指定事件
									 * @param {obj} 传参数
									 * */
									that.fire = function(view, event, obj) {
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
													default:
														return;
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
									that.refresh = function(view) {
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
												that.fire(fView, '___refresh');
											}
										}
									};

									function plusReady() {

										that.date.viewAll = plus.webview.all();

										that.date.self = plus.webview.currentWebview();

										that.date.home = plus.webview.getLaunchWebview();

										if(mui.os.android) {
											var main = plus.android.runtimeMainActivity();
											var Context = plus.android.importClass("android.content.Context");
											$.InputMethodManager = plus.android.importClass("android.view.inputmethod.InputMethodManager");
											$.imm = main.getSystemService(Context.INPUT_METHOD_SERVICE);
										} else {
											$.nativeWebview = plus.webview.currentWebview().nativeInstanceObject();
										}

										if(!mui.os.android) {
											$.nativeWebview.plusCallMethod({
												"setKeyboardDisplayRequiresUserAction": false
											});
										}

										if(that.date.home.id == that.date.self.id) {

											if(!that.net) {
												that.net = {};
											}

											document.addEventListener("netchange", onNetChange, false);

											onNetChange();

											//获取当前网络类型
											function onNetChange() {
												var nt = plus.networkinfo.getCurrentType();
												switch(nt) {
													case plus.networkinfo.CONNECTION_ETHERNET:
													case plus.networkinfo.CONNECTION_WIFI:
														// 当前网络为WiFi
														itool.setDate({
															net: 'wifi'
														});
														if(that.net.wifi) that.net.wifi();
														break;
													case plus.networkinfo.CONNECTION_CELL2G:
													case plus.networkinfo.CONNECTION_CELL3G:
													case plus.networkinfo.CONNECTION_CELL4G:
														// 非WiFi
														itool.setDate({
															net: '4g'
														});
														if(that.net.wg) that.net.wg();
														break;
													default:
														// 没网
														itool.setDate({
															net: 'not'
														});
														if(that.net.not) that.net.not();
														break;
												}
											}

										}

										itool.Each(obj.plusReady, function(name, item) {
											item(that.date.self);
										});

										document.addEventListener('___refresh', function(event) {
											plus.webview.currentWebview().reload();
										});

										document.addEventListener("autoBackButton", function(event) {
											mui.back();
										});

										window.module = that;
									};

									if(window.plus) {
										plusReady();
									} else {
										document.addEventListener('plusready', plusReady, false);
									}

								}

								window.module = that;

								try {
									if(mui) {
										loadingmuieve();
									} else {
										ITOOL.Create.Script(HelperParas.mainSrc.replace('itool', 'mui.min'), loadingmuieve);
									}
								} catch(e) {
									console.log(e)
									ITOOL.Create.Script(HelperParas.mainSrc.replace('itool', 'mui.min'), loadingmuieve);
								}

								break;

							case false:
								try {
									if(!mui) {
										ITOOL.Create.Script(HelperParas.mainSrc.replace('itool', 'mui.min'));
									}
								} catch(e) {
									ITOOL.Create.Script(HelperParas.mainSrc.replace('itool', 'mui.min'));
									//TODO handle the exception
								}

								break;
						}

						if(obj.addEventListener) {
							ITOOL.Each(obj.addEventListener, function(item, index) {
								document.addEventListener(item, function(e) {
									index(e.detail);
								}, false);
							});
						}

						ITOOL.Each(obj.tap, function(item, evet) {

							ITOOL(item).bind('tap', function(e) {
								evet(e);
							}, false, true);

						});

						ITOOL.Each(obj.reg, function(name, evet) {
							if(clientType) {
								ITOOL('[z-tap=' + name + ']').on('tap', function(e) {
									evet(e.target);
								}, true);
							} else {
								ITOOL('[z-tap=' + name + ']').on('click', function(e) {
									evet(e.target);
								}, true);
							}

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

						if(obj.Socket) {
							obj.Socket.init = function(e) {
								if(e) obj.Socket.initialize.UserInfo = e;
								SocketHelper(obj.Socket);
							}
							ITOOL.Create.Script(HelperParas.mainSrc.replace('itool', 'WebSocket'), function() {
								ITOOL.Create.Script(HelperParas.mainSrc.replace('itool', 'WebSocket.Rely'), function() {
									if(obj.Socket.loading) {
										obj.Socket.loading();
									}
									if(!(obj.Socket.state == false)) {
										SocketHelper(obj.Socket);
									}
								});
							});
						}

						window.module = that;
					}

					// 异步执行
					if(obj.async) {

						if(!Worker) console.log('err', 'Worker is null')
						else {
							if(obj.async.path) {

								that.asyncTool = new Worker(obj.async.path);

								$.async = {
									funcName: [],
									queue: 0,
									paras: {},
									parasexec: function(item, func) {

									},
									parastool: function(item, func, obj) {

										var paras = obj || $.async.paras;

										if(typeof func === 'function') {
											paras[item] = func();
										} else {
											paras[item] = func;
										}

										if(typeof paras[item] === 'object') {

											ITOOL.Each(paras[item], function(ite, fun) {
												$.async.parastool(ite, fun, paras[item]);
											});

										}
									}
								}

								that.async.exec = function(funcName, paras) {

									ITOOL.Each(paras, function(item, func) {
										$.async.parastool(item, func);
									});

									$.async.funcName.push(funcName);

									that.asyncTool.postMessage({
										type: funcName,
										date: $.async.paras
									});

								}

								ITOOL.Each(obj.async.paras, function(item, paras) {
									that.async.exec(item, paras);
								});

								that.asyncTool.onmessage = function(event) {

									var data = event.data;

									var funcName = $.async.funcName[$.async.queue];

									$.async.queue++;

									if(obj.async.cb[funcName]) {
										obj.async.cb[funcName](event.data);
									}
								};

								that.asyncTool.onerror = function(event) {
									obj.async.error(event);
								};

							} else {
								console.log('err', 'please config worker.js file path')
							}
						}
					}

					// 数据验证
					module.verify = {

						// 手机号
						isTel: function(val) {
							if(!(/^1[3|4|5|7|8][0-9]\d{4,8}$/.test(val)))
								return false;
							return true;
						},

						// 去空格
						trim: function(val) {
							return val.replace(/\s+/g, "");
						},

						// 对比
						is: function(val1, val2) {
							return val1 === val2;
						}
					};

				} else {

					return new this.fn.init(obj);

				}
			} else {

				console.log("ITOOL(obj) obj Is Null");

			}

			break;
	}

});

ITOOL.fn.extend({
	html: function(obj) {
		var ele = this.ele || this.elements[0];

		if(!ele) return;

		if(obj) {
			ele.innerHTML = obj;
			return this;
		} else {
			return ele.innerHTML;
		}
	},
	each: function(cb) {
		var ele = this.ele || this.elements;
		for(var i in ele) {
			cb && cb(ele[i]);
		}
	},
	focus: function() {
		var ele = this.ele || this.elements[0];
		ele.focus()
	},
	blur: function() {
		var ele = this.ele || this.elements[0];
		ele.blur()
	},
	removeAttr: function(name) {
		var ele = this.ele || this.elements[0];
		ele.removeAttribute(name);
	},
	styles: function(name, val) {

		var ele = this.ele || this.elements[0];

		if(!ele) return;

		if(typeof name == 'string') {
			if(val) {
				eval("ele.style." + name + "='" + val + "'");
				return this;
			} else {
				return eval("ele.style." + name);
			}
		} else if(typeof name == 'object') {
			itool.Each(name, function(name, val) {
				eval("ele.style." + name + "='" + val + "'");
			});
			return this;
		}
	},
	serialize: function() {

		var $ = {
			ele: this.ele || this.elements,
			o: {}
		};

		ITOOL($.ele).each(function(a) {

			var dom = ITOOL(a);

			var name = a.name || dom.attr('name');

			if($.o[name]) {

				if(!$.o[name].push)
					$.o[name] = [$.o[name]];

				$.o[name].push(a.value || dom.html() || dom.attr("date") || '');

			} else {
				$.o[name] = a.value || dom.html() || dom.attr("date") || '';
			}
		});

		return $.o;
	}
});