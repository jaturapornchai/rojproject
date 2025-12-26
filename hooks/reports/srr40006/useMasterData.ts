// hooks/reports/srr40006/useMasterData.ts

import { useState, useEffect, useCallback } from 'react';
import { SHOP_ID_PUBLIC } from '@/lib/constants';
import { MASTER_DATA_QUERIES, type ProductGroup, type Warehouse, type Brand } from '@/lib/reports/srr40006';

export const useMasterData = () => {
    const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchProductGroups = useCallback(async () => {
        try {
            const response = await fetch('/rojproject/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopid: SHOP_ID_PUBLIC,
                    limit: 1000,
                    query_items: [{
                        alias: 'product_groups',
                        query: MASTER_DATA_QUERIES.productGroups
                    }]
                })
            });
            const data = await response.json();
            if (data.success && data.data?.product_groups?.detail) {
                setProductGroups(data.data.product_groups.detail);
            }
        } catch (error) {
            console.error('Error fetching product groups:', error);
        }
    }, []);

    const fetchWarehouses = useCallback(async () => {
        try {
            const response = await fetch('/rojproject/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopid: SHOP_ID_PUBLIC,
                    limit: 1000,
                    query_items: [{
                        alias: 'warehouses',
                        query: MASTER_DATA_QUERIES.warehouses
                    }]
                })
            });
            const data = await response.json();
            if (data.success && data.data?.warehouses?.detail) {
                setWarehouses(data.data.warehouses.detail);
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        }
    }, []);

    const fetchBrands = useCallback(async () => {
        try {
            const response = await fetch('/rojproject/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopid: SHOP_ID_PUBLIC,
                    limit: 1000,
                    query_items: [{
                        alias: 'brands',
                        query: MASTER_DATA_QUERIES.brands
                    }]
                })
            });
            const data = await response.json();
            if (data.success && data.data?.brands?.detail) {
                setBrands(data.data.brands.detail);
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchProductGroups(), fetchWarehouses(), fetchBrands()])
            .finally(() => setLoading(false));
    }, [fetchProductGroups, fetchWarehouses, fetchBrands]);

    return {
        productGroups,
        warehouses,
        brands,
        loading,
        refetchProductGroups: fetchProductGroups,
        refetchWarehouses: fetchWarehouses,
        refetchBrands: fetchBrands,
    };
};
