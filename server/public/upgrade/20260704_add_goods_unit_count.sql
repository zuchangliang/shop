ALTER TABLE `ls_goods_item`
ADD COLUMN `unit_count` int(10) NULL DEFAULT 1 COMMENT '每份规格内含件数' AFTER `price`,
ADD COLUMN `unit_price` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '单件售价' AFTER `unit_count`,
ADD COLUMN `unit_cost_price` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '单件成本价' AFTER `cost_price`;

UPDATE `ls_goods_item`
SET `unit_count` = 1
WHERE `unit_count` IS NULL OR `unit_count` <= 0;

UPDATE `ls_goods_item`
SET `unit_price` = `price`
WHERE `unit_price` IS NULL OR `unit_price` <= 0;

UPDATE `ls_goods_item`
SET `unit_cost_price` = `cost_price`
WHERE `unit_cost_price` IS NULL OR `unit_cost_price` <= 0;

ALTER TABLE `ls_order_goods`
ADD COLUMN `unit_count` int(10) NULL DEFAULT 1 COMMENT '每份规格内含件数' AFTER `goods_num`,
ADD COLUMN `total_unit_num` int(10) NULL DEFAULT 0 COMMENT '实际库存扣减件数' AFTER `unit_count`;

UPDATE `ls_order_goods`
SET `unit_count` = 1
WHERE `unit_count` IS NULL OR `unit_count` <= 0;

UPDATE `ls_order_goods`
SET `total_unit_num` = `goods_num`
WHERE `total_unit_num` IS NULL OR `total_unit_num` <= 0;
