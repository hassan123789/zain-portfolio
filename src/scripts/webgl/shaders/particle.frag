// Particle Fragment Shader
precision highp float;
precision highp int;

uniform float uTime;
uniform float uMood;
uniform float uOpacity;

varying float vAlpha;
varying float vIndex;

vec3 colorWaveHigh = vec3(0.0, 0.83, 1.0);
vec3 colorWaveLow = vec3(0.49, 0.23, 0.93);
vec3 colorPulse = vec3(1.0, 0.2, 0.4);
vec3 colorLife = vec3(0.06, 0.73, 0.51);

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

  // Pulsing
  float pulse = sin(uTime * 2.0 + vIndex) * 0.5 + 0.5;
  alpha *= 0.5 + pulse * 0.5;

  gl_FragColor = vec4(color, alpha * vAlpha * uOpacity);
}
