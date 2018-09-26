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
    const { CosignatureTransaction } = require('nem2-sdk');
    function cosignature(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        this.on('input', function (msg) {
            try {
                if (typeof msg.nem === "undefined") {
                    msg.nem = {};
                }
                const cosignatureTransaction = CosignatureTransaction.create(msg.nem.transaction);
                msg.nem.transaction = cosignatureTransaction;
                msg.nem.transactionType = "cosignature";
                node.send(msg);
            } catch (error) {
                node.error(error);
            }
        });
    }
    RED.nodes.registerType("cosignature", cosignature);
};
