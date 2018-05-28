var $thatTimeBase, chatSrcollRelayout;
//获取容器
var $box = $('.bubbleDiv');

function sendChat(element, imgSrc, doctextContent, conentType, soundLength, dateTime, userName) {
	
	var $user = element;
	var $doctorHead = imgSrc;

	if(!doctextContent) return;

	try {
		doctextContent = doctextContent.toutf16toIcon();
	} catch(e) {
		doctextContent = doctextContent;
	}

	var $doctextContent;

	var $thatTime;
	var myDate = new Date();

	if(dateTime) {

		switch(typeof(dateTime)) {
			case 'number':
				//dateTime.replace(/Date\([\d+]+\)/, function(a) { eval('d = new ' + a) });
				myDate = new Date(dateTime);
				break;
			case 'string':
				myDate = new Date(dateTime - 0);
				try {
					if(!myDate.getHours() < 0) {
						myDate = dateTime.replace(/Date\([\d+]+\)/, function(a) {
							eval('d = new ' + a)
						});
					}
					if(!myDate.getHours() > 0) {
						myDate = new Date();
					}
				} catch(e) {
					myDate = new Date();
				}
				break;
			default:
				myDate = dateTime;
				break;
		}

	}

	var hour = myDate.getHours();
	var minutes = myDate.getMinutes();

	if(minutes < 10) {
		minutes = '0' + minutes;
	}

	$thatTime = thisTimeForm(hour, myDate) + ' ' + hour + ':' + minutes;

	switch(conentType) {

		case 'img':
			$doctextContent = newImgList(doctextContent);
			break;
		case 'sound':
			if($user === "leftBubble") {
				soundLength = "''" + soundLength + "";
			} else if($user === "rightBubble") {
				soundLength = "" + soundLength + "''";
			}
			$doctextContent = '<span class="soundLength">' + soundLength + '</span><span class="mui-icon mui-icon-mic" data-path=' + doctextContent + '></span><span class="play-state">点击播放</span>';
			break;
		case 'icon':
			$doctextContent = iconImgSelect(doctextContent);
			break;
		case 'text':
		default:
			$doctextContent = doctextContent
			break;
	}

	//	var $boxHeght = $box.height();
	//	var $sectionHeght = $(".chat-box").height();
	//	var $elvHeght = Math.abs($boxHeght - $sectionHeght);

	//对方
	if($user === "leftBubble") {
		$box.append(createdoct(imgSrc, $doctextContent, conentType, $thatTime, userName));
	}
	//发送
	else if($user === "rightBubble") {
		$box.append(createuser(imgSrc, $doctextContent, conentType, $thatTime, userName));
	} else {
		console.log("请传入必须的参数");
	}
	clearTimeout(chatSrcollRelayout);
	chatSrcollRelayout = setTimeout(function() {
		srcollRelayout();
	}, 100);
}

function createdoct(imgSrc, $doctextContent, conentType, time, userName) {
	var $textContent = $doctextContent;
	var $imgSrc = imgSrc;
	var block = '';

	if($textContent == '' || $textContent == 'null') {
		mui.toast('亲！别太着急，先说点什么～');
		return;
	}

	if(towTime($thatTimeBase, time)) {
		block = '<div class="chat-trip">' + time + '</div>';
		$thatTimeBase = time;
	}

	block += '<div class="bubbleItem">' +

		'<div class="doctor-head">' +
		'<img src="' + imgSrc + '" alt="bbbb"/>' +
		'</div>' +

		'<span class="bubble leftBubble' + (module.datas.isGroupChat ? "groupChat" : "") + ' ' + conentType + '">' +
		(module.datas.isGroupChat ? '<div class="chat-name">' + userName + '</div>' : '') +

		$textContent + '<span class="topLevel"></span></span>' +
		'</div>';

	return block;
};

function towTime(timea, timeb) {

	if(!timea) {
		return true;
	}

	ta = timea.split(':');
	tb = timeb.split(':');

	var time = {
		a: ta[ta.length - 1] - 0,
		b: tb[tb.length - 1] - 0
	};

	return((time.b - time.a) > 3) || ((time.a - time.b) > 3);
}

