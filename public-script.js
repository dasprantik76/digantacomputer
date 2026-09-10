/**
 * Academy by PixelSetu - Public Website, Student Registration & Certificate Logic
 * Custom dropdowns opening directly below dropdown boxes
 * Real-time Title Case Capitalization & 10-Digit Mobile Number Validation
 * Student Certificate Verification by Mobile Number & Date of Birth
 */

const PUBLIC_SITE_CONFIG = window.PUBLIC_SITE_CONFIG || {};
const PUBLIC_API_BASE_URL = String(PUBLIC_SITE_CONFIG.apiBaseUrl || '').replace(/\/$/, '');
const getPublicApiUrl = (query = '') => `${PUBLIC_API_BASE_URL}/api/data${query}`;
const getImageKitAuthUrl = () => `${PUBLIC_API_BASE_URL}/api/imagekit-auth`;
const getPinCodeLookupUrl = pinCode => `${PUBLIC_API_BASE_URL}/api/pincode?pincode=${encodeURIComponent(pinCode)}`;
const getEmailValidationUrl = email => `${PUBLIC_API_BASE_URL}/api/validate-email?email=${encodeURIComponent(email)}`;
const MAX_STUDENT_PHOTO_BYTES = 2 * 1024 * 1024;
const TARGET_STUDENT_PHOTO_BYTES = 50 * 1024;
const ALLOWED_STUDENT_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const STORAGE_KEYS = {
  COURSES: 'educore_academy_courses',
  STUDENTS: 'educore_academy_students',
  AUTH_TOKEN: 'educore_academy_auth_token',
  ACADEMY_PROFILE: 'pixelsetu_academy_profile'
};

const DEFAULT_PUBLIC_COURSES = [
  { id: 'CRS-101', title: 'Diploma in Computer Applications (DCA)', duration: '6 Months', description: 'Comprehensive fundamentals of computer operations, MS Office suite, Internet basics, and database concepts.' },
  { id: 'CRS-102', title: 'Full Stack Web Development', duration: '1 Year', description: 'Modern front-end and back-end web development with HTML5, CSS3, JavaScript, Node.js, and databases.' },
  { id: 'CRS-103', title: 'Post Graduate Diploma in Computer Applications (PGDCA)', duration: '1 Year', description: 'Advanced programming concepts, system architecture, database administration, and project implementation.' },
  { id: 'CRS-104', title: 'Certificate in Office Automation', duration: '3 Months', description: 'Practical training in Word, Excel, PowerPoint, email, document formatting, and everyday office productivity.' },
  { id: 'CRS-105', title: 'Tally Prime with GST', duration: '4 Months', description: 'Learn computerized accounting, inventory management, GST invoicing, taxation reports, and payroll using Tally Prime.' },
  { id: 'CRS-106', title: 'Graphic Design Fundamentals', duration: '6 Months', description: 'Build creative design skills through typography, image editing, branding, social media graphics, and print layouts.' }
];
const PUBLIC_COURSE_SEED_VERSION = '2';

