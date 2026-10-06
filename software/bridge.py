#!/usr/bin/env python3
"""
Chiguru Serial Telemetry Bridge (Phase 3)
Team: TerraByte · YEN NOVA 1.0

Features:
- Auto-detects Arduino COM port if not specified
- Non-blocking resilient serial loop surviving unplug/replug
- Validates CSV format and logs ISO timestamped records to data/log.csv
- Maintains data/latest.json for zero-latency dashboard synchronization
- Processes outbound commands (e.g. mode changes) from data/cmd.txt
"""

import os
import sys
import time
import json
import argparse
from datetime import datetime
import serial
import serial.tools.list_ports

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
LOG_FILE = os.path.join(DATA_DIR, "log.csv")
LATEST_FILE = os.path.join(DATA_DIR, "latest.json")
CMD_FILE = os.path.join(DATA_DIR, "cmd.txt")

CSV_HEADER = "timestamp,mode,temp1,hum1,temp2,hum2,soil1,soil2,gas,pump,fan,alert\n"

def ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(LOG_FILE):
        with open(LOG_FILE, "w", encoding="utf-8") as f:
            f.write(CSV_HEADER)

def find_arduino_port():
    ports = list(serial.tools.list_ports.comports())
    for p in ports:
        desc = (p.description or "").lower()
        mfg = (p.manufacturer or "").lower()
        if "arduino" in desc or "ch340" in desc or "usb-serial" in desc or "ftdi" in desc or "arduino" in mfg:
            return p.device
    if ports:
        return ports[0].device
    return None

def parse_telemetry_line(raw_line):
    parts = raw_line.strip().split(",")
    if len(parts) != 11:
        return None
    try:
        data = {
            "timestamp": datetime.now().isoformat(),
            "mode": int(parts[0]),
            "temp1": float(parts[1]),
            "hum1": float(parts[2]),
            "temp2": float(parts[3]),
            "hum2": float(parts[4]),
            "soil1": int(parts[5]),
            "soil2": int(parts[6]),
            "gas": int(parts[7]),
            "pump": int(parts[8]),
            "fan": int(parts[9]),
            "alert": int(parts[10]),
            "is_live": True
        }
        return data
    except (ValueError, IndexError):
        return None

def check_and_send_cmd(ser):
    if os.path.exists(CMD_FILE):
        try:
            with open(CMD_FILE, "r", encoding="utf-8") as f:
                cmd = f.read().strip()
            if cmd:
                ser.write((cmd + "\n").encode("utf-8"))
                ser.flush()
                print(f" [COMMAND SENT TO ARDUINO: {cmd}]")
            # Clear command file
            with open(CMD_FILE, "w", encoding="utf-8") as f:
                f.write("")
        except Exception as e:
            pass

def main():
    parser = argparse.ArgumentParser(description="Chiguru Arduino Serial Telemetry Bridge")
    parser.add_argument("--port", type=str, default="auto", help="Serial port (e.g. COM3, /dev/ttyUSB0, auto)")
    parser.add_argument("--baud", type=int, default=115200, help="Baud rate (default: 115200)")
    args = parser.parse_args()

    ensure_data_dir()
    print("=" * 65)
    print("  CHIGURU SERIAL BRIDGE (TerraByte · YEN NOVA 1.0)  ")
    print(f"  Target Baud: {args.baud} | Log: {LOG_FILE}")
    print("=" * 65)

    while True:
        target_port = args.port
        if target_port == "auto":
            target_port = find_arduino_port()

        if not target_port:
            print(f"\r[{datetime.now().strftime('%H:%M:%S')}] Waiting for Arduino connection... (No COM port found)", end="", flush=True)
            time.sleep(1.5)
            continue

        print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Connecting to {target_port} at {args.baud} baud...")
        ser = None
        try:
            ser = serial.Serial(target_port, args.baud, timeout=1.5)
            time.sleep(2.0)  # Allow Arduino reset on DTR toggle
            ser.reset_input_buffer()
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Connected successfully to {target_port}! Streaming telemetry...")

            while True:
                # Check for outbound commands
                check_and_send_cmd(ser)

                if ser.in_waiting > 0:
                    raw_bytes = ser.readline()
                    try:
                        line = raw_bytes.decode("utf-8", errors="ignore").strip()
                    except Exception:
                        continue

                    if not line:
                        continue

                    data = parse_telemetry_line(line)
                    if data:
                        # Append to CSV log
                        csv_entry = (
                            f"{data['timestamp']},{data['mode']},{data['temp1']},{data['hum1']},"
                            f"{data['temp2']},{data['hum2']},{data['soil1']},{data['soil2']},"
                            f"{data['gas']},{data['pump']},{data['fan']},{data['alert']}\n"
                        )
                        with open(LOG_FILE, "a", encoding="utf-8") as f:
                            f.write(csv_entry)

                        # Write atomic latest state
                        temp_latest = LATEST_FILE + ".tmp"
                        with open(temp_latest, "w", encoding="utf-8") as f:
                            json.dump(data, f)
                        os.replace(temp_latest, LATEST_FILE)

                        # One-line terminal status display
                        mode_labels = {0: "STORAGE", 1: "GERMINATION", 2: "FIELD"}
                        t_str = datetime.now().strftime("%H:%M:%S")
                        m_str = mode_labels.get(data['mode'], f"M{data['mode']}")
                        pump_str = "ON" if data['pump'] else "OFF"
                        fan_str = "ON" if data['fan'] else "OFF"
                        alrt_str = "ALERT!" if data['alert'] else "OK"

                        print(f"[{t_str}] [{m_str:11}] T1:{data['temp1']:4.1f}C H1:{data['hum1']:3.0f}% | "
                              f"M1:{data['soil1']:2d}% M2:{data['soil2']:2d}% | Gas:{data['gas']:3d} | "
                              f"Pump:{pump_str:3} Fan:{fan_str:3} | [{alrt_str}]")
                else:
                    time.sleep(0.05)

        except (serial.SerialException, OSError) as e:
            print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Serial connection lost ({e}). Reconnecting in 2s...")
            if ser:
                try:
                    ser.close()
                except Exception:
                    pass
            time.sleep(2.0)
        except KeyboardInterrupt:
            print("\nBridge shutting down cleanly.")
            if ser:
                ser.close()
            sys.exit(0)

if __name__ == "__main__":
    main()
