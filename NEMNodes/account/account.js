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
    function account(config) {
        RED.nodes.createNode(this, config);
        this.privateKey = config.privateKey;
        this.network = RED.nodes.getNode(config.network).network;
        let node = this;

        this.on('input', function (msg) {
            try {
                if (typeof msg.nem === "undefined") {
                    msg.nem = {};
                }
                const privateKey = node.privateKey || msg.nem.privateKey;

                if (privateKey) {
                    const account = Account.createFromPrivateKey(privateKey, NetworkType[node.network]);
                    this.status({ text: account.address.pretty() });
                    msg.nem.account = account;
                    msg.nem.address = msg.nem.address ? msg.nem.address : account.address.address;
                    msg.nem.publicKey = msg.nem.publicKey ? msg.nem.publicKey : account.publicKey;
                    node.send(msg);
                }
                else {
                    this.status({ text: "private key not found" });
                }

            } catch (error) {
                node.error(error);
            }


        });
        node.on('close', function () {
            node.status();
        });
    }
    RED.nodes.registerType("account", account);
};
