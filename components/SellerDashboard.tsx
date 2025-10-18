import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../App';
import type { Product, Seller, Order } from '../types';
import { ProductCard } from './ProductCard';
import { ProductForm } from './ProductForm';
import { AnalyticsView } from './analytics/AnalyticsView';

interface SellerDashboardProps {
    sellerProducts: Product[];
    sellerOrders: Order[];
    onAddProduct: (product: Product) => void;
    onUpdateProduct: (product: Product) => void;
    currentSeller: Seller;
    onUpdateProfile: (updatedInfo: Partial<Seller>) => Promise<{ success: boolean; error?: string }>;
    unseenOrderIds: string[];
    onViewOrders: () => void;
}

const DashboardView: React.FC<{ sellerProducts: Product[], sellerOrders: Order[] }> = ({ sellerProducts, sellerOrders }) => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { translations } = context;

    const topSellingProducts = useMemo(() => {
        const sellerProductMap = new Map(sellerProducts.map(p => [p.id, p]));
        const salesData: { [productId: number]: { unitsSold: number; product: Product | undefined } } = {};

        sellerOrders.forEach(order => {
            order.items.forEach(item => {
                const id = item.product.id;
                if (!salesData[id]) {
                    salesData[id] = { unitsSold: 0, product: sellerProductMap.get(id) ?? item.product };
                }
                salesData[id].unitsSold += item.quantity;
            });
        });

        return Object.values(salesData)
            .filter(data => data.product)
            .sort((a, b) => b.unitsSold - a.unitsSold)
            .slice(0, 5)
            .map(data => ({ ...data.product!, unitsSold: data.unitsSold }));
            
    }, [sellerOrders, sellerProducts]);

    return (
        <div className="space-y-6">
             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{translations.top_selling_products}</h3>
                {topSellingProducts.length > 0 ? (
                    <div className="space-y-4">
                        {topSellingProducts.map(product => (
                            <div key={product.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                <div className="flex-grow">
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">{product.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-lg font-bold text-primary dark:text-blue-400">{product.unitsSold}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{translations.units_sold}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">{translations.no_orders_yet}</p>
                )}
             </div>
        </div>
    );
};

const MyProductsView: React.FC<{ sellerProducts: Product[], onEdit: (p: Product) => void, onUpdate: (p: Product) => void }> = ({ sellerProducts, onEdit, onUpdate }) => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { translations } = context;

    return sellerProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {sellerProducts.map(p => <ProductCard key={p.id} product={p} isSellerView={true} onEdit={onEdit} onUpdate={onUpdate} />)}
        </div>
    ) : (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <p className="text-gray-500 dark:text-gray-400">{translations.no_products_added}</p>
        </div>
    );
};

const OrderHistoryView: React.FC<{ orders: Order[]; unseenOrderIds: string[] }> = ({ orders, unseenOrderIds }) => {
    const context = useContext(AppContext);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    if (!context) return null;
    const { translations, handleNavigation } = context;

    if (orders.length === 0) {
        return <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md"><p className="text-gray-500 dark:text-gray-400">{translations.no_orders_yet}</p></div>;
    }
    
    const toggleOrder = (orderId: string) => setExpandedOrderId(prevId => (prevId === orderId ? null : orderId));

    return (
        <div className="space-y-4">
            {orders.map(order => {
                const isUnseen = unseenOrderIds.includes(order.id);
                return (
                <div key={order.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors ${isUnseen ? 'ring-2 ring-primary' : ''}`}>
                    <div className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => toggleOrder(order.id)}>
                        <div>
                            <p className="font-semibold text-primary dark:text-blue-400">{translations.order_id}: {order.id} {isUnseen && <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">NEW</span>}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{translations.date}: {new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                             <p className="font-bold text-lg text-gray-800 dark:text-gray-100">SLL {new Intl.NumberFormat('en-US').format(order.total)}</p>
                             <span className="text-sm text-gray-500 dark:text-gray-400">{order.items.length} item(s)</span>
                        </div>
                    </div>
                    {expandedOrderId === order.id && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                             <ul className="space-y-2 mb-4">
                                {order.items.map(item => (<li key={item.product.id} className="flex items-center space-x-3 text-sm"><img src={item.product.images[0]} alt={item.product.name} className="w-10 h-10 object-cover rounded" /><span className="flex-grow text-gray-700 dark:text-gray-200">{item.product.name}</span><span className="text-gray-500 dark:text-gray-400">Qty: {item.quantity}</span></li>))}
                            </ul>
                            <button onClick={() => handleNavigation('track-order', { orderId: order.id })} className="text-sm font-semibold bg-secondary text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">{translations.track_order}</button>
                        </div>
                    )}
                </div>
                );
            })}
        </div>
    );
};

const MyProfileView: React.FC<{ currentSeller: Seller; onUpdateProfile: (updatedInfo: Partial<Seller>) => Promise<{ success: boolean; error?: string }> }> = ({ currentSeller, onUpdateProfile }) => {
    const context = useContext(AppContext);
    const [storeName, setStoreName] = useState(currentSeller.storeName);
    const [email, setEmail] = useState(currentSeller.email);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    if (!context) return null;
    const { translations } = context;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        const updatedInfo: Partial<Seller> = {};
        if (storeName !== currentSeller.storeName) updatedInfo.storeName = storeName;
        if (email !== currentSeller.email) updatedInfo.email = email;

        if (Object.keys(updatedInfo).length > 0) {
            const result = await onUpdateProfile(updatedInfo);
            if (result.success) setMessage({ type: 'success', text: translations.profile_updated_success });
            else setMessage({ type: 'error', text: translations[result.error!] || translations.profile_update_error });
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-lg mx-auto">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{translations.my_profile}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{translations.store_name}</label>
                    <input type="text" name="storeName" id="storeName" value={storeName} onChange={e => setStoreName(e.target.value)} required className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{translations.email}</label>
                    <input type="email" name="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md" />
                </div>
                {message && <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{message.text}</p>}
                <button type="submit" className="w-full bg-primary text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-800">{translations.update_profile}</button>
            </form>
        </div>
    );
};


export const SellerDashboard: React.FC<SellerDashboardProps> = ({ sellerProducts, sellerOrders, onAddProduct, onUpdateProduct, currentSeller, onUpdateProfile, unseenOrderIds, onViewOrders }) => {
    const context = useContext(AppContext);
    const [activeView, setActiveView] = useState('dashboard');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    if (!context) return null;
    const { translations } = context;
    
    const handleStartEdit = (product: Product) => {
        setEditingProduct(product);
        setActiveView('add-product');
    };

    const handleFormSubmit = (productData: Product) => {
        if (editingProduct) onUpdateProduct(productData);
        else onAddProduct(productData);
        setEditingProduct(null);
        setActiveView('my-products');
    };

    const handleCancelEdit = () => {
        setEditingProduct(null);
        setActiveView('my-products');
    };
    
    const handleNavClick = (view: string) => {
        if (editingProduct && view !== 'add-product') setEditingProduct(null);
        setActiveView(view);
        if (view === 'order-history') onViewOrders();
    };

    const navItems = [
        { id: 'dashboard', label: translations.dashboard, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
        { id: 'analytics', label: translations.analytics, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
        { id: 'my-products', label: translations.my_products, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
        { id: 'add-product', label: editingProduct ? 'Edit Product' : translations.add_new_product, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { id: 'order-history', label: translations.order_history, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 9h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
        { id: 'my-profile', label: translations.my_profile, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    ];

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard': return <DashboardView sellerProducts={sellerProducts} sellerOrders={sellerOrders} />;
            case 'analytics': return <AnalyticsView sellerProducts={sellerProducts} sellerOrders={sellerOrders} />;
            case 'my-products': return <MyProductsView sellerProducts={sellerProducts} onEdit={handleStartEdit} onUpdate={onUpdateProduct} />;
            case 'add-product': return <ProductForm key={editingProduct ? editingProduct.id : 'new'} onFormSubmit={handleFormSubmit} productToEdit={editingProduct} currentSeller={currentSeller} onCancel={handleCancelEdit} />;
            case 'order-history': return <OrderHistoryView orders={sellerOrders} unseenOrderIds={unseenOrderIds} />;
            case 'my-profile': return <MyProfileView currentSeller={currentSeller} onUpdateProfile={onUpdateProfile} />;
            default: return null;
        }
    };

    return (
        <main className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">{translations.seller_dashboard}</h2>
            <div className="md:flex md:gap-8">
                <aside className="md:w-1/4 lg:w-1/5 mb-6 md:mb-0">
                    <nav className="space-y-1">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                                    activeView === item.id
                                    ? 'bg-primary text-white shadow'
                                    : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                                {item.icon}
                                <span className="relative flex-1 text-left">
                                    {item.label}
                                    {item.id === 'order-history' && unseenOrderIds.length > 0 && (
                                       <span className="absolute top-1/2 -translate-y-1/2 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-white dark:ring-lightgray" aria-label={`${unseenOrderIds.length} new orders`}>
                                           {unseenOrderIds.length}
                                       </span>
                                    )}
                                </span>
                            </button>
                        ))}
                    </nav>
                </aside>
                
                <div className="md:flex-1 min-w-0">
                    {renderContent()}
                </div>
            </div>
        </main>
    );
};