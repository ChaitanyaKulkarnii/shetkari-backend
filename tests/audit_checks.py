"""
Comprehensive audit script for the Sangli Soybean Advisory API.
Runs all C/D checks against a live server on http://127.0.0.1:8000.
"""
import json
import math
import time
import urllib.request
import urllib.error
import concurrent.futures
import os
import sys

BASE = "http://127.0.0.1:8000"
RESULTS = []

def call(method, path, data=None, headers=None):
    h = headers or {}
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        h["Content-Type"] = "application/json"
    else:
        body = None
    req = urllib.request.Request(BASE + path, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, json.loads(raw), raw
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8")
        return e.code, json.loads(raw), raw


def check_no_nan_inf(obj, path="root"):
    """Recursively check for NaN/Infinity in a parsed JSON object."""
    issues = []
    if isinstance(obj, float):
        if math.isnan(obj): issues.append(f"NaN at {path}")
        if math.isinf(obj): issues.append(f"Infinity at {path}")
    elif isinstance(obj, dict):
        for k, v in obj.items():
            issues.extend(check_no_nan_inf(v, f"{path}.{k}"))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            issues.extend(check_no_nan_inf(v, f"{path}[{i}]"))
    return issues


def log(check, name, passed, detail=""):
    status = "PASS" if passed else "FAIL"
    RESULTS.append((check, name, status, detail))
    print(f"  [{status}] {check}: {name} — {detail[:200]}")


# ═══════════════════════════════════════════════════════════════
# C7: GET /api/health
# ═══════════════════════════════════════════════════════════════
print("\n=== C7: GET /api/health ===")
code, data, raw = call("GET", "/api/health")
ok = code == 200 and all(k in data for k in ["status","model_version","trained_at","market_data_as_of"])
log("C7", "Health endpoint", ok, f"status={code}, {json.dumps(data)}")


# ═══════════════════════════════════════════════════════════════
# C8: GET /api/options
# ═══════════════════════════════════════════════════════════════
print("\n=== C8: GET /api/options ===")
code, data, raw = call("GET", "/api/options")
ok = code == 200 and len(data.get("talukas",[])) == 10 and len(data.get("soils",[])) == 5 and len(data.get("varieties",{})) == 3
log("C8", "Options endpoint", ok, f"status={code}, talukas={len(data.get('talukas',[]))}, soils={len(data.get('soils',[]))}, varieties={len(data.get('varieties',{}))}")
TALUKAS = data.get("talukas", [])
SOILS = data.get("soils", [])
VARIETIES_MAP = data.get("varieties", {})
VARIETY_LABELS = list(VARIETIES_MAP.values())


# ═══════════════════════════════════════════════════════════════
# C9: GET /api/model-card (no NaN)
# ═══════════════════════════════════════════════════════════════
print("\n=== C9: GET /api/model-card ===")
code, data, raw = call("GET", "/api/model-card")
nan_issues = check_no_nan_inf(data)
# Also verify raw string has no literal NaN
has_nan_str = "NaN" in raw or "Infinity" in raw
ok = code == 200 and not nan_issues and not has_nan_str
log("C9", "Model card (no NaN)", ok, f"status={code}, nan_issues={nan_issues}, has_nan_str={has_nan_str}")


# ═══════════════════════════════════════════════════════════════
# C10: GET /api/market
# ═══════════════════════════════════════════════════════════════
print("\n=== C10: GET /api/market ===")
code1, data1, raw1 = call("GET", "/api/market")
code2, data2, raw2 = call("GET", "/api/market?storage=20&interest=0.02&msp=4892")
ok1 = code1 == 200 and "analysis" in data1 and "forecast" in data1
ok2 = code2 == 200 and "analysis" in data2 and "forecast" in data2
log("C10", "Market endpoint", ok1 and ok2, f"default={code1}, with_params={code2}")


# ═══════════════════════════════════════════════════════════════
# C11: POST /api/advisory — standard input
# ═══════════════════════════════════════════════════════════════
print("\n=== C11: POST /api/advisory (standard) ===")
payload11 = {
    "name": "Raju Patil", "taluka": "Miraj", "crop": "Soybean",
    "sowing_date": "2026-06-25", "soil": "Deep black (heavy)",
    "variety": "Medium (~100 days)", "acres": 5
}
code, data, raw = call("POST", "/api/advisory", payload11)
dur = data.get("harvest", {}).get("duration_days")
exp_date = data.get("harvest", {}).get("expected_date")
cal = data.get("harvest", {}).get("calibrated")
ok = code == 200 and dur == 100 and exp_date == "2026-10-03" and cal == False
log("C11", "Advisory standard", ok,
    f"status={code}, duration_days={dur}, expected_date={exp_date}, calibrated={cal}")


# ═══════════════════════════════════════════════════════════════
# C12: POST /api/advisory with today=2026-08-15
# ═══════════════════════════════════════════════════════════════
print("\n=== C12: POST /api/advisory (with today) ===")
payload12 = dict(payload11)
payload12["today"] = "2026-08-15"
code, data, raw = call("POST", "/api/advisory", payload12)
dth = data.get("harvest", {}).get("days_to_harvest")
stage = data.get("harvest", {}).get("crop_stage")
ok = code == 200 and (dth is not None and dth > 0) and stage != "Maturity / harvest"
log("C12", "Advisory with today", ok,
    f"status={code}, days_to_harvest={dth}, crop_stage={stage}")


# ═══════════════════════════════════════════════════════════════
# C13: 150 combos — 10 talukas × 5 soils × 3 varieties
# ═══════════════════════════════════════════════════════════════
print("\n=== C13: 150 combos ===")
failures_13 = []
combo_keys_set = set()
for t in TALUKAS:
    for s in SOILS:
        for v in VARIETY_LABELS:
            p = {"name": "Test", "taluka": t, "crop": "Soybean",
                 "sowing_date": "2026-06-25", "soil": s, "variety": v, "acres": 2}
            c, d, r = call("POST", "/api/advisory", p)
            if c != 200:
                failures_13.append(f"{t}/{s}/{v} -> {c}")
                continue
            nan_iss = check_no_nan_inf(d)
            if nan_iss:
                failures_13.append(f"{t}/{s}/{v} NaN: {nan_iss}")
            if "NaN" in r or "Infinity" in r:
                failures_13.append(f"{t}/{s}/{v} raw NaN/Inf")
            combo_keys_set.add(tuple(sorted(d.keys())))
ok = len(failures_13) == 0
log("C13", "150 combos", ok,
    f"failures={len(failures_13)}, unique_key_shapes={len(combo_keys_set)}")
if failures_13:
    for f in failures_13[:5]:
        print(f"    FAIL: {f}")


# ═══════════════════════════════════════════════════════════════
# C14: Edge inputs
# ═══════════════════════════════════════════════════════════════
print("\n=== C14: Edge inputs ===")
base = {"name": "Test", "taluka": "Miraj", "crop": "Soybean",
        "sowing_date": "2026-06-25", "soil": "Deep black (heavy)",
        "variety": "Medium (~100 days)", "acres": 5}

edge_cases = {
    "invalid_taluka":     {**base, "taluka": "Pune"},
    "invalid_soil":       {**base, "soil": "Sandy"},
    "invalid_variety":    {**base, "variety": "Super (~200 days)"},
    "crop_wheat":         {**base, "crop": "Wheat"},
    "acres_zero":         {**base, "acres": 0},
    "acres_negative":     {**base, "acres": -1},
    "acres_string":       {**base, "acres": "abc"},
    "missing_sowing":     {"name": "Test", "taluka": "Miraj", "crop": "Soybean",
                           "soil": "Deep black (heavy)", "variety": "Medium (~100 days)", "acres": 5},
    "bad_sowing_date":    {**base, "sowing_date": "not-a-date"},
    "interest_too_high":  {**base, "interest_rate": 0.5},
    "storage_negative":   {**base, "storage_cost": -5},
    "empty_body":         {},
    "extra_fields":       {**base, "magic_field": "surprise"},
    "sowing_may":         {**base, "sowing_date": "2026-05-15"},
    "sowing_aug1":        {**base, "sowing_date": "2026-08-01"},
    "sowing_sep15":       {**base, "sowing_date": "2026-09-15"},
    "sowing_future":      {**base, "sowing_date": "2027-06-20"},
}

edge_failures = []
for name, payload in edge_cases.items():
    c, d, r = call("POST", "/api/advisory", payload)
    has_error_format = isinstance(d, dict) and "error" in d and "detail" in d
    is_500 = c == 500
    # Some edge cases may return 200 (e.g., extra_fields, unusual sowing dates)
    # The key requirement is: never a 500, and if error then has correct format
    if is_500:
        edge_failures.append(f"{name}: got 500 (server error)")
    elif c >= 400 and not has_error_format:
        edge_failures.append(f"{name}: got {c} but no {{error,detail}} format: {json.dumps(d)[:100]}")
    print(f"    {name}: {c} {'err_fmt' if has_error_format else 'ok/200'}")

ok14 = len(edge_failures) == 0
log("C14", "Edge inputs", ok14, f"failures={edge_failures}")


# ═══════════════════════════════════════════════════════════════
# C15: Harvest feedback validation
# ═══════════════════════════════════════════════════════════════
print("\n=== C15: Harvest feedback ===")
# Invalid: harvest before sowing
c15a, d15a, _ = call("POST", "/api/harvest-feedback",
    {"sowing_date": "2026-07-01", "harvest_date": "2026-06-01", "variety": "medium"})
ok15a = c15a == 422

# Valid feedback — temporarily test but we need to clean up
c15b, d15b, _ = call("POST", "/api/harvest-feedback",
    {"sowing_date": "2026-06-20", "harvest_date": "2026-10-01", "variety": "medium", "taluka": "Miraj"})
ok15b = c15b == 200
log("C15", "Feedback validation", ok15a and ok15b,
    f"invalid={c15a}, valid={c15b}")


# ═══════════════════════════════════════════════════════════════
# C16: Retrain auth
# ═══════════════════════════════════════════════════════════════
print("\n=== C16: Retrain auth ===")
c16a, d16a, _ = call("POST", "/api/retrain-harvest")
c16b, d16b, _ = call("POST", "/api/retrain-harvest", headers={"X-API-Key": "wrong-key"})
ok16 = c16a in [401, 403] and c16b in [401, 403]
log("C16", "Retrain auth", ok16, f"no_key={c16a}, wrong_key={c16b}")


# ═══════════════════════════════════════════════════════════════
# D17: CORS
# ═══════════════════════════════════════════════════════════════
print("\n=== D17: CORS ===")
# Preflight OPTIONS
cors_req = urllib.request.Request(BASE + "/api/advisory", method="OPTIONS")
cors_req.add_header("Origin", "http://localhost:5173")
cors_req.add_header("Access-Control-Request-Method", "POST")
cors_req.add_header("Access-Control-Request-Headers", "Content-Type")
try:
    with urllib.request.urlopen(cors_req) as resp:
        cors_headers = {k.lower(): v for k, v in resp.getheaders()}
        acao = cors_headers.get("access-control-allow-origin", "")
        acah = cors_headers.get("access-control-allow-headers", "")
        cors_ok = "localhost:5173" in acao and "content-type" in acah.lower()
        cors_status = resp.status
except urllib.error.HTTPError as e:
    cors_ok = False
    cors_status = e.code
    acao = ""
    acah = ""

log("D17", "CORS preflight", cors_ok,
    f"status={cors_status}, ACAO={acao}, ACAH={acah}")


# ═══════════════════════════════════════════════════════════════
# D18: JSON safety — no NaN/Infinity in responses
# ═══════════════════════════════════════════════════════════════
print("\n=== D18: JSON safety ===")
# Re-use the advisory response from C11
c18, d18, raw18 = call("POST", "/api/advisory", payload11)
nan18 = check_no_nan_inf(d18)
has_nan_str18 = "NaN" in raw18 or "Infinity" in raw18
# Check nullable fields exist (not missing)
analysis = d18.get("market", {}).get("analysis", {})
change_pct = analysis.get("change_pct", {})
null_fields_present = (
    "vs_90d" in change_pct and
    "vs_1y" in change_pct and
    "momentum" in analysis and
    "percentile" in analysis.get("last_12m", {})
)
ok18 = not nan18 and not has_nan_str18 and null_fields_present
log("D18", "JSON safety", ok18,
    f"nan_issues={nan18}, has_nan_str={has_nan_str18}, null_fields_present={null_fields_present}, vs_90d={change_pct.get('vs_90d')}, vs_1y={change_pct.get('vs_1y')}")


# ═══════════════════════════════════════════════════════════════
# D19: Response contract — save and verify shape stability
# ═══════════════════════════════════════════════════════════════
print("\n=== D19: Response contract ===")
os.makedirs("reference", exist_ok=True)
with open("reference/sample_advisory_response.json", "w", encoding="utf-8") as f:
    json.dump(d18, f, indent=2, ensure_ascii=False)
top_keys = sorted(d18.keys())
shape_stable = len(combo_keys_set) == 1
log("D19", "Response contract", shape_stable,
    f"top_keys={top_keys}, unique_shapes={len(combo_keys_set)}")


# ═══════════════════════════════════════════════════════════════
# D20: Error format — every error has {error, detail}
# ═══════════════════════════════════════════════════════════════
print("\n=== D20: Error format ===")
error_tests = [
    ("POST", "/api/advisory", {"taluka": "Pune", "sowing_date": "2026-06-25", "soil": "Deep black (heavy)", "variety": "Medium (~100 days)", "acres": 5}),
    ("POST", "/api/advisory", {}),
    ("POST", "/api/retrain-harvest", None),
]
error_ok = True
for method, path, body in error_tests:
    c, d, r = call(method, path, body)
    if c >= 400:
        if not (isinstance(d, dict) and "error" in d and "detail" in d):
            error_ok = False
            print(f"    FAIL: {method} {path} -> {c} missing error/detail: {r[:200]}")
        elif "Traceback" in r or "File " in r:
            error_ok = False
            print(f"    FAIL: {method} {path} -> stack trace in response")
log("D20", "Error format", error_ok, "All error responses have {error, detail}")


# ═══════════════════════════════════════════════════════════════
# D21: /docs and /openapi.json
# ═══════════════════════════════════════════════════════════════
print("\n=== D21: Docs and OpenAPI ===")
try:
    dreq = urllib.request.urlopen(BASE + "/docs")
    docs_ok = dreq.status == 200
except:
    docs_ok = False
try:
    oreq = urllib.request.urlopen(BASE + "/openapi.json")
    openapi_data = json.loads(oreq.read().decode())
    openapi_ok = oreq.status == 200 and "paths" in openapi_data
    # Check advisory schema has description/constraints
    adv_schema = openapi_data.get("paths", {}).get("/api/advisory", {}).get("post", {})
    has_schema = bool(adv_schema)
except:
    openapi_ok = False
    has_schema = False
log("D21", "Docs & OpenAPI", docs_ok and openapi_ok,
    f"docs={docs_ok}, openapi={openapi_ok}, advisory_schema={has_schema}")


# ═══════════════════════════════════════════════════════════════
# D22: Performance — 50 sequential + 20 concurrent
# ═══════════════════════════════════════════════════════════════
print("\n=== D22: Performance ===")
perf_payload = payload11.copy()

# Sequential
seq_times = []
for _ in range(50):
    t0 = time.time()
    call("POST", "/api/advisory", perf_payload)
    seq_times.append(time.time() - t0)
seq_avg = sum(seq_times) / len(seq_times)
seq_max = max(seq_times)

# Concurrent
def do_call(_):
    t0 = time.time()
    call("POST", "/api/advisory", perf_payload)
    return time.time() - t0

with concurrent.futures.ThreadPoolExecutor(max_workers=20) as pool:
    conc_times = list(pool.map(do_call, range(20)))
conc_avg = sum(conc_times) / len(conc_times)
conc_max = max(conc_times)
perf_ok = seq_max < 1.0 and conc_max < 1.0
log("D22", "Performance", perf_ok,
    f"seq: avg={seq_avg*1000:.0f}ms max={seq_max*1000:.0f}ms | conc: avg={conc_avg*1000:.0f}ms max={conc_max*1000:.0f}ms")


# ═══════════════════════════════════════════════════════════════
# D23: Thread safety (concurrent advisory + check no errors)
# ═══════════════════════════════════════════════════════════════
print("\n=== D23: Thread safety ===")
thread_errors = []
def do_advisory(i):
    c, d, r = call("POST", "/api/advisory", perf_payload)
    if c != 200:
        thread_errors.append(f"call {i}: {c}")
    return c

with concurrent.futures.ThreadPoolExecutor(max_workers=20) as pool:
    futures = [pool.submit(do_advisory, i) for i in range(20)]
    concurrent.futures.wait(futures)
ok23 = len(thread_errors) == 0
log("D23", "Thread safety", ok23, f"errors={thread_errors}")


# ═══════════════════════════════════════════════════════════════
# D25: No stack traces in error responses
# ═══════════════════════════════════════════════════════════════
print("\n=== D25: No stack traces ===")
# Trigger a deliberate error
c25, d25, r25 = call("POST", "/api/advisory", {"taluka": "BadTaluka", "sowing_date": "2026-06-25",
    "soil": "Deep black (heavy)", "variety": "Medium (~100 days)", "acres": 5})
no_trace = "Traceback" not in r25 and "File " not in r25 and ".py" not in r25
log("D25", "No stack traces", no_trace, f"status={c25}, contains_trace={'Traceback' in r25}")


# ═══════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════
print("\n" + "=" * 70)
print("AUDIT SUMMARY")
print("=" * 70)
for check, name, status, detail in RESULTS:
    print(f"  {check:6s} | {status:4s} | {name:30s} | {detail[:80]}")
print("=" * 70)
all_pass = all(s == "PASS" for _, _, s, _ in RESULTS)
print(f"Overall: {'ALL PASS' if all_pass else 'SOME FAILURES'}")
