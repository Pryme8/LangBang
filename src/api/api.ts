
export enum ApiRoutes{
    Root = '/',
    CreateAgent = '/createAgent',
    Chat = '/chat',
}

export const ApiRequest = async (route: ApiRoutes, props?: any)=> {
    const response = await fetch(`http://localhost:3000${route}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            credentials: 'same-origin',
        },    
        body: JSON.stringify({
            ...props,
        }),
    });
    const data = await response.json();
    return data;
}