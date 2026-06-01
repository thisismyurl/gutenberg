/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Default ordering for a dynamic source. `menu_order` (the manual media-library
 * order) is intentionally not used: it isn't a valid `orderby` value on the
 * media REST endpoint, so the editor preview couldn't reproduce it. Both the
 * editor query and the server resolver default to the same REST-supported order
 * so the preview matches the frontend.
 */
export const DEFAULT_ORDERBY = 'date';
export const DEFAULT_ORDER = 'desc';

/**
 * Maps a gallery's `dynamicSource` attribute to a query for the `attachment`
 * entity (i.e. `/wp/v2/media` collection params), used to resolve the source to
 * a list of media in the editor.
 *
 * The `type` key is the dispatch discriminator. `attachedToPost` is a
 * context-relative anchor resolved here to the REST `parent` param; future
 * source types pass their REST-named fields (`author`, `categories`,
 * `after`/`before`, `media_type`, etc.) straight through. The server-side
 * counterpart is `block_core_gallery_resolve_dynamic_source()` in `index.php`.
 *
 * @param {Object} dynamicSource  The gallery's `dynamicSource` attribute.
 * @param {Object} context        Resolution context.
 * @param {number} context.postId The current post ID.
 * @return {Object|null} A `getEntityRecords` query, or `null` when the source
 *                       cannot be resolved (unknown type or missing context).
 */
export function getSourceQuery( dynamicSource, { postId } ) {
	const { type, ...rest } = dynamicSource ?? {};

	switch ( type ) {
		case 'attachedToPost':
			if ( ! postId ) {
				return null;
			}
			return {
				parent: postId,
				per_page: -1,
				orderby: DEFAULT_ORDERBY,
				order: DEFAULT_ORDER,
				// Any `orderby`/`order` set on the source overrides the defaults.
				...rest,
			};
	}

	// Unknown or not-yet-implemented source type.
	return null;
}

/**
 * Returns a short, human-readable label describing a `dynamicSource`, for
 * display in the editor.
 *
 * @param {Object} dynamicSource The gallery's `dynamicSource` attribute.
 * @return {string} A translated label.
 */
export function getSourceLabel( dynamicSource ) {
	switch ( dynamicSource?.type ) {
		case 'attachedToPost':
			return __( 'Images attached to this post' );
	}

	return __( 'Dynamic images' );
}

/**
 * Returns a sentence describing a `dynamicSource`, for use as help text beneath
 * the Source controls. Unlike `getSourceLabel` (a short label for menus/options)
 * this reads as a complete sentence, ending with a period.
 *
 * @param {Object} dynamicSource The gallery's `dynamicSource` attribute.
 * @return {string} A translated description.
 */
export function getSourceDescription( dynamicSource ) {
	switch ( dynamicSource?.type ) {
		case 'attachedToPost':
			return __( 'Images attached to this post.' );
	}

	return __( 'Dynamic images.' );
}
