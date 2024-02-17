import express = require('express');
import cors = require('cors');
import { AiAgents } from './aiAgents/aiAgents';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/', async (req, res) => {
    res.send({success: true, message: 'Welcome to the chat server!'});
});

app.post('/createAgent', async (req, res) => {
    try{    
        const uid = req.body.uid;
        if(!uid){ 
            return res.status(501).send({success: false, message: "No UID provided!"});
        }
        const agent = await AiAgents.CreateAgent(uid);
        return res.send({success: true, message: 'Agent created!', agent});
    } catch(e) {
        return res.status(500).send({success: false, message: e});
    }
});

app.post('/chat', async (req, res) => {
    try{
        console.log("Chat request received!")
        const {uid, prompt} = req.body;
        if(!uid || !prompt){
            return res.status(501).send({success: false, message: "No UID or prompt provided!"});
        }
        const agent = AiAgents.Agents.get(uid);
        console.log(agent);
        if(!agent){
            return res.status(502).send({success: false, message: "No agent found for UID!"});
        }
        const response = await AiAgents.Chat(uid, prompt);
        return res.send({success: true, message: response});
    } catch(e) {
        return res.status(500).send({success: false, message: e});
    }
});

export const ENV = {
    LANGCHAIN_TRACING_V2: true,
    LANGCHAIN_API_KEY: "ls__b83430b7ea8d4eef8027e4c73fbc92b1",
    OPEN_API_KEY: "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",
    TAVILY_API_KEY: "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",
}

const aiAgents = AiAgents.Instance;

const port = 3000;
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});

export default app;
