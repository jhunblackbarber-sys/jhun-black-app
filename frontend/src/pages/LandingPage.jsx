import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
// Adicionado ChevronDown e Globe para o novo menu de idiomas
import { Phone, MapPin, Instagram, Globe, Calendar, ChevronDown } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');

  const content = {
    en: {
      title: 'JHUN BLACK BARBER',
      subtitle: 'Best barber in Tampa • Brazilian cut with perfect finish',
      bookButton: 'BOOK NOW',
      address: '4023 W. Waters Ave Suite #1, Tampa, FL 33614',
      phone: '(813) 735-2691',
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
      phone: '(813) 735-2691', // Corrigido de 2601 para 2691
      hours: 'Horário: Seg-Sáb 9:00 AM - 9:00 PM',
      whyUs: 'POR QUE NOS ESCOLHER',
      reason1: 'Expertise Brasileira',
      reason1Desc: 'Técnicas autênticas de barbearia brasileira',
      reason2: 'Serviço Premium',
      reason2Desc: 'Produtos de alta qualidade e atenção aos detalhes',
      reason3: 'Localização Conveniente',
      reason3Desc: 'Fácil de encontrar em Tampa, FL',
    },
    es: {
      title: 'JHUN BLACK BARBER',
      subtitle: 'Mejor barbero en Tampa • Corte brasileño con acabado perfecto',
      bookButton: 'RESERVAR AHORA',
      address: '4023 W. Waters Ave Suite #1, Tampa, FL 33614',
      phone: '(813) 735-2691',
      hours: 'Horario: Lun-Sáb 9:00 AM - 9:00 PM',
      whyUs: 'POR QUÉ ELEGIRNOS',
      reason1: 'Experiencia Brasileña',
      reason1Desc: 'Técnicas auténticas de barbería brasileña',
      reason2: 'Servicio Premium',
      reason2Desc: 'Productos de alta calidad y atención al detalle',
      reason3: 'Ubicación Conveniente',
      reason3Desc: 'Fácil de encontrar en Tampa, FL',
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background - Mantido exatamente como o seu */}
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

      {/* NOVO MENU DE IDIOMAS - Substitui os botões lado a lado para economizar espaço */}
      <div className="absolute top-6 right-6 z-50">
        <div className="relative group">
          <Button
            variant="outline"
            size="sm"
            className="bg-black/60 border-[#FFC107] text-[#FFC107] hover:bg-[#FFC107] hover:text-black transition-all font-bold min-w-[80px] flex justify-between"
          >
            <div className="flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              {language.toUpperCase()}
            </div>
            <ChevronDown className="w-4 h-4 ml-1 opacity-50 group-hover:rotate-180 transition-transform" />
          </Button>
          
          <div className="absolute right-0 mt-2 hidden group-hover:flex flex-col gap-1 bg-black/95 border border-[#FFC107]/30 p-1 rounded-md shadow-2xl min-w-[110px]">
            {['en', 'pt', 'es'].map((lang) => (
              <Button
                key={lang}
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(lang)}
                className={`text-white hover:bg-[#FFC107] hover:text-black justify-start px-4 ${language === lang ? 'text-[#FFC107]' : ''}`}
              >
                {lang === 'en' ? '🇺🇸 EN' : lang === 'pt' ? '🇧🇷 PT' : '🇪🇸 ES'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section - Mantida a sua estrutura e animações */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="mb-8 animate-fade-in-up">
          <div className="w-48 h-48 md:w-64 md:h-64 mx-auto rounded-full bg-white flex items-center justify-center shadow-2xl">
            <img 
              src="https://customer-assets.emergentagent.com/job_jhunblack/artifacts/qsmwfje6_Design%20sem%20nome.png"
              alt="Jhun Black Barber Logo"
              className="w-32 h-32 md:w-44 md:h-44"
            />
          </div>
        </div>

        <h1 
          className="text-[#FFC107] text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-6 animate-fade-in-up"
          style={{
            animationDelay: '0.2s',
            fontFamily: 'Bebas Neue, sans-serif', // Ajustado de cursive para sans-serif para melhor compatibilidade
            letterSpacing: '0.08em',
            textShadow: '0 0 16px rgba(255, 193, 7, 0.3), 2px 2px 4px rgba(0, 0, 0, 0.8)'
          }}
        >
          {t.title}
        </h1>

        <p className="text-white text-lg sm:text-xl md:text-2xl mb-12 max-w-3xl animate-fade-in-up font-light" style={{animationDelay: '0.4s'}}>
          {t.subtitle}
        </p>

        <Button
          size="lg"
          onClick={() => navigate('/book', { state: { language } })}
          className="bg-[#FFC107] hover:bg-[#FFD700] text-black font-bold text-xl px-16 py-8 rounded-full shadow-2xl hover:scale-110 transition-all animate-fade-in-up"
          style={{
            animationDelay: '0.6s',
            boxShadow: '0 0 30px rgba(255, 193, 7, 0.5), 0 8px 32px rgba(0, 0, 0, 0.8)'
          }}
        >
          <Calendar className="w-6 h-6 mr-3" />
          {t.bookButton}
        </Button>

        {/* Contact Info - Adicionado pb-24 para não ficar por baixo da logo do rodapé */}
        <div className="mt-20 pb-24 space-y-4 text-white/90 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
          <div className="flex items-center justify-center space-x-3">
            <MapPin className="w-5 h-5 text-[#FFC107]" />
            <span className="text-sm md:text-base">{t.address}</span>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <Phone className="w-5 h-5 text-[#FFC107]" />
            <a href="tel:8137352691" className="text-sm md:text-base hover:text-[#FFC107] transition-colors">{t.phone}</a>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <Instagram className="w-5 h-5 text-[#FFC107]" />
            <a href="https://instagram.com/jhun_black_hair_cut_" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base hover:text-[#FFC107] transition-colors">@jhun_black_hair_cut_</a>
          </div>
          <p className="text-sm text-white/70 mt-6">{t.hours}</p>
        </div>
      </div>

      {/* Why Choose Us Section - pb-32 para evitar sobreposição */}
      <div className="relative z-10 bg-black/95 py-20 px-4 border-t border-[#FFC107]/30 pb-32">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-[#FFC107] text-4xl md:text-5xl font-bold text-center mb-16" style={{fontFamily: 'Bebas Neue, sans-serif'}}>{t.whyUs}</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((num) => (
              <div key={num} className="text-center p-8 border border-[#FFC107]/20 rounded-lg hover:border-[#FFC107] hover:bg-black/50 transition-all">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#FFC107] flex items-center justify-center text-black text-2xl font-bold" style={{fontFamily: 'Bebas Neue, sans-serif'}}>{num}</div>
                <h4 className="text-white text-xl font-bold mb-3">{t[`reason${num}`]}</h4>
                <p className="text-white/70">{t[`reason${num}Desc`]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Link */}
      <div className="absolute bottom-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/login')}
          className="text-white/20 hover:text-[#FFC107] text-[10px]"
        >
          Admin
        </Button>
      </div>
    </div>
  );
}
