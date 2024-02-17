import { ApiRequest, ApiRoutes } from "./api/api";
import "./css/main.css";
import { ChatBox, ChatBoxMessageType } from "./layouts/chatBox";


// 
// 
// 
// 
// import { createRetrievalChain } from "langchain/chains/retrieval";
// import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
// 
// 




// import { ApiRequest, ApiRoutes } from "./api/api";



const appRoot = document.getElementById('app');




// const historyAwarePrompt = ChatPromptTemplate.fromMessages([
//     new MessagesPlaceholder("chat_history"),
//     ["user", "{input}"],
//     [
//       "user",
//       "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation",
//     ],
//  ]);

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
