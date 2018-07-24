//=======================C2L协议=======================
class C2L {
    static C2L_SESSION_LOGIN = 10001
    static C2L_SAVE_COLLATE = 11001
    //#
    static C2L_PROCESS_VIEW = 50001
    //
    //mode
    static C2L_PROCESS_MODE_ADD = 50011
    static C2L_PROCESS_MODE_EDIT = 50012
    static C2L_PROCESS_MODE_COLOR = 50013
    static C2L_PROCESS_MODE_SWAP_SORT = 50014
    static C2L_PROCESS_MODE_STORE = 50015
    static C2L_PROCESS_MODE_DELETE = 50016
    //link
    static C2L_PROCESS_LINK_ADD = 50021
    static C2L_PROCESS_LINK_EDIT = 50022
    static C2L_PROCESS_LINK_COLOR = 50023
    static C2L_PROCESS_LINK_SWAP_SORT = 50024
    static C2L_PROCESS_LINK_STORE = 50025
    static C2L_PROCESS_LINK_DELETE = 50026
    static C2L_PROCESS_LINK_USER_CHANGE = 50027
    //work
    static C2L_PROCESS_WORK_EDIT = 50031
    static C2L_PROCESS_WORK_STATUS = 50032
    static C2L_PROCESS_WORK_SCORE = 50033
    static C2L_PROCESS_WORK_CLEAR = 50034
    //
    static C2L_COLLATE_VIEW = 60001
    static C2L_COLLATE_STEP_EDIT = 60002
    static C2L_COLLATE_STEP_ADD = 60003
    static C2L_COLLATE_EXTRA_EDIT = 60004
    static C2L_COLLATE_EXTRA_DELETE = 60005
    static C2L_PROFILE_VIEW = 70001

    static C2L_TPL_MODE_VIEW = 51010
    static C2L_TPL_MODE_ADD = 51011
    static C2L_TPL_MODE_EDIT_NAME = 51012
    static C2L_TPL_MODE_DELETE = 51013
    static C2L_TPL_LINK_ADD = 51021
    static C2L_TPL_LINK_CLONE = 51026
    static C2L_TPL_LINK_EDIT_NAME = 51022
    static C2L_TPL_LINK_EDIT_DID = 51023
    static C2L_TPL_LINK_EDIT_SORT = 51024
    static C2L_TPL_LINK_DELETE = 51025

    //文件上传
    static C2L_UPLOAD_ADD = 80001
    static C2L_UPLOAD_DELETE = 80002
    //版本
    static C2L_VERSION_ADD = 80101
    static C2L_VERSION_DELETE = 80102
    static C2L_VERSION_CHANGE_VER = 80103
    static C2L_VERSION_CHANGE_NAME = 80104
    static C2L_VERSION_CHANGE_PUBLISH = 80105
    static C2L_VERSION_CHANGE_SORT = 80106

    static C2L_TEST_1 = 99101
    //#
}

//======================L2C协议=======================
class L2C {
    static L2C_SESSION_LOGIN = 10001
    static L2C_USER_LIST = 10002
    static L2C_DEPARTMENT_LIST = 10003
    static L2C_SAVE_COLLATE = 11001
    static L2C_SESSION_LOGIN_ERROR = 20001
    //#
    static L2C_PROCESS_VIEW = 50001
    //mode
    static L2C_PROCESS_MODE_ADD = 50011
    static L2C_PROCESS_MODE_EDIT = 50012
    static L2C_PROCESS_MODE_COLOR = 50013
    static L2C_PROCESS_MODE_SWAP_SORT = 50014
    static L2C_PROCESS_MODE_STORE = 50015
    static L2C_PROCESS_MODE_DELETE = 50016
    //link
    static L2C_PROCESS_LINK_ADD = 50021
    static L2C_PROCESS_LINK_EDIT = 50022
    static L2C_PROCESS_LINK_COLOR = 50023
    static L2C_PROCESS_LINK_SWAP_SORT = 50024
    static L2C_PROCESS_LINK_STORE = 50025
    static L2C_PROCESS_LINK_DELETE = 50026
    static L2C_PROCESS_LINK_USER_CHANGE = 50027
    //work
    static L2C_PROCESS_WORK_EDIT = 50031
    static L2C_PROCESS_WORK_STATUS = 50032
    static L2C_PROCESS_WORK_SCORE = 50033
    static L2C_PROCESS_WORK_CLEAR = 50034
    //
    static L2C_PROCESS_SCORE_NOTICE = 51001
    //#
    static L2C_COLLATE_VIEW = 60001
    static L2C_COLLATE_STEP_EDIT = 60002
    static L2C_COLLATE_STEP_ADD = 60003
    static L2C_COLLATE_EXTRA_EDIT = 60004
    static L2C_COLLATE_EXTRA_DELETE = 60005
    static L2C_PROFILE_VIEW = 70001

    static L2C_TPL_MODE_VIEW = 51010
    static L2C_TPL_MODE_ADD = 51011
    static L2C_TPL_MODE_EDIT_NAME = 51012
    static L2C_TPL_MODE_DELETE = 51013
    static L2C_TPL_LINK_ADD = 51021
    static L2C_TPL_LINK_EDIT_NAME = 51022
    static L2C_TPL_LINK_EDIT_DID = 51023
    static L2C_TPL_LINK_EDIT_SORT = 51024
    static L2C_TPL_LINK_DELETE = 51025

    //文件上传
    static L2C_UPLOAD_ADD = 80001
    static L2C_UPLOAD_DELETE = 80002
    //版本
    static L2C_VERSION_ADD = 80101
    static L2C_VERSION_DELETE = 80102
    static L2C_VERSION_CHANGE_VER = 80103
    static L2C_VERSION_CHANGE_NAME = 80104
    static L2C_VERSION_CHANGE_PUBLISH = 80105
    static L2C_VERSION_CHANGE_SORT = 80106
}

class PB_CMD {
    static MANAGE_VIEW = 90101
    static MANAGE_DEPT_ADD = 90121
    static MANAGE_DEPT_DEL = 90122
    static MANAGE_DEPT_EDIT_NAME = 90123
    static MANAGE_DEPT_EDIT_SORT = 90124
}