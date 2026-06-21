(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.JyotishI18n = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var strings = {
    en: {
      // Navigation
      "nav.home": "Home",
      "nav.kundli": "Birth Chart",
      "nav.horoscope": "Daily Horoscope",
      "nav.matchmaking": "Kundli Milan",
      "nav.panchang": "Panchang",
      "nav.contact": "Contact Us",
      "nav.blog": "Blog",
      "nav.ask": "Talk to Astrologer",
      "nav.hindi": "Hindi",

      // Form labels
      "form.name": "Full Name",
      "form.date": "Birth Date",
      "form.time": "Birth Time",
      "form.place": "Birth Place",
      "form.submit": "Submit",
      "form.generate": "Generate Birth Chart",
      "form.readHoroscope": "Read Horoscope",
      "form.matchNow": "Match Now",
      "form.viewPanchang": "View Panchang",
      "form.ask": "Ask",
      "form.send": "Send Message",
      "form.sign": "Zodiac Sign",
      "form.question": "Question",
      "form.email": "Email",
      "form.message": "Message",
      "form.person1": "Person 1",
      "form.person2": "Person 2",

      // Planet names
      "planets.Sun": "Sun",
      "planets.Moon": "Moon",
      "planets.Mars": "Mars",
      "planets.Mercury": "Mercury",
      "planets.Jupiter": "Jupiter",
      "planets.Venus": "Venus",
      "planets.Saturn": "Saturn",
      "planets.Rahu": "Rahu",
      "planets.Ketu": "Ketu",

      // Sign names
      "signs.Aries": "Aries",
      "signs.Taurus": "Taurus",
      "signs.Gemini": "Gemini",
      "signs.Cancer": "Cancer",
      "signs.Leo": "Leo",
      "signs.Virgo": "Virgo",
      "signs.Libra": "Libra",
      "signs.Scorpio": "Scorpio",
      "signs.Sagittarius": "Sagittarius",
      "signs.Capricorn": "Capricorn",
      "signs.Aquarius": "Aquarius",
      "signs.Pisces": "Pisces",

      // Chart types
      "charts.d1": "Rashi Chart (D1)",
      "charts.d2": "Hora Chart (D2)",
      "charts.d3": "Drekkana Chart (D3)",
      "charts.d9": "Navamsa Chart (D9)",
      "charts.d10": "Dashamsa Chart (D10)",

      // Yoga names
      "yoga.rajyoga": "Raj Yoga",
      "yoga.gajakesari": "Gajakesari Yoga",
      "yoga.budhaditya": "Budhaditya Yoga",
      "yoga.malavya": "Malavya Yoga",
      "yoga.hamsa": "Hamsa Yoga",
      "yoga.ruchaka": "Ruchaka Yoga",
      "yoga.bhadra": "Bhadra Yoga",
      "yoga.shasha": "Shasha Yoga",
      "yoga.lakshmi": "Lakshmi Yoga",
      "yoga.dhan": "Dhan Yoga",
      "yoga.kaalsarp": "Kaal Sarp Yoga",
      "yoga.mangaldosha": "Mangal Dosha",
      "yoga.kemdrum": "Kemdrum Yoga",
      "yoga.vairagi": "Vairagi Yoga",

      // Dasha labels
      "dasha.mahadasha": "Mahadasha",
      "dasha.antardasha": "Antardasha",
      "dasha.pratyantar": "Pratyantar Dasha",
      "dasha.balance": "Balance at Birth",
      "dasha.active": "Active Period",
      "dasha.sequence": "Dasha Sequence",

      // Matchmaking kootas
      "match.varna": "Varna",
      "match.vashya": "Vashya",
      "match.tara": "Tara",
      "match.yoni": "Yoni",
      "match.grahaMaitri": "Graha Maitri",
      "match.gana": "Gana",
      "match.bhakoot": "Bhakoot",
      "match.nadi": "Nadi",
      "match.total": "Total Score",
      "match.verdict": "Verdict",

      // Common phrases
      "common.disclaimer": "This is a local rule-based Vedic astrology calculation with approximate ephemeris, not a paid third-party API.",
      "common.loading": "Calculating...",
      "common.error": "Something went wrong. Please try again.",
      "common.result": "Result",
      "common.close": "Close",
      "common.planet": "Planet",
      "common.rashi": "Rashi",
      "common.degree": "Degree",
      "common.house": "House",
      "common.nakshatra": "Nakshatra",
      "common.lagna": "Lagna",
      "common.reading": "Reading",
      "common.remedy": "Remedy",
      "common.planetaryPositions": "Planetary Positions",
      "common.langSwitch": "Hindi"
    },

    hi: {
      // Navigation
      "nav.home": "\u0939\u094B\u092E",
      "nav.kundli": "\u091C\u0928\u094D\u092E \u0915\u0941\u0923\u094D\u0921\u0932\u0940",
      "nav.horoscope": "\u0926\u0948\u0928\u093F\u0915 \u0930\u093E\u0936\u093F\u092B\u0932",
      "nav.matchmaking": "\u0915\u0941\u0923\u094D\u0921\u0932\u0940 \u092E\u093F\u0932\u093E\u0928",
      "nav.panchang": "\u092A\u0902\u091A\u093E\u0902\u0917",
      "nav.contact": "\u0938\u0902\u092A\u0930\u094D\u0915 \u0915\u0930\u0947\u0902",
      "nav.blog": "\u092C\u094D\u0932\u0949\u0917",
      "nav.ask": "\u091C\u094D\u092F\u094B\u0924\u093F\u0937\u0940 \u0938\u0947 \u092A\u0942\u091B\u0947\u0902",
      "nav.hindi": "English",

      // Form labels
      "form.name": "\u092A\u0942\u0930\u093E \u0928\u093E\u092E",
      "form.date": "\u091C\u0928\u094D\u092E \u0924\u093F\u0925\u093F",
      "form.time": "\u091C\u0928\u094D\u092E \u0938\u092E\u092F",
      "form.place": "\u091C\u0928\u094D\u092E \u0938\u094D\u0925\u093E\u0928",
      "form.submit": "\u0938\u092C\u092E\u093F\u091F \u0915\u0930\u0947\u0902",
      "form.generate": "\u0915\u0941\u0923\u094D\u0921\u0932\u0940 \u092C\u0928\u093E\u090F\u0902",
      "form.readHoroscope": "\u0930\u093E\u0936\u093F\u092B\u0932 \u092A\u0922\u093C\u0947\u0902",
      "form.matchNow": "\u092E\u093F\u0932\u093E\u0928 \u0915\u0930\u0947\u0902",
      "form.viewPanchang": "\u092A\u0902\u091A\u093E\u0902\u0917 \u0926\u0947\u0916\u0947\u0902",
      "form.ask": "\u092A\u0942\u091B\u0947\u0902",
      "form.send": "\u0938\u0902\u0926\u0947\u0936 \u092D\u0947\u091C\u0947\u0902",
      "form.sign": "\u0930\u093E\u0936\u093F",
      "form.question": "\u092A\u094D\u0930\u0936\u094D\u0928",
      "form.email": "\u0908\u092E\u0947\u0932",
      "form.message": "\u0938\u0902\u0926\u0947\u0936",
      "form.person1": "\u0935\u094D\u092F\u0915\u094D\u0924\u093F 1",
      "form.person2": "\u0935\u094D\u092F\u0915\u094D\u0924\u093F 2",

      // Planet names
      "planets.Sun": "\u0938\u0942\u0930\u094D\u092F",
      "planets.Moon": "\u091A\u0902\u0926\u094D\u0930",
      "planets.Mars": "\u092E\u0902\u0917\u0932",
      "planets.Mercury": "\u092C\u0941\u0927",
      "planets.Jupiter": "\u0917\u0941\u0930\u0941",
      "planets.Venus": "\u0936\u0941\u0915\u094D\u0930",
      "planets.Saturn": "\u0936\u0928\u093F",
      "planets.Rahu": "\u0930\u093E\u0939\u0941",
      "planets.Ketu": "\u0915\u0947\u0924\u0941",

      // Sign names
      "signs.Aries": "\u092E\u0947\u0937",
      "signs.Taurus": "\u0935\u0943\u0937\u092D",
      "signs.Gemini": "\u092E\u093F\u0925\u0941\u0928",
      "signs.Cancer": "\u0915\u0930\u094D\u0915",
      "signs.Leo": "\u0938\u093F\u0902\u0939",
      "signs.Virgo": "\u0915\u0928\u094D\u092F\u093E",
      "signs.Libra": "\u0924\u0941\u0932\u093E",
      "signs.Scorpio": "\u0935\u0943\u0936\u094D\u091A\u093F\u0915",
      "signs.Sagittarius": "\u0927\u0928\u0941",
      "signs.Capricorn": "\u092E\u0915\u0930",
      "signs.Aquarius": "\u0915\u0941\u0902\u092D",
      "signs.Pisces": "\u092E\u0940\u0928",

      // Chart types
      "charts.d1": "\u0930\u093E\u0936\u093F \u091A\u093E\u0930\u094D\u091F (D1)",
      "charts.d2": "\u0939\u094B\u0930\u093E \u091A\u093E\u0930\u094D\u091F (D2)",
      "charts.d3": "\u0926\u094D\u0930\u0947\u0915\u094D\u0915\u093E\u0923 \u091A\u093E\u0930\u094D\u091F (D3)",
      "charts.d9": "\u0928\u0935\u093E\u0902\u0936 \u091A\u093E\u0930\u094D\u091F (D9)",
      "charts.d10": "\u0926\u0936\u092E\u093E\u0902\u0936 \u091A\u093E\u0930\u094D\u091F (D10)",

      // Yoga names
      "yoga.rajyoga": "\u0930\u093E\u091C \u092F\u094B\u0917",
      "yoga.gajakesari": "\u0917\u091C\u0915\u0947\u0938\u0930\u0940 \u092F\u094B\u0917",
      "yoga.budhaditya": "\u092C\u0941\u0927\u093E\u0926\u093F\u0924\u094D\u092F \u092F\u094B\u0917",
      "yoga.malavya": "\u092E\u093E\u0932\u0935\u094D\u092F \u092F\u094B\u0917",
      "yoga.hamsa": "\u0939\u0902\u0938 \u092F\u094B\u0917",
      "yoga.ruchaka": "\u0930\u0941\u091A\u0915 \u092F\u094B\u0917",
      "yoga.bhadra": "\u092D\u0926\u094D\u0930 \u092F\u094B\u0917",
      "yoga.shasha": "\u0936\u0936 \u092F\u094B\u0917",
      "yoga.lakshmi": "\u0932\u0915\u094D\u0937\u094D\u092E\u0940 \u092F\u094B\u0917",
      "yoga.dhan": "\u0927\u0928 \u092F\u094B\u0917",
      "yoga.kaalsarp": "\u0915\u093E\u0932 \u0938\u0930\u094D\u092A \u092F\u094B\u0917",
      "yoga.mangaldosha": "\u092E\u0902\u0917\u0932 \u0926\u094B\u0937",
      "yoga.kemdrum": "\u0915\u0947\u092E\u0926\u094D\u0930\u0941\u092E \u092F\u094B\u0917",
      "yoga.vairagi": "\u0935\u0948\u0930\u093E\u0917\u0940 \u092F\u094B\u0917",

      // Dasha labels
      "dasha.mahadasha": "\u092E\u0939\u093E\u0926\u0936\u093E",
      "dasha.antardasha": "\u0905\u0928\u094D\u0924\u0930\u0926\u0936\u093E",
      "dasha.pratyantar": "\u092A\u094D\u0930\u0924\u094D\u092F\u0928\u094D\u0924\u0930 \u0926\u0936\u093E",
      "dasha.balance": "\u091C\u0928\u094D\u092E \u0915\u0947 \u0938\u092E\u092F \u0936\u0947\u0937",
      "dasha.active": "\u0938\u0915\u094D\u0930\u093F\u092F \u0905\u0935\u0927\u093F",
      "dasha.sequence": "\u0926\u0936\u093E \u0915\u094D\u0930\u092E",

      // Matchmaking kootas
      "match.varna": "\u0935\u0930\u094D\u0923",
      "match.vashya": "\u0935\u0936\u094D\u092F",
      "match.tara": "\u0924\u093E\u0930\u093E",
      "match.yoni": "\u092F\u094B\u0928\u093F",
      "match.grahaMaitri": "\u0917\u094D\u0930\u0939 \u092E\u0948\u0924\u094D\u0930\u0940",
      "match.gana": "\u0917\u0923",
      "match.bhakoot": "\u092D\u0915\u0942\u091F",
      "match.nadi": "\u0928\u093E\u0921\u0940",
      "match.total": "\u0915\u0941\u0932 \u0905\u0902\u0915",
      "match.verdict": "\u0928\u093F\u0930\u094D\u0923\u092F",

      // Common phrases
      "common.disclaimer": "\u092F\u0939 \u090F\u0915 \u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0928\u093F\u092F\u092E-\u0906\u0927\u093E\u0930\u093F\u0924 \u0935\u0948\u0926\u093F\u0915 \u091C\u094D\u092F\u094B\u0924\u093F\u0937 \u0917\u0923\u0928\u093E \u0939\u0948, \u0915\u093F\u0938\u0940 \u0924\u0943\u0924\u0940\u092F-\u092A\u0915\u094D\u0937 API \u0928\u0939\u0940\u0902\u0964",
      "common.loading": "\u0917\u0923\u0928\u093E \u0939\u094B \u0930\u0939\u0940 \u0939\u0948...",
      "common.error": "\u0915\u0941\u091B \u0917\u0932\u0924 \u0939\u094B \u0917\u092F\u0940\u0964 \u0915\u0943\u092A\u092F\u093E \u092A\u0941\u0928\u0903 \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0947\u0902\u0964",
      "common.result": "\u092A\u0930\u093F\u0923\u093E\u092E",
      "common.close": "\u092C\u0902\u0926 \u0915\u0930\u0947\u0902",
      "common.planet": "\u0917\u094D\u0930\u0939",
      "common.rashi": "\u0930\u093E\u0936\u093F",
      "common.degree": "\u0905\u0902\u0936",
      "common.house": "\u092D\u093E\u0935",
      "common.nakshatra": "\u0928\u0915\u094D\u0937\u0924\u094D\u0930",
      "common.lagna": "\u0932\u0917\u094D\u0928",
      "common.reading": "\u092B\u0932\u093E\u0926\u0947\u0936",
      "common.remedy": "\u0909\u092A\u093E\u092F",
      "common.planetaryPositions": "\u0917\u094D\u0930\u0939 \u0938\u094D\u0925\u093F\u0924\u093F",
      "common.langSwitch": "English"
    }
  };

  var currentLang = "en";

  // Load saved preference
  if (typeof localStorage !== "undefined") {
    try {
      var saved = localStorage.getItem("jyotish_lang");
      if (saved && strings[saved]) {
        currentLang = saved;
      }
    } catch (e) { /* localStorage not available */ }
  }

  function setLang(lang) {
    if (strings[lang]) {
      currentLang = lang;
      if (typeof localStorage !== "undefined") {
        try {
          localStorage.setItem("jyotish_lang", lang);
        } catch (e) { /* ignore */ }
      }
    }
  }

  function t(key) {
    var langStrings = strings[currentLang] || strings.en;
    if (langStrings[key] !== undefined) {
      return langStrings[key];
    }
    // Fallback to English
    if (strings.en[key] !== undefined) {
      return strings.en[key];
    }
    return key;
  }

  function getLang() {
    return currentLang;
  }

  return {
    currentLang: currentLang,
    setLang: setLang,
    getLang: getLang,
    t: t,
    strings: strings
  };
});
