IT({

	datas: {

		// 是否显示昵称
		isGroupChat: {
			date: false,
			change: function(val) {
				isGroupChat = val;
			}
		},

		// 项目信息
		projectInfoLogin: {
			date: {
				userPhone: '15252156614',
				userToken: '0ZJ_A5F0-F4AC1DD644DA',
				projectToken: 'CC8-A829-E530731C0FD6'
			}
		}

	},

	// 页面配置
	// module
	init: {
		userInfo: function() {

			ImViewHelper.user = {
				headImg: itool.getDate('HeadImg'),
				userName: itool.getDate('userName')
			};

			//			for (var i = 0; i < 20; i++) {
			//				module.prototypes.updateMsgView(module.prototypes.msgtool({
			//				type:'text',
			//				message:'aaaaaaaaaaaaaaaaaaaaaa',
			//				sendTime:new Date().getTime()
			//			}), true);
			//			}

		}
	},

	// 注册页面事件
	reg: {},

	// 注册MUI.TAP事件
	tap: {},

	// 异步操作
	//async:{},

	// Socket
	//Socket：{},

	protetypes: {
		// 后期改为：如果信息为空在请求
		getUserInfo: function(slef, params, type) {

			ITOOL.GETJSON('https://www.help-itool.com/api/UserTool/GetUserInfo', params, function(data) {

				if(data.state) {

					module.date.toUserKey = data.userKey;
					module.date.sesstionType = 0;

					try {
						module.date.toUserParam = data.userParam = JSON.parse(data.userParam);
					} catch(e) {
						module.date.toUserParam = data.userParam = {};
					}

					if(!module.date.toUserParam.headImg) {
						module.date.toUserParam.headImg = '/Content/images/HeadImgDefault.jpg'.Sever();
					}

					if(!module.date.toUserParam.userName) {
						module.date.toUserParam.userName = slef.title;
					}

					module.datas.tackUserInfo = {
						headImg: module.date.toUserParam.headImg || '../../../img/tackInfoHeadImg.jpg',
						userName: module.date.toUserParam.userName || '未定义',
						sendTime: new Date().getTime()
					};

					// 信息本地存储化
					data.datetime = new Date().getTime(); // 过期时间 一周
					data.userParam.headImg = module.date.toUserParam.headImg;
					data.userParam.userName = module.date.toUserParam.userName;
					store('userInfo').key('chat').user(itool.getDate('userKey')).delete('userKey is ' + data.userKey);
					store('userInfo').key('chat').user(itool.getDate('userKey')).insert(data);

					switch(type) {
						case 1:
							module.prototypes.updateSession({
								sesstion: data.userKey,
								sesstionType: module.date.sesstionType,
								toUserParam: module.date.toUserParam
							});
							break;

						case 2:

							module.prototypes.msgInit({
								session: (data.userKey + (itool.getDate('userKey') - 0)),
								sessionType: 0
							});

							module.prototypes.updateSession({
								sesstion: data.userKey,
								sesstionType: module.date.sesstionType,
								toUserParam: module.date.toUserParam
							});

							break;

						default:
							break;
					}

				}
			});
		}
	},

	// 完成加载MUI.PLUS事件
	plusReady: {
		init: function(s) {

			if(mui.os.android) {
				jQuery('header h1').html(s.title);
			}

			switch(s.type) {

				case 'sesstion':

					switch(s.sessionType - 0) {
						case 0:
							module.date.objUserInfo = store('userInfo').key('chat').user(itool.getDate('userKey')).select('userKey is ' + s.userid);

							if(module.date.objUserInfo.length) {
								module.prototypes.updateSession({
									sesstion: s.userid,
									sesstionType: s.sessionType,
									toUserParam: module.date.objUserInfo.eq(0).userParam
								});
							} else {

								module.datas.projectInfoLogin.userKey = s.userid;

								module.protetypes.getUserInfo(s, module.datas.projectInfoLogin, 1);
							}
							break;
						case 1:
							module.datas.isGroupChat = true;
							module.prototypes.updateSession({
								sesstion: s.session,
								sesstionType: s.sessionType,
								toUserParam: {
									userName: s.title,
									headImg: s.logo || '../../../img/GroupHeadImgDefault.png'
								}
							});
							break;
					}

					break;
				case 'addressList':
					if(s.phone) {

						module.date.objUserInfo = store('userInfo').key('chat').user(itool.getDate('userKey')).select('userPhone is ' + s.phone);

						if(module.date.objUserInfo.length) {

							var userdate = module.date.objUserInfo.eq(0);

							module.prototypes.updateSession({
								sesstion: userdate.userKey,
								sesstionType: s.sessionType,
								toUserParam: userdate.userParam
							});

							module.prototypes.msgInit({
								session: (userdate.userKey + (itool.getDate('userKey') - 0)),
								sessionType: s.sessionType
							});

						} else {

							module.datas.projectInfoLogin.phone = s.phone;

							module.protetypes.getUserInfo(s, module.datas.projectInfoLogin, 2);

						}

					}
					break;
				default:
					break;
			}
			
			module.prototypes.msgInit(s);
		}
	},

	// 监听事件
	addEventListener: {

		// 接受消息
		takeMsg: function(item) {

			module.prototypes.updateMsgView(module.prototypes.msgtool(item));

		}

	},

	prototypes: {

		msgInit: function(s) {

			// 定义自己的用户信息
			ImViewHelper.user = {
				headImg: itool.getDate('HeadImg'),
				userName: itool.getDate('userName')
			};

			module.date.imSesstionDate = {
				//.user(itool.getDate('userKey'))
				date: store('imSesstion.context').user(itool.getDate('userKey')).select('session is ' + s.session + ' and sessionType is ' + s.sessionType).orderby('index asc').date,
				// 显示全部
				page: null, // 1
				size: 50 // 18
			};

			itool('.chat-trip').eq(0).styles({
				display: 'none'
			});

			module.prototypes.loadImDate(module.date.imSesstionDate.date, module.date.imSesstionDate.size, module.date.imSesstionDate.page);

		},

		// 分页加载聊天数据
		loadImDate: function(date, size, page) {

			if(date.length) {
				itool.Each(date, function(key, item) {
					if(item.sendUserKey == itool.getDate('userKey')) {
						// 自己发的
						module.prototypes.updateMsgView(module.prototypes.msgtool(item), true);
					} else {
						// 别人发的
						module.prototypes.updateMsgView(module.prototypes.msgtool(item));
					}
				}, size, page);
			}

			if(page) {
				module.date.imSesstionDate.page = page + 1;
			}

		},

		// 更新聊天窗口 [bot 是否发送]
		updateMsgView: function(msgdate, bot) {
	
			if(bot) {
				// 发送消息
				ImViewHelper.sendChat(msgdate.type, msgdate.message, msgdate.sound.time, msgdate.sendTime);
			} else {
				// 接受消息
				ImViewHelper.takeChat(msgdate.type, msgdate.userHeadImg, msgdate.message, msgdate.sound.time, msgdate.sendTime, msgdate.userName);
			}
		},

		// 消息处理
		msgtool: function(item) {

			item.sound = {
				path: null,
				time: null
			};

			switch(item.messageContentType) {
				case 0:
					item.type = 'text';
					break;
				case 1:
					item.type = 'img';
					try {
						item.message = JSON.parse(item.message);
					} catch(e) {
						item.message = [];
					}
					break;
				case 2:
					item.sound = JSON.parse(item.message);
					item.message = item.sound.path;
					item.type = 'sound';
					break;
				case 3:
					item.type = '[视频]';
					break;
				case 4:
					item.type = '[文件]';
					break;
				case 5:
					item.type = '[网络地址]';
					break;
				case 6:
					item.type = '[新消息]';
					break;
				case 7:
					item.type = '[地图]';
					break;
				case 8:
					item.type = 'icon';
			}

			return item;
		},

		// 修改会话
		updateSession: function(data) {

			module.date.tosesstion = data.sesstion;
			module.date.sesstionType = data.sesstionType;

			if(!data.toUserParam) {
				return alert(JSON.stringify(data))
			}

			module.fire(module.date.home, 'updateSession', {
				sesstion: data.sesstion,
				sesstiontype: data.sesstionType,
				tackUserInfo: data.toUserParam
			});

		}
	}

});