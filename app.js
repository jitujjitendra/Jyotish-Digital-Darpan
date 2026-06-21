(function () {
  "use strict";

  const engine = window.JyotishEngine;
  const i18n = window.JyotishI18n || null;
  const signs = engine ? engine.constants.signs : [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  const rashiHindi = engine && engine.constants.rashisHindi ? engine.constants.rashisHindi : [
    "मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या",
    "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"
  ];
  const fallbackPlaces = [
    "Delhi", "New Delhi", "Mumbai", "Kolkata", "Chennai", "Bengaluru", "Hyderabad",
    "Pune", "Jaipur", "Lucknow", "Pilibhit, Uttar Pradesh", "Pithoragarh, Uttarakhand",
    "Pinjore, Haryana", "Pimpri-Chinchwad, Maharashtra", "Puri, Odisha"
  ];

  function tt(key) {
    return i18n ? i18n.t(key) : key;
  }

  function toggleLanguage() {
    if (!i18n) return;
    var newLang = i18n.getLang() === "en" ? "hi" : "en";
    i18n.setLang(newLang);
    // Update the Hindi/English toggle button text
    var hindiButtons = byText("button", newLang === "hi" ? "\u0939\u093F\u0902\u0926\u0940" : "English");
    hindiButtons.forEach(function(btn) {
      btn.textContent = tt("common.langSwitch");
    });
    // Also look for the English button text when switching back
    var altButtons = byText("button", newLang === "en" ? "\u0939\u093F\u0902\u0926\u0940" : "English");
    altButtons.concat(hindiButtons).forEach(function(btn) {
      btn.textContent = tt("common.langSwitch");
    });
    // Update nav links text if present
    updateNavText();
  }

  function updateNavText() {
    if (!i18n) return;
    // Update common nav text elements
    var navMappings = [
      { text: ["Home", "\u0939\u094B\u092E"], key: "nav.home" },
      { text: ["Birth Chart", "\u091C\u0928\u094D\u092E \u0915\u0941\u0923\u094D\u0921\u0932\u0940"], key: "nav.kundli" },
      { text: ["Daily Horoscope", "\u0926\u0948\u0928\u093F\u0915 \u0930\u093E\u0936\u093F\u092B\u0932"], key: "nav.horoscope" },
      { text: ["Kundli Milan", "\u0915\u0941\u0923\u094D\u0921\u0932\u0940 \u092E\u093F\u0932\u093E\u0928"], key: "nav.matchmaking" },
      { text: ["Panchang", "\u092A\u0902\u091A\u093E\u0902\u0917"], key: "nav.panchang" },
      { text: ["Contact Us", "\u0938\u0902\u092A\u0930\u094D\u0915 \u0915\u0930\u0947\u0902"], key: "nav.contact" }
    ];
    navMappings.forEach(function(mapping) {
      mapping.text.forEach(function(txt) {
        var links = Array.from(document.querySelectorAll("a, button")).filter(function(el) {
          return el.textContent.trim() === txt;
        });
        links.forEach(function(el) {
          el.textContent = tt(mapping.key);
        });
      });
    });
  }

  function byText(selector, text) {
    const target = text.toLowerCase();
    return Array.from(document.querySelectorAll(selector)).filter(function (element) {
      return element.textContent.trim().toLowerCase() === target;
    });
  }

  function containsText(selector, text) {
    const target = text.toLowerCase();
    return Array.from(document.querySelectorAll(selector)).filter(function (element) {
      return element.textContent.trim().toLowerCase().indexOf(target) >= 0;
    });
  }

  async function callApi(path, options, fallback) {
    const opts = options || {};
    if (window.location.protocol !== "file:") {
      try {
        const response = await fetch(path, Object.assign({
          headers: { "Content-Type": "application/json" }
        }, opts));
        if (response.ok) return await response.json();
      } catch (error) {
        // Static hosting fallback keeps features usable when /api routes are unavailable.
      }
    }
    return fallback();
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function field(name, label, type, value) {
    return `
      <label style="display:block;margin:10px 0 4px;color:#c4b5fd;font-size:13px;">${escapeHtml(label)}</label>
      <input name="${name}" type="${type || "text"}" value="${escapeHtml(value || "")}" required
        style="width:100%;box-sizing:border-box;margin:0 0 8px;">
    `;
  }

  function placeField(name, label, value) {
    return `
      <label style="display:block;margin:10px 0 4px;color:#c4b5fd;font-size:13px;">${escapeHtml(label)}</label>
      <input name="${name}" type="text" value="${escapeHtml(value || "")}" required list="jyotishPlaceList" autocomplete="off" data-place-autocomplete="true"
        style="width:100%;box-sizing:border-box;margin:0 0 8px;">
    `;
  }

  function selectField(name, label, values) {
    return `
      <label style="display:block;margin:10px 0 4px;color:#c4b5fd;font-size:13px;">${label}</label>
      <select name="${name}" style="width:100%;box-sizing:border-box;margin:0 0 8px;background-color:rgba(255,255,255,0.1);color:#fff;">
        ${values.map(function (value, index) {
          return `<option value="${escapeHtml(value)}" style="background:#fff;color:#111827;">${escapeHtml(value)} (${escapeHtml(rashiHindi[index] || "")})</option>`;
        }).join("")}
      </select>
    `;
  }

  function ensurePlaceDatalist() {
    let datalist = document.getElementById("jyotishPlaceList");
    const places = engine && engine.constants.places ? engine.constants.places : fallbackPlaces;
    if (!datalist) {
      datalist = document.createElement("datalist");
      datalist.id = "jyotishPlaceList";
      document.body.appendChild(datalist);
    }
    datalist.innerHTML = places.map(function (place) {
      return `<option value="${escapeHtml(place)}"></option>`;
    }).join("");
    return datalist;
  }

  function enhancePlaceInputs(root) {
    ensurePlaceDatalist();
    const scope = root || document;
    scope.querySelectorAll("input[data-place-autocomplete], input[name='place'], input[name='p1place'], input[name='p2place'], input[placeholder='Birth Place']").forEach(function (input) {
      input.setAttribute("list", "jyotishPlaceList");
      input.setAttribute("autocomplete", "off");
    });
  }

  function ensureModal() {
    let modal = document.getElementById("jyotishActionModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "jyotishActionModal";
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content" style="max-width:780px;max-height:86vh;overflow:auto;padding:24px;border:1px solid rgba(168,85,247,.45);box-shadow:0 20px 80px rgba(0,0,0,.55);">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:16px;">
          <h2 id="jyotishModalTitle" style="margin:0;color:#fff;font-size:24px;font-weight:700;"></h2>
          <button type="button" data-close-modal style="width:auto;margin:0;padding:8px 12px;border-radius:8px;background:#111827;color:#e5e7eb;">${tt("common.close")}</button>
        </div>
        <div id="jyotishModalBody"></div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener("click", function (event) {
      if (event.target === modal || event.target.matches("[data-close-modal]")) closeModal();
    });
    return modal;
  }

  function openModal(title, html) {
    const modal = ensureModal();
    modal.querySelector("#jyotishModalTitle").textContent = title;
    modal.querySelector("#jyotishModalBody").innerHTML = html;
    modal.classList.add("active");
  }

  function closeModal() {
    const modal = document.getElementById("jyotishActionModal");
    if (modal) modal.classList.remove("active");
  }

  function setModalBody(html) {
    ensureModal().querySelector("#jyotishModalBody").innerHTML = html;
  }

  function buttonHtml(label) {
    return `<button type="submit" class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm transition-colors" style="width:auto;margin-top:12px;">${label}</button>`;
  }

  function today() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  function bindSubmit(form, handler) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const formData = new FormData(form);
      await handler(Object.fromEntries(formData.entries()), form);
    });
  }

  function showBirthChartForm() {
    openModal(tt("nav.kundli"), `
      <form id="modalKundliForm">
        ${field("name", tt("form.name"), "text")}
        ${field("date", tt("form.date"), "date")}
        ${field("time", tt("form.time"), "time")}
        ${placeField("place", tt("form.place"), "Delhi")}
        ${buttonHtml(tt("form.generate"))}
      </form>
      <div id="modalResult" style="margin-top:18px;"></div>
    `);
    enhancePlaceInputs(document.getElementById("modalKundliForm"));
    bindSubmit(document.getElementById("modalKundliForm"), async function (data) {
      const result = document.getElementById("modalResult");
      result.innerHTML = loadingText();
      const report = await kundli(data);
      result.innerHTML = renderKundli(report);
    });
  }

  async function kundli(data) {
    return callApi("/api/kundli", {
      method: "POST",
      body: JSON.stringify(data)
    }, function () {
      return engine.generateKundli(data);
    });
  }

  function renderKundli(report) {
    const reportData = encodeURIComponent(JSON.stringify({ name: report.name, date: report.input.date, time: report.input.time, place: report.input.place }));
    return `
      <div style="text-align:left;color:#e5e7eb;">
        <h3 style="font-size:20px;font-weight:700;margin:0 0 8px;">${escapeHtml(report.name)} - ${tt("nav.kundli")}</h3>
        <p style="color:#cbd5e1;margin:0 0 12px;">${escapeHtml(report.input.date)} ${escapeHtml(report.input.time)}, ${escapeHtml(report.input.place)} (${escapeHtml(report.input.timezone)})</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin:14px 0;">
          ${infoBox(tt("common.lagna"), `${report.ascendant.symbol} ${report.ascendant.rashi}`, report.ascendant.degree)}
          ${infoBox(tt("planets.Moon") + " " + tt("common.rashi"), `${report.moonSign.symbol} ${report.moonSign.rashi}`, `${report.moonSign.nakshatra} Pada ${report.moonSign.pada}`)}
          ${infoBox(tt("planets.Sun") + " " + tt("common.rashi"), `${report.sunSign.symbol} ${report.sunSign.rashi}`, "Sidereal")}
          ${infoBox(tt("dasha.mahadasha"), report.dasha.activeMahadasha, `Birth lord ${report.dasha.birthNakshatraLord}`)}
        </div>
        <h4 style="color:#c4b5fd;margin:16px 0 8px;">${tt("common.planetaryPositions")}</h4>
        ${renderPlanetTable(report.planets)}
        <h4 style="color:#c4b5fd;margin:16px 0 8px;">${tt("common.reading")}</h4>
        <ul style="padding-left:18px;margin:0;">
          ${report.summary.concat(report.houseHighlights || []).map(function (line) {
            return `<li style="margin:6px 0;">${escapeHtml(line)}</li>`;
          }).join("")}
        </ul>
        <p style="margin-top:12px;color:#ddd;">${escapeHtml(report.reading.remedy)}</p>
        <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;">
          <button onclick="(function(){sessionStorage.setItem('jyotishReportData',decodeURIComponent('${reportData}'));window.open('/report','_blank')})()" style="display:inline-block;background:#7c3aed;color:#fff;padding:8px 16px;border-radius:8px;border:none;font-size:13px;cursor:pointer;">Download Report (PDF)</button>
          <button onclick="window.jyotishShare && window.jyotishShare('kundli','${escapeHtml(report.name)}','${escapeHtml(report.ascendant.rashi)}','${escapeHtml(report.moonSign.rashi)}')" style="background:#25D366;color:#fff;padding:8px 16px;border-radius:8px;border:none;font-size:13px;cursor:pointer;">Share on WhatsApp</button>
        </div>
        <p style="font-size:12px;color:#9ca3af;margin-top:12px;">${escapeHtml(report.disclaimer)}</p>
      </div>
    `;
  }

  function infoBox(title, value, detail) {
    return `
      <div style="background:rgba(17,24,39,.72);border:1px solid rgba(124,58,237,.35);border-radius:8px;padding:12px;">
        <div style="font-size:12px;color:#a78bfa;">${escapeHtml(title)}</div>
        <div style="font-weight:700;color:#fff;">${escapeHtml(value)}</div>
        <div style="font-size:12px;color:#cbd5e1;">${escapeHtml(detail)}</div>
      </div>
    `;
  }

  function renderPlanetTable(planets) {
    return `
      <div style="overflow:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead><tr style="color:#c4b5fd;border-bottom:1px solid rgba(255,255,255,.12);">
            <th style="text-align:left;padding:8px;">${tt("common.planet")}</th>
            <th style="text-align:left;padding:8px;">${tt("common.rashi")}</th>
            <th style="text-align:left;padding:8px;">${tt("common.degree")}</th>
            <th style="text-align:left;padding:8px;">${tt("common.house")}</th>
            <th style="text-align:left;padding:8px;">${tt("common.nakshatra")}</th>
          </tr></thead>
          <tbody>
            ${planets.map(function (planet) {
              return `<tr style="border-bottom:1px solid rgba(255,255,255,.08);">
                <td style="padding:8px;">${escapeHtml(planet.planet)}</td>
                <td style="padding:8px;">${escapeHtml(planet.symbol)} ${escapeHtml(planet.rashi)}</td>
                <td style="padding:8px;">${escapeHtml(planet.degree)}</td>
                <td style="padding:8px;">${escapeHtml(planet.house)}</td>
                <td style="padding:8px;">${escapeHtml(planet.nakshatra)} ${escapeHtml(planet.pada)}</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function showHoroscopeForm(sign) {
    openModal(tt("nav.horoscope"), `
      <form id="dailyHoroscopeForm">
        ${selectField("sign", tt("form.sign"), signs)}
        ${field("date", tt("form.date"), "date", today())}
        ${placeField("place", tt("form.place"), "Delhi")}
        ${buttonHtml(tt("form.readHoroscope"))}
      </form>
      <div id="modalResult" style="margin-top:18px;"></div>
    `);
    enhancePlaceInputs(document.getElementById("dailyHoroscopeForm"));
    if (sign) document.querySelector("#dailyHoroscopeForm [name='sign']").value = sign;
    bindSubmit(document.getElementById("dailyHoroscopeForm"), async function (data) {
      document.getElementById("modalResult").innerHTML = loadingText();
      const query = new URLSearchParams(data).toString();
      const report = await callApi(`/api/horoscope/daily?${query}`, {}, function () {
        return engine.dailyHoroscope(data);
      });
      document.getElementById("modalResult").innerHTML = renderHoroscope(report);
    });
  }

  function renderHoroscope(report) {
    return `
      <div style="text-align:left;">
        <div style="font-size:28px;">${escapeHtml(report.symbol)} <strong>${escapeHtml(report.sign)} (${escapeHtml(report.rashi)})</strong></div>
        <p style="color:#cbd5e1;">${escapeHtml(report.date)} | Focus: ${escapeHtml(report.focus)} | Mood: ${escapeHtml(report.mood)}</p>
        <p>${escapeHtml(report.prediction)}</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:12px 0;">
          ${infoBox("Love", report.love, "Relationship")}
          ${infoBox("Career", report.career, "Work")}
          ${infoBox("Health", report.health, "Wellness")}
          ${infoBox("Lucky", `${report.luckyColor} / ${report.luckyNumber}`, report.panchangHint)}
        </div>
        <p style="color:#ddd;">${escapeHtml(report.remedy)}</p>
        <div class="share-buttons">
          <button class="share-btn whatsapp" onclick="window.jyotishShareHoroscope && window.jyotishShareHoroscope('${escapeHtml(report.sign)}','${escapeHtml(report.rashi)}','${escapeHtml(report.prediction)}','${escapeHtml(report.luckyColor)}','${escapeHtml(String(report.luckyNumber))}')">WhatsApp Share</button>
          <button class="share-btn twitter" onclick="window.jyotishShareTwitter && window.jyotishShareTwitter('${escapeHtml(report.sign)}','${escapeHtml(report.rashi)}','${escapeHtml(report.prediction)}')">Twitter Share</button>
          <button class="share-btn copy-link" onclick="window.jyotishCopyLink && window.jyotishCopyLink()">Copy Link</button>
        </div>
      </div>
    `;
  }

  function showPanchangForm() {
    openModal(tt("nav.panchang"), `
      <form id="panchangForm">
        ${field("date", tt("form.date"), "date", today())}
        ${placeField("place", tt("form.place"), "Delhi")}
        ${buttonHtml(tt("form.viewPanchang"))}
      </form>
      <div id="modalResult" style="margin-top:18px;"></div>
    `);
    enhancePlaceInputs(document.getElementById("panchangForm"));
    bindSubmit(document.getElementById("panchangForm"), async function (data) {
      document.getElementById("modalResult").innerHTML = loadingText();
      const report = await callApi(`/api/panchang?${new URLSearchParams(data).toString()}`, {}, function () {
        return engine.panchang(data);
      });
      document.getElementById("modalResult").innerHTML = renderPanchang(report);
    });
  }

  function renderPanchang(report) {
    return `
      <div style="text-align:left;">
        <h3 style="font-size:20px;font-weight:700;margin:0 0 8px;">${escapeHtml(report.place)} Panchang - ${escapeHtml(report.date)}</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin:14px 0;">
          ${infoBox("Tithi", `${report.tithi.paksha}`, `${report.tithi.name} (${report.tithi.completion})`)}
          ${infoBox("Nakshatra", report.nakshatra.name, `${report.nakshatra.lord}, Pada ${report.nakshatra.pada}`)}
          ${infoBox("Moon Sign", `${report.moonSign.symbol} ${report.moonSign.rashi}`, report.moonSign.sign)}
          ${infoBox("Yoga / Karana", report.yoga, report.karana)}
          ${infoBox("Sunrise", report.sunrise, "Local")}
          ${infoBox("Sunset", report.sunset, "Local")}
          ${infoBox("Rahu Kaal", report.rahuKaal, "Avoid new starts")}
          ${infoBox("Abhijit", report.abhijitMuhurat, "Auspicious window")}
        </div>
        <p>${escapeHtml(report.suggestion)}</p>
      </div>
    `;
  }

  function showMatchForm() {
    openModal(tt("nav.matchmaking"), `
      <form id="matchForm">
        <h3 style="color:#c4b5fd;font-weight:700;">${tt("form.person1")}</h3>
        ${field("p1name", tt("form.name"), "text")}
        ${field("p1date", tt("form.date"), "date")}
        ${field("p1time", tt("form.time"), "time")}
        ${placeField("p1place", tt("form.place"), "Delhi")}
        <h3 style="color:#c4b5fd;font-weight:700;margin-top:16px;">${tt("form.person2")}</h3>
        ${field("p2name", tt("form.name"), "text")}
        ${field("p2date", tt("form.date"), "date")}
        ${field("p2time", tt("form.time"), "time")}
        ${placeField("p2place", tt("form.place"), "Mumbai")}
        ${buttonHtml(tt("form.matchNow"))}
      </form>
      <div id="modalResult" style="margin-top:18px;"></div>
    `);
    enhancePlaceInputs(document.getElementById("matchForm"));
    bindSubmit(document.getElementById("matchForm"), async function (data) {
      const payload = {
        person1: { name: data.p1name, date: data.p1date, time: data.p1time, place: data.p1place },
        person2: { name: data.p2name, date: data.p2date, time: data.p2time, place: data.p2place }
      };
      document.getElementById("modalResult").innerHTML = loadingText();
      const report = await callApi("/api/matchmaking", {
        method: "POST",
        body: JSON.stringify(payload)
      }, function () {
        return engine.matchmaking(payload);
      });
      document.getElementById("modalResult").innerHTML = renderMatch(report);
    });
  }

  function renderMatch(report) {
    const scores = report.ashtakoot.scores;
    return `
      <div style="text-align:left;">
        <h3 style="font-size:22px;font-weight:700;margin:0 0 8px;">${report.ashtakoot.total}/36 - ${escapeHtml(report.ashtakoot.verdict)}</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:12px 0;">
          ${infoBox(report.person1.name, `${report.person1.moonSign} Moon`, `${report.person1.nakshatra} Pada ${report.person1.pada}`)}
          ${infoBox(report.person2.name, `${report.person2.moonSign} Moon`, `${report.person2.nakshatra} Pada ${report.person2.pada}`)}
          ${infoBox("Mangal", report.mangalDosha.balanced ? "Balanced" : "Needs review", `${report.mangalDosha.person1.level} / ${report.mangalDosha.person2.level}`)}
        </div>
        <h4 style="color:#c4b5fd;">Ashtakoot</h4>
        <p>Varna ${scores.varna}/1, Vashya ${scores.vashya}/2, Tara ${scores.tara}/3, Yoni ${scores.yoni}/4, Graha Maitri ${scores.grahaMaitri}/5, Gana ${scores.gana}/6, Bhakoot ${scores.bhakoot}/7, Nadi ${scores.nadi}/8</p>
        <ul style="padding-left:18px;">${report.guidance.map(function (line) { return `<li>${escapeHtml(line)}</li>`; }).join("")}</ul>
        <p style="font-size:12px;color:#9ca3af;">${escapeHtml(report.disclaimer)}</p>
      </div>
    `;
  }

  function showAskForm() {
    openModal(tt("nav.ask"), `
      <form id="askForm">
        ${selectField("sign", tt("form.sign"), signs)}
        <label style="display:block;margin:10px 0 4px;color:#c4b5fd;font-size:13px;">${escapeHtml(tt("form.question"))}</label>
        <textarea name="question" rows="4" required style="width:100%;box-sizing:border-box;" placeholder="Career, marriage, finance ya kundli se related sawal likhein"></textarea>
        ${buttonHtml(tt("form.ask"))}
      </form>
      <div id="modalResult" style="margin-top:18px;"></div>
    `);
    bindSubmit(document.getElementById("askForm"), async function (data) {
      document.getElementById("modalResult").innerHTML = loadingText();
      const report = await callApi("/api/ask", {
        method: "POST",
        body: JSON.stringify(data)
      }, function () {
        return engine.askAstrologer(data);
      });
      document.getElementById("modalResult").innerHTML = `
        <div style="text-align:left;">
          <h3 style="font-size:20px;font-weight:700;margin:0 0 8px;">${escapeHtml(report.topic)} guidance</h3>
          <p>${escapeHtml(report.answer)}</p>
          <p style="color:#ddd;">${escapeHtml(report.remedy)}</p>
          <p style="font-size:12px;color:#9ca3af;">${escapeHtml(report.note)}</p>
        </div>
      `;
    });
  }

  function showBlog(topic) {
    openModal("Astrology Blog", loadingText());
    callApi(`/api/blog?${new URLSearchParams({ topic: topic || "Moon Signs" }).toString()}`, {}, function () {
      return engine.blog({ topic: topic || "Moon Signs" });
    }).then(function (article) {
      setModalBody(`
        <article style="text-align:left;">
          <p style="color:#a78bfa;margin:0 0 6px;">${escapeHtml(article.topic)} | ${escapeHtml(article.readTime)}</p>
          <h3 style="font-size:24px;font-weight:700;margin:0 0 12px;">${escapeHtml(article.title)}</h3>
          ${article.sections.map(function (section) { return `<p>${escapeHtml(section)}</p>`; }).join("")}
          <p style="color:#ddd;font-weight:600;">${escapeHtml(article.takeaway)}</p>
        </article>
      `);
    });
  }

  function showContactForm() {
    openModal(tt("nav.contact"), `
      <form id="contactForm">
        ${field("name", tt("form.name"), "text")}
        ${field("email", tt("form.email"), "email")}
        <label style="display:block;margin:10px 0 4px;color:#c4b5fd;font-size:13px;">${escapeHtml(tt("form.message"))}</label>
        <textarea name="message" rows="4" required style="width:100%;box-sizing:border-box;"></textarea>
        ${buttonHtml(tt("form.send"))}
      </form>
      <div id="modalResult" style="margin-top:18px;"></div>
    `);
    bindSubmit(document.getElementById("contactForm"), async function (data) {
      document.getElementById("modalResult").innerHTML = loadingText();
      const report = await callApi("/api/contact", {
        method: "POST",
        body: JSON.stringify(data)
      }, function () {
        return engine.contact(data);
      });
      document.getElementById("modalResult").innerHTML = `<p>Thanks ${escapeHtml(report.name)}. Message ${escapeHtml(report.status)} hai; reply window ${escapeHtml(report.replyWindow)}.</p>`;
    });
  }

  function loadingText() {
    return `<p style="color:#c4b5fd;">${escapeHtml(tt("common.loading"))}</p>`;
  }

  function wireHomePage() {
    const buttonActions = [
      { labels: ["Generate Birth Chart", "Generate Now", "Generate Your Kundli"], action: showBirthChartForm },
      { labels: ["Daily Horoscope", "Read Horoscope"], action: function () { showHoroscopeForm(); } },
      { labels: ["Kundli Milan", "Match Now"], action: showMatchForm },
      { labels: ["Panchang", "View Panchang"], action: showPanchangForm },
      { labels: ["Talk to Astrologer"], action: showAskForm },
      { labels: ["Contact Us"], action: showContactForm },
      { labels: ["हिंदी", "English"], action: function () { toggleLanguage(); } }
    ];

    buttonActions.forEach(function (item) {
      item.labels.forEach(function (label) {
        byText("button", label).forEach(function (button) {
          button.addEventListener("click", function (event) {
            event.preventDefault();
            item.action();
          });
        });
      });
    });

    document.querySelectorAll(".zodiac-sign").forEach(function (card) {
      card.addEventListener("click", function () {
        const sign = card.querySelector(".font-medium") ? card.querySelector(".font-medium").textContent.trim() : "Aries";
        showHoroscopeForm(sign);
      });
    });

    document.querySelectorAll("a").forEach(function (link) {
      const text = link.textContent.trim();
      if (/birth chart/i.test(text)) link.addEventListener("click", function (event) { event.preventDefault(); showBirthChartForm(); });
      if (/match making|kundli milan|marriage compatibility/i.test(text)) link.addEventListener("click", function (event) { event.preventDefault(); showMatchForm(); });
      if (/daily horoscope|horoscope/i.test(text)) link.addEventListener("click", function (event) { event.preventDefault(); showHoroscopeForm(); });
      if (/panchang/i.test(text)) link.addEventListener("click", function (event) { event.preventDefault(); showPanchangForm(); });
      if (/blog|view all articles/i.test(text)) link.addEventListener("click", function (event) { event.preventDefault(); showBlog("Moon Signs"); });
      if (/read more/i.test(text)) {
        link.addEventListener("click", function (event) {
          event.preventDefault();
          const article = link.closest("article");
          const topic = article ? article.querySelector("span").textContent.trim() : "Moon Signs";
          showBlog(topic);
        });
      }
    });

    containsText("h3", "Planetary Influences").forEach(function (node) { node.closest("div").addEventListener("click", function () { showBlog("Planetary Movements"); }); });
    containsText("h3", "Remedies").forEach(function (node) { node.closest("div").addEventListener("click", function () { showBlog("Remedies"); }); });
    containsText("h3", "Marriage Compatibility").forEach(function (node) { node.closest("div").addEventListener("click", function () { showBlog("Marriage Compatibility"); }); });
    containsText("h3", "Career Guidance").forEach(function (node) { node.closest("div").addEventListener("click", function () { showBlog("Career Guidance"); }); });
  }

  function wireBirthChartPage() {
    const form = document.getElementById("kundliForm");
    if (!form) return;

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const inputs = form.querySelectorAll("input");
      const payload = {
        name: inputs[0].value,
        date: inputs[1].value,
        time: inputs[2].value,
        place: inputs[3].value
      };
      const result = document.getElementById("result");
      result.innerHTML = loadingText();
      const report = await kundli(payload);
      result.innerHTML = renderKundli(report);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!engine) return;
    enhancePlaceInputs(document);
    if (document.querySelector(".content-wrapper")) {
      wireHomePage();
      wireDataActions();
      initChatbot();
      loadDynamicBlogs();
    }
    wireBirthChartPage();
  });

  // ==================== DATA-ACTION ROUTING ====================

  function wireDataActions() {
    document.addEventListener("click", function (event) {
      var target = event.target.closest("[data-action]");
      if (!target) return;
      event.preventDefault();
      var action = target.getAttribute("data-action");
      switch (action) {
        case "kundli": showBirthChartForm(); break;
        case "match": showMatchForm(); break;
        case "horoscope": showHoroscopeForm(target.getAttribute("data-sign") || ""); break;
        case "panchang": showPanchangForm(); break;
        case "contact": showContactForm(); break;
        case "chatbot": openChatPanel(); break;
      }
    });
    // Zodiac sign click to open horoscope
    document.querySelectorAll(".zodiac-sign[data-sign]").forEach(function (card) {
      card.addEventListener("click", function () {
        showHoroscopeForm(card.getAttribute("data-sign"));
      });
    });
  }

  // ==================== DYNAMIC BLOG LOADING ====================

  function loadDynamicBlogs() {
    var container = document.getElementById("blogCardsContainer");
    if (!container) return;
    if (window.location.protocol === "file:") return; // can't fetch on file://
    fetch("/api/blogs").then(function (res) { return res.json(); }).then(function (data) {
      if (data.blogs && data.blogs.length >= 3) {
        var gradients = [
          "from-purple-600 to-indigo-800",
          "from-blue-600 to-cyan-800",
          "from-yellow-600 to-amber-800"
        ];
        var emojis = ["&#127769;", "&#127760;", "&#9796;"];
        container.innerHTML = data.blogs.slice(0, 3).map(function (blog, idx) {
          var readTime = blog.content ? Math.max(1, Math.ceil(blog.content.split(/\s+/).length / 200)) + " min read" : "5 min read";
          return '<article class="bg-gray-800 rounded-xl overflow-hidden blog-card transition-all duration-300">' +
            '<div class="h-48 bg-gradient-to-br ' + gradients[idx % 3] + ' flex items-center justify-center text-6xl">' + emojis[idx % 3] + '</div>' +
            '<div class="p-6">' +
            '<div class="flex justify-between items-center mb-2"><span class="text-xs text-purple-400">' + escapeHtml(blog.category || "Astrology") + '</span><span class="text-xs text-gray-500">' + escapeHtml(readTime) + '</span></div>' +
            '<h3 class="font-bold text-lg mb-3">' + escapeHtml(blog.title) + '</h3>' +
            '<p class="text-sm text-gray-300 mb-4">' + escapeHtml((blog.excerpt || blog.content || "").substring(0, 120)) + '...</p>' +
            '<a href="/blog/' + escapeHtml(blog.slug) + '" class="text-purple-400 text-sm font-semibold flex items-center hover:text-purple-300">Read More <span class="ml-1">&rarr;</span></a>' +
            '</div></article>';
        }).join("");
      }
    }).catch(function () { /* keep fallback cards */ });
  }

  // ==================== SOCIAL SHARING ====================

  window.jyotishShareHoroscope = function (sign, rashi, prediction, color, number) {
    var text = encodeURIComponent(
      "\uD83D\uDD2E Mera aaj ka Rashifal (" + rashi + " Rashi):\n" +
      prediction.substring(0, 100) + "\n" +
      "Lucky Color: " + color + " | Lucky Number: " + number + "\n\n" +
      "Check yours free: https://jyotishdigitaldarpan.com"
    );
    window.open("https://wa.me/?text=" + text, "_blank");
  };

  window.jyotishShareTwitter = function (sign, rashi, prediction) {
    var text = encodeURIComponent(
      "\uD83D\uDD2E " + sign + " (" + rashi + ") Rashifal: " + prediction.substring(0, 120) + "\n\nFree astrology: https://jyotishdigitaldarpan.com"
    );
    window.open("https://twitter.com/intent/tweet?text=" + text, "_blank");
  };

  window.jyotishCopyLink = function () {
    var url = "https://jyotishdigitaldarpan.com";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
  };

  window.jyotishShare = function (type, name, lagna, moonSign) {
    var text = encodeURIComponent(
      "\uD83D\uDD2E " + name + " ki Kundli:\nLagna: " + lagna + " | Moon: " + moonSign + "\n\n" +
      "Apni free kundli banayein: https://jyotishdigitaldarpan.com"
    );
    window.open("https://wa.me/?text=" + text, "_blank");
  };

  // ==================== CHATBOT - JYOTISH SAHAYAK ====================

  var chatState = {
    history: [],
    flow: null,
    flowStep: 0,
    flowData: {}
  };

  function initChatbot() {
    var toggle = document.getElementById("chatbotToggle");
    var closeBtn = document.getElementById("chatClose");
    var clearBtn = document.getElementById("chatClear");
    var sendBtn = document.getElementById("chatSend");
    var input = document.getElementById("chatInput");

    if (!toggle) return;

    // Restore from localStorage
    try {
      var saved = localStorage.getItem("jyotishChat");
      if (saved) chatState = JSON.parse(saved);
    } catch (e) {}

    toggle.addEventListener("click", openChatPanel);
    closeBtn.addEventListener("click", closeChatPanel);
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        chatState.history = [];
        chatState.flow = null;
        chatState.flowStep = 0;
        chatState.flowData = {};
        saveChat();
        renderChatHistory();
        showQuickReplies([]);
        showWelcome();
      });
    }
    sendBtn.addEventListener("click", sendChatMessage);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") sendChatMessage();
    });
  }

  function openChatPanel() {
    var panel = document.getElementById("chatPanel");
    if (!panel) return;
    panel.classList.remove("chat-hidden");
    if (chatState.history.length === 0) {
      showWelcome();
    } else {
      renderChatHistory();
    }
  }

  function closeChatPanel() {
    var panel = document.getElementById("chatPanel");
    if (panel) panel.classList.add("chat-hidden");
  }

  function saveChat() {
    try {
      // Limit stored messages to last 50
      if (chatState.history.length > 50) {
        chatState.history = chatState.history.slice(-50);
      }
      localStorage.setItem("jyotishChat", JSON.stringify(chatState));
    } catch (e) {}
  }

  function addBotMsg(text, quickReplies) {
    chatState.history.push({ type: "bot", text: text });
    saveChat();
    renderChatHistory();
    showQuickReplies(quickReplies || []);
  }

  function addUserMsg(text) {
    chatState.history.push({ type: "user", text: text });
    saveChat();
    renderChatHistory();
  }

  function renderChatHistory() {
    var container = document.getElementById("chatMessages");
    if (!container) return;
    container.innerHTML = chatState.history.map(function (msg) {
      return '<div class="chat-msg ' + msg.type + '">' + escapeHtml(msg.text) + '</div>';
    }).join("");
    container.scrollTop = container.scrollHeight;
  }

  function showQuickReplies(replies) {
    var container = document.getElementById("chatQuickReplies");
    if (!container) return;
    container.innerHTML = replies.map(function (r) {
      return '<button class="chat-quick-btn" data-reply="' + escapeHtml(r) + '">' + escapeHtml(r) + '</button>';
    }).join("");
    container.querySelectorAll(".chat-quick-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        handleChatInput(btn.getAttribute("data-reply"));
      });
    });
  }

  function showTyping() {
    var container = document.getElementById("chatMessages");
    if (!container) return;
    var typing = document.createElement("div");
    typing.className = "chat-typing";
    typing.id = "chatTypingIndicator";
    typing.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById("chatTypingIndicator");
    if (el) el.remove();
  }

  function showWelcome() {
    chatState.flow = null;
    chatState.flowStep = 0;
    chatState.flowData = {};
    addBotMsg("Namaste! \uD83D\uDE4F Main hoon Jyotish Sahayak. Aapki kya madad karun?", [
      "Meri Kundli", "Aaj ka Rashifal", "Kundli Milan", "Career Guidance", "Naam se Rashi"
    ]);
  }

  function sendChatMessage() {
    var input = document.getElementById("chatInput");
    var text = (input.value || "").trim();
    if (!text) return;
    input.value = "";
    handleChatInput(text);
  }

  function handleChatInput(text) {
    addUserMsg(text);
    showQuickReplies([]);

    // Check if we're in a flow
    if (chatState.flow === "kundli") {
      handleKundliFlow(text);
      return;
    }

    // Route based on text
    var lower = text.toLowerCase();
    if (lower.indexOf("kundli") >= 0 && lower.indexOf("milan") < 0 || lower === "meri kundli") {
      startKundliFlow();
    } else if (lower.indexOf("rashifal") >= 0 || lower.indexOf("horoscope") >= 0 || lower === "aaj ka rashifal") {
      showRashiSelection();
    } else if (lower.indexOf("milan") >= 0 || lower.indexOf("match") >= 0 || lower === "kundli milan") {
      delayedBot("Kundli Milan ke liye please website par 'Match Making' feature use karein. Main abhi basic rashifal aur kundli mein help kar sakta hoon.", ["Meri Kundli", "Aaj ka Rashifal", "Naam se Rashi"]);
    } else if (lower.indexOf("career") >= 0 || lower === "career guidance") {
      delayedBot("Career guidance ke liye mujhe aapki kundli chahiye. Kya aap birth details dena chahenge?", ["Haan, Kundli banao", "Nahi, Rashifal dekho"]);
    } else if (lower.indexOf("naam") >= 0 || lower.indexOf("name") >= 0 || lower === "naam se rashi") {
      delayedBot("Apna naam batayein, main aapki rashi bata dunga!");
      chatState.flow = "naam";
    } else if (lower === "haan, kundli banao") {
      startKundliFlow();
    } else if (lower === "nahi, rashifal dekho") {
      showRashiSelection();
    } else if (chatState.flow === "naam") {
      handleNaamFlow(text);
    } else if (isRashiName(text)) {
      generateRashifal(text);
    } else {
      // Try naam se rashi as fallback for short text
      if (text.length <= 20 && text.length >= 2) {
        handleNaamFlow(text);
      } else {
        delayedBot("Main samajh nahi paaya. Kya aap in mein se kuch try karna chahenge?", [
          "Meri Kundli", "Aaj ka Rashifal", "Naam se Rashi"
        ]);
      }
    }
  }

  function isRashiName(text) {
    var lower = text.toLowerCase().trim();
    return signs.some(function (s) { return s.toLowerCase() === lower; }) ||
      rashiHindi.some(function (r) { return r === text.trim(); });
  }

  function showRashiSelection() {
    delayedBot("Kaun si rashi ka rashifal dekhna hai? Neeche se choose karein:", signs.map(function (s, i) { return s; }));
  }

  function generateRashifal(signText) {
    showTyping();
    setTimeout(function () {
      hideTyping();
      var report = engine.dailyHoroscope({ sign: signText, place: "Delhi" });
      var msg = report.symbol + " " + report.sign + " (" + report.rashi + ") - Aaj ka Rashifal:\n\n" +
        report.prediction + "\n\n" +
        "Lucky Color: " + report.luckyColor + "\nLucky Number: " + report.luckyNumber + "\n" +
        "Remedy: " + report.remedy;
      addBotMsg(msg, ["Doosri Rashi dekho", "Meri Kundli", "Naam se Rashi"]);
    }, 800);
  }

  function startKundliFlow() {
    chatState.flow = "kundli";
    chatState.flowStep = 0;
    chatState.flowData = {};
    delayedBot("Chaliye aapki kundli banate hain! Pehle aapka naam batayein:");
  }

  function handleKundliFlow(text) {
    switch (chatState.flowStep) {
      case 0:
        chatState.flowData.name = text;
        chatState.flowStep = 1;
        delayedBot("Shukriya " + text + "! Ab aapki janam tithi (date of birth) batayein (jaise: 1990-05-15):");
        break;
      case 1:
        chatState.flowData.date = text;
        chatState.flowStep = 2;
        delayedBot("Achha! Ab janam ka samay (time) batayein (jaise: 08:30):");
        break;
      case 2:
        chatState.flowData.time = text;
        chatState.flowStep = 3;
        delayedBot("Last step! Janam sthan (birthplace) batayein (jaise: Delhi, Mumbai):");
        break;
      case 3:
        chatState.flowData.place = text;
        chatState.flow = null;
        chatState.flowStep = 0;
        generateChatKundli();
        break;
    }
  }

  function generateChatKundli() {
    showTyping();
    setTimeout(function () {
      hideTyping();
      try {
        var report = engine.generateKundli(chatState.flowData);
        var reading = engine.simpleKundliReading(report);
        var msg = "Aapki Kundli tayaar hai! \u2728\n\n" +
          "Lagna: " + report.ascendant.symbol + " " + report.ascendant.sign + " (" + report.ascendant.rashi + ")\n" +
          "Moon: " + report.moonSign.symbol + " " + report.moonSign.sign + " (" + report.moonSign.rashi + ")\n\n" +
          reading.personality + "\n\n" +
          "Career: " + reading.career + "\n\n" +
          "Abhi: " + reading.currentPhase + "\n\n" +
          "Lucky Day: " + reading.luckyThings.day + " | Color: " + reading.luckyThings.color + " | Gemstone: " + reading.luckyThings.gemstone;
        addBotMsg(msg, ["Detailed Report", "Dasha Check", "Yoga Check", "Career Analysis", "Naya sawal"]);
      } catch (e) {
        addBotMsg("Kuch galat hua. Please date format YYYY-MM-DD aur time HH:MM mein dein.", ["Phir se try karein"]);
      }
    }, 1200);
  }

  function handleNaamFlow(name) {
    chatState.flow = null;
    showTyping();
    setTimeout(function () {
      hideTyping();
      var result = engine.nameToRashi(name);
      if (result) {
        var msg = "Aapka naam '" + name + "' ka pehla akshar '" + result.letter + "' hai.\n\n" +
          "Ye " + result.symbol + " " + result.sign + " (" + result.rashi + " / " + result.rashiDevanagari + ") rashi se related hai!\n\n" +
          "Is rashi ke log " +
          (result.rashiIndex === 0 ? "energetic aur courageous hote hain." :
           result.rashiIndex === 1 ? "patient aur loyal hote hain." :
           result.rashiIndex === 2 ? "witty aur communicative hote hain." :
           result.rashiIndex === 3 ? "emotional aur caring hote hain." :
           result.rashiIndex === 4 ? "confident aur charismatic hote hain." :
           result.rashiIndex === 5 ? "practical aur detail-oriented hote hain." :
           result.rashiIndex === 6 ? "diplomatic aur artistic hote hain." :
           result.rashiIndex === 7 ? "intense aur focused hote hain." :
           result.rashiIndex === 8 ? "adventurous aur optimistic hote hain." :
           result.rashiIndex === 9 ? "disciplined aur ambitious hote hain." :
           result.rashiIndex === 10 ? "innovative aur independent hote hain." :
           "creative aur intuitive hote hain.");
        addBotMsg(msg, ["Is rashi ka Rashifal", "Meri Kundli", "Doosra naam check"]);
      } else {
        addBotMsg("Sorry, is naam se rashi nahi mil payi. Koi Hindi ya English naam try karein.", ["Naam se Rashi", "Aaj ka Rashifal"]);
      }
    }, 600);
  }

  function delayedBot(text, quickReplies) {
    showTyping();
    setTimeout(function () {
      hideTyping();
      addBotMsg(text, quickReplies);
    }, 500);
  }

})();