const INDIAN_STATES_DISTRICTS = {
  "Andhra Pradesh": ["Alluri Sitharama Raju", "Anakapalli", "Ananthapuramu", "Annamayya", "Bapatla", "Chittoor", "Dr. B.R. Ambedkar Konaseema", "East Godavari", "Eluru", "Guntur", "Kakinada", "Krishna", "Kurnool", "Nandyal", "NTR", "Palnadu", "Parvathipuram Manyam", "Prakasam", "Sri Potti Sriramulu Nellore", "Sri Sathya Sai", "Srikakulam", "Tirupati", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
  "Arunachal Pradesh": ["Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kamle", "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit", "Longding", "Lower Dibang Valley", "Lower Siang", "Lower Subansiri", "Namsai", "Pakke Kessang", "Papum Pare", "Shi Yomi", "Siang", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang", "Itanagar"],
  "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tamulpur", "Tinsukia", "Udalguri", "West Karbi Anglong", "Bajali"],
  "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran (Motihari)", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur (Bhabua)", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda (Bihar Sharif)", "Nawada", "Patna", "Purnia", "Rohtas (Sasaram)", "Saharsa", "Samastipur", "Saran (Chhapra)", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali (Hajipur)", "West Champaran (Bettiah)"],
  "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar (Jagdalpur)", "Bemetara", "Bijapur", "Bilaspur", "Dantewada (South Bastar)", "Dhamtari", "Durg", "Gariaband", "Gaurela-Pendra-Marwahi", "Janjgir-Champa", "Jashpur", "Kabirdham (Kawardha)", "Kanker (North Bastar)", "Khairagarh-Chhuikhadan-Gandai", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Manendragarh-Chirmiri-Bharatpur", "Mohla-Manpur-Ambagarh Chouki", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sakti", "Sarangarh-Bilaigarh", "Sukma", "Surajpur", "Surguja (Ambikapur)"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha (Palanpur)", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda (Nadiad)", "Kutch (Bhuj)", "Mahisagar", "Mehsana", "Morbi", "Narmada (Rajpipla)", "Navsari", "Panchmahal (Godhra)", "Patan", "Porbandar", "Rajkot", "Sabarkantha (Himmatnagar)", "Surat", "Surendranagar", "Tapi (Vyara)", "Vadodara", "Valsad"],
  "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra (Dharamshala)", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur (Nahan)", "Solan", "Una"],
  "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum (Jamshedpur)", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu (Medininagar)", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum (Chaibasa)"],
  "Karnataka": ["Bagalkote", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapura", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada (Mangaluru)", "Davangere", "Dharwad (Hubballi)", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu (Madikeri)", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada (Karwar)", "Vijayapura", "Yadgir", "Vijayanagara"],
  "Kerala": ["Alappuzha", "Ernakulam (Kochi)", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
  "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Maihar", "Mandla", "Mandsaur", "Morena", "Mauganj", "Narmadapuram", "Narsinghpur", "Neemuch", "Niwari", "Panna", "Pandhurna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad (Chhatrapati Sambhaji Nagar)", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad (Dharashiv)", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
  "Meghalaya": ["Eastern West Khasi Hills", "East Garo Hills", "East Jaintia Hills", "East Khasi Hills (Shillong)", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills (Tura)", "West Jaintia Hills (Jowai)", "West Khasi Hills"],
  "Mizoram": ["Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Saitual", "Serchhip"],
  "Nagaland": ["Chumoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Niuland", "Noklak", "Peren", "Phek", "Shamator", "Tseminyu", "Tuensang", "Wokha", "Zunheboto"],
  "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Debagarh", "Dhenkanal", "Gajapati", "Ganjam (Berhampur)", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar (Keonjhar)", "Khurda (Bhubaneswar)", "Koraput", "Malkangiri", "Mayurbhanj (Baripada)", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur (Sonepur)", "Sundargarh (Rourkela)"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Malerkotla", "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar (Mohali)", "Sangrur", "Shahid Bhagat Singh Nagar (Nawanshahr)", "Tarn Taran"],
  "Rajasthan": ["Ajmer", "Alwar", "Anupgarh", "Balotra", "Banswara", "Baran", "Barmer", "Beawar", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Deeg", "Didwana-Kuchaman", "Dholpur", "Dudu", "Dungarpur", "Ganganagar", "Gangapur City", "Hanumangarh", "Jaipur", "Jaipur Rural", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Jodhpur Rural", "Karauli", "Kekri", "Khairthal-Tijara", "Kota", "Kotputli-Behror", "Nagaur", "Neem Ka Thana", "Pali", "Phalodi", "Pratapgarh", "Rajsamand", "Salumbar", "Sanchore", "Sawai Madhopur", "Shahpura", "Sikar", "Sirohi", "Tonk", "Udaipur"],
  "Sikkim": ["Gangtok", "Gyalshing", "Pakyong", "Mangan", "Namchi", "Soreng"],
  "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari (Nagercoil)", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris (Ooty)", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupattur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
  "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hanumakonda", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Kumuram Bheem Asifabad", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"],
  "Tripura": ["Dhalai (Ambassa)", "Gomati (Udaipur)", "Khowai", "North Tripura (Dharmanagar)", "Sepahijala (Bishramganj)", "South Tripura (Belonia)", "Unakoti (Kailashahar)", "West Tripura (Agartala)"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar (Noida)", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kushinagar", "Lakhimpur Kheri", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
  "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar (Rudrapur)", "Uttarkashi"],
  "West Bengal": ["Alipurduar", "Bankura", "Birbhum (Suri)", "Cooch Behar", "Dakshin Dinajpur (Balurghat)", "Darjeeling", "Hooghly (Chinsurah)", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda (English Bazar)", "Murshidabad (Baharampur)", "Nadia (Krishnanagar)", "North 24 Parganas (Barasat)", "Paschim Bardhaman (Asansol)", "Paschim Medinipur (Midnapore)", "Purba Bardhaman (Bardhaman)", "Purba Medinipur (Tamluk)", "Purulia", "South 24 Parganas (Alipore)", "Uttar Dinajpur (Raiganj)"],
  "Andaman and Nicobar Islands": ["Nicobar", "North and Middle Andaman", "South Andaman"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
  "Jammu and Kashmir": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
  "Ladakh": ["Kargil", "Leh"],
  "Lakshadweep": ["Lakshadweep (Kavaratti)"],
  "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"]
};

class PublicAcademyApp {
  constructor() {
    this.currentView = 'home';
    this.courses = [];
    this.academyProfile = null;

    // Resolve tenant from Subdomain (e.g. prantik.prantikphotography.com) or URL Query (?academy=prantik)
    this.currentAcademySlug = this.resolveTenant();
    this.currentOwnerEmail = this.currentAcademySlug.includes('poulami') ? 'poulami.13thmay@gmail.com' : 'dasprantik76@gmail.com';

    this.cacheDOMElements();
    this.initData();
    this.bindEvents();
    this.initCustomDropdowns();
    this.initInputFormatters();
    this.render();
    this.updateAdminLoginLinks();
    this.initHeroCarousel();

    // Asynchronously synchronize courses and profile for this specific academy from MongoDB
    this.fetchCloudData();

    // Check initial hash
    const hash = window.location.hash.replace('#', '');
    if (hash === 'courses') {
      this.switchView('courses');
    } else if (hash === 'student' || hash === 'registration') {
      this.switchView('student');
    } else if (hash === 'certificate') {
      this.switchView('certificate');
    } else if (hash === 'about') {
      this.switchView('about');
    } else {
      this.switchView('home');
    }
  }

  initHeroCarousel() {
    const slides = document.querySelectorAll('.hero-chevron-slide, .hero-svg-slide, .hero-carousel-slide');
    if (!slides || slides.length < 2) return;

    if (this._heroCarouselTimer) {
      clearInterval(this._heroCarouselTimer);
    }

    let currentIndex = 0;
    this._heroCarouselTimer = setInterval(() => {
      slides[currentIndex].classList.remove('active');
      currentIndex = (currentIndex + 1) % slides.length;
      slides[currentIndex].classList.add('active');
    }, 4000);
  }

  resolveTenant() {
    if (PUBLIC_SITE_CONFIG.academySlug) {
      return String(PUBLIC_SITE_CONFIG.academySlug).toLowerCase().trim();
    }

    const hostname = window.location.hostname.toLowerCase();

    // If accessing academy.XXXX directly on root, route to Admin Gateway
    if (hostname.startsWith('academy.')) {
      window.location.href = PUBLIC_SITE_CONFIG.adminPortalUrl || '#';
      return 'prantik';
    }

    // 1. Check Subdomain (e.g. prantik.prantikphotography.com or poulami.prantikphotography.com)
    const parts = hostname.split('.');
    if (parts.length >= 3 || (parts.length === 2 && parts[1] === 'localhost')) {
      const subdomain = parts[0];
      if (subdomain !== 'www' && subdomain !== 'academy' && subdomain !== 'app') {
        return subdomain;
      }
    }

    // 2. Check Query Parameters (?academy=prantik or ?academy=poulami)
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('academy') || urlParams.get('owner');
    if (queryParam) {
      return queryParam.toLowerCase().trim();
    }

    return 'prantik'; // Default fallback
  }

  updateAdminLoginLinks() {
    const hostname = window.location.hostname.toLowerCase();
    const parts = hostname.split('.');
    let adminUrl = PUBLIC_SITE_CONFIG.adminPortalUrl || '#';

    if (!PUBLIC_SITE_CONFIG.adminPortalUrl && parts.length >= 2 && !hostname.includes('localhost') && !hostname.endsWith('.vercel.app')) {
      const rootDomain = parts.slice(-2).join('.');
      adminUrl = `https://academy.${rootDomain}`;
    }

    const btnNav = document.getElementById('btnNavAdminLogin');
    if (btnNav) btnNav.href = adminUrl;
    const navMobile = document.getElementById('navMobileAdminLogin');
    if (navMobile) navMobile.href = adminUrl;
  }

  getStorageKey(baseKey) {
    return `${baseKey}_${this.currentOwnerEmail}`;
  }

  getDefaultProfile() {
    if (this.currentOwnerEmail.includes('poulami')) {
      return {
        academyName: 'Poulami Dance Academy',
        ownerName: 'Poulami',
        email: this.currentOwnerEmail,
        phone: '9876543211',
        slug: 'poulami'
      };
    }
    return {
      academyName: 'Diganta Computer Centre',
      ownerName: 'Prantik Das',
      email: 'swarupkhan1@gmail.com',
      phone: '9733894742',
      secondaryPhone: '9733894742',
      whatsapp: '9733894742',
      slug: 'prantik'
    };
  }

  cacheDOMElements() {
    // Brand & Titles
    this.navAcademyName = document.getElementById('navAcademyName');
    this.heroAcademyName = document.getElementById('heroAcademyName');
    this.footerAcademyName = document.getElementById('footerAcademyName');
    this.footerCopyrightName = document.getElementById('footerCopyrightName');
    this.footerPhoneLink = document.getElementById('footerPhoneLink');
    this.footerEmailLink = document.getElementById('footerEmailLink');
    this.footerAddress = document.getElementById('footerAddress');
    this.heroTaglineText = document.getElementById('heroTaglineText');
    this.heroDescText = document.getElementById('heroDescText');

    // Top Notice Bar
    this.topNoticeBar = document.getElementById('topNoticeBar');
    this.noticeLink1 = document.getElementById('noticeLink1');
    this.noticeLink1B = document.getElementById('noticeLink1B');
    this.noticeLink2 = document.getElementById('noticeLink2');
    this.noticeLink2B = document.getElementById('noticeLink2B');
    this.noticeLink3 = document.getElementById('noticeLink3');
    this.noticeLink3B = document.getElementById('noticeLink3B');

    // Navigation & Views
    this.brandHomeLink = document.getElementById('brandHomeLink');
    this.navHomeLink = document.getElementById('navHomeLink');
    this.navCoursesLink = document.getElementById('navCoursesLink');
    this.navAboutLink = document.getElementById('navAboutLink');
    this.navStudentLink = document.getElementById('navStudentLink');
    this.navCertificateLink = document.getElementById('navCertificateLink');
    this.btnHeroGoToRegister = document.getElementById('btnHeroGoToRegister');
    this.btnMobileNav = document.getElementById('btnMobileNav');
    this.navMenu = document.getElementById('navMenu');

    this.viewHome = document.getElementById('view-home');
    this.viewCourses = document.getElementById('view-courses');
    this.viewAbout = document.getElementById('view-about');
    this.viewStudent = document.getElementById('view-student');
    this.viewCertificate = document.getElementById('view-certificate');
    this.viewNotFound = document.getElementById('view-not-found');
    this.notFoundSubdomainDisplay = document.getElementById('notFoundSubdomainDisplay');
    this.btnNotFoundClaim = document.getElementById('btnNotFoundClaim');
    this.btnNotFoundDemo = document.getElementById('btnNotFoundDemo');

    // About Us View Elements
    this.aboutCategoryBadge = document.getElementById('aboutCategoryBadge');
    this.aboutHeadlineDisplay = document.getElementById('aboutHeadlineDisplay');
    this.aboutSubHeadlineDisplay = document.getElementById('aboutSubHeadlineDisplay');
    this.aboutStoryDirector = document.getElementById('aboutStoryDirector');
    this.aboutStoryTextDisplay = document.getElementById('aboutStoryTextDisplay');
    this.aboutHighlightsGrid = document.getElementById('aboutHighlightsGrid');
    this.aboutPhoneLink = document.getElementById('aboutPhoneLink');
    this.aboutSecondaryPhoneLink = document.getElementById('aboutSecondaryPhoneLink');
    this.aboutSecondaryPhoneWrapper = document.getElementById('aboutSecondaryPhoneWrapper');
    this.aboutEmailLink = document.getElementById('aboutEmailLink');
    this.aboutAddressDisplay = document.getElementById('aboutAddressDisplay');
    this.btnAboutGoToRegister = document.getElementById('btnAboutGoToRegister');

    // Home Section
    this.homeCoursesGrid = document.getElementById('homeCoursesGrid');
    this.coursesPageGrid = document.getElementById('coursesPageGrid');
    this.homeContactForm = document.getElementById('homeContactForm');

    // Registration Form Elements
    this.studentRegForm = document.getElementById('studentRegForm');
    this.regFullName = document.getElementById('regFullName');
    this.regDob = document.getElementById('regDob');
    this.regFatherName = document.getElementById('regFatherName');
    this.regMotherName = document.getElementById('regMotherName');
    this.regAadhar = document.getElementById('regAadhar');
    this.regAadharError = document.getElementById('regAadharError');
    this.regPhone = document.getElementById('regPhone');
    this.regPhoneError = document.getElementById('regPhoneError');
    this.regEmail = document.getElementById('regEmail');
    this.regEmailError = document.getElementById('regEmailError');
    this.regPinCode = document.getElementById('regPinCode');
    this.regPinCodeError = document.getElementById('regPinCodeError');
    this.regPinArea = document.getElementById('regPinArea');
    this.regAddress = document.getElementById('regAddress');
    this.regStudentPhoto = document.getElementById('regStudentPhoto');
    this.regPhotoUpload = document.getElementById('regPhotoUpload');
    this.btnClearStudentPhoto = document.getElementById('btnClearStudentPhoto');
    this.regPhotoError = document.getElementById('regPhotoError');
    this.regAuthCode = document.getElementById('regAuthCode');
    this.authOtpBoxes = document.getElementById('authOtpBoxes');
    this.authOtpDigits = document.querySelectorAll('.auth-otp-digit');
    this.btnSubmitReg = document.getElementById('btnSubmitReg');

    // Dropdown Containers & Inputs
    this.regGenderDropdown = document.getElementById('regGenderDropdown');
    this.regGenderTrigger = document.getElementById('regGenderTrigger') || this.regGenderDropdown?.querySelector('.custom-select-trigger');
    this.regGenderDisplay = document.getElementById('regGenderDisplay') || this.regGenderTrigger?.querySelector('.select-label');
    this.regGenderInput = document.getElementById('regGender') || document.getElementById('regGenderInput') || this.regGenderDropdown?.querySelector('input[type="hidden"]');
    this.regGenderMenu = document.getElementById('regGenderMenu');

    this.regMaritalStatusDropdown = document.getElementById('regMaritalStatusDropdown');
    this.regMaritalStatusTrigger = document.getElementById('regMaritalStatusTrigger') || this.regMaritalStatusDropdown?.querySelector('.custom-select-trigger');
    this.regMaritalStatusDisplay = document.getElementById('regMaritalStatusDisplay') || this.regMaritalStatusTrigger?.querySelector('.select-label');
    this.regMaritalStatusInput = document.getElementById('regMaritalStatus') || document.getElementById('regMaritalStatusInput') || this.regMaritalStatusDropdown?.querySelector('input[type="hidden"]');
    this.regMaritalStatusMenu = document.getElementById('regMaritalStatusMenu');

    this.regCategoryDropdown = document.getElementById('regCategoryDropdown');
    this.regCategoryTrigger = document.getElementById('regCategoryTrigger') || this.regCategoryDropdown?.querySelector('.custom-select-trigger');
    this.regCategoryDisplay = document.getElementById('regCategoryDisplay') || this.regCategoryTrigger?.querySelector('.select-label');
    this.regCategoryInput = document.getElementById('regCategory') || document.getElementById('regCategoryInput') || this.regCategoryDropdown?.querySelector('input[type="hidden"]');
    this.regCategoryMenu = document.getElementById('regCategoryMenu');

    this.regReligionDropdown = document.getElementById('regReligionDropdown');
    this.regReligionTrigger = document.getElementById('regReligionTrigger') || this.regReligionDropdown?.querySelector('.custom-select-trigger');
    this.regReligionDisplay = document.getElementById('regReligionDisplay') || this.regReligionTrigger?.querySelector('.select-label');
    this.regReligionInput = document.getElementById('regReligion') || document.getElementById('regReligionInput') || this.regReligionDropdown?.querySelector('input[type="hidden"]');
    this.regReligionMenu = document.getElementById('regReligionMenu');

    this.regStateDropdown = document.getElementById('regStateDropdown');
    this.regStateTrigger = document.getElementById('regStateTrigger') || this.regStateDropdown?.querySelector('.custom-select-trigger');
    this.regStateDisplay = document.getElementById('regStateDisplay') || this.regStateTrigger?.querySelector('.select-label');
    this.regStateInput = document.getElementById('regState') || document.getElementById('regStateInput') || this.regStateDropdown?.querySelector('input[type="hidden"]');
    this.regStateMenu = document.getElementById('regStateMenu');

    this.regDistrictDropdown = document.getElementById('regDistrictDropdown');
    this.regDistrictTrigger = document.getElementById('regDistrictTrigger') || this.regDistrictDropdown?.querySelector('.custom-select-trigger');
    this.regDistrictDisplay = document.getElementById('regDistrictDisplay') || this.regDistrictTrigger?.querySelector('.select-label');
    this.regDistrictInput = document.getElementById('regDistrict') || document.getElementById('regDistrictInput') || this.regDistrictDropdown?.querySelector('input[type="hidden"]');
    this.regDistrictMenu = document.getElementById('regDistrictMenu');

    this.regQualificationDropdown = document.getElementById('regQualificationDropdown');
    this.regQualificationTrigger = document.getElementById('regQualificationTrigger') || this.regQualificationDropdown?.querySelector('.custom-select-trigger');
    this.regQualificationDisplay = document.getElementById('regQualificationDisplay') || this.regQualificationTrigger?.querySelector('.select-label');
    this.regQualificationInput = document.getElementById('regQualification') || document.getElementById('regQualificationInput') || this.regQualificationDropdown?.querySelector('input[type="hidden"]');
    this.regQualificationMenu = document.getElementById('regQualificationMenu');

    this.regCourseDropdown = document.getElementById('regCourseDropdown');
    this.regCourseTrigger = document.getElementById('regCourseTrigger') || this.regCourseDropdown?.querySelector('.custom-select-trigger');
    this.regCourseDisplay = document.getElementById('regCourseDisplay') || this.regCourseTrigger?.querySelector('.select-label');
    this.regCourseInput = document.getElementById('regCourse') || document.getElementById('regCourseInput') || this.regCourseDropdown?.querySelector('input[type="hidden"]');
    this.regCourseMenu = document.getElementById('regCourseMenu');

    // Certificate Verification Form Elements
    this.certSearchForm = document.getElementById('certificateSearchForm');
    this.certPhone = document.getElementById('certPhone');
    this.certPhoneError = document.getElementById('certPhoneError');
    this.certDob = document.getElementById('certDob');
    this.certDobError = document.getElementById('certDobError');
    this.btnSearchCertificate = document.getElementById('btnSearchCert');

    this.certResultContainer = document.getElementById('certResultContainer');
    this.certNotFoundState = document.getElementById('certNotFoundState');
    this.certIncompleteState = document.getElementById('certIncompleteState');
    this.certIncompleteDesc = document.getElementById('certIncompleteDesc');
    this.btnResetCertSearch = document.getElementById('btnResetCertSearch');
    this.btnPrintCertificate = document.getElementById('btnPrintCertificate');
    this.certDocAcademyName = document.getElementById('certDocAcademyName');
    this.certDocStudentName = document.getElementById('certDocStudentName');
    this.certDocCourseTitle = document.getElementById('certDocCourseTitle');
    this.certDocStudentId = document.getElementById('certDocStudentId');
    this.certDocIssueDate = document.getElementById('certDocIssueDate');
    this.certDocSignatory = document.getElementById('certDocSignatory');

    // Success Modal
    this.successModal = document.getElementById('registrationSuccessModal');
    this.modalStudentId = document.getElementById('modalStudentId');
    this.modalStudentName = document.getElementById('modalStudentName');
    this.modalCourseName = document.getElementById('modalCourseName');
    this.modalRegDate = document.getElementById('modalRegDate');
    this.btnCloseSuccessModal = document.getElementById('btnCloseSuccessModal');

    // Toast Container
    this.toastContainer = document.getElementById('toastContainer');
  }

  initData() {
    // 1. Load Academy Profile for active tenant
    let loadedProfile = null;
    const rawProfile = localStorage.getItem(this.getStorageKey(STORAGE_KEYS.ACADEMY_PROFILE));
    if (rawProfile) {
      try {
        loadedProfile = JSON.parse(rawProfile);
      } catch (e) {}
    }

    // Check fallback for custom slug in localStorage
    if (!loadedProfile) {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('educore_academy_profile_')) {
          try {
            const p = JSON.parse(localStorage.getItem(k));
            if (p && (p.slug === this.currentAcademySlug || (this.currentAcademySlug === 'ppxt' && p.slug === 'ppxt'))) {
              loadedProfile = p;
              break;
            }
          } catch (e) {}
        }
      }
    }

    this.academyProfile = loadedProfile || this.getDefaultProfile();

    // Load Available Courses for active tenant
    const rawCourses = localStorage.getItem(this.getStorageKey(STORAGE_KEYS.COURSES));
    if (rawCourses) {
      try {
        this.courses = JSON.parse(rawCourses) || [];
      } catch (e) {
        this.courses = [];
      }
    } else {
      this.courses = this.currentOwnerEmail.includes('poulami') ? [] : DEFAULT_PUBLIC_COURSES.map(course => ({ ...course }));
      if (this.courses.length > 0) {
        localStorage.setItem(this.getStorageKey(STORAGE_KEYS.COURSES), JSON.stringify(this.courses));
      }
    }

    const seedVersionKey = this.getStorageKey('educore_course_seed_version');
    if (!this.currentOwnerEmail.includes('poulami') && localStorage.getItem(seedVersionKey) !== PUBLIC_COURSE_SEED_VERSION) {
      const existingIds = new Set(this.courses.map(course => course.id));
      DEFAULT_PUBLIC_COURSES.forEach(course => {
        if (!existingIds.has(course.id)) this.courses.push({ ...course });
      });
      localStorage.setItem(this.getStorageKey(STORAGE_KEYS.COURSES), JSON.stringify(this.courses));
      localStorage.setItem(seedVersionKey, PUBLIC_COURSE_SEED_VERSION);
    }
  }

  async fetchCloudData() {
    const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';

    try {
      const response = await fetch(getPublicApiUrl(`?academy=${encodeURIComponent(this.currentAcademySlug)}`), { cache: 'no-store' });
      
      if (response.status === 404) {
        if (!isLocalDev) {
          this.showBrowserDefaultNotFound();
        }
        return false;
      }
      
      if (!response.ok) return false;
      const json = await response.json();

      // If requested subdomain is not registered/found
      if (json && json.notFound) {
        if (!isLocalDev) {
          this.showBrowserDefaultNotFound();
        }
        return false;
      }

      if (json && json.success && json.data) {
        if (json.tenant && json.tenant.ownerEmail) {
          this.currentOwnerEmail = json.tenant.ownerEmail;
        }

        const { profile, courses, students } = json.data;

        if (Array.isArray(courses)) {
          this.courses = courses;
          // The Diganta site always includes its six established courses.
          // This also repairs browsers that cached the older three-course set.
          if (!this.currentOwnerEmail.includes('poulami')) {
            const cloudCourseIds = new Set(this.courses.map(course => course.id));
            DEFAULT_PUBLIC_COURSES.forEach(course => {
              if (!cloudCourseIds.has(course.id)) this.courses.push({ ...course });
            });
          }
          localStorage.setItem(this.getStorageKey(STORAGE_KEYS.COURSES), JSON.stringify(this.courses));
          this.renderHomeCourses();
          this.populateCourseDropdown();
        }

        if (profile) {
          this.academyProfile = profile;
          localStorage.setItem(this.getStorageKey(STORAGE_KEYS.ACADEMY_PROFILE), JSON.stringify(profile));
          this.renderBranding();
        }

        if (Array.isArray(students)) {
          localStorage.setItem(this.getStorageKey(STORAGE_KEYS.STUDENTS), JSON.stringify(students));
          await this.openCertificateFromVerificationLink(students);
        }

        // Remove tenantGuard if it was an unverified custom subdomain
        const guard = document.getElementById('tenantGuard');
        if (guard) guard.remove();

        this.render();
        this.switchView(this.currentView, false);
        return true;
      }
    } catch (e) {
      console.error('[PublicApp] fetchCloudData error:', e);
    }
    return false;
  }

  async openCertificateFromVerificationLink(students) {
    if (this._verificationLinkHandled) return;
    const certificateId = new URLSearchParams(window.location.search).get('certificate');
    if (!certificateId) return;
    this._verificationLinkHandled = true;
    this.switchView('certificate', false);

    const student = students.find(item => String(item.id) === certificateId);
    if (!student) {
      if (this.certSearchForm) this.certSearchForm.style.display = '';
      if (this.certResultContainer) this.certResultContainer.style.display = 'none';
      if (this.certNotFoundState) this.certNotFoundState.style.display = 'flex';
      return;
    }
    await this.showCertificateResult(student);
  }

  async showCertificateResult(student) {
    if (student.status !== 'Completed') {
      if (this.certSearchForm) this.certSearchForm.style.display = '';
      if (this.certResultContainer) this.certResultContainer.style.display = 'none';
      if (this.certNotFoundState) this.certNotFoundState.style.display = 'none';
      if (this.certIncompleteState) {
        if (this.certIncompleteDesc) {
          this.certIncompleteDesc.textContent = `Hello, ${toTitleCase(student.name)}, your certificate is not available at this moment.`;
        }
        this.certIncompleteState.style.display = 'flex';
      }
      return;
    }

    if (this.certNotFoundState) this.certNotFoundState.style.display = 'none';
    if (this.certIncompleteState) this.certIncompleteState.style.display = 'none';
    const courseId = (student.enrolledCourseIds && student.enrolledCourseIds[0]) || '';
    const course = this.courses.find(item => item.id === courseId);
    await window.CertificateCanvas.render(student, course);
    if (this.certResultContainer) {
      if (this.certSearchForm) this.certSearchForm.style.display = 'none';
      this.certResultContainer.style.display = 'block';
      this.certResultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  showBrowserDefaultNotFound() {
    const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
    if (isLocalDev) return;

    this.isNotFound = true;
    document.open();
    document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>404: NOT_FOUND</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 0;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000000;
      color: #ffffff;
    }
    .error-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: left;
    }
    .error-code {
      font-size: 24px;
      font-weight: 600;
      padding-right: 20px;
      margin-right: 20px;
      border-right: 1px solid rgba(255, 255, 255, 0.3);
      line-height: 48px;
    }
    .error-msg {
      font-size: 14px;
      color: #cccccc;
      line-height: 48px;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="error-wrap">
    <div class="error-code">404</div>
    <div class="error-msg">This page could not be found.</div>
  </div>
</body>
</html>`);
    document.close();
  }

  bindEvents() {
    // Keep an already-open public tab in sync with course changes made in Admin.
    window.addEventListener('storage', (event) => {
      if (event.key !== this.getStorageKey(STORAGE_KEYS.COURSES) || event.newValue === null) return;
      try {
        this.courses = JSON.parse(event.newValue) || [];
        this.renderHomeCourses();
        this.populateCourseDropdown();
      } catch (e) {
        console.warn('[PublicApp] Ignored invalid course data from storage sync.');
      }
    });

    // Mobile Nav Toggle
    if (this.btnMobileNav && this.navMenu) {
      this.btnMobileNav.addEventListener('click', () => {
        this.navMenu.classList.toggle('active');
      });
    }

    // Nav Links (HOME, ABOUT, STUDENT, CERTIFICATE)
    if (this.navHomeLink) {
      this.navHomeLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchView('home');
      });
    }

    if (this.brandHomeLink) {
      this.brandHomeLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchView('home');
      });
    }

    if (this.navCoursesLink) {
      this.navCoursesLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchView('courses');
      });
    }

    if (this.navAboutLink) {
      this.navAboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchView('about');
      });
    }

    if (this.navStudentLink) {
      this.navStudentLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchView('student');
      });
    }

    if (this.navCertificateLink) {
      this.navCertificateLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchView('certificate');
      });
    }

    if (this.btnHeroGoToRegister) {
      this.btnHeroGoToRegister.addEventListener('click', () => {
        this.switchView('student');
      });
    }

    if (this.btnAboutGoToRegister) {
      this.btnAboutGoToRegister.addEventListener('click', () => {
        this.switchView('student');
      });
    }

    // Hash Change
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'courses') {
        this.switchView('courses', false);
      } else if (hash === 'student' || hash === 'registration') {
        this.switchView('student', false);
      } else if (hash === 'certificate') {
        this.switchView('certificate', false);
      } else if (hash === 'about') {
        this.switchView('about', false);
      } else if (hash === 'home' || hash === '') {
        this.switchView('home', false);
      }
    });

    // Student Registration Form Submit Handler
    if (this.studentRegForm) {
      this.studentRegForm.addEventListener('submit', (e) => this.handleRegistration(e));
      this.studentRegForm.addEventListener('input', (e) => {
        e.target?.classList.remove('input-error');
      });
    }

    if (this.regStudentPhoto) {
      this.regStudentPhoto.addEventListener('change', () => this.handleStudentPhotoSelection());
    }
    if (this.btnClearStudentPhoto) {
      this.btnClearStudentPhoto.addEventListener('click', () => this.clearStudentPhoto());
    }

    // Certificate Search Form Submit Handler
    if (this.certSearchForm) {
      this.certSearchForm.addEventListener('submit', (e) => this.handleCertificateSearch(e));
      this.certSearchForm.addEventListener('input', (e) => {
        e.target?.classList.remove('input-error');
        if (e.target === this.certDob && this.certDobError) this.certDobError.style.display = 'none';
      });
    }

    if (this.homeContactForm) {
      this.homeContactForm.addEventListener('submit', (e) => this.handleContactMessage(e));
    }

    // Certificate Reset / Print Buttons
    if (this.btnResetCertSearch) {
      this.btnResetCertSearch.addEventListener('click', () => {
        if (this.certSearchForm) {
          this.certSearchForm.style.display = '';
          this.certSearchForm.classList.remove('cert-search-returning');
          void this.certSearchForm.offsetWidth;
          this.certSearchForm.classList.add('cert-search-returning');
          this.certSearchForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
          window.setTimeout(() => this.certSearchForm?.classList.remove('cert-search-returning'), 550);
        }
        if (this.certResultContainer) this.certResultContainer.style.display = 'none';
        if (this.certNotFoundState) this.certNotFoundState.style.display = 'none';
        if (this.certIncompleteState) this.certIncompleteState.style.display = 'none';
        window.CertificateCanvas.clear();
        if (this.certSearchForm) this.certSearchForm.reset();
        if (this.certPhone) {
          this.certPhone.classList.remove('input-error');
          this.certPhone.focus({ preventScroll: true });
        }
        if (this.certPhoneError) this.certPhoneError.style.display = 'none';
        if (this.certDob) this.certDob.classList.remove('input-error');
        if (this.certDobError) this.certDobError.style.display = 'none';
      });
    }

    if (this.btnPrintCertificate) {
      this.btnPrintCertificate.addEventListener('click', () => {
        window.print();
      });
    }

    // Modal Close
    if (this.btnCloseSuccessModal && this.successModal) {
      this.btnCloseSuccessModal.addEventListener('click', () => {
        this.successModal.classList.remove('open');
      });
    }
  }

  // ==========================================================================
  // Real-time Input Formatters & Validators (Initials Capitalization, 10-Digit Mobile, 12-Digit Aadhar, 6-Digit PIN)
  // ==========================================================================
  initInputFormatters() {
    // Auto capitalize Full Name, Father's Name, Mother's Name initials
    if (this.regFullName) applyAutoCapitalization(this.regFullName);
    if (this.regFatherName) applyAutoCapitalization(this.regFatherName);
    if (this.regMotherName) applyAutoCapitalization(this.regMotherName);

    // Strict 10-digit number only validation for Mobile Numbers
    if (this.regPhone) {
      setupPhoneInputValidation(this.regPhone, this.regPhoneError);
    }
    if (this.regEmail) {
      this.regEmail.addEventListener('input', () => {
        this.regEmail.classList.remove('input-error');
        if (this.regEmailError) this.regEmailError.style.display = 'none';
      });
    }
    if (this.certPhone) {
      setupPhoneInputValidation(this.certPhone, this.certPhoneError);
    }

    // Strict 12-digit Aadhar validation
    if (this.regAadhar) {
      setupAadharInputValidation(this.regAadhar, this.regAadharError);
    }

    // 6-digit Pin code validation
    if (this.regPinCode) {
      setupPinCodeInputValidation(this.regPinCode, this.regPinCodeError);
      this.regPinCode.addEventListener('input', () => this.schedulePinCodeLookup());
    }

    // Date inputs has-value styling
    [this.regDob, this.certDob].forEach(dateInput => {
      if (dateInput) {
        ['input', 'change'].forEach(evt => {
          dateInput.addEventListener(evt, () => {
            dateInput.classList.toggle('has-value', Boolean(dateInput.value));
          });
        });
      }
    });

    // 6-Digit OTP Box inputs
    this.initOtpBoxes();
    if (this.regAuthCode) {
      this.regAuthCode.addEventListener('input', () => {
        this.regAuthCode.value = this.regAuthCode.value.replace(/\D/g, '').slice(0, 6);
        this.regAuthCode.classList.remove('input-error');
      });
    }
  }

  initOtpBoxes() {
    if (!this.authOtpDigits || this.authOtpDigits.length === 0) return;

    this.authOtpDigits.forEach((digitInput, index) => {
      // Auto-select on focus or click
      digitInput.addEventListener('focus', () => {
        digitInput.select();
      });
      digitInput.addEventListener('click', () => {
        digitInput.select();
      });

      // Primary Input event: works seamlessly across desktop, mobile, numpad, IME
      digitInput.addEventListener('input', (e) => {
        const raw = digitInput.value;
        const cleaned = raw.replace(/\D/g, '');
        const digit = cleaned.length > 0 ? cleaned.slice(-1) : '';
        digitInput.value = digit;

        digitInput.classList.toggle('filled', Boolean(digit));
        digitInput.classList.remove('input-error');

        this.syncAuthCodeFromOtpDigits();

        // Advance to next box immediately if a digit is entered
        if (digit && index < this.authOtpDigits.length - 1) {
          const next = this.authOtpDigits[index + 1];
          if (next) {
            next.focus();
            next.select();
          }
        }
      });

      // Keydown for Backspace and Arrow navigation
      digitInput.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
          if (!digitInput.value && index > 0) {
            e.preventDefault();
            const prev = this.authOtpDigits[index - 1];
            if (prev) {
              prev.value = '';
              prev.classList.remove('filled');
              prev.focus();
              prev.select();
              this.syncAuthCodeFromOtpDigits();
            }
          }
        } else if (e.key === 'ArrowLeft' && index > 0) {
          e.preventDefault();
          this.authOtpDigits[index - 1].focus();
          this.authOtpDigits[index - 1].select();
        } else if (e.key === 'ArrowRight' && index < this.authOtpDigits.length - 1) {
          e.preventDefault();
          this.authOtpDigits[index + 1].focus();
          this.authOtpDigits[index + 1].select();
        }
      });

      // Paste event: paste full 6-digit code
      digitInput.addEventListener('paste', (e) => {
        e.preventDefault();
        const clipboard = (e.clipboardData || window.clipboardData).getData('text') || '';
        const digits = clipboard.replace(/\D/g, '').slice(0, 6);
        if (!digits) return;

        digits.split('').forEach((d, i) => {
          if (this.authOtpDigits[i]) {
            this.authOtpDigits[i].value = d;
            this.authOtpDigits[i].classList.add('filled');
            this.authOtpDigits[i].classList.remove('input-error');
          }
        });

        const nextFocusIndex = Math.min(digits.length, this.authOtpDigits.length - 1);
        if (this.authOtpDigits[nextFocusIndex]) {
          this.authOtpDigits[nextFocusIndex].focus();
          this.authOtpDigits[nextFocusIndex].select();
        }
        this.syncAuthCodeFromOtpDigits();
      });
    });
  }

  syncAuthCodeFromOtpDigits() {
    // The current form uses one regular six-digit input. Only synchronize
    // when the legacy individual OTP boxes are actually present.
    if (!this.authOtpDigits || this.authOtpDigits.length === 0 || !this.regAuthCode) return;
    const code = Array.from(this.authOtpDigits).map(input => input.value || '').join('');
    this.regAuthCode.value = code;
  }

  // ==========================================================================
  // Custom Dropdowns (Opens directly below the dropdown box)
  // ==========================================================================
  initCustomDropdowns() {
    // Setup Gender Dropdown
    this.setupDropdown(this.regGenderDropdown, this.regGenderTrigger, this.regGenderMenu, this.regGenderDisplay, this.regGenderInput);

    // Setup Marital Status Dropdown
    this.setupDropdown(this.regMaritalStatusDropdown, this.regMaritalStatusTrigger, this.regMaritalStatusMenu, this.regMaritalStatusDisplay, this.regMaritalStatusInput);

    // Setup Category Dropdown
    this.setupDropdown(this.regCategoryDropdown, this.regCategoryTrigger, this.regCategoryMenu, this.regCategoryDisplay, this.regCategoryInput);

    // Setup Religion Dropdown
    this.setupDropdown(this.regReligionDropdown, this.regReligionTrigger, this.regReligionMenu, this.regReligionDisplay, this.regReligionInput);

    // Setup State & District Dropdowns
    this.initStateAndDistrictDropdowns();

    // Setup Qualification Dropdown
    this.setupDropdown(this.regQualificationDropdown, this.regQualificationTrigger, this.regQualificationMenu, this.regQualificationDisplay, this.regQualificationInput);

    // Setup Course Dropdown
    this.setupDropdown(this.regCourseDropdown, this.regCourseTrigger, this.regCourseMenu, this.regCourseDisplay, this.regCourseInput);

    const getAllDropdowns = () => [
      this.regGenderDropdown,
      this.regMaritalStatusDropdown,
      this.regCategoryDropdown,
      this.regReligionDropdown,
      this.regStateDropdown,
      this.regDistrictDropdown,
      this.regQualificationDropdown,
      this.regCourseDropdown
    ];

    // Close on outside click
    document.addEventListener('click', (e) => {
      getAllDropdowns().forEach(dropdown => {
        if (dropdown && !dropdown.contains(e.target)) {
          dropdown.classList.remove('open');
          const trigger = dropdown.querySelector('.custom-select-trigger');
          if (trigger) trigger.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        getAllDropdowns().forEach(dropdown => {
          if (dropdown) {
            dropdown.classList.remove('open');
            const trigger = dropdown.querySelector('.custom-select-trigger');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
          }
        });
      }
    });
  }

  initStateAndDistrictDropdowns() {
    if (!this.regStateMenu || !this.regDistrictMenu) return;

    const states = Object.keys(INDIAN_STATES_DISTRICTS).sort();
    this.regStateMenu.innerHTML = states.map(state => `
      <li class="custom-select-option" data-value="${escapeHtml(state)}" role="option">${escapeHtml(state)}</li>
    `).join('');

    this.setupDropdown(
      this.regStateDropdown,
      this.regStateTrigger,
      this.regStateMenu,
      this.regStateDisplay,
      this.regStateInput,
      (selectedState) => {
        this.populateDistricts(selectedState);
        this.setLocationFieldsEnabled(Boolean(selectedState));
      }
    );

    this.setupDropdown(
      this.regDistrictDropdown,
      this.regDistrictTrigger,
      this.regDistrictMenu,
      this.regDistrictDisplay,
      this.regDistrictInput
    );

    this.setLocationFieldsEnabled(Boolean(this.regStateInput?.value));
  }

  setLocationFieldsEnabled(enabled) {
    if (this.regDistrictTrigger) this.regDistrictTrigger.disabled = !enabled;
    if (this.regPinCode) {
      this.regPinCode.disabled = !enabled;
      this.regPinCode.placeholder = enabled ? '6-digit pin code' : 'Select a state first';
      this.regPinCode.value = '';
    }
    if (this.regDistrictInput) this.regDistrictInput.value = '';
    if (this.regDistrictDisplay) this.regDistrictDisplay.textContent = 'Select District';
    this.regDistrictDropdown?.classList.remove('has-value', 'open');
    this.clearPinArea();
  }

  clearPinArea(message = '', state = '') {
    if (!this.regPinArea) return;
    this.regPinArea.textContent = message;
    this.regPinArea.classList.toggle('visible', Boolean(message));
    this.regPinArea.classList.toggle('loading', state === 'loading');
    this.regPinArea.classList.toggle('error', state === 'error');
  }

  schedulePinCodeLookup() {
    clearTimeout(this._pinLookupTimer);
    this._pinLookupController?.abort();
    const pinCode = String(this.regPinCode?.value || '').replace(/\D/g, '');
    if (pinCode.length !== 6) {
      this.clearPinArea();
      return;
    }
    this.clearPinArea('Finding area…', 'loading');
    this._pinLookupTimer = setTimeout(() => this.lookupPinCodeArea(pinCode), 350);
  }

  async lookupPinCodeArea(pinCode) {
    this._pinLookupController = new AbortController();
    try {
      const response = await fetch(getPinCodeLookupUrl(pinCode), {
        cache: 'no-store',
        signal: this._pinLookupController.signal
      });
      const result = await response.json().catch(() => null);
      if (String(this.regPinCode?.value || '') !== pinCode) return;
      if (!response.ok || !result?.success || !result?.area) {
        this.clearPinArea('No area was found for this PIN code.', 'error');
        return;
      }
      this.clearPinArea(`Area: ${result.area}`);
    } catch (error) {
      if (error?.name !== 'AbortError' && String(this.regPinCode?.value || '') === pinCode) {
        this.clearPinArea('Area lookup is temporarily unavailable.', 'error');
      }
    }
  }

  populateDistricts(selectedState) {
    if (!this.regDistrictMenu || !this.regDistrictDisplay || !this.regDistrictInput) return;

    const districts = INDIAN_STATES_DISTRICTS[selectedState] || [];
    if (districts.length === 0) {
      this.regDistrictMenu.innerHTML = '<li class="custom-select-option" data-value="" style="color: var(--text-muted); cursor: default;">No districts available</li>';
    } else {
      this.regDistrictMenu.innerHTML = districts.map(d => `
        <li class="custom-select-option" data-value="${escapeHtml(d)}" role="option">${escapeHtml(d)}</li>
      `).join('');
    }

    this.regDistrictDisplay.textContent = 'Select District';
    this.regDistrictInput.value = '';
    this.regDistrictMenu.querySelectorAll('.custom-select-option').forEach(opt => opt.classList.remove('selected'));
  }

  setupDropdown(container, trigger, menu, display, hiddenInput, onChangeCallback) {
    const cont = container;
    const trig = trigger || cont?.querySelector('.custom-select-trigger');
    const m = menu || cont?.querySelector('.custom-select-menu');
    const d = display || trig?.querySelector('.select-label') || cont?.querySelector('.select-label');
    const input = hiddenInput || cont?.querySelector('input[type="hidden"]');

    if (!cont || !trig || !m || !input) return;

    trig.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (trig.disabled) return;
      // Close other dropdowns first
      const allDropdowns = [
        this.regGenderDropdown, this.regMaritalStatusDropdown, this.regCategoryDropdown,
        this.regReligionDropdown, this.regStateDropdown, this.regDistrictDropdown,
        this.regQualificationDropdown, this.regCourseDropdown
      ];
      allDropdowns.forEach(otherDropdown => {
        if (otherDropdown && otherDropdown !== cont) {
          otherDropdown.classList.remove('open');
          const t = otherDropdown.querySelector('.custom-select-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });

      const isOpen = cont.classList.toggle('open');
      trig.setAttribute('aria-expanded', String(isOpen));
    });

    m.addEventListener('click', (e) => {
      const option = e.target.closest('.custom-select-option');
      if (!option) return;

      const value = option.getAttribute('data-value');
      const label = option.textContent.trim();

      input.value = value;
      trig.classList.remove('input-error');
      if (d) d.textContent = label;
      cont.classList.toggle('has-value', Boolean(value));

      // Update selected state
      m.querySelectorAll('.custom-select-option').forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');

      cont.classList.remove('open');
      trig.setAttribute('aria-expanded', 'false');

      if (typeof onChangeCallback === 'function') {
        onChangeCallback(value);
      }
    });
  }

  switchView(viewName, updateHash = true) {
    if (this.isNotFound) return;
    this.currentView = viewName;

    // Update Nav Active State
    if (this.navHomeLink) {
      this.navHomeLink.classList.toggle('active', viewName === 'home');
    }
    if (this.navCoursesLink) {
      this.navCoursesLink.classList.toggle('active', viewName === 'courses');
    }
    if (this.navAboutLink) {
      this.navAboutLink.classList.toggle('active', viewName === 'about');
    }
    if (this.navStudentLink) {
      this.navStudentLink.classList.toggle('active', viewName === 'student');
    }
    if (this.navCertificateLink) {
      this.navCertificateLink.classList.toggle('active', viewName === 'certificate');
    }

    // Toggle View Sections
    if (this.viewHome) {
      this.viewHome.style.display = viewName === 'home' ? 'block' : 'none';
      this.viewHome.classList.toggle('active', viewName === 'home');
    }
    if (this.viewCourses) {
      this.viewCourses.style.display = viewName === 'courses' ? 'block' : 'none';
      this.viewCourses.classList.toggle('active', viewName === 'courses');
    }
    if (this.viewAbout) {
      this.viewAbout.style.display = viewName === 'about' ? 'block' : 'none';
      this.viewAbout.classList.toggle('active', viewName === 'about');
    }
    if (this.viewStudent) {
      this.viewStudent.style.display = viewName === 'student' ? 'block' : 'none';
      this.viewStudent.classList.toggle('active', viewName === 'student');
    }
    if (this.viewCertificate) {
      this.viewCertificate.style.display = viewName === 'certificate' ? 'block' : 'none';
      this.viewCertificate.classList.toggle('active', viewName === 'certificate');
    }
    if (this.viewNotFound) {
      this.viewNotFound.classList.remove('active');
      this.viewNotFound.style.display = 'none';
    }

    // Close Mobile Menu if open
    if (this.navMenu) {
      this.navMenu.classList.remove('active');
    }

    if (updateHash) {
      window.location.hash = viewName;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderBranding() {
    const profile = this.academyProfile || {};
    const name = profile.academyName || 'Academy';
    
    // 0. Top Notice Ticker
    const notice1Text = `Notice: Admissions Open for ${name} 2026 Academic Batches`;
    const notice2Text = `Fast-Track Student Verification & Official Certification Active`;
    const primaryPhone = profile.phone || '9733894742';
    const notice3Text = `Contact Admissions Helpline: +91 ${primaryPhone}`;

    if (this.noticeLink1) this.noticeLink1.textContent = notice1Text;
    if (this.noticeLink1B) this.noticeLink1B.textContent = notice1Text;
    if (this.noticeLink2) this.noticeLink2.textContent = notice2Text;
    if (this.noticeLink2B) this.noticeLink2B.textContent = notice2Text;
    if (this.noticeLink3) this.noticeLink3.textContent = notice3Text;
    if (this.noticeLink3B) this.noticeLink3B.textContent = notice3Text;

    // 1. Navbar & Brand Headings
    if (this.navAcademyName) this.navAcademyName.textContent = name;
    if (this.footerAcademyName) this.footerAcademyName.textContent = name;
    if (this.footerCopyrightName) this.footerCopyrightName.textContent = name;
    if (this.certDocAcademyName) this.certDocAcademyName.textContent = name;
    document.title = `${name} | Public Admissions Portal`;

    // Hero 2-Liner Title without "Welcome to"
    const heroLine1El = document.getElementById('heroTitleLine1');
    const heroLine2El = document.getElementById('heroTitleLine2');
    if (heroLine1El && heroLine2El) {
      const parts = name.trim().split(/\s+/);
      if (parts.length > 1) {
        heroLine1El.textContent = parts[0].toUpperCase();
        heroLine2El.textContent = parts.slice(1).join(' ');
      } else {
        heroLine1El.textContent = name.toUpperCase();
        heroLine2El.textContent = 'Computer Centre';
      }
    } else if (this.heroAcademyName) {
      this.heroAcademyName.textContent = name;
    }

    // 2. Hero Tagline & Subtitle
    if (this.heroTaglineText) {
      this.heroTaglineText.textContent = profile.tagline || 'Admissions & Registrations Open';
    }
    if (this.heroDescText) {
      this.heroDescText.textContent = profile.heroDesc || profile.about || 'Empowering learners with industry-standard courses and certified training.';
    }

    // 3. About Us View Personalisation
    if (this.aboutCategoryBadge) {
      this.aboutCategoryBadge.textContent = profile.category ? `Certified in ${profile.category}` : 'Certified Professional Training Institute';
    }
    if (this.aboutHeadlineDisplay) {
      this.aboutHeadlineDisplay.textContent = profile.aboutHeadline || `About ${name}`;
    }
    if (this.aboutSubHeadlineDisplay) {
      this.aboutSubHeadlineDisplay.textContent = profile.category ? `Premier Institute for ${profile.category} Education & Certification` : 'Dedicated to career-transforming training and industry skills.';
    }
    if (this.aboutStoryDirector) {
      this.aboutStoryDirector.textContent = profile.ownerName ? `Supervised & Directed by ${profile.ownerName}` : 'Authorized Academy Administration';
    }
    if (this.aboutStoryTextDisplay) {
      this.aboutStoryTextDisplay.textContent = profile.aboutStory || profile.about || `${name} is a premier training academy offering comprehensive hands-on certification programs designed to build high-demand industry skills.`;
    }

    // 4. Highlights Grid
    if (this.aboutHighlightsGrid) {
      const defaultHighlights = [
        { icon: 'fa-user-tie', title: 'Certified Expert Faculty', desc: 'Personalized mentoring from seasoned industry instructors.' },
        { icon: 'fa-laptop-code', title: '100% Practical Labs', desc: 'Modern lab infrastructure and real-world project assignments.' },
        { icon: 'fa-certificate', title: 'Verifiable Certification', desc: 'Instantly verifiable QR-enabled academic completion credentials.' },
        { icon: 'fa-briefcase', title: 'Career Guidance', desc: 'Placement assistance, portfolio reviews, and interview prep.' }
      ];

      const customHighlights = Array.isArray(profile.aboutHighlights) && profile.aboutHighlights.length > 0
        ? profile.aboutHighlights
        : defaultHighlights.map(d => d.title);

      this.aboutHighlightsGrid.innerHTML = customHighlights.map((hlText, idx) => {
        const icon = defaultHighlights[idx % defaultHighlights.length].icon;
        const sub = defaultHighlights[idx % defaultHighlights.length].desc;
        return `
          <div style="background: #ffffff; border: 1.5px solid var(--border-color); border-radius: 12px; padding: 1.5rem; display: flex; gap: 1rem; align-items: flex-start; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(37,99,235,0.08); color: var(--primary-color); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
              <i class="fa-solid ${icon}"></i>
            </div>
            <div>
              <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem;">${escapeHtml(hlText)}</h4>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0; line-height: 1.4;">${sub}</p>
            </div>
          </div>
        `;
      }).join('');
    }

    // 5. Contact & Location Information
    if (this.aboutPhoneLink) {
      this.aboutPhoneLink.textContent = `+91 ${primaryPhone}`;
      this.aboutPhoneLink.href = `tel:${primaryPhone}`;
    }

    const secondaryPhone = profile.secondaryPhone || profile.whatsapp;
    if (this.aboutSecondaryPhoneWrapper) {
      if (secondaryPhone) {
        this.aboutSecondaryPhoneWrapper.style.display = 'block';
        if (this.aboutSecondaryPhoneLink) {
          this.aboutSecondaryPhoneLink.textContent = `+91 ${secondaryPhone}`;
          this.aboutSecondaryPhoneLink.href = `https://wa.me/91${secondaryPhone.replace(/\D/g, '')}`;
        }
      } else {
        this.aboutSecondaryPhoneWrapper.style.display = 'none';
      }
    }

    const email = profile.email || 'admissions@academy.com';
    if (this.aboutEmailLink) {
      this.aboutEmailLink.textContent = email;
      this.aboutEmailLink.href = `mailto:${email}`;
    }
    if (this.footerPhoneLink) {
      this.footerPhoneLink.href = `tel:${primaryPhone}`;
      this.footerPhoneLink.querySelector('span').textContent = `+91 ${primaryPhone}`;
    }
    if (this.footerEmailLink) {
      this.footerEmailLink.href = `mailto:${email}`;
      this.footerEmailLink.querySelector('span').textContent = email;
    }

    const addressParts = [profile.address, profile.pincode ? `PIN: ${profile.pincode}` : ''].filter(Boolean);
    if (this.aboutAddressDisplay) {
           this.aboutAddressDisplay.textContent = addressParts.length > 0 ? addressParts.join(', ') : 'Main Campus Admissions Center';
    }
    if (this.footerAddress) {
      this.footerAddress.textContent = addressParts.length > 0 ? addressParts.join(', ') : 'West Bengal, India';
    }
  }

  render() {
    if (this.isNotFound) return;

    if (this.viewHome && this.currentView === 'home') this.viewHome.style.display = 'block';
    if (this.viewCourses && this.currentView === 'courses') this.viewCourses.style.display = 'block';
    if (this.viewAbout && this.currentView === 'about') this.viewAbout.style.display = 'block';
    if (this.viewStudent && this.currentView === 'student') this.viewStudent.style.display = 'block';
    if (this.viewCertificate && this.currentView === 'certificate') this.viewCertificate.style.display = 'block';

    // 1. Render Academy Brand Name
    this.renderBranding();

    // 2. Render Available Courses in Home View
    this.renderHomeCourses();

    // 3. Populate Course Dropdown in Student Registration Form
    this.populateCourseDropdown();
  }

  renderHomeCourses() {
    const courseGrids = [this.homeCoursesGrid, this.coursesPageGrid].filter(Boolean);
    if (courseGrids.length === 0) return;

    if (this.courses.length === 0) {
      const emptyState = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem 1.5rem; background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-lg);">
          <i class="fa-solid fa-desktop" style="font-size: 2rem; color: var(--text-subtle); margin-bottom: 0.75rem; display: block;"></i>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem;">Programs Coming Soon</h3>
          <p style="font-size: 0.875rem;">Courses are currently being updated by the academy administration.</p>
        </div>
      `;
      courseGrids.forEach(grid => { grid.innerHTML = emptyState; });
      return;
    }

    const courseIcons = ['fa-laptop-code', 'fa-code', 'fa-graduation-cap', 'fa-file-word', 'fa-calculator', 'fa-pen-nib'];
    const courseCards = this.courses.map((course, index) => `
      <div class="course-card">
        <div class="course-card-header">
          <span class="course-card-icon" aria-hidden="true"><i class="fa-solid ${courseIcons[index % courseIcons.length]}"></i></span>
          <h3 class="course-card-title">${escapeHtml(course.title)}</h3>
        </div>
        <p class="course-card-desc">${escapeHtml(course.description || 'Comprehensive curriculum with practical assignments and certification.')}</p>
        <div class="course-card-footer">
          <span class="course-duration-badge">
            <i class="fa-regular fa-clock"></i> ${escapeHtml(course.duration)}
          </span>
          <button type="button" class="btn-enroll-link" onclick="window.publicApp.selectCourseAndRegister('${escapeHtml(course.id)}')">
            <span>Enroll now</span> <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    `).join('');
    courseGrids.forEach(grid => { grid.innerHTML = courseCards; });
  }

  populateCourseDropdown() {
    if (!this.regCourseMenu) return;

    if (this.courses.length === 0) {
      this.regCourseMenu.innerHTML = '<li class="custom-select-option" style="color: var(--text-muted); pointer-events: none;">No courses currently available</li>';
      if (this.regCourseDisplay) this.regCourseDisplay.textContent = 'No courses available';
      if (this.regCourseInput) this.regCourseInput.value = '';
    } else {
      let html = '';
      this.courses.forEach(c => {
        html += `<li class="custom-select-option" data-value="${escapeHtml(c.id)}" role="option">${escapeHtml(c.title)} (${escapeHtml(c.duration)})</li>`;
      });
      this.regCourseMenu.innerHTML = html;
    }
  }

  selectCourseAndRegister(courseId) {
    this.switchView('student');
    const course = this.courses.find(c => c.id === courseId);
    if (course) {
      if (this.regCourseInput) this.regCourseInput.value = course.id;
      if (this.regCourseDisplay) this.regCourseDisplay.textContent = `${course.title} (${course.duration})`;
      if (this.regCourseDropdown) this.regCourseDropdown.classList.add('has-value');
      if (this.regCourseMenu) {
        this.regCourseMenu.querySelectorAll('.custom-select-option').forEach(opt => {
          opt.classList.toggle('selected', opt.getAttribute('data-value') === course.id);
        });
      }
    }
  }

  setPhotoValidationError(message = '') {
    if (this.regPhotoError) {
      this.regPhotoError.textContent = message;
      this.regPhotoError.style.display = message ? 'block' : 'none';
    }
    this.regPhotoUpload?.classList.toggle('input-error', Boolean(message));
    this.regStudentPhoto?.classList.toggle('input-error', Boolean(message));
  }

  validateStudentPhoto(file) {
    if (!file) return 'Please choose a student passport photo.';
    if (!ALLOWED_STUDENT_PHOTO_TYPES.has(String(file.type || '').toLowerCase())) {
      return 'Please choose a JPG, JPEG, PNG or WebP image.';
    }
    if (file.size <= 0) return 'The selected passport photo is empty. Please choose another image.';
    if (file.size > MAX_STUDENT_PHOTO_BYTES) {
      return 'The passport photo must be 2 MB or smaller.';
    }
    return '';
  }

  handleStudentPhotoSelection() {
    const file = this.regStudentPhoto?.files?.[0];
    const validationError = this.validateStudentPhoto(file);
    this.pendingPhotoUpload = null;

    if (validationError) {
      this.setPhotoValidationError(validationError);
      if (this.regStudentPhoto) this.regStudentPhoto.value = '';
      if (this.btnClearStudentPhoto) this.btnClearStudentPhoto.hidden = true;
      return;
    }

    this.setPhotoValidationError('');
    if (this.btnClearStudentPhoto) this.btnClearStudentPhoto.hidden = false;
  }

  clearStudentPhoto() {
    if (this.regStudentPhoto) {
      this.regStudentPhoto.value = '';
      this.regStudentPhoto.focus();
    }
    this.pendingPhotoUpload = null;
    this.setPhotoValidationError('');
    if (this.btnClearStudentPhoto) this.btnClearStudentPhoto.hidden = true;
  }

  setRegistrationBusy(isBusy) {
    if (!this.btnSubmitReg) return;
    this.btnSubmitReg.disabled = isBusy;
    this.btnSubmitReg.classList.toggle('is-loading', isBusy);
    this.btnSubmitReg.setAttribute('aria-busy', String(isBusy));
    this.btnSubmitReg.setAttribute('aria-label', isBusy ? 'Processing registration' : 'Submit Registration');
    this.btnSubmitReg.innerHTML = isBusy
      ? '<span class="registration-spinner" aria-hidden="true"></span>'
      : '<i class="fa-solid fa-paper-plane"></i> Submit Registration';
  }

  setCertificateSearchBusy(isBusy) {
    if (!this.btnSearchCertificate) return;
    this.btnSearchCertificate.disabled = isBusy;
    this.btnSearchCertificate.classList.toggle('is-loading', isBusy);
    this.btnSearchCertificate.setAttribute('aria-busy', String(isBusy));
    this.btnSearchCertificate.setAttribute('aria-label', isBusy ? 'Verifying certificate' : 'Verify & View Certificate');
    this.btnSearchCertificate.innerHTML = isBusy
      ? '<span class="registration-spinner" aria-hidden="true"></span>'
      : '<i class="fa-solid fa-magnifying-glass"></i> Verify &amp; View Certificate';
  }

  async compressStudentPhoto(file) {
    const sourceUrl = URL.createObjectURL(file);
    const image = new Image();
    try {
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error('The selected passport photo could not be processed.'));
        image.src = sourceUrl;
      });

      const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
      let scale = Math.min(1, 800 / longestSide);
      let quality = 0.82;
      let blob = null;

      while (scale >= 0.2) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(160, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(160, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext('2d');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
        if (!blob) throw new Error('The selected passport photo could not be compressed.');
        if (blob.size <= TARGET_STUDENT_PHOTO_BYTES) break;

        if (quality > 0.38) quality -= 0.08;
        else {
          scale *= 0.85;
          quality = 0.7;
        }
      }

      if (!blob || blob.size > TARGET_STUDENT_PHOTO_BYTES) {
        throw new Error('The passport photo could not be reduced below 50 KB. Please choose another image.');
      }

      const baseName = file.name.replace(/\.[^.]+$/, '') || 'passport-photo';
      return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
    } finally {
      URL.revokeObjectURL(sourceUrl);
    }
  }

  async uploadStudentPhoto(file, studentId, authCode, courseId) {
    if (this.pendingPhotoUpload?.file === file) return this.pendingPhotoUpload.metadata;

    const uploadFile = await this.compressStudentPhoto(file);

    let authResponse;
    try {
      authResponse = await fetch(getImageKitAuthUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academySlug: this.currentAcademySlug,
          authCode,
          courseId,
          fileName: uploadFile.name,
          fileType: uploadFile.type,
          fileSize: uploadFile.size
        })
      });
    } catch {
      throw new Error('Could not connect to the photo-upload service. Please check your connection and retry.');
    }
    const auth = await authResponse.json().catch(() => null);
    if (!authResponse.ok || !auth?.success) {
      const error = new Error(auth?.error || 'Could not authorize the passport photo upload.');
      error.code = auth?.code || 'PHOTO_AUTH_FAILED';
      throw error;
    }

    const safeOriginalName = uploadFile.name
      .normalize('NFKD')
      .replace(/[^a-zA-Z0-9.-]+/g, '_')
      .replace(/^\.+/, '')
      .slice(-100) || 'passport-photo.jpg';
    const uniqueFileName = `${studentId}_${Date.now()}_${safeOriginalName}`;
    const uploadBody = new FormData();
    uploadBody.append('file', uploadFile);
    uploadBody.append('fileName', uniqueFileName);
    uploadBody.append('folder', '/academy/student-photos/');
    uploadBody.append('useUniqueFileName', 'true');
    uploadBody.append('publicKey', auth.publicKey);
    uploadBody.append('token', auth.token);
    uploadBody.append('signature', auth.signature);
    uploadBody.append('expire', String(auth.expire));

    let uploadResponse;
    try {
      uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: uploadBody
      });
    } catch {
      throw new Error('The passport photo could not reach ImageKit. Please check your connection and retry.');
    }
    const uploaded = await uploadResponse.json().catch(() => null);
    const expectedUrlPrefix = String(auth.urlEndpoint || '').replace(/\/$/, '');
    const uploadedPhotoIsValid = expectedUrlPrefix
      && String(uploaded?.url || '').startsWith(`${expectedUrlPrefix}/`)
      && String(uploaded?.filePath || '').startsWith('/academy/student-photos/')
      && uploaded?.fileId;
    if (!uploadResponse.ok || !uploadedPhotoIsValid) {
      throw new Error(uploaded?.message || 'Passport photo upload failed. Please try again.');
    }

    const metadata = {
      photoUrl: uploaded.url,
      imageKitFileId: uploaded.fileId,
      imageKitFilePath: uploaded.filePath
    };
    this.pendingPhotoUpload = { file, studentId, metadata };
    return metadata;
  }

  // ==========================================================================
  // Student Registration Handler
  // ==========================================================================
  async handleRegistration(e) {
    e.preventDefault();

    // Ensure OTP input boxes are synchronized immediately
    this.syncAuthCodeFromOtpDigits();

    const rawFullName = this.regFullName.value.trim();
    const fullName = toTitleCase(rawFullName);
    const dob = this.regDob.value;
    const rawFatherName = this.regFatherName ? this.regFatherName.value.trim() : '';
    const fatherName = toTitleCase(rawFatherName);
    const rawMotherName = this.regMotherName ? this.regMotherName.value.trim() : '';
    const motherName = toTitleCase(rawMotherName);
    const aadhar = this.regAadhar ? this.regAadhar.value.trim().replace(/\D/g, '') : '';
    const gender = this.regGenderInput.value.trim();
    const maritalStatus = this.regMaritalStatusInput.value.trim();
    const category = this.regCategoryInput.value.trim();
    const religion = this.regReligionInput.value.trim();
    const phone = this.regPhone.value.trim().replace(/\D/g, '');
    const email = this.regEmail.value.trim();
    const state = this.regStateInput.value.trim();
    const district = this.regDistrictInput.value.trim();
    const pinCode = this.regPinCode ? this.regPinCode.value.trim().replace(/\D/g, '') : '';
    const address = this.regAddress.value.trim();
    const qualification = this.regQualificationInput.value.trim();
    const courseId = this.regCourseInput.value.trim();
    const authCode = (this.regAuthCode?.value || Array.from(this.authOtpDigits || []).map(i => i.value).join('')).trim();
    const photoFile = this.regStudentPhoto?.files?.[0] || null;

    // Required validation with a precise message and focus target. Custom
    // dropdowns store their values in hidden inputs, so native browser
    // validation cannot reliably identify them for the student.
    const requiredFields = [
      { value: fullName, label: 'Full Name', element: this.regFullName },
      { value: dob, label: 'Date of Birth', element: this.regDob },
      { value: fatherName, label: 'Father\'s Name', element: this.regFatherName },
      { value: motherName, label: 'Mother\'s Name', element: this.regMotherName },
      { value: aadhar, label: 'Aadhar Number', element: this.regAadhar },
      { value: gender, label: 'Gender', element: this.regGenderTrigger },
      { value: maritalStatus, label: 'Marital Status', element: this.regMaritalStatusTrigger },
      { value: category, label: 'Category', element: this.regCategoryTrigger },
      { value: religion, label: 'Religion', element: this.regReligionTrigger },
      { value: qualification, label: 'Highest Qualification', element: this.regQualificationTrigger },
      { value: photoFile, label: 'Student Passport Photo', element: this.regStudentPhoto },
      { value: phone, label: 'Mobile Number', element: this.regPhone },
      { value: email, label: 'Email Address', element: this.regEmail },
      { value: state, label: 'State', element: this.regStateTrigger },
      { value: district, label: 'District', element: this.regDistrictTrigger },
      { value: pinCode, label: 'Pin Code', element: this.regPinCode },
      { value: address, label: 'Full Address', element: this.regAddress },
      { value: courseId, label: 'Course', element: this.regCourseTrigger },
      { value: authCode, label: 'Authentication Code', element: this.regAuthCode }
    ];
    requiredFields.forEach(field => field.element?.classList.remove('input-error'));
    const missingFields = requiredFields.filter(field => !field.value);
    if (missingFields.length > 0) {
      missingFields.forEach(field => field.element?.classList.add('input-error'));
      if (!photoFile) this.setPhotoValidationError('Please choose a student passport photo.');
      const firstMissingField = missingFields[0];
      firstMissingField.element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => firstMissingField.element?.focus(), 350);
      const remainingCount = missingFields.length - 1;
      const message = remainingCount > 0
        ? `Please complete ${firstMissingField.label} and ${remainingCount} other highlighted field${remainingCount === 1 ? '' : 's'}.`
        : `Please complete the ${firstMissingField.label} field.`;
      this.showToast(message, 'error');
      return;
    }

    const photoValidationError = this.validateStudentPhoto(photoFile);
    if (photoValidationError) {
      this.setPhotoValidationError(photoValidationError);
      this.regPhotoUpload?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.regStudentPhoto?.focus();
      this.showToast(photoValidationError, 'error');
      return;
    }
    this.setPhotoValidationError('');

    // Strict 12-Digit Aadhar Number Validation
    if (aadhar.length !== 12 || !/^\d{12}$/.test(aadhar)) {
      if (this.regAadhar) this.regAadhar.classList.add('input-error');
      if (this.regAadharError) {
        this.regAadharError.textContent = 'Please enter a valid 12-digit Aadhar number.';
        this.regAadharError.style.display = 'block';
      }
      if (this.regAadhar) this.regAadhar.focus();
      this.showToast('Aadhar number must be exactly 12 digits.', 'error');
      return;
    }

    // Strict 10-Digit Mobile Number Validation
    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      this.regPhone.classList.add('input-error');
      if (this.regPhoneError) {
        this.regPhoneError.textContent = 'Please enter a valid 10-digit mobile number.';
        this.regPhoneError.style.display = 'block';
      }
      this.regPhone.focus();
      this.showToast('Mobile number must be exactly 10 digits.', 'error');
      return;
    }

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}$/i.test(email)) {
      this.regEmail.classList.add('input-error');
      if (this.regEmailError) {
        this.regEmailError.textContent = 'Please enter a valid email address.';
        this.regEmailError.style.display = 'block';
      }
      this.regEmail.focus();
      this.showToast('Please enter a valid email address.', 'error');
      return;
    }

    // Strict 6-Digit PIN Code Validation
    if (pinCode.length !== 6 || !/^\d{6}$/.test(pinCode)) {
      if (this.regPinCode) this.regPinCode.classList.add('input-error');
      if (this.regPinCodeError) {
        this.regPinCodeError.textContent = 'Please enter a valid 6-digit pin code.';
        this.regPinCodeError.style.display = 'block';
      }
      if (this.regPinCode) this.regPinCode.focus();
      this.showToast('Pin code must be exactly 6 digits.', 'error');
      return;
    }

    if (!/^\d{6}$/.test(authCode)) {
      this.regAuthCode?.classList.add('input-error');
      this.regAuthCode?.focus();
      this.showToast('Authentication code must be exactly 6 digits.', 'error');
      return;
    }

    this.setRegistrationBusy(true);
    try {
      const emailCheckResponse = await fetch(getEmailValidationUrl(email), { cache: 'no-store' });
      const emailCheck = await emailCheckResponse.json().catch(() => null);
      if (!emailCheckResponse.ok || !emailCheck?.valid) {
        this.setRegistrationBusy(false);
        this.regEmail.classList.add('input-error');
        if (this.regEmailError) {
          this.regEmailError.textContent = 'Please enter a valid email address.';
          this.regEmailError.style.display = 'block';
        }
        this.regEmail.focus();
        this.showToast('Please check the email address and try again.', 'error');
        return;
      }
    } catch {
      this.setRegistrationBusy(false);
      this.regEmail.classList.add('input-error');
      if (this.regEmailError) {
        this.regEmailError.textContent = 'Please enter a valid email address.';
        this.regEmailError.style.display = 'block';
      }
      this.showToast('Email verification is temporarily unavailable.', 'error');
      return;
    }

    // Generate Unique Student Identifier
    const studentId = this.pendingPhotoUpload?.file === photoFile
      ? this.pendingPhotoUpload.studentId
      : `STU-${Math.floor(1000 + Math.random() * 9000)}`;
    const joinDate = new Date().toISOString().split('T')[0];

    const selectedCourse = this.courses.find(c => c.id === courseId);
    const courseTitle = selectedCourse ? selectedCourse.title : 'Enrolled Program';

    // Structured textual student data model
    const newStudent = {
      id: studentId,
      name: fullName,
      fullName: fullName,
      dob: dob,
      fatherName: fatherName,
      motherName: motherName,
      aadhar: aadhar,
      gender: gender,
      maritalStatus: maritalStatus,
      category: category,
      religion: religion,
      phone: phone,
      email: email,
      state: state,
      district: district,
      pinCode: pinCode,
      address: address,
      qualification: qualification,
      status: 'Active',
      joinDate: joinDate,
      enrolledCourseIds: [courseId],
      ownerEmail: this.currentOwnerEmail,
      academySlug: this.currentAcademySlug
    };

    // The server resolves the academy exclusively from this deployment's slug,
    // validates that academy's code and expiry, and saves only after success.
    let registrationResult;
    let submissionStage = 'photo';
    try {
      this.setRegistrationBusy(true);
      const photoMetadata = await this.uploadStudentPhoto(photoFile, studentId, authCode, courseId);
      Object.assign(newStudent, photoMetadata);

      submissionStage = 'registration';
      this.setRegistrationBusy(true);
      const response = await fetch(getPublicApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register_student',
          payload: {
            student: newStudent,
            academySlug: this.currentAcademySlug,
            authCode
          }
        })
      });
      registrationResult = await response.json().catch(() => null);

      if (!response.ok || !registrationResult?.success) {
        const registrationError = new Error(registrationResult?.error || 'Registration could not be completed. Please try again.');
        registrationError.code = registrationResult?.code || 'REGISTRATION_FAILED';
        throw registrationError;
      }
    } catch (error) {
      const errorMessages = {
        WRONG_CODE: 'Incorrect authentication code. Please check the current code from the academy.',
        EXPIRED_CODE: 'The authentication code has expired. Please request a new code from the academy.',
        NO_ACTIVE_CODE: 'No active authentication code is available. Please contact the academy.',
        ACADEMY_NOT_FOUND: 'This public site is not connected to a registered academy.',
        INVALID_COURSE: 'The selected course is no longer available. Please select another course.',
        IMAGEKIT_NOT_CONFIGURED: 'Photo uploads are temporarily unavailable. Please contact the academy.',
        INVALID_PHOTO: 'Choose a JPG, JPEG, PNG or WebP passport photo that is 2 MB or smaller.',
        PHOTO_REQUIRED: 'A valid uploaded passport photo is required.'
      };
      const message = errorMessages[error?.code] || error?.message || 'Registration could not be completed. Please try again.';
      if (['WRONG_CODE', 'EXPIRED_CODE', 'NO_ACTIVE_CODE'].includes(error?.code)) {
        this.regAuthCode?.classList.add('input-error');
        this.regAuthCode?.focus();
      } else if (submissionStage === 'photo' || ['IMAGEKIT_NOT_CONFIGURED', 'INVALID_PHOTO', 'PHOTO_REQUIRED'].includes(error?.code)) {
        this.setPhotoValidationError(message);
        this.regPhotoUpload?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      this.showToast(message, 'error');
      return;
    } finally {
      this.setRegistrationBusy(false);
    }

    const savedStudent = registrationResult.student || newStudent;

    // Cache the server-confirmed registration locally for this tenant.
    let allStudents = [];
    const rawStudents = localStorage.getItem(this.getStorageKey(STORAGE_KEYS.STUDENTS)) || localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (rawStudents) {
      try {
        allStudents = JSON.parse(rawStudents) || [];
      } catch (err) {
        allStudents = [];
      }
    }

    allStudents.unshift(savedStudent);
    localStorage.setItem(this.getStorageKey(STORAGE_KEYS.STUDENTS), JSON.stringify(allStudents));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(allStudents));

    // Display Success Receipt Dialog
    if (this.modalStudentId) this.modalStudentId.textContent = savedStudent.id;
    if (this.modalStudentName) this.modalStudentName.textContent = fullName;
    if (this.modalCourseName) this.modalCourseName.textContent = courseTitle;
    if (this.modalRegDate) this.modalRegDate.textContent = formatCertificateDate(joinDate);

    if (this.successModal) {
      this.successModal.classList.add('open');
    }

    // Reset Form
    this.studentRegForm.reset();
    this.pendingPhotoUpload = null;
    if (this.btnClearStudentPhoto) this.btnClearStudentPhoto.hidden = true;
    this.setPhotoValidationError('');
    if (this.regAadhar) this.regAadhar.classList.remove('input-error');
    if (this.regAadharError) this.regAadharError.style.display = 'none';
    this.regPhone.classList.remove('input-error');
    if (this.regPhoneError) this.regPhoneError.style.display = 'none';
    if (this.regPinCode) this.regPinCode.classList.remove('input-error');
    if (this.regPinCodeError) this.regPinCodeError.style.display = 'none';

    if (this.authOtpDigits) {
      this.authOtpDigits.forEach(d => {
        d.value = '';
        d.classList.remove('filled', 'input-error');
      });
    }
    if (this.regAuthCode) {
      this.regAuthCode.value = '';
      this.regAuthCode.classList.remove('input-error');
    }

    if (this.regGenderDisplay) this.regGenderDisplay.textContent = 'Select Gender';
    if (this.regGenderInput) this.regGenderInput.value = '';
    if (this.regMaritalStatusDisplay) this.regMaritalStatusDisplay.textContent = 'Select Marital Status';
    if (this.regMaritalStatusInput) this.regMaritalStatusInput.value = '';
    if (this.regCategoryDisplay) this.regCategoryDisplay.textContent = 'Select Category';
    if (this.regCategoryInput) this.regCategoryInput.value = '';
    if (this.regReligionDisplay) this.regReligionDisplay.textContent = 'Select Religion';
    if (this.regReligionInput) this.regReligionInput.value = '';
    if (this.regStateDisplay) this.regStateDisplay.textContent = 'Select State';
    if (this.regStateInput) this.regStateInput.value = '';
    this.setLocationFieldsEnabled(false);
    if (this.regDistrictDisplay) this.regDistrictDisplay.textContent = 'Select District';
    if (this.regDistrictInput) this.regDistrictInput.value = '';
    if (this.regDistrictMenu) this.regDistrictMenu.innerHTML = '';
    if (this.regQualificationDisplay) this.regQualificationDisplay.textContent = 'Select Qualification';
    if (this.regQualificationInput) this.regQualificationInput.value = '';
    if (this.regCourseDisplay) this.regCourseDisplay.textContent = 'Select Course';
    if (this.regCourseInput) this.regCourseInput.value = '';

    [
      this.regGenderDropdown, this.regMaritalStatusDropdown, this.regCategoryDropdown,
      this.regReligionDropdown, this.regStateDropdown, this.regDistrictDropdown,
      this.regQualificationDropdown, this.regCourseDropdown
    ].forEach(d => { if (d) d.classList.remove('has-value'); });

    if (this.regDob) this.regDob.classList.remove('has-value');

    this.showToast('Registration successfully submitted!', 'success');
  }

  // ==========================================================================
  // Certificate Verification & Download Handler (Requires Mobile & DOB)
  // ==========================================================================
  async handleCertificateSearch(e) {
    e.preventDefault();

    const phone = this.certPhone.value.trim().replace(/\D/g, '');
    const dob = this.certDob.value.trim();

    this.certPhone.classList.toggle('input-error', !phone);
    this.certDob.classList.toggle('input-error', !dob);
    if (this.certPhoneError) {
      this.certPhoneError.textContent = 'Please enter a valid 10-digit mobile number.';
      this.certPhoneError.style.display = phone ? 'none' : 'block';
    }
    if (this.certDobError) this.certDobError.style.display = dob ? 'none' : 'block';

    if (!phone || !dob) {
      const firstMissingField = !phone ? this.certPhone : this.certDob;
      firstMissingField?.focus();
      this.showToast('Please enter both Mobile Number and Date of Birth.', 'error');
      return;
    }

    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      this.certPhone.classList.add('input-error');
      if (this.certPhoneError) {
        this.certPhoneError.textContent = 'Please enter a valid 10-digit mobile number.';
        this.certPhoneError.style.display = 'block';
      }
      this.certPhone.focus();
      this.showToast('Mobile number must be exactly 10 digits.', 'error');
      return;
    }

    this.setCertificateSearchBusy(true);
    try {
      window.CertificateCanvas.clear();
      if (this.certResultContainer) this.certResultContainer.style.display = 'none';

    // Try to fetch latest students for this specific academy tenant from cloud
    let allStudents = [];
    try {
      const response = await fetch(getPublicApiUrl(`?academy=${encodeURIComponent(this.currentAcademySlug)}`), { cache: 'no-store' });
      if (response.ok) {
        const json = await response.json();
        if (json?.success && Array.isArray(json.data?.students)) {
          allStudents = json.data.students;
          localStorage.setItem(this.getStorageKey(STORAGE_KEYS.STUDENTS), JSON.stringify(allStudents));
        }
      }
    } catch (err) {}

    // Fallback to tenant local storage if needed
    if (allStudents.length === 0) {
      const rawStudents = localStorage.getItem(this.getStorageKey(STORAGE_KEYS.STUDENTS));
      if (rawStudents) {
        try {
          allStudents = JSON.parse(rawStudents) || [];
        } catch (err) {
          allStudents = [];
        }
      }
    }

    // Match student by Mobile Number AND Date of Birth
    const student = allStudents.find(s => {
      const sPhone = String(s.phone || '').replace(/\D/g, '');
      const sDob = String(s.dob || '').trim();
      return sPhone === phone && sDob === dob;
    });

    if (!student) {
      if (this.certSearchForm) this.certSearchForm.style.display = '';
      if (this.certResultContainer) this.certResultContainer.style.display = 'none';
      if (this.certIncompleteState) this.certIncompleteState.style.display = 'none';
      if (this.certNotFoundState) {
        this.certNotFoundState.style.display = 'flex';
        this.certNotFoundState.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

      await this.showCertificateResult(student);

      if (student.status === 'Completed') {
        this.showToast(`Certificate verified for ${toTitleCase(student.name)}!`, 'success');
      }
    } finally {
      this.setCertificateSearchBusy(false);
    }
  }

  validateAuthenticationCode(inputCode) {
    if (!inputCode) {
      return {
        valid: false,
        message: 'Please enter the 6-digit authentication code.'
      };
    }

    const rawToken = localStorage.getItem(this.getStorageKey(STORAGE_KEYS.AUTH_TOKEN)) || localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!rawToken) {
      return {
        valid: false,
        message: 'No active authentication code found. Please generate or check the current 6-digit code in the Admin Portal.'
      };
    }

    try {
      const token = JSON.parse(rawToken);
      if (!token || !token.code) {
        return { valid: false, message: 'Invalid authentication token configuration.' };
      }

      if (token.expiresAt && Date.now() > token.expiresAt) {
        return {
          valid: false,
          message: 'The 6-digit authentication code has expired. Please request a fresh code from your administrator.'
        };
      }

      if (String(token.code).trim() !== String(inputCode).trim()) {
        return {
          valid: false,
          message: 'Invalid authentication code. Please enter the current 6-digit code shown in the Admin Portal.'
        };
      }

      return { valid: true };
    } catch (e) {
      return { valid: false, message: 'Error verifying authentication token.' };
    }
  }

  handleContactMessage(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.replace(/\D/g, '');
    const course = form.elements.course.value.trim();
    const message = form.elements.message.value.trim();

    if (phone.length !== 10) {
      this.showToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }

    const whatsappMessage = [
      'Hello Diganta Computer Centre,',
      '',
      `Name: ${name}`,
      `Mobile: ${phone}`,
      course ? `Interested in: ${course}` : '',
      `Message: ${message}`
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/919733894742?text=${encodeURIComponent(whatsappMessage)}`, '_blank', 'noopener,noreferrer');
    this.showToast('Your message is ready to send on WhatsApp.', 'success');
  }

  showToast(message, type = 'error') {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation';

    toast.innerHTML = `
      <i class="${icon}" style="color: ${type === 'success' ? 'var(--emerald)' : 'var(--rose)'}; font-size: 1.15rem;"></i>
      <span style="font-size: 0.875rem; font-weight: 500; color: var(--text-main);">${escapeHtml(message)}</span>
    `;

    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 4500);
  }
}

