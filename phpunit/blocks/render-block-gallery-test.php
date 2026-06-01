<?php
/**
 * Gallery block rendering tests.
 *
 * @package WordPress
 * @subpackage Blocks
 */

/**
 * Tests for the Gallery block, in particular its dynamic mode where images are
 * resolved from a source (`dynamicSource`) rather than from inner image blocks.
 *
 * @group blocks
 */
class Tests_Blocks_Render_Gallery extends WP_UnitTestCase {

	/**
	 * Post that the attachments are attached to.
	 *
	 * @var int
	 */
	private static $post_id;

	/**
	 * Image attachment IDs attached to self::$post_id.
	 *
	 * @var int[]
	 */
	private static $attachment_ids = array();

	public static function wpSetUpBeforeClass( WP_UnitTest_Factory $factory ) {
		self::$post_id = $factory->post->create(
			array( 'post_title' => 'Gallery dynamic mode test post' )
		);

		$file = DIR_TESTDATA . '/images/canola.jpg';
		// Two images attached to the post.
		self::$attachment_ids[] = $factory->attachment->create_upload_object( $file, self::$post_id );
		self::$attachment_ids[] = $factory->attachment->create_upload_object( $file, self::$post_id );
	}

	public static function wpTearDownAfterClass() {
		foreach ( self::$attachment_ids as $attachment_id ) {
			wp_delete_attachment( $attachment_id, true );
		}
		wp_delete_post( self::$post_id, true );
	}

	/**
	 * Renders a gallery block within the loop for self::$post_id so that the
	 * `attachedToPost` source resolves against it (via the `get_the_ID()`
	 * fallback).
	 *
	 * @param string $block_markup Serialized gallery block.
	 * @return string Rendered HTML.
	 */
	private function render_in_loop( $block_markup ) {
		global $post;
		$post = get_post( self::$post_id );
		setup_postdata( $post );
		$output = do_blocks( $block_markup );
		wp_reset_postdata();
		return $output;
	}

	public function test_dynamic_attached_to_post_renders_attached_images() {
		$output = $this->render_in_loop(
			'<!-- wp:gallery {"dynamicSource":{"type":"attachedToPost"}} --><figure class="wp-block-gallery has-nested-images columns-default is-cropped"></figure><!-- /wp:gallery -->'
		);

		// One image figure per attached image.
		$this->assertSame(
			count( self::$attachment_ids ),
			substr_count( $output, 'wp-block-image' ),
			'Should render one image block per attached image.'
		);

		foreach ( self::$attachment_ids as $attachment_id ) {
			$this->assertStringContainsString(
				'wp-image-' . $attachment_id,
				$output,
				"Rendered gallery should contain attachment $attachment_id."
			);
		}
	}

	public function test_dynamic_attached_to_post_honours_order() {
		$asc = $this->render_in_loop(
			'<!-- wp:gallery {"dynamicSource":{"type":"attachedToPost","orderby":"date","order":"asc"}} --><figure class="wp-block-gallery has-nested-images columns-default is-cropped"></figure><!-- /wp:gallery -->'
		);
		$desc = $this->render_in_loop(
			'<!-- wp:gallery {"dynamicSource":{"type":"attachedToPost","orderby":"date","order":"desc"}} --><figure class="wp-block-gallery has-nested-images columns-default is-cropped"></figure><!-- /wp:gallery -->'
		);

		$first  = self::$attachment_ids[0];
		$second = self::$attachment_ids[1];

		// Oldest to newest: the first-created attachment renders before the second.
		$this->assertLessThan(
			strpos( $asc, 'wp-image-' . $second ),
			strpos( $asc, 'wp-image-' . $first ),
			'With order=asc the earlier attachment should render first.'
		);

		// Newest to oldest reverses that order.
		$this->assertLessThan(
			strpos( $desc, 'wp-image-' . $first ),
			strpos( $desc, 'wp-image-' . $second ),
			'With order=desc the later attachment should render first.'
		);
	}

	public function test_dynamic_unknown_source_type_renders_no_images() {
		$output = $this->render_in_loop(
			'<!-- wp:gallery {"dynamicSource":{"type":"notARealSource"}} --><figure class="wp-block-gallery has-nested-images columns-default"></figure><!-- /wp:gallery -->'
		);

		$this->assertStringNotContainsString( 'wp-block-image', $output );
	}

	public function test_static_gallery_without_dynamic_source_is_unaffected() {
		$attachment_id = self::$attachment_ids[0];
		$image_url     = wp_get_attachment_image_url( $attachment_id, 'large' );
		$markup        = sprintf(
			'<!-- wp:gallery {"linkTo":"none"} --><figure class="wp-block-gallery has-nested-images columns-default is-cropped"><!-- wp:image {"id":%1$d,"sizeSlug":"large"} --><figure class="wp-block-image size-large"><img src="%2$s" alt="" class="wp-image-%1$d"/></figure><!-- /wp:image --></figure><!-- /wp:gallery -->',
			$attachment_id,
			$image_url
		);

		$output = $this->render_in_loop( $markup );

		// The single, manually-added image renders; the dynamic source path is
		// not engaged, so no extra attached images are injected.
		$this->assertSame( 1, substr_count( $output, 'wp-block-image' ) );
		$this->assertStringContainsString( 'wp-image-' . $attachment_id, $output );
	}

	public function test_dynamic_lightbox_link_adds_interactivity_directives() {
		$output = $this->render_in_loop(
			'<!-- wp:gallery {"dynamicSource":{"type":"attachedToPost"},"linkTo":"lightbox"} --><figure class="wp-block-gallery has-nested-images columns-default is-cropped"></figure><!-- /wp:gallery -->'
		);

		// Lightbox-enabled images go through the image block's lightbox render,
		// which the gallery then wires up for navigation.
		$this->assertStringContainsString( 'data-wp-interactive="core/gallery"', $output );
		$this->assertStringContainsString( 'lightbox-trigger', $output );
	}
}
