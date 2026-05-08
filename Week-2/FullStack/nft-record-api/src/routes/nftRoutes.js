const express = require('express');
const router = express.Router();
const { recordNFT, getNFTs, getNFTByTokenId } = require('../controllers/nftController');

router.post('/record', recordNFT);
router.get('/', getNFTs);
router.get('/:tokenId', getNFTByTokenId);

module.exports = router;
