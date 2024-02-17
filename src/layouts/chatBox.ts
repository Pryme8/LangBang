import { ApplyStyle } from "./utils/styles";
import { uid } from 'uid';
import { ApiRequest, ApiRoutes } from "../api/api";
import {marked} from 'marked';


export enum ChatBoxMessageType{
    User,
    Bot,
}

export class ChatBox{
    private _uid: string = uid();
    public get uid(){
        return this._uid;
    }
    private _root!: HTMLDivElement;
    private _responseBox!: HTMLDivElement;
    private _input!: HTMLInputElement;

    private _inputCallbacks: ((input: string) => void)[] = [];

    constructor(private _target: HTMLElement){
        this._createHtmlElements();
        this.lock(true);    
        this._spawnAiAgent();    
    }

    private _createHtmlElements(){
        const root = document.createElement('div');
        root.setAttribute('id', 'chat-box');   
        ApplyStyle(root, {
            position: 'relative',
            backgroundColor: 'white',
            border: '1px solid black',
            borderRadius: '5px',
            boxShadow: '0px 0px 5px 0px black',
            fontSize: '1.5em',
            lineHeight: '1em',
        });    
        this._root = root;

        const responseBox = document.createElement('div');
        responseBox.setAttribute('id', 'chat-response-box');
        ApplyStyle(responseBox, {
            display: 'block',
            width: '100%',
            fontSize: '1em',
            lineHeight: '1em',
        });
        this._responseBox = responseBox;
        this._root.appendChild(responseBox);

        const input = document.createElement('input');
        input.setAttribute('id', 'chat-input');
        ApplyStyle(input, {
            display: 'block',
            width: 'calc(100% - 30px)',
            padding: '10px',
            fontSize: '1em',
            lineHeight: '1em',
            margin: '3px',
        });
        this._input = input;

        root.appendChild(input);    
        this._target.appendChild(root);

        this._bindListeners();
    }

    private _bindListeners(){
        this._input.addEventListener('keydown', (e) => {
            if(e.key === 'Enter'){      
                this._inputCallbacks.forEach(cb => cb(this._input.value));
                this._input.value = '';
            }
        });
    }

    private _spawnAiAgent(){
        ApiRequest(ApiRoutes.CreateAgent, {
            uid: this.uid,
        }).then((response) => {
            console.log(response);
            this.lock(false);
        });
    }

    public addOnInputCallback(callback: (input: string) => void){
        this._inputCallbacks.push(callback);
    }

    public removeOnInputCallback(callback: (input: string) => void){
        this._inputCallbacks = this._inputCallbacks.filter(cb => cb !== callback);
    }

    public addMessage(from: ChatBoxMessageType, message: string): HTMLDivElement{
        const messageElement = document.createElement('div');
        messageElement.innerText = message;
        ApplyStyle(messageElement, {
            padding: '10px',
            margin: '3px',
            borderRadius: '5px',
            boxShadow: '0px 0px 5px 0px black',
        });
        if(from === ChatBoxMessageType.User){
            ApplyStyle(messageElement, {
                backgroundColor: 'lightblue',
                textAlign: 'left',
            });
        }else{
            ApplyStyle(messageElement, {
                backgroundColor: 'lightgreen',
                textAlign: 'left',
            });
        }
        this._responseBox.appendChild(messageElement);
        return messageElement;
    }

    public async awaitMessage(from: ChatBoxMessageType, callback: () => Promise<string>){
        const message = this.addMessage(from, 'loading...');          
        await callback().then(async (response) => {
            const html = await marked(response);
            message.innerHTML = html
        });
    }

    public lock( state:boolean ){
        this._input.disabled = state;
    }
}