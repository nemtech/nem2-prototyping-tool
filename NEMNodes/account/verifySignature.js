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
    const validation = require('../lib/validationService');
    function verifySignature(config) {
        RED.nodes.createNode(this, config);
        this.publicKey = config.publicKey;
        this.data = config.data;
        this.signature = config.signature;
        this.network = RED.nodes.getNode(config.network).network;
        let node = this;
        let errorText = "";
        node.on('input', function (msg) {
            try {
                msg.nem = (typeof msg.nem === 'undefined') ? {} : msg.nem;
                msg.nem.dataSignature = (typeof msg.nem.dataSignature === 'undefined') ? {} : msg.nem.dataSignature;

                const publicKey = node.publicKey || msg.nem.dataSignature.publicKey || msg.nem.publicKey;
                const data = node.data || msg.nem.dataSignature.data;
                const signature = node.signature || msg.nem.dataSignature.signature;
                const network = node.network || msg.nem.network;

                if (!validation.publicKeyValidate(publicKey))
                    errorText = "publicKey is empty or not correct:" + publicKey + ", "
                if (!data)
                    errorText += "data is empty, ";
                if (!signature)
                    errorText += "signature is empty";

                if (!errorText) {
                    const publicAccount = PublicAccount.createFromPublicKey(publicKey, NetworkType[network]);
                    const verifySignature = publicAccount.verifySignature(data, signature);
                    msg.nem.dataSignature = { data: data, signature: signature, publicKey: publicKey, valid: verifySignature };
                    node.send(msg);
                }
                else {
                    node.error(errorText);
                }
            } catch (error) {
                node.error(error, msg);
            }
        });
        node.on('close', function () {
            node.status({});
        });
    }
    RED.nodes.registerType("verifySignature", verifySignature);
};
