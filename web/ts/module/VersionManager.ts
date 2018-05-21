class VersionManagerClass {
    AuePath: string = "version/" //模板所在目录
    //初始化
    Init() {
    }
    //注册函数
    RegisterFunc() {
    }
    //编辑 模板-功能列表
    VueEditList: CombinedVueInstance1<{ newVer: string, newName: string, versions: VersionSingle[] }>
    ShowEditList(e) {
        this.HideVersionList(false)
        ProcessPanel.HideMenu()
        //真正执行显示面板的函数
        var _show = () => {
            var pageX, pageY
            var uiEditMode = $('#editMode')
            if (uiEditMode.isShow()) {
                pageX = uiEditMode.x() + uiEditMode.width() + 5
                pageY = uiEditMode.y()
            }
            if (!pageX) pageX = e.pageX
            if (!pageY) pageY = e.pageY
            var plan = $(this.VueEditList.$el).xy(pageX, pageY).show().adjust(-5)
        }
        Loader.LoadVueTemplate(this.AuePath + "EditVersionList", (txt: string) => {
            this.VueEditList = new Vue({
                template: txt,
                data: {
                    newVer: '',
                    newName: '',
                    versions: ProcessData.VersionList,
                },
                methods: {
                    onAddVer: (isEnter: boolean = false) => {
                        this.VueEditList.newVer = this.FormatVer(this.VueEditList.newVer)
                        if (isEnter) {
                            $('#editVersionList_newName').get(0).focus()
                        }
                    },
                    onAdd: () => {
                        var vid = this.VueEditList.versions.length > 0 ? this.VueEditList.versions[this.VueEditList.versions.length - 1].Vid + 1 : 1
                        this.VueEditList.versions.unshift({
                            Vid: vid,
                            Ver: this.VueEditList.newVer,
                            Name: this.VueEditList.newName,
                            PublishList: [
                                { Vid: vid, Genre: GenreField.BEGIN, DateLine: '' },
                                { Vid: vid, Genre: GenreField.END, DateLine: '' },
                                { Vid: vid, Genre: GenreField.SEAL, DateLine: '' },
                                { Vid: vid, Genre: GenreField.DELAY, DateLine: '' },
                                { Vid: vid, Genre: GenreField.PUB, DateLine: '' },
                                { Vid: vid, Genre: GenreField.SUMMARY, DateLine: '' },
                            ]
                        })
                        // console.log("[info]","onAdd")
                    },
                    onEditVer: (e, item: VersionSingle) => {
                        var newVer = this.FormatVer(e.target.value)
                        if (newVer != item.Ver.toString()) {
                            item.Ver = newVer
                        } else {
                            if (newVer != e.target.value) {
                                item.Ver = 't'//vue值相同 赋值是不会触发html变化,需要现赋另一个值
                                item.Ver = newVer
                            }//else 完全没变化,不需要管
                        }
                        // console.log("[info]",item.Ver,e.target.value)
                    },
                    onEditName: (e, item: VersionSingle) => {
                        item.Name = e.target.value
                    },
                    onDel: (e, item: VersionSingle, index: number) => {
                        this.VueEditList.versions.splice(index, 1)
                    },
                    onEdit: (e, item: VersionSingle) => {
                        this.ShowVersionDetail(item)
                    },
                    onClose: () => {
                        this.HideVersionList()
                        ProcessPanel.HideMenu()
                    },
                }
            }).$mount()
            Common.InsertBeforeDynamicDom(this.VueEditList.$el)
            _show()
        })
    }
    HideVersionList(fade: boolean = true) {
        if (this.VueEditList) {
            if (fade) {
                $(this.VueEditList.$el).fadeOut(Config.FadeTime, function () {
                    $(this).remove()
                })

            } else {
                $(this.VueEditList.$el).remove()
            }
            this.VueEditList = null
        }
    }
    //版本编辑内容
    VueEditDetail: CombinedVueInstance1<{ version: VersionSingle }>
    ShowVersionDetail(arg: number | VersionSingle) {
        this.HideVersionDetail(false)
        var version: VersionSingle
        if (typeof (arg) == 'number') {
            version = this.VueEditList.versions.filter((item) => {
                if (item.Vid == arg as number) {
                    return true
                }
                return false
            })[0]
        } else {
            version = arg as VersionSingle
        }
        //
        var _show = () => {
            //为了和功能列表面板高度相同
            var pageX, pageY
            var uiList = $(this.VueEditList.$el)
            if (uiList.isShow()) {
                pageX = uiList.x() + uiList.width() + 5
                pageY = uiList.y()
            }
            var plan = $(this.VueEditDetail.$el).xy(pageX, pageY).show().adjust(-5)
            //关闭日期
            plan.unbind().mousedown((e) => {
                if ($(e.target).attr('class') != 'date') {
                    DateTime.HideDate()
                }
                /*  if ($(e.target).attr('class') != 'select') {
                 $('#storeMenu').hide()
                 } */
            })
            //日期绑定
            plan.find('.date').unbind().click(function (this: HTMLInputElement) {
                DateTime.Open(this, $(this).val(), (date) => {
                    $(this).val(date)
                })
            })
        }
        Loader.LoadVueTemplate(this.AuePath + "EditVersionDetail", (txt: string) => {
            this.VueEditDetail = new Vue({
                template: txt,
                data: {
                    version: version
                },
                /*  filters: {
                     publishName:function(){
                         return 'iopioi'
                     },
                     // publishName: this.GetPublishName.bind(this),
                 }, */
                methods: {
                    publishName: this.GetPublishName.bind(this),
                    onDateClick: (genre: number) => {
                        //TODO: 
                    },
                    onClose: () => {
                        this.HideVersionDetail()
                        // ProcessPanel.HideMenu()
                    }
                }
            }).$mount()
            Common.InsertBeforeDynamicDom(this.VueEditDetail.$el)
            _show()
        })
    }
    HideVersionDetail(fade: boolean = true) {
        if (this.VueEditDetail) {
            if (fade) {
                $(this.VueEditDetail.$el).fadeOut(Config.FadeTime, function () {
                    $(this).remove()
                })
            } else {
                $(this.VueEditDetail.$el).remove()
            }
            this.VueEditDetail = null
        }
    }
    Hide() {
        this.HideVersionList()
        this.HideVersionDetail()
    }
    /**
     * 格式化版本号   只能是 数字和. 例如 1.3   4.5.6
     * @param ori 
     */
    FormatVer(ori: string): string {
        return ori.replace(/[^0-9\.]/g, '')
    }
    //
    PublishGenreNameList: string[] = ['开始', '完结', '封存', '延期', '发布', '总结']
    GetPublishName(genre: number): string {
        return this.PublishGenreNameList[genre - 1]
    }
}
var VersionManager = new VersionManagerClass()