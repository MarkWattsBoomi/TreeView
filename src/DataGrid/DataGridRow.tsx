import React, { CSSProperties } from 'react';

import { eContentType, FlowDisplayColumn, FlowField, FlowObjectData, FlowOutcome, modalDialogButton } from 'flow-component-model';
import DataGrid from './DataGrid';
import { DataGridColumn, DataGridItem } from './DataGridItem';

export default class DataGridRow extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.valueChanged = this.valueChanged.bind(this);
        this.valueLeft = this.valueLeft.bind(this);
    }

    // this handles a cell's onChange to sync the value into the underlying data set
    valueChanged(e: any, colName: string) {
        const root: DataGrid = this.props.root;
        const row: DataGridItem = root.rowMap.get(this.props.rowId);
        const oldVal: any = row.columns.get(colName).value;
        let newVal: any;

        switch (row.columns.get(colName).type) {
            case eContentType.ContentNumber:
                newVal = parseFloat(e.target.value).toFixed(2);
                // if(newVal>99) {
                //    newVal = 99;
                // }
                break;

            default:
                newVal = e.target.value;
                break;

        }

        if (oldVal !== newVal) {
            root.rowValueChanged(this.props.rowId, colName, oldVal, newVal);
        }
    }

    // this handles a datagrid column's onBlur - we will update the core data if different
    valueLeft(e: any, colName: string) {
        const root: DataGrid = this.props.root;
        const row: DataGridItem = root.rowMap.get(this.props.rowId);
        const oldVal: any = row.columns.get(colName).value;
        let newVal: any;

        switch (row.columns.get(colName).type) {
            case eContentType.ContentNumber:
                newVal = parseFloat(e.target.value).toFixed(2);
                // if(newVal>99) {
                //    newVal = 99;
                // }
                break;

            default:
                newVal = e.target.value;
                break;

        }

        if (oldVal !== newVal) {
            console.log('Updating col ' + colName + ' from ' + oldVal + ' to ' + newVal);
            root.rowValueComplete(this.props.rowId, colName, oldVal, newVal);
        }
    }

    showChanges(oldCol: string, newCol: string) {
        const root: DataGrid = this.props.root;
        const row: DataGridItem = root.rowMap.get(this.props.rowId);

    }

    render() {
        const root: DataGrid = this.props.root;
        const row: DataGridItem = root.rowMap.get(this.props.rowId);

        const content: any = [];
        const buttons: any = [];

        let selectedClass: string = '';
        if (root.selectedRows.has(row.id)) {
            selectedClass = ' data-grid-row-selected';
        }
        if (root.modifiedRows.has(row.id)) {
            selectedClass = ' data-grid-row-modified';
        }

        const style: CSSProperties = {};
        // if there's a filter list then hide me if not in it or not in expand list
        if (root.matchingRows.size > 0) {
            if (root.matchingRows.has(row.id) || root.selectedRows.has(row.id)) {

            } else {
                style.display = 'none';
            }
        }

        Object.keys(root.outcomes).forEach((key: string) => {
            const outcome: FlowOutcome = root.outcomes[key];
            if (outcome.isBulkAction === false && outcome.developerName !== 'OnSelect' && outcome.developerName !== 'OnChange' && !outcome.developerName.toLowerCase().startsWith('cm')) {
                let icon: any;
                let label: any;
                let showOutcome: boolean = this.assessRowOutcomeRule(outcome, row, root);

                if ((!outcome.attributes['display']) || outcome.attributes['display'].value.indexOf('text') >= 0) {
                    label = (
                        <span
                            className="data-grid-column-button-label"
                        >
                            {root.outcomes[key].label}
                        </span>
                    );
                }
                if ((outcome.attributes['display']) && outcome.attributes['display'].value.indexOf('icon') >= 0) {
                    if (outcome.attributes['icon'].value.toLowerCase() === 'null') {
                        showOutcome = false;
                    }
                    icon = (
                        <span
                            className={'glyphicon glyphicon-' + (outcome.attributes['icon']?.value || 'plus') + ' data-grid-column-button-icon'}
                        />
                    );
                }
                if (showOutcome === true) {
                    buttons.push(
                        <div
                            key={key}
                            className={'data-grid-column-button'}
                            title={outcome.label || key}
                            onClick={(event: any) => {
                                root.doOutcome(key, row.id);
                            }}
                        >
                            {icon}
                            {label}
                        </div>,
                    );
                }
            }
        });

        if (root.getAttribute('ButtonPositionRight', 'false').toLowerCase() !== 'true') {
            content.push(
                <td
                    className="data-grid-table-buttons-column"
                >
                    {buttons}
                </td>,
            );
        }

        let total: number = 0;
        let cols: string[];
        if (root.getAttribute('SummaryRows')) {
            cols = root.getAttribute('SummaryRows').split(',').map((col: string) => col.trim());
        }

        let lastColDef: FlowDisplayColumn;
        let infoButton: any;
        row.columns.forEach((col: DataGridColumn) => {
            const colDef: FlowDisplayColumn = root.colMap.get(col.name);
            if (colDef.visible === true) {
                let cell: any;
                if (colDef.readOnly === true) {
                    cell = (
                        <label
                            className="data-grid-column-label"
                        >
                            {col.value}
                        </label>
                    );
                } else {
                    let type: string = 'text';
                    switch (colDef.contentType) {
                        case eContentType.ContentNumber:
                            type = 'number';
                            break;
                        default:
                            type = 'text';
                            break;
                    }
                    cell = (
                        <input
                            type={type}
                            defaultValue={col.value}
                            className="data-grid-column-edit"
                            onBlur={(e: any) => {
                                e.stopPropagation();
                                this.valueLeft(e, col.name);
                            }}
                            onChange={(e: any) => {
                                e.stopPropagation();
                                this.valueChanged(e, col.name);
                            }}
                        />
                    );
                }

                if (cols?.indexOf(col.name) >= 0) {
                    total += parseFloat('' + col.value);
                }
                content.push(
                    <td
                        className={'data-grid-table-column data-grid-table-column-' + col.name}
                    >
                        {cell}
                    </td>,
                );
            } else {
                // if this col is not visible and the previous one was then assume this col is the original value for the last one
                if (lastColDef?.visible === true) {
                    // we need to add an info button if values are different
                    if (col.value !== row.columns.get(lastColDef.developerName).value) {
                        const oldCol: string = colDef.developerName;
                        const newCol: string = lastColDef.developerName;
                        infoButton = (
                            <span
                                className="glyphicon glyphicon-info-sign data-grid-icon"
                                title="Value change details"
                                onClick={(e: any) => {this.showChanges(oldCol, newCol); }}
                            />
                        );
                        selectedClass = ' data-grid-row-modified';
                    }
                }
                content.push(
                    <div
                        className="data-grid-table-buttons-column"
                    >
                        {infoButton}
                    </div>,
                );
            }
            lastColDef = colDef;
        });

        if (root.getAttribute('SummaryRows')) {
            content.push(
                <td
                    className="data-grid-table-column data-grid-table-column-#total"
                >
                    {total}
                </td>,
            );
        }

        if (root.getAttribute('ButtonPositionRight', 'false').toLowerCase() === 'true') {
            content.push(
                <td
                    className="data-grid-table-buttons-column"
                >
                    {buttons}
                </td>,
            );
        }

        return (
            <tr
                className={'data-grid-table-row' + selectedClass}
                // onClick={(e: any) => {root.doOutcome("OnSelect",row.id)}}
                style={style}
            >
                {content}
            </tr>
        );
    }

    // assesses any rule on the outcome.
    // It grabs the values for the criteria and comparator and then decides if it meets the criteria.
    assessRowOutcomeRule(outcome: FlowOutcome, row: DataGridItem, root: DataGrid): boolean {
        let result: boolean = true;
        if (!outcome) {
            return false;
        }
        if (outcome.attributes.rule && outcome.attributes.rule.value.length > 0) {
            try {
                const rule = JSON.parse(outcome.attributes.rule.value);

                let contentType: eContentType;
                let match: any;
                let fld: string = rule.field;
                let fld2: string = rule.value;
                let value: any = fld;
                let compareTo: any = fld2;
                while (match = RegExp(/{{([^}]*)}}/).exec(fld)) {
                    // is it a known static
                    switch (match[1]) {
                        case 'TENANT_ID':
                            contentType = eContentType.ContentString;
                            value = 'MyTenentId';
                            break;

                        default:
                            const fldElements: string[] = match[1].split('->');
                            // element[0] is the flow field name
                            let val: FlowField;
                            val = root.fields[fldElements[0]];

                            if (val) {
                                let od: FlowObjectData = val.value as FlowObjectData;
                                if (od) {
                                    if (fldElements.length > 1) {
                                        for (let epos = 1 ; epos < fldElements.length ; epos ++) {
                                            contentType = (od as FlowObjectData).properties[fldElements[epos]]?.contentType;
                                            od = (od as FlowObjectData).properties[fldElements[epos]].value as FlowObjectData;
                                        }
                                        value = od;
                                    } else {
                                        value = val.value;
                                        contentType = val.contentType;
                                    }
                                } else {
                                    value = val.value;
                                    contentType = val.contentType;
                                }
                            }
                            break;
                    }
                    fld = fld.replace(match[0], value);
                }

                while (match = RegExp(/{{([^}]*)}}/).exec(fld2)) {
                    // is it a known static
                    switch (match[1]) {
                        case 'TENANT_ID':
                            contentType = eContentType.ContentString;
                            value = 'MyTenentId';
                            break;

                        default:
                            const fldElements: string[] = match[1].split('->');
                            // element[0] is the flow field name
                            let val: FlowField;
                            val = root.fields[fldElements[0]];

                            if (val) {
                                let od: FlowObjectData = val.value as FlowObjectData;
                                if (od) {
                                    if (fldElements.length > 1) {
                                        for (let epos = 1 ; epos < fldElements.length ; epos ++) {
                                            contentType = (od as FlowObjectData).properties[fldElements[epos]]?.contentType;
                                            od = (od as FlowObjectData).properties[fldElements[epos]].value as FlowObjectData;
                                        }
                                        compareTo = od;
                                    } else {
                                        compareTo = val.value;
                                        contentType = val.contentType;
                                    }
                                } else {
                                    compareTo = val.value;
                                    contentType = val.contentType;
                                }
                            }
                            break;
                    }
                    fld2 = fld2.replace(match[0], value);
                }

                if (row.columns.has(fld)) {
                    const property: DataGridColumn = row.columns.get(fld);
                    result = this.assessRule(property.value, rule.comparator, compareTo, property.type);
                } else {
                    result = this.assessRule(value, rule.comparator, compareTo, contentType);
                }

            } catch (e) {
                console.log('The rule on row level outcome ' + outcome.developerName + ' is invalid');
            }
        }
        return result;
    }

    // the core rule assessor, compares field to value with the comparator
    assessRule(value: any, comparator: string, compareTo: string, fieldType: eContentType): boolean {
        let comparee: any;
        let comparer: any;
        let result: boolean = true;
        switch (fieldType) {
            case eContentType.ContentNumber:
                comparee = parseInt(compareTo);
                comparer = value;
                break;
            case eContentType.ContentDateTime:
                comparee = new Date(compareTo);
                comparer = value;
                break;
            case eContentType.ContentBoolean:
                comparee = ('' + compareTo).toLowerCase() === 'true';
                comparer = value;
                break;
            case eContentType.ContentString:
            default:
                comparee = compareTo.toLowerCase().split(',');
                if (comparee.length > 0) {
                    for (let pos = 0 ; pos < comparee.length ; pos++) {
                        comparee[pos] = comparee[pos].trim();
                    }
                }
                if (['in', 'not in'].indexOf(comparator.toLowerCase()) < 0) {
                    comparee = comparee[0];
                }
                comparer = (value as string)?.toLowerCase();
                break;
        }

        switch (comparator.toLowerCase()) {
            case 'equals':
                result = comparer === comparee;
                break;
            case 'not equals':
                result = comparer !== comparee;
                break;
            case 'contains':
                result = comparer.indexOf(comparee) >= 0;
                break;
            case 'not contains':
                result = comparer.indexOf(comparee) < 0;
                break;
            case 'starts with':
                result = ('' + comparer).startsWith(comparee);
                break;
            case 'ends with':
                result = ('' + comparer).endsWith(comparee);
                break;
            case 'in':
                result = comparee.indexOf(comparer) >= 0;
                break;
            case 'not in':
                result = comparee.indexOf(comparer) < 0;
                break;
            case 'lt':
                result = parseInt('' + comparer) < parseInt('' + comparee);
                break;
            case 'lte':
                result = parseInt('' + comparer) <= parseInt('' + comparee);
                break;
            case 'gt':
                result = parseInt('' + comparer) > parseInt('' + comparee);
                break;
            case 'gte':
                result = parseInt('' + comparer) >= parseInt('' + comparee);
                break;
        }
        return result;
    }
}
