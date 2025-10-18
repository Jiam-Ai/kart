
import React, { useState, useContext } from 'react';
import { AppContext } from '../../App';

interface AccordionItemProps {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onClick: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, isOpen, onClick }) => {
    return (
        <div className="border-b dark:border-gray-700">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left py-4 px-2 hover:bg-lightgray dark:hover:bg-gray-700 transition-colors"
                aria-expanded={isOpen}
            >
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</span>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6 text-primary dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <div className="p-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );
};


export const HelpCenter: React.FC = () => {
    const context = useContext(AppContext);
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    if (!context) return null;
    const { translations } = context;

    const faqs = [
        {
            q: "How do I place an order?",
            a: "Placing an order is easy! Simply browse our products, add items to your cart, and click 'Proceed to Checkout'. Follow the on-screen instructions to enter your delivery details and choose a payment method."
        },
        {
            q: "What payment methods do you accept?",
            a: "We accept Cash on Delivery, Orange Money, and Africell Money. You can choose your preferred method during the checkout process."
        },
        {
            q: "How can I track my order?",
            a: "You can track your order status on our 'Track Your Order' page, which is linked in the footer. You will need the Order ID that was provided to you after checkout."
        },
        {
            q: "What is your return policy?",
            a: "We offer a 7-day return policy for most items. If you are not satisfied with your purchase, please visit our 'Returns & Refunds' page for detailed instructions on how to initiate a return."
        },
        {
            q: "How do I become a seller on SaloneKart?",
            a: "We are always excited to welcome new sellers! Click on 'Seller Login' in the top right corner, then choose 'Sign Up' to create your store. You can also visit our 'Vendor Hub' for more resources."
        },
    ];

    const handleItemClick = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <main className="container mx-auto px-4 py-12">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">{translations.help_center}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center">We're here to help! Find answers to your questions below.</p>
                
                <div className="space-y-2">
                    {faqs.map((faq, index) => (
                        <AccordionItem 
                            key={index}
                            title={faq.q}
                            isOpen={openIndex === index}
                            onClick={() => handleItemClick(index)}
                        >
                           <p>{faq.a}</p>
                        </AccordionItem>
                    ))}
                </div>
            </div>
        </main>
    );
};