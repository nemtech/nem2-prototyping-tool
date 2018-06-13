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

    function input(config) {
        RED.nodes.createNode(this, config);
        this.privateKey = config.privateKey;
        this.publicKey = config.publicKey;
        this.address = config.address;
        this.namespace = config.namespace;
        this.mosaic = config.mosaic;
        this.trigger = config.trigger;
        const node = this;

        this.on('input', function (msg) {
            try {
                msg.nem = {};
                msg.nem.privateKey = node.privateKey || undefined;
                msg.nem.publicKey = node.publicKey || undefined;
                msg.nem.address = node.address || undefined;
                msg.nem.namespace = node.namespace || undefined;
                msg.nem.mosaic = node.mosaic || undefined;
                msg.nem.trigger = node.trigger || undefined;
                node.send(msg);
            } catch (error) {
                node.error(error, msg)
            }
        });
    }
    RED.nodes.registerType("input", input);
};
