package main

import (
	"log"
	"strconv"
	"strings"
)

type Manage struct {
	user *User
}

func NewManage(user *User) *Manage {
	instance := &Manage{}
	instance.user = user
	return instance
}

func (this *Manage) View() *L2C_ManageView {
	//#超级 sql :  proj+dept+posn
	stmt, err := db.GetDb().Prepare(`
	SELECT t_proj_dept.*,t_posn.posnid,t_posn.name AS posn_name,t_posn.sort AS posn_sort
	FROM (
		SELECT t_proj.*,t_dept.did,t_dept.fid,t_dept.name AS d_name,t_dept.sort AS d_sort
		FROM (
			SELECT pid,name AS proj_name,create_time FROM ` + config.Pm + `.pm_project WHERE is_del=0
		)	AS t_proj
		LEFT JOIN ` + config.Mg + `.mag_department AS t_dept ON t_dept.is_del=0 AND t_dept.pid = t_proj.pid
	) AS t_proj_dept
	LEFT JOIN ` + config.Mg + `.mag_position AS t_posn ON t_posn.is_del=0 AND t_posn.did = t_proj_dept.did 
	ORDER BY t_proj_dept.pid,t_proj_dept.fid,t_proj_dept.d_sort,t_posn.did,t_posn.sort `)
	//
	defer stmt.Close()
	db.CheckErr(err)
	rows, err := stmt.Query()
	defer rows.Close()
	db.CheckErr(err)
	//
	projMap := make(map[uint64]*ProjectSingle)
	deptMap := make(map[uint64]*DepartmentSingle)
	var projList []*ProjectSingle
	var deptList []*DepartmentSingle
	var posnList []*PositionSingle
	for rows.Next() {
		proj := &ProjectSingle{}
		dept := &DepartmentSingle{}
		posn := &PositionSingle{}
		rows.Scan(&proj.Pid, &proj.Name, &proj.CreateTime, &dept.Did, &dept.Fid, &dept.Name, &dept.Sort, &posn.Posnid, &posn.Name, &posn.Sort)
		log.Println("[log]", proj.Pid, proj.Name, proj.CreateTime, dept.Did, dept.Fid, dept.Name, dept.Sort, posn.Posnid, posn.Name, posn.Sort)
		dept.Pid = proj.Pid
		posn.Did = dept.Did
		if _, ok := projMap[proj.Pid]; !ok {
			projMap[proj.Pid] = proj
			projList = append(projList, proj)
		}
		if dept.Did > 0 {
			if _, ok := deptMap[dept.Did]; !ok {
				if dept.Fid > 0 {
					//有fid 则必定有fid数据才放进去, 因为都是按照fid排序放入的,所以父dept如果存在,肯定提前放进去了
					if _, ok := deptMap[dept.Fid]; ok {
						deptMap[dept.Did] = dept
						deptList = append(deptList, dept)
					}
				} else {
					deptMap[dept.Did] = dept
					deptList = append(deptList, dept)
				}
			}
		}
		if posn.Posnid > 0 {
			//判断没有 dept存在也不要放进去了
			if _, ok := deptMap[dept.Did]; ok {
				posnList = append(posnList, posn)
			}
		}
	}
	//
	var pidList []uint64
	for _, proj := range projList {
		pidList = append(pidList, proj.Pid)
	}
	//#
	data := &L2C_ManageView{
		AuthList:         this.GetAuthList(),
		UserList:         this.GetUserList(),
		ProjList:         projList,
		DeptList:         deptList,
		PosnList:         posnList,
		UserProjReltList: this.GetUserMgRelationList(pidList...),
	}
	return data
}

