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
    const { PublicAccount, AccountHttp, QueryParams, NetworkType } = require('nem2-sdk');
    function transactions(config) {
        RED.nodes.createNode(this, config);
        this.host = RED.nodes.getNode(config.server).host;
        this.network = RED.nodes.getNode(config.server).network;
        this.publicKey = config.publicKey;
        this.pageSize = config.pageSize;
        this.transactionsType = config.transactionsType;
        this.allTransactions = config.allTransactions;
        const node = this;
        this.on('input', function (msg) {
            try {
                if (typeof msg.nem === "undefined") {
                    msg.nem = {};
                }
                const publicKey = node.publicKey || msg.nem.publicKey;
                const publicAccount = msg.nem.publicAccount || PublicAccount.createFromPublicKey(publicKey, NetworkType[node.network]);
                const accountHttp = new AccountHttp(node.host);

                if (typeof msg.nem === "undefined") {
                    msg.nem = {};
                }
                if (node.allTransactions) {
                    node.pageSize = 100;
                }
                accountHttp[node.transactionsType](publicAccount, new QueryParams(node.pageSize)).subscribe(transactions => {
                    if (node.allTransactions) {
                        getNextTransactions(transactions, transactions[transactions.length - 1].transactionInfo.id, node.transactionsType);
                    }
                    else {
                        msg.nem.transactions = transactions;
                        msg.nem.transactionType = node.transactionType;
                        node.send(msg);
                    }
                });
                function getNextTransactions(transactionList, transactionId, transactionType) {
                    accountHttp[transactionType](publicAccount, new QueryParams(node.pageSize, transactionId)).subscribe(transactions => {
                        transactionList = transactionList.concat(transactions);
                        if (transactions.length >= node.pageSize) {
                            getNextTransactions(transactionList, transactions[transactions.length - 1].transactionInfo.id, transactionType);
                        }
                        else {
                            msg.nem.transactions = transactionList;
                            msg.nem.transactionType = transactionType;
                            node.send(msg);
                        }
                    });
                }
            } catch (error) {
                node.error(error);
            }
        });
    }
    RED.nodes.registerType("transactions", transactions);
};
