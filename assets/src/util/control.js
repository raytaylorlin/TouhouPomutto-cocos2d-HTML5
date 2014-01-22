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
            var key;

            this._logic = logic;
            this._is1P = logic.is1P();
            this._keyboardSetting = logic.is1P() ?
                C.KEYBOARD_SETTING_1P : C.KEYBOARD_SETTING_2P;

            for (key in this._keyboardSetting) {
                this._currentPressedKey[key] = false;
            }
        },

        dispatchKeyboardEvent: function (event, key, is1P) {
            var ks = this._keyboardSetting,
                block = this._logic.getCurrentBlock();

            //丢弃不属于该角色的键盘事件
            if(!this._checkKeyInSetting(key)) {
                return;
            }

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

        _checkKeyInSetting: function(key) {
            var flag = false, 
                name;
            for(name in this._keyboardSetting) {
                if(key === this._keyboardSetting[name]) {
                    flag = true;
                    break;
                }
            }
            return flag;
        },

        dispatchTouchPadEvent: function () {

        }
    });

    module.exports = {
        InputTranslater: InputTranslater
    };
});