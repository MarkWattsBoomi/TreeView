import * as React from 'react';
import '../css/ContextMenu.css';

export default class ContextMenu extends React.Component<any, any> {
    context: any;
    displayStyle: React.CSSProperties = {};
    //referenceObject: any;
    //left: string;
    //top: string;
    //display: string;

    menuItems: any[] = []

    constructor(props: any) {
        super(props);
        // this.dragOperative = this.dragOperative.bind(this);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.calculateContextMenuPostion = this.calculateContextMenuPostion.bind(this);
    }

    calculateContextMenuPostion(mouseX: number, mouseY: number) {

        let menuPostion: any = {};
        
        if(mouseX < (window.innerWidth / 2)) {
            this.displayStyle.left = (mouseX - 10); // + "px"; 
            this.displayStyle.right = undefined;
        }
        else {
            this.displayStyle.left = undefined;
            this.displayStyle.right = (window.innerWidth - (mouseX + 10)); // + "px"; 
        }

        if(mouseY < (window.innerHeight / 2)) {
            this.displayStyle.top = (mouseY - 10); // + "px"; 
            this.displayStyle.bottom = undefined;
        }
        else {
            this.displayStyle.top = undefined;
            this.displayStyle.bottom = (window.innerHeight-(mouseY + 10)) + "px"; 
        }
        this.displayStyle.display = "block";
    }

    show(mouseX: number, mouseY: number, menuItems: Map<string, any>) {
        if(menuItems.size > 0) {
            const menuItemArray: any[] = [];
            menuItems.forEach((item: any) => {
                menuItemArray.push(item); 
            });
            this.menuItems = menuItemArray;
            this.calculateContextMenuPostion(mouseX, mouseY);
            this.forceUpdate();
        }
    }

    hide() {
        this.displayStyle.display="none";
        this.menuItems=[];
        this.forceUpdate();
    }

    render() {
        return (
            <div
                    className="cm"
                    onMouseLeave={this.hide}
                    style={{
                        left: this.displayStyle.left, 
                        right: this.displayStyle.right,
                        top: this.displayStyle.top,
                        bottom: this.displayStyle.bottom,
                        display: this.displayStyle.display
                    }}
                >
                    <ul
                        className="cm-list"
                    >
                        {this.menuItems}
                    </ul>
                </div>
        )
    }
}
