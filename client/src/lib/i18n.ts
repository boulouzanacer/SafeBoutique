import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Header
      "search.placeholder": "Search...",
      "header.signIn": "Sign In",
      "header.signUp": "Sign Up",
      "header.signOut": "Sign Out",
      "header.admin": "Admin Panel",
      
      // Navigation
      "nav.home": "Home",
      "nav.products": "Products",
      "nav.about": "About Us",
      "nav.contact": "Contact",
      "nav.cart": "Cart",
      
      // Common
      "common.loading": "Loading...",
      "common.error": "Error",
      "common.success": "Success",
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.delete": "Delete",
      "common.edit": "Edit",
      "common.add": "Add",
      "common.view": "View",
      "common.back": "Back",
      "common.next": "Next",
      "common.previous": "Previous",
      "common.close": "Close",
      "common.confirm": "Confirm",
      "common.yes": "Yes",
      "common.no": "No",
      
      // Auth
      "auth.signIn": "Sign In",
      "auth.signUp": "Sign Up",
      "auth.signOut": "Sign Out",
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.confirmPassword": "Confirm Password",
      "auth.firstName": "First Name",
      "auth.lastName": "Last Name",
      "auth.welcome": "Welcome back!",
      "auth.welcomeNew": "Welcome to SafeSoft!",
      "auth.signInSuccess": "You have successfully signed in.",
      "auth.signUpSuccess": "Account created successfully!",
      "auth.signOutSuccess": "You have been successfully signed out.",
      "auth.invalidCredentials": "Invalid email or password",
      "auth.emailRequired": "Email is required",
      "auth.passwordRequired": "Password is required",
      "auth.backToHome": "Back to Home",
      "auth.signInDescription": "Welcome back! Please sign in to your account",
      "auth.signUpDescription": "Create your account to get started",
      "auth.alreadyAccount": "Already have an account?",
      "auth.noAccount": "Don't have an account?",
      
      // Products
      "product.price": "Price",
      "product.inStock": "In Stock",
      "product.outOfStock": "Out of Stock",
      "product.addToCart": "Add to Cart",
      "product.viewDetails": "View Details",
      "product.description": "Description",
      "product.specifications": "Specifications",
      "product.reviews": "Reviews",
      "product.rating": "Rating",
      "product.noReviews": "No reviews yet",
      "product.writeReview": "Write a Review",
      
      // Cart
      "cart.title": "Shopping Cart",
      "cart.empty": "Your cart is empty",
      "cart.total": "Total",
      "cart.subtotal": "Subtotal",
      "cart.checkout": "Checkout",
      "cart.continueShopping": "Continue Shopping",
      "cart.removeItem": "Remove Item",
      "cart.quantity": "Quantity",
      
      // Footer
      "footer.brand": "SafeSoft Boutique",
      "footer.description": "Your premier destination for professional software solutions and premium products. We specialize in delivering quality and elegance in every purchase.",
      "footer.quickLinks": "Quick Links",
      "footer.customerService": "Customer Service",
      "footer.support": "Support",
      "footer.shipping": "Shipping Info",
      "footer.returns": "Returns",
      "footer.privacy": "Privacy Policy",
      "footer.terms": "Terms of Service",
      "footer.copyright": "© 2025 SafeSoft Boutique. All rights reserved.",
      
      // Admin
      "admin.title": "SafeSoft Admin Panel",
      "admin.dashboard": "Dashboard",
      "admin.products": "Products",
      "admin.orders": "Orders",
      "admin.customers": "Customers",
      "admin.settings": "Settings",
      "admin.backToStore": "Back to Store",
      "admin.totalProducts": "Total Products",
      "admin.totalOrders": "Total Orders",
      "admin.totalCustomers": "Total Customers",
      "admin.totalRevenue": "Total Revenue",
      
      // Language selector
      "language.select": "Language",
      "language.english": "English",
      "language.french": "Français",
      "language.arabic": "العربية"
    }
  },
  fr: {
    translation: {
      // Header
      "search.placeholder": "Rechercher...",
      "header.signIn": "Se connecter",
      "header.signUp": "S'inscrire",
      "header.signOut": "Se déconnecter",
      "header.admin": "Panneau Admin",
      
      // Navigation
      "nav.home": "Accueil",
      "nav.products": "Produits",
      "nav.about": "À propos",
      "nav.contact": "Contact",
      "nav.cart": "Panier",
      
      // Common
      "common.loading": "Chargement...",
      "common.error": "Erreur",
      "common.success": "Succès",
      "common.save": "Enregistrer",
      "common.cancel": "Annuler",
      "common.delete": "Supprimer",
      "common.edit": "Modifier",
      "common.add": "Ajouter",
      "common.view": "Voir",
      "common.back": "Retour",
      "common.next": "Suivant",
      "common.previous": "Précédent",
      "common.close": "Fermer",
      "common.confirm": "Confirmer",
      "common.yes": "Oui",
      "common.no": "Non",
      
      // Auth
      "auth.signIn": "Se connecter",
      "auth.signUp": "S'inscrire",
      "auth.signOut": "Se déconnecter",
      "auth.email": "Email",
      "auth.password": "Mot de passe",
      "auth.confirmPassword": "Confirmer le mot de passe",
      "auth.firstName": "Prénom",
      "auth.lastName": "Nom",
      "auth.welcome": "Content de vous revoir!",
      "auth.welcomeNew": "Bienvenue chez SafeSoft!",
      "auth.signInSuccess": "Vous vous êtes connecté avec succès.",
      "auth.signUpSuccess": "Compte créé avec succès!",
      "auth.signOutSuccess": "Vous avez été déconnecté avec succès.",
      "auth.invalidCredentials": "Email ou mot de passe invalide",
      "auth.emailRequired": "L'email est requis",
      "auth.passwordRequired": "Le mot de passe est requis",
      "auth.backToHome": "Retour à l'accueil",
      "auth.signInDescription": "Content de vous revoir! Veuillez vous connecter à votre compte",
      "auth.signUpDescription": "Créez votre compte pour commencer",
      "auth.alreadyAccount": "Vous avez déjà un compte?",
      "auth.noAccount": "Vous n'avez pas de compte?",
      
      // Products
      "product.price": "Prix",
      "product.inStock": "En stock",
      "product.outOfStock": "Rupture de stock",
      "product.addToCart": "Ajouter au panier",
      "product.viewDetails": "Voir les détails",
      "product.description": "Description",
      "product.specifications": "Spécifications",
      "product.reviews": "Avis",
      "product.rating": "Note",
      "product.noReviews": "Aucun avis pour le moment",
      "product.writeReview": "Écrire un avis",
      
      // Cart
      "cart.title": "Panier d'achat",
      "cart.empty": "Votre panier est vide",
      "cart.total": "Total",
      "cart.subtotal": "Sous-total",
      "cart.checkout": "Commander",
      "cart.continueShopping": "Continuer les achats",
      "cart.removeItem": "Supprimer l'article",
      "cart.quantity": "Quantité",
      
      // Footer
      "footer.brand": "SafeSoft Boutique",
      "footer.description": "Votre destination de choix pour des solutions logicielles professionnelles et des produits premium. Nous nous spécialisons dans la livraison de qualité et d'élégance à chaque achat.",
      "footer.quickLinks": "Liens rapides",
      "footer.customerService": "Service client",
      "footer.support": "Support",
      "footer.shipping": "Info livraison",
      "footer.returns": "Retours",
      "footer.privacy": "Politique de confidentialité",
      "footer.terms": "Conditions de service",
      "footer.copyright": "© 2025 SafeSoft Boutique. Tous droits réservés.",
      
      // Admin
      "admin.title": "Panneau d'administration SafeSoft",
      "admin.dashboard": "Tableau de bord",
      "admin.products": "Produits",
      "admin.orders": "Commandes",
      "admin.customers": "Clients",
      "admin.settings": "Paramètres",
      "admin.backToStore": "Retour à la boutique",
      "admin.totalProducts": "Total des produits",
      "admin.totalOrders": "Total des commandes",
      "admin.totalCustomers": "Total des clients",
      "admin.totalRevenue": "Chiffre d'affaires total",
      
      // Language selector
      "language.select": "Langue",
      "language.english": "English",
      "language.french": "Français",
      "language.arabic": "العربية"
    }
  },
  ar: {
    translation: {
      // Header
      "search.placeholder": "بحث...",
      "header.signIn": "تسجيل الدخول",
      "header.signUp": "إنشاء حساب",
      "header.signOut": "تسجيل الخروج",
      "header.admin": "لوحة الإدارة",
      
      // Navigation
      "nav.home": "الرئيسية",
      "nav.products": "المنتجات",
      "nav.about": "من نحن",
      "nav.contact": "اتصل بنا",
      "nav.cart": "السلة",
      
      // Common
      "common.loading": "جارِ التحميل...",
      "common.error": "خطأ",
      "common.success": "نجح",
      "common.save": "حفظ",
      "common.cancel": "إلغاء",
      "common.delete": "حذف",
      "common.edit": "تعديل",
      "common.add": "إضافة",
      "common.view": "عرض",
      "common.back": "رجوع",
      "common.next": "التالي",
      "common.previous": "السابق",
      "common.close": "إغلاق",
      "common.confirm": "تأكيد",
      "common.yes": "نعم",
      "common.no": "لا",
      
      // Auth
      "auth.signIn": "تسجيل الدخول",
      "auth.signUp": "إنشاء حساب",
      "auth.signOut": "تسجيل الخروج",
      "auth.email": "البريد الإلكتروني",
      "auth.password": "كلمة المرور",
      "auth.confirmPassword": "تأكيد كلمة المرور",
      "auth.firstName": "الاسم الأول",
      "auth.lastName": "اسم العائلة",
      "auth.welcome": "أهلاً بعودتك!",
      "auth.welcomeNew": "مرحباً بك في SafeSoft!",
      "auth.signInSuccess": "تم تسجيل الدخول بنجاح.",
      "auth.signUpSuccess": "تم إنشاء الحساب بنجاح!",
      "auth.signOutSuccess": "تم تسجيل الخروج بنجاح.",
      "auth.invalidCredentials": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      "auth.emailRequired": "البريد الإلكتروني مطلوب",
      "auth.passwordRequired": "كلمة المرور مطلوبة",
      "auth.backToHome": "العودة للرئيسية",
      "auth.signInDescription": "أهلاً بعودتك! يرجى تسجيل الدخول إلى حسابك",
      "auth.signUpDescription": "أنشئ حسابك للبدء",
      "auth.alreadyAccount": "لديك حساب بالفعل؟",
      "auth.noAccount": "ليس لديك حساب؟",
      
      // Products
      "product.price": "السعر",
      "product.inStock": "متوفر",
      "product.outOfStock": "نفد المخزون",
      "product.addToCart": "أضف للسلة",
      "product.viewDetails": "عرض التفاصيل",
      "product.description": "الوصف",
      "product.specifications": "المواصفات",
      "product.reviews": "التقييمات",
      "product.rating": "التقييم",
      "product.noReviews": "لا توجد تقييمات بعد",
      "product.writeReview": "اكتب تقييماً",
      
      // Cart
      "cart.title": "سلة التسوق",
      "cart.empty": "سلتك فارغة",
      "cart.total": "المجموع",
      "cart.subtotal": "المجموع الفرعي",
      "cart.checkout": "الدفع",
      "cart.continueShopping": "متابعة التسوق",
      "cart.removeItem": "إزالة العنصر",
      "cart.quantity": "الكمية",
      
      // Footer
      "footer.brand": "متجر SafeSoft",
      "footer.description": "وجهتك المفضلة للحلول البرمجية المهنية والمنتجات المميزة. نحن متخصصون في تقديم الجودة والأناقة في كل عملية شراء.",
      "footer.quickLinks": "روابط سريعة",
      "footer.customerService": "خدمة العملاء",
      "footer.support": "الدعم",
      "footer.shipping": "معلومات الشحن",
      "footer.returns": "الإرجاع",
      "footer.privacy": "سياسة الخصوصية",
      "footer.terms": "شروط الخدمة",
      "footer.copyright": "© 2025 متجر SafeSoft. جميع الحقوق محفوظة.",
      
      // Admin
      "admin.title": "لوحة إدارة SafeSoft",
      "admin.dashboard": "لوحة القيادة",
      "admin.products": "المنتجات",
      "admin.orders": "الطلبات",
      "admin.customers": "العملاء",
      "admin.settings": "الإعدادات",
      "admin.backToStore": "العودة للمتجر",
      "admin.totalProducts": "إجمالي المنتجات",
      "admin.totalOrders": "إجمالي الطلبات",
      "admin.totalCustomers": "إجمالي العملاء",
      "admin.totalRevenue": "إجمالي الإيرادات",
      
      // Language selector
      "language.select": "اللغة",
      "language.english": "English",
      "language.french": "Français",
      "language.arabic": "العربية"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en', // Default to stored language or English
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

// Set initial document direction and lang
const currentLang = localStorage.getItem('language') || 'en';
if (currentLang === 'ar') {
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = 'ar';
} else {
  document.documentElement.dir = 'ltr';
  document.documentElement.lang = currentLang;
}

export default i18n;