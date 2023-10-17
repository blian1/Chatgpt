let selectedVersion = '3.5';
let isFirstMessage = true;
let firstResponseReceived = false;
let isCodeBlock = false;
let language = '';
let codeBlockContent = '';
let codeBlockLines = [];
let textBlockLines = [];
localStorage.setItem('Mode','light');

/*gpt-4, gpt-4-0613, gpt-4-32k, gpt-4-32k-0613, gpt-3.5-turbo, gpt-3.5-turbo-0613, gpt-3.5-turbo-16k, gpt-3.5-turbo-16k-0613 */
function loadHistory(messages){

    messages = messages.slice(Math.max(messages.length - 6, 0));

    let payload = {
        'stream': true,
        'model': 'gpt-3.5-turbo-0613',
        'messages': [{
            'role': 'system',
            'content': 'You are a helpful assistant.'   //修改payload的地方
          }]
    };

    messages.forEach(message => {
        let role = (message.sender === 'User') ? 'user' : 'assistant';
        payload.messages.push({
            'role': role,
            'content': message.content
        });
    });

    return payload;
}

function getHistory() {
    const userid = localStorage.getItem('userId');
    const id = localStorage.getItem('conversationId');
    // Return a new Promise
    return new Promise((resolve, reject) => {
        axios.get('http://localhost:3000/api/conversations/' + id +'?userId=' + userid)
            .then(function(response){
                if (response.data.message) {
                    console.log("错误,未读取到任何消息,显示主页面");
                    displayMain(); //显示主页面
                    resolve(null);  // Resolve the Promise with null
                } else {
                    console.log("获取到最新消息");
                    const messages = response.data;
                    localStorage.setItem('messages', JSON.stringify(messages));
                    const sortedMessages = messages.Messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                    const payload = loadHistory(sortedMessages);
                    resolve(payload);  // Resolve the Promise with the payload
                }
            })
            .catch(function(error) {
                console.error(error);
                reject(error);  // Reject the Promise if there is an error
            });
    });
}

async function postMessageAndGetHistory() {
    try {
        let text = document.getElementById('inputText').value;
        
        
        const response = await axios.post('http://localhost:3000/api/messages', {
            conversationId:localStorage.getItem("conversationId"),
            content: text,
            sender: 'User'
        });
        console.log('postMessageAndGetHistor Finish')
    } catch (error) {
        console.error(error);
    }
}


  
  
  



$(".versionButton").click(function() {
    $(".versionButton").removeClass("active");
    $(this).addClass("active");
    selectedVersion = $(this).text();
});


$(document).on('click', '.session-button', function() {
    $(".session-button").removeClass("active");
    $(this).addClass("active");
});


