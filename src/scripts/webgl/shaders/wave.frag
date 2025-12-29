// Wave Fragment Shader - 嵐から凪へ / Storm to Calm
precision highp float;
precision highp int;

uniform float uTime;
uniform float uMood;
uniform float uOpacity;
uniform float uStormIntensity;

varying vec2 vUv;
varying float vElevation;
varying float vMood;

// 嵐の色 - 激しく混沌とした
vec3 stormDark = vec3(0.05, 0.02, 0.08);
vec3 stormCyan = vec3(0.0, 0.7, 0.9);
vec3 stormPurple = vec3(0.6, 0.2, 0.9);
vec3 stormPink = vec3(1.0, 0.15, 0.35);

// 凪の色 - 嵐が過ぎて、世界がふっと明るくなる（でも読みやすく）
vec3 openSky = vec3(0.35, 0.55, 0.7);      // 落ち着いた空色
vec3 clearLight = vec3(0.5, 0.65, 0.75);   // 柔らかい光
vec3 softMint = vec3(0.3, 0.5, 0.55);      // 落ち着いたミント
vec3 breathe = vec3(0.4, 0.6, 0.7);        // 深呼吸できる色

void main() {
  float storm = uStormIntensity;
  float calm = 1.0 - storm;

  // 嵐の色合い
  vec3 stormBase = mix(stormPurple, stormCyan, vMood);
  vec3 stormPeak = mix(stormBase, stormPink, smoothstep(0.3, 0.7, vElevation));

// 凪の色合い - パーっと晴れた、澄んだ世界
  float spread = smoothstep(0.0, 1.0, vUv.y);
  vec3 calmBase = mix(softMint, openSky, spread * 0.6 + 0.3);

  // 中央が最も明るい - 開放感
  float centerGlow = 1.0 - length(vUv - 0.5) * 1.2;
  centerGlow = max(0.0, centerGlow);
  calmBase = mix(calmBase, clearLight, centerGlow * 0.5);

  // ほんの少しの揺らぎ
  float gentle = smoothstep(-0.01, 0.01, vElevation);
  vec3 calmGlow = mix(calmBase, breathe, gentle * 0.25);

  // 嵐と凪をブレンド
  vec3 baseColor = mix(calmGlow, stormPeak, storm);

  // Elevation affects brightness
  float brightness = smoothstep(-0.5, 0.5, vElevation);

  // Edge glow - 凪ではソフトなフェード
  float edgeFade = smoothstep(0.0, mix(0.4, 0.3, storm), vUv.x) * smoothstep(1.0, mix(0.6, 0.7, storm), vUv.x);
  edgeFade *= smoothstep(0.0, mix(0.4, 0.3, storm), vUv.y) * smoothstep(1.0, mix(0.6, 0.7, storm), vUv.y);

// 嵐: 激しいコントラスト / 凪: ふっと明るくなる（でも控えめに）
  vec3 darkBase = mix(softMint * 0.4, stormDark, storm);
  vec3 finalColor = mix(darkBase, baseColor, brightness * mix(0.35, 0.8, storm) + mix(0.45, 0.15, storm));

  // 凪の時は全体が澄んで明るい（控えめに）
  finalColor += clearLight * calm * 0.1;

  // 凪ではより見える、でも文字の邪魔をしない透明度
  float alpha = uOpacity * edgeFade * (mix(0.6, 0.35, storm) + brightness * mix(0.15, 0.45, storm));

  gl_FragColor = vec4(finalColor, alpha);
}
