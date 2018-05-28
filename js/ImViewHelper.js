window.ImViewHelper = function() {};

(function($) {

	$.user = {
		headImg: '../../../img/head_portrait.png',
		userName: '灬快跑小猪'
	};

	$.SendServerMessage = function(type, eve) {
		// 通知首页 发送消息
		switch(type) {
			case 'text':
				module.fire(module.date.home, 'sendChat', {
					sesstion: module.date.tosesstion,
					sesstionType: module.date.sesstionType,
					contentType: 0,
					text: eve.text
				});
				break;
			case 'sound':
				module.fire(module.date.home, 'sendChat', {
					sesstion: module.date.tosesstion,
					sesstionType: module.date.sesstionType,
					contentType: 2,
					text: JSON.stringify({
						path: eve.path,
						time: eve.time
					})
				});
				break;
			case 'img':
				module.fire(module.date.home, 'sendChat', {
					sesstion: module.date.tosesstion,
					sesstionType: module.date.sesstionType,
					contentType: 1,
					text: JSON.stringify(eve.imgFile)
				});
				break;
			case 'icon':
				module.fire(module.date.home, 'sendChat', {
					sesstion: module.date.tosesstion,
					sesstionType: module.date.sesstionType,
					contentType: 8,
					text: eve.title
				});
				break;
			default:
				break;
		}

	}

	// 发送消息 数据类型，头像
	$.sendChat = function(msgType, text, soundLength, times) {
		if(msgType == 'img' && !text.length) return;
		// 服务器相关处理
		alert("userName="+$.user.userName)
		sendChat("rightBubble", $.user.headImg, text, msgType, soundLength, times, $.user.userName);
	};

	// 接受消息
	$.takeChat = function(msgType, headImg, text, soundLength, times, userName) {
		sendChat("leftBubble", headImg, text, msgType, soundLength, times, userName);
	};

	// 文本框回车发送消息  bot[true - 发送消息 | fasle - 历史消息]
	$.sendMsg = function(eve, isTake, bot) {

		if(isTake) {
			ImViewHelper.takeChat('text', isTake.headImg, eve.text, null, isTake.sendTime, isTake.userName);
		} else {

			if(bot) ImViewHelper.SendServerMessage('text', eve);

			ImViewHelper.sendChat('text', eve.text);
		}

	};

	// 语音发送
	$.sendSound = function(eve, isTake, bot) {

		if(isTake) {
			ImViewHelper.takeChat('sound', isTake.headImg, eve.path, eve.time, isTake.sendTime, isTake.userName);
		} else {
			if(bot) ImViewHelper.SendServerMessage('sound', eve);
			ImViewHelper.sendChat('sound', eve.path, eve.time);
		}

	};

	// 发送图片
	$.sendImg = function(eve, isTake, bot) {

		if(isTake) {
			ImViewHelper.takeChat('img', isTake.headImg, eve.imgFile, null, isTake.sendTime, isTake.userName);
		} else {
			if(bot) ImViewHelper.SendServerMessage('img', eve);
			ImViewHelper.sendChat('img', eve.imgFile);
		}

	};

	// 发送表情
	$.sendIcon = function(eve, isTake, bot) {

		if(isTake) {
			ImViewHelper.takeChat('icon', isTake.headImg, eve.title, null, isTake.sendTime, isTake.userName);
		} else {
			if(bot) ImViewHelper.SendServerMessage('icon', eve);
			ImViewHelper.sendChat('icon', eve.title);
		}

	};

}(ImViewHelper));




if(mui.os.ios) {
	// 解决在ios上fixed元素focusin时位置出现错误的问题 
	document.addEventListener('DOMContentLoaded', function() {
		var footerDom = document.querySelector('footer');

		document.addEventListener('focusin', function() {
			footerDom.style.position = 'absolute';
		});
		document.addEventListener('focusout', function() {
			footerDom.style.position = 'fixed';
		});
	});
}

mui.init({
	gestureConfig: {
		tap: true, //默认为true
		doubletap: true, //默认为false
		longtap: true, //默认为false
		swipe: true, //默认为true
		drag: true, //默认为true
		hold: true, //默认为false，不监听
		release: true //默认为false，不监听
	}
});

// 相关参数
var
	setIntervalBottom,
	activeTapBar,
	removeActiveTapBar,
	tabBarFoneStyle,
	tapBarContentHeigth,
	inputBot = true;

var self;
// 视图对象
var imBottomView,
	imInputView,
	tabBar1,
	tabBar2,
	tabBar3,
	tabBar4,
	tabBar5;
	
