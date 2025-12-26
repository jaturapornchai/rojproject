// hooks/reports/srr30003/useMasterData.ts
// Infinite Scroll + Search - โหลด 100 รายการแรก, scroll เพิ่มโหลดเพิ่ม, ค้นหาโหลดใหม่

import { useState, useCallback, useEffect } from 'react';
import { SHOP_ID_PUBLIC } from '@/lib/constants';
import type { Document, Product, ProductGroup, ProductBrand, Warehouse, Shelf } from '@/lib/reports/srr30003';

const PAGE_SIZE = 100; // จำนวนรายการต่อครั้ง

export const useMasterData = () => {
    // Documents State
    const [documents, setDocuments] = useState<Document[]>([]);
    const [documentsLoading, setDocumentsLoading] = useState(false);
    const [documentsOffset, setDocumentsOffset] = useState(0);
    const [documentsHasMore, setDocumentsHasMore] = useState(true);
    const [documentsSearch, setDocumentsSearch] = useState('');

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

    // Warehouses State
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [warehousesLoading, setWarehousesLoading] = useState(false);
    const [warehousesOffset, setWarehousesOffset] = useState(0);
    const [warehousesHasMore, setWarehousesHasMore] = useState(true);
    const [warehousesSearch, setWarehousesSearch] = useState('');

    // Shelves State
    const [shelves, setShelves] = useState<Shelf[]>([]);
    const [shelvesLoading, setShelvesLoading] = useState(false);
    const [shelvesOffset, setShelvesOffset] = useState(0);
    const [shelvesHasMore, setShelvesHasMore] = useState(true);
    const [shelvesSearch, setShelvesSearch] = useState('');

    // ============ DOCUMENTS ============
    const fetchDocuments = useCallback(async (search: string = '', offset: number = 0, append: boolean = false) => {
        setDocumentsLoading(true);
        try {
            const escapedSearch = search.replace(/'/g, "''");
            const whereClause = search 
                ? `AND (LOWER(doc_no) LIKE LOWER('%${escapedSearch}%') OR LOWER(ic_trans.cust_code) LIKE LOWER('%${escapedSearch}%'))`
                : '';
            
            const query = `
                SELECT doc_date, doc_no, 
                    (ic_trans.cust_code || '~' || (SELECT name_1 FROM ap_supplier WHERE ap_supplier.code = ic_trans.cust_code)) AS cust_name, 
                    total_amount, remark 
                FROM ic_trans 
                WHERE trans_flag = 12 
                ${whereClause}
                ORDER BY doc_date DESC, doc_no DESC
                LIMIT ${PAGE_SIZE} OFFSET ${offset}
            `;

            const response = await fetch('/rojproject/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopid: SHOP_ID_PUBLIC,
                    limit: PAGE_SIZE + 1,
                    query_items: [{ alias: 'documents', query }]
                })
            });
            const data = await response.json();
            
            if (data.success && data.data?.documents?.detail) {
                const newData = data.data.documents.detail;
                setDocumentsHasMore(newData.length >= PAGE_SIZE);
                
                if (append) {
                    setDocuments(prev => [...prev, ...newData]);
                } else {
                    setDocuments(newData);
                }
                setDocumentsOffset(offset + newData.length);
            } else {
                if (!append) setDocuments([]);
                setDocumentsHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
            if (!append) setDocuments([]);
            setDocumentsHasMore(false);
        } finally {
            setDocumentsLoading(false);
        }
    }, []);

    const loadMoreDocuments = useCallback(() => {
        if (!documentsLoading && documentsHasMore) {
            fetchDocuments(documentsSearch, documentsOffset, true);
        }
    }, [fetchDocuments, documentsLoading, documentsHasMore, documentsSearch, documentsOffset]);

    const searchDocuments = useCallback((search: string) => {
        setDocumentsSearch(search);
        setDocumentsOffset(0);
        setDocumentsHasMore(true);
        fetchDocuments(search, 0, false);
    }, [fetchDocuments]);

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

            const response = await fetch('/rojproject/api/generate-report', {
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

    const loadMoreProducts = useCallback(() => {
        if (!productsLoading && productsHasMore) {
            fetchProducts(productsSearch, productsOffset, true);
        }
    }, [fetchProducts, productsLoading, productsHasMore, productsSearch, productsOffset]);

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

            const response = await fetch('/rojproject/api/generate-report', {
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

            const response = await fetch('/rojproject/api/generate-report', {
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

    // ============ WAREHOUSES ============
    const fetchWarehouses = useCallback(async (search: string = '', offset: number = 0, append: boolean = false) => {
        setWarehousesLoading(true);
        try {
            const escapedSearch = search.replace(/'/g, "''");
            const whereClause = search 
                ? `WHERE LOWER(code) LIKE LOWER('%${escapedSearch}%') OR LOWER(name_1) LIKE LOWER('%${escapedSearch}%')`
                : '';
            
            const query = `
                SELECT code, name_1 
                FROM ic_warehouse 
                ${whereClause}
                ORDER BY code 
                LIMIT ${PAGE_SIZE} OFFSET ${offset}
            `;

            const response = await fetch('/rojproject/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopid: SHOP_ID_PUBLIC,
                    limit: PAGE_SIZE + 1,
                    query_items: [{ alias: 'warehouses', query }]
                })
            });
            const data = await response.json();
            
            if (data.success && data.data?.warehouses?.detail) {
                const newData = data.data.warehouses.detail;
                setWarehousesHasMore(newData.length >= PAGE_SIZE);
                
                if (append) {
                    setWarehouses(prev => [...prev, ...newData]);
                } else {
                    setWarehouses(newData);
                }
                setWarehousesOffset(offset + newData.length);
            } else {
                if (!append) setWarehouses([]);
                setWarehousesHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
            if (!append) setWarehouses([]);
            setWarehousesHasMore(false);
        } finally {
            setWarehousesLoading(false);
        }
    }, []);

    const loadMoreWarehouses = useCallback(() => {
        if (!warehousesLoading && warehousesHasMore) {
            fetchWarehouses(warehousesSearch, warehousesOffset, true);
        }
    }, [fetchWarehouses, warehousesLoading, warehousesHasMore, warehousesSearch, warehousesOffset]);

    const searchWarehouses = useCallback((search: string) => {
        setWarehousesSearch(search);
        setWarehousesOffset(0);
        setWarehousesHasMore(true);
        fetchWarehouses(search, 0, false);
    }, [fetchWarehouses]);

    // ============ SHELVES ============
    const fetchShelves = useCallback(async (search: string = '', offset: number = 0, append: boolean = false) => {
        setShelvesLoading(true);
        try {
            const escapedSearch = search.replace(/'/g, "''");
            const whereClause = search 
                ? `WHERE LOWER(code) LIKE LOWER('%${escapedSearch}%') OR LOWER(name_1) LIKE LOWER('%${escapedSearch}%')`
                : '';
            
            const query = `
                SELECT code, name_1 
                FROM ic_shelf 
                ${whereClause}
                ORDER BY code 
                LIMIT ${PAGE_SIZE} OFFSET ${offset}
            `;

            const response = await fetch('/rojproject/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopid: SHOP_ID_PUBLIC,
                    limit: PAGE_SIZE + 1,
                    query_items: [{ alias: 'shelves', query }]
                })
            });
            const data = await response.json();
            
            if (data.success && data.data?.shelves?.detail) {
                const newData = data.data.shelves.detail;
                setShelvesHasMore(newData.length >= PAGE_SIZE);
                
                if (append) {
                    setShelves(prev => [...prev, ...newData]);
                } else {
                    setShelves(newData);
                }
                setShelvesOffset(offset + newData.length);
            } else {
                if (!append) setShelves([]);
                setShelvesHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching shelves:', error);
            if (!append) setShelves([]);
            setShelvesHasMore(false);
        } finally {
            setShelvesLoading(false);
        }
    }, []);

    const loadMoreShelves = useCallback(() => {
        if (!shelvesLoading && shelvesHasMore) {
            fetchShelves(shelvesSearch, shelvesOffset, true);
        }
    }, [fetchShelves, shelvesLoading, shelvesHasMore, shelvesSearch, shelvesOffset]);

    const searchShelves = useCallback((search: string) => {
        setShelvesSearch(search);
        setShelvesOffset(0);
        setShelvesHasMore(true);
        fetchShelves(search, 0, false);
    }, [fetchShelves]);

    // ============ INITIAL LOAD ============
    useEffect(() => {
        // โหลดข้อมูล 100 รายการแรกของแต่ละประเภทตอนเริ่มต้น
        fetchDocuments('', 0, false);
        fetchProducts('', 0, false);
        fetchProductGroups('', 0, false);
        fetchProductBrands('', 0, false);
        fetchWarehouses('', 0, false);
        fetchShelves('', 0, false);
    }, [fetchDocuments, fetchProducts, fetchProductGroups, fetchProductBrands, fetchWarehouses, fetchShelves]);

    return {
        // Documents
        documents,
        documentsLoading,
        documentsHasMore,
        searchDocuments,
        loadMoreDocuments,

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

        // Warehouses
        warehouses,
        warehousesLoading,
        warehousesHasMore,
        searchWarehouses,
        loadMoreWarehouses,

        // Shelves
        shelves,
        shelvesLoading,
        shelvesHasMore,
        searchShelves,
        loadMoreShelves,

        // General loading (for initial load indicator)
        loading: documentsLoading && productsLoading && productGroupsLoading && productBrandsLoading && warehousesLoading && shelvesLoading,
    };
};
