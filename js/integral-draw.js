Date.prototype.format = function(fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};
// 获取地址栏参数数据
function getLinkey(name) {
    var reg = new RegExp("(^|\\?|&)" + name + "=([^&]*)(\\s|&|$)", "i");
    if (reg.test(window.location.href)) return unescape(RegExp.$2.replace(/\+/g, " "));
    return "";
}
/**
 * 获取客户端用户信息
 * role = 1 //教师   2家长
 */
var userInfo = userInfo || {};
window.location.href = 'qtapp://api/userinfo/eyJwYWNrYWdlTmFtZSI6InlvdXI6Ly9wYWNrYWdlbmFtZSJ9';
/*************************/
// userInfo.accountId = 79656189;
// userInfo.userType = 1;
// userInfo.area = 'cs';
// userInfo.userId = 4150164;
// userInfo.apiVersion = '2.3.4';
// userInfo.schoolId = 414458;
// userInfo.session = $('#session').val();
/*************************/
function getAppUserInfo(content) {
    userInfo = content;
    userInfo.area = content.cityId;
    userInfo.userType = content.role;
    userInfo.apiVersion = '1.0';
    userInfo.session = $('#session').val();
    // userInfo.schoolId = '414458';//正式测试需要注释掉
    myApp.getNav();
    myApp.initViewSize();
    myApp.addEventForDOM();
    setTimeout(function() {
        var title = {
            navigationTitle: content.school
        };
        var titleStr = $.base64.encode(JSON.stringify(title));
        window.location.href = 'qtapp://api/update/' + titleStr;
    }, 500);
}
/**
 * ============================================================================================
 * 获取活动页面基本信息通过跳转url获取   ?userName=李明&coins=210&surplusTimes=20     moduledir
 * ============================================================================================
 */
var urlParams = $('#moduledir').val();
var urlParams = {
    userName: '李明',
    coins: '200',
    surplusTimes: '20'
};
var times = urlParams.surplusTimes; //可抽奖的次数
$('.user-info').text(urlParams.userName + '家长，你好，您当前的成长值为' + urlParams.coins);
$('.lottery-start .start').text('剩余' + times + '次').attr('data-times', times);
/**
 * =======================
 * 中奖名单|中奖记录切换
 * type = 1 是中奖名当
 * type = 2 中奖记录
 * =======================
 */
function getWinnersOrRecord(type) {
    var data = {
        areaAbb: userInfo.area, //cs
        userType: userInfo.userType, //1
        userId: userInfo.userId,
        type: type,
    };
    $.ajax({
        url: 'http://172.16.222.226:8080/site/activity/lottery/winners',
        type: 'get',
        contentType: 'application/json',
        dataType: 'json',
        data: data,
        success: function(res) {
            //  res = {
            //     "cmd": 0,
            //     "dt": 1472191048715,
            //     "msg": "成功",
            //     "operationTime": "2016-08-26 13:58:11",
            //     "state": 1,
            //     "winners": [{
            //         "dataUsage": 10,
            //         "dt": 1471980246000,
            //         "userName": "旺旺"
            //     }, {
            //         "dataUsage": 500,
            //         "dt": 1471980195000,
            //         "userName": "李晓明"
            //     }, {
            //         "dataUsage": 100,
            //         "dt": 1471080166200,
            //         "userName": "王二蛋"
            //     }, {
            //         "dataUsage": 50,
            //         "dt": 1471920166000,
            //         "userName": "李爽"
            //     }, {
            //         "dataUsage": 10,
            //         "dt": 1471910166000,
            //         "userName": "王敏"
            //     }]
            // };
            if (res.state == 1) {
                var tplDom = '';
                for (var i = 0; i < res.winners.length; i++) {
                    tplDom += '<li>' +
                        '<span class="user-name">' + res.winners[i].userName + '家长</span>' +
                        '<span class="date">' + new Date(res.winners[i].dt).format('yyyy-MM-dd') + '</span>' +
                        '<span class="user-get">' + res.winners[i].dataUsage + 'M</span>' +
                        '</li>';
                }
                $('.content').html(tplDom);
            }
        }
    });
}
// 拉取中奖名单
// getWinnersOrRecord(1);
$('.tab-container .j-tab').click(function() {
    var _this = $(this);
    _this.addClass('active').siblings().removeClass('active');
    if (_this.index() === 1) {
        console.info('我的中奖记录');
        $('.content2').show();
        $('.content1').hide();
        getWinnersOrRecord(2);
    } else {
        console.info('中奖名单');
        $('.content1').show();
        $('.content2').hide();
        getWinnersOrRecord(1);
    }
});




/**
 * 转盘控制
 * @type {Object}
 */
