uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uColorD;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vNoise;

void main() {
  vec3 viewDir = normalize(vViewPosition);
  vec3 normal = normalize(vNormal);

  float fresnel = pow(1.0 - clamp(dot(viewDir, normal), 0.0, 1.0), 3.2);

  float angle = atan(normal.y, normal.x) + uTime * 0.05;
  float mixer = sin(angle * 2.0 + vNoise * 3.0) * 0.5 + 0.5;
  float mixer2 = cos(angle * 1.3 - uTime * 0.08) * 0.5 + 0.5;

  vec3 iridescence = mix(uColorA, uColorB, mixer);
  iridescence = mix(iridescence, uColorC, mixer2 * 0.6);
  iridescence = mix(iridescence, uColorD, fresnel * 0.5);

  vec3 lightDir = normalize(vec3(0.4, 0.6, 0.8));
  vec3 lightDir2 = normalize(vec3(-0.6, -0.3, 0.5));
  float spec = pow(max(dot(reflect(-lightDir, normal), viewDir), 0.0), 60.0);
  float spec2 = pow(max(dot(reflect(-lightDir2, normal), viewDir), 0.0), 24.0);

  // chrome base: mostly a dark "studio reflection" gray, iridescence only
  // bleeding in at the fresnel rim, like polished metal catching colored light
  vec3 chromeBase = vec3(0.05, 0.055, 0.065) + vec3(0.09, 0.095, 0.11) * (dot(normal, lightDir) * 0.5 + 0.5);
  vec3 color = mix(chromeBase, iridescence, fresnel);
  color += spec * 1.1 + spec2 * 0.4 * iridescence;

  gl_FragColor = vec4(color, 1.0);
}
