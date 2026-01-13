// src/components/profile/shaders/collectionCardShaders.ts
export const CARD_PLATE_SHADER = `
uniform float2 u_size;
uniform float u_time;
uniform half3 u_accent;   // rgb 0..1
uniform half u_intensity; // 0..1

half hash21(float2 p) {
  p = fract(p * float2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

half noise(float2 p) {
  float2 i = floor(p);
  float2 f = fract(p);
  half a = hash21(i);
  half b = hash21(i + float2(1.0, 0.0));
  half c = hash21(i + float2(0.0, 1.0));
  half d = hash21(i + float2(1.0, 1.0));
  float2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

half lines(float2 uv, float density) {
  // brushed metal
  float v = sin((uv.y * density + uv.x * density * 0.15) * 6.28318);
  return half(v * 0.5 + 0.5);
}

half edgeMask(float2 uv, float r) {
  // 0 at edge, 1 inside
  float2 d = min(uv, 1.0 - uv);
  float m = min(d.x, d.y);
  return half(smoothstep(0.0, r, m));
}

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / u_size;

  // base dark metal gradient
  half3 baseA = half3(0.06, 0.04, 0.10);
  half3 baseB = half3(0.02, 0.01, 0.04);
  half3 base = mix(baseA, baseB, half(uv.y * 0.9 + uv.x * 0.25));

  // micro grain
  half n1 = noise(uv * 220.0);
  half n2 = noise(uv * 90.0 + float2(u_time * 0.08, 0.0));
  half grain = (n1 * 0.55 + n2 * 0.45) - 0.5;

  // brushed lines
  half br = lines(uv, 180.0);
  br = (br - 0.5) * 0.16;

  // vignette
  float2 c = uv - 0.5;
  half vig = half(1.0 - smoothstep(0.15, 0.85, length(c)));

  // inner bevel (edge dark)
  half em = edgeMask(uv, 0.055);
  half edge = 1.0 - em;

  // accent sweep
  half sweep = noise(uv * 6.0 + float2(u_time * 0.12, u_time * 0.05));
  sweep = smoothstep(0.55, 0.95, sweep) * u_intensity * 0.35;

  half3 col = base;
  col += half3(grain) * 0.06;
  col += half3(br);
  col += u_accent * sweep;
  col += u_accent * (vig * 0.10 * u_intensity);

  col *= half(1.0 - edge * 0.35);

  return half4(col, 1.0);
}
`;
