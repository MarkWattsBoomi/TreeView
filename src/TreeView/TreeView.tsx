import React, { CSSProperties } from 'react';

import { modalDialogButton, ModalDialog, eLoadingState, FlowComponent, FlowObjectDataArray, FlowObjectData, FlowObjectDataProperty, FlowOutcome, ePageActionType, ePageActionBindingType, eContentType } from 'flow-component-model';
import '../css/treeview.css';
import { MessageBox } from '../MessageBox/MessageBox';
import TreeViewNode from './TreeViewNode';
import TreeViewItem from './TreeViewItem';
import ContextMenu from '../ContextMenu/ContextMenu';

//declare const manywho: IManywho;
declare const manywho: any;

export enum eDebugLevel {
    error = 0,
    warning = 1,
    info = 2,
    verbose = 3
}

export default class TreeView extends FlowComponent {
    version: string="1.0.0";
    context: any;
    debugLevel: eDebugLevel = eDebugLevel.error;

    selectedNodeId: number;
    nodeTree: Map<number,TreeViewItem>;
    nodeElementTree: Array<any>;
    treeViewNodes: Map<number,TreeViewNode> = new Map();
    flatTree: Map<number,TreeViewItem> = new Map();

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

    draggedNode: number;

    contextMenu: any;

    defaultExpanded: boolean = false;
    expansionPath: number[] = [];
    filterExpansionPath: number[] = [];

    matchingNodes:  number[];

    lastContent: any = (<div></div>);

    searchBox: HTMLInputElement;

    maxResults: number = 30;
   
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
        this.convertNode = this.convertNode.bind(this);
        this.flowMoved = this.flowMoved.bind(this);
        this.doOutcome = this.doOutcome.bind(this);
        this.expand = this.expand.bind(this);
        this.collapse = this.collapse.bind(this);
        this.setNode = this.setNode.bind(this);
        this.showContextMenu = this.showContextMenu.bind(this);
        this.hideContextMenu = this.hideContextMenu.bind(this);  
        this.filterTree = this.filterTree.bind(this);
        this.filterTreeClear = this.filterTreeClear.bind(this);
        this.expandToSelected = this.expandToSelected.bind(this);
        this.expandToFilter = this.expandToFilter.bind(this);
        this.searchKeyEvent = this.searchKeyEvent.bind(this);

        let dbl: number = parseInt(this.getAttribute("DebugLevel","0"));
              this.debugLevel = dbl || eDebugLevel.error ;
        this.debug("Debug Level = " + this.debugLevel, eDebugLevel.info);

        this.maxResults = parseInt(this.getAttribute("MaxSearchResults","30"));
    
