// Particle Fragment Shader
precision highp float;
precision highp int;

uniform float uTime;
uniform float uMood;
uniform float uOpacity;

varying float vAlpha;
varying float vIndex;

// Vivid emotional colors
vec3 colorWaveHigh = vec3(0.0, 0.9, 1.0);
vec3 colorWaveLow = vec3(0.55, 0.36, 0.96);
vec3 colorPulse = vec3(1.0, 0.18, 0.34);
vec3 colorLife = vec3(0.0, 0.85, 0.63);

void main() {
  // Circular particle shape
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);

  if (dist > 0.5) discard;

  // Soft edges
  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

  // Color based on index (cycling through palette)
  float colorIndex = mod(vIndex, 4.0);
  vec3 color;

  if (colorIndex < 1.0) {
    color = colorWaveHigh;
  } else if (colorIndex < 2.0) {
    color = colorWaveLow;
  } else if (colorIndex < 3.0) {
    color = colorPulse;
  } else {
    color = colorLife;
  }

  // Mood affects color intensity
  color = mix(color * 0.5, color, uMood);

  // Gentle pulsing
  float pulse = sin(uTime * 1.2 + vIndex * 0.5) * 0.35 + 0.65;
  alpha *= pulse;

  // Soft glow effect
  gl_FragColor = vec4(color * 1.2, alpha * vAlpha * uOpacity * 0.7);
}
