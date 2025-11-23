import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, Instagram, Globe, Calendar } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');

  const content = {
    en: {
      title: 'AGENDA ABERTA',
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
      title: 'AGENDA ABERTA',
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
    <div className="booking-hero min-h-screen">
      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <Button
          data-testid="language-toggle-btn"
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
          className="bg-black/50 border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-black"
        >
          <Globe className="w-4 h-4 mr-2" />
          {language === 'en' ? 'PT' : 'EN'}
        </Button>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Logo */}
        <div className="mb-8 animate-fade-in-up">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-[#FFD700] flex items-center justify-center text-black text-5xl font-bold">
            JBB
          </div>
          <h1 className="text-white text-3xl md:text-4xl mb-2" style={{letterSpacing: '0.1em'}}>JHUN BLACK BARBER</h1>
        </div>

        {/* Main Title */}
        <h2 
          data-testid="main-title"
          className="text-[#FFD700] text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-6 gold-glow animate-fade-in-up"
          style={{animationDelay: '0.2s'}}
        >
          {t.title}
        </h2>

        {/* Subtitle */}
        <p 
          className="text-white text-lg sm:text-xl md:text-2xl mb-12 max-w-3xl animate-fade-in-up"
          style={{animationDelay: '0.4s'}}
        >
          {t.subtitle}
        </p>

        {/* CTA Button */}
        <Button
          data-testid="book-now-btn"
          size="lg"
          onClick={() => navigate('/book', { state: { language } })}
          className="bg-[#FFD700] hover:bg-[#FFC107] text-black font-bold text-xl px-12 py-8 rounded-full shadow-2xl hover:scale-105 transition-transform animate-fade-in-up"
          style={{animationDelay: '0.6s'}}
        >
          <Calendar className="w-6 h-6 mr-3" />
          {t.bookButton}
        </Button>

        {/* Contact Info */}
        <div className="mt-16 space-y-4 text-white/90 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
          <div className="flex items-center justify-center space-x-3">
            <MapPin className="w-5 h-5 text-[#FFD700]" />
            <span className="text-sm md:text-base">{t.address}</span>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <Phone className="w-5 h-5 text-[#FFD700]" />
            <a href="tel:8137352601" className="text-sm md:text-base hover:text-[#FFD700] transition-colors">{t.phone}</a>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <Instagram className="w-5 h-5 text-[#FFD700]" />
            <a href="https://instagram.com/jhun_black_hair_cut_" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base hover:text-[#FFD700] transition-colors">@jhun_black_hair_cut_</a>
          </div>
          <p className="text-sm text-white/70 mt-6">{t.hours}</p>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="relative z-10 bg-black/80 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-[#FFD700] text-4xl md:text-5xl font-bold text-center mb-16">{t.whyUs}</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 border border-[#FFD700]/30 rounded-lg hover:border-[#FFD700] transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFD700] flex items-center justify-center text-black text-2xl font-bold">1</div>
              <h4 className="text-white text-xl font-bold mb-2">{t.reason1}</h4>
              <p className="text-white/70">{t.reason1Desc}</p>
            </div>
            <div className="text-center p-6 border border-[#FFD700]/30 rounded-lg hover:border-[#FFD700] transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFD700] flex items-center justify-center text-black text-2xl font-bold">2</div>
              <h4 className="text-white text-xl font-bold mb-2">{t.reason2}</h4>
              <p className="text-white/70">{t.reason2Desc}</p>
            </div>
            <div className="text-center p-6 border border-[#FFD700]/30 rounded-lg hover:border-[#FFD700] transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFD700] flex items-center justify-center text-black text-2xl font-bold">3</div>
              <h4 className="text-white text-xl font-bold mb-2">{t.reason3}</h4>
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
          className="text-white/30 hover:text-[#FFD700] text-xs"
        >
          Admin
        </Button>
      </div>
    </div>
  );
}