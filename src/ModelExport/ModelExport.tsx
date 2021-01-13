import {eContentType, FlowComponent, FlowDisplayColumn, FlowObjectData, FlowObjectDataArray} from 'flow-component-model';
import * as React from 'react';

declare const manywho: any;

export default class ModelExport extends FlowComponent {

    constructor(props: any) {
        super(props);
        this.export = this.export.bind(this);
    }

    async componentDidMount() {
        await super.componentDidMount();
    }

    async componentWillUnmount(): Promise<void> {
         return Promise.resolve();
    }

    render() {

        const caption: string = this.model.label || 'Click to export data';
        const classes = ' ' + this.getAttribute('classes', '');

        const style: React.CSSProperties = {};
        if (this.model.visible === false) {
            style.display = 'none';
        }

        let header: any;

        return (
                <div
                    className="form-group"
                >
                    <button
                        className="btn-primary btn btn-default"
                        style={style}
                        onClick={this.export}
                    >
                        Export
                    </button>

               </div>
        );
    }

    export(e: any) {
        let file: string = '';
        let body: string = '';
        let headers: string = '';
        let row: string = '';
        const cols: Map<string,FlowDisplayColumn> = new Map();
        this.model.displayColumns.forEach((col: FlowDisplayColumn) => {
            cols.set(col.developerName, col);
        });

        this.model.dataSource.items.forEach((item: FlowObjectData) => {
            
            if(headers.length === 0){
                headers = this.buildHeaders(cols,item);
            }
            row = this.buildRow(cols,item)
            body += row;
        });

        file = headers + body;

        const blob = new Blob([file], { type: 'text/csv' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, this.getAttribute("ExportFileName","output") + '.csv');
        } else {
            const link = document.createElement('a');
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', this.getAttribute("ExportFileName","output") + '.csv');
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
        if(this.outcomes["OnExport"]) {
            this.triggerOutcome("OnExport");
        }
    }

    buildHeaders(cols: Map<string,FlowDisplayColumn>, values: FlowObjectData) : string {
        let headers: string = "";
        cols.forEach((col: FlowDisplayColumn) => {
            switch(col.contentType){
                case eContentType.ContentList:
                    let children: FlowObjectDataArray = values.properties[col.developerName].value as FlowObjectDataArray;
                    children.items.forEach((item: FlowObjectData) => {
                        if (headers.length > 0) {
                            headers += ',';
                        }
                        headers += '"' + item.properties["ATTRIBUTE_DISPLAY_NAME"].value + '"';
                    });
                    
                    break;

                default:
                    if (headers.length > 0) {
                        headers += ',';
                    }
                    headers += '"' + col.label + '"';
                    break;
            }
           
        });
        headers += '\r\n';
        return headers;
    }

    buildRow(cols: Map<string,FlowDisplayColumn>, values: FlowObjectData) : string { 
        let row: string = ""
        cols.forEach((col: FlowDisplayColumn) => {
            switch(col.contentType){
                case eContentType.ContentList:
                    let children: FlowObjectDataArray = values.properties[col.developerName].value as FlowObjectDataArray;
                    children.items.forEach((item: FlowObjectData) => {
                        if (row.length > 0) {
                            row += ',';
                        }
                        row += '"' + item.properties["ATTRIBUTE_VALUE"].value + '"';
                    });
                    
                    break;

                default:
                    if (row.length > 0) {
                        row += ',';
                    }
                    row += '"' + values.properties[col.developerName].value + '"';
                    break;
            }
           
        });
        row += '\r\n';
        return row;
    }

}

manywho.component.register('ModelExport', ModelExport);
