export interface Qualification {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    name: string;
    parent_id?: number;
    parent?: Qualification;
    children?: Qualification[];
    color?: string;
} 