// src/game/balls/waterBallShader.ts - ENVELOPPE LIQUIDE
export const WATER_BALL_SHADER = `
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
  float maxRadius = u_radius * 1.5;
  if(dist > maxRadius) {
    return vec4(0.0);
  }
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
    vec3 coreColor = vec3(0.15, 0.45, 0.75);
    return vec4(coreColor, 1.0);
  }
  float shellStart = coreRadius;
  float shellEnd = maxRadius;
  float shellT = (deformedDist - shellStart) / (shellEnd - shellStart);
  if(shellT > 1.0) {
    return vec4(0.0);
  }
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
}
`;