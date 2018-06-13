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
var transferTransactionNode = require("../../NEMNodes/transactions/transferTransaction.js");
var networkConfigNode = require("../../NEMNodes/config/networkConfig.js");

helper.init(require.resolve('node-red'));

describe('transferTransaction Node', function () {
    afterEach(function () {
        helper.unload();
    });
    const configuredFlow =
        [{ id: "n1", type: "networkConfig", network: "MIJIN_TEST" },
        { id: "n2", type: "transfer", network: "n1", amount: 1000000, name: "transfer", wires: [["n3"]] },
        { id: "n3", type: "helper" }];

    it('should be loaded', function (done) {
        helper.load([transferTransactionNode, networkConfigNode], configuredFlow, function () {
            var n2 = helper.getNode("n2");
            n2.should.have.property('name', 'transfer');
            done();
        });
    });

    it('should generate a transferTransaction', function (done) {
        helper.load([transferTransactionNode, networkConfigNode], configuredFlow, function () {
            var n2 = helper.getNode("n2");
            var n3 = helper.getNode("n3");
            n3.on("input", function (msg) {
                msg.nem.transaction.type.should.be.eql(16724);
                msg.nem.transaction.networkType.should.be.eql(144);
                msg.nem.transaction.recipient.address.should.be.eql("SCTVW23D2MN5VE4AQ4TZIDZENGNOZXPRPRLIKCF2");
                msg.nem.transaction.mosaics[0].id.fullName.should.be.eql("nem:xem");
                msg.nem.transaction.mosaics[0].amount.should.be.eql({ lower: 1000000, higher: 0 })
                done();
            });
            n2.receive({ nem: { message: "testMessage", address: "SCTVW23D2MN5VE4AQ4TZIDZENGNOZXPRPRLIKCF2", mosaic: "nem:xem" } });
        });
    });

    it('should throw exception when the address is wrong', function (done) {
        helper.load([transferTransactionNode, networkConfigNode], configuredFlow, function () {
            var n2 = helper.getNode("n2");
            n2.receive({ nem: { message: "testMessage", address: "SCTVWD2MN5V-E4AQ4TZIDZENGNO/ZXPRPRLIKCF2", mosaic: "nem:xem" } });
            try {
                helper.log().called.should.be.true();
                var logEvents = helper.log().args.filter(function (evt) {
                    return evt[0].type == "transfer";
                });
                logEvents.should.have.length(1);
                var msg = logEvents[0][0];
                msg.should.have.property('level', helper.log().ERROR);
                msg.should.have.property('id', 'n2');
                msg.should.have.property('type', 'transfer');
                msg.should.have.property('msg', 'address: "SCTVWD2MN5V-E4AQ4TZIDZENGNO/ZXPRPRLIKCF2" is not correct');
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    it('should throw exception when the mosaic is wrong', function (done) {
        helper.load([transferTransactionNode, networkConfigNode], configuredFlow, function () {
            var n2 = helper.getNode("n2");
            n2.receive({ nem: { message: "testMessage", address: "SCTVW23D2MN5VE4AQ4TZIDZENGNOZXPRPRLIKCF2", mosaic: "nemxem" } });
            try {
                helper.log().called.should.be.true();
                var logEvents = helper.log().args.filter(function (evt) {
                    return evt[0].type == "transfer";
                });
                logEvents.should.have.length(1);
                var msg = logEvents[0][0];
                msg.should.have.property('level', helper.log().ERROR);
                msg.should.have.property('id', 'n2');
                msg.should.have.property('type', 'transfer');
                msg.should.have.property('msg', 'mosaic: "nemxem"  is not correct');
                done();
            } catch (error) {
                done(error);
            }
        });
    });


});