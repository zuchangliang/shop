<?php

require_once __DIR__ . '/../application/admin/logic/OrderLogic.php';

use app\admin\logic\OrderLogic;

function assert_same($expected, $actual, $message)
{
    if ($expected !== $actual) {
        throw new Exception($message . ' Expected ' . var_export($expected, true) . ', got ' . var_export($actual, true));
    }
}

$exportTitle = OrderLogic::getExportTitle();
$goodsInfoIndex = array_search('商品信息', $exportTitle, true);

assert_same('商品编码', $exportTitle[$goodsInfoIndex + 1] ?? null, 'goods code column should follow goods info');

$orderGoods = [
    [
        'goods_id' => 10,
        'goods_info' => json_encode(['goods_name' => '家庭抽纸', 'code' => 'PAPER-001'], JSON_UNESCAPED_UNICODE),
    ],
    [
        'goods_id' => 11,
        'goods_info' => json_encode(['goods_name' => '卷纸'], JSON_UNESCAPED_UNICODE),
    ],
    [
        'goods_id' => 12,
        'goods_info' => json_encode(['goods_name' => '厨房纸', 'goods_code' => 'KITCHEN-003'], JSON_UNESCAPED_UNICODE),
    ],
];

$goodsCodeMap = [
    10 => 'CURRENT-001',
    11 => 'ROLL-002',
    12 => 'CURRENT-003',
];

assert_same(
    'PAPER-001、ROLL-002、KITCHEN-003',
    OrderLogic::formatExportGoodsCodes($orderGoods, $goodsCodeMap),
    'goods codes should prefer order snapshot and fall back to goods table'
);

echo "order export goods code tests passed\n";
