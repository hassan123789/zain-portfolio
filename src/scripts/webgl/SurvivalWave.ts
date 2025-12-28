// SurvivalWave - The visual representation of existence
import * as THREE from "three";
import particleFragmentShader from "./shaders/particle.frag?raw";
import particleVertexShader from "./shaders/particle.vert?raw";
import waveFragmentShader from "./shaders/wave.frag?raw";
import waveVertexShader from "./shaders/wave.vert?raw";

export interface SurvivalWaveOptions {
	container: HTMLElement;
	particleCount?: number;
}

export class SurvivalWave {
	private container: HTMLElement;
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private renderer: THREE.WebGLRenderer;
	private waveMesh: THREE.Mesh;
	private particles: THREE.Points;
	private clock: THREE.Clock;

	private mouse = { x: 0.5, y: 0.5 };
	private targetMouse = { x: 0.5, y: 0.5 };
	private mood = 0.5; // 0 = low, 1 = high
	private targetMood = 0.5;
	private scroll = 0;
	private isRunning = false;

	private waveUniforms: Record<string, THREE.IUniform>;
	private particleUniforms: Record<string, THREE.IUniform>;

	constructor(options: SurvivalWaveOptions) {
		this.container = options.container;
		this.clock = new THREE.Clock();

		// Scene
		this.scene = new THREE.Scene();

		// Camera
		this.camera = new THREE.PerspectiveCamera(
			60,
			window.innerWidth / window.innerHeight,
			0.1,
			100,
		);
		this.camera.position.z = 3;

		// Renderer
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
		});
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.setClearColor(0x000000, 0);

		// Initialize uniforms - balanced opacity
		this.waveUniforms = {
			uTime: { value: 0 },
			uMood: { value: 0.5 },
			uMouse: { value: new THREE.Vector2(0.5, 0.5) },
			uOpacity: { value: 0.6 },  // Balanced visibility
		};

		this.particleUniforms = {
			uTime: { value: 0 },
			uMood: { value: 0.5 },
			uScroll: { value: 0 },
			uResolution: {
				value: new THREE.Vector2(window.innerWidth, window.innerHeight),
			},
			uOpacity: { value: 0.45 },  // Balanced visibility
		};

		// Create meshes
		this.waveMesh = this.createWaveMesh();
		this.particles = this.createParticles(options.particleCount || 100);

		this.scene.add(this.waveMesh);
		this.scene.add(this.particles);

		// Events
		this.bindEvents();
	}

	private createWaveMesh(): THREE.Mesh {
		const geometry = new THREE.PlaneGeometry(8, 6, 128, 128);

		const material = new THREE.RawShaderMaterial({
			vertexShader: waveVertexShader,
			fragmentShader: waveFragmentShader,
			uniforms: this.waveUniforms,
			transparent: true,
			side: THREE.DoubleSide,
			depthWrite: false,
		});

		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.z = -2;
		mesh.rotation.x = -0.3;

		return mesh;
	}

	private createParticles(count: number): THREE.Points {
		const positions = new Float32Array(count * 3);
		const indices = new Float32Array(count);
		const randoms = new Float32Array(count);
		const sizes = new Float32Array(count);

		for (let i = 0; i < count; i++) {
			// Scattered positions
			positions[i * 3] = (Math.random() - 0.5) * 10;
			positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
			positions[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1;

			indices[i] = i;
			randoms[i] = Math.random();
			sizes[i] = 10 + Math.random() * 30;
		}

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute("aIndex", new THREE.BufferAttribute(indices, 1));
		geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));
		geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

		const material = new THREE.RawShaderMaterial({
			vertexShader: particleVertexShader,
			fragmentShader: particleFragmentShader,
			uniforms: this.particleUniforms,
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
		});

		return new THREE.Points(geometry, material);
	}

	private bindEvents(): void {
		window.addEventListener("resize", this.onResize.bind(this));
		window.addEventListener("mousemove", this.onMouseMove.bind(this));
		window.addEventListener("scroll", this.onScroll.bind(this));
	}

	private onResize(): void {
		const width = window.innerWidth;
		const height = window.innerHeight;

		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(width, height);
		this.particleUniforms.uResolution.value.set(width, height);
	}

	private onMouseMove(event: MouseEvent): void {
		this.targetMouse.x = event.clientX / window.innerWidth;
		this.targetMouse.y = 1 - event.clientY / window.innerHeight;
	}

	private onScroll(): void {
		this.scroll = window.scrollY;
		this.particleUniforms.uScroll.value = this.scroll;
	}

	public setMood(value: number): void {
		this.targetMood = Math.max(0, Math.min(1, value));
	}

	public mount(): void {
		this.container.appendChild(this.renderer.domElement);
		this.isRunning = true;
		this.animate();

		// IntersectionObserver for performance optimization
		// Stop rendering when not visible
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						this.resume();
					} else {
						this.pause();
					}
				});
			},
			{ threshold: 0 }
		);
		observer.observe(this.container);
	}

	public pause(): void {
		this.isRunning = false;
	}

	public resume(): void {
		if (!this.isRunning) {
			this.isRunning = true;
			this.animate();
		}
	}

	public unmount(): void {
		this.isRunning = false;
		if (this.renderer.domElement.parentNode) {
			this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
		}
		this.renderer.dispose();
	}

	private animate(): void {
		if (!this.isRunning) return;

		requestAnimationFrame(this.animate.bind(this));

		const elapsed = this.clock.getElapsedTime();

		// Smooth mouse lerping
		this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
		this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

		// Smooth mood lerping
		this.mood += (this.targetMood - this.mood) * 0.02;

		// Update wave uniforms
		this.waveUniforms.uTime.value = elapsed;
		this.waveUniforms.uMood.value = this.mood;
		this.waveUniforms.uMouse.value.set(this.mouse.x, this.mouse.y);

		// Update particle uniforms
		this.particleUniforms.uTime.value = elapsed;
		this.particleUniforms.uMood.value = this.mood;

		// Subtle camera movement
		this.camera.position.x = (this.mouse.x - 0.5) * 0.3;
		this.camera.position.y = (this.mouse.y - 0.5) * 0.2;
		this.camera.lookAt(0, 0, -2);

		this.renderer.render(this.scene, this.camera);
	}
}
