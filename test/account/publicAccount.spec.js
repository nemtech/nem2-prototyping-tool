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
var publicAccountNode = require("../../NEMNodes/account/publicAccount.js");
var networkConfigNode = require("../../NEMNodes/config/networkConfig.js");


helper.init(require.resolve('node-red'));

describe('publicAccount Node', function () {
    afterEach(function () {
        helper.unload();
    });
    const accountInformation = {
        address: 'SCTVW23D2MN5VE4AQ4TZIDZENGNOZXPRPRLIKCF2',
        publicKey: 'c2f93346e27ce6ad1a9f8f5e3066f8326593a406bdf357acb041e2f9ab402efe'.toUpperCase(),
    };
    const unconfiguredFlow =
        [{ id: "n1", type: "networkConfig", network: "MIJIN_TEST" },
        { id: "n2", type: "publicAccount", network: "n1", name: "publicAccount", wires: [["n3"]] },
        { id: "n3", type: "helper" }];
    const configuredFlow =
        [{ id: "n1", type: "networkConfig", network: "MIJIN_TEST" },
        { id: "n2", type: "publicAccount", network: "n1", publicKey: accountInformation.publicKey, wires: [["n3"]] },
        { id: "n3", type: "helper" }];

    it('should be loaded', function (done) {
        helper.load([publicAccountNode, networkConfigNode], unconfiguredFlow, function () {
            try {
                var n2 = helper.getNode("n2");
                n2.should.have.property('name', 'publicAccount');
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    it('should output an address and publicKey when receiving a publicKey', function (done) {
        helper.load([publicAccountNode, networkConfigNode], unconfiguredFlow, function () {
            var n2 = helper.getNode("n2");
            var n3 = helper.getNode("n3");
            n3.on("input", function (msg) {
                try {
                    msg.nem.publicAccount.address.should.have.property('address', accountInformation.address);
                    msg.nem.publicAccount.publicKey.should.be.eql(accountInformation.publicKey);
                    done();
                } catch (error) {
                    done(error);
                }
            });
            n2.receive({ nem: { publicKey: accountInformation.publicKey } });
        });
    });

    it('should output an address and publicKey when configure a publicKey', function (done) {
        helper.load([publicAccountNode, networkConfigNode], configuredFlow, function () {
            var n2 = helper.getNode("n2");
            var n3 = helper.getNode("n3");
            n3.on("input", function (msg) {
                try {
                    msg.nem.publicAccount.address.should.have.property('address', accountInformation.address);
                    msg.nem.publicAccount.publicKey.should.be.eql(accountInformation.publicKey);
                    done();
                } catch (error) {
                    done(error);
                }
            });
            n2.receive();
        });
    });

    it('should throw exception when the publicKey is wrong', function (done) {
        helper.load([publicAccountNode, networkConfigNode], unconfiguredFlow, function () {
            var n2 = helper.getNode("n2");
            n2.receive({ nem: { publicKey: "thispublickeyistoshort41e2f9ab402efe" } });
            try {
                helper.log().called.should.be.true();
                var logEvents = helper.log().args.filter(function (evt) {
                    return evt[0].type == "publicAccount";
                });
                logEvents.should.have.length(1);
                var msg = logEvents[0][0];
                msg.should.have.property('level', helper.log().ERROR);
                msg.should.have.property('id', 'n2');
                msg.should.have.property('type', 'publicAccount');
                msg.should.have.property('msg', 'public key is not correct : thispublickeyistoshort41e2f9ab402efe');
                done();
            } catch (error) {
                done(error);
            }
        });
    });
});