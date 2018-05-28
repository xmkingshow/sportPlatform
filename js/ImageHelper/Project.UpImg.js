//<div class="image-list">
//				<div class="image-up">
//					<i class="iconfont icon-xiangji"></i>
//				</div>
//			</div>

/*
 UpImage.initDate(
	{},
	function(){},
	function(){},
	path);
 * */

(function($, _$) {

	try {
		mui.previewImage();
	} catch(e) {
		//TODO handle the exception
	}

	var upimg = {
		btn: {
			upIma: jQuery('.image-list').find('.image-up'),
			delete: jQuery('.mui-slider-img-delete'),
			imgList: jQuery('.up-list-row')
		},
		exs: {
			_hei: jQuery('.image-list').find('.image-up').width() * 0.95,
			_font: this._hei / 2.7,
			_fonts: this._hei / 7.5,
			size: 0
		},
		serverUrl: '/upload/images',
		files: [],
		onfiles: [],
		closefiles: [],
		uploader: null,
		option: {
			upmsg: '正在提交',
			lengthBack: function(e) {}, //选择图片数量回调
			cancel: function(e) {}, // 取消选择
			takePohoto: function(e) {}, // 拍照回调
			selectImageCallback: function(e) {}, // 选择图片回调
			remmoveImageCallback: function(e) {}, // 删除图片回调
			uploadTrigger: function(e, cb) {
				return cb();
			}, // 上传后回调
			multiple: true,
			waiting: true,
			delete: false,
			filter: 'image', //image video none
			number: 9,
			popover: {}, //{top:"10px",left:"10px",width:"200px",height:"200px"} //弹出区域
			video: function(e) {
				console.log(e)
			},
			btns: function() {
				console.log('---------------------' + this.filter)
				if(this.filter == 'image') {
					return [{
						title: "从相册选择"
					}, {
						title: "现在拍照"
					}];
				} else if(this.filter == 'video') {
					this.multiple = false;
					return [{
						title: "选择"
					}, {
						title: "现在摄像"
					}];
				} else {
					return [{
						title: "从相册选择"
					}, {
						title: "现在拍照"
					}, {
						title: "现在摄像"
					}];
				}
			}
		},
		initDate: function(exs) {
			this.option = $.extend(true, this.option, exs.ops || {});
			jQuery(exs.sub).on('tap', function() {
				upimg.send();
			});

			if(exs.upFile) {
				upimg.tap(exs.upFile);
			} else {

				upimg.tap(upimg.btn.upIma);
			}
		}
	};

	_$.sendDate = null;

	_$.callBack = null;

	_$.upImg = upimg;

	_$.initDate = function(exs, sendDate, callBack, serverUrl) {
		upimg.initDate(exs);
		_$.sendDate = sendDate || function() {};
		_$.callBack = callBack || function() {};
		upimg.serverUrl = serverUrl || upimg.serverUrl;
		if(upimg.option.delete) {
			upimg.btn.delete.show();
		}
	};

	upimg.option.onmaxed = function() {
		mui.toast('最多只能选择' + upimg.option.number + '张图片')
	};

	upimg.addFile = function(path) {
		if(jQuery.inArray(path, upimg.files) < 0) {
			upimg.files.push(path);
			upimg.addRowImg(path);
		};

	};

	upimg.addRowImg = function(path) {
		if(!upimg.option.multiple) {
			upimg.btn.upIma.css('background-image', 'url(' + path + ')');
			return;
		}
		upimg.option.selectImageCallback(path);
		upimg.btn.upIma.before('<span class="up-list-row" src="' + path + '" style="background-image:url(' + path + ')" data-preview-src="' + path + '" data-preview-group="1" data-content=""></span>');
	}

	upimg.closeRowImg = function() {
		upimg.files.forEach(function(item, index) {
			if(jQuery.inArray(item, upimg.onfiles) < 0) upimg.closefiles.push(item);

		});

		//		plus.nativeUI.showWaiting('正在提交');
		//		
		//		setTimeout(function() {
		//			upimg.send(); // ----- 服务器发送
		//			upimg.option.lengthBack(upimg.files.length);
		//		}, 1000);

		upimg.closefiles.forEach(function(item, index) {
			jQuery('.up-list-row[data-preview-src="' + item + '"]').remove();
			upimg.option.remmoveImageCallback(item);
			upimg.files.splice(jQuery.inArray(item, upimg.files), 1);
		});
	}

	upimg.btn.upIma.find('i').css('font-size', upimg.exs._font);

	jQuery('head').append("<style>.image-list .image-up i::after{width:" + upimg.exs._hei + "px;left:-" + (upimg.exs._font - 6) + "px; top:" + upimg.exs._font + 3 + "px;font-size:" + upimg.exs._fonts + "px }</style>");

	upimg.btn.upIma.css({
		'padding-top': upimg.exs._hei / 7,
		'height': upimg.exs._hei
	});

	upimg.btn.delete.on('tap', function() {

		var imgpath = jQuery(this).parent().parent().find('.mui-active').find('img').attr('src');

		jQuery('.up-list-row[data-preview-src="' + imgpath + '"]').remove();

		upimg.files.splice(jQuery.inArray(imgpath, upimg.files), 1);

		upimg.option.lengthBack(upimg.files.length);
	});

	/**
	 * @description 打开相册失败，请求系统权限
	 * @param {Error} e
	 */

	upimg.sys_permission = function(e) {
		if(plus.os.name == "iOS") {
			if(e.code == 8) {
				mui.toast("您的相册权限未打开，请在当前应用设置-隐私-相册来开打次权限", function() {
					plus.runtime.openURL('prefs:root=Privacy');
				})
			}
		} else if(plus.os.name == "Android") {
			if(e.code != 12) {
				mui.toast("您的相册权限未打开，请在应用列表中找到您的程序，将您的权限打开", function() {
					var android = plus.android.importClass('com.android.settings');
					var main = plus.android.runtimeMainActivity();
					var Intent = plus.android.importClass("android.content.Intent");
					var mIntent = new Intent('android.settings.APPLICATION_SETTINGS');
					main.startActivity(mIntent);
				});
			}
		}
	};

	upimg.tap = function(obj) {
		obj.on('tap', function() {
			plus.nativeUI.actionSheet({
				title: "选择方式",
				cancel: "取消",
				buttons: upimg.option.btns()
			}, function(e) {

				console.log(JSON.stringify(upimg.files))

				if(upimg.option.filter == 'video') {
					switch(e.index) {
						case 1:
							if(upimg.option.multiple) {
								upimg.gallerys();
							} else {
								upimg.gallery();
							}
							console.log('从相册选择');
							break;
						case 2:
							upimg.video();
							console.log('现在摄像')
							break;
					}
					return;
				}

				switch(e.index) {
					case 1:
						if(upimg.option.multiple) {
							upimg.gallerys();
						} else {
							upimg.gallery();
						}
						console.log('从相册选择');
						break;
					case 2:
						upimg.camera();
						console.log('现在拍照')
						break;
					case 3:
						upimg.video();
						console.log('现在摄像')
						break;
				}
			});
		});
	}

	upimg.gallery = function() {
		plus.gallery.pick(function(e) {
			var houzhui = e.split('.')[1].toUpperCase();
			console.log(houzhui)

			if(
				houzhui == 'MP4' ||
				houzhui == 'MOV' ||
				houzhui == '3GP' ||
				houzhui == 'WMV' ||
				houzhui == 'WMA'
			) {
				upimg.files = [];
				upimg.files.push(e);
				upimg.option.video(e);
			} else {
				upimg.zip(e);
				upimg.closeRowImg();
			}
		}, function(e) {
			//用户取消
			upimg.sys_permission(e);
		}, {
			filter: upimg.option.filter,
			popover: upimg.option.popover,
			selected: upimg.files
		});
	};

	upimg.gallerys = function() {
		plus.gallery.pick(function(e) {

			upimg.onfiles = e.files;

			e.files.forEach(function(item, index) {
				upimg.zip(item, false);
			});

			upimg.closeRowImg();

		}, function(e) {
			//用户取消
			upimg.sys_permission(e);
			upimg.option.cancel(e);
		}, {
			filter: upimg.option.filter,
			popover: upimg.option.popover,
			selected: upimg.files,
			maximum: upimg.option.number,
			onmaxed: upimg.option.onmaxed,
			multiple: upimg.option.multiple,
			filename: '_doc/camera/'
		});
	};

	upimg.camera = function() {
		var cmr = plus.camera.getCamera();
		cmr.captureImage(function(p) {
			plus.io.resolveLocalFileSystemURL(p, function(entry) {
				var u = entry.toLocalURL();
				upimg.option.takePohoto(u);
				upimg.zip(u, true);
			}, function(err) {
				console.log("读取拍照文件错误：" + err.message);
			});
		}, function(err) {
			//未测拍照权限 err.code
			console.log("失败：" + err.message);
		}, {
			filename: "_doc/camera/",
			index: 1
		});
	};

	// 摄像
	upimg.video = function() {
		var cmr = plus.camera.getCamera();
		var res = cmr.supportedVideoResolutions[2];
		var fmt = cmr.supportedVideoFormats[0];
		console.log("Resolution: " + res + ", Format: " + fmt);
		cmr.startVideoCapture(function(path) {
				//				alert("Capture video success: " + path);
				//upimg.addFile(path);
				plus.io.resolveLocalFileSystemURL(path, function(entry) {
					var fileUrl = entry.toLocalURL();
					upimg.option.video(fileUrl);
				}, function(e) {
					mui.toast(e.message);
				});
				upimg.files = [];
				upimg.files.push(path);
			},
			function(error) {
				mui.back();
				//alert("Capture video failed: " + error.message);
			}, {
				resolution: res,
				format: fmt,
				filename: '_doc/camera/'
			}
		);
		// 拍摄10s后自动完成 
		setTimeout(function() {
			cmr.stopVideoCapture();
		}, 10000);
	}

	upimg.zip = function(path, bot) {

		var name = path.substr(path.lastIndexOf('/') + 1);

		plus.zip.compressImage({
			src: path,
			dst: '_doc/' + name,
			overwrite: true,
			quality: 50
		}, function(zip) {
			upimg.exs.size = zip.size
			//console.log("filesize:" + zip.size + ",totalsize:" + size);
			if(upimg.exs.size > (20 * 1024 * 1024)) {
				return mui.toast('文件超大,请重新选择~');
			}

			upimg.addFile(zip.target);

			if(bot) {
				setTimeout(function() {
					upimg.send(); // ----- 服务器发送
				}, 600);
			}

		}, function(zipe) {
			mui.toast('压缩失败！')
		});
	};

	upimg.send = function() {

		console.log('send state open')

		try {
			jQuery('#msg-text').blur();
		} catch(e) {
			//TODO handle the exception
		}

		if(upimg.option.waiting) plus.nativeUI.showWaiting(upimg.option.upmsg);

		if(upimg.serverUrl.indexOf('http') == -1) {
			upimg.serverUrl = 'https://file.help-itool.com/' + upimg.serverUrl;
		}
		
		console.log(upimg.serverUrl,'1111111111')
		
		upimg.uploader = plus.uploader.createUpload(upimg.serverUrl, {
			method: 'POST'
		}, function(upload, status) {
			
			upimg.option.uploadTrigger(upload.responseText, function() {

				if(upimg.option.waiting) plus.nativeUI.closeWaiting();

				if(status == 200) {
					_$.callBack(upload.responseText);
				} else {
					console.log("upload fail");
					mui.toast('网络错误');
				}
			});

			___jsonKey = [];
			___jsonValue = [];

		});

		//添加上传数据
		var ops = _$.sendDate();

		var ___jsonKey = [],
			___jsonValue = [];

		mui.each(ops, function(item, index) {
			try {
				try {
					___jsonValue.push(index().toString());
					___jsonKey.push(item);
				} catch(e) {
					___jsonKey.push(item);
					___jsonValue.push(index.toString() || '');

				}
			} catch(e) {

			}
		});

		mui.each(___jsonKey, function(item, index) {

			console.log(index + ':' + ___jsonValue[item])

			upimg.uploader.addData(index, ___jsonValue[item]);

		});

		//添加上传文件
		mui.each(upimg.files, function(index, item) {

			var name = (item.substr(item.lastIndexOf('/') + 1)) + index;

			upimg.uploader.addFile(item, {
				key: name
			});
		});

		upimg.files = [];

		//开始上传任务
		upimg.uploader.start();
	};
}(jQuery, window.UpImage = function() {}));