import { FlowOutcome } from 'flow-component-model';
import React from 'react';
import TreeView from './TreeView';
import TreeViewItem from './TreeViewItem';

export default class TreeViewNode extends React.Component<any, any> {
    context: any;
    canvas: any;
    contextMenu: any;

    expanded: boolean = true;
    
    constructor(props: any) {
        super(props);
        this.showContextMenu = this.showContextMenu.bind(this);
        this.hideContextMenu = this.hideContextMenu.bind(this);   
    }

    

    showContextMenu(e: any) {
        e.preventDefault();
        e.stopPropagation();
        const left: number = e.clientX;
        const top: number = e.clientY;
        const root: TreeView = this.props.root;

    }

    async hideContextMenu() {
        const root: TreeView = this.props.root;

        //if(root.roleFunctions.has("edit_queues") === true) {
            this.contextMenu.style.left = "0px";
            this.contextMenu.style.top = "0px";
            this.contextMenu.style.display = "none";
            this.forceUpdate();
        //}
    }

    expandAll() {

    }

    collapseAll() {
        
    }
    
    render() {
        let expander: any;
        let content: any;
        let icon: any;

        let buttons: Array<any> = [];
        const root: TreeView = this.props.root;
        const node: TreeViewItem = this.props.node; 
        
        //set the queue icon
        icon=node.itemIcon || "envelope";
        
        if(this.props.children && (this.props.children as Array<any>).length > 0)
        {
            let expanderIcon: string="plus";
            if(this.expanded === true)
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
        if(node.itemId === (root.selectedNode ? root.selectedNode.itemId : -1)) {
            selectedClass = " treeview-node-item-selected";
        }

        Object.keys(root.outcomes).forEach((key: string) => {
            const outcome: FlowOutcome = root.outcomes[key];
            if (outcome.isBulkAction === false && outcome.developerName !== "OnSelect") {
                buttons.push(
                    <span 
                        key={key}
                        className={"glyphicon glyphicon-" + (outcome.attributes["icon"]?.value || "plus") + " treeview-node-button"} 
                        title={outcome.label || key}
                        onClick={(e: any) => {e.stopPropagation(); root.doOutcome(key, node)}}
                    />
                );
            }
        });
        
        return( 
            <div
                className="treeview-node"
                style={{paddingLeft: (node.itemLevel * 20) + "px"}}
                onContextMenu={this.showContextMenu}
                title={node.itemDescription}
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
                        onDragStart={(e) => {root.onDrag(e,node.itemId + ""); }}
                        onDragEnter={(e) => {root.onDragEnter(e); }}
                        onDragLeave={(e) => {root.onDragLeave(e); }}
                        onDragOver={(e) => {root.onDragOver(e); }}
                        onDrop={(e) => {root.onDrop(e); }}
                        data-node={node.itemId}
                    >
                        <div
                            className="treeview-node-icons"
                        >
                            <span 
                                className={"glyphicon glyphicon-" + icon + " treeview-node-icon"}
                            />
                        </div>
                        <div
                            className = "treeview-node-label"
                        >
                            {node.itemName}
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
