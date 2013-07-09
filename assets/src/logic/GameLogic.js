__tp.Logic.GameLogic = cc.Node.extend({
    STATE_BLOCK_MOVE: 0,
    STATE_WAITING_ANIMATION: 1,
    STATE_UPDATE_BLOCK: 2,

    //调用逻辑的层的引用
    _referLayer: null,
    //当前玩家是否是1P
    _is1P: true,
    //游戏是否暂停
    _isPause: false,

    //当前玩家控制的方块组
    _currentBlock: null,
    _logicState: 0,
    //NEXT队列区方块组队列
    _nextBlockQueue: [],
    //游戏区的方块矩阵
    _gameField: [],

    _openList: [],
    _waitingActionCalled: false,
    _clearSquareGroupList: [],

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
                    _this._gameField[i].push(null);
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
                    _this._gameField[i][j] = newSquare;
                }
            }
        };

        //初始化当前（即将行动）的方块组
        this._currentBlock = new __tp.Logic.Block(this._referLayer, this, this._is1P);
        initNextBlockQueue();
        initFieldSquares();
    },

    update: function () {
        var _this = this;
        if (!this._isPause) {
            switch (this._logicState) {
                case this.STATE_BLOCK_MOVE:
                    this._currentBlock.update();
                    break;
                case this.STATE_WAITING_ANIMATION:
                    if (!this._waitingActionCalled) {
                        this.scheduleOnce(function () {
                            _this._checkClearSquare();
                        }, 0.5);
                        this._waitingActionCalled = true;
                    }
                    break;
                case this.STATE_UPDATE_BLOCK:
                    //更新NEXT区方块组队列，并更换方块组
                    this.updateNextBlockQueue();
                    break;
            }


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

        this._logicState = this.STATE_BLOCK_MOVE;
    },

    checkStopSquare: function (sq1, sq2, sq1TargetPos) {
        //根据方块1即将下落的位置来判断是否冲突
        var tLogicXY = __tp.util.logic.getLogicXY(sq1TargetPos, this._is1P);
        //逻辑Y坐标为-1表示已触底，另一种情况是要下方已有方块
        if ((tLogicXY != null) && (tLogicXY.y == -1 ||
            this._gameField[tLogicXY.y][tLogicXY.x] != null)) {
            //冲突则停止运动
            var logicXY1 = {x: tLogicXY.x, y: tLogicXY.y + 1};
            var logicXY2 = {x: tLogicXY.x, y: tLogicXY.y + 2};
            //校正两个方块的最终停放位置
            sq1.setDrawPositionByLogicXY(logicXY1, this._is1P);
            sq2.setDrawPositionByLogicXY(logicXY2, this._is1P);
            //设置逻辑矩阵的值
            this._gameField[logicXY1.y][logicXY1.x] = sq1;
            this._gameField[logicXY2.y][logicXY2.x] = sq2;

            this._openList.push(sq2);
            this._openList.push(sq1);

            this._checkClearSquare();

            return true;
        } else {
            return false;
        }
    },

    /**
     * 清除满足条件（3个以上相同的连着的）方块
     * @private
     */
    _checkClearSquare: function () {
        var _this = this;
        var checkArround = function (group, square) {
            var logicXY = square.getLogicXY();
            var x = logicXY.x, y = logicXY.y;
            console.log({x: x, y: y});
            var squareLeft = x - 1 >= 0 ? _this._gameField[y][x - 1] : null;
            var squareRight = x + 1 < __tp.Constant.MAX_LOGIC_W ? _this._gameField[y][x + 1] : null;
            var squareUp = y + 1 < __tp.Constant.MAX_LOGIC_H ? _this._gameField[y + 1][x] : null;
            var squareDown = y - 1 >= 0 ? _this._gameField[y - 1][x] : null;

            square.isChecked = true;
            if (squareLeft != null && !squareLeft.isChecked &&
                squareLeft.getType() == square.getType()) {
                group.push(squareLeft);
                checkArround(group, squareLeft);
            }
            if (squareRight != null && !squareRight.isChecked &&
                squareRight.getType() == square.getType()) {
                group.push(squareRight);
                checkArround(group, squareRight);
            }
            if (squareUp != null && !squareUp.isChecked &&
                squareUp.getType() == square.getType()) {
                group.push(squareUp);
                checkArround(group, squareUp);
            }
            if (squareDown != null && !squareDown.isChecked &&
                squareDown.getType() == square.getType()) {
                group.push(squareDown);
                checkArround(group, squareDown);
            }
        };

        //清空待清除的方块组列表
        this._clearSquareGroupList = [];
        while (this._openList.length > 0) {
            var checkSquare = this._openList.shift();
            var clearSquareGroup = [checkSquare];
            checkArround(clearSquareGroup, checkSquare);
            if (clearSquareGroup.length >= 3) {
                this._clearSquareGroupList.push(clearSquareGroup);
            } else {
                var i;
                for (i in clearSquareGroup) {
                    clearSquareGroup[i].isChecked = false;
                }
            }
        }

        if (this._clearSquareGroupList.length > 0) {
            var i, j;
            //遍历每个待清除方块组
            for (i in this._clearSquareGroupList) {
                var group = this._clearSquareGroupList[i];
                for (j in group) {
                    var logicXY = group[j].getLogicXY();
                    this._gameField[logicXY.y][logicXY.x].fadeOut();
                    this._gameField[logicXY.y][logicXY.x] = null;
                }
            }

            //一列一列地查找空隙
            for (i = 0; i < __tp.Constant.MAX_LOGIC_W; i++) {
                var fallY = 0;
                for (j = 0; j < __tp.Constant.MAX_LOGIC_H; j++) {
                    var checkSquare = this._gameField[j][i];
                    if (checkSquare != null) {
                        var logicXY = checkSquare.getLogicXY();
                        if (logicXY.y > fallY) {
                            checkSquare.fallDown(fallY);

                            this._gameField[logicXY.y][logicXY.x] = null;
                            this._gameField[fallY][logicXY.x] = checkSquare;
                            this._openList.push(checkSquare);
                        }
                        fallY += 1;
                    }
                }
            }
        }
        
        if (this._openList.length > 0) {
            this._waitingActionCalled = false;
            this._logicState = this.STATE_WAITING_ANIMATION;
        } else {
            this._logicState = this.STATE_UPDATE_BLOCK;
        }
    }

});
