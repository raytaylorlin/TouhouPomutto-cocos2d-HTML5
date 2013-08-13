/**
 * @fileoverview 游戏场景模块，包含了各个场景的定义
 * @author Ray Taylor Lin <raytaylorlin@gmail.com>
 **/
define(function (require, exports, module) {
    var R = require('util/resource').R,
        C = require('util/constant'),
        InputTranslater = require('util/control').InputTranslater,
        GameLogic = require('modules/logic').GameLogic;

    /**
     * 惰性层，用于存放背景等不需要经常刷新的精灵
     * @type {*}
     */
    var LazyLayer = cc.Layer.extend({
        _sptBackground: null,
        _sptGameFrame: null,
        _windowSize: null,
        _windowCenterPoint: null,

        ctor: function () {
        },

        init: function () {
            this._super();
            var director = cc.Director.getInstance();
            this._windowSize = director.getWinSize();
            this._windowCenterPoint = cc.p(this._windowSize.width / 2, this._windowSize.height / 2);

            this._createBackground();
            return true;
        },

        _createBackground: function () {
            //创建惰性层
            var lazyLayer = new cc.Layer.create();
            this.addChild(lazyLayer);
            //创建背景精灵
            this._sptBackground = cc.Sprite.create(R.imgGameScene_background);
            this._sptBackground.setPosition(this._windowCenterPoint);
            lazyLayer.addChild(this._sptBackground, 0);

            this._sptGameFrame = cc.Sprite.create(R.imgGameScene_gameFrame);
            this._sptGameFrame.setPosition(this._windowCenterPoint);
            lazyLayer.addChild(this._sptGameFrame, 0);
        }
    });

    /**
     * 精灵层，用于存放各种精灵
     * @type {*}
     */
    var SpritesLayer = cc.Layer.extend({
        //游戏逻辑
        _gameLogic: null,
        //输入传递器
        _inputTranslater: null,

        _sptPositionHint: null,

        ctor: function (is1P) {
            this._is1P = is1P;
            this._gameLogic = new GameLogic(this, is1P);
            this._inputTranslater = new InputTranslater(this._gameLogic);
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
            this._inputTranslater.dispatchKeyboardEvent("onKeyUp", key);
        },

        onKeyDown: function (key) {
            this._inputTranslater.dispatchKeyboardEvent("onKeyDown", key);
            console.log(key);
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
            var baseLayer = new LazyLayer();
            baseLayer.init();
            this.addChild(baseLayer);

            var spritesLayer = new SpritesLayer(true);
            spritesLayer.init();
            this.addChild(spritesLayer);
        }
    });

    module.exports = {
        PracticeScene: PracticeScene
    };
});