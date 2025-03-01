import {
	BufferGeometry,
	Float32BufferAttribute,
	OrthographicCamera,
	Mesh
} from './three.module.js';

class Pass {
	constructor() {
		this.isPass = true;

		// If set to true, the pass is processed by the composer
		this.enabled = true;

		// If set to true, the pass indicates to swap read and write buffer after rendering
		this.needsSwap = true;

		// If set to true, the pass clears its buffer before rendering
		this.clear = false;

		// If set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.
		this.renderToScreen = false;
	}

	setSize(width, height) {
		// Override in derived classes if needed
	}

	render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
		if (!renderer || !writeBuffer || !readBuffer) {
			console.error("Pass: Invalid buffers provided for rendering.");
			return;
		}
		console.error("THREE.Pass: .render() must be implemented in derived pass.");
	}

	dispose() {}
}

// Helper for passes that need to fill the viewport with a single quad.
const _camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

// Fullscreen Triangle Geometry (Optimized for Rendering)
class FullscreenTriangleGeometry extends BufferGeometry {
	constructor() {
		super();

		this.setAttribute(
			"position",
			new Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)
		);
		this.setAttribute("uv", new Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));
	}
}

const _geometry = new FullscreenTriangleGeometry();

class FullScreenQuad {
	constructor(material) {
		this._mesh = new Mesh(_geometry, material);
	}

	dispose() {
		if (this._mesh.material) {
			this._mesh.material.dispose();
		}
		this._mesh.geometry.dispose();
	}

	render(renderer) {
		if (!this._mesh.material) {
			console.error("FullScreenQuad: No material set for rendering.");
			return;
		}
		renderer.render(this._mesh, _camera);
	}

	get material() {
		return this._mesh.material;
	}

	set material(value) {
		this._mesh.material = value;
	}
}

export { Pass, FullScreenQuad };
