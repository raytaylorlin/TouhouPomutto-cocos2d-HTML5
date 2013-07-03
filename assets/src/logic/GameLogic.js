__tp.Logic.GameLogic = cc.Class.extend({
    //调用逻辑的层的引用
    _referLayer: null,
    //当前玩家是否是1P
    _is1P: true,
    //游戏是否暂停
    _isPause: false,
    //当前玩家控制的方块组
    _currentBlock: null,
    //NEXT队列区方块组队列
    _nextBlockQueue: [],
    //游戏区的逻辑矩阵
    _gameField: [],

    ctor: function (referLayer, is1P) {
        //获取调用逻辑的层的引用
        this._referLayer = referLayer;
        this._is1P = is1P;
    },

    /**
     * 游戏逻辑初始化
     */
    init: function () {
        var _this = this;

        /**
         * 初始化NEXT区方块组队列
         */
        var initNextBlockQueue = function () {
            var i;
            var basePos = _this._is1P ? __tp.Constant.NEXT_QUEUE_INIT_POS_1P :
                __tp.Constant.NEXT_QUEUE_INIT_POS_2P;

            for (i = 0; i < __tp.Constant.NEXT_QUEUE_MAX_NUM; i++) {
                var pos = cc.pSub(basePos, cc.pMult(__tp.Constant.NEXT_QUEUE_POS_INTEVAL, i));
                var newBlock = new __tp.Logic.Block(_this._referLayer, _this, _this._is1P, pos);
                _this._nextBlockQueue.push(newBlock);
            }
        };

        /**
         * 初始化游戏区起始方块（4*7）
         */
        var initFieldSquares = function () {
            var i, j;
            var basePos = _this._is1P ? __tp.Constant.GAME_FIELD_INIT_POS_1P :
                __tp.Constant.GAME_FIELD_INIT_POS_2P;
            var sqLength = __tp.Constant.SQUARE_LENGTH;

            //初始化游戏逻辑区域
            for (i = 0; i < __tp.Constant.MAX_LOGIC_H; i++) {
                _this._gameField.push(new Array());
                for (j = 0; j < __tp.Constant.MAX_LOGIC_W; j++) {
                    //-1代表该位没有方块
                    _this._gameField[i].push(-1);
                }
            }

            //游戏区起始方块
            for (i = 0; i < __tp.Constant.DEFAULT_INIT_FIELD_H; i++) {
                for (j = 0; j < __tp.Constant.MAX_LOGIC_W; j++) {
                    var randomType = __tp.util.random.getMax(4);
                    var newSquare = new __tp.Sprite.Square(cc.pAdd(
                        basePos, cc.p(sqLength * j, sqLength * i)), _this._is1P, randomType);
                    _this._referLayer.addChild(newSquare, __tp.Constant.SQUARE_DEPTH_LEVEL);
                    //添加到逻辑矩阵
                    _this._gameField[i][j] = randomType;
                }
            }
            console.log(_this._gameField);
        };

        //初始化当前（即将行动）的方块组
        this._currentBlock = new __tp.Logic.Block(this._referLayer, this, this._is1P);
        initNextBlockQueue();
        initFieldSquares();
    },

    update: function () {
        if (!this._isPause) {
            this._currentBlock.update();
        }
    },

    /**
     * 是否是1P
     * @returns {boolean}
     */
    is1P: function () {
        return this._is1P;
    },

    isPause: function () {
        return this._isPause;
    },

    /**
     * 切换游戏暂停状态
     */
    pauseGame: function () {
        this._isPause = !this._isPause;
    },

    /**
     * 获取当前活动方块组
     * @returns {Logic.Block} 当前活动方块组
     */
    getCurrentBlock: function () {
        return this._currentBlock;
    },

    getGameField: function () {
        return this._gameField;
    },


    /**
     * 更新NEXT区方块组队列，并更换方块组
     */
    updateNextBlockQueue: function () {
        //取队头方块组并将其设置为当前活跃方块组，并重置位置
        this._currentBlock = this._nextBlockQueue.shift();
        this._currentBlock.resetPosition();
        //设置其他4个方块组的上升动画
        var i;
        for (i = 0; i < __tp.Constant.NEXT_QUEUE_MAX_NUM - 1; i++) {
            this._nextBlockQueue[i].upMove();
        }
        //创建新的方块组并放在NEXT区最下面
        var basePos = this._is1P ? __tp.Constant.NEXT_QUEUE_INIT_POS_1P :
            __tp.Constant.NEXT_QUEUE_INIT_POS_2P;
        var pos = cc.pSub(basePos, cc.pMult(__tp.Constant.NEXT_QUEUE_POS_INTEVAL,
            __tp.Constant.NEXT_QUEUE_MAX_NUM - 1));
        var newBlock = new __tp.Logic.Block(this._referLayer, this, this._is1P, pos);
        this._nextBlockQueue.push(newBlock);
        //触发淡入动画
        newBlock.fadeIn();
    }

});
