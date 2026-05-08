const NFTRecord = require('../models/NFTRecord');

// @desc    Register a new NFT mint record
// @route   POST /api/nfts/record
exports.recordNFT = async (req, res) => {
    try {
        const { tokenId, ownerAddress, metadataURI, transactionHash, contractAddress } = req.body;

        const newRecord = new NFTRecord({
            tokenId,
            ownerAddress,
            metadataURI,
            transactionHash,
            contractAddress
        });

        await newRecord.save();
        res.status(201).json({ success: true, data: newRecord });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Get all NFT records
// @route   GET /api/nfts
exports.getNFTs = async (req, res) => {
    try {
        const records = await NFTRecord.find().sort({ mintedAt: -1 });
        res.status(200).json({ success: true, count: records.length, data: records });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get NFT record by tokenId
// @route   GET /api/nfts/:tokenId
exports.getNFTByTokenId = async (req, res) => {
    try {
        const record = await NFTRecord.findOne({ tokenId: req.params.tokenId });
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }
        res.status(200).json({ success: true, data: record });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
