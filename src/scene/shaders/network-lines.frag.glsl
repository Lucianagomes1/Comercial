uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uColorD;

varying float vNoise;
varying vec3 vNormal;
varying float vReveal;

void main() {
  float angle = atan(vNormal.y, vNormal.x) + uTime * 0.05;
  float mixer = sin(angle * 2.0 + vNoise * 3.0) * 0.5 + 0.5;

  vec3 color = mix(uColorA, uColorB, mixer);
  color = mix(color, uColorC, 0.25);

  gl_FragColor = vec4(color, 0.22 * vReveal);
}
