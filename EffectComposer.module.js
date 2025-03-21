import {
	Clock,
	HalfFloatType,
	NoBlending,
	Vector2,
	WebGLRenderTarget
} from './three.module.js';
import { CopyShader } from './CopyShader.module.js';
import { ShaderPass } from './ShaderPass.module.js';
import { ClearMaskPass, MaskPass } from './MaskPass.module.js';

class EffectComposer {
	constructor(renderer, renderTarget) {
		this.renderer = renderer;
		this._pixelRatio = renderer.getPixelRatio();

		const size = renderer.getSize(new Vector2());
		this._width = size.width;
		this._height = size.height;

		if (renderTarget === undefined) {
			renderTarget = new WebGLRenderTarget(
				this._width * this._pixelRatio,
				this._height * this._pixelRatio,
				{ type: HalfFloatType }
			);
			renderTarget.texture.name = 'EffectComposer.rt1';
		}

		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();
		this.renderTarget2.texture.name = 'EffectComposer.rt2';

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		this.renderToScreen = true;
		this.passes = [];

		this.copyPass = new ShaderPass(CopyShader);
		this.copyPass.material.blending = NoBlending;

		this.clock = new Clock();
	}

	swapBuffers() {
		[this.readBuffer, this.writeBuffer] = [this.writeBuffer, this.readBuffer];
	}

	addPass(pass) {
		this.passes.push(pass);
		pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
	}

	insertPass(pass, index) {
		this.passes.splice(index, 0, pass);
		pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
	}

	removePass(pass) {
		const index = this.passes.indexOf(pass);
		if (index !== -1) {
			this.passes.splice(index, 1);
		}
	}

	isLastEnabledPass(passIndex) {
		for (let i = passIndex + 1; i < this.passes.length; i++) {
			if (this.passes[i].enabled) return false;
		}
		return true;
	}

	render(deltaTime) {
		if (deltaTime === undefined) deltaTime = this.clock.getDelta();

		const currentRenderTarget = this.renderer.getRenderTarget();
		let maskActive = false;

		for (let i = 0; i < this.passes.length; i++) {
			const pass = this.passes[i];

			if (!pass.enabled) continue;

			pass.renderToScreen = this.renderToScreen && this.isLastEnabledPass(i);
			pass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive);

			if (pass.needsSwap) {
				if (maskActive) {
					const context = this.renderer.getContext();
					const stencil = this.renderer.state.buffers.stencil;

					stencil.setFunc(THREE.NotEqualStencilFunc, 1, 0xffffffff);
					this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime);
					stencil.setFunc(THREE.EqualStencilFunc, 1, 0xffffffff);
				}
				this.swapBuffers();
			}

			if (pass instanceof MaskPass) maskActive = true;
			if (pass instanceof ClearMaskPass) maskActive = false;
		}

		this.renderer.setRenderTarget(currentRenderTarget);
	}

	reset(renderTarget) {
		const size = this.renderer.getSize(new Vector2());
		this._pixelRatio = this.renderer.getPixelRatio();
		this._width = size.width;
		this._height = size.height;

		if (renderTarget === undefined) {
			renderTarget = this.renderTarget1.clone();
			renderTarget.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
		}

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();
		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;
	}

	setSize(width, height) {
		this._width = width;
		this._height = height;

		const effectiveWidth = this._width * this._pixelRatio;
		const effectiveHeight = this._height * this._pixelRatio;

		this.renderTarget1.setSize(effectiveWidth, effectiveHeight);
		this.renderTarget2.setSize(effectiveWidth, effectiveHeight);

		this.passes.forEach(pass => pass.setSize(effectiveWidth, effectiveHeight));
	}

	setPixelRatio(pixelRatio) {
		this._pixelRatio = pixelRatio;
		this.setSize(this._width, this._height);
	}

	dispose() {
		this.renderTarget1.dispose();
		this.renderTarget2.dispose();
		this.copyPass.dispose();
		this.passes.forEach(pass => {
			if (pass.dispose) pass.dispose();
		});
	}
}

export { EffectComposer };
