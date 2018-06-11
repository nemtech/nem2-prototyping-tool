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
var secretProofTransactionNode = require("../../NEMNodes/transactions/secretProofTransaction.js");
var networkConfigNode = require("../../NEMNodes/config/networkConfig.js");

helper.init(require.resolve('node-red'));

describe('secretProofTransaction Node', function () {
    afterEach(function () {
        helper.unload();
    });

    it('should be loaded', function (done) {
        var flow = [
            { id: "n1", type: "networkConfig" },
            { id: "n2", type: "secretProof", network: "n1", name: "secretProof" }];
        helper.load([secretProofTransactionNode, networkConfigNode], flow, function () {
            var n2 = helper.getNode("n2");
            n2.should.have.property('name', 'secretProof');
            done();
        });
    });
});