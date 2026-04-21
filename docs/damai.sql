DROP DATABASE IF EXISTS `damai`;

CREATE DATABASE `damai`;

USE `damai`;

CREATE TABLE `admin`
(
    `id`         BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `mobile`     VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '手机号',
    `username`   VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '用户名',
    `avatar_url` VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '头像 URL',
    `status`     TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '账号状态：0 封禁，1 正常',
    `is_deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`  BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`  BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`)
);

INSERT INTO `admin` (`id`, `mobile`, `username`, `avatar_url`)
VALUES (1, '13800138000', 'test_admin', 'https://placehold.jp/150x150.png?text=Admin');

CREATE TABLE `user`
(
    `id`         BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `mobile`     VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '手机号',
    `username`   VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '用户名',
    `avatar_url` VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '头像 URL',
    `status`     TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '账号状态：0 封禁，1 正常',
    `is_deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`  BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`  BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`)
);

INSERT INTO `user` (`id`, `mobile`, `username`, `avatar_url`)
VALUES (1, '13800138000', 'test_user', 'https://placehold.jp/150x150.png?text=User');

CREATE TABLE `passenger`
(
    `id`           BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `user_id`      BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '用户账号 ID',
    `name`         VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '实名姓名',
    `id_type`      TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '证件类型：1 身份证',
    `id_no_masked` VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '证件号脱敏',
    `is_deleted`   TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`    BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`    BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`)
);

INSERT INTO `passenger` (`id`, `user_id`, `name`, `id_type`, `id_no_masked`)
VALUES (1, 1, '张三', 1, '110101********1234');

CREATE TABLE `banner`
(
    `id`               BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `city_id`          BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '城市 ID',
    `title`            VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '标题',
    `image_url`        VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '桌面端图片 URL',
    `mobile_image_url` VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '移动端图片 URL',
    `jump_url`         VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '跳转 URL',
    `sort_order`       INT              NOT NULL DEFAULT 0 COMMENT '排序值',
    `display_start_at` DATETIME         NOT NULL COMMENT '展示开始时间',
    `display_end_at`   DATETIME         NOT NULL COMMENT '展示结束时间',
    `is_deleted`       TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`        BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`        BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`)
);

INSERT INTO `banner` (`id`, `city_id`, `title`, `image_url`, `mobile_image_url`, `jump_url`, `sort_order`,
                      `display_start_at`, `display_end_at`)
VALUES (1, 1, '测试 Banner 1', 'https://placehold.jp/1920x768.png?text=Banner1',
        'https://placehold.jp/750x422.png?text=Banner1', '/detail/1', 1,
        '2026-01-01 00:00:00', '2026-12-31 23:59:59'),
       (2, 1, '测试 Banner 2', 'https://placehold.jp/1920x768.png?text=Banner2',
        'https://placehold.jp/750x422.png?text=Banner2', '/detail/2', 2,
        '2026-01-01 00:00:00', '2026-12-31 23:59:59');

CREATE TABLE `city`
(
    `id`           BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `name`         VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '城市名称',
    `pinyin`       VARCHAR(128)     NOT NULL DEFAULT '' COMMENT '城市拼音全拼 (如 beijing)',
    `first_letter` CHAR(1)          NOT NULL DEFAULT '' COMMENT '拼音首字母大写 (如 B)',
    `is_featured`  TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否热门：0 否，1 是',
    `is_deleted`   TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`    BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`    BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`)
);

INSERT INTO `city` (`id`, `name`, `pinyin`, `first_letter`, `is_featured`)
VALUES (1, '北京', 'beijing', 'B', 1),
       (2, '上海', 'shanghai', 'S', 1),
       (3, '保定', 'baoding', 'B', 0),
       (4, '石家庄', 'shijiazhuang', 'S', 0);

CREATE TABLE `category`
(
    `id`         BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `parent_id`  BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '父分类 ID，0 表示一级分类',
    `name`       VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '分类名称',
    `sort_order` INT              NOT NULL DEFAULT 0 COMMENT '排序值',
    `is_deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`  BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`  BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`)
);

INSERT INTO `category` (`id`, `parent_id`, `name`, `sort_order`)
VALUES (1, 0, '演唱会', 1),
       (2, 1, '流行', 1),
       (3, 1, '摇滚', 2),
       (4, 0, '话剧歌剧', 2),
       (5, 4, '话剧', 1),
       (6, 4, '歌剧', 2),
       (7, 0, '体育', 3),
       (8, 7, '足球', 1),
       (9, 7, '篮球', 2),
       (10, 0, '儿童亲子', 4),
       (11, 10, '儿童剧', 1),
       (12, 10, '亲子互动', 2),
       (13, 0, '展览休闲', 5),
       (14, 13, '艺术展', 1),
       (15, 13, '科技展', 2),
       (16, 0, '音乐会', 6),
       (17, 16, '古典', 1),
       (18, 16, '爵士', 2),
       (19, 0, '曲苑杂坛', 7),
       (20, 19, '相声', 1),
       (21, 19, '小品', 2),
       (22, 0, '舞蹈芭蕾', 8),
       (23, 22, '芭蕾舞', 1),
       (24, 22, '现代舞', 2),
       (25, 0, '二次元', 9),
       (26, 25, '声优见面会', 1),
       (27, 25, 'ACG 展览', 2),
       (28, 0, '旅游展览', 10),
       (29, 28, '旅游展', 1),
       (30, 28, '汽车展', 2);

CREATE TABLE `notice`
(
    `id`         BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `type`       TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '须知类型：1 购票须知，2 入场须知',
    `name`       VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '须知名',
    `sort_order` INT              NOT NULL DEFAULT 0 COMMENT '排序值',
    `is_deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`  BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`  BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`)
);

INSERT INTO `notice` (`id`, `type`, `name`, `sort_order`)
VALUES (1, 1, '发票说明', 1),
       (2, 2, '演出时长', 1);

CREATE TABLE `service_guarantee`
(
    `id`         INT UNSIGNED     NOT NULL COMMENT '主键 ID',
    `name`       VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '服务名',
    `sort_order` INT              NOT NULL DEFAULT 0 COMMENT '排序值',
    `is_deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`  BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`  BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`)
);

INSERT INTO `service_guarantee` (`id`, `name`, `sort_order`)
VALUES (1, '无理由退换', 1);

CREATE TABLE `service_guarantee_option`
(
    `id`                   INT UNSIGNED     NOT NULL COMMENT '主键 ID',
    `service_guarantee_id` INT UNSIGNED     NOT NULL DEFAULT 0 COMMENT '服务 ID',
    `name`                 VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '选项名',
    `description`          TEXT             NOT NULL COMMENT '选项说明',
    `is_boolean_type`      TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '选项类型：0 否，1 是',
    `is_deleted`           TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`            DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`            BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`            DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`            BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`)
);

