//进度管理
var ProcessManagerClass = /** @class */ (function () {
    function ProcessManagerClass() {
    }
    //注册函数
    ProcessManagerClass.prototype.RegisterFunc = function () {
        Commond.Register(L2C.L2C_PROCESS_VIEW, this.View.bind(this));
        //mode
        Commond.Register(L2C.L2C_PROCESS_MODE_ADD, this.ModeAdd.bind(this));
        Commond.Register(L2C.L2C_PROCESS_MODE_EDIT, this.ModeEdit.bind(this));
        Commond.Register(L2C.L2C_PROCESS_MODE_COLOR, this.ModeColor.bind(this));
        Commond.Register(L2C.L2C_PROCESS_MODE_SWAP_SORT, this.ModeSwapSort.bind(this));
        Commond.Register(L2C.L2C_PROCESS_MODE_STORE, this.ModeStore.bind(this));
        Commond.Register(L2C.L2C_PROCESS_MODE_DELETE, this.ModeDelete.bind(this));
        //link
        Commond.Register(L2C.L2C_PROCESS_LINK_ADD, this.LinkAdd.bind(this));
        Commond.Register(L2C.L2C_PROCESS_LINK_EDIT, this.LinkEdit.bind(this));
        Commond.Register(L2C.L2C_PROCESS_LINK_COLOR, this.LinkColor.bind(this));
        Commond.Register(L2C.L2C_PROCESS_LINK_SWAP_SORT, this.LinkSwapSort.bind(this));
        Commond.Register(L2C.L2C_PROCESS_LINK_STORE, this.LinkStore.bind(this));
        Commond.Register(L2C.L2C_PROCESS_LINK_DELETE, this.LinkDelete.bind(this));
        Commond.Register(L2C.L2C_PROCESS_LINK_USER_CHANGE, this.LinkUserChange.bind(this));
        //work
        Commond.Register(L2C.L2C_PROCESS_WORK_EDIT, this.WorkEdit.bind(this)); //工作编辑
        Commond.Register(L2C.L2C_PROCESS_WORK_STATUS, this.WorkStatus.bind(this)); //改变工作状态
        Commond.Register(L2C.L2C_PROCESS_WORK_SCORE, this.WorkScore.bind(this));
        Commond.Register(L2C.L2C_PROCESS_WORK_CLEAR, this.WorkClear.bind(this));
    };
    //预览
    ProcessManagerClass.prototype.View = function (data) {
        ProcessData.Init(data);
        ProcessPanel.SetDateRange();
        ProcessPanel.CreateProcess();
    };
    //清空工作
    ProcessManagerClass.prototype.WorkClear = function (data) {
        var work = ProcessData.WorkMap[data.Wid];
        $('#content .trWork[lid="' + work.Lid + '"] td').each(function (index, el) {
            var grid = $(el).data('grid');
            if (!grid) {
                return;
            }
            if (work.Date == grid.s) {
                $(el).removeClass().empty();
                if (grid.w >= 6) {
                    $(el).addClass('weekend');
                }
                grid.wid = 0;
                return false;
            }
            return;
        });
        //数据变化
        delete ProcessData.WorkMap[data.Wid];
    };
    //新增流程
    ProcessManagerClass.prototype.LinkAdd = function (data) {
        var removeParentTrWork = false;
        var _prevLid = data.PrevLid;
        //数据变化
        ProcessData.LinkMap[data.LinkSingle.Lid] = data.LinkSingle;
        if (!data.LinkSingle.Children) {
            data.LinkSingle.Children = [];
        }
        if (data.LinkSingle.ParentLid == 0) {
            var mode = ProcessData.ModeMap[data.LinkSingle.Mid];
            if (mode) {
                var prevIndex = ArrayUtil.IndexOfAttr(mode.LinkList, FieldName.Lid, data.PrevLid);
                if (prevIndex > -1) {
                    mode.LinkList.splice(prevIndex + 1, 0, data.LinkSingle);
                    _prevLid = data.PrevLid;
                }
                ProcessPanel.ChangeModeNameMaxHeight(mode);
                //
                //vue会自动处理的,这里可以注释掉了
                /* 	var add = $(ProcessPanel.GetLinkHtml(data.LinkSingle))
                    $('#content .trLink[lid="' + data.PrevLid + '"]').after(add)
                    ProcessPanel.SetLinkData(data.LinkSingle.Lid, add.get(0))
                    //
                    */
            }
        }
        else {
            //is Child
            var parentLink = ProcessData.LinkMap[data.LinkSingle.ParentLid];
            if (data.PrevLid) {
                var prevIndex = ArrayUtil.IndexOfAttr(parentLink.Children, FieldName.Lid, data.PrevLid);
                if (prevIndex > -1) {
                    parentLink.Children.splice(prevIndex + 1, 0, data.LinkSingle);
                    _prevLid = data.PrevLid;
                }
            }
            else {
                //通过 父link '增加子流程' 把link加到最后面
                if (parentLink.Children.length == 0) {
                    //TODO: 父流程work替换成自己子流程的
                    removeParentTrWork = true;
                    // this.GetTrWork(_prevLid).attr('lid',data.LinkSingle.Lid)
                    // console.log("[debug]",this.GetTrWork(data.LinkSingle.Lid))
                    // ProcessPanel.SetWorkData(data.LinkSingle.Lid, this.GetTrWork(data.LinkSingle.Lid).get(0))
                    _prevLid = parentLink.Lid;
                }
                else {
                    _prevLid = parentLink.Children[parentLink.Children.length - 1].Lid;
                }
                parentLink.Children.push(data.LinkSingle);
            }
        }
        if (_prevLid) {
            var add = $(ProcessPanel.GetWorkHtml(data.LinkSingle));
            this.GetTrWork(_prevLid).after(add);
            ProcessPanel.SetWorkData(data.LinkSingle.Lid, add.get(0));
        }
        if (removeParentTrWork) {
            this.GetTrWork(_prevLid).remove();
        }
    };
    //流程名字
    ProcessManagerClass.prototype.LinkEdit = function (data) {
        //数据变化
        var link = ProcessData.LinkMap[data.Lid];
        if (link) {
            ProcessData.LinkMap[link.Lid].Name = data.Name;
            /* 	$('#content .trLink[lid="' + link.Lid + '"] .link').html(
                    ProcessPanel.GetLinkName(link)
                ) */
        }
    };
    //流程颜色
    ProcessManagerClass.prototype.LinkColor = function (data) {
        //数据变化
        var link = ProcessData.LinkMap[data.Lid];
        if (link) {
            link.Color = data.Color;
            // $('#content .trLink[lid="' + data.Lid + '"] .link').attr('class', 'link bg_' + data.Color)
        }
    };
    //改变责任
    ProcessManagerClass.prototype.LinkUserChange = function (data) {
        //数据变化
        var link = ProcessData.LinkMap[data.Lid];
        if (link) {
            link.Uid = data.Uid;
            // $('#content .trLink[lid="' + data.Lid + '"] .duty').html(ProcessPanel.GetLinkUserName(data))
        }
    };
    //交换流程
    ProcessManagerClass.prototype.LinkSwapSort = function (data) {
        //数据变化
        var link0 = ProcessData.LinkMap[data.Swap[0]];
        var link1 = ProcessData.LinkMap[data.Swap[1]];
        if (!link0 || !link1) {
        }
        else {
            var mode = ProcessData.ModeMap[link0.Mid];
            var _linkList = link0.ParentLid ? ProcessData.LinkMap[link0.ParentLid].Children : mode.LinkList;
            var index0 = ArrayUtil.IndexOfAttr(_linkList, FieldName.Lid, link0.Lid);
            var index1 = ArrayUtil.IndexOfAttr(_linkList, FieldName.Lid, link1.Lid);
            if (index0 > -1 && index0 > -1) {
                _linkList.splice.apply(_linkList, [index0, 1].concat(_linkList.splice(index1, 1, link0)));
            }
            //
            /* 	var A = $('#content .trLink[lid="' + link0.Lid + '"]')
                var B = $('#content .trLink[lid="' + link1.Lid + '"]')
                A.before(B)*/
            //#
            var B = this.GetTrWork(link1.Children.length == 0 ? link1.Lid : link1.Children[link1.Children.length - 1].Lid); //获取下面的最后一个
            console.log("[debug]B:", B.attr('lid'));
            if (link0.Children.length == 0) {
                var A = this.GetTrWork(link0.Lid);
                console.log("[debug]", link0.Lid, ":[link0.Lid]");
                B.after(A);
            }
            else {
                var len = link0.Children.length;
                for (var i = 0; i < len; i++) {
                    var linkChild = link0.Children[i];
                    var A = this.GetTrWork(linkChild.Lid);
                    console.log("[debug]", linkChild.Lid, ":[linkChild.Lid]", i);
                    B.after(A);
                    B = A;
                }
            }
        }
    };
    //归档处理
    ProcessManagerClass.prototype.LinkStore = function (data) {
        //在进行状态中
        if (data.Status == LinkStatusField.STORE) {
            var link = ProcessData.LinkMap[data.Lid];
            if (link) {
                if (ProcessData.CheckNumberArray(LinkStatusField.STORE, ProcessFilter.Pack.LinkStatus) == false) {
                    //归档
                    this.DoLinkDelete(link);
                }
                else {
                    link.Status = data.Status;
                    // this.LinkEdit(link)
                }
            }
        }
        else {
            var link = ProcessData.LinkMap[data.Lid];
            if (link) {
                link.Status = data.Status;
                // this.LinkEdit(link)
            }
        }
    };
    //删除流程
    ProcessManagerClass.prototype.LinkDelete = function (data) {
        //数据变化
        var link = ProcessData.LinkMap[data.Lid];
        if (link) {
            this.DoLinkDelete(link);
        }
    };
    ProcessManagerClass.prototype.DoLinkDelete = function (link) {
        var mode = ProcessData.ModeMap[link.Mid];
        var _linkList = link.ParentLid ? ProcessData.LinkMap[link.ParentLid].Children : mode.LinkList;
        ArrayUtil.RemoveByAttr(_linkList, FieldName.Lid, link.Lid);
        //删除工作
        $.each(ProcessData.WorkMap, function (k, v) {
            if (v.Lid != link.Lid) {
                return;
            }
            delete ProcessData.WorkMap[v.Wid];
        });
        delete ProcessData.LinkMap[link.Lid];
        //
        ProcessPanel.ChangeModeNameMaxHeight(mode);
        //
        // $('#content .trLink[lid="' + link.Lid + '"]').remove()
        if (link.ParentLid > 0) {
            //父link恢复回来
            var parentLink = ProcessData.LinkMap[link.ParentLid];
            if (parentLink.Children.length == 0) {
                var addParent = $(ProcessPanel.GetWorkHtml(parentLink));
                this.GetTrWork(link.Lid).after(addParent);
                ProcessPanel.SetWorkData(parentLink.Lid, addParent.get(0));
            }
        }
        this.GetTrWork(link.Lid).remove();
        if (link && link.Children.length > 0) {
            var len = link.Children.length;
            for (var i = 0; i < len; i++) {
                var linkChild = link.Children[i];
                this.GetTrWork(linkChild.Lid).remove();
            }
        }
    };
    /**获取lid对应的那一行 */
    ProcessManagerClass.prototype.GetTrWork = function () {
        var lids = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            lids[_i] = arguments[_i];
        }
        var names = [];
        var len = lids.length;
        for (var i = 0; i < len; i++) {
            var lid = lids[i];
            names.push("#content .trWork[lid=\"" + lid + "\"]");
        }
        return $(names.join(','));
    };
    /**改变工作 状态 :工作 完成 延期 等待 优化 请假*/
    ProcessManagerClass.prototype.WorkStatus = function (data) {
        this.WorkEdit(data);
    };
    /**工作编辑 */
    ProcessManagerClass.prototype.WorkEdit = function (data) {
        //数据变化
        ProcessData.WorkMap[data.Wid] = data;
        $('#content .trWork[lid="' + data.Lid + '"] td').each(function (index, el) {
            var grid = $(el).data('grid');
            if (!grid) {
                return;
            }
            if (data.Date == grid.s) {
                grid.wid = data.Wid;
                ProcessPanel.ShowWorkGrid(el, grid, data);
                return false;
            }
            return;
        });
    };
    //添加功能
    ProcessManagerClass.prototype.ModeAdd = function (data) {
        data.ModeSingle.LinkList = data.LinkList;
        delete data['LinkList'];
        // ProcessData.LinkMap[data.LinkSingle.Lid] = data.LinkSingle
        var len = data.ModeSingle.LinkList.length;
        for (var i = 0; i < len; i++) {
            var link = data.ModeSingle.LinkList[i];
            if (!link.Children) {
                link.Children = [];
            }
            ProcessData.LinkMap[link.Lid] = link;
            //
            for (var j = 0; j < link.Children.length; j++) {
                var linkChild = link.Children[j];
                if (!linkChild.Children) {
                    linkChild.Children = [];
                }
                ProcessData.LinkMap[linkChild.Lid] = linkChild;
            }
        }
        ProcessData.ModeMap[data.ModeSingle.Mid] = data.ModeSingle;
        if (data.PrevMid > 0) {
            var prevIndex = ArrayUtil.IndexOfAttr(ProcessData.Project.ModeList, FieldName.Mid, data.PrevMid);
            if (prevIndex > -1) {
                ProcessData.Project.ModeList.splice(prevIndex + 1, 0, data.ModeSingle);
            }
        }
        else {
            ProcessData.Project.ModeList.unshift(data.ModeSingle); //加到最前面
        }
        //right
        var add = $(ProcessPanel.GetModeHtmlRight(data.ModeSingle.Mid));
        $('#content .trModeRight[mid="' + data.PrevMid + '"]').after(add);
        add.find('.trWork').each(function () {
            var lid = parseInt($(this).attr('lid'));
            ProcessPanel.SetWorkData(lid, this);
        });
        //#
        ProcessPanel.BindActions();
    };
    //编辑功能
    ProcessManagerClass.prototype.ModeEdit = function (data) {
        //数据变化
        var mode = ProcessData.ModeMap[data.Mid];
        if (mode) {
            mode.Name = data.Name;
            mode.Vid = data.Vid;
            // $('#content .mode[mid="' + mode.Mid + '"]').html(
            // 	ProcessPanel.GetModeName(mode)
            // )
        }
    };
    //功能颜色
    ProcessManagerClass.prototype.ModeColor = function (data) {
        //数据变化
        var mode = ProcessData.ModeMap[data.Mid];
        if (mode) {
            ProcessData.ModeMap[data.Mid].Color = data.Color;
            // $('#content .mode[mid="' + data.Mid + '"]').attr('class', 'mode bg_' + data.Color)
        }
    };
    //功能交换
    ProcessManagerClass.prototype.ModeSwapSort = function (data) {
        var _a;
        //数据变化
        var mode0 = ProcessData.ModeMap[data.Swap[0]];
        var mode1 = ProcessData.ModeMap[data.Swap[1]];
        if (!mode0 || !mode1) {
        }
        else {
            var project = ProcessData.Project;
            var index0 = ArrayUtil.IndexOfAttr(project.ModeList, FieldName.Mid, mode0.Mid);
            var index1 = ArrayUtil.IndexOfAttr(project.ModeList, FieldName.Mid, mode1.Mid);
            if (index0 > -1 && index0 > -1) {
                (_a = project.ModeList).splice.apply(_a, [index0, 1].concat(project.ModeList.splice(index1, 1, mode0)));
            }
            /* //left
            var A = $('#content .mode[mid="' + data.Swap[0] + '"]').parent()
            // var AN = A.next()
            var B = $('#content .mode[mid="' + data.Swap[1] + '"]').parent()
            // var BN = B.next()
            A.before(B)
            // A.before(AN)
            //right
            var A = $('#content .trModeRight[mid="' + data.Swap[0] + '"]')
            // var AN = A.next()
            var B = $('#content .trModeRight[mid="' + data.Swap[1] + '"]')
            // var BN = B.next()
            A.before(B)
            // A.before(AN)
            */
        }
    };
    //归档处理
    ProcessManagerClass.prototype.ModeStore = function (data) {
        if (data.Status == ModeStatusField.STORE) { //归档 => 进行中
            var mode = ProcessData.ModeMap[data.Mid];
            if (mode) {
                if (ProcessData.CheckNumberArray(ModeStatusField.STORE, ProcessFilter.Pack.ModeStatus) == false) {
                    //仅显示`进行中`, 则删除
                    this.DoModeDelete(mode);
                }
                else { //设置为归档效果
                    mode.Status = data.Status;
                    // this.ModeEdit(mode)
                }
            }
        }
        else { //归档 => 进行中
            var mode = ProcessData.ModeMap[data.Mid];
            if (mode) {
                mode.Status = data.Status;
                // this.ModeEdit(mode)
            }
        }
    };
    //删除功能
    ProcessManagerClass.prototype.ModeDelete = function (data) {
        var mode = ProcessData.ModeMap[data.Mid];
        if (mode) {
            this.DoModeDelete(mode);
        }
    };
    ProcessManagerClass.prototype.DoModeDelete = function (mode) {
        ArrayUtil.RemoveByAttr(ProcessData.Project.ModeList, FieldName.Mid, mode.Mid);
        delete ProcessData.ModeMap[mode.Mid];
        $.each(mode.LinkList, function (k, link) {
            //删除工作
            $.each(ProcessData.WorkMap, function (k, v) {
                if (v.Lid != link.Lid) {
                    return;
                }
                delete ProcessData.WorkMap[v.Wid];
            });
            //删除流程
            delete ProcessData.LinkMap[link.Lid];
        });
        //
        /* var del = $('#content .mode[mid="' + mode.Mid + '"]').parent()
        // del.next().remove()
        del.remove() */
        var del = $('#content .trModeRight[mid="' + mode.Mid + '"]');
        // del.next().remove()
        del.remove();
    };
    //设置评分
    ProcessManagerClass.prototype.WorkScore = function (data) {
        //数据变化
        // if (data.Score == 0) {
        // delete ProcessData.ScoreMap[data.Wid]
        // } else {
        ProcessData.ScoreMap[data.Wid] = data;
        // }
        var work = ProcessData.WorkMap[data.Wid];
        this.WorkEdit(work);
        NoticeManager.ScoreEdit(data);
    };
    /**
     * @data PublishSingle
     */
    ProcessManagerClass.prototype.PublishEdit = function (data) {
        $.each(ProcessPanel.DateList.list, function (k, v) {
            if (data.DateLine != v.s) {
                return true;
            }
            var pub = $('#content .title td:eq(' + (k + 3) + ')');
            pub.find('.stroke').remove();
            pub.append('<div class="stroke sk_' + data.Genre + '" date_line="' + data.DateLine + '"></div>');
            return false;
        });
        //数据变化
        // ProcessData.VersionDateLineMap[data.DateLine] = data		//VersionManager中设置了 这里不需要了
    };
    /**
     * @dateLine PublishSingle.DateLine
     */
    ProcessManagerClass.prototype.PublishDelete = function (dateLine) {
        $.each(ProcessPanel.DateList.list, function (k, v) {
            if (dateLine != v.s) {
                return true;
            }
            $('#content .title td:eq(' + (k + 3) + ')').find('.stroke').remove();
            return false;
        });
        //数据变化
        // delete ProcessData.VersionDateLineMap[data.DateLine]
    };
    return ProcessManagerClass;
}());
var ProcessManager = new ProcessManagerClass();
//# sourceMappingURL=ProcessManager.js.map