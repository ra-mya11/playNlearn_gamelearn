import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Check, X, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/I18nContext';

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ka', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'od', name: 'ଓଡିଆ', flag: '🇮🇳' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
];

export function LanguageSelector({ isOpen, onClose }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const { setLanguage } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      const selectedLanguage = languages.find(lang => lang.code === languageCode);
      await setLanguage(languageCode);

      // Show toast notification
      if (selectedLanguage) {
        toast.success(t('sync.languageChanged', { language: selectedLanguage.name }) || `Language changed to ${selectedLanguage.name}`, {
          duration: 3000,
        });
      }

      onClose();
    } catch (error) {
      console.error('Failed to change language:', error);
      toast.error(t('common.error') || 'Failed to change language');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto glass-card">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              <DialogTitle className="text-2xl font-heading">
                {t('common.chooseLanguage')}
              </DialogTitle>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('common.selectYourPreferredLanguage') || 'Select your preferred language'}
          </p>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            type="text"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-muted/30 border-border/50 backdrop-blur-sm"
          />

          <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 px-4 py-4 rounded-lg',
                    'border border-transparent transition-all min-h-[44px]',
                    'hover:bg-muted/50 active:scale-95',
                    i18n.language === language.code
                      ? 'bg-primary/15 border-primary/30 text-primary font-semibold'
                      : 'text-foreground hover:border-border/50'
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 text-left">
                    <span className="text-xl">{language.flag}</span>
                    <span className="font-medium">{language.name}</span>
                  </div>
                  {i18n.language === language.code && (
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-sm">
                  {t('common.noLanguagesFound') || 'No languages found'}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
