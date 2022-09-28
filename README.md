This module provides a tree view & companion table view to display hierarchical data.

# Class Names

TreeView & TableView & SelectView & ModalNavigation

# TreeView

## Functionality

The component will display a hierarchical tree of the data with no limit on hierarchical levels

Each node can be collapsed and expanded

Tools at the top allow complete collapse and expand

Each node is shown with the ITEM_NAME attribute value and the ITEM_DESCRIPTION attribute as its tool tip.

The tree will parse the list of nodes and construct the hierarchical model based on the PARENT_ID.

If a node has no PARENT_ID or that PARENT_ID is not found in another row's ITEM_ID then that row becomes a root / base node.

The tree takes the selected item from the state and will expand the tree to that element and highlight it.

Searching will find any matching nodes and expand to ensure they are visible.

Searching requires a minimum of 4 characters in the box and limits the results to MaxSearchResults.

Searching searches in both the ITEM_NAME & ITEM_DESCRIPTION

## Enable / Disable

The nodes in the tree can be flagged as enabled or disabled by setting a known value on the item's ITEM_STATUS attribute.

If empty or null then the default is FALSE

A value of "LOCKED" or "DISABLED": or "READONLY" will make the node disabled.

A value of null or "" or "UNLOCKED" or "ENABLED" or "EDITABLE" or "WRITABLE" will set the node as editable

If a node is not editable then all buttons and context menu items are removed.

Also the value of the ITEM_STATUS will be added to the node's base element as a CSS class prefixed with "nodestyle_" e.g. DISABLED = "nodestyle_disabled".

This allows visual modification of the node through CSS based on its status.


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

### icon

Sets the glyphicon to show for the outcome.


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

### LowestOnly

If present and set to "true" then only the lowest level tree nodes will show buttons or context menu items for this outcome

### ClickedState

If present and set to the value name of an object of the same type as the model then this will be set to the value of the clicked item regardless of the edabled state, this complements the state value which can only be set to an enabled item.


## Styling

All elements of the tree can be styled by adding the specific style names to your player.


## Page Conditions

The component respects the show / hide rules applied by the containing page.


## Data Model

The component requires a list of items of a specific type structure which you must generate.

The actual names of the types in flow doesn't matter but the attribute names must be adhered to.

You can have other attributes but the tree doesn't use them.

* ITEM_ID is the primary key of the row
* PARENT_ID tells the tree the parent node's primary key
* ITEM_NAME is the text used to display in the tree
* ITEM_DESCRIPTION is shown as the tree item's tooltip
* ITEM_STATUS is used to control the item's functionality, "LOCKED", "DISABLED" will prevent any buttons or context menu being shown and will add a class "TV_" + status to the node

```javascript
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
            "developerName": "ITEM_STATUS",
            "id": null,
        },
        ...
    ]
}
```

# TableView

## Functionality

The component will display a stylistically equivalent companion table.

The items are displayed as defined in the display columns.

You can set a column to editable via the metadata at which point you can edit the column value.

It the table has a List state type value and is NOT set to multi-select then the entire model dataset is copied to the state with modified items flagged as selected.

It the table has a List state type value and is set to multi-select then the rows from the model which were modified are copied to the state.

It the table has an Object state type value then only single selection is allowed and the selected row from the model is copied to the state.



## DataSource

Set the datasource to a list objects of any type


## State

Create a State list of the type of the model data items.  The state must be a list !!!


## Outcomes

Any outcome attached to the component is dealt with in this way: -

* If the outcome is set as "Appears At Top" then it will become a button in the top title bar or its context menu otherwise it becomes a button on the table row or its context menu.

* If the outcome has its "When this outcome is selected" option set to either "Save Changes" or "Partially Save Changes" and is attached 
to a table row then the current row is stored into the value defined in the table's "RowLevelState" attribute.  Give it the name of a value which is an object of the tables model type.

* If the outcome has an "icon" attribute then this value is used to specify the icon, otherwise a default "+" icon is used.  Note: Icons are 
bootstrap glyphicons without the "glyphicon-" prefix e.g. "trash","edit" etc.

