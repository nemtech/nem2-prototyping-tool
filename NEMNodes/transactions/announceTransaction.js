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
    const { TransactionHttp } = require('nem2-sdk');
    function announce(config) {
        RED.nodes.createNode(this, config);
        let context = this.context().flow;
        this.host = RED.nodes.getNode(config.server).host;
        this.announceType = config.announceType;
        let node = this;
        context.set(node.id, 0);

        this.on('input', function (msg) {
            try {
                if (typeof msg.nem === "undefined") {
                    msg.nem = {};
                }
                const transactionHttp = new TransactionHttp(node.host);
                transactionHttp[node.announceType](msg.nem.signedTransaction)
                    .subscribe(x => {
                        msg.nem.announced = x;
                        let transactionsSend = (context.get(node.id) || 0) + 1;
                        node.status({ text: "transactions sent:    " + transactionsSend });
                        context.set(node.id, transactionsSend);
                        node.send(msg);
                    },
                        error => {
                            node.status({ fill: "red", shape: "ring", text: "ERROR, check debug window" });
                            node.error(error);
                        });
            } catch (error) {
                node.error(error);
            }
        });
        node.on('close', function () {
            node.status({});
        });
    }
    RED.nodes.registerType("announce", announce);
};
