<?php

require_once __DIR__ . '/../application/api/logic/FreightLogic.php';

use app\api\logic\FreightLogic;

function assert_true($condition, $message)
{
    if (!$condition) {
        throw new Exception($message);
    }
}

function assert_same($expected, $actual, $message)
{
    if ($expected !== $actual) {
        throw new Exception($message . ' Expected ' . var_export($expected, true) . ', got ' . var_export($actual, true));
    }
}

$address = [
    'province_id' => 650000,
    'city_id' => 650100,
    'district_id' => 650102,
];

assert_true(FreightLogic::isAddressInRegion('650102', $address), 'district id should match a region list');
assert_true(FreightLogic::isAddressInRegion('650100', $address), 'city id should match a region list');
assert_true(FreightLogic::isAddressInRegion('650000', $address), 'province id should match a region list');
assert_true(!FreightLogic::isAddressInRegion('110000,120000', $address), 'unrelated region ids should not match');
assert_true(!FreightLogic::isAddressInRegion('', $address), 'empty region list should not match');

$freights = [
    ['id' => 1, 'region' => 'all', 'first_money' => 8],
    ['id' => 2, 'region' => '650000', 'first_money' => 25],
];

$matched = FreightLogic::matchFreightConfigByAddress($freights, $address);
assert_same(2, $matched['id'], 'specific region should win over national rule');

$matched = FreightLogic::matchFreightConfigByAddress([
    ['id' => 4, 'region' => '650000', 'first_money' => 30],
    ['id' => 5, 'region' => '650100', 'first_money' => 40],
    ['id' => 6, 'region' => '650102', 'first_money' => 50],
    ['id' => 7, 'region' => 'all', 'first_money' => 8],
], $address);
assert_same(6, $matched['id'], 'district rule should win over city and province rules');

$matched = FreightLogic::matchFreightConfigByAddress([
    ['id' => 3, 'region' => 'all', 'first_money' => 8],
], $address);
assert_same(3, $matched['id'], 'national rule should be used as fallback');

$templates = [
    ['id' => 10, 'undeliverable_region' => '110000'],
    ['id' => 11, 'undeliverable_region' => '650000'],
];

$matched = FreightLogic::matchUndeliverableTemplateByAddress($templates, $address);
assert_same(11, $matched['id'], 'undeliverable template should match by address province/city/district');

echo "freight delivery region tests passed\n";
