export const ApplyStyle = (element: HTMLElement, style: Partial<CSSStyleDeclaration>) => {
    for(const key in style){
        (element.style as any)[key] = (style as any)[key];
    }
}