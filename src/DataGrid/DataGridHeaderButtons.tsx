import { FlowField, FlowOutcome } from 'flow-component-model';
import React from 'react';
import DataGrid from './DataGrid';

export default class DataGridHeaderButtons extends React.Component<any, any> {

    render() {
        const root: DataGrid = this.props.root;
        const content: any = [];

        const lastOrder: number = 0;
        const addedExpand: boolean = false;
        const addedContract: boolean = false;
        Object.keys(root.outcomes).forEach((key: string) => {
            const outcome: FlowOutcome = root.outcomes[key];

            if (outcome.isBulkAction && outcome.developerName !== 'OnSelect' && outcome.developerName !== 'OnChange' && !outcome.developerName.toLowerCase().startsWith('cm')) {
                let className = 'data-grid-header-button';
                if (outcome.attributes['EnabledOn']) {
                    const enabledField: FlowField = root.fields[outcome.attributes['EnabledOn'].value];
                    if (!enabledField || (enabledField.value as string).toLowerCase() !==  'true') {
                        className += ' data-grid-header-button-dissabled';
                    }
                }

                content.push(
                    <div
                        className={className}
                        key={key}
                        title={outcome.label || key}
                        onClick={(e: any) => {root.doOutcome(key, undefined); }}
                    >
                        <span
                            className={'glyphicon glyphicon-' + (outcome.attributes['icon']?.value || 'plus') + ' data-grid-header-button-icon'}
                        />
                        <span
                            className={'data-grid-header-button-label'}
                        >
                            {outcome.label || key}
                        </span>
                    </div>,
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
