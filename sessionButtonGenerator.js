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
        
        let messageElement = $(`<div class="message ${messageClass}"><div class="avatar"></div><div class="messageContent"></div></div>`);
        $("#conversation").append(messageElement);
        
        let lines = content.split('\n');
        let buffer = '';
        let isCodeBlock = false;
        let language = '';
        let codeElement = null;
        let textElement = $('<p></p>');
        
        messageElement.find('.messageContent').html(textElement);
        
        for(let line of lines) {
            if (line.startsWith("```")) {
                if (isCodeBlock) {
                    isCodeBlock = false;
                    codeElement.html(buffer);
                    hljs.highlightElement(codeElement[0]);  
                    buffer = '';
                    textElement = $('<p></p>');  
                    messageElement.find('.messageContent').append(textElement);
                    codeElement = null; 
                } else {
                    isCodeBlock = true;
                    language = line.slice(3);
                    codeElement = $(`<pre><code class="${language}"></code></pre>`);
                    messageElement.find('.messageContent').append(language);
                    messageElement.find('.messageContent').append(codeElement);
                }
            } else {
                if (isCodeBlock) {
                    buffer += line + '\n';
                } else {
                    textElement.append(document.createTextNode(line));
                    textElement.append($('<br>'));
                }
            }
        }
        
        if (isCodeBlock) {
            codeElement.html(buffer);
            hljs.highlightElement(codeElement[0]);  
            buffer = '';
        }
        
        
            
        $("#conversation").append(line);
        
        $("#conversation").scrollTop($("#conversation")[0].scrollHeight);      
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
    return new Promise((resolve, reject) => {
    console.log("已经调用更新会话")
    // 获取HTML元素
    const sessionStorageDiv = document.querySelector('.session-storage');

    sessionStorageDiv.innerHTML = '';//清空所有会话信息

    let conversations=null;

    // 获取会话信息
    conversations = JSON.parse(localStorage.getItem('conversations'));

    console.log("更新会话信息为："+conversations)


    // 如果存在会话信息，则创建按钮
    if (conversations!==null) {

        conversations.reverse();//反转让最新的显示在上面

        conversations.forEach((conversation) => {
        // 创建新的button元素
        // 创建新的div元素，用来包含会话按钮和操作按钮
        const buttonDiv = document.createElement('div');
        buttonDiv.style.display = 'flex'; // 将buttonDiv设置为一个flex容器
        buttonDiv.style.alignItems = 'center'; // 让div内的元素垂直居中对齐

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

        buttonDiv.appendChild(button); //将button添加到buttonDiv中

        //创建删除按钮
        const delButton = document.createElement('button');
        const delIcon = document.createElement('img');
        delIcon.src = "img/delect.png";
        delIcon.style.height = '20px';
        delIcon.style.width = '15px';
        delIcon.style.filter = 'brightness(90%)';
        delIcon.style.position = 'absolute'; 
        delIcon.style.right = '10px';
        delButton.style.transform = 'translateY(-10px)'
        delIcon.style.verticalAlign = 'middle';
        delIcon.style.marginRight = '5px';
        delIcon.style.marginBottom = '2px';
        delButton.style.border = 'none';  // Remove button border
        delButton.style.background = 'none';  // Remove button background
        delButton.appendChild(delIcon);  
        delButton.style.display = 'none'; //一开始将按钮隐藏
        delButton.classList.add('del-button'); // 确保删除按钮有 del-button 类
        

        delButton.addEventListener('click', async function() {
            console.log("删除按钮已经点击");
            await delectMessage();

            button.style.display = 'none';

            
            axios.get('http://localhost:3000/api/getconversations/' + localStorage.getItem('userId'))
                .then(function(response) {
                    // 把会话ID和名称存储到localStorage
                    if(response.data.message == "Not found any conventation"){
                        console.log("没有获取到任何对话信息")
                    }else{
                        const conversations = response.data;
                        localStorage.setItem('conversations', JSON.stringify(conversations));
                        
                        window.updateMessage();//调用UI更新会话信息     
                    }
                    
                })
                .catch(function(error) {
                    console.error('Error fetching conversations:', error);
                    console.log("没有获取到任何对话信息")
                    localStorage.removeItem('conversations');
                });

            displayMain();
        });



        delButton.addEventListener('mouseover', function() {
            this.style.filter = 'brightness(250%)';
        });
        
        delButton.addEventListener('mouseout', function() {
            this.style.filter = 'brightness(90%)';
        });

        buttonDiv.appendChild(delButton); // 将delButton添加到buttonDiv中

        // 当会话按钮被点击时，显示删除按钮
        button.addEventListener('click', function() {
            const allDelButtons = document.querySelectorAll('.del-button');
            allDelButtons.forEach(button => button.style.display = 'none');
            // ... 你的点击事件处理函数 ...
            delButton.style.display = 'block'; // 点击会话按钮后，显示删除按钮

        });

        // 将buttonDiv添加到.session-storage元素中
        sessionStorageDiv.appendChild(buttonDiv);

            


            //当创建的会话点击后
            button.addEventListener('click', function() {
                const id = this.dataset.conversationId;  // 获取会话ID
                localStorage.setItem('conversationId',this.dataset.conversationId);
                
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
    resolve();
});
}

window.updateMessage = updateMessage;



async function delectMessage() {
    const confirmation = window.confirm("Are you sure you want to delete this session?");
    if (confirmation) {
        const conversationId = localStorage.getItem('conversationId'); // 获取会话ID
        try {
            const response = await axios.delete('http://localhost:3000/api/conversations/' + conversationId);
            console.log(response.data.message); // 输出服务器响应消息
        } catch (error) {
            console.error(error);
        }
    }
}













