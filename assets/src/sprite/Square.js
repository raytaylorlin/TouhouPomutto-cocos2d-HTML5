__tp.Sprite.Square = cc.Sprite.extend({
    _logicX: 0,
    _logicY: 0,
    _type: 0,

    _isToClear: false,

    ctor: function (initPosition, is1P) {
        this._super();
//        this._logicX = logicX;
//        this._logicY = logicY;
        //随机产生方块种类
        this._type = __tp.random.getMax(4);

        this.initWithSpriteFrameName(this._getSquareFrameName(is1P, this._type));
        var leftBottomPoint = is1P ?
            __tp.Constant.LEFT_BOTTOM_1P : __tp.Constant.LEFT_BOTTOM_2P;
        this.setPosition(initPosition);
    },

    /**
     * 获取方块的种类
     * @returns {int} 方块的种类
     */
    getType: function () {
        return this._type;
    },

    /**
     * 获取方块切片名称
     * @param is1P 是否是1P
     * @param type 方块的种类
     * @return {string} 方块切片名称
     */
    _getSquareFrameName: function (is1P, type) {
        var player = is1P ? "1" : "2";
        return "square" + player + "-" + type + ".png";
    }
});