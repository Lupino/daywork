export function prettyTime(timestamp) {
  var createdDate = new Date(timestamp);
  var distance = Math.round( ( +new Date() -timestamp ) / 6000 );
  var hours = ( '0' + createdDate.getHours() ).slice(-2);
  var minutes = ( '0' + createdDate.getMinutes() ).slice(-2);
  var month = ('0' + (createdDate.getMonth() + 1)).slice(-2);
  var date = ('0' + createdDate.getDate()).slice(-2);
  var year = createdDate.getFullYear();
  var string;
  if (distance < 1440) {
    string = [hours, minutes].join(':');
  } else if (distance < 2879) {
    string = '昨天';
  } else {
    string = [year, month, date].join('-');
  }
  return string;
}

const cities = {
  'xiamen': '厦门',
  'zhangzhou': '漳州',
  'quanzhou': '泉州'
}

export function getCityName(name) {
  return cities[name] || '不限'
}

export function generatePassword(length, special) {
  var iteration = 0;
  var password = '';
  var randomNumber;
  if(special == undefined){
      var special = false;
  }
  while(iteration < length){
    randomNumber = (Math.floor((Math.random() * 100)) % 94) + 33;
    if(!special){
      if ((randomNumber >=33) && (randomNumber <=47)) { continue; }
      if ((randomNumber >=58) && (randomNumber <=64)) { continue; }
      if ((randomNumber >=91) && (randomNumber <=96)) { continue; }
      if ((randomNumber >=123) && (randomNumber <=126)) { continue; }
    }
    iteration++;
    password += String.fromCharCode(randomNumber);
  }
  return password;
}

const units = {
  Daily: '天',
  Hourly: '小时',
  Timely: '次',
  Itemly: '件'
};

export function getUnit(unit) {
  return units[unit];
}
