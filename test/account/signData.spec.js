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
var signDataNode = require("../../NEMNodes/account/signData.js");


helper.init(require.resolve('node-red'));

describe('signData Node', function () {
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
        { id: "n2", type: "signData", network: "n1", privateKey: accountInformation.privateKey, data: "test", wires: [["n3"]] },
        { id: "n3", type: "helper" }];

    const configuredInject = [{ id: "n1", type: "networkConfig", network: "MIJIN_TEST" },
    { id: "n2", type: "signData", network: "n1", privateKey: accountInformation.privateKey, wires: [["n3"]] },
    { id: "n3", type: "helper" }];

    const unconfiguredFlow =
        [{ id: "n1", type: "networkConfig", network: "MIJIN_TEST" },
        { id: "n2", type: "signData", network: "n1", name: "signData" }];

    it('should be loaded', function (done) {
        helper.load([signDataNode, networkConfigNode], unconfiguredFlow, function () {
            try {
                var n2 = helper.getNode("n2");
                n2.should.have.property('name', 'signData');
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    it('should sign the data', function (done) {
        helper.load([signDataNode, networkConfigNode], configuredFlow, function () {
            var n2 = helper.getNode("n2");
            var n3 = helper.getNode("n3");
            n3.on("input", function (msg) {
                try {
                    msg.nem.dataSignature.signature.should.be.eql("629829DECE834E7D9C4D69EF53916CE4B761BCE49330981CD08A23E3BC4F66F6F6B3B413BD5829610D5D928188D26E8542A00A927C1264FF8F2B5A2FCF422008");
                    done();
                } catch (error) {
                    done(error);
                }
            });
            n2.receive();
        });
    });

    it('should sign the payload when receiving the payload', function (done) {
        helper.load([signDataNode, networkConfigNode], configuredInject, function () {
            var n2 = helper.getNode("n2");
            var n3 = helper.getNode("n3");
            n3.on("input", function (msg) {
                try {
                    msg.nem.dataSignature.signature.should.be.eql("629829DECE834E7D9C4D69EF53916CE4B761BCE49330981CD08A23E3BC4F66F6F6B3B413BD5829610D5D928188D26E8542A00A927C1264FF8F2B5A2FCF422008");
                    done();
                } catch (error) {
                    done(error);
                }
            });
            n2.receive({ payload: "test" });
        });
    });

    it('should throw exception when the private key is wrong and data is missing', function (done) {
        helper.load([signDataNode, networkConfigNode], unconfiguredFlow, function () {
            var n2 = helper.getNode("n2");
            n2.receive({ nem: { privateKey: "123testwrongprivatekey" } });
            try {
                helper.log().called.should.be.true();
                var logEvents = helper.log().args.filter(function (evt) {
                    return evt[0].type == "signData";
                });
                logEvents.should.have.length(1);
                var msg = logEvents[0][0];
                msg.should.have.property('level', helper.log().ERROR);
                msg.should.have.property('id', 'n2');
                msg.should.have.property('type', 'signData');
                msg.should.have.property('msg', 'privateKey is empty or not correct:123testwrongprivatekey, data is empty');
                done();
            } catch (error) {
                done(error);
            }
        });
    });
});