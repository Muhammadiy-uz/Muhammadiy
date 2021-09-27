<?php
/**
 * Functions which enhance the theme by hooking into WordPress
 *
 * @package WordPress
 * @subpackage Muhammadiy_uz
 */

add_action( 'wp_body_open', 'examples_1' );
function examples_1() {
    ?>
    <!-- misol uchun: HTML shiv yoki (skippy>Skip to main content) yoki birinchi bulib ochilishi kerak bulgan kodlarni yozsangz buladi -->
    <?php
}