import {  FlowOutcome } from 'flow-component-model';
import React, { CSSProperties } from 'react';
import ItemInfo from '../Dialogs/ItemInfo';
import TreeView, { eDebugLevel } from './TreeView';
import TreeViewItem from './TreeViewItem';
import { FCMContextMenu, FCMModal } from 'fcmkit';
import { FCMModalButton } from 'fcmkit/lib/ModalDialog/FCMModalButton';

export default class TreeViewNode extends React.Component<any, any> {
    context: any;
    canvas: any;
    contextMenu: FCMContextMenu;
    messageBox: FCMModal;

    expanded: boolean = false;

    constructor(props: any) {
        super(props);
        this.showContextMenu = this.showContextMenu.bind(this);
        this.hideContextMenu = this.hideContextMenu.bind(this);
        this.showInfo = this.showInfo.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.expanded = this.props.expanded || false;
    }

    componentDidUpdate() {

    }

    componentDidMount() {
        const root: TreeView = this.props.root;
        if (root.expansionPath.indexOf(this.props.nodeId) >= 0) {
            this.expanded = true;
            this.forceUpdate();
        }
    }

    showContextMenu(e: any) {
        e.preventDefault();
        e.stopPropagation();
        const root: TreeView = this.props.root;
        const node: TreeViewItem = root.flatTree.get(this.props.nodeId);

        const lowestLevel: boolean = node.children.size === 0;

        const listItems: Map<string , any> = new Map();
        if (this.contextMenu && node.isEnabled()) {
            Object.keys(root.outcomes).forEach((key: string) => {
                const outcome: FlowOutcome = root.outcomes[key];
                if (outcome.isBulkAction === false && outcome.developerName !== 'OnSelect' && outcome.developerName.toLowerCase().startsWith('cm')) {
                    let showOutcome: boolean = true;
                    if (outcome.attributes['LowestOnly']?.value.toLowerCase() === 'true' && !lowestLevel) {
                        showOutcome = false;
                    }
                    if (showOutcome) {
                        listItems.set(outcome.developerName, (
                            <li
                                className="cm-item"
                                title={outcome.label || key}
                                onClick={(e: any) => {e.stopPropagation(); root.doOutcome(key, node); }}
                            >
                                <span
                                    className={'glyphicon glyphicon-' + (outcome.attributes['icon']?.value || 'plus') + ' cm-item-icon'} />
                                <span
                                    className={'cm-item-label'}
                                >
                                    {outcome.label || key}
                                </span>
                            </li>
                        ));
                    }
                }
            });
            this.contextMenu.showContextMenu(e.clientX, e.clientY, listItems);
            this.forceUpdate();
        }
    }

    async hideContextMenu() {
        this.contextMenu.hideContextMenu();
    }

    showInfo() {
        const root: TreeView = this.props.root;
        const node: TreeViewItem = root.flatTree.get(this.props.nodeId);
        const content: any = (
            <ItemInfo
                item={node}
                display={root.model.displayColumns}
            />
        );
        this.messageBox.showDialog(
            null,
            node.itemName, 
            content, 
            [new FCMModalButton('Close', this.messageBox.hideDialog)]);
    }

    onSelect(e: any) {
        const root: TreeView = this.props.root;
        const node: TreeViewItem = root.flatTree.get(this.props.nodeId);
        root.doOutcome('OnSelect', node);
    }

