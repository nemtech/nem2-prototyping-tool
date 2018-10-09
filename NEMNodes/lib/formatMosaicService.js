const { XEM, MosaicHttp, NamespaceHttp, NetworkType } = require('nem2-sdk');
const { of } = require('rxjs');
const operators = require("rxjs/operators");
const mergeMap = operators.mergeMap;
const map = operators.map;
const pipe = operators.pipe;

module.exports = {

    getMosaicsName: function (mosaic, host, network) {
        const mosaicHttp = new MosaicHttp(host, NetworkType[network]);
        const namespaceHttp = new NamespaceHttp(host, NetworkType[network]);

        if (JSON.stringify(mosaic.id.id) === JSON.stringify(XEM.MOSAIC_ID.id)) {
            mosaic.fullName = XEM.MOSAIC_ID.fullName;
            mosaic.amount = mosaic.amount.compact();
            return of(mosaic);
        } else {
            return mosaicHttp
                .getMosaicsName([mosaic.id])
                .pipe(
                    mergeMap(mosaicName => namespaceHttp.getNamespacesName([mosaicName[0].namespaceId]).pipe(
                        map(namespaceName => {
                            mosaic.fullName = namespaceName[0].name + ":" + mosaicName[0].name;
                            mosaic.amount = mosaic.amount.compact();
                            return mosaic;
                        })
                    ))
                );
        }//ToDo get divisibility right
    }
}



