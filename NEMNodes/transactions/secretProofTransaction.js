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
    const { SecretProofTransaction, Deadline, HashType, NetworkType } = require('nem2-sdk');
    function secretProof(config) {
        RED.nodes.createNode(this, config);
        this.secret = config.secret;
        this.proof = config.proof;
        this.hashType = config.hashType;
        this.network = RED.nodes.getNode(config.network).network;
        const node = this;

        this.on('input', function (msg) {
            try {
                if (typeof msg.nem === "undefined") {
                    msg.nem = {};
                }
                const secret = node.secret || msg.nem.secret;
                const proof = node.proof || msg.nem.proof;
                const network = node.network || msg.nem.network;

                const secretProofTransaction = SecretProofTransaction.create(
                    Deadline.create(),
                    HashType[node.hashType],
                    secret,
                    proof,
                    NetworkType[network]
                );
                msg.nem.transaction = secretProofTransaction;
                msg.nem.transactionType = "secretProof";
                node.send(msg);

            } catch (error) {
                node.error(error);
            }
        });
    }
    RED.nodes.registerType("secretProof", secretProof);
};
