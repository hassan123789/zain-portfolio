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
	private mood = 0.8;
	private targetMood = 0.8;
	private stormIntensity = 0.7; // 常に嵐
	private targetStormIntensity = 0.7;
	private scroll = 0;
	private isRunning = false;
	private isCalm = false; // 凪状態
	private mouseVelocity = 0;
	private scrollVelocity = 0;
	private activityLevel = 0; // 動きの激しさ

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

		// Initialize uniforms - 嵐から始まる
		this.waveUniforms = {
			uTime: { value: 0 },
			uMood: { value: 0.8 },
			uMouse: { value: new THREE.Vector2(0.5, 0.5) },
			uOpacity: { value: 0.6 },
			uStormIntensity: { value: 1.0 },  // 嵐の激しさ
		};

		this.particleUniforms = {
			uTime: { value: 0 },
			uMood: { value: 0.8 },
			uScroll: { value: 0 },
			uResolution: {
				value: new THREE.Vector2(window.innerWidth, window.innerHeight),
			},
			uOpacity: { value: 0.45 },
			uStormIntensity: { value: 1.0 },
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
		const newX = event.clientX / window.innerWidth;
		const newY = 1 - event.clientY / window.innerHeight;

		// マウスの速度を計算
		const dx = newX - this.targetMouse.x;
		const dy = newY - this.targetMouse.y;
		this.mouseVelocity = Math.sqrt(dx * dx + dy * dy) * 10;

		this.targetMouse.x = newX;
		this.targetMouse.y = newY;
	}

	private onScroll(): void {
		const newScroll = window.scrollY;

		// スクロール速度を計算
		this.scrollVelocity = Math.abs(newScroll - this.scroll) * 0.01;
		this.scroll = newScroll;
		this.particleUniforms.uScroll.value = this.scroll;

		// スクロール位置を計算
		const scrollProgress = this.scroll / (document.body.scrollHeight - window.innerHeight);

		// 最後のセクション（90%以降）で凪に
		if (scrollProgress > 0.88) {
			this.isCalm = true;
		} else {
			this.isCalm = false;
		}
	}

	public setMood(value: number): void {
		this.targetMood = Math.max(0, Math.min(1, value));
	}

	public setStormIntensity(value: number): void {
		this.targetStormIntensity = Math.max(0, Math.min(1, value));
	}

	public mount(): void {
		this.container.appendChild(this.renderer.domElement);
		this.isRunning = true;

		// 初期化時にスクロール位置をチェック - 凪の位置なら最初から凪
		this.scroll = window.scrollY;
		const scrollProgress = this.scroll / (document.body.scrollHeight - window.innerHeight);
		if (scrollProgress > 0.88) {
			this.isCalm = true;
			// 凪なら最初から凪の値にセット
			this.stormIntensity = 0.05;
			this.targetStormIntensity = 0.05;
			this.mood = 0.0;
			this.targetMood = 0.0;
			this.waveUniforms.uStormIntensity.value = 0.05;
			this.waveUniforms.uMood.value = 0.0;
			this.particleUniforms.uStormIntensity.value = 0.05;
			this.particleUniforms.uMood.value = 0.0;
		}

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

		// 動きの激しさを計算 - マウス速度とスクロール速度
		const targetActivity = Math.min(1, this.mouseVelocity + this.scrollVelocity);
		this.activityLevel += (targetActivity - this.activityLevel) * 0.1;

		// 速度は減衰
		this.mouseVelocity *= 0.95;
		this.scrollVelocity *= 0.9;

		if (this.isCalm) {
			// 凪 - 美しく澄んだ静寂
			this.targetStormIntensity = 0.05;
			this.targetMood = 0.0;
		} else {
			// 常に嵐 - 動きで激しさが増す
			// ベースは0.6、動きで最大1.0まで
			this.targetStormIntensity = 0.6 + this.activityLevel * 0.4;
			this.targetMood = 0.7 + this.activityLevel * 0.3;
		}

		// 凪への移行は速く（突然の悟り）、嵐への移行は遅め
		const moodLerpSpeed = this.isCalm ? 0.15 : 0.03;
		this.mood += (this.targetMood - this.mood) * moodLerpSpeed;

		const stormLerpSpeed = this.isCalm ? 0.12 : 0.04;
		this.stormIntensity += (this.targetStormIntensity - this.stormIntensity) * stormLerpSpeed;

		// Update wave uniforms
		this.waveUniforms.uTime.value = elapsed;
		this.waveUniforms.uMood.value = this.mood;
		this.waveUniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
		this.waveUniforms.uStormIntensity.value = this.stormIntensity;

		// Update particle uniforms
		this.particleUniforms.uTime.value = elapsed;
		this.particleUniforms.uMood.value = this.mood;
		this.particleUniforms.uStormIntensity.value = this.stormIntensity;

		// Camera - 嵐では揺れ、凪では静かに
		const cameraShake = this.stormIntensity * 0.12;
		this.camera.position.x = (this.mouse.x - 0.5) * 0.3 + Math.sin(elapsed * 2.5) * cameraShake;
		this.camera.position.y = (this.mouse.y - 0.5) * 0.2 + Math.cos(elapsed * 2) * cameraShake;
		this.camera.lookAt(0, 0, -2);

		this.renderer.render(this.scene, this.camera);
	}
}
