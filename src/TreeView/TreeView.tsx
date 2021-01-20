import React, { CSSProperties } from 'react';

import { modalDialogButton, eLoadingState, FlowComponent, FlowObjectData, FlowObjectDataProperty, FlowOutcome, ePageActionBindingType, eContentType, FlowMessageBox } from 'flow-component-model';
import '../css/treeview.css';
import TreeViewNode from './TreeViewNode';
import TreeViewItem from './TreeViewItem';
import FlowContextMenu from 'flow-component-model/lib/Dialogs/FlowContextMenu';

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

    draggedNode: number;

    contextMenu: FlowContextMenu;

    defaultExpanded: boolean = false;
    expansionPath: number[] = [];
    filterExpansionPath: number[] = [];

    matchingNodes:  number[];

    lastContent: any = (<div></div>);

    searchBox: HTMLInputElement;

    maxResults: number = 30;
    absoluteMaxResults: number = 1000;

    messageBox: FlowMessageBox;

    constructor(props: any) {
        super(props);

        this.handleMessage = this.handleMessage.bind(this);
        this.convertNode = this.convertNode.bind(this);
        this.flowMoved = this.flowMoved.bind(this);
        this.doOutcome = this.doOutcome.bind(this);
        this.expand = this.expand.bind(this);
        this.collapse = this.collapse.bind(this);
        this.setNode = this.setNode.bind(this);
        this.showContextMenu = this.showContextMenu.bind(this);
        this.hideContextMenu = this.hideContextMenu.bind(this);  
        this.showAll = this.showAll.bind(this);
        this.filterTree = this.filterTree.bind(this);
        this.filterTreeClear = this.filterTreeClear.bind(this);
        this.expandToSelected = this.expandToSelected.bind(this);
        this.expandToFilter = this.expandToFilter.bind(this);
        this.searchKeyEvent = this.searchKeyEvent.bind(this);
        this.drawResults = this.drawResults.bind(this);

        this.dbg = this.dbg.bind(this);

        let dbl: number = parseInt(this.getAttribute("DebugLevel","0"));
              this.debugLevel = dbl || eDebugLevel.error ;
        this.debug("Debug Level = " + this.debugLevel, eDebugLevel.info);

        this.maxResults = parseInt(this.getAttribute("MaxSearchResults","30"));
        this.absoluteMaxResults = parseInt(this.getAttribute("AbsoluteMaxSearchResults","1000"));
    
        this.defaultExpanded=this.getAttribute("StartExpanded","false").toLowerCase() === "true";
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
                this.buildTreeFromModel(this.model.dataSource.items,0);
                this.refreshSelectedFromState();
            }
        }
        
    }

    async componentDidMount() {
        //will get this from a component attribute
        await super.componentDidMount();
        
        // build tree
        this.buildTreeFromModel(this.model.dataSource.items,0);
        
        (manywho as any).eventManager.addDoneListener(this.flowMoved, this.componentId);

        this.refreshSelectedFromState();
    }

    async refreshSelectedFromState() {
        let state: FlowObjectData = this.getStateValue() as FlowObjectData;
        this.selectedNodeId = undefined;
        if(state) {
            this.selectedNodeId=state.properties["ITEM_ID"].value as number;
        }
        else {
            //if no state then try clicked one
            if(this.getAttribute("ClickedState")) {
                let clickedState = await this.loadValue(this.getAttribute("ClickedState"));
                this.selectedNodeId=(clickedState.value as FlowObjectData).properties["ITEM_ID"].value as number;
            }
        }
        this.expandToSelected();
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
        if(outcomeName === "OnSelect" || 
            (this.outcomes[outcomeName]?.pageActionBindingType !== ePageActionBindingType.NoSave 
                && node )) 
        {
            // if selectable then set state value otherwise clear it
            if(node.isSelectable() === true) {
                await this.setStateValue(node.objectData);
            }
            else {
                await this.setStateValue(undefined);
            }

            // if there's a clicked state attribute then set it
            if(this.getAttribute("ClickedState")) {
                let clickedState = await this.loadValue(this.getAttribute("ClickedState"));
                clickedState.value = node.objectData;
                await this.updateValues(clickedState);
            }
            
            this.selectedNodeId = node.itemId;
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

        this.expandToSelected();
        this.expandToFilter();
        this.treeViewNodes.forEach((node: TreeViewNode) => {
            node.forceUpdate();
        })
        this.forceUpdate();
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
                nodeItem = this.flatTree.get(nodeItem.parentItemId);
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
                nodeItem = this.flatTree.get(nodeItem.parentItemId);
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
                    title={"Expand Next Level"}
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

    flatTreeFind(itemId: number) : TreeViewItem | undefined {
        if(this.flatTree.has(itemId)) {
            return this.flatTree.get(itemId);
        }
        else {
            for(let key of Array.from( this.flatTree.keys())) {
                let parent: TreeViewItem = this.flatTreeFindChildren(this.flatTree.get(key).children, itemId);
                if(parent) {
                    return parent;
                }
            }
            return undefined;
        }
    }

    flatTreeFindChildren(children: Map<number, TreeViewItem>, itemId:  number) : TreeViewItem | undefined {
        if(children.has(itemId)) {
            return children.get(itemId);
        }
        else {
            for(let key of Array.from( children.keys())) {
                let parent: TreeViewItem = this.flatTreeFindChildren(children.get(key).children, itemId);
                if(parent) {
                    return parent;
                }
            }
            return undefined;
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////
    // constructs the nodeTree and a flat a map of TreeViewItems from the model datasource data
    ///////////////////////////////////////////////////////////////////////////////////////////
    buildTreeFromModel(items : FlowObjectData[], level: number){
        this.nodeTree = new Map();
        this.flatTree = new Map();
        let start: number = new Date().getTime();
        items.forEach((item: FlowObjectData) => {
            //construct TreeViewItem
            let node = new TreeViewItem();
            node.itemLevel = level;
            node.id = item.internalId;
            node.itemId = item.properties["ITEM_ID"]?.value as number;
            node.parentItemId = item.properties["PARENT_ID"]?.value as number
            node.itemName = item.properties["ITEM_NAME"]?.value as string;
            node.itemDescription = item.properties["ITEM_DESCRIPTION"]?.value as string;
            node.itemStatus = item.properties["ITEM_STATUS"]?.value as string;
            node.itemLocked = item.properties["IS_LOCKED"]?.value as string;
            node.itemSelectable = item.properties["SELECTABLE_CHILDREN"]?.value as string;
            node.itemType = item.properties["ITEM_TYPE"]?.value as string;
            node.children = new Map();
            node.objectData = item;
            if(item.properties["IS_LOCKED"]?.value === "Y" || item.properties["SELECTABLE_CHILDREN"]?.value === "N") {
                console.log("locked=" + item.properties["ITEM_NAME"]?.value);
            }

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

            let parent = this.flatTreeFind(item.parentItemId); //this.flatTree.get(item.parentItemId);
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
            let parent = this.flatTree.get(topLevel.parentItemId)
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

        this.nodeElementTree = this.buildTree(this.nodeTree);
    
        let tot: number = new Date().getTime() - start;
        this.debug("buildTreeFromModel=" + (tot/1000),eDebugLevel.error);
 
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
        let start: number = new Date().getTime();
        //this.expandToSelected();
        //this.expandToFilter();
        const elements: Array<any> = [];
        if(nodes) {
            nodes.forEach((node: TreeViewItem) => {
                let children: Array<any> = this.buildTree(node.children);
                let expanded: boolean = this.defaultExpanded
                //if(this.expansionPath.indexOf(node.itemId)>=0 || this.filterExpansionPath.indexOf(node.itemId)>=0){
                //    expanded=true;
                //}
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
        
        
        let tot: number = new Date().getTime() - start;
        //this.debug("buildTree=" + (tot/1000),eDebugLevel.error);
        return elements;
    }

    showAll(e: any) {
        this.messageBox.hideMessageBox();
        this.filterTree(true);
    }

    noResults() {
        this.drawResults();
    }

    maxExceeded() {
        let tot: number = this.matchingNodes.length;
        this.matchingNodes = this.matchingNodes.slice(0,this.maxResults);
        this.messageBox.showMessageBox("High Result Count Warning",
            (<div>
                <span>{"Your search returned a large number of matches and could impact performance"}</span>
                <br></br>
                <br></br>
                <span>{"By default only the first " + this.maxResults + " of a possible " + tot + " will be displayed"}</span>
                <br></br>
                <br></br>
                <span>{"Do you want to see all the results ?"}</span>
                <br></br>
                <span>{"(This may take some time)"}</span>
            </div>),
            [new modalDialogButton("Show All",this.showAll),new modalDialogButton("Show Default",this.drawResults)]
        );
    }

    absoluteMaxExceeded() {
        let tot: number = this.matchingNodes.length;
        this.matchingNodes = this.matchingNodes.slice(0,this.absoluteMaxResults);
        this.messageBox.showMessageBox("Extreme High Result Count Warning",
            (<div>
                <span>{"Your search returned more than " + this.absoluteMaxResults + " matches and will impact performance"}</span>
                <br></br>
                <br></br>
                <span>{"The results have been truncated"}</span>
                <br></br>
                <br></br>
            </div>),
            [new modalDialogButton("Ok",this.drawResults)]
        );
    }

    filterTree(showAll : boolean = false) {
        
        let criteria: string = this.searchBox?.value;
        if(criteria?.length > 0) {
            if(criteria.length < 3) {
                let content: any = (
                    <span>Searching with less than 3 characters is not permitted.</span>
                );
                this.matchingNodes = undefined;
                this.messageBox.showMessageBox("Search Criteria Restriction",content,[new modalDialogButton("Ok",this.messageBox.hideMessageBox)]);
            }
            else {
                this.matchingNodes = [];
                //traverse all nodes
                this.flatTree.forEach((node: TreeViewItem) => {
                    if (
                        (node.itemName.toLowerCase().indexOf(criteria.toLowerCase()) >= 0 || 
                        node.itemDescription.toLowerCase().indexOf(criteria.toLowerCase()) >= 0)
                    ) {
                        this.matchingNodes.push(node.itemId)
                        //this.matchingNodes = this.matchingNodes.concat(node.itemId);
                        //this.matchingNodes = this.matchingNodes.filter((item, pos) => this.matchingNodes.indexOf(item) === pos);
                    }
                });
                
                switch(true) {

                    // over abs max.  truncate and warn
                    case this.matchingNodes.length >= this.absoluteMaxResults:
                        this.absoluteMaxExceeded();
                        break;

                    case this.matchingNodes.length >= this.maxResults && showAll === true:
                        this.drawResults();
                        break;

                    case this.matchingNodes.length >= this.maxResults && showAll === false:
                        this.maxExceeded();
                        break;

                    case this.matchingNodes.length === 0:
                        this.messageBox.showMessageBox("No Results",
                            (<span>{"The search returned no matches, please refine your search and try again."}</span>),
                            [new modalDialogButton("Ok",this.messageBox.hideMessageBox)]
                        );
                        this.searchBox.value = "";
                        break;
                    default:
                        this.drawResults();
                        break;
                }
            }
        }
        else {
            this.matchingNodes = undefined;
            this.drawResults();
        }
    }

    drawResults() {
        this.messageBox.hideMessageBox();
        this.buildTree(this.nodeTree);
        this.expandToSelected();
        this.expandToFilter();
        this.treeViewNodes.forEach((node: TreeViewNode) => {
            node.forceUpdate();
        });
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
            this.contextMenu.showContextMenu(e.clientX, e.clientY,listItems);   
            this.forceUpdate();
        }
    }

    async hideContextMenu() {
        this.contextMenu.hideContextMenu();
    }
    

    render() {
        
        if(this.loadingState !== eLoadingState.ready) {
            return this.lastContent;
        }
        
        
        //construct tree REACT elements
        this.debug("render",eDebugLevel.error);
        
        

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
                <FlowContextMenu
                    parent={this}
                    ref={(element: FlowContextMenu) => {this.contextMenu = element}}
                />
                <FlowMessageBox
                    parent={this}
                    ref={(element: FlowMessageBox) => {this.messageBox = element}}
                />
                <div
                    className="treeview-header"
                >
                    <div
                        className="treeview-header-title-wrapper"
                    >
                        <span
                            className="treeview-header-title"
                            onClick={this.dbg}
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
                            onClick={(e: any) => {this.filterTree(false)}}
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

    dbg() {
        let state: any = this.getStateValue();
    }

}

manywho.component.register('TreeView', TreeView);