const { AccountInfo } = require('nem2-sdk');
const { Observable } = require('rxjs');

module.exports = {
    formatAccountInfo: function (accountInfo) {
        if (accountInfo instanceof AccountInfo) {
            accountInfo.address = accountInfo.address.pretty();
            accountInfo.addressHeight = accountInfo.addressHeight.compact();
            accountInfo.publicKeyHeight = accountInfo.publicKeyHeight.compact();
            accountInfo.importance = accountInfo.importance.compact();
            accountInfo.importanceHeight = accountInfo.importanceHeight.compact();
        }
        return accountInfo;
    }
}
