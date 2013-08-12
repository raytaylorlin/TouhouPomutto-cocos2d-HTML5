(function () {
    var TouhouPomuttoApp = cc.Application.extend({
        config: document['ccConfig'],

        ctor: function (scene) {
            this._super();
            this.StartSceneClass = scene;
            cc.COCOS2D_DEBUG = this.config['COCOS2D_DEBUG'];
            cc.initDebugSetting();
            cc.setup(this.config['tag']);
            cc.Loader.getInstance().onloading = function () {
                cc.LoaderScene.getInstance().draw();
            };
            cc.Loader.getInstance().onload = function () {
                cc.AppController.shareAppController().didFinishLaunchingWithOptions();
            };
            var resource = __tp.getResource();
            cc.Loader.getInstance().preload(resource.load_list);
        },

        applicationDidFinishLaunching: function () {
            // initialize director
            var director = cc.Director.getInstance();

            // enable High Resource Mode(2x, such as iphone4) and maintains low resource on other devices.
//     director->enableRetinaDisplay(true);
            // turn on display FPS
            director.setDisplayStats(this.config['showFPS']);
            // set FPS. the default value is 1.0/60 if you don't call this
            director.setAnimationInterval(1.0 / this.config['frameRate']);

            __tp.Constant.WINDOW_SIZE = director.getWinSize();
            __tp.Constant.WINDOW_CENTER_POINT = cc.p(director.getWinSize().width / 2,
                director.getWinSize().height / 2);

            window.addEventListener("resize", function (event) {
                __tp.adjustSizeForWindow();
            });
            director.runWithScene(new this.StartSceneClass());

            return true;
        }
    });

    //启动App
    new TouhouPomuttoApp(__tp.getScene().StartScene);
    __tp.initWindow();
})();



