window.ImViewHelper = function() {};

(function($) {
	$.user = {
		headImg: "../../img/head_portrait.png",
		userName: "灬快跑小猪"
	};
	$.mu={
		userName:"灬快跑小猪",
		kkk:2
	};
	
	$.SendServerMessage = function(type, eve) {
		if (module) {
			
			console.log('1')
		} else{
			console.log('12')
			
		}
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
		
		//alert("  name=="+$.mu.userName+"  "+$.user.userName);
		sendChat("rightBubble", $.user.headImg, text, msgType, soundLength, times, $.user.userName);
	};

	// 接受消息
	$.takeChat = function(msgType, headImg, text, soundLength, times, userName) {
		alert($.user.headImg+"  rname=="+$.user.userName);
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

// 相关参数
var
	inputBot = false,
	setIntervalBottom,
	activeTapBar,
	removeActiveTapBar;

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

mui.plusReady(function() {

	// WebView自动调整
	self = plus.webview.currentWebview();
	self.setStyle({
		softinputMode: "adjustResize" // 自动调整
		//popGesture: 'none' // 侧滑关闭
	});

	// 上传图片注册
	UpFileInit();

	// 底部隐藏
	setTimeout(function() {
		jQuery('.tabBar').hide();
	}, 300);

});

(function(icon) {

	icon.on('tap', '.yuyin', function() {
		bottmContent('tabBar1');
	});

	icon.on('tap', '.tupian', function() {
		bottmContent('tabBar2');
		if(!jQuery('#selectImage a').length) {
			UpImage.upImg.gallerys();
		}
	});

	icon.on('tap', '.xiangji', function() {
		UpImage.upImg.camera();
	});

	icon.on('tap', '.biaoqing', function() {
		bottmContent('tabBar4');
	});

//	icon.on('tap', '.tianjia', function() {
//		bottmContent('tabBar5');
//	});

}(mui('.iconnav')));

// 刷新底部高度样式
function refreshBottomView() {

	jQuery('#rerr').css('padding-bottom', 110);
	jQuery('footer').css('bottom', -220);
	setTimeout(function() {
		srcollRelayout();
	}, 30);
}

jQuery('.sendInput').focus(function() {
	bottmContent();
	jQuery('#rerr').css('padding-bottom', jQuery('.mui-footer-nav').offset().top - 76);
	srcollRelayout();
	inputBot = true;
});

jQuery('.sendInput').blur(function() {
	setTimeout(function() {
		inputBot = false;
	}, 200);
});

// 显示底部内容区域
function bottmContent(key) {

	if(!key) {
		if(removeActiveTapBar) tapBarRemoveActiveColor(removeActiveTapBar, true);
		return removeActiveTapBar = activeTapBar = null;
	}

	if(activeTapBar) {

		if(removeActiveTapBar == key) {
			// 取消
			tapBarRemoveActiveColor(removeActiveTapBar, true);
			removeActiveTapBar = activeTapBar = null;
		} else {
			// 底部调整
			srcollRelayout();

			// 取消上一个点击颜色   更换本次点击
			activeTapBar = key;
			tapBarAddActiveColor(activeTapBar);
			tapBarRemoveActiveColor(removeActiveTapBar);

			// 底部以显示 切换底部页面
			jQuery('.' + activeTapBar).show();
			jQuery('.' + removeActiveTapBar).hide();

			removeActiveTapBar = activeTapBar;
		}

	} else {

		// 底部调整
		jQuery('#rerr').css('padding-bottom', 110 + 220);
		srcollRelayout();

		jQuery('.sendInput').blur();

		activeTapBar = removeActiveTapBar = key;

		tapBarAddActiveColor(activeTapBar);

	}

}

function tapBarAddActiveColor(item) {
	function footershow() {
		jQuery('.' + item).show();
		jQuery('[date-nav=' + item + ']').css({
			color: '#000'
		});
		jQuery('footer').animate({
			bottom: 0
		}, 100);
		jQuery('.mui-footer-nav').animate({
			bottom: 220
		}, 100);
	}
	if(inputBot) {
		setTimeout(footershow, 300);
	} else {
		footershow();
	}

}

function tapBarRemoveActiveColor(item, bot) {
	jQuery('.' + item).hide();
	jQuery('[date-nav=' + item + ']').css({
		color: '#6b6b6b'
	});
	if(bot) {
		setTimeout(function() {
			refreshBottomView();
			jQuery('footer').animate({
				bottom: -220
			}, 100);
			jQuery('.mui-footer-nav').animate({
				bottom: 0
			}, 100);
		}, 10);
	}
}

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
			jQuery('#selectImage').append('<a class="mui-control-item up-list-row" src="' + path + '" data-preview-src="' + path + '" data-preview-group="1" data-content="" data-select-item="' + path + '" style="background: url(' + path + ');"></a>');
		},
		// 取消选择图片
		remmoveImageCallback: function(path) {
			jQuery('.mui-control-item[data-select-item="' + path + '"]').remove();
		},
		// 选择取消
		cancel: function(e) {
			if (jQuery('#selectImage a').length < 1) {
				bottmContent();
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
			
			jQuery('#selectImage').html('');

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

document.querySelector('.mui-scroll-wrapper').addEventListener('scrollstart', function(e) {

	if(inputBot) {
		jQuery('.sendInput').blur();
	} else {
		bottmContent();
	}

	jQuery('#rerr').css('padding-bottom', 110);

	jQuery('footer').css('bottom', -220);

});

var scrollSetTimeout = null;

// 刷新滚动条 滚动到底部
function srcollRelayout() {

	if(mui('#rerr')) {
		clearTimeout(scrollSetTimeout);
		scrollSetTimeout = setTimeout(function() {
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
			}, 50);
		}, 50);

	}

}

// 防止键盘关闭
(function(send) {

	function msgTextFocus() {
		jQuery('.sendInput').focus();
		setTimeout(function() {
			jQuery('.sendInput').focus();
		}, 150);
	}

	//解决长按“发送”按钮，导致键盘关闭的问题；
	send.addEventListener('touchstart', function(event) {
		if(inputBot) {
			msgTextFocus();
			event.preventDefault();
		}
	});

	//解决长按“发送”按钮，导致键盘关闭的问题；
	send.addEventListener('touchmove', function(event) {
		if(inputBot) {
			msgTextFocus();
			event.preventDefault();
		}
	});
}(document.querySelector('#msg-send')));

// 点击注册
(function(h) {

	// 相册
	h.on('tap', '.mui-select-gallerys', function() {
		UpImage.upImg.gallerys();
	});

	// Body
	h.on('tap', '#rerr,header', function() {
		bottmContent();
	});

	//send text
	h.on('tap', '#msg-send', function() {

		// 发送
		var text = jQuery('.sendInput').val();

		if(text != '') {
			ImViewHelper.sendMsg({
				text: text.utf16toIcon()
			}, false, true);
			jQuery('.sendInput').val('')
		}
	});

	// send img
	h.on('tap', '.mui-btn-send', function() {
		bottmContent();
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

	ui.boxMsgSound.addEventListener('hold', function(event) {

		module.date.soundtimes = 0;

		setIntervalTimes = setInterval(function() {
			module.date.soundtimes++
				jQuery('#times').html(module.date.soundtimes);
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
		jQuery('#times').html(0);

		if(audio_tips.classList.contains("cancel")) {
			audio_tips.classList.remove("cancel");
			audio_tips.innerHTML = "手指上划，取消发送";
		}
		//
		stopTimestamp = (new Date()).getTime();
		if(stopTimestamp - startTimestamp < MIN_SOUND_TIME) {
			jQuery('#times').html('');
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