try {
	if(itool) {}
} catch(e) {
	itool = {
		getDate: function(val) {
			return val;
		}
	};
	mui = {
		os: {
			ios: false
		}
	}
}

try {
	if(mui) {}
} catch(e) {
	mui = {
		os: {
			ios: false
		}
	}
}

(function(sh) {

	if(!("WebSocket" in window)) {
		return alert("您的浏览器不支持 WebSocket!");
	}

	if(!window.localStorage) {
		alert('您的浏览器不支持 localStorage');
	}

	sh.noop = function() {};

	// 服务器参数配置
	sh.Config = {
		header: "ws",
		ip: "47.104.181.71",
		point: "9001"
	};

	// 操作类型
	sh.ConfigType = {

		// 消息类型
		Message: {

			// 修改用户信息
			UserInfo: 0,

			// 发送消息
			SendMessage: 1,

			// 消息广播
			Boardcast: 2,

			// 定时消息广播
			SetTimeBoardcast: 3,

			// 指定时间发送消息
			SetTimeMessage: 4,

			// 修改会话KEY
			UpdateSession: 5,

			// 系统通知
			System: 6,

			// 创建群组
			CreateGroup: 7,

			// 创建讨论组
			CreateForum: 8,
			
			// 修改用户信息
			UpdateUserInfo: 9,

			callBack: function(key) {
				switch(key) {
					case 0:
						return "被迫下线";
					case 1:
						return "系统通知";
					case 2:
						return "广播消息";
					case 3:
						return "定时消息广播";
					case 4:
						return "指定时间发送消息";
					case 5:
						return "修改会话KEY";
					case 6:
						return "系统通知";
					case 7:
						return "创建群组";
					case 8:
						return "创建讨论组";
				}
			}

		},

		// 聊天方式
		Session: {

			// 点对点聊天
			SingleChat: 0,

			// 群组聊天
			GroupChat: 1,

			// 语音聊天
			VoiceChat: 2,

			// 视频聊天
			VideoChat: 3,

			// 创建群组
			CreateGroup: 4,

			// 创建讨论组
			CreateForum: 5

		},

		// 聊天内容类型
		MessageContent: {

			// 发送文本
			SendText: 0,

			// 发送图片
			SendImage: 1,

			// 发送语音
			SendVoice: 2,

			// 发送视频
			SendVideo: 3,

			// 发送文件
			SendFile: 4,

			// 发送网址
			SendHref: 5,

			// 发送HTML
			SendHtml: 6,

			// 发送地图
			SendMap: 7,

			// 发送表情
			SendIcon: 8,

			callBack: function(key) {

				switch(key) {

					case 0:
						return "文本";
					case 1:
						return "图片";
					case 2:
						return "语音";
					case 3:
						return "视频";
					case 4:
						return "文件";
					case 5:
						return "网址";
					case 6:
						return "HTML";
					case 7:
						return "地图";
					case 8:
						return "表情";

				}

			}

		}

	};

	// 获取客户端类型
	sh.GetClientType = function() {
		if(navigator.userAgent.indexOf("Html5Plus") < 0) return 0;
		else return 1;
	}

	// 连接服务器锚点
	sh.ws = null;

	// 项目信息
	sh.ProjectInfo = {
		userPhone: "",
		userToken: "",
		projectToken: ""
	};

	// 客户端唯一防踢Token 
	sh.clientToken = function() {

		var msg = localStorage.getItem("$webSockHelper_clientToken");

		if(msg) {

			return msg;

		} else {

			localStorage.setItem("$webSockHelper_clientToken", Math.ceil(Math.random() * 1000000));

			return localStorage.getItem("$webSockHelper_clientToken");

		}

	};

	// 消息状态
	sh.localStorageMessageState = {
		get: function() {
			if(localStorage.getItem("$webSockHelper_sendMeassgeState")) {
				return localStorage.getItem("$webSockHelper_sendMeassgeState");
			} else {
				return null;
			}
		},
		set: function(obj) {
			localStorage.setItem("$webSockHelper_sendMeassgeState", obj);
		}
	};

	// 用户信息
	sh.UserInfo = {
		userKey: 0,
		token: "",
		userName: "",
		headImg: "",
		clientKey: 0, // 当前会话KEY
		acceptSession: null, // 接受的会话KEY[例我的群组、讨论组等等]
		paras: {}

	};

	// 用户消息模板
	sh.MessageTemplate = {

		// 修改会话
		UpdateSession: function(obj) {
			if(!obj)
				return alert("当前会话参数，不能为空");

			if(obj.sesstiontype == 0) {
				obj.sesstion = obj.sesstion + sh.UserInfo.userKey;
			}

			return JSON.stringify({
				_messageType: sh.ConfigType.Message.UpdateSession,
				clientInfo: {
					userInfo: {
						session: obj.sesstion,
						_sessionType: obj.sesstiontype
					}
				}
			});
		},

		// 用户登录
		UserInfo: function() {

			return JSON.stringify({
				_messageType: sh.ConfigType.Message.UserInfo,
				clientInfo: {
					clientToken: sh.clientToken(),
					userInfo: sh.UserInfo,
					projectInfo: sh.ProjectInfo,
					ios: mui.os.ios ? true : false,
					viewurl: location.href
				}
			});
		},

		// 修改用户信息
		UpdateUserInfo: function() {

			return JSON.stringify({
				_messageType: sh.ConfigType.Message.UpdateUserInfo,
				clientInfo: {
					userInfo: sh.UserInfo
				}
			});
		},

		// 发送消息
		SendMessage: function(obj) {
			return JSON.stringify({
				_messageType: sh.ConfigType.Message.SendMessage,
				session: obj.session,
				_sessionType: obj.sessionType,
				_messageContentType: obj.messageContentType,
				_clientType: sh.GetClientType(),
				sendMessage: obj.sendMessage,
				msgParms: obj.paras
			});
		},

		// 指定时间发送消息
		SetTimeMessage: function(obj) {
			return JSON.stringify({
				_messageType: sh.ConfigType.Message.SetTimeMessage,
				_clientType: sh.GetClientType(),
				session: obj.session,
				sendMessage: obj.sendMessage,
				sendTime: obj.sendTime
			});
		},

		// 系统消息
		System: function(obj) {
			return JSON.stringify({
				_messageType: sh.ConfigType.Message.System,
				sendMessage: obj.sendMessage,
				session: obj.session
			});
		},

		// 消息广播
		Boardcast: function(sendMessage) {
			return JSON.stringify({
				_messageType: sh.ConfigType.Message.Boardcast,
				sendMessage: sendMessage
			});
		},

		// 定时消息广播
		SetTimeBoardcast: function(obj) {
			return JSON.stringify({
				_messageType: sh.ConfigType.Message.SetTimeBoardcast,
				sendMessage: obj.sendMessage,
				sendTime: obj.sendTime
			});
		},

		// 新建群组
		CreateGroup: function(obj) {
			return JSON.stringify({
				_messageType: sh.ConfigType.Message.CreateGroup,
				sendMessage: obj.sendMessage,
				_sessionType: sh.ConfigType.Session.CreateGroup,
				msgParms: obj.paras
			});
		},

		// 新建讨论组
		CreateForum: function(obj) {
			return JSON.stringify({
				_messageType: sh.ConfigType.Message.CreateForum,
				sendMessage: obj.sendMessage,
				_sessionType: sh.ConfigType.Session.CreateForum,
				msgParms: obj.paras
			});
		}
	};

	// 合并JSON
	sh.mergeJsonObject = function(jsonbject1, jsonbject2) {
		var resultJsonObject = {};
		for(var attr in jsonbject1) {
			resultJsonObject[attr] = jsonbject1[attr];
		}
		for(var attr in jsonbject2) {
			resultJsonObject[attr] = jsonbject2[attr];
		}
		return resultJsonObject;
	};

	var $wsss = null;
	// 启动函数
	sh.initialize = function(paramters) {

		if(itool.getDate('net') == 'not') return console.log('Web Socket.js', '网络已断开', '请检查网络后在尝试连接');

		// Sever Ip Point
		if(paramters.Config) sh.Config = paramters.Config;

		//Project Verifi Info *
		if(paramters.ProjectInfo) {
			sh.ProjectInfo = paramters.ProjectInfo;
		} else {
			return alert("请配置项目验证信息");
		}

		// Add UserInfo *
		if(paramters.UserInfo) {

			// 数据解析
			if(paramters.UserInfo.acceptSession) {

				paramters.UserInfo.acceptSessionCopy = paramters.UserInfo.acceptSession;

				try {
					var jsonstr = '{';

					for(var i = 0; i < paramters.UserInfo.acceptSession.length; i++) {
						jsonstr += '"' + paramters.UserInfo.acceptSession[i] + '":"' + paramters.UserInfo.acceptSession[i] + '",';
					}

					jsonstr = jsonstr.substr(0, jsonstr.length - 1);

					jsonstr += '}';

					paramters.UserInfo.acceptSession = JSON.parse(jsonstr);
				} catch(e) {
					paramters.UserInfo.acceptSession = null;
				}

			}

			paramters.UserInfo._clientType = sh.GetClientType();

			if(paramters.UserInfo.paras && typeof paramters.UserInfo.paras == 'object') {
				paramters.UserInfo.paras = JSON.stringify(paramters.UserInfo.paras);
			}

			sh.UserInfo = paramters.UserInfo;

		} else {
			return alert("请配置用户身份");
		}

		sh.initializeParamters = paramters;

		if(!sh.Config.point && !sh.Config.header && !sh.Config.ip) {
			return alert("配置不完整");
		}

		setTimeout(function() {

			if(sh.ws && (sh.ws.readyState == 1 || sh.ws.readyState == 0)) return;

			function wstosever() {

				if(!sh.ws || (sh.ws.readyState != 1 && sh.ws.readyState != 0)) {

					sh.ws = new WebSocket(sh.Config.header + "://" + sh.Config.ip + ":" + sh.Config.point);
					sh.wsevent();
					setTimeout(function() {
						wstosever();
					}, 2000);
					console.log('web socket state:', sh.ws.readyState, '正在连接')

				} else {

					console.log('web socket state:', sh.ws.readyState)

					if(sh.ws.readyState != 1) {
						setTimeout(function() {
							wstosever();
						}, 2000);
					}
				}

			}

			wstosever();

		}, 300);

	};

	// webSocket 开关 触发事件
	sh.wsBase = {
		onopen: function() {},
		onmessage: function(date) {},
		onerror: function() {},
		onclose: function() {}
	};

	// 消息回调
	sh.MessageCallBack = {

		// 被迫下线
		logoff: function(date) {},

		// 新消息提醒
		newMsgRemind: function(date) {},

		// 会话新消息
		newMsg: function(date) {},

		// 离线消息
		offlineMsg: function(date) {},

		// 广播消息
		BoardcastMsg: function(date) {},

		// 系统消息
		SystemMsg: function(date) {},

		// 登陆成功触发
		LoginInit: function(date) {},

		// 接收到创建群组通知
		CreateGroup: function(date) {},

		// 接收到创建讨论组通知
		CreateForum: function(date) {}

	};

	// 心跳连接
	sh.heartCheck = {
		timeout: 5000,
		setTimeoutObj: null,
		setintervalObj: null,
		initialize: function() {
			if(localStorage.getItem("$webSockHelper_logoff") == "false" && itool.getDate('net') != 'not') {
				setTimeout(function() {
					if(sh.ws.readyState != 0 && sh.ws.readyState != 1) {
						sh.initialize(sh.initializeParamters);
					}
				}, 500);
			}
		},
		reset: function() {

			clearTimeout(this.setTimeoutObj);

			this.start();

			if(sh.heartCheck.setintervalObj == null) sh.heartCheck.basestart();
		},
		start: function(bot) {

			this.setTimeoutObj = setTimeout(function() {

				var myDate = new Date();

				var sendHeartCheckStr = "ixpe_heartCheck:" + (myDate.getTime() + 10 * 1000);

				if(bot) {
					sh.localStorageMessageState.set(sendHeartCheckStr);
					sh.ws.send(sendHeartCheckStr);
					localStorage.setItem("$webSockHelper_HeartTime", myDate.getTime() + sh.heartCheck.timeout);
				} else {

					if((localStorage.getItem("$webSockHelper_HeartTime") - 0) < myDate.getTime()) {

						// 重新初始化连接
						sh.heartCheck.initialize();

					} else {
						sh.localStorageMessageState.set(sendHeartCheckStr);
						sh.ws.send(sendHeartCheckStr);
					}
				}

			}, this.timeout);
		},
		basestart: function() {
			sh.heartCheck.setintervalObj = setInterval(function() {
				if((localStorage.getItem("$webSockHelper_HeartTime") - 0) < new Date().getTime()) {
					// 重新初始化连接
					sh.heartCheck.initialize();
				}
			}, 2000);
		}
	};

	sh.wsevent = function() {

		// 已建立连接
		sh.ws.onopen = function(e) {

			localStorage.setItem('$webSockHelper_LoginUserState', 'false');

			// 修改用户信息
			var megUpdateUserInfoStr = sh.MessageTemplate.UserInfo();

			sh.localStorageMessageState.set(megUpdateUserInfoStr);
			sh.ws.send(megUpdateUserInfoStr);

			// 发送心跳 [true - 初始化]
			sh.heartCheck.start(true);

			// 初始化被迫下线状态[被迫下线不会重连]
			localStorage.setItem("$webSockHelper_logoff", "false");

			sh.wsBase.onopen();

		}

		// 接收到服务端数据
		sh.ws.onmessage = function(event) {

			var parameters = JSON.parse(event.data);

			// 验证记录跳出
			if(parameters.ret) {

				switch(parameters.type) {
					// 心跳验证
					case 'heart':
						if(parameters.date) {
							var dateArr = parameters.date.split(':');
							if(dateArr.length > 1) {
								// 重启心跳
								sh.heartCheck.reset();

								// 刷新心跳标识
								localStorage.setItem("$webSockHelper_HeartTime", dateArr[1]);
							}
						}
						break;
						// 丢包重发
					case 'length':
						if(!parameters.length) {
							if(sh.localStorageMessageState.get()) {
								sh.ws.send(sh.localStorageMessageState.get());
							} else {
								sh.ws.send(sh.localStorageMessageState.set(null));
							}
						}
						break;
				}

			} else {

				// console.log('WebSocket:', JSON.stringify(parameters))

				if(parameters.sendMessage) {
					try {
						parameters.sendMessage = JSON.parse(parameters.sendMessage);
					} catch(e) {
						//TODO handle the exception
					}
				}

				if(parameters.paras) {
					try {
						parameters.paras = JSON.parse(parameters.paras);
					} catch(e) {
						//TODO handle the exception
					}
				}

				if(parameters.messageParas) {
					try {
						parameters.messageParas = JSON.parse(parameters.messageParas);
					} catch(e) {
						//TODO handle the exception
					}
				}

				// 当前会话
				switch(parameters.replyMessageType) {
					// 被迫下线
					case 0:
						localStorage.setItem("$webSockHelper_logoff", "true");
						sh.MessageCallBack.logoff(parameters);
						break;

						// 系统通知
					case 1:
						sh.MessageCallBack.SystemMsg(parameters);
						break;

						// 广播消息
					case 2:
						sh.MessageCallBack.BoardcastMsg(parameters);
						break;

						// 新消息提醒
					case 3:
						switch(parameters.SessionType) {
							/// 单人对聊
							case 0:
								/// 群组聊天
							case 1:
								sh.MessageCallBack.newMsgRemind(parameters);
								break;

								/// 语音聊天
							case 2:
								/// 视频聊天
							case 3:
								// 暂不支持
								break;

								/// 创建群组
							case 4:
								sh.MessageCallBack.CreateGroup(parameters);
								break;
								/// 创建讨论组
							case 5:

								if(sh.UserInfo.acceptSessionCopy) {
									sh.UserInfo.acceptSessionCopy.push(parameters.messageParas.sesstion);
								} else {
									sh.UserInfo.acceptSessionCopy = [parameters.messageParas.sesstion];
								}

								MSG.UpdateUserInfo({
									acceptSession: sh.UserInfo.acceptSessionCopy
								});

								sh.MessageCallBack.CreateForum(parameters);
								break;
						}
						break;

						// 会话新消息
					case 4:
						sh.MessageCallBack.newMsg(parameters);
						break;

						// 修改当前会话返回离线消息
					case 5:
						sh.MessageCallBack.offlineMsg(parameters);
						break;
						// 身份认证成功
					case 6:
						localStorage.setItem('$webSockHelper_LoginUserState', 'true');
						sh.MessageCallBack.LoginInit(parameters);
						break;
				}

				sh.wsBase.onmessage(parameters);

			}

		}

		// 链接发生错误
		sh.ws.onerror = function(event) {

			var netstate = itool.getDate('net');

			if(netstate) {
				switch(netstate) {
					case '4g':
					case 'wifi':
						itool.setDate({
							netstate: true
						});
						break;
					case 'not':
						itool.setDate({
							netstate: false
						});
						break;
				}
			}

			sh.wsBase.onerror(event);

		}

		// 连接关闭
		sh.ws.onclose = function() {

			// 触发关闭事件
			sh.wsBase.onclose();

			// 退出身份标记

			localStorage.setItem('$webSockHelper_LoginUserState', 'false');
			console.log('正在启动重连');

			// 重连
			setTimeout(function() {

				clearTimeout(sh.heartCheck.setTimeoutObj);

				if(itool.getDate('net') == 'not') return console.log('网络已断开', '请检查网络后在尝试连接');
				
				console.log('是否可以重连：',localStorage.getItem("$webSockHelper_logoff") == "false" && itool.getDate('net') != 'not')

				// 重新初始化连接
				sh.heartCheck.initialize();

			}, 900);

		}

		// 手动关闭连接
		sh.ws.Close = function() {

			if(localStorage.getItem('$webSockHelper_LoginUserState') == 'true') {
				// 关闭重连
				localStorage.setItem("$webSockHelper_logoff", "true");
				// 退出身份标记
				localStorage.setItem('$webSockHelper_LoginUserState', 'false');

				// 关闭连接
				sh.localStorageMessageState.set('ixpe_useroutlogin');
				sh.ws.send('ixpe_useroutlogin');
			} else {
				sh.ws.close();
			}

		}

		// 查看连接状态
		sh.ws.state = function() {

			if(!sh.ws) {
				return '通信链接尚未初始化';
			}

			switch(sh.ws.readyState) {
				case 0:
					return '链接尚未建立';
				case 1:
					return '通信链接已经建立';
				case 2:
					return '链接正在关闭';
				case 3:
					return '链接已关闭或不可用';
			}

		}

		// 是否关闭重连
		//		sh.ws.anewStart = function(obj) {
		//
		//			if(obj) {
		//				// 关闭
		//				localStorage.setItem("$webSockHelper_logoff", "true");
		//			} else if(obj == false) {
		//				// 开启
		//				localStorage.setItem("$webSockHelper_logoff", "false");
		//			} else {
		//				return localStorage.getItem("$webSockHelper_logoff") != 'true';
		//			}
		//
		//		}

		// 是否已登录
		sh.ws.anewStart = function(obj) {

			return localStorage.getItem("$webSockHelper_LoginUserState") == 'true';

		}

	}

	// 修改用户信息数据解析
	var userinfojson = function(UserInfo) {
		// 群组会话列表
		if(UserInfo.acceptSession) {

			var jsonstr = '{';

			for(var i = 0; i < UserInfo.acceptSession.length; i++) {
				jsonstr += '"' + UserInfo.acceptSession[i] + '":"' + UserInfo.acceptSession[i] + '",';
			}

			jsonstr = jsonstr.substr(0, jsonstr.length - 1);

			jsonstr += '}';

			sh.UserInfo.acceptSession = JSON.parse(jsonstr);

		}

		// 修改自定义参数
		if(UserInfo.paras) {
			sh.UserInfo.paras = JSON.stringify(UserInfo.paras);
		}

		// 修改名称
		if(UserInfo.userName) {
			sh.UserInfo.userName = UserInfo.userName;
		}

		// 修改头像
		if(UserInfo.HeadImg) {
			sh.UserInfo.HeadImg = UserInfo.HeadImg;
		}
	}

	// 发送消息工具
	var sendTool = {

		// 发送消息
		sendmsg: function(obj) {
			if(!obj) {
				console.log(JSON.stringify(obj))
				return alert("消息参数不能为空");
			} else if(!obj.session) {
				console.log(JSON.stringify(obj))
				return alert("会话参数不能为空");
			} else if(obj.messageContentType != 0 & !obj.messageContentType) {
				console.log(JSON.stringify(obj))
				return alert("消息内容类型不能为空");
			} else if(!obj.sendMessage) {
				console.log(JSON.stringify(obj))
				return alert("消息内容不能为空");
			} else {

				if(obj.paras && typeof obj.paras == 'object') obj.paras = JSON.stringify(obj.paras);

				if(obj.sessionType == 0) {
					obj.session = obj.session + sh.UserInfo.userKey;
				}

				sh.localStorageMessageState.set(sh.MessageTemplate.SendMessage(obj));

				sh.ws.send(sh.MessageTemplate.SendMessage(obj));
			}
		},

		// 创建讨论组
		createForum: function(obj) {
			if(obj.paras && typeof obj.paras == 'object') obj.paras = JSON.stringify(obj.paras);

			var sendContext = sh.MessageTemplate.CreateForum(obj);
			sh.localStorageMessageState.set(sendContext);
			sh.ws.send(sendContext);
		},

		// 创建群组
		createGroup: function(obj) {
			if(obj.paras && typeof obj.paras == 'object') obj.paras = JSON.stringify(obj.paras);
			var sendContext = sh.MessageTemplate.CreateGroup(obj);
			sh.localStorageMessageState.set(sendContext);
			sh.ws.send(sendContext);
		},

		// 修改会话
		updatesesstion: function(param) {
			var sendContext = sh.MessageTemplate.UpdateSession({
				sesstion: param.sesstion,
				sesstiontype: param.sesstiontype
			});

			sh.localStorageMessageState.set(sendContext);
			sh.ws.send(sendContext);
		},

		// 用户登录
		userinfo: function(UserInfo) {
			if(UserInfo) {
				
				userinfojson(UserInfo);

				sh.localStorageMessageState.set(sh.MessageTemplate.UserInfo());

				// 修改用户信息
				sh.ws.send(sh.MessageTemplate.UserInfo());
			}
		},

		// 修改用户身份
		updateuserinfo: function(UserInfo) {
			if(UserInfo) {
				
				userinfojson(UserInfo);

				sh.localStorageMessageState.set(sh.MessageTemplate.UpdateUserInfo());

				// 修改用户信息
				sh.ws.send(sh.MessageTemplate.UpdateUserInfo());
			}
		}
	};

	// 发送消息
	sh.launch = {

		// 修改身份信息
		UserInfo: function(UserInfo) {
			if(!sh.ws.anewStart()) {
				sh.initialize(sh.initializeParamters);
				var sendmsginterval = setInterval(function() {
					if(sh.ws.anewStart()) {
						clearInterval(sendmsginterval);
						sendTool.userinfo(UserInfo);
					}
				}, 500);
			} else {
				sendTool.userinfo(UserInfo);
			}

		},

		// 修改身份信息
		UpdateUserInfo: function(UserInfo) {
			if(!sh.ws.anewStart()) {
				sh.initialize(sh.initializeParamters);
				var sendmsginterval = setInterval(function() {
					if(sh.ws.anewStart()) {
						clearInterval(sendmsginterval);
						sendTool.updateuserinfo(UserInfo);
					}
				}, 500);
			} else {
				sendTool.updateuserinfo(UserInfo);
			}

		},

		// 创建讨论组
		createForum: function(param) {

			if(!sh.ws.anewStart()) {
				sh.initialize(sh.initializeParamters);
				var sendmsginterval = setInterval(function() {
					if(sh.ws.anewStart()) {
						clearInterval(sendmsginterval);
						sendTool.createForum(param);
					}
				}, 500);
			} else {
				sendTool.createForum(param);
			}

		},

		// 创建群组
		createGroup: function(param) {

			if(!sh.ws.anewStart()) {
				sh.initialize(sh.initializeParamters);
				var sendmsginterval = setInterval(function() {
					if(sh.ws.anewStart()) {
						clearInterval(sendmsginterval);
						sendTool.createGroup(param);
					}
				}, 500);
			} else {
				sendTool.createGroup(param);
			}

		},

		// 修改会话
		UpdateSession: function(param) {

			if(!sh.ws.anewStart()) {
				sh.initialize(sh.initializeParamters);
				var sendmsginterval = setInterval(function() {
					if(sh.ws.anewStart()) {
						clearInterval(sendmsginterval);
						sendTool.updatesesstion(param);
					}
				}, 500);
			} else {
				sendTool.updatesesstion(param);
			}

		},

		// 发送消息
		SendMessage: function(obj) {

			if(!sh.ws.anewStart()) {
				sh.initialize(sh.initializeParamters);
				var sendmsginterval = setInterval(function() {
					if(sh.ws.anewStart()) {
						clearInterval(sendmsginterval);
						sendTool.sendmsg(obj);
					}
				}, 500);
			} else {
				sendTool.sendmsg(obj);
			}
		},

		// 定时消息
		SetTimeMessage: function(obj) {

			if(localStorage.getItem("$webSockHelper_LoginUserState") == "false") return alert("身份未登录！");

			if(!obj) {
				return alert("消息参数不能为空");
			} else if(!obj.session) {
				return alert("会话参数不能为空");
			} else if(!obj.sendTime) {
				return alert("消息发送时间不能为空");
			} else if(!obj.sendMessage) {
				return alert("消息内容不能为空");
			} else {

				if(obj.paras && typeof obj.paras == 'object') obj.paras = JSON.stringify(obj.paras);

				sh.localStorageMessageState.set(sh.MessageTemplate.SetTimeMessage(obj));

				sh.ws.send(sh.MessageTemplate.SetTimeMessage(obj));
			}
		},

		// 系统消息
		System: function(obj) {

			if(!sh.ws.anewStart()) return alert("身份未登录！");

			if(!obj.sendMessage) {
				alert("消息内容不能为空");
			} else {

				if(obj.paras && typeof obj.paras == 'object') obj.paras = JSON.stringify(obj.paras);
				// session = 0 推送给全部用户  或者为用户key 推送给指定用户

				sh.localStorageMessageState.set(sh.MessageTemplate.System(obj));

				sh.ws.send(sh.MessageTemplate.System(obj));
			}
		},

		// 消息广播
		Boardcast: function(sendMessage) {
			if(!sendMessage) {
				alert("广播内容不能为空");
			} else {

				if(obj.paras && typeof obj.paras == 'object') obj.paras = JSON.stringify(obj.paras);

				sh.localStorageMessageState.set(sh.MessageTemplate.Boardcast(sendMessage));

				sh.ws.send(sh.MessageTemplate.Boardcast(sendMessage));
			}
		},

		// 定时消息广播
		SetTimeBoardcast: function(obj) {
			if(!obj) {
				alert("广播参数不能为空");
			} else if(!obj.sendTime) {
				alert("广播时间不能为空");
			} else if(!obj.sendMessage) {
				alert("广播内容不能为空");
			} else {

				if(obj.paras && typeof obj.paras == 'object') obj.paras = JSON.stringify(obj.paras);

				sh.localStorageMessageState.set(sh.MessageTemplate.SetTimeBoardcast(obj));

				sh.ws.send(sh.MessageTemplate.SetTimeBoardcast(obj));
			}
		}
	};

	window.MSG = {};

	// 修改用户身份
	MSG.UpdateUserInfo = sh.launch.UpdateUserInfo;

	// 修改会话
	MSG.UpdateSession = sh.launch.UpdateSession;

	// 发送消息
	MSG.SendMessage = sh.launch.SendMessage;

	// 创建群组
	MSG.CreateGroup = sh.launch.createGroup;

	// 创建讨论组
	MSG.CreateForum = sh.launch.createForum;

	// 定时消息
	MSG.SetTimeMessage = sh.launch.SetTimeMessage;

	// 系统消息
	MSG.System = sh.launch.System;

	// 消息广播
	MSG.Boardcast = sh.launch.Boardcast;

	// 定时消息广播
	MSG.SetTimeBoardcast = sh.launch.SetTimeBoardcast;

}(window.SocketHelper = function(obj) {

	if(obj) {
		if(obj.initialize) {
			SocketHelper.initialize(obj.initialize);
		} else {
			alert("请配置项目信息");
		}

		if(obj.wsBase) {

			// 已建立连接
			SocketHelper.wsBase.onopen = function() {

				// console.log("WebSocket:", "Sever Open Succeed!");

				if(obj.wsBase.onopen) {
					obj.wsBase.onopen();
				}
			}

			// 收到新消息
			SocketHelper.wsBase.onmessage = function(date) {

				// console.log("New Message:", JSON.stringify(date));

				if(obj.wsBase.onmessage) {
					obj.wsBase.onmessage(date);
				}
			}

			// 连接发生错误
			SocketHelper.wsBase.onerror = function(event) {

				console.log("Error:", JSON.stringify(event.date));

				if(obj.wsBase.onerror) {
					obj.wsBase.onerror(event.date);
				}
			}

			// 连接关闭
			SocketHelper.wsBase.onclose = function() {

				console.log("WebSocket:", "Sever Close");

				if(obj.wsBase.onclose) {
					obj.wsBase.onclose();
				}
			}

		}

		if(obj.msgType) {

			// 被迫下线
			if(obj.msgType.logoff) SocketHelper.MessageCallBack.logoff = obj.msgType.logoff;

			// 新消息提醒
			if(obj.msgType.newMsgRemind) SocketHelper.MessageCallBack.newMsgRemind = obj.msgType.newMsgRemind;

			// 会话新消息
			if(obj.msgType.newMsg) SocketHelper.MessageCallBack.newMsg = obj.msgType.newMsg;

			// 离线消息
			if(obj.msgType.offlineMsg) SocketHelper.MessageCallBack.offlineMsg = obj.msgType.offlineMsg;

			// 广播消息
			if(obj.msgType.BoardcastMsg) SocketHelper.MessageCallBack.BoardcastMsg = obj.msgType.BoardcastMsg;

			// 系统消息
			if(obj.msgType.SystemMsg) SocketHelper.MessageCallBack.SystemMsg = obj.msgType.SystemMsg;

			// 身份认证成功
			if(obj.msgType.LoginInit) SocketHelper.MessageCallBack.LoginInit = obj.msgType.LoginInit;

			// 创建讨论组通知
			if(obj.msgType.CreateForum) SocketHelper.MessageCallBack.CreateForum = obj.msgType.CreateForum;

			// 创建群组通知
			if(obj.msgType.CreateGroup) SocketHelper.MessageCallBack.CreateGroup = obj.msgType.CreateGroup;

		}
	}

}));