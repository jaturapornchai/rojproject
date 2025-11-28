// hooks/reports/srr20011/useMasterData.ts
// Infinite Scroll + Search - โหลด 100 รายการแรก, scroll เพิ่มโหลดเพิ่ม, ค้นหาโหลดใหม่

import { useState, useCallback, useEffect } from 'react';
import { SHOP_ID_PUBLIC } from '@/lib/constants';
import type { Product, ProductGroup, ProductBrand } from '@/lib/reports/srr20011';

const PAGE_SIZE = 100; // จำนวนรายการต่อครั้ง

export const useMasterData = () => {
    // Products State
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [productsOffset, setProductsOffset] = useState(0);
    const [productsHasMore, setProductsHasMore] = useState(true);
    const [productsSearch, setProductsSearch] = useState('');

    // Product Groups State
    const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
    const [productGroupsLoading, setProductGroupsLoading] = useState(false);
    const [productGroupsOffset, setProductGroupsOffset] = useState(0);
    const [productGroupsHasMore, setProductGroupsHasMore] = useState(true);
    const [productGroupsSearch, setProductGroupsSearch] = useState('');

    // Product Brands State
    const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
    const [productBrandsLoading, setProductBrandsLoading] = useState(false);
    const [productBrandsOffset, setProductBrandsOffset] = useState(0);
    const [productBrandsHasMore, setProductBrandsHasMore] = useState(true);
    const [productBrandsSearch, setProductBrandsSearch] = useState('');

    // ============ PRODUCTS ============
    const fetchProducts = useCallback(async (search: string = '', offset: number = 0, append: boolean = false) => {
        setProductsLoading(true);
        try {
            const escapedSearch = search.replace(/'/g, "''");
            const whereClause = search 
                ? `WHERE LOWER(code) LIKE LOWER('%${escapedSearch}%') OR LOWER(name_1) LIKE LOWER('%${escapedSearch}%')`
                : '';
            
            const query = `
                SELECT code, name_1, unit_cost 
                FROM ic_inventory 
                ${whereClause}
                ORDER BY code 
                LIMIT ${PAGE_SIZE} OFFSET ${offset}
            `;

            const response = await fetch('/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopid: SHOP_ID_PUBLIC,
                    limit: PAGE_SIZE + 1,
                    query_items: [{ alias: 'products', query }]
                })
            });
            const data = await response.json();
            
            if (data.success && data.data?.products?.detail) {
                const newData = data.data.products.detail;
                setProductsHasMore(newData.length >= PAGE_SIZE);
                
                if (append) {
                    setProducts(prev => [...prev, ...newData]);
                } else {
                    setProducts(newData);
                }
                setProductsOffset(offset + newData.length);
            } else {
                if (!append) setProducts([]);
                setProductsHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            if (!append) setProducts([]);
            setProductsHasMore(false);
        } finally {
            setProductsLoading(false);
        }
    }, []);

    // โหลดเพิ่มเมื่อ scroll
    const loadMoreProducts = useCallback(() => {
        if (!productsLoading && productsHasMore) {
            fetchProducts(productsSearch, productsOffset, true);
        }
    }, [fetchProducts, productsLoading, productsHasMore, productsSearch, productsOffset]);

    // ค้นหาสินค้า (รีเซ็ตและโหลดใหม่)
    const searchProducts = useCallback((search: string) => {
        setProductsSearch(search);
        setProductsOffset(0);
        setProductsHasMore(true);
        fetchProducts(search, 0, false);
    }, [fetchProducts]);

    // ============ PRODUCT GROUPS ============
    const fetchProductGroups = useCallback(async (search: string = '', offset: number = 0, append: boolean = false) => {
        setProductGroupsLoading(true);
        try {
            const escapedSearch = search.replace(/'/g, "''");
            const whereClause = search 
                ? `WHERE LOWER(code) LIKE LOWER('%${escapedSearch}%') OR LOWER(name_1) LIKE LOWER('%${escapedSearch}%')`
                : '';
            
            const query = `
                SELECT code, name_1 
                FROM ic_group 
                ${whereClause}
                ORDER BY code 
                LIMIT ${PAGE_SIZE} OFFSET ${offset}
            `;

            const response = await fetch('/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopid: SHOP_ID_PUBLIC,
                    limit: PAGE_SIZE + 1,
                    query_items: [{ alias: 'productGroups', query }]
                })
            });
            const data = await response.json();
            
            if (data.success && data.data?.productGroups?.detail) {
                const newData = data.data.productGroups.detail;
                setProductGroupsHasMore(newData.length >= PAGE_SIZE);
                
                if (append) {
                    setProductGroups(prev => [...prev, ...newData]);
                } else {
                    setProductGroups(newData);
                }
                setProductGroupsOffset(offset + newData.length);
            } else {
                if (!append) setProductGroups([]);
                setProductGroupsHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching product groups:', error);
            if (!append) setProductGroups([]);
            setProductGroupsHasMore(false);
        } finally {
            setProductGroupsLoading(false);
        }
    }, []);

    const loadMoreProductGroups = useCallback(() => {
        if (!productGroupsLoading && productGroupsHasMore) {
            fetchProductGroups(productGroupsSearch, productGroupsOffset, true);
        }
    }, [fetchProductGroups, productGroupsLoading, productGroupsHasMore, productGroupsSearch, productGroupsOffset]);

    const searchProductGroups = useCallback((search: string) => {
        setProductGroupsSearch(search);
        setProductGroupsOffset(0);
        setProductGroupsHasMore(true);
        fetchProductGroups(search, 0, false);
    }, [fetchProductGroups]);

    // ============ PRODUCT BRANDS ============
    const fetchProductBrands = useCallback(async (search: string = '', offset: number = 0, append: boolean = false) => {
        setProductBrandsLoading(true);
        try {
            const escapedSearch = search.replace(/'/g, "''");
            const whereClause = search 
                ? `WHERE LOWER(code) LIKE LOWER('%${escapedSearch}%') OR LOWER(name_1) LIKE LOWER('%${escapedSearch}%')`
                : '';
            
            const query = `
                SELECT code, name_1 
                FROM ic_brand 
                ${whereClause}
                ORDER BY code 
                LIMIT ${PAGE_SIZE} OFFSET ${offset}
            `;

            const response = await fetch('/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopid: SHOP_ID_PUBLIC,
                    limit: PAGE_SIZE + 1,
                    query_items: [{ alias: 'productBrands', query }]
                })
            });
            const data = await response.json();
            
            if (data.success && data.data?.productBrands?.detail) {
                const newData = data.data.productBrands.detail;
                setProductBrandsHasMore(newData.length >= PAGE_SIZE);
                
                if (append) {
                    setProductBrands(prev => [...prev, ...newData]);
                } else {
                    setProductBrands(newData);
                }
                setProductBrandsOffset(offset + newData.length);
            } else {
                if (!append) setProductBrands([]);
                setProductBrandsHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching product brands:', error);
            if (!append) setProductBrands([]);
            setProductBrandsHasMore(false);
        } finally {
            setProductBrandsLoading(false);
        }
    }, []);

    const loadMoreProductBrands = useCallback(() => {
        if (!productBrandsLoading && productBrandsHasMore) {
            fetchProductBrands(productBrandsSearch, productBrandsOffset, true);
        }
    }, [fetchProductBrands, productBrandsLoading, productBrandsHasMore, productBrandsSearch, productBrandsOffset]);

    const searchProductBrands = useCallback((search: string) => {
        setProductBrandsSearch(search);
        setProductBrandsOffset(0);
        setProductBrandsHasMore(true);
        fetchProductBrands(search, 0, false);
    }, [fetchProductBrands]);

    // ============ INITIAL LOAD ============
    useEffect(() => {
        // โหลดข้อมูล 100 รายการแรกของแต่ละประเภทตอนเริ่มต้น
        fetchProducts('', 0, false);
        fetchProductGroups('', 0, false);
        fetchProductBrands('', 0, false);
    }, [fetchProducts, fetchProductGroups, fetchProductBrands]);

    return {
        // Products
        products,
        productsLoading,
        productsHasMore,
        searchProducts,
        loadMoreProducts,

        // Product Groups
        productGroups,
        productGroupsLoading,
        productGroupsHasMore,
        searchProductGroups,
        loadMoreProductGroups,

        // Product Brands
        productBrands,
        productBrandsLoading,
        productBrandsHasMore,
        searchProductBrands,
        loadMoreProductBrands,

        // General loading (for initial load indicator)
        loading: productsLoading && productGroupsLoading && productBrandsLoading,
    };
};
