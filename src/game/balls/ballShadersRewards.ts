// src/game/balls/ballShadersRewards.ts

/**
 * Shaders des billes exclusives coffres (26 billes)
 * Ces billes sont obtenues uniquement via les récompenses de coffres
 */

export const REWARD_BALL_SHADERS: Record<string, string> = {
  // ============================================
  // COMMON CHEST BALLS (8 billes)
  // ============================================

  ball_pool: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  float angle = atan(v.y, v.x);
  float radial = dist / u_radius;
  
  // Nombre 8 au centre
  float eight = smoothstep(0.3, 0.5, radial) * smoothstep(0.7, 0.5, radial);
  
  // Motif bille de billard noir/blanc
  vec3 black = vec3(0.05, 0.05, 0.05);
  vec3 white = vec3(0.95, 0.95, 0.95);
  
  vec3 color = mix(black, white, eight);
  
  // Reflet brillant
  float highlight = smoothstep(0.2, 0.0, length(v - vec2(-u_radius * 0.3, -u_radius * 0.3)));
  color += highlight * 0.5;
  
  return vec4(color, 1.0);
}`,

  ball_orange: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  vec2 uv = v / u_radius;
  
  // Texture peau d'orange
  float peel = noise(uv * 15.0 + u_time * 0.1);
  peel = smoothstep(0.4, 0.6, peel) * 0.3;
  
  float radial = 1.0 - dist / u_radius;
  
  vec3 orangeBase = vec3(1.0, 0.6, 0.1);
  vec3 orangeLight = vec3(1.0, 0.75, 0.3);
  
  vec3 color = mix(orangeBase, orangeLight, radial * 0.6);
  color *= (1.0 - peel);
  
  // Reflet brillant
  float highlight = smoothstep(0.3, 0.0, length(v - vec2(-u_radius * 0.3, -u_radius * 0.3)));
  color += highlight * 0.4;
  
  return vec4(color, 1.0);
}`,

  ball_soccer: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  float angle = atan(v.y, v.x);
  float radial = dist / u_radius;
  
  // Motif hexagones (ballon de foot)
  float hex = abs(sin(angle * 3.0 + radial * 5.0));
  hex = smoothstep(0.5, 0.7, hex);
  
  vec3 white = vec3(0.95, 0.95, 0.95);
  vec3 black = vec3(0.1, 0.1, 0.1);
  
  vec3 color = mix(white, black, hex);
  
  // Ombre
  color *= (0.7 + radial * 0.3);
  
  return vec4(color, 1.0);
}`,

  ball_tennis: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  float angle = atan(v.y, v.x);
  
  // Ligne courbe (couture)
  float seam = abs(sin(angle * 2.0)) - 0.1;
  seam = smoothstep(0.0, 0.02, seam);
  
  vec3 yellowGreen = vec3(0.8, 1.0, 0.2);
  vec3 white = vec3(1.0, 1.0, 1.0);
  
  vec3 color = mix(white, yellowGreen, seam);
  
  // Texture feutre
  float radial = 1.0 - dist / u_radius;
  color *= (0.85 + radial * 0.15);
  
  return vec4(color, 1.0);
}`,

  ball_baseball: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  float angle = atan(v.y, v.x);
  
  // Coutures rouges
  float stitch1 = abs(sin(angle * 1.0 + 0.5)) - 0.05;
  float stitch2 = abs(sin(angle * 1.0 - 0.5)) - 0.05;
  float stitches = smoothstep(0.0, 0.01, min(stitch1, stitch2));
  
  vec3 white = vec3(0.95, 0.95, 0.95);
  vec3 red = vec3(0.9, 0.1, 0.1);
  
  vec3 color = mix(red, white, stitches);
  
  return vec4(color, 1.0);
}`,

  ball_volleyball: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  float angle = atan(v.y, v.x);
  
  // Panneaux (3 sections)
  float panels = abs(sin(angle * 1.5));
  panels = smoothstep(0.95, 1.0, panels);
  
  vec3 white = vec3(0.98, 0.98, 0.98);
  vec3 cream = vec3(0.95, 0.93, 0.88);
  
  vec3 color = mix(cream, white, panels);
  
  float radial = 1.0 - dist / u_radius;
  color *= (0.85 + radial * 0.15);
  
  return vec4(color, 1.0);
}`,

  ball_football: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  float angle = atan(v.y, v.x);
  
  // Lacets blancs
  float laces = abs(sin(angle * 8.0)) * smoothstep(0.3, 0.5, abs(v.x / u_radius));
  laces = smoothstep(0.7, 0.9, laces);
  
  vec3 brown = vec3(0.6, 0.4, 0.2);
  vec3 white = vec3(0.95, 0.95, 0.95);
  
  vec3 color = mix(brown, white, laces * 0.8);
  
  return vec4(color, 1.0);
}`,

  ball_softball: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  float angle = atan(v.y, v.x);
  
  // Coutures rouges (softball)
  float stitch = abs(sin(angle * 1.0));
  stitch = smoothstep(0.98, 1.0, stitch);
  
  vec3 yellow = vec3(1.0, 0.95, 0.2);
  vec3 red = vec3(0.9, 0.1, 0.1);
  
  vec3 color = mix(yellow, red, stitch);
  
  return vec4(color, 1.0);
}`,

  // ============================================
  // RARE CHEST BALLS (10 billes)
  // ============================================
  ball_earth: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  vec2 uv = v / u_radius;
  
  // Continents
  float continents = noise(uv * 5.0 + u_time * 0.05);
  continents = smoothstep(0.45, 0.55, continents);
  
  // Nuages
  float clouds = noise(uv * 8.0 + u_time * 0.2);
  clouds = smoothstep(0.6, 0.7, clouds) * 0.3;
  
  vec3 ocean = vec3(0.1, 0.3, 0.7);
  vec3 land = vec3(0.2, 0.6, 0.2);
  vec3 white = vec3(1.0, 1.0, 1.0);
  
  vec3 color = mix(ocean, land, continents);
  color = mix(color, white, clouds);
  
  // Atmosphère
  float radial = 1.0 - dist / u_radius;
  color *= (0.7 + radial * 0.3);
  
  return vec4(color, 1.0);
}`,

  ball_blueberry: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5);
}
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  vec2 uv = v / u_radius;
  
  // Texture myrtille
  float spots = hash(floor(uv * 10.0));
  spots = smoothstep(0.7, 0.8, spots) * 0.2;
  
  float radial = 1.0 - dist / u_radius;
  
  vec3 purple = vec3(0.3, 0.1, 0.6);
  vec3 blue = vec3(0.2, 0.2, 0.8);
  
  vec3 color = mix(purple, blue, radial * 0.5);
  color *= (1.0 - spots);
  
  // Reflet brillant
  float highlight = smoothstep(0.3, 0.0, length(v - vec2(-u_radius * 0.3, -u_radius * 0.3)));
  color += highlight * 0.5;
  
  return vec4(color, 1.0);
}`,

  ball_moon: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  vec2 uv = v / u_radius;
  
  // Cratères
  float craters = noise(uv * 12.0);
  craters = smoothstep(0.55, 0.65, craters) * 0.3;
  
  vec3 gray = vec3(0.7, 0.7, 0.7);
  vec3 darkGray = vec3(0.4, 0.4, 0.4);
  
  vec3 color = mix(gray, darkGray, craters);
  
  // Lumière du soleil
  float light = smoothstep(0.5, -0.5, v.x / u_radius);
  color *= (0.6 + light * 0.4);
  
  return vec4(color, 1.0);
}`,

  ball_sun: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  float maxRadius = u_radius * 1.2;
  if(dist > maxRadius) return vec4(0.0);
  vec2 uv = v / maxRadius;
  
  // Flammes solaires
  float flares = noise(uv * 6.0 + u_time * 0.5);
  flares += sin(atan(v.y, v.x) * 8.0 + u_time * 3.0) * 0.2;
  
  vec3 yellow = vec3(1.0, 0.9, 0.3);
  vec3 orange = vec3(1.0, 0.5, 0.1);
  vec3 white = vec3(1.0, 1.0, 1.0);
  
  vec3 color = mix(orange, yellow, flares * 0.5 + 0.5);
  
  // Couronne
  if(dist > u_radius) {
    float corona = (dist - u_radius) / (maxRadius - u_radius);
    float glow = (1.0 - corona) * 0.8;
    return vec4(mix(color, white, 0.3) * glow, glow);
  }
  
  color = mix(color, white, smoothstep(u_radius * 0.5, 0.0, dist) * 0.5);
  
  return vec4(color, 1.0);
}`,

  ball_diamond: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  float angle = atan(v.y, v.x);
  float radial = dist / u_radius;
  
  // Facettes diamant
  float facets = abs(sin(angle * 12.0 + radial * 8.0 + u_time * 0.5));
  facets = smoothstep(0.3, 0.7, facets);
  
  // Arc-en-ciel
  float hue = (angle / 6.28318) + u_time * 0.3 + radial;
  hue = fract(hue);
  
  vec3 rainbow = vec3(
    sin(hue * 6.28318) * 0.5 + 0.5,
    sin(hue * 6.28318 + 2.09) * 0.5 + 0.5,
    sin(hue * 6.28318 + 4.19) * 0.5 + 0.5
  );
  
  vec3 white = vec3(1.0, 1.0, 1.0);
  vec3 color = mix(rainbow * 0.8, white, facets * 0.6);
  
  // Brillance
  color *= (0.8 + (1.0 - radial) * 0.2);
  
  return vec4(color, 1.0);
}`,

  ball_basketball: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  float angle = atan(v.y, v.x);
  
  // Lignes noires (4 sections)
  float lines = abs(sin(angle * 2.0));
  lines = smoothstep(0.98, 1.0, lines);
  
  vec3 orange = vec3(1.0, 0.5, 0.1);
  vec3 black = vec3(0.05, 0.05, 0.05);
  
  vec3 color = mix(orange, black, lines);
  
  // Texture cuir
  float radial = 1.0 - dist / u_radius;
  color *= (0.85 + radial * 0.15);
  
  return vec4(color, 1.0);
}`,

  ball_bowling: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  vec2 uv = v / u_radius;
  
  // Trous de bowling
  float hole1 = smoothstep(0.08, 0.06, length(uv - vec2(0.0, -0.3)));
  float hole2 = smoothstep(0.08, 0.06, length(uv - vec2(-0.2, 0.2)));
  float hole3 = smoothstep(0.08, 0.06, length(uv - vec2(0.2, 0.2)));
  float holes = max(max(hole1, hole2), hole3);
  
  vec3 purple = vec3(0.5, 0.1, 0.7);
  vec3 black = vec3(0.05, 0.05, 0.05);
  
  vec3 color = mix(purple, black, holes);
  
  // Brillance
  float highlight = smoothstep(0.3, 0.0, length(v - vec2(-u_radius * 0.3, -u_radius * 0.3)));
  color += highlight * 0.4;
  
  return vec4(color, 1.0);
}`,

  ball_eye: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  
  // Blanc de l'œil
  vec3 white = vec3(0.95, 0.95, 0.95);
  
  // Iris
  float irisDist = length(v);
  vec3 irisColor = vec3(0.2, 0.5, 0.8);
  
  // Pupille
  float pupilDist = length(v);
  vec3 pupil = vec3(0.05, 0.05, 0.05);
  
  vec3 color = white;
  if(irisDist < u_radius * 0.5) {
    color = irisColor;
  }
  if(pupilDist < u_radius * 0.2) {
    color = pupil;
  }
  
  // Reflet
  float highlight = smoothstep(0.15, 0.0, length(v - vec2(-u_radius * 0.2, -u_radius * 0.2)));
  color += highlight * 0.6;
  
  // Clignement
  float blink = sin(u_time * 2.0) * 0.5 + 0.5;
  if(blink < 0.1) {
    color *= 0.3;
  }
  
  return vec4(color, 1.0);
}`,

  ball_virus: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5);
}
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  float maxRadius = u_radius * 1.2;
  if(dist > maxRadius) return vec4(0.0);
  float angle = atan(v.y, v.x);
  
  // Spikes du virus
  float spikes = sin(angle * 12.0 + u_time * 2.0) * 0.5 + 0.5;
  spikes = smoothstep(0.7, 1.0, spikes);
  
  vec3 green = vec3(0.2, 0.8, 0.2);
  vec3 darkGreen = vec3(0.1, 0.4, 0.1);
  
  vec3 color = mix(darkGreen, green, spikes);
  
  // Protubérances
  if(dist > u_radius && spikes > 0.7) {
    float spike = (dist - u_radius) / (maxRadius - u_radius);
    float alpha = (1.0 - spike) * spikes;
    return vec4(green, alpha);
  }
  
  float radial = 1.0 - dist / u_radius;
  color *= (0.7 + radial * 0.3);
  
  return vec4(color, 1.0);
}`,

  ball_brain: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  vec2 uv = v / u_radius;
  
  // Circonvolutions
  float folds = noise(uv * 10.0 + u_time * 0.1);
  folds = smoothstep(0.4, 0.6, folds) * 0.3;
  
  // Ondes psychiques
  float waves = sin(dist * 15.0 - u_time * 3.0) * 0.5 + 0.5;
  waves *= smoothstep(u_radius, u_radius * 0.8, dist) * 0.2;
  
  vec3 pink = vec3(0.9, 0.7, 0.7);
  vec3 darkPink = vec3(0.7, 0.5, 0.5);
  vec3 cyan = vec3(0.3, 0.8, 0.9);
  
  vec3 color = mix(darkPink, pink, folds);
  color += waves * cyan;
  
  return vec4(color, 1.0);
}`,

  // ============================================
  // LEGENDARY CHEST BALLS (6 billes)
  // ============================================
  ball_galaxy: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  float angle = atan(v.y, v.x);
  vec2 uv = v / u_radius;
  
  // Spirale galactique
  float spiral = angle + dist * 5.0 - u_time * 0.5;
  float arms = sin(spiral * 3.0) * 0.5 + 0.5;
  
  // Nébuleuse
  float nebula = noise(uv * 5.0 + u_time * 0.2);
  
  // Étoiles
  float stars = hash(floor(uv * 30.0 + u_time * 0.05));
  stars = smoothstep(0.98, 1.0, stars);
  
  vec3 purple = vec3(0.4, 0.1, 0.7);
  vec3 blue = vec3(0.1, 0.3, 0.8);
  vec3 pink = vec3(0.9, 0.3, 0.7);
  vec3 white = vec3(1.0, 1.0, 1.0);
  
  vec3 color = mix(purple, blue, nebula * 0.6);
  color = mix(color, pink, arms * 0.4);
  color += stars * white * 0.8;
  
  return vec4(color, 1.0);
}`,

  ball_blackhole: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5);
}
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  float angle = atan(v.y, v.x);
  
  // Disque d'accrétion
  float accretion = smoothstep(u_radius * 0.3, u_radius, dist);
  float rotation = angle + u_time * 3.0 - dist * 10.0;
  float disk = sin(rotation * 20.0) * 0.5 + 0.5;
  disk *= accretion;
  
  // Horizon des événements (noir absolu)
  float eventHorizon = smoothstep(u_radius * 0.3, u_radius * 0.2, dist);
  
  vec3 orange = vec3(1.0, 0.5, 0.1);
  vec3 yellow = vec3(1.0, 0.9, 0.3);
  vec3 black = vec3(0.0, 0.0, 0.0);
  
  vec3 color = mix(orange, yellow, disk);
  color = mix(color, black, eventHorizon);
  
  return vec4(color, 1.0);
}`,

  ball_crystal: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  float angle = atan(v.y, v.x);
  float radial = dist / u_radius;
  
  // Facettes cristal
  float facets = abs(sin(angle * 8.0 + radial * 12.0 + u_time));
  facets = smoothstep(0.2, 0.8, facets);
  
  // Reflets arc-en-ciel
  float hue = (angle / 6.28318) + u_time * 0.5 + radial * 2.0;
  hue = fract(hue);
  
  vec3 rainbow = vec3(
    sin(hue * 6.28318) * 0.5 + 0.5,
    sin(hue * 6.28318 + 2.09) * 0.5 + 0.5,
    sin(hue * 6.28318 + 4.19) * 0.5 + 0.5
  );
  
  vec3 white = vec3(1.0, 1.0, 1.0);
  vec3 color = mix(rainbow * 0.7, white, facets * 0.5);
  
  // Brillance magique
  float glow = sin(u_time * 3.0) * 0.2 + 0.8;
  color *= glow;
  
  return vec4(color, 0.95);
}`,

  ball_atom: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  float angle = atan(v.y, v.x);
  
  // Noyau
  float nucleus = smoothstep(u_radius * 0.2, 0.0, dist);
  
  // Orbites électrons
  float orbit1 = abs(dist - u_radius * 0.5) < 1.0 ? 1.0 : 0.0;
  float orbit2 = abs(dist - u_radius * 0.7) < 1.0 ? 1.0 : 0.0;
  
  // Électrons
  float electron1 = smoothstep(0.08, 0.0, length(v - vec2(cos(u_time * 2.0), sin(u_time * 2.0)) * u_radius * 0.5));
  float electron2 = smoothstep(0.08, 0.0, length(v - vec2(cos(-u_time * 1.5 + 2.0), sin(-u_time * 1.5 + 2.0)) * u_radius * 0.7));
  float electron3 = smoothstep(0.08, 0.0, length(v - vec2(cos(u_time * 1.8 + 4.0), sin(u_time * 1.8 + 4.0)) * u_radius * 0.7));
  
  vec3 cyan = vec3(0.2, 0.9, 0.9);
  vec3 blue = vec3(0.3, 0.5, 1.0);
  vec3 white = vec3(1.0, 1.0, 1.0);
  
  vec3 color = vec3(0.0);
  color += nucleus * blue;
  color += (orbit1 + orbit2) * cyan * 0.3;
  color += (electron1 + electron2 + electron3) * white;
  
  return vec4(color, 1.0);
}`,

  ball_skull: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  vec2 uv = v / u_radius;
  
  // Orbites yeux
  float eye1 = smoothstep(0.15, 0.1, length(uv - vec2(-0.3, -0.1)));
  float eye2 = smoothstep(0.15, 0.1, length(uv - vec2(0.3, -0.1)));
  
  // Nez triangulaire
  float nose = smoothstep(0.1, 0.05, abs(uv.x)) * smoothstep(0.3, 0.1, uv.y);
  
  vec3 bone = vec3(0.9, 0.9, 0.85);
  vec3 black = vec3(0.05, 0.05, 0.05);
  vec3 purple = vec3(0.5, 0.1, 0.6);
  
  vec3 color = bone;
  color = mix(color, black, eye1 + eye2 + nose);
  
  // Fumée spectrale
  float smoke = sin(uv.y * 10.0 + u_time * 2.0) * 0.5 + 0.5;
  color += smoke * purple * 0.2;
  
  return vec4(color, 1.0);
}`,

  ball_saturn: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  vec2 uv = v / u_radius;
  
  // Bandes atmosphériques
  float bands = noise(vec2(uv.y * 8.0, u_time * 0.1));
  
  // Anneaux (ellipse aplatie)
  float ringDist = length(vec2(v.x, v.y * 0.3));
  float rings = smoothstep(u_radius * 0.9, u_radius * 0.95, ringDist) * 
                 smoothstep(u_radius * 1.3, u_radius * 1.2, ringDist);
  
  vec3 yellow = vec3(0.9, 0.8, 0.5);
  vec3 orange = vec3(0.95, 0.7, 0.4);
  vec3 ringColor = vec3(0.8, 0.7, 0.6);
  
  vec3 color = mix(yellow, orange, bands * 0.5 + 0.5);
  
  // Ombre des anneaux sur la planète
  if(abs(v.y) < u_radius * 0.3 && abs(v.x) > u_radius * 0.5) {
    color *= 0.7;
  }
  
  return vec4(color, 1.0);
}`,
};