$("#sendButton").click(async function() {
    
    
    var jwt = localStorage.getItem('jwt');

    const conversationId = localStorage.getItem('conversationId');
    console.log("发送按钮点击后获取到的会话id为" + conversationId)

    if(jwt == null ){
        alert("Please Login")
    }else if(conversationId==null){
        alert("Please create a session to store your information")
    }else{
    
    let text = document.getElementById('inputText').value;

    if (text) {
        let message = $('<div class="message user"><div class="avatar"></div><div class="messageContent"></div></div>');
        message.find(".messageContent").text(text);

        $("#conversation").append(message); //显示用户输入文本

        let payload = {
            'stream': true,
            'model': 'gpt-3.5-turbo-16k-0613',
            'messages': [{
                'role': 'system',
                'content': 'You are a helpful assistant.'   //修改payload的地方
              }]
        };


        if (isFirstMessage) {
            let modelInfo = $('<div class="modelInfo"><span class="lightning">⚡</span> Model: Default (GPT-' + selectedVersion + ')</div>');
            $("#conversation").prepend(modelInfo);
            isFirstMessage = false;
        }

        

        /*
        axios.post('http://localhost:3000/api/messages', {
            conversationId,
            content: text,
            sender: 'User'
          }).then(response => {
            console.log(response.data);  // 打印返回的消息数据
            return getHistory();  // 在消息发送成功后获取历史记录
          }).then(result => {
            payload = result;  // 在此处赋值给payload
          }).catch(error => {
            console.error(error);
          });*/   

        await postMessageAndGetHistory();

        payload = await getHistory();
                        
        console.log("payload是这些2: " + JSON.stringify(payload, null, 2));
        
        


        let line = $('<hr style="border: none; border-top: 1px solid #e5e5e5; width: 100%;">');

        let lineHide = $('<hr style="border: none; border-top: 1px solid #e5e5e5; width: 100%; display:none;">');

        document.getElementById('inputText').value = "";
        $("#header").hide();
        $("#versionSelector").hide();
        $("#content1").hide();
        $("#content2").hide();
        $("#content3").hide();/*发送消息后，立刻隐藏主页面的所有内容，显示对话页面 */


        if(localStorage.getItem('Mode')=='light'){
            console.log(localStorage.getItem('Mode'))
            $("#conversation").append(line);
        }else{
            console.log("黑夜模式不触发")
            $("#conversation").append(lineHide);
            console.log("黑夜模式用户以触发")
        };
        
        aiMessage = $('<div class="message ai aiMessage"><div class="avatar"></div><div class="messageContent thinking"></div></div>');
        $("#conversation").append(aiMessage);
        $("#conversation").scrollTop($("#conversation")[0].scrollHeight);

        var socket = new WebSocket('ws://localhost:8080');
        let buffer = '';
        let isCodeBlock = false;
        let language = '';
        let dataBuffer = '';
        let messageBuffer = ''
        
        function escapeHTML(unsafe) {
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
        
        function sanitizeClassName(className) {
            return className.replace(/[+#]/g, '_');
        }
        
        socket.onopen = function(event) {
            
            /*
            socket.send(JSON.stringify({ 'message': text }));
            */
            
            socket.send(JSON.stringify(payload));
            
        };

        
        socket.onerror = function(error) {
            console.log("WebSocket Error: ", error);  // Add log
        };

        
        socket.onmessage = function(event) {

            
            const dataStrs = event.data.split("\n\n");
        
        
            dataStrs.forEach(dataStr => {
                if (dataStr.startsWith('data: ')) {
                    const jsonStr = dataStr.substring("data: ".length);
        
                    if (jsonStr === "[DONE]") {
                        
                        axios.post('http://localhost:3000/api/messages', {
                        conversationId: localStorage.getItem("conversationId"),
                        content: dataBuffer,
                        sender: 'AI'
                    }).then(response => {
                        console.log(response.data);
                    }).catch(error => {
                        console.error(error);
                    });
                        return;    
                    }

                    let data;
                    try {
                        data = JSON.parse(jsonStr);
                    } catch (e) {
                        console.error('Error parsing JSON:', e);
                        return;
                    }
        
                    const content = data.choices[0].delta.content;
                    if (content === undefined) {
                        return;
                    }
        
                    dataBuffer += content;

                }
            });

            
            let lines = dataBuffer.split('\n');
            let buffer = '';
            let isCodeBlock = false;
            let language = '';
            
            let codeElement = null;
            let textElement = $('<p></p>');  // Create an element for the initial non-code text
            aiMessage.find('.messageContent').html(textElement);
            
            /*check code */
            for(let line of lines) {
                // Check if line is start or end of code block
                if (line.startsWith("```")) {
                    if (isCodeBlock) {
                        // If n a code block, end it
                        isCodeBlock = false;
                        codeElement.html(escapeHTML(buffer));
                        hljs.highlightElement(codeElement[0]);  // Highlight the code block
                        buffer = '';
            
                        textElement = $('<p></p>');  // Create a new element for the following non-code text
                        aiMessage.find('.messageContent').append(textElement);
                        codeElement = null; // Reset code block element reference
                    } else {
                        // If not in a code block, start a new one
                        isCodeBlock = true;

                        language = line.slice(3);
            
                        // Create a new code block element and append it to the message content
                        codeElement = $(`<pre><code class="${sanitizeClassName(language)}"></code></pre>`);
                        aiMessage.find('.messageContent').append(language);
                        aiMessage.find('.messageContent').append(codeElement);
                    }
                } else {
                    // If line is not start or end of code block
                    if (isCodeBlock) {
                        // If we're in a code block, append line to buffer
                        buffer += line + '\n';
                    } else {
                        // If we're not in a code block, append line to the current textElement
                        textElement.append(document.createTextNode(line));
                        textElement.append($('<br>'));  // add a line break
                    }
                }
            }
            
            // If we're still in a code block, append the remaining content to the code block element
            if (isCodeBlock) {
                codeElement.html(escapeHTML(buffer));
                hljs.highlightElement(codeElement[0]);  // Highlight the code block
                buffer = '';
            }
            
            
            

            $("#conversation").scrollTop($("#conversation")[0].scrollHeight);       
                   
            $('pre code').each((i, block) => {
                hljs.highlightElement(block);
            });
        };
        

    
        socket.onerror = function(error) {
            console.log('WebSocket error: ' + error);
        };
        
        socket.onclose = function(event) {
            let line = $('<hr style="border: none; border-top: 1px solid #e5e5e5; width: 100%;">');

            if(localStorage.getItem('Mode')=='light'){
                console.log(localStorage.getItem('Mode'))
                $("#conversation").append(line);
            }else{
                $("#conversation").append(lineHide);
            }
            
            $("#conversation").scrollTop($("#conversation")[0].scrollHeight);
        };
    }
}
});



window.addEventListener('keydown', function(e) {
    var inputText = document.getElementById('inputText').value;
    if (e.key === 'Enter' && inputText.trim().length > 0) {
        document.getElementById('sendButton').click();
    }
});

/*
$('#new-session').click(() => {
    const userId = localStorage.getItem('userId');

    // 确保有userId才执行ajax请求
    if (userId) {
        $.ajax({
            url: '/api/sessions',
            method: 'POST',
            data: {
                userId: userId
            },
            success: (newSession) => {
                // 在会话存储区域添加一个新的会话项
            },
            error: (err) => {
                console.error(err);
            }
        });
    } else {
        console.error('No userId found');
    }
});
*/
