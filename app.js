(function () {
  "use strict";

  const engine = window.JyotishEngine;
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
      <label style="display:block;margin:10px 0 4px;color:#c4b5fd;font-size:13px;">${label}</label>
      <input name="${name}" type="${type || "text"}" value="${escapeHtml(value || "")}" required
        style="width:100%;box-sizing:border-box;margin:0 0 8px;">
    `;
  }

  function placeField(name, label, value) {
    return `
      <label style="display:block;margin:10px 0 4px;color:#c4b5fd;font-size:13px;">${label}</label>
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
          <button type="button" data-close-modal style="width:auto;margin:0;padding:8px 12px;border-radius:8px;background:#111827;color:#e5e7eb;">Close</button>
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
    openModal("Birth Chart Generator", `
      <form id="modalKundliForm">
        ${field("name", "Full Name", "text")}
        ${field("date", "Birth Date", "date")}
        ${field("time", "Birth Time", "time")}
        ${placeField("place", "Birth Place", "Delhi")}
        ${buttonHtml("Generate Birth Chart")}
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
    return `
      <div style="text-align:left;color:#e5e7eb;">
        <h3 style="font-size:20px;font-weight:700;margin:0 0 8px;">${escapeHtml(report.name)} - Janm Kundli</h3>
        <p style="color:#cbd5e1;margin:0 0 12px;">${escapeHtml(report.input.date)} ${escapeHtml(report.input.time)}, ${escapeHtml(report.input.place)} (${escapeHtml(report.input.timezone)})</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin:14px 0;">
          ${infoBox("Lagna", `${report.ascendant.symbol} ${report.ascendant.rashi}`, report.ascendant.degree)}
          ${infoBox("Moon Sign", `${report.moonSign.symbol} ${report.moonSign.rashi}`, `${report.moonSign.nakshatra} Pada ${report.moonSign.pada}`)}
          ${infoBox("Sun Sign", `${report.sunSign.symbol} ${report.sunSign.rashi}`, "Sidereal")}
          ${infoBox("Dasha", report.dasha.activeMahadasha, `Birth lord ${report.dasha.birthNakshatraLord}`)}
        </div>
        <h4 style="color:#c4b5fd;margin:16px 0 8px;">Planetary Positions</h4>
        ${renderPlanetTable(report.planets)}
        <h4 style="color:#c4b5fd;margin:16px 0 8px;">Reading</h4>
        <ul style="padding-left:18px;margin:0;">
          ${report.summary.concat(report.houseHighlights || []).map(function (line) {
            return `<li style="margin:6px 0;">${escapeHtml(line)}</li>`;
          }).join("")}
        </ul>
        <p style="margin-top:12px;color:#ddd;">${escapeHtml(report.reading.remedy)}</p>
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
            <th style="text-align:left;padding:8px;">Planet</th>
            <th style="text-align:left;padding:8px;">Rashi</th>
            <th style="text-align:left;padding:8px;">Degree</th>
            <th style="text-align:left;padding:8px;">House</th>
            <th style="text-align:left;padding:8px;">Nakshatra</th>
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
    openModal("Daily Horoscope", `
      <form id="dailyHoroscopeForm">
        ${selectField("sign", "Zodiac Sign", signs)}
        ${field("date", "Date", "date", today())}
        ${placeField("place", "Place", "Delhi")}
        ${buttonHtml("Read Horoscope")}
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
      </div>
    `;
  }

  function showPanchangForm() {
    openModal("Panchang", `
      <form id="panchangForm">
        ${field("date", "Date", "date", today())}
        ${placeField("place", "Place", "Delhi")}
        ${buttonHtml("View Panchang")}
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
    openModal("Kundli Milan", `
      <form id="matchForm">
        <h3 style="color:#c4b5fd;font-weight:700;">Person 1</h3>
        ${field("p1name", "Name", "text")}
        ${field("p1date", "Birth Date", "date")}
        ${field("p1time", "Birth Time", "time")}
        ${placeField("p1place", "Birth Place", "Delhi")}
        <h3 style="color:#c4b5fd;font-weight:700;margin-top:16px;">Person 2</h3>
        ${field("p2name", "Name", "text")}
        ${field("p2date", "Birth Date", "date")}
        ${field("p2time", "Birth Time", "time")}
        ${placeField("p2place", "Birth Place", "Mumbai")}
        ${buttonHtml("Match Now")}
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
    openModal("Talk to Astrologer", `
      <form id="askForm">
        ${selectField("sign", "Zodiac Sign", signs)}
        <label style="display:block;margin:10px 0 4px;color:#c4b5fd;font-size:13px;">Question</label>
        <textarea name="question" rows="4" required style="width:100%;box-sizing:border-box;" placeholder="Career, marriage, finance ya kundli se related sawal likhein"></textarea>
        ${buttonHtml("Ask")}
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
    openModal("Contact Us", `
      <form id="contactForm">
        ${field("name", "Name", "text")}
        ${field("email", "Email", "email")}
        <label style="display:block;margin:10px 0 4px;color:#c4b5fd;font-size:13px;">Message</label>
        <textarea name="message" rows="4" required style="width:100%;box-sizing:border-box;"></textarea>
        ${buttonHtml("Send Message")}
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
    return `<p style="color:#c4b5fd;">Calculating...</p>`;
  }

  function wireHomePage() {
    const buttonActions = [
      { labels: ["Generate Birth Chart", "Generate Now", "Generate Your Kundli"], action: showBirthChartForm },
      { labels: ["Daily Horoscope", "Read Horoscope"], action: function () { showHoroscopeForm(); } },
      { labels: ["Kundli Milan", "Match Now"], action: showMatchForm },
      { labels: ["Panchang", "View Panchang"], action: showPanchangForm },
      { labels: ["Talk to Astrologer"], action: showAskForm },
      { labels: ["Contact Us"], action: showContactForm },
      { labels: ["हिंदी"], action: function () { openModal("हिंदी", "<p>Hindi mode active hai. Reports aur guidance Hinglish/Hindi style me generate honge.</p>"); } }
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
    }
    wireBirthChartPage();
  });
})();
