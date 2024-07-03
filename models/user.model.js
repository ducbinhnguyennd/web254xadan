var db = require('./db');
//khởi tạo khuôn mẫu cho model
const User = new db.mongoose.Schema(
    {
        //định nghĩa cấu trúc đối tượng sản phẩm
        ten: { type: String, require: true},
        email:{ type:String,require: true},
        sdt: {type: Number, require:true},
        passwrd: {type: String, require: true}
    },
    {
        collection: 'User'
    }
);
//nếu định nghĩa về thể loại thì viết bên dưới, ko cần tạo mới file
//--------------------------------------------------------------
//tạo model
let UserModel = db.mongoose.model('UserModel', User);
module.exports = {UserModel};