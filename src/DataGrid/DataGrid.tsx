import React, { CSSProperties } from 'react';

import {  eLoadingState, FlowComponent, FlowObjectDataArray, FlowObjectData,  FlowOutcome,  ePageActionBindingType, eContentType, FlowDisplayColumn, FlowField } from 'flow-component-model';
import '../css/DataGrid.css';
import { eDebugLevel } from '..';
import { DataGridColumn, DataGridItem } from './DataGridItem';
import DataGridRow from './DataGridRow';
import DataGridHeader from './DataGridHeader';
import DataGridFooter from './DataGridFooter';


//declare const manywho: IManywho;
declare const manywho: any;

export default class DataGrid extends FlowComponent {
    version: string="1.0.0";
    context: any;
    debugLevel: eDebugLevel = eDebugLevel.error;

    selectedRows: Map<string,string> = new Map();
    modifiedRows: Map<string,string> = new Map();
    rowMap: Map<string,DataGridItem> = new Map();
    rowComponents: Map<string,DataGridRow> = new Map();
    rowElements: Array<DataGridRow> = [];
    
    colMap: Map<string,FlowDisplayColumn> = new Map();
    colComponents: Map<string,DataGridHeader> = new Map();
    colElements: Array<DataGridHeader> = [];

    footerComponent: DataGridFooter;
    footerElement: any;

    
    matchingRows:  Map<string,string> = new Map();

    lastContent: any = (<div></div>);

    searchBox: HTMLInputElement;
   
        

    constructor(props: any) {
        super(props);

        this.handleMessage = this.handleMessage.bind(this);
        this.handleMessage = this.handleMessage.bind(this);
        this.flowMoved = this.flowMoved.bind(this);
        this.doOutcome = this.doOutcome.bind(this);
        this.setRow = this.setRow.bind(this); 
        this.setFooter = this.setFooter.bind(this); 
        this.filterTable = this.filterTable.bind(this);
        this.filterTableClear = this.filterTableClear.bind(this);
        this.searchKeyEvent = this.searchKeyEvent.bind(this);
        this.refreshSelectedFromState = this.refreshSelectedFromState.bind(this);

        let dbl: number = parseInt(this.getAttribute("DebugLevel","0"));
              this.debugLevel = dbl || eDebugLevel.error ;
        console.log("Debug Level = " + this.debugLevel);
    }

    debug(message: string, debugLevel: eDebugLevel) {
        if(debugLevel.valueOf() <= this.debugLevel.valueOf()) {
            console.log(message);
        }
    }