function createuser(imgSrc, $textContent, conentType, time, userName) {
	var $textContent = $textContent;
	var block = '';
	if($textContent == '' || $textContent == 'null') {
		mui.toast('亲！别太着急，先说点什么～');
		return;
	}
	if(towTime($thatTimeBase, time)) {
		block = '<div class="chat-trip">' + time + '</div>';
		$thatTimeBase = time;
	}

	block += '<div class="bubbleItem clearfix">' +
		'<div class="doctor-head">' +
		'<img src="' + imgSrc + '" alt="aaaaa"/>' +
		'</div>' +
		'<span class="bubble rightBubble ' + (module.datas.isGroupChat ? "groupChat" : "") + ' ' + conentType + '">' +
		(module.datas.isGroupChat ? '<div class="chat-name">' + userName + '</div>' : '') +

		$textContent + '<span class="topLevel"></span></span>' +
		'</div>';

	return block;
}

function thisTimeForm(hour, time) {

	var hour = time.getHours();
	var minutes = time.getMinutes();

	var year = time.getYear(); //获取当前年份(2位)
	var month = time.getMonth() + 1; //获取当前月份(0-11,0代表1月)
	var day = time.getDate(); ////获取当前日(1-31)

	var thisDate = new Date();
	var thisyear = thisDate.getYear(); //获取当前年份(2位)
	var thismonth = thisDate.getMonth() + 1; //获取当前月份(0-11,0代表1月)
	var thisday = thisDate.getDate(); ////获取当前日(1-31)

	if(year == thisyear && month == thismonth && day == thisday) {
		if(hour < 6) {
			return "凌晨";
		} else if(hour < 9) {
			return "早上";
		} else if(hour < 12) {
			return "上午";
		} else if(hour < 14) {
			return "中午";
		} else if(hour < 17) {
			return "下午";
		} else if(hour < 19) {
			return "傍晚";
		} else if(hour < 22) {
			return "晚上";
		} else {
			return "夜里";
		}
	} else {
		var date3 = thisDate.getTime() - time.getTime();
		var years = Math.floor(date3 / (12 * 30 * 24 * 3600 * 1000));
		var leave = date3 % (12 * 30 * 24 * 3600 * 1000);
		var months = Math.floor(leave / (30 * 24 * 3600 * 1000));
		var leave0 = leave % (30 * 24 * 3600 * 1000);
		var days = Math.floor(leave0 / (24 * 3600 * 1000));

		if(years == 0 && months == 0 && days > 0 && days < 7) {
			switch(days) {
				case 1:
					return '昨天';
				case 2:
					return '前天';
				default:
					return "星期" + "日一二三四五六".charAt(time.getDay());
					break;
			}
		} else {

			if(months == 0 && years == 0 && days == 0) {
				return '昨天';
			}

			if(months < 10) months = '0' + months;
			if(days < 10) days = '0' + days;

			if(years == 0) {
				return months + '-' + days;
			} else {
				return '20' + years + '-' + months + '-' + days;
			}
		}

	}

}

function newImgList(files) {
	if(files) {
		var imgListStr = '';

		files.forEach(function(item, index) {
			imgListStr += newImg(item);
		});
		return imgListStr;
	}

}

function newImg(filePath) {
	if(!filePath) {
		return;
	}
	return '<span class="send-list-img" src="' + filePath + '" style="background-image:url(' + filePath + ');" data-preview-src="' + filePath.replace('ComPress/Images_120', 'Images') + '" data-preview-group="2" data-content=""></span>';
}

var icons = ['委屈', '我去', '无语', '献花', '滚啊...', '我瞧瞧', '呵呵', '难过', '我在', '逍遥', '知道啦', '啊...', '看我表情', '围观', '意会', '挑逗'];

icons.forEach(function(item, index) {

	var itemHtml = '<li class="mui-table-view-cell mui-media mui-col-xs-3"><a href="#">' + iconImgSelect(item, true) + iconTextSelect(item) + '</a></li>';

	var ikey = Math.ceil((index + 1) / 8);

	if(ikey == 0) {
		jQuery('.mui-icon-1').append(itemHtml);
	} else {
		jQuery('.mui-icon-' + ikey + '').append(itemHtml);
	}

});

