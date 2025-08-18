import { useTransition, animated } from '@react-spring/web';
import { useTranslation } from 'react-i18next';
import { ReactNode, useEffect, useState } from 'react';

interface LanguageTransitionProps {
  children: ReactNode;
  className?: string;
}

export default function LanguageTransition({ children, className = "" }: LanguageTransitionProps) {
  const { i18n } = useTranslation();
  const [key, setKey] = useState(0);

  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setKey(prev => prev + 1);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const transitions = useTransition(key, {
    from: { opacity: 0, transform: 'translateY(10px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(-10px)' },
    config: { tension: 300, friction: 30 }
  });

  return transitions((style: any, item: any) => (
    <animated.div style={style} className={className} key={item}>
      {children}
    </animated.div>
  ));
}