import { eSortOrder } from "flow-component-model"

export class Filters {

    get sort(): Sort {
        return this.Sort;
    }

    get filters(): {[key: string]: Filter} {
        return this.Filters;
    }

    static fromStorage(filters: any): Filters {
        const obj = new Filters();

        if (filters) {
            if (filters.Sort) {
                obj.Sort = new Sort(filters.Sort.FieldName,filters.FieldType, filters.Sort.SortDirection);
            }

            if (filters.Filters) {
                Object.keys(filters.Filters).forEach((key: any) => {
                    const filter: any = filters.Filters[key];
                    obj.addFilter(filter.FieldName, filter.Comparator, filter.Value);
                });
            }
        }
        return obj;
    }
    private Filters: {[key: string]: Filter};
    private Sort: Sort | undefined;

    constructor() {
        this.Filters = {};
        this.Sort = undefined;
    }

    setSort(fieldName: string,fieldType: number, sortDirection: eSortOrder) {
        this.Sort = new Sort(fieldName,fieldType, sortDirection);
    }

    clearSort() {
        this.Sort = undefined;
    }

    addFilter(fieldName: string, comparator: eComparator, value: any) {
        this.Filters[fieldName] = new Filter(fieldName, comparator, value);
    }

    removeFilter(key: string) {
        if (this.Filters[key]) {
            delete this.Filters[key];
        }
    }

    clearFilters() {
        this.Filters = {};
    }
}

export enum eComparator {
    EqualTo ="EQ",
    NotEqualTo = "NEQ",
    LessThan = "LT",
    LessThanOrEqualTo = "LTE",
    GreaterThan = "GT",
    GreaterThanOrEqualTo = "GTE",
    IsNull = "NULL",
    NotNull = "NOTNULL",
    In = "IN",
    NotIn = "NIN",
    Like = "LIKE",
    NotLike = "NLIKE",
    Between = "BTW",
    NotBetween = "NBTW",
    StartsWith = "SW",
    EndsWith = "EW",
    Contains = "CON"
}

export class Filter {
    private FieldName: string;
    private Comparator: eComparator;
    private Value: any;

    constructor(fieldName: string, comparator: eComparator, value: any) {
        this.FieldName = fieldName;
        this.Comparator = comparator;
        this.Value = value;
    }

    get fieldName(): string {
        return this.FieldName;
    }

    get comparator(): eComparator {
        return this.Comparator;
    }

    get comparatorName(): string {
        switch (this.Comparator) {
            case eComparator.EqualTo:
                return 'EQUALS';

            case eComparator.NotEqualTo:
                return 'NOT_EQUALS';

            case eComparator.Like:
                return 'CONTAINS';

            case eComparator.StartsWith:
                return 'STARTS_WITH';

            case eComparator.EndsWith:
                return 'ENDS_WITH';

            default:
                return 'EQUALS';
        }
    }

    get value(): any {
        return this.Value;
    }

}

export class Sort {
    private FieldName: string;
    private FieldType: number;
    private SortDirection: eSortOrder;

    constructor(fieldName: string, fieldType: number, sortDirection: eSortOrder) {
        this.FieldName = fieldName;
        this.FieldType = fieldType;
        this.SortDirection = sortDirection;
    }

    get fieldName(): string {
        return this.FieldName;
    }

    get fieldType(): number {
        return this.FieldType;
    }

    get sortDirection(): eSortOrder {
        return this.SortDirection;
    }

    toggleSortDirection() {
        if (this.SortDirection === eSortOrder.ascending) {
            this.SortDirection = eSortOrder.descending;
        } else {
            this.SortDirection = eSortOrder.ascending;
        }
    }
}
