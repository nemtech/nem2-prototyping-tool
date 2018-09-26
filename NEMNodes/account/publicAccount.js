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
    const { PublicAccount, NetworkType } = require('nem2-sdk');
    const validation = require("../lib/validationService")
    function publicAccount(config) {
        RED.nodes.createNode(this, config);
        this.publicKey = config.publicKey;
        this.network = RED.nodes.getNode(config.network).network;
        let node = this;

        this.on('input', function (msg) {
            try {
                if (typeof msg.nem === "undefined") {
                    msg.nem = {};
                }
                const publicKey = node.publicKey || msg.nem.publicKey;
                const network = node.network || msg.nem.network;
                if (validation.publicKeyValidate(publicKey)) {
                    const publicAccount = PublicAccount.createFromPublicKey(publicKey, NetworkType[network]);
                    node.status({ text: publicAccount.address.pretty() });
                    msg.nem.publicAccount = publicAccount;
                    msg.nem.address = publicAccount.address.address;
                    msg.nem.publicKey = publicAccount.publicKey;
                    node.send(msg);
                }
                else if (publicKey) {
                    node.error("public key is not correct : " + publicKey, msg);
                }
                else {
                    node.error("public key is empty", msg);
                }
            } catch (error) {
                node.error(error, msg);
            }

        });
        node.on('close', function () {
            node.status({});
        });
    }
    RED.nodes.registerType("publicAccount", publicAccount);
};
