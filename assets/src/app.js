/**
 * @fileoverview 应用程序主入口模块，调用方法：seajs.use('app');
 * @author Ray Taylor Lin <raytaylorlin@gmail.com>
 **/
define(function (require, exports) {
    var res = require('util/resource'),
        window = require('util/window');
    var PracticeScene = require('modules/scene').PracticeScene;

    var TouhouPomuttoApp = cc.Application.extend({
        config : document['ccConfig'],
        ctor:function (scene) {
            this._super();
            this.startScene = scene;
            cc.COCOS2D_DEBUG = this.config['COCOS2D_DEBUG'];
            cc.initDebugSetting();
            cc.setup(this.config['tag']);
            cc.AppController.shareAppController().didFinishLaunchingWithOptions();
        },

        applicationDidFinishLaunching: function () {
            // initialize director
            var director = cc.Director.getInstance();

            // enable High Resource Mode(2x, such as iphone4) and maintains low resource on other devices.
//            director->enableRetinaDisplay(true);

            // turn on display FPS
            director.setDisplayStats(this.config['showFPS']);
            // set FPS. the default value is 1.0/60 if you don't call this
            director.setAnimationInterval(1.0 / this.config['frameRate']);

            //加载图片、声音等资源文件，加载完成后执行回调函数载入场景
            cc.Loader.preload(res.loadList, function () {
                cc.Director.getInstance().runWithScene(new this.startScene());
            }, this);

            return true;
        }
    });

    exports.startApp = function(){
        //启动App
        new TouhouPomuttoApp(PracticeScene);
        window.initWindow();
    };
});