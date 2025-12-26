// Custom Hook สำหรับ Fetch Master Data (Products, ProductGroups, ProductBrands) - SRR20016

import { useState, useEffect } from 'react';
import { SHOP_ID_PUBLIC } from '@/lib/constants';
import { MASTER_DATA_QUERIES } from '@/lib/reports/srr20016/config';
import type { Product, ProductGroup, ProductBrand } from '@/lib/reports/srr20016/types';

export interface UseMasterDataReturn {
    products: Product[];
    productGroups: ProductGroup[];
    productBrands: ProductBrand[];
    productsLoading: boolean;
    productGroupsLoading: boolean;
    productBrandsLoading: boolean;
    productsError: string | null;
    productGroupsError: string | null;
    productBrandsError: string | null;
    refetchProducts: () => Promise<void>;
    refetchProductGroups: () => Promise<void>;
    refetchProductBrands: () => Promise<void>;
}

export interface UseMasterDataOptions {
    autoFetch?: boolean;
    shopId?: string;
}

export function useMasterData(options?: UseMasterDataOptions): UseMasterDataReturn {
    const { autoFetch = true, shopId = SHOP_ID_PUBLIC } = options ?? {};

    const [products, setProducts] = useState<Product[]>([]);
    const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
    const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
    
    const [productsLoading, setProductsLoading] = useState(false);
    const [productGroupsLoading, setProductGroupsLoading] = useState(false);
    const [productBrandsLoading, setProductBrandsLoading] = useState(false);
    
    const [productsError, setProductsError] = useState<string | null>(null);
    const [productGroupsError, setProductGroupsError] = useState<string | null>(null);
    const [productBrandsError, setProductBrandsError] = useState<string | null>(null);

    // Fetch Products
    const fetchProducts = async () => {
        setProductsLoading(true);
        setProductsError(null);

        try {
            const response = await fetch('/rojproject/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopid: shopId,
                    limit: 10000,
                    query_items: [{
                        alias: "products",
                        query: MASTER_DATA_QUERIES.products
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();

            if (data.success && data.data?.products?.detail) {
                setProducts(data.data.products.detail);
            } else {
                setProducts([]);
            }
        } catch (error: any) {
            console.error('Error fetching products:', error);
            setProductsError(error.message || 'Error fetching products');
            setProducts([]);
        } finally {
            setProductsLoading(false);
        }
    };

    // Fetch Product Groups
    const fetchProductGroups = async () => {
        setProductGroupsLoading(true);
        setProductGroupsError(null);

        try {
            const response = await fetch('/rojproject/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopid: shopId,
                    limit: 10000,
                    query_items: [{
                        alias: "product_groups",
                        query: MASTER_DATA_QUERIES.productGroups
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch product groups');
            }

            const data = await response.json();

            if (data.success && data.data?.product_groups?.detail) {
                setProductGroups(data.data.product_groups.detail);
            } else {
                setProductGroups([]);
            }
        } catch (error: any) {
            console.error('Error fetching product groups:', error);
            setProductGroupsError(error.message || 'Error fetching product groups');
            setProductGroups([]);
        } finally {
            setProductGroupsLoading(false);
        }
    };

    // Fetch Product Brands
    const fetchProductBrands = async () => {
        setProductBrandsLoading(true);
        setProductBrandsError(null);

        try {
            const response = await fetch('/rojproject/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopid: shopId,
                    limit: 10000,
                    query_items: [{
                        alias: "product_brands",
                        query: MASTER_DATA_QUERIES.productBrands
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch product brands');
            }

            const data = await response.json();

            if (data.success && data.data?.product_brands?.detail) {
                setProductBrands(data.data.product_brands.detail);
            } else {
                setProductBrands([]);
            }
        } catch (error: any) {
            console.error('Error fetching product brands:', error);
            setProductBrandsError(error.message || 'Error fetching product brands');
            setProductBrands([]);
        } finally {
            setProductBrandsLoading(false);
        }
    };

    // Auto fetch on mount
    useEffect(() => {
        if (autoFetch) {
            fetchProducts();
            fetchProductGroups();
            fetchProductBrands();
        }
    }, [autoFetch, shopId]);

    return {
        products,
        productGroups,
        productBrands,
        productsLoading,
        productGroupsLoading,
        productBrandsLoading,
        productsError,
        productGroupsError,
        productBrandsError,
        refetchProducts: fetchProducts,
        refetchProductGroups: fetchProductGroups,
        refetchProductBrands: fetchProductBrands
    };
}