// ==========================================================================
// Global Formatters & Helpers
// ==========================================================================
function toTitleCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
    .join(' ');
}

function formatCertificateDate(dateStr) {
  if (!dateStr) {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

function applyAutoCapitalization(inputElement) {
  if (!inputElement) return;

  inputElement.addEventListener('input', (e) => {
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    const original = e.target.value;

    // Capitalize first letter of every word
    const capitalized = original.replace(/\b[a-z]/g, char => char.toUpperCase());
    if (capitalized !== original) {
      e.target.value = capitalized;
      if (start !== null && end !== null) {
        e.target.setSelectionRange(start, end);
      }
    }
  });

  inputElement.addEventListener('blur', (e) => {
    if (e.target.value) {
      e.target.value = toTitleCase(e.target.value);
    }
  });
}

function setupPhoneInputValidation(phoneInput, errorElement) {
  if (!phoneInput) return;

  phoneInput.addEventListener('input', (e) => {
    // Filter non-digits and cap at exactly 10 digits
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 10) val = val.slice(0, 10);
    e.target.value = val;

    if (val.length > 0 && val.length < 10) {
      phoneInput.classList.add('input-error');
      if (errorElement) {
        errorElement.textContent = `Mobile number must be exactly 10 digits (${val.length}/10 entered).`;
        errorElement.style.display = 'block';
      }
    } else {
      phoneInput.classList.remove('input-error');
      if (errorElement) errorElement.style.display = 'none';
    }
  });

  phoneInput.addEventListener('blur', (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length > 0 && val.length !== 10) {
      phoneInput.classList.add('input-error');
      if (errorElement) {
        errorElement.textContent = 'Please enter a valid 10-digit mobile number.';
        errorElement.style.display = 'block';
      }
    } else if (val.length === 10) {
      phoneInput.classList.remove('input-error');
      if (errorElement) errorElement.style.display = 'none';
    }
  });
}

