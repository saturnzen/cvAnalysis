import { SWOT, EISENHOWER, ERRC, BLUE_OCEAN } from "./testData.js";

// ============ Renderers ============

function renderSWOT(obj) {
  document.getElementById("swotS").innerHTML = obj.strengths.map(s => `<div>- ${s}</div>`).join("");
  document.getElementById("swotW").innerHTML = obj.weaknesses.map(s => `<div>- ${s}</div>`).join("");
  document.getElementById("swotO").innerHTML = obj.opportunities.map(s => `<div>- ${s}</div>`).join("");
  document.getElementById("swotT").innerHTML = obj.threats.map(s => `<div>- ${s}</div>`).join("");
}

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

function renderERRC(obj) {
  const toHTML = (arr) => arr.map(i => `<div>- ${i}</div>`).join("");
  document.getElementById("errcE").innerHTML = toHTML(obj.eliminate);
  document.getElementById("errcR").innerHTML = toHTML(obj.reduce);
  document.getElementById("errcRa").innerHTML = toHTML(obj.raise);
  document.getElementById("errcC").innerHTML = toHTML(obj.create);
}

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

// ============ Init test render ============
window.addEventListener("DOMContentLoaded", () => {
  renderSWOT(SWOT);
  renderEisenhowerChart(EISENHOWER);
  renderERRC(ERRC);
  renderBlueOceanChart(BLUE_OCEAN);
});


async function getData() {
  const res = await fetch("https://www.topcv.vn/xem-cv/UlBQB14GUgoEUVADAQNVBVcJVgJRAFADUF4PUQa2c3"); // cần CORS proxy
  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  console.log(doc.querySelector("title").textContent);
}
getData();
