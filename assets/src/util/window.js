/**
 * @fileoverview 窗口操作模块
 * @author Ray Taylor Lin <raytaylorlin@gmail.com>
 **/
define(function(require, exports) {
    var ccDirector;

    exports.getWindowSize = function() {
        if (!ccDirector) {
            ccDirector = cc.Director.getInstance();
        }
        return ccDirector.getWindowSize();
    };

    exports.getWindwoCenterPoint = function() {
        var windowSize = this.getWindowSize();

        if (!ccDirector) {
            ccDirector = cc.Director.getInstance();
        }
        return cc.p(windowSize.width / 2, windowSize.height / 2);
    };

    /*
     * 初始化窗口大小
     */
    exports.initWindow = function() {
        var parentDiv = document.getElementById("Cocos2dGameContainer");
        if (parentDiv) {
            parentDiv.style.width = cc.canvas.width + "px";
            parentDiv.style.height = cc.canvas.height + "px";
            parentDiv.style.position = "absolute";
            parentDiv.style.top = "50%";
            parentDiv.style.left = "50%";
            parentDiv.style.marginLeft = (-cc.canvas.width / 2) + "px";
            parentDiv.style.marginTop = (-cc.canvas.height / 2) + "px";
        }
    };

    exports.adjustSizeForWindow = function() {
        //目标宽高比
        var originRatio = cc.originalCanvasSize.width / cc.originalCanvasSize.height;
        //窗口宽高比
        var winRatio = window.innerWidth / window.innerHeight;
        var winWidth = window.screen.width;
        var winHeight = window.screen.height;

        if (winHeight < cc.originalCanvasSize.height) {
            cc.canvas.height = winHeight;
            cc.canvas.width = winHeight * originRatio;
        }

        //缩放比例
        var xScale = cc.canvas.width / cc.originalCanvasSize.width;
        var yScale = cc.canvas.height / cc.originalCanvasSize.height;
        if (xScale > yScale) {
            xScale = yScale;
        }

        __tp.initWindow();
        //重置坐标
        cc.renderContext.translate(0, cc.canvas.height);

        //内容缩放
        cc.renderContext.scale(xScale, xScale);
        cc.Director.getInstance().setContentScaleFactor(xScale);
    };
});