function setupPinCodeInputValidation(pinInput, errorElement) {
  if (!pinInput) return;

  pinInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 6) val = val.slice(0, 6);
    pinInput.value = val;

    if (val.length > 0 && val.length < 6) {
      pinInput.classList.add('input-error');
      if (errorElement) {
        errorElement.textContent = `Pin code must be exactly 6 digits (${val.length}/6 entered).`;
        errorElement.style.display = 'block';
      }
    } else {
      pinInput.classList.remove('input-error');
      if (errorElement) errorElement.style.display = 'none';
    }
  });

  pinInput.addEventListener('blur', (e) => {
    const val = pinInput.value.replace(/\D/g, '');
    if (val.length > 0 && val.length !== 6) {
      pinInput.classList.add('input-error');
      if (errorElement) {
        errorElement.textContent = 'Please enter a valid 6-digit pin code.';
        errorElement.style.display = 'block';
      }
    } else if (val.length === 6) {
      pinInput.classList.remove('input-error');
      if (errorElement) errorElement.style.display = 'none';
    }
  });
}

function setupAadharInputValidation(aadharInput, errorElement) {
  if (!aadharInput) return;

  aadharInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 12) val = val.slice(0, 12);
    aadharInput.value = val;

    if (val.length > 0 && val.length < 12) {
      aadharInput.classList.add('input-error');
      if (errorElement) {
        errorElement.textContent = `Aadhar number must be exactly 12 digits (${val.length}/12 entered).`;
        errorElement.style.display = 'block';
      }
    } else {
      aadharInput.classList.remove('input-error');
      if (errorElement) errorElement.style.display = 'none';
    }
  });

  aadharInput.addEventListener('blur', (e) => {
    const val = aadharInput.value.replace(/\D/g, '');
    if (val.length > 0 && val.length !== 12) {
      aadharInput.classList.add('input-error');
      if (errorElement) {
        errorElement.textContent = 'Please enter a valid 12-digit Aadhar number.';
        errorElement.style.display = 'block';
      }
    } else if (val.length === 12) {
      aadharInput.classList.remove('input-error');
      if (errorElement) errorElement.style.display = 'none';
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setupGalleryLightbox() {
  const lightbox = document.getElementById('galleryLightbox');
  const previewImage = document.getElementById('galleryLightboxImage');
  const closeButton = lightbox?.querySelector('.gallery-lightbox-close');
  const galleryItems = document.querySelectorAll('.gallery-item, .about-certificate-card');
  if (!lightbox || !previewImage || !closeButton || !galleryItems.length) return;

  let activeItem = null;

  const openLightbox = (item) => {
    const image = item.querySelector('img');
    if (!image) return;
    activeItem = item;
    previewImage.src = image.currentSrc || image.src;
    previewImage.alt = image.alt;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    closeButton.focus();
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    previewImage.src = '';
    previewImage.alt = '';
    document.body.style.overflow = '';
    activeItem?.focus();
    activeItem = null;
  };

  galleryItems.forEach((item) => {
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Open ${item.querySelector('img')?.alt || 'gallery image'} in large view`);
    item.addEventListener('click', () => openLightbox(item));
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(item);
      }
    });
  });

  closeButton.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  window.publicApp = new PublicAcademyApp();
  setupGalleryLightbox();
});
