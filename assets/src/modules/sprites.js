define(function(require, exports, module) {
    var C = require('util/constant'),
        random = require('util/random'),
        share = require('util/share'),
        test = require('modules/test');

    var Square = cc.Sprite.extend({
        FADE_OUT_DURATION: 0.2,
        FALL_DOWN_DURATION: 0.3,
        FALL_BUFFER_DURATION: 0.1,
        CLEAR_BLINK_DURATION: 0.3,
        CLEAR_BLINK_TIMES: 3,

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
        ctor: function(drawPosition, is1P, squareType) {
            this._super();
            this._is1P = is1P;
            //随机产生方块种类
            if (squareType === undefined) {
                // this._type = test.getSquareType();
                this._type = random.getRandomSquareType(is1P);
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
        getType: function() {
            return this._type;
        },

        getDrawPosition: function() {
            return this.getPosition();
            // return cc.p(pos.x, pos.y);
        },

        getLogicXY: function() {
            return Square.getLogicXY(this.getPosition(), this._is1P);
        },

        /**
         * 停止方块的运动
         * @param is1P 是否是1P
         * @param [logicXY] 逻辑坐标（若为空则以当前的绘制位置来决定逻辑坐标）
         */
        stop: function(is1P, logicXY) {
            this.runAction(this._getBufferAction());
            this._resetDrawPositionByLogicXY(is1P, logicXY);
        },

        /**
         * 根据逻辑坐标来重置方块的绘制位置
         * @param is1P 是否是1P
         * @param [logicXY] 逻辑坐标（若为空则以当前的绘制位置来决定逻辑坐标）
         */
        _resetDrawPositionByLogicXY: function(is1P, logicXY) {
            var LEFT_BOTTOM = is1P ? C.GAME_FIELD_INIT_POS_1P :
                C.GAME_FIELD_INIT_POS_2P,
                SQUARE_LENGTH = C.SQUARE_LENGTH,
                logicXY = logicXY || this.getLogicXY(),
                drawPosition;

            drawPosition = cc.p(LEFT_BOTTOM.x + logicXY.x * SQUARE_LENGTH,
                LEFT_BOTTOM.y + logicXY.y * SQUARE_LENGTH);
            this.setPosition(drawPosition);
        },

        /**
         * 方块消除
         */
        clear: function() {
            this.runAction(cc.Sequence.create([
                cc.Blink.create(this.CLEAR_BLINK_DURATION, this.CLEAR_BLINK_TIMES),
                cc.Spawn.create(cc.ScaleTo.create(this.FADE_OUT_DURATION, 0.2, 0.2),
                    cc.FadeOut.create(this.FADE_OUT_DURATION))
            ]));
        },

        /**
         * 快速下落效果（用于底下方块被消除后下落）
         * @param  {Object} targetLogicY 下落目标位置的逻辑坐标
         */
        fallDown: function(targetLogicY) {
            var deltaLogicY = this.getLogicXY().y - targetLogicY,
                moveByAction, bufferAction, delayAction, callFuncAction;
            if (deltaLogicY > 0) {
                this._isFallingDown = true;
                share.fallingSquareList.push(this);

                //快速下坠阶段
                moveByAction = cc.MoveBy.create(this.FALL_DOWN_DURATION,
                    cc.pMult(cc.p(0, -C.SQUARE_LENGTH), deltaLogicY));
                //缓冲阶段
                bufferAction = this._getBufferAction();
                //延时阶段
                delayAction = cc.DelayTime.create(0.1);
                //瞬时的逻辑计算阶段 
                callFuncAction = cc.CallFunc.create(function() {
                    share.fallingSquareList.pop();
                }, this);
                this.runAction(cc.Spawn.create(cc.Sequence.create(
                    [delayAction, moveByAction, bufferAction, delayAction, callFuncAction])));
            }
        },

        /**
         * 获取方块切片名称
         * @param is1P 是否是1P
         * @param type 方块的种类
         * @return {string} 方块切片名称
         */
        _getSquareFrameName: function(is1P, type) {
            var player = is1P ? "1" : "2";
            return "square" + player + "-" + type + ".png";
        },

        /*
         * 获取方块落地的缓冲动画
         */
        _getBufferAction: function() {
            return cc.Sequence.create([
                cc.Spawn.create(cc.ScaleTo.create(this.FALL_BUFFER_DURATION, 1, 0.9),
                    cc.MoveBy.create(this.FALL_BUFFER_DURATION, cc.p(0, -4))),
                cc.Spawn.create(cc.ScaleTo.create(this.FALL_BUFFER_DURATION, 1, 1),
                    cc.MoveBy.create(this.FALL_BUFFER_DURATION, cc.p(0, 4)))
            ]);
        }
    });

    Square.getLogicXY = function(drawPos, is1P) {
        var LEFT_BOTTOM = is1P ? C.GAME_FIELD_INIT_POS_1P :
            C.GAME_FIELD_INIT_POS_2P,
            SQUARE_LENGTH = C.SQUARE_LENGTH,
            HALF_SQUARE_LENGTH = SQUARE_LENGTH / 2;
        //console.assert(parseInt(drawPos.x) === drawPos.x, drawPos.x);
        //console.assert(parseInt(drawPos.y) === drawPos.y, drawPos.y);
        var x = Math.floor((Math.round(drawPos.x) - LEFT_BOTTOM.x + HALF_SQUARE_LENGTH) / SQUARE_LENGTH);
        var y = Math.floor((Math.round(drawPos.y) - LEFT_BOTTOM.y + HALF_SQUARE_LENGTH) / SQUARE_LENGTH);
        if (y < -1 || y > C.MAX_LOGIC_H + C.DELTA_LOGIC_H ||
            x < 0 || x >= C.MAX_LOGIC_W) {
            return null;
        } else {
            return {
                x: x,
                y: y
            };
        }
    };

    var ScoreNumber = cc.Sprite.extend({
        _bit: 0,
        _number: 0,
        FADE_OUT_DURATION: 0.5,
        FALL_DOWN_DURATION: 0.3,

        /**
         * 构造方法
         * @param is1P 是否是1P
         * @param bit 数字处于第几位（0是个位）
         */
        ctor: function(is1P, bit) {
            this._super();
            this._bit = bit;
            this._number = 0;

            var basePosition = is1P ? C.INIT_SCORE_POINT_1P :
                C.INIT_SCORE_POINT_2P,
                drawPosition = cc.pAdd(basePosition, 
                    cc.p(-C.GAME_SCORE_SIZE.x * this._bit, 0));

            //设置绘制位置
            this.setPosition(drawPosition);
            //显示对应切片
            this.initWithSpriteFrameName(this._number + '.png');
        },

        /**
         * 根据数字设置切片，以显示对应的数字
         * @param {Integer} number 要设置的数字
         */
        setNumber: function(number) {
            this._number = number;
            var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(this._number + '.png');
            this.setDisplayFrame(frame);
        }
    });

    module.exports = {
        Square: Square,
        ScoreNumber: ScoreNumber
    };
});