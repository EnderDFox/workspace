package main

import (
	"bytes"
	"image"
	"log"
	"strings"

	"crypto/md5"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strconv"
	"time"

	"github.com/gorilla/websocket"

	"github.com/disintegration/imaging"
)

type Upload struct {
	FileMaxEveryWork uint32 //每个work附件上限
}

func NewUpload() *Upload {
	ob := &Upload{}
	ob.FileMaxEveryWork = 6
	return ob
}

func (this *Upload) RegisterFunction() {
	this.InitFolderAll()
	command.Register(C2L_UPLOAD_ADD, &C2L_M_UPLOAD_ADD{})
	command.Register(C2L_UPLOAD_DELETE, &C2L_M_UPLOAD_DELETE{})
}

//初始化 所有文件夹 避免上传时再初始化 会慢
func (this *Upload) InitFolderAll() {
	CreateDir(config.Upload)
	for i := 0; i < 256; i++ {
		folder := fmt.Sprintf("%02X", i)
		CreateDir(config.Upload + "/" + strings.ToLower(folder))
	}
}

//创建缩略图
func (this *Upload) CreateThumb(img image.Image, dstPath string) {
	// log.Println("oriPath:", oriPath)
	// img, err := imaging.Open(oriPath)
	// if err != nil {
	// 	panic(err)
	// }
	// dst := imaging.Thumbnail(img, 200, 200, imaging.Linear)
	dst := imaging.Resize(img, 200, 200, imaging.Linear) // 这个和html <img效果一致
	imaging.Save(dst, dstPath)
}

//计算文件名,  return (文件夹名 00~FF,文件名 ymd_fid)
func (this *Upload) CountFilePath(fileKind uint32, fid uint64, create_time uint32) (string, string) {
	fidStr := strconv.FormatUint(fid, 10) //string(fid)的结果是乱码,不能用
	md5str := fmt.Sprintf("%x", md5.Sum([]byte(fidStr)))
	tm := time.Unix(int64(create_time), 0)
	return md5str[0:2], tm.Format("20060102_1504_") + fidStr + "." + GetExtByFileKind(fileKind)
}

//计算某个work下关联的file总数
func (this *Upload) CountFileCount(kind uint32, obid uint64) uint32 {
	//计算文件数量是否已经达到上限
	stmt, err := db.GetDb().Prepare(`SELECT COUNT(t1.fid) FROM ` + config.Pm + `.pm_file_join AS t1 WHERE kind=? AND t1.obid = ? AND is_del=0`)
	defer stmt.Close()
	db.CheckErr(err)
	var count uint32
	stmt.QueryRow(kind, obid).Scan(&count)
	db.CheckErr(err)
	return count
}

//获取某个work下关联的file
func (this *Upload) GetFileList(kind uint32, obid uint64) []*FileSingle {
	//计算文件数量是否已经达到上限
	stmt, err := db.GetDb().Prepare(`SELECT t2.fid,t2.kind,t2.name,t2.create_time FROM ` + config.Pm + `.pm_file_join AS t1 INNER JOIN ` + config.Pm + `.pm_file as t2 ON t1.fid=t2.fid AND t1.kind=? AND t1.obid = ? AND t1.is_del=0 `)
	defer stmt.Close()
	db.CheckErr(err)
	rows, err := stmt.Query(kind, obid)
	db.CheckErr(err)
	defer rows.Close()
	var fileList []*FileSingle
	for rows.Next() {
		single := &FileSingle{}
		rows.Scan(&single.Fid, &single.Kind, &single.Name, &single.CreateTime)
		fileList = append(fileList, single)
	}
	return fileList
}

//========================结构
type C2L_UpdateWorkAdd struct {
	Wid    uint64
	TempId uint64
	Kind   uint32
	Name   string
	Data   []byte //文件二进制流
}

type C2L_UpdateWorkDelete struct {
	Wid  uint64
	Fids []uint64
}

type L2C_UpdateWorkAdd struct {
	Wid        uint64
	TempId     uint64
	Fid        uint64
	Kind       uint32
	Name       string
	CreateTime uint32
}

type L2C_UpdateWorkDelete struct {
	Wid  uint64
	Fids []uint64
}

type FileSingle struct {
	Fid        uint64
	Kind       uint32
	Name       string
	CreateTime uint32
}

//新增功能
type C2L_M_UPLOAD_ADD struct{}

