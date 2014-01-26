define(function(require, exports, module) {
    var C = require('util/constant'),
        random = require('util/random'),
        share = require('util/share'),
        Square = require('modules/sprites').Square,
        ScoreNumber = require('modules/sprites').ScoreNumber;

    var GameLogic = cc.Node.extend({
        //游戏逻辑的状态值
        STATE_BLOCK_MOVE: 0,
        STATE_WAITING_ANIMATION: 1,
        STATE_UPDATE_BLOCK: 2,
        STATE_GAME_OVER: 3,

        BLOCK_UPDATE_THRESHOLD: 1,

        //调用逻辑的层的引用
        _referLayer: null,
        //当前玩家是否是1P
        _is1P: true,
        //游戏是否暂停
        _isPause: false,
        //游戏分数
        _gameScore: null,

        //当前玩家控制的方块组
        _currentBlock: null,
        //游戏逻辑状态
        _logicState: 0,
        //NEXT队列区方块组队列
        _nextBlockQueue: null,
        //游戏区的方块矩阵
        _gameField: null,
        //待清除方块的开放列表，其中存放了需要检测清除的方块
        _openList: null,
        //待清除方块集合列表，里面存放着一个个列表，每个列表的方块都是待清除状态
        _clearSquareSetList: null,

        _blockUpdateCount: 0,


        ctor: function(referLayer, is1P) {
            //获取调用逻辑的层的引用
            this._referLayer = referLayer;
            this._is1P = is1P;

            //初始化引用的对象
            //HACK: 此处如果直接写在上面的变量中，会被两个logic共用
            this._gameField = [];
            this._nextBlockQueue = [];
            this._openList = [];
            this._clearSquareSetList = [];
        },

        /**
         * 游戏逻辑初始化
         */
        init: function() {
            //初始化当前（即将行动）的方块组
            this._currentBlock = new Block(this._referLayer, this, this._is1P);
            this._initNextBlockQueue();
            this._initFieldSquares();

            //初始化游戏分数
            this._gameScore = new GameScore(this._referLayer, this._is1P);
            this._gameScore.init();
        },

        /**
         * 初始化NEXT区方块组队列
         */

        _initNextBlockQueue: function() {
            var i;
            var basePos = this._is1P ? C.NEXT_QUEUE_INIT_POS_1P :
                C.NEXT_QUEUE_INIT_POS_2P;

            for (i = 0; i < C.NEXT_QUEUE_MAX_NUM; i++) {
                var pos = cc.pSub(basePos, cc.pMult(C.NEXT_QUEUE_POS_INTEVAL, i));
                var newBlock = new Block(this._referLayer, this, this._is1P, pos);
                this._nextBlockQueue.push(newBlock);
            }
        },

        /**
         * 初始化游戏区起始方块（4*7）
         */
        _initFieldSquares: function() {
            var basePos = this._is1P ? C.GAME_FIELD_INIT_POS_1P :
                C.GAME_FIELD_INIT_POS_2P,
                sqLength = C.SQUARE_LENGTH,
                i, j;

            //初始化游戏逻辑区域
            for (i = 0; i < C.MAX_LOGIC_H + C.DELTA_LOGIC_H; i++) {
                this._gameField.push([]);
                for (j = 0; j < C.MAX_LOGIC_W; j++) {
                    //null代表该位没有方块
                    this._gameField[i].push(null);
                }
            }

            //游戏区起始方块
            for (i = 0; i < C.DEFAULT_INIT_FIELD_H; i++) {
                for (j = 0; j < C.MAX_LOGIC_W; j++) {
                    var newSquare = new Square(cc.pAdd(
                        basePos, cc.p(sqLength * j, sqLength * i)), this._is1P);
                    this._referLayer.addChild(newSquare, C.SQUARE_DEPTH_LEVEL);
                    //添加到逻辑矩阵
                    this._gameField[i][j] = newSquare;
                }
            }
        },

        /**
         * 逻辑更新，一个有限自动状态机不断切换状态
         */
        update: function() {
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
                        //方块开始下落动画的时候，共享数据区会保存其一个引用
                        //动画结束的时候会移除引用，当数据区为空时，说明所有方块都停止动画，可以执行下一轮监测
                        if (share.fallingSquareList.length === 0) {
                            this._checkClearSquare();
                        }
                        break;
                        //更新方块组状态（->STATE_BLOCK_MOVE）
                    case this.STATE_UPDATE_BLOCK:
                        //更新NEXT区方块组队列，并更换方块组
                        this.updateNextBlockQueue();
                        break;
                    case this.STATE_GAME_OVER:
                        //TODO: 游戏结束画面
                        break;
                }
                this._gameScore.update();
            }
        },

        /**
         * 更新NEXT区方块组队列，并更换方块组
         */
        updateNextBlockQueue: function() {
            //取队头方块组并将其设置为当前活跃方块组，并重置位置
            this._currentBlock = this._nextBlockQueue.shift();
            this._currentBlock.resetPosition();
            //设置其他4个方块组的上升动画
            var i;
            for (i = 0; i < C.NEXT_QUEUE_MAX_NUM - 1; i++) {
                this._nextBlockQueue[i].upMove();
            }
            //创建新的方块组并放在NEXT区最下面
            var basePos = this._is1P ? C.NEXT_QUEUE_INIT_POS_1P :
                C.NEXT_QUEUE_INIT_POS_2P;
            var pos = cc.pSub(basePos, cc.pMult(C.NEXT_QUEUE_POS_INTEVAL,
                C.NEXT_QUEUE_MAX_NUM - 1));
            var newBlock = new Block(this._referLayer, this, this._is1P, pos);
            this._nextBlockQueue.push(newBlock);
            //触发淡入动画
            newBlock.fadeIn();

            //在一定的行动次数之后，上升新的一行方块
            this._blockUpdateCount += 1;
            if (this._blockUpdateCount > this.BLOCK_UPDATE_THRESHOLD) {
                this.riseSquareLine(1);
            }

            this._logicState = this.STATE_BLOCK_MOVE;
        },

        /**
         * 生成并上升指定行数的方块
         * @param  {Integer} lineNum 产生的方块行数
         */
        riseSquareLine: function(lineNum) {
            var basePos = this._is1P ? C.GAME_FIELD_INIT_POS_1P:
                C.GAME_FIELD_INIT_POS_2P,
                squareLength = C.SQUARE_LENGTH,
                newSquareField = [],
                squareType, newSquare, i, j;

            //newSquareField存储新生成的方块
            for (i = 0; i < lineNum; i++) {
                newSquareField.push([]);
                for (j = 0; j < C.MAX_LOGIC_W; j++) {
                    randomType = random.getRandomSquareType();
                    //一开始位于主游戏区的下方
                    newSquare = new Square(cc.pAdd(
                        basePos, cc.p(squareLength * j, -squareLength * (i + 1))), this._is1P, randomType);
                    this._referLayer.addChild(newSquare, C.SQUARE_DEPTH_LEVEL);
                    newSquareField[i].push(newSquare);
                }
            }

            //从上往下扫描主游戏区每一行
            for (i = C.MAX_LOGIC_H + C.DELTA_LOGIC_H - 1; i >= 0 ; i--) {
                for (j = 0; j < C.MAX_LOGIC_W; j++) {
                    if(this._gameField[i][j]) {
                        //重新定位到上升后的位置
                        this._gameField[i + lineNum][j] = this._gameField[i][j];
                        //执行上升动画
                        this._gameField[i][j].riseUp(lineNum);
                    }
                }
            }

            //从上往下扫描新生成方块区每一行
            for (i = 0; i < lineNum; i++) {
                for (j = 0; j < C.MAX_LOGIC_W; j++) {
                    //重新定位到上升后的位置
                    this._gameField[lineNum - i -1][j] = newSquareField[i][j];
                    newSquareField[i][j].riseUp(lineNum);
                }
            }
        },

        /**
         * 下落碰撞检测
         * @param sq1 方块1（位于下方）
         * @param sq2 方块2（位于上方）
         * @param sq1TargetPos 方块1即将要下落到的坐标
         * @returns {boolean} 是否碰撞
         */
        checkStopSquare: function(sq1, sq2, sq1TargetPos) {
            //根据方块1即将下落的位置+半个方块位来判断是否冲突
            var sq1TargetPosBelow = cc.p(sq1TargetPos.x, sq1TargetPos.y - C.SQUARE_LENGTH / 2),
                targetLogicXY = Square.getLogicXY(sq1TargetPosBelow, this._is1P),
                logicXY1,
                logicXY2;
            //逻辑Y坐标为-1表示已触底，另一种情况是下方已有方块
            if (targetLogicXY && (targetLogicXY.y === -1 ||
                this._gameField[targetLogicXY.y][targetLogicXY.x] !== null)) {
                logicXY1 = {
                    x: targetLogicXY.x,
                    y: targetLogicXY.y + 1
                };
                logicXY2 = {
                    x: targetLogicXY.x,
                    y: targetLogicXY.y + 2
                };
                //校正两个方块的最终停放位置
                sq1.stop(this._is1P, logicXY1);
                sq2.stop(this._is1P, logicXY2);
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
        _checkClearSquare: function() {
            var _this = this;
            /**
             * 深度优先搜索指定方块四周，将有相同花色的方块纳入一个列表
             * @param set 存放相同花色方块的列表
             * @param checkSquare 要检查四周的方块
             */
            var checkArround = function(set, checkSquare) {
                var logicXY = checkSquare.getLogicXY();
                var x = logicXY.x,
                    y = logicXY.y;

                //获取周围的4个方块（依次为左、右、上、下）
                var arroundSquareList = [];
                if (y >= 0) {
                    arroundSquareList.push(x - 1 >= 0 ? _this._gameField[y][x - 1] : null);
                    arroundSquareList.push(x + 1 < C.MAX_LOGIC_W ? _this._gameField[y][x + 1] : null);
                    arroundSquareList.push(y + 1 < C.MAX_LOGIC_H ? _this._gameField[y + 1][x] : null);
                    arroundSquareList.push(y - 1 >= 0 ? _this._gameField[y - 1][x] : null);
                }

                //将方块标记为“已检查”状态，以免重复检测
                checkSquare.isChecked = true;
                var i;
                for (i in arroundSquareList) {
                    var arroundSquare = arroundSquareList[i];
                    //纳入列表的条件：不为空，未检查过，颜色相同
                    if (arroundSquare != null && !arroundSquare.isChecked &&
                        arroundSquare.getType() == checkSquare.getType()) {
                        set.push(arroundSquare);
                        //递归检查下一个方块
                        checkArround(set, arroundSquare);
                    }
                }
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
                var i, j, count;
                // console.debug(this._is1P);
                // console.debug(this._clearSquareSetList);

                //遍历每个待清除方块集合，并对所有方块清除
                for (i in this._clearSquareSetList) {
                    var group = this._clearSquareSetList[i];
                    count = 0;

                    for (j in group) {
                        var logicXY = group[j].getLogicXY();
                        if (this._gameField[logicXY.y][logicXY.x]) {
                            this._gameField[logicXY.y][logicXY.x].clear();
                            this._gameField[logicXY.y][logicXY.x] = null;
                        }

                        //对消除的方块数计数
                        count++;
                    }
                    this._gameScore.addScore(100 * count);
                }

                /* 3.查找空隙并让悬空的方块掉落 */
                //一列一列地查找空隙
                for (i = 0; i < C.MAX_LOGIC_W; i++) {
                    var fallY = 0;
                    //从最底部往上查找
                    for (j = 0; j < C.MAX_LOGIC_H + C.DELTA_LOGIC_H; j++) {
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
                //判断游戏是否结束
                if (this._gameField[C.MAX_LOGIC_H - 1][Math.floor(C.MAX_LOGIC_W / 2)]) {
                    console.log('You lose');
                    this._logicState = this.STATE_GAME_OVER;
                } else {
                    //没有需要清除的方块，则切换新的方块组
                    this._logicState = this.STATE_UPDATE_BLOCK;
                }
            }
        },


        /**
         * 获取本逻辑是否是1P
         * @returns {boolean} 是否是1P
         */
        is1P: function() {
            return this._is1P;
        },

        /**
         * 获取游戏状态是否暂停
         * @returns {boolean} 游戏是否暂停
         */
        isPause: function() {
            return this._isPause;
        },

        /**
         * 切换游戏暂停状态
         */
        pauseGame: function() {
            this._isPause = !this._isPause;
        },

        /**
         * 获取当前活动方块组
         * @returns {Logic.Block} 当前活动方块组
         */
        getCurrentBlock: function() {
            return this._currentBlock;
        },

        getGameField: function() {
            return this._gameField;
        }
    });

    var Block = cc.Class.extend({
        TRANSLATE_DURATION: 0.1,
        UP_MOVE_DURATION: 0.4,
        EXCHANGE_DURATION: 0.1,
        FADE_IN_DURATION: 0.6,
        DOWN_VELOCITY: 1,

        _is1P: true,
        //平移动画锁
        _isTranslating: false,
        //方块交换动画锁
        _isExchanging: false,
        //方块组是否停止运动
        _isStop: false,
        _isKeyPressedDown: false,

        _gameLogic: null,

        _square1: null,
        _square2: null,

        /**
         * 方块组构造方法
         * @param layer 要添加精灵的层引用
         * @param gameLogic 游戏逻辑引用
         * @param is1P 是否是1P
         * @param initPosition 下方块的初始位置，若为空则默认为在游戏区上方的出现位置
         */
        ctor: function(layer, gameLogic, is1P, initPosition) {
            this._is1P = is1P;
            this._gameLogic = gameLogic;

            var INIT_BLOCK_POINT = is1P ? C.INIT_BLOCK_POINT_1P :
                C.INIT_BLOCK_POINT_2P;
            //若没有定义绘制位置，则默认在游戏区上方的出现起始位置
            if (initPosition === undefined) {
                this._square1 = new Square(INIT_BLOCK_POINT, is1P);
                this._square2 = new Square(cc.p(INIT_BLOCK_POINT.x,
                    INIT_BLOCK_POINT.y + C.SQUARE_SIZE.y), is1P);
                //            this._square1.runAction(cc.Sequence.create(this._getStartActionSequence()));
                //            this._square2.runAction(cc.Sequence.create(this._getStartActionSequence()));
            } else {
                this._square1 = new Square(initPosition, is1P);
                this._square2 = new Square(cc.p(initPosition.x,
                    initPosition.y + C.SQUARE_SIZE.y), is1P);
            }
            layer.addChild(this._square1);
            layer.addChild(this._square2);
        },

        _getStartActionSequence: function() {
            var seq = [];
            seq.push(cc.DelayTime.create(1.0));
            seq.push(cc.MoveBy.create(0.5, cc.p(0, -80)));
            seq.push(cc.MoveBy.create(20.0, cc.p(0, -960)));
            return seq;
        },

        /**
         * 方块组逻辑更新方法
         */
        update: function() {
            if (!this._isStop && !this._isTranslating) {
                //根据是否有按键盘下键决定移动速度
                var HALF_SQUARE_LENGTH = C.SQUARE_LENGTH / 2,
                    delta = this._isKeyPressedDown ? this.DOWN_VELOCITY * 10 : this.DOWN_VELOCITY,
                    pos1 = cc.pSub(this._square1.getPosition(), cc.p(0, delta));
                //进行碰撞检测
                if (this._gameLogic.checkStopSquare(this._square1, this._square2, pos1)) {
                    //标记方块组已停止活动
                    this._isStop = true;
                } else {
                    var pos2 = cc.pSub(this._square2.getPosition(), cc.p(0, delta));
                    this._square1.setPosition(pos1);
                    this._square2.setPosition(pos2);
                }
            }
        },

        /**
         * 方块组平移
         * @param isLeftMove 是否向左移动
         */
        translate: function(isLeftMove) {
            if (!this._gameLogic.isPause()) {
                //平移动画锁变量， 用于防止在动画执行过程中响应键盘输入
                if (!this._isStop && !this._isTranslating && !this._isKeyPressedDown && !this._isExchanging) {
                    if (!this.checkHorizontalBlock(isLeftMove)) {
                        //计算平移的距离
                        var factor = isLeftMove ? -1 : 1,
                            distance = cc.p(C.SQUARE_LENGTH * factor, 0),
                            sq1 = this._square1,
                            sq2 = this._square2;

                        this._isTranslating = true;
                        //创建一个动作序列，该序列首先执行平移动画，最后解除动画锁
                        sq1.runAction(cc.Spawn.create(cc.Sequence.create(
                            [cc.MoveBy.create(this.TRANSLATE_DURATION, distance), cc.CallFunc.create(function() {
                                this._isTranslating = false;
                                //此处将坐标值四舍五入，以防出错，下同
                                // sq1.setPositionX(Math.round(sq1.getPositionX()));
                            }, this)])));
                        this._square2.runAction(cc.Spawn.create(cc.Sequence.create(
                            [cc.MoveBy.create(this.TRANSLATE_DURATION, distance), cc.CallFunc.create(function() {
                                this._isTranslating = false;
                                // sq2.setPositionX(Math.round(sq2.getPositionX()));
                            }, this)])));
                    }
                }
            }
        },

        /**
         * 检测是否被其它实体阻碍移动
         * @param isLeftMove 是否向左移动
         * @return {boolean} 方块组是否被阻碍到
         */
        checkHorizontalBlock: function(isLeftMove) {
            var LEFT_BOTTOM = this._is1P ? C.GAME_FIELD_INIT_POS_1P : C.GAME_FIELD_INIT_POS_2P,
                SQUARE_LENGTH = C.SQUARE_LENGTH,
                //获取绘制位置和逻辑矩阵，预判移动后是否被阻碍
                drawPos = this._square1.getDrawPosition(),
                gameField = this._gameLogic.getGameField(),
                targetLogicXY;

            //左移的情况，右移情况类似
            if (isLeftMove) {
                //判断游戏区边界的情况
                if (drawPos.x - SQUARE_LENGTH < LEFT_BOTTOM.x - SQUARE_LENGTH / 2) {
                    return true;
                }
                /* 计算目标判定点的逻辑坐标 */
                //所谓目标判定点，即当前方块绘制中心水平方向平移一个方块单位的距离，
                //再向下移动半个方块单位的距离
                targetLogicXY = Square.getLogicXY(
                    cc.pAdd(drawPos, cc.p(-SQUARE_LENGTH, -SQUARE_LENGTH / 2)), this._is1P);
                if (targetLogicXY && gameField[targetLogicXY.y][targetLogicXY.x] != null) {
                    return true;
                }
            } else {
                if (drawPos.x + SQUARE_LENGTH >
                    LEFT_BOTTOM.x + SQUARE_LENGTH * (C.MAX_LOGIC_W - 1) + SQUARE_LENGTH / 2) {
                    return true;
                }
                targetLogicXY = Square.getLogicXY(
                    cc.pAdd(drawPos, cc.p(SQUARE_LENGTH, -SQUARE_LENGTH / 2)), this._is1P);
                if (targetLogicXY && gameField[targetLogicXY.y][targetLogicXY.x] != null) {
                    return true;
                }
            }
            return false;
        },


        /**
         * 按下旋转键后交换两个方块
         */
        exchangeSquare: function() {
            if (!this._gameLogic.isPause()) {
                //方块交换动画锁变量，用于防止在动画执行过程中响应键盘输入
                if (!this._isStop && !this._isExchanging && !this._isTranslating && !this._isKeyPressedDown) {
                    this._isExchanging = true;
                    //方块1执行上移动画，方块2执行下移动画，即两者交换位置
                    var SQUARE_LENGTH = C.SQUARE_LENGTH;
                    this._square1.runAction(cc.Spawn.create(cc.Sequence.create(
                        [cc.MoveBy.create(this.EXCHANGE_DURATION, cc.p(0, SQUARE_LENGTH)), cc.CallFunc.create(function() {
                            this._isExchanging = false;
                            if (this._isStop) {
                                console.debug('exchange');
                                this._square1.resetDrawPositionByLogicXY(this._is1P);
                            }
                        }, this)])));
                    this._square2.runAction(cc.Spawn.create(cc.Sequence.create(
                        [cc.MoveBy.create(this.EXCHANGE_DURATION, cc.p(0, -SQUARE_LENGTH)), cc.CallFunc.create(function() {
                            this._isExchanging = false;
                            if (this._isStop) {
                                this._square2.resetDrawPositionByLogicXY(this._is1P);
                            }
                        }, this)])));
                    //交换两个方块，始终保持方块1保存的是下方的方块
                    var temp = this._square1;
                    this._square1 = this._square2;
                    this._square2 = temp;
                }
            }
        },

        /**
         * （处于NEXT区的）方块组上升
         */
        upMove: function() {
            this._square1.runAction(cc.MoveBy.create(this.UP_MOVE_DURATION,
                C.NEXT_QUEUE_POS_INTEVAL));
            this._square2.runAction(cc.MoveBy.create(this.UP_MOVE_DURATION,
                C.NEXT_QUEUE_POS_INTEVAL));
        },

        /**
         * 将方块组的位置重置到默认位置
         */
        resetPosition: function() {
            var basePoint = this._is1P ? C.INIT_BLOCK_POINT_1P :
                C.INIT_BLOCK_POINT_2P;
            var pos1 = basePoint;
            var pos2 = cc.p(basePoint.x, basePoint.y + C.SQUARE_SIZE.y)
            this._square1.setPosition(pos1);
            this._square2.setPosition(pos2);
            if (C.IS_DEBUG) {
                console.log(this._square1.getType());
                console.log(this._square2.getType());
            }
        },

        /**
         * 方块组淡入
         */
        fadeIn: function() {
            this._square1.runAction(cc.FadeIn.create(this.FADE_IN_DURATION));
            this._square2.runAction(cc.FadeIn.create(this.FADE_IN_DURATION));
        },

        /**
         * 设置“向下”键是否被按下
         * @param flag 设置的值
         */
        setKeyPressedDown: function(flag) {
            this._isKeyPressedDown = flag;
            if (this._isTranslating || this._isExchanging) {
                this._isKeyPressedDown = false;
            }
        }
    });

    var GameScore = cc.Class.extend({
        MAX_NUM_BIT: 6,
        _numList: null,
        _displayScore: 0,
        _realScore: 0,

        /**
         * 方块组构造方法
         * @param referLayer 要添加精灵的层引用
         * @param gameLogic 游戏逻辑引用
         * @param is1P 是否是1P
         */
        ctor: function(referLayer, is1P) {
            var i;
            this._referLayer = referLayer;
            this._is1P = is1P;
        },

        init: function() {
            this._numList = [];
            //_numList[0]为分数的个位数
            for (i = 0; i < this.MAX_NUM_BIT; i++) {
                var scoreNumber = new ScoreNumber(this._is1P, i);
                this._numList.push(scoreNumber);
                this._referLayer.addChild(scoreNumber);
            }
        },

        update: function() {
            if (this._displayScore < this._realScore) {
                this._displayScore += 100;
                this._display();
            }
        },

        addScore: function(score) {
            this._realScore += score;
        },

        getScore: function() {
            return this._score;
        },

        _display: function() {
            var i,
                scoreStr = this._displayScore + '';
            while (scoreStr.length < this.MAX_NUM_BIT) {
                scoreStr = '0' + scoreStr;
            }
            for (i = 0; i < this.MAX_NUM_BIT; i++) {
                this._numList[this.MAX_NUM_BIT - i - 1].setNumber(scoreStr.slice(i, i + 1));
            }
        }

    });

    module.exports = {
        GameLogic: GameLogic,
        Block: Block,
        GameScore: GameScore
    }
});
