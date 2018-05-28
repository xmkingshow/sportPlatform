(function($) {

	// 数组去重
	$.unique = function() {
		var res = [];
		var json = {};
		for(var i = 0; i < this.length; i++) {
			if(!json[this[i]]) {
				res.push(this[i]);
				json[this[i]] = 1;
			}
		}
		return res;
	};

	// 数组根据关键字排序 obj = true  逆序
	$.sortByKey = function(key, obj) {

		if(obj) {
			return this.sort(function(a, b) {
				var x = a[key];
				var y = b[key];
				return((x > y) ? -1 : ((x > y) ? 1 : 0));
			});
		} else {
			return this.sort(function(a, b) {
				var x = a[key];
				var y = b[key];
				return((x < y) ? -1 : ((x > y) ? 1 : 0));
			});
		}

	};

}(Array.prototype));