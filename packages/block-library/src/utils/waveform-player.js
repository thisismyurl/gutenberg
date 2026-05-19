/**
 * WordPress dependencies
 */
import { useRef } from '@wordpress/element';
import { useRefEffect } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { initWaveformPlayer } from './waveform-utils';
import {
	getEffectiveBackgroundColor,
	getProgressBackgroundColor,
} from '../playlist/utils';

/**
 * A reusable WaveformPlayer component for the block editor.
 *
 * Renders an audio waveform visualization with dual layers (base + hover),
 * time elements, control buttons, and progress background.
 * Automatically inherits colors from the parent block's text color.
 *
 * @param {Object}   props                        - Component props.
 * @param {string}   props.src                    - The audio file URL.
 * @param {string}   props.title                  - The track title.
 * @param {string}   props.artist                 - The artist name.
 * @param {string}   props.album                  - The album name.
 * @param {string}   props.image                  - The artwork image URL.
 * @param {string}   props.visualizationStyle     - Waveform style (bars, mirror, etc).
 * @param {boolean}  props.showProgressBackground - Whether to show progress background.
 * @param {string}   props.progressColor          - Custom progress background color.
 * @param {Function} props.onEnded                - Callback when the track finishes playing.
 * @param {Function} props.onPrev                 - Callback for previous track.
 * @param {Function} props.onNext                 - Callback for next track.
 * @param {Function} props.onShuffleToggle        - Callback for shuffle toggle.
 * @param {boolean}  props.isShuffled             - Whether shuffle is active.
 * @return {Element} The WaveformPlayer element.
 */
export function WaveformPlayer( {
	src,
	title,
	artist,
	album,
	image,
	visualizationStyle,
	showProgressBackground,
	progressColor,
	onEnded,
	onPrev,
	onNext,
	onShuffleToggle,
	isShuffled,
} ) {
	// Store callbacks in refs so they don't need to be useRefEffect dependencies.
	// These callbacks change reference on every render (their dependency chains
	// include unstable arrays), which would cause useRefEffect to destroy
	// and recreate the entire player on every re-render.
	const onEndedRef = useRef( onEnded );
	onEndedRef.current = onEnded;
	const onPrevRef = useRef( onPrev );
	onPrevRef.current = onPrev;
	const onNextRef = useRef( onNext );
	onNextRef.current = onNext;
	const onShuffleToggleRef = useRef( onShuffleToggle );
	onShuffleToggleRef.current = onShuffleToggle;
	const isShuffledRef = useRef( isShuffled );
	isShuffledRef.current = isShuffled;

	const ref = useRefEffect(
		( element ) => {
			if ( ! src ) {
				return;
			}

			let cancelled = false;
			let playerDestroy;

			function init() {
				if ( cancelled ) {
					return;
				}

				// Compute colors from the element's position in the DOM.
				const bgColor = getEffectiveBackgroundColor( element );
				const progressBgColor =
					progressColor || getProgressBackgroundColor( bgColor );

				const player = initWaveformPlayer( element, {
					src,
					title,
					artist,
					album,
					image,
					visualizationStyle,
					showProgressBackground,
					progressBackgroundColor: progressBgColor,
					bgColor,
					onEnded: () => onEndedRef.current?.(),
					onPrev: () => onPrevRef.current?.(),
					onNext: () => onNextRef.current?.(),
					onShuffleToggle: () =>
						onShuffleToggleRef.current?.(),
					isShuffled: isShuffledRef.current,
				} );
				playerDestroy = player.destroy;
			}

			// Defer initialization so the element inherits the correct
			// text color, which is used to derive waveform colors. In the
			// editor iframe, theme styles (CSS custom properties) are
			// injected dynamically, so getComputedStyle may return the
			// default black on first render.
			// Using a requestAnimationFrame loop isn't sufficient to solve the issue.
			// TODO - find a better option than a setTimeout, so we're not relying on an arbitrary number.
			const timeoutId = setTimeout( init, 100 );

			return () => {
				cancelled = true;
				clearTimeout( timeoutId );
				playerDestroy?.();
			};
		},
		[
			src,
			title,
			artist,
			album,
			image,
			visualizationStyle,
			showProgressBackground,
			progressColor,
		]
	);

	return (
		<div
			ref={ ref }
			className="wp-block-playlist__waveform-player"
			data-waveform-style={ visualizationStyle || 'bars' }
		/>
	);
}
