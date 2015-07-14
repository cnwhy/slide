/*
 * 幻灯轮换效果 v1.1
 * author: why
 * Date: 2013.1.5
 * explain:
new slide("#id","#id>li",{
	slideDirection：2，
	slideButs_event："mosemove"
	slides_fun: function(i){alert("现在切换到第3项"i);}
})
 * demo: 
 */

/*
 * 构造函数
 * slideInner	幻灯片的容器一般是"ul"。
 * slides    	幻灯片组，一般是"ul>li"
 * options   	详细的配置json对像，参看slide.options的注释
 */
	slide = function (slideInner, slides, options) {
		this.slideButs_arr = [];
		this.slideInner = $(slideInner);
		this.slides = $(slides);
		this.slidesItem = this.slides.length;
		this.setOptions(options);
		this.numberOfSlides = -1; //可切换的页数；
		this.slides_xc = null;
		this.zantin = false;
		this.info();
	};
	slide.prototype = {
		setOptions : function (options) {
			this.options = {
				currentPosition : 0, //最开始在第几张幻灯片
				slideWidth : 180, //元素块的宽度 slideDirection为0时必填
				slideHeight : 180, //元素块的宽度 slideDirection为1时必填
				slideDirection : 0, //切换样式 0：横向滚动 1：垂直滚动 2：渐显
				slideSeries:0,		//连续滚动	
				//slidePercent:0,   //百分比滚动	
				slideButs : null, //切换按钮容器，样式自定义
				slideButs_html : null, //切换按钮html 可以是反回HTML函数，具体参看shenchen_buts;
				slideButs_event : "click", //触发切换的事件
				slideButs_selectclass : "s", //当前幻灯按钮样式
				slides_xssm : 1, //容器显示项的个数 当slideDirection不为2时有效果 （基础效果，slideDirection不能为2 渐显）
				slides_auto_span : 5000, //自动切换间隔 0为关闭自动切换
				slides_span : "normal", //切换速度 jquery切换速度关键字或数字（毫秒）
				slides_to_l : null, //前一个事件绑定对象
				slides_to_r : null, //后一个事件绑定对象
				slides_fun : function (i) {}, //切换动画前，执行
				slides_end : function (i) {}, //切换动画结束后，执行
				slides_zindex:2
				//每次切换执行的函数，i为切换后的位置。
			};
			for (var o in options) {
				this.options[o] = options[o];
			};
			for (var p in this.options) {
				this[p] = this.options[p];
			}
		},
		shenchen_buts : function () { //生成控制按钮
			var o = this;
			if (this.slideButs) {
				this.slideButs = $(this.slideButs);
				for (var i = 0; i < this.numberOfSlides; i++) {
					var dom;
					if (!this.slideButs_html) {
						dom = $("<a href=\"javascript:;\" onfocus=\"this.blur()\">" + (i + 1) + "</a>");
					} else if (typeof(this.slideButs_html) == "function") {
						dom = $(this.slideButs_html(i));
					} else {
						dom = $(this.slideButs_html);
					}
					+function() {
						var n = i;
						var eventname = o.slideButs_event;
						eventname = eventname.replace(/\bhover\b/g,'mouseenter');
						dom.bind(eventname, function (a) {
							o.toItem(n);
							return false;
						});
					}
					();
					this.slideButs_arr.push(dom);
					this.slideButs.append(dom);
				}
			}
		},
		bind_but : function () { //绑定按钮事件

			var o = this;
			if (this.slides_to_l) {
				this.slides_to_l = $(this.slides_to_l);
				this.slides_to_l.bind("click", function () {
					o.toLast();
					return false;
				});
			}
			if (this.slides_to_r) {
				this.slides_to_r = $(this.slides_to_r);
				this.slides_to_r.bind("click", function () {
					o.toNext();
					return false;
				});
			}
		},
		toLast: function () {
			this.toItem(this.currentPosition - 1)
		},
		toNext : function () {
			this.toItem(this.currentPosition + 1)
		},
		toItem: function(i,conn){
			var o = this;
			if (this.slides_xc) { //取消自动播放
				clearTimeout(this.slides_xc);
			}
			if (this.zantin) {
				this.slides_xc = setTimeout(function () {
						o.toItem(i)
					}, 1000);
				return;
			}
			if(i<0 || i > this.numberOfSlides-1){
				if(this.slidesItem >1 ){
					if(this.slideSeries){
						if(Math.abs(this.currentPosition-i) != 1 ){
							i = i<0 ? this.currentPosition-1 : this.currentPosition+1;
						}
						if(i >= this.numberOfSlides){
							this.currentPosition = i - this.numberOfSlides;
						}else if( i <0){
							this.currentPosition =i + this.numberOfSlides;
						}else{
							this.currentPosition = i;
						}
					}else{
						this.currentPosition = i = i<0 ? this.numberOfSlides-1 : (i>this.numberOfSlides-1?0:i);
						
					}
				}else{
					this.currentPosition=i=0;
				}
			}else{
				this.currentPosition = i;
			}
			this.slides_fun.call(o, this.currentPosition);
			switch (this.slideDirection) {
			case 0:
				(function(){
					var ii = i;
					var slideWidth = o.slidePercentcss || o.slideWidth;
					var L0 = {"left": -o.numberOfSlides*slideWidth + (o.slidePercentcss ? "%" : "")}
						,animate = {
							play:{"left": slideWidth * (-ii) + (o.slidePercentcss ? "%" : "")}
							,L0:{"left": -(o.numberOfSlides+ii)* slideWidth + (o.slidePercentcss ? "%" : "")}
							,unL0:{"left": -(ii-o.numberOfSlides)* slideWidth + (o.slidePercentcss ? "%" : "")}
						}
					if(ii<0){
						o.slideInner.stop().css(L0)
						ii = o.currentPosition;
					}
					o.slideInner.stop().animate(animate.play, o.slides_span,function(){
						if(ii<0){
							o.slideInner.css(animate.L0);
						}
						if(ii>o.numberOfSlides-1){
							o.slideInner.css(animate.unL0);
						}
						o.slides_end.call(o,o.currentPosition);
					});
				})()
				break;
			case 1:
				(function(){
					var ii = i;
					var slideHeight = o.slidePercentcss || o.slideHeight;
					var L0 = {"top": -o.numberOfSlides*slideHeight + (o.slidePercentcss ? "%" : "")}
						,animate = {
							play:{"top": slideHeight * (-ii) + (o.slidePercentcss ? "%" : "")}
							,L0:{"top": -(o.numberOfSlides+ii)* slideHeight + (o.slidePercentcss ? "%" : "")}
							,unL0:{"top": -(ii-o.numberOfSlides)*slideHeight + (o.slidePercentcss ? "%" : "")}
						}
					if(ii<0){
						o.slideInner.stop().css(L0)
						ii = o.currentPosition;
					}
					o.slideInner.stop().animate(animate.play, o.slides_span,function(){
						if(ii<0){
							o.slideInner.css(animate.L0);
						}
						if(ii>o.numberOfSlides-1){
							o.slideInner.css(animate.unL0);
						}
						o.slides_end.call(o,o.currentPosition);
					});
				})()
				break;
			case 2:
				this.slides.not(this.slides[this.currentPosition]).css({
					'z-index' : 3
				}).fadeOut(this.slides_span);
				$(this.slides[this.currentPosition]).css({
					'z-index' : 2,
					'display' : ""
				}).fadeIn(this.slides_span,function(){
					o.slides_end.call(o,o.currentPosition);
				});
				break;
			}
			//自动播放轮播
			if (this.slides_auto_span ) {
				if (this.slides_xc) {
					clearTimeout(this.slides_xc);
				}
				this.slides_xc = setTimeout(function () {
					o.toNext();
				}, o.slides_auto_span)
			}
		},
		infoSeries : function(){
			if(this.slideSeries){//连续滚动
				this.numberOfSlides = this.slides_xssm==1?this.numberOfSlides:this.slidesItem;
				var temp = this.slides.clone();
				this.slides.last().after(temp);
				this.slides = this.slides.add(temp);
			}
		},
		info : function () {
			var o = this;
			this.numberOfSlides = this.slidesItem - this.slides_xssm + 1;
			//if(this.numberOfSlides <= 1) return;  
			switch (this.slideDirection) {
				case 0:
					this.infoSeries();
					this.slidePercent = /^\d+(.\d+)?\%$/.test(this.slideWidth);
					var slideInnerCSS = {
							'width' : this.slideWidth * this.slidesItem * (this.slideSeries?2:1),
							'position' : 'absolute'
						}
						,slidesCSS = {
							'float' : "left"
						}
					
					if(this.slidePercent){
						this.slidePercentcss = parseFloat(this.slideWidth);
						var itemcss = 100/(this.slidesItem * (this.slideSeries?2:1)) + "%"
						slideInnerCSS.width = this.slidePercentcss * this.slidesItem * (this.slideSeries?2:1) + "%";
						slidesCSS.width = itemcss;
					}
					this.slideInner.css(slideInnerCSS);
					this.slides.css(slidesCSS);
					break;
				case 1:
					this.infoSeries();
					this.slidePercent = /^\d+(.\d+)?\%$/.test(this.slideHeight);
					var slideInnerCSS = {
							'height' : this.slideHeight * this.slidesItem * (this.slideSeries?2:1),
							'position' : 'absolute'
						}
						,slidesCSS = {
							'clear' : 'both'
						}
					
					if(this.slidePercent){
						this.slidePercentcss = parseFloat(this.slideHeight);
						var itemcss = 100/(this.slidesItem * (this.slideSeries?2:1)) + "%"
						slideInnerCSS.height = this.slidePercentcss * this.slidesItem * (this.slideSeries?2:1) + "%";
						slidesCSS.height = itemcss;
					}
					
					this.slideInner.css(slideInnerCSS);
					this.slides.css(slidesCSS);
					break;
				case 2:
					this.slideInner.css({
						'position' : 'relative',
						'zoom' : 1
					});
					this.slides.css({
						'position' : 'absolute',
						'left' : 0,
						'top' : 0,
						'zoom' : 1
					});
					break;
			}
			/*if(this.slideDirection){
			this.slideInner.css({'height': this.slideHeight * this.slides.length,'position':'absolute'});
			}else{
			this.slideInner.css({'width': this.slideWidth * this.slides.length,'position':'absolute'});
			}*/
			//this.slideButs = $(this.slideButs);
			//this.manageControls(this.currentPosition); //定位到默认幻灯
			
			this.slideInner.bind("mouseenter", function () {
				o.zantin = true;
			}).bind("mouseleave", function () {
				o.zantin = false;
			});
			this.shenchen_buts();
			this.bind_but();
			this.toItem(this.currentPosition);
		}
	}
	slide.definedfun = function(i){
		var tabs = this.slideButs_arr;
		var classname = this.slideButs_selectclass;
		if(this.slideButs_selectclass){
			$.each(tabs,function(int,val){	val.removeClass(classname);})
			$(tabs[i]).addClass(classname);
		}
	}