var drawData = ''; //同步回调拿到返回的数据  lotteryCode|lotteryFlow|lotteryMsg
var lottery = {
    index: 0, //当前转动到哪个位置
    count: 0, //总共有多少个位置
    timer: 0, //setTimeout的ID，用clearTimeout清除
    speed: 200, //初始转动速度
    times: 0, //转动次数
    cycle: 50, //转动基本次数：即至少需要转动多少次再进入抽奖环节
    prize: -1, //中奖位置
    custom: null, //用户自定义;
    init: function(id) {
        if ($("#" + id).find(".lottery-unit").length > 0) {
            $lottery = $("#" + id);
            $units = $lottery.find(".lottery-unit");
            this.obj = $lottery;
            this.count = $units.length;
            $lottery.find(".lottery-unit-" + this.index).children().addClass("active");
        }
    },
    getDrawIndex: function(index) {
        // var mappingFrontObj = {
        //     0: '10M流量',
        //     1: '50M流量',
        //     2: '100M流量',
        //     3: '200M流量',
        //     4: '谢谢参与',
        //     5: '500M流量',
        //     6: '1000M流量',
        //     7: '谢谢参与',
        // };
        // var mappingEndObj = {
        //     1: '1000',
        //     2: '500',
        //     3: '200',
        //     4: '100',
        //     5: '50',
        //     6: '10',
        //     7: '0',
        // };
        var mappingEndObj = {
            '1': 6,
            '2': 5,
            '3': 3,
            '4': 2,
            '5': 1,
            '6': 0,
            '7': 4, //4||7  谢谢参与
        };
        this.custom = mappingEndObj[index];
    },
    roll: function() {
        var index = this.index;
        var count = this.count;
        var lottery = this.obj;
        $(lottery).find(".lottery-unit-" + index).children().removeClass("active");
        index += 1;
        if (index > count - 1) {
            index = 0;
        }
        $(lottery).find(".lottery-unit-" + index).children().addClass("active");
        this.index = index;
        return false;
    },
    stop: function(index) {
        this.prize = index;
        return false;
    }
};
/**
 * [roll description]
 * @return {[type]} [旋转]
 */
function roll() {
    lottery.times += 1;
    lottery.roll();
    if (lottery.times > lottery.cycle + 10 && lottery.prize == lottery.index) {
        clearTimeout(lottery.timer);
        lottery.prize = -1;
        lottery.times = 0;
        click = false;
        // 转完了|
        // 停下来了|
        // 给个弹层|
        $('.toast').show().find('.bounced').css('top', document.body.scrollTop + 250);
        $('.toast .prize').html(drawData.lotteryFlow + 'M');
    } else {
        if (lottery.times < lottery.cycle) {
            lottery.speed -= 10;
        } else if (lottery.times == lottery.cycle) {
            // var index = Math.random() * (lottery.count) | 0;
            var index = lottery.custom;
            lottery.prize = index;
        } else {
            if (lottery.times > lottery.cycle + 10 && ((lottery.prize === 0 && lottery.index === 7) || lottery.prize === lottery.index + 1)) {
                lottery.speed += 110;
            } else {
                lottery.speed += 20;
            }
        }
        if (lottery.speed < 40) {
            lottery.speed = 40;
        }
        lottery.timer = setTimeout(roll, lottery.speed);
    }
    return false;
}
/**
 * [getDrawInfo description]
 * @return {[type]} [点击开始拉取中奖信息接口]
 */
function getDrawInfo() {
    var data = {
        areaAbb: userInfo.area, //cs
        userType: userInfo.userType, //1
        userId: userInfo.userId,
        surplusTimes: times, //3
        activityId: '' //可不传
    };
    // $.ajax({
    //     url: '/site/activity/lottery/lotteryornot',
    //     type: 'get',
    //     contentType: 'application/json',
    //     dataType: 'json',
    //     async: false, //同步
    //     data: JSON.stringify(data),
    //     success: function(res) {
    //         if (res.state == '1') {
    //             drawData = res;
    //             console.info('抽奖', res);
    //         }
    //     },
    //     error: function(res) {
    //         alert('服务器开小差了~');
    //     }
    // });

    var res = {"cmd":0,"dt":1472196503539,"lotteryCode":10,"lotteryFlow":0,"lotteryMsg":"成长值不够！","msg":"成功","operationTime":"2016-08-26 15:28:24","state":1};
    if (res.state == '1') {
        drawData = res;
        $('.lottery-start .start').attr(urlParams.surplusTimes - 1);
    }

}

// 拉取数据
var click = false;

function luckyDrawResulte() {
    var $trigger = $("#lottery .start");
    if (!click) {
        lottery.speed = 100;
        roll();
        click = true;
        var n = $trigger.attr('data-times');
        $trigger.attr('data-times', n - 1).text("剩余" + (parseInt(n) - 1) + "次");
    }
}
/**
 * [onload description]
 * @return {[type]} [description]
 */

// window.onload = function() {
// 初始化
lottery.init('lottery');
//事件触发
$("#lottery .start").click(function() {

    getDrawInfo(); //拉取抽奖接口
    drawData.lotteryCode = 6;
    lottery.getDrawIndex(drawData.lotteryCode);
    var _this = $(this);
    if (_this.attr('data-times') === '0') {
        alert('没有机会了');
        return false;
    }
    if (drawData.lotteryCode == 8) {
        alert(drawData.lotteryMsg);
        return false; //您今天的抽奖次数已用完，请明天再来！
    }
    if (drawData.lotteryCode == 9) {
        alert(drawData.lotteryMsg);
        return false; //非广东移动号码的异网无法参与抽奖
    }
    if (drawData.lotteryCode == 10) {
        alert(drawData.lotteryMsg);
        return false; //成长值不够！
    }
    luckyDrawResulte(); //开始转动
});
// };
