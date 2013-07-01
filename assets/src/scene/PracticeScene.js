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
        //游戏逻辑
        _gameLogic: null,
        //输入传递器
        _inputTranslater: null,

        _sptPositionHint: null,


        ctor: function (is1P) {
            cc.associateWithNative(this, cc.Layer);
            this._is1P = is1P;
            this._gameLogic = new __tp.Logic.GameLogic(this, is1P);
            this._inputTranslater = new __tp.util.InputTranslater(this._gameLogic);
        },

        init: function () {
            this._super();
            //获取图片切片
            var sfCache = cc.SpriteFrameCache.getInstance();
            sfCache.addSpriteFrames(R.plstGameScene_square, R.imgGameScene_square);


            this._createSprite();
            this._gameLogic.init();

            this.setKeyboardEnabled(true);
            this.setTouchEnabled(true);

            this.schedule(this.update, 0);
            return true;
        },

        /**
         * 创建精灵
         */
        _createSprite: function () {

        },

        update: function () {
            this._gameLogic.update();
        },

        onKeyUp: function (key) {
            this._inputTranslater.dispatchKeyboardEvent("onKeyUp",key);
        },

        onKeyDown: function (key) {
            this._inputTranslater.dispatchKeyboardEvent("onKeyDown",key);
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
//            var spritesLayer2 = new SpritesLayer(false);
//            spritesLayer2.init();
//            this.addChild(spritesLayer2);
        }
    });

    return PracticeScene;
};

