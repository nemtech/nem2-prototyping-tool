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
var networkConfigNode = require("../../NEMNodes/config/networkConfig.js");
var signTransactionNode = require("../../NEMNodes/account/signTransaction.js");
var transferTransactionNode = require("../../NEMNodes/transactions/transferTransaction.js");

helper.init(require.resolve('node-red'));

describe('signTransaction Node', function () {
    afterEach(function () {
        helper.unload();
    });
    const accountInformation = {
        address: 'SCTVW23D2MN5VE4AQ4TZIDZENGNOZXPRPRLIKCF2',
        privateKey: '26b64cb10f005e5988a36744ca19e20d835ccc7c105aaa5f3b212da593180930'.toUpperCase(),
        publicKey: 'c2f93346e27ce6ad1a9f8f5e3066f8326593a406bdf357acb041e2f9ab402efe'.toUpperCase(),
    };
    const configuredFlow =
        [{ id: "n1", type: "networkConfig", network: "MIJIN_TEST" },
        { id: "n2", type: "transfer", network: "n1", message: "test", recipient: "SA2EOQ-VTHO7V-RU2CS7-KE3TIX-KWZQ2D-HZF3J3-DPBU", amount: 1000, mosaic: "nem:xem", wires: [["n3"]] },
        { id: "n3", type: "signTransaction", network: "n1", privateKey: accountInformation.privateKey, name: "signTransaction", wires: [["n4"]] },
        { id: "n4", type: "helper" }];
    const unconfiguredWithTransactionFlow =
        [{ id: "n1", type: "networkConfig", network: "MIJIN_TEST" },
        { id: "n2", type: "transfer", network: "n1", message: "test", recipient: "SA2EOQ-VTHO7V-RU2CS7-KE3TIX-KWZQ2D-HZF3J3-DPBU", amount: 1000, mosaic: "nem:xem", wires: [["n3"]] },
        { id: "n3", type: "signTransaction", network: "n1", name: "signTransaction", wires: [["n4"]] },
        { id: "n4", type: "helper" }];
    const unconfiguredFlow =
        [{ id: "n1", type: "networkConfig", network: "MIJIN_TEST" },
        { id: "n2", type: "signTransaction", network: "n1", name: "signTransaction" }];

    it('should be loaded', function (done) {
        helper.load([signTransactionNode, networkConfigNode], unconfiguredFlow, function () {
            try {
                var n2 = helper.getNode("n2");
                n2.should.have.property('name', 'signTransaction');
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    it('should sign a transaction when configure a privateKey', function (done) {
        helper.load([signTransactionNode, transferTransactionNode, networkConfigNode], configuredFlow, function () {
            var n2 = helper.getNode("n2");
            var n3 = helper.getNode("n4");
            n3.on("input", function (msg) {
                try {
                    msg.nem.signedTransaction.signer.should.be.eql(accountInformation.publicKey);
                    done();
                } catch (error) {
                    done(error);
                }
            });
            n2.receive();
        });
    });

    it('should sign a transaction when receive a privateKey', function (done) {
        helper.load([signTransactionNode, transferTransactionNode, networkConfigNode], unconfiguredWithTransactionFlow, function () {
            var n2 = helper.getNode("n2");
            var n3 = helper.getNode("n4");
            n3.on("input", function (msg) {
                try {
                    msg.nem.signedTransaction.signer.should.be.eql(accountInformation.publicKey);
                    done();
                } catch (error) {
                    done(error);
                }
            });
            n2.receive({ nem: { privateKey: accountInformation.privateKey } });
        });
    });

    it('should throw exception when the private key is wrong', function (done) {
        helper.load([signTransactionNode, transferTransactionNode, networkConfigNode], unconfiguredWithTransactionFlow, function () {
            var n2 = helper.getNode("n2");
            n2.receive({ nem: { privateKey: "123testwrongprivatekey" } });
            try {
                helper.log().called.should.be.true();
                var logEvents = helper.log().args.filter(function (evt) {
                    return evt[0].type == "signTransaction";
                });
                logEvents.should.have.length(1);
                var msg = logEvents[0][0];
                msg.should.have.property('level', helper.log().ERROR);
                msg.should.have.property('id', 'n3');
                msg.should.have.property('type', 'signTransaction');
                msg.should.have.property('msg', 'private key is not correct : 123testwrongprivatekey');
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    it('should throw exception when the transaction is wrong when no transaction is received', function (done) {
        helper.load([signTransactionNode, networkConfigNode], unconfiguredFlow, function () {
            var n2 = helper.getNode("n2");
            n2.receive({ nem: { privateKey: accountInformation.privateKey } });
            try {
                helper.log().called.should.be.true();
                var logEvents = helper.log().args.filter(function (evt) {
                    return evt[0].type == "signTransaction";
                });
                logEvents.should.have.length(1);
                var msg = logEvents[0][0];
                msg.should.have.property('level', helper.log().ERROR);
                msg.should.have.property('id', 'n2');
                msg.should.have.property('type', 'signTransaction');
                msg.should.have.property('msg', 'something went wrong with the transaction');
                done();
            } catch (error) {
                done(error);
            }
        });
    });
});