    async flowMoved(xhr: any, request: any) {
        let me: any = this;
        if(xhr.invokeType==="FORWARD") {
            if(this.loadingState !== eLoadingState.ready){
                window.setTimeout(function() {me.flowMoved(xhr, request)},500);
            }
            else {
                this.debug("flow moved",eDebugLevel.verbose);
                this.buildTableFromModel(this.model.dataSource.items);
                //await this.pushModelToState();
                this.refreshSelectedFromState();
                this.forceUpdate();
            }
        }
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

    setRow(key: string, element: DataGridRow) {
        if(element) {
            this.rowComponents.set(key,element);
        }
        else {
            if(this.rowComponents.has(key)) {
                this.rowComponents.delete(key);
            }
        }
    }

    setFooter(element: DataGridFooter) {
        this.footerComponent = element;
    }

    setCol(key: any, element: DataGridHeader) {
        if(element) {
            this.colComponents.set(key,element);
        }
        else {
            if(this.rowComponents.has(key)) {
                this.rowComponents.delete(key);
            }
        }
    }

    getCol(key: string): DataGridRow {
        return this.rowComponents.get(key);
    }



    async doOutcome(outcomeName: string, selectedItem? : string) {
        //if there's a selectedItem then this must be being triggered at a row level.
        //set the single item field if defined
        if(selectedItem) {
            //we should set the component's single selected item by adding it to the emptied list
            this.selectedRows.clear();
            if(selectedItem) {
                this.selectedRows.set(selectedItem,selectedItem);
            }
            //now if there's a RowLevelState attribute defined, get it and update it with the selected item's object data
            if(this.getAttribute("RowLevelState","").length>0) {
                let val: FlowField = await this.loadValue(this.getAttribute("RowLevelState"));
                if (val) {
                    val.value = this.rowMap.get(selectedItem).objectData as FlowObjectData;
                    await this.updateValues(val);
                }
            }
        }
        
        //if it's on select, change or the outcome should save values then store something to the state
        if(outcomeName === "OnSelect" || 
            outcomeName === "OnChange" || 
            this.outcomes[outcomeName]?.pageActionBindingType !== ePageActionBindingType.NoSave) {
                //the model's type & multiselect defines what we save to the state
                //if it's a list type state
                if(this.getStateValueType() === eContentType.ContentList){
                    //if it's OnChange then add item to modified list
                    if(outcomeName === "OnChange"){
                        this.modifiedRows.set(selectedItem,selectedItem);
                        console.log("added " + selectedItem + " to modified");
                        //if multi select then we are working on a selected subset
                        if(this.model.multiSelect === true) {
                            //we only store subset
                            await this.pushModifiedToState();
                        }
                        else {
                            // we store entire model to state
                            await this.pushModelToState();
                        }
                    }
                    else {
                        //if multi select then we are working on a selected subset
                        if(this.model.multiSelect === true) {
                            //we only store subset
                            await this.pushSelectedToState();
                        }
                        else {
                            // we store entire model to state
                            await this.pushModelToState();
                        }
                    }
                    
                } 
                else {
                    // its a single object state
                    
                    await this.pushSelectedToState();
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

    async rowValueChanged(rowId: string, colName: string, oldVal: string, newVal: any) {
        console.log("proj=" + this.rowMap.get(rowId).objectData.properties["project_number"].value + " ," +rowId + "," + colName +" = " + oldVal + "=>" +  newVal);

        this.rowMap.get(rowId).objectData.properties[colName].value = newVal;

        await this.doOutcome("OnChange",rowId);
    }

    async pushModelToState() {
        console.log("pushing entire model to state");
        let updateData: FlowObjectDataArray = new FlowObjectDataArray();
        this.rowMap.forEach((item: DataGridItem) => {
            if(this.modifiedRows?.has(item.id)){
                item.objectData.isSelected=true;
            }
            else {
                item.objectData.isSelected=false; 
            }
            updateData.addItem(item.objectData);
        });
        await this.setStateValue(updateData);
    }

    async pushModifiedToState() {
        console.log("pushing modified to state");
        let updateData: FlowObjectDataArray = new FlowObjectDataArray();
        this.rowMap.forEach((item: DataGridItem) => {
            if(this.modifiedRows?.has(item.id)){
                item.objectData.isSelected=true;
                updateData.addItem(item.objectData);
            }            
        });
        await this.setStateValue(updateData);
    }

    async pushSelectedToState() {
        console.log("pushing selected to state");
        let updateData: FlowObjectDataArray = new FlowObjectDataArray();
        this.rowMap.forEach((item: DataGridItem) => {
            if(this.selectedRows?.has(item.id)){
                item.objectData.isSelected=true;
                updateData.addItem(item.objectData);
            }
        });
        await this.setStateValue(updateData);
    }
   
    buildHeaderButtons() : Array<any> {
        let content : any = [];

        let lastOrder: number = 0;
        let addedExpand: boolean = false;
        let addedContract: boolean = false;
        Object.keys(this.outcomes).forEach((key: string) => {
            const outcome: FlowOutcome = this.outcomes[key];
            
            if (outcome.isBulkAction && outcome.developerName !== "OnSelect" && outcome.developerName !== "OnChange" && !outcome.developerName.toLowerCase().startsWith("cm")) {
                content.push(
                    <div
                        className={"data-grid-header-button"}
                        key={key}
                        title={outcome.label || key}
                        onClick={(e: any) => {this.doOutcome(key, undefined)}}
                    >
                        <span 
                            className={"glyphicon glyphicon-" + (outcome.attributes["icon"]?.value || "plus") + " data-grid-header-button-icon"} 
                        />
                        <span 
                            className={"data-grid-header-button-label"} 
                        >
                            {outcome.label || key}
                        </span>
                    </div>
                );
            }
        });
        
        return content;
    }

    

    ///////////////////////////////////////////////////////////////////////////////////////////
    // constructs the nodeTree and a flat a map of data-gridItems from the model datasource data
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
            let node = new DataGridItem();
            node.id = item.internalId;

            this.colMap.forEach((col:FlowDisplayColumn) => {
                node.columns.set(col.developerName, new DataGridColumn(col.developerName,col.label, col.contentType, item.properties[col.developerName]?.value as any));
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
   
    //////////////////////////////////////////////////////////////
    // Constructs a react component tree from the data-gridItem map
    //////////////////////////////////////////////////////////////
    buildTableHeaders() : Array<any>{
        const elements: Array<any> = [];
        
        if(this.getAttribute("ButtonPositionRight","false").toLowerCase() !== "true"){
            elements.push(
                <th 
                    className = "data-grid-table-header"
                />
            );
        }

        if(this.colMap) {
            this.colMap.forEach((col: FlowDisplayColumn) => {
                if(col.visible === true){
                    elements.push(
                        <DataGridHeader 
                            key={col.developerName}
                            root={this}
                            colId={col.developerName}
                            ref={(element: DataGridHeader) => {this.setCol(col.developerName ,element)}}
                        />
                    );
                }
            });
        }

        if(this.getAttribute("ButtonPositionRight","false").toLowerCase() === "true"){
            elements.push(
                <th 
                    className = "data-grid-table-header"
                />
            );
        }
        
        return elements;
    }

    buildTable() : Array<any>{
        const elements: Array<any> = [];
        if(this.rowMap.size > 0) {
            if(this.rowMap) {
                this.rowMap.forEach((node: DataGridItem) => {
                    elements.push(
                        <DataGridRow 
                            key={node.id}
                            root={this}
                            rowId={node.id}
                            ref={(element: DataGridRow) => {this.setRow(node.id ,element)}}
                        />
                    );
                });
            }

            //add padder row
            elements.push(
                <tr
                className="data-grid-table-filler-row"
                />
            );
        }
        else {
            elements.push(
                <tr
                    style={{height: 'calc(100% + 1px)'}}
                />
            );
        }
        
        
        return elements;
    }

    buildFooter() : Array<any>{
        const elements: Array<any> = [];
        elements.push(
            <DataGridFooter 
                root={this}
                ref={(element: DataGridFooter) => {this.setFooter(element)}}
            />
        );
        return elements;
    }

    filterTable() {
        let criteria: string = this.searchBox?.value;
        this.matchingRows.clear();
        if(criteria?.length > 0) {
            //traverse all nodes
            this.rowMap.forEach((item: DataGridItem) => {
                item.columns.forEach((col: DataGridColumn) => {
                    if(col.value?.toLowerCase().indexOf(criteria.toLowerCase()) >= 0 && this.matchingRows.size < 50) {
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

    render() {
        
        if(this.loadingState !== eLoadingState.ready) {
            return this.lastContent;
        }
        
        //construct table REACT elements
        this.colElements = this.buildTableHeaders();
        this.rowElements = this.buildTable();
        this.footerElement = this.buildFooter();

        //handle classes attribute and hidden and size
        let classes: string = "data-grid " + this.getAttribute("classes","");
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
            >
                <div
                    className="data-grid-header"
                >
                    <div
                        className="data-grid-header-title-wrapper"
                    >
                        <span
                            className="data-grid-header-title"
                        >
                            {title}
                        </span>
                    </div>
                    <div
                        className="data-grid-header-search"
                    >
                        <input
                            className="data-grid-header-search-input"
                            ref={(element: HTMLInputElement) => {this.setSearchBox(element)}}
                        >
                        </input>
                        <span 
                            className={"glyphicon glyphicon-search data-grid-header-search-button"}
                            onClick={this.filterTable}
                        />
                        <span 
                            className={"glyphicon glyphicon-remove data-grid-header-search-button"}
                            onClick={this.filterTableClear}
                        />

                    </div>
                    <div
                        className="data-grid-header-buttons"
                    >
                        {headerButtons}
                    </div>
                </div>
                <div
                    className="data-grid-body"
                >
                    <table
                        className="data-grid-table"
                    >
                        <thead
                            className="data-grid-table-head"
                        >
                            <tr
                                className="data-grid-table-headers"
                            >
                                {this.colElements}
                            </tr>
                        </thead>
                        <tbody
                            className="data-grid-table-body"
                        >
                            {this.rowElements}
                        </tbody>
                        <tfoot
                            className="data-grid-table-footer"
                        >
                            {this.footerElement}
                        </tfoot>
                    </table>
                </div>
                
            </div>
        );
        return this.lastContent;
    }

}

manywho.component.register('DataGrid', DataGrid);