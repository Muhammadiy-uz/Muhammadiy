<?php
/**
 * The header for our theme
 *
 * This is the template that displays all of the <head> section and everything up until <div id="content">
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package WordPress
 * @subpackage Theme_Name
 */
?>
<!DOCTYPE html>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
<!-- 
    meta tegs more info:    
    https://github.com/joshbuchea/HEAD/
-->
    <?php wp_head(); ?>
<!--
    wp_head() - admin paneldan yoqiladigan plugins va themes head kodlarini avtomatik import qiladi.
-->
</head>
