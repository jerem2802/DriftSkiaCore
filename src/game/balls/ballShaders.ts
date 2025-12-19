// src/game/balls/ballShaders.ts
export const BALL_SHADERS: Record<string, string> = {
  // ============================================
  // COMMON (9 billes)
  // ============================================
  ball_classic: `
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  float radial = 1.0 - dist / u_radius;
  vec3 color = vec3(0.13, 0.83, 0.93) * (0.7 + radial * 0.3);
  return vec4(color, 1.0);
}`,

  ball_water: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
uniform vec2 u_velocity;
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
  float angle = atan(v.y, v.x);
  vec2 uv = v / maxRadius;
  float speed = length(u_velocity);
  vec2 flowDir = normalize(u_velocity + vec2(0.001, 0.001));
  float flowInfluence = dot(normalize(v), -flowDir);
  float distortion = sin(angle * 8.0 + u_time * 3.0 + speed * 0.1) * 0.15;
  distortion += noise(uv * 6.0 + u_time * 0.5) * 0.1;
  distortion *= smoothstep(u_radius * 0.6, maxRadius, dist);
  distortion += flowInfluence * speed * 0.002;
  float deformedDist = dist + distortion * maxRadius * 0.2;
  float coreRadius = u_radius * 0.7;
  if(deformedDist < coreRadius) {
    return vec4(0.15, 0.45, 0.75, 1.0);
  }
  float shellStart = coreRadius;
  float shellEnd = maxRadius;
  float shellT = (deformedDist - shellStart) / (shellEnd - shellStart);
  if(shellT > 1.0) return vec4(0.0);
  float wave = sin(angle * 6.0 + u_time * 2.5) * 0.5 + 0.5;
  float flow = noise(uv * 4.0 + flowDir * u_time * 0.8);
  vec3 waterDeep = vec3(0.1, 0.4, 0.7);
  vec3 waterLight = vec3(0.3, 0.8, 1.0);
  vec3 shellColor = mix(waterDeep, waterLight, flow * 0.7 + wave * 0.3);
  float fresnel = pow(1.0 - shellT, 2.0);
  shellColor += fresnel * vec3(0.5, 0.7, 1.0);
  float alpha = (1.0 - shellT) * 0.85;
  float edge = smoothstep(shellEnd, shellEnd - 1.5, deformedDist);
  alpha *= edge;
  return vec4(shellColor, alpha);
}`,

  ball_amber: `
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
  float slowTime = u_time * 0.3;
  float bubble1 = smoothstep(0.7, 0.3, length(uv - vec2(sin(slowTime) * 0.3, cos(slowTime * 0.8) * 0.3)));
  float bubble2 = smoothstep(0.6, 0.2, length(uv + vec2(cos(slowTime * 1.2) * 0.4, sin(slowTime * 0.9) * 0.4)));
  float bubbles = (bubble1 * 0.3 + bubble2 * 0.2);
  float visc = noise(uv * 3.0 + slowTime * 0.2);
  float radial = 1.0 - dist / u_radius;
  vec3 amberDark = vec3(0.8, 0.5, 0.1);
  vec3 amberLight = vec3(1.0, 0.75, 0.3);
  vec3 color = mix(amberDark, amberLight, visc * 0.6 + radial * 0.4);
  color += bubbles * vec3(1.0, 0.9, 0.7);
  return vec4(color, 1.0);
}`,

  ball_cyan: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  float angle = atan(v.y, v.x);
  float radial = dist / u_radius;
  float reflection = abs(sin(angle * 4.0 + u_time * 2.0)) * (1.0 - radial);
  vec3 crystalBase = vec3(0.4, 0.9, 0.95);
  vec3 crystalHighlight = vec3(0.9, 1.0, 1.0);
  vec3 color = mix(crystalBase, crystalHighlight, reflection * 0.7);
  float centerGlow = smoothstep(0.5, 0.0, radial) * 0.4;
  color += centerGlow;
  return vec4(color, 0.9 + radial * 0.1);
}`,

  ball_mint: `
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
  float frost = noise(uv * 8.0 + u_time * 0.2);
  float crystals = abs(sin(uv.x * 15.0)) * abs(sin(uv.y * 15.0));
  float radial = 1.0 - dist / u_radius;
  vec3 mintDark = vec3(0.2, 0.8, 0.6);
  vec3 mintLight = vec3(0.7, 1.0, 0.9);
  vec3 color = mix(mintDark, mintLight, frost * 0.5 + radial * 0.5);
  color += crystals * 0.3 * radial;
  return vec4(color, 1.0);
}`,

  ball_rose: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  float angle = atan(v.y, v.x);
  float radial = dist / u_radius;
  float shimmer1 = sin(angle * 6.0 + u_time * 2.5 + radial * 3.0) * 0.5 + 0.5;
  float shimmer2 = sin(angle * 8.0 - u_time * 3.0) * 0.5 + 0.5;
  float iridescence = shimmer1 * 0.6 + shimmer2 * 0.4;
  vec3 roseBase = vec3(0.98, 0.44, 0.52);
  vec3 rosePearl = vec3(1.0, 0.85, 0.9);
  vec3 color = mix(roseBase, rosePearl, iridescence * (1.0 - radial * 0.5));
  float centerGlow = smoothstep(0.6, 0.0, radial) * 0.3;
  color += centerGlow;
  return vec4(color, 1.0);
}`,

  ball_steel: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
uniform vec2 u_velocity;
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
  vec2 flowDir = normalize(u_velocity + vec2(0.001, 0.001));
  float brushed = noise(uv * 10.0 + flowDir * u_time * 0.5);
  float angle = atan(v.y, v.x);
  float reflection = abs(sin(angle * 3.0 + u_time)) * 0.3;
  float radial = 1.0 - dist / u_radius;
  vec3 steelDark = vec3(0.4, 0.45, 0.5);
  vec3 steelLight = vec3(0.75, 0.8, 0.85);
  vec3 color = mix(steelDark, steelLight, brushed * 0.6 + reflection);
  color += radial * 0.2;
  return vec4(color, 1.0);
}`,

  ball_sunset: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  float angle = atan(v.y, v.x);
  float radial = dist / u_radius;
  float gradientShift = sin(u_time * 1.5) * 0.5 + 0.5;
  float colorPhase = (angle / 6.28318) + gradientShift;
  colorPhase = fract(colorPhase);
  vec3 orange = vec3(1.0, 0.45, 0.1);
  vec3 pink = vec3(1.0, 0.3, 0.5);
  vec3 purple = vec3(0.6, 0.2, 0.8);
  vec3 color;
  if(colorPhase < 0.33) {
    color = mix(orange, pink, colorPhase / 0.33);
  } else if(colorPhase < 0.66) {
    color = mix(pink, purple, (colorPhase - 0.33) / 0.33);
  } else {
    color = mix(purple, orange, (colorPhase - 0.66) / 0.34);
  }
  color *= (1.0 - radial * 0.3);
  return vec4(color, 1.0);
}`,

  ball_ice: `
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
  float crystals = abs(sin(uv.x * 20.0 + u_time * 0.5)) * abs(sin(uv.y * 20.0));
  float frost = noise(uv * 6.0);
  float radial = 1.0 - dist / u_radius;
  vec3 iceBase = vec3(0.7, 0.85, 0.95);
  vec3 iceHighlight = vec3(0.9, 0.95, 1.0);
  vec3 color = mix(iceBase, iceHighlight, frost * 0.5 + radial * 0.3);
  color += crystals * 0.4 * radial;
  float centerGlow = smoothstep(0.5, 0.0, dist / u_radius) * 0.3;
  color += centerGlow;
  return vec4(color, 0.95);
}`,

  // ============================================
  // RARE (8 billes)
  // ============================================
  ball_violet: `
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
  float radial = dist / u_radius;
  float arc1 = abs(sin((angle + u_time * 3.0) * 4.0));
  float arc2 = abs(sin((angle - u_time * 2.5) * 6.0));
  float arcs = max(arc1, arc2);
  arcs = smoothstep(0.7, 0.95, arcs) * (1.0 - radial * 0.5);
  vec3 violetBase = vec3(0.4, 0.2, 0.7);
  vec3 violetBright = vec3(0.8, 0.5, 1.0);
  vec3 color = mix(violetBase, violetBright, radial * 0.5);
  color += arcs * vec3(0.9, 0.7, 1.0);
  float pulse = sin(u_time * 4.0) * 0.15 + 0.85;
  color *= pulse;
  return vec4(color, 1.0);
}`,

  ball_lime: `
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
  float maxRadius = u_radius * 1.15;
  if(dist > maxRadius) return vec4(0.0);
  vec2 uv = v / maxRadius;
  float toxic = noise(uv * 5.0 + u_time * 0.8);
  float radial = dist / u_radius;
  vec3 limeCore = vec3(0.6, 0.9, 0.2);
  vec3 limeGlow = vec3(0.8, 1.0, 0.4);
  vec3 color = mix(limeCore, limeGlow, toxic * 0.6 + (1.0 - radial) * 0.4);
  if(dist > u_radius) {
    float auraT = (dist - u_radius) / (maxRadius - u_radius);
    float aura = (1.0 - auraT) * 0.6;
    return vec4(color * aura, aura);
  }
  return vec4(color, 1.0);
}`,

  ball_orchid: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  float angle = atan(v.y, v.x);
  float radial = dist / u_radius;
  float petalCount = 6.0;
  float petal = abs(sin(angle * petalCount + u_time * 1.5));
  petal = smoothstep(0.3, 0.8, petal) * (1.0 - radial * 0.7);
  vec3 orchidBase = vec3(0.7, 0.2, 0.8);
  vec3 orchidPetal = vec3(0.95, 0.6, 1.0);
  vec3 color = mix(orchidBase, orchidPetal, petal);
  float centerGlow = smoothstep(0.4, 0.0, radial) * 0.5;
  color += centerGlow * vec3(1.0, 0.9, 1.0);
  return vec4(color, 1.0);
}`,

  ball_glowblue: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  float maxRadius = u_radius * 1.3;
  if(dist > maxRadius) return vec4(0.0);
  float radial = dist / u_radius;
  float pulse = sin(u_time * 3.0) * 0.2 + 0.8;
  vec3 blueNeon = vec3(0.2, 0.6, 1.0) * pulse;
  if(dist > u_radius) {
    float glowT = (dist - u_radius) / (maxRadius - u_radius);
    float glow = (1.0 - glowT) * 0.7 * pulse;
    return vec4(blueNeon * glow, glow);
  }
  vec3 color = mix(blueNeon * 0.7, blueNeon, 1.0 - radial);
  return vec4(color, 1.0);
}`,

  ball_blood: `
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
  float veins = noise(uv * 8.0 + u_time * 0.3);
  veins = smoothstep(0.4, 0.6, veins);
  float radial = 1.0 - dist / u_radius;
  vec3 bloodDark = vec3(0.4, 0.0, 0.0);
  vec3 bloodBright = vec3(0.9, 0.1, 0.1);
  vec3 color = mix(bloodDark, bloodBright, radial * 0.7);
  color = mix(color, bloodDark * 0.5, veins * 0.6);
  return vec4(color, 1.0);
}`,

  ball_pearl: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  float angle = atan(v.y, v.x);
  float radial = dist / u_radius;
  float rainbow = sin((angle + u_time * 2.0) * 3.0 + radial * 5.0) * 0.5 + 0.5;
  vec3 pearlBase = vec3(0.95, 0.95, 0.98);
  vec3 rainbowTint = vec3(
    sin(rainbow * 6.28318) * 0.5 + 0.5,
    sin(rainbow * 6.28318 + 2.09) * 0.5 + 0.5,
    sin(rainbow * 6.28318 + 4.19) * 0.5 + 0.5
  );
  vec3 color = mix(pearlBase, rainbowTint, 0.3 * (1.0 - radial * 0.5));
  float centerGlow = smoothstep(0.5, 0.0, radial) * 0.4;
  color += centerGlow;
  return vec4(color, 1.0);
}`,

  ball_neonpink: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  float maxRadius = u_radius * 1.25;
  if(dist > maxRadius) return vec4(0.0);
  float radial = dist / u_radius;
  float pulse = sin(u_time * 4.0) * 0.15 + 0.85;
  vec3 pinkNeon = vec3(1.0, 0.42, 0.84) * pulse;
  if(dist > u_radius) {
    float glowT = (dist - u_radius) / (maxRadius - u_radius);
    float glow = (1.0 - glowT) * 0.6 * pulse;
    return vec4(pinkNeon * glow, glow);
  }
  vec3 color = mix(pinkNeon * 0.6, pinkNeon, 1.0 - radial);
  return vec4(color, 1.0);
}`,

  ball_deeppurple: `
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
  float nebula = noise(uv * 4.0 + u_time * 0.4);
  float stars = noise(uv * 20.0);
  stars = smoothstep(0.85, 0.95, stars) * 0.8;
  float radial = 1.0 - dist / u_radius;
  vec3 purpleDeep = vec3(0.3, 0.0, 0.5);
  vec3 purpleBright = vec3(0.6, 0.2, 0.9);
  vec3 color = mix(purpleDeep, purpleBright, nebula * 0.6 + radial * 0.4);
  color += stars * vec3(0.9, 0.8, 1.0);
  return vec4(color, 1.0);
}`,

  // ============================================
  // EPIC (6 billes)
  // ============================================
  ball_magnet: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
uniform vec2 u_velocity;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5);
}
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  float angle = atan(v.y, v.x);
  float radial = dist / u_radius;
  float fieldLines = abs(sin(angle * 8.0 + radial * 10.0 + u_time * 2.0));
  fieldLines = smoothstep(0.5, 0.8, fieldLines) * (1.0 - radial * 0.6);
  vec3 magnetBase = vec3(0.5, 0.5, 0.6);
  vec3 magnetField = vec3(0.8, 0.3, 0.1);
  vec3 color = mix(magnetBase, magnetField, fieldLines);
  float centerGlow = smoothstep(0.5, 0.0, radial) * 0.4;
  color += centerGlow * vec3(1.0, 0.6, 0.3);
  return vec4(color, 1.0);
}`,

  ball_spectrum: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  if(dist > u_radius) return vec4(0.0);
  float angle = atan(v.y, v.x);
  float radial = dist / u_radius;
  float hue = (angle / 6.28318) + u_time * 0.5;
  hue = fract(hue);
  vec3 color = vec3(
    sin(hue * 6.28318) * 0.5 + 0.5,
    sin(hue * 6.28318 + 2.09) * 0.5 + 0.5,
    sin(hue * 6.28318 + 4.19) * 0.5 + 0.5
  );
  color *= (1.0 - radial * 0.3);
  float centerGlow = smoothstep(0.4, 0.0, radial) * 0.5;
  color += centerGlow;
  return vec4(color, 1.0);
}`,

  ball_titan: `
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
  float angle = atan(v.y, v.x);
  float runes = abs(sin(angle * 12.0 + u_time * 0.5)) * abs(sin(dist * 15.0));
  runes = smoothstep(0.7, 0.9, runes);
  float radial = 1.0 - dist / u_radius;
  vec3 goldBase = vec3(0.8, 0.6, 0.2);
  vec3 goldBright = vec3(1.0, 0.85, 0.4);
  vec3 color = mix(goldBase, goldBright, radial * 0.5);
  color += runes * vec3(1.0, 0.9, 0.6) * 0.7;
  return vec4(color, 1.0);
}`,

  ball_void: `
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
  float stars = hash(floor(uv * 20.0 + u_time * 0.1));
  stars = smoothstep(0.95, 1.0, stars);
  float twinkle = sin(u_time * 8.0 + stars * 100.0) * 0.5 + 0.5;
  stars *= twinkle;
  float radial = 1.0 - dist / u_radius;
  vec3 voidBase = vec3(0.05, 0.05, 0.15);
  vec3 color = voidBase + stars * vec3(0.8, 0.8, 1.0) * 0.8;
  float edge = smoothstep(u_radius * 0.8, u_radius, dist);
  color = mix(color, vec3(0.2, 0.1, 0.3), edge * 0.5);
  return vec4(color, 1.0);
}`,

  ball_photon: `
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
vec4 main(vec2 fragCoord) {
  vec2 v = fragCoord - u_center;
  float dist = length(v);
  float maxRadius = u_radius * 1.4;
  if(dist > maxRadius) return vec4(0.0);
  float radial = dist / u_radius;
  float pulse = sin(u_time * 5.0) * 0.3 + 0.7;
  vec3 white = vec3(1.0, 1.0, 1.0) * pulse;
  if(dist > u_radius) {
    float glowT = (dist - u_radius) / (maxRadius - u_radius);
    float glow = (1.0 - glowT) * 0.9 * pulse;
    return vec4(white * glow, glow);
  }
  vec3 color = white * (0.8 + (1.0 - radial) * 0.2);
  return vec4(color, 1.0);
}`,

  ball_rift: `
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
  float portal = noise(uv * 6.0 + u_time * 0.8);
  float swirl = atan(v.y, v.x) + dist * 5.0 - u_time * 3.0;
  float spiral = sin(swirl * 4.0) * 0.5 + 0.5;
  float radial = 1.0 - dist / u_radius;
  vec3 riftPurple = vec3(0.5, 0.1, 0.8);
  vec3 riftCyan = vec3(0.1, 0.8, 0.9);
  vec3 color = mix(riftPurple, riftCyan, portal * 0.6 + spiral * 0.4);
  float centerVoid = smoothstep(0.3, 0.0, dist / u_radius);
  color = mix(color, vec3(0.0), centerVoid * 0.7);
  return vec4(color, 1.0);
}`,

  // ============================================
  // LEGENDARY (2 billes)
  // ============================================
  ball_legend_aurora: `
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
  float wave1 = noise(vec2(uv.x * 3.0, uv.y * 2.0 + u_time * 0.5));
  float wave2 = noise(vec2(uv.x * 4.0, uv.y * 3.0 - u_time * 0.4));
  float aurora = wave1 * 0.6 + wave2 * 0.4;
  float hue = aurora + u_time * 0.3;
  hue = fract(hue);
  vec3 color = vec3(
    sin(hue * 6.28318) * 0.5 + 0.5,
    sin(hue * 6.28318 + 2.09) * 0.5 + 0.5,
    sin(hue * 6.28318 + 4.19) * 0.5 + 0.5
  );
  float radial = 1.0 - dist / u_radius;
  color *= (0.7 + radial * 0.3);
  float shimmer = sin(aurora * 10.0 + u_time * 4.0) * 0.3 + 0.7;
  color *= shimmer;
  return vec4(color, 1.0);
}`,

  ball_extreme: `
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
  float maxRadius = u_radius * 1.3;
  if(dist > maxRadius) return vec4(0.0);
  vec2 uv = v / maxRadius;
  float angle = atan(v.y, v.x);
  float chaos1 = noise(uv * 8.0 + u_time * 1.5);
  float chaos2 = noise(uv * 12.0 - u_time * 2.0);
  float lightning = abs(sin(angle * 10.0 + u_time * 8.0 + chaos1 * 5.0));
  lightning = smoothstep(0.8, 0.95, lightning);
  float fire = sin(uv.y * 15.0 + u_time * 4.0) * 0.5 + 0.5;
  float radial = dist / u_radius;
  vec3 red = vec3(1.0, 0.2, 0.0);
  vec3 yellow = vec3(1.0, 0.9, 0.0);
  vec3 purple = vec3(0.8, 0.2, 1.0);
  vec3 cyan = vec3(0.0, 0.9, 1.0);
  vec3 fireColor = mix(red, yellow, fire);
  vec3 plasmaColor = mix(purple, cyan, chaos2);
  vec3 color = mix(fireColor, plasmaColor, chaos1);
  color += lightning * vec3(1.0, 1.0, 1.0);
  if(dist > u_radius) {
    float glowT = (dist - u_radius) / (maxRadius - u_radius);
    float glow = (1.0 - glowT) * 0.7;
    return vec4(color * glow, glow);
  }
  color *= (0.8 + (1.0 - radial) * 0.2);
  return vec4(color, 1.0);
}`,
};

export const getBallShader = (ballId: string): string => {
  'worklet';
  return BALL_SHADERS[ballId] ?? BALL_SHADERS.ball_classic;
};