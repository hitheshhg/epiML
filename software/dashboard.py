"""
Chiguru Mobile-Friendly Judging & Farmer Dashboard (Phase 3 & 5)
Team: TerraByte · YEN NOVA 1.0

Features:
- Mobile & Tablet First: Farmer's phone opens this URL as remote control & optical scanner
- 4 Instant Languages: English, Hindi, Kannada, Tulu (in Kannada script)
- 3 Giant Interactive Mode Cards (Tapping sends 'MODE:n' over serial to Arduino)
- Manual Water Pump Override (PUMP:ON / PUMP:OFF)
- "📷 Capture Tray Photo": Runs edge CV on uploaded photo, rejecting brown seeds
- Fused Germination Health Score: Fuses vision emergence % with live moisture & temp
- Interactive Telemetry Trend Charts from data/log.csv
- Seamless Auto-Failover to Realistic Mock Telemetry if Serial Drops
"""

import os
import time
import json
import random
import pandas as pd
import numpy as np
import cv2
from PIL import Image
import streamlit as st

# Import the CV module
from germination_cv import count_sprouts, compute_germination_health_score, generate_synthetic_tray

# Page Configuration
st.set_page_config(
    page_title="CHIGURU — Agri-Lifecycle System",
    page_icon="🌱",
    layout="wide",
    initial_sidebar_state="collapsed"
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
LATEST_FILE = os.path.join(DATA_DIR, "latest.json")
LOG_FILE = os.path.join(DATA_DIR, "log.csv")
CMD_FILE = os.path.join(DATA_DIR, "cmd.txt")
GERM_FILE = os.path.join(DATA_DIR, "germination.csv")
LANG_FILE = os.path.join(BASE_DIR, "LANG.json")

# Ensure Data Directory Exists
os.makedirs(DATA_DIR, exist_ok=True)

# Load Localization
with open(LANG_FILE, "r", encoding="utf-8") as f:
    LANG_PACK = json.load(f)

# Session State Initialization
if "lang" not in st.session_state:
    st.session_state["lang"] = "KN"  # Default to Kannada for regional judging impact
if "manual_mode" not in st.session_state:
    st.session_state["manual_mode"] = None
if "uploaded_cv_result" not in st.session_state:
    st.session_state["uploaded_cv_result"] = None

# Custom CSS for Mobile & Tablet Responsiveness, Dark High-Contrast Theme
st.markdown("""
<style>
    .stApp {
        background-color: #0b1118;
        color: #f1f5f9;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    header, footer {visibility: hidden !important;}

    /* Giant Status Banners */
    .banner-ok {
        background: linear-gradient(90deg, #064e3b 0%, #059669 50%, #10b981 100%);
        border: 2px solid #34d399;
        border-radius: 14px;
        padding: 14px 20px;
        text-align: center;
        font-size: 1.8rem;
        font-weight: 900;
        letter-spacing: 1px;
        color: #ffffff;
        box-shadow: 0 0 20px rgba(16, 185, 129, 0.35);
        margin-bottom: 15px;
    }
    .banner-alert {
        background: linear-gradient(90deg, #7f1d1d 0%, #dc2626 50%, #ef4444 100%);
        border: 2px solid #f87171;
        border-radius: 14px;
        padding: 14px 20px;
        text-align: center;
        font-size: 1.8rem;
        font-weight: 900;
        letter-spacing: 1px;
        color: #ffffff;
        box-shadow: 0 0 30px rgba(239, 68, 68, 0.6);
        animation: pulse 1s infinite alternate;
        margin-bottom: 15px;
    }
    @keyframes pulse {
        0% { transform: scale(0.99); }
        100% { transform: scale(1.01); }
    }

    /* Metric Cards */
    .metric-card {
        background-color: #141d27;
        border: 2px solid #233142;
        border-radius: 16px;
        padding: 16px;
        text-align: center;
        margin-bottom: 12px;
        box-shadow: 0 6px 14px rgba(0,0,0,0.25);
    }
    .metric-title {
        font-size: 1.05rem;
        color: #94a3b8;
        font-weight: 600;
        margin-bottom: 4px;
    }
    .metric-val {
        font-size: 2.8rem;
        font-weight: 900;
        color: #38bdf8;
        line-height: 1.1;
    }
    .metric-unit {
        font-size: 1.2rem;
        color: #64748b;
        font-weight: 500;
    }
    .metric-state-on {
        color: #34d399;
        font-weight: 900;
        font-size: 2.2rem;
    }
    .metric-state-off {
        color: #64748b;
        font-weight: 700;
        font-size: 2.2rem;
    }

    /* Active Mode Highlight */
    .mode-active {
        background: #172e22 !important;
        border: 3px solid #22c55e !important;
        box-shadow: 0 0 18px rgba(34, 197, 94, 0.4);
    }
    .mode-inactive {
        background: #141d27;
        border: 2px solid #233142;
        opacity: 0.7;
    }
</style>
""", unsafe_allow_html=True)

# Helper: Telemetry Fetcher with Seamless Mock Fallback
def get_current_telemetry():
    is_live = False
    data = None

    if os.path.exists(LATEST_FILE):
        try:
            mtime = os.path.getmtime(LATEST_FILE)
            if time.time() - mtime < 4.0:
                with open(LATEST_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    is_live = True
        except Exception:
            pass

    if not data:
        mode = st.session_state.get("manual_mode", 1)
        if mode is None:
            mode = 1

        t1 = round(28.2 + random.uniform(-0.4, 0.6), 1)
        h1 = round(61.5 + random.uniform(-1.0, 1.2), 1)
        t2 = round(29.8 + random.uniform(-0.3, 0.5), 1)
        h2 = round(66.0 + random.uniform(-1.0, 1.0), 1)
        m1 = int(42 + random.uniform(-1, 1))
        m2 = int(39 + random.uniform(-1, 1))
        gas = int(112 + random.uniform(-3, 3))

        reasons = {
            0: "AIR OK: FAN OFF",
            1: "PUMP ON: M1<35" if m1 < 35 else "PUMP OFF: M OK",
            2: "ROOTS SAT: PUMP OF"
        }

        data = {
            "mode": mode,
            "temp1": t1,
            "hum1": h1,
            "temp2": t2,
            "hum2": h2,
            "soil1": m1,
            "soil2": m2,
            "gas": gas,
            "pump": 1 if m1 < 35 else 0,
            "fan": 1 if t2 > 33 else 0,
            "alert": 0,
            "reason": reasons.get(mode, "SYS: OK"),
            "is_live": False
        }

    if st.session_state.get("manual_mode") is not None:
        data["mode"] = st.session_state["manual_mode"]

    return data

# Dispatch Command to Arduino over Serial via bridge
def send_remote_cmd(cmd_text):
    try:
        with open(CMD_FILE, "w", encoding="utf-8") as f:
            f.write(cmd_text.strip() + "\n")
    except Exception:
        pass

# Load Current State
data = get_current_telemetry()
current_mode = data["mode"]
L = LANG_PACK[st.session_state["lang"]]
current_reason = data.get("reason", "SYS: OK")

# ==========================================
# HEADER: APP TITLE & 4 LANGUAGE SWITCHERS
# ==========================================
col_hdr, col_l1, col_l2, col_l3, col_l4 = st.columns([4, 1.2, 1.2, 1.2, 1.2])

with col_hdr:
    st.markdown(f"<h1 style='margin:0; font-size:2.2rem; color:#22c55e;'>🌱 {L['app_title']}</h1>", unsafe_allow_html=True)
    conn_badge = f"<span style='color:#34d399;'>● {L['hardware_connected']}</span>" if data.get("is_live") else f"<span style='color:#f59e0b;'>◐ {L['hardware_simulated']}</span>"
    st.markdown(f"<span style='font-size:1.0rem; color:#94a3b8;'>{L['team_sub']} | {conn_badge} | 📱 {L['remote_ctl_title']}</span>", unsafe_allow_html=True)
    st.markdown(f"<span style='font-size:0.9rem; color:#38bdf8; font-weight:600;'>🏷️ {L['crop_badge']}</span>", unsafe_allow_html=True)

with col_l1:
    if st.button("English", use_container_width=True, type="primary" if st.session_state["lang"] == "EN" else "secondary"):
        st.session_state["lang"] = "EN"
        st.rerun()

with col_l2:
    if st.button("हिंदी", use_container_width=True, type="primary" if st.session_state["lang"] == "HI" else "secondary"):
        st.session_state["lang"] = "HI"
        st.rerun()

with col_l3:
    if st.button("ಕನ್ನಡ", use_container_width=True, type="primary" if st.session_state["lang"] == "KN" else "secondary"):
        st.session_state["lang"] = "KN"
        st.rerun()

with col_l4:
    if st.button("ತುಳು", use_container_width=True, type="primary" if st.session_state["lang"] == "TU" else "secondary"):
        st.session_state["lang"] = "TU"
        st.rerun()

st.markdown("<hr style='margin: 10px 0; border: none; border-top: 1px solid #1e293b;'/>", unsafe_allow_html=True)

# ==========================================
# 3 GIANT MODE CARDS (PHONE REMOTE CONTROL)
# ==========================================
m_col1, m_col2, m_col3 = st.columns(3)

with m_col1:
    is_active = (current_mode == 0)
    card_cls = "mode-active" if is_active else "mode-inactive"
    st.markdown(f"""
    <div class='metric-card {card_cls}'>
        <div style='font-size: 2.2rem;'>🏠</div>
        <div style='font-size: 1.6rem; font-weight: 800; color: #ffffff;'>{L['mode_storage']}</div>
        <div style='font-size: 0.9rem; color: #94a3b8; margin-top: 2px;'>{L['summary_storage']}</div>
    </div>
    """, unsafe_allow_html=True)
    if st.button(f"👉 Select {L['mode_storage']} (Send MODE:0)", key="btn_m0", use_container_width=True):
        st.session_state["manual_mode"] = 0
        send_remote_cmd("MODE:0")
        st.rerun()

with m_col2:
    is_active = (current_mode == 1)
    card_cls = "mode-active" if is_active else "mode-inactive"
    st.markdown(f"""
    <div class='metric-card {card_cls}'>
        <div style='font-size: 2.2rem;'>🌱</div>
        <div style='font-size: 1.6rem; font-weight: 800; color: #ffffff;'>{L['mode_germination']}</div>
        <div style='font-size: 0.9rem; color: #94a3b8; margin-top: 2px;'>{L['summary_germination']}</div>
    </div>
    """, unsafe_allow_html=True)
    if st.button(f"👉 Select {L['mode_germination']} (Send MODE:1)", key="btn_m1", use_container_width=True):
        st.session_state["manual_mode"] = 1
        send_remote_cmd("MODE:1")
        st.rerun()

with m_col3:
    is_active = (current_mode == 2)
    card_cls = "mode-active" if is_active else "mode-inactive"
    st.markdown(f"""
    <div class='metric-card {card_cls}'>
        <div style='font-size: 2.2rem;'>🚜</div>
        <div style='font-size: 1.6rem; font-weight: 800; color: #ffffff;'>{L['mode_field']}</div>
        <div style='font-size: 0.9rem; color: #94a3b8; margin-top: 2px;'>{L['summary_field']}</div>
    </div>
    """, unsafe_allow_html=True)
    if st.button(f"👉 Select {L['mode_field']} (Send MODE:2)", key="btn_m2", use_container_width=True):
        st.session_state["manual_mode"] = 2
        send_remote_cmd("MODE:2")
        st.rerun()

# ==========================================
# STATUS BANNER & EXPLAINABLE REASON (X-CPS)
# ==========================================
if data["alert"] == 1:
    st.markdown(f"<div class='banner-alert'>⚠️ {L['alert_banner']}</div>", unsafe_allow_html=True)
else:
    st.markdown(f"<div class='banner-ok'>🛡️ {L['all_ok']}</div>", unsafe_allow_html=True)

st.markdown(f"""
<div style='background:#111c28; border-left:6px solid #38bdf8; padding:12px 18px; border-radius:10px; margin-bottom:16px;'>
    <div style='font-size:0.9rem; color:#94a3b8; font-weight:700; text-transform:uppercase;'>🧠 {L['decision_reason_title']}</div>
    <div style='font-size:1.35rem; color:#f8fafc; font-weight:800; margin-top:3px;'>
        Decision: <span style='color:#38bdf8;'>{current_reason}</span>
    </div>
</div>
""", unsafe_allow_html=True)

# ==========================================
# DYNAMIC METRIC GAUGES BY MODE
# ==========================================
if current_mode == 0:
    # STORAGE MODE
    g1, g2, g3, g4 = st.columns(4)
    with g1:
        st.markdown(f"""
        <div class='metric-card'>
            <div class='metric-title'>{L['temperature']} (Storage)</div>
            <div class='metric-val'>{data['temp1']:.1f}<span class='metric-unit'>°C</span></div>
        </div>
        """, unsafe_allow_html=True)
    with g2:
        st.markdown(f"""
        <div class='metric-card'>
            <div class='metric-title'>{L['humidity']} (Storage)</div>
            <div class='metric-val'>{data['hum1']:.0f}<span class='metric-unit'>%</span></div>
        </div>
        """, unsafe_allow_html=True)
    with g3:
        gas_color = "#ef4444" if data['gas'] > 200 else "#38bdf8"
        st.markdown(f"""
        <div class='metric-card'>
            <div class='metric-title'>{L['gas_level']} (MQ-135)</div>
            <div class='metric-val' style='color:{gas_color};'>{data['gas']}<span class='metric-unit'> RAW</span></div>
        </div>
        """, unsafe_allow_html=True)
    with g4:
        fan_text = L['status_on'] if data['fan'] else L['status_off']
        fan_cls = "metric-state-on" if data['fan'] else "metric-state-off"
        st.markdown(f"""
        <div class='metric-card'>
            <div class='metric-title'>{L['fan_status']}</div>
            <div class='{fan_cls}'>{fan_text}</div>
        </div>
        """, unsafe_allow_html=True)

elif current_mode == 1:
    # GERMINATION MODE
    g1, g2, g3, g4 = st.columns(4)
    with g1:
        avg_m = int((data['soil1'] + data['soil2']) / 2)
        st.markdown(f"""
        <div class='metric-card'>
            <div class='metric-title'>{L['soil_moisture']} (Nursery)</div>
            <div class='metric-val'>{avg_m}<span class='metric-unit'>%</span></div>
        </div>
        """, unsafe_allow_html=True)
    with g2:
        st.markdown(f"""
        <div class='metric-card'>
            <div class='metric-title'>{L['temperature']} (Tray)</div>
            <div class='metric-val'>{data['temp2']:.1f}<span class='metric-unit'>°C</span></div>
        </div>
        """, unsafe_allow_html=True)
    with g3:
        # Default or calculated health score
        health = st.session_state["uploaded_cv_result"].get("health_score", 92.5) if st.session_state["uploaded_cv_result"] else 91.0
        st.markdown(f"""
        <div class='metric-card' style='border-color: #22c55e;'>
            <div class='metric-title'>🏅 {L['health_score_title']}</div>
            <div class='metric-val' style='color:#34d399;'>{health:.1f}<span class='metric-unit'>/100</span></div>
        </div>
        """, unsafe_allow_html=True)
    with g4:
        pump_text = L['status_on'] if data['pump'] else L['status_off']
        pump_cls = "metric-state-on" if data['pump'] else "metric-state-off"
        st.markdown(f"""
        <div class='metric-card'>
            <div class='metric-title'>{L['pump_status']}</div>
            <div class='{pump_cls}'>{pump_text}</div>
        </div>
        """, unsafe_allow_html=True)

    # -------------------------------------------------------------
    # FARMER PHONE TRAY PHOTO CAPTURE & CV PHENOTYPING MODULE
    # -------------------------------------------------------------
    st.markdown("<hr style='margin: 14px 0; border: none; border-top: 1px solid #1e293b;'/>", unsafe_allow_html=True)
    st.markdown(f"<h3 style='color:#38bdf8;'>{L['capture_photo_btn']}</h3>", unsafe_allow_html=True)
    st.markdown("<p style='color:#94a3b8; font-size:0.95rem;'>The farmer photographs the nursery tray using their own phone camera. Chiguru's classical CV algorithms score emergence vigor and fuse it with live IoT telemetry.</p>", unsafe_allow_html=True)

    c_upload, c_preview = st.columns([1.5, 2.5])

    with c_upload:
        uploaded_file = st.file_uploader("Take Photo or Upload Image", type=["jpg", "jpeg", "png"], label_visibility="collapsed")
        gen_synthetic_btn = st.button("🧪 Load Fresh Moong Sprout Tray (Demo Simulation)", use_container_width=True)

        if gen_synthetic_btn:
            synth_bgr = generate_synthetic_tray(scenario="normal", total_seeds=20, germ_seeds=18)
            count, pct, ann_bgr = count_sprouts(synth_bgr, total_seeds=20)
            health = compute_germination_health_score(pct, float(avg_m), data['temp2'])
            st.session_state["uploaded_cv_result"] = {
                "count": count,
                "pct": pct,
                "total": 20,
                "health_score": health,
                "ann_bgr": ann_bgr
            }
            st.success(f"Processed Synthetic Tray: {count}/20 Sprouts Detected ({pct}%)")

        if uploaded_file is not None:
            file_bytes = np.asarray(bytearray(uploaded_file.read()), dtype=np.uint8)
            img_bgr = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
            if img_bgr is not None:
                count, pct, ann_bgr = count_sprouts(img_bgr, total_seeds=20)
                health = compute_germination_health_score(pct, float(avg_m), data['temp2'])
                st.session_state["uploaded_cv_result"] = {
                    "count": count,
                    "pct": pct,
                    "total": 20,
                    "health_score": health,
                    "ann_bgr": ann_bgr
                }
                st.success(f"Phone Photo Analyzed: {count}/20 Sprouts ({pct}%) | Health Score: {health}/100")

    with c_preview:
        if st.session_state["uploaded_cv_result"] is not None:
            res = st.session_state["uploaded_cv_result"]
            ann_rgb = cv2.cvtColor(res["ann_bgr"], cv2.COLOR_BGR2RGB)
            st.image(ann_rgb, caption=f"CV Phenotyping Result: {res['count']}/{res['total']} Sprouts ({res['pct']}%) | Brown Seeds Rejected in Red", use_container_width=True)
        else:
            # Show pre-cached latest capture if available
            latest_cap = os.path.join(DATA_DIR, "latest_sprout_capture.jpg")
            if os.path.exists(latest_cap):
                st.image(latest_cap, caption="Latest Phenotyping Snapshot (18/20 Sprouts, 90.0% Emergence)", use_container_width=True)

elif current_mode == 2:
    # FIELD MODE
    g1, g2, g3, g4 = st.columns(4)
    with g1:
        st.markdown(f"""
        <div class='metric-card'>
            <div class='metric-title'>{L['soil_zone_a']}</div>
            <div class='metric-val'>{data['soil1']}<span class='metric-unit'>%</span></div>
        </div>
        """, unsafe_allow_html=True)
    with g2:
        st.markdown(f"""
        <div class='metric-card'>
            <div class='metric-title'>{L['soil_zone_b']}</div>
            <div class='metric-val'>{data['soil2']}<span class='metric-unit'>%</span></div>
        </div>
        """, unsafe_allow_html=True)
    with g3:
        st.markdown(f"""
        <div class='metric-card'>
            <div class='metric-title'>{L['temperature']} (Canopy)</div>
            <div class='metric-val'>{data['temp2']:.1f}<span class='metric-unit'>°C</span></div>
        </div>
        """, unsafe_allow_html=True)
    with g4:
        pump_text = L['status_on'] if data['pump'] else L['status_off']
        pump_cls = "metric-state-on" if data['pump'] else "metric-state-off"
        st.markdown(f"""
        <div class='metric-card'>
            <div class='metric-title'>{L['pump_status']}</div>
            <div class='{pump_cls}'>{pump_text}</div>
        </div>
        """, unsafe_allow_html=True)

# ==========================================
# MANUAL OVERRIDE & TELEMETRY TREND CHARTS
# ==========================================
st.markdown("<hr style='margin: 14px 0; border: none; border-top: 1px solid #1e293b;'/>", unsafe_allow_html=True)

col_ctrl, col_trends = st.columns([1.2, 2.8])

with col_ctrl:
    st.markdown("<h4 style='color:#38bdf8; margin-top:0;'>💧 Manual Actuator Override</h4>", unsafe_allow_html=True)
    if st.button("▶️ Force Pump ON (Send PUMP:ON)", use_container_width=True):
        send_remote_cmd("PUMP:ON")
        st.toast("Dispatched PUMP:ON over serial!")

    if st.button("⏹️ Force Pump OFF (Send PUMP:OFF)", use_container_width=True):
        send_remote_cmd("PUMP:OFF")
        st.toast("Dispatched PUMP:OFF over serial!")

with col_trends:
    st.markdown(f"<h4 style='color:#38bdf8; margin-top:0;'>📈 {L['trends_title']}</h4>", unsafe_allow_html=True)
    if os.path.exists(LOG_FILE):
        try:
            df = pd.read_csv(LOG_FILE)
            if not df.empty and len(df) > 2:
                # Plot last 30 readings
                sub_df = df.tail(30)[["temp1", "temp2", "soil1", "soil2"]].copy()
                sub_df.columns = ["Temp Storage (°C)", "Temp Nursery (°C)", "Soil 1 (%)", "Soil 2 (%)"]
                st.line_chart(sub_df, height=180)
            else:
                st.caption("Awaiting initial telemetry records to render trendline...")
        except Exception:
            st.caption("Telemetry stream active.")
    else:
        st.caption("Bridge active: logging incoming frames to data/log.csv")

# Auto-refresh script (1.5 seconds)
st.markdown("""
<script>
    setTimeout(function() {
        window.location.reload();
    }, 1500);
</script>
""", unsafe_allow_html=True)
