__tp.Logic.Block = cc.Sprite.extend({
    TRANSLATE_DURATION: 0.15,
    UP_MOVE_DURATION: 0.4,
    EXCHANGE_DURATION: 0.2,
    FADE_IN_DURATION: 0.6,
    DOWN_V: -1,

    _is1P: true,
    //平移动画锁
    _isTranslating: false,
    //方块交换动画锁
    _isExchanging: false,
    //方块组是否停止运动
    _isStop: false,
    _isKeyPressedDown: false,

    _gameField: null,

    _square1: null,
    _square2: null,

    /**
     * 方块组构造方法
     * @param layer 要添加精灵的层引用
     * @param gameField 游戏区的逻辑矩阵
     * @param is1P 是否是1P
     * @param initPosition 下方块的初始位置，若为空则默认为在游戏区上方的出现位置
     */
    ctor: function (layer, gameField, is1P, initPosition) {
        this._super();
        this._is1P = is1P;
        this._gameField = gameField;
        if (initPosition === undefined) {
            this._square1 = new __tp.Sprite.Square(layer, __tp.Constant.INIT_BLOCK_POINT_1P, is1P);
            this._square2 = new __tp.Sprite.Square(layer,
                cc.p(__tp.Constant.INIT_BLOCK_POINT_1P.x,
                    __tp.Constant.INIT_BLOCK_POINT_1P.y + __tp.Constant.SQUARE_SIZE.y), is1P);
//            this._square1.runAction(cc.Sequence.create(this._getStartActionSequence()));
//            this._square2.runAction(cc.Sequence.create(this._getStartActionSequence()));
        } else {
            this._square1 = new __tp.Sprite.Square(layer, initPosition, is1P);
            this._square2 = new __tp.Sprite.Square(layer,
                cc.p(initPosition.x, initPosition.y + __tp.Constant.SQUARE_SIZE.y), is1P);
        }
    },

    _getStartActionSequence: function () {
        var seq = [];
        seq.push(cc.DelayTime.create(1.0));
        seq.push(cc.MoveBy.create(0.5, cc.p(0, -80)));
        seq.push(cc.MoveBy.create(20.0, cc.p(0, -960)));
        return seq;
    },

    update: function () {
        if (!this._isStop) {
            //根据是否有按键盘下键决定移动速度
            var delta = this._isKeyPressedDown ? this.DOWN_V * 3 : this.DOWN_V;
            var pos1 = cc.pAdd(this._square1.getPosition(), cc.p(0, delta));
            //根据方块1即将下落的位置来判断是否冲突
            var tLogicXY = __tp.util.logic.getLogicXY(pos1, this._is1P);
            if (tLogicXY != null && this._gameField[tLogicXY.y][tLogicXY.x] != -1) {
                //冲突则停止运动
                var logicXY1 = {x: tLogicXY.x, y: tLogicXY.y + 1};
                var logicXY2 = {x: tLogicXY.x, y: tLogicXY.y + 2};
                this._square1.setDrawPositionByLogicXY(logicXY1, this._is1P);
                this._square2.setDrawPositionByLogicXY(logicXY2, this._is1P);
                this._isStop = true;
                return;
            }
            var pos2 = cc.pAdd(this._square2.getPosition(), cc.p(0, delta));
            this._square1.setPosition(pos1);
            this._square2.setPosition(pos2);
        }
    },

    /**
     * 方块组平移
     * @param isLeftMove 是否向左移动
     */
    translate: function (isLeftMove) {
        //平移动画锁变量， 用于防止在动画执行过程中响应键盘输入
        if (!this._isTranslating) {
            if (!this.checkHorizontalBlock(isLeftMove)) {
                this._isTranslating = true;
                //计算平移的距离
                var factor = isLeftMove ? -1 : 1;
                var d = cc.p(__tp.Constant.SQUARE_LENGTH * factor, 0);
                //创建一个动作序列，该序列首先执行平移动画，最后解除动画锁
                this._square1.runAction(cc.Spawn.create(cc.Sequence.create(
                    [cc.MoveBy.create(this.TRANSLATE_DURATION, d), cc.CallFunc.create(function () {
                        this._isTranslating = false;
                    }, this)])));
                this._square2.runAction(cc.Spawn.create(cc.Sequence.create(
                    [cc.MoveBy.create(this.TRANSLATE_DURATION, d), cc.CallFunc.create(function () {
                        this._isTranslating = false;
                    }, this)])));
            }
        }
    },

    /**
     * 检测是否被其它实体阻碍移动
     * @param isLeftMove 是否向左移动
     * @return {boolean} 方块组是否被阻碍到
     */
    checkHorizontalBlock: function (isLeftMove) {
        var LEFT_BOTTOM = this._is1P ? __tp.Constant.GAME_FIELD_INIT_POS_1P :
            __tp.Constant.GAME_FIELD_INIT_POS_2P;
        var SQUARE_LENGTH = __tp.Constant.SQUARE_LENGTH;
        var drawPos = this._square1.getDrawPosition();
        //左移的情况，右移情况类似
        if (isLeftMove) {
            //判断游戏区边界的情况
            if (drawPos.x - SQUARE_LENGTH < LEFT_BOTTOM.x) {
                return true;
            }
            /* 计算目标判定点的逻辑坐标 */
            //所谓目标判定点，即当前方块绘制中心水平方向平移一个方块单位的距离，
            //再向下移动半个方块单位的距离
            var tLogicXY = __tp.util.logic.getLogicXY(
                cc.pSub(drawPos, cc.p(SQUARE_LENGTH, -SQUARE_LENGTH / 2)), this._is1P);
            if (this._gameField[tLogicXY.y][tLogicXY.x] != -1) {
                return true;
            }
        } else {
            if (drawPos.x + SQUARE_LENGTH >
                LEFT_BOTTOM.x + SQUARE_LENGTH * __tp.Constant.MAX_LOGIC_W) {
                return true;
            }
            var tLogicXY = __tp.util.logic.getLogicXY(
                cc.pAdd(drawPos, cc.p(SQUARE_LENGTH, -SQUARE_LENGTH / 2)), this._is1P);
            if (this._gameField[tLogicXY.y][tLogicXY.x] != -1) {
                return true;
            }
        }
        return false;
    },


    /**
     * 按下旋转键后
     */
    exchangeSquare: function () {
        //方块交换东环锁变量， 用于防止在动画执行过程中响应键盘输入
        if (!this._isExchanging) {
            this._isExchanging = true;
            //方块1执行上移动画，方块2执行下移动画，即两者交换位置
            var SQUARE_LENGTH = __tp.Constant.SQUARE_LENGTH;
            this._square1.runAction(cc.Spawn.create(cc.Sequence.create(
                [cc.MoveBy.create(this.EXCHANGE_DURATION, cc.p(0, SQUARE_LENGTH)), cc.CallFunc.create(function () {
                    this._isExchanging = false;
                }, this)])));
            this._square2.runAction(cc.Spawn.create(cc.Sequence.create(
                [cc.MoveBy.create(this.EXCHANGE_DURATION, cc.p(0, -SQUARE_LENGTH)), cc.CallFunc.create(function () {
                    this._isExchanging = false;
                }, this)])));
            //交换两个方块，始终保持方块1保存的是下方的方块
            var temp = this._square1;
            this._square1 = this._square2;
            this._square2 = temp;
        }
    },

    /**
     * （处于NEXT区的）方块组上升
     */
    upMove: function () {
        this._square1.runAction(cc.MoveBy.create(this.UP_MOVE_DURATION,
            __tp.Constant.NEXT_QUEUE_POS_INTEVAL));
        this._square2.runAction(cc.MoveBy.create(this.UP_MOVE_DURATION,
            __tp.Constant.NEXT_QUEUE_POS_INTEVAL));
    },

    /**
     * 将方块组的位置重置到默认位置
     */
    resetPosition: function () {
        var basePoint = this._is1P ? __tp.Constant.INIT_BLOCK_POINT_1P :
            __tp.Constant.INIT_BLOCK_POINT_2P;
        var pos1 = basePoint;
        var pos2 = cc.p(basePoint.x, basePoint.y + __tp.Constant.SQUARE_SIZE.y)
        this._square1.setPosition(pos1);
        this._square2.setPosition(pos2);
        if (__tp.Constant.IS_DEBUG) {
            console.log(this._square1.getType());
            console.log(this._square2.getType());
        }
    },

    /**
     * 方块组淡入
     */
    fadeIn: function () {
        this._square1.runAction(cc.FadeIn.create(this.FADE_IN_DURATION));
        this._square2.runAction(cc.FadeIn.create(this.FADE_IN_DURATION));
    },

    /**
     * 设置“向下”键是否被按下
     * @param flag 设置的值
     */
    setKeyPressedDown: function (flag) {
        this._isKeyPressedDown = flag;
    }
});