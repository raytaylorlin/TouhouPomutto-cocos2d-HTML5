__tp.Logic.Block = cc.Sprite.extend({
    TRANSLATE_DURATION: 0.15,
    UP_MOVE_DURATION: 0.4,
    FADE_IN_DURATION: 0.6,
    DOWN_V: -1,

    _is1P: true,
    _isTranslating: false,
    _isKeyPressedDown: false,
    _square1: null,
    _square2: null,

    /**
     * 方块组构造方法
     * @param layer 要添加精灵的层引用
     * @param is1P 是否是1P
     * @param initPosition 下方块的初始位置，若为空则默认为在游戏区上方的出现位置
     */
    ctor: function (layer, is1P, initPosition) {
        this._super();
        this._is1P = is1P;
        if (initPosition === undefined) {
            this._square1 = new __tp.Sprite.Square(__tp.Constant.INIT_BLOCK_POINT_1P, is1P);
            this._square2 = new __tp.Sprite.Square(
                cc.p(__tp.Constant.INIT_BLOCK_POINT_1P.x,
                    __tp.Constant.INIT_BLOCK_POINT_1P.y + __tp.Constant.SQUARE_SIZE.y), is1P);
//            this._square1.runAction(cc.Sequence.create(this._getStartActionSequence()));
//            this._square2.runAction(cc.Sequence.create(this._getStartActionSequence()));
        } else {
            this._square1 = new __tp.Sprite.Square(initPosition, is1P);
            this._square2 = new __tp.Sprite.Square(
                cc.p(initPosition.x, initPosition.y + __tp.Constant.SQUARE_SIZE.y), is1P);
        }
        layer.addChild(this._square1, __tp.Constant.SQUARE_DEPTH_LEVEL);
        layer.addChild(this._square2, __tp.Constant.SQUARE_DEPTH_LEVEL);
    },

    _getStartActionSequence: function () {
        var seq = [];
        seq.push(cc.DelayTime.create(1.0));
        seq.push(cc.MoveBy.create(0.5, cc.p(0, -80)));
        seq.push(cc.MoveBy.create(20.0, cc.p(0, -960)));
        return seq;
    },

    update: function () {
        //根据是否有按键盘下键决定移动速度
        var delta = this._isKeyPressedDown ? this.DOWN_V * 3 : this.DOWN_V;
        var pos1 = cc.pAdd(this._square1.getPosition(), cc.p(0, delta));
        var pos2 = cc.pAdd(this._square2.getPosition(), cc.p(0, delta));
        this._square1.setPosition(pos1);
        this._square2.setPosition(pos2);
    },

    setKeyPressedDown: function (flag) {
        this._isKeyPressedDown = flag;
    },

    /**
     * 方块组平移
     * @param isLeftMove 是否向左移动
     */
    translate: function (isLeftMove) {
        //平移锁变量， 用于防止在移动中接收键盘输入
        if (!this._isTranslating) {
            this._isTranslating = true;
            var factor = isLeftMove ? -1 : 1;
            var d = cc.p(__tp.Constant.SQUARE_LENGTH * factor, 0);
            //创建一个动作序列，该序列首先执行平移动画，最后解除平移锁
            this._square1.runAction(cc.Spawn.create(cc.Sequence.create(
                [cc.MoveBy.create(this.TRANSLATE_DURATION, d), cc.CallFunc.create(function () {
                    this._isTranslating = false;
                }, this)])));
            this._square2.runAction(cc.Spawn.create(cc.Sequence.create(
                [cc.MoveBy.create(this.TRANSLATE_DURATION, d), cc.CallFunc.create(function () {
                    this._isTranslating = false;
                }, this)])));

        }
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
     * （处于NEXT区的）方块组上升
     */
    upMove: function () {
        this._square1.runAction(cc.MoveBy.create(this.UP_MOVE_DURATION,
            __tp.Constant.NEXT_QUEUE_POS_INTEVAL));
        this._square2.runAction(cc.MoveBy.create(this.UP_MOVE_DURATION,
            __tp.Constant.NEXT_QUEUE_POS_INTEVAL));
    },

    /**
     * 方块组淡入
     */
    fadeIn:function(){
        this._square1.runAction(cc.FadeIn.create(this.FADE_IN_DURATION));
        this._square2.runAction(cc.FadeIn.create(this.FADE_IN_DURATION));
    }

});