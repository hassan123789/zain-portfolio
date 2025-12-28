// Wave Fragment Shader - Colors of the soul
precision highp float;
precision highp int;

uniform float uTime;
uniform float uMood;
uniform float uOpacity;

varying vec2 vUv;
varying float vElevation;
varying float vMood;

// Color palette
vec3 colorVoid = vec3(0.04, 0.04, 0.06);
vec3 colorWaveHigh = vec3(0.0, 0.83, 1.0);   // Cyan - manic
vec3 colorWaveLow = vec3(0.49, 0.23, 0.93);  // Purple - depressive
vec3 colorPulse = vec3(1.0, 0.2, 0.4);       // Pink - energy

void main() {
  // Base color shifts with mood
  vec3 baseColor = mix(colorWaveLow, colorWaveHigh, vMood);

  // Elevation affects brightness
  float brightness = smoothstep(-0.5, 0.5, vElevation);

  // Add pulse color at peaks
  vec3 peakColor = mix(baseColor, colorPulse, smoothstep(0.3, 0.6, vElevation));

  // Edge glow
  float edgeFade = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
  edgeFade *= smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);

  // Final color with elevation-based intensity
  vec3 finalColor = mix(colorVoid, peakColor, brightness * 0.7 + 0.3);

  // Add subtle gradient based on position
  finalColor += vec3(vUv.x * 0.05, 0.0, vUv.y * 0.05);

  // Opacity with edge fade
  float alpha = uOpacity * edgeFade * (0.6 + brightness * 0.4);

  gl_FragColor = vec4(finalColor, alpha);
}
