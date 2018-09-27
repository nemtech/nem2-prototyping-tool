/*
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

module.exports = function (RED) {
    "use strict";

    var operators = {
        'eq': function (a, b) { return a == b; },
        'neq': function (a, b) { return a != b; },
        'lt': function (a, b) { return a < b; },
        'lte': function (a, b) { return a <= b; },
        'gt': function (a, b) { return a > b; },
        'gte': function (a, b) { return a >= b; },
        'btwn': function (a, b, c) { return a >= b && a <= c; },
        'cont': function (a, b) { return (a + "").indexOf(b) != -1; },
        'regex': function (a, b, c, d) { return (a + "").match(new RegExp(b, d ? 'i' : '')); },
        'true': function (a) { return a === true; },
        'false': function (a) { return a === false; },
        'null': function (a) { return (typeof a == "undefined" || a === null); },
        'nnull': function (a) { return (typeof a != "undefined" && a !== null); },
        'empty': function (a) {
            if (typeof a === 'string' || Array.isArray(a) || Buffer.isBuffer(a)) {
                return a.length === 0;
            } else if (typeof a === 'object' && a !== null) {
                return Object.keys(a).length === 0;
            }
            return false;
        },
        'nempty': function (a) {
            if (typeof a === 'string' || Array.isArray(a) || Buffer.isBuffer(a)) {
                return a.length !== 0;
            } else if (typeof a === 'object' && a !== null) {
                return Object.keys(a).length !== 0;
            }
            return false;
        },

        'istype': function (a, b) {
            if (b === "array") { return Array.isArray(a); }
            else if (b === "buffer") { return Buffer.isBuffer(a); }
            else if (b === "json") {
                try { JSON.parse(a); return true; }   // or maybe ??? a !== null; }
                catch (e) { return false; }
            }
            else if (b === "null") { return a === null; }
            else { return typeof a === b && !Array.isArray(a) && !Buffer.isBuffer(a) && a !== null; }
        },
        'else': function (a) { return a === true; }
    };

    function getProperty(node, msg) {
        if (node.propertyType === 'str') {
            try {
                if (node.property) {
                    return node.property;
                } else {
                    return undefined;
                }
            } catch (err) {
                throw new Error(RED._("something whent wrong", { error: err.message }))
            }
        } else {
            try {
                return RED.util.evaluateNodeProperty(node.property, node.propertyType, node, msg);
            } catch (err) {
                return undefined;
            }
        }
    }

    function getV1(node, msg, rule, hasParts) {
        if (rule.vt === 'prev') {
            return node.previousValue;
        } else if (rule.vt === 'null') {
            return "null";
        } else {
            try {
                return RED.util.evaluateNodeProperty(rule.v, rule.vt, node, msg);
            } catch (err) {
                return undefined;
            }
        }
    }

    function getV2(node, msg, rule) {
        var v2 = rule.v2;
        if (rule.v2t === 'prev') {
            return node.previousValue;
        } else if (typeof v2 !== 'undefined') {
            try {
                return RED.util.evaluateNodeProperty(rule.v2, rule.v2t, node, msg);
            } catch (err) {
                return undefined;
            }
        } else {
            return v2;
        }
    }

    function applyRule(node, msg, property, state) {
        var rule = node.rules[state.currentRule];
        var v1 = getV1(node, msg, rule, state.hasParts);
        var v2 = getV2(node, msg, rule);
        if (rule.t == "else") {
            property = state.elseflag;
            state.elseflag = true;
        }
        if (operators[rule.t](property, v1, v2, rule.case, msg.parts)) {
            state.onward.push(msg);
            state.elseflag = false;
            if (node.checkall == "false") {
                return false;
            }
        } else {
            state.onward.push(null);
        }
        return state.currentRule < node.rules.length - 1
    }

    function applyRules(node, msg, property, state) {
        if (!state) {
            state = {
                currentRule: 0,
                elseflag: true,
                onward: [],
                hasParts: msg.hasOwnProperty("parts") &&
                    msg.parts.hasOwnProperty("id") &&
                    msg.parts.hasOwnProperty("index")
            }
        }
        var hasMore = applyRule(node, msg, property, state);
        if (hasMore) {
            state.currentRule++;
            return applyRules(node, msg, property, state);
        } else {
            node.previousValue = property;
            return state.onward;
        }
    }

    function filter(n) {
        RED.nodes.createNode(this, n);
        this.rules = n.rules || [];
        this.property = n.property;
        this.propertyType = n.propertyType || "msg";
        this.arrayProperty = n.arrayProperty;
        this.arrayPropertyCheck = n.arrayPropertyCheck || false;
        this.propertyArry = n.porpertyArray;
        this.checkall = n.checkall || "true"; // ToDo fix that it also work for an array 
        this.previousValue = null;
        var node = this;
        var valid = true;

        for (var i = 0; i < this.rules.length; i += 1) {
            var rule = this.rules[i];
            if (!rule.vt) {
                if (!isNaN(Number(rule.v))) {
                    rule.vt = 'num';
                } else {
                    rule.vt = 'str';
                }
            }
            if (rule.vt === 'num') {
                if (!isNaN(Number(rule.v))) {
                    rule.v = Number(rule.v);
                }
            }
            if (typeof rule.v2 !== 'undefined') {
                if (!rule.v2t) {
                    if (!isNaN(Number(rule.v2))) {
                        rule.v2t = 'num';
                    } else {
                        rule.v2t = 'str';
                    }
                }

                if (rule.v2t === 'num') {
                    rule.v2 = Number(rule.v2);
                }
            }
        }
        if (!valid) {
            return;
        }

        function processMessage(msg) {
            try {
                let property = getProperty(node, msg);
                
                if (Array.isArray(property) && node.arrayPropertyCheck) {
                    if (property.length > 0) {
                        property.forEach(function (element) {
                            if (node.arrayProperty) {
                                const arrayPropertyValue = RED.util.getMessageProperty(element, node.arrayProperty);
                                var onward = applyRules(node, msg, arrayPropertyValue);
                            } else {
                                var onward = applyRules(node, msg, element);
                            }
                            node.send(onward);
                        });
                    } else {
                        var onward = applyRules(node, msg, property);
                        node.send(onward);
                    }
                } else if (!node.arrayPropertyCheck) {
                    var onward = applyRules(node, msg, property);
                    node.send(onward);
                }
            } catch (err) {
                node.warn(err);
            }
        }

        this.on('input', function (msg) {
            processMessage(msg);
        });
    }
    RED.nodes.registerType("filter", filter);
}