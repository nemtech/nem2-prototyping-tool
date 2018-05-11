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
    const { ModifyMultisigAccountTransaction, MultisigCosignatoryModification, MultisigCosignatoryModificationType, Deadline, NetworkType } = require('nem2-sdk');
    function configMultisig(config) {
        RED.nodes.createNode(this, config);
        let context = this.context().flow;
        this.privateKey = config.privateKey;
        this.minApproval = config.minApproval;
        this.minRemoval = config.minRemoval;
        this.remove = config.remove;
        this.trigger = config.trigger;
        this.network = RED.nodes.getNode(config.network).network;
        const node = this;
        context.set(node.id, []);

        this.on('input', function (msg) {
            try {
                if (typeof msg.nem === "undefined") {
                    msg.nem = {};
                }
                const minApproval = node.minApproval || msg.nem.minApproval;
                const minRemoval = node.minRemoval || msg.nem.minRemoval;
                let publicAccounts = context.get(node.id) || [];

                if (msg.nem.publicAccount != undefined) {
                    if (node.remove === "true") {
                        publicAccounts = publicAccounts.concat(new MultisigCosignatoryModification(1, msg.nem.publicAccount));
                    }
                    else {
                        publicAccounts = publicAccounts.concat(new MultisigCosignatoryModification(0, msg.nem.publicAccount));
                    }
                    context.set(node.id, publicAccounts);
                }
                if (msg.nem.trigger == node.trigger) {
                    const convertIntoMultisigTransaction = ModifyMultisigAccountTransaction.create(
                        Deadline.create(),
                        minApproval,
                        minRemoval,
                        publicAccounts,
                        NetworkType[node.network]
                    );
                    msg.nem.transaction = convertIntoMultisigTransaction;
                    msg.nem.transactionType = "convertIntoMultisig";
                    context.set(node.id, []);
                    node.send(msg);
                }

            } catch (error) {
                node.error(error);
            }
        });
    }
    RED.nodes.registerType("configMultisig", configMultisig);
};
