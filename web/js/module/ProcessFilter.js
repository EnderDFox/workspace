//进度筛选
var ProcessFilterClass = /** @class */ (function () {
    function ProcessFilterClass() {
        //数据包
        this.Pack = {};
        //# Vue
        this.VueUuid = 0;
        this.VuePath = 'process/';
    }
    //初始化
    ProcessFilterClass.prototype.Init = function () {
        //数据初始
        this.PackInit();
        //
        this.InitVue();
    };
    //搜索初始化
    ProcessFilterClass.prototype.PackInit = function () {
        this.Pack.BeginDate = Common.GetDate(-7);
        this.Pack.EndDate = Common.GetDate(31);
        this.Pack.ModeName = '';
        this.Pack.Vid = 0;
        this.Pack.ModeStatus = 0;
        this.Pack.LinkStatus = 0;
        this.Pack.LinkName = '';
        this.Pack.LinkUserName = '';
    };
    //填充Pack
    ProcessFilterClass.prototype.FillPack = function () {
        var self = this;
        var plan = $(this.VueFilter.$el);
        plan.find('input').each(function () {
            self.Pack[this.name] = this.value;
        });
    };
    //设置Pack
    ProcessFilterClass.prototype.SetPack = function (key, val) {
        this.Pack[key] = val;
    };
    //重置Pack
    ProcessFilterClass.prototype.ResetPack = function () {
        var plan = $(this.VueFilter.$el);
        plan.find('input').val('');
        this.PackInit();
    };
    //获取发送给服务器的数据
    ProcessFilterClass.prototype.GetSvrPack = function () {
        var param = {
            'BeginDate': this.Pack.BeginDate,
            'EndDate': this.Pack.EndDate
        };
        return param;
    };
    //绑定事件
    ProcessFilterClass.prototype.BindActions = function () {
        //面板事件
        var self = this;
        var plan = $(this.VueFilter.$el);
        //关闭日期
        plan.unbind().mousedown(function (e) {
            if ($(e.target).attr('class') != 'date') {
                DateTime.HideDate();
            }
            if ($(e.target).attr('class') != 'select') {
                Common.HidePullDownMenu();
            }
        });
        //日期绑定
        plan.find('.date').unbind().click(function () {
            var dom = this;
            DateTime.Open(dom, $(dom).val(), function (date) {
                $(dom).val(date);
            });
        });
        //归档绑定
        plan.find('.select[stype="ModeStatus"],.select[stype="LinkStatus"]').unbind().click(function (e) {
            var dom = this;
            var left = $(this).offset().left; /*- menu.outerWidth() - 2*/
            var top = $(this).offset().top + $(this).outerHeight() + 2;
            var stype = $(this).attr('stype');
            var itemList = [
                { Key: -1, Label: '选择全部' },
                { Key: 0, Label: '进行中的' },
                { Key: 1, Label: '已归档的' },
            ];
            Common.ShowPullDownMenu(left, top, itemList, function (item) {
                $(dom).val(item.Label);
                self.SetPack(stype, item.Key);
            });
        });
        //用户搜索
        plan.find('input[name="linkUserName"]').unbind().bind('input', function () {
            /* var html = ''
            var dom = this
            var sear = $('#searchUser')
            $.each(Data.UserList, function (k, v) {
                if (dom.value == '') {
                    return
                }
                if (v.Name.indexOf(dom.value) == -1) {
                    return
                }
                html += '<li uid="' + v.Uid + '">' + v.Name + '</li>'
            })
            if (html != '') {
                var top = $(dom).offset().top + $(dom).outerHeight()
                var left = $(dom).offset().left
                sear.css({ top: top, left: left }).unbind().delegate('li', 'click', function () {
                    sear.hide()
                    $(dom).val($(this).html())
                }).html(html).show()
            } else {
                sear.hide()
            }
        }).blur(function (this: HTMLInputElement, e) {
            self.SetPack('LinkUid', $.trim(this.value))*/
        });
        //选中效果
        /*  plan.find('input:not([readonly])').focus(function () {
             $(this).select()
         }) */
    };
    ProcessFilterClass.prototype.InitVue = function () {
        var _this = this;
        Loader.LoadVueTemplateList([this.VuePath + "FilterItemTextField", this.VuePath + "FilterItemCheckBox", this.VuePath + "ProcessFilter"], function (tplList) {
            //注册组件
            Vue.component('FilterItemTextField', {
                template: tplList[0],
                props: {
                    item: Object
                },
                data: function () {
                    return {};
                },
                methods: {}
            });
            Vue.component('FilterItemCheckBox', {
                template: tplList[1],
                props: {
                    item: Object
                },
                data: function () {
                    return {};
                },
                methods: {}
            });
            //初始化数据
            var data = {};
            data.beginDate = Common.GetDate(-7);
            data.endDate = Common.GetDate(31);
            data.vid = null;
            data.modeName = { Uuid: _this.VueUuid++, Name: '功能名称', InputName: 'ModeName', Placeholder: '输入功能名称', Value: '', Prompt: '', };
            data.modeStatus = {
                Uuid: _this.VueUuid++, Name: '功能归档', InputName: 'ModeStatus', ShowLen: -1, ShowLenMin: 0, ShowLenMax: 0,
                Inputs: [
                    { Value: '0', Label: '进行中的', Checked: false, Title: '', },
                    { Value: '1', Label: '已归档的', Checked: false, Title: '', },
                ]
            };
            data.linkName = { Uuid: _this.VueUuid++, Name: '流程名称', InputName: 'LinkName', Placeholder: '输入流程名称', Value: '', Prompt: '', };
            data.linkUserName = { Uuid: _this.VueUuid++, Name: '流程负责', InputName: 'LinkUserName', Placeholder: '输入负责人', Value: '小 狐', Prompt: '可以输入多个值, 用`空格`分割', };
            data.linkStatus = {
                Uuid: _this.VueUuid++, Name: '流程归档', InputName: 'LinkStatus', ShowLen: -1, ShowLenMin: 0, ShowLenMax: 0,
                Inputs: [
                    { Value: '0', Label: '进行中的', Checked: false, Title: '', },
                    { Value: '1', Label: '已归档的', Checked: false, Title: '', },
                ]
            };
            var oldLeft;
            //初始化 VueFilter 
            _this.VueFilter = new Vue({
                template: tplList[2],
                data: data,
                methods: {
                    onInputChange: function (e, item) {
                        console.log("[info]", e.type, ":[e.type]");
                        switch (item.InputName) {
                            case _this.VueFilter.linkUserName.InputName:
                                var dom = e.target;
                                //### 获取当前所选的关键字
                                // console.log("[info]", dom.selectionStart, ":[dom.selectionStart]")
                                var selectStart = dom.selectionStart;
                                var selectEnd = dom.selectionStart;
                                var wordArr = [];
                                //  = dom.value.charAt(selectStart)
                                while (selectStart > 0) {
                                    var char = dom.value.charAt(selectStart - 1);
                                    if (char && char != ' ') {
                                        wordArr.unshift(char);
                                        selectStart--;
                                    }
                                    else {
                                        break;
                                    }
                                }
                                while (selectEnd < dom.value.length) {
                                    var char = dom.value.charAt(selectEnd);
                                    if (char && char != ' ') {
                                        wordArr.push(char);
                                        selectEnd++;
                                    }
                                    else {
                                        break;
                                    }
                                }
                                var word = wordArr.join('');
                                //### menu data
                                if (!word) {
                                    Common.HidePullDownMenu();
                                    return;
                                }
                                var itemList = [];
                                var len = Data.UserList.length;
                                for (var i = 0; i < len; i++) {
                                    var user = Data.UserList[i];
                                    if (user.Name.indexOf(word) == -1) {
                                        continue;
                                    }
                                    itemList.push({ Key: user.Uid, Label: user.Name });
                                }
                                //### show menu
                                var left;
                                if (e['pageX']) {
                                    left = e['pageX'];
                                    oldLeft = left;
                                }
                                else {
                                    left = oldLeft || $(dom).offset().left;
                                }
                                var top = $(dom).offset().top + $(dom).outerHeight();
                                Common.ShowPullDownMenu(left, top, itemList, function (menuItem) {
                                    console.log("[info]", menuItem.Label, ":[item.Label]", "in user menu", word, ":[word]");
                                    var before = item.Value.toString().substring(0, selectStart);
                                    var after = item.Value.toString().substring(selectEnd, item.Value.length);
                                    console.log("[info]", before, ":[before]", after, ":[after]");
                                    item.Value = before + menuItem.Label + after;
                                    $(dom).select();
                                    // $(dom).val(item.Label)
                                    // self.SetPack(stype, item.Key)
                                });
                                break;
                        }
                    },
                    onSubmit: function () {
                        console.log("[log]", _this.VueFilter.beginDate.toString(), _this.VueFilter.endDate.toString());
                        var vids = _this.GetCheckBoxValues(_this.VueFilter.vid.Inputs);
                        console.log("[info]", vids, ":[vids]");
                        var modeNames = _this.GetTextFieldValues(_this.VueFilter.modeName);
                        console.log("[info]", modeNames, ":[modeNames]");
                        //## backup
                        // this.FillPack()
                        /*  Main.Over(() => {
                             ProcessPanel.Index()
                        }) */
                        // ProcessPanel.HideMenu()
                        // this.HideFilter(true)
                    },
                    onClose: function () {
                        _this.HideFilter(true);
                    },
                }
            }).$mount();
            //放入html
            Common.InsertBeforeDynamicDom(_this.VueFilter.$el);
            //绑定事件
            _this.BindActions();
        });
    };
    //显示面板
    ProcessFilterClass.prototype.ShowFilter = function (o, e) {
        var self = this;
        var plan = $(this.VueFilter.$el);
        var top = $(o).offset().top + 50;
        var left = $(o).offset().left - plan.outerWidth();
        plan.css({ top: top, left: left }).show();
        //vue data
        //初始化data
        var item;
        //version vid
        item = {
            Uuid: this.VueUuid++, Name: '功能版本', InputName: 'Vid', ShowLen: VersionManager.ListShowMax, ShowLenMin: VersionManager.ListShowMax, ShowLenMax: 20,
            Inputs: []
        };
        // var len = Math.min(ProcessData.VersionList.length, VersionManager.ListShowMax)
        var len = ProcessData.VersionList.length;
        for (var i = 0; i < len; i++) {
            var version = ProcessData.VersionList[i];
            item.Inputs.push({ Value: version.Vid, Label: version.Ver, Checked: false, Title: VersionManager.GetVersionFullname(version), });
        }
        this.VueFilter.vid = item;
        //版本刷新 每次打开时刷新一下版本
        var oldVid = this.Pack.Vid;
        if (oldVid > 0) {
            var oldVidLabel = null;
            var len = Math.min(ProcessData.VersionList.length, VersionManager.ListShowMax);
            for (var i = 0; i < len; i++) {
                var version = ProcessData.VersionList[i];
                if (oldVid == version.Vid) {
                    oldVidLabel = VersionManager.GetVersionFullname(version).toString();
                }
            }
            if (oldVidLabel == null) {
                //old vid发生变化, 需要重设
                this.SetPack('Vid', 0);
                plan.find('.select[stype="Vid"]').val("版本号");
            }
            else {
                //全名有可能在版本编辑中变化了,这里需要重新设置
                plan.find('.select[stype="Vid"]').val(oldVidLabel);
            }
        }
        //版本 绑定input打开menu 每次打开时刷新一下版本
        plan.find('.select[stype="Vid"]').unbind().click(function (e) {
            var dom = this;
            var left = $(this).offset().left;
            var top = $(this).offset().top + $(this).outerHeight() + 2;
            //
            var itemList = [{ Key: 0, Label: '空' }];
            var len = Math.min(ProcessData.VersionList.length, 10);
            for (var i = 0; i < len; i++) {
                var version = ProcessData.VersionList[i];
                var item = { Key: parseInt(version.Vid.toString()), Label: VersionManager.GetVersionFullname(version).toString() };
                itemList.push(item);
            }
            //
            Common.ShowPullDownMenu(left, top, itemList, function (item) {
                if (item.Key == 0) {
                    $(dom).val("版本号");
                }
                else {
                    $(dom).val(item.Label);
                }
                self.SetPack('Vid', item.Key);
            });
        });
        //
    };
    ProcessFilterClass.prototype.HideFilter = function (fade) {
        if (this.VueFilter) {
            if (fade === void 0) {
                fade = true;
            }
            if (fade) {
                $(this.VueFilter.$el).fadeOut(Config.FadeTime);
            }
            else {
                $(this.VueFilter.$el).hide();
            }
        }
        Common.HidePullDownMenu();
    };
    //得到checkbox全部值
    ProcessFilterClass.prototype.GetCheckBoxValues = function (inputs) {
        var vals = [];
        var len = inputs.length;
        for (var i = 0; i < len; i++) {
            var input = inputs[i];
            if (input.Checked) {
                vals.push(parseInt(input.Value.toString()));
            }
        }
        return vals;
    };
    //得到textField全部值
    ProcessFilterClass.prototype.GetTextFieldValues = function (item) {
        var val = item.Value.toString();
        val = val.trim();
        var vals = val.split(' ');
        for (var i = vals.length - 1; i >= 0; i--) {
            if (vals[i] == "") {
                vals.splice(i, 1);
            }
        }
        return vals;
    };
    return ProcessFilterClass;
}());
//
var ProcessFilter = new ProcessFilterClass();
//# sourceMappingURL=ProcessFilter.js.map