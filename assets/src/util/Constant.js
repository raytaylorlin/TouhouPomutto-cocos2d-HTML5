define(function(require, exports, module) {
    module.exports = {
        IS_DEBUG: false,
        // IS_DEBUG: true,

        //        WINDOW_SIZE: windowSize,
        //        WINDOW_CENTER_POINT: windowCenterPoint,
        //        
        /* 开始场景相关 */

        START_SCENE_TEXT_POSITION: [cc.p(-300, 534), cc.p(330, 432), cc.p(626, 424), cc.p(380, 350)],
        START_SCENE_TEXT_TRIGGLE: [0.5, 1.0, 1.3, 1.6],
        START_SCENE_TEXT_DURATION: [0.8, 0.8, 0.8, 0.8],
        START_SCENE_OPTION_POSITION: [cc.p(841, 521), cc.p(721, 308), cc.p(500, 177)],
        START_SCENE_OPTION_NAME: ["practice", "battle", "network"],
        START_SCENE_OPTION_TRIGGLE: [1.8, 2.1, 2.4],
        START_SCENE_OPTION_DURATION: [1.0, 1.0, 1.0],
        
        /* 游戏逻辑相关 */

        //默认的游戏区初始化高度
        DEFAULT_INIT_FIELD_H: 4,
        //默认游戏区逻辑宽度
        MAX_LOGIC_W: 7,
        //默认游戏区逻辑高度
        MAX_LOGIC_H: 12,

        //方块尺寸
        SQUARE_SIZE: cc.p(44, 44),
        //方块尺寸长度
        SQUARE_LENGTH: 44,
        //方块绘图深度
        SQUARE_DEPTH_LEVEL: 5,

        //游戏分数数字尺寸
        GAME_SCORE_SIZE: cc.p(22, 36),
        GAME_SCORE_DEPTH_LEVEL: 6,

        //方块组初始化的位置
        INIT_BLOCK_POINT_1P: cc.p(236, 700),
        INIT_BLOCK_POINT_2P: cc.p(725, 720),

        //游戏分数初始化的位置
        INIT_SCORE_POINT_1P: cc.p(522, 474),
        INIT_SCORE_POINT_2P: cc.p(542, 352),

        //分数显示递增的幅度
        SCORE_INCREASE_STEP: 100,

        //NEXT队列区最大数量
        NEXT_QUEUE_MAX_NUM: 5,
        //NEXT队列区1P起始位置（最顶端）
        NEXT_QUEUE_INIT_POS_1P: cc.p(38, 524),
        //NEXT队列区2P起始位置（最顶端）
        NEXT_QUEUE_INIT_POS_2P: cc.p(923, 524),
        //NEXT队列区方块组纵向间距
        NEXT_QUEUE_POS_INTEVAL: cc.p(0, 115),
        //游戏区1P初始化位置（左下角）
        GAME_FIELD_INIT_POS_1P: cc.p(104, 113),
        //游戏区2P初始化位置（左下角）
        GAME_FIELD_INIT_POS_2P: cc.p(593, 113),

        CLEAR_SQUARE_WAIT_TIME: 5000,

        /* 键盘按键键值 */
        KEYBOARD_SETTING_1P: {
            LEFT: cc.KEY.left,
            RIGHT: cc.KEY.right,
            DOWN: cc.KEY.down,
            ROTATE: cc.KEY.z,
            PAUSE: cc.KEY.escape
        },
        KEYBOARD_SETTING_2P: {
            LEFT: cc.KEY.left,
            RIGHT: cc.KEY.right,
            DOWN: cc.KEY.down,
            ROTATE: cc.KEY.z,
            PAUSE: cc.KEY.escape
        }
    };
});