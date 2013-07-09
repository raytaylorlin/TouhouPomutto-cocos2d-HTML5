__tp.Sprite.Square = cc.Sprite.extend({
    FADE_OUT_DURATION: 0.5,
    FALL_DOWN_DURATION: 0.3,

    _logicX: -1,
    _logicY: -1,
    _is1P: true,
    _type: 0,


    isChecked: false,
    _isToClear: false,
    _isFallingDown: false,

    /**
     * 构造方法
     * @param drawPosition 绘制位置
     * @param is1P 是否是1P
     * @param squareType 方块种类（可空）
     */
    ctor: function (drawPosition, is1P, squareType) {
        this._super();
        this._is1P = is1P;
        //随机产生方块种类
        if (squareType == undefined) {
            this._type = __tp.util.random.getMax(4) % 4;
        } else {
            this._type = squareType;
        }
        //根据方块种类设置显示的切片
        this.initWithSpriteFrameName(this._getSquareFrameName(is1P, this._type));
        //设置绘制位置
        this.setPosition(drawPosition);
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

    getLogicXY: function () {
        return __tp.util.logic.getLogicXY(this.getPosition(), this._is1P);
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

    fadeOut: function () {
        this.runAction(cc.FadeOut.create(this.FADE_OUT_DURATION));
    },

    fallDown: function (targetLogicY) {
        var deltaLogicY = this.getLogicXY().y - targetLogicY;
        if (deltaLogicY > 0) {
            this._isFallingDown = true;
            __tp.util.shareList.push(this);
            var moveByAction = cc.MoveBy.create(this.FALL_DOWN_DURATION,
                cc.pMult(cc.p(0, -__tp.Constant.SQUARE_LENGTH), deltaLogicY));
            var callFuncAction = cc.CallFunc.create(function () {
                __tp.util.shareList.pop();
            }, this);
            this.runAction(cc.Spawn.create(cc.Sequence.create(
                [moveByAction, callFuncAction])));
        }
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