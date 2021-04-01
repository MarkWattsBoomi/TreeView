import { FlowField, FlowOutcome } from "flow-component-model";
import React from "react";
import DataGrid from "./DataGrid";

export default class DataGridHeaderButtons extends React.Component<any,any> {
    

    render () {
        let root: DataGrid = this.props.root;
        let content : any = [];

        let lastOrder: number = 0;
        let addedExpand: boolean = false;
        let addedContract: boolean = false;
        Object.keys(root.outcomes).forEach((key: string) => {
            const outcome: FlowOutcome = root.outcomes[key];
            
            if (outcome.isBulkAction && outcome.developerName !== "OnSelect" && outcome.developerName !== "OnChange" && !outcome.developerName.toLowerCase().startsWith("cm")) {
                let className = "data-grid-header-button";
                if(outcome.attributes["EnabledOn"]) {
                    let enabledField: FlowField = root.fields[outcome.attributes["EnabledOn"].value];
                    if((enabledField.value as string).toLowerCase() !==  "true") {
                        className += " data-grid-header-button-dissabled";
                    }
                }
                
                content.push(
                    <div
                        className={className}
                        key={key}
                        title={outcome.label || key}
                        onClick={(e: any) => {root.doOutcome(key, undefined)}}
                    >
                        <span 
                            className={"glyphicon glyphicon-" + (outcome.attributes["icon"]?.value || "plus") + " data-grid-header-button-icon"} 
                        />
                        <span 
                            className={"data-grid-header-button-label"} 
                        >
                            {outcome.label || key}
                        </span>
                    </div>
                );
                
            }
        });


        return(
            <div
                className="data-grid-header-buttons"
            >
                {content}
            </div>                        
        );
    }
}