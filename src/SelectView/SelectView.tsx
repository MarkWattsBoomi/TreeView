import React, { CSSProperties } from 'react';

import { modalDialogButton, ModalDialog, eLoadingState, FlowComponent, FlowObjectDataArray, FlowObjectData, FlowObjectDataProperty, FlowOutcome, ePageActionType, ePageActionBindingType, eContentType, FlowDisplayColumn, FlowField } from 'flow-component-model';
import '../css/SelectView.css';
import { MessageBox } from '../MessageBox/MessageBox';
import ContextMenu from '../ContextMenu/ContextMenu';
import { eDebugLevel } from '..';
import SelectViewRow from './SelectViewRow';
import {SelectViewItem, SelectViewColumn } from './SelectViewItem';
import SelectViewHeader from './SelectViewColumn';

//declare const manywho: IManywho;
declare const manywho: any;

export default class SelectView extends FlowComponent {
    version: string="1.0.0";
    context: any;
    debugLevel: eDebugLevel = eDebugLevel.error;

    selectedRows: Map<string,string> = new Map();
    modifiedRows: Map<string,string> = new Map();
    rowMap: Map<string,SelectViewItem> = new Map();
    rowComponents: Map<string,SelectViewRow> = new Map();
    rowElements: Array<SelectViewRow> = [];
    
    colMap: Map<string,FlowDisplayColumn> = new Map();
    colComponents: Map<string,SelectViewHeader> = new Map();
    colElements: Array<SelectViewHeader> = [];

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

    contextMenu: any;

    matchingRows:  Map<string,string> = new Map();

    lastContent: any = (<div></div>);

    searchBox: HTMLInputElement;
   
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
        this.flowMoved = this.flowMoved.bind(this);
        this.doOutcome = this.doOutcome.bind(this);
        this.setRow = this.setRow.bind(this);
        this.showContextMenu = this.showContextMenu.bind(this);
        this.hideContextMenu = this.hideContextMenu.bind(this);  
        this.filterTable = this.filterTable.bind(this);
        this.filterTableClear = this.filterTableClear.bind(this);
        this.searchKeyEvent = this.searchKeyEvent.bind(this);
        this.refreshSelectedFromState = this.refreshSelectedFromState.bind(this);
        this.toggleAllSelected = this.toggleAllSelected.bind(this);
        

