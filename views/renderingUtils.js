/**
 * Created by Tuanguyen on 02/06/2016.
 */

module.exports = {
    calTimeAgo: function(nd) {
        var o = {
            second: 1000,
            minute: 60 * 1000,
            hour: 60 * 1000 * 60,
            day: 24 * 60 * 1000 * 60,
            week: 7 * 24 * 60 * 1000 * 60,
            month: 30 * 24 * 60 * 1000 * 60,
            year: 365 * 24 * 60 * 1000 * 60
        };
        var pl = function(v, n) {
            if (v === 'second') {
                v = "giây";
            }
            if (v === 'minute') {
                v = "phút";
            }
            if (v === 'hour') {
                v = "giờ";
            }
            if (v === 'day') {
                v = "ngày";
            }
            if (v === 'week') {
                v = "tuần";
            }
            if (v === 'month') {
                v = "tháng";
            }
            if (v === 'year') {
                v = "năm";
            }
            if (v === 'm') {  // < 1s
                v = "giây";
                n = 1;
            }
            return n + ' ' + v + ' trước';
        };
        var time = new Date().getTime() - new Date(nd).getTime();
        var ii;
        for (var i in o) {
            if (Math.round(time) < o[i]) {
                return pl(ii || 'm', Math.round(time / (o[ii] || 1)));
            }
            ii = i;
        }
        return pl(i, Math.round(time / o[i]));
    }
};