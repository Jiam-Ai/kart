import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import type { BuyerInfo } from '../types';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPlaceOrder: (buyerInfo: BuyerInfo) => void;
}

const PaymentOption: React.FC<{id: string, name: string, icon: string, selected: boolean, onSelect: (id: string) => void}> = ({id, name, icon, selected, onSelect}) => (
    <div 
        onClick={() => onSelect(id)}
        role="radio"
        aria-checked={selected}
        className={`border-2 rounded-lg p-4 flex items-center space-x-4 cursor-pointer transition-all ${selected ? 'border-primary ring-2 ring-primary bg-blue-50 dark:bg-primary/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}
    >
        <img src={icon} alt={`${name} logo`} className="w-10 h-auto object-contain" />
        <span className="font-semibold text-gray-700 dark:text-gray-200">{name}</span>
    </div>
);

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onPlaceOrder }) => {
    const context = useContext(AppContext);
    const [selectedPayment, setSelectedPayment] = useState('cod');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');

    if (!context) return null;
    const { translations, currentBuyer } = context;

    useEffect(() => {
        if (isOpen) {
            // Pre-fill form with logged-in buyer's data if available, otherwise clear it for guests.
            setFullName(currentBuyer?.fullName || '');
            setPhoneNumber(currentBuyer?.phoneNumber || '');
            // Always reset delivery address for each new checkout to avoid stale data.
            setDeliveryAddress('');
        }
    }, [isOpen, currentBuyer]);


    if (!isOpen) return null;

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName || !phoneNumber || !deliveryAddress) {
            alert('Please fill in all delivery details.');
            return;
        }
        onPlaceOrder({
            fullName,
            phoneNumber,
            deliveryAddress
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4 transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{translations.checkout}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Close checkout">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <form id="checkout-form" onSubmit={handleFormSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">{translations.delivery_details}</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder={translations.full_name} aria-label={translations.full_name} required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                            <input type="tel" placeholder={translations.phone_number} aria-label={translations.phone_number} required value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                            <textarea placeholder={translations.delivery_address} aria-label={translations.delivery_address} rows={3} required value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                        </div>
                    </div>
                    <div role="radiogroup" aria-labelledby="payment-method-heading">
                        <h3 id="payment-method-heading" className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">{translations.payment_method}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <PaymentOption id="cod" name={translations.cash_on_delivery} icon="https://img.icons8.com/fluency/96/stack-of-money.png" selected={selectedPayment === 'cod'} onSelect={setSelectedPayment} />
                           <PaymentOption id="orange" name={translations.orange_money} icon="https://seeklogo.com/images/O/orange-money-logo-8F2AED37F3-seeklogo.com.png" selected={selectedPayment === 'orange'} onSelect={setSelectedPayment} />
                           <PaymentOption id="africell" name={translations.africell_money} icon="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxPzFz-g_5y5Gk8o_e_7Q6YxX3nQJd-X-vA&s" selected={selectedPayment === 'africell'} onSelect={setSelectedPayment} />
                           <PaymentOption id="syllogy" name={translations.syllogy_mobile_money} icon="https://img.icons8.com/color/96/wallet--v1.png" selected={selectedPayment === 'syllogy'} onSelect={setSelectedPayment} />
                           <PaymentOption id="natcom" name={translations.natcom_top_up} icon="https://img.icons8.com/fluency/96/mobile-payment.png" selected={selectedPayment === 'natcom'} onSelect={setSelectedPayment} />
                        </div>
                    </div>
                </form>
                
                <div className="p-5 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                    <button 
                        type="submit"
                        form="checkout-form"
                        className="w-full bg-primary text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-800 transition-colors"
                    >
                        {translations.place_order}
                    </button>
                </div>
            </div>
        </div>
    );
};