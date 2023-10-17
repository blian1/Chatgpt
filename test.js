$(document).ready(function() {
    let selectedVersion = '3.5';
    let isFirstMessage = true;
    let firstResponseReceived = false;
    let isCodeBlock = false;
    let language = '';
    let codeBlockContent = '';

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
                $("#conversation").html(modelInfo);
                isFirstMessage = false;
            }

            let line = $('<hr style="border: none; border-top: 1px solid #e5e5e5; width: 100%;">');
            $("#conversation").append(line);

            document.getElementById('inputText').value = "";
            $("#header").hide();
            $("#versionSelector").hide();

            
            aiMessage = $('<div class="message ai aiMessage"><div class="avatar"></div><div class="messageContent thinking"></div></div>');
            $("#conversation").append(aiMessage);
            $("#conversation").scrollTop($("#conversation")[0].scrollHeight);

            var socket = new WebSocket('ws://localhost:8080');

            socket.onopen = function(event) {
                socket.send(JSON.stringify({ 'message': text }));
            };
        
            socket.onmessage = function(event) {
                const dataStrs = event.data.split("\n\n");
                
        
                dataStrs.forEach(dataStr => {
                    if (dataStr.startsWith('data: ')) {
                        var i  = 1;
                        const jsonStr = dataStr.substring("data: ".length);
        
                        // Skip "[DONE]\n" messages
                        if (jsonStr === "[DONE]") {
                            /*firstResponseReceived = false;*/
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
                        const formattedContent = content.replace(/\n/g, '<br>');
                        
                        /*
                        if (!firstResponseReceived) {
                            aiMessage.find('.messageContent').empty();
                            firstResponseReceived = true;
                        }*/
                        
                        aiMessage.find('.messageContent').append(formattedContent);
                        $("#conversation").scrollTop($("#conversation")[0].scrollHeight);
                        
                    }
                });
            };
        
            socket.onerror = function(error) {
                console.log('WebSocket error: ' + error);
            };
            
            socket.onclose = function(event) {
                let line = $('<hr style="border: none; border-top: 1px solid #e5e5e5; width: 100%;">');
                $("#conversation").append(line);
                $("#conversation").scrollTop($("#conversation")[0].scrollHeight);
            };
        }
    });
});