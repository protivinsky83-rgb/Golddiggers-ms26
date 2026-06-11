# ⚽ Tipování Mistrovství Světa 2026 - Golddiggers

Interaktivní webová aplikace pro tipování výsledků zápasů Mistrovství Světa ve fotbale 2026. Tipuj skóre, soutěž s ostatními hráči a sbírej body!

## 🎯 Funkcionality

### 📋 Záložka "Zápasy"
- **Zobrazení všech zápasů** - Kompletní seznam zápasů MS 2026
- **Filtrování** - Hledej týmy podle názvu
- **Filtrování podle fází** - Skupiny, osmifinále, čtvrtfinále, semifinále, finále
- **Tipování** - Klikni na zápas a zadej svůj tip na skóre
- **Moje tipy** - Zobrazení svých tipů přímo na kartě zápasu
- **Zámek zápasů** - Zápasy se automaticky zamknou po zahájení

### 🏆 Záložka "Leaderboard"
- **Pořadí tipujících** - Seřazení podle bodů
- **Statistiky** - Počet správných tipů a celkové body
- **Medailový systém** - 🥇 1. místo, 🥈 2. místo, 🥉 3. místo

### 📝 Záložka "Moje tipy"
- **Přehled tvých tipů** - Všechny tvoje vsázky na jednom místě
- **Upravit tip** - Změn svůj tip pokud ještě zápas nezačal
- **Smazat tip** - Odeber tip kdykoliv
- **Aktuální body** - Sleduj své bodování

## 🛠️ Technologie

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Data**: JSON
- **Storage**: LocalStorage (tipy se ukládají v prohlížeči)
- **Responsive**: Plně responzivní design pro mobilní zařízení

## 📁 Struktura projektu

```
Golddiggers-ms26/
├── index.html           # Hlavní HTML soubor
├── css/
│   └── style.css        # Všechny styly
├── js/
│   └── script.js        # Veškerá funkčnost
├── data/
│   └── matches.json     # Data zápasů a uživatelů
└── README.md            # Tento soubor
```

## 🚀 Jak spustit aplikaci

### Lokálně
1. Klonuj repozitář:
```bash
git clone https://github.com/protivinsky83-rgb/Golddiggers-ms26.git
```

2. Naviguj do složky:
```bash
cd Golddiggers-ms26
```

3. Otevři `index.html` v prohlížeči nebo spusť s local serverem:
```bash
# Python 3
python -m http.server 8000

# Node.js (pokud máš http-server nainstalován)
http-server
```

4. Otevři `http://localhost:8000` v prohlížeči

### Online (GitHub Pages)
1. Jdi do **Settings** → **Pages**
2. Vyber **Branch: main** a **Folder: / (root)**
3. Aplikace bude dostupná na: `https://protivinsky83-rgb.github.io/Golddiggers-ms26`

## 📖 Jak používat

### Tipování
1. Přejdi na záložku **"Zápasy"**
2. Klikni na tlačítko **"Tipovat"** u zápasu, který chceš tipovat
3. V modálním okně zadej skóre pro oba týmy
4. Klikni **"Uložit tip"**
5. Tvůj tip se uloží a zobrazí se na kartě zápasu

### Úprava tipu
1. Jdi na záložku **"Moje tipy"**
2. Klikni na **"Upravit"** u tipu, který chceš změnit
3. Uprav skóre a klikni **"Uložit tip"**

### Smazání tipu
1. Jdi na záložku **"Moje tipy"**
2. Klikni na **"Smazat"** u tipu, který chceš odstranit
3. Potvrď smazání

### Sledování tabulky
1. Klikni na záložku **"Leaderboard"**
2. Sleduj své umístění a body ostatních tipujících

## 💾 Ukládání dat

- Tipy se **automaticky ukládají** do **LocalStorage** prohlížeče
- Tvoje data se **neztrácí** ani po zavření a opětovném otevření prohlížeče
- Každý prohlížeč má **vlastní izolované tipy**

### Export tipů (manuálně)
```javascript
// V konzoli (F12 → Console)
localStorage.getItem('bets')
```

## 📊 Bodovací systém (připraveno na implementaci)

Aplikace je připravená na implementaci automatického bodování:
- **3 body** - Správné skóre (přesný výsledek)
- **2 body** - Správný vítěz (správná orientace)
- **1 bod** - Správný rozdíl gólů
- **0 bodů** - Špatný tip

## 🎨 Přizpůsobení

### Změna barev
Otevři `css/style.css` a uprav CSS proměnné:
```css
:root {
    --primary-color: #1e40af;
    --secondary-color: #f59e0b;
    --success-color: #10b981;
    --danger-color: #ef4444;
}
```

### Přidání nových zápasů
Uprav `data/matches.json`:
```json
{
  "id": 9,
  "team1": "Česko",
  "team2": "Kanada",
  "flag1": "🇨🇿",
  "flag2": "🇨🇦",
  "date": "2026-06-21",
  "time": "14:00",
  "stage": "group",
  "stadium": "Stadium Name",
  "group": "A",
  "result": null,
  "status": "scheduled"
}
```

### Přidání nových uživatelů
Uprav `data/matches.json` sekci `users`:
```json
{
  "id": 4,
  "name": "Tvoje jméno",
  "email": "email@example.com",
  "bets": [],
  "points": 0
}
```

## 🐛 Známé problémy a budoucí vylepšení

### Plánované funkce
- [ ] Automatické bodování po skončení zápasu
- [ ] Přihlášení uživatelů
- [ ] Databáze místo JSON
- [ ] Správa výsledků zápasů
- [ ] Statistiky tipujících
- [ ] Notifikace při začátku zápasu
- [ ] Export tipů do PDF
- [ ] Sociální sdílení tipů

## 👨‍💻 Autor

**Protivinsky83-RGB**

## 📄 Licence

MIT License - Tvůj projekt, tvá pravidla!

## 🤝 Příspěvky

Pokud máš nápad na vylepšení, vytvoř Issue nebo Pull Request!

---

**Zapojit se do soutěže a tipuj MS 2026! ⚽🏆**

Poslední aktualizace: 11. června 2026