        this.defaultExpanded=this.getAttribute("StartExpanded","false").toLowerCase() === "true";
    }

    debug(message: string, debugLevel: eDebugLevel) {
        if(debugLevel.valueOf() <= this.debugLevel.valueOf()) {
            console.log(message);
        }
    }

    async flowMoved(msg: any) {
        console.log("flow moved");
        this.buildTreeFromModel(this.model.dataSource.items,0);
        const state: any = this.getStateValue();
        this.selectedNodeId = state?.properties["ITEM_ID"]?.value as number;
        this.forceUpdate();
    }

    async componentDidMount() {
        //will get this from a component attribute
        await super.componentDidMount();
        (manywho as any).eventManager.addDoneListener(this.flowMoved, this.componentId);
        // build tree
        this.buildTreeFromModel(this.model.dataSource.items,0);
        
        const state: any = this.getStateValue();
        this.selectedNodeId = state?.properties["ITEM_ID"]?.value as number;
        this.forceUpdate();
    }

    async componentWillUnmount() {
        await super.componentWillUnmount();
        (manywho as any).eventManager.removeDoneListener(this.componentId);
        this.debug("unmount treeview", eDebugLevel.verbose);
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
            this.filterTree();
        }
    }

    setNode(key: number, element: TreeViewNode) {
        if(element) {
            this.treeViewNodes.set(key,element);
        }
        else {
            if(this.treeViewNodes.has(key)) {
                this.treeViewNodes.delete(key);
            }
        }
    }

    getNode(key: number): TreeViewNode {
        return this.treeViewNodes.get(key);
    }

    convertNode(source: FlowObjectData) : FlowObjectData {
        let result: FlowObjectData;
        if(this.model.dataSource.items && this.model.dataSource.items.length > 0) {
            let targettype: string = this.model.dataSource.items[0].developerName;
            result = FlowObjectData.newInstance(targettype);
            Object.values(source.properties).forEach((prop: FlowObjectDataProperty) => {
                if(prop.contentType !== eContentType.ContentObject && prop.contentType !== eContentType.ContentList) {
                    result.addProperty(FlowObjectDataProperty.newInstance(prop.developerName, prop.contentType,prop.value));
                }
            });
        }
        return result;
    }

    async doOutcome(outcomeName: string, node: TreeViewItem) {
        if(outcomeName.toLowerCase() === "onselect" || 
            (this.outcomes[outcomeName]?.pageActionBindingType !== ePageActionBindingType.NoSave 
                && node )) 
        {
            const convertedNode: FlowObjectData = this.convertNode(node.objectData);
            await this.setStateValue(convertedNode);


            this.selectedNodeId = node.itemId;
            this.forceUpdate();
            if(outcomeName.toLowerCase() === "onselect") {
                if(this.outcomes[outcomeName]) {
                    await this.triggerOutcome(outcomeName);
                } 
            }
        }
        if(this.outcomes[outcomeName] && outcomeName.toLowerCase() !== "onselect") {
            await this.triggerOutcome(outcomeName);
        }
    }
   

    async expand() {
        console.log("expand");
        this.treeViewNodes.forEach((node: TreeViewNode) => {
            node.expanded=true;
            node.forceUpdate();
        });
    }

    async collapse() {
        console.log("collapse");
        this.treeViewNodes.forEach((node: TreeViewNode) => {
            node.expanded=false;
            node.forceUpdate();
        });
    }

    //adds the parent path for the selected node
    expandToSelected(){
        this.expansionPath = [];
        if(this.selectedNodeId){
            //get the lowest item from nodeTree
            let nodeItem: TreeViewItem = this.flatTree.get(this.selectedNodeId);
            let topParent: number = nodeItem.itemId;
            while(nodeItem){
                nodeItem = this.flatTree.get(nodeItem.parentId);
                if(nodeItem){
                    this.expansionPath = this.expansionPath.concat(nodeItem.itemId);
                    this.expansionPath = this.expansionPath.filter((item, pos) => this.expansionPath.indexOf(item) === pos);
                }
            }
        }
    }

    expandToFilter(){
        this.filterExpansionPath = [];
        
        this.matchingNodes?.forEach((nodeId: number) => {
            let nodeItem: TreeViewItem = this.flatTree.get(nodeId);
            let topParent: number = nodeItem.itemId;
            while(nodeItem){
                nodeItem = this.flatTree.get(nodeItem.parentId);
                if(nodeItem){
                    this.filterExpansionPath = this.filterExpansionPath.concat(nodeItem.itemId);
                    this.filterExpansionPath = this.filterExpansionPath.filter((item, pos) => this.filterExpansionPath.indexOf(item) === pos);
                }
            }
        });
    }

    onDrag(e: any, nodeId: number) {
        console.log("drag " + nodeId);
        e.stopPropagation();
        const srcNode = e.currentTarget.getAttribute("data-node");
        if(srcNode) {
            e.dataTransfer.effectAllowed = "all";
            e.dataTransfer.setData('node', nodeId);
            this.draggedNode = nodeId;
        }
        else {
            e.dataTransfer.effectAllowed = "none";
            this.draggedNode = undefined;
        }
    }

    isPermissableTargetQueue(movingNode: number, potentialParentNode: number) : boolean {
        if(movingNode === potentialParentNode) {
            return false;
        }
        if(this.isChildOf(potentialParentNode,movingNode)) {
            return false;
        }
        if(this.isParentOf(potentialParentNode,movingNode)) {
            return false;
        }
        return true;
    }

    isChildOf( potentialParentNode: number, movingNode: number) : boolean {
        return this.treeViewNodes.get(movingNode).props.parentId === potentialParentNode;
    }

    isParentOf( potentialParentNode: number, movingNode: number ) : boolean {
        return this.treeViewNodes.get(potentialParentNode).props.parentId === movingNode;
    }

    onDragEnter(e: any) {
        e.preventDefault();
        e.stopPropagation();
    }

    onDragLeave(e: any) {
        e.preventDefault();
        e.stopPropagation();
        const queue = e.currentTarget.getAttribute("data-node");
        e.currentTarget.classList.remove("can-drop");
        e.currentTarget.classList.remove("cannot-drop");
    }

    onDragOver(e: any) {
        e.preventDefault();
        e.stopPropagation();
        const potentialParent: number  = e.currentTarget.getAttribute("data-node");
        const permissableTarget: boolean = this.isPermissableTargetQueue(this.draggedNode,potentialParent);
        if(!permissableTarget) {
            e.dataTransfer.dropEffect="none"; 
            e.currentTarget.classList.add("cannot-drop");
        }
        else {
            e.dataTransfer.dropEffect="move";
            e.currentTarget.classList.add("can-drop");
        }
    }

    async onDrop(e: any) {
        const srcNode = e.dataTransfer.getData('node');
        const tgtNode = e.currentTarget.getAttribute("data-node");
    
        e.preventDefault();
        e.stopPropagation();
        
        this.draggedNode = undefined;
        e.dataTransfer.clearData();
        e.currentTarget.classList.remove("can-drop");
        e.currentTarget.classList.remove("cannot-drop");

        if(srcNode &&  srcNode !== tgtNode) {
            await this.moveNode(srcNode, tgtNode);
            this.forceUpdate();
        }
        
    }

    async moveNode(srcNode: string, targetNode: string) {
        console.log("move " + srcNode + " into " + targetNode);
    }
   

    buildHeaderButtons() : Array<any> {
        let content : any = [];

        let lastOrder: number = 0;
        let addedExpand: boolean = false;
        let addedContract: boolean = false;
        Object.keys(this.outcomes).forEach((key: string) => {
            const outcome: FlowOutcome = this.outcomes[key];
            if(outcome.order > 10 && addedExpand===false){
                content.push(
                    <span 
                        key="EXPAND"
                        className={"glyphicon glyphicon-plus treeview-header-button"} 
                        title={"Expand All"}
                        onClick={this.expand}
                    />
                );
                addedExpand=true;
            }
            if(outcome.order > 20 && addedContract===false){
                content.push(
                    <span 
                        key="CONTRACT"
                        className={"glyphicon glyphicon-minus treeview-header-button"} 
                        title={"Collapse All"}
                        onClick={this.collapse}
                    />
                );
                addedContract=true;
            }
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
        if(addedExpand===false){
            content.push(
                <span 
                    key="EXPAND"
                    className={"glyphicon glyphicon-plus treeview-header-button"} 
                    title={"Expand All"}
                    onClick={this.expand}
                />
            );
            addedExpand=true;
        }
        if(addedContract===false){
            content.push(
                <span 
                    key="CONTRACT"
                    className={"glyphicon glyphicon-minus treeview-header-button"} 
                    title={"Collapse All"}
                    onClick={this.collapse}
                />
            );
            addedContract=true;
        }
        return content;
    }

    

    ///////////////////////////////////////////////////////////////////////////////////////////
    // constructs the nodeTree and a flat a map of TreeViewItems from the model datasource data
    ///////////////////////////////////////////////////////////////////////////////////////////
    buildTreeFromModel(items : FlowObjectData[], level: number){
        this.nodeTree = new Map();
        this.flatTree = new Map();
        
        items.forEach((item: FlowObjectData) => {
            //construct TreeViewItem
            let node = new TreeViewItem();
            node.itemLevel = level;
            node.itemId = item.properties["ITEM_ID"]?.value as number;
            node.parentId = item.properties["PARENT_ID"]?.value as number
            node.itemName = item.properties["ITEM_NAME"]?.value as string;
            node.itemDescription = item.properties["ITEM_DESCRIPTION"]?.value as string;
            node.itemStatus = item.properties["ITEM_STATUS"]?.value as string;
            node.itemType = item.properties["ITEM_TYPE"]?.value as string;
            node.children = new Map();
            node.objectData = item;

            //add to flat tree for easy searching
            this.flatTree.set(node.itemId,node);
        });

        this.flatTree = new Map(Array.from(this.flatTree).sort((a: any,b: any) => {
            switch(true) {
                case a[1].itemName > b[1].itemName:
                    return 1;
                case a[1].itemName === b[1].itemName:
                    return 0;
                default: 
                    return -1;

            }
        }));

        this.flatTree.forEach((item: TreeViewItem) => {

            let parent = this.flatTree.get(item.parentId);
            if(parent) {
                item.setItemLevel(parent.itemLevel + 1);
                parent.children.set(item.itemId, item);
            }
            else {
                // my parent isn't in tree yet, just add me at root
                item.setItemLevel(level);
                this.nodeTree.set(item.itemId, item);
            }
        });

        // now all items are in tree re-iterate looking for parents
        this.nodeTree.forEach((topLevel: TreeViewItem) => {
            //we wont do this if the top level has a 0 or -1 parent id or the parent id= itme id
            let parent = this.flatTree.get(topLevel.parentId)
            if(parent && !(parent.itemId===topLevel.itemId)) {
                topLevel.setItemLevel(parent.itemLevel + 1);
                parent.children.set(topLevel.itemId, topLevel);
                this.nodeTree.delete(topLevel.itemId);
            }
        });

        //now tree is completely built, re-iterate sorting
        this.nodeTree.forEach((topLevel: TreeViewItem) => {
            this.sortTreeNodeChildren(topLevel,false);
        });
    }

    sortTreeNodeChildren(node: TreeViewItem, descending?: boolean) {
        if (node.children.size > 0) {
            node.children = new Map(Array.from(node.children).sort((a: any,b: any) => {
                if(descending && descending===true) {
                    switch(true) {
                        case a[1].itemName > b[1].itemName:
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
            node.children.forEach((child: TreeViewItem) => {
                this.sortTreeNodeChildren(child);
            });
            
        }
    }
   
    //////////////////////////////////////////////////////////////
    // Constructs a react component tree from the TreeViewItem map
    //////////////////////////////////////////////////////////////
    buildTree(nodes: Map<number, TreeViewItem>) : Array<any>{
        this.expandToSelected();
        this.expandToFilter();
        const elements: Array<any> = [];
        if(nodes) {
            nodes.forEach((node: TreeViewItem) => {
                let children: Array<any> = this.buildTree(node.children);
                let expanded: boolean = this.defaultExpanded
                if(this.expansionPath.indexOf(node.itemId)>=0 || this.filterExpansionPath.indexOf(node.itemId)>=0){
                    expanded=true;
                }
                elements.push(
                    <TreeViewNode 
                        key={node.itemId}
                        root={this}
                        nodeId={node.itemId}
                        parentId={node.parentId}
                        children={children}
                        expanded={expanded}
                        allowRearrange={!this.model.readOnly}
                        ref={(element: TreeViewNode) => {this.setNode(node.itemId ,element)}}
                        
                    />
                );
            });
        }
        
        return elements;
    }

    filterTree() {
        let maxResults: number = 30;
        let criteria: string = this.searchBox?.value;
        if(criteria?.length > 0) {
            if(criteria.length < 4) {
                let content: any = (
                    <span>Searching with less than 4 characters is not permitted.</span>
                );
                this.matchingNodes = undefined;
                this.showMessageBox("Search Criteria Restriction",content,this.hideMessageBox,[new modalDialogButton("Ok",this.hideMessageBox)]);
            }
            else {
                this.matchingNodes = [];
                //traverse all nodes
                this.flatTree.forEach((node: TreeViewItem) => {
                    if((node.itemName.toLowerCase().indexOf(criteria.toLowerCase()) >= 0 || node.itemDescription.toLowerCase().indexOf(criteria.toLowerCase()) >= 0)) {
                        this.matchingNodes = this.matchingNodes.concat(node.itemId);
                        this.matchingNodes = this.matchingNodes.filter((item, pos) => this.matchingNodes.indexOf(item) === pos);
                    }
                });
                this.debug(this.matchingNodes.toString(), eDebugLevel.verbose);
                switch(true) {
                    case this.matchingNodes.length >= this.maxResults:
                        let totResults: number = this.matchingNodes.length;
                        this.matchingNodes = this.matchingNodes.slice(0,this.maxResults);
                        this.showMessageBox("Search Results Truncated",
                            (<div>
                                <span>{"The search returned too many results"}</span>
                                <span>{"only the first " + this.maxResults + " of a possible " + totResults + " are being displayed."}</span>
                            </div>),
                            this.hideMessageBox,[new modalDialogButton("Ok",this.hideMessageBox)]
                        );
                        break;

                    case this.matchingNodes.length === 0:
                        this.showMessageBox("No Results",
                            (<span>{"The search returned no matches, please refine your search and try again."}</span>),
                            this.hideMessageBox,[new modalDialogButton("Ok",this.hideMessageBox)]
                        );
                        break;
                    default:
                        //do nothing
                        break;
                }
            }
        }
        else {
            this.matchingNodes = undefined;
        }
        this.forceUpdate();
    }

    filterTreeClear() {
        this.searchBox.value = "";
        this.filterTree();
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

        //construct tree REACT elements
        
        this.nodeElementTree = this.buildTree(this.nodeTree);
        

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
                    className="treeview-header"
                >
                    <div
                        className="treeview-header-title-wrapper"
                    >
                        <span
                            className="treeview-header-title"
                        >
                            {title}
                        </span>
                    </div>
                    <div
                        className="treeview-header-search"
                    >
                        <input
                            className="treeview-header-search-input"
                            ref={(element: HTMLInputElement) => {this.setSearchBox(element)}}
                        >
                        </input>
                        <span 
                            className={"glyphicon glyphicon-search treeview-header-search-button"}
                            onClick={this.filterTree}
                        />
                        <span 
                            className={"glyphicon glyphicon-remove treeview-header-search-button"}
                            onClick={this.filterTreeClear}
                        />

                    </div>
                    <div
                        className="treeview-header-buttons"
                    >
                        {headerButtons}
                    </div>
                </div>
                <div 
                    className="treeview-scroller" 
                >
                    <div
                        className="treeview-body"
                    >
                        {this.nodeElementTree}
                    </div>
                </div>
            </div>
        );
        return this.lastContent;
    }

}

manywho.component.register('TreeView', TreeView);