ALTER TABLE `ls_freight`
  ADD COLUMN `undeliverable_region` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '不配送地区id' AFTER `remark`;
