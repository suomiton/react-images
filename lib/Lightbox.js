"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _aphrodite = require("aphrodite");

var _reactScrolllock = require("react-scrolllock");

var _reactScrolllock2 = _interopRequireDefault(_reactScrolllock);

var _theme = require("./theme");

var _theme2 = _interopRequireDefault(_theme);

var _Arrow = require("./components/Arrow");

var _Arrow2 = _interopRequireDefault(_Arrow);

var _Container = require("./components/Container");

var _Container2 = _interopRequireDefault(_Container);

var _Footer = require("./components/Footer");

var _Footer2 = _interopRequireDefault(_Footer);

var _Header = require("./components/Header");

var _Header2 = _interopRequireDefault(_Header);

var _PaginatedThumbnails = require("./components/PaginatedThumbnails");

var _PaginatedThumbnails2 = _interopRequireDefault(_PaginatedThumbnails);

var _Portal = require("./components/Portal");

var _Portal2 = _interopRequireDefault(_Portal);

var _Spinner = require("./components/Spinner");

var _Spinner2 = _interopRequireDefault(_Spinner);

var _bindFunctions = require("./utils/bindFunctions");

var _bindFunctions2 = _interopRequireDefault(_bindFunctions);

var _canUseDom = require("./utils/canUseDom");

var _canUseDom2 = _interopRequireDefault(_canUseDom);

var _deepMerge = require("./utils/deepMerge");

