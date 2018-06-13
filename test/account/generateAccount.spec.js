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
var generateAccountNode = require("../../NEMNodes/account/generateAccount.js");
var networkConfigNode = require("../../NEMNodes/config/networkConfig.js");
var validation = require("../../NEMNodes/lib/validation.js")

helper.init(require.resolve('node-red'));

describe('generateAccount Node', function () {
    afterEach(function () {
        helper.unload();
    });
    const configuredFlow =
        [{ id: "n1", type: "networkConfig", network: "MIJIN_TEST" },
        { id: "n2", type: "generateAccount", name: "generateAccount", network: "n1", wires: [["n3"]] },
        { id: "n3", type: "helper" }];

    it('should be loaded', function (done) {
        helper.load([generateAccountNode, networkConfigNode], configuredFlow, function () {
            try {
                var n2 = helper.getNode("n2");
                n2.should.have.property('name', 'generateAccount');
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    it('privateKey should be created', function (done) {
        helper.load([generateAccountNode, networkConfigNode], configuredFlow, function () {
            var n2 = helper.getNode("n2");
            var n3 = helper.getNode("n3");
            n3.on("input", function (msg) {
                try {
                    msg.nem.privateKey.should.match(validation.privateKeyRegExp);
                    done();
                } catch (error) {
                    done(error);
                }
            });
            n2.receive();
        });
    });
});