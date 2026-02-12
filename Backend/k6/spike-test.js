import http from "k6/http";
import { check, sleep } from "k6";
import encoding from 'k6/encoding';
import { Rate, Trend } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const BASIC_USER = __ENV.BASIC_USER || "frozono";
const BASIC_PASS = __ENV.BASIC_PASS || "trabatrix2";
const AUTH_HEADER = `Basic ${encoding.b64encode(`${BASIC_USER}:${BASIC_PASS}`)}`;

const failRate = new Rate("failed_requests");
const spikeTrend = new Trend("spike_duration", true);

export const options = {
  stages: [
    { duration: "10s", target: 5 },
    { duration: "10s", target: 200 },
    { duration: "30s", target: 200 },
    { duration: "10s", target: 5 },
    { duration: "30s", target: 5 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<15000"],
    http_req_failed: ["rate<0.20"],
    failed_requests: ["rate<0.20"],
  },
};

const headers = {
  Authorization: AUTH_HEADER,
  "Content-Type": "application/json",
};

export default function () {
  const endpoints = [
    { url: `${BASE_URL}/barroco/products`, name: "products" },
    { url: `${BASE_URL}/barroco/categories`, name: "categories" },
    { url: `${BASE_URL}/barroco/customers`, name: "customers" },
    { url: `${BASE_URL}/barroco/shoppingCart`, name: "cart" },
    { url: `${BASE_URL}/barroco/products/productsAvailable`, name: "available" },
  ];

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const res = http.get(endpoint.url, { headers, tags: { endpoint: endpoint.name } });

  spikeTrend.add(res.timings.duration);
  failRate.add(res.status >= 400);

  check(res, {
    [`${endpoint.name} status 200`]: (r) => r.status === 200,
    "response time < 5s": (r) => r.timings.duration < 5000,
  });

  sleep(0.3);
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
                    REPORTE DE PRUEBA SPIKE - K6
                    ${new Date().toLocaleString()}

CONFIGURACION
  Stages: 10s→5 | 10s→200 (SPIKE) | 30s→200 | 10s→5 | 30s→5 | 10s→0
  Pico maximo: 200 VUs (spike)
  Duracion total: ~1m 40s

METRICAS GENERALES
  Total requests:     ${metrics.http_reqs ? metrics.http_reqs.values.count : "N/A"}
  Failed requests:    ${metrics.http_req_failed ? pct(metrics.http_req_failed.values.rate) : "N/A"}
  Req duration (med): ${fmt(med(metrics.http_req_duration))}
  Req duration (p95): ${fmt(p95(metrics.http_req_duration))}
  Req duration (p99): ${fmt(p99(metrics.http_req_duration))}

THRESHOLDS
  http_req_duration p(95)<15000ms: ${typeof p95(metrics.http_req_duration) === "number" && p95(metrics.http_req_duration) < 15000 ? "PASS" : "FAIL"}
  http_req_failed rate<20%:       ${metrics.http_req_failed && metrics.http_req_failed.values.rate < 0.20 ? "PASS" : "FAIL"}

CHECKS
  Total: ${metrics.checks ? metrics.checks.values.passes + metrics.checks.values.fails : "N/A"}
  Pass:  ${metrics.checks ? metrics.checks.values.passes : "N/A"}
  Fail:  ${metrics.checks ? metrics.checks.values.fails : "N/A"}
  Rate:  ${metrics.checks ? pct(metrics.checks.values.rate) : "N/A"}

RECUPERACION POST-SPIKE
  (Verificar en los resultados JSON si las metricas se normalizan
   despues del spike en la fase de 30s a 5 VUs)

DATOS DE RED
  Sent:     ${metrics.data_sent ? (metrics.data_sent.values.count / 1024).toFixed(2) + " KB" : "N/A"}
  Received: ${metrics.data_received ? (metrics.data_received.values.count / 1024).toFixed(2) + " KB" : "N/A"}
`;

  console.log(report);

  return {
    [`results/spike-test-${now}.json`]: JSON.stringify(data, null, 2),
    stdout: report,
  };
}
