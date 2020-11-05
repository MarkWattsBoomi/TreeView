import { FlowOutcome, ModalDialog, modalDialogButton } from 'flow-component-model';
import React, { CSSProperties } from 'react';
import ContextMenu from './ContextMenu/ContextMenu';
import ItemInfo from './Dialogs/ItemInfo';
import { MessageBox } from './MessageBox/MessageBox';
import TreeView, { eDebugLevel } from './TreeView';
import TreeViewItem from './TreeViewItem';

export default class TreeViewNode extends React.Component<any, any> {
    context: any;
    canvas: any;
    contextMenu: any;

    msgboxVisible: boolean = false;
    msgboxTitle: string = '';
    msgboxButtons: any = [];
    msgboxContent: any;
    msgboxOnClose: any;

    dialogVisible: boolean = false;
    dialogTitle: string = '';
    dialogButtons: any = [];
    dialogContent: any;
    dialogOnClose: any;
    dialogForm: any;

    expanded: boolean = false;
    
    constructor(props: any) {
        super(props);
        this.showContextMenu = this.showContextMenu.bind(this);
        this.hideContextMenu = this.hideContextMenu.bind(this);   
        this.showMessageBox = this.showMessageBox.bind(this);
        this.hideMessageBox = this.hideMessageBox.bind(this);
        this.showDialog = this.showDialog.bind(this);
        this.hideDialog = this.hideDialog.bind(this);
        this.showInfo = this.showInfo.bind(this);
        this.expanded = this.props.expanded || false;
    }

    componentDidUpdate() {
        
    }

