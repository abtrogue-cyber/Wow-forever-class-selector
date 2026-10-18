import * as THREE from 'three'

// Silhouette material: near-black body with a fresnel rim in the class color.
// Rim values above 1.0 are HDR on purpose so Bloom picks up the edges.
// FLAT computes face normals from screen-space derivatives -> faceted "SD" look.
const vertexShader = /* glsl */ `
  #include <common>
  #include <fog_pars_vertex>
  varying vec3 vNormalV;
  varying vec3 vViewPosition;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vNormalV = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`

const fragmentShader = /* glsl */ `
  #include <common>
  #include <fog_pars_fragment>
  uniform vec3 uBase;
  uniform vec3 uRim;
  uniform float uRimStrength;
  uniform float uRimPower;
  uniform float uOpacity;
  varying vec3 vNormalV;
  varying vec3 vViewPosition;
  void main() {
    #ifdef FLAT
      vec3 n = normalize(cross(dFdx(vViewPosition), dFdy(vViewPosition)));
    #else
      vec3 n = normalize(vNormalV);
    #endif
    vec3 v = normalize(vViewPosition);
    float facing = abs(dot(n, v));
    float rim = pow(1.0 - facing, uRimPower);
    float top = clamp(n.y * 0.5 + 0.5, 0.0, 1.0) * 0.025;
    vec3 color = uBase + vec3(top) + uRim * rim * uRimStrength;
    gl_FragColor = vec4(color, uOpacity);
    #include <fog_fragment>
  }
`

export type SharedRim = {
  uRim: { value: THREE.Color }
  uRimStrength: { value: number }
}

// One shared uniform object -> every hero part shifts color together.
export function createSharedRim(color: string): SharedRim {
  return { uRim: { value: new THREE.Color(color) }, uRimStrength: { value: 1.2 } }
}

export function createRimMaterial(shared: SharedRim, flat: boolean, base = '#040509') {
  return new THREE.ShaderMaterial({
    defines: flat ? { FLAT: '' } : {},
    uniforms: {
      ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
      uBase: { value: new THREE.Color(base) },
      uRim: shared.uRim,
      uRimStrength: shared.uRimStrength,
      uRimPower: { value: 3.0 },
      uOpacity: { value: 1 },
    },
    vertexShader,
    fragmentShader,
    fog: true,
    transparent: true,
    side: THREE.DoubleSide,
  })
}
