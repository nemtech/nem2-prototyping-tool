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
    const { SecretLockTransaction, Deadline, Mosaic, MosaicId, UInt64, HashType, Address, NetworkType } = require('nem2-sdk');
    const validation = require('../lib/validationService');
    function secretLock(config) {
        RED.nodes.createNode(this, config);
        this.secret = config.secret;
        this.namespace = config.namespace;
        this.mosaic = config.mosaic;
        this.hashType = config.hashType;
        this.lockTime = config.lockTime;
        this.network = config.network;
        this.address = config.address;
        this.amount = config.amount;
        this.network = RED.nodes.getNode(config.network).network;
        const node = this;

        this.on('input', function (msg) {
            try {
                if (typeof msg.nem === "undefined") {
                    msg.nem = {};
                }
                const namespace = node.namespace || msg.nem.namespace;
                const mosaic = node.mosaic || msg.nem.mosaic;
                const secret = node.secret || msg.nem.secret;
                const address = node.address || msg.nem.address;
                const network = node.network || msg.nem.network;

                //hash secret with hashtype to do
                const hashedSecret = secret;
                if (validation.addressValidate(address) && validation.mosaicFullNameValidate(mosaic)) {
                    const secretLockTransaction = SecretLockTransaction.create(
                        Deadline.create(),
                        new Mosaic(new MosaicId(mosaic), UInt64.fromUint(node.amount)),
                        UInt64.fromUint(node.lockTime),
                        HashType[node.hashType],
                        hashedSecret,
                        Address.createFromRawAddress(address),
                        NetworkType[network]
                    );
                    msg.nem.transaction = secretLockTransaction;
                    msg.nem.transactionType = "secretLock";
                    node.send(msg);
                }
                else if(!validation.addressValidate(address)){
                    node.error("address:\"" + address + "\" is not correct", msg)
                }
                else{
                    node.error("mosaic:\"" + mosaic + "\" is not correct", msg)
                }

            } catch (error) {
                node.error(error);
            }
        });
    }
    RED.nodes.registerType("secretLock", secretLock);
};
