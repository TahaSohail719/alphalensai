import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';

interface SEOHeadProps {
  titleKey?: string;
  descriptionKey?: string;
}

export function SEOHead({ titleKey = 'seo.defaultTitle', descriptionKey = 'seo.defaultDescription' }: SEOHeadProps) {
  const { t } = useTranslation('common');
  const { language } = useLanguage();

  const title = t(titleKey);
  const description = t(descriptionKey);
  const baseUrl = window.location.origin;

  return (
    <Helmet>
      <html lang={language} dir={language === 'fa' ? 'rtl' : 'ltr'} />
      <title>{title}</title>
      <meta name="description" content={description} />
      
      <link rel="alternate" hrefLang="en" href={`${baseUrl}/en`} />
      <link rel="alternate" hrefLang="es" href={`${baseUrl}/es`} />
      <link rel="alternate" hrefLang="fa" href={`${baseUrl}/fa`} />
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/en`} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:locale" content={language} />
    </Helmet>
  );
}
