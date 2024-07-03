var express = require('express');
var router = express.Router();
var api_user = require('../controllers/api/account.api');

router.get('/users',api_user.list);

module.exports = router;