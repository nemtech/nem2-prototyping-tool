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
    const { MosaicSupplyChangeTransaction, MosaicId, Deadline, UInt64, NetworkType } = require('nem2-sdk');
    const validation = require('../lib/validationService');
    function mosaicSupplyChange(config) {
        RED.nodes.createNode(this, config);
        this.mosaic = config.mosaic;
        this.amount = config.amount;
        this.direction = config.direction;
        this.network = RED.nodes.getNode(config.network).network;
        const node = this;
        this.on('input', function (msg) {
            try {
                if (typeof msg.nem === "undefined") {
                    msg.nem = {};
                }
                const mosaic = node.mosaic || msg.nem.mosaic;
                const network = node.network || msg.nem.network;
                if (validation.mosaicFullNameValidate(mosaic)) {
                    const mosaicSupplyChangeTransaction = MosaicSupplyChangeTransaction.create(
                        Deadline.create(),
                        new MosaicId(mosaic),
                        node.direction,
                        UInt64.fromUint(node.amount),
                        NetworkType[network]);

                    msg.nem.transactionType = "mosaicSupplyChange";
                    msg.nem.transaction = mosaicSupplyChangeTransaction;
                    node.send(msg);
                }
                else {
                    node.error("mosaic: \"" + mosaic + "\" is not correct", msg)
                }
            } catch (error) {
                node.error(error);
            }
        });
    }
    RED.nodes.registerType("mosaicSupplyChange", mosaicSupplyChange);
};