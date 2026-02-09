#!/bin/bash
# Tüm seed dosyalarını sırayla çalıştıran bash scripti

echo "🌱 Starting comprehensive database seeding..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SEED_FILES=(
    "seed-tyt-matematik.ts"
    "seed-tyt-fizik.ts"
    "seed-tyt-kimya.ts"
    "seed-tyt-biyoloji.ts"
    "seed-tyt-tarih.ts"
    "seed-tyt-cografya.ts"
    "seed-tyt-felsefe.ts"
    "seed-tyt-din.ts"
    "seed-tyt-turkce.ts"
    "seed-tyt-geometri.ts"
    "seed-ayt-matematik.ts"
    "seed-ayt-fizik.ts"
    "seed-ayt-kimya.ts"
    "seed-ayt-biyoloji.ts"
    "seed-ayt-edebiyat.ts"
    "seed-ayt-tarih1.ts"
    "seed-ayt-cografya1.ts"
    "seed-ayt-felsefe.ts"
    "seed-ayt-din.ts"
    "seed-ayt-geometri.ts"
    "seed-lgs-matematik.ts"
    "seed-lgs-fen.ts"
    "seed-lgs-turkce.ts"
    "seed-lgs-inkilap.ts"
    "seed-lgs-din.ts"
    "seed-lgs-ingilizce.ts"
    "seed-ydt-ingilizce.ts"
    "seed-common-activities.ts"
    "seed-special-subjects.ts"
    "seed-lms.ts"
)

TOTAL=${#SEED_FILES[@]}
CURRENT=0
FAILED=()

for FILE in "${SEED_FILES[@]}"; do
    CURRENT=$((CURRENT + 1))
    echo "[$CURRENT/$TOTAL] Running $FILE..."
    
    if npx ts-node "prisma/$FILE"; then
        echo "✅ $FILE completed"
    else
        echo "❌ $FILE failed"
        FAILED+=("$FILE")
    fi
    
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ${#FAILED[@]} -eq 0 ]; then
    echo "✅ All seed files completed successfully!"
    exit 0
else
    echo "⚠️  Completed with errors. Failed files:"
    for FILE in "${FAILED[@]}"; do
        echo "  - $FILE"
    done
    exit 1
fi
