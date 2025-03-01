class WebGL {
    
    static isWebGL2Available() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
        } catch (e) {
            return false;
        }
    }

    static isColorSpaceAvailable(colorSpace) {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            return gl && gl.getParameter(gl.COLOR_ENCODING) === colorSpace;
        } catch (e) {
            return false;
        }
    }

    static getWebGL2ErrorMessage() {
        return WebGL.getErrorMessage(2);
    }

    static getWebGLErrorMessage() {
        return WebGL.getErrorMessage(1);
    }

    static getErrorMessage(version) {
        const names = { 1: 'WebGL', 2: 'WebGL 2' };
        const contexts = { 1: window.WebGLRenderingContext, 2: window.WebGL2RenderingContext };
        const deviceType = contexts[version] ? 'graphics card' : 'browser';

        const message = `Your ${deviceType} does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">${names[version]}</a>.`;

        const element = document.createElement('div');
        element.id = 'webglmessage';
        element.style.cssText = `
            font-family: monospace;
            font-size: 13px;
            font-weight: normal;
            text-align: center;
            background: #fff;
            color: #000;
            padding: 1.5em;
            width: 400px;
            margin: 5em auto 0;
        `;
        element.innerHTML = message;

        return element;
    }

    static isWebGLAvailable() {
        if (!localStorage.getItem('webglDeprecatedWarning')) {
            console.warn('isWebGLAvailable() has been deprecated and will be removed in r178. Use isWebGL2Available() instead.');
            localStorage.setItem('webglDeprecatedWarning', 'true');
        }
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }
}

export default WebGL;
