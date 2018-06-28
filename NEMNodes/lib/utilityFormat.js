const { NetworkType, Deadline } = require('nem2-sdk');

const formatNetworkType = function (networkType) {
    var type;
    Object.keys(NetworkType).some(function (k) {
        if (NetworkType[k] === networkType) {
            type = k;
            return true;
        }
    });
    return type ? type : networkType;
}
const formatTime = function (timeInMiliseconds) {
    const d = new Date(timeInMiliseconds + (Deadline.timestampNemesisBlock * 1000));
    return d.getFullYear() + "-" +
        ("00" + (d.getMonth() + 1)).slice(-2) + "-" +
        ("00" + d.getDate()).slice(-2) + "T" +
        ("00" + d.getHours()).slice(-2) + ":" +
        ("00" + d.getMinutes()).slice(-2) + ":" +
        ("00" + d.getSeconds()).slice(-2) + "." +
        ("00" + d.getMilliseconds()).slice(-3);

}

module.exports = {
    formatNetworkType: formatNetworkType,
    formatTime: formatTime
}