    componentDidMount() {
        const root: TreeView = this.props.root;
        if(root.expansionPath.indexOf(this.props.nodeId) >= 0)
        {
            this.expanded = true;
            this.forceUpdate();
        }
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

    showContextMenu(e: any) {
        e.preventDefault();
        e.stopPropagation();
        const root: TreeView = this.props.root;
        const node: TreeViewItem = root.flatTree.get(this.props.nodeId); 

        let lowestLevel: boolean = node.children.size===0;

        let listItems: Map<string , any> = new Map();
        if(this.contextMenu) {
            Object.keys(root.outcomes).forEach((key: string) => {
                const outcome: FlowOutcome = root.outcomes[key];
                if (outcome.isBulkAction === false && outcome.developerName !== "OnSelect" && outcome.developerName.toLowerCase().startsWith("cm")) {
                    let showOutcome: boolean = true;
                    if(outcome.attributes["LowestOnly"]?.value.toLowerCase() === "true" && !lowestLevel){
                        showOutcome=false;
                    }
                    if(showOutcome){
                        listItems.set(outcome.developerName,(
                            <li 
                                className="cm-item"
                                title={outcome.label || key}
                                onClick={(e: any) => {e.stopPropagation(); root.doOutcome(key, node)}}
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
                }
            });
            this.contextMenu.show(e.clientX, e.clientY,listItems);   
            this.forceUpdate();
        }
    }

    async hideContextMenu() {
        this.contextMenu.hide();
    }

    showInfo() {
        const root: TreeView = this.props.root;
        const node: TreeViewItem = root.flatTree.get(this.props.nodeId); 
        let content: any = (
            <ItemInfo
                item={node}
                display={root.model.displayColumns}
            />
        );
        this.showDialog(node.itemName,content,this.hideDialog,[new modalDialogButton("Close",this.hideDialog)])
    }

    render() {
        let expander: any;
        let content: any;
        let icon: any;

        let buttons: Array<any> = [];
        const root: TreeView = this.props.root;
        const node: TreeViewItem = root.flatTree.get(this.props.nodeId); 
        //const parentItem: TreeViewItem = root.findTreeNode(root.nodeTree,this.props.parentId); 
        //const parent = root.getNode(this.props.parentId);
        //set the queue icon
        icon=node.itemIcon || "envelope";
        
        if((this.props.children && (this.props.children as Array<any>).length > 0) || this.props.expanded===true)
        {
            let expanderIcon: string="plus";
            if(this.expanded === true || this.props.expanded===true)
            {
                expanderIcon="minus";
                content = this.props.children;
            }
            expander = (
                <span 
                    className={"glyphicon glyphicon-" + expanderIcon + " treeview-node-expander-icon"}
                    onClick={(e: any) => {this.toggleExpand(e)}}    
                />
            );
            
        }

        let selectedClass: string = "";
        if(node.itemId === (root.selectedNodeId ? root.selectedNodeId : undefined)) {
            selectedClass = " treeview-node-item-selected";
        }

        let lowestLevel: boolean = node.children.size===0;

        Object.keys(root.outcomes).forEach((key: string) => {
            const outcome: FlowOutcome = root.outcomes[key];
            if (outcome.isBulkAction === false && outcome.developerName !== "OnSelect" && !outcome.developerName.toLowerCase().startsWith("cm")) {
                let showOutcome: boolean = true;
                if(outcome.attributes["LowestOnly"]?.value.toLowerCase() === "true" && !lowestLevel){
                    showOutcome=false;
                }
                if(showOutcome){
                    buttons.push(
                        <span 
                            key={key}
                            className={"glyphicon glyphicon-" + (outcome.attributes["icon"]?.value || "plus") + " treeview-node-button"} 
                            title={outcome.label || key}
                            onClick={(e: any) => {e.stopPropagation(); root.doOutcome(key, node)}}
                        />
                    );
                }
            }
        });

        let contextMenu = (
            <ContextMenu 
                parent={this}
                ref={(element: ContextMenu) => {this.contextMenu=element}}
            />
        );

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

        let label: string = node.itemName;
        if(root.debugLevel >= eDebugLevel.info) {
            label += " (" + node.itemId + ") (" + node.parentId + ")"
        }

        let style: CSSProperties = {};
        style.paddingLeft="10px";

        //if there's a filter list then hide me if not in it or not in expand list
        if(root.matchingNodes) {
            if(root.matchingNodes.indexOf(node.itemId)>=0 || root.filterExpansionPath.indexOf(node.itemId)>=0 || root.expansionPath.indexOf(node.itemId)>=0 || root.selectedNodeId===node.itemId) {
                style.visibility="visible";
            }
            else {
                style.visibility="hidden";
                style.height="0px";
            }
        }

        let nodeIcon: any;
        if(root.getAttribute("ShowInfo","false").toLowerCase() === "true") {
            nodeIcon = (
                <span 
                    className={"glyphicon glyphicon-info-sign treeview-node-button"}
                    onClick={(e: any) => {e.stopPropagation(); this.showInfo(); root.doOutcome("OnInfo", node)}}
                />
            );
        }
        else {
            nodeIcon = (
                <span 
                    className={"glyphicon glyphicon-" + icon + " treeview-node-icon"}
                />
            );
        }
        
        return( 
            <div
                className="treeview-node"
                style={style}
                title={node.itemDescription}
                onContextMenu={(e: any) => {e.preventDefault()}}
            >
                <div 
                    className = "treeview-node-title"
                >
                    <div
                        className="treeview-node-expander"
                    >
                        {expander}
                    </div>
                    <div
                        className={"treeview-node-item" + selectedClass}
                        onClick={(e: any) => {root.doOutcome("OnSelect",node)}}
                        title={node.itemDescription}
                        draggable={this.props.allowRearrange}
                        onDragStart={(e) => {root.onDrag(e,node.itemId); }}
                        onDragEnter={(e) => {root.onDragEnter(e); }}
                        onDragLeave={(e) => {root.onDragLeave(e); }}
                        onDragOver={(e) => {root.onDragOver(e); }}
                        onDrop={(e) => {root.onDrop(e); }}
                        data-node={node.itemId}
                        onContextMenu={this.showContextMenu}
                    >
                        {modal}
                        {msgbox}
                        {contextMenu}
                        <div
                            className="treeview-node-icons"
                        >
                            {nodeIcon}
                        </div>
                        <div
                            className = "treeview-node-label"
                        >
                            {label}
                        </div>
                        <div
                            className="treeview-node-icons"
                        >
                            {buttons}
                        </div>
                    </div>
                </div>
                <div 
                    className = "treeview-node-body"
                >
                    {content}
                </div>
            </div>
        );
    }

    toggleExpand(e: any) {
        this.expanded = !this.expanded;
        this.forceUpdate();
    }
}
