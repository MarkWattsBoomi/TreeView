import * as React from 'react';

import './MessageBox.css';

export enum eDragEventType {
    unknown,
    canvas,
    table,
    link,
    dialog,
}

export class DragEvent {

    public static start(type: eDragEventType, sourceElement: any, mouseX: number, mouseY: number): DragEvent {
        const evt: DragEvent = new DragEvent();
        evt.type = type;
        evt.sourceElement = sourceElement;
        evt.targetElement = null;
        evt.mouseX = mouseX;
        evt.mouseY = mouseY;
        evt.mouseOffsetX = mouseX;
        evt.mouseOffsetY = mouseY;
        return evt;
    }
    type: eDragEventType;
    sourceElement: any;
    targetElement: any;
    mouseX: number;
    mouseY: number;
    mouseOffsetX: number;
    mouseOffsetY: number;

    constructor() {
        this.type = eDragEventType.unknown;
        this.sourceElement = null;
        this.targetElement = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseOffsetX = 0;
        this.mouseOffsetY = 0;
    }

    drag(mouseX: number, mouseY: number) {
        this.mouseX = mouseX;
        this.mouseY = mouseY;
    }

    end(target: any, mouseX: number, mouseY: number): any {

        this.targetElement = target;
        this.mouseX = mouseX;
        this.mouseY = mouseY;

        this.type = eDragEventType.unknown;
    }
}

// Declaration of the component as React Class Component
export class MessageBox extends React.Component<any, any> {
    dragEvent: DragEvent = new DragEvent();
    modal: any;
    dialog: any;

    top: number = 0;
    left: number = 0;
  // Init of the component before it is mounted.
    constructor(props: any) {
        super(props);

        this.handleKeyUp = this.handleKeyUp.bind(this);
        // this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.onCloseRequest = this.onCloseRequest.bind(this);
    }

    stopEventBubble(e: any) {
        if (e.stopPropagation) { e.stopPropagation(); }
        if (e.preventDefault) { e.preventDefault(); }
        e.cancelBubble = true;
        e.returnValue = false;
        return false;
    }

  // Add listeners immediately after the component is mounted.
    componentDidMount() {

      // need to center the window
      if (this.dialog) {
        const parentXCenter = this.dialog.offsetParent.clientWidth / 2;
        const parentYCenter = this.dialog.offsetParent.clientHeight / 2;
        const dialogXOffset = this.dialog.clientWidth / 2;
        const dialogYOffset = this.dialog.clientHeight / 2;

        this.left = parentXCenter - dialogXOffset;
        this.top = parentYCenter - dialogYOffset;
        this.forceUpdate();
        this.dialog.classList.add('shown');
        this.forceUpdate();
      }
    // window.addEventListener('keyup', this.handleKeyUp, false);
    // document.addEventListener('click', this.handleOutsideClick, false);
  }

  // Remove listeners immediately before a component is unmounted and destroyed.
    componentWillUnmount() {
    // window.removeEventListener('keyup', this.handleKeyUp, false);
    // document.removeEventListener('click', this.handleOutsideClick, false);
  }

    onCloseRequest() {
    if (this.props.onCloseRequest) {
      // document.removeEventListener('click', this.handleOutsideClick, false);
      // window.removeEventListener('keyup', this.handleKeyUp, false);
      this.props.onCloseRequest();
    }
  }

  // Handle the key press event.
    handleKeyUp(e: any) {
    const keys: any = {
      27: () => {
        e.preventDefault();
        this.onCloseRequest();
      },
    };

    if (keys[e.keyCode]) {
      keys[e.keyCode]();
    }
  }

  // Render the component passing onCloseRequest and children as props.
    render() {
    const style: any = {};
    style.left = this.left;
    style.top = this.top;

    const buttons: Array<JSX.Element> = [];
    for(const button of this.props.buttons) {
      buttons.push(
      <button 
        className="modal-dialog-button-bar-button" 
        title="Cancel" 
        onMouseDown={(e) => {e.stopPropagation();button.handler()}}
      >
        {button.label}
      </button>
        );
    }

    return (
      <div
        className="message-box-redaction"
        onMouseMove={(e) => {this.onMouseMove(e); }}
        onMouseUp={(e) => {this.onMouseUp(e); }}
        // onMouseDown={(e) => {this.handleOutsideClick(e)}}
        onContextMenu={e => {e.preventDefault(); e.stopPropagation();if(this.props.onContextMenu){this.props.onContextMenu()}}}
      >
        <div
          style={style}
          className="message-box-content"
          ref={(node) => (this.dialog = node)}
          >
            <div className="message-box-dialog">
              <div
                className="message-box-dialog-header"
                onMouseDown={(e) => {this.onMouseDown(e); }}
              >
                <div style={{display: 'flex', flexDirection: 'row', flexGrow: 1}}>
                  <span className="message-box-dialog-header-title">{this.props.title}</span>
                </div>
                <div style={{display: 'flex', flexDirection: 'row', marginLeft: 'auto', flexGrow: 0}}>
                  <span
                    className="glyphicon glyphicon-remove message-box-dialog-header-button"
                    style={{cursor: 'pointer' , color: '#fefefe', marginRight: '5px', fontSize: '14pt'}}
                    title="Close"
                    onMouseDown={(e) => {e.stopPropagation(); this.props.onClose('cancel'); }}
                  />
                </div>
              </div>
              <div className="message-box-dialog-body">
                  {this.props.children}
              </div >
              <div className="modal-dialog-button-bar">
                {buttons}   
              </div>
            </div >
        </div>
      </div>
    );
  }

    moveMe(left: number, top: number) {
      this.left = left;
      this.top = top; // - this.box.getBoundingClientRect().top;
      this.forceUpdate();
  }

    onMouseDown(e: any) {
    // this.stopEventBubble(e);
    // include component bounding rect to allow for mouse offset into component
    const clientRect = e.target.getBoundingClientRect();
    const mouseOffsetY: number = e.clientY - clientRect.top;
    console.log('grab dialog');
    this.dragEvent = DragEvent.start(eDragEventType.dialog, this, e.clientX - clientRect.left, mouseOffsetY);
  }

    onMouseMove(e: any) {
    // this.stopEventBubble(e);
    if (this.dragEvent.type === eDragEventType.dialog) {
      console.log('move dialog');
      this.moveMe(e.clientX - this.dragEvent.mouseOffsetX, e.clientY - this.dragEvent.mouseOffsetY);
    }
  }

    onMouseUp(e: any) {
    // this.stopEventBubble(e);
    if (this.dragEvent.type === eDragEventType.dialog) {
      console.log('drop dialog');
      this.dragEvent.end(null, e.clientX, e.clientY);
    }
  }
}
