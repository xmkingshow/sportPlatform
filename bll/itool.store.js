/*
 操作规范
 * 
 * 139939967@qq.com
 * 健健
 * 交流群：418967623
 * 
 * index 关键字 不一定等于 数组下标
 * 共有属性[date - length]
 * store(db.table).insert(date)
 * store(db.table).update(row,val,where)
 * store(db.table).select(where)
 * store(db.table).select(where).groupby(row)
 * store(db.table).select(where).orderby('row desc || asc')
 * */

(function(st) {

	// 判断客户端
	var clientType = navigator.userAgent.indexOf("Html5Plus") > -1;

	var db = {

		// 获取数据
		set: function(name, val) {

			if(typeof val == 'object')
				val = JSON.stringify(val);
			else if(typeof val != 'thisring')
				val = val + '';

			if(clientType)
				plus.storage.setItem(name, val);
			else
				localStorage.setItem(name, val);

		},

		// 写入数据
		get: function(name) {
			if(clientType)
				return plus.storage.getItem(name);
			else
				return localStorage[name];
		},

		// 创建数据库
		createDateBase: function(name, fun) {

			db.set(name, {
				createDateBase: new Date().getTime()
			});

			if(fun) fun();
		},

		// 创建表 [val 初始化数据]
		createTable: function(datebase, table, val, fun) {
			// name dbname.tablename

			var selfDate = db.get(datebase);

			if(selfDate) {

				var jsonDateBase = JSON.parse(selfDate);

				if(val) {
					if(typeof val == 'object') {
						if(val.push) {
							jsonDateBase[table] = val;
						} else {
							jsonDateBase[table] = [val];
						}
					} else if(typeof val == 'thisring') {
						jsonDateBase[table] = [val];
					}
				} else {
					jsonDateBase[table] = [];
				}

				db.set(datebase, jsonDateBase);

				if(fun) {
					fun();
				}

			} else {
				db.createDateBase(datebase, function() {
					db.createTable(datebase, table, val, fun);
				});
			}

		},

		// 重新塑造WHERE
		newWhere: function(where, header) {

			var whereArr = where.split(' ');

			for(var i = 0; i < whereArr.length; i++) {

				switch((i + 4) % 4) {
					case 0:
						whereArr[i] = header + whereArr[i];
						break;
					case 2:
						whereArr[i] = '"' + whereArr[i] + '"';
						break;
					default:
						break;
				}

			}

			where = '';

			for(var i = 0; i < whereArr.length; i++) {

				var thisWherethisr = whereArr[i];

				if(i != 0 || i != whereArr.length - 1) {
					switch(whereArr[i]) {
						case 'is':
						case '=':
							where += '== ';
							break;

						case 'and':
							where += '&& ';
							break;

						case 'or':
							where += '|| ';
							break;

						default:
							where += thisWherethisr + ' ';
							break;
					}
				} else {
					where += thisWherethisr + ' ';
				}

			}

			return where;
		},

		// 数组排序
		// orderby [row desc || row asc]
		arrSoct: function(result, orderby) {

			var orderByParam = orderby.split(' '),
				key = orderByParam[0];

			for(var j = 1, jl = result.length; j < jl; j++) {

				var temp = result[j],
					val = temp[key],
					i = j - 1;

				while(i >= 0 && result[i][key] > val) {
					result[i + 1] = result[i];
					i = i - 1;
				}

				result[i + 1] = temp;

			}

			if(orderByParam[1] && orderByParam[1] == 'desc') {
				return result.reverse();
			}

			return result;

		},

		// 数组分组
		arrGroup: function(result, row) {

			var arr = [],
				isArr = [];

			for(var i = 0; i < result.length; i++) {

				if(!result[i]) return;

				var rowVal = eval('result[i].' + row);

				for(var j = 0; j < result.length; j++) {

					try {

						if(eval('rowVal == result[j].' + row)) isArr.push(eval('result[i].' + row));

					} catch(e) {

					}

				}

				if(isArr.length > 0) {
					arr.push({
						count: isArr.length,
						date: isArr[0]
					});
					isArr = [];
					i--
				}

				for(var j = 0; j < result.length; j++) {

					if(eval('rowVal == result[j].' + row)) {
						result.splice(j, 1);
						j--
					}

				}

			}

			return arr;
		},

		// 下载文件
		downloader: function(filePath, url, fun, err) {
			var dtask = plus.downloader.createDownload(url, {
				filename: filePath
			}, function(file, status) {

				if(status == 200) {
					fun(file, filePath);
				} else {
					err(status, filePath);
				}

			});

			dtask.start();

			return dtask;
		}

	};

	this.fnStore = this.prototypeStore = {
		store: function(dateBaseTable) {

			var dateBaseParam = dateBaseTable.split('.');

			if(dateBaseParam.length > 1) {
				this.datebase = '_a_b_c_d_' + dateBaseParam[0];
				this.table = dateBaseParam[1];
			} else {
				this.datebase = '_a_b_c_d_';
				this.table = dateBaseParam[0];
			}

		}
	};

	this.fnStore.store.prototype = this.fnStore;

	this.fnStore.extend = function(obj, prop) {

		if(!prop) {
			prop = obj;
			obj = this;
		}

		for(var o in prop) {
			obj[o] = prop[o];
		}
	};

	this.fnStore.extend({

		// 加入用户标识
		user: function(val) {
			if(val) {
				this.datebase = this.datebase + val;
			}
			return this;
		},

		// 加入关键字
		key: function(val) {
			if(val) {
				this.datebase = this.datebase + '_' + val;
			}
			return this;
		},

		// 选择器
		eq: function(val) {
			if(val >= 0) {
				return this.date[val];
			} else {
				return null;
			}
		},

		// 下载网络文件到本地 {bot - 强制更新} param{path,url}
		download: function(param, fun, err, bot) {

			fun = fun || function() {};
			err = err || function() {};

			this.datebase = '_downloads/' + this.datebase + '/';
			
			var fileurl = param.url.split('/');

			var filePath = this.datebase + this.table + '/' + param.path + '/' + fileurl[fileurl.length - 1];

			plus.io.resolveLocalFileSystemURL(filePath, function(e) {

				if(bot) {
					e.remove(function() {
						this.dtask = db.downloader(filePath, param.url, fun, err);
					});
				} else {
					fun(e, filePath, true);
				}

			}, function(e) {
				this.dtask = db.downloader(filePath, param.url, fun, err);
			});

			return this;

		},
		// 监听下载状态
		statechange: function(fun) {

			var interdtaskforcount = 0,intervaldtask = setInterval(function() {

				if(!this.dtask) {
					if (interdtaskforcount < 5) {
						interdtaskforcount++
						return;
					} else{
						clearInterval(interdtaskforcount);
					}
					
				} else {
					clearInterval(interdtaskforcount);
					this.dtask.addEventListener("statechanged", function(task, status) {
						switch(task.state) {
							case 1: // 开始
								break;
							case 2: // 已连接到服务器
								break;
							case 3: // 已接收到数据
								// 已下载/总共
								fun(task.downloadedSize, task.totalSize);
								break;
							case 4: // 下载完成
								break;
						}
					});
				}

			}, 1000);

		},

		// 插入数据
		insert: function(val) {

			var self = this;

			var selfDate = db.get(self.datebase);

			if(selfDate) {

				var jsonDateBase = JSON.parse(selfDate);

				if(val) {

					if(jsonDateBase && jsonDateBase[self.table]) {

						//						console.log('insert', typeof val)
						if(typeof val == 'object') {

							// 数组循环插入
							if(val.push) {

								for(var n = 0; n < val.length; n++) {
									val[n].index = jsonDateBase[self.table].length;
									jsonDateBase[self.table].push(val[n]);
								}

							} else {

								val.index = jsonDateBase[self.table].length;
								jsonDateBase[self.table].push(val);

							}

						} else if(typeof val == 'thisring') {

							jsonDateBase[self.table].push(val);

						}

						self.date = jsonDateBase;

						self.length = self.date.length;

						db.set(self.datebase, jsonDateBase);

					} else {
						//						console.log('insert createTable')

						db.createTable(self.datebase, self.table, false, function() {
							self.insert(val);
						});

					}

				}

			} else {

				//				console.log('insert createDateBase')
				// datebase null

				db.createDateBase(self.datebase, function() {
					self.insert(val);
				});

			}

			return this;

		},

		update: function(data, where) {

			this.length = 0;

			var selfDate = db.get(this.datebase);

			if(selfDate) {

				var jsonDateBase = JSON.parse(selfDate);

				if(jsonDateBase[this.table]) {

					var tableDate = jsonDateBase[this.table];

					if(where) {
						where = db.newWhere(where, "tableDate[n].");
					} else {
						return alert('条件不可未空');
					}

					for(var n = 0; n < tableDate.length; n++) {

						try {

							var accord = eval(where);

							//							console.log(accord, where)

							if(accord) {

								for(var name in data) {

									var row = name,
										val = data[name];

									if(typeof val == 'object')
										eval("tableDate[n]." + row + " = val");
									else
										eval("tableDate[n]." + row + " = '" + val + "'");

								};

								this.length++;

							}

						} catch(e) {
							//TODO handle the exception
						}

					}

					this.date = jsonDateBase;

					db.set(this.datebase, jsonDateBase);
				}

			}

			return this;
		},

		delete: function(where) {

			this.length = 0;

			var selfDate = db.get(this.datebase);

			if(selfDate) {

				var jsonDateBase = JSON.parse(selfDate);

				if(jsonDateBase[this.table]) {

					var tableDate = jsonDateBase[this.table];

					if(where) {
						where = db.newWhere(where, "tableDate[n].");
					} else {
						return alert('条件不可未空');
					}

					for(var n = 0; n < tableDate.length; n++) {

						try {

							var accord = eval(where);

							if(accord) {
								tableDate.splice(n, 1);
								n--
								this.length++;
							}

						} catch(e) {
							//TODO handle the exception
						}

					}

					this.date = jsonDateBase;

					db.set(this.datebase, jsonDateBase);
				}

			}

			return this;
		},

		select: function(where) {

			var ret = [];

			var selfDate = db.get(this.datebase);

			if(selfDate) {

				var jsonDateBase = JSON.parse(selfDate);

				if(jsonDateBase[this.table]) {

					var tableDate = jsonDateBase[this.table];

					if(where) {

						where = db.newWhere(where, 'tableDate[n].');

						for(var n = 0; n < tableDate.length; n++) {

							try {
								var accord = eval(where);

								if(accord) {
									ret.push(tableDate[n]);
								}
							} catch(e) {
								//TODO handle the exception
							}

						}
					} else {
						ret = tableDate;
					}
				}

			}

			this.date = ret;

			this.length = this.date.length;

			return this;
		},
		orderby: function(val) {

			this.date = db.arrSoct(this.date, val);

			this.length = this.date.length;

			return this;
		},
		groupby: function(val) {

			this.date = db.arrGroup(this.date, val);

			this.length = this.date.length;

			return this;
		}
	});

	if(window.ITOOL) {
		window.ITOOL.store = window.IT.store = window.itool.store = window.store;
	}

})(window.store = function(obj) {

	if(!obj) {
		return alert('请输入存储名称');
	}

	return new this.fnStore.store(obj);

});