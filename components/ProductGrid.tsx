
import React from 'react';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
    products: Product[];
    onOpenProductModal: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onOpenProductModal }) => {
    if (products.length === 0) {
        return (
            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-2xl text-gray-600 dark:text-gray-300">No products found.</h2>
                <p className="text-gray-400 dark:text-gray-500 mt-2">Try adjusting your search or category filters.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-6">
            {products.map(product => (
                <ProductCard 
                    key={product.id} 
                    product={product} 
                    onQuickView={() => onOpenProductModal(product)} 
                />
            ))}
        </div>
    );
};
