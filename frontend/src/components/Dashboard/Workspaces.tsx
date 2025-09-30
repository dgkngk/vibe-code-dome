import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext.tsx';

const Workspaces: React.FC = () => {
  const { t } = useLanguage();
  return null; // This component is no longer used as workspaces are now in the sidebar
  // If needed in future, translations can be added here
};

export default Workspaces;
