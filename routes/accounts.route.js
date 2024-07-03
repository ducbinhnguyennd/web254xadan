var express = require('express');
var router = express.Router();

var accountsController = require('../controllers/user/accounts.controlller');


router.get('/list', accountsController.list);
router.post('/list', accountsController.list);


router.get('/accounts/edit/:idUser', accountsController.edit);
router.post('/accounts/edit/:idUser', accountsController.edit);

router.get('/accounts/deleteUser/:idUser', accountsController.deleteUser);
router.post('/accounts/deleteUser/:idUser', accountsController.deleteUser);

module.exports = router;