function iconImgSelect(icontitle, bit) {
	if(bit) {
		switch(icontitle) {
			case '委屈':
				return '<img src="../../../img/04926/00.png" />';
			case '我去':
				return '<img src="../../../img/04926/01.png" />';
			case '无语':
				return '<img src="../../../img/04926/02.png" />';
			case '献花':
				return '<img src="../../../img/04926/03.png" />';
			case '滚啊...':
				return '<img src="../../../img/04926/04.png" />';
			case '我瞧瞧':
				return '<img src="../../../img/04926/05.png" />';
			case '呵呵':
				return '<img src="../../../img/04926/06.png" />';
			case '难过':
				return '<img src="../../../img/04926/07.png" />';
			case '我在':
				return '<img src="../../../img/04926/08.png" />';
			case '逍遥':
				return '<img src="../../../img/04926/09.png" />';
			case '知道啦':
				return '<img src="../../../img/04926/10.png" />';
			case '啊...':
				return '<img src="../../../img/04926/11.png" />';
			case '看我表情':
				return '<img src="../../../img/04926/12.png" />';
			case '围观':
				return '<img src="../../../img/04926/13.png" />';
			case '意会':
				return '<img src="../../../img/04926/14.png" />';
			case '挑逗':
				return '<img src="../../../img/04926/15.png" />';
		}
	} else {
		switch(icontitle) {
			case '委屈':
				return '<img src="../../../img/4926/00.gif" />';
			case '我去':
				return '<img src="../../../img/4926/01.gif" />';
			case '无语':
				return '<img src="../../../img/4926/02.gif" />';
			case '献花':
				return '<img src="../../../img/4926/03.gif" />';
			case '滚啊...':
				return '<img src="../../../img/4926/04.gif" />';
			case '我瞧瞧':
				return '<img src="../../../img/4926/05.gif" />';
			case '呵呵':
				return '<img src="../../../img/4926/06.gif" />';
			case '难过':
				return '<img src="../../../img/4926/07.gif" />';
			case '我在':
				return '<img src="../../../img/4926/08.gif" />';
			case '逍遥':
				return '<img src="../../../img/4926/09.gif" />';
			case '知道啦':
				return '<img src="../../../img/4926/10.gif" />';
			case '啊...':
				return '<img src="../../../img/4926/11.gif" />';
			case '看我表情':
				return '<img src="../../../img/4926/12.gif" />';
			case '围观':
				return '<img src="../../../img/4926/13.gif" />';
			case '意会':
				return '<img src="../../../img/4926/14.gif" />';
			case '挑逗':
				return '<img src="../../../img/4926/15.gif" />';
		}
	}

}

function iconTextSelect(icontitle) {
	return '<div class="mui-media-body">' + icontitle + '</div>';
}

iScrollHelper.init({

	// 监听对象
	eveDome: 'rerr',

	up: {

		// 上拉触发距离
		disi: 100,

		// 上拉触发事件
		callback: function() {

			// 事件完成执行
			iScrollHelper.refreshState(function() {});
		},

		// 上拉动画
		view: function(e) {
			if(e > 0.99) {
				if(mui.os.ios) {
					imInputView.setInputFocusById("msgInput", true);
				} else {
					//					jQuery('.sendInput').focus();
				}
			}
		}
	}

	//	down: {
	//
	//		// 上拉触发距离
	//		disi: 75,
	//
	//		// 上拉触发事件
	//		callback: function() {
	//
	//			jQuery('.pastMessage').slideToggle();
	//
	//			// 事件完成执行
	//			iScrollHelper.refreshState(function() {
	//				setTimeout(function() {
	//					jQuery('.pastMessage').slideToggle();
	//					jQuery('.notMessage').slideToggle();
	//				}, 1500);
	//			});
	//		},
	//
	//		// 上拉动画
	//		view: function(e) {
	//
	//		}
	//
	//	}
});