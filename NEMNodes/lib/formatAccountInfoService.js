const { AccountInfo } = require('nem2-sdk');
//const { Observable, from, of } = require('rxjs');
//const formatMosaics = require('../lib/formatMosaicService');
//const map = operators.map;
module.exports = {
    formatAccountInfo: function (accountInfo, host, network) {
        if (accountInfo instanceof AccountInfo) {
            accountInfo.address = accountInfo.address.pretty();
            accountInfo.addressHeight = accountInfo.addressHeight.compact();
            accountInfo.publicKeyHeight = accountInfo.publicKeyHeight.compact();
            accountInfo.importance = accountInfo.importance.compact();
            accountInfo.importanceHeight = accountInfo.importanceHeight.compact();
        }
        return accountInfo;
    }//ToDo get mosaicNames
}
