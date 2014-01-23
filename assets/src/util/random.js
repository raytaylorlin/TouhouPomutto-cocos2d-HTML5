/**
 * @fileoverview 游戏随机模块，封装了随机数种子扩展库，提供一个随机数发生器
 * @author Ray Taylor Lin <raytaylorlin@gmail.com>
 **/
define(function(require, exports, module) {
    require('lib/seedrandom');

    var GENERATE_NUM = 50,
        DEFAULT_SEED = 'DEFAULT_SEED',
        commonQueue = [
            [],
            []
        ];

    Math.seedrandom(DEFAULT_SEED);

    var getRandomSquareType = function(is1P) {
        var index = is1P ? 0 : 1,
            randomNum, i;

        //若队列中剩余的数量低于预设的值，则再追加一批随机数
        if (commonQueue[index].length < GENERATE_NUM / 2) {
            for (i = 0; i < GENERATE_NUM; i++) {
                randomNum = getMax(4);
                commonQueue[0].push(randomNum);
                commonQueue[1].push(randomNum);
            }
        }

        return commonQueue[index].shift();
    };

    var getRange = function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    };

    var getMax = function(max) {
        return getRange(0, max);
    };

    module.exports = {
        getRandomSquareType: getRandomSquareType,
        getRange: getRange,
        getMax: getMax
    };
});
