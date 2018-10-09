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

const validation = require("../../NEMNodes/lib/validationService.js")
const should = require("should");

const privateKey = "26b64cb10f005e5988a36744ca19e20d835ccc7c105aaa5f3b212da593180930";
const wrongPrivateKey = "wrongcb10f005e5988a36744ca19e20d835ccc7c105aaa5f3b212da593180930";
const publicKey = "c2f93346e27ce6ad1a9f8f5e3066f8326593a406bdf357acb041e2f9ab402efe";
const wrongPublicKey = "wrong346e27ce6ad1a9f8f5e3066f8326593a406bdf357acb041e2f9ab402efe";
const address = "SCTVW23D2MN5VE4AQ4TZIDZENGNOZXPRPRLIKCF2";
const wrongAddress = "SCTVW23D2MN5VE4AQ4TZIDZENGNOZXPR-PRLIKCF2";
const lineAddress = "SCTVW2-3D2MN5-VE4AQ4-TZIDZE-NGNOZX-PRPRLI-KCF2";
const mosaic = "xem";
const wrongMosaic = "xEm";
const mosaicFullName = "namespace.subnamespace:mosaic";
const wrongMosaicFullName = "nem: xem";
const namespace = "nem";
const wrongNamespace = "Nem ";
const subNamespace = "nem.token";
const wrongSubNamespace = "nem.token:subnamespace";
const host = "https://test.com:3000";
const wrongHost = "https:/test.com";


describe('regex validations', function () {
    it('should validate the privateKey correctly', function (done) {
        validation.privateKeyValidate(privateKey).should.be.true();
        done();
    });
    it('should validate the privateKey regex as wrong', function (done) {
        validation.privateKeyValidate(wrongPrivateKey).should.be.false();
        done();
    });
    it('should validate the publicKey regex correctly', function (done) {
        validation.publicKeyValidate(publicKey).should.be.true();
        done();
    });
    it('should validate the publicKey regex as wrong', function (done) {
        validation.publicKeyValidate(wrongPublicKey).should.be.false();
        done();
    });
    it('should validate the address with - regex correctly', function (done) {
        validation.addressValidate(lineAddress).should.be.true();
        done();
    });
    it('should validate the address regex correctly', function (done) {
        validation.addressValidate(address).should.be.true();
        done();
    });
    it('should validate the address regex as wrong', function (done) {
        validation.addressValidate(wrongAddress).should.be.false();
        done();
    });
    it('should validate the namespace regex correctly', function (done) {
        validation.namespaceValidate(namespace).should.be.true();
        done();
    });
    it('should validate the namespace regex as wrong', function (done) {
        validation.namespaceValidate(wrongNamespace).should.be.false();
        done();
    });
    it('should validate the subNamespace regex correctly', function (done) {
        validation.subNamespaceValidate(subNamespace).should.be.true();
        done();
    });
    it('should validate the subNamespace regex as wrong', function (done) {
        validation.subNamespaceValidate(wrongSubNamespace).should.be.false();
        done();
    });
    it('should validate the mosaic regex correctly', function (done) {
        validation.mosaicValidate(mosaic).should.be.true();
        done();
    });
    it('should validate the mosaic regex as wrong', function (done) {
        validation.mosaicValidate(wrongMosaic).should.be.false();
        done();
    });
    it('should validate the mosaicFullName regex correctly', function (done) {
        validation.mosaicFullNameValidate(mosaicFullName).should.be.true();
        done();
    });
    it('should validate the mosaicFullName regex as wrong', function (done) {
        validation.mosaicFullNameValidate(wrongMosaicFullName).should.be.false();
        done();
    });
    it('should validate the host regex correctly', function (done) {
        validation.hostValidate(host).should.be.true();
        done();
    });
    it('should validate the host regex as wrong', function (done) {
        validation.hostValidate(wrongHost).should.be.false();
        done();
    });



});
