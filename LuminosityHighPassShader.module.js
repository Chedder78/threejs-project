import { Color } from './three.module.js';

/**
 * Luminosity High-Pass Shader
 * Applies a high-pass filter based on pixel luminosity.
 * Reference: http://en.wikipedia.org/wiki/Luminosity
 */

const LuminosityHighPassShader = {

	name: 'LuminosityHighPassShader',

	uniforms: {
		'tDiffuse': { value: null },
		'luminosityThreshold': { value: 0.5 }, // Default threshold
		'smoothWidth': { value: 0.1 }, // Default smooth blending width
		'defaultColor': { value: new Color(0x000000) },
		'defaultOpacity': { value: 0.0 }
	},

	vertexShader: /* glsl */`
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`,

	fragmentShader: /* glsl */`
		precision mediump float;

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		// Compute luminance using standard coefficients
		float luminance(vec3 color) {
			return dot(color, vec3(0.299, 0.587, 0.114));
		}

		void main() {
			vec4 texel = texture2D(tDiffuse, vUv);

			// Compute pixel luminance
			float v = luminance(texel.rgb);

			// Smoothly transition between threshold and the full effect
			float alpha = smoothstep(luminosityThreshold - smoothWidth, luminosityThreshold + smoothWidth, v);

			// Blend between defaultColor and original texture
			vec4 outputColor = vec4(defaultColor.rgb, defaultOpacity);
			gl_FragColor = mix(outputColor, texel, alpha);
		}
	`
};

export { LuminosityHighPassShader };
