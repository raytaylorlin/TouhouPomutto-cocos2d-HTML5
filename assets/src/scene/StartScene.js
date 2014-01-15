__tp.getStartScene = function (R) {
    //常量
    var __constant = __tp.Constant;
    var TEXT_POSITION = [cc.p(-300, 534), cc.p(330, 432), cc.p(626, 424), cc.p(380, 350)];
    var TEXT_TRIGGLE = [0.5, 1.0, 1.3, 1.6];
    var TEXT_DURATION = [0.8, 0.8, 0.8, 0.8];
    var OPTION_POSITION = [cc.p(841, 521), cc.p(721, 308), cc.p(500, 177)];
    var OPTION_NAME = ["practice", "battle", "network"];
    var OPTION_TRIGGLE = [1.8, 2.1, 2.4];
    var OPTION_DURATION = [1.0, 1.0, 1.0];

    

    var StartScene = cc.Scene.extend({
        onEnter: function () {
            this._super();
            var layer = new StartSceneLayer();
            layer.init();
            this.addChild(layer);
        }
    });

    return StartScene;
};

