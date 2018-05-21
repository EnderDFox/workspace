//===一些枚举需要提前写
type int = number
type int32 = number
type int64 = number
type uint = number
type uint32 = number
type uint64 = number

//db.manager.department.did
enum DidField {
    VERSION = 0,    //版本
    ALL = -1,       //全部
    DESIGN = 1,     //策划
    ART = 2,        //美术
    CLIENT = 4,     //前端
    SERVER = 5,     //后端
    QA = 6,         //质检
    SUPERVISOR = 14, //监修
    TOOL = 16,       //工具
}

enum GenreField {
    // '开始', '完结', '封存', '延期', '发布', '总结'
    BEGIN = 1,
    END = 2,
    SEAL = 3,
    DELAY = 4,
    PUB = 5,
    SUMMARY = 6,
}