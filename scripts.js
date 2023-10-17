$(document).ready(function() {
    let selectedVersion = '3.5';
    let isFirstMessage = true;
    let aiMessage;

    $(".versionButton").click(function() {
        $(".versionButton").removeClass("active");
        $(this).addClass("active");
        selectedVersion = $(this).text();
    });

    $("#sendButton").click(function() {
        let text = document.getElementById('inputText').value;
        if (text) {
            let message = $('<div class="message user"><div class="avatar"></div><div class="messageContent"></div></div>');
            message.find(".messageContent").text(text);
            $("#conversation").append(message);

            if (isFirstMessage) {
                let modelInfo = $('<div class="modelInfo"><span class="lightning">⚡</span> Model: Default (GPT-' + selectedVersion + ')</div>');
                $("#conversation").prepend(modelInfo);
                isFirstMessage = false;
            }

            let line = $('<hr style="border: none; border-top: 1px solid #ccc; width: 100%;">');
            $("#conversation").append(line);

            document.getElementById('inputText').value = "";
            $("#header").hide();
            $("#versionSelector").hide();
            $("#content1").hide();
            $("#content2").hide();
            $("#content3").hide();/*发送消息后，立刻隐藏主页面的所有内容，显示对话页面 */

            aiMessage = $('<div class="message ai aiMessage"><div class="avatar"></div><div class="messageContent thinking">AI正在思考中...</div></div>');
            $("#conversation").append(aiMessage);
            $("#conversation").scrollTop($("#conversation")[0].scrollHeight);

            fetch('http://localhost:3000/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 'message': text })
            })
            .then(response => {
                const reader = response.body.getReader();
                return new ReadableStream({
                  start(controller) {
                    function push() {
                      reader.read().then(({ done, value }) => {
                        if (done) {
                          controller.close();
                          return;
                        }
                        controller.enqueue(value);
                        push();
                      });
                    };
                    push();
                  }
                });
            })
            .then(stream => {
                return new Response(stream, { headers: { "Content-Type": "text/plain" } }).text();
            })
            .then(data => {
                let gptResponse = data;

                aiMessage.find('.messageContent').removeClass('thinking').text('');

                gptResponse = gptResponse.replace(/\n/g, '<br />');

                let textArray = gptResponse.split('');
                let i = 0;
                let typing = setInterval(function(){
                    if (textArray[i] == '<' && textArray[i+1] == 'b' && textArray[i+2] == 'r' && textArray[i+3] == ' ' && textArray[i+4] == '/' && textArray[i+5] == '>') {
                        aiMessage.find(".messageContent").append('<br />');
                        i += 6;
                    } else {
                        aiMessage.find(".messageContent").append(textArray[i]);
                        i++;
                    }
                    if (i == textArray.length) clearInterval(typing);
                }, 50);

                $("#conversation").scrollTop($("#conversation")[0].scrollHeight);      

                let line = $('<hr style="border: none; border-top: 1px solid #ccc; width: 100%;">');
                $("#conversation").append(line);
                $("#conversation").scrollTop($("#conversation")[0].scrollHeight);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    });
});

