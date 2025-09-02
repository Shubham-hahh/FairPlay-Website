import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';

export default function VideoActions({ onUpload, onRemove }) {
  const { t } = useTranslation('common');

  const handleUpload = async () => {
    try {
      await onUpload();
      alert(t('upload_success'));
    } catch {
      alert(t('upload_error'));
    }
  };

  const handleRemove = async () => {
    try {
      await onRemove();
      alert(t('remove_success'));
    } catch {
      alert(t('remove_error'));
    }
  };

  return (
    <div>
      <button onClick={handleUpload}>{t('upload_video')}</button>
      <button onClick={handleRemove}>{t('remove_video')}</button>
    </div>
  );
}

VideoActions.propTypes = {
  onUpload: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};