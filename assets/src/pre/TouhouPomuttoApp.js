__tp.getScene = function () {
    var R = __tp.getResource().R;
    return {
        StartScene: __tp.getStartScene(R),
        PracticeScene: __tp.getPracticeScene(R)
    };
};

/**
 * 调整窗口大小以适应缩放操作
 */
__tp.adjustSizeForWindow = function () {
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

/*
 * 初始化窗口大小
 */
__tp.initWindow = function () {
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

__tp.random = {
    getMax: function (max) {
        return Math.floor(Math.random() * max);
    },
    getRange: function (min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }
};