INSERT INTO `service_guarantee_option` (`id`, `service_guarantee_id`, `name`, `description`, `is_boolean_type`)
VALUES (1, 1, '支持', '支持无理由退换，购票后可申请退票', 1),
       (2, 1, '不支持', '不支持无理由退换，购票后无法退票', 0);

CREATE TABLE `venue`
(
    `id`         BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `name`       VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '场馆名称',
    `province`   VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '省份',
    `city`       VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '城市',
    `district`   VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '区县',
    `address`    VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '地址',
    `is_deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`  BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`  BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`)
);

INSERT INTO `venue` (`id`, `name`, `province`, `city`, `district`, `address`)
VALUES (1, '测试场馆', '北京市', '北京市', '朝阳区', '北京市朝阳区测试路1号');

CREATE TABLE `participant`
(
    `id`           BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `name`         VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '参与方名称',
    `avatar_url`   VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '头像 URL',
    `follow_count` BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '关注数',
    `is_deleted`   TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`    BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`    BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`)
);

INSERT INTO `participant` (`id`, `name`, `avatar_url`)
VALUES (1, '测试艺人', 'https://placehold.jp/150x150.png?text=Artist');

CREATE TABLE `series`
(
    `id`         BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `name`       VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '系列名称',
    `is_deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`  BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`  BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`)
);

INSERT INTO `series` (`id`, `name`)
VALUES (1, '测试演唱会系列'),
       (2, '测试话剧系列'),
       (3, '测试体育系列'),
       (4, '测试儿童亲子系列');

CREATE TABLE `event`
(
    `id`                     BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `city_id`                BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '城市 ID',
    `city_name_snapshot`     VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '城市名称快照',
    `series_id`              BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '系列 ID',
    `category_id`            BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '分类 ID',
    `category_name_snapshot` VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '分类名称快照',
    `venue_id`               BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '场馆 ID',
    `venue_name_snapshot`    VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '场馆名称快照',
    `name`                   VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '活动名称',
    `cover_url`              VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '封面图 URL',
    `min_price`              INT UNSIGNED     NOT NULL DEFAULT 0 COMMENT '最低票价(分)',
    `max_price`              INT UNSIGNED     NOT NULL DEFAULT 0 COMMENT '最高票价(分)',
    `first_session_start_at` DATETIME         NULL     DEFAULT NULL COMMENT '最早场次开始时间',
    `last_session_end_at`    DATETIME         NULL     DEFAULT NULL COMMENT '最晚场次结束时间',
    `recommend_weight`       INT              NOT NULL DEFAULT 0 COMMENT '推荐权重（越高越靠前）',
    `follow_count`           BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '关注数',
    `status`                 TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '活动状态：0 草稿，1 已发布，2 已下线',
    `is_deleted`             TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`              DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`              BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`              DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`              BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`)
);

CREATE TABLE `event_participant`
(
    `id`             BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `event_id`       BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '活动 ID',
    `participant_id` BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '参与方 ID',
    `sort_order`     INT              NOT NULL DEFAULT 0 COMMENT '排序值',
    `is_deleted`     TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`      BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`      BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`)
);

CREATE TABLE `event_info`
(
    `id`               BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `event_id`         BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '活动 ID',
    `description`      TEXT             NULL COMMENT '图文详情',
    `purchase_notice`  JSON             NULL COMMENT '购票须知',
    `admission_notice` JSON             NULL COMMENT '入场须知',
    `is_deleted`       TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`        BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`        BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`)
);

CREATE TABLE `event_service_guarantee`
(
    `id`                          BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `event_id`                    BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '活动 ID',
    `service_guarantee_id`        INT UNSIGNED     NOT NULL DEFAULT 0 COMMENT '服务 ID',
    `service_guarantee_option_id` INT UNSIGNED     NOT NULL DEFAULT 0 COMMENT '服务选项 ID',
    `is_deleted`                  TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`                   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`                   BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`                   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`                   BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`)
);

CREATE TABLE `session`
(
    `id`         BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `event_id`   BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '活动 ID',
    `name`       VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '场次名称',
    `start_at`   DATETIME         NOT NULL COMMENT '开始时间',
    `end_at`     DATETIME         NOT NULL COMMENT '结束时间',
    `status`     TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '场次状态：0 取消，1 正常',
    `is_deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`  BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`  BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`)
);

CREATE TABLE `ticket_type`
(
    `id`            BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `session_id`    BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '场次 ID',
    `name`          VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '票种名称',
    `sale_price`    INT UNSIGNED     NOT NULL DEFAULT 0 COMMENT '售价（分）',
    `order_limit`   INT UNSIGNED     NOT NULL DEFAULT 0 COMMENT '单笔订单限购，0 表示不限',
    `account_limit` INT UNSIGNED     NOT NULL DEFAULT 0 COMMENT '单用户限购，0 表示不限',
    `status`        TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '票种状态：0 取消，1 正常',
    `sale_start_at` DATETIME         NOT NULL COMMENT '开售时间',
    `sale_end_at`   DATETIME         NOT NULL COMMENT '停售时间',
    `is_deleted`    TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`     DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`     BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`     DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`     BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`)
);

