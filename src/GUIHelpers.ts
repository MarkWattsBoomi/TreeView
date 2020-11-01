export class GUIHelpers {
    
    public static stopEventBubble(e:  any) {
        if(e.stopPropagation) e.stopPropagation();
        if(e.preventDefault) e.preventDefault();
        e.cancelBubble=true;
        e.returnValue=false;
        return false;
    }

    public static SortObject(obj: any, attribute: string) {
        let keys: string[] = Object.keys(obj);
        return keys.sort((a,b) => {
            if(obj[b][attribute] < obj[a][attribute])
            {
                return 1;
            }
            if(obj[b][attribute] > obj[a][attribute])
            {
                return -1;
            }

            return 0;
        });
    }
}