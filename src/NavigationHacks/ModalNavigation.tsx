import { eLoadingState, FlowComponent, FlowMessageBox, modalDialogButton } from 'flow-component-model';
import React, { CSSProperties } from 'react';
import { eDebugLevel } from '..';

// declare const manywho: IManywho;
declare const manywho: any;

export default class ModalNavigation extends FlowComponent {
    version: string = '1.0.0';
    context: any;
    debugLevel: eDebugLevel = eDebugLevel.error;

    messageBox: FlowMessageBox;

    constructor(props: any) {

        super(props);
        this.flowMoved = this.flowMoved.bind(this);
        this.click = this.click.bind(this);
        this.butcherNavbar = this.butcherNavbar.bind(this);
        this.setMessageBox = this.setMessageBox.bind(this);
        console.log('init' + this.componentId);
        this.state = {flag: 0};
    }

    async setMessageBox(key: string, element: FlowMessageBox) {
        this.messageBox = element;
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
        this.butcherNavbar();
    }

    async componentWillUnmount() {
        await super.componentWillUnmount();
        (manywho as any).eventManager.removeDoneListener(this.componentId);
    }

    click(ev: any) {
        // ev.preventDefault();
        ev.stopPropagation();
        if (!this.messageBox) {
            const newval = new Date().getTime();
            this.setState({flag: newval}, () => {
                this.forceUpdate();
            });
        } else {
            this.messageBox?.showMessageBox(
                this.model.developerName,
                (<div dangerouslySetInnerHTML={{ __html: this.model.content }} />),
                [new modalDialogButton('Ok', this.messageBox.hideMessageBox)],
            );
        }
    }

    butcherNavbar() {

        // my state should contain a presentation

        const elements: NodeListOf<Element> = document.querySelectorAll('.nav a');
        if (elements.length > 0) {
            for (let pos = 0 ; pos < elements.length ; pos ++) {
                if (elements.item(pos).textContent === this.model.developerName) {
                    const element: HTMLAnchorElement = elements.item(pos) as HTMLAnchorElement;
                    element.addEventListener('click', this.click);
                }
            }
        }
        this.forceUpdate();
    }

    render() {
        return (
            <div>
                <FlowMessageBox
                    parent={this}
                    ref={(element: FlowMessageBox) => {this.setMessageBox(this.componentId, element); }}
                />
            </div>
        );
    }

}

manywho.component.register('ModalNavigation', ModalNavigation);
