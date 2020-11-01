import React, { CSSProperties } from 'react';

import { modalDialogButton, ModalDialog, eLoadingState, FlowComponent, FlowObjectDataArray, FlowObjectData, FlowObjectDataProperty } from 'flow-component-model';
import './css/treeview.css';
import { MessageBox } from './MessageBox/MessageBox';
import TreeViewNode from './TreeViewNode';
import TreeViewItem from './TreeViewItem';

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

    selectedNode: TreeViewItem;
    nodeTree: Map<string,TreeViewItem>;
    nodeElementTree: Array<any>;
    treeViewNodes: Map<string,TreeViewNode> = new Map();

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

    draggedNode: string;
   
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
        this.nodeSelect = this.nodeSelect.bind(this);
        this.nodeEdit = this.nodeEdit.bind(this);
        this.nodeDelete = this.nodeDelete.bind(this);
        this.refresh = this.refresh.bind(this);
        this.back = this.back.bind(this);
        this.expand = this.expand.bind(this);
        this.collapse = this.collapse.bind(this);
        this.setNode = this.setNode.bind(this);

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
        // build tree
        this.buildTreeFromModel(this.model.dataSource.items);
        this.forceUpdate();
    }

    async componentWillUnmount() {
        await super.componentWillUnmount();
        this.debug("unmount workflow", eDebugLevel.verbose);
    }

    setNode(key: string, element: TreeViewNode) {
        if(element) {
            this.treeViewNodes.set(key,element);
        }
        else {
            if(this.treeViewNodes.has(key)) {
                this.treeViewNodes.delete(key);
            }
        }
    }

    convertNode(source: FlowObjectData) : FlowObjectData {
        let result: FlowObjectData;
        if(this.model.dataSource.items && this.model.dataSource.items.length > 0) {
            let targettype: string = this.model.dataSource.items[0].developerName;
            result = FlowObjectData.newInstance(targettype);
            Object.values(source.properties).forEach((prop: FlowObjectDataProperty) => {
                result.addProperty(prop);
            });
        }
        return result;
    }

    async nodeSelect(node: TreeViewItem) {
        console.log("select node " + node.itemId);
        await this.setStateValue(this.convertNode(node.objectData))
        this.selectedNode = node;
        this.forceUpdate();
        if(this.outcomes["OnSelect"]) {
            //set state
            await this.triggerOutcome("OnSelect")
        }
    }

    async nodeEdit(node: any) {
        console.log("edit node " + node.itemId);
        await this.setStateValue(this.convertNode(node.objectData))
        this.selectedNode = node;
        this.forceUpdate();
        if(this.outcomes["OnEdit"]) {
            //set state
            await this.triggerOutcome("OnEdit")
        }
    }

    async nodeDelete(node: any) {
        console.log("delete node " + node.itemId);
        await this.setStateValue(this.convertNode(node.objectData))
        this.selectedNode = node;
        this.forceUpdate();
        if(this.outcomes["OnDelete"]) {
            //set state
            await this.triggerOutcome("OnDelete")
        }
    }

    async refresh() {
        console.log("refresh");
        if(this.outcomes["OnRefresh"]) {
            await this.triggerOutcome("OnRefresh")
        }
    }

    async back() {
        console.log("back");
        if(this.outcomes["OnBack"]) {
            await this.triggerOutcome("OnBack")
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
        })
    }

    onDrag(e: any, nodeId: string) {
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

    isPermissableTargetQueue(movingNode: string, potentialParentNode: string) : boolean {
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

    isChildOf( potentialParentNode: string,movingNode: string) : boolean {
        return this.treeViewNodes.get(movingNode).props.parentId === potentialParentNode;
    }

    isParentOf( potentialParentNode: string,movingNode: string) : boolean {
        return this.treeViewNodes.get(potentialParentNode).props.parentId === movingNode;
    }

    onDragEnter(e: any) {
        e.preventDefault();
        e.stopPropagation();
        /*
        const potentialParent = e.currentTarget.getAttribute("data-node");
        const permissableTarget: boolean = this.isPermissableTargetQueue(this.draggedNode,potentialParent);
        if(!permissableTarget) {
            e.dataTransfer.dropEffect="none"; 
            e.currentTarget.classList.add("cannot-drop");
        }
        else {
            e.dataTransfer.dropEffect="move";
            e.currentTarget.classList.add("can-drop");
        }
        */
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
        const potentialParent = e.currentTarget.getAttribute("data-node");
        const permissableTarget: boolean = this.isPermissableTargetQueue(this.draggedNode,potentialParent);
        if(!permissableTarget) {
            e.dataTransfer.dropEffect="none"; 
            e.currentTarget.classList.add("cannot-drop");
        }
        else {
            e.dataTransfer.dropEffect="move";
            e.currentTarget.classList.add("can-drop");
        }
        /*
        e.preventDefault();
        e.stopPropagation();
        const srcNode = e.dataTransfer.getData('node');
        const tgtNode = e.currentTarget.getAttribute("data-node");
        */
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

               
        content.push(
            <span 
                key="EXPAND"
                className={"glyphicon glyphicon-plus treeview-header-button"} 
                title={"Expand All"}
                onClick={this.expand}
            />
        );

        content.push(
            <span 
                key="CONTRACT"
                className={"glyphicon glyphicon-minus treeview-header-button"} 
                title={"Collapse All"}
                onClick={this.collapse}
            />
        );
        
        if(this.outcomes["OnBack"]) {
            content.push(
                <span 
                    key="BACK"
                    className={"glyphicon glyphicon-" + (this.outcomes["OnRefresh"].attributes["icon"]?.value || "arrow-left") + " treeview-header-button"} 
                    title={this.outcomes["OnBack"].label}
                    onClick={this.back}
                />
            );
        }
        if(this.outcomes["OnRefresh"]) {
            content.push(
                <span 
                    key="REFRESH"
                    className={"glyphicon glyphicon-" + (this.outcomes["OnRefresh"].attributes["icon"]?.value || "refresh") + " treeview-header-button" }
                    title={this.outcomes["OnRefresh"].label}
                    onClick={this.refresh}
                />
            );
        }
        return content;
    }

    

    ///////////////////////////////////////////////////////////////////
    // constructs a map of TreeViewItems from the model datasource data
    ///////////////////////////////////////////////////////////////////
    buildTreeFromModel(items : FlowObjectData[]){
        this.nodeTree = new Map();
        items.forEach((item: FlowObjectData) => {
            let childNodes : Map<string,TreeViewItem> = new Map();
            if(item.properties["CHILDREN"]) {
                childNodes = this.buildNodes(item.properties["CHILDREN"].value as FlowObjectDataArray, 1);
            }
            let node = new TreeViewItem();
            node.itemLevel = 0;
            node.itemId = item.properties["ITEM_ID"].value as string;
            node.itemName = item.properties["ITEM_NAME"].value as string;
            node.itemDescription = item.properties["ITEM_DESCRIPTION"].value as string;
            node.itemStatus = item.properties["ITEM_STATUS"].value as string;
            node.children = childNodes;
            node.objectData = item;
            this.nodeTree.set(item.properties["ITEM_ID"].value as string, node);
        });
    }

    buildNodes(items : FlowObjectDataArray, level: number) : Map<string,TreeViewItem>{
        let nodes: Map<string,TreeViewItem> = new Map(); 
                
        items.items.forEach((item: FlowObjectData) => {
                       
            let childNodes : Map<string,TreeViewItem> = new Map();
            
            if(item.properties["children"]) {
                childNodes = this.buildNodes(item.properties["CHILDREN"].value as FlowObjectDataArray, level + 1);
            }

            let node = new TreeViewItem();
            node.itemLevel = level;
            node.itemId = item.properties["ITEM_ID"].value as string;
            node.itemName = item.properties["ITEM_NAME"].value as string;
            node.itemDescription = item.properties["ITEM_DESCRIPTION"].value as string;
            node.itemStatus = item.properties["ITEM_STATUS"].value as string;
            node.children = childNodes;
            node.objectData = item;
            nodes.set(item.properties["ITEM_ID"].value as string, node);
        });

        return nodes;
    }

    //////////////////////////////////////////////////////////////
    // Constructs a react component tree from the TreeViewItem map
    //////////////////////////////////////////////////////////////
    buildTree() {
        this.nodeElementTree = [];

        this.nodeTree?.forEach((node: TreeViewItem) => {
            let children: Array<any> = this.makeChildNodes(node.itemId + "", node.children);
            this.nodeElementTree.push(
                <TreeViewNode 
                    key={node.itemId}
                    root={this}
                    node={node}
                    parent={undefined}
                    children={children}
                    allowRearrange={!this.model.readOnly}
                    ref={(element: TreeViewNode) => {this.setNode(node.itemId + "",element)}}
                />
            );
        });
    }

    makeChildNodes(parentId: string, nodes: Map<string,TreeViewItem>) : Array<any> {
        let elements: Array<any> = [];
        nodes.forEach((node: TreeViewItem) => {
            let children: Array<any> = this.makeChildNodes(parentId,node.children);
            elements.push(
                <TreeViewNode 
                    key={node.itemId}
                    root={this}
                    node={node}
                    parentId={parentId}
                    children={children}
                    allowRearrange={!this.model.readOnly}
                    ref={(element: TreeViewNode) => {this.setNode(node.itemId + "",element)}}
                />
            );
        });

        return elements;
    }
    

    render() {
        this.buildTree();
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
        
        return (
            <div
                className={classes}
                style={style}
            >
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
    }

}

manywho.component.register('TreeView', TreeView);