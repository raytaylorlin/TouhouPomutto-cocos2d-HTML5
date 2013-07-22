__tp.Logic.GameLogic = cc.Node.extend({
    //游戏逻辑的状态值
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
    //游戏逻辑状态
    _logicState: 0,
    //NEXT队列区方块组队列
    _nextBlockQueue: [],
    //游戏区的方块矩阵
    _gameField: [],
    //待清除方块的开放列表，其中存放了需要检测清除的方块
    _openList: [],
    //待清除方块集合列表，里面存放着一个个列表，每个列表的方块都是待清除状态
    _clearSquareSetList: [],
    //动作等待锁，在逻辑值为STATE_WAITING_ANIMATION，保证延时动作只执行一遍
    _waitingActionCalled: false,


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
            //根据当前状态值来选择要执行的逻辑
            switch (this._logicState) {
                //方块组移动状态（->STATE_BLOCK_MOVE）
                case this.STATE_BLOCK_MOVE:
                    //更新当前方块组（下落及碰撞检测）
                    this._currentBlock.update();
                    break;
                //等待动画执行状态（->STATE_BLOCK_MOVE）
                case this.STATE_WAITING_ANIMATION:
                    if (!this._waitingActionCalled) {
                        //延时（等待动画完成），再进行下一轮的清除方块检查
                        this.scheduleOnce(function () {
                            _this._checkClearSquare();
                        }, 0.5);
                        this._waitingActionCalled = true;
                    }
                    break;
                //更新方块组状态（->STATE_BLOCK_MOVE）
                case this.STATE_UPDATE_BLOCK:
                    //更新NEXT区方块组队列，并更换方块组
                    this.updateNextBlockQueue();
                    break;
            }
        }
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

    /**
     * 下落碰撞检测
     * @param sq1 方块1（位于下方）
     * @param sq2 方块2（位于上方）
     * @param sq1TargetPos 方块1即将要下落到的坐标
     * @returns {boolean} 是否碰撞
     */
    checkStopSquare: function (sq1, sq2, sq1TargetPos) {
        //根据方块1即将下落的位置来判断是否冲突
        var tLogicXY = __tp.util.logic.getLogicXY(sq1TargetPos, this._is1P);
        //逻辑Y坐标为-1表示已触底，另一种情况是下方已有方块
        if ((tLogicXY != null) && (tLogicXY.y == -1 ||
            this._gameField[tLogicXY.y][tLogicXY.x] != null)) {
            var logicXY1 = {x: tLogicXY.x, y: tLogicXY.y + 1};
            var logicXY2 = {x: tLogicXY.x, y: tLogicXY.y + 2};
            //校正两个方块的最终停放位置
            sq1.setDrawPositionByLogicXY(logicXY1, this._is1P);
            sq2.setDrawPositionByLogicXY(logicXY2, this._is1P);
            //设置逻辑矩阵的值
            this._gameField[logicXY1.y][logicXY1.x] = sq1;
            this._gameField[logicXY2.y][logicXY2.x] = sq2;
            //将两个方块添加到开放列表中
            this._openList.push(sq2);
            this._openList.push(sq1);
            //检测并清除方块
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
        /**
         * 深度优先搜索指定方块四周，将有相同花色的方块纳入一个列表
         * @param set 存放相同花色方块的列表
         * @param checkSquare 要检查四周的方块
         */
        var checkArround = function (set, checkSquare)  {
            var logicXY = checkSquare.getLogicXY();
            var x = logicXY.x, y = logicXY.y;
            console.log({x: x, y: y});

            //获取周围的4个方块（依次为左、右、上、下）
            var arroundSquareList = [];
            arroundSquareList.push(x - 1 >= 0 ? _this._gameField[y][x - 1] : null);
            arroundSquareList.push(x + 1 < __tp.Constant.MAX_LOGIC_W ? _this._gameField[y][x + 1] : null);
            arroundSquareList.push(y + 1 < __tp.Constant.MAX_LOGIC_H ? _this._gameField[y + 1][x] : null);
            arroundSquareList.push(y - 1 >= 0 ? _this._gameField[y - 1][x] : null);

            //将方块标记为“已检查”状态，以免重复检测
            checkSquare.isChecked = true;
            var i;
            for(i in arroundSquareList){
                var arroundSquare = arroundSquareList[i];
                //纳入列表的条件：不为空，未检查过，颜色相同
                if (arroundSquare != null && !arroundSquare.isChecked &&
                    arroundSquare.getType() == checkSquare.getType()) {
                    set.push(arroundSquare);
                    //递归检查下一个方块
                    checkArround(set, arroundSquare);
                }
            }

//            //获取周围的4个方块
//            var squareLeft = x - 1 >= 0 ? _this._gameField[y][x - 1] : null;
//            var squareRight = x + 1 < __tp.Constant.MAX_LOGIC_W ? _this._gameField[y][x + 1] : null;
//            var squareUp = y + 1 < __tp.Constant.MAX_LOGIC_H ? _this._gameField[y + 1][x] : null;
//            var squareDown = y - 1 >= 0 ? _this._gameField[y - 1][x] : null;
//
//            //将方块标记为“已检查”状态，以免重复检测
//            checkSquare.isChecked = true;
//            if (squareLeft != null && !squareLeft.isChecked &&
//                squareLeft.getType() == checkSquare.getType()) {
//                group.push(squareLeft);
//                checkArround(group, squareLeft);
//            }
//            if (squareRight != null && !squareRight.isChecked &&
//                squareRight.getType() == checkSquare.getType()) {
//                group.push(squareRight);
//                checkArround(group, squareRight);
//            }
//            if (squareUp != null && !squareUp.isChecked &&
//                squareUp.getType() == checkSquare.getType()) {
//                group.push(squareUp);
//                checkArround(group, squareUp);
//            }
//            if (squareDown != null && !squareDown.isChecked &&
//                squareDown.getType() == checkSquare.getType()) {
//                group.push(squareDown);
//                checkArround(group, squareDown);
//            }
        };

        /* 本方法从此处开始 */

        /* 1.查找所有待清除的方块 */
        //清空待清除的方块集合列表
        this._clearSquareSetList = [];
        //由于存在连续消除的情况，判定消除结束（切换到下一个方块组）的条件是：开放列表为空
        while (this._openList.length > 0) {
            //取出开放列表中的一个方块
            var checkSquare = this._openList.shift();
            //初始化待清除方块集合
            var clearSquareSet = [checkSquare];

            //开始深度优先搜索
            checkArround(clearSquareSet, checkSquare);
            //同色的方块不少于3个，则将这个集合加入到列表
            if (clearSquareSet.length >= 3) {
                this._clearSquareSetList.push(clearSquareSet);
            } else {
                //重置搜索过的方块为“未检查”状态
                var i;
                for (i in clearSquareSet) {
                    clearSquareSet[i].isChecked = false;
                }
            }
        }

        /* 2.清除所有需要清除的方块 */
        if (this._clearSquareSetList.length > 0) {
            var i, j;
            //遍历每个待清除方块集合，并对所有方块清除
            for (i in this._clearSquareSetList) {
                var group = this._clearSquareSetList[i];
                for (j in group) {
                    var logicXY = group[j].getLogicXY();
                    this._gameField[logicXY.y][logicXY.x].fadeOut();
                    this._gameField[logicXY.y][logicXY.x] = null;
                }
            }

            /* 3.查找空隙并让悬空的方块掉落 */
            //一列一列地查找空隙
            for (i = 0; i < __tp.Constant.MAX_LOGIC_W; i++) {
                var fallY = 0;
                //从最底部往上查找
                for (j = 0; j < __tp.Constant.MAX_LOGIC_H; j++) {
                    var checkSquare = this._gameField[j][i];
                    if (checkSquare != null) {
                        var logicXY = checkSquare.getLogicXY();
                        if (logicXY.y > fallY) {
                            checkSquare.fallDown(fallY);
                            //掉落的方块需要在逻辑矩阵中修改位置
                            this._gameField[logicXY.y][logicXY.x] = null;
                            this._gameField[fallY][logicXY.x] = checkSquare;
                            //掉落的方块要添加到开放列表，等待下轮的检测
                            this._openList.push(checkSquare);
                        }
                        fallY += 1;
                    }
                }
            }
        }

        /* 4.根据开放列表的状况跳转逻辑状态 */
        //开放列表不为空，则切换到等待执行动画状态
        if (this._openList.length > 0) {
            this._waitingActionCalled = false;
            this._logicState = this.STATE_WAITING_ANIMATION;
        } else {
            //没有需要清除的方块，则切换新的方块组
            this._logicState = this.STATE_UPDATE_BLOCK;
        }
    },


    /**
     * 获取本逻辑是否是1P
     * @returns {boolean} 是否是1P
     */
    is1P: function () {
        return this._is1P;
    },

    /**
     * 获取游戏状态是否暂停
     * @returns {boolean} 游戏是否暂停
     */
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
    }
});
