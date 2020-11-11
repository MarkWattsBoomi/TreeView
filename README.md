This module provides a tree view & companion table view to display hierarchical data.

# Class Names

TreeView & TableView

# TreeView

## Functionality

The component will display a hierarchical tree of the data with no limit on hierarchical levels

Each node can be collapsed and expanded

Tools at the top allow complete collapse and expand

Each node is shown with the ITEM_NAME attribute value and the ITEM_DESCRIPTION attribute as its tool tip.


## Drag & Drop

Nodes can be dragged and dropped onto other nodes - to be defined ##TO-DO##

## DataSource

Set the datasource to a list of ITEM objects


## State

Create a State object of the type of the model data items.


## Outcomes

Any outcome attached to the component is dealt with in this way: -

* If the outcome is set as "Appears At Top" then it will become a button in the top title bar or its context menu otherwise it becomes a button on the tree node or its context menu.

* If the outcome has its "When this outcome is selected" option set to either "Save Changes" or "Partially Save Changes" and is attached 
to a tree node then the current node is set as the state value when triggered.

* If the outcome has an "icon" attribute then this value is used to specify the icon, otherwise a default "+" icon is used.  Note: Icons are 
bootstrap glyphicons without the "glyphicon-" prefix e.g. "trash","edit" etc.

* If the outcome has a "Label" set then this is used as the tooltip otherwise the outcome's name is used.

* "OnSelect" is a special case and is attached to the action of clicking a tree node.

* If the outcome's developer name begins with "CM" (case insensitive) then the outcome is added to either the main tree or the current node's context menu rather than as a button.

* All outcomes including "OnSelect" are optional.

* Outcome order is respected.  

* The expand and contract default buttons in the title bar are given order 10 & 20 respectively to allow for controlling button display order and injecting your outcome around them.

## Outcome Attributes

### LowestOnly

If present and set to "true" then only the lowest level tree nodes will show buttons or context menu items for this outcome


## Settings

### Label

The Label of the component is used as the title bar

### Width & Height

If specified then these are applied as pixel values.

### Read Only

Sets wether drag and drop of nodes is enabled.



## Component Attributes

### classes

Like all components, adding a "classes" attribute will cause that string to be added to the base component's class value

### DebugLevel

Setting this enables extra output in the console and on screen.  It's a number,  error = 0, warning = 1, info = 2, verbose = 3

info / 2 for example will display the node's id & parent in the tree

### ShowInfo

Setting this attribute to "true" will show an info icon beside the node which when clicked displays a modal dialog with the node's details in it.

The displayed details are configured in the Data Presentation settings of the page element.

### MaxResults

Setting this attribute to a number e.g. 20 will set the level at which a search will truncate the results and show a warning.  Default if not specified = 30.

### StartExpanded

Setting this attribute to "true" will show the tree initially fully expanded.  Default = false



## Styling

All elements of the tree can be styled by adding the specific style names to your player.


## Page Conditions

The component respects the show / hide rules applied by the containing page.


## Data Model

The component requires a list of items of a specific type structure which you must generate.

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
            "contentType": "ContentNumber",
            "developerName": "PARENT_ID",
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
    ]
}

# TableView

## Functionality

The component will display a stylistically equivalent campanion table


## DataSource

Set the datasource to a list objects of any type


## State

Create a State object of the type of the model data items.


## Outcomes

Any outcome attached to the component is dealt with in this way: -

* If the outcome is set as "Appears At Top" then it will become a button in the top title bar or its context menu otherwise it becomes a button on the table row or its context menu.

* If the outcome has its "When this outcome is selected" option set to either "Save Changes" or "Partially Save Changes" and is attached 
to a table row then the current row is set as the state value when triggered.

* If the outcome has an "icon" attribute then this value is used to specify the icon, otherwise a default "+" icon is used.  Note: Icons are 
bootstrap glyphicons without the "glyphicon-" prefix e.g. "trash","edit" etc.

* If the outcome has a "Label" set then this is used as the tooltip otherwise the outcome's name is used.

* "OnSelect" is a special case and is attached to the action of clicking a table row.

* If the outcome's developer name begins with "CM" (case insensitive) then the outcome is added to either the main table or the current row's context menu rather than as a button.

* All outcomes including "OnSelect" are optional.

* Outcome order is respected.  


## Outcome Attributes

## Settings

### Columns

Sets the display columns for the table.

### Label

The Label of the component is used as the title bar

### Width & Height

If specified then these are applied as pixel values.





## Component Attributes

### classes

Like all components, adding a "classes" attribute will cause that string to be added to the base component's class value

### DebugLevel

Setting this enables extra output in the console and on screen.  It's a number,  error = 0, warning = 1, info = 2, verbose = 3

info / 2 for example will display the node's id & parent in the tree


## Styling

All elements of the tree can be styled by adding the specific style names to your player.


## Page Conditions

The component respects the show / hide rules applied by the containing page.


