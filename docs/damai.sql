DROP DATABASE IF EXISTS `damai`;

CREATE DATABASE `damai` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `damai`;

-- 用户表
CREATE TABLE IF NOT EXISTS `user`
(
    `id`          BIGINT PRIMARY KEY COMMENT 'ID',
    `phone`       VARCHAR(255) DEFAULT NULL COMMENT '手机',
    `email`       VARCHAR(255) DEFAULT NULL COMMENT '邮箱',
    `nickname`    VARCHAR(255) DEFAULT NULL COMMENT '昵称',
    `avatar`      VARCHAR(255) DEFAULT NULL COMMENT '头像',
    `bio`         VARCHAR(255) DEFAULT NULL COMMENT '简介',
    `gender`      TINYINT      DEFAULT 0 COMMENT '性别: 0-未知, 1-男, 2-女',
    `birthday`    DATE         DEFAULT NULL COMMENT '生日',
    `background`  VARCHAR(255) DEFAULT NULL COMMENT '背景图',
    `status`      TINYINT      DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常',
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='用户表';

-- 用户收藏表
CREATE TABLE IF NOT EXISTS `user_favorite`
(
    `id`          BIGINT PRIMARY KEY COMMENT 'ID',
    `user_id`     BIGINT   DEFAULT NULL COMMENT '用户 ID',
    `project_id`  BIGINT   DEFAULT NULL COMMENT '演出 ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='用户收藏表';

-- 城市表
CREATE TABLE IF NOT EXISTS `city`
(
    `id`          BIGINT PRIMARY KEY COMMENT 'ID',
    `name`        VARCHAR(255) DEFAULT NULL COMMENT '城市名',
    `pinyin`      VARCHAR(255) DEFAULT NULL COMMENT '拼音',
    `is_hot`      TINYINT(1)   DEFAULT 0 COMMENT '热门: 0-否, 1-是',
    `sort_order`  INT          DEFAULT 0 COMMENT '排序',
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='城市表';

-- 分类表
CREATE TABLE IF NOT EXISTS `category`
(
    `id`          BIGINT PRIMARY KEY COMMENT 'ID',
    `parent_id`   BIGINT       DEFAULT NULL COMMENT '父 ID',
    `name`        VARCHAR(255) DEFAULT NULL COMMENT '分类名',
    `icon_url`    VARCHAR(255) DEFAULT NULL COMMENT '图标 URL',
    `sort_order`  INT          DEFAULT 0 COMMENT '排序',
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='分类表';

-- 场馆表
CREATE TABLE IF NOT EXISTS `venue`
(
    `id`          BIGINT PRIMARY KEY COMMENT 'ID',
    `city_id`     BIGINT         DEFAULT NULL COMMENT '城市 ID',
    `name`        VARCHAR(255)   DEFAULT NULL COMMENT '场馆名',
    `address`     VARCHAR(255)   DEFAULT NULL COMMENT '地址',
    `longitude`   DECIMAL(10, 7) DEFAULT NULL COMMENT '经度',
    `latitude`    DECIMAL(10, 7) DEFAULT NULL COMMENT '纬度',
    `create_time` DATETIME       DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='场馆表';

-- 艺人信息表
CREATE TABLE IF NOT EXISTS `performer`
(
    `id`          BIGINT PRIMARY KEY COMMENT 'ID',
    `name`        VARCHAR(255) DEFAULT NULL COMMENT '姓名',
    `avatar`      VARCHAR(255) DEFAULT NULL COMMENT '头像',
    `bio`         TEXT         DEFAULT NULL COMMENT '简介',
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='艺人信息表';

-- 演出主表
CREATE TABLE IF NOT EXISTS `project`
(
    `id`          BIGINT PRIMARY KEY COMMENT 'ID',
    `category_id` BIGINT   DEFAULT NULL COMMENT '分类 ID',
    `status`      TINYINT  DEFAULT 0 COMMENT '状态: 0-草稿, 1-下线, 2-上线',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='演出主表';

-- 演出城市表
CREATE TABLE IF NOT EXISTS `project_site`
(
    `id`              BIGINT PRIMARY KEY COMMENT 'ID',
    `project_id`      BIGINT         DEFAULT NULL COMMENT '演出 ID',
    `city_id`         BIGINT         DEFAULT NULL COMMENT '城市 ID',
    `venue_id`        BIGINT         DEFAULT NULL COMMENT '场馆 ID',
    `title`           VARCHAR(255)   DEFAULT NULL COMMENT '标题',
    `poster_url`      VARCHAR(255)   DEFAULT NULL COMMENT '海报',
    `min_price`       DECIMAL(10, 2) DEFAULT NULL COMMENT '最低价',
    `max_price`       DECIMAL(10, 2) DEFAULT NULL COMMENT '最高价',
    `sale_start_time` DATETIME       DEFAULT NULL COMMENT '开售时间',
    `sale_end_time`   DATETIME       DEFAULT NULL COMMENT '停售时间',
    `start_date`      DATETIME       DEFAULT NULL COMMENT '演出开始时间',
    `end_date`        DATETIME       DEFAULT NULL COMMENT '演出结束时间',
    `status`          TINYINT        DEFAULT 0 COMMENT '状态: 0-草稿, 1-预热, 2-在售, 3-售罄, 4-演出, 5-结束, 6-取消',
    `create_time`     DATETIME       DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='演出城市表';

-- 演出与艺人关联表
CREATE TABLE IF NOT EXISTS `project_performer`
(
    `id`              BIGINT PRIMARY KEY COMMENT 'ID',
    `project_site_id` BIGINT   DEFAULT NULL COMMENT '演出站点 ID',
    `performer_id`    BIGINT   DEFAULT NULL COMMENT '艺人 ID',
    `create_time`     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='演出艺人关联表';

-- 演出详情表
CREATE TABLE IF NOT EXISTS `project_detail`
(
    `id`                BIGINT PRIMARY KEY COMMENT 'ID',
    `project_site_id`   BIGINT   DEFAULT NULL COMMENT '关联演出城市 ID',
    `description`       TEXT     DEFAULT NULL COMMENT '演出详情',
    `service_terms`     JSON     DEFAULT NULL COMMENT '服务条款',
    `purchase_notice`   JSON     DEFAULT NULL COMMENT '购票须知',
    `attendance_notice` JSON     DEFAULT NULL COMMENT '观演须知',
    `create_time`       DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='演出详情表';

-- 演出场次表
CREATE TABLE IF NOT EXISTS `project_session`
(
    `id`              BIGINT PRIMARY KEY COMMENT 'ID',
    `project_site_id` BIGINT       DEFAULT NULL COMMENT '演出城市 ID',
    `session_time`    DATETIME     DEFAULT NULL COMMENT '开始时间',
    `title`           VARCHAR(255) DEFAULT NULL COMMENT '场次名称',
    `status`          TINYINT      DEFAULT 1 COMMENT '状态: 0-不可售, 1-可售',
    `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='演出场次表';

-- 票档模板表 (定义城市级别的票档)
CREATE TABLE IF NOT EXISTS `ticket_price_template`
(
    `id`              BIGINT PRIMARY KEY COMMENT 'ID',
    `project_site_id` BIGINT         DEFAULT NULL COMMENT '演出城市 ID',
    `price_name`      VARCHAR(100)   DEFAULT NULL COMMENT '票档名称',
    `price_value`     DECIMAL(10, 2) DEFAULT NULL COMMENT '价格',
    `sort_order`      INT            DEFAULT 0 COMMENT '排序',
    `create_time`     DATETIME       DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='票档模板表';

-- 票档库存表 (记录场次级别的库存)
CREATE TABLE IF NOT EXISTS `ticket_price`
(
    `id`              BIGINT PRIMARY KEY COMMENT 'ID',
    `session_id`      BIGINT     DEFAULT NULL COMMENT '场次 ID',
    `template_id`     BIGINT     DEFAULT NULL COMMENT '票档模板 ID',
    `stock`           INT        DEFAULT 0 COMMENT '当前库存',
    `total_stock`     INT        DEFAULT 0 COMMENT '总库存',
    `is_sold_out`     TINYINT(1) DEFAULT 0 COMMENT '是否售罄: 0-否, 1-是',
    `create_time`     DATETIME   DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='票档库存表';

-- 轮播图表
CREATE TABLE IF NOT EXISTS `banner`
(
    `id`              BIGINT PRIMARY KEY COMMENT 'ID',
    `city_id`         BIGINT       DEFAULT NULL COMMENT '城市 ID',
    `image_url`       VARCHAR(255) DEFAULT NULL COMMENT '图片链接',
    `project_site_id` BIGINT       DEFAULT NULL COMMENT '演出城市 ID',
    `sort_order`      INT          DEFAULT 0 COMMENT '排序',
    `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='轮播图表';

-- 推荐模块表
CREATE TABLE IF NOT EXISTS `recommend_block`
(
    `id`          BIGINT PRIMARY KEY COMMENT 'ID',
    `category_id` BIGINT   DEFAULT NULL COMMENT '分类 ID',
    `sort_order`  INT      DEFAULT 0 COMMENT '排序',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='推荐模块表';

-- 推荐模块与演出城市关联表
CREATE TABLE IF NOT EXISTS `recommend_project`
(
    `id`              BIGINT PRIMARY KEY COMMENT 'ID',
    `block_id`        BIGINT   DEFAULT NULL COMMENT '模块 ID',
    `project_site_id` BIGINT   DEFAULT NULL COMMENT '演出城市 ID',
    `sort_order`      INT      DEFAULT 0 COMMENT '排序',
    `create_time`     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='推荐模块与演出城市关联表';