var md = require('../models/sanpham.model');
var objReturn = {
    status: 1,
    msg: 'okila'
}
exports.list = async (req, res, next)=>{
    let listUser = [];

    try {
        listUser = await md.spModel.find();
        if(listUser){
            objReturn.data = listUser;
            objReturn.status = 1;
            objReturn.msg = 'Lay danh sach thanh cong'
        }else{
            objReturn.status = 0;
            objReturn.msg = 'Khong co du lieu'
        }
    } catch (error) {
        objReturn.status = 0;
        objReturn.msg = error.msg;
    }


    res.json(objReturn);
}