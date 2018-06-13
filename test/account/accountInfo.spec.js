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
var accountInfoNode = require("../../NEMNodes/account/accountInfo.js");
var networkConfigNode = require("../../NEMNodes/config/networkConfig.js");
var serverConfigNode = require("../../NEMNodes/config/serverConfig.js");


helper.init(require.resolve('node-red'));

describe('accountInfo Node', function () {
    afterEach(function () {
        helper.unload();
    });
    const configuredFlow =
        [{ id: "n1", type: "networkConfig", network: "MIJIN_TEST" },
        { id: "n2", type: "serverConfig", port: 3000, customUrl: "http://testnet.com", network: "n1" },
        { id: "n3", type: "accountInfo", server: "n2", accountType: "account", address: "SDXRCU-O5NIDO-T2Z2YZ-4R4DEC-G55JK2-PTX56Y-FTIJ", name: "accountInfo" }];

    const unconfiguredFlow =
        [{ id: "n1", type: "networkConfig", network: "MIJIN_TEST" },
        { id: "n2", type: "serverConfig", port: 3000, customUrl: "http://testnet.com", network: "n1" },
        { id: "n3", type: "accountInfo", server: "n2", accountType: "account", name: "accountInfo" }];

    it('should be loaded', function (done) {
        helper.load([accountInfoNode, serverConfigNode, networkConfigNode], configuredFlow, function () {
            try {
                var n3 = helper.getNode("n3");
                n3.should.have.property('name', 'accountInfo');
                n3.should.have.property('host', 'http://testnet.com:3000');
                n3.should.have.property('address', 'SDXRCU-O5NIDO-T2Z2YZ-4R4DEC-G55JK2-PTX56Y-FTIJ');
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    it('should throw exception when the address is wrong', function (done) {
        helper.load([accountInfoNode, serverConfigNode, networkConfigNode], unconfiguredFlow, function () {
            var n3 = helper.getNode("n3");
            n3.receive({ nem: { address: "SDXRCU-wrongaddress-G55JK2-PTX56Y-FTIJ" } });
            try {
                helper.log().called.should.be.true();
                var logEvents = helper.log().args.filter(function (evt) {
                    return evt[0].type == "accountInfo";
                });
                logEvents.should.have.length(1);
                var msg = logEvents[0][0];
                msg.should.have.property('level', helper.log().ERROR);
                msg.should.have.property('id', 'n3');
                msg.should.have.property('type', 'accountInfo');
                msg.should.have.property('msg', 'address is wrong SDXRCU-wrongaddress-G55JK2-PTX56Y-FTIJ');
                done();
            } catch (error) {
                done(error);
            }
        });
    });
});