# Publiser Tabata i App Store og Google Play

App-ID: `com.ekstromjonathan.tabata`  
Produkt-ID: `tabata_monthly` (auto-fornyende, 1 måned, **19 NOK**)  
Android base plan-ID: `monthly`

Native-appen er Capacitor. Den åpner den deployede nettappen (`APP_URL`) og tar betalt med StoreKit 2 / Google Play Billing. Stripe brukes bare på nett.

## Før du bygger

1. Deploy Next.js-appen til HTTPS (Cloudflare Worker via OpenNext, se README).
2. Sett `APP_URL` (og `CAPACITOR_SERVER_URL` om du vil overstyre) til den adressen.
3. Kjør `npx cap sync`.

Uten `APP_URL` viser den native appen bare en svart splash. Butikkversjonen **må** peke på produksjon.

## App Store (iOS)

Krever Mac, [Xcode](https://developer.apple.com/xcode/) og Apple Developer Program (99 USD/år).

1. [App Store Connect](https://appstoreconnect.apple.com) → Apps → ny app.
   - Bundle ID: `com.ekstromjonathan.tabata`
   - Navn: Tabata
   - Språk: Norsk
2. **Subscriptions** → ny gruppe «Tabata» → produkt `tabata_monthly`.
   - Varighet: 1 måned
   - Pris: 19 NOK (nivå nærmest 19 kr)
   - Lokaliser: «Tabata månedlig» / «Full timer. Si opp når som helst.»
3. Sett inn `.env.local`:

```
APP_URL=https://ditt-domene.no
APPLE_SHARED_SECRET=...   # valgfritt, for kvitteringsjekk
```

4. På Mac:

```bash
npx cap add ios    # første gang
npx cap sync ios
npx cap open ios
```

5. I Xcode:
   - Signing: ditt team
   - Capability: **In-App Purchase**
   - Version / build
   - Product → Scheme → Edit → Run → StoreKit Configuration: `ios/App/Tabata.storekit` (lokal test)
6. Arkiver → Distribute → App Store Connect.
7. App Privacy: e-post (konto), kjøp (App Store). Ingen sporing.
8. Review-notat: abonnement via IAP, gjenopprett kjøp og slett konto ligger under Konto.

### Listing (norsk)

**Navn:** Tabata  
**Undertekst:** Minimal intervaltimer  
**Beskrivelse:** se `store/ios/description.txt`  
**Kategori:** Helse og trening  
**Pris:** Gratis app + auto-fornyende abonnement 19 kr/mnd  

Apple krever at prisen i appen kommer fra StoreKit (`priceString`), ikke hardkodet. Det gjør `NativeCheckout`.

## Google Play

Krever Google Play-utviklerkonto (engangsavgift) og Android Studio.

1. Play Console → ny app «Tabata», pakkenavn `com.ekstromjonathan.tabata`.
2. Monetize → Products → Subscriptions → `tabata_monthly`.
   - Base plan ID: `monthly`
   - Periode: 1 måned
   - Pris: 19 NOK
3. Last opp en intern test-AAB **før** IAP virker (Play-krav).
4. License testers: din Gmail.
5. Bygg:

```bash
npx cap sync android
npx cap open android
```

I Android Studio: Build → Generate Signed Bundle. Last opp til intern test, deretter produksjon.

Play Billing-tillatelse ligger i `AndroidManifest.xml`.

## Konto-krav i butikkene

- **Gjenopprett kjøp** på abonner- og kontosiden.
- **Slett konto** på kontosiden (App Store 5.1.1(v)).
- Personvern og vilkår: `/personvern` og `/vilkar`.

## Vanlige feil

| Symptom | Årsak |
| --- | --- |
| Splash uten timer | `APP_URL` manglet ved `cap sync` |
| «Butikken er ikke tilgjengelig» | Kjører i nettleser, eller produkt-ID er ikke godkjent |
| Android-kjøp feiler | Base plan `monthly` mangler, eller appen er ikke lastet opp som intern test |
| Apple avviser Stripe i appen | Riktig — native bruker IAP, ikke Stripe |
