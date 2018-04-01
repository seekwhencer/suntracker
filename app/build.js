buildNumber = function(){
    var salt = Date() + 'something';
    var str = crypto.createHash('md5').update(salt).digest("hex");
    str = str.substring(0, 10);
    str = str + '_' + new Date().getFullYear() + '-' + (new Date().getMonth() +1) + '-' + new Date().getDate() + '_' + new Date().getHours() + ':' + new Date().getMinutes();
    fs.writeFileSync('./release.info', str);
    return str;
};
