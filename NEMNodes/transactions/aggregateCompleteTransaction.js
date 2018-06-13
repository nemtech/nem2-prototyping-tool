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
    const { AggregateTransaction, PublicAccount, NetworkType, Deadline } = require('nem2-sdk');
    const validation = require('../lib/validation');
    function aggregateComplete(config) {
        RED.nodes.createNode(this, config);
        let context = this.context().flow;
        this.trigger = config.trigger;
        this.network = RED.nodes.getNode(config.network).network;
        let account = "";
        const node = this;
        context.set(node.id, []);

        this.on('input', function (msg) {
            try {
                if (typeof msg.nem === "undefined") {
                    msg.nem = {};
                }
                const publicKey = msg.nem.publicKey;
                const network = node.network || msg.nem.network;
                let savedTransactions = context.get(node.id) || [];
                if (!account && msg.nem.account) {
                    account = msg.nem.account;
                }
                if (msg.nem.transaction && validation.publicKeyValidate(publicKey)) {
                    publicAccount = msg.nem.publicAccount || PublicAccount.createFromPublicKey(publicKey, NetworkType[network]);
                    savedTransactions = savedTransactions.concat(msg.nem.transaction.toAggregate(publicAccount));
                    context.set(node.id, savedTransactions);
                }
                if (msg.nem.trigger == node.trigger) {
                    const aggregateTransaction = AggregateTransaction.createComplete(
                        Deadline.create(),
                        savedTransactions,
                        NetworkType[network],
                        []
                    );
                    msg.nem.transactionType = "aggregateComplete";
                    msg.nem.transaction = aggregateTransaction;
                    msg.nem.account = account;
                    context.set(node.id, []);
                    account = "";
                    node.send(msg);
                }
            } catch (error) {
                node.error(error);
            }
        });
    }
    RED.nodes.registerType("aggregateComplete", aggregateComplete);
};
