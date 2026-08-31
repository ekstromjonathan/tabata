# Tabata

Minimal tabata-timer til lokal trening. Svart skjerm, store tall, behagelige pip.

Norsk, svensk og engelsk — bytt språk øverst til høyre.

## Hva du kan stille inn

- **Arbeid** — aktive sekunder per øvelse
- **Hvile** — pause mellom øvelser
- **Øvelser** — antall øvelser per runde
- **Runder** — hvor mange ganger kretsen gjentas
- **Mellom runder** — pause etter en ferdig runde

Tallene kan skrives inn eller justeres med + og −. Total tid oppdateres med en gang.

Klassisk tabata er 20 s arbeid, 10 s hvile, 8 øvelser og 1 runde.

Under økten viser to små sirkler runde og øvelse. **Øvelse på nytt** starter den gjeldende arbeidsøkten forfra.

De siste fem sekundene av økten telles ned med pip. Ferdig økt feires med confetti. Skjermen holdes våken mens timeren kjører.

## Kjør lokalt

```bash
npm install
npm run dev
```

Åpne [http://127.0.0.1:43173](http://127.0.0.1:43173).

Lyden startes når du trykker **Start** — nettleseren krever et klikk før den spiller av pip.
