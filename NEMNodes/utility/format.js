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
    const { formatTransactions, formatTransaction } = require('../lib/formatTransactionService');
    const { formatAccountInfo } = require('../lib/formatAccountInfoService');
    const { formatBlock } = require('../lib/formatBlockService');
    function format(config) {
        RED.nodes.createNode(this, config);
        this.host = RED.nodes.getNode(config.server).host;
        const node = this;

        this.on('input', function (msg) {
            try {
                if (msg.nem.transaction) {
                    msg.nem.transaction = formatTransaction(msg.nem.transaction);
                }
                if (msg.nem.transactions) {
                    msg.nem.transactions = formatTransactions(msg.nem.transactions);
                }
                if (msg.nem.newBlock) {
                    msg.nem.newBlock = formatBlock(msg.nem.newBlock);
                }
                if (msg.nem.accountInfo) {
                    msg.nem.accountInfo = formatAccountInfo(msg.nem.accountInfo);
                }
                node.send(msg);

            } catch (error) {
                node.error(error, msg)
            }
        });
    }
    RED.nodes.registerType("format", format);
};
