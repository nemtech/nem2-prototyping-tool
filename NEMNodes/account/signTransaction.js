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
    const { Account, NetworkType } = require('nem2-sdk');
    const validation = require('../lib/validationService');
    function signTransaction(config) {
        RED.nodes.createNode(this, config);
        this.network = RED.nodes.getNode(config.network).network;
        this.privateKey = config.privateKey;
        let node = this;

        this.on('input', function (msg) {
            try {
                if (typeof msg.nem === "undefined") {
                    msg.nem = {};
                }
                const privateKey = node.privateKey || msg.nem.privateKey || (msg.nem.account && msg.nem.account.keyPair ? msg.nem.account.keyPair.privateKey : undefined);
                const network = node.network || msg.nem.network;
                const account = validation.privateKeyValidate(privateKey) ? Account.createFromPrivateKey(privateKey, NetworkType[network]) : undefined;
                if (account) {
                    if (msg.nem.hasOwnProperty("transaction")) {
                        if (msg.nem.transaction.transactionToCosign) {
                            const signedTransaction = account.signCosignatureTransaction(msg.nem.transaction);
                            msg.nem.signedTransaction = signedTransaction;
                            node.send(msg);
                        } else {
                            const signedTransaction = account.sign(msg.nem.transaction);
                            msg.nem.signedTransaction = signedTransaction;
                            node.send(msg);
                        }
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
