import {eContentType, FlowComponent, FlowDisplayColumn, FlowObjectData, FlowObjectDataArray, FlowObjectDataProperty} from 'flow-component-model';
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


        // this will hold an array of all found child attribute names.
        // it will ultimately be used to order / construct the output
        let columns: Array<string> = [];

        // an array of maps.  each array item is an object data and its map of cols / attributes keyed on name
        const values: Array<Map<string,any>> = [];
        
        //loop over the datasource adding it's props to the vals map
        this.model.dataSource.items.forEach((item: FlowObjectData) => {
            //create new map for this item
            let value: Map<string,any> = new Map();
            
            // loop over props adding each one
            Object.keys(item.properties).forEach((key: string) => {
                let prop: FlowObjectDataProperty = item.properties[key];
                
                switch(prop.contentType){
                    case eContentType.ContentList:
                        let subvals: Map<string,string> = new Map();
                        let children: FlowObjectDataArray = prop.value as FlowObjectDataArray;
                        children.items.forEach((item: FlowObjectData) => {
                            subvals.set(item.properties["ATTRIBUTE_DISPLAY_NAME"].value as string , item.properties["ATTRIBUTE_VALUE"].value as string);
                            if(columns.indexOf(item.properties["ATTRIBUTE_DISPLAY_NAME"].value as string) < 0) {
                               columns.push(item.properties["ATTRIBUTE_DISPLAY_NAME"].value as string);
                            }
                        });
                        value.set(prop.developerName, subvals);
                        break;
    
                    default:
                        value.set(prop.developerName, prop.value);
                        break;
                }
            })

            // add this item to the array
            values.push(value);
        });

        //now sort sub columns
        let collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
        columns = columns.sort((a: any,b: any) => collator.compare(a,b));

        //now sort columns
        let dcolumns: Array<FlowDisplayColumn> = this.model.displayColumns.sort((a: any,b: any) => collator.compare(a.displayOrder,b.displayOrder));
        

        // build headers
        
        dcolumns.forEach((col: FlowDisplayColumn) => {
            if(headers.length > 0) {
                headers += ","
            }
            if(col.contentType === eContentType.ContentList) {
                let subHeaders: string = "";
                columns.forEach((key: string) => {
                    if(subHeaders.length > 0) {
                        subHeaders += ","
                    }
                    subHeaders += "\"" + key + "\"";
                });  
                headers += subHeaders;              
            }
            else {
                headers += "\"" + col.label + "\"";
            }
        });
        //now loop over the values referincing the display cols to build the row
        
        values.forEach((value: Map<string, any>) => {
            row="";
            dcolumns.forEach((col: FlowDisplayColumn) => {
                if(row.length > 0) {
                    row += ","
                }
                if(value.has(col.developerName)) {
                    if(col.contentType === eContentType.ContentList) {
                        let subRow: string = "";
                        let children: Map<string,string> = value.get(col.developerName);
                        columns.forEach((key: string) => {
                            if(subRow.length > 0) {
                                subRow += ","
                            }
                            subRow += "\"" + (children.has(key) ? children.get(key) : "") + "\"";
                        });
                        row += subRow;
                    }
                    else {
                        row += "\"" + (value.has(col.developerName) ? value.get(col.developerName) : "") + "\"";
                        
                    }
                    
                }
                else {
                    row += "\"\"";
                }
            });
            row += '\r\n';
            body += row;
        });
        
        
        
        file = headers + '\r\n' + body;

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
