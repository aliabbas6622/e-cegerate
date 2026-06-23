import React from 'react';
import { X, ShoppingBag, Trash2, ArrowLeft, ShieldCheck, CheckCircle2, ChevronRight, Gift } from 'lucide-react';
import { Product, OrderItem, SiteSettings } from '../types';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import confetti from 'canvas-confetti';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  settings: SiteSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  settings
}) => {
  const [step, setStep] = React.useState<'cart' | 'checkout' | 'success'>('cart');
  
  // Checkout Form State
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [city, setCity] = React.useState('');
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const [placingOrder, setPlacingOrder] = React.useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = React.useState<{ id: string; total: number } | null>(null);

  // Auto-fill customer profile if previously ordered
  React.useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('aesthete_customer_profile');
      if (stored) {
        try {
          const profile = JSON.parse(stored);
          setFullName(profile.fullName || '');
          setEmail(profile.email || '');
          setPhone(profile.phone || '');
          setAddress(profile.address || '');
          setCity(profile.city || '');
        } catch (_) {}
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Pricing Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const FREE_SHIPPING_THRESHOLD = 150;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 15;
  const grandTotal = subtotal + shippingCost;
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  // Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = 'Full name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errors.email = 'Valid email address is required';
    if (!phone.trim() || phone.length < 7) errors.phone = 'Valid phone number is required';
    if (!address.trim()) errors.address = 'Full delivery address is required';
    if (!city.trim()) errors.city = 'City is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Order to Firestore
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setPlacingOrder(true);
    try {
      const orderItems: OrderItem[] = cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0]
      }));

      const newOrder = {
        customerName: fullName.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        customerAddress: address.trim(),
        customerCity: city.trim(),
        items: orderItems,
        total: grandTotal,
        status: 'pending' as const,
        paymentMethod: 'cod' as const,
        createdAt: Date.now()
      };

      // 1. Add order to Firestore
      const orderRef = await addDoc(collection(db, 'orders'), newOrder);

      // 2. Decrement stock levels of products
      for (const item of cart) {
        const prodRef = doc(db, 'products', item.product.id);
        await updateDoc(prodRef, {
          stock: increment(-item.quantity)
        });
      }

      // 3. Save profile locally for future convenience
      localStorage.setItem('aesthete_customer_profile', JSON.stringify({
        fullName, email, phone, address, city
      }));

      // Celebrate!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: [settings.accentColor || '#3b82f6', '#10b981', '#f59e0b']
      });

      // Clear state & transition
      setPlacedOrderDetails({ id: orderRef.id, total: grandTotal });
      onClearCart();
      setStep('success');
    } catch (err) {
      console.error('Error placing order:', err);
      alert('We had trouble placing your order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleReset = () => {
    setStep('cart');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-root">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Main Drawer Slide */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white flex flex-col shadow-2xl animate-slide-in relative border-l border-gray-100">
          
          {/* Header Bar */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {step === 'checkout' ? (
                <button 
                  onClick={() => setStep('cart')}
                  className="p-1.5 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
                  title="Back to Bag"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <ShoppingBag className="w-5 h-5 text-gray-800" />
              )}
              <h3 className="text-base font-display font-bold text-gray-950">
                {step === 'cart' && `Shopping Bag (${cart.length})`}
                {step === 'checkout' && 'Secure Checkout'}
                {step === 'success' && 'Order Placed'}
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-50 cursor-pointer border border-gray-100"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* STEP 1: REVIEW CART */}
          {step === 'cart' && (
            <>
              {cart.length > 0 ? (
                <>
                  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Free Shipping Goal Tracker */}
                    <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100/50 space-y-3">
                      <div className="flex items-start gap-2.5 text-xs text-gray-600">
                        <Gift className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          {amountToFreeShipping > 0 ? (
                            <p className="font-medium text-gray-700 leading-tight">
                              Add <span className="font-bold">${amountToFreeShipping.toFixed(2)}</span> more to qualify for <span className="font-semibold text-gray-900">Free Express Shipping</span>.
                            </p>
                          ) : (
                            <p className="font-bold text-emerald-600 leading-tight">
                              Your order qualifies for FREE global express delivery!
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${freeShippingProgress}%`,
                            backgroundColor: settings.accentColor || '#3b82f6'
                          }}
                        />
                      </div>
                    </div>

                    {/* Cart Items List */}
                    <div className="space-y-4" id="cart-items-list">
                      {cart.map((item) => (
                        <div 
                          key={item.product.id}
                          className="flex items-center gap-4 py-4 border-b border-gray-100/60"
                          id={`cart-item-${item.product.id}`}
                        >
                          {/* Image */}
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                            <img 
                              src={item.product.images[0]} 
                              alt={item.product.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover" 
                            />
                          </div>

                          {/* Middle info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-gray-900 truncate tracking-tight">{item.product.name}</h4>
                            <p className="text-xs font-bold text-gray-500 mt-0.5">${item.product.price}</p>
                            
                            {/* Item Quantity control */}
                            <div className="flex items-center gap-2 mt-2 select-none">
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                className="w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center text-xs text-gray-500 hover:bg-gray-50 cursor-pointer font-bold leading-none"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold text-gray-700 w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                className="w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center text-xs text-gray-500 hover:bg-gray-50 cursor-pointer font-bold leading-none"
                                disabled={item.quantity >= item.product.stock}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Remove actions button */}
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="p-1.5 text-gray-300 hover:text-rose-600 transition-colors cursor-pointer rounded-lg hover:bg-rose-50"
                            title="Remove item"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer totals & checkout navigation */}
                  <div className="border-t border-gray-100 p-6 bg-white space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500 font-medium">
                        <span>Subtotal</span>
                        <span className="text-gray-950 font-bold">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 font-medium">
                        <span>Shipping Delivery</span>
                        <span className="text-gray-950 font-semibold">
                          {shippingCost === 0 ? (
                            <span className="text-emerald-600 font-bold uppercase tracking-wider text-[10px]">Free</span>
                          ) : (
                            `$${shippingCost.toFixed(2)}`
                          )}
                        </span>
                      </div>
                      <div className="border-t border-gray-100 pt-2.5 flex justify-between text-sm font-bold text-gray-900 font-display">
                        <span>Grand Total</span>
                        <span>${grandTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Proceed to checkout trigger */}
                    <button
                      onClick={() => setStep('checkout')}
                      className="w-full h-12 rounded-full font-semibold text-sm tracking-wide text-white transition-all transform active:scale-95 duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      style={{ backgroundColor: settings.accentColor || '#3b82f6' }}
                      id="checkout-proceed-btn"
                    >
                      Proceed to Checkout
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <p className="text-[10px] text-gray-400 text-center font-medium leading-tight">
                      Secure checkout powered by cash on delivery. 
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 mb-4">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-display font-semibold text-gray-950 mb-1">Your bag is empty</h4>
                  <p className="text-xs text-gray-400 max-w-xs leading-relaxed mb-6">
                    Add minimalist accents to your daily life by exploring our limited collections.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </>
          )}

          {/* STEP 2: SHIPPING DETAILS FORM */}
          {step === 'checkout' && (
            <form onSubmit={handlePlaceOrder} className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                
                {/* Secure checkout info indicator */}
                <div className="bg-blue-50/50 rounded-xl p-3.5 border border-blue-100/50 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className="text-[11px] text-blue-800 leading-normal font-medium">
                    Cash on Delivery. You pay upon product arrival. Enter details below.
                  </p>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 focus:border-gray-400 rounded-xl text-sm font-medium outline-none transition-colors text-gray-800 placeholder-gray-400"
                    />
                    {formErrors.fullName && <p className="text-[10px] text-rose-500 font-medium mt-1">{formErrors.fullName}</p>}
                  </div>

                  {/* Email field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input
                      type="email"
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 focus:border-gray-400 rounded-xl text-sm font-medium outline-none transition-colors text-gray-800 placeholder-gray-400"
                    />
                    {formErrors.email && <p className="text-[10px] text-rose-500 font-medium mt-1">{formErrors.email}</p>}
                  </div>

                  {/* Phone field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 focus:border-gray-400 rounded-xl text-sm font-medium outline-none transition-colors text-gray-800 placeholder-gray-400"
                    />
                    {formErrors.phone && <p className="text-[10px] text-rose-500 font-medium mt-1">{formErrors.phone}</p>}
                  </div>

                  {/* Address field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Delivery Address</label>
                    <input
                      type="text"
                      placeholder="123 Minimalist Avenue, Apt 4B"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 focus:border-gray-400 rounded-xl text-sm font-medium outline-none transition-colors text-gray-800 placeholder-gray-400"
                    />
                    {formErrors.address && <p className="text-[10px] text-rose-500 font-medium mt-1">{formErrors.address}</p>}
                  </div>

                  {/* City field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">City</label>
                    <input
                      type="text"
                      placeholder="San Francisco"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 focus:border-gray-400 rounded-xl text-sm font-medium outline-none transition-colors text-gray-800 placeholder-gray-400"
                    />
                    {formErrors.city && <p className="text-[10px] text-rose-500 font-medium mt-1">{formErrors.city}</p>}
                  </div>
                </div>

                {/* Order Summary segment */}
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Your Order</h4>
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-xs text-gray-600">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex justify-between">
                        <span className="truncate max-w-[200px]">{item.product.name} (x{item.quantity})</span>
                        <span className="font-semibold text-gray-800">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200/60 pt-1.5 flex justify-between font-bold text-gray-800">
                      <span>Delivery (COD)</span>
                      <span>{shippingCost === 0 ? 'Free' : `$${shippingCost}`}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Form placement footer */}
              <div className="border-t border-gray-100 p-6 bg-white space-y-3">
                <div className="flex justify-between text-sm font-bold text-gray-900 font-display">
                  <span>Grand Total to Pay</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>

                <button
                  type="submit"
                  disabled={placingOrder}
                  className="w-full h-12 rounded-full font-semibold text-sm tracking-wide text-white transition-all transform active:scale-95 duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  style={{ backgroundColor: settings.accentColor || '#3b82f6' }}
                  id="checkout-submit-btn"
                >
                  {placingOrder ? 'Processing...' : `Place Order (Pay $${grandTotal.toFixed(2)} on Delivery)`}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: ORDER SUCCESS CELEBRATION */}
          {step === 'success' && (
            <div className="flex-1 overflow-y-auto px-6 py-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-10 h-10 stroke-[1.8]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-display font-bold text-gray-950">Thank you for your order!</h3>
                <p className="text-xs text-gray-500 max-w-xs leading-relaxed mx-auto">
                  Your order is received and is currently being processed by our curation house.
                </p>
              </div>

              {placedOrderDetails && (
                <div className="w-full bg-gray-50 rounded-2xl p-5 border border-gray-100 text-left space-y-3">
                  <div>
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Reference</h5>
                    <p className="text-xs font-mono font-semibold text-gray-700 mt-0.5">{placedOrderDetails.id}</p>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Method</h5>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">Cash on Delivery (COD)</p>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount</h5>
                    <p className="text-xs font-bold text-gray-900 mt-0.5">${placedOrderDetails.total.toFixed(2)}</p>
                  </div>
                </div>
              )}

              <div className="bg-amber-50/50 rounded-xl p-3.5 border border-amber-100/40 text-[11px] text-amber-800 text-left leading-normal font-medium max-w-xs">
                💡 A fulfillment assistant will phone you shortly to confirm the delivery window.
              </div>

              <button
                onClick={handleReset}
                className="w-full h-11 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
