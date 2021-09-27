<?php
/**
 * Uninstall Ajax Load More
 *
 * Deletes all the plugin data.
 *  1. Custom Tables.
 *  2. Repeater Templates.
 *  3. Cache Directory.
 *
 * @since 4.1
 * @package AjaxLoadMore
 */

// Exit if accessed directly.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

require_once 'ajax-load-more.php';

global $wpdb;

if ( is_multisite() ) {
	// Multisite.
	$blog_ids = $wpdb->get_col( "SELECT blog_id FROM $wpdb->blogs" );
	foreach ( $blog_ids as $blog_id ) {
		switch_to_blog( $blog_id );

		$alm_options = get_option( 'alm_settings' );
		if ( isset( $alm_options['_alm_uninstall'] ) ) {
			if ( 1 === $alm_options['_alm_uninstall'] ) {
				alm_delete_templates();
				alm_drop_table();
				delete_option( 'alm_settings' ); // Delete settings.
			}
		}
		restore_current_blog();
	}
} else {
	// Standard.
	$alm_options = get_option( 'alm_settings' );
	if ( isset( $alm_options['_alm_uninstall'] ) ) {
		if ( 1 === $alm_options['_alm_uninstall'] ) {
			alm_delete_templates();
			alm_drop_table();
			delete_option( 'alm_settings' ); // Delete settings.
		}
	}
}

/**
 *  Delete all ALM tables
 */
function alm_delete_templates() {

	// Exit if `alm_repeater_path` has been modified outside of the plugin.
	// We don't want to delete a directory in a theme so let's skip this.
	if ( has_filter( 'alm_repeater_path' ) ) {
		return false;
	}

	$dir = AjaxLoadMore::alm_get_repeater_path(); // /alm_templates directory

	if ( ! is_dir( $dir ) ) {
		return; // Confirm directory exists.
	}

	// Loop all files in directory.
	foreach ( glob( $dir . '/*.*' ) as $filename ) {
		// Delete files.
		if ( is_file( $filename ) ) {
			unlink( $filename );
		}
	}

	// Remove directory.
	rmdir( $dir );

}

/**
 *  Delete all ALM tables
 */
function alm_drop_table() {
	global $wpdb;
	$wpdb->query( 'DROP TABLE IF EXISTS ' . $wpdb->prefix . 'alm' );
	$wpdb->query( 'DROP TABLE IF EXISTS ' . $wpdb->prefix . 'alm_unlimited' );
}
