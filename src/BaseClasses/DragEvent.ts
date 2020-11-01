export enum eDragEventType
{
    unknown,
    canvas,
    table,
    link,
    dialog
}

export class DragEvent
{
    type: eDragEventType;
    sourceElement: any;
    targetElement: any;
    mouseX: number;
    mouseY: number;
    mouseOffsetX: number;
    mouseOffsetY: number;

    constructor()
    {
        this.type = eDragEventType.unknown;
        this.sourceElement = null;
        this.targetElement = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseOffsetX = 0;
        this.mouseOffsetY = 0;
    }

    public static start(type: eDragEventType, sourceElement: any, mouseX: number, mouseY: number): DragEvent
    {
        const evt: DragEvent = new DragEvent();
        evt.type = type;
        evt.sourceElement = sourceElement;
        evt.targetElement = null;
        evt.mouseX = mouseX;
        evt.mouseY = mouseY;
        evt.mouseOffsetX = mouseX;
        evt.mouseOffsetY = mouseY;
        return evt;
    }

    drag(mouseX: number, mouseY: number)
    {
        this.mouseX = mouseX;
        this.mouseY = mouseY;
    }

    end(target: any, mouseX: number, mouseY: number) : any
    {

        this.targetElement = target;
        this.mouseX = mouseX;
        this.mouseY = mouseY;   
    }

}