func (this *Manage) DeptAdd(pid uint64, fid uint64, name string) *DepartmentSingle {
	//# 插入 dept IF(?,1,0) 是 IF(fid,1,0) 根从 sort=0 开始 因为sort=0是`管理部``
	stmt, err := db.GetDb().Prepare(`INSERT INTO ` + config.Mg + `.mag_department (pid,fid,name,sort) VALUES (?,?,?,(
			(SELECT IFNULL(
				(SELECT ms FROM(SELECT max(sort)+1 AS ms FROM ` + config.Mg + `.mag_department WHERE pid=? AND fid=?) m)
			,IF(?,1,0)))
	))`)
	defer stmt.Close()
	db.CheckErr(err)
	res, err := stmt.Exec(pid, fid, name, pid, fid, fid)
	db.CheckErr(err)
	_did, err := res.LastInsertId()
	did := uint64(_did)
	db.CheckErr(err)
	//# 重新读取出 sort
	dept := this.GetDeptSingle(did)
	var posnList []*PositionSingle
	var posn *PositionSingle
	if dept.Sort == 0 {
		//管理部 需要增加 三个默认职位
		posn = this.PosnAdd(did, `制作人`)
		posnList = append(posnList, posn)
		posn = this.PosnAdd(did, `PM`)
		posnList = append(posnList, posn)
		posn = this.PosnAdd(did, `管理员`)
		posnList = append(posnList, posn)
	} else {
		//其它部门 增加一个和部门同名的职位
		posn = this.PosnAdd(did, name)
		posnList = append(posnList, posn)
	}
	//#
	dept.PosnList = posnList
	return dept
}

func (this *Manage) DeptDel(didList ...uint64) int64 {
	var didStrList []string
	for _, did := range didList {
		didStrList = append(didStrList, strconv.FormatInt(int64(did), 10))
	}
	stmt, err := db.GetDb().Prepare(`UPDATE ` + config.Mg + `.mag_department SET is_del = 1 WHERE did IN (` + strings.Join(didStrList, `,`) + `) `)
	db.CheckErr(err)
	res, err := stmt.Exec()
	db.CheckErr(err)
	num, err := res.RowsAffected()
	db.CheckErr(err)
	if num > 0 {
		this.PosDelByDid(didList...)
	}
	return num
}

func (this *Manage) DeptEditName(did uint64, name string) int64 {
	stmt, err := db.GetDb().Prepare(`UPDATE ` + config.Mg + `.mag_department SET name = ? WHERE did = ?`)
	db.CheckErr(err)
	res, err := stmt.Exec(name, did)
	db.CheckErr(err)
	num, err := res.RowsAffected()
	db.CheckErr(err)
	//# 如果内部的职位是空的(当初添加子部门 添加时一起加的 空名 职位) 也一起改名
	stmt, err = db.GetDb().Prepare(`UPDATE ` + config.Mg + `.mag_position SET name = ? WHERE did = ? AND name=''`)
	db.CheckErr(err)
	res, err = stmt.Exec(name, did)
	db.CheckErr(err)
	_, err = res.RowsAffected()
	db.CheckErr(err)
	return num
}
func (this *Manage) DeptEditSort(did uint64, fid uint64, sort uint32) int64 {
	//直接换就行, 比sort大的值都+1  因为sort不连续也没关系
	stmt, err := db.GetDb().Prepare(`
	UPDATE manager.mag_department AS ta, manager.mag_department AS tb
	SET ta.sort = ?,ta.fid=?, tb.sort = tb.sort + 1
	WHERE	ta.did = ?
	AND tb.did <> ? AND tb.sort >= ?`)
	db.CheckErr(err)
	res, err := stmt.Exec(sort, fid, did, did, sort)
	db.CheckErr(err)
	num, err := res.RowsAffected()
	db.CheckErr(err)
	return num
}

func (this *Manage) PosnAdd(did uint64, name string) *PositionSingle {
	//# 插入 dept IF(?,1,0) 是 IF(fid,1,0) 根从 sort=0 开始 因为sort=0是`管理部``
	stmt, err := db.GetDb().Prepare(`INSERT INTO ` + config.Mg + `.mag_position (did,name,sort) VALUES (?,?,(
	(SELECT IFNULL(
		(SELECT ms FROM(SELECT max(sort)+1 AS ms FROM ` + config.Mg + `.mag_position WHERE did=?) m)
	,1))
))`)
	defer stmt.Close()
	db.CheckErr(err)
	res, err := stmt.Exec(did, name, did)
	db.CheckErr(err)
	_posnid, err := res.LastInsertId()
	posnid := uint64(_posnid)
	db.CheckErr(err)
	//
	posn := &PositionSingle{
		Did:    did,
		Posnid: posnid,
		Name:   name,
	}
	return posn
}

