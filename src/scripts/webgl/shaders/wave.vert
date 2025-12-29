// Wave Vertex Shader - 嵐から凪へ / From Storm to Calm
precision highp float;
precision highp int;

attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform float uMood; // 0 = calm (凪), 1 = storm (嵐)
uniform float uStormIntensity; // 嵐の激しさ
uniform vec2 uMouse;

varying vec2 vUv;
varying float vElevation;
varying float vMood;

// Simplex noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vUv = uv;
  vMood = uMood;

  vec3 pos = position;

  // 嵐から凪へ - Storm to Calm
  float stormFactor = uStormIntensity;
  float calmFactor = 1.0 - stormFactor;

  // 嵐: 激しく混沌とした波
  // 凪: 青空が反射した鏡のような海 - 波一つ立たない
  float frequency = mix(0.15, 1.5, stormFactor);
  float amplitude = mix(0.008, 0.7, stormFactor);  // 凪ではほぼ平ら
  float speed = mix(0.02, 0.5, stormFactor);       // 凪ではとてもゆっくり

  // 嵐の層 - 複数の乱れた波
  float wave1 = snoise(vec3(pos.x * frequency, pos.y * frequency, uTime * speed)) * 1.0;
  float wave2 = snoise(vec3(pos.x * frequency * 1.7, pos.y * frequency * 1.7, uTime * speed * 1.5)) * 0.5 * stormFactor;
  float wave3 = snoise(vec3(pos.x * frequency * 3.0, pos.y * frequency * 3.0, uTime * speed * 2.5)) * 0.3 * stormFactor;

  // 嵐の時だけ追加の乱れ
  float chaos = snoise(vec3(pos.x * 4.0, pos.y * 4.0, uTime * 0.8)) * 0.25 * stormFactor * stormFactor;

  // マウスの影響 - 凪ではほとんど影響なし
  float distToMouse = length(uv - uMouse);
  float mouseInfluence = exp(-distToMouse * mix(5.0, 1.5, stormFactor)) * stormFactor;
  float ripple = sin(distToMouse * mix(6.0, 15.0, stormFactor) - uTime * mix(1.0, 4.0, stormFactor)) * mouseInfluence * mix(0.02, 0.6, stormFactor);

  float elevation = (wave1 + wave2 + wave3 + chaos) * amplitude + ripple;
  pos.z += elevation;

  vElevation = elevation;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
