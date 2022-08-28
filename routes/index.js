const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const twitterController = require('../controllers/twitter.controller');


router.route('/api/v1/twitter').get(twitterController.getStreamFromDB);
router.route('/api/v1/twitter/loadStream').get(twitterController.getStream);
router.route('/api/v1/twitter/test').get(twitterController.test)
router.route('/api/v1/telegram').get(twitterController.getStreamForTelegram)



module.exports = router;