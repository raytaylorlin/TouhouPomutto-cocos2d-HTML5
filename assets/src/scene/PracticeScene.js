__tp.getPracticeScene = function (R) {
    var PracticeSceneLayer = cc.Layer.extend({
        _sptBackground: null,
        _sptGameFrame: null,

        //当前玩家控制的方块组
        _currentBlock: null,
        //当前键盘上按下的键（该变量用于实现KeyPress）
        _currentPressedKey: null,
        //NEXT区方块组队列
        _nextBlockQueue: [],

        ctor: function () {
            cc.associateWithNative(this, cc.Layer);
        },

        init: function () {
            this._super();
            this._createBackground();
            return true;
        },

        _createBackground: function () {
            //创建惰性层
            var lazyLayer = new cc.LazyLayer();
            this.addChild(lazyLayer);
            //创建背景精灵
            this._sptBackground = cc.Sprite.create(R.imgGameScene_background);
            this._sptBackground.setPosition(__tp.Constant.WINDOW_CENTER_POINT);
            lazyLayer.addChild(this._sptBackground, 0);

            this._sptGameFrame = cc.Sprite.create(R.imgGameScene_gameFrame);
            this._sptGameFrame.setPosition(__tp.Constant.WINDOW_CENTER_POINT);
            lazyLayer.addChild(this._sptGameFrame, 0);
        }
    });

    var SpritesLayer = cc.Layer.extend({
        _gameLogic: null,

        _is1P: true,
        _sptPositionHint: null,

        //当前玩家控制的方块组
        _currentBlock: null,
        //当前键盘上按下的键（该变量用于实现KeyPress）
        _currentPressedKey: null,
        //NEXT区方块组队列
        _nextBlockQueue: [],

        ctor: function (is1P) {
            cc.associateWithNative(this, cc.Layer);
            this._is1P = is1P;
            this._gameLogic = new __tp.Logic.GameLogic();
        },

        init: function () {
            this._super();
            //获取图片切片
            var sfCache = cc.SpriteFrameCache.getInstance();
            sfCache.addSpriteFrames(R.plstGameScene_square, R.imgGameScene_square);

            this._createSprite();

            this.setKeyboardEnabled(true);
            this.setTouchEnabled(true);

            this.schedule(this.update, 0);
            return true;
        },

        /**
         * 创建精灵
         */
        _createSprite: function () {
            this._currentBlock = new __tp.Logic.Block(this, this._is1P);
            this._initNextBlockQueue();
        },

        /**
         * 初始化NEXT区方块组队列
         */
        _initNextBlockQueue: function () {
            var i;
            var basePos = this._is1P ? __tp.Constant.NEXT_QUEUE_INIT_POS_1P : __tp.Constant.NEXT_QUEUE_INIT_POS_2P;
            for (i = 0; i < __tp.Constant.NEXT_QUEUE_MAX_NUM; i++) {
                var pos = cc.pSub(basePos, cc.pMult(__tp.Constant.NEXT_QUEUE_POS_INTEVAL, i));
                var newBlock = new __tp.Logic.Block(this, this._is1P, pos);
                this._nextBlockQueue.push(newBlock);
            }
        },

        /**
         * 初始化游戏区的方块（4*7）
         * @private
         */
        _initFieldSquares: function () {
            var i, j;
            for (i = 0; i < __tp.Constant.DEFAULT_INIT_FIELD_H; i++) {
                for (j = 0; j < __tp.Constant.MAX_LOGIC_W; j++) {

                }
            }
        },

        /**
         * 更新NEXT区方块组队列
         */
        _updateNextBlockQueue: function () {
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
            var newBlock = new __tp.Logic.Block(this, this._is1P, pos);
            this._nextBlockQueue.push(newBlock);
            //触发淡入动画
            newBlock.fadeIn();
        },

        update: function () {
            this._currentBlock.update();
        },

        onKeyUp: function (key) {
            if (this._currentPressedKey === key) {
                switch (this._currentPressedKey) {
                    case cc.KEY.left:
                        this._currentBlock.translate(true);
                        break;
                    case cc.KEY.right:
                        this._currentBlock.translate(false);
                        break;
                    case cc.KEY.down:
                        this._currentBlock.setKeyPressedDown(false);
                        break;
                    case cc.KEY.up:
                        this._updateNextBlockQueue();
                        break;
                }
            }
        },

        onKeyDown: function (key) {
            this._currentPressedKey = key;
            if (this._currentPressedKey === cc.KEY.down) {
                this._currentBlock.setKeyPressedDown(true);
            }
        },

        onTouchesBegan: function (touches, event) {
            this.isMouseDown = true;
        },
        onTouchesMoved: function (touches, event) {
            if (this.isMouseDown) {
                if (touches) {
                    //this.circle.setPosition(cc.p(touches[0].getLocation().x, touches[0].getLocation().y));
                }
            }
        },
        onTouchesEnded: function (touches, event) {

        },
        onTouchesCancelled: function (touches, event) {

        }
    });

    var PracticeScene = cc.Scene.extend({
        onEnter: function () {
            this._super();
            var baseLayer = new PracticeSceneLayer();
            baseLayer.init();
            this.addChild(baseLayer);

            var spritesLayer = new SpritesLayer(true);
            spritesLayer.init();
            this.addChild(spritesLayer);
        }
    });

    return PracticeScene;
};

