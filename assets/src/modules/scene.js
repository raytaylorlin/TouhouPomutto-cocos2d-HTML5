/**
 * @fileoverview 游戏场景模块，包含了各个场景的定义
 * @author Ray Taylor Lin <raytaylorlin@gmail.com>
 **/
define(function (require, exports, module) {
    var LazyLayer = require('modules/layer').LazyLayer,
        SpritesLayer = require('modules/layer').SpritesLayer;

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