import { eLoadingState, FlowComponent, FlowMessageBox, modalDialogButton } from 'flow-component-model';
import React, { CSSProperties } from 'react';
import { eDebugLevel } from '..';

// declare const manywho: IManywho;
declare const manywho: any;

export default class NavigationOverride extends FlowComponent {
    version: string = '1.0.0';
    context: any;
    debugLevel: eDebugLevel = eDebugLevel.error;

    hiddenElements: any[] = [];

    unloading: boolean = false;

    messageBox: FlowMessageBox;

    constructor(props: any) {
        super(props);
        this.flowMoved = this.flowMoved.bind(this);
        this.click = this.click.bind(this);
    }

    async flowMoved(xhr: any, request: any) {
        const me: any = this;
        if (xhr.invokeType === 'FORWARD') {
            if (this.loadingState !== eLoadingState.ready) {
                window.setTimeout(function() {me.flowMoved(xhr, request); }, 500);
            } else {
                this.butcherNavbar();
            }
        }

    }

    async componentDidMount() {
        // will get this from a component attribute
        await super.componentDidMount();

        (manywho as any).eventManager.addDoneListener(this.flowMoved, this.componentId);
        this.unloading = false;
        this.butcherNavbar();
    }

    async componentWillUnmount() {
        await super.componentWillUnmount();
        this.unloading = true;
        this.hiddenElements.forEach((element: any) => {
            element.style.display = 'block';
        });
        (manywho as any).eventManager.removeDoneListener(this.componentId);
    }

    click(ev: any) {
        ev.preventDefault();
        ev.stopPropagation();

        this.messageBox.showMessageBox(
            this.model.developerName,
            (<div dangerouslySetInnerHTML={{ __html: this.model.content }} />),
            [new modalDialogButton('Ok', this.messageBox.hideMessageBox)],
        );

    }

    butcherNavbar() {
        if (this.unloading === true) {
            return;
        }
        // My attributes should contain hideElements each of which needs to be made invisible
        const hides: string = this.getAttribute('hideElements', '');
        const menuItems: string[] = hides.split(/[:;|,]+/).map((item) => item.toLowerCase()).map((item) => item.trim());
        this.hiddenElements = [];
        const elements: NodeListOf<Element> = document.querySelectorAll('.nav a');
        if (elements.length > 0) {
            for (let pos = 0 ; pos < elements.length ; pos ++) {
                if (menuItems.indexOf(elements.item(pos).textContent.toLowerCase()) >= 0) {
                    this.hiddenElements.push(elements.item(pos) as HTMLElement);
                    (elements.item(pos) as HTMLElement).style.display = 'none';
                }
            }
        }
    }

    render() {
        return (
            <div>
                <FlowMessageBox
                    parent={this}
                    ref={(element: FlowMessageBox) => {this.messageBox = element; }}
                />
            </div>
        );
    }

}

manywho.component.register('NavigationOverride', NavigationOverride);