    render() {
        let expander: any;
        let content: any;
        let icon: any;

        const buttons: any[] = [];
        const root: TreeView = this.props.root;
        const node: TreeViewItem = root.flatTree.get(this.props.nodeId);
        // const parentItem: TreeViewItem = root.findTreeNode(root.nodeTree,this.props.parentId);
        // const parent = root.getNode(this.props.parentId);
        // set the queue icon
        icon = node.itemIcon || 'envelope';

        if ((this.props.children && (this.props.children as any[]).length > 0) || this.props.expanded === true) {
            let expanderIcon: string = 'plus';
            if (this.expanded === true || root.expansionPath.indexOf(this.props.nodeId) >= 0 || root.filterExpansionPath.indexOf(this.props.nodeId) >= 0) {
                expanderIcon = 'minus';
                content = this.props.children;
            }
            expander = (
                <span
                    className={'glyphicon glyphicon-' + expanderIcon + ' treeview-node-expander-icon'}
                    onClick={(e: any) => {this.toggleExpand(e); }}
                />
            );

        }

        let selectedClass: string = '';
        if (node.itemId === (root.selectedNodeId ? root.selectedNodeId : undefined)) {
            selectedClass = ' treeview-node-item-selected';
        }

        const lowestLevel: boolean = node.children.size === 0;

        if (node.isEnabled()) {
            Object.keys(root.outcomes).forEach((key: string) => {
                const outcome: FlowOutcome = root.outcomes[key];
                if (outcome.isBulkAction === false && outcome.developerName !== 'OnSelect' && !outcome.developerName.toLowerCase().startsWith('cm')) {
                    let showOutcome: boolean = true;
                    if (outcome.attributes['LowestOnly']?.value.toLowerCase() === 'true' && !lowestLevel) {
                        showOutcome = false;
                    }
                    if (showOutcome) {
                        buttons.push(
                            <span
                                key={key}
                                className={'glyphicon glyphicon-' + (outcome.attributes['icon']?.value || 'plus') + ' treeview-node-button'}
                                title={outcome.label || key}
                                onClick={(e: any) => {e.stopPropagation(); root.doOutcome(key, node); }}
                            />,
                        );
                    }
                }
            });
        }

        let label: string = node.itemName || node.itemDescription;
        if (root.debugLevel >= eDebugLevel.info) {
            label += ' (' + node.itemId + ') (' + node.parentId + ')';
        }

        const style: CSSProperties = {};
        style.paddingLeft = '10px';

        // if there's a filter list then hide me if not in it or not in expand list
        if (root.matchingNodes) {
            if (root.matchingNodes.indexOf(node.itemId) >= 0 || root.filterExpansionPath.indexOf(node.itemId) >= 0 || root.expansionPath.indexOf(node.itemId) >= 0 || root.selectedNodeId === node.itemId) {
                style.visibility = 'visible';
            } else {
                style.visibility = 'hidden';
                style.height = '0px';
            }
        }

        let nodeIcon: any;
        if (root.getAttribute('ShowInfo', 'false').toLowerCase() === 'true') {
            nodeIcon = (
                <span
                    className={'glyphicon glyphicon-info-sign treeview-node-button'}
                    onClick={(e: any) => {e.stopPropagation(); this.showInfo(); root.doOutcome('OnInfo', node); }}
                />
            );
        } else {
            nodeIcon = (
                <span
                    className={'glyphicon glyphicon-' + icon + ' treeview-node-icon'}
                />
            );
        }

        return(
            <div
                className={'treeview-node '}
                style={style}
                title={node.itemDescription}
                onContextMenu={(e: any) => {e.preventDefault(); }}
            >
                <div
                    className="treeview-node-title"
                >
                    <div
                        className="treeview-node-expander"
                    >
                        {expander}
                    </div>
                    <div
                        className={'treeview-node-item' + selectedClass + node.getStyle()}
                        onClick={this.onSelect}
                        title={node.itemDescription}
                        draggable={this.props.allowRearrange}
                        onDragStart={(e) => {root.onDrag(e, node.itemId); }}
                        onDragEnter={(e) => {root.onDragEnter(e); }}
                        onDragLeave={(e) => {root.onDragLeave(e); }}
                        onDragOver={(e) => {root.onDragOver(e); }}
                        onDrop={(e) => {root.onDrop(e); }}
                        data-node={node.itemId}
                        onContextMenu={this.showContextMenu}
                    >
                        <FCMModal
                            parent={this}
                            ref={(element: FCMModal) => {this.messageBox = element; }}
                        />
                        <FCMContextMenu
                            parent={this}
                            ref={(element: FCMContextMenu) => {this.contextMenu = element; }}
                        />
                        <div
                            className="treeview-node-icons"
                        >
                            {nodeIcon}
                        </div>
                        <div
                            className="treeview-node-label"
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
                    className="treeview-node-body"
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
