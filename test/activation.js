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

    it('active product', function (done) {
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
                console.log(res.body);
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
                assert(result.hasOwnProperty('activated'), 'has activated');
                assert(result.hasOwnProperty('code') && result.code === '102', 'code is 102');
                assert(result.hasOwnProperty('error') && result.error === 'Software has been deactivated', 'error is Software has been deactivated');
                assert(result.hasOwnProperty('activated') && result.activated === false, 'activated is false');
                //assert(signature.validate(result, nconf.get('PRODUCT_SECRET')), 'activation request has valid signature');
                instanceid = result.instanceid;
                done();
            });
    });
});