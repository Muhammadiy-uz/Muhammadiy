<!-- woocommerce remove billing details -->
<!-- https://stackoverflow.com/questions/42049686/how-to-remove-billing-details-on-check-out-page-and-change-the-billing-details-t -->

add_filter( 'woocommerce_checkout_fields' , 'remove_billing_fields_from_checkout' );
function remove_billing_fields_from_checkout( $fields ) {
    $fields[ 'billing' ] = array();
    return $fields;
}
