export interface IBank {
    id?: number;
    bank_code?: string;
    bank_name: string;
    short_name?: string;
    is_active?: boolean;
    created_at?: string;
     // ISO timestamp
}

export default IBank;
