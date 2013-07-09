__tp.getScene = function () {
    var R = __tp.getResource().R;
    return {
        StartScene: __tp.getStartScene(R),
        PracticeScene: __tp.getPracticeScene(R)
    };
};

/**
 * 调整窗口大小以适应缩放操作
 */
__tp.adjustSizeForWindow = function () {
    //目标宽高比
    var originRatio = cc.originalCanvasSize.width / cc.originalCanvasSize.height;
    //窗口宽高比
    var winRatio = window.innerWidth / window.innerHeight;
    var winWidth = window.screen.width;
    var winHeight = window.screen.height;

    if (winHeight < cc.originalCanvasSize.height) {
        cc.canvas.height = winHeight;
        cc.canvas.width = winHeight * originRatio;
    }

    //缩放比例
    var xScale = cc.canvas.width / cc.originalCanvasSize.width;
    var yScale = cc.canvas.height / cc.originalCanvasSize.height;
    if (xScale > yScale) {
        xScale = yScale;
    }

    __tp.initWindow();
    //重置坐标
    cc.renderContext.translate(0, cc.canvas.height);

    //内容缩放
    cc.renderContext.scale(xScale, xScale);
    cc.Director.getInstance().setContentScaleFactor(xScale);
};

/*
 * 初始化窗口大小
 */
__tp.initWindow = function () {
    var parentDiv = document.getElementById("Cocos2dGameContainer");
    if (parentDiv) {
        parentDiv.style.width = cc.canvas.width + "px";
        parentDiv.style.height = cc.canvas.height + "px";
        parentDiv.style.position = "absolute";
        parentDiv.style.top = "50%";
        parentDiv.style.left = "50%";
        parentDiv.style.marginLeft = (-cc.canvas.width / 2) + "px";
        parentDiv.style.marginTop = (-cc.canvas.height / 2) + "px";
    }
};



__tp.util = {};

__tp.util.shareList = [];

__tp.util.random = {
    getRange: function (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },
    getMax: function (max) {
        return this.getRange(0, max);
    }
};

__tp.util.logic = {
    getLogicXY: function (drawPos, is1P) {
        var LEFT_BOTTOM = is1P ? __tp.Constant.GAME_FIELD_INIT_POS_1P :
            __tp.Constant.GAME_FIELD_INIT_POS_2P;
        var SQUARE_LENGTH = __tp.Constant.SQUARE_LENGTH;
        var x = Math.floor((drawPos.x - LEFT_BOTTOM.x) / SQUARE_LENGTH);
        var y = Math.floor((drawPos.y - LEFT_BOTTOM.y) / SQUARE_LENGTH);
        if (y < -1 || y >= __tp.Constant.MAX_LOGIC_H ||
            x < 0 || x >= __tp.Constant.MAX_LOGIC_W) {
            return null;
        } else {
            return {x: x, y: y};
        }
    }
};

__tp.util.InputTranslater = cc.Class.extend({
    _logic: null,
    _keyboardSetting: null,
    //当前键盘上按下的键（该变量用于实现KeyPress）
    _currentPressedKey: {},

    ctor: function (logic) {
        this._logic = logic;
        this._keyboardSetting = logic.is1P() ?
            __tp.Constant.KEYBOARD_SETTING_1P : __tp.Constant.KEYBOARD_SETTING_2P;
        var key;
        for (key in this._keyboardSetting) {
            this._currentPressedKey[key] = false;
        }
    },

    dispatchKeyboardEvent: function (event, key) {
        var ks = this._keyboardSetting;
        var cb = this._logic.getCurrentBlock();
        switch (event) {
            case "onKeyUp":
                if (this._currentPressedKey[key]) {
                    switch (key) {
                        case ks.DOWN:
                            cb.setKeyPressedDown(false);
                            break;
                    }
                }
                this._currentPressedKey[key] = false;
                break;
            case "onKeyDown":
                if (key === ks.DOWN) {
                    cb.setKeyPressedDown(true);
                }
                if (!this._currentPressedKey[key]) {
                    switch (key) {
                        case ks.LEFT:
                            cb.translate(true);
                            break;
                        case ks.RIGHT:
                            cb.translate(false);
                            break;
                        case ks.ROTATE:
                            cb.exchangeSquare();
                            break;
                        case ks.PAUSE:
                            this._logic.pauseGame();
                            break;
                    }
                }
                this._currentPressedKey[key] = true;
                break;
        }
    },

    dispatchTouchPadEvent: function () {

    }
});