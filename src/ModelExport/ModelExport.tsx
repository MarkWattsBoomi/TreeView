import {eContentType, eLoadingState, FlowComponent, FlowDisplayColumn, FlowObjectData, FlowObjectDataArray, FlowObjectDataProperty, ModalDialog, modalDialogButton} from 'flow-component-model';
import * as React from 'react';

declare const manywho: any;

export default class ListExport extends FlowComponent {

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
        let row: string = '';
        const cols: Map<string,FlowDisplayColumn> = new Map();
        this.model.displayColumns.forEach((col: FlowDisplayColumn) => {
            cols.set(col.developerName, col);
        });

        cols.forEach((col: FlowDisplayColumn) => {
            if (row.length > 0) {
                row += ',';
            }
            row += '"' + col.label + '"';
        });
        file += row + '\r\n';

        this.model.dataSource.items.forEach((item: FlowObjectData) => {
            row = '';
            cols.forEach((element: any) => {
                if (row.length > 0) {
                    row += ',';
                }
                switch(item.properties[element.name].contentType){

                    default:
                        
                }
                row += '"' + item.properties[element.name].value + '"';
            });
            file += row + '\r\n';
        });

        const blob = new Blob([file], { type: 'text/csv' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, 'output.csv');
        } else {
            const link = document.createElement('a');
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', 'output.csv');
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }

    }

    async downloadIFN() {
        /*
        const parts: string[] = this.IFN.content.split(',');
        const header: string = parts[0];
        let body: string = parts[1];
        const hBits: string[] = header.split(';');
        const isB64: boolean = hBits[1].toLowerCase() === 'base64';
        const mBits: string[] = hBits[0].split(':');
        const dataFlag: boolean = mBits[0].toLowerCase() === 'data';
        const mime: string = mBits[1];

        if (isB64 === true) {
            body = Base64.decode(body);
        }

        const blob = new Blob([body], { type: mime });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, this.IFN.fileName);
        } else {
            const link = document.createElement('a');
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', this.IFN.fileName);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
        */
    }

}

manywho.component.register('ListExport', ListExport);