var _deepMerge2 = _interopRequireDefault(_deepMerge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// consumers sometimes provide incorrect type or casing
function normalizeSourceSet(data) {
	var sourceSet = data.srcSet || data.srcset;

	if (Array.isArray(sourceSet)) {
		return sourceSet.join();
	}

	return sourceSet;
}

var Lightbox = function (_Component) {
	_inherits(Lightbox, _Component);

	function Lightbox(props) {
		_classCallCheck(this, Lightbox);

		var _this = _possibleConstructorReturn(this, (Lightbox.__proto__ || Object.getPrototypeOf(Lightbox)).call(this, props));

		_this.theme = (0, _deepMerge2.default)(_theme2.default, props.theme);
		_this.classes = _aphrodite.StyleSheet.create((0, _deepMerge2.default)(defaultStyles, _this.theme));
		_this.state = { imageLoaded: false };

		_bindFunctions2.default.call(_this, ["gotoNext", "gotoPrev", "closeBackdrop", "handleKeyboardInput", "handleImageLoaded"]);
		return _this;
	}

	_createClass(Lightbox, [{
		key: "getChildContext",
		value: function getChildContext() {
			return {
				theme: this.theme
			};
		}
	}, {
		key: "componentDidMount",
		value: function componentDidMount() {
			if (this.props.isOpen) {
				if (this.props.enableKeyboardInput) {
					window.addEventListener("keydown", this.handleKeyboardInput);
				}
				if (typeof this.props.currentItem === "number") {
					this.preloadImage(this.props.currentItem, this.handleImageLoaded);
				}
			}
		}
	}, {
		key: "componentWillReceiveProps",
		value: function componentWillReceiveProps(nextProps) {
			var _this2 = this;

			if (!_canUseDom2.default) return;

			var currentIndex = this.props.currentItem;
			var nextIndex = nextProps.currentItem + 1;
			var prevIndex = nextProps.currentItem - 1;
			var preloadIndex = void 0;

			if (currentIndex && nextProps.currentItem > currentIndex) {
				preloadIndex = nextIndex;
			} else if (currentIndex && nextProps.currentItem < currentIndex) {
				preloadIndex = prevIndex;
			}

			if (nextProps.items[nextProps.currentItem].type === "image") {
				if (nextProps.preloadNextImage) {
					// if we know the user's direction just get one image
					// otherwise, to be safe, we need to grab one in each direction
					if (preloadIndex) {
						this.preloadImage(preloadIndex);
					} else {
						this.preloadImage(prevIndex);
						this.preloadImage(nextIndex);
					}
				}

				// preload current image
				if (this.props.currentItem !== nextProps.currentItem || !this.props.isOpen && nextProps.isOpen) {
					var img = this.preloadImage(nextProps.currentItem, this.handleImageLoaded);
					if (img) {
						this.setState({ imageLoaded: img.complete });
					}
				}
			} else {
				setTimeout(function () {
					_this2.setState({ imageLoaded: true });
				}, 300);
			}

			// add/remove event listeners
			if (!this.props.isOpen && nextProps.isOpen && nextProps.enableKeyboardInput) {
				window.addEventListener("keydown", this.handleKeyboardInput);
			}
			if (!nextProps.isOpen && nextProps.enableKeyboardInput) {
				window.removeEventListener("keydown", this.handleKeyboardInput);
			}
		}
	}, {
		key: "componentWillUnmount",
		value: function componentWillUnmount() {
			if (this.props.enableKeyboardInput) {
				window.removeEventListener("keydown", this.handleKeyboardInput);
			}
		}

		// ==============================
		// METHODS
		// ==============================

	}, {
		key: "preloadImage",
		value: function preloadImage(idx, onload) {
			var data = this.props.items[idx];

			if (!data || data.type === "video") return;

			var img = new Image();
			var sourceSet = normalizeSourceSet(data);

			// TODO: add error handling for missing images
			img.onerror = onload;
			img.onload = onload;
			img.src = data.src;

			if (sourceSet) img.srcset = sourceSet;

			return img;
		}
	}, {
		key: "gotoNext",
		value: function gotoNext(event) {
			var _props = this.props,
			    currentItem = _props.currentItem,
			    items = _props.items;
			var imageLoaded = this.state.imageLoaded;


			if (!imageLoaded || currentItem === items.length - 1) return;

			if (event) {
				event.preventDefault();
				event.stopPropagation();
			}

			this.props.onClickNext();
		}
	}, {
		key: "gotoPrev",
		value: function gotoPrev(event) {
			var currentItem = this.props.currentItem;
			var imageLoaded = this.state.imageLoaded;


			if (!imageLoaded || currentItem === 0) return;

			if (event) {
				event.preventDefault();
				event.stopPropagation();
			}

			this.props.onClickPrev();
		}
	}, {
		key: "closeBackdrop",
		value: function closeBackdrop(event) {
			// make sure event only happens if they click the backdrop
			// and if the caption is widening the figure element let that respond too
			if (event.target.id === "lightboxBackdrop" || event.target.tagName === "FIGURE") {
				this.props.onClose();
			}
		}
	}, {
		key: "handleKeyboardInput",
		value: function handleKeyboardInput(event) {
			if (event.keyCode === 37) {
				// left
				this.gotoPrev(event);
				return true;
			} else if (event.keyCode === 39) {
				// right
				this.gotoNext(event);
				return true;
			} else if (event.keyCode === 27) {
				// esc
				this.props.onClose();
				return true;
			}
			return false;
		}
	}, {
		key: "handleImageLoaded",
		value: function handleImageLoaded() {
			this.setState({ imageLoaded: true });
		}

		// ==============================
		// RENDERERS
		// ==============================

	}, {
		key: "renderArrowPrev",
		value: function renderArrowPrev() {
			if (this.props.currentItem === 0) return null;

			return _react2.default.createElement(_Arrow2.default, {
				direction: "left",
				icon: "arrowLeft",
				onClick: this.gotoPrev,
				title: this.props.leftArrowTitle,
				type: "button"
			});
		}
	}, {
		key: "renderArrowNext",
		value: function renderArrowNext() {
			if (this.props.currentItem === this.props.items.length - 1) return null;

			return _react2.default.createElement(_Arrow2.default, {
				direction: "right",
				icon: "arrowRight",
				onClick: this.gotoNext,
				title: this.props.rightArrowTitle,
				type: "button"
			});
		}
	}, {
		key: "renderDialog",
		value: function renderDialog() {
			var _props2 = this.props,
			    backdropClosesModal = _props2.backdropClosesModal,
			    isOpen = _props2.isOpen,
			    showThumbnails = _props2.showThumbnails,
			    width = _props2.width;
			var imageLoaded = this.state.imageLoaded;


			if (!isOpen) return _react2.default.createElement("span", { key: "closed" });

			var offsetThumbnails = 0;
			if (showThumbnails) {
				offsetThumbnails = this.theme.thumbnail.size + this.theme.container.gutter.vertical;
			}

			return _react2.default.createElement(
				_Container2.default,
				{
					key: "open",
					onClick: backdropClosesModal && this.closeBackdrop,
					onTouchEnd: backdropClosesModal && this.closeBackdrop
				},
				_react2.default.createElement(
					"div",
					null,
					_react2.default.createElement(
						"div",
						{
							className: (0, _aphrodite.css)(this.classes.content),
							style: { marginBottom: offsetThumbnails, maxWidth: width }
						},
						imageLoaded && this.renderHeader(),
						this.renderImages(),
						this.renderSpinner(),
						imageLoaded && this.renderFooter()
					),
					imageLoaded && this.renderThumbnails(),
					imageLoaded && this.renderArrowPrev(),
					imageLoaded && this.renderArrowNext(),
					this.props.preventScroll && _react2.default.createElement(_reactScrolllock2.default, null)
				)
			);
		}
	}, {
		key: "renderImages",
		value: function renderImages() {
			var _props3 = this.props,
			    currentItem = _props3.currentItem,
			    items = _props3.items,
			    onClickImage = _props3.onClickImage,
			    showThumbnails = _props3.showThumbnails;
			var imageLoaded = this.state.imageLoaded;


			if (!items || !items.length) return null;

			var item = items[currentItem];

			if (item.type == "image") {
				var image = item;
				var sourceSet = normalizeSourceSet(image);
				var sizes = sourceSet ? "100vw" : null;

				var thumbnailsSize = showThumbnails ? this.theme.thumbnail.size : 0;
				var heightOffset = this.theme.header.height + this.theme.footer.height + thumbnailsSize + this.theme.container.gutter.vertical + "px";

				return _react2.default.createElement(
					"figure",
					{ className: (0, _aphrodite.css)(this.classes.figure) },
					_react2.default.createElement("img", {
						className: (0, _aphrodite.css)(this.classes.image, imageLoaded && this.classes.imageLoaded),
						onClick: onClickImage,
						sizes: sizes,
						alt: image.alt,
						src: image.src,
						srcSet: sourceSet,
						style: {
							cursor: onClickImage ? "pointer" : "auto",
							maxHeight: "calc(100vh - " + heightOffset + ")"
						}
					})
				);
			} else {
				var video = item;

				var width = Math.min(window.innerWidth - window.innerWidth / 5, 800);

				var videoSrc = video.src.startsWith("http://") || video.src.startsWith("https://") ? video.src : "//www.youtube.com/embed/" + video.src + "?rel=0&amp;showinfo=0;autoplay=1";

				return _react2.default.createElement(
					"div",
					{ key: video.src, id: video.src, className: "video-item" },
					_react2.default.createElement("iframe", {
						style: { border: "none" },
						id: video.src,
						type: "text/html",
						width: width,
						height: 9 * width / 16,
						src: videoSrc,
						frameBorder: "0",
						allow: "autoplay; encrypted-media",
						allowFullScreen: true
					})
				);
			}
		}
	}, {
		key: "renderThumbnails",
		value: function renderThumbnails() {
			var _props4 = this.props,
			    items = _props4.items,
			    currentItem = _props4.currentItem,
			    onClickThumbnail = _props4.onClickThumbnail,
			    showThumbnails = _props4.showThumbnails,
			    thumbnailOffset = _props4.thumbnailOffset;


			if (!showThumbnails) return;

			return _react2.default.createElement(_PaginatedThumbnails2.default, {
				currentImage: currentItem,
				images: items,
				offset: thumbnailOffset,
				onClickThumbnail: onClickThumbnail
			});
		}
	}, {
		key: "renderHeader",
		value: function renderHeader() {
			var _props5 = this.props,
			    closeButtonTitle = _props5.closeButtonTitle,
			    customControls = _props5.customControls,
			    onClose = _props5.onClose,
			    showCloseButton = _props5.showCloseButton;


			return _react2.default.createElement(_Header2.default, {
				customControls: customControls,
				onClose: onClose,
				showCloseButton: showCloseButton,
				closeButtonTitle: closeButtonTitle
			});
		}
	}, {
		key: "renderFooter",
		value: function renderFooter() {
			var _props6 = this.props,
			    currentItem = _props6.currentItem,
			    items = _props6.items,
			    imageCountSeparator = _props6.imageCountSeparator,
			    showImageCount = _props6.showImageCount;


			if (!items || !items.length) return null;

			return _react2.default.createElement(_Footer2.default, {
				caption: items[currentItem].caption,
				countCurrent: currentItem + 1,
				countSeparator: imageCountSeparator,
				countTotal: items.length,
				showCount: showImageCount
			});
		}
	}, {
		key: "renderSpinner",
		value: function renderSpinner() {
			var _props7 = this.props,
			    spinner = _props7.spinner,
			    spinnerColor = _props7.spinnerColor,
			    spinnerSize = _props7.spinnerSize;
			var imageLoaded = this.state.imageLoaded;

			var Spinner = spinner;

			return _react2.default.createElement(
				"div",
				{
					className: (0, _aphrodite.css)(this.classes.spinner, !imageLoaded && this.classes.spinnerActive)
				},
				!imageLoaded && _react2.default.createElement(Spinner, { color: spinnerColor, size: spinnerSize })
			);
		}
	}, {
		key: "render",
		value: function render() {
			return _react2.default.createElement(
				_Portal2.default,
				null,
				this.renderDialog()
			);
		}
	}]);

	return Lightbox;
}(_react.Component);

Lightbox.propTypes = {
	backdropClosesModal: _propTypes2.default.bool,
	closeButtonTitle: _propTypes2.default.string,
	currentItem: _propTypes2.default.number,
	customControls: _propTypes2.default.arrayOf(_propTypes2.default.node),
	enableKeyboardInput: _propTypes2.default.bool,
	imageCountSeparator: _propTypes2.default.string,
	items: _propTypes2.default.arrayOf(_propTypes2.default.shape({
		type: _propTypes2.default.oneOf(["image", "video"]).isRequired,
		src: _propTypes2.default.string,
		srcSet: _propTypes2.default.array,
		caption: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.element]),
		thumbnail: _propTypes2.default.string
	})).isRequired,
	isOpen: _propTypes2.default.bool,
	leftArrowTitle: _propTypes2.default.string,
	onClickImage: _propTypes2.default.func,
	onClickNext: _propTypes2.default.func,
	onClickPrev: _propTypes2.default.func,
	onClose: _propTypes2.default.func.isRequired,
	preloadNextImage: _propTypes2.default.bool,
	preventScroll: _propTypes2.default.bool,
	rightArrowTitle: _propTypes2.default.string,
	showCloseButton: _propTypes2.default.bool,
	showImageCount: _propTypes2.default.bool,
	showThumbnails: _propTypes2.default.bool,
	spinner: _propTypes2.default.func,
	spinnerColor: _propTypes2.default.string,
	spinnerSize: _propTypes2.default.number,
	theme: _propTypes2.default.object,
	thumbnailOffset: _propTypes2.default.number,
	width: _propTypes2.default.number
};
Lightbox.defaultProps = {
	closeButtonTitle: "Close (Esc)",
	currentItem: 0,
	enableKeyboardInput: true,
	imageCountSeparator: " of ",
	leftArrowTitle: "Previous (Left arrow key)",
	onClickShowNextImage: true,
	preloadNextImage: true,
	preventScroll: true,
	rightArrowTitle: "Next (Right arrow key)",
	showCloseButton: true,
	showImageCount: true,
	spinner: _Spinner2.default,
	spinnerColor: "white",
	spinnerSize: 100,
	theme: {},
	thumbnailOffset: 2,
	width: 1024
};
Lightbox.childContextTypes = {
	theme: _propTypes2.default.object.isRequired
};

var defaultStyles = {
	content: {
		position: "relative"
	},
	figure: {
		margin: 0 // remove browser default
	},
	image: {
		display: "block", // removes browser default gutter
		height: "auto",
		margin: "0 auto", // maintain center on very short screens OR very narrow image
		maxWidth: "100%",

		// disable user select
		WebkitTouchCallout: "none",
		userSelect: "none",

		// opacity animation on image load
		opacity: 0,
		transition: "opacity 0.3s"
	},
	imageLoaded: {
		opacity: 1
	},
	spinner: {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",

		// opacity animation to make spinner appear with delay
		opacity: 0,
		transition: "opacity 0.3s",
		pointerEvents: "none"
	},
	spinnerActive: {
		opacity: 1
	}
};

exports.default = Lightbox;