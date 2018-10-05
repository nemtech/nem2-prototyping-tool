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
var filterNode = require("../../NEMNodes/utility/filter.js");

helper.init(require.resolve('node-red'));

describe('filter Node', function () {
    afterEach(function () {
        helper.unload();
    });
    const unconfiguredFlow = [
        { id: "n1", type: "filter", name: "filter", wires: [["n2"]] },
        { id: "n2", type: "helper" }];

    it('should be loaded', function (done) {
        helper.load([filterNode], unconfiguredFlow, function () {
            try {
                var n1 = helper.getNode("n1");
                n1.should.have.property('name', 'filter');
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    function genericFilterTest(rule, ruleWith, aCheckall, shouldReceive, sendPayload, arrayPropertyCheck, arraProperty, done) {
        var flow = [{ id: "filterNode", type: "filter", name: "filter", property: "payload", rules: [{ "t": rule, "v": ruleWith }], checkall: aCheckall, outputs: 1, arrayPropertyCheck: arrayPropertyCheck, arrayProperty: arraProperty, wires: [["helperNode"]] },
        { id: "helperNode", type: "helper", wires: [] }];
        customFlowFilterTest(flow, shouldReceive, sendPayload, done);
    }

    function twoFieldFilterTest(rule, ruleWith, ruleWith2, aCheckall, shouldReceive, sendPayload, arrayPropertyCheck, arraProperty, done) {
        var flow = [{ id: "filterNode", type: "filter", name: "filter", property: "payload", rules: [{ "t": rule, "v": ruleWith, "v2": ruleWith2 }], checkall: aCheckall, outputs: 1, arrayPropertyCheck: arrayPropertyCheck, arrayProperty: arraProperty, wires: [["helperNode"]] },
        { id: "helperNode", type: "helper", wires: [] }];
        customFlowFilterTest(flow, shouldReceive, sendPayload, done);
    }

    function customFlowFilterTest(flow, shouldReceive, sendPayload, done) {
        helper.load([filterNode], flow, function () {
            var filterNode = helper.getNode("filterNode");
            var helperNode = helper.getNode("helperNode");
            helperNode.on("input", function (msg) {
                try {
                    if (shouldReceive === true) {
                        should.equal(msg.payload, sendPayload);
                        done();
                    } else {
                        should.fail(null, null, "We should never get an input!");
                    }
                } catch (err) {
                    done(err);
                }
            });
            filterNode.receive({ payload: sendPayload });
            if (shouldReceive === false) {
                setTimeout(function () {
                    done();
                }, 200);
            }
        });
    }

    it('should check if payload equals given value', function (done) {
        genericFilterTest("eq", "Hello", true, true, "Hello", false, "", done);
    });
    it('should return nothing when the payload doesn\'t equal to desired string', function (done) {
        genericFilterTest("eq", "Hello", true, false, "Hello!", false, "", done);
    });
    it('should check if payload NOT equals given value', function (done) {
        genericFilterTest("neq", "Hello", true, true, "HEllO", false, "", done);
    });
    it('should return nothing when the payload does equal to desired string', function (done) {
        genericFilterTest("neq", "Hello", true, false, "Hello", false, "", done);
    });

    it('should check if payload equals given numeric value', function (done) {
        genericFilterTest("eq", 3, true, true, 3, false, "", done);
    });

    it('should return nothing when the payload doesn\'t equal to desired numeric value', function (done) {
        genericFilterTest("eq", 2, true, false, 4, false, "", done);
    });

    it('should check if payload NOT equals given numeric value', function (done) {
        genericFilterTest("neq", 55667744, true, true, -1234, false, "", done);
    });

    it('should return nothing when the payload does equal to desired numeric value', function (done) {
        genericFilterTest("neq", 10, true, false, 10, false, "", done);
    });

    it('should check if payload is less than given value', function (done) {
        genericFilterTest("lt", 3, true, true, 2, false, "", done);
    });

    it('should return nothing when the payload is not less than desired string', function (done) {
        genericFilterTest("lt", 3, true, false, 4, false, "", done);
    });

    it('should check if payload less than equals given value', function (done) {
        genericFilterTest("lte", 3, true, true, 3, false, "", done);
    });

    it('should check if payload is greater than given value', function (done) {
        genericFilterTest("gt", 3, true, true, 6, false, "", done);
    });

    it('should return nothing when the payload is not greater than desired string', function (done) {
        genericFilterTest("gt", 3, true, false, -1, false, "", done);
    });

    it('should check if payload is greater than/equals given value', function (done) {
        genericFilterTest("gte", 3, true, true, 3, false, "", done);
    });

    it('should return nothing when the payload is not greater than desired string', function (done) {
        genericFilterTest("gt", 3, true, false, -1, false, "", done);
    });

    it('should check if payload is greater than/equals given value', function (done) {
        genericFilterTest("gte", 3, true, true, 3, false, "", done);
    });

    it('should check if payload is between given values', function (done) {
        twoFieldFilterTest("btwn", 3, 5, true, true, 4, false, "", done);
    });

    it('should check if payload is between given string values', function (done) {
        twoFieldFilterTest("btwn", "c", "e", true, true, "d", false, "", done);
    });

    it('should check if payload is not between given values', function (done) {
        twoFieldFilterTest("btwn", 3, 5, true, false, 12, false, "", done);
    });

    it('should check if payload contains given value', function (done) {
        genericFilterTest("cont", "Hello", true, true, "Hello World!", false, "", done);
    });

    it('should return nothing when the payload doesn\'t contain desired string', function (done) {
        genericFilterTest("cont", "Hello", true, false, "This is not a greeting!", false, "", done);
    });

    it('should match regex', function (done) {
        genericFilterTest("regex", "[abc]+", true, true, "abbabac", false, "", done);
    });

    it('stops after first statement', function (done) {
        var flow = [{ id: "filterNode", type: "filter", name: "filter", property: "payload", rules: [{ "t": "eq", "v": "Hello" }, { "t": "cont", "v": "ello" }, { "t": "else" }], checkall: "false", outputs: 3, wires: [["helperNode1"], ["helperNode2"], ["helperNode3"]] },
        { id: "helperNode1", type: "helper", wires: [] },
        { id: "helperNode2", type: "helper", wires: [] },
        { id: "helperNode3", type: "helper", wires: [] }];

        helper.load(filterNode, flow, function () {
            var filterNode = helper.getNode("filterNode");
            var helperNode1 = helper.getNode("helperNode1");
            var helperNode2 = helper.getNode("helperNode2");
            var helperNode3 = helper.getNode("helperNode3");

            helperNode1.on("input", function (msg) {
                try {
                    msg.payload.should.equal("Hello");
                    done();
                } catch (err) {
                    done(err);
                }
            });
            helperNode2.on("input", function (msg) {
                try {
                    should.fail(null, null, "The otherwise/else statement should not be triggered here!");
                } catch (err) {
                    done(err);
                }
            });
            helperNode3.on("input", function (msg) {
                try {
                    should.fail(null, null, "The otherwise/else statement should not be triggered here!");
                } catch (err) {
                    done(err);
                }
            });
            filterNode.receive({ payload: "Hello" });
        });
    });
//ToDo test array functionality
});