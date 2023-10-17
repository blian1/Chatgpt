window.addEventListener('storage', function (event) {
    if (event.key === 'jwt') {
        updateUI();
        console.log("页面更新")
    }
});






updateUI();
updateMessage();

function updateUI() {
    var jwt = localStorage.getItem('jwt');
    

    if (jwt!==null) {
        
        document.getElementById('loginB').innerHTML = '<img src="img/login.png" alt="exit" style="height:23px; width:23px;filter: brightness(250%);position: relative;vertical-align:middle;margin-right: 0px;margin-bottom: 3px;"> Logout';
        document.querySelector('.profile img').src ="img/user.jpg"; // 你需要替换为真实的用户头像
        document.getElementById('login').innerHTML ='Hello!'
    } else {
        console.log("注销成功")
        console.log("现在的令牌为" + jwt)
        document.getElementById('loginB').innerHTML = '<img src="img/login.png" alt="login Icon" style="height:17px; width:17px;filter: brightness(250%);position: relative;vertical-align:middle;margin-right: 0px;margin-bottom: 3px;"> Login/Register ';
        document.querySelector('.profile img').src = 'img/anonymous.jpg';
        document.getElementById('login').innerHTML ='CLICK LOGIN'
    }
}

window.updateUI = updateUI;//全局可调用

document.getElementById('loginB').addEventListener('click', function() {
    var jwt = localStorage.getItem('jwt');
    const sessionStorageDiv = document.querySelector('.session-storage');
    

    if (jwt) {
        localStorage.clear();//清空本地所有内存，这样下次就不会自动登陆了
        updateUI();
        console.log("令牌已移除")
        alert("您已经登出")
        sessionStorageDiv.innerHTML = '';//清空所有会话信息
        console.log("已经清空所有会话信息")
        window.displayMain();

    } else {
        updateUI();
    }
});
