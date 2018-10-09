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

    function signData(config) {
        RED.nodes.createNode(this, config);
        this.privateKey = config.privateKey;
        this.data = config.data;
        this.network = RED.nodes.getNode(config.network).network;
        let node = this;
        let errorText = "";
        node.on('input', function (msg) {
            try {
                msg.nem = (typeof msg.nem === 'undefined') ? {} : msg.nem;

                const privateKey = node.privateKey || msg.nem.privateKey || (msg.nem.account && msg.nem.account.keyPair ? msg.nem.account.keyPair.privateKey : undefined);
                const data = node.data || msg.nem.data || msg.payload;
                const network = node.network || msg.nem.network;

                if (!validation.privateKeyValidate(privateKey))
                    errorText = "privateKey is empty or not correct:" + privateKey + ", "
                if (!data)
                    errorText += "data is empty";

                if (!errorText) {
                    const account = Account.createFromPrivateKey(privateKey, NetworkType[network]);
                    const signature = account.signData(data);
                    msg.nem.account = account;
                    msg.nem.dataSignature = {
                        data: data,
                        signature: signature,
                        publicKey: account.publicKey
                    };
                    node.send(msg);
                } else {
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
    RED.nodes.registerType("signData", signData);
};