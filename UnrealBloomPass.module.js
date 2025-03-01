import {
	AdditiveBlending,
	Color,
	HalfFloatType,
	MeshBasicMaterial,
	ShaderMaterial,
	UniformsUtils,
	Vector2,
	Vector3,
	WebGLRenderTarget
} from './three.module.js';
import { Pass, FullScreenQuad } from './Pass.module.js';
import { CopyShader } from './CopyShader.module.js';
import { LuminosityHighPassShader } from './LuminosityHighPassShader.module.js';

class UnrealBloomPass extends Pass {
	constructor(resolution, strength = 1, radius = 0.1, threshold = 0.8) {
		super();

		this.strength = strength;
		this.radius = radius;
		this.threshold = threshold;
		this.resolution = resolution ? new Vector2(resolution.x, resolution.y) : new Vector2(window.innerWidth / 2, window.innerHeight / 2);

		this.clearColor = new Color(0, 0, 0);

		// Initialize render targets
		this.renderTargetsHorizontal = [];
		this.renderTargetsVertical = [];
		this.nMips = 5;
		let resx = Math.round(this.resolution.x / 2);
		let resy = Math.round(this.resolution.y / 2);

		this.renderTargetBright = new WebGLRenderTarget(resx, resy, { type: HalfFloatType });
		this.renderTargetBright.texture.name = 'UnrealBloomPass.bright';
		this.renderTargetBright.texture.generateMipmaps = false;

		for (let i = 0; i < this.nMips; i++) {
			const renderTargetHorizontal = new WebGLRenderTarget(resx, resy, { type: HalfFloatType });
			renderTargetHorizontal.texture.name = `UnrealBloomPass.h${i}`;
			renderTargetHorizontal.texture.generateMipmaps = false;
			this.renderTargetsHorizontal.push(renderTargetHorizontal);

			const renderTargetVertical = new WebGLRenderTarget(resx, resy, { type: HalfFloatType });
			renderTargetVertical.texture.name = `UnrealBloomPass.v${i}`;
			renderTargetVertical.texture.generateMipmaps = false;
			this.renderTargetsVertical.push(renderTargetVertical);

			resx = Math.round(resx / 2);
			resy = Math.round(resy / 2);
		}

		// Luminosity high pass material
		const highPassShader = LuminosityHighPassShader;
		this.highPassUniforms = UniformsUtils.clone(highPassShader.uniforms);
		this.highPassUniforms['luminosityThreshold'].value = threshold;
		this.highPassUniforms['smoothWidth'].value = 0.01;
		this.materialHighPassFilter = new ShaderMaterial({
			uniforms: this.highPassUniforms,
			vertexShader: highPassShader.vertexShader,
			fragmentShader: highPassShader.fragmentShader
		});

		// Gaussian blur materials
		this.separableBlurMaterials = [];
		const kernelSizeArray = [3, 5, 7, 9, 11];
		resx = Math.round(this.resolution.x / 2);
		resy = Math.round(this.resolution.y / 2);

		for (let i = 0; i < this.nMips; i++) {
			this.separableBlurMaterials.push(this.getSeparableBlurMaterial(kernelSizeArray[i]));
			this.separableBlurMaterials[i].uniforms['invSize'].value = new Vector2(1 / resx, 1 / resy);
			resx = Math.round(resx / 2);
			resy = Math.round(resy / 2);
		}

		// Composite material
		this.compositeMaterial = this.getCompositeMaterial(this.nMips);
		this.compositeMaterial.uniforms['bloomStrength'].value = this.strength;
		this.compositeMaterial.uniforms['bloomRadius'].value = this.radius;

		// Blend material
		const copyShader = CopyShader;
		this.copyUniforms = UniformsUtils.clone(copyShader.uniforms);
		this.blendMaterial = new ShaderMaterial({
			uniforms: this.copyUniforms,
			vertexShader: copyShader.vertexShader,
			fragmentShader: copyShader.fragmentShader,
			blending: AdditiveBlending,
			depthTest: false,
			depthWrite: false,
			transparent: true
		});

		this.enabled = true;
		this.needsSwap = false;
		this._oldClearColor = new Color();
		this.oldClearAlpha = 1;
		this.basic = new MeshBasicMaterial();
		this.fsQuad = new FullScreenQuad(null);
	}

	dispose() {
		this.renderTargetBright.dispose();
		for (let i = 0; i < this.renderTargetsHorizontal.length; i++) {
			this.renderTargetsHorizontal[i].dispose();
			this.renderTargetsVertical[i].dispose();
		}
		for (let i = 0; i < this.separableBlurMaterials.length; i++) {
			this.separableBlurMaterials[i].dispose();
		}
		this.compositeMaterial.dispose();
		this.blendMaterial.dispose();
		this.basic.dispose();
		this.fsQuad.dispose();
	}

	render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
		if (!this.enabled) return;

		renderer.getClearColor(this._oldClearColor);
		this.oldClearAlpha = renderer.getClearAlpha();
		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;
		renderer.setClearColor(this.clearColor, 0);

		// High-pass filter
		this.highPassUniforms['tDiffuse'].value = readBuffer.texture;
		this.fsQuad.material = this.materialHighPassFilter;
		renderer.setRenderTarget(this.renderTargetBright);
		renderer.clear();
		this.fsQuad.render(renderer);

		// Blur processing
		let inputRenderTarget = this.renderTargetBright;
		for (let i = 0; i < this.nMips; i++) {
			this.fsQuad.material = this.separableBlurMaterials[i];
			this.separableBlurMaterials[i].uniforms['colorTexture'].value = inputRenderTarget.texture;
			renderer.setRenderTarget(this.renderTargetsHorizontal[i]);
			renderer.clear();
			this.fsQuad.render(renderer);
			inputRenderTarget = this.renderTargetsVertical[i];
		}

		// Restore settings
		renderer.setClearColor(this._oldClearColor, this.oldClearAlpha);
		renderer.autoClear = oldAutoClear;
	}
}

export { UnrealBloomPass };
