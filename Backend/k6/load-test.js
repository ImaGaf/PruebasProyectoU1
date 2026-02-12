import http from "k6/http";
import { check, group, sleep } from "k6";
import encoding from 'k6/encoding';
import { Rate, Trend, Counter } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const BASIC_USER = __ENV.BASIC_USER || "frozono";
const BASIC_PASS = __ENV.BASIC_PASS || "trabatrix2";
const AUTH_HEADER = `Basic ${encoding.b64encode(`${BASIC_USER}:${BASIC_PASS}`)}`;

const failRate = new Rate("failed_requests");
const productsTrend = new Trend("products_duration", true);
const categoriesTrend = new Trend("categories_duration", true);
const customersTrend = new Trend("customers_duration", true);
const cartTrend = new Trend("cart_duration", true);
const totalRequests = new Counter("total_requests");

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "1m", target: 25 },
    { duration: "30s", target: 50 },
    { duration: "1m", target: 50 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000", "p(99)<5000"],
    http_req_failed: ["rate<0.05"],
    failed_requests: ["rate<0.05"],
    products_duration: ["p(95)<2500"],
    categories_duration: ["p(95)<2500"],
    customers_duration: ["p(95)<2500"],
    cart_duration: ["p(95)<5000"],
  },
};

const headers = {
  Authorization: AUTH_HEADER,
  "Content-Type": "application/json",
};

function getProducts() {
  const res = http.get(`${BASE_URL}/barroco/products`, { headers, tags: { endpoint: "GET_products" } });
  productsTrend.add(res.timings.duration);
  totalRequests.add(1);
  failRate.add(res.status !== 200);
  check(res, {
    "GET /products status 200": (r) => r.status === 200,
    "GET /products has body": (r) => r.body && r.body.length > 0,
  });
  return res;
}

function getProductById(id) {
  const res = http.get(`${BASE_URL}/barroco/products/${id}`, { headers, tags: { endpoint: "GET_product_by_id" } });
  productsTrend.add(res.timings.duration);
  totalRequests.add(1);
  failRate.add(res.status !== 200);
  check(res, {
    "GET /products/:id status 200": (r) => r.status === 200,
  });
  return res;
}

function getAvailableProducts() {
  const res = http.get(`${BASE_URL}/barroco/products/productsAvailable`, { headers, tags: { endpoint: "GET_products_available" } });
  productsTrend.add(res.timings.duration);
  totalRequests.add(1);
  failRate.add(res.status !== 200);
  check(res, {
    "GET /productsAvailable status 200": (r) => r.status === 200,
  });
  return res;
}

function getCategories() {
  const res = http.get(`${BASE_URL}/barroco/categories`, { headers, tags: { endpoint: "GET_categories" } });
  categoriesTrend.add(res.timings.duration);
  totalRequests.add(1);
  failRate.add(res.status !== 200);
  check(res, {
    "GET /categories status 200": (r) => r.status === 200,
    "GET /categories has body": (r) => r.body && r.body.length > 0,
  });
  return res;
}

function getCategoryById(id) {
  const res = http.get(`${BASE_URL}/barroco/categories/${id}`, { headers, tags: { endpoint: "GET_category_by_id" } });
  categoriesTrend.add(res.timings.duration);
  totalRequests.add(1);
  failRate.add(res.status !== 200);
  check(res, {
    "GET /categories/:id status 200": (r) => r.status === 200,
  });
  return res;
}

function getCustomers() {
  const res = http.get(`${BASE_URL}/barroco/customers`, { headers, tags: { endpoint: "GET_customers" } });
  customersTrend.add(res.timings.duration);
  totalRequests.add(1);
  failRate.add(res.status !== 200);
  check(res, {
    "GET /customers status 200": (r) => r.status === 200,
  });
  return res;
}

function getCustomerById(id) {
  const res = http.get(`${BASE_URL}/barroco/customers/${id}`, { headers, tags: { endpoint: "GET_customer_by_id" } });
  customersTrend.add(res.timings.duration);
  totalRequests.add(1);
  failRate.add(res.status !== 200);
  check(res, {
    "GET /customers/:id status 200": (r) => r.status === 200,
  });
  return res;
}