* If the outcome has a "Label" set then this is used as the tooltip otherwise the outcome's name is used.

* "OnSelect" is a special case and is attached to the action of clicking a table row.

* "OnChange" is a special case and is attached to the action of modifying a table cell value and leaving the cell (onBlur).

* If the outcome's developer name begins with "CM" (case insensitive) then the outcome is added to either the main table or the current row's context menu rather than as a button.

* All outcomes including "OnSelect" are optional.

* Outcome order is respected.  

Note: if a table is editable but the "OnChange" outcome is not attached then the table will remember all changes and highlight changed rows. 


## Outcome Attributes

### display

Tells the table how to display the buttons.

Valid options are "text" or "iconandtext" or "icon".

Default is text only.

### icon

Sets the glyphicon to show for the outcome.

### rule
Row level outcomes allow for adding rules which will control if the outcome should be displayed for the current row.
Top Level Outcomes allow for adding rules based of other non-row data.

The attribute value string should be in JSON format like this: -
'''
{
   "field":"fieldDeveloperName",
   "comparator":"enumeratedComparator",
   "value":"valueToTest"
}
'''

In the case of row level outcomes, the "field" is set to the developerName of the column to test.

The "field" specifies either the name of a row's column (only in the case of row level outcomes) or the name of a flow field or one of its attributes to test.
The "value" specifies either a fixed value or the name of a flow field or one of its attributes to compare to.

In the case either the field or value is a flow field then put the field name and optionally attribute name in curly brace notation: -
{{FlowFieldName}} or {{FlowFieldName->PropertyName}}

The "comparator" must be one of the following: - 

* "equals"          Value must match
* "not equals"      Value must not match
* "contains"        Value must contain
* "not contains"    Value must not contain
* "starts with"     Value must start with 
* "ends with"       Value must end with
* "in"              Value must appear in the comma/space separated opions
* "not in"          Value must not appear in the comma/space separated opions
* "lt"              Value must be less than - number columns only
* "lte"             Value must be less than or equal to - number columns only
* "gt"              Value must be greater than - number columns only
* "gte"             Value must be greater than or equal to - number columns only

The value should be a string, if "in" or "not in" then supply a list of values space, comma, semi-colon or pipe delimited,

For boolean values just use "true" or "false".

## Settings

### Columns

Sets the display columns for the table.

setting "editable" in a columns's metadata will make the column data editable.

### Label

The Label of the component is used as the title bar

### Width & Height

If specified then these are applied as pixel values.

### Multi Select

Setting this to true will force the saved state to only save the modified items.  If false then the entire model will be saved to the state


## Component Attributes

### classes

Like all components, adding a "classes" attribute will cause that string to be added to the base component's class value

### DebugLevel

Setting this enables extra output in the console and on screen.  It's a number,  error = 0, warning = 1, info = 2, verbose = 3

info / 2 for example will display the node's id & parent in the tree

### NoRowsMessage

The text or a uri to an image to display in the grid when there are no rows to display.


## Styling

All elements of the tree can be styled by adding the specific style names to your player.


## Page Conditions

The component respects the show / hide rules applied by the containing page.


# ModalNavigation

## Functionality

The component will display a popup modal dialog containing the content value and with the Label as the title when it's companion nav menu item is clicked.

Works for both top level menu items and child ones.

You must have one component per nav menu item on your page.

Every page needs the same set of ModalNavigation components to work.


## Settings

Set the component's developerName to the exact same name as a navigation menu element and it will replace the default functionality.

Set the component's label value to the text you want to display in the popup title.

Set the component's content value to the html you want to display in the popup body.


# NavigationOverride

## Functionality

The component will hide any navigation menu items whose display label matches one of the values specifiied in the hideElements attribute..

Works for both top level menu items and child ones.

It's page scoped and doesn't affect navigation overrides in Flow, it just forcably hides the nominated items regardless.


## Settings

Set the component's "hideElements" attribute to a string of navigation menu item labels (not their links).

The string can be comma, semi colon, colon or pipe delimited e.g. "home, element1 ; element2 ||||| element 3" etc.

labels are case insensitive


