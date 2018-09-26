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
    const { TransferTransaction, Deadline, Address, Mosaic, MosaicId, UInt64, PlainMessage, NetworkType } = require('nem2-sdk');
    const validation = require('../lib/validation');
    function transfer(config) {
        RED.nodes.createNode(this, config);
        this.recipient = config.recipient;
        this.message = config.message;
        this.mosaic = config.mosaic;
        this.amount = config.amount;
        this.publicKey = config.publicKey;
        this.network = RED.nodes.getNode(config.network).network;
        const node = this;

        this.on('input', function (msg) {
            try {
                if (typeof msg.nem === "undefined") {
                    msg.nem = {};
                }
                const address = node.recipient || msg.nem.address;
                const message = node.message || msg.nem.message || "";
                const publicKey = node.publicKey || msg.nem.publicKey;
                const mosaic = node.mosaic || msg.nem.mosaic;
                const network = node.network || msg.nem.network;
                const amount = node.amount || msg.nem.amount;
                if (validation.addressValidate(address) && validation.mosaicFullNameValidate(mosaic)) {
                    const transferTransaction = TransferTransaction.create(
                        Deadline.create(),
                        Address.createFromRawAddress(address),
                        [new Mosaic(new MosaicId(mosaic), UInt64.fromUint(amount))],
                        PlainMessage.create(message),
                        NetworkType[network]);

                    msg.nem.transactionType = "transfer";
                    msg.nem.transaction = transferTransaction;
                    msg.nem.publicKey = publicKey;
                    node.send(msg);
                }
                else if(!validation.addressValidate(address)){
                    node.error("address: \"" + address + "\" is not correct", msg)
                }
                else {
                    node.error("mosaic: \"" + mosaic + "\"  is not correct", msg)
                }
            } catch (error) {
                node.error(error);
            }
        });
    }
    RED.nodes.registerType("transfer", transfer);
};
