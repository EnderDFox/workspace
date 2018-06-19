//扩展类
$.fn.extend({
    //获取css left 数字值
    x: function (this: JQuery<HTMLElement>, vx) {
        if (vx == undefined || vx == null) {
            return this.position().left
        } else {
            this.css('left', vx + "px")
            return this;
        }
    },
    y: function (this: JQuery<HTMLElement>, vy) {
        if (vy == undefined || vy == null) {
            return this.position().top
        } else {
            this.css('top', vy + "px")
            return this;
        }
    },
    xy: function (this: JQuery<HTMLElement>, vx, vy) {
        if (vx == undefined || vx == null) {
            return { x: this.position().left, y: this.position().top }
        } else {
            this.css({ 'left': vx + 'px', 'top': vy + 'px' })
            return this;
        }
    },
    isShow: function (this: JQuery<HTMLElement>) {
        return this.is(":visible")
    },
    isVisible: function (this: JQuery<HTMLElement>) {
        return this.is(":visible")
    },
    //修正位置
    adjust: function (this: JQuery<HTMLElement>, offsetY: number) {
        var eleW = this.outerWidth()
        var eleH = this.outerHeight()
        var eleLeft = this.offset().left
        var eleTop = this.offset().top
        var eleRight = eleLeft + eleW
        var eleBottom = eleTop + eleH
        var winLeft = $(window).scrollLeft()
        var winTop = $(window).scrollTop()
        var winRight = winLeft + $(window).innerWidth()
        var winBottom = winTop + $(window).innerHeight()
        if (eleLeft < winLeft) {
            this.x(winLeft + 5)
        } else if (eleRight > winRight) {
            var x = Math.min(eleRight, winRight) - eleW + offsetY
            this.x(x)
        }
        if (eleTop < winTop) {
            this.y(winTop + 5)
        } else if (eleBottom > winBottom) {
            var y = Math.min(eleBottom, winBottom) - eleH + offsetY
            this.y(y)
        }
        return this
    },
    //冻结窗口
    freezeTop: function (this: JQuery<HTMLElement>) {
        //Fixed issue #按住shift滚动鼠标,会横向滚动表格,但标题(freezeTop)没有跟着滚动
        //注意:shift+鼠标滚动  仅chrome内核是横向滚动 ,其它浏览器都是翻页,
        //scroll事件太频繁,导致IE浏览器下很卡,chrome本身性能高,不卡但也有性能隐患, 所以需要 setTimeout 来处理
        //------
        var $dom: JQuery<HTMLElement> = this
        var win = $(window);
        //方案三
        var timeoutId = -1
        var prevScrollX = win.scrollLeft()
        var resetFixed = function () {
            $dom.css({
                position: 'fixed',
                'left': -win.scrollLeft(),
                'top': 0
            })
        }
        win.unbind().scroll(function (e) {
            var currScrollX = win.scrollLeft()
            if (currScrollX != prevScrollX) {
                $dom.css({
                    'position': 'absolute',
                    'left': 0,
                    'top': win.scrollTop()
                })
                if (timeoutId >= 0) {
                    clearTimeout(timeoutId)
                }
                timeoutId = setTimeout(resetFixed, 1000)
            } else {
                if (timeoutId >= 0) {
                    clearTimeout(timeoutId)
                    timeoutId = -1
                    resetFixed()
                }
            }
            prevScrollX = currScrollX
        }).resize(function () {
            $dom.css({ 'left': -$(this).scrollLeft() })
        })
        //------
        ///*方案二 IE下拖动时反映不及时,感觉很不舒服,所以IE最好仍然用mousedown来做,判断IE比较麻烦,先不改了
        /*var timeoutId = -1
        $(window).unbind().scroll(function (e) {
            if (timeoutId > 0) {
                clearTimeout(timeoutId)
            }
            var timeoutId = setTimeout(function () {
                //window窗口滚动
                var left = -$(this).scrollLeft()
                // console.log("left:",left)
                $dom.css({'left': -$(this).scrollLeft()})
            }, 25)
        })*/
        //方案一
        /*$(window).unbind().mousedown(function(e){
            //检查
            if(e.target != document && e.target.localName != 'html'){
                return true
            }
            //上下滑块
            if(e.clientX > $(this).innerWidth()){

            }
            //左右滑块
            if(e.clientY + 10 > $(this).innerHeight()){
                $dom.css({'position':'absolute','left':0,'top':$(this).scrollTop()})
                $(this).mouseup(function(){
                    $dom.css({'position':'fixed','left':-$(this).scrollLeft(),'top':0})
                    $(this).unbind('mouseup')
                })
            }

        })*/
        /*  $(window).resize(function(){
             $dom.css({'left':-$(this).scrollLeft()})
         }) */
    }
})
