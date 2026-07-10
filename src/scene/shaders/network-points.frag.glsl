uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uColorD;

varying float vNoise;
varying vec3 vNormal;

void main() {
  vec2 coord = gl_PointCoord - 0.5;
  float dist = length(coord);
  if (dist > 0.5) discard;

  float glow = smoothstep(0.5, 0.0, dist);

  float angle = atan(vNormal.y, vNormal.x) + uTime * 0.05;
  float mixer = sin(angle * 2.0 + vNoise * 3.0) * 0.5 + 0.5;
  float mixer2 = cos(angle * 1.3 - uTime * 0.08) * 0.5 + 0.5;

  vec3 color = mix(uColorA, uColorB, mixer);
  color = mix(color, uColorC, mixer2 * 0.6);
  color = mix(color, uColorD, glow * 0.35);

  gl_FragColor = vec4(color, glow);
}
