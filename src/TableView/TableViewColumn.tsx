import { FlowDisplayColumn } from 'flow-component-model';
import React from 'react';
import TableView from './TableView';

export default class TableViewHeader extends React.Component<any, any> {

    render() {
        const root: TableView = this.props.root;
        const col: FlowDisplayColumn = root.colMap.get(this.props.colId);

        return (
            <div
                className={'table-view-header table-view-header-' + col.developerName}
            >
                <span
                    className={'table-view-header-label'}
                >
                    {col.label}
                </span>
            </div>
        );
    }
}
