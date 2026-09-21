SOFORT-FIX

Ersetze im bestehenden GitHub-Projekt NUR app.js durch diese app.js.

NICHT ersetzen:
- index.html
- style.css
- Bilder
- MP3

Diese Datei stellt die komplette App-Logik wieder her. Sie ist NICHT nur ein
playOptionA()-Snippet.

Beibehalten:
- Kalender + Speicherung
- Kalender/Geschenk Swipe
- Fotoalbum
- Herz-Übergang
- Musik
- Bild-Preloading
- Option B
- Option A Reihenfolge a3 -> a1 -> a2

Safari-Fix:
- Promise.allSettled vollständig entfernt (war für das Preloading ohnehin unnötig)
- decode/fetchPriority nur feature-detected
- WebKit transform/transition fallback
- Touch-Swipe bleibt primär
- Audio wird erst durch echten Touch/Klick entsperrt