func (this *Manage) PosDelByDid(didList ...uint64) int64 {
	var didStrList []string
	for _, did := range didList {
		didStrList = append(didStrList, strconv.FormatInt(int64(did), 10))
	}
	stmt, err := db.GetDb().Prepare(`UPDATE ` + config.Mg + `.mag_position SET is_del = 1 WHERE did IN (` + strings.Join(didStrList, `,`) + `)`)
	db.CheckErr(err)
	res, err := stmt.Exec()
	db.CheckErr(err)
	num, err := res.RowsAffected()
	db.CheckErr(err)
	return num
}

//全部项目
func (this *Manage) GetProjectList() []*ProjectSingle {
	stmt, err := db.GetDb().Prepare(`SELECT pid,name,create_time FROM ` + config.Pm + `.pm_project WHERE is_del=0`)
	defer stmt.Close()
	db.CheckErr(err)
	rows, err := stmt.Query()
	defer rows.Close()
	db.CheckErr(err)
	var list []*ProjectSingle
	for rows.Next() {
		single := &ProjectSingle{}
		rows.Scan(&single.Pid, &single.Name, &single.CreateTime)
		list = append(list, single)
	}
	return list
}

//全部权限
func (this *Manage) GetAuthList() []*AuthSingle {
	stmt, err := db.GetDb().Prepare(`SELECT authid,modid,name,description,sort FROM ` + config.Mg + `.mag_auth`)
	defer stmt.Close()
	db.CheckErr(err)
	rows, err := stmt.Query()
	defer rows.Close()
	db.CheckErr(err)
	var list []*AuthSingle
	for rows.Next() {
		single := &AuthSingle{}
		rows.Scan(&single.Authid, &single.Modid, &single.Name, &single.Description, &single.Sort)
		list = append(list, single)
	}
	return list
}

//全部用户
func (this *Manage) GetUserList() []*UserSingle {
	stmt, err := db.GetDb().Prepare(`SELECT uid,name FROM ` + config.Mg + `.mag_user WHERE is_del=0`)
	defer stmt.Close()
	db.CheckErr(err)
	rows, err := stmt.Query()
	defer rows.Close()
	db.CheckErr(err)
	var list []*UserSingle
	for rows.Next() {
		single := &UserSingle{}
		rows.Scan(&single.Uid, &single.Name)
		list = append(list, single)
	}
	return list
}

func (this *Manage) GetDeptSingle(did uint64) *DepartmentSingle {
	stmt, err := db.GetDb().Prepare(`SELECT did,pid,fid,name,sort FROM ` + config.Mg + `.mag_department WHERE did = ?`)
	defer stmt.Close()
	db.CheckErr(err)
	single := &DepartmentSingle{}
	stmt.QueryRow(did).Scan(&single.Did, &single.Pid, &single.Fid, &single.Name, &single.Sort)
	return single
}

//玩家关系表   是 mag_user_proj_relation表的数据, 但结构被UserSingle包含了 所以就用UserSingle吧
func (this *Manage) GetUserMgRelationList(pidList ...uint64) []*UserSingle {
	var pidStrList []string
	for _, pid := range pidList {
		// pidStrList = append(pidStrList, strconv.Itoa(int(pid)))
		pidStrList = append(pidStrList, strconv.FormatInt(int64(pid), 10))
	}
	stmt, err := db.GetDb().Prepare(`SELECT uid,pid,did,posnid FROM ` + config.Mg + `.mag_user_proj_relation WHERE pid IN (` + strings.Join(pidStrList, `,`) + `)`)
	defer stmt.Close()
	db.CheckErr(err)
	rows, err := stmt.Query()
	defer rows.Close()
	db.CheckErr(err)
	var list []*UserSingle
	for rows.Next() {
		single := &UserSingle{}
		rows.Scan(&single.Uid, &single.Pid, &single.Did, &single.Posnid)
		list = append(list, single)
	}
	return list
}
