// script.js
import { PROMPTS } from "./prompts.js";
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";
// import { eisenData } from "./testFunction.js";
// import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.min.js";
// Đọc PDF -> Text
document.getElementById("fileInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file && file.type === "application/pdf") {
    const pdfData = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

    let textContent = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      textContent += text.items.map(item => item.str).join(" ") + "\n";
    }

    document.getElementById("resumeArea").value = textContent;
    localStorage.setItem("resumeText", textContent);
  }
});

// Gọi Gemini API
async function callGemini(apiKey, prompt, cvText) {
   const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent(`${prompt}\n\nCV:\n${cvText}`);
        const text = await result.response.text();
  return text || "Không có dữ liệu trả về.";
}

function renderSWOT(obj) {
  document.getElementById("swotS").innerHTML = obj.strengths.map(s => `<div>- ${s}</div>`).join("");
  document.getElementById("swotW").innerHTML = obj.weaknesses.map(s => `<div>- ${s}</div>`).join("");
  document.getElementById("swotO").innerHTML = obj.opportunities.map(s => `<div>- ${s}</div>`).join("");
  document.getElementById("swotT").innerHTML = obj.threats.map(s => `<div>- ${s}</div>`).join("");
}

function renderERRC(obj) {
  const toHTML = (arr) => arr.map(i => `<div>- ${i}</div>`).join("");
  document.getElementById("errcE").innerHTML = toHTML(obj.eliminate);
  document.getElementById("errcR").innerHTML = toHTML(obj.reduce);
  document.getElementById("errcRa").innerHTML = toHTML(obj.raise);
  document.getElementById("errcC").innerHTML = toHTML(obj.create);
}

// Vẽ biểu đồ Eisenhower Matrix
function renderEisenhowerChart(points) {
  const ctx = document.getElementById("eisenhowerChart").getContext("2d");
  new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [{
        label: "Tasks",
        data: points.map(p => ({ x: p.important, y: p.urgent, task: p.task })),
        pointRadius: 6,
        backgroundColor: "blue"
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: "Important" }, min: 0, max: 10 },
        y: { title: { display: true, text: "Urgent" }, min: 0, max: 10 }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.raw.task} (I:${ctx.raw.x}, U:${ctx.raw.y})`
          }
        }
      }
    }
  });
}

// Vẽ biểu đồ Blue Ocean Strategy
function renderBlueOceanChart(obj) {
  const ctx = document.getElementById("blueOceanChart").getContext("2d");
  new Chart(ctx, {
    type: "radar",
    data: {
      labels: Object.keys(obj),
      datasets: [{
        label: "Blue Ocean",
        data: Object.values(obj),
        backgroundColor: "rgba(0,123,255,0.2)",
        borderColor: "blue"
      }]
    },
    options: { scales: { r: { min: 0, max: 10 } } }
  });
}

// Nút Phân tích
// Nút Phân tích
document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const apiKey = document.getElementById("apiKey").value.trim();
  const cvText = document.getElementById("resumeArea").value.trim();
  const outputDiv = document.getElementById("output");

  if (!apiKey) return alert("Vui lòng nhập API Key");
  if (!cvText) return alert("Vui lòng nhập hoặc upload CV");

  outputDiv.innerHTML = "<p>Đang phân tích...</p>";

  try {
    const swot = await callGemini(apiKey, PROMPTS.swot, cvText);
    const eisenhower = await callGemini(apiKey, PROMPTS.eisenhower, cvText);
    const errc = await callGemini(apiKey, PROMPTS.errc, cvText);
    const blueOcean = await callGemini(apiKey, PROMPTS.strengths12, cvText);

    // Parse JSON
    const swotObj = extractJSON(swot);
    const errcObj = extractJSON(errc);
    const eisenData = extractJSON(eisenhower);
    const blueData = extractJSON(blueOcean);

    // Lưu vào localStorage
    if (swotObj) localStorage.setItem("swotData", JSON.stringify(swotObj));
    if (errcObj) localStorage.setItem("errcData", JSON.stringify(errcObj));
    if (eisenData) localStorage.setItem("eisenData", JSON.stringify(eisenData));
    if (blueData) localStorage.setItem("blueData", JSON.stringify(blueData));

    // Render
    if (swotObj) renderSWOT(swotObj);
    else outputDiv.innerHTML += `<p style="color:red;">⚠️ Không parse được SWOT JSON</p>`;

    if (errcObj) renderERRC(errcObj);
    else outputDiv.innerHTML += `<p style="color:red;">⚠️ Không parse được ERRC JSON</p>`;

    if (eisenData) renderEisenhowerChart(eisenData);
    else outputDiv.innerHTML += `<p style="color:red;">⚠️ Không parse được Eisenhower JSON</p>`;

    if (blueData) renderBlueOceanChart(blueData);
    else outputDiv.innerHTML += `<p style="color:red;">⚠️ Không parse được Blue Ocean JSON</p>`;

  } catch (err) {
    outputDiv.innerHTML = `<p style="color:red;">Lỗi: ${err.message}</p>`;
  }
});


// Load lại CV từ localStorage
// Load lại CV và kết quả từ localStorage
window.addEventListener("load", () => {
  const savedCV = localStorage.getItem("resumeText");
  if (savedCV) document.getElementById("resumeArea").value = savedCV;

  const swot = localStorage.getItem("swotData");
  const errc = localStorage.getItem("errcData");
  const eisen = localStorage.getItem("eisenData");
  const blue = localStorage.getItem("blueData");

  if (swot) renderSWOT(JSON.parse(swot));
  if (errc) renderERRC(JSON.parse(errc));
  if (eisen) renderEisenhowerChart(JSON.parse(eisen));
  if (blue) renderBlueOceanChart(JSON.parse(blue));
});


function extractJSON(text) {
  try {
    // Nếu bản thân text đã là JSON
    return JSON.parse(text);
  } catch (e) {
    // Tìm đoạn JSON trong text (bọc trong { ... } hoặc [ ... ])
    const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {
        console.error("JSON parse error:", e2);
      }
    }
    return null;
  }
}


// script.js
const fileInput = document.getElementById("fileInput");
const resumeArea = document.getElementById("resumeArea");

// Khi chọn file PDF
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let textContent = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => item.str);
      textContent += strings.join(" ") + "\n\n";
    }

    resumeArea.value = textContent.trim();
    console.log("✅ Đọc PDF thành công:", textContent.slice(0, 200)); // log 200 ký tự đầu
  } catch (err) {
    alert("Không đọc được file PDF");
  }
});


function setupTabs(tabHeaderId) {
  const header = document.getElementById(tabHeaderId);
  const buttons = header.querySelectorAll("button");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      // remove active
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // ẩn tất cả cột
      buttons.forEach(b => {
        const td = document.getElementById(b.dataset.col);
        if (td) td.style.display = "none";
      });

      // hiện cột đã chọn
      const activeTd = document.getElementById(btn.dataset.col);
      if (activeTd) activeTd.style.display = "table-cell";
    });
  });

  // mặc định hiển thị cột đầu tiên
  buttons.forEach((b,i)=>{
    const td = document.getElementById(b.dataset.col);
    if(td) td.style.display = i===0 ? "table-cell" : "none";
  });
}

// khởi tạo tab cho SWOT & ERRC
setupTabs("swotTabs");
setupTabs("errcTabs");
