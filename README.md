Tests for JigoShop Software Add-On

This node project is a set of Mocha tests for the [JigoShop Software Add-On](https://github.com/jkudish/JigoShop-Software-Add-on)

Requires [Mocha](https://github.com/mochajs/mocha) package

    npm install mocha -g

Update config.json

```js
{
    // Base url of Wordpress site
    "URL": "http://yourwebsitehere.com",

    // Test product properties
    "PRODUCT_ID": "YOUR_PRODUCT_ID_HERE",
    "PRODUCT_SECRET": "YOUR_PRODUCT_SECRET_KEY_HERE",
    
    // Test product license
    "LICENSE_EMAIL": "your@email.here",
    "LICENSE_KEY": "YOUR_LICENSE_KEY_HERE"
}
```
To run tests, open command line at root of project folder and enter

    mocha
