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
          <Link to="/" className="flex items-center group">
            <div className="h-10 w-10 rounded-full overflow-hidden border border-[#ebd9c8]/30 p-0.5 shadow-sm transition-transform group-hover:scale-105 bg-[#150605]">
              <img src="/logo.png" alt="رشفه" className="h-full w-full object-cover rounded-full" />
            </div>
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
          <h1 className="mt-4 text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Qahwa', sans-serif" }}>محاصيلنا الفريدة</h1>
          <p className="text-[#ebd9c8]/70 max-w-xl mx-auto leading-relaxed">
            نقدم تشكيلة واسعة من أجود محاصيل القهوة المختارة من أفضل المزارع العالمية، مُحَمّصة بحرفية عالية لتستمتع بكوب مثالي كل صباح.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { 
              id: 1, 
              name: "إثيوبيا يرجاشيفي", 
              notes: "ياسمين، توت أزرق، ليمون حلو", 
              roast: "فاتح", 
              price: "٧٥ ريال",
              img: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=600&auto=format&fit=crop" 
            },
            { 
              id: 2, 
              name: "كولومبيا سوبريمو", 
              notes: "شوكولاتة داكنة، كراميل غني، جوز", 
              roast: "متوسط", 
              price: "٦٥ ريال",
              img: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?q=80&w=600&auto=format&fit=crop" 
            },
            { 
              id: 3, 
              name: "مزيج رشفة الخاص", 
              notes: "بندق، عسل طبيعي، كاكاو", 
              roast: "متوسط إلى غامق", 
              price: "٨٠ ريال",
              img: "https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?q=80&w=600&auto=format&fit=crop" 
            },
            { 
              id: 4, 
              name: "البرازيل سانتوس", 
              notes: "مكسرات محمصة، كراميل، شوكولاتة", 
              roast: "متوسط", 
              price: "٥٥ ريال",
              img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop" 
            },
            { 
              id: 5, 
              name: "كينيا AA نيري", 
              notes: "عنب أسود، حموضة فاكهية، أزهار", 
              roast: "فاتح", 
              price: "٨٥ ريال",
              img: "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=600&auto=format&fit=crop" 
            },
            { 
              id: 6, 
              name: "جواتيمالا أنتيجوا", 
              notes: "شوكولاتة داكنة، توابل، حمضيات", 
              roast: "متوسط", 
              price: "٧٠ ريال",
              img: "https://images.unsplash.com/photo-1580933073521-dc49ac0d4e6a?q=80&w=600&auto=format&fit=crop" 
            },
            { 
              id: 7, 
              name: "كوستاريكا تارازو", 
              notes: "رحيق العسل، فواكه مجففة، قوام متوازن", 
              roast: "متوسط إلى فاتح", 
              price: "٨٥ ريال",
              img: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=600&auto=format&fit=crop" 
            },
            { 
              id: 8, 
              name: "السلفادور بوربون", 
              notes: "شوكولاتة بالحليب، كراميل ناعم، فواكه", 
              roast: "متوسط", 
              price: "٨٠ ريال",
              img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop" 
            },
          ].map((product) => (
            <div key={product.id} className="group rounded-2xl border border-[#ebd9c8]/10 bg-[#ebd9c8]/5 overflow-hidden transition-all hover:border-[#ebd9c8]/30 hover:bg-[#ebd9c8]/10 flex flex-col">
              <div className="aspect-[4/3] relative overflow-hidden shrink-0">
                <img src={product.img} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#150605] via-transparent to-transparent opacity-50" />
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
          <p>© {new Date().getFullYear()} رشفه للقهوة. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
