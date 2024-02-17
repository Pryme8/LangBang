import { ENV } from "../server";
import { pull } from "langchain/hub";

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createOpenAIFunctionsAgent, AgentExecutor } from "langchain/agents";
import { createRetrieverTool } from "langchain/tools/retriever";
// import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
// import { PlaywrightWebBaseLoader } from "langchain/document_loaders/web/playwright";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

import { HumanMessage, AIMessage } from "@langchain/core/messages";

interface IAIAgent{
    uid: string;
    agentExecutor: AgentExecutor;
    chat_history: (HumanMessage | AIMessage)[];
}

export class AiAgents{
    private static _Instance: AiAgents;
    public static get Instance(){
        if(!AiAgents._Instance){
            AiAgents._Instance = new AiAgents();
        }
        return AiAgents._Instance;
    }

    private static _Agents: Map<string, IAIAgent> = new Map<string, IAIAgent>();   
    public static get Agents(){
        return AiAgents._Agents;
    }

    constructor(){}

    public static async CreateAgent(uid: string){
        // const loader = new PlaywrightWebBaseLoader(
        //     "https://support.framevr.io/"
        // );

        // const splitter = new RecursiveCharacterTextSplitter();

        // const docs = await loader.load();
        // const splitDocs = await splitter.splitDocuments(docs);
          
        // const embeddings = new OpenAIEmbeddings({
        //     openAIApiKey: ENV.OPEN_API_KEY
        // });

        // const vectorstore = await MemoryVectorStore.fromDocuments(
        //     splitDocs,
        //     embeddings
        //   );

        // const retriever = vectorstore.asRetriever();
        const agentPrompt = await pull<ChatPromptTemplate>(
            "hwchase17/openai-functions-agent"
        );
        const name = "Toby";
        const template = `Your name is ${name}. You are an angry angry assistant, who is rude to all questions but answers them correctly.`;
        agentPrompt.lc_kwargs.promptMessages[0].prompt.lc_kwargs.template = template;
        agentPrompt.lc_kwargs.promptMessages[0].prompt.template = template;

        const agentModel = new ChatOpenAI({
            modelName: "gpt-4-1106-preview",
            temperature: 0,
            openAIApiKey: ENV.OPEN_API_KEY,
        });

        // const retrieverTool = await createRetrieverTool(retriever, {
        // name: "langsmith_search",
        // description:
        //     "Search for information about LangSmith. For any questions about LangSmith, you must use this tool!",
        // });

        const searchTool = new TavilySearchResults({apiKey: ENV.TAVILY_API_KEY});        
        const tools = [searchTool];

        const agent = await createOpenAIFunctionsAgent({
            llm: agentModel,
            tools,
            prompt: agentPrompt,  
        });
          
        const agentExecutor = new AgentExecutor({
            agent,
            tools,
            verbose: false,
        });       

        AiAgents.Agents.set(uid, {
            uid,
            agentExecutor,
            chat_history: [],
        });
    }

    public static async Chat(uid: string, prompt: string){
        const agent = AiAgents.Agents.get(uid);   
        if(!agent){
            throw new Error("No agent found for UID!");
        }
        const response = await agent.agentExecutor.invoke({
            chat_history: agent.chat_history,
            input: prompt,
        });  
        agent.chat_history.push(new HumanMessage(prompt));
        agent.chat_history.push(new AIMessage(response.output));
        return response.output;
    }
}