function getShoppingCarts() {
  const res = http.get(`${BASE_URL}/barroco/shoppingCart`, { headers, tags: { endpoint: "GET_carts" } });
  cartTrend.add(res.timings.duration);
  totalRequests.add(1);
  failRate.add(res.status !== 200);
  check(res, {
    "GET /shoppingCart status 200": (r) => r.status === 200,
  });
  return res;
}

function createAndDeleteProduct() {
  const payload = JSON.stringify({
    idProduct: `LOAD-TEST-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    name: "K6 Load Test Product",
    description: "Producto creado por prueba de carga",
    price: 99.99,
    stock: 10,
    custom: false,
  });

  const createRes = http.post(`${BASE_URL}/barroco/products`, payload, { headers, tags: { endpoint: "POST_product" } });
  productsTrend.add(createRes.timings.duration);
  totalRequests.add(1);
  failRate.add(createRes.status !== 201 && createRes.status !== 200);

  const created = check(createRes, {
    "POST /products status 200|201": (r) => r.status === 200 || r.status === 201,
  });

  if (created && createRes.json()) {
    const id = createRes.json()._id || createRes.json().id;
    if (id) {
      sleep(0.5);
      const delRes = http.del(`${BASE_URL}/barroco/products/${id}`, null, { headers, tags: { endpoint: "DELETE_product" } });
      productsTrend.add(delRes.timings.duration);
      totalRequests.add(1);
      failRate.add(delRes.status !== 200 && delRes.status !== 204);
      check(delRes, {
        "DELETE /products/:id status 200|204": (r) => r.status === 200 || r.status === 204,
      });
    }
  }
}

function createAndDeleteCategory() {
  const payload = JSON.stringify({
    categoryID: Math.floor(Math.random() * 900000) + 100000,
    name: `K6 Category ${Date.now()}`,
    description: "Categoria creada por prueba de carga",
  });

  const createRes = http.post(`${BASE_URL}/barroco/categories`, payload, { headers, tags: { endpoint: "POST_category" } });
  categoriesTrend.add(createRes.timings.duration);
  totalRequests.add(1);
  failRate.add(createRes.status !== 201 && createRes.status !== 200);

  const created = check(createRes, {
    "POST /categories status 200|201": (r) => r.status === 200 || r.status === 201,
  });

  if (created && createRes.json()) {
    const id = createRes.json()._id || createRes.json().id;
    if (id) {
      sleep(0.5);
      const delRes = http.del(`${BASE_URL}/barroco/categories/${id}`, null, { headers, tags: { endpoint: "DELETE_category" } });
      categoriesTrend.add(delRes.timings.duration);
      totalRequests.add(1);
      failRate.add(delRes.status !== 200 && delRes.status !== 204);
      check(delRes, {
        "DELETE /categories/:id status 200|204": (r) => r.status === 200 || r.status === 204,
      });
    }
  }
}

export default function () {
  group("Health Check", () => {
    const res = http.get(`${BASE_URL}/`, { headers, tags: { endpoint: "GET_health" } });
    totalRequests.add(1);
    check(res, {
      "GET / status 200": (r) => r.status === 200,
    });
  });

  group("Products - Read", () => {
    const res = getProducts();
    sleep(0.3);
    getAvailableProducts();
    sleep(0.3);

    try {
      const products = res.json();
      if (Array.isArray(products) && products.length > 0) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const id = randomProduct._id || randomProduct.idProduct;
        if (id) getProductById(id);
      }
    } catch (_) {}
  });

  group("Products - Write", () => {
    createAndDeleteProduct();
  });

  group("Categories - Read", () => {
    const res = getCategories();
    sleep(0.3);

    try {
      const categories = res.json();
      if (Array.isArray(categories) && categories.length > 0) {
        const randomCat = categories[Math.floor(Math.random() * categories.length)];
        const id = randomCat._id || randomCat.categoryID;
        if (id) getCategoryById(id);
      }
    } catch (_) {}
  });

  group("Categories - Write", () => {
    createAndDeleteCategory();
  });

  group("Customers - Read", () => {
    const res = getCustomers();
    sleep(0.3);

    try {
      const customers = res.json();
      if (Array.isArray(customers) && customers.length > 0) {
        const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
        const id = randomCustomer._id;
        if (id) getCustomerById(id);
      }
    } catch (_) {}
  });

  group("Shopping Cart - Read", () => {
    getShoppingCarts();
  });

  sleep(1);
}

export function handleSummary(data) {
  const now = new Date().toISOString().replace(/[:.]/g, "-");

  const med = (m) => (m && m.values && m.values.med != null ? m.values.med : "N/A");
  const p95 = (m) => (m && m.values && m.values["p(95)"] != null ? m.values["p(95)"] : "N/A");
  const p99 = (m) => (m && m.values && m.values["p(99)"] != null ? m.values["p(99)"] : "N/A");
  const fmt = (v) => (typeof v === "number" ? `${v.toFixed(2)}ms` : "N/A");
  const pct = (v) => (typeof v === "number" ? `${(v * 100).toFixed(2)}%` : v);

  const metrics = data.metrics;

  let report = `
                    REPORTE DE PRUEBA DE CARGA - K6
                    ${new Date().toLocaleString()}

CONFIGURACION
  Stages: 30s→10VUs | 1m→25VUs | 30s→50VUs | 1m→50VUs | 30s→0VUs
  Duracion total: ~3m 30s

METRICAS GENERALES HTTP
  Total requests:     ${metrics.http_reqs ? metrics.http_reqs.values.count : "N/A"}
  Failed requests:    ${metrics.http_req_failed ? pct(metrics.http_req_failed.values.rate) : "N/A"}
  Req duration (med): ${fmt(med(metrics.http_req_duration))}
  Req duration (p95): ${fmt(p95(metrics.http_req_duration))}
  Req duration (p99): ${fmt(p99(metrics.http_req_duration))}

METRICAS POR ENDPOINT
  Products:
    Mediana: ${fmt(med(metrics.products_duration))}
    P95:     ${fmt(p95(metrics.products_duration))}

  Categories:
    Mediana: ${fmt(med(metrics.categories_duration))}
    P95:     ${fmt(p95(metrics.categories_duration))}

  Customers:
    Mediana: ${fmt(med(metrics.customers_duration))}
    P95:     ${fmt(p95(metrics.customers_duration))}

  Shopping Cart:
    Mediana: ${fmt(med(metrics.cart_duration))}
    P95:     ${fmt(p95(metrics.cart_duration))}

THRESHOLDS
  http_req_duration p(95)<2000ms: ${typeof p95(metrics.http_req_duration) === "number" && p95(metrics.http_req_duration) < 2000 ? "PASS" : "FAIL"}
  http_req_duration p(99)<5000ms: ${typeof p99(metrics.http_req_duration) === "number" && p99(metrics.http_req_duration) < 5000 ? "PASS" : "FAIL"}
  http_req_failed rate<5%:        ${metrics.http_req_failed && metrics.http_req_failed.values.rate < 0.05 ? "PASS" : "FAIL"}

CHECKS
  Total checks:  ${metrics.checks ? metrics.checks.values.passes + metrics.checks.values.fails : "N/A"}
  Passes:        ${metrics.checks ? metrics.checks.values.passes : "N/A"}
  Fails:         ${metrics.checks ? metrics.checks.values.fails : "N/A"}
  Success rate:  ${metrics.checks ? pct(metrics.checks.values.rate) : "N/A"}

DATOS DE RED
  Data sent:     ${metrics.data_sent ? (metrics.data_sent.values.count / 1024).toFixed(2) + " KB" : "N/A"}
  Data received: ${metrics.data_received ? (metrics.data_received.values.count / 1024).toFixed(2) + " KB" : "N/A"}

ITERACIONES
  Total:    ${metrics.iterations ? metrics.iterations.values.count : "N/A"}
  Rate:     ${metrics.iterations ? metrics.iterations.values.rate.toFixed(2) + " iter/s" : "N/A"}
  Duration: ${fmt(med(metrics.iteration_duration))}
`;

  console.log(report);

  return {
    [`results/load-test-${now}.json`]: JSON.stringify(data, null, 2),
    stdout: report,
  };
}
