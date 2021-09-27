<?php
/**
 * The header for our theme
 *
 * This is the template that displays all of the <head> section and everything up until <div id="content">
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package WordPress
 * @subpackage Muhammadiy_uz
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
    wp_head() - admin paneldan yoqiladigan plugins va themes head kodlari/linklarni avtomatik import qiladi.
-->
</head>

<body <?php body_class(); ?>>
<!--
    review:     <body class="home blog logged-in admin-bar no-customize-support">
                <body class="home blog">
    docs: https://developer.wordpress.org/reference/functions/body_class/
-->

<?php wp_body_open(); ?>
