//扩展cc库，添加可触碰Sprite类
cc.CanTouchSprite = cc.Sprite.extend({
    _touchBegan:false,
    _touchEnabled:true,
    ctor:function () {
        this._super();
    },
    onEnter:function () {
        cc.Director.getInstance().getTouchDispatcher().addStandardDelegate(this, 0);
        this._touchEnabled = true;
        this._super();
    },
    onExit:function () {
        cc.Director.getInstance().getTouchDispatcher().removeDelegate(this);
        this._touchEnabled = false;
        this._super();
    },
    touchRect:function () {
        return this.getBoundingBoxToWorld();
    },
    setTouchEnabled:function (enable) {
        if (enable && !this._touchEnabled) {
            cc.Director.getInstance().getTouchDispatcher().addStandardDelegate(this, 0);
            this._touchEnabled = true;
        }
        else if (!enable && this._touchEnabled) {
            cc.Director.getInstance().getTouchDispatcher().removeDelegate(this);
            this._touchEnabled = false;
        }
    },
    onTouchesBegan:function (touches, event) {
        if (cc.Rect.CCRectContainsPoint(this.touchRect(), touches[0].getLocation())) {
            this._touchBegan = true;
        }
    },
    onTouchesMoved:function (touches, event) {

    },
    onTouchesEnded:function (touches, event) {
        if (this._touchBegan) {
            this._touchBegan = false;
        }
    }
});