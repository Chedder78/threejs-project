/**
 * Full-screen textured quad shader
 */
const CopyShader = {
	name: 'CopyShader',

	uniforms: {
		'tDiffuse': { value: null },
		'opacity': { value: 1.0 }
	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}
	`,

	fragmentShader: /* glsl */`

		precision mediump float;

		uniform float opacity;
		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {
			vec4 texel = texture2D( tDiffuse, vUv );

			// Preserve the original alpha while applying opacity to RGB channels
			gl_FragColor = vec4(texel.rgb * opacity, texel.a);
		}
	`
};

export { CopyShader };
