<?php

require_once __DIR__ . '/../application/api/logic/FreightLogic.php';
require_once __DIR__ . '/../application/admin/logic/GoodsLogic.php';
require_once __DIR__ . '/../application/common/logic/OrderGoodsLogic.php';

use app\admin\logic\GoodsLogic;
use app\api\logic\FreightLogic;
use app\common\logic\OrderGoodsLogic;

function assert_same($expected, $actual, $message)
{
    if ($expected !== $actual) {
        throw new Exception($message . ' Expected ' . var_export($expected, true) . ', got ' . var_export($actual, true));
    }
}

$pack_good = [
    'goods_num' => 2,
    'unit_count' => 5,
];

assert_same(10, FreightLogic::getActualGoodsNum($pack_good), 'freight count should use purchase quantity times unit count');
assert_same(10, OrderGoodsLogic::getStockChangeNum($pack_good), 'stock change should use purchase quantity times unit count');

$legacy_good = [
    'goods_num' => 2,
];

assert_same(2, FreightLogic::getActualGoodsNum($legacy_good), 'legacy freight count should default unit count to 1');
assert_same(2, OrderGoodsLogic::getStockChangeNum($legacy_good), 'legacy stock change should default unit count to 1');

$single_spec = [
    'spec_type' => 1,
    'one_unit_count' => 5,
    'one_unit_price' => 31,
    'one_unit_cost_price' => 20,
];
$empty_spec_lists = [];
GoodsLogic::normalizeUnitPost($single_spec, $empty_spec_lists);
assert_same('155.00', $single_spec['one_price'], 'single spec price should be unit price times unit count');
assert_same('100.00', $single_spec['one_cost_price'], 'single spec cost should be unit cost times unit count');

$multi_post = ['spec_type' => 2];
$multi_specs = [[
    'unit_count' => 3,
    'unit_price' => 33,
    'unit_cost_price' => 20,
]];
GoodsLogic::normalizeUnitPost($multi_post, $multi_specs);
assert_same('99.00', $multi_specs[0]['price'], 'multi spec price should be unit price times unit count');
assert_same('60.00', $multi_specs[0]['cost_price'], 'multi spec cost should be unit cost times unit count');

echo "goods unit count tests passed\n";
