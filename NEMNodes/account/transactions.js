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
    const { concatMap, expand, toArray } = require("rxjs/operators");
    const { EMPTY } = require("rxjs");
    const validation = require('../lib/validationService');
    function transactions(config) {
        RED.nodes.createNode(this, config);
        this.host = RED.nodes.getNode(config.server).host;
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
                if (validation.publicKeyValidate(publicKey)) {
                    const publicAccount = PublicAccount.createFromPublicKey(publicKey, NetworkType[node.network]);
                    const accountHttp = new AccountHttp(node.host);
                    if (node.pageSize > 100 || node.allTransactions) {
                        node.pageSize = 100;
                    }
                    else if (node.pageSize < 10) {
                        node.pageSize = 10;
                    }
                    accountHttp[node.transactionsType](publicAccount, new QueryParams(node.pageSize, null))
                        .pipe(
                            expand((transactions) => transactions.length >= node.pageSize && node.allTransactions ? accountHttp[node.transactionsType](publicAccount, new QueryParams(node.pageSize, transactions[transactions.length - 1].transactionInfo.id)) : EMPTY),
                            concatMap(transactions => transactions),
                            toArray()
                        )
                        .subscribe(transactions => {
                            msg.nem.transactions = transactions;
                            msg.nem.transactionType = node.transactionsType;
                            node.send(msg);
                        },
                            error => {
                                node.status({ fill: "red", shape: "ring", text: "ERROR, check debug window" });
                                node.error(error);
                            });
                }
                else if (publicKey) {
                    node.error("public key is not correct : " + publicKey, msg);
                }
                else {
                    node.error("public key is empty", msg);
                }
            } catch (error) {
                node.error(error);
            }
        });
        node.on('close', function () {
            node.status({});
        });
    }
    RED.nodes.registerType("transactions", transactions);
};
