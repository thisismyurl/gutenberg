/**
 * Internal dependencies
 */
import { getSourceQuery, getSourceLabel } from '../dynamic-source';

describe( 'getSourceQuery', () => {
	it( 'resolves the attachedToPost anchor to the REST `parent` param with default ordering', () => {
		expect(
			getSourceQuery( { type: 'attachedToPost' }, { postId: 42 } )
		).toEqual( {
			parent: 42,
			per_page: -1,
			orderby: 'date',
			order: 'desc',
		} );
	} );

	it( 'lets the source override the default ordering', () => {
		expect(
			getSourceQuery(
				{ type: 'attachedToPost', orderby: 'title', order: 'asc' },
				{ postId: 7 }
			)
		).toEqual( {
			parent: 7,
			per_page: -1,
			orderby: 'title',
			order: 'asc',
		} );
	} );

	it( 'passes through additional REST-named fields verbatim', () => {
		expect(
			getSourceQuery(
				{ type: 'attachedToPost', author: 5 },
				{ postId: 7 }
			)
		).toEqual( {
			parent: 7,
			per_page: -1,
			orderby: 'date',
			order: 'desc',
			author: 5,
		} );
	} );

	it( 'returns null when there is no post to anchor to', () => {
		expect(
			getSourceQuery( { type: 'attachedToPost' }, { postId: undefined } )
		).toBeNull();
	} );

	it( 'returns null for an unknown source type', () => {
		expect(
			getSourceQuery( { type: 'notARealSource' }, { postId: 1 } )
		).toBeNull();
	} );

	it( 'returns null for an empty/absent source', () => {
		expect( getSourceQuery( undefined, { postId: 1 } ) ).toBeNull();
	} );
} );

describe( 'getSourceLabel', () => {
	it( 'labels the attachedToPost source', () => {
		expect( getSourceLabel( { type: 'attachedToPost' } ) ).toBe(
			'Images attached to this post'
		);
	} );

	it( 'falls back to a generic label for unknown sources', () => {
		expect( getSourceLabel( { type: 'whatever' } ) ).toBe(
			'Dynamic images'
		);
	} );
} );
