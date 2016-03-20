'use strict';
/* global describe, before, it */

var assert = require('assert'),
    nconf = require('nconf'),
    supertest = require('supertest'),
    signature = require('../src/utils/signature.js'),
    constants = require('../src/utils/constants.js');

describe('Activation API', function () {

    var request,
        instanceid;
    
    before(function () {
        nconf.env().file({
            file: 'config.json'
        });
        request = supertest(nconf.get('URL'));
        console.log(nconf.get('URL'));
    });
    
    it('reset activations', function (done) {
        var nounce = Math.random().toString(36).substr(2, 10);
        request.post('/api?request=activation_reset')
            .field(constants.PARAM_PRODUCTID, nconf.get('PRODUCT_ID'))
            .field(constants.PARAM_EMAIL, nconf.get('LICENSE_EMAIL'))
            .field(constants.PARAM_LICENSEKEY, nconf.get('LICENSE_KEY'))
            .field(constants.PARAM_NONCE, nounce)
            .expect(200)
            .expect('Content-Type', 'application/json')
            .end(function (err, res) {
                var result = res.body;
                //console.log(res.body);
                assert(result.hasOwnProperty('timestamp'), 'has timestamp');
                assert(result.hasOwnProperty('reset') && result.reset === true, 'reset is true');
                assert(result.hasOwnProperty(constants.PARAM_NONCE) && result[constants.PARAM_NONCE] === nounce, 'nounce matches');
                assert(signature.validate(result, nconf.get('PRODUCT_SECRET')), 'activation request has valid signature');
                done();
            });        
    });

    it('activate product', function (done) {
        var nounce = Math.random().toString(36).substr(2, 10);
        request.post('/api?request=activation')
            .field(constants.PARAM_PRODUCTID, nconf.get('PRODUCT_ID'))
            .field(constants.PARAM_EMAIL, nconf.get('LICENSE_EMAIL'))
            .field(constants.PARAM_LICENSEKEY, nconf.get('LICENSE_KEY'))
            .field(constants.PARAM_NONCE, nounce)
            .expect(200)
            .expect('Content-Type', 'application/json')
            .end(function (err, res) {
                var result = res.body;
                //console.log(res.body);
                assert(result.hasOwnProperty('timestamp'), 'has timestamp');
                assert(result.hasOwnProperty('activated'), 'has activated');
                assert(result.hasOwnProperty(constants.PARAM_NONCE) && result[constants.PARAM_NONCE] === nounce, 'nounce matches');
                assert(result.hasOwnProperty('instanceid') && result.instanceid.length > 0, 'has instanceid');
                assert(signature.validate(result, nconf.get('PRODUCT_SECRET')), 'activation request has valid signature');
                instanceid = result.instanceid;
                done();
            });
    });

    it('validate existing activation', function (done) {
        var nounce = Math.random().toString(36).substr(2, 10);
        request.post('/api?request=activation')
            .field(constants.PARAM_PRODUCTID, nconf.get('PRODUCT_ID'))
            .field(constants.PARAM_EMAIL, nconf.get('LICENSE_EMAIL'))
            .field(constants.PARAM_LICENSEKEY, nconf.get('LICENSE_KEY'))
            .field(constants.PARAM_INSTANCEID, instanceid)
            .field(constants.PARAM_NONCE, nounce)
            .expect(200)
            .expect('Content-Type', 'application/json')
            .end(function (err, res) {
                var result = res.body;
                //console.log(res.body);
                assert(result.hasOwnProperty('timestamp'), 'has timestamp');
                assert(result.hasOwnProperty('activated'), 'has activated');
                assert(result.hasOwnProperty(constants.PARAM_NONCE) && result[constants.PARAM_NONCE] === nounce, 'nounce matches');
                assert(result.hasOwnProperty('instanceid') && result.instanceid === instanceid, 'has same instanceid');
                assert(signature.validate(result, nconf.get('PRODUCT_SECRET')), 'activation request has valid signature');
                instanceid = result.instanceid;
                done();
            });
    });

    it('activate product with no activations left', function (done) {
        var nounce = Math.random().toString(36).substr(2, 10);
        request.post('/api?request=activation')
            .field(constants.PARAM_PRODUCTID, nconf.get('PRODUCT_ID'))
            .field(constants.PARAM_EMAIL, nconf.get('LICENSE_EMAIL'))
            .field(constants.PARAM_LICENSEKEY, nconf.get('LICENSE_KEY'))
            .field(constants.PARAM_NONCE, nounce)
            .expect(200)
            .expect('Content-Type', 'application/json')
            .end(function (err, res) {
                var result = res.body;
                //console.log(res.body);
                assert(result.hasOwnProperty('timestamp'), 'has timestamp');
                assert(result.hasOwnProperty('code') && result.code === '103', 'code is 103');
                assert(result.hasOwnProperty('error') && result.error === 'Exceeded maximum number of activations', 'error is Exceeded maximum number of activations');
                assert(result.hasOwnProperty('activated') && result.activated === false, 'activated is false');
                //signature is incorect for error response
                //assert(signature.validate(result, nconf.get('PRODUCT_SECRET')), 'activation request has valid signature');
                done();
            });
    });

    it('deactivate install', function (done) {
        var nounce = Math.random().toString(36).substr(2, 10);
        request.post('/api?request=deactivation')
            .field(constants.PARAM_PRODUCTID, nconf.get('PRODUCT_ID'))
            .field(constants.PARAM_EMAIL, nconf.get('LICENSE_EMAIL'))
            .field(constants.PARAM_LICENSEKEY, nconf.get('LICENSE_KEY'))
            .field(constants.PARAM_INSTANCEID, instanceid)
            .field(constants.PARAM_NONCE, nounce)
            .expect(200)
            .expect('Content-Type', 'application/json')
            .end(function (err, res) {
                var result = res.body;
                //console.log(res.body);
                assert(result.hasOwnProperty('timestamp'), 'has timestamp');
                assert(result.hasOwnProperty('reset') && result.reset === true, 'reset is true');
                assert(signature.validate(result, nconf.get('PRODUCT_SECRET')), 'activation request has valid signature');
                done();
            });
    });

    it('validate deactivated install', function (done) {
        var nounce = Math.random().toString(36).substr(2, 10);
        request.post('/api?request=activation')
            .field(constants.PARAM_PRODUCTID, nconf.get('PRODUCT_ID'))
            .field(constants.PARAM_EMAIL, nconf.get('LICENSE_EMAIL'))
            .field(constants.PARAM_LICENSEKEY, nconf.get('LICENSE_KEY'))
            .field(constants.PARAM_INSTANCEID, '6ad62053-8f49-4d15-ba18-84e4c11c51f4')
            .field(constants.PARAM_NONCE, nounce)
            .expect(200)
            .expect('Content-Type', 'application/json')
            .end(function (err, res) {
                var result = res.body;
                //console.log(res.body);
                assert(result.hasOwnProperty('timestamp'), 'has timestamp');
                assert(result.hasOwnProperty('code') && result.code === '102', 'code is 102');
                assert(result.hasOwnProperty('error') && result.error === 'Software has been deactivated', 'error is Software has been deactivated');
                assert(result.hasOwnProperty('activated') && result.activated === false, 'activated is false');
                //signature is incorect for error response
                //assert(signature.validate(result, nconf.get('PRODUCT_SECRET')), 'activation request has valid signature');
                instanceid = result.instanceid;
                done();
            });
    });

    it('activate wrong product', function (done) {
        var nounce = Math.random().toString(36).substr(2, 10);
        request.post('/api?request=activation')
            .field(constants.PARAM_PRODUCTID, 'WRONG_PRODUCT_ID')
            .field(constants.PARAM_EMAIL, nconf.get('LICENSE_EMAIL'))
            .field(constants.PARAM_LICENSEKEY, nconf.get('LICENSE_KEY'))
            .field(constants.PARAM_NONCE, nounce)
            .expect(200)
            .expect('Content-Type', 'application/json')
            .end(function (err, res) {
                var result = res.body;
                //console.log(res.body);
                assert(result.hasOwnProperty('timestamp'), 'has timestamp');
                assert(result.hasOwnProperty('code') && result.code === '106', 'code is 106');
                assert(result.hasOwnProperty('error') && result.error === 'License key for different product. Please check the product for this license key, then download and install the correct product.', 'error is License key for different product. Please check the product for this license key, then download and install the correct product.');
                assert(result.hasOwnProperty('activated') && result.activated === false, 'activated is false');
                //signature is incorect for error response
                //assert(signature.validate(result, nconf.get('PRODUCT_SECRET')), 'activation request has valid signature');
                done();
            });
    });

    it('activate with bad email', function (done) {
        var nounce = Math.random().toString(36).substr(2, 10);
        request.post('/api?request=activation')
            .field(constants.PARAM_PRODUCTID, nconf.get('PRODUCT_ID'))
            .field(constants.PARAM_EMAIL, nconf.get('LICENSE_EMAIL') + '.baddomain')
            .field(constants.PARAM_LICENSEKEY, nconf.get('LICENSE_KEY'))
            .field(constants.PARAM_NONCE, nounce)
            .expect(200)
            .expect('Content-Type', 'application/json')
            .end(function (err, res) {
                var result = res.body;
                //console.log(res.body);
                assert(result.hasOwnProperty('timestamp'), 'has timestamp');
                assert(result.hasOwnProperty('code') && result.code === '101', 'code is 101');
                assert(result.hasOwnProperty('error') && result.error === 'Invalid License Key', 'error is Invalid License Key');
                assert(result.hasOwnProperty('activated') && result.activated === false, 'activated is false');
                //signature is incorect for error response
                //assert(signature.validate(result, nconf.get('PRODUCT_SECRET')), 'activation request has valid signature');
                done();
            });
    });

    it('activate with bad license key', function (done) {
        var nounce = Math.random().toString(36).substr(2, 10);
        request.post('/api?request=activation')
            .field(constants.PARAM_PRODUCTID, nconf.get('PRODUCT_ID'))
            .field(constants.PARAM_EMAIL, nconf.get('LICENSE_EMAIL'))
            .field(constants.PARAM_LICENSEKEY, nconf.get('LICENSE_KEY') + 'BAD')
            .field(constants.PARAM_NONCE, nounce)
            .expect(200)
            .expect('Content-Type', 'application/json')
            .end(function (err, res) {
                var result = res.body;
                //console.log(res.body);
                assert(result.hasOwnProperty('timestamp'), 'has timestamp');
                assert(result.hasOwnProperty('code') && result.code === '101', 'code is 101');
                assert(result.hasOwnProperty('error') && result.error === 'Invalid License Key', 'error is Invalid License Key');
                assert(result.hasOwnProperty('activated') && result.activated === false, 'activated is false');
                //signature is incorect for error response
                //assert(signature.validate(result, nconf.get('PRODUCT_SECRET')), 'activation request has valid signature');
                done();
            });
    });

    it('activate with upgraded license key', function (done) {
        var nounce = Math.random().toString(36).substr(2, 10);
        request.post('/api?request=activation')
            .field(constants.PARAM_PRODUCTID, nconf.get('PRODUCT_ID'))
            .field(constants.PARAM_EMAIL, nconf.get('UPGRADED_LICENSE_EMAIL'))
            .field(constants.PARAM_LICENSEKEY, nconf.get('UPGRADED_LICENSE_KEY'))
            .field(constants.PARAM_NONCE, nounce)
            .expect(200)
            .expect('Content-Type', 'application/json')
            .end(function (err, res) {
                var result = res.body;
                //console.log(res.body);
                assert(result.hasOwnProperty('timestamp'), 'has timestamp');
                assert(result.hasOwnProperty('code') && result.code === '105', 'code is 105');
                assert(result.hasOwnProperty('error') && result.error === 'Purchase has been upgraded', 'error is Purchase has been upgraded');
                assert(result.hasOwnProperty('activated') && result.activated === false, 'activated is false');
                //signature is incorect for error response
                //assert(signature.validate(result, nconf.get('PRODUCT_SECRET')), 'activation request has valid signature');
                done();
            });
    });
});
