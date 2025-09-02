import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styles from './infoBanner.module.css';

export const DevBanner = () => {
  const { t } = useTranslation('common');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem('infoBannerDismissed');
    if (!dismissed) setVisible(true);
  }, []);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem('infoBannerDismissed', 'true');
  };

  if (!visible) return null;
  console.log("DevBanner visible?", visible);

  return (
    <div className={styles.infoBanner}>
      <span className={styles.infoBannerText}>🚧 Note: This site is a demo currently in development, not the final website!</span>
      <button className={styles.closeBtn} onClick={handleClose} aria-label={t('close')}>
        {t('close')}
      </button>
    </div>
  );
};
