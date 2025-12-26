// Custom Hook สำหรับ Fetch Master Data (Employees, Branches) - SRR50003

import { useState, useEffect } from 'react';
import { SHOP_ID_PUBLIC } from '@/lib/constants';
import type { Employee, Branch } from '@/lib/reports/srr50003/types';

export interface UseMasterDataReturn {
    employees: Employee[];
    branches: Branch[];
    employeesLoading: boolean;
    branchesLoading: boolean;
    employeesError: string | null;
    branchesError: string | null;
    refetchEmployees: () => Promise<void>;
    refetchBranches: () => Promise<void>;
}

export interface UseMasterDataOptions {
    autoFetch?: boolean;
    shopId?: string;
}

export function useMasterData(options?: UseMasterDataOptions): UseMasterDataReturn {
    const { autoFetch = true, shopId = SHOP_ID_PUBLIC } = options ?? {};

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [employeesLoading, setEmployeesLoading] = useState(false);
    const [branchesLoading, setBranchesLoading] = useState(false);
    const [employeesError, setEmployeesError] = useState<string | null>(null);
    const [branchesError, setBranchesError] = useState<string | null>(null);

    const fetchEmployees = async () => {
        setEmployeesLoading(true);
        setEmployeesError(null);

        try {
            const response = await fetch('/rojproject/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopid: shopId,
                    limit: 10000,
                    query_items: [{
                        alias: "employees",
                        query: "select code,name_1,name_2 from erp_user order by code"
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch employees');
            }

            const data = await response.json();

            if (data.success && data.data?.employees?.detail) {
                setEmployees(data.data.employees.detail);
            } else {
                setEmployees([]);
            }
        } catch (error: any) {
            console.error('Error fetching employees:', error);
            setEmployeesError(error.message || 'Error fetching employees');
            setEmployees([]);
        } finally {
            setEmployeesLoading(false);
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
            fetchEmployees();
            fetchBranches();
        }
    }, [autoFetch, shopId]);

    return {
        employees,
        branches,
        employeesLoading,
        branchesLoading,
        employeesError,
        branchesError,
        refetchEmployees: fetchEmployees,
        refetchBranches: fetchBranches
    };
}
