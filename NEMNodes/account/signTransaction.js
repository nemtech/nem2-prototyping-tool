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
                const account = msg.nem.account || Account.createFromPrivateKey(privateKey, NetworkType[node.network]);
                if (!node.coSign) {
                    const signedTransaction = account.sign(msg.nem.transaction);

                    msg.nem.signedTransaction = signedTransaction;
                    node.send(msg);
                }
                else if (msg.nem.transactionType == "cosignature") {
                    const signedTransaction = account.signCosignatureTransaction(msg.nem.transaction);
                    msg.nem.signedTransaction = signedTransaction;
                    node.send(msg);
                }
                else {
                    node.status({ fill: "red", shape: "dot", text: "something went wrong with transactionType" });
                }


            } catch (error) {
                node.error(error);
            }

        });

    }
    RED.nodes.registerType("signTransaction", signTransaction);
};
