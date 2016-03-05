'use strict';
/* global describe, before, it */

var assert = require('assert'),
    nconf = require('nconf'),
    supertest = require('supertest'),
    signature = require('../src/utils/signature.js'),
    constants = require('../src/utils/constants.js');

describe('Trial API', function () {

    var request;
    
    before(function () {
        nconf.env().file({
            file: 'config.json'
        });
        request = supertest(nconf.get('URL'));
        console.log(nconf.get('URL'));
    });
    
    it('get trial for test product', function (done) {
        var nounce = Math.random().toString(36).substr(2, 10);
        request.post('/api?request=trial')
            .field(constants.PARAM_PRODUCTID, nconf.get('PRODUCT_ID'))
            .field(constants.PARAM_NONCE, nounce)
            .expect(200)
            .expect('Content-Type', 'application/json')
            .end(function (err, res) {
                var result = res.body;
                console.log('trial request response', res.body);
                assert(signature.validate(result, nconf.get('PRODUCT_SECRET')), 'trail request has valid signature');
                assert(result.hasOwnProperty(constants.PARAM_NONCE) && result[constants.PARAM_NONCE] === nounce, 'nounce matches');
                assert(result.hasOwnProperty('units') && result.units === 'days', 'units is days');
                assert(result.hasOwnProperty('duration') && result.duration === '1', 'duration is 1');
                assert(result.hasOwnProperty('timestamp'), 'has timestamp');
                done();
            });
    });

    it('get trial for fake product', function (done) {
        var nounce = Math.random().toString(36).substr(2, 10);
        request.post('/api?request=trial')
            .field(constants.PARAM_PRODUCTID, 'I_DONT_EXISTS')
            .field(constants.PARAM_NONCE, nounce)
            .expect(200)
            .expect('Content-Type', 'application/json')
            .end(function (err, res) {
                var result = res.body;
                console.log('fake product trial request response', res.body);
                assert(result.hasOwnProperty('error') && result.error === 'Invalid Request', 'error is Invalid Request');
                assert(result.hasOwnProperty('code') && result.code === '100', 'code is 100');
                assert(result.hasOwnProperty('timestamp'), 'has timestamp');
                done();
            });
    });
});