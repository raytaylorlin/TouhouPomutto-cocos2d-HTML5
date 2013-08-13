define(function (require, exports) {
    exports.getRange = function (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    };

    exports.getMax = function (max) {
        return this.getRange(0, max);
    };
});