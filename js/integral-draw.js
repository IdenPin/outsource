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
    // new Date(data[i].dt).format('MM-dd')
};
/**
 * 中奖名单|中奖记录切换
 */
function getUserInfo() {
    var data = {};
    $.ajax({
        url: '',
        type: 'get',
        contentType: 'application/json',
        dataType: 'json',
        // data: JSON.stringify(data),
        data: data,
        success: function(res) {
            if (res.rtnCode == '0000000') {
                var dataJson = res.bizData;

            }
        },
        error: function(res) {
            // alert('服务器开小差了~');
        }
    });
}
getUserInfo();
var $content1 = $('.content1');
var $content2 = $('.content2');
$('.tab-container .j-tab').click(function() {
    var _this = $(this);
    _this.addClass('active').siblings().removeClass('active');
    if (_this.index() === 1) {
        $content2.show();
        $content1.hide();
    } else {
        $content1.show();
        $content2.hide();
    }
});
var tpl1 = '';
var tpl2 = '';
for (var i = 0; i < 10; i++) {

    tpl1 += '<li>' +
        '<span class="user-name">张＊＊家长</span>' +
        '<span class="date">2016-11-11</span>' +
        '<span class="user-get">获得10M</span>' +
        '</li>';
    $content1.html(tpl1);
}
for (var j = 0; j < 2; j++) {
    tpl2 += '<li>' +
        '<span class="user-name">张＊＊家长</span>' +
        '<span class="date">2016-11-11</span>' +
        '<span class="user-get">获得10M</span>' +
        '</li>';
}
$('.user-info').text('李明家长，你好，您当前的成长值为220');
$('.lottery-start .start').text('剩余3次');
$content2.html(tpl2);









/**
 * 转盘控制
 * @type {Object}
 */
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
        this.getServerCustom();
        if ($("#" + id).find(".lottery-unit").length > 0) {
            $lottery = $("#" + id);
            $units = $lottery.find(".lottery-unit");
            this.obj = $lottery;
            this.count = $units.length;
            $lottery.find(".lottery-unit-" + this.index).children().addClass("active");
        }
    },
    getServerCustom: function() {
        var mappingObj = {
            0: '10M流量',
            1: '50M流量',
            2: '100M流量',
            3: '200M流量',
            4: '谢谢参与',
            5: '500M流量',
            6: '300M流量',
            7: '谢谢参与',
        };
        this.custom = 7;
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

function roll() {
    lottery.times += 1;
    lottery.roll();
    if (lottery.times > lottery.cycle + 10 && lottery.prize == lottery.index) {
        clearTimeout(lottery.timer);
        lottery.prize = -1;
        lottery.times = 0;
        click = false;
        // 转完了，停下来了
        $('.toast').show().find('.bounced').css('top', document.body.scrollTop + 250); //保持居中
        $('.toast').show().find('.bounced').css('top', document.body.scrollTop + 250); //保持居中
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
        // console.log(lottery.times + '^^^^^^' + lottery.speed + '^^^^^^^' + lottery.prize);
        lottery.timer = setTimeout(roll, lottery.speed);
    }
    return false;
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
window.onload = function() {
    // 初始化
    lottery.init('lottery');
    // 触发开始
    $("#lottery .start").click(function() {
        var _this = $(this);
        if (_this.attr('data-times') === '0') {
            alert('没有机会了');
            return false;
        }
        luckyDrawResulte();
    });
};
