Tests for JigoShop Software Add-On

This node project is a set of Mocha tests for the [JigoShop Software Add-On](https://github.com/jkudish/JigoShop-Software-Add-on)

Requires [Mocha](https://github.com/mochajs/mocha) package

    npm install mocha -g

Update config.json

```js
{
    // Base url of Wordpress site
    "URL": "http://secure.sparkbooth.com/staging",

    // Test product properties
    "PRODUCT_ID": "TESTER",
    "PRODUCT_SECRET": "TEST-TEST-TEST-TEST-TEST-TEST-TEST-TEST",
    
    // Test product license
    "LICENSE_EMAIL": "john+staging@sparkbooth.com",
    "LICENSE_KEY": "test-d70b7e3f-4aac-4fd9-9ae5-e0ec47d49818"
}
```
To run tests

    mocha
