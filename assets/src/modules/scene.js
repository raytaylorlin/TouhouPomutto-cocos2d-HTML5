/**
 * @fileoverview 游戏场景模块，包含了各个场景的定义
 * @author Ray Taylor Lin <raytaylorlin@gmail.com>
 **/
define(function (require, exports, module) {
    var StartSceneLayer = require('modules/layer').StartSceneLayer,
        LazyLayer = require('modules/layer').LazyLayer,
        SpritesLayer = require('modules/layer').SpritesLayer;

    var StartScene = cc.Scene.extend({
        onEnter: function () {
            this._super();
            var layer = new StartSceneLayer();
            layer.init();
            this.addChild(layer);
        }
    });

    var PracticeScene = cc.Scene.extend({
        onEnter: function () {
            this._super();
            var baseLayer = new LazyLayer();
            baseLayer.init();
            this.addChild(baseLayer);

            var spritesLayer1P = new SpritesLayer(true);
            var spritesLayer2P = new SpritesLayer(false);
            spritesLayer1P.init();
            spritesLayer2P.init();
            this.addChild(spritesLayer1P);
            this.addChild(spritesLayer2P);
        }
    });

    //绑定自定义事件，接收来自Layer的触发事件更换场景
    (function() {
        var sceneMap = {
            'StartScene': StartScene,
            'PracticeScene': PracticeScene
        };

        window.addEventListener('CHANGE_SCENE', function(e) {
            var nextScene = cc.TransitionFade.create(2, 
                new sceneMap[e.detail.sceneName]());
            cc.Director.getInstance().replaceScene(nextScene);
        });
    })();

    module.exports = {
        StartScene: StartScene,
        PracticeScene: PracticeScene
    };
});