import { Color } from './three.module.js';
import { Pass } from './Pass.module.js'; // ✅ Corrected import path

class RenderPass extends Pass {
	constructor(scene, camera, overrideMaterial = null, clearColor = null, clearAlpha = null) {
		super();

		this.scene = scene;
		this.camera = camera;
		this.overrideMaterial = overrideMaterial;
		this.clearColor = clearColor;
		this.clearAlpha = clearAlpha;

		this.clear = true;
		this.clearDepth = false;
		this.needsSwap = false;

		this._oldClearColor = new Color();
	}

	render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */) {
		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		let oldClearAlpha = renderer.getClearAlpha();
		let oldOverrideMaterial;

		// Apply override material
		if (this.overrideMaterial !== null) {
			oldOverrideMaterial = this.scene.overrideMaterial;
			this.scene.overrideMaterial = this.overrideMaterial;
		}

		// Handle clear color
		if (this.clearColor !== null) {
			renderer.getClearColor(this._oldClearColor);
			oldClearAlpha = renderer.getClearAlpha();
			renderer.setClearColor(this.clearColor, this.clearAlpha ?? oldClearAlpha);
		}

		// Handle clear alpha
		if (this.clearAlpha !== null) {
			oldClearAlpha = renderer.getClearAlpha();
			renderer.setClearAlpha(this.clearAlpha);
		}

		// Handle depth clearing
		if (this.clearDepth) {
			renderer.clear(true, false, false);
		}

		// Set the correct render target
		renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);

		// Clear the buffer before rendering
		if (this.clear === true) {
			renderer.clear(true, true, true); // Clear color, depth, and stencil
		}

		// Render the scene
		renderer.render(this.scene, this.camera);

		// Restore previous settings
		if (this.clearColor !== null) {
			renderer.setClearColor(this._oldClearColor, oldClearAlpha);
		}

		if (this.clearAlpha !== null) {
			renderer.setClearAlpha(oldClearAlpha);
		}

		if (this.overrideMaterial !== null) {
			this.scene.overrideMaterial = oldOverrideMaterial;
		}

		renderer.autoClear = oldAutoClear;
	}
}

export { RenderPass };
