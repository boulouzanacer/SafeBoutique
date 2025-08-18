import { useTransition, animated } from '@react-spring/web';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

interface AnimatedTextProps {
  translationKey: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  fallback?: string;
  values?: Record<string, any>;
}

export default function AnimatedText({ 
  translationKey, 
  className = "", 
  as: Component = 'span',
  fallback = "",
  values = {}
}: AnimatedTextProps) {
  const { t, i18n } = useTranslation();
  const [text, setText] = useState(t(translationKey, fallback, values));
  const [key, setKey] = useState(0);

  useEffect(() => {
    const handleLanguageChange = () => {
      setText(t(translationKey, fallback, values));
      setKey(prev => prev + 1);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, t, translationKey, fallback, values]);

  const transitions = useTransition(key, {
    from: { opacity: 0, transform: 'translateY(8px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(-8px)' },
    config: { tension: 280, friction: 25 }
  });

  return transitions((style: any, item: any) => (
    <animated.span style={style} key={item} className={className}>
      {text as string}
    </animated.span>
  ));
}