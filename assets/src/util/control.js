/**
 * @fileoverview 游戏控制模块，负责解析键盘、鼠标等设备的输入
 * @author Ray Taylor Lin <raytaylorlin@gmail.com>
 **/
define(function (require, exports, module) {
    var C = require('util/constant');

    var InputTranslater = cc.Class.extend({
        _logic: null,
        _keyboardSetting: null,
        //当前键盘上按下的键（该变量用于实现KeyPress）
        _currentPressedKey: {},

        ctor: function (logic) {
            this._logic = logic;
            this._keyboardSetting = logic.is1P() ?
                C.KEYBOARD_SETTING_1P : C.KEYBOARD_SETTING_2P;
            var key;
            for (key in this._keyboardSetting) {
                this._currentPressedKey[key] = false;
            }
        },

        dispatchKeyboardEvent: function (event, key) {
            var ks = this._keyboardSetting;
            var block = this._logic.getCurrentBlock();
            switch (event) {
                case "onKeyUp":
                    if (this._currentPressedKey[key]) {
                        switch (key) {
                            case ks.DOWN:
                                block.setKeyPressedDown(false);
                                break;
                        }
                    }
                    this._currentPressedKey[key] = false;
                    break;
                case "onKeyDown":
                    if (key === ks.DOWN) {
                        block.setKeyPressedDown(true);
                    }
                    if (!this._currentPressedKey[key]) {
                        switch (key) {
                            case ks.LEFT:
                                block.translate(true);
                                break;
                            case ks.RIGHT:
                                block.translate(false);
                                break;
                            case ks.ROTATE:
                                block.exchangeSquare();
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

    module.exports = {
        InputTranslater: InputTranslater
    };
});