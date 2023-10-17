let selectedVersion = '3.5';
let isFirstMessage = true;
let firstResponseReceived = false;
let isCodeBlock = false;
let language = '';
let codeBlockContent = '';
let codeBlockLines = [];
let textBlockLines = [];

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

        let line = $('<hr style="border: none; border-top: 1px solid #e5e5e5; width: 100%;">');
        $("#conversation").append(line);

        document.getElementById('inputText').value = "";
        $("#header").hide();
        $("#versionSelector").hide();
        $("#content1").hide();
        $("#content2").hide();
        $("#content3").hide();


        
        aiMessage = $('<div class="message ai aiMessage"><div class="avatar"></div><div class="messageContent thinking"></div></div>');
        $("#conversation").append(aiMessage);
        $("#conversation").scrollTop($("#conversation")[0].scrollHeight);

        var socket = new WebSocket('ws://localhost:8080');
        let buffer = '';
        let isCodeBlock = false;
        let language = '';
        let dataBuffer = '';
        
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
            
            socket.send(JSON.stringify({ 'message': text }));
            
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
            
            for(let line of lines) {
                // Check if line is start or end of code block
                if (line.startsWith("```")) {
                    if (isCodeBlock) {
                        // If we're in a code block, end it
                        isCodeBlock = false;
                        codeElement.html(escapeHTML(buffer));
                        hljs.highlightBlock(codeElement[0]);  // Highlight the code block
                        buffer = '';
            
                        textElement = $('<p></p>');  // Create a new element for the following non-code text
                        aiMessage.find('.messageContent').append(textElement);
                        codeElement = null; // Reset code block element reference
                    } else {
                        // If we're not in a code block, start a new one
                        isCodeBlock = true;
                        language = line.slice(3);
            
                        // Create a new code block element and append it to the message content
                        codeElement = $(`<pre><code class="${sanitizeClassName(language)}"></code></pre>`);
                        aiMessage.find('.messageContent').append(codeElement);
                    }
                } else {
                    // If line is not start or end of code block
                    if (isCodeBlock) {
                        // If we're in a code block, append line to buffer
                        buffer += line + '\n';
                    } else {
                        // If we're not in a code block, append line to the current textElement
                        textElement.append(document.createTextNode(line + '\n'));  // Use createTextNode to avoid any HTML injection
                    }
                }
            }
            
            // If we're still in a code block, append the remaining content to the code block element
            if (isCodeBlock) {
                codeElement.html(escapeHTML(buffer));
                hljs.highlightBlock(codeElement[0]);  // Highlight the code block
                buffer = '';
            }
            
            
            
            // Scroll to the bottom
            $("#conversation").scrollTop($("#conversation")[0].scrollHeight);       
                   
            $('pre code').each((i, block) => {
                hljs.highlightBlock(block);
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


window.addEventListener('keydown', function(e) {
    var inputText = document.getElementById('inputText').value;
    if (e.key === 'Enter' && inputText.trim().length > 0) {
        document.getElementById('sendButton').click();
    }
});
