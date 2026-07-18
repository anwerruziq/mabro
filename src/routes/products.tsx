import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';

export const Route = createFileRoute('/products')({
  component: ProductsPage,
});

function ProductsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hide loading screen after 4 seconds to simulate loading while video plays
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#150605]">
        <video 
          src="/motion-graphics.mp4" 
          autoPlay 
          muted 
          playsInline
          className="w-full h-full object-cover mix-blend-screen opacity-90"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#150605] text-[#ebd9c8]" dir="rtl">
      {/* Header */}
      <header className="py-6 border-b border-[#ebd9c8]/10 bg-[#150605]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-8 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <i className="bx bxs-coffee-bean text-[24px]"></i>
            <span className="text-xl font-bold" style={{ fontFamily: "'Qahwa', sans-serif" }}>مبروع</span>
          </Link>
          <Link to="/" className="text-sm font-bold flex items-center gap-1 hover:text-white transition-colors">
            <i className="bx bx-right-arrow-alt text-lg"></i> العودة للرئيسية
          </Link>
        </div>
      </header>

      {/* Products */}
      <main className="py-20 mx-auto max-w-7xl px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest text-[#ebd9c8]/60 uppercase">المتجر الكامل</span>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Qahwa', sans-serif" }}>كل المنتجات</h1>
          <p className="text-[#ebd9c8]/70 max-w-xl mx-auto leading-relaxed">
            نقدم تشكيلة واسعة من أجود محاصيل القهوة من مختلف أنحاء العالم، لتناسب كل الأذواق. تم تحميصها بعناية فائقة لتبرز أفضل الإيحاءات.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { id: 1, name: "إثيوبيا يرجاشيفي", notes: "ياسمين، توت أزرق، ليمون", roast: "فاتح", price: "٧٥ ريال" },
            { id: 2, name: "كولومبيا سوبريمو", notes: "شوكولاتة داكنة، كراميل، جوز", roast: "متوسط", price: "٦٥ ريال" },
            { id: 3, name: "مزيج مبروع", notes: "بندق، عسل، كاكاو", roast: "متوسط إلى غامق", price: "٨٠ ريال" },
            { id: 4, name: "البرازيل سانتوس", notes: "مكسرات، كراميل، شوكولاتة", roast: "متوسط", price: "٥٥ ريال" },
            { id: 5, name: "كينيا AA", notes: "عنب أسود، حموضة فاكهية، زهور", roast: "فاتح", price: "٨٥ ريال" },
            { id: 6, name: "جواتيمالا أنتيجوا", notes: "شوكولاتة، توابل، ليمون حلو", roast: "متوسط", price: "٧٠ ريال" },
            { id: 7, name: "كوستاريكا تارازو", notes: "عسل، فواكه مجففة، حموضة متوازنة", roast: "متوسط إلى فاتح", price: "٨٥ ريال" },
            { id: 8, name: "السلفادور بوربون", notes: "شوكولاتة بالحليب، كراميل، فواكه", roast: "متوسط", price: "٨٠ ريال" },
          ].map((product) => (
            <div key={product.id} className="group rounded-2xl border border-[#ebd9c8]/10 bg-[#ebd9c8]/5 overflow-hidden transition-all hover:border-[#ebd9c8]/30 hover:bg-[#ebd9c8]/10 flex flex-col">
              <div className="aspect-[4/3] relative bg-[#ebd9c8]/10 p-8 flex items-center justify-center overflow-hidden shrink-0">
                <i className="bx bx-shopping-bag text-[70px] text-[#ebd9c8]/30 group-hover:scale-110 transition-transform duration-500"></i>
              </div>
              <div className="p-6 text-center flex flex-col flex-1">
                <h3 className="text-lg font-bold text-[#ebd9c8] mb-1">{product.name}</h3>
                <p className="text-sm text-[#ebd9c8]/60 mb-4 flex-1">{product.notes}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#ebd9c8]/10 mb-4">
                  <span className="text-xs bg-[#ebd9c8]/10 text-[#ebd9c8] px-3 py-1 rounded-full">{product.roast}</span>
                  <span className="font-bold text-[#ebd9c8]">{product.price}</span>
                </div>
                <button className="w-full bg-[#ebd9c8] text-[#150605] py-2.5 rounded-full text-sm font-bold transition-transform hover:scale-[1.02]">
                  أضف للسلة
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-[#150605] pt-12 pb-10 border-t border-[#ebd9c8]/10">
        <div className="mx-auto max-w-7xl px-8 text-center text-[#ebd9c8]/40 text-xs">
          <p>© {new Date().getFullYear()} مبروع للقهوة. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
