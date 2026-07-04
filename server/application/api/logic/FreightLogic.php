<?php
// +----------------------------------------------------------------------
// | likeshop开源商城系统
// +----------------------------------------------------------------------
// | 欢迎阅读学习系统程序代码，建议反馈是我们前进的动力
// | gitee下载：https://gitee.com/likeshop_gitee
// | github下载：https://github.com/likeshop-github
// | 访问官网：https://www.likeshop.cn
// | 访问社区：https://home.likeshop.cn
// | 访问手册：http://doc.likeshop.cn
// | 微信公众号：likeshop技术社区
// | likeshop系列产品在gitee、github等公开渠道开源版本可免费商用，未经许可不能去除前后端官方版权标识
// |  likeshop系列产品收费版本务必购买商业授权，购买去版权授权后，方可去除前后端官方版权标识
// | 禁止对系统程序代码以任何目的，任何形式的再发布
// | likeshop团队版权所有并拥有最终解释权
// +----------------------------------------------------------------------
// | author: likeshop.cn.team
// +----------------------------------------------------------------------

namespace app\api\logic;

use app\common\model\Freight;
use think\Db;
use think\Exception;

/**
 * 运费逻辑
 * Class FreightLogic
 * @package app\api\logic
 */
class FreightLogic
{

    /**
     * User: 意象信息科技 mjf
     * Desc: 计算运费
     * @param $goods
     * @param $user_address
     * @return float|int
     */
    public static function calculateFreight($goods, $user_address)
    {
        $shipping_price = 0;
        $template_list = [];

        if (empty($user_address)){
            return $shipping_price;
        }

        self::checkDeliverable($goods, $user_address);

        foreach ($goods as $good){
            //统一邮费
            if ($good['free_shipping_type'] == 2){
                $shipping_price += round($good['free_shipping'] * self::getActualGoodsNum($good), 2);
            }

            //指定运费模板
            if ($good['free_shipping_type'] == 3 && $good['free_shipping_template_id'] > 0){
                $template_list[$good['free_shipping_template_id']][] = $good;
            }
        }

        foreach ($template_list as $template_id => $template_goods) {
            $temp = [];
            $temp['template_id'] = $template_id;
            $temp['total_volume'] = 0;
            $temp['total_weight'] = 0;
            $temp['goods_num'] = 0;
            foreach ($template_goods as $template_good) {
                $temp['total_volume'] += $template_good['volume'] * $template_good['goods_num'];
                $temp['total_weight'] += $template_good['weight'] * $template_good['goods_num'];
                $temp['goods_num'] += self::getActualGoodsNum($template_good);
            }
            $shipping_price += self::calculate($temp, $user_address);
        }

        return $shipping_price < 0 ? 0 : $shipping_price;
    }

    /**
     * Desc: 获取运费计件数量，购买份数 * 规格内含件数
     * @param $good
     * @return int
     */
    public static function getActualGoodsNum($good)
    {
        if (isset($good['total_unit_num']) && intval($good['total_unit_num']) > 0) {
            return intval($good['total_unit_num']);
        }

        $goods_num = isset($good['goods_num']) ? intval($good['goods_num']) : 0;
        $unit_count = isset($good['unit_count']) ? intval($good['unit_count']) : 1;
        $unit_count = $unit_count > 0 ? $unit_count : 1;

        return $goods_num * $unit_count;
    }


    /**
     * User: 意象信息科技 mjf
     * Desc: 计算运费
     * @param $data
     * @param $user_address
     * @return float|int
     */
    public static function calculate($data, $user_address)
    {
        $shipping_price = 0;

        $freight = FreightLogic::getFreightsByAddress($data['template_id'], $user_address);

        if (empty($freight)){
            return $shipping_price;
        }
        $unit = 0;
        //按重量计算
        if ($freight['charge_way'] == Freight::CHARGE_WAY_WEIGHT){
            $unit = $data['total_weight'];
        }

        //按件数计算
        if ($freight['charge_way'] == Freight::CHARGE_WAY_PIECE){
            $unit = $data['goods_num'];
        }

        //按体积计算
        if ($freight['charge_way'] == Freight::CHARGE_WAY_VOLUME){
            $unit = $data['total_volume'];
        }

        if($unit > $freight['first_unit'] && $freight['continue_unit'] > 0){
            $left = ceil(($unit - $freight['first_unit']) / $freight['continue_unit']);//取整
            return $freight['first_money'] + $left * $freight['continue_money'];
        }else{
            return $freight['first_money'];
        }
    }



