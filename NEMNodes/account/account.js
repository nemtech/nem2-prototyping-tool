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
    function account(config) {
        RED.nodes.createNode(this, config);
        this.privateKey = config.privateKey;
        this.network = RED.nodes.getNode(config.network).network;
        let node = this;
        node.on('input', function (msg) {
            try {
                if (typeof msg.nem === "undefined") {
                    msg.nem = {};
                }
                const privateKey = node.privateKey || msg.nem.privateKey;
                const network = node.network || msg.nem.network;
                if (validation.privateKeyValidate(privateKey)) {
                    const account = Account.createFromPrivateKey(privateKey, NetworkType[network]);
                    node.status({ text: account.address.pretty() });
                    msg.nem.account = account;
                    msg.nem.address = account.address.address;
                    msg.nem.publicKey = account.publicKey;
                    msg.nem.account.keyPair.privateKey = account.privateKey;
                    msg.nem.account.keyPair.publicKey = account.publicKey;
                    node.send(msg);
                }
                else if (privateKey) {
                    node.error("private key is not correct : " + privateKey, msg);
                }
                else {
                    node.error("private key is empty", msg);
                }

            } catch (error) {
                node.error(error, msg);
            }
        });
        node.on('close', function () {
            node.status({});
        });
    }
    RED.nodes.registerType("account", account);
};
