import {
	ShaderMaterial,
	UniformsUtils
} from './three.module.js';
import { Pass, FullScreenQuad } from './Pass.module.js';

class ShaderPass extends Pass {
	constructor(shader, textureID) {
		super();

		this.textureID = textureID !== undefined ? textureID : 'tDiffuse';

		if (shader instanceof ShaderMaterial) {
			this.uniforms = shader.uniforms;
			this.material = shader;
		} else if (shader) {
			this.uniforms = UniformsUtils.clone(shader.uniforms);

			this.material = new ShaderMaterial({
				name: shader.name || '',
				defines: Object.assign({}, shader.defines),
				uniforms: this.uniforms,
				vertexShader: shader.vertexShader,
				fragmentShader: shader.fragmentShader
			});
		}

		this.fsQuad = new FullScreenQuad(this.material);
	}

	render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */) {
		// Ensure uniform exists before assignment
		if (this.uniforms && this.uniforms[this.textureID]) {
			this.uniforms[this.textureID].value = readBuffer.texture;
		}

		this.fsQuad.material = this.material;

		if (this.renderToScreen) {
			renderer.setRenderTarget(null);
		} else {
			renderer.setRenderTarget(writeBuffer);

			// Properly clear the buffer before rendering
			if (this.clear) renderer.clear(true, true, true);
		}

		this.fsQuad.render(renderer);
	}

	dispose() {
		if (this.material) this.material.dispose();
		if (this.fsQuad) this.fsQuad.dispose();
	}
}

export { ShaderPass };
