import TreeView from "./TreeView/TreeView";
import TreeViewItem from "./TreeView/TreeViewItem";

export default class Services {
    
    static async getHierarchyItems(
        tv: TreeView,
        endPoint: string, 
        userName: string, 
        token: string
    ) : Promise<TreeViewItem[]> {
        
        const request: RequestInit = {};
        let results: TreeViewItem[] = [];

        const usertoken: string = userName + ':' + token;

        const securityToken: string = Buffer.from(usertoken).toString('base64');

        

        endPoint += ";boomi_auth="+securityToken

        request.method = 'POST';
        request.headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + securityToken,
        };
        request.credentials= "same-origin";

        let body: any = {
            "ItemType":"ITEM",
        };
        
        

        request.body = JSON.stringify(body);

        let response : Response = await fetch(endPoint, request);
            // let body: string =  await this.getResultBodyTextxx(response);
        if (response.status === 200) {
            let op : any[] = await response.json();
            op.forEach((item: any) => {
                results.push(TreeViewItem.fromJSON(tv, item));
            });
        } else {
            const errorText = await response.text();
            console.log('Fetch Failed - ' + errorText);
        }
        
        
        return results;
    }
}