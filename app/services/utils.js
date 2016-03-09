const units = {
  Daily: '天',
  Hourly: '小时',
  Timely: '次',
  Itemly: '件'
};

export function getUnit(unit) {
  return units[unit];
}
