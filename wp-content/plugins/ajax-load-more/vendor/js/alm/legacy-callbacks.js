/*
 * Ajax Load More Callback Helpers
 * Helpers for v5.0 release.  
 * https://connekthq.com/plugins/ajax-load-more/
 */
 
(function($) {   

   // $.fn.almComplete
   // https://connekthq.com/plugins/ajax-load-more/docs/callback-functions/#complete   
   window.almComplete = function(alm) {
      if ($.isFunction($.fn.almComplete)) {
         $.fn.almComplete(alm);
      }
   };


   // $.fn.almDestroyed
   // https://connekthq.com/plugins/ajax-load-more/docs/callback-functions/#destroyed
   window.almDestroyed = function(alm) {
      if ($.isFunction($.fn.almDestroyed)) {
         $.fn.almDestroyed(alm);
      }
   };


   // $.fn.almDone
   // https://connekthq.com/plugins/ajax-load-more/docs/callback-functions/#done
   window.almDone = function(alm) {
      if ($.isFunction($.fn.almDone)) {
         $.fn.almDone();
      }
   };


   // $.fn.almEmpty
   // https://connekthq.com/plugins/ajax-load-more/docs/callback-functions/#empty
   window.almEmpty = function(alm) {
      if ($.isFunction($.fn.almEmpty)) {
         $.fn.almEmpty(alm);
      }
   };


   // $.fn.almFilterComplete
   // https://connekthq.com/plugins/ajax-load-more/docs/callback-functions/#filter-complete
   window.almFilterComplete = function() {
      if ($.isFunction($.fn.almFilterComplete)) {
         $.fn.almFilterComplete();
      }
   };


   // $.fn.almUrlUpdate 
   // https://connekthq.com/plugins/ajax-load-more/docs/callback-functions/#url-update
   window.almUrlUpdate = function(permalink, type) {
      if ($.isFunction($.fn.almUrlUpdate)) {
         $.fn.almUrlUpdate(permalink, type);
      }
   };


   // $.fn.ajaxloadmore
   // https://connekthq.com/plugins/ajax-load-more/docs/code-samples/loading-via-ajax/ 
   $.fn.ajaxloadmore = function() {
      this.each(function(e) {
         ajaxloadmore.start(this);
      });
   };


   // $.fn.almTriggerClick
   // https://connekthq.com/plugins/ajax-load-more/docs/public-functions/#almTriggerClick 
   $.fn.almTriggerClick = function() {
      window.almTriggerClick();
   }


   // $.fn.almFilter
   //https://connekthq.com/plugins/ajax-load-more/docs/public-functions/#almFilter
   $.fn.almFilter = function(transition, speed, data) {
      ajaxloadmore.filter(transition, speed, data);
   }   
   

})(jQuery);