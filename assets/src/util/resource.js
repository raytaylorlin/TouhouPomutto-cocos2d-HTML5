define(function (require, exports) {
    var imagePath = "/assets/res/img/", //路径前缀
        loadList = [],  //加载列表
        R = {   //资源引用路径字典
            //空图片
            imgNull: imagePath + "null.png",

            //起始界面的图片资源
            imgStartScene_background: imagePath + "startScene_background.png",
            imgStartScene_text: imagePath + "startScene_text.png",
            imgStartScene_options: imagePath + "startScene_options.png",
            imgStartScene_starEffect: imagePath + "startScene_starEffect.png",

            //起始界面的图片切片映射表
            plstStartScene_text: imagePath + "startScene_text.plist",
            plstStartScene_options: imagePath + "startScene_options.plist",
            plstStartScene_starEffect: imagePath + "startScene_starEffect.plist",

            //游戏界面的公共图片资源
            imgGameScene_background: imagePath + "gameScene_background.png",
            imgGameScene_gameFrame: imagePath + "gameScene_gameFrame.png",
            imgGameScene_positionHint: imagePath + "gameScene_positionHint.png",
            imgGameScene_square: imagePath + "gameScene_square.png",

            //游戏界面的公共图片切片映射表
            plstGameScene_square: imagePath + "gameScene_square.plist"
        };

    //遍历路径字典，初始化加载列表
    var key, typeName = "image";
    for (key in R) {
        if (R[key].lastIndexOf("png") > 0) {
            typeName = "image";
        }
        else if (R[key].lastIndexOf("plist") > 0) {
            typeName = "plist";
        }
        loadList.push({type: typeName, src: R[key]});
    }

    exports.R = R;
    exports.loadList = loadList;
});