func (this *C2L_M_UPLOAD_ADD) execute(client *websocket.Conn, msg *Message) bool {
	user := session.GetUser(msg.Uid)
	if user == nil {
		return false
	}
	param := &C2L_UpdateWorkAdd{}
	err := json.Unmarshal([]byte(msg.Param), param)
	if err != nil {
		log.Println("C2L_M_UPLOAD_ADD json.Unmarshal err:", err)
		return false
	}
	// time.Sleep(3 * time.Second)
	// log.Println("----------upload add execute------------")
	// log.Println("receive file", time.Now().Unix(), param.Kind)
	if upload.CountFileCount(FILE_JOIN_KIND_WORK, param.Wid) >= upload.FileMaxEveryWork {
		log.Println(">=upload.FileMaxEveryWork")
		return false
	}
	//
	create_time := uint32(time.Now().Unix())
	//新文件 写入数据库
	stmt, err := db.GetDb().Prepare(`INSERT INTO ` + config.Pm + `.pm_file (kind,add_uid,name,create_time) VALUES (?,?,?,?)`)
	defer stmt.Close()
	db.CheckErr(err)
	res, err := stmt.Exec(param.Kind, user.Uid, param.Name, create_time)
	db.CheckErr(err)
	newFid, err := res.LastInsertId()
	db.CheckErr(err)
	fid := uint64(newFid)
	//文件与work关系写入数据库
	stmt, err = db.GetDb().Prepare(`INSERT INTO ` + config.Pm + `.pm_file_join (kind,obid,fid,create_time) VALUES (?,?,?,?)`)
	defer stmt.Close()
	db.CheckErr(err)
	res, err = stmt.Exec(FILE_JOIN_KIND_WORK, param.Wid, fid, create_time)
	db.CheckErr(err)
	//计算文件名
	folder, fileName := upload.CountFilePath(param.Kind, fid, create_time)
	//写入文件
	pathFull := config.Upload + "/" + folder + "/" + fileName
	err_io := ioutil.WriteFile(pathFull, param.Data, os.ModeAppend) //buffer输出到image文件中（不做处理，直接写到文件）
	// log.Println("WriteFile success", time.Now().Unix(), upload.Fid, folder, fileName)
	if err_io != nil {
		log.Println("err_io:", err_io)
		return false
	}
	//缩略图
	original_image, _, err := image.Decode(bytes.NewReader(param.Data))
	upload.CreateThumb(original_image, pathFull+".t.jpg")
	//通知前端
	data := &L2C_UpdateWorkAdd{
		Wid:        param.Wid,
		TempId:     param.TempId,
		Fid:        fid,
		Kind:       param.Kind,
		Name:       param.Name,
		CreateTime: create_time,
	}
	user.SendTo(L2C_UPLOAD_ADD, data)
	return true
}

type C2L_M_UPLOAD_DELETE struct {
}

func (this *C2L_M_UPLOAD_DELETE) execute(client *websocket.Conn, msg *Message) bool {
	user := session.GetUser(msg.Uid)
	if user == nil {
		return false
	}
	param := &C2L_UpdateWorkDelete{}
	err := json.Unmarshal([]byte(msg.Param), param)
	if err != nil {
		// log.Printlog.Println("json.Unmarshal err:", err)
		return false
	}
	//
	var strArr []string
	for _, fid := range param.Fids {
		strArr = append(strArr, strconv.FormatUint(fid, 10))
	}
	fidStr := strings.Join(strArr, ",")
	//
	//sql 设置 pm_file_joind.is_del=1
	stmt, err := db.GetDb().Prepare(`UPDATE ` + config.Pm + `.pm_file_join SET is_del = 1 WHERE kind=? AND obid=? AND fid IN(` + fidStr + `)`)
	defer stmt.Close()
	db.CheckErr(err)
	_, err = stmt.Exec(FILE_JOIN_KIND_WORK, param.Wid)
	db.CheckErr(err)
	//
	data := &L2C_UpdateWorkDelete{
		Wid:  param.Wid,
		Fids: param.Fids,
	}
	user.SendTo(L2C_UPLOAD_DELETE, data)
	return true
}

const (
	FILE_KIND_PNG = 1
	FILE_KIND_JPG = 2
	FILE_KIND_BMP = 3
	//
	FILE_JOIN_KIND_WORK = 1 // pm_file_join.kind: 类型 1:pm_work
)

// 根据FileKind计算文件的后缀名
func GetExtByFileKind(fileKind uint32) string {
	switch {
	case fileKind == FILE_KIND_PNG:
		return "png"
	case fileKind == FILE_KIND_JPG:
		return "jpg"
	case fileKind == FILE_KIND_BMP:
		return "bmp"
	}
	return "_"
}

func CreateDir(path string) {
	// wd, _ := os.Getwd() //当前的目录
	// log.Println("wd:", wd)
	os.Mkdir(path, os.ModePerm)
	/*err := os.Mkdir(path, os.ModePerm)
	if err != nil {
		fmt.Println("err:", err) //已存在的文件 也会报这个错误
	} else {
		fmt.Println("创建目录 cpl")
	} */
}