var doms = {
	tabBar: jQuery('.tabBar'),
	rerr: jQuery('#rerr'),
	footer: jQuery('footer'),
	selectImage: jQuery('#selectImage')
};

mui.plusReady(function() {

	// WebView自动调整
	self = plus.webview.currentWebview();
	self.setStyle({
		softinputMode: "adjustResize" // 自动调整
		//popGesture: 'none' // 侧滑关闭
	});

	// 创建Nview
	createView();

	self.append(imBottomView);

	self.append(imInputView);

	// 创建顺序
	creadeViewIcon();

	// 底部导航距离顶部高度
	tapBarContentHeigth = topHeigth();

	// 上传图片注册
	UpFileInit();

	// 底部隐藏
	setTimeout(function() {
		doms.tabBar.hide();
	}, 300);

});

// 创建原生View控件
function createView() {

	imBottomView = new plus.nativeObj.View('imBottomView', {
		bottom: '0px',
		left: '0px',
		height: '88px',
		width: '100%',
		dock: 'bottom',
		backgroundColor: '#edeef1' // edeef1
	});

	imInputView = new plus.nativeObj.View('imInputView', {
		bottom: '47px', // 50 - 3
		left: '0px',
		height: '35px',
		left: '2%',
		width: '96%',
		dock: 'bottom',
		backgroundColor: '#fff'
	});

	DrawImInputView();

	function DrawImInputView() {
		imInputView.drawInput({
			top: '0',
			left: '3%',
			width: '94%',
			height: '35px'
		}, {
			type: 'search',
			fontSize: '14px',
			borderWidth: '0px',
			borderColor: '#fff',
			onFocus: function(e) {

				inputBot = true;

				if(removeActiveTapBar) {
					tapBarRemoveActiveColor(removeActiveTapBar);
					removeActiveTapBar = activeTapBar = null;
				} else {
					refreshBottomView();
				}

				setTimeout(function() {
					mui('#rerr').scroll().scrollToBottom(100);
				}, 300);
			},
			onBlur: function(e) {

				refreshBottomView();

			},
			onComplete: function(e) {

				setTimeout(function() {

					if(e.text != '' && inputBot) {

						e.text = e.text.utf16toIcon();

						ImViewHelper.sendMsg(e, false, true);

						imInputView.reset();

						DrawImInputView();
					}

				}, 100);
			}
		}, 'msgInput');
		
	}

	// 滚动到底部
	setTimeout(function() {
		try {
			mui('#rerr').scroll().scrollToBottom(100);
		} catch(e) {
			//TODO handle the exception
		}
	}, 1000);

}

// 创建底部图标
function creadeViewIcon() {
	// 语音、图片、拍照、标签、更多
	var tabBarStyle = {
		bottom: '3px',
		left: '0px',
		height: '40px',
		width: '20%',
		dock: 'bottom'
	};

	tabBarFoneStyle = {
		align: 'center',
		size: '24px',
		color: '#6b6b6b'
	};

	// 录音
	tabBar1 = New.View('tabBar1', tabBarStyle, function(e) {
		e.draw([NViewTag.font('tabBar1', '\ue600', null, tabBarFoneStyle)]);
	}, function(e) {
		tapBarActiveColor(e);
	}, self);

	// 相册
	tabBarStyle.left = '20%';
	tabBar2 = New.View('tabBar2', tabBarStyle, function(e) {
		e.draw([NViewTag.font('tabBar2', '\ue675', null, tabBarFoneStyle)]);
	}, function(e) {
		tapBarActiveColor(e);
		if(!jQuery('#selectImage a').length) {
			UpImage.upImg.gallerys();
		}
	}, self);

	// 拍照
	tabBarStyle.left = '40%';
	tabBar3 = New.View('tabBar3', tabBarStyle, function(e) {
		e.draw([NViewTag.font('tabBar3', '\ue61b', null, tabBarFoneStyle)]);
	}, function(e) {
		UpImage.upImg.camera();
	}, self);

	tabBarStyle.left = '60%';
	tabBar4 = New.View('tabBar4', tabBarStyle, function(e) {
		e.draw([NViewTag.font('tabBar4', '\ue608', null, tabBarFoneStyle)]);
	}, function(e) {
		tapBarActiveColor(e);
	}, self);

	tabBarStyle.left = '80%';
	tabBar5 = New.View('tabBar5', tabBarStyle, function(e) {
		e.draw([NViewTag.font('tabBar5', '\ue628', null, tabBarFoneStyle)]);
	}, function(e) {
		tapBarActiveColor(e);
	}, self);
}

