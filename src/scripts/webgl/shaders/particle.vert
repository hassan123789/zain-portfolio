// Particle Vertex Shader - Scattered thoughts, floating ideas
precision highp float;
precision highp int;

attribute vec3 position;
attribute float aIndex;
attribute float aRandom;
attribute float aSize;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform float uMood;
uniform float uScroll;
uniform vec2 uResolution;

varying float vAlpha;
varying float vIndex;

void main() {
  vIndex = aIndex;

  vec3 pos = position;

  // Floating motion based on index
  float floatSpeed = 0.3 + aRandom * 0.4;
  float floatOffset = aIndex * 0.5;

  pos.y += sin(uTime * floatSpeed + floatOffset) * 0.5;
  pos.x += cos(uTime * floatSpeed * 0.7 + floatOffset) * 0.3;
  pos.z += sin(uTime * floatSpeed * 0.5 + floatOffset * 2.0) * 0.2;

  // Scroll effect
  pos.y -= uScroll * 0.001;

  // Mood affects spread
  float spread = mix(0.5, 1.5, uMood);
  pos.xyz *= spread;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  // Size with perspective
  float size = aSize * (300.0 / -mvPosition.z);
  size *= mix(0.5, 1.0, uMood);

  gl_PointSize = size;
  gl_Position = projectionMatrix * mvPosition;

  // Alpha based on depth
  vAlpha = smoothstep(0.0, 1.0, 1.0 - (-mvPosition.z / 10.0));
}
