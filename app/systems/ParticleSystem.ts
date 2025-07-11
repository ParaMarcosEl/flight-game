// systems/ParticleSystem.ts
import * as THREE from 'three';
import { LinearSpline } from '../utils/LinearSpline';
import { fireVertexShader, fireFragmentShader } from '../shaders/FireShader';

export class ParticleSystem {
  _material: THREE.ShaderMaterial;
  _geometry: THREE.BufferGeometry;
  _points: THREE.Points;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _particles: any[] = [];
  _camera: THREE.Camera;
  _alphaSpline: LinearSpline<number>;
  _sizeSpline: LinearSpline<number>;
  _colourSpline: LinearSpline<THREE.Color>;
  _aircraftRef: React.RefObject<THREE.Object3D>;
  gdfsghk = 0;

  constructor(camera: THREE.Camera, texture: THREE.Texture, aircraftRef: React.RefObject<THREE.Object3D> ) {
    this._camera = camera;
    this._aircraftRef = aircraftRef;
    this._material = new THREE.ShaderMaterial({
      uniforms: {
        diffuseTexture: { value: texture },
        pointMultiplier: {
          value: window.innerHeight / (2.0 * Math.tan(0.5 * 60.0 * Math.PI / 180.0))
        }
      },
      vertexShader: fireVertexShader,
      fragmentShader: fireFragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      transparent: true,
      vertexColors: true,
    });

    this._geometry = new THREE.BufferGeometry();
    this._geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
    this._geometry.setAttribute('size', new THREE.Float32BufferAttribute([], 1));
    this._geometry.setAttribute('colour', new THREE.Float32BufferAttribute([], 4));
    this._geometry.setAttribute('angle', new THREE.Float32BufferAttribute([], 1));

    this._points = new THREE.Points(this._geometry, this._material);

    this._alphaSpline = new LinearSpline((t, a, b) => a + t * (b - a));
    this._alphaSpline.AddPoint(0.0, 0.0);
    this._alphaSpline.AddPoint(0.1, 1.0);
    this._alphaSpline.AddPoint(0.6, 1.0);
    this._alphaSpline.AddPoint(1.0, 0.0);

    this._colourSpline = new LinearSpline((t, a, b) => a.clone().lerp(b, t));
    this._colourSpline.AddPoint(0.0, new THREE.Color(0xffff80));
    this._colourSpline.AddPoint(1.0, new THREE.Color(0xff8080));

    this._sizeSpline = new LinearSpline((t, a, b) => a + t * (b - a));
    this._sizeSpline.AddPoint(0.0, 1.0);
    this._sizeSpline.AddPoint(0.5, 5.0);
    this._sizeSpline.AddPoint(1.0, 1.0);
  }

  get mesh() {
    return this._points;
  }

  _addParticles(timeElapsed: number) {
    this.gdfsghk += timeElapsed;
    const n = Math.floor(this.gdfsghk * 75.0);
    this.gdfsghk -= n / 75.0;

    for (let i = 0; i < n; i++) {
      const life = (Math.random() * 0.75 + 0.25) * 10.0;
      this._particles.push({
        position: this._aircraftRef.current?.position.clone().add(new THREE.Vector3(
          (Math.random() * 2 - 1) * 0.2,
          (Math.random() * 2 - 1) * 0.2,
          -1 // Always behind the ship
        )),
        size: (Math.random() * 0.5 + 0.5) * 4.0,
        colour: new THREE.Color(),
        alpha: 1.0,
        life,
        maxLife: life,
        rotation: Math.random() * Math.PI * 2,
        velocity: new THREE.Vector3(0, -15, 0)
      });
    }
  }

  _updateParticles(timeElapsed: number) {
    this._particles = this._particles.filter(p => p.life > 0);
    // eslint-disable-next-line prefer-const
    for (let p of this._particles) {
      const t = 1.0 - p.life / p.maxLife;
      p.rotation += timeElapsed * 0.5;
      p.alpha = this._alphaSpline.Get(t);
      p.currentSize = p.size * this._sizeSpline.Get(t);
      p.colour.copy(this._colourSpline.Get(t));
      p.position.add(p.velocity.clone().multiplyScalar(timeElapsed));
    }

    this._particles.sort((a, b) =>
      this._camera.position.distanceTo(b.position) -
      this._camera.position.distanceTo(a.position)
    );
  }

  _updateGeometry() {
    const positions: number[] = [];
    const sizes: number[] = [];
    const colours: number[] = [];
    const angles: number[] = [];

    for (const p of this._particles) {
      positions.push(p.position.x, p.position.y, p.position.z);
      sizes.push(p.currentSize);
      colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
      angles.push(p.rotation);
    }

    this._geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this._geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    this._geometry.setAttribute('colour', new THREE.Float32BufferAttribute(colours, 4));
    this._geometry.setAttribute('angle', new THREE.Float32BufferAttribute(angles, 1));

    this._geometry.attributes.position.needsUpdate = true;
    this._geometry.attributes.size.needsUpdate = true;
    this._geometry.attributes.colour.needsUpdate = true;
    this._geometry.attributes.angle.needsUpdate = true;
  }

  step(delta: number) {
    this._addParticles(delta);
    this._updateParticles(delta);
    this._updateGeometry();
  }
}
