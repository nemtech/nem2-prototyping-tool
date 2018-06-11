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
var accountNode = require("../../NEMNodes/account/account.js");
var networkConfigNode = require("../../NEMNodes/config/networkConfig.js");

helper.init(require.resolve('node-red'));

describe('account Node', function () {
    afterEach(function () {
        helper.unload();
    });
    const accountInformation = {
        address: 'SCTVW23D2MN5VE4AQ4TZIDZENGNOZXPRPRLIKCF2',
        privateKey: '26b64cb10f005e5988a36744ca19e20d835ccc7c105aaa5f3b212da593180930'.toUpperCase(),
        publicKey: 'c2f93346e27ce6ad1a9f8f5e3066f8326593a406bdf357acb041e2f9ab402efe'.toUpperCase(),
    };

    const unconfiguredFlow =
        [{ id: "n1", type: "networkConfig", network: "MIJIN_TEST" },
        { id: "n2", type: "account", name: "account", network: "n1", wires: [["n3"]] },
        { id: "n3", type: "helper" }];

    const configuredFlow = [
        { id: "n1", type: "networkConfig", network: "MIJIN_TEST" },
        { id: "n2", type: "account", network: "n1", privateKey: accountInformation.privateKey, wires: [["n3"]] },
        { id: "n3", type: "helper" }];

    it('should be loaded', function (done) {
        helper.load([accountNode, networkConfigNode], unconfiguredFlow, function () {
            try {
                var n2 = helper.getNode("n2");
                n2.should.have.property('name', 'account');
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    it('should output an account with address, publicKey and privateKey when receiving a privateKey', function (done) {
        helper.load([accountNode, networkConfigNode], unconfiguredFlow, function () {
            var n2 = helper.getNode("n2");
            var n3 = helper.getNode("n3");
            n3.on("input", function (msg) {
                try {
                    msg.nem.account.address.should.have.property('address', accountInformation.address);
                    msg.nem.account.privateKey.should.be.eql(accountInformation.privateKey);
                    msg.nem.account.publicKey.should.be.eql(accountInformation.publicKey);
                    done();
                } catch (error) {
                    done(error);
                }
            });
            n2.receive({ nem: { privateKey: accountInformation.privateKey } });
        });
    });

    it('should output an account address, publicKey and privateKey when configure a privateKey', function (done) {
        helper.load([accountNode, networkConfigNode], configuredFlow, function () {
            var n2 = helper.getNode("n2");
            var n3 = helper.getNode("n3");
            n3.on("input", function (msg) {
                try {
                    msg.nem.account.address.should.have.property('address', accountInformation.address);
                    msg.nem.account.privateKey.should.be.eql(accountInformation.privateKey);
                    msg.nem.account.publicKey.should.be.eql(accountInformation.publicKey);
                    done();
                } catch (error) {
                    done(error);
                }
            });
            n2.receive();
        });
    });

    it('should output an account address, publicKey from configured privateKey and not from received privateKey', function (done) {
        helper.load([accountNode, networkConfigNode], configuredFlow, function () {
            var n2 = helper.getNode("n2");
            var n3 = helper.getNode("n3");
            n3.on("input", function (msg) {
                try {
                    msg.nem.account.address.should.have.property('address', accountInformation.address);
                    msg.nem.account.privateKey.should.be.eql(accountInformation.privateKey);
                    msg.nem.account.publicKey.should.be.eql(accountInformation.publicKey);
                    done();
                } catch (error) {
                    done(error);
                }
            });
            n2.receive({ nem: { privateKey: "F05662EC1FF53B6AA9B84346917385C7708BE5C355286420D35D911C5D4C8197" } });
        });
    });

    it('should throw exception when the private key is empty', function (done) {
        helper.load([accountNode, networkConfigNode], unconfiguredFlow, function () {
            var n2 = helper.getNode("n2");
            n2.receive();
            try {
                helper.log().called.should.be.true();
                var logEvents = helper.log().args.filter(function (evt) {
                    return evt[0].type == "account";
                });
                logEvents.should.have.length(1);
                var msg = logEvents[0][0];
                msg.should.have.property('level', helper.log().ERROR);
                msg.should.have.property('id', 'n2');
                msg.should.have.property('type', 'account');
                msg.should.have.property('msg', 'private key is empty');
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    it('should throw exception when the private key is wrong', function (done) {
        helper.load([accountNode, networkConfigNode], unconfiguredFlow, function () {
            var n2 = helper.getNode("n2");
            n2.receive({ nem: { privateKey: "123testwrongprivatekey" } });
            try {
                helper.log().called.should.be.true();
                var logEvents = helper.log().args.filter(function (evt) {
                    return evt[0].type == "account";
                });
                logEvents.should.have.length(1);
                var msg = logEvents[0][0];
                msg.should.have.property('level', helper.log().ERROR);
                msg.should.have.property('id', 'n2');
                msg.should.have.property('type', 'account');
                msg.should.have.property('msg', 'private key is not correct : 123testwrongprivatekey');
                done();
            } catch (error) {
                done(error);
            }
        });
    });
});