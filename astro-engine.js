(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.JyotishEngine = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Detect precision ephemeris module (loaded separately)
  var _precisionEphemeris = null;
  function getPrecisionEphemeris() {
    if (_precisionEphemeris) return _precisionEphemeris;
    if (typeof PrecisionEphemeris !== "undefined") {
      _precisionEphemeris = PrecisionEphemeris;
      return _precisionEphemeris;
    }
    if (typeof module === "object" && module.exports) {
      try {
        _precisionEphemeris = require("./precision-ephemeris");
        return _precisionEphemeris;
      } catch (e) { /* precision module not available */ }
    }
    return null;
  }

  const SIGN_NAMES = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];

  const SIGN_HINDI = [
    "Mesh", "Vrishabh", "Mithun", "Kark", "Simha", "Kanya",
    "Tula", "Vrishchik", "Dhanu", "Makar", "Kumbh", "Meen"
  ];

  const SIGN_DEVANAGARI = [
    "मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या",
    "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"
  ];

  const SIGN_SYMBOLS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
  const SIGN_LORDS = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
  const SIGN_ELEMENTS = ["Fire", "Earth", "Air", "Water", "Fire", "Earth", "Air", "Water", "Fire", "Earth", "Air", "Water"];
  const SIGN_QUALITIES = ["Movable", "Fixed", "Dual", "Movable", "Fixed", "Dual", "Movable", "Fixed", "Dual", "Movable", "Fixed", "Dual"];

  const NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];

  const NAKSHATRA_LORDS = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
  ];

  const NAKSHATRA_GANA = [
    "Deva", "Manushya", "Rakshasa", "Manushya", "Deva", "Manushya", "Deva", "Deva", "Rakshasa",
    "Rakshasa", "Manushya", "Manushya", "Deva", "Rakshasa", "Deva", "Rakshasa", "Deva", "Rakshasa",
    "Rakshasa", "Manushya", "Manushya", "Deva", "Rakshasa", "Rakshasa", "Manushya", "Manushya", "Deva"
  ];

  const NAKSHATRA_NADI = [
    "Aadi", "Madhya", "Antya", "Antya", "Madhya", "Aadi", "Aadi", "Madhya", "Antya",
    "Antya", "Madhya", "Aadi", "Aadi", "Madhya", "Antya", "Antya", "Madhya", "Aadi",
    "Aadi", "Madhya", "Antya", "Antya", "Madhya", "Aadi", "Aadi", "Madhya", "Antya"
  ];

  const NAKSHATRA_YONI = [
    "Horse", "Elephant", "Sheep", "Serpent", "Serpent", "Dog", "Cat", "Sheep", "Cat",
    "Rat", "Rat", "Cow", "Buffalo", "Tiger", "Buffalo", "Tiger", "Deer", "Deer",
    "Dog", "Monkey", "Mongoose", "Monkey", "Lion", "Horse", "Lion", "Cow", "Elephant"
  ];

  // Classical Nakshatra-to-Varna mapping (Brahmin=4, Kshatriya=3, Vaishya=2, Shudra=1)
  const NAKSHATRA_VARNA = [
    "Kshatriya", "Shudra", "Brahmin", "Shudra", "Vaishya", "Shudra",
    "Vaishya", "Kshatriya", "Shudra", "Kshatriya", "Brahmin", "Kshatriya",
    "Vaishya", "Vaishya", "Shudra", "Brahmin", "Shudra", "Vaishya",
    "Shudra", "Brahmin", "Kshatriya", "Shudra", "Vaishya", "Shudra",
    "Brahmin", "Kshatriya", "Shudra"
  ];

  // Detailed Yoni mapping with animal and gender for each nakshatra
  const NAKSHATRA_YONI_DETAILED = [
    { animal: "Horse", gender: "M" },
    { animal: "Elephant", gender: "M" },
    { animal: "Sheep", gender: "F" },
    { animal: "Serpent", gender: "M" },
    { animal: "Serpent", gender: "F" },
    { animal: "Dog", gender: "F" },
    { animal: "Cat", gender: "F" },
    { animal: "Sheep", gender: "M" },
    { animal: "Cat", gender: "M" },
    { animal: "Rat", gender: "M" },
    { animal: "Rat", gender: "F" },
    { animal: "Cow", gender: "M" },
    { animal: "Buffalo", gender: "F" },
    { animal: "Tiger", gender: "F" },
    { animal: "Buffalo", gender: "M" },
    { animal: "Tiger", gender: "M" },
    { animal: "Deer", gender: "F" },
    { animal: "Deer", gender: "M" },
    { animal: "Dog", gender: "M" },
    { animal: "Monkey", gender: "M" },
    { animal: "Mongoose", gender: "M" },
    { animal: "Monkey", gender: "F" },
    { animal: "Lion", gender: "F" },
    { animal: "Horse", gender: "F" },
    { animal: "Lion", gender: "M" },
    { animal: "Cow", gender: "F" },
    { animal: "Elephant", gender: "F" }
  ];

  // Vashya category for each rashi (sign)
  const SIGN_VASHYA = [
    "Chatushpada", "Chatushpada", "Manava", "Jalachara", "Vanachara", "Manava",
    "Manava", "Keeta", "Chatushpada", "Chatushpada", "Manava", "Jalachara"
  ];

  // Classical Graha Maitri (planetary friendship) table
  const GRAHA_MAITRI_TABLE = {
    Sun:     { friends: ["Moon", "Mars", "Jupiter"], neutrals: ["Mercury"], enemies: ["Venus", "Saturn"] },
    Moon:    { friends: ["Sun", "Mercury"], neutrals: ["Mars", "Jupiter", "Venus", "Saturn"], enemies: [] },
    Mars:    { friends: ["Sun", "Moon", "Jupiter"], neutrals: ["Venus", "Saturn"], enemies: ["Mercury"] },
    Mercury: { friends: ["Sun", "Venus"], neutrals: ["Mars", "Jupiter", "Saturn"], enemies: ["Moon"] },
    Jupiter: { friends: ["Sun", "Moon", "Mars"], neutrals: ["Saturn"], enemies: ["Mercury", "Venus"] },
    Venus:   { friends: ["Mercury", "Saturn"], neutrals: ["Mars", "Jupiter"], enemies: ["Sun", "Moon"] },
    Saturn:  { friends: ["Mercury", "Venus"], neutrals: ["Jupiter"], enemies: ["Sun", "Moon", "Mars"] }
  };

  // Yoni enemy pairs (sworn enemies)
  const YONI_ENEMIES = [
    ["Horse", "Buffalo"],
    ["Elephant", "Lion"],
    ["Sheep", "Monkey"],
    ["Serpent", "Mongoose"],
    ["Dog", "Deer"],
    ["Cat", "Rat"],
    ["Cow", "Tiger"]
  ];

  const DASHA_YEARS = {
    Ketu: 7,
    Venus: 20,
    Sun: 6,
    Moon: 10,
    Mars: 7,
    Rahu: 18,
    Jupiter: 16,
    Saturn: 19,
    Mercury: 17
  };

  const DASHA_SEQUENCE = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

  const TITHI_NAMES = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami",
    "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami",
    "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
  ];

  const YOGA_NAMES = [
    "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma",
    "Dhriti", "Shoola", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
    "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha",
    "Shukla", "Brahma", "Indra", "Vaidhriti"
  ];

  const KARANA_NAMES = [
    "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti", "Bava",
    "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti", "Bava", "Balava",
    "Kaulava", "Taitila", "Gara", "Vanija", "Vishti", "Bava", "Balava", "Kaulava",
    "Taitila", "Gara", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"
  ];

  const CITY_DB = {
    delhi: { name: "Delhi", lat: 28.6139, lon: 77.209, tz: 5.5 },
    "new delhi": { name: "New Delhi", lat: 28.6139, lon: 77.209, tz: 5.5 },
    mumbai: { name: "Mumbai", lat: 19.076, lon: 72.8777, tz: 5.5 },
    bombay: { name: "Mumbai", lat: 19.076, lon: 72.8777, tz: 5.5 },
    kolkata: { name: "Kolkata", lat: 22.5726, lon: 88.3639, tz: 5.5 },
    calcutta: { name: "Kolkata", lat: 22.5726, lon: 88.3639, tz: 5.5 },
    chennai: { name: "Chennai", lat: 13.0827, lon: 80.2707, tz: 5.5 },
    bangalore: { name: "Bengaluru", lat: 12.9716, lon: 77.5946, tz: 5.5 },
    bengaluru: { name: "Bengaluru", lat: 12.9716, lon: 77.5946, tz: 5.5 },
    hyderabad: { name: "Hyderabad", lat: 17.385, lon: 78.4867, tz: 5.5 },
    pune: { name: "Pune", lat: 18.5204, lon: 73.8567, tz: 5.5 },
    ahmedabad: { name: "Ahmedabad", lat: 23.0225, lon: 72.5714, tz: 5.5 },
    jaipur: { name: "Jaipur", lat: 26.9124, lon: 75.7873, tz: 5.5 },
    ajmer: { name: "Ajmer, Rajasthan", lat: 26.4499, lon: 74.6399, tz: 5.5 },
    "ajmer, rajasthan": { name: "Ajmer, Rajasthan", lat: 26.4499, lon: 74.6399, tz: 5.5 },
    alwar: { name: "Alwar, Rajasthan", lat: 27.553, lon: 76.6346, tz: 5.5 },
    "alwar, rajasthan": { name: "Alwar, Rajasthan", lat: 27.553, lon: 76.6346, tz: 5.5 },
    bikaner: { name: "Bikaner, Rajasthan", lat: 28.0229, lon: 73.3119, tz: 5.5 },
    "bikaner, rajasthan": { name: "Bikaner, Rajasthan", lat: 28.0229, lon: 73.3119, tz: 5.5 },
    jodhpur: { name: "Jodhpur, Rajasthan", lat: 26.2389, lon: 73.0243, tz: 5.5 },
    "jodhpur, rajasthan": { name: "Jodhpur, Rajasthan", lat: 26.2389, lon: 73.0243, tz: 5.5 },
    kota: { name: "Kota, Rajasthan", lat: 25.2138, lon: 75.8648, tz: 5.5 },
    "kota, rajasthan": { name: "Kota, Rajasthan", lat: 25.2138, lon: 75.8648, tz: 5.5 },
    udaipur: { name: "Udaipur, Rajasthan", lat: 24.5854, lon: 73.7125, tz: 5.5 },
    "udaipur, rajasthan": { name: "Udaipur, Rajasthan", lat: 24.5854, lon: 73.7125, tz: 5.5 },
    jaisalmer: { name: "Jaisalmer, Rajasthan", lat: 26.9157, lon: 70.9083, tz: 5.5 },
    "jaisalmer, rajasthan": { name: "Jaisalmer, Rajasthan", lat: 26.9157, lon: 70.9083, tz: 5.5 },
    pilani: { name: "Pilani, Rajasthan", lat: 28.367, lon: 75.603, tz: 5.5 },
    "pilani, rajasthan": { name: "Pilani, Rajasthan", lat: 28.367, lon: 75.603, tz: 5.5 },
    jhunjhunu: { name: "Jhunjhunu, Rajasthan", lat: 28.1289, lon: 75.3995, tz: 5.5 },
    "jhunjhunu, rajasthan": { name: "Jhunjhunu, Rajasthan", lat: 28.1289, lon: 75.3995, tz: 5.5 },
    sikar: { name: "Sikar, Rajasthan", lat: 27.6094, lon: 75.1399, tz: 5.5 },
    "sikar, rajasthan": { name: "Sikar, Rajasthan", lat: 27.6094, lon: 75.1399, tz: 5.5 },
    churu: { name: "Churu, Rajasthan", lat: 28.2925, lon: 74.9707, tz: 5.5 },
    "churu, rajasthan": { name: "Churu, Rajasthan", lat: 28.2925, lon: 74.9707, tz: 5.5 },
    bharatpur: { name: "Bharatpur, Rajasthan", lat: 27.2167, lon: 77.4895, tz: 5.5 },
    "bharatpur, rajasthan": { name: "Bharatpur, Rajasthan", lat: 27.2167, lon: 77.4895, tz: 5.5 },
    bhilwara: { name: "Bhilwara, Rajasthan", lat: 25.3407, lon: 74.6313, tz: 5.5 },
    "bhilwara, rajasthan": { name: "Bhilwara, Rajasthan", lat: 25.3407, lon: 74.6313, tz: 5.5 },
    barmer: { name: "Barmer, Rajasthan", lat: 25.7532, lon: 71.4181, tz: 5.5 },
    "barmer, rajasthan": { name: "Barmer, Rajasthan", lat: 25.7532, lon: 71.4181, tz: 5.5 },
    lucknow: { name: "Lucknow", lat: 26.8467, lon: 80.9462, tz: 5.5 },
    patna: { name: "Patna", lat: 25.5941, lon: 85.1376, tz: 5.5 },
    varanasi: { name: "Varanasi", lat: 25.3176, lon: 82.9739, tz: 5.5 },
    banaras: { name: "Varanasi", lat: 25.3176, lon: 82.9739, tz: 5.5 },
    kanpur: { name: "Kanpur", lat: 26.4499, lon: 80.3319, tz: 5.5 },
    surat: { name: "Surat", lat: 21.1702, lon: 72.8311, tz: 5.5 },
    indore: { name: "Indore", lat: 22.7196, lon: 75.8577, tz: 5.5 },
    bhopal: { name: "Bhopal", lat: 23.2599, lon: 77.4126, tz: 5.5 },
    nagpur: { name: "Nagpur", lat: 21.1458, lon: 79.0882, tz: 5.5 },
    chandigarh: { name: "Chandigarh", lat: 30.7333, lon: 76.7794, tz: 5.5 },
    dehradun: { name: "Dehradun", lat: 30.3165, lon: 78.0322, tz: 5.5 },
    noida: { name: "Noida", lat: 28.5355, lon: 77.391, tz: 5.5 },
    gurgaon: { name: "Gurugram", lat: 28.4595, lon: 77.0266, tz: 5.5 },
    gurugram: { name: "Gurugram", lat: 28.4595, lon: 77.0266, tz: 5.5 },
    pilibhit: { name: "Pilibhit, Uttar Pradesh", lat: 28.6267, lon: 79.8045, tz: 5.5 },
    "pilibhit, uttar pradesh": { name: "Pilibhit, Uttar Pradesh", lat: 28.6267, lon: 79.8045, tz: 5.5 },
    pithoragarh: { name: "Pithoragarh, Uttarakhand", lat: 29.5829, lon: 80.2182, tz: 5.5 },
    "pithoragarh, uttarakhand": { name: "Pithoragarh, Uttarakhand", lat: 29.5829, lon: 80.2182, tz: 5.5 },
    pinjore: { name: "Pinjore, Haryana", lat: 30.7972, lon: 76.9182, tz: 5.5 },
    "pinjore, haryana": { name: "Pinjore, Haryana", lat: 30.7972, lon: 76.9182, tz: 5.5 },
    "pimpri chinchwad": { name: "Pimpri-Chinchwad, Maharashtra", lat: 18.6298, lon: 73.7997, tz: 5.5 },
    "pimpri-chinchwad": { name: "Pimpri-Chinchwad, Maharashtra", lat: 18.6298, lon: 73.7997, tz: 5.5 },
    "pimpri-chinchwad, maharashtra": { name: "Pimpri-Chinchwad, Maharashtra", lat: 18.6298, lon: 73.7997, tz: 5.5 },
    puri: { name: "Puri, Odisha", lat: 19.8135, lon: 85.8312, tz: 5.5 },
    "puri, odisha": { name: "Puri, Odisha", lat: 19.8135, lon: 85.8312, tz: 5.5 },
    aurangabad: { name: "Aurangabad, Maharashtra", lat: 19.8762, lon: 75.3433, tz: 5.5 },
    "aurangabad, maharashtra": { name: "Aurangabad, Maharashtra", lat: 19.8762, lon: 75.3433, tz: 5.5 },
    "aurangabad, bihar": { name: "Aurangabad, Bihar", lat: 24.752, lon: 84.3742, tz: 5.5 },
    bilaspur: { name: "Bilaspur, Chhattisgarh", lat: 22.0797, lon: 82.1391, tz: 5.5 },
    "bilaspur, chhattisgarh": { name: "Bilaspur, Chhattisgarh", lat: 22.0797, lon: 82.1391, tz: 5.5 },
    "bilaspur, himachal pradesh": { name: "Bilaspur, Himachal Pradesh", lat: 31.3419, lon: 76.7625, tz: 5.5 },
    hamirpur: { name: "Hamirpur, Himachal Pradesh", lat: 31.6862, lon: 76.5213, tz: 5.5 },
    "hamirpur, himachal pradesh": { name: "Hamirpur, Himachal Pradesh", lat: 31.6862, lon: 76.5213, tz: 5.5 },
    "hamirpur, uttar pradesh": { name: "Hamirpur, Uttar Pradesh", lat: 25.9553, lon: 80.1484, tz: 5.5 },
    pratapgarh: { name: "Pratapgarh, Uttar Pradesh", lat: 25.8973, lon: 81.9453, tz: 5.5 },
    "pratapgarh, uttar pradesh": { name: "Pratapgarh, Uttar Pradesh", lat: 25.8973, lon: 81.9453, tz: 5.5 },
    "pratapgarh, rajasthan": { name: "Pratapgarh, Rajasthan", lat: 24.0309, lon: 74.7815, tz: 5.5 },
    balrampur: { name: "Balrampur, Uttar Pradesh", lat: 27.4292, lon: 82.1859, tz: 5.5 },
    "balrampur, uttar pradesh": { name: "Balrampur, Uttar Pradesh", lat: 27.4292, lon: 82.1859, tz: 5.5 },
    "balrampur, chhattisgarh": { name: "Balrampur, Chhattisgarh", lat: 23.6039, lon: 83.6101, tz: 5.5 },
    raigarh: { name: "Raigarh, Chhattisgarh", lat: 21.8974, lon: 83.3966, tz: 5.5 },
    "raigarh, chhattisgarh": { name: "Raigarh, Chhattisgarh", lat: 21.8974, lon: 83.3966, tz: 5.5 },
    "raigad, maharashtra": { name: "Raigad, Maharashtra", lat: 18.5158, lon: 73.1822, tz: 5.5 },
    london: { name: "London", lat: 51.5072, lon: -0.1276, tz: 0 },
    "new york": { name: "New York", lat: 40.7128, lon: -74.006, tz: -5 },
    dubai: { name: "Dubai", lat: 25.2048, lon: 55.2708, tz: 4 },
    singapore: { name: "Singapore", lat: 1.3521, lon: 103.8198, tz: 8 }
  };

  const STATE_DB = {
    "andhra pradesh": { name: "Andhra Pradesh", lat: 15.9129, lon: 79.74, tz: 5.5 },
    "arunachal pradesh": { name: "Arunachal Pradesh", lat: 28.218, lon: 94.7278, tz: 5.5 },
    assam: { name: "Assam", lat: 26.2006, lon: 92.9376, tz: 5.5 },
    bihar: { name: "Bihar", lat: 25.0961, lon: 85.3131, tz: 5.5 },
    chhattisgarh: { name: "Chhattisgarh", lat: 21.2787, lon: 81.8661, tz: 5.5 },
    delhi: { name: "Delhi", lat: 28.6139, lon: 77.209, tz: 5.5 },
    goa: { name: "Goa", lat: 15.2993, lon: 74.124, tz: 5.5 },
    gujarat: { name: "Gujarat", lat: 22.2587, lon: 71.1924, tz: 5.5 },
    haryana: { name: "Haryana", lat: 29.0588, lon: 76.0856, tz: 5.5 },
    "himachal pradesh": { name: "Himachal Pradesh", lat: 31.1048, lon: 77.1734, tz: 5.5 },
    jharkhand: { name: "Jharkhand", lat: 23.6102, lon: 85.2799, tz: 5.5 },
    karnataka: { name: "Karnataka", lat: 15.3173, lon: 75.7139, tz: 5.5 },
    kerala: { name: "Kerala", lat: 10.8505, lon: 76.2711, tz: 5.5 },
    "madhya pradesh": { name: "Madhya Pradesh", lat: 22.9734, lon: 78.6569, tz: 5.5 },
    maharashtra: { name: "Maharashtra", lat: 19.7515, lon: 75.7139, tz: 5.5 },
    manipur: { name: "Manipur", lat: 24.6637, lon: 93.9063, tz: 5.5 },
    meghalaya: { name: "Meghalaya", lat: 25.467, lon: 91.3662, tz: 5.5 },
    mizoram: { name: "Mizoram", lat: 23.1645, lon: 92.9376, tz: 5.5 },
    nagaland: { name: "Nagaland", lat: 26.1584, lon: 94.5624, tz: 5.5 },
    odisha: { name: "Odisha", lat: 20.9517, lon: 85.0985, tz: 5.5 },
    punjab: { name: "Punjab", lat: 31.1471, lon: 75.3412, tz: 5.5 },
    rajasthan: { name: "Rajasthan", lat: 27.0238, lon: 74.2179, tz: 5.5 },
    sikkim: { name: "Sikkim", lat: 27.533, lon: 88.5122, tz: 5.5 },
    "tamil nadu": { name: "Tamil Nadu", lat: 11.1271, lon: 78.6569, tz: 5.5 },
    telangana: { name: "Telangana", lat: 18.1124, lon: 79.0193, tz: 5.5 },
    tripura: { name: "Tripura", lat: 23.9408, lon: 91.9882, tz: 5.5 },
    "uttar pradesh": { name: "Uttar Pradesh", lat: 26.8467, lon: 80.9462, tz: 5.5 },
    uttarakhand: { name: "Uttarakhand", lat: 30.0668, lon: 79.0193, tz: 5.5 },
    "west bengal": { name: "West Bengal", lat: 22.9868, lon: 87.855, tz: 5.5 }
  };

  function placeSuggestions() {
    const seen = {};
    return Object.keys(CITY_DB)
      .map(function (key) { return CITY_DB[key].name; })
      .filter(function (name) {
        const normalized = name.toLowerCase();
        if (seen[normalized]) return false;
        seen[normalized] = true;
        return true;
      })
      .sort();
  }

  const PLANET_MEAN = {
    Sun: { base: 280.46646, rate: 0.98564736 },
    Moon: { base: 218.316, rate: 13.176396 },
    Mercury: { base: 252.251, rate: 4.09233445 },
    Venus: { base: 181.98, rate: 1.60213034 },
    Mars: { base: 355.433, rate: 0.52402068 },
    Jupiter: { base: 34.351, rate: 0.08308529 },
    Saturn: { base: 50.077, rate: 0.03344414 }
  };

  const PLANET_WEIGHTS = {
    Sun: 1,
    Moon: 1.4,
    Mercury: 0.7,
    Venus: 0.8,
    Mars: 0.8,
    Jupiter: 0.9,
    Saturn: 0.9,
    Rahu: 0.6,
    Ketu: 0.6
  };

  function normalize(value) {
    let result = value % 360;
    if (result < 0) result += 360;
    return result;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function toRadians(value) {
    return value * Math.PI / 180;
  }

  function toDegrees(value) {
    return value * 180 / Math.PI;
  }

  function pad2(value) {
    return String(Math.floor(Math.abs(value))).padStart(2, "0");
  }

  function titleCase(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, function (char) { return char.toUpperCase(); });
  }

  function hashSeed(value) {
    const text = String(value || "");
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function seededPick(seed, list) {
    const numeric = Math.floor(Number(seed) || 0);
    const index = ((numeric % list.length) + list.length) % list.length;
    return list[index];
  }

  function dateParts(dateLike) {
    const value = dateLike || new Date();
    if (value instanceof Date) {
      return {
        year: value.getUTCFullYear(),
        month: value.getUTCMonth() + 1,
        day: value.getUTCDate()
      };
    }
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
    }
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return {
        year: parsed.getUTCFullYear(),
        month: parsed.getUTCMonth() + 1,
        day: parsed.getUTCDate()
      };
    }
    const now = new Date();
    return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1, day: now.getUTCDate() };
  }

  function formatDate(parts) {
    return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
  }

  function formatTimeFromHours(hours) {
    const normalized = ((hours % 24) + 24) % 24;
    const hour = Math.floor(normalized);
    const minute = Math.round((normalized - hour) * 60);
    if (minute === 60) return `${pad2(hour + 1)}:00`;
    return `${pad2(hour)}:${pad2(minute)}`;
  }

  function parseTime(time) {
    const match = String(time || "12:00").match(/^(\d{1,2})(?::(\d{1,2}))?/);
    if (!match) return { hour: 12, minute: 0 };
    return {
      hour: clamp(Number(match[1]), 0, 23),
      minute: clamp(Number(match[2] || 0), 0, 59)
    };
  }

  function resolvePlace(place) {
    if (typeof place === "object" && place) {
      return {
        name: place.name || "Custom Location",
        lat: Number(place.lat) || 28.6139,
        lon: Number(place.lon) || 77.209,
        tz: Number.isFinite(Number(place.tz)) ? Number(place.tz) : 5.5
      };
    }

    const raw = String(place || "").trim();
    const coordinates = raw.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)(?:\s*,\s*(-?\d+(?:\.\d+)?))?/);
    if (coordinates) {
      return {
        name: raw,
        lat: clamp(Number(coordinates[1]), -90, 90),
        lon: clamp(Number(coordinates[2]), -180, 180),
        tz: coordinates[3] ? Number(coordinates[3]) : 5.5
      };
    }

    const key = raw.toLowerCase().replace(/\s+/g, " ");
    if (CITY_DB[key]) return Object.assign({}, CITY_DB[key]);

    const stateFallback = resolveCityStateFallback(raw);
    if (stateFallback) return stateFallback;

    const partial = Object.keys(CITY_DB).find(function (city) {
      return key.indexOf(city) >= 0 || city.indexOf(key) >= 0;
    });
    if (partial) return Object.assign({}, CITY_DB[partial]);

    return { name: raw || "Delhi", lat: 28.6139, lon: 77.209, tz: 5.5, note: "Approximate coordinates used" };
  }

  function resolveCityStateFallback(raw) {
    const parts = String(raw || "").split(",").map(function (item) { return item.trim(); }).filter(Boolean);
    if (parts.length < 2) return null;

    const stateKey = parts[parts.length - 1].toLowerCase().replace(/\s+/g, " ");
    const state = STATE_DB[stateKey];
    if (!state) return null;

    const city = parts.slice(0, -1).join(", ");
    const seed = hashSeed(city.toLowerCase());
    const latOffset = (((seed % 1000) / 1000) - 0.5) * 1.2;
    const lonOffset = ((((seed >>> 10) % 1000) / 1000) - 0.5) * 1.2;
    return {
      name: `${titleCase(city)}, ${state.name}`,
      lat: Number(clamp(state.lat + latOffset, -90, 90).toFixed(4)),
      lon: Number(clamp(state.lon + lonOffset, -180, 180).toFixed(4)),
      tz: state.tz,
      note: "Approximate state-based coordinates used"
    };
  }

  function julianDayFromUTC(date) {
    let year = date.getUTCFullYear();
    let month = date.getUTCMonth() + 1;
    const day = date.getUTCDate() +
      (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;

    if (month <= 2) {
      year -= 1;
      month += 12;
    }

    const a = Math.floor(year / 100);
    const b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (year + 4716)) +
      Math.floor(30.6001 * (month + 1)) +
      day + b - 1524.5;
  }

  function utcDateFromLocal(date, time, place) {
    const parts = dateParts(date);
    const parsedTime = parseTime(time);
    const location = resolvePlace(place);
    const utcMs = Date.UTC(parts.year, parts.month - 1, parts.day, parsedTime.hour, parsedTime.minute, 0) -
      (location.tz * 60 * 60 * 1000);
    return { utcDate: new Date(utcMs), location: location, localDate: parts, localTime: parsedTime };
  }

  function ayanamsa(jd) {
    var pe = getPrecisionEphemeris();
    if (pe && pe.precisionAyanamsa) {
      return pe.precisionAyanamsa(jd);
    }
    // Fallback: simple linear approximation
    const year = 2000 + (jd - 2451545.0) / 365.2425;
    return 23.85675 + 0.013968 * (year - 2000);
  }

  function signIndex(longitude) {
    return Math.floor(normalize(longitude) / 30);
  }

  function signName(longitude) {
    return SIGN_NAMES[signIndex(longitude)];
  }

  function degreeInSign(longitude) {
    return normalize(longitude) % 30;
  }

  function formatDegree(longitude) {
    const degree = degreeInSign(longitude);
    const whole = Math.floor(degree);
    const minute = Math.floor((degree - whole) * 60);
    return `${whole}° ${pad2(minute)}'`;
  }

  function nakshatraInfo(longitude) {
    const normalized = normalize(longitude);
    const span = 360 / 27;
    const index = Math.floor(normalized / span);
    const within = normalized - (index * span);
    const pada = Math.floor(within / (span / 4)) + 1;
    return {
      index: index,
      name: NAKSHATRAS[index],
      lord: NAKSHATRA_LORDS[index],
      pada: pada,
      gana: NAKSHATRA_GANA[index],
      nadi: NAKSHATRA_NADI[index],
      yoni: NAKSHATRA_YONI[index],
      degreesInto: within,
      percent: within / span
    };
  }

  function planetaryLongitudes(jd) {
    // Use precision ephemeris if available
    var pe = getPrecisionEphemeris();
    if (pe && pe.precisionLongitudes) {
      return pe.precisionLongitudes(jd);
    }

    // Fallback: approximate calculations
    const d = jd - 2451545.0;
    const t = d / 36525;
    const lahiri = ayanamsa(jd);
    const meanSun = normalize(280.46646 + 36000.76983 * t + 0.0003032 * t * t);
    const meanAnomalySun = normalize(357.52911 + 35999.05029 * t - 0.0001537 * t * t);
    const sunEquation = (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(toRadians(meanAnomalySun)) +
      (0.019993 - 0.000101 * t) * Math.sin(toRadians(2 * meanAnomalySun)) +
      0.000289 * Math.sin(toRadians(3 * meanAnomalySun));
    const trueSun = normalize(meanSun + sunEquation);

    const moonMean = normalize(218.3164477 + 481267.88123421 * t - 0.0015786 * t * t);
    const moonD = normalize(297.8501921 + 445267.1114034 * t - 0.0018819 * t * t);
    const moonM = normalize(357.5291092 + 35999.0502909 * t - 0.0001536 * t * t);
    const moonMp = normalize(134.9633964 + 477198.8675055 * t + 0.0087414 * t * t);
    const moonF = normalize(93.272095 + 483202.0175233 * t - 0.0036539 * t * t);
    const trueMoon = normalize(moonMean +
      6.289 * Math.sin(toRadians(moonMp)) +
      1.274 * Math.sin(toRadians(2 * moonD - moonMp)) +
      0.658 * Math.sin(toRadians(2 * moonD)) +
      0.214 * Math.sin(toRadians(2 * moonMp)) -
      0.186 * Math.sin(toRadians(moonM)) -
      0.114 * Math.sin(toRadians(2 * moonF)));

    const rahuTropical = normalize(125.04452 - 1934.136261 * t + 0.0020708 * t * t + (t * t * t) / 450000);
    const positions = {
      Sun: normalize(trueSun - lahiri),
      Moon: normalize(trueMoon - lahiri),
      Rahu: normalize(rahuTropical - lahiri),
      Ketu: normalize(rahuTropical + 180 - lahiri)
    };

    Object.keys(PLANET_MEAN).forEach(function (planet) {
      if (planet === "Sun" || planet === "Moon") return;
      const item = PLANET_MEAN[planet];
      const mean = normalize(item.base + item.rate * d);
      const correction = planet === "Mercury" ? 20 * Math.sin(toRadians(mean - trueSun)) :
        planet === "Venus" ? 8 * Math.sin(toRadians(mean - trueSun)) :
        planet === "Mars" ? 10 * Math.sin(toRadians(trueSun - mean)) :
        planet === "Jupiter" ? 5 * Math.sin(toRadians(trueSun - mean)) :
        3 * Math.sin(toRadians(trueSun - mean));
      positions[planet] = normalize(mean + correction - lahiri);
    });

    return positions;
  }

  function localSiderealTime(jd, lon) {
    const t = (jd - 2451545.0) / 36525;
    const gmst = 280.46061837 +
      360.98564736629 * (jd - 2451545.0) +
      0.000387933 * t * t -
      (t * t * t) / 38710000;
    return normalize(gmst + lon);
  }

  function ascendantLongitude(jd, lat, lon) {
    const lst = toRadians(localSiderealTime(jd, lon));
    const eps = toRadians(23.439291 - 0.0130042 * ((jd - 2451545.0) / 36525));
    const phi = toRadians(lat);
    const asc = Math.atan2(
      -Math.cos(lst),
      Math.sin(lst) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)
    );
    return normalize(toDegrees(asc) - ayanamsa(jd));
  }

  function planetRow(name, longitude, ascSign) {
    const sign = signIndex(longitude);
    const nak = nakshatraInfo(longitude);
    return {
      planet: name,
      sign: SIGN_NAMES[sign],
      rashi: SIGN_HINDI[sign],
      symbol: SIGN_SYMBOLS[sign],
      degree: formatDegree(longitude),
      longitude: Number(normalize(longitude).toFixed(3)),
      nakshatra: nak.name,
      pada: nak.pada,
      house: ((sign - ascSign + 12) % 12) + 1
    };
  }

  function planetStrength(planet, row) {
    const ownSign = SIGN_LORDS[SIGN_NAMES.indexOf(row.sign)] === planet;
    const houseBoost = [1, 4, 5, 7, 9, 10].indexOf(row.house) >= 0 ? 18 : 0;
    const planetBase = {
      Sun: 64,
      Moon: 66,
      Mars: 59,
      Mercury: 62,
      Jupiter: 72,
      Venus: 68,
      Saturn: 55,
      Rahu: 49,
      Ketu: 48
    }[planet] || 55;
    return clamp(planetBase + houseBoost + (ownSign ? 12 : 0), 35, 95);
  }

  function chartSummary(rows, ascSign, moonRow) {
    const strongest = rows
      .filter(function (row) { return row.planet !== "Rahu" && row.planet !== "Ketu"; })
      .map(function (row) { return { planet: row.planet, strength: planetStrength(row.planet, row), row: row }; })
      .sort(function (a, b) { return b.strength - a.strength; })[0];

    const ascLord = SIGN_LORDS[ascSign];
    const moonNak = nakshatraInfo(moonRow.longitude);
    return [
      `Lagna ${SIGN_HINDI[ascSign]} (${SIGN_NAMES[ascSign]}) hai, isliye personality me ${SIGN_ELEMENTS[ascSign].toLowerCase()} tattva aur ${SIGN_QUALITIES[ascSign].toLowerCase()} nature prominent hai.`,
      `Moon ${moonRow.rashi} rashi aur ${moonNak.name} nakshatra me hai, emotional pattern ${moonNak.gana} gana ki tarah respond karta hai.`,
      `${strongest.planet} chart me comparatively strong dikh raha hai; ${strongest.row.house}th house matters par natural support milta hai.`,
      `Lagna lord ${ascLord} ko practical decisions me anchor maan kar career, health aur relationship guidance ko read karein.`
    ];
  }

  function addYearsToDate(date, years) {
    var ms = date.getTime() + years * 365.2425 * 24 * 60 * 60 * 1000;
    return new Date(ms);
  }

  function formatDateISO(d) {
    var y = d.getUTCFullYear();
    var m = d.getUTCMonth() + 1;
    var day = d.getUTCDate();
    return y + "-" + pad2(m) + "-" + pad2(day);
  }

  function dashaSequenceFrom(startPlanet) {
    var idx = DASHA_SEQUENCE.indexOf(startPlanet);
    var seq = [];
    for (var i = 0; i < 9; i++) {
      seq.push(DASHA_SEQUENCE[(idx + i) % 9]);
    }
    return seq;
  }

  function currentDasha(moonLongitude, birthDate) {
    var nak = nakshatraInfo(moonLongitude);
    var lord = nak.lord;
    var years = DASHA_YEARS[lord];
    var balanceYears = (1 - nak.percent) * years;
    var startIndex = DASHA_SEQUENCE.indexOf(lord);

    // Build full 9 mahadasha sequence with actual dates
    var birthMs = birthDate ? birthDate.getTime() : Date.now();
    var birthD = new Date(birthMs);
    var fullSequence = [];
    var cursorDate = new Date(birthMs);

    for (var i = 0; i < 9; i++) {
      var planet = DASHA_SEQUENCE[(startIndex + i) % 9];
      var length = (i === 0) ? balanceYears : DASHA_YEARS[planet];
      var startDate = new Date(cursorDate.getTime());
      var endDate = addYearsToDate(cursorDate, length);
      fullSequence.push({
        planet: planet,
        totalYears: Number(length.toFixed(4)),
        startDate: formatDateISO(startDate),
        endDate: formatDateISO(endDate)
      });
      cursorDate = endDate;
    }

    // Find active mahadasha based on current date
    var now = new Date(Date.now());
    var activeMD = null;
    for (var m = 0; m < fullSequence.length; m++) {
      var mdStart = new Date(fullSequence[m].startDate + "T00:00:00Z");
      var mdEnd = new Date(fullSequence[m].endDate + "T00:00:00Z");
      if (now >= mdStart && now < mdEnd) {
        activeMD = fullSequence[m];
        break;
      }
    }
    if (!activeMD) activeMD = fullSequence[fullSequence.length - 1];

    // Build antardasha sequence within the active mahadasha
    var mdPlanet = activeMD.planet;
    var mdYears = activeMD.totalYears;
    var mdStartDate = new Date(activeMD.startDate + "T00:00:00Z");
    var adSequence = dashaSequenceFrom(mdPlanet);
    var antardashaList = [];
    var adCursor = new Date(mdStartDate.getTime());

    for (var a = 0; a < 9; a++) {
      var adPlanet = adSequence[a];
      var adYears = (mdYears * DASHA_YEARS[adPlanet]) / 120;
      var adStart = new Date(adCursor.getTime());
      var adEnd = addYearsToDate(adCursor, adYears);
      antardashaList.push({
        mahadasha: mdPlanet,
        antardasha: adPlanet,
        totalYears: Number(adYears.toFixed(4)),
        from: formatDateISO(adStart),
        to: formatDateISO(adEnd)
      });
      adCursor = adEnd;
    }

    // Find active antardasha
    var activeAD = null;
    for (var b = 0; b < antardashaList.length; b++) {
      var aStart = new Date(antardashaList[b].from + "T00:00:00Z");
      var aEnd = new Date(antardashaList[b].to + "T00:00:00Z");
      if (now >= aStart && now < aEnd) {
        activeAD = antardashaList[b];
        break;
      }
    }
    if (!activeAD) activeAD = antardashaList[antardashaList.length - 1];

    // Build pratyantar dasha sequence within the active antardasha
    var adActivePlanet = activeAD.antardasha;
    var adActiveYears = activeAD.totalYears;
    var adActiveStart = new Date(activeAD.from + "T00:00:00Z");
    var pdSequence = dashaSequenceFrom(adActivePlanet);
    var pratyantarList = [];
    var pdCursor = new Date(adActiveStart.getTime());

    for (var p = 0; p < 9; p++) {
      var pdPlanet = pdSequence[p];
      var pdYears = (adActiveYears * DASHA_YEARS[pdPlanet]) / 120;
      var pdDays = pdYears * 365.2425;
      var pdStart = new Date(pdCursor.getTime());
      var pdEnd = addYearsToDate(pdCursor, pdYears);
      pratyantarList.push({
        planet: pdPlanet,
        totalDays: Math.round(pdDays),
        from: formatDateISO(pdStart),
        to: formatDateISO(pdEnd)
      });
      pdCursor = pdEnd;
    }

    // Find active pratyantar
    var activePD = null;
    for (var c = 0; c < pratyantarList.length; c++) {
      var pStart = new Date(pratyantarList[c].from + "T00:00:00Z");
      var pEnd = new Date(pratyantarList[c].to + "T00:00:00Z");
      if (now >= pStart && now < pEnd) {
        activePD = pratyantarList[c];
        break;
      }
    }
    if (!activePD) activePD = pratyantarList[pratyantarList.length - 1];

    return {
      birthNakshatraLord: lord,
      balanceAtBirthYears: Number(balanceYears.toFixed(2)),
      activeMahadasha: activeMD.planet,
      fullSequence: fullSequence,
      active: {
        mahadasha: {
          planet: activeMD.planet,
          startDate: activeMD.startDate,
          endDate: activeMD.endDate,
          totalYears: activeMD.totalYears
        },
        antardasha: {
          planet: activeAD.antardasha,
          startDate: activeAD.from,
          endDate: activeAD.to,
          totalYears: activeAD.totalYears
        },
        pratyantar: {
          planet: activePD.planet,
          startDate: activePD.from,
          endDate: activePD.to,
          totalDays: activePD.totalDays
        },
        sequence: antardashaList
      },
      sequence: fullSequence.slice(0, 5)
    };
  }

  function makeChart(input) {
    const data = input || {};
    const resolved = utcDateFromLocal(data.date, data.time, data.place);
    const jd = julianDayFromUTC(resolved.utcDate);
    const longitudes = planetaryLongitudes(jd);
    const asc = ascendantLongitude(jd, resolved.location.lat, resolved.location.lon);
    const ascSign = signIndex(asc);
    const rows = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]
      .map(function (planet) { return planetRow(planet, longitudes[planet], ascSign); });
    const moonRow = rows.find(function (row) { return row.planet === "Moon"; });
    const sunRow = rows.find(function (row) { return row.planet === "Sun"; });
    const birthDate = new Date(resolved.utcDate.getTime());

    return {
      name: titleCase(data.name || "Native"),
      input: {
        date: formatDate(resolved.localDate),
        time: `${pad2(resolved.localTime.hour)}:${pad2(resolved.localTime.minute)}`,
        place: resolved.location.name,
        timezone: `UTC${resolved.location.tz >= 0 ? "+" : ""}${resolved.location.tz}`
      },
      location: resolved.location,
      julianDay: Number(jd.toFixed(5)),
      ayanamsa: Number(ayanamsa(jd).toFixed(4)),
      ascendant: {
        sign: SIGN_NAMES[ascSign],
        rashi: SIGN_HINDI[ascSign],
        symbol: SIGN_SYMBOLS[ascSign],
        degree: formatDegree(asc),
        longitude: Number(asc.toFixed(3)),
        lord: SIGN_LORDS[ascSign]
      },
      moonSign: {
        sign: moonRow.sign,
        rashi: moonRow.rashi,
        symbol: moonRow.symbol,
        nakshatra: moonRow.nakshatra,
        pada: moonRow.pada
      },
      sunSign: {
        sign: sunRow.sign,
        rashi: sunRow.rashi,
        symbol: sunRow.symbol
      },
      planets: rows.map(function (row) {
        return Object.assign({}, row, { strength: planetStrength(row.planet, row) });
      }),
      dasha: currentDasha(moonRow.longitude, birthDate),
      summary: chartSummary(rows, ascSign, moonRow),
      disclaimer: "This is a local rule-based Vedic astrology calculation with approximate ephemeris, not a paid third-party API."
    };
  }

  function houseThemes(chart) {
    const themes = {
      1: "self-image aur health",
      2: "family, speech aur savings",
      3: "communication aur efforts",
      4: "home, comfort aur education",
      5: "creativity, romance aur children",
      6: "routine, service aur competition",
      7: "relationship aur partnership",
      8: "transformation aur hidden matters",
      9: "luck, dharma aur higher learning",
      10: "career, status aur responsibility",
      11: "income, network aur gains",
      12: "foreign links, sleep aur spirituality"
    };
    return chart.planets
      .filter(function (row) { return row.planet !== "Rahu" && row.planet !== "Ketu"; })
      .sort(function (a, b) { return b.strength - a.strength; })
      .slice(0, 3)
      .map(function (row) {
        return `${row.planet} ${row.house}th house me ${themes[row.house]} ko activate karta hai.`;
      });
  }

  // ========== NAVAMSA (D9) DIVISIONAL CHART ==========
  // Navamsa divides each sign (30°) into 9 equal parts (3°20' each = navamsa).
  // Starting sign for navamsa cycle depends on the element of the rashi:
  //   Fire signs (Aries, Leo, Sagittarius) → cycle starts from Aries
  //   Earth signs (Taurus, Virgo, Capricorn) → cycle starts from Capricorn
  //   Air signs (Gemini, Libra, Aquarius) → cycle starts from Libra
  //   Water signs (Cancer, Scorpio, Pisces) → cycle starts from Cancer

  var NAVAMSA_START = {
    Fire: 0,    // Aries
    Earth: 9,   // Capricorn
    Air: 6,     // Libra
    Water: 3    // Cancer
  };

  function navamsaSign(longitude) {
    var normalLon = normalize(longitude);
    var rashiIndex = Math.floor(normalLon / 30);
    var degreeInRashi = normalLon - (rashiIndex * 30);
    var navamsaPada = Math.floor(degreeInRashi / (30 / 9)); // 0-8 (which navamsa within the sign)
    var element = SIGN_ELEMENTS[rashiIndex];
    var startSign = NAVAMSA_START[element];
    var navamsaIndex = (startSign + navamsaPada) % 12;
    return navamsaIndex;
  }

  function navamsaRow(name, longitude, navAscSign) {
    var navSign = navamsaSign(longitude);
    return {
      planet: name,
      sign: SIGN_NAMES[navSign],
      rashi: SIGN_HINDI[navSign],
      symbol: SIGN_SYMBOLS[navSign],
      lord: SIGN_LORDS[navSign],
      house: ((navSign - navAscSign + 12) % 12) + 1,
      d1Sign: SIGN_NAMES[signIndex(longitude)],
      d1Rashi: SIGN_HINDI[signIndex(longitude)]
    };
  }

  function isVargottama(longitude) {
    // A planet is Vargottama when it's in the same sign in D1 (Rashi) and D9 (Navamsa)
    return signIndex(longitude) === navamsaSign(longitude);
  }

  function navamsaStrength(planet, navRow, d1Row) {
    var ownSign = SIGN_LORDS[SIGN_NAMES.indexOf(navRow.sign)] === planet;
    var exalted = isExaltedInNavamsa(planet, navRow.sign);
    var vargottama = navRow.sign === d1Row.sign;
    var score = 50;
    if (ownSign) score += 20;
    if (exalted) score += 25;
    if (vargottama) score += 15;
    if ([1, 4, 5, 7, 9, 10].indexOf(navRow.house) >= 0) score += 10;
    return clamp(score, 30, 100);
  }

  function isExaltedInNavamsa(planet, sign) {
    var exaltations = {
      Sun: "Aries", Moon: "Taurus", Mars: "Capricorn",
      Mercury: "Virgo", Jupiter: "Cancer", Venus: "Pisces",
      Saturn: "Libra", Rahu: "Gemini", Ketu: "Sagittarius"
    };
    return exaltations[planet] === sign;
  }

  function isDebilitatedInNavamsa(planet, sign) {
    var debilitations = {
      Sun: "Libra", Moon: "Scorpio", Mars: "Cancer",
      Mercury: "Pisces", Jupiter: "Capricorn", Venus: "Virgo",
      Saturn: "Aries", Rahu: "Sagittarius", Ketu: "Gemini"
    };
    return debilitations[planet] === sign;
  }

  function navamsaChart(input) {
    var data = input || {};
    var resolved = utcDateFromLocal(data.date, data.time, data.place);
    var jd = julianDayFromUTC(resolved.utcDate);
    var longitudes = planetaryLongitudes(jd);
    var asc = ascendantLongitude(jd, resolved.location.lat, resolved.location.lon);

    // Navamsa Lagna (Ascendant in D9)
    var navAscSign = navamsaSign(asc);
    var navAscLord = SIGN_LORDS[navAscSign];

    // D1 ascendant for reference
    var d1AscSign = signIndex(asc);

    // All planet positions in Navamsa
    var planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    var d1Rows = planets.map(function(planet) {
      return planetRow(planet, longitudes[planet], d1AscSign);
    });
    var navRows = planets.map(function(planet, idx) {
      var row = navamsaRow(planet, longitudes[planet], navAscSign);
      row.strength = navamsaStrength(planet, row, d1Rows[idx]);
      row.vargottama = isVargottama(longitudes[planet]);
      row.exalted = isExaltedInNavamsa(planet, row.sign);
      row.debilitated = isDebilitatedInNavamsa(planet, row.sign);
      return row;
    });

    // Vargottama planets (same sign in D1 and D9 — very strong)
    var vargottamaPlanets = navRows.filter(function(row) { return row.vargottama; })
      .map(function(row) { return row.planet; });

    // 7th house analysis for marriage (D9 is primarily for marriage/dharma)
    var seventhSign = (navAscSign + 6) % 12;
    var seventhLord = SIGN_LORDS[seventhSign];
    var planetsIn7th = navRows.filter(function(row) { return row.house === 7; })
      .map(function(row) { return row.planet; });

    // Venus and Jupiter positions (key for marriage)
    var venus = navRows.find(function(row) { return row.planet === "Venus"; });
    var jupiter = navRows.find(function(row) { return row.planet === "Jupiter"; });
    var moon = navRows.find(function(row) { return row.planet === "Moon"; });

    // Pushkara Navamsa check (auspicious navamsas)
    var pushkaraPlanets = navRows.filter(function(row) {
      return isPushkaraNavamsa(longitudes[row.planet]);
    }).map(function(row) { return row.planet; });

    // Generate reading
    var reading = generateNavamsaReading(navAscSign, navAscLord, navRows, vargottamaPlanets, seventhLord, planetsIn7th, venus, jupiter);

    return {
      name: titleCase(data.name || "Native"),
      chartType: "Navamsa (D9)",
      chartTypeHindi: "नवांश (D9)",
      description: "Marriage, dharma, soul-purpose aur inner strength ka chart",
      input: {
        date: formatDate(dateParts(data.date || new Date())),
        time: data.time || "12:00",
        place: (resolved.location || {}).name || "Delhi"
      },
      navamsaLagna: {
        sign: SIGN_NAMES[navAscSign],
        rashi: SIGN_HINDI[navAscSign],
        rashiHindi: SIGN_DEVANAGARI[navAscSign],
        symbol: SIGN_SYMBOLS[navAscSign],
        lord: navAscLord,
        element: SIGN_ELEMENTS[navAscSign],
        quality: SIGN_QUALITIES[navAscSign]
      },
      d1Lagna: {
        sign: SIGN_NAMES[d1AscSign],
        rashi: SIGN_HINDI[d1AscSign]
      },
      planets: navRows,
      vargottamaPlanets: vargottamaPlanets,
      pushkaraPlanets: pushkaraPlanets,
      marriageAnalysis: {
        seventhHouse: {
          sign: SIGN_NAMES[seventhSign],
          rashi: SIGN_HINDI[seventhSign],
          lord: seventhLord,
          planets: planetsIn7th
        },
        venusPosition: {
          sign: venus.sign,
          rashi: venus.rashi,
          house: venus.house,
          strong: venus.strength >= 70,
          exalted: venus.exalted,
          debilitated: venus.debilitated
        },
        jupiterPosition: {
          sign: jupiter.sign,
          rashi: jupiter.rashi,
          house: jupiter.house,
          strong: jupiter.strength >= 70,
          exalted: jupiter.exalted
        }
      },
      reading: reading,
      disclaimer: "Navamsa chart vivah, dharma aur aatma-bal ka sookshma analysis deta hai. Ye D1 (Rashi) chart ke saath combined reading mein use karein."
    };
  }

  // Pushkara Navamsa: specific navamsa padas considered very auspicious
  // These are the navamsa positions that fall in the signs ruled by benefics (Jupiter, Venus) 
  // and are at specific degrees
  function isPushkaraNavamsa(longitude) {
    var normalLon = normalize(longitude);
    var rashiIndex = Math.floor(normalLon / 30);
    var degInSign = normalLon - (rashiIndex * 30);
    var navPada = Math.floor(degInSign / (30 / 9));
    // Pushkara Navamsas by rashi (0-indexed pada within the sign that are Pushkara)
    var pushkaraMap = {
      0: [6, 8],    // Aries: 7th and 9th navamsa
      1: [2, 4],    // Taurus: 3rd and 5th navamsa
      2: [5, 7],    // Gemini: 6th and 8th navamsa
      3: [1, 3],    // Cancer: 2nd and 4th navamsa
      4: [6, 8],    // Leo: 7th and 9th navamsa
      5: [2, 4],    // Virgo: 3rd and 5th navamsa
      6: [5, 7],    // Libra: 6th and 8th navamsa
      7: [1, 3],    // Scorpio: 2nd and 4th navamsa
      8: [6, 8],    // Sagittarius: 7th and 9th navamsa
      9: [2, 4],    // Capricorn: 3rd and 5th navamsa
      10: [5, 7],   // Aquarius: 6th and 8th navamsa
      11: [1, 3]    // Pisces: 2nd and 4th navamsa
    };
    return (pushkaraMap[rashiIndex] || []).indexOf(navPada) >= 0;
  }

  function generateNavamsaReading(navAscSign, navAscLord, navRows, vargottama, seventhLord, planetsIn7th, venus, jupiter) {
    var lines = [];

    // Navamsa Lagna reading
    lines.push(
      "Navamsa Lagna " + SIGN_HINDI[navAscSign] + " (" + SIGN_NAMES[navAscSign] + ") hai, jo " +
      SIGN_ELEMENTS[navAscSign].toLowerCase() + " tattva aur " + SIGN_QUALITIES[navAscSign].toLowerCase() +
      " nature ka deep-level influence dikhata hai. Dharma path aur married life me " + navAscLord +
      " ki position guide karegi."
    );

    // Vargottama planets
    if (vargottama.length > 0) {
      lines.push(
        "Vargottama grah: " + vargottama.join(", ") +
        " — ye D1 aur D9 dono me same rashi me hain, isliye inke results life me strongly manifest hote hain."
      );
    } else {
      lines.push("Koi bhi grah vargottama nahi hai; deeper navamsa analysis se planet strengths samjhein.");
    }

    // 7th house and marriage
    var marriageLine = "7th house lord " + seventhLord + " hai";
    if (planetsIn7th.length > 0) {
      marriageLine += " aur " + planetsIn7th.join(", ") + " 7th house me baithe hain";
    }
    marriageLine += ". ";
    if (venus.strength >= 70) {
      marriageLine += "Venus strong hai jo married life me harmony, love aur comfort indicate karta hai.";
    } else if (venus.debilitated) {
      marriageLine += "Venus debilitated hai — relationship me compromise aur patience ki zarurat rahegi; remedies helpful honge.";
    } else {
      marriageLine += "Venus average strength me hai — marriage me mutual effort aur understanding se stability aayegi.";
    }
    lines.push(marriageLine);

    // Jupiter for dharma and wisdom
    if (jupiter.strength >= 70) {
      lines.push("Jupiter D9 me strong hai — dharma, wisdom aur guru-blessings life me support karenge. Spiritual growth natural rahega.");
    } else if (jupiter.exalted) {
      lines.push("Jupiter uccha (exalted) hai — ye param shubh hai; dharma, santaan aur fortune me divine grace milegi.");
    } else {
      lines.push("Jupiter ki D9 position suggest karti hai ki dharma path me conscious effort aur discipline rakhna beneficial hoga.");
    }

    // Strength-based insight
    var strongest = navRows
      .filter(function(r) { return r.planet !== "Rahu" && r.planet !== "Ketu"; })
      .sort(function(a, b) { return b.strength - a.strength; })[0];
    if (strongest) {
      lines.push(
        strongest.planet + " navamsa me sabse strong hai (house " + strongest.house +
        ", " + strongest.rashi + ") — ye deep-level life themes me natural support ka source hai."
      );
    }

    return lines;
  }

  // ========== HORA (D2) DIVISIONAL CHART ==========
  // Each sign divided into 2 halves (15 degrees each)
  // Odd signs: first half = Sun (Leo), second half = Moon (Cancer)
  // Even signs: first half = Moon (Cancer), second half = Sun (Leo)

  function horaSign(longitude) {
    var normalLon = normalize(longitude);
    var rashiIndex = Math.floor(normalLon / 30);
    var degInSign = normalLon - (rashiIndex * 30);
    var isOddSign = (rashiIndex % 2 === 0); // 0-indexed: Aries=0 (odd), Taurus=1 (even)
    var firstHalf = degInSign < 15;
    if (isOddSign) {
      return firstHalf ? 4 : 3; // Leo=4, Cancer=3
    } else {
      return firstHalf ? 3 : 4; // Cancer=3, Leo=4
    }
  }

  function horaRow(name, longitude, horaAscSign) {
    var hSign = horaSign(longitude);
    return {
      planet: name,
      sign: SIGN_NAMES[hSign],
      rashi: SIGN_HINDI[hSign],
      symbol: SIGN_SYMBOLS[hSign],
      lord: SIGN_LORDS[hSign],
      house: ((hSign - horaAscSign + 12) % 12) + 1,
      d1Sign: SIGN_NAMES[signIndex(longitude)],
      d1Rashi: SIGN_HINDI[signIndex(longitude)]
    };
  }

  function horaChart(input) {
    var data = input || {};
    var resolved = utcDateFromLocal(data.date, data.time, data.place);
    var jd = julianDayFromUTC(resolved.utcDate);
    var longitudes = planetaryLongitudes(jd);
    var asc = ascendantLongitude(jd, resolved.location.lat, resolved.location.lon);

    var horaAscSign = horaSign(asc);
    var planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    var rows = planets.map(function(planet) {
      return horaRow(planet, longitudes[planet], horaAscSign);
    });

    var sunCount = rows.filter(function(r) { return r.sign === "Leo"; }).length;
    var moonCount = rows.filter(function(r) { return r.sign === "Cancer"; }).length;

    var reading = [];
    reading.push("Hora chart me " + sunCount + " grah Sun hora (Leo) aur " + moonCount + " grah Moon hora (Cancer) me hain.");
    if (sunCount > moonCount) {
      reading.push("Sun hora dominance se self-effort, authority aur earned wealth se financial growth hogi.");
    } else if (moonCount > sunCount) {
      reading.push("Moon hora dominance se inherited wealth, public dealings aur nurturing activities se dhan aayega.");
    } else {
      reading.push("Balanced hora placement se dono - self-effort aur inherited/passive income ke channels active hain.");
    }
    reading.push("D2 chart financial timing aur wealth accumulation pattern ko samajhne ke liye use karein.");

    return {
      name: titleCase(data.name || "Native"),
      chartType: "Hora (D2)",
      chartTypeHindi: "होरा (D2)",
      description: "Wealth, finance aur dhan yoga ka chart",
      input: {
        date: formatDate(dateParts(data.date || new Date())),
        time: data.time || "12:00",
        place: (resolved.location || {}).name || "Delhi"
      },
      horaLagna: {
        sign: SIGN_NAMES[horaAscSign],
        rashi: SIGN_HINDI[horaAscSign],
        rashiHindi: SIGN_DEVANAGARI[horaAscSign],
        symbol: SIGN_SYMBOLS[horaAscSign],
        lord: SIGN_LORDS[horaAscSign],
        element: SIGN_ELEMENTS[horaAscSign],
        quality: SIGN_QUALITIES[horaAscSign]
      },
      planets: rows,
      reading: reading,
      disclaimer: "Hora chart dhan aur financial patterns ka sookshma analysis deta hai. D1 chart ke saath combine karke padhein."
    };
  }

  // ========== DREKKANA (D3) DIVISIONAL CHART ==========
  // Each sign divided into 3 parts (10 degrees each)
  // First drekkana (0-10) = same sign
  // Second drekkana (10-20) = 5th sign from it
  // Third drekkana (20-30) = 9th sign from it

  function drekkanaSign(longitude) {
    var normalLon = normalize(longitude);
    var rashiIndex = Math.floor(normalLon / 30);
    var degInSign = normalLon - (rashiIndex * 30);
    if (degInSign < 10) {
      return rashiIndex; // same sign
    } else if (degInSign < 20) {
      return (rashiIndex + 4) % 12; // 5th sign (0-indexed: +4)
    } else {
      return (rashiIndex + 8) % 12; // 9th sign (0-indexed: +8)
    }
  }

  function drekkanaRow(name, longitude, drekAscSign) {
    var dSign = drekkanaSign(longitude);
    return {
      planet: name,
      sign: SIGN_NAMES[dSign],
      rashi: SIGN_HINDI[dSign],
      symbol: SIGN_SYMBOLS[dSign],
      lord: SIGN_LORDS[dSign],
      house: ((dSign - drekAscSign + 12) % 12) + 1,
      d1Sign: SIGN_NAMES[signIndex(longitude)],
      d1Rashi: SIGN_HINDI[signIndex(longitude)]
    };
  }

  function drekkanaChart(input) {
    var data = input || {};
    var resolved = utcDateFromLocal(data.date, data.time, data.place);
    var jd = julianDayFromUTC(resolved.utcDate);
    var longitudes = planetaryLongitudes(jd);
    var asc = ascendantLongitude(jd, resolved.location.lat, resolved.location.lon);

    var drekAscSign = drekkanaSign(asc);
    var planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    var rows = planets.map(function(planet) {
      return drekkanaRow(planet, longitudes[planet], drekAscSign);
    });

    var thirdHouse = rows.filter(function(r) { return r.house === 3; });
    var reading = [];
    reading.push("Drekkana lagna " + SIGN_HINDI[drekAscSign] + " (" + SIGN_NAMES[drekAscSign] + ") hai jo courage, siblings aur short journeys me " + SIGN_ELEMENTS[drekAscSign].toLowerCase() + " nature dikhata hai.");
    if (thirdHouse.length > 0) {
      reading.push("3rd house me " + thirdHouse.map(function(r) { return r.planet; }).join(", ") + " hain jo siblings aur initiative ke matters activate karte hain.");
    } else {
      reading.push("3rd house empty hai - siblings se stable aur conflict-free relationship likely hai.");
    }
    reading.push("D3 chart bhai-beheno ke saath sambandh, personal courage aur chhote travels ko darshata hai.");

    return {
      name: titleCase(data.name || "Native"),
      chartType: "Drekkana (D3)",
      chartTypeHindi: "द्रेक्काण (D3)",
      description: "Siblings, courage aur short journeys ka chart",
      input: {
        date: formatDate(dateParts(data.date || new Date())),
        time: data.time || "12:00",
        place: (resolved.location || {}).name || "Delhi"
      },
      drekkanaLagna: {
        sign: SIGN_NAMES[drekAscSign],
        rashi: SIGN_HINDI[drekAscSign],
        rashiHindi: SIGN_DEVANAGARI[drekAscSign],
        symbol: SIGN_SYMBOLS[drekAscSign],
        lord: SIGN_LORDS[drekAscSign],
        element: SIGN_ELEMENTS[drekAscSign],
        quality: SIGN_QUALITIES[drekAscSign]
      },
      planets: rows,
      reading: reading,
      disclaimer: "Drekkana chart siblings, courage aur personal initiative ka sookshma analysis deta hai. D1 ke saath padhein."
    };
  }

  // ========== DASHAMSA (D10) DIVISIONAL CHART ==========
  // Each sign divided into 10 parts (3 degrees each)
  // For odd signs: count from the same sign
  // For even signs: count from the 9th sign from it

  function dashamsaSign(longitude) {
    var normalLon = normalize(longitude);
    var rashiIndex = Math.floor(normalLon / 30);
    var degInSign = normalLon - (rashiIndex * 30);
    var part = Math.floor(degInSign / 3); // 0-9
    var isOddSign = (rashiIndex % 2 === 0); // 0-indexed: Aries=0 is odd sign
    if (isOddSign) {
      return (rashiIndex + part) % 12;
    } else {
      return (rashiIndex + 8 + part) % 12; // 9th sign = +8 in 0-indexed
    }
  }

  function dashamsaRow(name, longitude, dashaAscSign) {
    var dSign = dashamsaSign(longitude);
    return {
      planet: name,
      sign: SIGN_NAMES[dSign],
      rashi: SIGN_HINDI[dSign],
      symbol: SIGN_SYMBOLS[dSign],
      lord: SIGN_LORDS[dSign],
      house: ((dSign - dashaAscSign + 12) % 12) + 1,
      d1Sign: SIGN_NAMES[signIndex(longitude)],
      d1Rashi: SIGN_HINDI[signIndex(longitude)]
    };
  }

  function dashamChart(input) {
    var data = input || {};
    var resolved = utcDateFromLocal(data.date, data.time, data.place);
    var jd = julianDayFromUTC(resolved.utcDate);
    var longitudes = planetaryLongitudes(jd);
    var asc = ascendantLongitude(jd, resolved.location.lat, resolved.location.lon);

    var dashaAscSign = dashamsaSign(asc);
    var planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    var rows = planets.map(function(planet) {
      return dashamsaRow(planet, longitudes[planet], dashaAscSign);
    });

    var tenthHouse = rows.filter(function(r) { return r.house === 10; });
    var reading = [];
    reading.push("Dashamsa lagna " + SIGN_HINDI[dashaAscSign] + " (" + SIGN_NAMES[dashaAscSign] + ") hai jo career me " + SIGN_ELEMENTS[dashaAscSign].toLowerCase() + " element aur " + SIGN_QUALITIES[dashaAscSign].toLowerCase() + " approach dikhata hai.");
    if (tenthHouse.length > 0) {
      reading.push("10th house me " + tenthHouse.map(function(r) { return r.planet; }).join(", ") + " hain jo professional growth aur public recognition strongly activate karte hain.");
    } else {
      reading.push("10th house empty hai - career growth steady effort aur D1 10th lord ke dasha me manifest hogi.");
    }
    reading.push("D10 chart profession, fame aur career achievements ka deep analysis hai. Job changes aur promotions ke liye dekha jata hai.");

    return {
      name: titleCase(data.name || "Native"),
      chartType: "Dashamsa (D10)",
      chartTypeHindi: "दशमांश (D10)",
      description: "Career, profession aur fame ka chart",
      input: {
        date: formatDate(dateParts(data.date || new Date())),
        time: data.time || "12:00",
        place: (resolved.location || {}).name || "Delhi"
      },
      dashamsaLagna: {
        sign: SIGN_NAMES[dashaAscSign],
        rashi: SIGN_HINDI[dashaAscSign],
        rashiHindi: SIGN_DEVANAGARI[dashaAscSign],
        symbol: SIGN_SYMBOLS[dashaAscSign],
        lord: SIGN_LORDS[dashaAscSign],
        element: SIGN_ELEMENTS[dashaAscSign],
        quality: SIGN_QUALITIES[dashaAscSign]
      },
      planets: rows,
      reading: reading,
      disclaimer: "Dashamsa chart career aur professional success ka sookshma analysis deta hai. D1 ke saath combine karein."
    };
  }

  // ========== COMBINED DIVISIONAL CHARTS ==========
  function divisionalCharts(input) {
    return {
      d2: horaChart(input),
      d3: drekkanaChart(input),
      d9: navamsaChart(input),
      d10: dashamChart(input)
    };
  }

  function generateKundli(input) {
    const chart = makeChart(input);
    const navamsa = navamsaChart(input);
    return Object.assign(chart, {
      navamsa: navamsa,
      reading: {
        personality: `${chart.ascendant.rashi} lagna native ko ${SIGN_ELEMENTS[SIGN_NAMES.indexOf(chart.ascendant.sign)].toLowerCase()} drive deta hai. Decision making me ${chart.ascendant.lord} ka role important rahega.`,
        mind: `${chart.moonSign.rashi} Moon aur ${chart.moonSign.nakshatra} nakshatra emotional instincts ko shape karta hai. Daily routine me consistency se clarity badhegi.`,
        career: houseThemes(chart)[0],
        relationship: "Relationship matters me Moon sign, Venus position aur 7th house ko balance karke communication clear rakhna beneficial rahega.",
        remedy: dailyRemedy(chart.moonSign.sign, chart.dasha.activeMahadasha)
      },
      houseHighlights: houseThemes(chart)
    });
  }

  function dailyRemedy(sign, planet) {
    const remedies = {
      Sun: "Surya ko subah jal arpan karein aur gratitude practice rakhein.",
      Moon: "Somvar ko doodh ya white food donate karein, mind ko calm rakhein.",
      Mars: "Hanuman Chalisa ya disciplined exercise se Mars energy channel karein.",
      Mercury: "Budhwar ko green moong donate karein aur communication me clarity rakhein.",
      Jupiter: "Guruvar ko yellow food donate karein aur elders/teachers ka respect karein.",
      Venus: "Shukravar ko cleanliness, art aur relationship gratitude par dhyan dein.",
      Saturn: "Shanivar ko service, patience aur routine discipline follow karein.",
      Rahu: "Overthinking se bachkar grounded routine aur honest communication rakhein.",
      Ketu: "Meditation, simple food aur quiet reflection helpful rahega."
    };
    if (planet && remedies[planet]) return remedies[planet];
    const index = SIGN_NAMES.indexOf(sign);
    return remedies[SIGN_LORDS[index >= 0 ? index : 0]];
  }

  function dailyHoroscope(input) {
    const sign = normalizeSign(input && input.sign ? input.sign : "Aries");
    const date = formatDate(dateParts(input && input.date ? input.date : new Date()));
    const seed = hashSeed(`${sign}-${date}`);
    const index = SIGN_NAMES.indexOf(sign);
    const focus = seededPick(seed, ["career", "relationship", "finance", "health", "learning", "family"]);
    const mood = seededPick(seed >> 3, ["steady", "inspired", "practical", "sensitive", "decisive", "reflective"]);
    const advice = seededPick(seed >> 5, [
      "jaldi decision lene se pehle facts ko ek baar verify karein",
      "apni baat short aur clear rakhein",
      "purani pending cheez close karne ke liye achha din hai",
      "emotional response ke bajay practical next step choose karein",
      "network aur collaboration se better result mil sakta hai",
      "rest aur routine ko ignore na karein"
    ]);
    const colors = ["Saffron", "White", "Green", "Royal Blue", "Silver", "Maroon", "Yellow", "Teal", "Violet"];
    const luckyNumber = (seed % 9) + 1;
    const transit = panchang({ date: date, place: input && input.place ? input.place : "Delhi" });

    return {
      sign: sign,
      rashi: SIGN_HINDI[index],
      symbol: SIGN_SYMBOLS[index],
      date: date,
      focus: titleCase(focus),
      mood: titleCase(mood),
      luckyColor: seededPick(seed >> 7, colors),
      luckyNumber: luckyNumber,
      prediction: `${sign} ke liye aaj ${focus} area active hai. Moon ${transit.moonSign.rashi} rashi me hone se mood ${mood} reh sakta hai; ${advice}.`,
      love: loveLine(index, seed),
      career: careerLine(index, seed),
      health: healthLine(index, seed),
      remedy: dailyRemedy(sign),
      panchangHint: `${transit.tithi.paksha} ${transit.tithi.name}, ${transit.nakshatra.name} nakshatra`
    };
  }

  function loveLine(index, seed) {
    const lines = [
      "Relationship me patience aur listening se warmth badhegi.",
      "Aaj honest conversation useful rahegi, lekin tone soft rakhein.",
      "Single natives ke liye familiar network se positive signal mil sakta hai.",
      "Partner ke practical concerns ko lightly na lein."
    ];
    return seededPick(seed + index, lines);
  }

  function careerLine(index, seed) {
    const lines = [
      "Work me priority list bana kar execute karna best rahega.",
      "Senior ya client conversation me concise update advantage dega.",
      "Creative solution aayega, bas documentation clear rakhein.",
      "Financial decision me impulse avoid karein."
    ];
    return seededPick((seed >> 2) + index, lines);
  }

  function healthLine(index, seed) {
    const lines = [
      "Hydration aur sleep routine par focus rakhein.",
      "Light stretching ya walk se energy stable rahegi.",
      "Heavy food aur late-night screen time avoid karein.",
      "Breathing practice se mental load kam hoga."
    ];
    return seededPick((seed >> 4) + index, lines);
  }

  function normalizeSign(value) {
    const text = String(value || "").trim().toLowerCase();
    const found = SIGN_NAMES.find(function (name) { return name.toLowerCase() === text; });
    if (found) return found;
    const hindiIndex = SIGN_HINDI.findIndex(function (name) { return name.toLowerCase() === text; });
    if (hindiIndex >= 0) return SIGN_NAMES[hindiIndex];
    return SIGN_NAMES[0];
  }

  function panchang(input) {
    const data = input || {};
    const parts = dateParts(data.date || new Date());
    const location = resolvePlace(data.place || "Delhi");
    const localNoonMs = Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0) - location.tz * 60 * 60 * 1000;
    const jd = julianDayFromUTC(new Date(localNoonMs));
    const positions = planetaryLongitudes(jd);
    const sun = positions.Sun;
    const moon = positions.Moon;
    const tithiValue = normalize(moon - sun) / 12;
    const tithiIndex = Math.floor(tithiValue);
    const nak = nakshatraInfo(moon);
    const yogaIndex = Math.floor(normalize(sun + moon) / (360 / 27));
    const karanaIndex = Math.floor(normalize(moon - sun) / 6) % KARANA_NAMES.length;
    const moonSignIndex = signIndex(moon);
    const solar = sunriseSunset(parts, location);
    const rahu = rahuKaal(parts, solar.sunriseHour, solar.sunsetHour);

    return {
      date: formatDate(parts),
      place: location.name,
      coordinates: { lat: location.lat, lon: location.lon, timezone: location.tz },
      tithi: {
        number: tithiIndex + 1,
        name: TITHI_NAMES[tithiIndex],
        paksha: tithiIndex < 15 ? "Shukla Paksha" : "Krishna Paksha",
        completion: `${Math.round((tithiValue - tithiIndex) * 100)}%`
      },
      nakshatra: {
        name: nak.name,
        lord: nak.lord,
        pada: nak.pada,
        gana: nak.gana
      },
      yoga: YOGA_NAMES[yogaIndex],
      karana: KARANA_NAMES[karanaIndex],
      moonSign: {
        sign: SIGN_NAMES[moonSignIndex],
        rashi: SIGN_HINDI[moonSignIndex],
        symbol: SIGN_SYMBOLS[moonSignIndex]
      },
      sunrise: solar.sunrise,
      sunset: solar.sunset,
      rahuKaal: rahu,
      abhijitMuhurat: abhijitMuhurat(solar.sunriseHour, solar.sunsetHour),
      suggestion: panchangSuggestion(tithiIndex, nak)
    };
  }

  function sunriseSunset(parts, location) {
    const n = Math.floor((Date.UTC(parts.year, parts.month - 1, parts.day) - Date.UTC(parts.year, 0, 0)) / 86400000);
    const gamma = 2 * Math.PI / 365 * (n - 1);
    const eqTime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
    const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) -
      0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma) -
      0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);
    const latRad = toRadians(location.lat);
    const hourAngle = Math.acos(clamp(
      (Math.cos(toRadians(90.833)) / (Math.cos(latRad) * Math.cos(decl))) - Math.tan(latRad) * Math.tan(decl),
      -1,
      1
    ));
    const solarNoon = (720 - 4 * location.lon - eqTime + location.tz * 60) / 60;
    const sunriseHour = solarNoon - toDegrees(hourAngle) * 4 / 60;
    const sunsetHour = solarNoon + toDegrees(hourAngle) * 4 / 60;
    return {
      sunriseHour: sunriseHour,
      sunsetHour: sunsetHour,
      sunrise: formatTimeFromHours(sunriseHour),
      sunset: formatTimeFromHours(sunsetHour)
    };
  }

  function rahuKaal(parts, sunrise, sunset) {
    const day = new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
    const segmentOrder = [8, 2, 7, 5, 6, 4, 3];
    const dayDuration = sunset - sunrise;
    const segment = dayDuration / 8;
    const start = sunrise + (segmentOrder[day] - 1) * segment;
    return `${formatTimeFromHours(start)} - ${formatTimeFromHours(start + segment)}`;
  }

  function abhijitMuhurat(sunrise, sunset) {
    const noon = (sunrise + sunset) / 2;
    return `${formatTimeFromHours(noon - 0.4)} - ${formatTimeFromHours(noon + 0.4)}`;
  }

  function panchangSuggestion(tithiIndex, nak) {
    if (tithiIndex === 10 || tithiIndex === 25) return "Ekadashi energy discipline, fasting aur spiritual practice ke liye supportive hai.";
    if (nak.lord === "Jupiter") return "Learning, guidance aur blessings-related kaam ke liye din supportive hai.";
    if (nak.lord === "Mars") return "High-energy kaam karein, lekin arguments me restraint rakhein.";
    if (nak.lord === "Saturn") return "Long-term planning, repair aur responsibility wale kaam favor me hain.";
    return "Routine work, prayer aur mindful decisions ke liye balanced din hai.";
  }

  // --- Classical Ashtakoot Guna Milan Helper Functions ---

  function varnaValue(nakIndex) {
    const map = { Brahmin: 4, Kshatriya: 3, Vaishya: 2, Shudra: 1 };
    return map[NAKSHATRA_VARNA[nakIndex]] || 1;
  }

  function calcVarna(boyNakIndex, girlNakIndex) {
    var boyVal = varnaValue(boyNakIndex);
    var girlVal = varnaValue(girlNakIndex);
    var scored = boyVal >= girlVal ? 1 : 0;
    return {
      name: "Varna", nameHindi: "\u0935\u0930\u094D\u0923", maxPoints: 1, scored: scored,
      description: "Spiritual/intellectual compatibility",
      detail: "Boy: " + NAKSHATRA_VARNA[boyNakIndex] + " (" + boyVal + "), Girl: " + NAKSHATRA_VARNA[girlNakIndex] + " (" + girlVal + ")" + (scored ? " - Boy >= Girl" : " - Boy < Girl")
    };
  }

  function calcVashya(boySignIndex, girlSignIndex) {
    var boyV = SIGN_VASHYA[boySignIndex];
    var girlV = SIGN_VASHYA[girlSignIndex];
    var scored = 0;
    var rule = "";
    if (boyV === girlV) {
      scored = 2; rule = "Same Vashya category";
    } else if ((boyV === "Manava" && girlV === "Chatushpada") || (boyV === "Chatushpada" && girlV === "Manava")) {
      scored = 1; rule = "Manava-Chatushpada partial control";
    } else if ((boyV === "Chatushpada" && girlV === "Jalachara") || (boyV === "Jalachara" && girlV === "Chatushpada")) {
      scored = 0.5; rule = "Chatushpada-Jalachara minimal affinity";
    } else {
      scored = 0; rule = "No Vashya affinity";
    }
    return {
      name: "Vashya", nameHindi: "\u0935\u0936\u094D\u092F", maxPoints: 2, scored: scored,
      description: "Dominance/mutual attraction",
      detail: "Boy: " + SIGN_NAMES[boySignIndex] + " (" + boyV + "), Girl: " + SIGN_NAMES[girlSignIndex] + " (" + girlV + ") - " + rule
    };
  }

  function isTaraAuspicious(fromNakIndex, toNakIndex) {
    var count = ((toNakIndex - fromNakIndex + 27) % 27) + 1;
    var remainder = count % 9;
    if (remainder === 0) remainder = 9;
    return [3, 5, 7].indexOf(remainder) === -1;
  }

  function calcTara(boyNakIndex, girlNakIndex) {
    var girlToBoy = isTaraAuspicious(girlNakIndex, boyNakIndex);
    var boyToGirl = isTaraAuspicious(boyNakIndex, girlNakIndex);
    var scored = 0;
    var rule = "";
    if (girlToBoy && boyToGirl) {
      scored = 3; rule = "Both directions auspicious";
    } else if (girlToBoy || boyToGirl) {
      scored = 1.5; rule = "One direction auspicious";
    } else {
      scored = 0; rule = "Both directions inauspicious";
    }
    return {
      name: "Tara", nameHindi: "\u0924\u093E\u0930\u093E", maxPoints: 3, scored: scored,
      description: "Birth star compatibility (Dina Tara)",
      detail: "Girl-to-Boy: " + (girlToBoy ? "auspicious" : "inauspicious") + ", Boy-to-Girl: " + (boyToGirl ? "auspicious" : "inauspicious") + " - " + rule
    };
  }

  function areYoniEnemies(a, b) {
    for (var i = 0; i < YONI_ENEMIES.length; i++) {
      if ((YONI_ENEMIES[i][0] === a && YONI_ENEMIES[i][1] === b) ||
          (YONI_ENEMIES[i][1] === a && YONI_ENEMIES[i][0] === b)) {
        return true;
      }
    }
    return false;
  }

  function calcYoni(boyNakIndex, girlNakIndex) {
    var boyYoni = NAKSHATRA_YONI_DETAILED[boyNakIndex];
    var girlYoni = NAKSHATRA_YONI_DETAILED[girlNakIndex];
    var scored = 0;
    var rule = "";
    if (boyYoni.animal === girlYoni.animal) {
      if (boyYoni.gender !== girlYoni.gender) {
        scored = 4; rule = "Same animal, opposite gender (perfect pair)";
      } else {
        scored = 3; rule = "Same animal, same gender";
      }
    } else if (areYoniEnemies(boyYoni.animal, girlYoni.animal)) {
      scored = 0; rule = "Enemy animals (" + boyYoni.animal + " vs " + girlYoni.animal + ")";
    } else {
      // Classify as friendly (2) or neutral (1) using a simplified approach
      // Friendly: animals not in the enemy list and not completely unrelated
      scored = 2; rule = "Friendly/neutral animals";
      // Use a more nuanced check: if neither is an enemy of the other, 
      // check for known friendly combinations
      var friendlyPairs = [
        ["Cow", "Buffalo"], ["Horse", "Deer"], ["Elephant", "Sheep"],
        ["Monkey", "Lion"], ["Dog", "Cat"], ["Serpent", "Deer"]
      ];
      var isFriendly = false;
      for (var i = 0; i < friendlyPairs.length; i++) {
        if ((friendlyPairs[i][0] === boyYoni.animal && friendlyPairs[i][1] === girlYoni.animal) ||
            (friendlyPairs[i][1] === boyYoni.animal && friendlyPairs[i][0] === girlYoni.animal)) {
          isFriendly = true;
          break;
        }
      }
      if (isFriendly) {
        scored = 2; rule = "Friendly animals (" + boyYoni.animal + " & " + girlYoni.animal + ")";
      } else {
        scored = 1; rule = "Neutral animals (" + boyYoni.animal + " & " + girlYoni.animal + ")";
      }
    }
    return {
      name: "Yoni", nameHindi: "\u092F\u094B\u0928\u093F", maxPoints: 4, scored: scored,
      description: "Sexual/physical compatibility",
      detail: "Boy: " + boyYoni.animal + "(" + boyYoni.gender + "), Girl: " + girlYoni.animal + "(" + girlYoni.gender + ") - " + rule
    };
  }

  function moonProfile(input) {
    const chart = makeChart(input);
    const moon = chart.planets.find(function (row) { return row.planet === "Moon"; });
    return {
      chart: chart,
      moon: moon,
      signIndex: SIGN_NAMES.indexOf(moon.sign),
      nakIndex: NAKSHATRAS.indexOf(moon.nakshatra),
      nak: nakshatraInfo(moon.longitude)
    };
  }

  function getRelationship(planetA, planetB) {
    if (planetA === planetB) return "friend";
    var entry = GRAHA_MAITRI_TABLE[planetA];
    if (!entry) return "neutral";
    if (entry.friends.indexOf(planetB) >= 0) return "friend";
    if (entry.enemies.indexOf(planetB) >= 0) return "enemy";
    return "neutral";
  }

  function calcGrahaMaitri(boySignIndex, girlSignIndex) {
    var lordBoy = SIGN_LORDS[boySignIndex];
    var lordGirl = SIGN_LORDS[girlSignIndex];
    var scored = 0;
    var rule = "";
    if (lordBoy === lordGirl) {
      scored = 5; rule = "Same lord (" + lordBoy + ")";
    } else {
      var relAtoB = getRelationship(lordBoy, lordGirl);
      var relBtoA = getRelationship(lordGirl, lordBoy);
      if (relAtoB === "friend" && relBtoA === "friend") {
        scored = 5; rule = "Mutual friends (" + lordBoy + " & " + lordGirl + ")";
      } else if ((relAtoB === "friend" && relBtoA === "neutral") || (relAtoB === "neutral" && relBtoA === "friend")) {
        scored = 4; rule = "One friend, one neutral (" + lordBoy + " & " + lordGirl + ")";
      } else if (relAtoB === "neutral" && relBtoA === "neutral") {
        scored = 3; rule = "Both neutral (" + lordBoy + " & " + lordGirl + ")";
      } else if ((relAtoB === "friend" && relBtoA === "enemy") || (relAtoB === "enemy" && relBtoA === "friend")) {
        scored = 1; rule = "One friend, one enemy (" + lordBoy + " & " + lordGirl + ")";
      } else if ((relAtoB === "neutral" && relBtoA === "enemy") || (relAtoB === "enemy" && relBtoA === "neutral")) {
        scored = 0.5; rule = "One neutral, one enemy (" + lordBoy + " & " + lordGirl + ")";
      } else {
        scored = 0; rule = "Mutual enemies (" + lordBoy + " & " + lordGirl + ")";
      }
    }
    return {
      name: "Graha Maitri", nameHindi: "\u0917\u094D\u0930\u0939 \u092E\u0948\u0924\u094D\u0930\u0940", maxPoints: 5, scored: scored,
      description: "Planetary lord friendship",
      detail: "Boy lord: " + lordBoy + ", Girl lord: " + lordGirl + " - " + rule
    };
  }

  function calcGana(boyNakIndex, girlNakIndex) {
    var boyGana = NAKSHATRA_GANA[boyNakIndex];
    var girlGana = NAKSHATRA_GANA[girlNakIndex];
    // Classical grid: rows=Boy (Deva/Manushya/Rakshasa), cols=Girl (Deva/Manushya/Rakshasa)
    var ganaGrid = {
      "Deva-Deva": 6, "Deva-Manushya": 6, "Deva-Rakshasa": 0,
      "Manushya-Deva": 5, "Manushya-Manushya": 6, "Manushya-Rakshasa": 0,
      "Rakshasa-Deva": 1, "Rakshasa-Manushya": 0, "Rakshasa-Rakshasa": 6
    };
    var key = boyGana + "-" + girlGana;
    var scored = ganaGrid[key] !== undefined ? ganaGrid[key] : 0;
    return {
      name: "Gana", nameHindi: "\u0917\u0923", maxPoints: 6, scored: scored,
      description: "Temperament compatibility",
      detail: "Boy: " + boyGana + ", Girl: " + girlGana + " - Score: " + scored + "/6"
    };
  }

  function calcBhakoot(boySignIndex, girlSignIndex) {
    var distBoyToGirl = ((girlSignIndex - boySignIndex + 12) % 12) + 1;
    var distGirlToBoy = ((boySignIndex - girlSignIndex + 12) % 12) + 1;
    var inauspiciousPairs = [[2,12],[6,8],[5,9]];
    var isBad = false;
    for (var i = 0; i < inauspiciousPairs.length; i++) {
      var pair = inauspiciousPairs[i];
      if ((distBoyToGirl === pair[0] && distGirlToBoy === pair[1]) ||
          (distBoyToGirl === pair[1] && distGirlToBoy === pair[0])) {
        isBad = true;
        break;
      }
    }
    var doshaPresent = isBad;
    var doshaCancelled = false;
    var scored = 7;
    var rule = "";
    if (isBad) {
      // Check if lords are same or friends (cancellation)
      var lordBoy = SIGN_LORDS[boySignIndex];
      var lordGirl = SIGN_LORDS[girlSignIndex];
      if (lordBoy === lordGirl) {
        doshaCancelled = true;
        scored = 7;
        rule = "Bhakoot dosha (" + distBoyToGirl + "/" + distGirlToBoy + ") cancelled - same lords (" + lordBoy + ")";
      } else {
        var rel1 = getRelationship(lordBoy, lordGirl);
        var rel2 = getRelationship(lordGirl, lordBoy);
        if (rel1 === "friend" || rel2 === "friend") {
          doshaCancelled = true;
          scored = 7;
          rule = "Bhakoot dosha (" + distBoyToGirl + "/" + distGirlToBoy + ") cancelled - lords are friends (" + lordBoy + " & " + lordGirl + ")";
        } else {
          scored = 0;
          rule = "Bhakoot dosha (" + distBoyToGirl + "/" + distGirlToBoy + ") - lords not friendly";
        }
      }
    } else {
      rule = "No Bhakoot dosha (distance: " + distBoyToGirl + "/" + distGirlToBoy + ")";
    }
    return {
      koota: {
        name: "Bhakoot", nameHindi: "\u092D\u0915\u0942\u091F", maxPoints: 7, scored: scored,
        description: "Rashi lord compatibility (health/wealth)",
        detail: rule
      },
      doshaPresent: doshaPresent,
      doshaCancelled: doshaCancelled,
      reason: rule
    };
  }

  function calcNadi(boyNakIndex, girlNakIndex, boySigIdx, girlSigIdx, boyPada, girlPada) {
    var boyNadi = NAKSHATRA_NADI[boyNakIndex];
    var girlNadi = NAKSHATRA_NADI[girlNakIndex];
    var doshaPresent = (boyNadi === girlNadi);
    var doshaCancelled = false;
    var scored = 8;
    var rule = "";
    if (doshaPresent) {
      // Check exception: same nakshatra different pada
      if (boyNakIndex === girlNakIndex && boyPada !== girlPada) {
        doshaCancelled = true;
        scored = 8;
        rule = "Same Nadi (" + boyNadi + ") but same nakshatra different pada - dosha cancelled";
      } else if (boySigIdx === girlSigIdx && boyNakIndex !== girlNakIndex) {
        // Same rashi but different nakshatra
        doshaCancelled = true;
        scored = 8;
        rule = "Same Nadi (" + boyNadi + ") but same rashi different nakshatra - dosha cancelled";
      } else {
        scored = 0;
        rule = "Nadi Dosha - both have " + boyNadi + " nadi (inauspicious for progeny)";
      }
    } else {
      rule = "Different Nadi (Boy: " + boyNadi + ", Girl: " + girlNadi + ") - auspicious";
    }
    return {
      koota: {
        name: "Nadi", nameHindi: "\u0928\u093E\u0921\u0940", maxPoints: 8, scored: scored,
        description: "Health and genetic compatibility (most important)",
        detail: rule
      },
      doshaPresent: doshaPresent,
      doshaCancelled: doshaCancelled,
      reason: rule
    };
  }

  function matchmakingGuidance(total, nadiDosha, bhakootDosha, mangal1, mangal2) {
    var lines = [];
    if (total >= 28) {
      lines.push("Ashtakoot score uttam (excellent) hai. Emotional, physical aur family compatibility bahut achhi hai.");
    } else if (total >= 22) {
      lines.push("Ashtakoot score shubh (good) hai. Compatibility supportive hai, par communication aur mutual respect zaruri hai.");
    } else if (total >= 18) {
      lines.push("Score madhyam (average) hai. Vivah se pehle detailed chart analysis, counselling aur remedies par vichar karein.");
    } else {
      lines.push("Score kam hai. Marriage decision me family values, practical goals aur professional guidance carefully consider karein.");
    }
    if (nadiDosha.present && !nadiDosha.cancelled) {
      lines.push("Nadi Dosha present hai - santaan (progeny) aur health ke liye remedies aur deeper analysis recommended hai.");
    }
    if (bhakootDosha.present && !bhakootDosha.cancelled) {
      lines.push("Bhakoot Dosha present hai - wealth aur health challenges possible hain, remedies se shanti milegi.");
    }
    if (mangal1.hasDosha !== mangal2.hasDosha) {
      lines.push("Mangal Dosha imbalance hai - ek chart me Manglik aur dusre me nahi. Remedies aur matching check zaruri hai.");
    } else if (mangal1.hasDosha && mangal2.hasDosha) {
      lines.push("Dono charts me Mangal Dosha hai, jo traditionally ek dusre ko cancel karta hai.");
    }
    return lines;
  }

  function matchmaking(input) {
    var p1 = moonProfile(input && input.person1 ? input.person1 : {});
    var p2 = moonProfile(input && input.person2 ? input.person2 : {});

    // Calculate all 8 kootas (Convention: person1 = Boy, person2 = Girl)
    var varna = calcVarna(p1.nakIndex, p2.nakIndex);
    var vashya = calcVashya(p1.signIndex, p2.signIndex);
    var tara = calcTara(p1.nakIndex, p2.nakIndex);
    var yoni = calcYoni(p1.nakIndex, p2.nakIndex);
    var grahaMaitri = calcGrahaMaitri(p1.signIndex, p2.signIndex);
    var gana = calcGana(p1.nakIndex, p2.nakIndex);
    var bhakootResult = calcBhakoot(p1.signIndex, p2.signIndex);
    var nadiResult = calcNadi(p1.nakIndex, p2.nakIndex, p1.signIndex, p2.signIndex, p1.nak.pada, p2.nak.pada);

    var kootas = [varna, vashya, tara, yoni, grahaMaitri, gana, bhakootResult.koota, nadiResult.koota];
    var total = 0;
    for (var i = 0; i < kootas.length; i++) {
      total += kootas[i].scored;
    }
    total = Number(total.toFixed(1));
    var percentage = Number(((total / 36) * 100).toFixed(1));

    var verdict = "";
    var verdictHindi = "";
    if (total >= 28) { verdict = "Uttam (Excellent)"; verdictHindi = "\u0909\u0924\u094D\u0924\u092E"; }
    else if (total >= 22) { verdict = "Good (Shubh)"; verdictHindi = "\u0936\u0941\u092D"; }
    else if (total >= 18) { verdict = "Madhyam (Average)"; verdictHindi = "\u092E\u0927\u094D\u092F\u092E"; }
    else { verdict = "Ashubh (Unfavorable - needs remedies)"; verdictHindi = "\u0905\u0936\u0941\u092D"; }

    var mangal1 = mangalDosha(p1.chart);
    var mangal2 = mangalDosha(p2.chart);

    var nadiDosha = { present: nadiResult.doshaPresent, cancelled: nadiResult.doshaCancelled, reason: nadiResult.reason };
    var bhakootDosha = { present: bhakootResult.doshaPresent, cancelled: bhakootResult.doshaCancelled, reason: bhakootResult.reason };

    var guidance = matchmakingGuidance(total, nadiDosha, bhakootDosha, mangal1, mangal2);

    return {
      person1: compactBirthProfile(p1.chart),
      person2: compactBirthProfile(p2.chart),
      ashtakoot: {
        kootas: kootas,
        total: total,
        maximum: 36,
        percentage: percentage,
        verdict: verdict,
        verdictHindi: verdictHindi
      },
      doshas: {
        nadiDosha: nadiDosha,
        bhakootDosha: bhakootDosha,
        mangalDosha: {
          person1: mangal1,
          person2: mangal2,
          balanced: mangal1.hasDosha === mangal2.hasDosha
        }
      },
      guidance: guidance,
      disclaimer: "Yeh Ashtakoot Guna Milan classical shastric rules par based hai. Final decision me sampurna kundli milan, family values aur practical compatibility bhi dekhein."
    };
  }

  function compactBirthProfile(chart) {
    return {
      name: chart.name,
      moonSign: chart.moonSign.rashi,
      nakshatra: chart.moonSign.nakshatra,
      pada: chart.moonSign.pada,
      lagna: chart.ascendant.rashi
    };
  }

  function mangalDosha(chart) {
    const mars = chart.planets.find(function (row) { return row.planet === "Mars"; });
    const doshaHouses = [1, 2, 4, 7, 8, 12];
    const hasDosha = doshaHouses.indexOf(mars.house) >= 0;
    return {
      hasDosha: hasDosha,
      marsHouse: mars.house,
      level: hasDosha ? ([7, 8].indexOf(mars.house) >= 0 ? "High" : "Moderate") : "Low",
      note: hasDosha ? `Mars house ${mars.house} me hai, isliye matching me balance check zaruri hai.` : "Mars sensitive houses me nahi hai."
    };
  }

  function askAstrologer(input) {
    const data = input || {};
    const question = String(data.question || "").trim();
    const sign = data.sign ? normalizeSign(data.sign) : null;
    const lower = question.toLowerCase();
    let topic = "general";
    if (/career|job|business|kaam|naukri|promotion/.test(lower)) topic = "career";
    if (/love|marriage|relationship|shaadi|partner/.test(lower)) topic = "relationship";
    if (/money|finance|paisa|wealth|income/.test(lower)) topic = "finance";
    if (/health|sehat|stress|sleep/.test(lower)) topic = "health";
    if (/kundli|birth|chart|janm/.test(lower)) topic = "kundli";

    const signPart = sign ? `${sign} rashi ke hisab se ` : "";
    const answerMap = {
      career: `${signPart}career me next 30 days disciplined execution ka phase hai. Resume/client pitch/documentation ko update karein, aur Wednesday ya Thursday ko important follow-up rakhein.`,
      relationship: `${signPart}relationship me expectations ko seedha par soft tareeke se bolna zaruri hai. Friday ko harmony aur apology/conversation ke liye better energy rahegi.`,
      finance: `${signPart}finance me impulsive spending avoid karein. Savings ko 2 buckets me divide karein: emergency aur growth. Yellow/green day planning helpful rahegi.`,
      health: `${signPart}health me sleep, hydration aur digestion par focus rakhein. Heavy decisions late night na lein; 10 minute breathing practice daily useful hogi.`,
      kundli: "Janm kundli ke liye exact date, time aur place se Lagna, Moon sign, Nakshatra, Dasha aur house placements calculate hote hain. Birth Chart option se full local report generate ho jayegi.",
      general: `${signPart}abhi sabse important cheez clarity aur routine hai. Ek kaam choose karke us par 7 din consistently action lein; results visibly improve honge.`
    };

    const remedyPlanet = sign ? SIGN_LORDS[SIGN_NAMES.indexOf(sign)] : "Jupiter";
    return {
      question: question || "General guidance",
      topic: topic,
      answer: answerMap[topic],
      remedy: dailyRemedy(sign || "Sagittarius", remedyPlanet),
      note: "This answer is generated by the local rule-based astrologer engine."
    };
  }

  function blog(input) {
    const topic = String(input && input.topic ? input.topic : "Moon Signs").trim();
    const seed = hashSeed(topic);
    const articleTopics = {
      "Moon Signs": {
        title: "Understanding Your Moon Sign",
        sections: [
          "Moon sign mind, emotion aur instinct ka core indicator hota hai.",
          "Vedic reading me Moon se Nakshatra, Dasha aur daily transit ka practical result nikala jata hai.",
          "Moon strong ho to emotional clarity, memory aur public connection better hota hai."
        ]
      },
      "Planetary Movements": {
        title: "Planetary Movements and Daily Decisions",
        sections: [
          "Transit planets natal chart ke houses ko activate karte hain.",
          "Moon fast-moving hai, isliye daily mood aur short-term timing me iska role sabse zyada hota hai.",
          "Jupiter growth deta hai, Saturn discipline aur maturity sikhata hai."
        ]
      },
      Remedies: {
        title: "Simple Vedic Remedies for Balance",
        sections: [
          "Remedies ka aim planet ko bribe karna nahi, apni habit aur energy ko align karna hai.",
          "Donation, mantra, fasting, seva aur discipline sab practical remedies ke forms hain.",
          "Best remedy wahi hai jo sustainable ho aur kisi ko harm na kare."
        ]
      },
      "Marriage Compatibility": {
        title: "Marriage Compatibility Beyond Score",
        sections: [
          "Ashtakoot score useful snapshot deta hai, par full chart matching me 7th house, Venus, Jupiter aur Dasha bhi dekhi jati hai.",
          "Nadi, Bhakoot aur Mangal balance ko carefully interpret karna chahiye.",
          "Communication, family values aur practical goals score se equally important hain."
        ]
      },
      "Career Guidance": {
        title: "Career Guidance Through Houses",
        sections: [
          "10th house profession, 6th house service aur 11th house gains ko show karta hai.",
          "Strong Mercury communication, analytics aur trade me help karta hai.",
          "Saturn strong ho to long-term systems, engineering, operations aur management favor hota hai."
        ]
      }
    };
    const selected = articleTopics[topic] || articleTopics[seededPick(seed, Object.keys(articleTopics))];
    return {
      topic: topic,
      title: selected.title,
      readTime: `${5 + (seed % 6)} min read`,
      sections: selected.sections,
      takeaway: "Astrology ko guidance tool ki tarah use karein: awareness plus action sabse strong combination hai."
    };
  }

  function contact(input) {
    const data = input || {};
    return {
      name: titleCase(data.name || "Visitor"),
      email: String(data.email || "").trim(),
      message: String(data.message || "").trim(),
      status: "received",
      replyWindow: "24-48 hours"
    };
  }

  return {
    constants: {
      signs: SIGN_NAMES,
      rashis: SIGN_HINDI,
      rashisHindi: SIGN_DEVANAGARI,
      nakshatras: NAKSHATRAS,
      places: placeSuggestions()
    },
    resolvePlace: resolvePlace,
    makeChart: makeChart,
    navamsaChart: navamsaChart,
    horaChart: horaChart,
    drekkanaChart: drekkanaChart,
    dashamChart: dashamChart,
    divisionalCharts: divisionalCharts,
    generateKundli: generateKundli,
    dailyHoroscope: dailyHoroscope,
    panchang: panchang,
    matchmaking: matchmaking,
    askAstrologer: askAstrologer,
    blog: blog,
    contact: contact
  };
});
