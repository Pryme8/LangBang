import { ApiRequest, ApiRoutes } from "./api/api";
import "./css/main.css";
import { ChatBox, ChatBoxMessageType } from "./layouts/chatBox";

const appRoot = document.getElementById('app');

if(appRoot){    
    const chatBox = new ChatBox(appRoot);    
    chatBox.addOnInputCallback(async (input) => {
        chatBox.lock(true);
        chatBox.addMessage(ChatBoxMessageType.User, input);
        await chatBox.awaitMessage(ChatBoxMessageType.Bot, async () => {            
            const response = await ApiRequest(ApiRoutes.Chat, {
                uid: chatBox.uid,
                prompt: input,
            }); 
            chatBox.lock(false);                   
            return response.message;
        });
    });
}
