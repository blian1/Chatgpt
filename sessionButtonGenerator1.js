function displayMessages(messages) {
    
        $("#conversation").html("");
        $("#header").hide();
        $("#versionSelector").hide();
        $("#content1").hide();
        $("#content2").hide();
        $("#content3").hide();


        messages.forEach((message) => {
            let line = $('<hr style="border: none; border-top: 1px solid #e5e5e5; width: 100%;">');
            
            $("#conversation").append(line);
            const { content, sender } = message;
    
            // Determine class based on sender
            let messageClass = sender.toLowerCase();
            if (messageClass === "ai") {
                messageClass += " aiMessage";
            }
    
            let messageElement = $(`<div class="message ${messageClass}"><div class="avatar"></div><div class="messageContent">${content}</div></div>`);
            $("#conversation").append(messageElement);
            

            $("#conversation").append(line);
        });
}

function displayMain(){
        $("#conversation").html("");
        $("#header").show();
        $("#versionSelector").show();
        $("#content1").show();
        $("#content2").show();
        $("#content3").show();
}
window.displayMain = displayMain;

function updateMessage(){
    console.log("已经调用更新会话")
    // 获取HTML元素
    const sessionStorageDiv = document.querySelector('.session-storage');
    console.log("已经获取到了导航栏")

    sessionStorageDiv.innerHTML = '';//清空所有会话信息

    let conversations=null;
    console.log("初始化会话信息")

    // 获取会话信息
    conversations = JSON.parse(localStorage.getItem('conversations'));

    console.log("更新会话信息为："+conversations)


    // 如果存在会话信息，则创建按钮
    if (conversations!==null) {
        conversations.forEach((conversation) => {
            console.log("开始创建按钮")
            // 创建新的button元素
            const button = document.createElement('button');

            // 创建新的img元素，作为图标
            const icon = document.createElement('img');
            icon.src = "img/helper.png";  // 设置img元素的src属性为图标的URL
            // 设置img元素的样式
            icon.style.height = '14px';
            icon.style.width = '17px';
            icon.style.filter = 'brightness(250%)';
            icon.style.position = 'relative';
            icon.style.verticalAlign = 'middle';
            icon.style.marginRight = '5px';
            icon.style.marginBottom = '2px';

            // 设置button的文本为会话的名字
            button.textContent = conversation.name;

            button.dataset.text = conversation.name;
            
            // 为button添加一个类，以便可以应用样式
            button.classList.add('session-button');

            // 设置button的data-conversation-id属性为会话的ID
            button.dataset.conversationId = conversation.id;

            button.prepend(icon);  // 将图标添加到按钮的开头

            // 将button添加到.session-storage元素中
            sessionStorageDiv.appendChild(button);

            button.addEventListener('click', function() {
                console.log("按钮点击：" + this.dataset.text)
                const id = this.dataset.conversationId;  // 获取会话ID
                localStorage.setItem('conversationId',this.dataset.conversationId);
                console.log("会话id为: "+ id)
                console.log("当前的本地贮存会话id为: "+ localStorage.getItem('conversationId'))
                const userid = localStorage.getItem('userId')//获取userId
            
                axios.get('http://localhost:3000/api/conversations/' + id +'?userId=' +userid, {
                })
                .then(function(response){
                    if (response.data.message) {
                        console.log("错误,未读取到任何消息,显示主页面");

                        displayMain();//显示主页面
                    } else {
                            const messages = response.data;
                            localStorage.setItem('messages', JSON.stringify(messages));
                            console.log("成功获取到对应的Message")

                            const sortedMessages = messages.Messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                            // 显示消息
                            displayMessages(sortedMessages);
                            window.checkDarkMode();

                    }
                })
                .catch(function (error) {
                    // 这里是出现错误时的操作
                    if (error.response) {
                        // The request was made and the server responded with a status code
                        // that falls out of the range of 2xx
                        console.log(error.response.data);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    } else if (error.request) {
                        // The request was made but no response was received
                        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                        // http.ClientRequest in node.js
                        console.log(error.request);
                    } else {
                        // Something happened in setting up the request that triggered an Error
                        console.log('Error', error.message);
                    }
                });
            });
        })                    
    }else{
        console.log("未读取到任何数据")
    }
}

window.updateMessage = updateMessage;











