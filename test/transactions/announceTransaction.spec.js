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
var announceTransactionNode = require("../../NEMNodes/transactions/announceTransaction.js");
var networkConfigNode = require("../../NEMNodes/config/networkConfig.js");
var serverConfigNode = require("../../NEMNodes/config/serverConfig.js");

helper.init(require.resolve('node-red'));

describe('announceTransaction Node', function () {
    afterEach(function () {
        helper.unload();
    });
    const configuredFlow =
        [{ id: "n1", type: "networkConfig", network: "MIJIN_TEST" },
        { id: "n2", type: "serverConfig", port: 3000, network: "n1" },
        { id: "n3", type: "announce", server: "n2", name: "announce" }];

    it('should be loaded', function (done) {
        var flow =
            helper.load([announceTransactionNode, serverConfigNode, networkConfigNode], configuredFlow, function () {
                var n3 = helper.getNode("n3");
                n3.should.have.property('name', 'announce');
                done();
            });
    });
});