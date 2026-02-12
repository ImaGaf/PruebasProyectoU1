import http from "k6/http";
import { check, group, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";
import encoding from 'k6/encoding';


const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const BASIC_USER = __ENV.BASIC_USER || "frozono";
const BASIC_PASS = __ENV.BASIC_PASS || "trabatrix2";
const AUTH_HEADER = `Basic ${encoding.b64encode(`${BASIC_USER}:${BASIC_PASS}`)}`;

const failRate = new Rate("failed_requests");
const responseTrend = new Trend("response_time", true);
const totalRequests = new Counter("total_requests");

export const options = {
  stages: [
    { duration: "20s", target: 10 },
    { duration: "30s", target: 50 },
    { duration: "30s", target: 100 },
    { duration: "1m", target: 100 },
    { duration: "20s", target: 150 },
    { duration: "30s", target: 150 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<5000", "p(99)<10000"],
    http_req_failed: ["rate<0.15"],
    failed_requests: ["rate<0.15"],
  },
};

const headers = {
  Authorization: AUTH_HEADER,
  "Content-Type": "application/json",
};

function makeRequest(method, url, body, tag) {
  let res;
  const params = { headers, tags: { endpoint: tag } };

  if (method === "GET") {
    res = http.get(url, params);
  } else if (method === "POST") {
    res = http.post(url, body, params);
  } else if (method === "DELETE") {
    res = http.del(url, null, params);
  }

  responseTrend.add(res.timings.duration);
  totalRequests.add(1);
  failRate.add(res.status >= 400);

  return res;
}

export default function () {
  group("Stress - Products", () => {
    const res = makeRequest("GET", `${BASE_URL}/barroco/products`, null, "stress_products");
    check(res, { "products status 200": (r) => r.status === 200 });

    makeRequest("GET", `${BASE_URL}/barroco/products/productsAvailable`, null, "stress_products_available");

    try {
      const products = res.json();
      if (Array.isArray(products) && products.length > 0) {
        const p = products[Math.floor(Math.random() * products.length)];
        makeRequest("GET", `${BASE_URL}/barroco/products/${p._id || p.idProduct}`, null, "stress_product_detail");
      }
    } catch (_) {}
  });

  group("Stress - Categories", () => {
    const res = makeRequest("GET", `${BASE_URL}/barroco/categories`, null, "stress_categories");
    check(res, { "categories status 200": (r) => r.status === 200 });

    try {
      const cats = res.json();
      if (Array.isArray(cats) && cats.length > 0) {
        const c = cats[Math.floor(Math.random() * cats.length)];
        makeRequest("GET", `${BASE_URL}/barroco/categories/${c._id || c.categoryID}`, null, "stress_category_detail");
      }
    } catch (_) {}
  });

  group("Stress - Customers", () => {
    const res = makeRequest("GET", `${BASE_URL}/barroco/customers`, null, "stress_customers");
    check(res, { "customers status 200": (r) => r.status === 200 });
  });

  group("Stress - Shopping Cart", () => {
    const res = makeRequest("GET", `${BASE_URL}/barroco/shoppingCart`, null, "stress_cart");
    check(res, { "cart status 200": (r) => r.status === 200 });
  });

  group("Stress - Write Operations", () => {
    const uid = `STRESS-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const payload = JSON.stringify({
      idProduct: uid,
      name: "Stress Test Product",
      description: "Producto de prueba de estres",
      price: 50.0,
      stock: 5,
      custom: false,
    });

    const createRes = makeRequest("POST", `${BASE_URL}/barroco/products`, payload, "stress_create_product");
    const created = check(createRes, {
      "create product status 200|201": (r) => r.status === 200 || r.status === 201,
    });

    if (created && createRes.json()) {
      const id = createRes.json()._id || createRes.json().id;
      if (id) {
        sleep(0.3);
        makeRequest("DELETE", `${BASE_URL}/barroco/products/${id}`, null, "stress_delete_product");
      }
    }
  });

  sleep(0.5);
}

export function handleSummary(data) {
  const now = new Date().toISOString().replace(/[:.]/g, "-");
  const metrics = data.metrics;

  const med = (m) => (m && m.values && m.values.med != null ? m.values.med : "N/A");
  const p95 = (m) => (m && m.values && m.values["p(95)"] != null ? m.values["p(95)"] : "N/A");
  const p99 = (m) => (m && m.values && m.values["p(99)"] != null ? m.values["p(99)"] : "N/A");
  const fmt = (v) => (typeof v === "number" ? `${v.toFixed(2)}ms` : "N/A");
  const pct = (v) => (typeof v === "number" ? `${(v * 100).toFixed(2)}%` : v);

  let report = `
                    REPORTE DE PRUEBA DE ESTRES - K6
                    ${new Date().toLocaleString()}

CONFIGURACION
  Stages: 20s→10 | 30s→50 | 30s→100 | 1m→100 | 20s→150 | 30s→150 | 30s→0
  Pico maximo: 150 VUs
  Duracion total: ~3m 40s

METRICAS GENERALES
  Total requests:     ${metrics.http_reqs ? metrics.http_reqs.values.count : "N/A"}
  Failed requests:    ${metrics.http_req_failed ? pct(metrics.http_req_failed.values.rate) : "N/A"}
  Req duration (med): ${fmt(med(metrics.http_req_duration))}
  Req duration (p95): ${fmt(p95(metrics.http_req_duration))}
  Req duration (p99): ${fmt(p99(metrics.http_req_duration))}

THRESHOLDS
  http_req_duration p(95)<5000ms:  ${typeof p95(metrics.http_req_duration) === "number" && p95(metrics.http_req_duration) < 5000 ? "PASS" : "FAIL"}
  http_req_duration p(99)<10000ms: ${typeof p99(metrics.http_req_duration) === "number" && p99(metrics.http_req_duration) < 10000 ? "PASS" : "FAIL"}
  http_req_failed rate<15%:        ${metrics.http_req_failed && metrics.http_req_failed.values.rate < 0.15 ? "PASS" : "FAIL"}

CHECKS
  Total: ${metrics.checks ? metrics.checks.values.passes + metrics.checks.values.fails : "N/A"}
  Pass:  ${metrics.checks ? metrics.checks.values.passes : "N/A"}
  Fail:  ${metrics.checks ? metrics.checks.values.fails : "N/A"}
  Rate:  ${metrics.checks ? pct(metrics.checks.values.rate) : "N/A"}

DATOS DE RED
  Sent:     ${metrics.data_sent ? (metrics.data_sent.values.count / 1024).toFixed(2) + " KB" : "N/A"}
  Received: ${metrics.data_received ? (metrics.data_received.values.count / 1024).toFixed(2) + " KB" : "N/A"}

ITERACIONES
  Total:    ${metrics.iterations ? metrics.iterations.values.count : "N/A"}
  Rate:     ${metrics.iterations ? metrics.iterations.values.rate.toFixed(2) + " iter/s" : "N/A"}
  Duration: ${fmt(med(metrics.iteration_duration))}
`;

  console.log(report);

  return {
    [`results/stress-test-${now}.json`]: JSON.stringify(data, null, 2),
    stdout: report,
  };
}
