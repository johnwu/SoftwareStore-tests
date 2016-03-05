'use strict';

var md5 = require('md5'),
    SIG_KEY = 'sig',
    NOUNCE_KEY = 'nounce',
    SECRET_KEY = 'secret',
    helper = {

        makeQueryString: function (data) {
            var result = [],
                keys = Object.keys(data);

            keys.sort();

            keys.forEach(function (key) {
                if (key !== SIG_KEY) {
                    result.push(`${key}=${data[key]}`);
                }
            });

            return result.join('&');
        },

        validate: function (data, secret) {
            if (data.hasOwnProperty(SIG_KEY)) {
                let qs = [`secret=${secret}`, helper.makeQueryString(data)].join('&');
                return data[SIG_KEY] === md5(qs);
            }
            return false;
        },

        sign: function (data, secret) {
            var qs = [`secret=${secret}`, helper.makeQueryString(data)].join('&');
            return md5(qs);
        }
    };

module.exports = helper;
