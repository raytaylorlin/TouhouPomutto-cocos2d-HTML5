(function () {
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
//     director->enableRetinaDisplay(true);

            // turn on display FPS
            director.setDisplayStats(this.config['showFPS']);
            // set FPS. the default value is 1.0/60 if you don't call this
            director.setAnimationInterval(1.0 / this.config['frameRate']);
            //load resources
            cc.Loader.preload(__tp.getResource().load_list, function () {
                cc.Director.getInstance().runWithScene(new this.startScene());
            }, this);

            __tp.Constant.WINDOW_SIZE = director.getWinSize();
            __tp.Constant.WINDOW_CENTER_POINT = cc.p(director.getWinSize().width / 2,
                director.getWinSize().height / 2);

            // window.addEventListener("resize", function (event) {
            //     __tp.adjustSizeForWindow();
            // });
            // director.runWithScene();

            return true;
        }
    });

    //启动App
    new TouhouPomuttoApp(__tp.getScene().PracticeScene);
    __tp.initWindow();
})();



