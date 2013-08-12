//游戏命名空间
var __tp = __tp = __tp || {};

(function () {
    var filesRootPath = '/assets/src/';
    var d = document;
    var c = {
        COCOS2D_DEBUG: 2, //0 to turn debug off, 1 for basic debug, and 2 for full debug
        box2d: false,
        chipmunk: false,
        showFPS: true,
        frameRate: 60,
        loadExtension: false,
        renderMode: 1,
        tag: 'gameCanvas', //the dom element to run cocos2d on
        // engineDir:'/assets/cocos2d/',
        SingleEngineFile: '/assets/lib/Cocos2d-html5-v2.1.5.mina.js',
        appFiles: [
            filesRootPath + 'pre/resource.js',
            filesRootPath + 'pre/TouhouPomuttoApp.js',

            filesRootPath + 'util/Constant.js',
            filesRootPath + 'logic/Common.js',
            filesRootPath + 'logic/Block.js',
            filesRootPath + 'logic/GameLogic.js',

            filesRootPath + 'sprite/sprites.js',
            filesRootPath + 'sprite/Square.js',


            filesRootPath + 'scene/StartScene.js',
            filesRootPath + 'scene/PracticeScene.js',

            filesRootPath + 'Main.js'
        ]
    };
    window.addEventListener('DOMContentLoaded', function () {
        //first load engine file if specified
        var s = d.createElement('script');
        /*********Delete this section if you have packed all files into one*******/
        if (c.SingleEngineFile && !c.engineDir) {
            s.src = c.SingleEngineFile;
        }
        else if (c.engineDir && !c.SingleEngineFile) {
            s.src = c.engineDir + 'platform/jsloader.js';
        }
        else {
            alert('You must specify either the single engine file OR the engine directory in "cocos2d-preload.js"');
        }
        /*********Delete this section if you have packed all files into one*******/

            // s.src = '/assets/src/lib/Cocos2d-html5-v2.1.5.min.js'; //IMPORTANT: Un-comment this line if you have packed all files into one

        document.ccConfig = c;
        s.id = 'cocos2d-html5';
        d.body.appendChild(s);
        //else if single file specified, load singlefile
    });
})();

