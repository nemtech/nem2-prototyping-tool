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
    const { LockFundsTransaction, Deadline, XEM, UInt64, NetworkType } = require('nem2-sdk');
    function lockFund(config) {
        RED.nodes.createNode(this, config);
        this.lockAmount = config.lockAmount;
        this.network = RED.nodes.getNode(config.network).network;
        const node = this;
        this.on('input', function (msg) {
            try {
                if (typeof msg.nem === "undefined") {
                    msg.nem = {};
                }
                if (msg.nem.signedTransaction !== "undefined") {
                    const lockFundTransaction = LockFundsTransaction.create(
                        Deadline.create(),
                        XEM.createRelative(10),
                        UInt64.fromUint(480),
                        msg.nem.signedTransaction, //need a aggregateBonded transaction or multisig transaction in message
                        NetworkType[node.network]);
                    msg.nem.transaction = lockFundTransaction;
                    msg.nem.transactionType = "lockFund";
                    node.send(msg);
                }
            } catch (error) {
                node.error(error);
            }
        });
    }
    RED.nodes.registerType("lockFund", lockFund);
};
