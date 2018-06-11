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
var cosignatureTransactionNode = require("../../NEMNodes/transactions/cosignatureTransaction.js");
var networkConfigNode = require("../../NEMNodes/config/networkConfig.js");

helper.init(require.resolve('node-red'));

describe('cosignatureTransaction Node', function () {
    afterEach(function () {
        helper.unload();
    });
    const configuredFlow =
        [{ id: "n1", type: "networkConfig" },
        { id: "n2", type: "cosignature", network: "n1", name: "cosignature" }];

    it('should be loaded', function (done) {
        helper.load([cosignatureTransactionNode, networkConfigNode], configuredFlow, function () {
            var n2 = helper.getNode("n2");
            n2.should.have.property('name', 'cosignature');
            done();
        });
    });
});