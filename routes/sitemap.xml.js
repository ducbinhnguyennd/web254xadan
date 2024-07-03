var express = require('express');
var router = express.Router();
var sitemap=require('../controllers/sitemap.controller');

router.get('/sitemap.xml', sitemap.sitemap);
module.exports=router;