// 刷新底部高度样式
function refreshBottomView() {

	doms.rerr.css('padding-bottom', 110);
	doms.footer.css('bottom', -220);
	setTimeout(function() {
		imBottomStyle(topHeigth());
		srcollRelayout();
	}, 50);
}

// 键盘谈起样式调整
function imBottomStyle(topHrigth) {
	try {
		// 底部背景
		imBottomView.setStyle({
			top: topHrigth + 'px'
		});

		// 底部输入框背景
		imInputView.setStyle({
			top: topHrigth + 5 + 'px'
		});

		// 文字位置调整
		topHrigth += 44;
		tabBar1.setStyle({
			top: topHrigth + 'px'
		});
		tabBar2.setStyle({
			top: topHrigth + 'px'
		});
		tabBar3.setStyle({
			top: topHrigth + 'px'
		});
		tabBar4.setStyle({
			top: topHrigth + 'px'
		});
		tabBar5.setStyle({
			top: topHrigth + 'px'
		});

	} catch(e) {
		console.error(JSON.stringify(e))
	}
}

// 显示底部内容区域
function bottmContent() {

	var
		$topheigth = tapBarContentHeigth;

	var $cearHeigth = 220;

	setIntervalBottom = setInterval(function() {
		$topheigth -= 44;
		$cearHeigth -= 44;

		if($cearHeigth >= 0) {
			imBottomView.setStyle({
				top: $topheigth
			});
			imInputView.setStyle({
				top: $topheigth + 5 + 'px'
			});

			var tabBarHeigth = $topheigth + 44;
			tabBar1.setStyle({
				top: tabBarHeigth + 'px'
			});
			tabBar2.setStyle({
				top: tabBarHeigth + 'px'
			});
			tabBar3.setStyle({
				top: tabBarHeigth + 'px'
			});
			tabBar4.setStyle({
				top: tabBarHeigth + 'px'
			});
			tabBar5.setStyle({
				top: tabBarHeigth + 'px'
			});

			doms.footer.css('bottom', 0 - $cearHeigth);

		} else {
			clearInterval(setIntervalBottom);
		}
	}, 1);

}

// 获取距离头部距离
function topHeigth() {
	return doms.footer.offset().top - 88 + 2;
}

// 调整 tapBar Color 颜色
function tapBarActiveColor(item) {

	inputBot = false;

	if(!item) {
		if(removeActiveTapBar) tapBarRemoveActiveColor(removeActiveTapBar, true);
		return removeActiveTapBar = activeTapBar = null;
	}

	imInputView.setInputFocusById("msgInput", false);

	setTimeout(function() {

		if(activeTapBar) {
			if(removeActiveTapBar == item) {
				// 取消
				tapBarRemoveActiveColor(removeActiveTapBar, true);
				removeActiveTapBar = activeTapBar = null;
			} else {
				// 底部调整
//				doms.rerr.css('padding-bottom', 110 + 220);
				srcollRelayout();

				// 取消上一个点击颜色   更换本次点击
				activeTapBar = item;
				tapBarAddActiveColor(activeTapBar);
				tapBarRemoveActiveColor(removeActiveTapBar);

				// 底部以显示 切换底部页面
				jQuery('.' + activeTapBar.id).show();
				jQuery('.' + removeActiveTapBar.id).hide();

				removeActiveTapBar = activeTapBar;
			}
		} else {
			// 底部调整
			doms.rerr.css('padding-bottom', 110 + 220);
			srcollRelayout();

			// 显示底部区域
			bottmContent();
			activeTapBar = removeActiveTapBar = item;
			tapBarAddActiveColor(activeTapBar);
		}

	}, 100);
}

function tapBarAddActiveColor(item) {
	jQuery('.' + item.id).show();
	tabBarFoneStyle.color = '#000';
	item.draw([NViewTag.font(item.id, tapBarFontCode(item), null, tabBarFoneStyle)]);
}

function tapBarRemoveActiveColor(item, bot) {
	jQuery('.' + item.id).hide();
	tabBarFoneStyle.color = '#6b6b6b';
	item.draw([NViewTag.font(item.id, tapBarFontCode(item), null, tabBarFoneStyle)]);
	if(bot) {
		setTimeout(function() {
			refreshBottomView();
		}, 10);
	}
}

function tapBarFontCode(item) {
	switch(item.id) {
		case 'tabBar1':
			return fontCode = '\ue600';
		case 'tabBar2':
			return fontCode = '\ue675';
		case 'tabBar3':
			return fontCode = '\ue61b';
		case 'tabBar4':
			return fontCode = '\ue608';
		case 'tabBar5':
			return fontCode = '\ue628';
	}
}

