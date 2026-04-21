export interface IBank {
    id?: number;
    bank_code?: string;
    bank_name: string;
    short_name?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export default IBank;
