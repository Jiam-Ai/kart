import React from 'react';
import type { Product } from '../types';
import { CountdownTimer } from './CountdownTimer';

interface FlashDealsProps {
    products: Product[];
    onOpenProductModal: (product: Product) => void;
}

const FlashDealCard: React.FC<{ product: Product, onOpenProductModal: (product: Product) => void }> = ({ product, onOpenProductModal }) => {
    const originalPrice = product.originalPrice ?? product.price * 1.4; // fallback
    const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
    
    // Create a fake total for the progress bar to add a sense of popularity
    const totalStock = product.stock ? product.stock + Math.floor(Math.random() * 20 + 10) : 50; 
    const claimed = totalStock - (product.stock ?? 20);
    const claimedPercentage = Math.min(95, Math.round((claimed / totalStock) * 100)); // Cap at 95% to always show some stock

    return (
        <div onClick={() => onOpenProductModal(product)} className="bg-white rounded-lg shadow-md overflow-hidden group w-52 sm:w-60 flex-shrink-0 cursor-pointer transition-transform duration-300 hover:-translate-y-1">
            <div className="relative">
                <img src={product.images[0]} alt={product.name} className="w-full h-32 sm:h-40 object-cover"/>
                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md animate-pulse">-{discount}%</div>
            </div>
            <div className="p-3">
                <div className="flex items-baseline space-x-2">
                    <span className="text-lg font-bold text-red-600">SLL {new Intl.NumberFormat('en-US').format(product.price)}</span>
                </div>
                <div className="text-sm text-gray-500 line-through">SLL {new Intl.NumberFormat('en-US').format(originalPrice)}</div>

                <div className="mt-2">
                    <div className="w-full bg-red-100 rounded-full h-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-500 h-4 rounded-full flex items-center justify-center" style={{ width: `${claimedPercentage}%` }}></div>
                        <span className="absolute inset-0 text-white text-xs font-bold flex items-center justify-center">
                           🔥 {claimedPercentage}% sold
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const FlashDeals: React.FC<FlashDealsProps> = ({ products, onOpenProductModal }) => {
    if (products.length === 0) return null;
    
    const featuredProduct = products[0];

    return (
        <div className="container mx-auto px-4 pt-8">
            <div className="bg-gradient-to-r from-red-600 to-orange-500 p-4 sm:p-6 rounded-xl shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">⚡️ Lightning Deals</h2>
                    {featuredProduct.saleEndDate && (
                        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                             <span className="text-white font-semibold">Ending in:</span>
                             <CountdownTimer targetDate={featuredProduct.saleEndDate} />
                        </div>
                    )}
                </div>
                <div className="flex space-x-4 overflow-x-auto pb-4 -mb-4 scrollbar-thin scrollbar-thumb-white/50 scrollbar-track-transparent">
                    {products.map(product => (
                        <FlashDealCard key={product.id} product={product} onOpenProductModal={onOpenProductModal} />
                    ))}
                    <div className="w-1 flex-shrink-0"></div>
                </div>
            </div>
            <style>{`
                .scrollbar-thin {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255, 255, 255, 0.5) transparent;
                }
                .scrollbar-thin::-webkit-scrollbar {
                    height: 6px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: transparent;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background-color: rgba(255, 255, 255, 0.5);
                    border-radius: 20px;
                    border: 3px solid transparent;
                }
            `}</style>
        </div>
    );
};