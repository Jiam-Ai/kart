import React, { useContext, useState, useId, useEffect } from 'react';
import { AppContext } from '../App';
import type { Product, Review } from '../types';
import { getRelatedProductIds } from '../services/geminiService';
import { ProductCard } from './ProductCard';

interface ProductModalProps {
    isOpen: boolean;
    product: Product | null;
    onClose: () => void;
    onAddReview: (productId: number, review: Review) => void;
    allProducts: Product[];
}

const StarRating: React.FC<{ rating: number, setRating?: (rating: number) => void }> = ({ rating, setRating }) => {
    const [hoverRating, setHoverRating] = useState(0);
    const starPath = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

    const displayRating = hoverRating || rating;
    
    return (
        <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
            {[...Array(5)].map((_, i) => {
                const starValue = i + 1;
                return (
                    <svg
                        key={i}
                        className={`w-5 h-5 ${starValue <= displayRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'} ${setRating ? 'cursor-pointer' : ''}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        onClick={() => setRating?.(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                    >
                        <path d={starPath} />
                    </svg>
                );
            })}
        </div>
    );
};

const ReviewForm: React.FC<{ productId: number; onAddReview: (productId: number, review: Review) => void; }> = ({ productId, onAddReview }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [author, setAuthor] = useState('');
    const inputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating > 0 && comment && author) {
            onAddReview(productId, {
                rating,
                comment,
                author,
                date: new Date().toISOString().split('T')[0]
            });
            setRating(0);
            setComment('');
            setAuthor('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <h4 className="font-semibold dark:text-gray-200">Write a review</h4>
            <div>
                <StarRating rating={rating} setRating={setRating} />
            </div>
            <input
                type="text"
                placeholder="Your Name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                className={inputClasses}
            />
            <textarea
                placeholder="Your review..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={3}
                className={inputClasses}
            />
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md">Submit Review</button>
        </form>
    );
};

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, product, onClose, onAddReview, allProducts }) => {
    const context = useContext(AppContext);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [isLoadingRelated, setIsLoadingRelated] = useState(false);

    useEffect(() => {
        if (isOpen && product) {
            setCurrentIndex(0);
            setQuantity(1);

            // Set default variants
            const defaults: { [key: string]: string } = {};
            product.variants?.forEach(v => {
                if (v.options.length > 0) {
                    defaults[v.type] = v.options[0].name;
                }
            });
            setSelectedVariants(defaults);

            // Fetch related products
            const fetchRelated = async () => {
                setIsLoadingRelated(true);
                const ids = await getRelatedProductIds(product, allProducts);
                const related = allProducts.filter(p => ids.includes(p.id));
                setRelatedProducts(related);
                setIsLoadingRelated(false);
            };
            fetchRelated();

        }
    }, [isOpen, product, allProducts]);
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !product) return null;

    const { addToCart, translations } = context!;
    const hasMultipleImages = product.images.length > 1;

    // --- Variant Logic ---
    const handleVariantSelect = (type: string, name: string) => {
        setSelectedVariants(prev => ({...prev, [type]: name}));
    };
    
    // Find the price and stock for the currently selected variant combination
    const { currentPrice, currentStock } = (() => {
        if (!product.variants || product.variants.length === 0) {
            return { currentPrice: product.price, currentStock: 100 }; // Assume stock for non-variant products
        }
        
        let price = product.price; // Start with base price
        let stock: number | null = null;

        product.variants.forEach(variant => {
            const selectedOptionName = selectedVariants[variant.type];
            const selectedOption = variant.options.find(opt => opt.name === selectedOptionName);
            if (selectedOption) {
                price = selectedOption.price; // Variant price overrides base
                if (stock === null || selectedOption.stock < stock) {
                    stock = selectedOption.stock;
                }
            }
        });

        return { currentPrice: price, currentStock: stock ?? 0 };
    })();
    
    const formattedPrice = new Intl.NumberFormat('en-US').format(currentPrice);

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? product.images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastSlide = currentIndex === product.images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const handleAddToCart = () => {
        addToCart(product, quantity, selectedVariants);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm" aria-modal="true" role="dialog" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl m-4 transform transition-all flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col md:flex-row flex-1 min-h-0">
                    {/* Image Section */}
                    <div className="w-full md:w-1/2 p-4 relative flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-t-lg md:rounded-l-lg md:rounded-t-none">
                         <img src={product.images[currentIndex]} alt={product.name} className="w-full h-full max-h-[50vh] md:max-h-full object-contain rounded-lg" />
                         {hasMultipleImages && (
                            <>
                                <button onClick={goToPrevious} aria-label="Previous image" className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button onClick={goToNext} aria-label="Next image" className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </>
                         )}
                         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                            {product.images.map((_, slideIndex) => (
                                <button key={slideIndex} onClick={() => setCurrentIndex(slideIndex)} className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${currentIndex === slideIndex ? 'bg-primary scale-125' : 'bg-gray-400 hover:bg-gray-500'}`}></button>
                            ))}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="w-full md:w-1/2 p-6 flex flex-col overflow-y-auto">
                        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 z-10" aria-label="Close product view">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{product.name}</h2>
                            <p className="text-md text-gray-500 dark:text-gray-400 mt-2">Sold by: <span className="font-semibold text-gray-600 dark:text-gray-300">{product.vendor}</span></p>

                            <div className="flex items-center space-x-2 mt-4">
                                <StarRating rating={product.rating} />
                                <span className="text-sm text-gray-600 dark:text-gray-300">{product.reviewsCount} {translations.reviews}</span>
                            </div>
                            
                            <p className="text-gray-700 dark:text-gray-300 mt-4 whitespace-pre-wrap">{product.description}</p>
                        </div>
                        
                        {/* Variant Selection */}
                        <div className="mt-4 space-y-4">
                            {product.variants?.map(variant => (
                                <div key={variant.type}>
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">{variant.type}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {variant.options.map(opt => (
                                            <button 
                                                key={opt.name}
                                                onClick={() => handleVariantSelect(variant.type, opt.name)}
                                                className={`px-4 py-2 text-sm rounded-full border-2 transition-all ${selectedVariants[variant.type] === opt.name ? 'border-primary bg-primary text-white' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500'}`}
                                            >
                                                {opt.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>


                        <div className="mt-6 pt-4 border-t dark:border-gray-700">
                            <p className="text-3xl font-bold text-primary dark:text-blue-400 mb-4">SLL {formattedPrice}</p>
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="flex items-center border dark:border-gray-600 rounded">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Decrease quantity">-</button>
                                    <span className="px-4 py-2 font-semibold dark:text-gray-200" aria-label="Current quantity">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Increase quantity">+</button>
                                </div>
                                <button 
                                    onClick={handleAddToCart}
                                    disabled={currentStock === 0}
                                    className="flex-1 bg-secondary text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                   <span>{currentStock > 0 ? translations.add_to_cart : 'Out of Stock'}</span>
                                </button>
                            </div>
                        </div>

                         {/* Reviews Section */}
                        <div className="mt-6 pt-4 border-t dark:border-gray-700">
                            <h3 className="text-xl font-bold dark:text-gray-100">Customer Reviews</h3>
                            <div className="space-y-4 mt-4 max-h-48 overflow-y-auto">
                                {product.reviews && product.reviews.length > 0 ? product.reviews.map((review, index) => (
                                    <div key={index} className="border-b dark:border-gray-700 pb-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold dark:text-gray-200">{review.author}</span>
                                            <StarRating rating={review.rating} />
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{review.comment}</p>
                                    </div>
                                )) : <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>}
                            </div>
                            <ReviewForm productId={product.id} onAddReview={onAddReview} />
                        </div>
                    </div>
                </div>
                 {/* Related Products */}
                 {relatedProducts.length > 0 && (
                     <div className="w-full p-6 border-t dark:border-gray-700">
                        <h3 className="text-xl font-bold mb-4 dark:text-gray-100">You Might Also Like</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                           {relatedProducts.map(p => (
                               <div key={p.id} onClick={() => {
                                   // A bit of a hack to switch modal content. In a real app, you might lift state higher or use a router.
                                   onClose();
                                   // Use a timeout to allow the close animation to start before opening the new one.
                                   setTimeout(() => context!.addToCart(p,0), 100); // addToCart with 0 to open modal
                               }}>
                                 <ProductCard product={p} />
                               </div>
                           ))}
                        </div>
                     </div>
                 )}
            </div>
        </div>
    );
};