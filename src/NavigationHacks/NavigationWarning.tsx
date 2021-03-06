import { eLoadingState, FlowComponent, FlowMessageBox, modalDialogButton } from 'flow-component-model';
import React, { CSSProperties } from 'react';
import { eDebugLevel } from '..';

//declare const manywho: IManywho;
declare const manywho: any;

export default class NavigationWarning extends FlowComponent {
    version: string="1.0.0";
    context: any;
    debugLevel: eDebugLevel = eDebugLevel.error;

    mapElementId: string;
    navId: string;
    nav: Map<string,any> = new Map();
    clickedMenuItem: any;

    modifiedElements: any[] = [];
    unloading: boolean = false;

    messageBox: FlowMessageBox;

    constructor(props: any) {
        super(props);
        this.flowMoved = this.flowMoved.bind(this);
        this.click = this.click.bind(this);
        this.continue = this.continue.bind(this);
        this.cancel = this.cancel.bind(this);
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
        this.unloading = false;
        this.butcherNavbar();
    }

    async componentWillUnmount() {
        await super.componentWillUnmount();
        this.unloading = true;
        this.modifiedElements.forEach((element: HTMLElement) => {
            element.onclick = undefined;
        });
        (manywho as any).eventManager.removeDoneListener(this.componentId);
    }

    click(ev: any) {
        ev.preventDefault();
        ev.stopPropagation();
        this.clickedMenuItem = ev.target;
        this.messageBox.showMessageBox(
            this.model.label || this.model.developerName,
            (<div dangerouslySetInnerHTML={{ __html: this.model.content }} />), 
            [new modalDialogButton(this.getAttribute("continueLabel","Continue"),this.continue),new modalDialogButton(this.getAttribute("cancelLabel","Cancel"),this.cancel)]
        );

    }

    continue() {
        this.messageBox.hideMessageBox();
        let nav = this.nav.get(this.clickedMenuItem.id);
        manywho.engine.navigate(this.navId,nav.id, nav.locationMapElementId, this.flowKey);
        this.clickedMenuItem = undefined;
    }

    cancel() {
        this.messageBox.hideMessageBox();
        this.clickedMenuItem = undefined;
    }

    butcherNavbar() {

        if(this.unloading === true) {
            return;
        }

        this.nav.clear();

        //My attributes should contain hideElements each of which needs to be made invisible
        let hides: string = this.getAttribute("warnElements","");
        let menuItems: string[] = hides.split(/[:;|,]+/).map(item => item.toLowerCase()).map(item => item.trim());
        
        // get nav id from dom
        this.navId= document.querySelectorAll(".navbar .navbar-collapse")[0].id;

        // get navigation object from flow containing all nav elements
        let nav = manywho.model.getNavigation(this.navId, this.flowKey);

        // build a map of nav element keyed on id - only include those which we handle
        this.nav = new Map();
        Object.values(nav.items).forEach((entry: any) => {
            if(menuItems.indexOf(entry.label.toLowerCase()) >= 0) {
                this.nav.set(entry.id, entry);
            }
        });
        
        
        // go throught all dom elements hi-jacking their onClick if we handle them
        this.modifiedElements = [];
        let elements: NodeListOf<Element> = document.querySelectorAll(".nav a");
        if(elements.length > 0) {
            for(let pos = 0 ; pos < elements.length ; pos ++) {
                if(menuItems.indexOf(elements.item(pos).textContent.toLowerCase()) >= 0) {
                    this.modifiedElements.push(elements.item(pos) as HTMLElement);
                    (elements.item(pos) as HTMLElement).addEventListener('click',this.click);;
                }
            }  
        }
    
    }

   
    render() {
        return (
            <FlowMessageBox
                parent={this}
                ref={(element: FlowMessageBox) => {this.messageBox = element}}
            />
        )
    }



}

manywho.component.register('NavigationWarning', NavigationWarning);