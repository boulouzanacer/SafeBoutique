import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (languageCode: string) => {
    // Add transition class to body for smooth direction change
    document.body.classList.add('language-transitioning');
    
    // Update document direction with smooth transition
    const newDir = languageCode === 'ar' ? 'rtl' : 'ltr';
    
    // Apply fade effect during language change
    document.documentElement.style.transition = 'opacity 0.3s ease-in-out';
    document.documentElement.style.opacity = '0.95';
    
    setTimeout(() => {
      document.documentElement.dir = newDir;
      document.documentElement.lang = languageCode;
      i18n.changeLanguage(languageCode);
      localStorage.setItem('language', languageCode);
      
      // Restore opacity
      document.documentElement.style.opacity = '1';
      
      // Remove transition class after animation
      setTimeout(() => {
        document.body.classList.remove('language-transitioning');
        document.documentElement.style.transition = '';
      }, 300);
    }, 150);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-600 hover:text-primary"
          data-testid="button-language-selector"
        >
          <Languages className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`cursor-pointer ${
              i18n.language === language.code ? 'bg-gray-100' : ''
            }`}
            data-testid={`language-option-${language.code}`}
          >
            <span className="mr-3">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}