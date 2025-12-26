// Custom Hook สำหรับ Fetch Master Data (Customers, Branches) - SRR40010

import { useState, useEffect } from 'react';
import { SHOP_ID_PUBLIC } from '@/lib/constants';
import type { Customer, Branch } from '@/lib/reports/srr40010/types';

export interface UseMasterDataReturn {
    customers: Customer[];
    branches: Branch[];
    customersLoading: boolean;
    branchesLoading: boolean;
    customersError: string | null;
    branchesError: string | null;
    refetchCustomers: () => Promise<void>;
    refetchBranches: () => Promise<void>;
}

export interface UseMasterDataOptions {
    autoFetch?: boolean;
    shopId?: string;
}

export function useMasterData(options?: UseMasterDataOptions): UseMasterDataReturn {
    const { autoFetch = true, shopId = SHOP_ID_PUBLIC } = options ?? {};

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [customersLoading, setCustomersLoading] = useState(false);
    const [branchesLoading, setBranchesLoading] = useState(false);
    const [customersError, setCustomersError] = useState<string | null>(null);
    const [branchesError, setBranchesError] = useState<string | null>(null);

    const fetchCustomers = async () => {
        setCustomersLoading(true);
        setCustomersError(null);
        
        try {
            const response = await fetch('/rojproject/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopid: shopId,
                    limit: 10000,
                    query_items: [{
                        alias: "customers",
                        query: "select code,name_1 from ar_customer order by code"
                    }]
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            
            const data = await response.json();
            
            if (data.success && data.data?.customers?.detail) {
                setCustomers(data.data.customers.detail);
            } else {
                setCustomers([]);
            }
        } catch (error: any) {
            console.error('Error fetching customers:', error);
            setCustomersError(error.message || 'Error fetching customers');
            setCustomers([]);
        } finally {
            setCustomersLoading(false);
        }
    };

    const fetchBranches = async () => {
        setBranchesLoading(true);
        setBranchesError(null);
        
        try {
            const response = await fetch('/rojproject/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopid: shopId,
                    limit: 10000,
                    query_items: [{
                        alias: "branches",
                        query: "select code,name_1 from erp_branch_list order by code"
                    }]
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch branches');
            }
            
            const data = await response.json();
            
            if (data.success && data.data?.branches?.detail) {
                setBranches(data.data.branches.detail);
            } else {
                setBranches([]);
            }
        } catch (error: any) {
            console.error('Error fetching branches:', error);
            setBranchesError(error.message || 'Error fetching branches');
            setBranches([]);
        } finally {
            setBranchesLoading(false);
        }
    };

    // Auto fetch on mount
    useEffect(() => {
        if (autoFetch) {
            fetchCustomers();
            fetchBranches();
        }
    }, [autoFetch, shopId]);

    return {
        customers,
        branches,
        customersLoading,
        branchesLoading,
        customersError,
        branchesError,
        refetchCustomers: fetchCustomers,
        refetchBranches: fetchBranches
    };
}
