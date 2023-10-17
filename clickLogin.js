localStorage.setItem('Mode','light');

var jwt = localStorage.getItem('jwt');
console.log("登陆界面令牌为"+jwt)


//方法：选中最新的会话
function LoadFirstMessage(){
    const buttons = document.querySelectorAll('.session-button');
    const newButton = buttons[0];
    newButton.click();
}

function addNewSession(){
    var name = prompt("Please enter a name for the new session");
            if (name) {
                $(".session-button").removeClass("active");    
                var userId = localStorage.getItem('userId');
                axios.post('http://localhost:3000/api/conversations', { userId, name }) /*发送请求创建会话*/
                .then(async function(postResponse){
                    if (postResponse.data.message) {
                        console.log("Error, new session could not be created");
                    } else {
                        // 更新LocalStorage中的conversationId
                        localStorage.setItem('conversationId', postResponse.data.id);
                        // 更新会话信息，并在页面上添加新按钮
                        // 立即获取新的会话列表并更新UI
                        const getResponse = await axios.get('http://localhost:3000/api/getconversations/' + userId);
                        // 把会话ID和名称存储到localStorage
                        if(getResponse.data.message == "Not found any conventation"){
                
                        }else{
                            const conversations = getResponse.data;
                            localStorage.setItem('conversations', JSON.stringify(conversations));
                            await window.updateMessage();

                            LoadFirstMessage();
                            window.displayMain();   
                        }
                    }
                })
                .catch(function (error) {
                    console.log('Failed to create a new session.', error);
                    alert('Failed to create a new session. Please try again');
                });
            }else{

            }
}
window.addNewSession = addNewSession;

// 模拟点击事件

function setSessionId(){
    axios.get('http://localhost:3000/api/getconversations/' + userId)
            .then(function(response) {
                // 把会话ID和名称存储到localStorage
                if(response.data.message == "Not found any conventation"){
                }else{
                    const conversations = response.data;
                    localStorage.setItem('conversations', JSON.stringify(conversations));
                    window.updateMessage(); 
                }
                
            })
            .catch(function(error) {
                console.error('Error fetching conversations:', error);
            });

}
window.setSessionId = setSessionId;

