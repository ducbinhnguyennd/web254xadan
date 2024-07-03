var myMD = require('../../models/user.model');

exports.list = async(req, res, next) => {
    
    var listUser = await myMD.UserModel.find().sort({name: 1});
    res.render('accounts/list.ejs',{listUser: listUser});


}

exports.edit = async(req, res, next)=>{
    let msg='';
    let listUser = await myMD.UserModel.find();
    console.log(listUser);

    // load thong tin san pham
    let idUser = req.params.idUser;
    let objUser = await myMD.UserModel.findById(idUser);

    if(req.method =='POST'){
        // kiem tra hop le
        // if(objUser.passwrd != req.body.passwrd){
        //     msg = 'sai mật  khẩu cũ';
        // }else{
        // tao doi tuong  model de gan giu lieu
            let objUser = new myMD.UserModel();
            objUser.ten = req.body.ten;
            objUser.email = req.body.email;
            objUser.sdt = req.body.sdt;
            objUser.passwrd = req.body.passwrd;
            
            objUser._id = idUser;
            //ghi vao CSDL
            try {
                await myMD.UserModel.findByIdAndUpdate({_id: idUser}, objUser);
                msg = "Sửa thành công"
            } catch (error) {
                msg = 'Error' + error.message();
                console.log(error);
            }
        // 
    }

    res.render('accounts/edit.ejs',{msg: msg, listUser: listUser, objUser: objUser});
}

exports.deleteUser =async (req,res,next) =>{
    let idUser=req.params.idUser
    try {
       await myMD.UserModel.findByIdAndDelete({_id:idUser}); 
    } catch (error) {
        
    }
    res.redirect('/accounts/list');
}