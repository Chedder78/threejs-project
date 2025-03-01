import {
	EventDispatcher,
	MOUSE,
	Quaternion,
	Spherical,
	TOUCH,
	Vector2,
	Vector3,
	Plane,
	Ray,
	MathUtils
} from './three.module.js';

// OrbitControls - Camera movement controls for Three.js
//    Orbit - left mouse / one-finger touch
//    Zoom - middle mouse / scroll / two-finger pinch
//    Pan - right mouse / two-finger drag

const _changeEvent = { type: 'change' };
const _startEvent = { type: 'start' };
const _endEvent = { type: 'end' };
const _ray = new Ray();
const _plane = new Plane();
const _TILT_LIMIT = Math.cos(70 * MathUtils.DEG2RAD);
const _v = new Vector3();
const _twoPI = 2 * Math.PI;

const _STATE = {
	NONE: -1,
	ROTATE: 0,
	DOLLY: 1,
	PAN: 2,
	TOUCH_ROTATE: 3,
	TOUCH_PAN: 4,
	TOUCH_DOLLY_PAN: 5,
	TOUCH_DOLLY_ROTATE: 6
};

const _EPS = 0.000001;

class OrbitControls extends EventDispatcher {
	constructor(object, domElement = null) {
		super();

		this.object = object;
		this.domElement = domElement || document;

		this.state = _STATE.NONE;

		// Enable/disable controls
		this.enabled = true;

		// Orbit settings
		this.target = new Vector3();
		this.cursor = new Vector3();

		// Zoom & Distance limits
		this.minDistance = 0;
		this.maxDistance = Infinity;
		this.minZoom = 0;
		this.maxZoom = Infinity;

		// Orbit angle limits
		this.minPolarAngle = 0;
		this.maxPolarAngle = Math.PI;
		this.minAzimuthAngle = -Infinity;
		this.maxAzimuthAngle = Infinity;

		// Controls behavior
		this.enableDamping = false;
		this.dampingFactor = 0.05;
		this.enableZoom = true;
		this.zoomSpeed = 1.0;
		this.enableRotate = true;
		this.rotateSpeed = 1.0;
		this.enablePan = true;
		this.panSpeed = 1.0;
		this.autoRotate = false;
		this.autoRotateSpeed = 2.0;

		// Input settings
		this.keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' };
		this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };
		this.touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };

		// Internal variables
		this._lastPosition = new Vector3();
		this._lastQuaternion = new Quaternion();
		this._quat = new Quaternion().setFromUnitVectors(object.up, new Vector3(0, 1, 0));
		this._quatInverse = this._quat.clone().invert();
		this._spherical = new Spherical();
		this._sphericalDelta = new Spherical();
		this._scale = 1;
		this._panOffset = new Vector3();
		this._rotateStart = new Vector2();
		this._rotateEnd = new Vector2();
		this._rotateDelta = new Vector2();
		this._panStart = new Vector2();
		this._panEnd = new Vector2();
		this._panDelta = new Vector2();
		this._dollyStart = new Vector2();
		this._dollyEnd = new Vector2();
		this._dollyDelta = new Vector2();
		this._mouse = new Vector2();
		this._pointers = [];
		this._pointerPositions = {};

		// Event listeners
		this._onPointerDown = this._onPointerDown.bind(this);
		this._onPointerMove = this._onPointerMove.bind(this);
		this._onPointerUp = this._onPointerUp.bind(this);
		this._onMouseWheel = this._onMouseWheel.bind(this);
		this._onKeyDown = this._onKeyDown.bind(this);

		if (this.domElement !== null) {
			this.connect();
		}

		this.startAutoUpdate();
	}

	connect() {
		this.domElement.addEventListener('pointerdown', this._onPointerDown);
		this.domElement.addEventListener('wheel', this._onMouseWheel, { passive: false });
		this.domElement.addEventListener('keydown', this._onKeyDown);
		this.domElement.style.touchAction = 'none';
	}

	disconnect() {
		this.domElement.removeEventListener('pointerdown', this._onPointerDown);
		this.domElement.removeEventListener('pointermove', this._onPointerMove);
		this.domElement.removeEventListener('pointerup', this._onPointerUp);
		this.domElement.removeEventListener('wheel', this._onMouseWheel);
		this.domElement.removeEventListener('keydown', this._onKeyDown);
		this.domElement.style.touchAction = 'auto';
	}

	dispose() {
		this.disconnect();
	}

	_onPointerDown(event) {
		if (!this.enabled) return;
		this.domElement.setPointerCapture(event.pointerId);
		this.domElement.addEventListener('pointermove', this._onPointerMove);
		this.domElement.addEventListener('pointerup', this._onPointerUp);
		this._pointers.push(event.pointerId);
	}

	_onPointerMove(event) {
		if (!this.enabled) return;
		event.preventDefault();
	}

	_onPointerUp(event) {
		this._pointers = this._pointers.filter(id => id !== event.pointerId);
		if (this._pointers.length === 0) {
			this.domElement.removeEventListener('pointermove', this._onPointerMove);
			this.domElement.removeEventListener('pointerup', this._onPointerUp);
			this.state = _STATE.NONE;
		}
	}

	_onMouseWheel(event) {
		if (!this.enabled || !this.enableZoom) return;
		event.preventDefault();
	}

	_onKeyDown(event) {
		if (!this.enabled) return;
	}

	startAutoUpdate() {
		const animate = () => {
			requestAnimationFrame(animate);
			this.update();
		};
		animate();
	}

	update() {
		if (this.autoRotate) {
			this._spherical.theta += this.autoRotateSpeed / 60;
		}
	}
}

export { OrbitControls };
