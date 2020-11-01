This module provides a single custom component which presents a work flows UI.

You put it directly into a page.

# Work Queues UI

Copy the flowWf.css & flowWf.js files to you tenant's assets.

Create a new player for the work queues and add the two files as custom resources.

Create a flow with a single page.  the page should containe a single component of type "WorkFlow".

* or import this token "wXHui2zjsPzIdjKP0teEApAmdOySTnmNJQOlPL35e5ZrtT1qUio6F6G5bZe3atLf"

Set these attributes on it: -

* logo - the full url of the logo you want in the title bar, probably stored in your assets

* adminlogo - the full url of the logo you want in the title bar when in admin mode

* title - the title to display in the title bar

* schema - the schema containing the database tables for the flowWf implementation - see table defs below.

* queuesRefreshInterval - the interval in milliseconds at which to refresh the work queues.

* itemsRefreshInterval - the interval in milliseconds at which to refresh the work items list.

# FlowWFApi

So that flows can inform the workqueues UI that an item has moved we need to implement the FlowWFApi module.

This is a javascript library which attaches to outcomes from pages and sends a message to the WorkQueues UI.

Import the FlowWFApi.js file into your tenant's assets and include it as a custom resource in the player used to render the child flow.

On each outcome which is triggered in the child flow from interaction in the WorkQueues UI simply add an attribute to the outcome.

* "NotifyParent" = "true"


# FlowWf database tables

Create these tables in the schema you specified on the component: -

```
create schema xxxx;

CREATE TABLE xxxx.fielddef (
	fieldname text NOT NULL,
	caption text NULL,
	fieldtype int4 NULL,
	issortable bool NULL,
	isfilterable bool NULL,
	isselectable bool NULL,
	CONSTRAINT fielddef_pkey PRIMARY KEY (fieldname)
);

CREATE TABLE xxxx.workqueue (
	queue bigserial NOT NULL,
	parentqueue int8 NULL,
	"name" text NULL,
	description text NULL,
	icon text NULL,
	CONSTRAINT workqueue_pk PRIMARY KEY (queue)
);

CREATE TABLE xxxx.workqueuefield (
	wqfid bigserial NOT NULL,
	userid text NULL,
	queue int8 NULL,
	fieldname text NULL,
	fieldorder int8 NULL,
	CONSTRAINT workqueuefield_pkey PRIMARY KEY (wqfid)
);

CREATE TABLE xxxx.workitem (
	"stateId" text NOT NULL,
	"flowId" text NOT NULL,
	fields jsonb NULL,
	CONSTRAINT workitem_pk PRIMARY KEY ("stateId", "flowId")
);

CREATE TABLE xxxx.userworkqueue (
	queue int8 NOT NULL,
	email text NOT NULL,
    CONSTRAINT userworkqueue_pk PRIMARY KEY (queue, email)
)

CREATE TABLE xxxx.users (
	email text NOT NULL,
	isadmin int4 NULL,
    CONSTRAINT users_pk PRIMARY KEY (email) ";
);
```

# Implementing Flow Integration

To have a flow deliver work items into the queues you need a couple of things: -

* or import this token to do it all for you "P4Dr0sB2tzX9i2HCVNdYcqtQevqhbjJ3D/Jzl2dediEIGJYz+mvFb1oPf4AoTIP5"

## flowWFWorkItem
A field definition called $WorkItem which is of type "flowWFWorkItem"
!!! It's your job in the flow to set/maintain these properties

Use this JSON to create it
```
{
        "bindings": null,
        "developerName": "flowWFWorkItem",
        "developerSummary": "",
        "elementType": "TYPE",
        "id": null,
        "properties": [
            {
                "contentFormat": "",
                "contentType": "ContentString",
                "developerName": "currentQueue",
                "id": null,
                "typeElementDeveloperName": null,
                "typeElementId": null
            },
            {
                "contentFormat": "",
                "contentType": "ContentNumber",
                "developerName": "priority",
                "id": null,
                "typeElementDeveloperName": null,
                "typeElementId": null
            },
            {
                "contentFormat": "",
                "contentType": "ContentDateTime",
                "developerName": "dateDue",
                "id": null,
                "typeElementDeveloperName": null,
                "typeElementId": null
            },
            {
                "contentFormat": "",
                "contentType": "ContentString",
                "developerName": "activityName",
                "id": null,
                "typeElementDeveloperName": null,
                "typeElementId": null
            },
            {
                "contentFormat": "",
                "contentType": "ContentString",
                "developerName": "status",
                "id": null,
                "typeElementDeveloperName": null,
                "typeElementId": null
            },
            {
                "contentFormat": "",
                "contentType": "ContentDateTime",
                "developerName": "dateClosed",
                "id": null,
                "typeElementDeveloperName": null,
                "typeElementId": null
            },
            {
                "contentFormat": "",
                "contentType": "ContentString",
                "developerName": "assignedTo",
                "id": null,
                "typeElementDeveloperName": null,
                "typeElementId": null
            },
            {
                "contentFormat": "",
                "contentType": "ContentDateTime",
                "developerName": "assignedDate",
                "id": null,
                "typeElementDeveloperName": null,
                "typeElementId": null
            }
        ],
        "serviceElementDeveloperName": null,
        "serviceElementId": null,
        "updateByName": false,
        
    }
```

