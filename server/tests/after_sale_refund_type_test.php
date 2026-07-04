<?php

require_once __DIR__ . '/../thinkphp/base.php';

defined('ROOT_PATH') || define('ROOT_PATH', __DIR__ . '/..');
\think\Container::get('app')->path(__DIR__ . '/../application/')->initialize();

use app\api\logic\AfterSaleLogic;
use app\common\model\AfterSale;
use app\common\model\Order;

function assert_same($expected, $actual, $message)
{
    if ($expected !== $actual) {
        throw new Exception($message . ' Expected ' . var_export($expected, true) . ', got ' . var_export($actual, true));
    }
}

assert_same(
    AfterSale::TYPE_ONLY_REFUND,
    AfterSaleLogic::normalizeRefundTypeForOrderStatus(AfterSale::TYPE_REFUND_RETURN, Order::STATUS_WAIT_DELIVERY),
    'unshipped orders should be forced to only-refund'
);

assert_same(
    AfterSale::TYPE_REFUND_RETURN,
    AfterSaleLogic::normalizeRefundTypeForOrderStatus(AfterSale::TYPE_REFUND_RETURN, Order::STATUS_WAIT_RECEIVE),
    'shipped orders should keep return-and-refund'
);

echo "after sale refund type tests passed\n";
