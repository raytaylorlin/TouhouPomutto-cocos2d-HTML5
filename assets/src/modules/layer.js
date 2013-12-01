/**
 * @fileoverview 游戏场景模块，包含了各个场景的定义
 * @author Ray Taylor Lin <raytaylorlin@gmail.com>
 **/
define(function(require, exports, module) {
    var R = require('util/resource').R,
        C = require('util/constant'),
        InputTranslater = require('util/control').InputTranslater,
        monitor = require('util/monitor'),
        GameLogic = require('modules/logic').GameLogic,
        GameScore = require('modules/logic').GameScore;

    // var director = cc.Director.getInstance();
    // windowSize = director.getWinSize(),
    // windowCenterPoint = cc.p(windowSize.width / 2, windowSize.height / 2);

    /**
     * 游戏开始场景层
     */
    var StartSceneLayer = cc.Layer.extend({
        TEXT_POSITION: [cc.p(-300, 534), cc.p(330, 432), cc.p(626, 424), cc.p(380, 350)],
        TEXT_TRIGGLE: [0.5, 1.0, 1.3, 1.6],
        TEXT_DURATION: [0.8, 0.8, 0.8, 0.8],
        OPTION_POSITION: [cc.p(841, 521), cc.p(721, 308), cc.p(500, 177)],
        OPTION_NAME: ["practice", "battle", "network"],
        OPTION_TRIGGLE: [1.8, 2.1, 2.4],
        OPTION_DURATION: [1.0, 1.0, 1.0],

        //点击选项事件触发时所执行的函数
        OPTION_FUNC: [
            //进入PRACTICE
            function() {
                var PracticeSceneClass = __tp.getScene().PracticeScene;
                var scene = new PracticeSceneClass();
                cc.Director.getInstance().replaceScene(cc.TransitionFade.create(1.0, scene));
            },
            //进入BATTLE
            function() {
                console.log("BATTLE");
            },
            //进入NETWORK
            function() {
                console.log("NETWORK");
            }
        ],

        isShowAbout: false,
        _sptBackground: null,
        sptText: [],
        sptOption: [],
        sptAbout: null,

        init: function() {
            var _this = this;
            this._super();

            //获取图片切片
            var sfCache = cc.SpriteFrameCache.getInstance();
            sfCache.addSpriteFrames(R.plstStartScene_text, R.imgStartScene_text);
            sfCache.addSpriteFrames(R.plstStartScene_options, R.imgStartScene_options);
            sfCache.addSpriteFrames(R.plstStartScene_starEffect, R.imgStartScene_starEffect);
            sfCache.addSpriteFrames(R.plstGameScene_scoreNum, R.imgGameScene_scoreNum);

            this._createBackground();

            // if (__tp.Constant.IS_DEBUG) {
            //     this.OPTION_FUNC[0]();
            // }
            this._createTextAnimation();
            this._createOptionAnimation(sfCache);

            this.setTouchEnabled(true);
            return true;
        },

        /**
         * 创建背景
         * @private
         */
        _createBackground: function() {
            var windowCenterPoint = monitor.getWindowCenterPoint();

            //创建背景精灵
            this._sptBackground = cc.Sprite.create(R.imgStartScene_background);
            this._sptBackground.setPosition(windowCenterPoint);
            this.addChild(this._sptBackground, 0);
        },

        /**
         * 创建场景文字动画
         * @private
         */
        _createTextAnimation: function() {
            var i;
            for (i = 0; i < 4; i++) {
                var name = "text" + i + ".png";
                var tempTextSprite = cc.Sprite.createWithSpriteFrameName(name);
                //设置坐标（以中心为锚点）
                tempTextSprite.setPosition(TEXT_POSITION[i]);
                //设置动作序列
                var baseAction;
                var actionSeq = [cc.DelayTime.create(TEXT_TRIGGLE[i])];
                //“东方”两个字的移入动画
                if (i == 0) {
                    tempTextSprite.setZOrder(1);
                    baseAction = cc.MoveTo.create(TEXT_DURATION[i],
                        cc.p(129, tempTextSprite.getPositionY()));
                    actionSeq.push(cc.EaseOut.create(baseAction, 5.0));
                }
                //其他三种字的缩放动画
                else {
                    tempTextSprite.setScale(0);
                    baseAction = cc.ScaleTo.create(TEXT_DURATION[i], 1.3);
                    actionSeq.push(cc.EaseSineInOut.create(baseAction));
                    baseAction = cc.ScaleTo.create(TEXT_DURATION[i] / 4, 1.0);
                    baseAction = cc.ScaleTo.create(TEXT_DURATION[i] / 4, 1.0);
                    actionSeq.push(cc.EaseSineInOut.create(baseAction));
                }
                //开始执行动画并将精灵添加到列表中
                tempTextSprite.runAction(cc.Sequence.create(actionSeq));
                this.sptText.push(tempTextSprite);
                this.addChild(tempTextSprite);
            }
        },

        /**
         * 创建选项动画
         * @param sfCache
         * @private
         */
        _createOptionAnimation: function(sfCache) {
            var _this = this;
            var i;
            for (i = 0; i < 3; i++) {
                //设置坐标和显示图像
                var name = OPTION_NAME[i] + "_1.png";
                var tempOptionSprite = new cc.CanTouchSprite();
                this.sptOption.push(tempOptionSprite);
                this.sptOption[i].index = i;
                this.sptOption[i].setDisplayFrame(sfCache.getSpriteFrame(name));
                this.sptOption[i].setPosition(OPTION_POSITION[i]);
                this.sptOption[i].setAnchorPoint(cc.p(0.5, 0.5));

                //设置动作序列
                actionSeq = [cc.DelayTime.create(OPTION_TRIGGLE[i])];
                this.sptOption[i].setScale(0);
                baseAction = cc.ScaleTo.create(OPTION_DURATION[i], 1.3);
                actionSeq.push(cc.EaseSineIn.create(baseAction));
                baseAction = cc.ScaleTo.create(OPTION_DURATION[i] / 4, 1.0);
                actionSeq.push(cc.EaseSineOut.create(baseAction));
                //index为0和1时是PRACTICE和BATTLE，需要添加旋转动画，NETWORK则不用
                if (i == 0 || i == 1) {
                    baseAction = cc.RotateBy.create(__tp.util.random.getRange(10, 12), -360);
                    actionSeq.push(cc.Repeat.create(baseAction, 10000));
                }
                this.sptOption[i].runAction(cc.Sequence.create(actionSeq));

                this.addChild(this.sptOption[i]);
            }

            //点击PRACTICE事件
            this.sptOption[0].onTouchesEnded = function(touches, event) {
                if (this._touchBegan) {
                    this._touchBegan = false;
                    _this.OPTION_FUNC[0]();
                }
            }
            //点击BATTLE事件
            this.sptOption[1].onTouchesEnded = function(touches, event) {
                if (this._touchBegan) {
                    this._touchBegan = false;
                    _this.OPTION_FUNC[1]();
                }
            }
        },

        onTouchesBegan: function(touches, event) {
            this.isMouseDown = true;
        },

        onTouchesMoved: function(touches, event) {
            if (this.isMouseDown) {
                if (touches) {
                    //this.circle.setPosition(cc.p(touches[0].getLocation().x, touches[0].getLocation().y));
                }
            }
        },

        onTouchesEnded: function(touches, event) {
            if (this.isShowAbout) {
                this.sptAbout.runAction(cc.FadeOut.create(1));
                this.isShowAbout = false;
            }
        },

        onTouchesCancelled: function(touches, event) {
            console.log("onTouchesCancelled");
        }
    });

    /**
     * 惰性层，用于存放背景等不需要经常刷新的精灵
     * @type {*}
     */
    var LazyLayer = cc.Layer.extend({
        _sptBackground: null,
        _sptGameFrame: null,
        _windowSize: null,
        _windowCenterPoint: null,

        ctor: function() {},

        init: function() {
            this._super();
            this._createBackground();
            return true;
        },

        _createBackground: function() {
            var windowCenterPoint = monitor.getWindowCenterPoint();

            //创建背景精灵
            this._sptBackground = cc.Sprite.create(R.imgGameScene_background);
            this._sptBackground.setPosition(windowCenterPoint);
            this.addChild(this._sptBackground, 0);

            this._sptGameFrame = cc.Sprite.create(R.imgGameScene_gameFrame);
            this._sptGameFrame.setPosition(windowCenterPoint);
            this.addChild(this._sptGameFrame, 0);
        }
    });

    /**
     * 精灵层，用于存放各种精灵
     * @type {*}
     */
    var SpritesLayer = cc.Layer.extend({
        //游戏逻辑
        _gameLogic: null,
        //游戏分数
        _gameScore: null,
        //输入传递器
        _inputTranslater: null,

        _sptPositionHint: null,

        ctor: function(is1P) {
            this._is1P = is1P;
            this._gameLogic = new GameLogic(this, is1P);
            this._inputTranslater = new InputTranslater(this._gameLogic);
        },

        init: function() {
            this._super();
            //获取图片切片
            var sfCache = cc.SpriteFrameCache.getInstance();
            sfCache.addSpriteFrames(R.plstGameScene_square, R.imgGameScene_square);
            sfCache.addSpriteFrames(R.plstGameScene_scoreNum, R.imgGameScene_scoreNum);

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
        _createSprite: function() {

        },

        update: function() {
            this._gameLogic.update();
        },

        onKeyUp: function(key) {
            this._inputTranslater.dispatchKeyboardEvent("onKeyUp", key);
        },

        onKeyDown: function(key) {
            this._inputTranslater.dispatchKeyboardEvent("onKeyDown", key);
            console.log(key);
        },

        onTouchesBegan: function(touches, event) {
            this.isMouseDown = true;
        },
        onTouchesMoved: function(touches, event) {
            if (this.isMouseDown) {
                if (touches) {
                    //this.circle.setPosition(cc.p(touches[0].getLocation().x, touches[0].getLocation().y));
                }
            }
        },
        onTouchesEnded: function(touches, event) {

        },
        onTouchesCancelled: function(touches, event) {

        }
    });

    module.exports = {
        LazyLayer: LazyLayer,
        SpritesLayer: SpritesLayer
    };
});