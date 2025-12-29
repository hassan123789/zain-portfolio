// Particle Vertex Shader - 嵐の中の塵、凪の中の光
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
uniform float uStormIntensity;
uniform vec2 uResolution;

varying float vAlpha;
varying float vIndex;

void main() {
  vIndex = aIndex;

  vec3 pos = position;

  // 嵐では激しく、凪では穏やかに漂う
  float floatSpeed = mix(0.1, 0.6, uStormIntensity) + aRandom * 0.3;
  float floatOffset = aIndex * 0.5;
  float turbulence = mix(0.1, 1.0, uStormIntensity);

  pos.y += sin(uTime * floatSpeed + floatOffset) * 0.5 * turbulence;
  pos.x += cos(uTime * floatSpeed * 0.7 + floatOffset) * 0.3 * turbulence;
  pos.z += sin(uTime * floatSpeed * 0.5 + floatOffset * 2.0) * 0.2 * turbulence;

  // 嵐の時は追加の乱れ
  pos.x += sin(uTime * 2.0 + aRandom * 10.0) * 0.3 * uStormIntensity;
  pos.y += cos(uTime * 1.5 + aRandom * 8.0) * 0.2 * uStormIntensity;

  // Scroll effect
  pos.y -= uScroll * 0.001;

  // 嵐では広がり、凪では落ち着く
  float spread = mix(0.7, 1.3, uStormIntensity);
  pos.xyz *= spread;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  // 凪ではパーティクルが小さく、嵐では大きく
  float size = aSize * (300.0 / -mvPosition.z);
  size *= mix(0.3, 1.0, uStormIntensity);

  gl_PointSize = size;
  gl_Position = projectionMatrix * mvPosition;

  // 凪では透明度が下がる（静寂）
  vAlpha = smoothstep(0.0, 1.0, 1.0 - (-mvPosition.z / 10.0)) * mix(0.3, 1.0, uStormIntensity);
}
