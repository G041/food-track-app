# FoodTrack (app nativa)

Mapa colaborativo de menús QR para **iOS y Android**. Encontrás lugares para comer en el mapa y abrís su menú; los usuarios registrados suman lugares escaneando el QR del menú, y cada aporte pasa por moderación antes de publicarse.

Es la versión nativa de [food-track-web](https://github.com/G041/food-track-web): mismas pantallas y lógica, con las piezas de hardware hechas para el celular (mapa nativo, menú en WebView, fuente embebida).

## Cómo se reparte con la web

| | Dónde vive |
|---|---|
| App iOS/Android | **Este repo.** Se compila con EAS Build y se publica en el App Store / Google Play |
| Base de datos, Auth y moderación | Supabase. Las migraciones están en `food-track-web/supabase/` |
| Funciones del servidor (`/api/login`, `/api/menu-preview`) | Vercel, en `food-track-web/api/`. La app las llama con `EXPO_PUBLIC_API_URL` |
| Web | `food-track-web`, en https://food-track-web.vercel.app |

## Stack

| | |
|---|---|
| App | Expo SDK 58, React Native 0.88, Expo Router, TypeScript |
| Datos | Supabase (`@supabase/supabase-js`) + TanStack Query; Zustand para el estado de la UI |
| Mapa | `@maplibre/maplibre-react-native` v11 con tiles de OpenFreeMap (sin API key) |
| Menú | `react-native-webview` (muestra también los sitios que bloquean iframes en la web) |
| QR, ubicación | `expo-camera`, `expo-location` |
| Builds y actualizaciones | EAS Build, EAS Submit, EAS Update (`expo-updates`) |

## Correr en local

```bash
npm install
npx expo start
```

- **Expo Go** (lo más rápido): escaneá el QR que muestra `npx expo start --go` con la app Expo Go, con el celular en el mismo Wi-Fi. Expo Go no incluye MapLibre ni las fuentes embebidas, así que muestra un aviso en lugar del mapa y usa la fuente del sistema. Todo lo demás funciona.
- **Development build** (la app completa): compilá una vez con `npx eas-cli@latest build --profile development -p ios` (o `-p android`), instalala en el celular y después corré `npx expo start`. En iOS hace falta la cuenta de Apple Developer.

Sin archivo `.env`, la app arranca en **modo demo**: usa un backend simulado en memoria con los 28 restaurantes de la v1. Para moderar, entrá con `admin@foodtrack.demo` / `admin1234`. Para usar la base real, copiá `.env.example` como `.env` y completá las credenciales de Supabase.

Otros comandos: `npm run lint`, `npm run typecheck` y `npm run check:bundle`, que empaqueta el JS de iOS para detectar errores sin compilar en EAS.

## Primera configuración de EAS

```bash
npx eas-cli@latest login
npx eas-cli@latest init                 # vincula el proyecto (agrega el projectId a app.json)
npx eas-cli@latest update:configure     # habilita las actualizaciones OTA
npx eas-cli@latest env:create           # EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_KEY,
                                        # en development, preview y production
```

`EXPO_PUBLIC_API_URL` ya está en `eas.json`. Las variables `EXPO_PUBLIC_*` quedan dentro del binario: son públicas, igual que en la web. La clave secreta de Supabase **nunca** va en este repo ni en EAS; solo la usa Vercel.

## Builds

| Perfil | Para qué | Comando |
|---|---|---|
| `development` | App de desarrollo en tu celular | `npx eas-cli@latest build --profile development -p ios` |
| `preview` | Probar una versión cerrada (distribución interna) | `npx eas-cli@latest build --profile preview -p ios` |
| `production` | App Store / Google Play | `npx eas-cli@latest build --profile production -p ios` y luego `npx eas-cli@latest submit -p ios` |

Los cambios solo de JS se publican sin pasar por la tienda con `npx eas-cli@latest update --channel production`. Los cambios nativos (paquetes nuevos, `app.json`) necesitan un build nuevo.

## Estructura

```
src/
  app/                      rutas (Expo Router)
    (tabs)/                 aportar · index (mapa) · perfil
    admin.tsx               moderación
  components/
    restaurant-map/         index.tsx (elige) + native-map.tsx (MapLibre) + types.ts
    menu-modal/             modal del menú + menu-frame.tsx (WebView)
    qr-scanner.tsx, ui.tsx, …
  features/                 auth, restaurants (queries + validación), map, menu
  lib/api/                  interfaz Api + implementación Supabase + demo
  theme/                    colores, tipografía, tema
app.json                    configuración nativa (íconos, permisos, plugins)
eas.json                    perfiles de build
```