CREATE TABLE `ticket_inventory`
(
    `id`             BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `ticket_type_id` BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '票种 ID',
    `total_qty`      INT UNSIGNED     NOT NULL DEFAULT 0 COMMENT '总库存',
    `locked_qty`     INT UNSIGNED     NOT NULL DEFAULT 0 COMMENT '锁定库存',
    `sold_qty`       INT UNSIGNED     NOT NULL DEFAULT 0 COMMENT '已售库存',
    `is_deleted`     TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`      BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`      BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`)
);

CREATE TABLE `ticket_order`
(
    `id`                        BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `order_no`                  VARCHAR(64)      NOT NULL DEFAULT '' COMMENT '订单号',
    `user_id`                   BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '用户 ID',
    `unit_price`                INT UNSIGNED     NOT NULL DEFAULT 0 COMMENT '单价（分）',
    `quantity`                  INT UNSIGNED     NOT NULL DEFAULT 1 COMMENT '购票数量',
    `total_amount`              INT UNSIGNED     NOT NULL DEFAULT 0 COMMENT '订单总金额（分）',
    `event_id`                  BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '活动 ID',
    `event_name_snapshot`       VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '活动名称快照',
    `event_cover_url_snapshot`  VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '活动封面图快照',
    `venue_id`                  BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '场馆 ID',
    `venue_name_snapshot`       VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '场馆名称快照',
    `venue_address_snapshot`    VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '场馆详细地址快照',
    `session_id`                BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '场次 ID',
    `session_name_snapshot`     VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '场次名称快照',
    `session_start_at_snapshot` DATETIME         NOT NULL COMMENT '场次开始时间快照',
    `ticket_type_id`            BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '票种 ID',
    `ticket_type_name_snapshot` VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '票种名称快照',
    `passenger_ids`             JSON             NOT NULL COMMENT '购票人 ID 列表',
    `status`                    TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '订单状态：0 待支付，1 已支付，2 已取消，3 已关闭，4 已退款',
    `expire_at`                 DATETIME         NULL     DEFAULT NULL COMMENT '过期时间',
    `pay_time`                  DATETIME         NULL     DEFAULT NULL COMMENT '支付时间',
    `cancel_time`               DATETIME         NULL     DEFAULT NULL COMMENT '取消时间',
    `close_time`                DATETIME         NULL     DEFAULT NULL COMMENT '关闭时间',
    `refund_time`               DATETIME         NULL     DEFAULT NULL COMMENT '退款时间',
    `is_deleted`                TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`                 DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`                 BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`                 DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`                 BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`)
);

CREATE TABLE `payment`
(
    `id`               BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `payment_no`       VARCHAR(64)      NOT NULL DEFAULT '' COMMENT '支付单号',
    `user_id`          BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '用户 ID',
    `order_id`         BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '订单 ID',
    `order_no`         VARCHAR(64)      NOT NULL DEFAULT '' COMMENT '订单号',
    `amount`           INT UNSIGNED     NOT NULL DEFAULT 0 COMMENT '支付金额（分）',
    `subject`          VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '支付标题',
    `status`           TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '支付状态：0 待支付，1 支付成功，2 支付失败',
    `channel`          TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '支付渠道：1 支付宝，2 微信支付',
    `pay_method`       TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '支付方式：1 二维码支付',
    `out_trade_no`     VARCHAR(64)      NOT NULL DEFAULT '' COMMENT '商户交易号',
    `channel_trade_no` VARCHAR(128)              DEFAULT '' COMMENT '渠道交易号',
    `qr_code_url`      VARCHAR(512)              DEFAULT '' COMMENT '二维码 URL',
    `is_deleted`       TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_by`        BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `create_at`        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`        BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    `update_at`        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`)
);

CREATE TABLE `refund`
(
    `id`               BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `refund_no`        VARCHAR(64)      NOT NULL DEFAULT '' COMMENT '退款单号',
    `user_id`          BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '用户 ID',
    `payment_id`       BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '支付 ID',
    `order_id`         BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '订单 ID',
    `amount`           INT UNSIGNED     NOT NULL DEFAULT 0 COMMENT '退款金额（分）',
    `reason`           VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '退款原因',
    `channel`          TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '支付渠道：1 支付宝，2 微信支付',
    `out_refund_no`    VARCHAR(64)      NOT NULL DEFAULT '' COMMENT '商户退款号',
    `channel_trade_no` VARCHAR(128)              DEFAULT '' COMMENT '渠道交易号',
    `status`           TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '退款状态：0 待处理，1 退款成功，2 退款失败',
    `is_deleted`       TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`        BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`        BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`)
);

