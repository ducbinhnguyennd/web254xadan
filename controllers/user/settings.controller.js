var md = require('../../models/user.model')
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {

    let msg = ' ';
    if(req.method == 'POST'){
        console.log(req.body);
        // kiem tra hop  le
        if(req.body.passwrd != req.body.passwrd2){
            msg = 'Xác nhận pasword không hợp lệ';
            return  res.render('settings/register', {msg: msg});
        }


        let objU = md.UserModel();
        objU.ten = req.body.ten;
        objU.email = req.body.email;
        objU.sdt = req.body.sdt;
        objU.passwrd = req.body.passwrd;
        
        try {
            await objU.save();
            msg = 'Đăng ký thành công';
        } catch (error) {
            msg = error.messgage;
        }

    }


    res.render('settings/register', {msg: msg});
}

exports.login = async (req, res, next) => {

    let msg = ' ';
    if(req.method == 'POST'){
        //  lấy thông  tin dựa vào username
        try {        
            let objU =  await md.UserModel.findOne({ten: req.body.ten}); // findOne la tim 1 doi tuong
            console.log(objU);

            if(req.body.ten == ""  ){
            
                msg= 'mời nhập tên đăng nhập';

            }else{
                if(objU != null){
                    // có tồn tại user == kiểm tra password
                    if(objU.passwrd == req.body.passwrd){
                        const token = jwt.sign({ userId: objU._id }, 'mysecretkey', { expiresIn: '10m' });
                        req.session.userLogin = objU;
                        req.session.token = token;
                        return res.redirect('/main');
                    }else{
                        msg = 'sai password';
                    }
                }else{
                    msg = 'User không tồn tại: '+ req.body.ten;
                }
                
            }

        } catch (error) {
           
        }
    }

    
    res.render('settings/login', {msg: msg});
}