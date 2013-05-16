rvs.getStoryScene = function (R) {
    var StorySceneLayer = cc.Layer.extend({
        isShowAbout:false,
        sptBackground:null,
        sptAbout:null,

        init:function () {
            var _this = this;
            this._super();

            var win_size = rvs.WIN_SIZE;

            //创建惰性层
            var lazyLayer = new cc.LazyLayer();
            this.addChild(lazyLayer);

            //创建背景精灵
            this._sptBackground = cc.Sprite.create(R.imgStartSceneBackground);
            this._sptBackground.setPosition(cc.p(win_size.width / 2, win_size.height / 2));
            lazyLayer.addChild(this._sptBackground, 0);

            //从精灵帧中获取两个按钮的图片
            var sfCache = cc.SpriteFrameCache.getInstance();
            sfCache.addSpriteFrames(R.plstButtonSheet, R.imgButtonSheet);
            var startOriginFrame = sfCache.getSpriteFrame("btnStartOrigin.png");
            var startOnDownFrame = sfCache.getSpriteFrame("btnStartOnDown.png");
            var aboutOriginFrame = sfCache.getSpriteFrame("btnAboutOrigin.png");
            var aboutOnDownFrame = sfCache.getSpriteFrame("btnAboutOnDown.png");

            //创建Start按钮菜单项
            var startItem = cc.MenuItemImage.create(R.imgNull, R.imgNull,
                function () {
                    console.log("Start!")
                }, this);
            startItem.setNormalSpriteFrame(startOriginFrame);
            startItem.setSelectedSpriteFrame(startOnDownFrame);
            startItem.setPositionY(startItem.getContentSize().height / 2);

            //创建About按钮菜单项
            var aboutItem = cc.MenuItemImage.create(R.imgNull, R.imgNull,
                function () {
                    //创建About精灵和淡入动画
                    if (_this.sptAbout == null) {
                        _this.sptAbout = cc.Sprite.create(R.imgAbout);
                        _this.sptAbout.setPosition(
                            cc.p(win_size.width / 2, win_size.height / 2));
                        _this.addChild(_this.sptAbout, 2);
                    }
                    _this.sptAbout.runAction(cc.Sequence.create(
                        cc.FadeIn.create(1),
                        cc.CallFunc.create(function () {
                            _this.isShowAbout = true;
                        }, _this)));
                }, this);
            aboutItem.setNormalSpriteFrame(aboutOriginFrame);
            aboutItem.setSelectedSpriteFrame(aboutOnDownFrame);
            aboutItem.setPositionY(-aboutItem.getContentSize().height);

            //创建菜单
            var menu = cc.Menu.create(startItem, aboutItem);
            menu.setPosition(cc.p(win_size.width / 2,
                win_size.height / 2 - startItem.getContentSize().height * 2));
            this.addChild(menu, 1);

            //设置自动调整窗口大小
            this.setTouchEnabled(true);
//            rvs.adjustSizeForWindow();
//            lazyLayer.adjustSizeForCanvas();
//
//            window.addEventListener("resize", function (event) {
//                rvs.adjustSizeForWindow();
//            });
            return true;
        },

        onTouchesBegan:function (touches, event) {
            this.isMouseDown = true;
        },
        onTouchesMoved:function (touches, event) {
            if (this.isMouseDown) {
                if (touches) {
                    //this.circle.setPosition(cc.p(touches[0].getLocation().x, touches[0].getLocation().y));
                }
            }
        },
        onTouchesEnded:function (touches, event) {
            if (this.isShowAbout) {
                this.sptAbout.runAction(cc.FadeOut.create(1));
                this.isShowAbout = false;
            }
        },
        onTouchesCancelled:function (touches, event) {
            console.log("onTouchesCancelled");
        }
    });

    var StoryScene = cc.Scene.extend({
        onEnter:function () {
            this._super();
            var layer = new StorySceneLayer();
            layer.init();
            this.addChild(layer);
        }
    });

    return StoryScene;
};

