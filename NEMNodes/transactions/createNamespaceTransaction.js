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

module.exports = function (RED) {
    const { RegisterNamespaceTransaction, Deadline, UInt64, NetworkType } = require('nem2-sdk');
    const validation = require('../lib/validation');
    function createNamespace(config) {
        RED.nodes.createNode(this, config);
        this.namespace = config.namespace;
        this.duration = config.duration;
        this.network = RED.nodes.getNode(config.network).network;
        const node = this;

        this.on('input', function (msg) {
            try {
                if (typeof msg.nem === "undefined") {
                    msg.nem = {};
                }
                const namespace = node.namespace || msg.nem.namespace;
                const network = node.network || msg.nem.network;
                if (validation.namespaceValidate(namespace)) {
                    const registerNamespaceTransaction = RegisterNamespaceTransaction.createRootNamespace(
                        Deadline.create(),
                        namespace,
                        UInt64.fromUint(node.duration),
                        NetworkType[network]
                    );
                    msg.nem.transaction = registerNamespaceTransaction;
                    msg.nem.transactionType = "createNamespace";
                    node.send(msg);
                }
                else {
                    node.error("namespace is not correct: " + namespace, msg);
                }

            } catch (error) {
                node.error(error);
            }
        });
    }
    RED.nodes.registerType("createNamespace", createNamespace);
};
