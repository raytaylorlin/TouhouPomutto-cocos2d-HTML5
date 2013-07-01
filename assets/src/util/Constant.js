__tp.Constant = {
    //  var IS_DEBUG= false
    IS_DEBUG: true,

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

    INIT_BLOCK_POINT_1P: cc.p(237, 700),
    INIT_BLOCK_POINT_2P: cc.p(725, 720),

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

    /* 键盘按键键值 */
    KEYBOARD_SETTING_1P: {
        LEFT: cc.KEY.left,
        RIGHT: cc.KEY.right,
        DOWN: cc.KEY.down,
        ROTATE: cc.KEY.z
    },
    KEYBOARD_SETTING_2P: {
        LEFT: cc.KEY.left,
        RIGHT: cc.KEY.right,
        DOWN: cc.KEY.down,
        ROTATE: cc.KEY.z
    }

//        return {
//            IS_DEBUG: IS_DEBUG,
//            WINDOW_SIZE: WINDOW_SIZE,
//            WINDOW_CENTER_POINT: WINDOW_CENTER_POINT,
//            SQUARE_SIZE: SQUARE_SIZE,
//            SQUARE_DEPTH_LEVEL: SQUARE_DEPTH_LEVEL,
//            INIT_BLOCK_POINT_1P: INIT_BLOCK_POINT_1P,
//            INIT_BLOCK_POINT_2P: INIT_BLOCK_POINT_2P,
//            GAME_FIELD_INIT_POS_1P: GAME_FIELD_INIT_POS_1P,
//            GAME_FIELD_INIT_POS_2P: GAME_FIELD_INIT_POS_2P
//        }
};
