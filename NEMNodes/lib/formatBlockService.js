const { BlockInfo, Deadline } = require('nem2-sdk');
const {formatNetworkType, formatTime} = require('../lib/utilityFormat');
module.exports = {
    formatBlock: function (block) {
        if (block instanceof BlockInfo) {
            block.networkType = formatNetworkType(block.networkType);
            block.totalFee = block.totalFee.compact();
            block.signer.address = block.signer.address.pretty();
            block.height = block.height.compact();
            block.timestamp = formatTime(block.timestamp.compact());
            block.difficulty = block.difficulty.compact();
        }
        return block;
    }
}
