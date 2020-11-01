import React, { CSSProperties } from 'react';

import { modalDialogButton, ModalDialog, eLoadingState, FlowComponent, FlowObjectDataArray, FlowObjectData, FlowDisplayColumn, FlowObjectDataProperty } from 'flow-component-model';
import './css/treeview.css';
import { MessageBox } from './MessageBox/MessageBox';
import TreeViewNode from './TreeViewNode';
import TreeViewItem from './TreeViewItem';
import { eDebugLevel } from '.';

//declare const manywho: IManywho;
declare const manywho: any;


export default class DataGrid extends FlowComponent {
    version: string="1.0.0";
    context: any;
    debugLevel: eDebugLevel = eDebugLevel.error;

    dialogVisible: boolean = false;
    dialogTitle: string = '';
    dialogButtons: any = [];
    dialogContent: any;
    dialogOnClose: any;
    dialogForm: any;

    msgboxVisible: boolean = false;
    msgboxTitle: string = '';
    msgboxButtons: any = [];
    msgboxContent: any;
    msgboxOnClose: any;

    columns: Map<string, any> = new Map();
    rows: any[];
   
    async showDialog(title: string, content: any, onClose: any, buttons: modalDialogButton[]) {
        this.dialogVisible = true;
        this.dialogTitle = title;
        this.dialogContent = content;
        this.dialogOnClose = onClose;
        this.dialogButtons = buttons;
        return this.forceUpdate();
    }

    async hideDialog() {
        this.dialogVisible = false;
        this.dialogTitle = '';
        this.dialogContent = undefined;
        this.dialogOnClose = undefined;
        this.dialogButtons = [];
        this.dialogForm = undefined;
        return this.forceUpdate();
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
    

    constructor(props: any) {
        super(props);

        this.handleMessage = this.handleMessage.bind(this);
        this.showDialog = this.showDialog.bind(this);
        this.hideDialog = this.hideDialog.bind(this);
        this.showMessageBox = this.showMessageBox.bind(this);
        this.hideMessageBox = this.hideMessageBox.bind(this);
        this.handleMessage = this.handleMessage.bind(this);
        let dbl: number = parseInt(this.getAttribute("DebugLevel","0"));
              this.debugLevel = dbl || eDebugLevel.error ;
        console.log("Debug Level = " + this.debugLevel);
    }

    debug(message: string, debugLevel: eDebugLevel) {
        if(debugLevel.valueOf() <= this.debugLevel.valueOf()) {
            console.log(message);
        }
    }

    async componentDidMount() {
        //will get this from a component attribute
        await super.componentDidMount();
        this.columns.clear();
        this.model.displayColumns.forEach((col: FlowDisplayColumn) => {
            if(col.visible === true) {
                this.columns.set(col.developerName,col);
            }
        });
        this.rows=[];
        this.model.dataSource.items.forEach((row: FlowObjectData) => {
            //each row represents an attribute which has a name and value
            let props: Map<string,string> = new Map();
            this.columns.forEach((col: FlowDisplayColumn, key: string) => {
                props.set(key,row.properties[key].value as string);
            });
            this.rows.push(props);
        });
        this.forceUpdate();
    }

    async componentWillUnmount() {
        await super.componentWillUnmount();
        this.debug("unmount workflow", eDebugLevel.verbose);
    }

    
    

    render() {

        if(this.loadingState !== eLoadingState.ready) {
            return (
                <div></div>
            );
        }
        let modal: any;
        if (this.dialogVisible === true) {
            modal = (
                <ModalDialog
                    title={this.dialogTitle}
                    buttons={this.dialogButtons}
                    onClose={this.dialogOnClose}
                >
                    {this.dialogContent}
                </ModalDialog>
            );
        }

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

        //handle classes attribute and hidden and size
        let classes: string = "datagrid " + this.getAttribute("classes","");
        let style: CSSProperties = {};
        if(this.model.visible === false) {
            style.display = "none";
        }
        if(this.model.width) {
            style.width=this.model.width + "px"
        }
        if(this.model.height) {
            style.height=this.model.height + "px"
        }

        
        let headers: any[] = [];
        this.columns.forEach((col: FlowDisplayColumn) => {
            headers.push(
                <th>
                    <span>
                        {col.label}
                    </span>
                </th>
            );
        });

        let rows: any[] = [];
        let datas: any[] = [];
        this.rows.forEach((props: Map<string,string>) => {
            let datas: any[] = [];
            this.columns.forEach((col: FlowDisplayColumn) => {
                datas.push(
                    <td>{props.get(col.developerName)}</td>
                );
            });
            rows.push(
                <tr>
                    {datas}
                </tr>
            );
        });

        
        

        let content: any = (
            <table>
                <thead>
                    <tr>
                        {headers}
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        );
        
        //let nodes: Array<any> = [];
        let headerButtons: Array<any> = [];
        
        //if(this.loadingState === eLoadingState.ready) {
        //    headerButtons = this.buildHeaderButtons();
        //    nodes = this.buildNodes(this.nodeTree, 0);
        //}

        let title:  string = this.model.label || "";
        
        return (
            <div
                className={classes}
                style={style}
            >
                {modal}
                {msgbox}
                <div
                    className="datagrid-header"
                >
                    <div
                        className="datagrid-header-title-wrapper"
                    >
                        <span
                            className="datagrid-header-title"
                        >
                            {title}
                        </span>
                    </div>
                    <div
                        className="datagrid-header-buttons"
                    >
                        
                        {headerButtons}
                    </div>
                </div>
                <div 
                    className="datagrid-scroller" 
                >
                    <div
                        className="datagrid-body"
                    >
                        {content}
                    </div>
                </div>
            </div>
        );
    }

}

manywho.component.register('DataGrid', DataGrid);