// Particle Fragment Shader - 嵐の塵、凪の光
precision highp float;
precision highp int;

uniform float uTime;
uniform float uMood;
uniform float uOpacity;
uniform float uStormIntensity;

varying float vAlpha;
varying float vIndex;

// 嵐の色
vec3 stormCyan = vec3(0.0, 0.8, 1.0);
vec3 stormPurple = vec3(0.6, 0.25, 0.95);
vec3 stormPink = vec3(1.0, 0.2, 0.4);
vec3 stormYellow = vec3(1.0, 0.8, 0.2);

// 凪の色 - 晴れ渡った光
vec3 calmLight = vec3(0.75, 0.95, 1.0);
vec3 calmMint = vec3(0.65, 0.92, 0.88);

void main() {
  float storm = uStormIntensity;
  float calm = 1.0 - storm;

  // Circular particle shape
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);

  if (dist > 0.5) discard;

  // Soft edges
  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

  // 嵐の色（激しく多彩）
  float colorIndex = mod(vIndex, 4.0);
  vec3 stormColor;
  if (colorIndex < 1.0) {
    stormColor = stormCyan;
  } else if (colorIndex < 2.0) {
    stormColor = stormPurple;
  } else if (colorIndex < 3.0) {
    stormColor = stormPink;
  } else {
    stormColor = stormYellow;
  }

  // 凪の色（澄んだ明るい光）
  vec3 calmColor = mix(calmMint, calmLight, sin(vIndex * 0.3) * 0.5 + 0.5);

  // ブレンド
  vec3 color = mix(calmColor, stormColor, storm);

  // 嵐: 激しいパルス / 凪: 穏やかな呼吸
  float pulseSpeed = mix(0.5, 1.5, storm);
  float pulseAmount = mix(0.15, 0.4, storm);
  float pulse = sin(uTime * pulseSpeed + vIndex * 0.5) * pulseAmount + (1.0 - pulseAmount);
  alpha *= pulse;

  // 凪では柔らかく輝く
  float glowBoost = mix(1.3, 1.0, storm);

  // 凪では穏やかに漂う光の粒
  float calmAlpha = mix(0.5, 0.8, storm);

  gl_FragColor = vec4(color * glowBoost, alpha * vAlpha * uOpacity * calmAlpha);
}
