#!/bin/bash

# ===================================================================
#          KHI DONG MARKDOWN2PDF KIT — SALES KIT GENERATOR (LINUX)
# ===================================================================

echo "==================================================================="
echo "          KHOI DONG MARKDOWN2PDF KIT — BASH STARTUP SCRIPT"
echo "==================================================================="
echo ""

# 1. Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[LOI] Khong tim thay Node.js tren he thong nay!"
    echo "Vui long cai dat Node.js bang trinh quan ly goi cua ban (vi du: sudo apt install nodejs)"
    echo "Tải va cai dat Node.js tai: https://nodejs.org/"
    read -p "Nhan Enter de thoat..."
    exit 1
fi

# 2. Check and install dependencies
if [ ! -d "node_modules" ]; then
    echo "[THONG BAO] Phat hien chay lan dau."
    echo "Dang tien hanh tu dong cai dat cac thu vien phu thuoc (npm install)..."
    echo "Vui long cho trong giay lat..."
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "[LOI] Khong the cai dat cac thu vien! Vui long kiem tra ket noi Internet."
        read -p "Nhan Enter de thoat..."
        exit 1
    fi
    echo "[OK] Cai dat thu vien thanh cong!"
    echo ""
fi

# 3. Launch browser helper
echo "[OK] Dang khoi dong server tren cong 3000..."
echo "[OK] Tu dong mo trinh duyet den: http://localhost:3000"
echo ""

# Wait 2 seconds and open browser
sleep 2

if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:3000" &
elif command -v gnome-open &> /dev/null; then
    gnome-open "http://localhost:3000" &
elif command -v open &> /dev/null; then
    # support macOS compatibility
    open "http://localhost:3000" &
else
    # Try Python fallback
    if command -v python3 &> /dev/null; then
        python3 -m webbrowser "http://localhost:3000" &
    elif command -v python &> /dev/null; then
        python -m webbrowser "http://localhost:3000" &
    else
        echo "[CANH BAO] Khong the tu dong mo trinh duyet. Vui long truy cap thu cong: http://localhost:3000"
    fi
fi

# Run node server
npm start
