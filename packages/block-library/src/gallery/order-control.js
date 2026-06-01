/**
 * WordPress dependencies
 */
import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Ordering options for a dynamic gallery source. Each value is a composite
 * `"orderby/order"` string mapping to the matching `/wp/v2/media` collection
 * params. `menu_order` is deliberately omitted — it isn't a valid REST `orderby`
 * value, so the editor preview couldn't reproduce it (see `dynamic-source.js`).
 */
const ORDER_OPTIONS = [
	{ label: __( 'Newest to oldest' ), value: 'date/desc' },
	{ label: __( 'Oldest to newest' ), value: 'date/asc' },
	{
		/* translators: Label for ordering images by title in ascending order. */
		label: __( 'A → Z' ),
		value: 'title/asc',
	},
	{
		/* translators: Label for ordering images by title in descending order. */
		label: __( 'Z → A' ),
		value: 'title/desc',
	},
];

/**
 * "Order by" control for a dynamic gallery, mirroring the Query Loop block's
 * `OrderControl`: a single `SelectControl` whose value composites `orderby` and
 * `order`, split apart again on change.
 *
 * @param {Object}   props
 * @param {string}   props.orderby  Current `orderby` value.
 * @param {string}   props.order    Current `order` value (`asc`/`desc`).
 * @param {Function} props.onChange Called with `{ orderby, order }` on change.
 */
export default function OrderControl( { orderby, order, onChange } ) {
	return (
		<SelectControl
			__next40pxDefaultSize
			label={ __( 'Order by' ) }
			value={ `${ orderby }/${ order }` }
			options={ ORDER_OPTIONS }
			onChange={ ( value ) => {
				const [ newOrderby, newOrder ] = value.split( '/' );
				onChange( { orderby: newOrderby, order: newOrder } );
			} }
		/>
	);
}