## Work Item Prep Macro 
    Call this in your flow before calling the flow service to update the work item.

    !!! Note you need to set the name of the player you want to use to override any default or one selected when launching the flow
    !!! Note you need to populate the syncFields array with the fields you want pushing to the database to show as columns
    
    !!! It will only work on simple types like string, number, date

    Name it "updateWorkitem" and it should contain this code: -
    

```
//prep message
let message = {};

// !!! set the player name for this process here !!!
let playerName = "Enquiries";

//rework join uri
let joinUri = state.getValue('{![$State].[Join URI]}');
const finalJoinUri = joinUri.substring(0,joinUri.indexOf("play/")+5) + playerName + joinUri.substring(joinUri.indexOf("?"));


//set core fields
message.flowid=state.getStringValue('{![$State].[Flow ID]}');
message.stateid=state.getStringValue('{![$State].[ID]}');
message.fields={};
message.fields.joinUri={fieldName: 'joinUri', fieldType:1, fieldValue: finalJoinUri};
message.fields.flowId={fieldName: 'flowId', fieldType: 1, fieldValue: state.getValue('{![$State].[Flow ID]}')};
message.fields.stateId={fieldName: 'stateId', fieldType: 1, fieldValue: state.getValue('{![$State].[ID]}')};
message.fields.processName={fieldName: 'processName', fieldType: 1, fieldValue: state.getValue('{![$State].[Flow Developer Name]}')};
message.fields.dateCreated={fieldName: 'dateCreated', fieldType: 8, fieldValue: state.getDateTimeValue('{![$State].[Date Created]}').toISOString()};


let now = new Date();
message.fields.dateDelivered={fieldName: 'dateDelivered', fieldType: 8, fieldValue: now.toISOString()};

//set fields from $WorkItem
let wi = state.getObject('{![$WorkItem]}');
if(wi) {
    message.fields.currentQueue={fieldName: 'currentQueue', fieldType: 1, fieldValue: state.getValue('{![$WorkItem].[currentQueue]}')};
    message.fields.activityName={fieldName: 'activityName', fieldType: 1, fieldValue: state.getValue('{![$WorkItem].[activityName]}')};
    message.fields.priority={fieldName: 'priority', fieldType: 2, fieldValue: state.getValue('{![$WorkItem].[priority]}')};
    message.fields.status={fieldName: 'status', fieldType: 2, fieldValue: state.getValue('{![$WorkItem].[status]}')};
    
    message.fields.assignedTo={fieldName: 'assignedTo', fieldType: 1, fieldValue: state.getStringValue('{![$WorkItem].[assignedTo]}')};
    
    let assignedDate = state.getDateTimeValue('{![$WorkItem].[assignedDate]}');
    if(assignedDate != null) {
        message.fields.assignedDate={fieldName: 'assignedDate', fieldType: 8, fieldValue: assignedDate.toISOString()};
    }
    
    
    if( state.getValue('{![$WorkItem].[status]}') === state.getValue('{![$$STATUS-CLOSED]}') ) {
        message.fields.dateClosed={fieldName: 'dateClosed', fieldType: 8, fieldValue: now.toISOString() };
    }
}


//get sync fields
let syncFields = [];
syncFields.push({"flowField":"{![ShippingEnquiry].[LoadingPort]}","fieldType":1, "targetProperty":"LoadingPort"});
syncFields.push({"flowField":"{![ShippingEnquiry].[DischargePort]}","fieldType":1, "targetProperty":"DischargePort"});



for(i=0;i<syncFields.length;i++) {
   let fieldVal = state.getValue(syncFields[i].flowField);
   message.fields[syncFields[i].targetProperty] = {fieldName: syncFields[i].targetProperty, fieldType: syncFields[i].fieldType, fieldValue: fieldVal};
    
}

state.setStringValue('{![$UpdateWorkItemRequest]}', JSON.stringify(message));


```

## Workitem update request field

Create a string field called "$UpdateWorkItemRequest"

This will hold the JSON request generated by the macro and will be used to call the Flow Service.

## Flow Service

Install the Flow Service which connects to the underlying PostGRES DB.

Provide it with name of the schema which holds the database.


## Delivery to Queue

In the flow, before the user activity use an operator to set the values for: -

```
flowWFWorkItem.currentQueue
flowWFWorkItem.priority
flowWFWorkItem.activityName
flowWFWorkItem.status
flowWFWorkItem.dueDate
flowWFWorkItem.assignedTo
flowWFWorkItem.assignedDate
```

Then trigger the macro, make sure the macro order is higher than the field settings, set it to 99 or something

Then use a message element to call the flow service's "updateWorkItem" method passing in the "$UpdateWorkItemRequest"

* currentQueue is a number which you need to look up in the DB, make constant fields in flow to store them.
* status is a single char A=Active, P=Pended, C=Closed.
* priority is a number from 1-99, you could use a timer + macro to raise this as due date approaches for example.
* activityName is a simple string you can use to describe the task.
* dueDate is a date/time when the item is due to be processed.