// 显示图片
$previewImageShow = function() {
	setTimeout(function() {
		imInputView.show();
		imBottomView.show();
		tabBar1.show();
		tabBar2.show();
		tabBar3.show();
		tabBar4.show();
		tabBar5.show();
	}, 30);
}

// 隐藏图片
$previewImageHide = function() {
	imInputView.hide();
	imBottomView.hide();
	tabBar1.hide();
	tabBar2.hide();
	tabBar3.hide();
	tabBar4.hide();
	tabBar5.hide();
}


// 初始化上传
function UpFileInit(opsBtn) {

	opsBtn = opsBtn || {
		upmsg: '正在发送',
		delete: true,
		number: 7,
		filter: 'image',
		lengthBack: function(e) {
			console.log(e)
		},
		// 选择图片
		selectImageCallback: function(path) {
			doms.selectImage.append('<a class="mui-control-item up-list-row" src="' + path + '" data-preview-src="' + path + '" data-preview-group="1" data-content="" data-select-item="' + path + '" style="background: url(' + path + ');"></a>');
		},
		// 取消选择图片
		remmoveImageCallback: function(path) {
			jQuery('.mui-control-item[data-select-item="' + path + '"]').remove();
		},
		// 选择取消
		cancel: function(e) {
			if (jQuery('#selectImage a').length < 1) {
				tapBarActiveColor();
			}
		},
		// 拍照回调
		takePohoto: function(e) {

			var imgFile = [];

			imgFile.push(e);

			//			ImViewHelper.sendImg({
			//				imgFile: imgFile
			//			}, false, true);

			//			UpImage.upImg.onfiles = [];
			//			UpImage.upImg.closeRowImg();
		}
	};

	UpImage.initDate({
			ops: opsBtn,
			sub: '.mui-btn-send',
			lengthBac: function(e) {

			}
		},
		function() {
			return {
				type: 1
			}
		},
		function(e) {

			doms.selectImage.html('');
			
			var imgarr = JSON.parse(e);

			if(imgarr.length) {

				// 图片
				if(isImages(imgarr)) {

					for(var n in imgarr) {
						imgarr[n] = imgarr[n].Img120().FileSever();
					}

					ImViewHelper.sendImg({
						imgFile: imgarr
					}, false, true);

				} else {

					ImViewHelper.sendSound({
						path: imgarr[0].FileSever(),
						time: module.date.soundtimes
					}, false, true);

				}

			} else {
				mui.toast('发送失败');
			}
		},
		"/upload/file");
}

// 判断是否是图片
function isImages(val) {

	var img = ["gif", "jpg", "jpeg", "rar", "zip", "png", "bmp"];

	function isInArray(arr, value) {
		console.log(value)
		for(var i = 0; i < arr.length; i++) {
			if(value === arr[i]) {
				return true;
			}
		}
		return false;
	}

	var strarr = val[0].split('.');

	return isInArray(img, strarr[strarr.length - 1]);
}

// 手指触摸屏幕失去焦点 初始化底部位置
document.querySelector('.mui-scroll-wrapper').addEventListener('scrollstart', function(e) {

	inputBot = false;

	imInputView.setInputFocusById("msgInput", false);

	doms.rerr.css('padding-bottom', 110);

	doms.footer.css('bottom', -220);

	setTimeout(function() {
		imBottomStyle(topHeigth());
	}, 50);

	if(removeActiveTapBar) {
		tapBarRemoveActiveColor(removeActiveTapBar);
		removeActiveTapBar = activeTapBar = null;
	}

});

// 刷新滚动条 滚动到底部
function srcollRelayout() {

	if(mui('#rerr')) {
		try {
			mui('#rerr').scroll().reLayout();
		} catch(e) {
			//TODO handle the exception
		}

		setTimeout(function() {
			try {
				mui('#rerr').scroll().scrollToBottom(100);
			} catch(e) {
				//TODO handle the exception
			}
		}, 30);
	}

}

