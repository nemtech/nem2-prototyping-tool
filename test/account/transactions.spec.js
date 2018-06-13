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
var transactionsNode = require("../../NEMNodes/account/transactions.js");
var networkConfigNode = require("../../NEMNodes/config/networkConfig.js");
var serverConfigNode = require("../../NEMNodes/config/serverConfig.js");

helper.init(require.resolve('node-red'));

describe('transactions Node', function () {
    afterEach(function () {
        helper.unload();
    });
    const unconfiguredFlow =
        [{ id: "n1", type: "networkConfig", network: "MIJIN_TEST" },
        { id: "n2", type: "serverConfig", port: 3000, customUrl: "http://testnet.com", network: "n1" },
        { id: "n3", type: "transactions", server: "n2", name: "transactions" }];

    it('should be loaded', function (done) {
        helper.load([transactionsNode, serverConfigNode, networkConfigNode], unconfiguredFlow, function () {
            try {
                var n3 = helper.getNode("n3");
                n3.should.have.property('name', 'transactions');
                n3.should.have.property('host', 'http://testnet.com:3000');
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    it('should throw exception when the publicKey is wrong', function (done) {
        helper.load([transactionsNode, serverConfigNode, networkConfigNode], unconfiguredFlow, function () {
            var n3 = helper.getNode("n3");
            n3.receive({ nem: { publicKey: "thispublickeyistoshort41e2f9ab402efe" } });
            try {
                helper.log().called.should.be.true();
                var logEvents = helper.log().args.filter(function (evt) {
                    return evt[0].type == "transactions";
                });
                logEvents.should.have.length(1);
                var msg = logEvents[0][0];
                msg.should.have.property('level', helper.log().ERROR);
                msg.should.have.property('id', 'n3');
                msg.should.have.property('type', 'transactions');
                msg.should.have.property('msg', 'public key is not correct : thispublickeyistoshort41e2f9ab402efe');
                done();
            } catch (error) {
                done(error);
            }
        });
    });
});