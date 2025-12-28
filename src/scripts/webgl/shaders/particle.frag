// Particle Fragment Shader
precision highp float;
precision highp int;

uniform float uTime;
uniform float uMood;
uniform float uOpacity;

varying float vAlpha;
varying float vIndex;

// Muted colors for subtlety
vec3 colorWaveHigh = vec3(0.0, 0.45, 0.55);
vec3 colorWaveLow = vec3(0.3, 0.12, 0.5);
vec3 colorPulse = vec3(0.55, 0.12, 0.25);
vec3 colorLife = vec3(0.04, 0.4, 0.3);

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

  // Pulsing - balanced intensity
  float pulse = sin(uTime * 1.8 + vIndex) * 0.4 + 0.5;
  alpha *= 0.4 + pulse * 0.4;

  gl_FragColor = vec4(color, alpha * vAlpha * uOpacity * 0.8);
}
