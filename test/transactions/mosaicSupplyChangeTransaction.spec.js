/*
 * Copyright 2018 NEM
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var should = require("should");
var helper = require("node-red-node-test-helper/index.js");
var mosaicSupplyChangeTransactionNode = require("../../NEMNodes/transactions/mosaicSupplyChangeTransaction.js");
var networkConfigNode = require("../../NEMNodes/config/networkConfig.js");

helper.init(require.resolve('node-red'));

describe('mosaicSupplyChangeTransaction Node', function () {
    afterEach(function () {
        helper.unload();
    });
    const unconfirmedFlow =
        [{ id: "n1", type: "networkConfig" },
        { id: "n2", type: "mosaicSupplyChange", network: "n1", name: "mosaicSupplyChange" }];
   
        it('should be loaded', function (done) {
        helper.load([mosaicSupplyChangeTransactionNode, networkConfigNode], unconfirmedFlow, function () {
            var n2 = helper.getNode("n2");
            n2.should.have.property('name', 'mosaicSupplyChange');
            done();
        });
    });

    it('should throw exception when the mosaic is wrong', function (done) {
        helper.load([mosaicSupplyChangeTransactionNode, networkConfigNode], unconfirmedFlow, function () {
            var n2 = helper.getNode("n2");
            n2.receive({ nem: { mosaic: "wrongmo$aic.wrong::token" } });
            try {
                helper.log().called.should.be.true();
                var logEvents = helper.log().args.filter(function (evt) {
                    return evt[0].type == "mosaicSupplyChange";
                });
                logEvents.should.have.length(1);
                var msg = logEvents[0][0];
                msg.should.have.property('level', helper.log().ERROR);
                msg.should.have.property('id', 'n2');
                msg.should.have.property('type', 'mosaicSupplyChange');
                msg.should.have.property('msg', 'mosaic: "wrongmo$aic.wrong::token" is not correct');
                done();
            } catch (error) {
                done(error);
            }
        });
    });
});