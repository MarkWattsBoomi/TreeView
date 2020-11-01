This module provides a tree view to display hierarchical data.

# Functionality

The component will display a hierarchical tree of the data with no limit on hierarchical levels

Each node can be collapsed and expanded

Tools at the top allow complete collapse and expand

Each node is shown with the ITEM_NAME attribute value and the ITEM_DESCRIPTION attribute as its tool tip.


# Drag & Drop

Nodes can be dragged and dropped onto other nodes - to be defined ##TO-DO##

# DataSource

Set the datasource to a list of ITEM objects


# State

Create a State object of the type of the root level nodes.

Note: If the types in the tree vary due to a Flow Service naming issue don't worry.  The Tree will convert any triggering node to the type of the root tree items before setting the state value


# Outcomes

Outcomes are available for the following and must be named as shown.

Outcomes are all optional and ignored if not attached to the component.

## OnSelect

Triggered when a node is selected, sets the state value to selected node then triggers the outcome if it exists.

## OnEdit

If exists then shows an edit button beside the node which when clicked sets the state value and triggers the outcome.

The icon for the button is set via the "icon" attribute of the outcome.

The tooltip for the button comes from the outcome's label.

Icons are bootstrap glyphicons without the "glyphicon-" prefix.

## OnDelete

If exists then shows an delete button beside the node which when clicked sets the state value and triggers the outcome.

The icon for the button is set via the "icon" attribute of the outcome.

The tooltip for the button comes from the outcome's label.

Icons are bootstrap glyphicons without the "glyphicon-" prefix.

## OnRefresh

If exists then shows a refresh button in the title bar which when clicked sets the state value and triggers the outcome.

The icon for the button is set via the "icon" attribute of the outcome.

The tooltip for the button comes from the outcome's label.

Icons are bootstrap glyphicons without the "glyphicon-" prefix.

## OnBack

If exists then shows a back button in the title bar which when clicked sets the state value and triggers the outcome.

The icon for the button is set via the "icon" attribute of the outcome.

The tooltip for the button comes from the outcome's label.

Icons are bootstrap glyphicons without the "glyphicon-" prefix.


# Settings

## Label

The Label of the component is used as the title bar

## Width & Height

If specified then these are applied as pixel values.

## Read Only

Sets wether drag and drop of nodes is enabled.



# Attributes

## EditLowest

If set to true then only the lowest level nodes will show buttons for edit & delete

## classes

Like all components, adding a "classes" attribute will cause that string to be added to the base component's class value


# Styling

All elements of the tree can be styled by adding the specific style names to your player.


# Page Conditions

The component respects the show / hide rules applied by the containing page.


# Data Model

The component requires a specific type structure which you must generate.

The actual names of the types in flow doesn't matter but the attribute names must be adhered to.

The ATTRIBUTES property is optional as is the corresponding type.

You can have other attributes but the tree doesn't use them.

{
    "developerName": "ITEM",
    "developerSummary": "The item rendered as a tree node",
    "elementType": "TYPE",
    "id": null,
    "properties": [
        {
            "contentType": "ContentNumber",
            "developerName": "ITEM_ID",
            "id": null,
        },
        {
            "contentType": "ContentString",
            "developerName": "ITEM_NAME",
            "id": null,
        },
        {
            "contentType": "ContentString",
            "developerName": "ITEM_DESCRIPTION",
            "id": null,
        },
        {
            "contentType": "ContentString",
            "developerName": "ITEM_TYPE",
            "id": null,
        },
        {
            "contentType": "ContentString",
            "developerName": "ITEM_STATUS",
            "id": null,
        },
        {
            "contentType": "ContentString",
            "developerName": "IS_LOCKED",
            "id": null,
        },
        {
            "contentFormat": null,
            "contentType": "ContentList",
            "developerName": "CHILDREN",
            "id": null,
            "typeElementDeveloperName": "ITEM"
        },
        {
            "contentType": "ContentList",
            "developerName": "ATTRIBUTES",
            "id": null,
            "typeElementDeveloperName": "ITEM_ATTRIBUTE,
        }
    ]
}

{
    "developerName": "ITEM_ATTRIBUTE",
    "developerSummary": "An attribute of the item",
    "elementType": "TYPE",
    "id": null,
        "properties": [
            {
                "contentType": "ContentNumber",
                "developerName": "ATTRIBUTE_ID",
                "id": null
            },
            {
                "contentType": "ContentString",
                "developerName": "ATTRIBUTE_NAME",
                "id": null
            },
            {
                "contentType": "ContentString",
                "developerName": "ATTRIBUTE_DESCRIPTION",
                "id": null
            },
            {
                "contentType": "ContentString",
                "developerName": "ATTRIBUTE_VALUE",
                "id": null
            }
        ]
    }