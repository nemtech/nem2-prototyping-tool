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

    function serverConfig(n) {
        RED.nodes.createNode(this, n);
        this.url = n.url;
        this.customServer = n.customServer;
        this.port = n.port;
        this.network = RED.nodes.getNode(n.network).network;
        this.host = "";
        if (!n.customServer == "") {
            this.host = n.customServer + ":" + n.port;
        }
        else {
            this.host = n.url + ":" + n.port;
        }
    }
    RED.nodes.registerType("serverConfig", serverConfig);
};