CREATE TABLE `ticket`
(
    `id`                              BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `ticket_no`                       VARCHAR(64)      NOT NULL DEFAULT '' COMMENT '电子票号',
    `qr_code_token`                   VARCHAR(64)      NOT NULL DEFAULT '' COMMENT '二维码 Token',
    `user_id`                         BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '用户 ID',
    `order_id`                        BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '订单 ID',
    `order_no`                        VARCHAR(64)      NOT NULL DEFAULT '' COMMENT '订单号',
    `passenger_id`                    BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '购票人 ID',
    `passenger_name_snapshot`         VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '实名姓名快照',
    `passenger_id_type_snapshot`      TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '证件类型快照',
    `passenger_id_no_masked_snapshot` VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '证件号脱敏',
    `event_id`                        BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '活动 ID',
    `event_name_snapshot`             VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '活动名称快照',
    `event_cover_url_snapshot`        VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '活动封面图快照',
    `venue_id`                        BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '场馆 ID',
    `venue_name_snapshot`             VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '场馆名称快照',
    `venue_address_snapshot`          VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '场馆详细地址快照',
    `session_id`                      BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '场次 ID',
    `session_name_snapshot`           VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '场次名称快照',
    `session_start_at_snapshot`       DATETIME         NOT NULL COMMENT '场次开始时间快照',
    `ticket_type_id`                  BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '票种 ID',
    `ticket_type_name_snapshot`       VARCHAR(512)     NOT NULL DEFAULT '' COMMENT '票种名称快照',
    `status`                          TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '电子票状态：0 未使用，1 已使用，2 已作废，3 已退票',
    `used_at`                         DATETIME         NULL     DEFAULT NULL COMMENT '核销时间',
    `is_deleted`                      TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`                       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`                       BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`                       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`                       BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`)
);

-- =============================================
-- 活动数据
-- =============================================

-- ----- Event 1: 测试演唱会 1 (演唱会, 北京) -----
INSERT INTO `event` (`id`, `series_id`, `category_id`, `category_name_snapshot`, `venue_id`, `venue_name_snapshot`,
                     `city_id`, `city_name_snapshot`, `name`, `cover_url`, `min_price`, `max_price`,
                     `first_session_start_at`, `last_session_end_at`, `recommend_weight`, `status`)
VALUES (1, 1, 2, '流行', 1, '测试场馆', 1, '北京', '测试演唱会 1',
        'https://placehold.jp/600x800.png?text=Event1', 12800, 28000,
        '2026-05-01 19:30:00', '2026-05-01 22:00:00', 100, 0);
INSERT INTO `event_info` (`id`, `event_id`, `description`, `purchase_notice`, `admission_notice`)
VALUES (1, 1, '测试活动描述',
        '[
          {
            "id": 1,
            "name": "发票说明",
            "description": "演出开始前，去【订单详情页】提交发票申请。"
          }
        ]',
        '[
          {
            "id": 2,
            "name": "演出时长",
            "description": "约 90 分钟，具体以实际现场为准"
          }
        ]');
INSERT INTO `event_service_guarantee` (`id`, `event_id`, `service_guarantee_id`, `service_guarantee_option_id`)
VALUES (1, 1, 1, 1);
INSERT INTO `event_participant` (`id`, `event_id`, `participant_id`, `sort_order`)
VALUES (1, 1, 1, 1);
INSERT INTO `session` (`id`, `event_id`, `name`, `start_at`, `end_at`, `status`)
VALUES (1, 1, '2026-05-01 19:30', '2026-05-01 19:30:00', '2026-05-01 22:00:00', 1);
INSERT INTO `ticket_type` (`id`, `session_id`, `name`, `sale_price`, `order_limit`, `account_limit`, `sale_start_at`,
                           `sale_end_at`, `status`)
VALUES (1, 1, 'VIP 区', 28000, 4, 8, '2026-04-01 00:00:00', '2026-05-01 18:30:00', 1),
       (2, 1, '普通区', 12800, 4, 8, '2026-04-01 00:00:00', '2026-05-01 18:30:00', 1);
INSERT INTO `ticket_inventory` (`id`, `ticket_type_id`, `total_qty`, `locked_qty`, `sold_qty`)
VALUES (1, 1, 500, 0, 0),
       (2, 2, 2000, 0, 0);

-- ----- Event 2: 测试演唱会 2 (演唱会, 北京) -----
INSERT INTO `event` (`id`, `series_id`, `category_id`, `category_name_snapshot`, `venue_id`, `venue_name_snapshot`,
                     `city_id`, `city_name_snapshot`, `name`, `cover_url`, `min_price`, `max_price`,
                     `first_session_start_at`, `last_session_end_at`, `recommend_weight`, `status`)
VALUES (2, 1, 2, '流行', 1, '测试场馆', 1, '北京', '测试演唱会 2',
        'https://placehold.jp/600x800.png?text=Event2', 12800, 28000,
        '2026-05-15 19:30:00', '2026-05-15 22:00:00', 95, 0);
INSERT INTO `event_info` (`id`, `event_id`, `description`, `purchase_notice`, `admission_notice`)
VALUES (2, 2, '测试活动描述',
        '[
          {
            "id": 1,
            "name": "发票说明",
            "description": "演出开始前，去【订单详情页】提交发票申请。"
          }
        ]',
        '[
          {
            "id": 2,
            "name": "演出时长",
            "description": "约 90 分钟，具体以实际现场为准"
          }
        ]');
INSERT INTO `event_service_guarantee` (`id`, `event_id`, `service_guarantee_id`, `service_guarantee_option_id`)
VALUES (2, 2, 1, 1);
INSERT INTO `event_participant` (`id`, `event_id`, `participant_id`, `sort_order`)
VALUES (2, 2, 1, 1);
INSERT INTO `session` (`id`, `event_id`, `name`, `start_at`, `end_at`, `status`)
VALUES (2, 2, '2026-05-15 19:30', '2026-05-15 19:30:00', '2026-05-15 22:00:00', 1);
INSERT INTO `ticket_type` (`id`, `session_id`, `name`, `sale_price`, `order_limit`, `account_limit`, `sale_start_at`,
                           `sale_end_at`, `status`)
VALUES (3, 2, 'VIP 区', 28000, 4, 8, '2026-04-01 00:00:00', '2026-05-15 18:30:00', 1),
       (4, 2, '普通区', 12800, 4, 8, '2026-04-01 00:00:00', '2026-05-15 18:30:00', 1);
INSERT INTO `ticket_inventory` (`id`, `ticket_type_id`, `total_qty`, `locked_qty`, `sold_qty`)
VALUES (3, 3, 500, 0, 0),
       (4, 4, 2000, 0, 0);

-- ----- Event 3: 测试演唱会 3 (演唱会, 北京) -----
INSERT INTO `event` (`id`, `series_id`, `category_id`, `category_name_snapshot`, `venue_id`, `venue_name_snapshot`,
                     `city_id`, `city_name_snapshot`, `name`, `cover_url`, `min_price`, `max_price`,
                     `first_session_start_at`, `last_session_end_at`, `recommend_weight`, `status`)
VALUES (3, 1, 2, '流行', 1, '测试场馆', 1, '北京', '测试演唱会 3',
        'https://placehold.jp/600x800.png?text=Event3', 12800, 28000,
        '2026-05-30 19:30:00', '2026-05-30 22:00:00', 90, 0);
INSERT INTO `event_info` (`id`, `event_id`, `description`, `purchase_notice`, `admission_notice`)
VALUES (3, 3, '测试活动描述',
        '[
          {
            "id": 1,
            "name": "发票说明",
            "description": "演出开始前，去【订单详情页】提交发票申请。"
          }
        ]',
        '[
          {
            "id": 2,
            "name": "演出时长",
            "description": "约 90 分钟，具体以实际现场为准"
          }
        ]');
INSERT INTO `event_service_guarantee` (`id`, `event_id`, `service_guarantee_id`, `service_guarantee_option_id`)
VALUES (3, 3, 1, 1);
INSERT INTO `event_participant` (`id`, `event_id`, `participant_id`, `sort_order`)
VALUES (3, 3, 1, 1);
INSERT INTO `session` (`id`, `event_id`, `name`, `start_at`, `end_at`, `status`)
VALUES (3, 3, '2026-05-30 19:30', '2026-05-30 19:30:00', '2026-05-30 22:00:00', 1);
INSERT INTO `ticket_type` (`id`, `session_id`, `name`, `sale_price`, `order_limit`, `account_limit`, `sale_start_at`,
                           `sale_end_at`, `status`)
VALUES (5, 3, 'VIP 区', 28000, 4, 8, '2026-04-01 00:00:00', '2026-05-30 18:30:00', 1),
       (6, 3, '普通区', 12800, 4, 8, '2026-04-01 00:00:00', '2026-05-30 18:30:00', 1);
INSERT INTO `ticket_inventory` (`id`, `ticket_type_id`, `total_qty`, `locked_qty`, `sold_qty`)
VALUES (5, 5, 500, 0, 0),
       (6, 6, 2000, 0, 0);

-- ----- Event 4: 测试演唱会 4 (演唱会, 北京) -----
INSERT INTO `event` (`id`, `series_id`, `category_id`, `category_name_snapshot`, `venue_id`, `venue_name_snapshot`,
                     `city_id`, `city_name_snapshot`, `name`, `cover_url`, `min_price`, `max_price`,
                     `first_session_start_at`, `last_session_end_at`, `recommend_weight`, `status`)
VALUES (4, 1, 2, '流行', 1, '测试场馆', 1, '北京', '测试演唱会 4',
        'https://placehold.jp/600x800.png?text=Event4', 12800, 28000,
        '2026-06-01 19:30:00', '2026-06-01 22:00:00', 85, 0);
INSERT INTO `event_info` (`id`, `event_id`, `description`, `purchase_notice`, `admission_notice`)
VALUES (4, 4, '测试活动描述',
        '[
          {
            "id": 1,
            "name": "发票说明",
            "description": "演出开始前，去【订单详情页】提交发票申请。"
          }
        ]',
        '[
          {
            "id": 2,
            "name": "演出时长",
            "description": "约 90 分钟，具体以实际现场为准"
          }
        ]');
INSERT INTO `event_service_guarantee` (`id`, `event_id`, `service_guarantee_id`, `service_guarantee_option_id`)
VALUES (4, 4, 1, 1);
INSERT INTO `event_participant` (`id`, `event_id`, `participant_id`, `sort_order`)
VALUES (4, 4, 1, 1);
INSERT INTO `session` (`id`, `event_id`, `name`, `start_at`, `end_at`, `status`)
VALUES (4, 4, '2026-06-01 19:30', '2026-06-01 19:30:00', '2026-06-01 22:00:00', 1);
INSERT INTO `ticket_type` (`id`, `session_id`, `name`, `sale_price`, `order_limit`, `account_limit`, `sale_start_at`,
                           `sale_end_at`, `status`)
VALUES (7, 4, 'VIP 区', 28000, 4, 8, '2026-04-01 00:00:00', '2026-06-01 18:30:00', 1),
       (8, 4, '普通区', 12800, 4, 8, '2026-04-01 00:00:00', '2026-06-01 18:30:00', 1);
INSERT INTO `ticket_inventory` (`id`, `ticket_type_id`, `total_qty`, `locked_qty`, `sold_qty`)
VALUES (7, 7, 500, 0, 0),
       (8, 8, 2000, 0, 0);

-- ----- Event 5: 测试演唱会 5 (演唱会, 北京) -----
INSERT INTO `event` (`id`, `series_id`, `category_id`, `category_name_snapshot`, `venue_id`, `venue_name_snapshot`,
                     `city_id`, `city_name_snapshot`, `name`, `cover_url`, `min_price`, `max_price`,
                     `first_session_start_at`, `last_session_end_at`, `recommend_weight`, `status`)
VALUES (5, 1, 2, '流行', 1, '测试场馆', 1, '北京', '测试演唱会 5',
        'https://placehold.jp/600x800.png?text=Event5', 12800, 28000,
        '2026-06-15 19:30:00', '2026-06-15 22:00:00', 80, 0);
INSERT INTO `event_info` (`id`, `event_id`, `description`, `purchase_notice`, `admission_notice`)
VALUES (5, 5, '测试活动描述',
        '[
          {
            "id": 1,
            "name": "发票说明",
            "description": "演出开始前，去【订单详情页】提交发票申请。"
          }
        ]',
        '[
          {
            "id": 2,
            "name": "演出时长",
            "description": "约 90 分钟，具体以实际现场为准"
          }
        ]');
INSERT INTO `event_service_guarantee` (`id`, `event_id`, `service_guarantee_id`, `service_guarantee_option_id`)
VALUES (5, 5, 1, 1);
INSERT INTO `event_participant` (`id`, `event_id`, `participant_id`, `sort_order`)
VALUES (5, 5, 1, 1);
INSERT INTO `session` (`id`, `event_id`, `name`, `start_at`, `end_at`, `status`)
VALUES (5, 5, '2026-06-15 19:30', '2026-06-15 19:30:00', '2026-06-15 22:00:00', 1);
INSERT INTO `ticket_type` (`id`, `session_id`, `name`, `sale_price`, `order_limit`, `account_limit`, `sale_start_at`,
                           `sale_end_at`, `status`)
VALUES (9, 5, 'VIP 区', 28000, 4, 8, '2026-04-01 00:00:00', '2026-06-15 18:30:00', 1),
       (10, 5, '普通区', 12800, 4, 8, '2026-04-01 00:00:00', '2026-06-15 18:30:00', 1);
INSERT INTO `ticket_inventory` (`id`, `ticket_type_id`, `total_qty`, `locked_qty`, `sold_qty`)
VALUES (9, 9, 500, 0, 0),
       (10, 10, 2000, 0, 0);

-- ----- Event 6: 测试演唱会 6 (演唱会, 北京) -----
INSERT INTO `event` (`id`, `series_id`, `category_id`, `category_name_snapshot`, `venue_id`, `venue_name_snapshot`,
                     `city_id`, `city_name_snapshot`, `name`, `cover_url`, `min_price`, `max_price`,
                     `first_session_start_at`, `last_session_end_at`, `recommend_weight`, `status`)
VALUES (6, 1, 2, '流行', 1, '测试场馆', 1, '北京', '测试演唱会 6',
        'https://placehold.jp/600x800.png?text=Event6', 12800, 28000,
        '2026-06-30 19:30:00', '2026-06-30 22:00:00', 75, 0);
INSERT INTO `event_info` (`id`, `event_id`, `description`, `purchase_notice`, `admission_notice`)
VALUES (6, 6, '测试活动描述',
        '[
          {
            "id": 1,
            "name": "发票说明",
            "description": "演出开始前，去【订单详情页】提交发票申请。"
          }
        ]',
        '[
          {
            "id": 2,
            "name": "演出时长",
            "description": "约 90 分钟，具体以实际现场为准"
          }
        ]');
INSERT INTO `event_service_guarantee` (`id`, `event_id`, `service_guarantee_id`, `service_guarantee_option_id`)
VALUES (6, 6, 1, 1);
INSERT INTO `event_participant` (`id`, `event_id`, `participant_id`, `sort_order`)
VALUES (6, 6, 1, 1);
INSERT INTO `session` (`id`, `event_id`, `name`, `start_at`, `end_at`, `status`)
VALUES (6, 6, '2026-06-30 19:30', '2026-06-30 19:30:00', '2026-06-30 22:00:00', 1);
INSERT INTO `ticket_type` (`id`, `session_id`, `name`, `sale_price`, `order_limit`, `account_limit`, `sale_start_at`,
                           `sale_end_at`, `status`)
VALUES (11, 6, 'VIP 区', 28000, 4, 8, '2026-04-01 00:00:00', '2026-06-30 18:30:00', 1),
       (12, 6, '普通区', 12800, 4, 8, '2026-04-01 00:00:00', '2026-06-30 18:30:00', 1);
INSERT INTO `ticket_inventory` (`id`, `ticket_type_id`, `total_qty`, `locked_qty`, `sold_qty`)
VALUES (11, 11, 500, 0, 0),
       (12, 12, 2000, 0, 0);

-- ----- Event 7: 测试话剧 1 (话剧歌剧, 北京) -----
INSERT INTO `event` (`id`, `series_id`, `category_id`, `category_name_snapshot`, `venue_id`, `venue_name_snapshot`,
                     `city_id`, `city_name_snapshot`, `name`, `cover_url`, `min_price`, `max_price`,
                     `first_session_start_at`, `last_session_end_at`, `recommend_weight`, `status`)
VALUES (7, 2, 5, '话剧', 1, '测试场馆', 1, '北京', '测试话剧 1',
        'https://placehold.jp/600x800.png?text=Event7', 12800, 28000,
        '2026-07-01 19:30:00', '2026-07-01 22:00:00', 70, 0);
INSERT INTO `event_info` (`id`, `event_id`, `description`, `purchase_notice`, `admission_notice`)
VALUES (7, 7, '测试活动描述',
        '[
          {
            "id": 1,
            "name": "发票说明",
            "description": "演出开始前，去【订单详情页】提交发票申请。"
          }
        ]',
        '[
          {
            "id": 2,
            "name": "演出时长",
            "description": "约 90 分钟，具体以实际现场为准"
          }
        ]');
INSERT INTO `event_service_guarantee` (`id`, `event_id`, `service_guarantee_id`, `service_guarantee_option_id`)
VALUES (7, 7, 1, 1);
INSERT INTO `event_participant` (`id`, `event_id`, `participant_id`, `sort_order`)
VALUES (7, 7, 1, 1);
INSERT INTO `session` (`id`, `event_id`, `name`, `start_at`, `end_at`, `status`)
VALUES (7, 7, '2026-07-01 19:30', '2026-07-01 19:30:00', '2026-07-01 22:00:00', 1);
INSERT INTO `ticket_type` (`id`, `session_id`, `name`, `sale_price`, `order_limit`, `account_limit`, `sale_start_at`,
                           `sale_end_at`, `status`)
VALUES (13, 7, 'VIP 区', 28000, 4, 8, '2026-04-01 00:00:00', '2026-07-01 18:30:00', 1),
       (14, 7, '普通区', 12800, 4, 8, '2026-04-01 00:00:00', '2026-07-01 18:30:00', 1);
INSERT INTO `ticket_inventory` (`id`, `ticket_type_id`, `total_qty`, `locked_qty`, `sold_qty`)
VALUES (13, 13, 500, 0, 0),
       (14, 14, 2000, 0, 0);

-- ----- Event 8: 测试话剧 2 (话剧歌剧, 北京) -----
INSERT INTO `event` (`id`, `series_id`, `category_id`, `category_name_snapshot`, `venue_id`, `venue_name_snapshot`,
                     `city_id`, `city_name_snapshot`, `name`, `cover_url`, `min_price`, `max_price`,
                     `first_session_start_at`, `last_session_end_at`, `recommend_weight`, `status`)
VALUES (8, 2, 5, '话剧', 1, '测试场馆', 1, '北京', '测试话剧 2',
        'https://placehold.jp/600x800.png?text=Event8', 12800, 28000,
        '2026-07-15 19:30:00', '2026-07-15 22:00:00', 65, 0);
INSERT INTO `event_info` (`id`, `event_id`, `description`, `purchase_notice`, `admission_notice`)
VALUES (8, 8, '测试活动描述',
        '[
          {
            "id": 1,
            "name": "发票说明",
            "description": "演出开始前，去【订单详情页】提交发票申请。"
          }
        ]',
        '[
          {
            "id": 2,
            "name": "演出时长",
            "description": "约 90 分钟，具体以实际现场为准"
          }
        ]');
INSERT INTO `event_service_guarantee` (`id`, `event_id`, `service_guarantee_id`, `service_guarantee_option_id`)
VALUES (8, 8, 1, 1);
INSERT INTO `event_participant` (`id`, `event_id`, `participant_id`, `sort_order`)
VALUES (8, 8, 1, 1);
INSERT INTO `session` (`id`, `event_id`, `name`, `start_at`, `end_at`, `status`)
VALUES (8, 8, '2026-07-15 19:30', '2026-07-15 19:30:00', '2026-07-15 22:00:00', 1);
INSERT INTO `ticket_type` (`id`, `session_id`, `name`, `sale_price`, `order_limit`, `account_limit`, `sale_start_at`,
                           `sale_end_at`, `status`)
VALUES (15, 8, 'VIP 区', 28000, 4, 8, '2026-04-01 00:00:00', '2026-07-15 18:30:00', 1),
       (16, 8, '普通区', 12800, 4, 8, '2026-04-01 00:00:00', '2026-07-15 18:30:00', 1);
INSERT INTO `ticket_inventory` (`id`, `ticket_type_id`, `total_qty`, `locked_qty`, `sold_qty`)
VALUES (15, 15, 500, 0, 0),
       (16, 16, 2000, 0, 0);

-- ----- Event 9: 测试体育赛事 1 (体育, 北京) -----
INSERT INTO `event` (`id`, `series_id`, `category_id`, `category_name_snapshot`, `venue_id`, `venue_name_snapshot`,
                     `city_id`, `city_name_snapshot`, `name`, `cover_url`, `min_price`, `max_price`,
                     `first_session_start_at`, `last_session_end_at`, `recommend_weight`, `status`)
VALUES (9, 3, 8, '足球', 1, '测试场馆', 1, '北京', '测试体育赛事 1',
        'https://placehold.jp/600x800.png?text=Event9', 12800, 28000,
        '2026-07-30 19:30:00', '2026-07-30 22:00:00', 60, 0);
INSERT INTO `event_info` (`id`, `event_id`, `description`, `purchase_notice`, `admission_notice`)
VALUES (9, 9, '测试活动描述',
        '[
          {
            "id": 1,
            "name": "发票说明",
            "description": "演出开始前，去【订单详情页】提交发票申请。"
          }
        ]',
        '[
          {
            "id": 2,
            "name": "演出时长",
            "description": "约 90 分钟，具体以实际现场为准"
          }
        ]');
INSERT INTO `event_service_guarantee` (`id`, `event_id`, `service_guarantee_id`, `service_guarantee_option_id`)
VALUES (9, 9, 1, 1);
INSERT INTO `event_participant` (`id`, `event_id`, `participant_id`, `sort_order`)
VALUES (9, 9, 1, 1);
INSERT INTO `session` (`id`, `event_id`, `name`, `start_at`, `end_at`, `status`)
VALUES (9, 9, '2026-07-30 19:30', '2026-07-30 19:30:00', '2026-07-30 22:00:00', 1);
INSERT INTO `ticket_type` (`id`, `session_id`, `name`, `sale_price`, `order_limit`, `account_limit`, `sale_start_at`,
                           `sale_end_at`, `status`)
VALUES (17, 9, 'VIP 区', 28000, 4, 8, '2026-04-01 00:00:00', '2026-07-30 18:30:00', 1),
       (18, 9, '普通区', 12800, 4, 8, '2026-04-01 00:00:00', '2026-07-30 18:30:00', 1);
INSERT INTO `ticket_inventory` (`id`, `ticket_type_id`, `total_qty`, `locked_qty`, `sold_qty`)
VALUES (17, 17, 500, 0, 0),
       (18, 18, 2000, 0, 0);

-- ----- Event 10: 测试体育赛事 2 (体育, 北京) -----
INSERT INTO `event` (`id`, `series_id`, `category_id`, `category_name_snapshot`, `venue_id`, `venue_name_snapshot`,
                     `city_id`, `city_name_snapshot`, `name`, `cover_url`, `min_price`, `max_price`,
                     `first_session_start_at`, `last_session_end_at`, `recommend_weight`, `status`)
VALUES (10, 3, 8, '足球', 1, '测试场馆', 1, '北京', '测试体育赛事 2',
        'https://placehold.jp/600x800.png?text=Event10', 12800, 28000,
        '2026-08-01 19:30:00', '2026-08-01 22:00:00', 55, 0);
INSERT INTO `event_info` (`id`, `event_id`, `description`, `purchase_notice`, `admission_notice`)
VALUES (10, 10, '测试活动描述',
        '[
          {
            "id": 1,
            "name": "发票说明",
            "description": "演出开始前，去【订单详情页】提交发票申请。"
          }
        ]',
        '[
          {
            "id": 2,
            "name": "演出时长",
            "description": "约 90 分钟，具体以实际现场为准"
          }
        ]');
INSERT INTO `event_service_guarantee` (`id`, `event_id`, `service_guarantee_id`, `service_guarantee_option_id`)
VALUES (10, 10, 1, 1);
INSERT INTO `event_participant` (`id`, `event_id`, `participant_id`, `sort_order`)
VALUES (10, 10, 1, 1);
INSERT INTO `session` (`id`, `event_id`, `name`, `start_at`, `end_at`, `status`)
VALUES (10, 10, '2026-08-01 19:30', '2026-08-01 19:30:00', '2026-08-01 22:00:00', 1);
INSERT INTO `ticket_type` (`id`, `session_id`, `name`, `sale_price`, `order_limit`, `account_limit`, `sale_start_at`,
                           `sale_end_at`, `status`)
VALUES (19, 10, 'VIP 区', 28000, 4, 8, '2026-04-01 00:00:00', '2026-08-01 18:30:00', 1),
       (20, 10, '普通区', 12800, 4, 8, '2026-04-01 00:00:00', '2026-08-01 18:30:00', 1);
INSERT INTO `ticket_inventory` (`id`, `ticket_type_id`, `total_qty`, `locked_qty`, `sold_qty`)
VALUES (19, 19, 500, 0, 0),
       (20, 20, 2000, 0, 0);

-- ----- Event 11: 测试儿童剧 1 (儿童亲子, 北京) -----
INSERT INTO `event` (`id`, `series_id`, `category_id`, `category_name_snapshot`, `venue_id`, `venue_name_snapshot`,
                     `city_id`, `city_name_snapshot`, `name`, `cover_url`, `min_price`, `max_price`,
                     `first_session_start_at`, `last_session_end_at`, `recommend_weight`, `status`)
VALUES (11, 4, 11, '儿童剧', 1, '测试场馆', 1, '北京', '测试儿童剧 1',
        'https://placehold.jp/600x800.png?text=Event11', 12800, 28000,
        '2026-08-15 19:30:00', '2026-08-15 22:00:00', 50, 0);
INSERT INTO `event_info` (`id`, `event_id`, `description`, `purchase_notice`, `admission_notice`)
VALUES (11, 11, '测试活动描述',
        '[
          {
            "id": 1,
            "name": "发票说明",
            "description": "演出开始前，去【订单详情页】提交发票申请。"
          }
        ]',
        '[
          {
            "id": 2,
            "name": "演出时长",
            "description": "约 90 分钟，具体以实际现场为准"
          }
        ]');
INSERT INTO `event_service_guarantee` (`id`, `event_id`, `service_guarantee_id`, `service_guarantee_option_id`)
VALUES (11, 11, 1, 1);
INSERT INTO `event_participant` (`id`, `event_id`, `participant_id`, `sort_order`)
VALUES (11, 11, 1, 1);
INSERT INTO `session` (`id`, `event_id`, `name`, `start_at`, `end_at`, `status`)
VALUES (11, 11, '2026-08-15 19:30', '2026-08-15 19:30:00', '2026-08-15 22:00:00', 1);
INSERT INTO `ticket_type` (`id`, `session_id`, `name`, `sale_price`, `order_limit`, `account_limit`, `sale_start_at`,
                           `sale_end_at`, `status`)
VALUES (21, 11, 'VIP 区', 28000, 4, 8, '2026-04-01 00:00:00', '2026-08-15 18:30:00', 1),
       (22, 11, '普通区', 12800, 4, 8, '2026-04-01 00:00:00', '2026-08-15 18:30:00', 1);
INSERT INTO `ticket_inventory` (`id`, `ticket_type_id`, `total_qty`, `locked_qty`, `sold_qty`)
VALUES (21, 21, 500, 0, 0),
       (22, 22, 2000, 0, 0);

-- ----- Event 12: 测试儿童剧 2 (儿童亲子, 北京) -----
INSERT INTO `event` (`id`, `series_id`, `category_id`, `category_name_snapshot`, `venue_id`, `venue_name_snapshot`,
                     `city_id`, `city_name_snapshot`, `name`, `cover_url`, `min_price`, `max_price`,
                     `first_session_start_at`, `last_session_end_at`, `recommend_weight`, `status`)
VALUES (12, 4, 11, '儿童剧', 1, '测试场馆', 1, '北京', '测试儿童剧 2',
        'https://placehold.jp/600x800.png?text=Event12', 12800, 28000,
        '2026-08-30 19:30:00', '2026-08-30 22:00:00', 45, 0);
INSERT INTO `event_info` (`id`, `event_id`, `description`, `purchase_notice`, `admission_notice`)
VALUES (12, 12, '测试活动描述',
        '[
          {
            "id": 1,
            "name": "发票说明",
            "description": "演出开始前，去【订单详情页】提交发票申请。"
          }
        ]',
        '[
          {
            "id": 2,
            "name": "演出时长",
            "description": "约 90 分钟，具体以实际现场为准"
          }
        ]');
INSERT INTO `event_service_guarantee` (`id`, `event_id`, `service_guarantee_id`, `service_guarantee_option_id`)
VALUES (12, 12, 1, 1);
INSERT INTO `event_participant` (`id`, `event_id`, `participant_id`, `sort_order`)
VALUES (12, 12, 1, 1);
INSERT INTO `session` (`id`, `event_id`, `name`, `start_at`, `end_at`, `status`)
VALUES (12, 12, '2026-08-30 19:30', '2026-08-30 19:30:00', '2026-08-30 22:00:00', 1);
INSERT INTO `ticket_type` (`id`, `session_id`, `name`, `sale_price`, `order_limit`, `account_limit`, `sale_start_at`,
                           `sale_end_at`, `status`)
VALUES (23, 12, 'VIP 区', 28000, 4, 8, '2026-04-01 00:00:00', '2026-08-30 18:30:00', 1),
       (24, 12, '普通区', 12800, 4, 8, '2026-04-01 00:00:00', '2026-08-30 18:30:00', 1);
INSERT INTO `ticket_inventory` (`id`, `ticket_type_id`, `total_qty`, `locked_qty`, `sold_qty`)
VALUES (23, 23, 500, 0, 0),
       (24, 24, 2000, 0, 0);

-- ----- 用户关注表 -----
CREATE TABLE `user_follow_event`
(
    `id`               BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `user_id`          BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '用户 ID',
    `event_id`         BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '活动 ID',
    `is_deleted`       TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`        BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`        BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_event` (`user_id`, `event_id`),
    KEY `idx_event_id` (`event_id`)
);

CREATE TABLE `user_follow_participant`
(
    `id`               BIGINT UNSIGNED  NOT NULL COMMENT '主键 ID',
    `user_id`          BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '用户 ID',
    `participant_id`   BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '艺人 ID',
    `is_deleted`       TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否，1 是',
    `create_at`        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`        BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '创建者 ID',
    `update_at`        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `update_by`        BIGINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '更新者 ID',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_participant` (`user_id`, `participant_id`),
    KEY `idx_participant_id` (`participant_id`)
);
