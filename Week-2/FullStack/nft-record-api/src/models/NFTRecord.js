const mongoose = require('mongoose');

const NFTRecordSchema = new mongoose.Schema({
    tokenId: {
        type: Number,
        required: true,
        unique: true
    },
    ownerAddress: {
        type: String,
        required: true
    },
    metadataURI: {
        type: String,
        required: true
    },
    transactionHash: {
        type: String,
        required: true
    },
    contractAddress: {
        type: String,
        required: true
    },
    mintedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('NFTRecord', NFTRecordSchema);
