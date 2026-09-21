SAFARI FIX – NUR app.js ERSETZEN

Warum die letzte Version auf dem iPhone komplett ausfiel:
Die zuletzt gelieferte app.js war nur ein Mini-Patch mit playOptionA().
Wenn diese Datei als app.js hochgeladen wurde, fehlte die komplette restliche App.

Diese app.js ist deshalb wieder die VOLLSTÄNDIGE aktuelle Logik, aber Safari-kompatibler:
- keine Arrow Functions
- keine const/let-Abhängigkeit
- kein Promise.allSettled
- keine zwingende fetchPriority/decode-Unterstützung
- WebKit transform/transition Fallback
- Touch-Swipe direkt für iPhone Safari
- Audio-Unlock bei echter Touch-/Klick-Geste
- Bild-Preloading bleibt
- Option A bleibt a3 -> a1 -> a2
- alles andere bleibt funktional gleich

ZIP enthält absichtlich NUR app.js + README.txt.
Keine Bilder, keine MP3, kein CSS, kein index.html.
