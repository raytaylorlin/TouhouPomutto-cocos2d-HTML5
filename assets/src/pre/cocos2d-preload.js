define(function (require) {
    var filesRootPath = '/assets/src/',
        d = document,
        c = {
            COCOS2D_DEBUG: 2, //0 to turn debug off, 1 for basic debug, and 2 for full debug
            box2d: false,
            chipmunk: false,
            showFPS: true,
            frameRate: 60,
            loadExtension: false,
            renderMode: 1,  //使用canvas渲染
            tag: 'gameCanvas', //the dom element to run cocos2d on
            // engineDir:'/assets/cocos2d/',
            SingleEngineFile: '/assets/src/lib/Cocos2d-html5-v2.1.5.mina.js',
            appFiles: [
                filesRootPath + 'pre/main.js'
            ]
        };

    /**
     * seajs入口函数，加载cocos2d引擎
     * 加载完毕后执行appFiles中的pre/main.js文件
     */
    var cocos2dPreload = function () {
        //first load engine file if specified
        var s = d.createElement('script');
        if (c.SingleEngineFile && !c.engineDir) {
            s.src = c.SingleEngineFile;
        }
        else if (c.engineDir && !c.SingleEngineFile) {
            s.src = c.engineDir + 'platform/jsloader.js';
        }
        else {
            alert('You must specify either the single engine file OR the engine directory in "cocos2d-preload.js"');
        }

        document.ccConfig = c;
        s.id = 'cocos2d-html5';
        d.body.appendChild(s);
    };

    //执行入口函数
    cocos2dPreload();

//    window.addEventListener('DOMContentLoaded', main);
});