function validateEmail(email) {
    // 使用正则表达式来验证邮箱格式
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

function validatePassword(password) {
    // 密码必须包含至少一个大写字母，一个小写字母，并且至少8位
    var re = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(password);
}

document.addEventListener('DOMContentLoaded', function() {
    var userId=0;

    var navButtons = document.querySelectorAll('#sidebar .buttons button'); // 获取所有的导航栏按钮
    var loginDialog = document.getElementById('containers');
    var nightModeButton = document.getElementById('modeSwitchButton'); // 黑夜模式的按钮

    var login = document.getElementById("login");
    var newChat = document.getElementById("new-session")

    function openDialog(event) {
        event.preventDefault();
        event.stopPropagation();  // 阻止事件冒泡
        loginDialog.style.display = 'block';
        overlay.style.display = 'block';
        loginDialogIsOpen = true;
    }
    

    login.addEventListener('click', function(event) {
        var jwt = localStorage.getItem('jwt');
        if (jwt===null) {
            console.log("无令牌"+jwt)
            openDialog(event);
        }
    });
    
   
    newChat.addEventListener('click', async function(event) {
        var jwt = localStorage.getItem('jwt');
        if (jwt===null) {
            console.log("无令牌"+jwt)
            openDialog(event);
        }else{
            addNewSession();
        }   
    });
    
    

    for (var i = 0; i < navButtons.length; i++) {
        navButtons[i].addEventListener('click', function(event) {
            var jwt = localStorage.getItem('jwt');
            if (event.target != nightModeButton && jwt===null) {
                openDialog(event);
            }
        });
    }

    document.addEventListener('click', function(event) {
        var jwt = localStorage.getItem('jwt');
        if (jwt===null && !loginDialog.contains(event.target)) {
            loginDialog.style.display = 'none';
            loginDialogIsOpen = false;
            overlay.style.display = 'none';

        }
    });

    /*login 验证 */
    var loginButton = document.getElementById('loginButton');

    loginButton.addEventListener('click', function(event) {

        loginButton.textContent = 'LOGIN';  // 每次点击时都重新设置文本
       
        var usernameElement = document.getElementById('loginUsername');
        var passwordElement = document.getElementById('loginPassword');

        var usernameErrorElement = document.getElementById('usernameError');
        var passwordErrorElement = document.getElementById('passwordError');
        var isValid = true;

        usernameElement.addEventListener('input', function(event) {
            usernameErrorElement.innerHTML = '';
            usernameElement.className = '';
        });
        
        // 当用户在密码字段输入时，清除错误消息
        passwordElement.addEventListener('input', function(event) {
            passwordErrorElement.innerHTML = '';
            passwordElement.className = '';
        });

        if (!validateEmail(usernameElement.value)){
            usernameElement.className = 'invalid';
            usernameErrorElement.innerHTML = 'Please enter a valid email address';  // 显示错误信息
            isValid = false;
            loginButton.textContent = 'LOGIN';  // 每次点击时都重新设置文本
        }else {
            usernameElement.className = '';
            usernameErrorElement.innerHTML = '';  // 清空错误信
            loginButton.textContent = 'LOGIN';  // 每次点击时都重新设置文本
        }

        if (passwordElement.value == '') {
            passwordElement.className = 'invalid';
            passwordErrorElement.innerHTML = 'Please enter password';  // 显示错误信息
            isValid = false;
            loginButton.textContent = 'LOGIN';  // 每次点击时都重新设置文本
        } else {
            passwordElement.className = '';
            passwordErrorElement.nextElementSibling.innerHTML = '';
            loginButton.textContent = 'LOGIN';  // 每次点击时都重新设置文本
        }
        
        if (isValid) {
        axios.post('http://localhost:3000/login', {
            "username": usernameElement.value,
            "password": passwordElement.value
        })
        .then(function (response) {
            if (response.data.message == 'Login successful') {
                userIsLoggedIn = true;
                // 保存从服务器返回的JWT到localStorage
                localStorage.setItem('jwt', response.data.accessToken);
                console.log('Received JWT:', response.data.accessToken);//打印以验证令牌正常工作
                userId = response.data.userId;
                localStorage.setItem('userId', response.data.userId);//把userId贮存到localstorage里面

                axios.get('http://localhost:3000/api/getconversations/' + userId)
                .then(function(response) {
                    // 把会话ID和名称存储到localStorage
                    if(response.data.message == "Not found any conventation"){
                    }else{
                        const conversations = response.data;
                        localStorage.setItem('conversations', JSON.stringify(conversations));
                        window.updateMessage();//调用UI更新会话信息     
                    }
                    
                })
                .catch(function(error) {
                    console.error('Error fetching conversations:', error);
                });
         
                loginDialog.style.display = 'none';
                overlay.style.display = 'none';
                alert('login successfully');
                console.log("UserId: " + userId);
                window.updateUI();//调用刷新UI,显示用户头像和注册按钮
                bindSessionButtonClick();//重新调用
                localStorage.setItem('Mode','light')
                loginButton.textContent = 'LOGIN';  //每次点击时都重新设置文本

            }else{
                alert('The user name or password is incorrect');
                loginButton.textContent = 'LOGIN';  //每次点击时都重新设置文本
            }

        })
            .catch(function (error) {
                // 在这里处理错误，显示错误消息
                if (error.response) {
                    // 请求已经发出，服务器也已经响应，但是状态码在2xx以外
                    alert(error.response.data.message);
                } else if (error.request) {
                    // 请求已经发出，但是没有收到任何响应
                    alert('No response received from the server.');
                } else {
                    // 在设置请求时发生了一些问题
                    alert('An error occurred while setting up the request.');
                }
            });
        }
    });

    var registerButton=document.getElementById("registerButton")

    registerButton.addEventListener('click', function(event){

        var username = document.getElementById('registerUsername');
        var password = document.getElementById('registerPassword');
        var confirm = document.getElementById('confirmPassword');
        var authCode =document.getElementById('autoCode');

        var usernameErrorElement = document.getElementById('registerUsernameError');
        var passwordErrorElement = document.getElementById('registerPasswordError');
        var confirmErrorElement = document.getElementById('confirmPasswordError');
        var authCodeErrorElement = document.getElementById('autoCodeError');
        var isValid = true;

        username.addEventListener('input', function(event) {
            usernameErrorElement.innerHTML = '';
            usernameElement.className = '';
        });
        
        // 当用户在密码字段输入时，清除错误消息
        password.addEventListener('input', function(event) {
            passwordErrorElement.innerHTML = '';
            passwordElement.className = '';
        });

        confirm.addEventListener('input', function(event) {
            confirmErrorElement.innerHTML = '';
            confirm.className = '';
        });

        authCode.addEventListener('input', function(event) {
            authCodeErrorElement.innerHTML = '';
            authCode.className = '';
        });

        if (!validateEmail(username.value)){
            username.className = 'invalid';
            usernameErrorElement.innerHTML = 'Please enter the correct email format';  // 显示错误信息
            isValid = false;
            
        }else {
            username.className = '';
            usernameErrorElement.innerHTML = '';  // 清空错误信息
            
        }


        if (password.value==''){

            password.className = 'invalid';
            password.nextElementSibling.innerHTML = 'The password cannot be empty';
            isValid = false;

        }else if (!validatePassword(password.value)) {
            password.className = 'invalid';
            password.nextElementSibling.innerHTML = 'Password requires one uppercase, one lowercase, and minimum 8 characters';
            isValid = false;
        } else {
            password.className = '';
            password.nextElementSibling.innerHTML = '';
        }


        if (password.value !== confirm.value) {
            confirm.className = 'invalid';
            confirm.nextElementSibling.innerHTML = 'The two passwords must be the same';
            isValid = false;
        } else {
            confirm.className = '';
            confirm.nextElementSibling.innerHTML = '';
        }

        if(authCode.value !== '1234'){
            authCode.className = 'invalid';
            authCode.nextElementSibling.innerHTML = 'Invalid CODE';
            isValid = false;
        }else{
            authCode.className = '';
            authCode.nextElementSibling.innerHTML = '';
        }

        if (isValid) {
            axios.post('http://localhost:3000/register', {
                "username": username.value,
                "password": password.value
            })
            .then(function (response) {
                console.log(response);
                if (response.data.message == 'User created successfully') {
                    alert('registered successfully');
                    /*
                    loginDialog.style.display = 'none';
                    loginDialogIsOpen = false;
                    overlay.style.display = 'none';*/
                    
                } else {
                    alert('The mailbox has been registered. Registration failed');
                }
            })
            .catch(function (error) {
                if (error.response) {
                    // 请求已经发出，服务器也已经响应，但是状态码在2xx以外
                    alert(error.response.data.error);
                } else if (error.request) {
                    // 请求已经发出，但是没有收到任何响应
                    alert('No response received from the server.');
                } else {
                    //在设置请求时发生了一些问题
                }
            });
        }

    });

});


function bindSessionButtonClick() {
    $(document).on('click', '.session-button', function() {
        console.log("test点击")
        $(".session-button").removeClass("active");
        $(this).addClass("active");
    });
}






    
    /*
    document.getElementById('register').addEventListener('click', function() {
        document.getElementById('login-dialog').style.display = 'none';
        document.getElementById('signup-dialog').style.display = 'block';
    });
    
    document.getElementById('go-to-login').addEventListener('click', function() {
        document.getElementById('signup-dialog').style.display = 'none';
        document.getElementById('login-dialog').style.display = 'block';
    });




    /*
    
    document.getElementById('signup-form').addEventListener('submit', function(event) {
        event.preventDefault();
    
        var email = document.getElementById('signup-email');
        var password = document.getElementById('signup-password');
        var passwordConfirm = document.getElementById('signup-password-confirm');
        var captcha = document.getElementById('signup-captcha');
    
        var isValid = true;

        if (!validateEmail(email.value)) {
            email.className = 'invalid';
            email.nextElementSibling.innerHTML = '请输入有效的邮箱地址';
            isValid = false;
        } else {
            email.className = '';
            email.nextElementSibling.innerHTML = '';
        }

        if (!validatePassword(password.value)) {
            password.className = 'invalid';
            password.nextElementSibling.innerHTML = '密码必须包含至少一个大写字母,一个小写字母,并且至少8位';
            isValid = false;
        } else {
            password.className = '';
            password.nextElementSibling.innerHTML = '';
        }

        if (password.value !== passwordConfirm.value) {
            passwordConfirm.className = 'invalid';
            passwordConfirm.nextElementSibling.innerHTML = '两次输入的密码必须一致';
            isValid = false;
        } else {
            passwordConfirm.className = '';
            passwordConfirm.nextElementSibling.innerHTML = '';
        }

        if (captcha.value !== '1234') {
            captcha.className = 'invalid';
            captcha.nextElementSibling.innerHTML = '验证码错误';

            isValid = false;
        } else {
            captcha.className = '';
            captcha.nextElementSibling.innerHTML = '验证码正确';
        }

        if (isValid) {
            axios.post('http://localhost:3000/register', {
                "username": email.value,
                "password": password.value
            })
            .then(function (response) {
                console.log(response);
                if (response.data.message == 'User created successfully') {
                    alert('注册成功');
                    loginDialog.style.display = 'block';
                    document.getElementById('signup-dialog').style.display = 'none';
                } else {
                    alert('邮箱已经注册，注册失败');
                }
            })
            .catch(function (error) {
                if (error.response) {
                    // 请求已经发出，服务器也已经响应，但是状态码在2xx以外
                    alert(error.response.data.error);
                } else if (error.request) {
                    // 请求已经发出，但是没有收到任何响应
                    alert('No response received from the server.');
                } else {
                    // 在设置请求时发生了一些问题
                }
            });
        }
        
    });

    document.getElementById('get-captcha').addEventListener('click', function(event) {
        event.preventDefault();
    
        var email = document.getElementById('signup-email');
        var getCaptchaButton = document.getElementById('get-captcha');
    
        if (!validateEmail(email.value)) {
            email.className = 'invalid';
            email.nextElementSibling.innerHTML = '请输入有效的邮箱地址';
        } else {
            email.className = '';
            email.nextElementSibling.innerHTML = '';
            // 在这里添加你的代码来发送验证码
            // 比如发送一个AJAX请求到你的服务器
    
            // 禁用"获取验证码"按钮，并开始倒计时
            getCaptchaButton.disabled = true;
            var countdown = 60;
            var countdownTimer = setInterval(function() {
                countdown--;
                getCaptchaButton.value = '重新发送 (' + countdown + ')';
                if (countdown === 0) {
                    clearInterval(countdownTimer);
                    getCaptchaButton.value = '获取验证码';
                    getCaptchaButton.disabled = false;
                }
            }, 1000);
        } */




