import React, { createContext, useContext, useState, useCallback } from 'react';

const LanguageContext = createContext();

const translations = {
  ka: {
    home: 'მთავარი',
    tours: 'ტურები',
    transfers: 'ტრანსფერები',
    contact: 'კონტაქტი',
    driverPanel: 'მძღოლის პანელი',
    adminPanel: 'ადმინ პანელი',
    signOut: 'გასვლა',
    signIn: 'შესვლა',
    
    heroTitle: 'ტრანსფერები და ტურები საქართველოში',
    heroSubtitle: 'ადგილობრივი მძღოლები, საუკეთესო ფასები',
    startLocation: 'საიდან',
    endLocation: 'სად',
    addStop: 'გაჩერების დამატება',
    date: 'თარიღი',
    time: 'დრო',
    searchCars: 'მანქანის მოძებნა',
    
    noFees: 'ფარული გადასახადების გარეშე',
    freeCancel: 'უფასო გაუქმება',
    englishDrivers: 'ინგლისურენოვანი მძღოლები',
    unlimitedStops: 'ულიმიტო გაჩერებები',
    verifiedDrivers: 'ვერიფიცირებული მძღოლები',
    support247: '24/7 მხარდაჭერა',
    noFeesDesc: 'გამჭვირვალე ფასები ფარული გადასახადების გარეშე.',
    freeCancelDesc: 'მოქნილი ჯავშნები უფასო გაუქმებით 24 საათით ადრე.',
    englishDriversDesc: 'კომუნიკაცია მარტივია ინგლისურენოვან მძღოლებთან.',
    verifiedDriversDesc: 'ყველა მძღოლი შემოწმებულია უსაფრთხოებისა და პროფესიონალიზმისთვის.',
    support247Desc: 'ჩვენ მზად ვართ დაგეხმაროთ ნებისმიერ დროს საქართველოში.',
    
    howItWorks: 'როგორ მუშაობს?',
    step1: 'აირჩიეთ მარშრუტი',
    step2: 'ჩვენ დავითვლით მანძილს',
    step3: 'აირჩიეთ მძღოლი',
    step4: 'დატოვეთ საკონტაქტო ინფორმაცია',
    step5: 'მძღოლი დაადასტურებს',
    step6: 'ისიამოვნეთ მგზავრობით',
    
    popularDestinations: 'პოპულარული მიმართულებები',
    bookNow: 'დაჯავშნა',
    readMore: 'ვრცლად',
    
    benefitsTitle: 'ჩვენი უპირატესობები',
    benefit1: 'ზუსტი ფასი წინასწარ',
    benefit2: 'სანდო ვერიფიცირებული მძღოლები',
    benefit3: 'უფასო ლოდინის დრო',
    benefit4: 'გაჩერებები დამატებითი საფასურის გარეშე',
    
    followUs: 'გამოგვყევით ინსტაგრამზე',
    planTrip: 'დაგეგმე შენი მოგზაურობა',
    readyToExplore: 'მზად ხართ საქართველოს დასათვალიერებლად?',
    
    firstName: 'სახელი',
    phone: 'ტელეფონი',
    email: 'ელ. ფოსტა',
    comment: 'კომენტარი',
    availableCars: 'ხელმისაწვდომი მანქანები',
    seats: 'ადგილი',
  },
  en: {
    home: 'Home',
    tours: 'Tours',
    transfers: 'Transfers',
    contact: 'Contact',
    driverPanel: 'Driver Panel',
    adminPanel: 'Admin Panel',
    signOut: 'Sign Out',
    signIn: 'Sign In',
    
    heroTitle: 'Transfers and tours around Georgia',
    heroSubtitle: 'From private drivers at the best prices',
    startLocation: 'Pick-up',
    endLocation: 'Drop-off',
    addStop: 'Add stop',
    date: 'Date',
    time: 'Time',
    searchCars: 'Find car',
    
    noFees: 'No hidden fees',
    freeCancel: 'Free cancellation',
    englishDrivers: 'English-speaking drivers',
    unlimitedStops: 'Unlimited stops',
    verifiedDrivers: 'Verified Drivers',
    support247: '24/7 Support',
    noFeesDesc: 'Transparent pricing with no hidden charges or surprises.',
    freeCancelDesc: 'Flexible bookings with free cancellation up to 24 hours.',
    englishDriversDesc: 'Communication is easy with our English-speaking drivers.',
    verifiedDriversDesc: 'Every driver is vetted for safety and professionalism.',
    support247Desc: 'We are here to help you anytime, anywhere in Georgia.',
    
    howItWorks: 'How it works?',
    step1: 'Choose your route',
    step2: 'We calculate distance',
    step3: 'Choose your driver',
    step4: 'Leave contact info',
    step5: 'Driver confirms',
    step6: 'Enjoy your ride',
    
    popularDestinations: 'Popular Destinations',
    bookNow: 'Book now',
    readMore: 'Read more',
    
    benefitsTitle: 'Our Benefits',
    benefit1: 'Accurate price upfront',
    benefit2: 'Reliable verified drivers',
    benefit3: 'Free waiting time',
    benefit4: 'Stops without extra fees',
    
    followUs: 'Follow us on Instagram',
    planTrip: 'Plan your trip',
    readyToExplore: 'Ready to explore Georgia?',
    
    firstName: 'First Name',
    phone: 'Phone',
    email: 'Email',
    comment: 'Comment',
    availableCars: 'Available Cars',
    seats: 'Seats',
  },
  ru: {
    home: 'Главная',
    tours: 'Туры',
    transfers: 'Трансферы',
    contact: 'Контакты',
    driverPanel: 'Кабинет водителя',
    adminPanel: 'Админ панель',
    signOut: 'Выйти',
    signIn: 'Войти',
    
    heroTitle: 'Трансферы и туры по Грузии',
    heroSubtitle: 'От частных водителей по лучшим ценам',
    startLocation: 'Откуда',
    endLocation: 'Куда',
    addStop: 'Добавить остановку',
    date: 'Дата',
    time: 'Время',
    searchCars: 'Найти машину',
    
    noFees: 'Без скрытых комиссий',
    freeCancel: 'Бесплатная отмена',
    englishDrivers: 'Англоговорящие водители',
    unlimitedStops: 'Неограниченные остановки',
    verifiedDrivers: 'Проверенные водители',
    support247: 'Поддержка 24/7',
    noFeesDesc: 'Прозрачные цены без скрытых платежей.',
    freeCancelDesc: 'Гибкие бронирования с бесплатной отменой за 24 часа.',
    englishDriversDesc: 'Легко общайтесь с нашими англоговорящими водителями.',
    verifiedDriversDesc: 'Каждый водитель проверен на безопасность и профессионализм.',
    support247Desc: 'Мы готовы помочь вам в любое время в Грузии.',
    
    howItWorks: 'Как это работает?',
    step1: 'Выберите маршрут',
    step2: 'Мы рассчитаем расстояние',
    step3: 'Выберите водителя',
    step4: 'Оставьте контакты',
    step5: 'Водитель подтвердит',
    step6: 'Наслаждайтесь поездкой',
    
    popularDestinations: 'Популярные направления',
    bookNow: 'Забронировать',
    readMore: 'Подробнее',
    
    benefitsTitle: 'Наши преимущества',
    benefit1: 'Точная цена заранее',
    benefit2: 'Надежные водители',
    benefit3: 'Бесплатное ожидание',
    benefit4: 'Остановки без доплат',
    
    followUs: 'Подписывайтесь на Instagram',
    planTrip: 'Спланировать поездку',
    readyToExplore: 'Готовы исследовать Грузию?',
    
    firstName: 'Имя',
    phone: 'Телефон',
    email: 'Email',
    comment: 'Комментарий',
    availableCars: 'Доступные автомобили',
    seats: 'Мест',
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    try { return localStorage.getItem('georgiantrip-lang') || 'en'; } catch { return 'en'; }
  });
  
  const t = useCallback((key) => {
    return translations[currentLanguage]?.[key] || translations['en']?.[key] || key;
  }, [currentLanguage]);
  
  const changeLanguage = useCallback((lang) => {
    setCurrentLanguage(lang);
    try { localStorage.setItem('georgiantrip-lang', lang); } catch {}
  }, []);
  
  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t }}>
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