// 点击注册
(function(h) {

	// 相册
	h.on('tap', '.mui-select-gallerys', function() {
		UpImage.upImg.gallerys();
	});

	// Body
	h.on('tap', '#rerr,header', function() {
		inputBot = false;
		tapBarActiveColor();
	});

	// send img
	h.on('tap', '.mui-btn-send', function() {
		tapBarActiveColor();
	});

	// send icon
	h.on('tap', '#Gallery a', function() {
		var iconTitle = jQuery(this).find('div').eq(0).html();
		ImViewHelper.sendIcon({
			title: iconTitle
		}, false, true);
	});

	// 语音
	h.on('tap', '.sound', function() {

		var playState = jQuery(this).find('.play-state').eq(0);

		var soundPath = jQuery(this).find('.mui-icon').eq(0).attr('data-path');

		store('imSound').user(itool.getDate('userKey')).download({
			path: soundPath.split('files')[1],
			url: soundPath
		}, function(e, filePath) {			
			playsound(playState, plus.audio.createPlayer(filePath));
		});

	});

	function playsound(playState, player) {

		playState.html('正在播放...');

		player.play(function() {
			playState.html('点击播放');
		}, function(e) {
			playState.html('点击播放');
		});
	}

}(mui('html')));

// 语音操作
(function($, doc) {
	var MIN_SOUND_TIME = 800;
	var ui = {
		body: doc.querySelector('body'),
		boxSoundAlert: doc.querySelector('#sound-alert'),
		boxMsgSound: doc.querySelector('#msg-sound')
	};
	var setSoundAlertVisable = function(show) {
		if(show) {
			ui.boxSoundAlert.style.display = 'block';
			ui.boxSoundAlert.style.opacity = 1;
		} else {
			ui.boxSoundAlert.style.opacity = 0;
			//fadeOut 完成再真正隐藏
			setTimeout(function() {
				ui.boxSoundAlert.style.display = 'none';
			}, 200);
		}
	};
	var recordCancel = false;
	var recorder = null;
	var audio_tips = document.getElementById("audio_tips");
	var startTimestamp = null;
	var stopTimestamp = null;
	var stopTimer = null;
	var setIntervalTimes = null;
	var timesobj = jQuery('#times');

	ui.boxMsgSound.addEventListener('hold', function(event) {

		module.date.soundtimes = 0;

		setIntervalTimes = setInterval(function() {
			module.date.soundtimes++
				timesobj.html(module.date.soundtimes);
		}, 1000);

		recordCancel = false;
		if(stopTimer) clearTimeout(stopTimer);
		audio_tips.innerHTML = "手指上划，取消发送";
		ui.boxSoundAlert.classList.remove('rprogress-sigh');
		setSoundAlertVisable(true);
		recorder = plus.audio.getRecorder();
		if(recorder == null) {
			plus.nativeUI.toast("不能获取录音对象");
			return;
		}
		startTimestamp = (new Date()).getTime();

		recorder.record({
				filename: "_doc/audio/"
			}, function(path) {

				if(recordCancel) return;

				if(UpImage.upImg.files) {
					UpImage.upImg.files.push(path);
				} else {
					UpImage.upImg.files = [path];
				}

				UpImage.upImg.send();
				// Send Sound

			},
			function(e) {
				plus.nativeUI.toast("录音时出现异常: " + e.message);
			});
	}, false);

	ui.body.addEventListener('drag', function(event) {
		//console.log('drag');
		if(Math.abs(event.detail.deltaY) > 50) {
			if(!recordCancel) {
				recordCancel = true;
				if(!audio_tips.classList.contains("cancel")) {
					audio_tips.classList.add("cancel");
				}
				audio_tips.innerHTML = "松开手指，取消发送";
			}
		} else {
			if(recordCancel) {
				recordCancel = false;
				if(audio_tips.classList.contains("cancel")) {
					audio_tips.classList.remove("cancel");
				}
				audio_tips.innerHTML = "手指上划，取消发送";
			}
		}
	}, false);
	ui.boxMsgSound.addEventListener('release', function(event) {

		clearInterval(setIntervalTimes);
		timesobj.html(0);

		if(audio_tips.classList.contains("cancel")) {
			audio_tips.classList.remove("cancel");
			audio_tips.innerHTML = "手指上划，取消发送";
		}
		//
		stopTimestamp = (new Date()).getTime();
		if(stopTimestamp - startTimestamp < MIN_SOUND_TIME) {
			timesobj.html('');
			audio_tips.innerHTML = "录音时间太短";
			ui.boxSoundAlert.classList.add('rprogress-sigh');
			recordCancel = true;
			stopTimer = setTimeout(function() {
				setSoundAlertVisable(false);
			}, 800);
		} else {
			setSoundAlertVisable(false);
		}
		recorder.stop();
	}, false);

	ui.boxMsgSound.addEventListener("touchstart", function(e) {
		//console.log("start....");
		e.preventDefault();
	});
}(mui, document));