import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, Instagram, Globe, Calendar } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');

  const content = {
    en: {
      title: 'JHUN BLACK BARBER',
      subtitle: 'Best barber in Tampa • Brazilian cut with perfect finish',
      bookButton: 'BOOK NOW',
      address: '4023 W. Waters Ave Suite #1, Tampa, FL 33614',
      phone: '(813) 735-2601',
      hours: 'Hours: Mon-Sat 9:00 AM - 9:00 PM',
      whyUs: 'WHY CHOOSE US',
      reason1: 'Brazilian Expertise',
      reason1Desc: 'Authentic Brazilian barbering techniques',
      reason2: 'Premium Service',
      reason2Desc: 'Top-quality products and attention to detail',
      reason3: 'Convenient Location',
      reason3Desc: 'Easy to find in Tampa, FL',
    },
    pt: {
      title: 'JHUN BLACK BARBER',
      subtitle: 'Melhor barbeiro de Tampa • Corte brasileiro com acabamento perfeito',
      bookButton: 'AGENDAR AGORA',
      address: '4023 W. Waters Ave Suite #1, Tampa, FL 33614',
      phone: '(813) 735-2601',
      hours: 'Horário: Seg-Sáb 9:00 AM - 9:00 PM',
      whyUs: 'POR QUE NOS ESCOLHER',
      reason1: 'Expertise Brasileira',
      reason1Desc: 'Técnicas autênticas de barbearia brasileira',
      reason2: 'Serviço Premium',
      reason2Desc: 'Produtos de alta qualidade e atenção aos detalhes',
      reason3: 'Localização Conveniente',
      reason3Desc: 'Fácil de encontrar em Tampa, FL',
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen relative">
      {/* Background with chair image + blur + dark overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(https://customer-assets.emergentagent.com/job_jhunblack/artifacts/ci4q437i_IMG_4079.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
        }}
      />
      <div className="fixed inset-0 z-0 bg-black/50" />

      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <Button
          data-testid="language-toggle-btn"
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
          className="bg-black/50 border-[#FFC107] text-[#FFC107] hover:bg-[#FFC107] hover:text-black transition-all"
        >
          <Globe className="w-4 h-4 mr-2" />
          {language === 'en' ? 'PT' : 'EN'}
        </Button>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Logo - Hat, Glasses, Mustache in White Circle */}
        <div className="mb-8 animate-fade-in-up">
          <div className="w-48 h-48 md:w-64 md:h-64 mx-auto rounded-full bg-white flex items-center justify-center shadow-2xl">
            <img 
              src="https://customer-assets.emergentagent.com/job_jhunblack/artifacts/qsmwfje6_Design%20sem%20nome.png"
              alt="Jhun Black Barber Logo"
              className="w-32 h-32 md:w-44 md:h-44"
            />
          </div>
        </div>

        {/* Main Title - AGENDA ABERTA */}
        <h1 
          data-testid="main-title"
          className="text-[#FFC107] text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-6 animate-fade-in-up"
          style={{
            animationDelay: '0.2s',
            fontFamily: 'Bebas Neue, cursive',
            letterSpacing: '0.08em',
            textShadow: '0 0 8px rgba(255, 193, 7, 0.4), 0 0 16px rgba(255, 193, 7, 0.2), 2px 2px 4px rgba(0, 0, 0, 0.6)'
          }}
        >
          {t.title}
        </h1>

        {/* Subtitle */}
        <p 
          className="text-white text-lg sm:text-xl md:text-2xl mb-12 max-w-3xl animate-fade-in-up font-light"
          style={{animationDelay: '0.4s'}}
        >
          {t.subtitle}
        </p>

        {/* CTA Button - Yellow Neon */}
        <Button
          data-testid="book-now-btn"
          size="lg"
          onClick={() => navigate('/book', { state: { language } })}
          className="bg-[#FFC107] hover:bg-[#FFD700] text-black font-bold text-xl px-16 py-8 rounded-full shadow-2xl hover:scale-110 transition-all animate-fade-in-up"
          style={{
            animationDelay: '0.6s',
            boxShadow: '0 0 30px rgba(255, 193, 7, 0.6), 0 8px 32px rgba(0, 0, 0, 0.8)'
          }}
        >
          <Calendar className="w-6 h-6 mr-3" />
          {t.bookButton}
        </Button>

        {/* Contact Info */}
        <div className="mt-20 space-y-4 text-white/90 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
          <div className="flex items-center justify-center space-x-3">
            <MapPin className="w-5 h-5 text-[#FFC107]" />
            <span className="text-sm md:text-base">{t.address}</span>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <Phone className="w-5 h-5 text-[#FFC107]" />
            <a href="tel:8137352601" className="text-sm md:text-base hover:text-[#FFC107] transition-colors">{t.phone}</a>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <Instagram className="w-5 h-5 text-[#FFC107]" />
            <a href="https://instagram.com/jhun_black_hair_cut_" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base hover:text-[#FFC107] transition-colors">@jhun_black_hair_cut_</a>
          </div>
          <p className="text-sm text-white/70 mt-6">{t.hours}</p>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="relative z-10 bg-black/90 py-20 px-4 border-t border-[#FFC107]/30">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-[#FFC107] text-4xl md:text-5xl font-bold text-center mb-16" style={{fontFamily: 'Bebas Neue, cursive', letterSpacing: '0.05em'}}>{t.whyUs}</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 border border-[#FFC107]/20 rounded-lg hover:border-[#FFC107] hover:bg-black/50 transition-all">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#FFC107] flex items-center justify-center text-black text-3xl font-bold" style={{fontFamily: 'Bebas Neue, cursive'}}>1</div>
              <h4 className="text-white text-xl font-bold mb-3">{t.reason1}</h4>
              <p className="text-white/70">{t.reason1Desc}</p>
            </div>
            <div className="text-center p-8 border border-[#FFC107]/20 rounded-lg hover:border-[#FFC107] hover:bg-black/50 transition-all">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#FFC107] flex items-center justify-center text-black text-3xl font-bold" style={{fontFamily: 'Bebas Neue, cursive'}}>2</div>
              <h4 className="text-white text-xl font-bold mb-3">{t.reason2}</h4>
              <p className="text-white/70">{t.reason2Desc}</p>
            </div>
            <div className="text-center p-8 border border-[#FFC107]/20 rounded-lg hover:border-[#FFC107] hover:bg-black/50 transition-all">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#FFC107] flex items-center justify-center text-black text-3xl font-bold" style={{fontFamily: 'Bebas Neue, cursive'}}>3</div>
              <h4 className="text-white text-xl font-bold mb-3">{t.reason3}</h4>
              <p className="text-white/70">{t.reason3Desc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Link */}
      <div className="absolute bottom-4 left-4 z-50">
        <Button
          data-testid="admin-link-btn"
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/login')}
          className="text-white/30 hover:text-[#FFC107] text-xs"
        >
          Admin
        </Button>
      </div>
    </div>
  );
}