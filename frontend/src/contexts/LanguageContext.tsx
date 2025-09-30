import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Translation {
  [key: string]: string;
}

const translations: { [lang: string]: Translation } = {
  en: {
    // Navbar
    'app.title': 'Dome',
    'welcome': 'Welcome,',
    'logout': 'Logout',

    // Login
    'login.title': 'Login',
    'email.placeholder': 'Email',
    'password.placeholder': 'Password',
    'invalid.credentials': 'Invalid credentials',
    'no.account': 'No account?',
    'register.link': 'Register',

    // Register
    'register.title': 'Register',
    'username.placeholder': 'Username',
    'registration.failed': 'Registration failed',
    'have.account': 'Have account?',
    'login.link': 'Login',

    // Sidebar
    'workspaces.title': 'Workspaces',
    'new.workspace': '+ New Workspace',
    'workspace.name.placeholder': 'Workspace name',
    'create': 'Create',
    'cancel': 'Cancel',
    'confirm.delete.title': 'Confirm Delete',
    'confirm.delete.workspace': 'Are you sure you want to delete this workspace? This action cannot be undone and will permanently delete all associated boards, lists, and cards.',
    'delete': 'Delete',

    // Boards
    'boards.title': 'Boards',
    'new.board': '+ New Board',
    'board.name.placeholder': 'Board name',

    // KanbanBoard
    'add.list': '+ Add List',
    'list.name': '{listName}', // Dynamic, handled in component
    'add.card': '+ Add Card',
    'new.list.title': 'New List',
    'new.card.title': 'New Card',
    'card.name.placeholder': 'Card name',
    'description.placeholder': 'Description (optional)',
    'confirm.delete.list.title': 'Confirm Delete List',
    'confirm.delete.list': 'Are you sure you want to delete this list? All cards in it will be permanently deleted.',
    'confirm.delete.card.title': 'Confirm Delete Card',
    'confirm.delete.card': 'Are you sure you want to delete the card "{cardName}"? This action cannot be undone.',
    'select.workspace': 'Select a workspace from the sidebar to get started.',

    // Footer
    'language.english': 'English',
    'language.turkish': 'Türkçe',
    'footer.message': 'Made with love for my amazing wife ❤️', // Keep in English
  },
  tr: {
    // Navbar
    'app.title': 'Dome',
    'welcome': 'Hoş geldin,',
    'logout': 'Çıkış Yap',

    // Login
    'login.title': 'Giriş',
    'email.placeholder': 'E-posta',
    'password.placeholder': 'Şifre',
    'invalid.credentials': 'Geçersiz kimlik bilgileri',
    'no.account': 'Hesabın yok mu?',
    'register.link': 'Kayıt Ol',

    // Register
    'register.title': 'Kayıt Ol',
    'username.placeholder': 'Kullanıcı Adı',
    'registration.failed': 'Kayıt başarısız',
    'have.account': 'Hesabın var mı?',
    'login.link': 'Giriş Yap',

    // Sidebar
    'workspaces.title': 'Çalışma Alanları',
    'new.workspace': '+ Yeni Çalışma Alanı',
    'workspace.name.placeholder': 'Çalışma alanı adı',
    'create': 'Oluştur',
    'cancel': 'İptal',
    'confirm.delete.title': 'Silme Onayla',
    'confirm.delete.workspace': 'Bu çalışma alanını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm ilişkili tablolar, listeler ve kartlar kalıcı olarak silinecektir.',
    'delete': 'Sil',

    // Boards
    'boards.title': 'Tablolar',
    'new.board': '+ Yeni Tablo',
    'board.name.placeholder': 'Tablo adı',

    // KanbanBoard
    'add.list': '+ Liste Ekle',
    'list.name': '{listName}', // Dynamic, handled in component
    'add.card': '+ Kart Ekle',
    'new.list.title': 'Yeni Liste',
    'new.card.title': 'Yeni Kart',
    'card.name.placeholder': 'Kart adı',
    'description.placeholder': 'Açıklama (isteğe bağlı)',
    'confirm.delete.list.title': 'Liste Silmeyi Onayla',
    'confirm.delete.list': 'Bu listeyi silmek istediğinizden emin misiniz? İçindeki tüm kartlar kalıcı olarak silinecektir.',
    'confirm.delete.card.title': 'Kart Silmeyi Onayla',
    'confirm.delete.card': 'Kartı "{cardName}" silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
    'select.workspace': 'Başlamak için kenar çubuğundan bir çalışma alanı seçin.',

    // Footer
    'language.english': 'İngilizce',
    'language.turkish': 'Türkçe',
    'footer.message': 'Muhteşem karım için sevgiyle yapıldı ❤️',
  },
};

interface LanguageContextType {
  lang: 'en' | 'tr';
  setLang: (lang: 'en' | 'tr') => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<'en' | 'tr'>('en');

  const t = (key: string, params?: Record<string, string>): string => {
    let translation = translations[lang][key] || key;
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        translation = translation.replace(`{${paramKey}}`, params[paramKey]);
      });
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