    /**
     * User: 意象信息科技 mjf
     * Desc: 通过用户地址获取运费模板
     * @param $address
     */
    public static function getFreightsByAddress($template_id, $address)
    {
        $freights = Db::name('freight')->alias('f')
            ->join('freight_config c', 'c.freight_id = f.id')
            ->where('f.id', $template_id)
            ->order(['f.id' => 'desc', 'c.id' => 'desc'])
            ->select();

        return self::matchFreightConfigByAddress($freights, $address);
    }

    /**
     * Desc: 验证指定运费模板商品是否支持配送到收货地址
     * @param $goods
     * @param $user_address
     * @throws Exception
     */
    public static function checkDeliverable($goods, $user_address)
    {
        if (empty($goods) || empty($user_address)) {
            return true;
        }

        $template_ids = [];
        foreach ($goods as $good) {
            if (
                isset($good['free_shipping_type'], $good['free_shipping_template_id']) &&
                $good['free_shipping_type'] == 3 &&
                $good['free_shipping_template_id'] > 0
            ) {
                $template_ids[] = $good['free_shipping_template_id'];
            }
        }

        $template_ids = array_unique($template_ids);
        if (empty($template_ids)) {
            return true;
        }

        $templates = Db::name('freight')
            ->field('id,name,undeliverable_region')
            ->where('id', 'in', $template_ids)
            ->select();

        $template = self::matchUndeliverableTemplateByAddress($templates, $user_address);
        if (!empty($template)) {
            throw new Exception('该收货地区暂不支持配送');
        }

        return true;
    }

    /**
     * Desc: 地址是否命中地区列表
     * @param $region
     * @param $address
     * @return bool
     */
    public static function isAddressInRegion($region, $address)
    {
        return self::getRegionMatchPriority($region, $address) >= 0;
    }

    /**
     * Desc: 获取地区匹配优先级，区县 > 城市 > 省份 > 全国
     * @param $region
     * @param $address
     * @return int
     */
    private static function getRegionMatchPriority($region, $address)
    {
        if (empty($region) || empty($address)) {
            return -1;
        }

        $region = trim((string)$region);
        if ($region === '') {
            return -1;
        }

        if ($region === 'all') {
            return 0;
        }

        $region_ids = array_map('trim', explode(',', $region));
        $region_ids = array_filter($region_ids, function ($id) {
            return $id !== '';
        });

        $address_ids = [
            'district_id' => 3,
            'city_id' => 2,
            'province_id' => 1,
        ];

        foreach ($address_ids as $field => $priority) {
            $id = isset($address[$field]) ? (string)$address[$field] : '';
            if ($id !== '' && in_array($id, $region_ids, true)) {
                return $priority;
            }
        }

        return -1;
    }

    /**
     * Desc: 从运费配置列表中匹配地址对应配置
     * @param $freights
     * @param $address
     * @return array|mixed
     */
    public static function matchFreightConfigByAddress($freights, $address)
    {
        $national_freight = [];
        $best_freight = [];
        $best_priority = 0;

        foreach ($freights as $freight) {
            $priority = self::getRegionMatchPriority($freight['region'] ?? '', $address);

            if ($priority === 0) {
                $national_freight = $freight;
                continue;
            }

            if ($priority > $best_priority) {
                $best_priority = $priority;
                $best_freight = $freight;
            }
        }

        if (!empty($best_freight)) {
            return $best_freight;
        }

        //会员的省市区id在商家的运费模板(指定地区)中找不到,查一下商家的全国运费模板
        return $national_freight;
    }

    /**
     * Desc: 从运费模板列表中匹配禁配模板
     * @param $templates
     * @param $address
     * @return array|mixed
     */
    public static function matchUndeliverableTemplateByAddress($templates, $address)
    {
        foreach ($templates as $template) {
            if (self::isAddressInRegion($template['undeliverable_region'] ?? '', $address)) {
                return $template;
            }
        }

        return [];
    }

    /**
     * User: 意象信息科技 mjf
     * Desc: 模板中指定地区id是否存在
     * @param $freights
     * @param $region_id
     * @return bool|mixed
     */
    public static function isExistRegionId($freights, $region_id)
    {
        foreach ($freights as $freight) {
            $region_ids = explode(',', $freight['region']);
            if (in_array($region_id, $region_ids)) {
                return $freight;
            }
        }
        return false;
    }
}
