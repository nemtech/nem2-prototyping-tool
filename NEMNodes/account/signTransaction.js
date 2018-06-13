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
    const { Account, CosignatureTransaction, TransactionType, NetworkType } = require('nem2-sdk');
    const validation = require('../lib/validation');
    function signTransaction(config) {
        RED.nodes.createNode(this, config);
        this.network = RED.nodes.getNode(config.network).network;
        this.privateKey = config.privateKey;
        this.coSign = config.coSign;
        let node = this;

        this.on('input', function (msg) {
            try {
                if (typeof msg.nem === "undefined") {
                    msg.nem = {};
                }
                const privateKey = node.privateKey || msg.nem.privateKey;
                const network = node.network || msg.nem.network;
                if (validation.privateKeyValidate(privateKey)) {
                    const account = msg.nem.account || Account.createFromPrivateKey(privateKey, NetworkType[network]);
                    if (!node.coSign && msg.nem.hasOwnProperty("transaction")) {
                        const signedTransaction = account.sign(msg.nem.transaction);
                        msg.nem.signedTransaction = signedTransaction;
                        node.send(msg);
                    }
                    else if (node.coSing && msg.nem.transaction.type === TransactionType.AGGREGATE_BONDED) {
                        const cosignatureTransaction = CosignatureTransaction.create(msg.nem.transaction);
                        const signedTransaction = account.signCosignatureTransaction(cosignatureTransaction);
                        msg.nem.signedTransaction = signedTransaction;
                        node.send(msg);
                    }
                    else {
                        node.error("something went wrong with the transaction", msg);
                    }
                } else if (privateKey) {
                    node.error("private key is not correct : " + privateKey, msg);
                }
                else {
                    node.error("private key is empty", msg);
                }
            } catch (error) {
                node.error(error, msg);
            }
            node.on('close', function () {
                node.status({});
            });
        });
    }
    RED.nodes.registerType("signTransaction", signTransaction);
};
