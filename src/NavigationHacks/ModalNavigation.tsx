import { eLoadingState, FlowComponent, modalDialogButton } from 'flow-component-model';
import React, { CSSProperties } from 'react';
import { eDebugLevel } from '..';
import { MessageBox } from '../MessageBox/MessageBox';


//declare const manywho: IManywho;
declare const manywho: any;

export default class ModalNavigation extends FlowComponent {
    version: string="1.0.0";
    context: any;
    debugLevel: eDebugLevel = eDebugLevel.error;

    msgboxVisible: boolean = false;
    msgboxTitle: string = '';
    msgboxButtons: any = [];
    msgboxContent: any;
    msgboxOnClose: any;

    constructor(props: any) {
        super(props);
        this.showMessageBox = this.showMessageBox.bind(this);
        this.hideMessageBox = this.hideMessageBox.bind(this);
        this.click = this.click.bind(this);
    }

    async showMessageBox(title: string, content: any, onClose: any, buttons: modalDialogButton[]) {
        this.msgboxVisible = true;
        this.msgboxTitle = title;
        this.msgboxContent = content;
        this.msgboxOnClose = onClose;
        this.msgboxButtons = buttons;
        return this.forceUpdate();
    }

    async hideMessageBox() {
        this.msgboxVisible = false;
        this.msgboxTitle = '';
        this.msgboxContent = undefined;
        this.msgboxOnClose = undefined;
        this.msgboxButtons = [];
        return this.forceUpdate();
    }
    
    async flowMoved(xhr: any, request: any) {
        let me: any = this;
        if(xhr.invokeType==="FORWARD") {
            if(this.loadingState !== eLoadingState.ready){
                window.setTimeout(function() {me.flowMoved(xhr, request)},500);
            }
            else {
                this.butcherNavbar();
            }
        }
        
    }

    async componentDidMount() {
        //will get this from a component attribute
        await super.componentDidMount();
        
        (manywho as any).eventManager.addDoneListener(this.flowMoved, this.componentId);
        this.butcherNavbar();
    }

    async componentWillUnmount() {
        await super.componentWillUnmount();
        (manywho as any).eventManager.removeDoneListener(this.componentId);
    }

    click(ev: any) {
        ev.preventDefault();
        ev.stopPropagation();

        console.log("click");

        this.showMessageBox(
            this.model.developerName,
            (<div dangerouslySetInnerHTML={{ __html: this.model.content }} />), 
            this.hideMessageBox,
            [new modalDialogButton("Ok",this.hideMessageBox)]
        );

    }

    butcherNavbar() {

        //my state should contain a presentation
        
        let elements: NodeListOf<Element> = document.querySelectorAll(".nav a");
        if(elements.length > 0) {
            for(let pos = 0 ; pos < elements.length ; pos ++) {
                if(elements.item(pos).textContent === this.model.developerName){
                    let element: HTMLAnchorElement = elements.item(pos) as HTMLAnchorElement;
                    element.onclick=this.click;
                }
            }
            
            
        }
    }

   
    render() {
        let msgbox: any;
        if (this.msgboxVisible === true) {
            msgbox = (
                <MessageBox
                    title={this.msgboxTitle}
                    buttons={this.msgboxButtons}
                    onClose={this.msgboxOnClose}
                >
                    {this.msgboxContent}
                </MessageBox>
            );
        }
    return (<div>{msgbox}</div>)
    }



}

manywho.component.register('ModalNavigation', ModalNavigation);