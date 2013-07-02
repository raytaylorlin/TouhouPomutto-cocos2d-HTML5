__tp.Sprite.Square = cc.Sprite.extend({
    _logicX: 0,
    _logicY: 0,
    _type: 0,

    _isToClear: false,

    /**
     * 构造方法
     * @param layer 绘制方块的层的引用
     * @param drawPosition 绘制位置
     * @param is1P 是否是1P
     * @param squareType 方块种类（可空）
     */
    ctor: function (layer, drawPosition, is1P, squareType) {
        this._super();
        //随机产生方块种类
        if (squareType == undefined) {
            this._type = __tp.util.random.getMax(4) % 4;
        } else {
            this._type = squareType;
        }

        this.initWithSpriteFrameName(this._getSquareFrameName(is1P, this._type));
        this.setPosition(drawPosition);
        layer.addChild(this, __tp.Constant.SQUARE_DEPTH_LEVEL);
    },

    /**
     * 获取方块的种类
     * @returns {int} 方块的种类
     */
    getType: function () {
        return this._type;
    },

    getDrawPosition: function () {
        return this.getPosition();
    },

    /**
     * 根据逻辑坐标来设置方块的绘制位置
     * @param logicXY 逻辑坐标
     * @param is1P 是否是1P
     */
    setDrawPositionByLogicXY: function (logicXY, is1P) {
        var LEFT_BOTTOM = is1P ? __tp.Constant.GAME_FIELD_INIT_POS_1P :
            __tp.Constant.GAME_FIELD_INIT_POS_2P;
        var SQUARE_LENGTH = __tp.Constant.SQUARE_LENGTH;
        this.setPosition(cc.p(LEFT_BOTTOM.x + logicXY.x * SQUARE_LENGTH,
            LEFT_BOTTOM.y + logicXY.y * SQUARE_LENGTH));
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