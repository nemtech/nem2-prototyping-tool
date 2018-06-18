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
    const { MosaicDefinitionTransaction, Deadline, MosaicProperties, UInt64, NetworkType } = require('nem2-sdk');
    const validation = require('../lib/validationService');
    function createMosaicDefinition(config) {
        RED.nodes.createNode(this, config);
        this.namespace = config.namespace;
        this.mosaic = config.mosaic;
        this.supplyMutable = config.supplyMutable;
        this.transferable = config.transferable;
        this.levyMutable = config.levyMutable;
        this.divisibility = config.divisibility;
        this.duration = config.duration;
        this.network = RED.nodes.getNode(config.network).network;
        const node = this;
        this.on('input', function (msg) {
            try {
                if (typeof msg.nem === "undefined") {
                    msg.nem = {};
                }
                const namespace = node.namespace || msg.nem.namespace;
                const mosaic = node.mosaic || msg.nem.mosaic;
                const network = node.network || msg.nem.network;
                if (validation.namespaceFullNameValidate(namespace) && validation.mosaicValidate(mosaic)) {
                    const mosaicDefinitionTransaction = MosaicDefinitionTransaction.create(
                        Deadline.create(),
                        mosaic,
                        namespace,
                        MosaicProperties.create({
                            supplyMutable: node.supplyMutable,
                            transferable: node.transferable,
                            levyMutable: false,
                            divisibility: node.divisibility,
                            duration: UInt64.fromUint(node.duration),
                        }),
                        NetworkType[network]);
                    msg.nem.transaction = mosaicDefinitionTransaction;
                    msg.nem.transactionType = "createMosaicDefinition";
                    node.send(msg);
                }
                else if(!validation.namespaceFullNameValidate(namespace)){
                    node.error("namespace: \"" + namespace + "\" is not correct", msg);
                }
                else{
                    node.error("mosaic: \"" + mosaic + "\" is not correct", msg);
                }
            } catch (error) {
                node.error(error);
            }
        });
    }
    RED.nodes.registerType("createMosaicDefinition", createMosaicDefinition);
};
