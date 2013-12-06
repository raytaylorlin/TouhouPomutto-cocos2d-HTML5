define(function(require, exports, module) {
    var C = require('util/constant'),
        random = require('util/random'),
        share = require('util/share');

    var getSquareType = function() {
        if(C.IS_DEBUG) {
            return 1;
        } else {
            return random.getMax(4) % 4;
        }
    };

    module.exports = {
        getSquareType: getSquareType
    };
});