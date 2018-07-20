/** 管理项目 部门 职位 权限 */
var ProjectEditPageIndex;
(function (ProjectEditPageIndex) {
    ProjectEditPageIndex[ProjectEditPageIndex["Department"] = 1] = "Department";
    ProjectEditPageIndex[ProjectEditPageIndex["Position"] = 2] = "Position";
    ProjectEditPageIndex[ProjectEditPageIndex["User"] = 3] = "User";
})(ProjectEditPageIndex || (ProjectEditPageIndex = {}));
/**部门下拉列表可用性 */
var DeptDropdownItemEnabled;
(function (DeptDropdownItemEnabled) {
    DeptDropdownItemEnabled[DeptDropdownItemEnabled["ENABLED"] = 0] = "ENABLED";
    DeptDropdownItemEnabled[DeptDropdownItemEnabled["DISABLED"] = 2] = "DISABLED";
    DeptDropdownItemEnabled[DeptDropdownItemEnabled["HIDE"] = 4] = "HIDE";
})(DeptDropdownItemEnabled || (DeptDropdownItemEnabled = {}));
var ManagerManagerClass = /** @class */ (function () {
    function ManagerManagerClass() {
        this.VuePath = "manager/";
    }
    ManagerManagerClass.prototype.Init = function () {
        this.Data = ManagerData;
        UrlParam.Callback = this.UrlParamCallback.bind(this);
        this.InitVue(this.UrlParamCallback.bind(this));
    };
    ManagerManagerClass.prototype.UrlParamCallback = function () {
        Common.PopupHideAll();
        var pid = UrlParam.Get(URL_PARAM_KEY.PID, 0);
        var proj = this.Data.GetProjectListHasAuth().FindOfAttr(FieldName.PID, pid);
        if (proj) {
            this.ShowProjectEdit();
        }
        else {
            this.ShowProjectList();
        }
    };
    ManagerManagerClass.prototype.InitVue = function (cb) {
        var _this = this;
        Loader.LoadVueTemplateList([this.VuePath + "NavbarComp", this.VuePath + "DeptDropdownComp"], function (tplList) {
            //注册组件
            Vue.component('NavbarComp', {
                template: tplList[0],
                props: {},
                data: function () {
                    return {
                        currUser: _this.Data.CurrUser,
                    };
                },
                methods: {
                    OnShowProjList: function () {
                        if (_this.VueProjectEdit) {
                            $(_this.VueProjectEdit.$el).remove();
                        }
                        UrlParam.RemoveAll().Reset();
                        _this.ShowProjectList();
                    },
                }
            });
            Vue.component('DeptDropdownComp', {
                template: tplList[1],
                props: {
                    // deptList: Array,
                    btnId: String,
                    btnLabel: String,
                    btnDisabled: Boolean,
                    CheckItemCb: Function,
                    ItemStyle: Function,
                },
                data: function () {
                    return {
                        deptList: _this.Data.CurrProj.DeptTree,
                    };
                },
                methods: {
                    deptOption: _this.DeptOption.bind(_this),
                    OnBtnClick: function () {
                        this.deptList = TreeUtil.Map(ManagerData.CurrProj.DeptTree);
                    },
                }
            });
            //#
            cb();
        });
    };
    /**没有权限访问的页面 通常是通过url进入的 */
    ManagerManagerClass.prototype.ShowNoAuthPage = function () {
        //TODO:
    };
    ManagerManagerClass.prototype.ShowProjectList = function () {
        var _this = this;
        //
        Loader.LoadVueTemplate(this.VuePath + "ProjectList", function (tpl) {
            var vue = new Vue({
                template: tpl,
                data: {
                    auth: _this.Data.MyAuth,
                    currUser: _this.Data.CurrUser,
                    newName: '',
                    projectList: _this.Data.GetProjectListHasAuth(),
                },
                methods: {
                    GetDateStr: function (timeStamp) {
                        return Common.TimeStamp2DateStr(timeStamp);
                    },
                    GetProjMaster: function (proj) {
                        if (proj.MasterUid > 0) {
                            return _this.Data.UserDict[proj.MasterUid].Name;
                        }
                        else {
                            return '空';
                        }
                    },
                    OnEditMaster: function (proj, user) {
                        if (proj.MasterUid == _this.Data.CurrUser.Uid && !_this.Data.MyAuth[AUTH.PROJECT_LIST]) {
                            //是这个项目的负责人,并且不是超管
                            Common.ConfirmWarning("\u4F60\u662F\u8FD9\u4E2A\u9879\u76EE\u73B0\u5728\u7684\u8D1F\u8D23\u4EBA <br/>\u5982\u679C\u4FEE\u6539\u8D1F\u8D23\u4EBA,\u4F60\u5C06\u5931\u53BB\u8FD9\u4E2A\u9879\u76EE\u7684\u7BA1\u7406\u6743\u9650", "\u8981\u5C06'\u8D1F\u8D23\u4EBA'\u4FEE\u6539\u4E3A'" + user.Name + "'\u5417?", function () {
                                proj.MasterUid = user.Uid;
                                _this.Data.RemoveMyAuth(AUTH.PROJECT_EDIT);
                            });
                        }
                        else {
                            proj.MasterUid = user.Uid;
                        }
                    },
                    GetProjAllDeptLength: function (proj) {
                        return TreeUtil.Length(proj.DeptTree);
                    },
                    GetProjAllPosnLength: function (proj) {
                        return _this.Data.GetProjAllPosnList(proj).length;
                    },
                    GetProjUserLength: function (proj) {
                        return proj.UserList.length;
                    },
                    GetProjUserListTitle: function (proj) {
                        var userNameArr = [];
                        for (var i = 0; i < proj.UserList.length; i++) {
                            var user = proj.UserList[i];
                            userNameArr.push(user.Name);
                        }
                        return userNameArr.join(",");
                    },
                    onEditName: function (e, proj, index) {
                        var newName = e.target.value.trim();
                        if (!newName) {
                            e.target.value = proj.Name;
                            return;
                        }
                        if (newName != proj.Name) {
                            if (_this.Data.ProjectList.IndexOfAttr(FieldName.Name, newName) > -1) {
                                Common.AlertError("\u5373\u5C06\u628A\u9879\u76EE \"" + proj.Name + "\" \u6539\u540D\u4E3A \"" + newName + "\" <br/><br/>\u4F46\u9879\u76EE\u540D\u79F0 \"" + newName + "\" \u5DF2\u7ECF\u5B58\u5728");
                                e.target.value = proj.Name;
                                return;
                            }
                            Common.ConfirmWarning("\u5373\u5C06\u628A\u9879\u76EE \"" + proj.Name + "\" \u6539\u540D\u4E3A \"" + newName + "\"", null, function () {
                                proj.Name = newName;
                            }, function () {
                                e.target.value = proj.Name;
                            });
                        }
                    },
                    onClose: function () {
                    },
                    onShowDepartmentList: function (proj, index) {
                        UrlParam.Set(URL_PARAM_KEY.PID, proj.Pid).Set(URL_PARAM_KEY.PAGE, ProjectEditPageIndex.Department).Reset();
                        _this.ShowProjectEdit();
                    },
                    onShowPosnList: function (proj, index) {
                        UrlParam.Set(URL_PARAM_KEY.PID, proj.Pid).Set(URL_PARAM_KEY.PAGE, ProjectEditPageIndex.Position).Reset();
                        _this.ShowProjectEdit();
                    },
                    onShowUserList: function (proj, index) {
                        UrlParam.Set(URL_PARAM_KEY.PID, proj.Pid).Set(URL_PARAM_KEY.PAGE, ProjectEditPageIndex.User).Reset();
                        _this.ShowProjectEdit();
                    },
                    onDel: function (e, proj, index) {
                        Common.ConfirmDelete(function () {
                            _this.VueProjectList.projectList.splice(index, 1);
                        }, "\u5373\u5C06\u5220\u9664\u9879\u76EE \"" + proj.Name + "\"");
                    },
                    onAdd: function () {
                        var newName = _this.VueProjectList.newName.toString().trim();
                        if (!newName) {
                            Common.AlertError("\u9879\u76EE\u540D\u79F0 " + newName + " \u4E0D\u53EF\u4EE5\u4E3A\u7A7A");
                            return;
                        }
                        if (_this.Data.ProjectList.IndexOfAttr(FieldName.Name, newName) > -1) {
                            Common.AlertError("\u9879\u76EE\u540D\u79F0 " + newName + " \u5DF2\u7ECF\u5B58\u5728");
                            return;
                        }
                        _this.Data.ProjectList.push({
                            Pid: _this.Data.ProjectList[_this.VueProjectList.projectList.length - 1].Pid + 1,
                            Name: _this.VueProjectList.newName.toString(),
                            MasterUid: 0, UserList: [],
                            CreateTime: new Date().getTime(),
                        });
                        _this.VueProjectList.newName = '';
                    }
                },
            }).$mount();
            _this.VueProjectList = vue;
            //#show
            Common.InsertIntoPageDom(vue.$el);
        });
    };
    ManagerManagerClass.prototype.ShowProjectEdit = function () {
        var _this = this;
        var proj = this.Data.GetProjectListHasAuth().FindOfAttr(FieldName.PID, UrlParam.Get(URL_PARAM_KEY.PID));
        this.Data.CurrProj = proj;
        Loader.LoadVueTemplateList([this.VuePath + "ProjectEdit"], function (tplList) {
            var currPage = UrlParam.Get(URL_PARAM_KEY.PAGE, [ProjectEditPageIndex.Department, ProjectEditPageIndex.User]);
            TreeUtil.Every(_this.Data.CurrProj.DeptTree, function (dept) {
                dept.Pid = proj.Pid;
                return true;
            });
            //
            var vue = new Vue({
                template: tplList[0],
                data: {
                    auth: _this.Data.MyAuth,
                    currUser: _this.Data.CurrUser,
                    currPage: currPage,
                    projectList: _this.Data.GetProjectListHasAuth(),
                    project: proj,
                    dpTree: _this.Data.CurrProj.DeptTree,
                    newName: proj ? proj.Name : '',
                },
                methods: {
                    onShowCurrProj: function () {
                        if (_this.VueProjectEdit.projectList.length == 1) {
                            //仅在只有一个项目 可以用, 多个项目就是下拉列表了
                            UrlParam.Set(URL_PARAM_KEY.PAGE, ProjectEditPageIndex.Department).Reset();
                            _this.ShowProjectEdit();
                        }
                    },
                    onShowProj: function (proj, index) {
                        UrlParam.Set(URL_PARAM_KEY.PID, proj.Pid).Set(URL_PARAM_KEY.PAGE, ProjectEditPageIndex.Department).Reset();
                        _this.ShowProjectEdit();
                    },
                    onShowPage: function (page) {
                        UrlParam.Set(URL_PARAM_KEY.PAGE, page).Remove(URL_PARAM_KEY.DID).Remove(URL_PARAM_KEY.FKEY).Reset();
                        _this.VueProjectEdit.currPage = page;
                        _this.SwitchProjectEditPageContent();
                    },
                },
            }).$mount();
            _this.VueProjectEdit = vue;
            //#show
            Common.InsertIntoPageDom(vue.$el);
            _this.SwitchProjectEditPageContent();
        });
    };
    ManagerManagerClass.prototype.SwitchProjectEditPageContent = function () {
        var currPage = UrlParam.Get(URL_PARAM_KEY.PAGE, [ProjectEditPageIndex.Department, ProjectEditPageIndex.User]);
        switch (currPage) {
            case ProjectEditPageIndex.User:
                this.ShowUserList(this.VueProjectEdit.project);
                break;
            case ProjectEditPageIndex.User:
                this.ShowPositionList();
                break;
            case ProjectEditPageIndex.Department:
                this.ShowDepartmentList(this.VueProjectEdit.project);
                break;
        }
    };
    ManagerManagerClass.prototype.ShowDepartmentList = function (proj) {
        var _this = this;
        this.VueProjectEdit.currPage = ProjectEditPageIndex.Department;
        Loader.LoadVueTemplateList([this.VuePath + "DeptList", this.VuePath + "DeptListComp"], function (tplList) {
            Vue.component('DeptListComp', {
                template: tplList[1],
                props: {
                    deptTree: Array,
                    index: Number,
                },
                data: function () {
                    return {
                        auth: _this.Data.MyAuth,
                        allDepartmentList: _this.Data.CurrProj.DeptTree,
                    };
                },
                methods: {
                    GetDeptAllPosnList: _this.Data.GetDeptAllPosnList.bind(_this.Data),
                    GetDeptUserList: _this.Data.GetDeptUserList.bind(_this.Data),
                    GetDeptAllUserList: _this.Data.GetDeptAllUserList.bind(_this.Data),
                    CheckCanMoveParentDp: _this.CheckCanMoveParentDp.bind(_this),
                    CheckSortDown: _this.CheckSortDown.bind(_this),
                    CheckSortUp: _this.CheckSortUp.bind(_this),
                    onEditName: function (e, dp, i0) {
                        var newName = e.target.value;
                        dp.Name = newName;
                    },
                    onAddChild: function (parentDp, i0) {
                        var dp = {
                            Did: _this.Data.NewDepartmentUuid, Name: "", Depth: parentDp.Depth + 1, Children: [], PositionList: [
                                { Posid: _this.Data.NewPositionUuid, Did: _this.Data.NewDepartmentUuid, Name: "", AuthorityList: [] },
                            ],
                            Fid: parentDp.Did
                        };
                        _this.Data.NewDepartmentUuid++;
                        _this.Data.NewPositionUuid++;
                        _this.Data.DeptDict[dp.Did] = dp;
                        parentDp.Children.push(dp);
                    },
                    DeptDropdownCheckItemCb: function (dept, deptDropdown) {
                        if (deptDropdown.Sort == 0) {
                            return DeptDropdownItemEnabled.HIDE;
                        }
                        else if (!_this.CheckCanMoveParentDp(dept, deptDropdown)) {
                            return DeptDropdownItemEnabled.DISABLED;
                        }
                        else {
                            return DeptDropdownItemEnabled.ENABLED;
                        }
                    },
                    DeptDropdownItemStyleCb: function (dept, deptDropdown) {
                        if (dept.Did == deptDropdown.Did) {
                            return [{ 'background-color': '#FFFF00' }];
                        }
                        else {
                            return null;
                        }
                    },
                    onEditParentDp: function (dp, parentDp) {
                        if (parentDp == null) {
                            if (dp.Fid == 0) {
                                return; //已经是顶级职位了
                            }
                        }
                        else {
                            if (!_this.CheckCanMoveParentDp(dp, parentDp)) {
                                return;
                            }
                        }
                        //从当前父tree中删除
                        var brothers = _this.Data.GetBrotherDepartmentList(dp);
                        brothers.RemoveByAttr(FieldName.Did, dp.Did);
                        //
                        if (parentDp == null) {
                            //改为顶级部门
                            dp.Fid = 0;
                            dp.Depth = 0;
                            _this.Data.CurrProj.DeptTree.push(dp);
                        }
                        else {
                            //放到其他部门下
                            dp.Fid = parentDp.Did;
                            dp.Depth = parentDp.Depth + 1;
                            parentDp.Children.push(dp);
                        }
                        //子部门的深度改变
                        TreeUtil.Every(dp.Children, function (child, _, __, depthChild) {
                            child.Depth = dp.Depth + depthChild + 1;
                            return true;
                        });
                    },
                    onEditPosition: function (dp, i0) {
                        UrlParam.Set(URL_PARAM_KEY.DID, dp.Did).Reset();
                        _this.ShowPositionList();
                    },
                    onEditUserList: function (dept) {
                        UrlParam.Set(URL_PARAM_KEY.PAGE, ProjectEditPageIndex.User).Set(URL_PARAM_KEY.FKEY, dept.Name).Reset();
                        _this.ShowUserList(proj);
                    },
                    onSortDown: function (e, dp, i0) {
                        if (!_this.CheckSortDown(dp, i0)) {
                            return;
                        }
                        var brothers = _this.Data.GetBrotherDepartmentList(dp);
                        var brotherIndex = ArrayUtil.IndexOfAttr(brothers, FieldName.Did, dp.Did);
                        var brother = brothers[brotherIndex + 1];
                        brothers.splice(brotherIndex, 1);
                        brothers.splice(brotherIndex + 1, 0, dp);
                    },
                    onSortUp: function (e, dp, i0) {
                        if (!_this.CheckSortUp(dp, i0)) {
                            return;
                        }
                        var brothers = _this.Data.GetBrotherDepartmentList(dp);
                        var brotherIndex = ArrayUtil.IndexOfAttr(brothers, FieldName.Did, dp.Did);
                        brothers.splice(brotherIndex, 1);
                        brothers.splice(brotherIndex - 1, 0, dp);
                    },
                    onDel: function (dp, i0) {
                        Common.ConfirmDelete(function () {
                            var brothers = _this.Data.GetBrotherDepartmentList(dp);
                            var brotherIndex = ArrayUtil.IndexOfAttr(brothers, FieldName.Did, dp.Did);
                            brothers.splice(brotherIndex, 1);
                            //
                            delete _this.Data.DeptDict[dp.Did];
                        }, "\u5373\u5C06\u5220\u9664\u90E8\u95E8 \"" + (dp.Name || '空') + "\" \u53CA\u5176\u5B50\u90E8\u95E8<br/>\n                        \u8BE5\u90E8\u95E8\u53CA\u5176\u5B50\u90E8\u95E8\u7684\u6240\u6709\u804C\u4F4D\u90FD\u5C06\u88AB\u5220\u9664");
                    },
                }
            });
            var vue = new Vue({
                template: tplList[0],
                data: {
                    auth: _this.Data.MyAuth,
                    deptTree: _this.Data.CurrProj.DeptTree,
                    allDepartmentList: _this.Data.CurrProj.DeptTree,
                    newName: '',
                },
                methods: {
                    onAdd: function () {
                        var dp = {
                            Did: _this.Data.NewDepartmentUuid, Name: _this.VueDepartmentList.newName.toString(), Depth: 0, Children: [], PositionList: [
                                { Posid: _this.Data.NewPositionUuid, Did: _this.Data.NewDepartmentUuid, Name: _this.VueDepartmentList.newName.toString(), AuthorityList: [] },
                            ],
                            Fid: 0,
                        };
                        _this.VueDepartmentList.newName = '';
                        _this.Data.NewDepartmentUuid++;
                        _this.Data.NewPositionUuid++;
                        _this.Data.DeptDict[dp.Did] = dp;
                        _this.Data.CurrProj.DeptTree.push(dp);
                    },
                },
            }).$mount();
            _this.VueDepartmentList = vue;
            //#show
            Common.InsertIntoDom(vue.$el, _this.VueProjectEdit.$refs.pageContent);
            var _did = UrlParam.Get(URL_PARAM_KEY.DID, 0);
            if (_did && _this.Data.DeptDict[_did]) {
                _this.ShowPositionList();
            }
        });
    };
    ManagerManagerClass.prototype.DeptOption = function (dp) {
        if (dp.Depth == 0) {
            return dp.Name;
        }
        else {
            var rs = '';
            for (var i = 0; i < dp.Depth; i++) {
                rs += '--';
            }
            // rs += '└';
            rs += dp.Name;
            return rs;
        }
    };
    ManagerManagerClass.prototype.CheckSortDown = function (dp, i0) {
        var brothers = this.Data.GetBrotherDepartmentList(dp);
        var brotherIndex = ArrayUtil.IndexOfAttr(brothers, FieldName.Did, dp.Did);
        if (brotherIndex < brothers.length - 1) {
            return true;
        }
        return false;
    };
    ManagerManagerClass.prototype.CheckSortUp = function (dp, i0) {
        var brothers = this.Data.GetBrotherDepartmentList(dp);
        var brotherIndex = ArrayUtil.IndexOfAttr(brothers, FieldName.Did, dp.Did);
        if (brotherIndex > 0) {
            return true;
        }
        return false;
    };
    /**是否可以移动到 目标部门 */
    ManagerManagerClass.prototype.CheckCanMoveParentDp = function (dp, parentDp) {
        if (dp.Did == parentDp.Did) {
            return false;
        }
        if (dp.Fid == parentDp.Did) {
            return false;
        }
        if (this.Data.IsDepartmentChild(dp, parentDp)) {
            return false;
        }
        return true;
    };
    ManagerManagerClass.prototype.ShowPositionList = function () {
        var _this = this;
        var _did = UrlParam.Get(URL_PARAM_KEY.DID, 0);
        var dept = this.Data.DeptDict[_did];
        Loader.LoadVueTemplate(this.VuePath + "PositionList", function (tpl) {
            var vue = new Vue({
                template: tpl,
                data: {
                    auth: _this.Data.MyAuth,
                    allDepartmentList: _this.Data.CurrProj.DeptTree,
                    dp: dept,
                    newName: "",
                },
                methods: {
                    dpFullName: function (dp) {
                        var rs = [];
                        var parentDp = dp;
                        while (parentDp) {
                            if (parentDp.Did == dp.Did) {
                                rs.unshift("<li class=\"active\">" + parentDp.Name + "</li>");
                            }
                            else {
                                rs.unshift("<li>" + parentDp.Name + "</li>");
                            }
                            parentDp = _this.Data.DeptDict[parentDp.Fid];
                        }
                        return "<ol class=\"breadcrumb\">\n                                        " + rs.join("") + "\n                                    </ol>";
                    },
                    /**回到部门列表 */
                    onBackDepartmentList: function () {
                        _this.ShowDepartmentList(_this.Data.GetProjByPid(dept.Pid));
                    },
                    OnDeptChange: function (toDept) {
                        UrlParam.Set(URL_PARAM_KEY.DID, toDept.Did).Reset();
                        _this.ShowPositionList();
                    },
                    onEditName: function (e, pos, index) {
                        var newName = e.target.value;
                        pos.Name = newName;
                    },
                    onEditAuth: function (pos, index) {
                        _this.ShowAuthList(pos);
                    },
                    onEditUserList: function (posn) {
                        UrlParam.Set(URL_PARAM_KEY.PAGE, ProjectEditPageIndex.User).Set(URL_PARAM_KEY.FKEY, posn.Name).Reset();
                        _this.ShowUserList(_this.Data.GetProjByPid(dept.Pid), dept, posn);
                    },
                    CheckSortDown: function (pos, index) {
                        return index < dept.PositionList.length - 1;
                    },
                    CheckSortUp: function (pos, index) {
                        return index > 0;
                    },
                    onSortDown: function (pos, index) {
                        if (index < dept.PositionList.length - 1) {
                            dept.PositionList.splice(index + 1, 0, dept.PositionList.splice(index, 1)[0]);
                        }
                    },
                    onSortUp: function (pos, index) {
                        if (index > 0) {
                            dept.PositionList.splice(index - 1, 0, dept.PositionList.splice(index, 1)[0]);
                        }
                    },
                    onDel: function (e, pos, index) {
                        if (dept.PositionList.length == 1) {
                            Common.AlertError("\u6BCF\u4E2A\u90E8\u95E8\u4E0B\u81F3\u5C11\u8981\u4FDD\u7559\u4E00\u4E2A\u804C\u4F4D");
                        }
                        else {
                            Common.ConfirmDelete(function () {
                                dept.PositionList.splice(index, 1);
                            }, "\u5373\u5C06\u5220\u9664\u804C\u4F4D \"" + (pos.Name || '空') + "\"");
                        }
                    },
                    onAdd: function () {
                        var pos = { Posid: _this.Data.NewPositionUuid++, Did: dept.Did, Name: _this.VuePositionList.newName.toString(), AuthorityList: [], UserList: [] };
                        _this.VuePositionList.newName = '';
                        dept.PositionList.push(pos);
                    },
                },
            }).$mount();
            _this.VuePositionList = vue;
            //#show
            Common.InsertIntoDom(vue.$el, _this.VueProjectEdit.$refs.pageContent);
        });
    };
    ManagerManagerClass.prototype.ShowAuthList = function (pos) {
        var _this = this;
        Loader.LoadVueTemplate(this.VuePath + "AuthList", function (tpl) {
            var checkedDict = {};
            for (var i = 0; i < pos.AuthorityList.length; i++) {
                var auth = pos.AuthorityList[i];
                checkedDict[auth.Authid] = auth;
            }
            var _checkModChecked = function (_, mod) {
                // console.log("[debug]", '_checkAllModSelected')
                for (var i = 0; i < mod.AuthorityList.length; i++) {
                    var auth = mod.AuthorityList[i];
                    if (!checkedDict[auth.Authid]) {
                        return false;
                    }
                }
                return true;
            };
            var vue = new Vue({
                template: tpl,
                data: {
                    auth: _this.Data.MyAuth,
                    pos: pos,
                    authorityModuleList: _this.Data.AuthorityModuleList,
                    checkedChange: false,
                },
                methods: {
                    checkModChecked: _checkModChecked.bind(_this),
                    checkAuthChecked: function (_, auth) {
                        // console.log("[debug] checkAuthSelected", auth.Authid, selectedAuthDict[auth.Authid])
                        return checkedDict[auth.Authid] != null;
                    },
                    onSwitchMod: function (mod) {
                        var allSelected = _checkModChecked(null, mod);
                        for (var i = 0; i < mod.AuthorityList.length; i++) {
                            var auth = mod.AuthorityList[i];
                            if (allSelected) {
                                delete checkedDict[auth.Authid];
                            }
                            else {
                                checkedDict[auth.Authid] = auth;
                            }
                        }
                        _this.VueAuthList.checkedChange = !_this.VueAuthList.checkedChange;
                    },
                    onSwitchAuth: function (e, auth) {
                        if (checkedDict[auth.Authid]) {
                            delete checkedDict[auth.Authid];
                        }
                        else {
                            checkedDict[auth.Authid] = auth;
                        }
                        // auth.CheckedChange = !auth.CheckedChange
                        _this.VueAuthList.checkedChange = !_this.VueAuthList.checkedChange;
                    },
                    onSave: function () {
                        pos.AuthorityList.splice(0, pos.AuthorityList.length);
                        for (var authIdStr in checkedDict) {
                            pos.AuthorityList.push(checkedDict[authIdStr]);
                        }
                        _this.VueAuthList.$el.remove();
                        _this.VueAuthList = null;
                    },
                    onReset: function () {
                        for (var authIdStr in checkedDict) {
                            delete checkedDict[authIdStr];
                        }
                        for (var i = 0; i < pos.AuthorityList.length; i++) {
                            var auth = pos.AuthorityList[i];
                            checkedDict[auth.Authid] = auth;
                        }
                        _this.VueAuthList.checkedChange = !_this.VueAuthList.checkedChange;
                    }
                },
            }).$mount();
            _this.VueAuthList = vue;
            // $(vue.$el).alert('close');
            Common.Popup($(vue.$el));
        });
    };
    ManagerManagerClass.prototype.ShowUserList = function (proj, backDept, backPosn) {
        var _this = this;
        if (backDept === void 0) { backDept = null; }
        if (backPosn === void 0) { backPosn = null; }
        var filterText = UrlParam.Get(URL_PARAM_KEY.FKEY, '');
        this.VueProjectEdit.currPage = ProjectEditPageIndex.User;
        Loader.LoadVueTemplate(this.VuePath + "UserList", function (tpl) {
            var vue = new Vue({
                template: tpl,
                data: {
                    auth: _this.Data.MyAuth,
                    userList: proj.UserList,
                    otherUserList: ArrayUtil.SubByAttr(_this.Data.UserList, proj.UserList, FieldName.Uid),
                    allDepartmentList: _this.Data.CurrProj.DeptTree,
                    backPosn: backPosn,
                    filterText: filterText,
                    newUserUid: 0,
                },
                methods: {
                    filterUserList: function (userList, filterText) {
                        var rs = userList.concat();
                        var dict = {};
                        if (filterText) {
                            var _filterText = filterText.toString().toLowerCase().trim();
                            var _filterTextSp = _filterText.split(/[\s\,]/g);
                            rs.every(function (user) {
                                if (StringUtil.IndexOfKeyArr(user.Name.toLowerCase(), _filterTextSp) > -1) {
                                    dict[user.Uid] = true;
                                }
                                else {
                                    if (user.Did) {
                                        var dept = _this.Data.DeptDict[user.Did];
                                        if (StringUtil.IndexOfKeyArr(dept.Name.toLowerCase(), _filterTextSp) > -1) {
                                            dict[user.Uid] = true;
                                        }
                                        else {
                                            for (var i = 0; i < dept.PositionList.length; i++) {
                                                var posn = dept.PositionList[i];
                                                if (posn.Posid == user.Posid && StringUtil.IndexOfKeyArr(posn.Name.toLowerCase(), _filterTextSp) > -1) {
                                                    dict[user.Uid] = true;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                                return true;
                            });
                            rs.sort(function (u0, u1) {
                                if (dict[u0.Uid] && !dict[u1.Uid]) {
                                    return -1;
                                }
                                else if (!dict[u0.Uid] && dict[u1.Uid]) {
                                    return 1;
                                }
                                return 0;
                            });
                        }
                        return rs;
                    },
                    OnBackPosn: function () {
                        UrlParam.Set(URL_PARAM_KEY.PAGE, ProjectEditPageIndex.Department).Set(URL_PARAM_KEY.DID, backDept.Did).Set(URL_PARAM_KEY.FKEY, null).Reset();
                        _this.ShowPositionList();
                    },
                    ShowDpName: function (did) {
                        var dp = _this.Data.DeptDict[did];
                        return dp ? dp.Name : '空';
                    },
                    ShowPosName: function (did, posid) {
                        var dp = _this.Data.DeptDict[did];
                        if (dp) {
                            if (posid > 0) {
                                var pos = dp.PositionList.FindOfAttr(FieldName.Posid, posid);
                                return pos ? pos.Name : '--';
                            }
                            else {
                                return '空';
                            }
                        }
                        else {
                            return '空';
                        }
                    },
                    ShowUserName: function (uid) {
                        this.newUserUid = uid;
                        if (uid) {
                            var user = ArrayUtil.FindOfAttr(this.otherUserList, FieldName.Uid, uid);
                            if (user) {
                                return user.Name;
                            }
                        }
                        return '选择新成员';
                    },
                    GetPosList: function (did) {
                        var dp = _this.Data.DeptDict[did];
                        if (dp) {
                            return dp.PositionList;
                        }
                        else {
                            return [];
                        }
                    },
                    OnDeptChange: function (user, dept) {
                        _this.Data.RemoveUserPosnid(user);
                        if (dept) {
                            _this.Data.SetUserPosnid(user, dept.Did);
                        }
                    },
                    onPosChange: function (user, pos) {
                        _this.Data.RemoveUserPosnid(user);
                        _this.Data.SetUserPosnid(user, user.Did, pos.Posid);
                    },
                    onSortDown: function (user, index) {
                        if (index < proj.UserList.length - 1) {
                            proj.UserList.splice(index + 1, 0, proj.UserList.splice(index, 1)[0]);
                        }
                    },
                    onSortUp: function (user, index) {
                        if (index > 0) {
                            proj.UserList.splice(index - 1, 0, proj.UserList.splice(index, 1)[0]);
                        }
                    },
                    onDel: function (user, index) {
                        Common.ConfirmDelete(function () {
                            proj.UserList.splice(index, 1);
                            _this.VueUserList.otherUserList = ArrayUtil.SubByAttr(_this.Data.UserList, proj.UserList, FieldName.Uid);
                        }, "\u5373\u5C06\u5220\u9664\u6210\u5458 \"" + user.Name + "\"");
                    },
                    onAddSelect: function () {
                        _this.ShowSelectUser(proj, ArrayUtil.SubByAttr(_this.Data.UserList, proj.UserList, FieldName.Uid));
                    },
                    onAdd: function () {
                        var newUser = ArrayUtil.FindOfAttr(_this.VueUserList.otherUserList, FieldName.Uid, _this.VueUserList.newUserUid);
                        if (newUser) {
                            proj.UserList.push(newUser);
                            _this.VueUserList.newUserUid = 0;
                            _this.VueUserList.otherUserList = ArrayUtil.SubByAttr(_this.Data.UserList, proj.UserList, FieldName.Uid);
                        }
                    },
                },
            }).$mount();
            _this.VueUserList = vue;
            //#show
            Common.InsertIntoDom(vue.$el, _this.VueProjectEdit.$refs.pageContent);
        });
    };
    /**选择 用户 */
    ManagerManagerClass.prototype.ShowSelectUser = function (proj, userList) {
        var _this = this;
        if (userList.length == 0) {
            Common.AlertWarning('所有用户都已经被添加到了这个项目中');
            return;
        }
        Loader.LoadVueTemplate(this.VuePath + "SelectUser", function (tpl) {
            var checkedDict = {};
            var _GetFilterList = function (userList, filterText) {
                var _filterText = filterText.toString().toLowerCase().trim();
                if (_filterText) {
                    var _filterTextSp = _filterText.split(/[\s\,]/g);
                    return userList.filter(function (user) {
                        if (checkedDict[user.Uid]) {
                            return true;
                        }
                        return StringUtil.IndexOfKeyArr(user.Name.toLowerCase(), _filterTextSp) > -1;
                    });
                }
                else {
                    return userList;
                }
            };
            var vue = new Vue({
                template: tpl,
                data: {
                    auth: _this.Data.MyAuth,
                    userList: userList,
                    filterText: '',
                    checkedChange: false,
                },
                methods: {
                    GetFilterList: _GetFilterList.bind(_this),
                    checkChecked: function (_, user) {
                        return checkedDict[user.Uid] != null;
                    },
                    onChangeChecked: function (user) {
                        if (checkedDict[user.Uid]) {
                            delete checkedDict[user.Uid];
                        }
                        else {
                            checkedDict[user.Uid] = user;
                        }
                        _this.VueSelectUser.checkedChange = !_this.VueSelectUser.checkedChange;
                    },
                    OnCheckedAll: function () {
                        var _userList = _GetFilterList(userList, _this.VueSelectUser.filterText);
                        var isAllCheck = true;
                        for (var i = 0; i < _userList.length; i++) {
                            var user = _userList[i];
                            if (!checkedDict[user.Uid]) {
                                isAllCheck = false;
                                break;
                            }
                        }
                        for (var i = 0; i < _userList.length; i++) {
                            var user = _userList[i];
                            if (isAllCheck) {
                                delete checkedDict[user.Uid];
                            }
                            else {
                                checkedDict[user.Uid] = user;
                            }
                        }
                        _this.VueSelectUser.checkedChange = !_this.VueSelectUser.checkedChange;
                    },
                    onOk: function () {
                        for (var i = 0; i < userList.length; i++) {
                            var user = userList[i];
                            if (checkedDict[user.Uid]) {
                                proj.UserList.push(user);
                            }
                        }
                        $(_this.VueSelectUser.$el).remove();
                    }
                },
            }).$mount();
            _this.VueSelectUser = vue;
            // $(vue.$el).alert('close');
            Common.Popup($(vue.$el));
        });
    };
    return ManagerManagerClass;
}());
var ManagerManager = new ManagerManagerClass();
//# sourceMappingURL=ManagerManager.js.map