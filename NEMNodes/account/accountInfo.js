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

    function accountInfo(config) {
        const { AccountHttp, Address } = require('nem2-sdk');
        const validation = require('../lib/validationService');
        RED.nodes.createNode(this, config);
        this.host = RED.nodes.getNode(config.server).host;
        this.address = config.address;
        this.accountType = config.accountType;
        const node = this;

        this.on('input', function (msg) {
            try {
                if (typeof msg.nem === "undefined") {
                    msg.nem = {};
                }
                const address = node.address || msg.nem.address;
                if (node.host && validation.addressValidate(address)) {
                    var accountHttp = new AccountHttp(node.host);
                    accountHttp[node.accountType](Address.createFromRawAddress(address))
                        .subscribe(accountInfo => {
                            msg.nem.accountInfo = accountInfo;
                            node.send(msg);
                            this.status({ text: address });
                        },
                            error => {
                                node.status({ fill: "red", shape: "ring", text: "ERROR, check debug window" });
                                node.error(error);
                            });
                }
                else if (address) {
                    node.error("address is wrong " + address, msg);
                }
                else {
                    node.error("server and/or address is empty", msg);
                }
            } catch (error) {
                node.error(error, msg);
            }
        });
        node.on('close', function () {
            node.status({});
        });
    }
    RED.nodes.registerType("accountInfo", accountInfo);
};