        let dbl: number = parseInt(this.getAttribute("DebugLevel","0"));
              this.debugLevel = dbl || eDebugLevel.error ;
        console.log("Debug Level = " + this.debugLevel);
    }

    debug(message: string, debugLevel: eDebugLevel) {
        if(debugLevel.valueOf() <= this.debugLevel.valueOf()) {
            console.log(message);
        }
    }

    async flowMoved(msg: any) {
        this.buildTableFromModel(this.model.dataSource.items);
        //await this.pushModelToState();
        this.refreshSelectedFromState();
    }


    async componentDidMount() {
        //will get this from a component attribute
        await super.componentDidMount();
        (manywho as any).eventManager.addDoneListener(this.flowMoved, this.componentId);
        // build tree
        this.buildTableFromModel(this.model.dataSource.items);

        //await this.pushModelToState();

        this.refreshSelectedFromState();
        
    }

    async refreshSelectedFromState() {
        const state: any = this.getStateValue();
        if(state) {
            state.items.forEach((item: FlowObjectData) => {
                if(this.rowMap.has(item.internalId)) {
                    this.selectedRows.set(item.internalId,item.internalId);
                }
            });
            //this.selectedRowId = state?.properties["ITEM_ID"]?.value as number;
        }
        this.forceUpdate();
    }

    async componentWillUnmount() {
        await super.componentWillUnmount();
        (manywho as any).eventManager.removeDoneListener(this.componentId);
    }

    setSearchBox(element: HTMLInputElement) {
        if(element){
            this.searchBox = element;
            this.searchBox.addEventListener("keyup",this.searchKeyEvent);
        }
        else {
            if(this.searchBox) {
                this.searchBox.removeEventListener("keyup",this.searchKeyEvent);
            }
        }
    }

    searchKeyEvent(event: KeyboardEvent) {
        if(event.key.toLowerCase()==="enter") {
            this.filterTable();
        }
    }

    setRow(key: string, element: SelectViewRow) {
        if(element) {
            this.rowComponents.set(key,element);
        }
        else {
            if(this.rowComponents.has(key)) {
                this.rowComponents.delete(key);
            }
        }
    }

    setCol(key: any, element: SelectViewHeader) {
        if(element) {
            this.colComponents.set(key,element);
        }
        else {
            if(this.rowComponents.has(key)) {
                this.rowComponents.delete(key);
            }
        }
    }

    getCol(key: string): SelectViewRow {
        return this.rowComponents.get(key);
    }



    async doOutcome(outcomeName: string, selectedItem? : string) {

        //if there's a selectedItem then this must be being triggered at a row level.
        //set the single item field if defined
        if(selectedItem && this.getAttribute("RowLevelState","").length>0) {
            let val: FlowField = await this.loadValue(this.getAttribute("RowLevelState"));
            if (val) {
                val.value = this.rowMap.get(selectedItem).objectData as FlowObjectData;
                await this.updateValues(val);
            }
        }
        if(this.outcomes[outcomeName]) {
            await this.triggerOutcome(outcomeName);
        }
        else {
            manywho.component.handleEvent(
                this,
                manywho.model.getComponent(
                    this.componentId,
                    this.flowKey,
                ),
                this.flowKey,
                null,
            );
        }
        this.forceUpdate();
    }

    async pushSelectedToState() {
        let updateData: FlowObjectDataArray = new FlowObjectDataArray();
        this.rowMap.forEach((item: SelectViewItem) => {
            if(this.selectedRows?.has(item.id)){
                item.objectData.isSelected=true;
                updateData.addItem(item.objectData);
            }
        });
        await this.setStateValue(updateData);
    }

    rowSelected(rowId: string) {
        if(!this.selectedRows.has(rowId)) {
            this.selectedRows.set(rowId,rowId);
        }
        else {
            this.selectedRows.delete(rowId);
        }
        this.pushSelectedToState();
        this.doOutcome("OnSelect");
        this.forceUpdate();
    }
   
    buildHeaderButtons() : Array<any> {
        let content : any = [];

        let lastOrder: number = 0;
        let addedExpand: boolean = false;
        let addedContract: boolean = false;
        Object.keys(this.outcomes).forEach((key: string) => {
            const outcome: FlowOutcome = this.outcomes[key];
            
            if (outcome.isBulkAction && outcome.developerName !== "OnSelect" && !outcome.developerName.toLowerCase().startsWith("cm")) {
                content.push(
                    <span 
                        key={key}
                        className={"glyphicon glyphicon-" + (outcome.attributes["icon"]?.value || "plus") + " treeview-header-button"} 
                        title={outcome.label || key}
                        onClick={(e: any) => {this.doOutcome(key, undefined)}}
                    />
                );
            }
        });
        
        return content;
    }

    

    ///////////////////////////////////////////////////////////////////////////////////////////
    // constructs the nodeTree and a flat a map of TreeViewItems from the model datasource data
    ///////////////////////////////////////////////////////////////////////////////////////////
    buildTableFromModel(items : FlowObjectData[]){
        this.rowMap = new Map();
        this.rowComponents = new Map();

        //sort display cols on order
        let cols: Array<FlowDisplayColumn> = this.model.displayColumns.sort((a: any,b: any) => {
            switch(true) {
                case a.DisplayOrder > b.DisplayOrder:
                    return 1;
                case a.DisplayOrder === b.DisplayOrder:
                    return 0;
                default: 
                    return -1;
            }
        });

        
        cols.forEach((col: FlowDisplayColumn) => {
            this.colMap.set(col.developerName,col);
        });
        
        items.forEach((item: FlowObjectData) => {
            //construct Item
            let node = new SelectViewItem();
            node.id = item.internalId;

            this.colMap.forEach((col:FlowDisplayColumn) => {
                node.columns.set(col.developerName, new SelectViewColumn(col.developerName,col.label, col.contentType, item.properties[col.developerName]?.value as any));
            });
                        
            node.objectData = item;

            this.rowMap.set(node.id,node);
        });

    }

    sortTable(property: String, descending?: boolean) {
        if (this.rowMap.size > 0) {
            this.rowMap = new Map(Array.from(this.rowMap).sort((a: any,b: any) => {
                if(descending && descending===true) {
                    switch(true) {
                        case a[1].property > b[1].itemName:
                            return -1;
                        case a[1].itemName === b[1].itemName:
                            return 0;
                        default: 
                            return 1;
                    }
                }
                else {
                    switch(true) {
                        case a[1].itemName > b[1].itemName:
                            return 1;
                        case a[1].itemName === b[1].itemName:
                            return 0;
                        default: 
                            return -1;
                    }
                }
            }));           
        }
    }
   
    toggleAllSelected(e: any) {
        if(!e.target.checked) {
            this.selectedRows.clear();
        }
        else {
            this.rowMap.forEach((row: SelectViewItem) => {
                this.selectedRows.set(row.id,row.id);
            });
        }
        this.pushSelectedToState();
        this.doOutcome("OnSelect");
        this.forceUpdate();
    }
    //////////////////////////////////////////////////////////////
    // Constructs a react component tree from the TreeViewItem map
    //////////////////////////////////////////////////////////////
    buildTableHeaders() : Array<any>{
        const elements: Array<any> = [];
        
        if(this.model.multiSelect === true) {
            elements.push(
                <th 
                    className = "select-view-table-check-header"
                >
                    <input
                        className="select-view-check-box" 
                        type="checkbox"
                        onClick={this.toggleAllSelected}
                    /> 
                </th>
            )
        }

        if(this.getAttribute("ButtonPositionRight","false").toLowerCase() !== "true"){
            elements.push(
                <th 
                    className = "select-view-table-header"
                />
            );
        }

        if(this.colMap) {
            this.colMap.forEach((col: FlowDisplayColumn) => {
                if(col.visible === true){
                    elements.push(
                        <SelectViewHeader 
                            key={col.developerName}
                            root={this}
                            colId={col.developerName}
                            ref={(element: SelectViewHeader) => {this.setCol(col.developerName ,element)}}
                        />
                    );
                }
            });
        }

        if(this.getAttribute("ButtonPositionRight","false").toLowerCase() === "true"){
            elements.push(
                <th 
                    className = "select-view-table-header"
                />
            );
        }
        
        return elements;
    }

    buildTable() : Array<any>{
        const elements: Array<any> = [];
        if(this.rowMap) {
            this.rowMap.forEach((node: SelectViewItem) => {
                elements.push(
                    <SelectViewRow 
                        key={node.id}
                        root={this}
                        rowId={node.id}
                        ref={(element: SelectViewRow) => {this.setRow(node.id ,element)}}
                    />
                );
            });
        }
        
        return elements;
    }

    filterTable() {
        let criteria: string = this.searchBox?.value;
        this.matchingRows.clear();
        if(criteria?.length > 0) {
            //traverse all nodes
            this.rowMap.forEach((item: SelectViewItem) => {
                item.columns.forEach((col: SelectViewColumn) => {
                    if(col.value?.toString().toLowerCase()?.indexOf(criteria.toLowerCase()) >= 0 && this.matchingRows.size < 50) {
                        this.matchingRows.set(item.id,item.id);
                    }
                });
            });
        }
        this.forceUpdate();
    }

    filterTableClear() {
        this.searchBox.value = "";
        this.filterTable();
    }

    showContextMenu(e: any) {
        e.preventDefault();
        e.stopPropagation();
        let listItems: Map<string , any> = new Map();
        if(this.contextMenu) {
            Object.keys(this.outcomes).forEach((key: string) => {
                const outcome: FlowOutcome = this.outcomes[key];
                if (outcome.isBulkAction === true && outcome.developerName !== "OnSelect" && outcome.developerName.toLowerCase().startsWith("cm")) {
                    listItems.set(outcome.developerName,(
                        <li 
                            className="cm-item"
                            title={outcome.label || key}
                            onClick={(e: any) => {e.stopPropagation(); this.doOutcome(key, undefined)}}
                        >
                            <span
                                className={"glyphicon glyphicon-" + (outcome.attributes["icon"]?.value || "plus") + " cm-item-icon"} />
                            <span
                                className={"cm-item-label"}
                            >
                                {outcome.label || key}
                            </span>
                        </li>
                    ));
                }
            });
            this.contextMenu.show(e.clientX, e.clientY,listItems);   
            this.forceUpdate();
        }
    }

    async hideContextMenu() {
        this.contextMenu.hide();
    }
    

    

    render() {
        
        if(this.loadingState !== eLoadingState.ready) {
            return this.lastContent;
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

        let contextMenu = (
            <ContextMenu 
                parent={this}
                ref={(element: ContextMenu) => {this.contextMenu=element}}
            />
        );

        //construct table REACT elements
        this.colElements = this.buildTableHeaders();
        this.rowElements = this.buildTable();
        

        //handle classes attribute and hidden and size
        let classes: string = "treeview " + this.getAttribute("classes","");
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
        
        let headerButtons: Array<any> = this.buildHeaderButtons();
      
        let title:  string = this.model.label || "";
        
        this.lastContent = (
            <div
                className={classes}
                style={style}
                onContextMenu={this.showContextMenu}
            >
                {contextMenu}
                {modal}
                {msgbox}
                <div
                    className="select-view-header"
                >
                    <div
                        className="select-view-header-title-wrapper"
                    >
                        <span
                            className="select-view-header-title"
                        >
                            {title}
                        </span>
                    </div>
                    <div
                        className="select-view-header-search"
                    >
                        <input
                            className="select-view-header-search-input"
                            ref={(element: HTMLInputElement) => {this.setSearchBox(element)}}
                        >
                        </input>
                        <span 
                            className={"glyphicon glyphicon-search select-view-header-search-button"}
                            onClick={this.filterTable}
                        />
                        <span 
                            className={"glyphicon glyphicon-remove select-view-header-search-button"}
                            onClick={this.filterTableClear}
                        />

                    </div>
                    <div
                        className="select-view-header-buttons"
                    >
                        {headerButtons}
                    </div>
                </div>
                <div
                    className="select-view-body"
                >
                    <table
                        className="select-view-table"
                    >
                        <thead>
                            <tr
                                className="select-view-table-headers"
                            >
                                {this.colElements}
                            </tr>
                        </thead>
                        <tbody>
                            {this.rowElements}
                        </tbody>
                    </table>
                    
                </div>
                
            </div>
        );
        return this.lastContent;
    }
    /*<div
                        className="table-view-headers"
                    >
                        {this.colElements}
                    </div>
                    <div 
                        className="table-view-scroller" 
                    >
                        <div
                            className="table-view-scroller-body"
                        >
                            {this.rowElements}
                        </div>
                    </div>
                    */

}

manywho.component.register('SelectView', SelectView);