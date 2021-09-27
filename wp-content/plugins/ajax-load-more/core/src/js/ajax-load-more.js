/*
 * Ajax Load More
 * https://connekthq.com/plugins/ajax-load-more/
 * Author: Darren Cooney
 * Twitter: @KaptonKaos, @ajaxloadmore, @connekthq
 * Copyright Connekt Media - https://connekthq.com
 */

// Polyfills
require('@babel/polyfill/noConflict');
require('focus-options-polyfill');
require('./helpers/polyfills.js');

// External Modules
let qs = require('qs');
let imagesLoaded = require('imagesloaded');
import axios from 'axios';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
import smoothscroll from 'smoothscroll-polyfill'; // Smooth scrolling polyfill
smoothscroll.polyfill();

// ALM Modules
import './helpers/helpers';
//import commentReplyFix from './helpers/commentReplyFix';
import getParameterByName from './helpers/getParameterByName';
import almAppendChildren from './helpers/almAppendChildren';
import tableWrap from './helpers/tableWrap';
import getCacheUrl from './helpers/getCacheUrl';
import almDomParser from './helpers/almDomParser';
import stripEmptyNodes from './helpers/stripEmptyNodes';
import * as queryParams from './helpers/queryParams';
import * as resultsText from './modules/resultsText';
import { tableOfContents } from './modules/tableofcontents';
import setLocalizedVars from './modules/setLocalizedVars';
import insertScript from './modules/insertScript';
import setFocus from './modules/setFocus';
import { getButtonURL, setButtonAtts } from './modules/getButtonURL';
import { almMasonryConfig, almMasonry } from './modules/masonry';
import almFadeIn from './modules/fadeIn';
import almFadeOut from './modules/fadeOut';
import almFilter from './modules/filtering';
import almNoResults from './modules/noResults';
import almDebug from './modules/almDebug';
import getScrollPercentage from './modules/getScrollPercentage';
import srcsetPolyfill from './helpers/srcsetPolyfill';
import { showPlaceholder, hidePlaceholder } from './modules/placeholder';
import { lazyImages } from './modules/lazyImages';
import { singlePostHTML } from './addons/singleposts';
import { createCacheFile } from './addons/cache';
import { wooInit, woocommerce, wooGetContent, wooReset, woocommerceLoaded } from './addons/woocommerce';
import { elementorCreateParams, elementorGetContent, elementorInit, elementor, elementorLoaded } from './addons/elementor';
import { buildFilterURL } from './addons/filters';
import { createSEOAttributes } from './addons/seo';

// Global filtering var
let alm_is_filtering = false;

// Start ALM
(function () {
	'use strict';

	/**
	 * Initiate Ajax Load More.
	 *
	 * @param {HTMLElement} el The Ajax Load More DOM element/container.
	 * @param {Number} index The current index number of the Ajax Load More instance.
	 */
	let ajaxloadmore = function (el, index) {
		// Move user to top of page to prevent loading of unnessasry posts
		if (alm_localize && alm_localize.scrolltop === 'true') {
			window.scrollTo(0, 0);
		}

		//Set ALM Variables
		let alm = this;
		alm.AjaxLoadMore = {};
		alm.addons = {};
		alm.extensions = {};
		alm.integration = {};
		alm.window = window;
		alm.page = 0;
		alm.posts = 0;
		alm.totalposts = 0;
		alm.proceed = false;
		alm.disable_ajax = false;
		alm.init = true;
		alm.loading = true;
		alm.finished = false;
		alm.timer = null;
		alm.rel = 'next';

		alm.ua = window.navigator.userAgent ? window.navigator.userAgent : ''; // Browser User Agent
		alm.vendor = window.navigator.vendor ? window.navigator.vendor : ''; // Browser Vendor
		alm.isSafari = /Safari/i.test(alm.ua) && /Apple Computer/.test(alm.vendor) && !/Mobi|Android/i.test(alm.ua);

		alm.master_id = el.dataset.id ? `ajax-load-more-${el.dataset.id}` : el.id; // The defined or generated ID of the ALM instance
		el.classList.add('alm-' + index); // Add unique classname.
		el.setAttribute('data-alm-id', index); // Add unique data id.

		// Get localized <script/> variables
		alm.master_id = alm.master_id.replace(/-/g, '_'); // Convert dashes to underscores for the var name
		alm.localize = window[alm.master_id + '_vars']; // Get localize vars

		// ALM Element Containers
		alm.main = el; // Top level DOM element
		alm.listing = el.querySelector('.alm-listing') || el.querySelector('.alm-comments');
		alm.content = alm.listing;
		alm.el = alm.content;
		alm.ajax = el.querySelector('.alm-ajax');
		alm.container_type = alm.listing.dataset.containerType;
		alm.loading_style = alm.listing.dataset.loadingStyle;

		// Instance Params
		alm.canonical_url = el.dataset.canonicalUrl;
		alm.nested = el.dataset.nested ? el.dataset.nested : null;
		alm.is_search = el.dataset.search;
		alm.slug = el.dataset.slug;
		alm.post_id = el.dataset.postId;
		alm.id = el.dataset.id ? el.dataset.id : '';

		// No results template
		let alm_no_results = el.querySelector('.alm-no-results');
		alm.no_results = alm_no_results ? alm_no_results.innerHTML : '';

		// Shortcode Params
		alm.repeater = alm.listing.dataset.repeater; // Repeaters
		alm.theme_repeater = alm.listing.dataset.themeRepeater;

		alm.post_type = alm.listing.dataset.postType ? alm.listing.dataset.postType : 'post';
		alm.sticky_posts = alm.listing.dataset.stickyPosts ? alm.listing.dataset.stickyPosts : null;

		alm.btnWrap = el.querySelectorAll('.alm-btn-wrap'); // Get all `.alm-button-wrap` divs
		alm.btnWrap = Array.prototype.slice.call(alm.btnWrap); // Convert NodeList to array
		alm.btnWrap[alm.btnWrap.length - 1].style.visibility = 'visible'; // Get last element (used for nesting)
		alm.trigger = alm.btnWrap[alm.btnWrap.length - 1];
		alm.button = alm.trigger.querySelector('button.alm-load-more-btn');

		alm.button_label = alm.listing.dataset.buttonLabel;
		alm.button_loading_label = alm.listing.dataset.buttonLoadingLabel;
		alm.button_done_label = alm.listing.dataset.buttonDoneLabel;

		alm.placeholder = alm.main.querySelector('.alm-placeholder');

		alm.scroll_distance = alm.listing.dataset.scrollDistance;
		alm.scroll_distance = alm.scroll_distance ? alm.scroll_distance : 100;
		alm.scroll_container = alm.listing.dataset.scrollContainer;
		alm.scroll_direction = alm.listing.dataset.scrollDirection;
		alm.max_pages = alm.listing.dataset.maxPages ? parseInt(alm.listing.dataset.maxPages) : 0;
		alm.pause_override = alm.listing.dataset.pauseOverride; // true | false
		alm.pause = alm.listing.dataset.pause ? alm.listing.dataset.pause : false; // true | false
		alm.transition = alm.listing.dataset.transition; // Transition
		alm.transition_container = alm.listing.dataset.transitionContainer; // Transition Container
		alm.tcc = alm.listing.dataset.transitionContainerClasses; // Transition Container Classes
		alm.speed = alm_localize.speed ? parseInt(alm_localize.speed) : 200;
		alm.images_loaded = alm.listing.dataset.imagesLoaded ? alm.listing.dataset.imagesLoaded : false;
		alm.destroy_after = alm.listing.dataset.destroyAfter ? alm.listing.dataset.destroyAfter : '';
		alm.orginal_posts_per_page = parseInt(alm.listing.dataset.postsPerPage); // Used for paging add-on
		alm.posts_per_page = alm.listing.dataset.postsPerPage;
		alm.offset = alm.listing.dataset.offset ? parseInt(alm.listing.dataset.offset) : 0;
		alm.lazy_images = alm.listing.dataset.lazyImages ? alm.listing.dataset.lazyImages : false;
		alm.integration.woocommerce = alm.listing.dataset.woocommerce ? alm.listing.dataset.woocommerce : false;
		alm.integration.woocommerce = alm.integration.woocommerce === 'true' ? true : false;
		alm.is_search = alm.is_search === undefined ? false : alm.is_search;
		alm.search_value = alm.is_search === 'true' ? alm.slug : ''; // Convert to value of slug for appending to seo url

		// Add-on Shortcode Params

		// Elementor add-on
		alm.addons.elementor = alm.listing.dataset.elementor === 'posts' && alm.listing.dataset.elementorSettings ? true : false;
		if (alm.addons.elementor) {
			alm = elementorCreateParams(alm);
		}

		// WooCommerce add-on
		alm.addons.woocommerce = alm.listing.dataset.woo && alm.listing.dataset.woo === 'true' ? true : false;
		if (alm.addons.woocommerce && alm.listing.dataset.wooSettings) {
			alm.addons.woocommerce_settings = JSON.parse(alm.listing.dataset.wooSettings);
			alm.addons.woocommerce_settings.results_text = document.querySelectorAll(alm.addons.woocommerce_settings.results); // Add Results Text
			alm.page = parseInt(alm.page) + parseInt(alm.addons.woocommerce_settings.paged);
		}

		// Cache add-on
		alm.addons.cache = alm.listing.dataset.cache;
		alm.addons.cache = alm.addons.cache === undefined ? false : alm.addons.cache;
		if (alm.addons.cache === 'true') {
			alm.addons.cache_id = alm.listing.dataset.cacheId;
			alm.addons.cache_path = alm.listing.dataset.cachePath;
			alm.addons.cache_logged_in = alm.listing.dataset.cacheLoggedIn;
			alm.addons.cache_logged_in = alm.addons.cache_logged_in === undefined ? false : alm.addons.cache_logged_in;
		}

		// CTA add-on
		alm.addons.cta = alm.listing.dataset.cta ? alm.listing.dataset.cta : false;
		if (alm.addons.cta === 'true') {
			alm.addons.cta_position = alm.listing.dataset.ctaPosition;
			alm.addons.cta_repeater = alm.listing.dataset.ctaRepeater;
			alm.addons.cta_theme_repeater = alm.listing.dataset.ctaThemeRepeater;
		}

		// Nextpage add-on
		alm.addons.nextpage = alm.listing.dataset.nextpage;
		if (alm.addons.nextpage === 'true') {
			alm.addons.nextpage_urls = alm.listing.dataset.nextpageUrls;
			alm.addons.nextpage_scroll = alm.listing.dataset.nextpageScroll;
			alm.addons.nextpage_pageviews = alm.listing.dataset.nextpagePageviews;
			alm.addons.nextpage_post_id = alm.listing.dataset.nextpagePostId;
			alm.addons.nextpage_startpage = alm.listing.dataset.nextpageStartpage;
			alm.addons.nextpage_title_template = alm.listing.dataset.nextpageTitleTemplate;
		}

		// Single Posts add-on
		alm.addons.single_post = alm.listing.dataset.singlePost;
		if (alm.addons.single_post === 'true') {
			alm.addons.single_post_id = alm.listing.dataset.singlePostId;
			alm.addons.single_post_query = alm.listing.dataset.singlePostQuery;
			alm.addons.single_post_order = alm.listing.dataset.singlePostOrder === undefined ? 'previous' : alm.listing.dataset.singlePostOrder;
			alm.addons.single_post_init_id = alm.listing.dataset.singlePostId;
			alm.addons.single_post_taxonomy = alm.listing.dataset.singlePostTaxonomy === undefined ? '' : alm.listing.dataset.singlePostTaxonomy;
			alm.addons.single_post_excluded_terms = alm.listing.dataset.singlePostExcludedTerms === undefined ? '' : alm.listing.dataset.singlePostExcludedTerms;
			alm.addons.single_post_progress_bar = alm.listing.dataset.singlePostProgressBar === undefined ? '' : alm.listing.dataset.singlePostProgressBar;
			alm.addons.single_post_target = alm.listing.dataset.singlePostTarget === undefined ? '' : alm.listing.dataset.singlePostTarget;
			alm.addons.single_post_preview = alm.listing.dataset.singlePostPreview === undefined ? false : true;
			if (alm.addons.single_post_preview) {
				const singlePostPreviewData = alm.listing.dataset.singlePostPreview.split(':');
				alm.addons.single_post_preview_data = {
					button_label: singlePostPreviewData[0] ? singlePostPreviewData[0] : 'Continue Reading',
					height: singlePostPreviewData[1] ? singlePostPreviewData[1] : 500,
					element: singlePostPreviewData[2] ? singlePostPreviewData[2] : 'default',
					className: 'alm-single-post--preview',
				};
			}
		}

		// Comments add-on
		alm.addons.comments = alm.listing.dataset.comments ? alm.listing.dataset.comments : false;
		if (alm.addons.comments === 'true') {
			alm.addons.comments_post_id = alm.listing.dataset.comments_post_id; // current post id
			alm.addons.comments_per_page = alm.listing.dataset.comments_per_page;
			alm.addons.comments_per_page = alm.addons.comments_per_page === undefined ? '5' : alm.addons.comments_per_page;
			alm.addons.comments_type = alm.listing.dataset.comments_type;
			alm.addons.comments_style = alm.listing.dataset.comments_style;
			alm.addons.comments_template = alm.listing.dataset.comments_template;
			alm.addons.comments_callback = alm.listing.dataset.comments_callback;
		}

		alm.addons.tabs = alm.listing.dataset.tabs;
		alm.addons.filters = alm.listing.dataset.filters;
		alm.addons.seo = alm.listing.dataset.seo;

		// Preloaded
		alm.addons.preloaded = alm.listing.dataset.preloaded; // Preloaded add-on
		alm.addons.preloaded_amount = alm.listing.dataset.preloadedAmount ? alm.listing.dataset.preloadedAmount : 0;
		alm.is_preloaded = alm.listing.dataset.isPreloaded === 'true' ? true : false;

		// Users
		alm.addons.users = alm.listing.dataset.users === 'true' ? true : false; // Users add-on
		if (alm.addons.users) {
			// Override paging params for users
			alm.orginal_posts_per_page = alm.listing.dataset.usersPerPage;
			alm.posts_per_page = alm.listing.dataset.usersPerPage;
		}

		// Extension Shortcode Params

		// REST API.
		alm.extensions.restapi = alm.listing.dataset.restapi; // REST API
		alm.extensions.restapi_base_url = alm.listing.dataset.restapiBaseUrl;
		alm.extensions.restapi_namespace = alm.listing.dataset.restapiNamespace;
		alm.extensions.restapi_endpoint = alm.listing.dataset.restapiEndpoint;
		alm.extensions.restapi_template_id = alm.listing.dataset.restapiTemplateId;
		alm.extensions.restapi_debug = alm.listing.dataset.restapiDebug;

		// ACF.
		alm.extensions.acf = alm.listing.dataset.acf;
		alm.extensions.acf_field_type = alm.listing.dataset.acfFieldType;
		alm.extensions.acf_field_name = alm.listing.dataset.acfFieldName;
		alm.extensions.acf_parent_field_name = alm.listing.dataset.acfParentFieldName;
		alm.extensions.acf_post_id = alm.listing.dataset.acfPostId;
		alm.extensions.acf = alm.extensions.acf === 'true' ? true : false;
		// if field type, name or post ID is empty
		if (alm.extensions.acf_field_type === undefined || alm.extensions.acf_field_name === undefined || alm.extensions.acf_post_id === undefined) {
			alm.extensions.acf = false;
		}

		// Term Query.
		alm.extensions.term_query = alm.listing.dataset.termQuery; // TERM QUERY
		alm.extensions.term_query_taxonomy = alm.listing.dataset.termQueryTaxonomy;
		alm.extensions.term_query_hide_empty = alm.listing.dataset.termQueryHideEmpty;
		alm.extensions.term_query_number = alm.listing.dataset.termQueryNumber;
		alm.extensions.term_query = alm.extensions.term_query === 'true' ? true : false;

		// Paging.
		alm.addons.paging = alm.listing.dataset.paging; // Paging add-on
		if (alm.addons.paging === 'true') {
			alm.addons.paging = true;
			alm.addons.paging_init = true;
			alm.addons.paging_controls = alm.listing.dataset.pagingControls === 'true' ? true : false;
			alm.addons.paging_show_at_most = alm.listing.dataset.pagingShowAtMost;
			alm.addons.paging_classes = alm.listing.dataset.pagingClasses;
			alm.addons.paging_show_at_most = alm.addons.paging_show_at_most === undefined ? 7 : alm.addons.paging_show_at_most;

			alm.addons.paging_first_label = alm.listing.dataset.pagingFirstLabel;
			alm.addons.paging_previous_label = alm.listing.dataset.pagingPreviousLabel;
			alm.addons.paging_next_label = alm.listing.dataset.pagingNextLabel;
			alm.addons.paging_last_label = alm.listing.dataset.pagingLastLabel;

			alm.addons.paging_scroll = alm.listing.dataset.pagingScroll ? alm.listing.dataset.pagingScroll : false;
			alm.addons.paging_scrolltop = alm.listing.dataset.pagingScrolltop ? parseInt(alm.listing.dataset.pagingScrolltop) : 100;

			// If preloaded, pause ALM
			alm.pause = alm.addons.preloaded === 'true' ? true : alm.pause;
		} else {
			alm.addons.paging = false;
		}

		// Filters
		if (alm.addons.filters === 'true') {
			alm.addons.filters = true;
			alm.addons.filters_url = alm.listing.dataset.filtersUrl === 'true' ? true : false;
			alm.addons.filters_target = alm.listing.dataset.filtersTarget ? alm.listing.dataset.filtersTarget : false;
			alm.addons.filters_paging = alm.listing.dataset.filtersPaging === 'true' ? true : false;
			alm.addons.filters_scroll = alm.listing.dataset.filtersScroll === 'true' ? true : false;
			alm.addons.filters_scrolltop = alm.listing.dataset.filtersScrolltop ? alm.listing.dataset.filtersScrolltop : '30';
			alm.addons.filters_analtyics = alm.listing.dataset.filtersAnalytics;
			alm.addons.filters_debug = alm.listing.dataset.filtersDebug;
			alm.addons.filters_startpage = 0;

			// Display warning if `filters_target` parameter is missing.
			if (!alm.addons.filters_target) {
				console.warn('Ajax Load More: Unable to locate target for Filters. Make sure you set a filters_target in core Ajax Load More.');
			}

			// Get Paged Querystring Val
			let page = getParameterByName('pg');
			alm.addons.filters_startpage = page !== null ? parseInt(page) : 0;

			// If not Paging add-on
			if (!alm.addons.paging && alm.addons.filters_startpage > 0) {
				alm.posts_per_page = alm.posts_per_page * alm.addons.filters_startpage;
				alm.isPaged = alm.addons.filters_startpage > 0 ? true : false;
			}
		} else {
			alm.addons.filters = false;
		}

		// Tabs.
		if (alm.addons.tabs === 'true') {
			alm.addons.tabs = true;
			alm.addons.tab_template = alm.listing.dataset.tabTemplate ? alm.listing.dataset.tabTemplate : '';
			alm.addons.tab_onload = alm.listing.dataset.tabOnload ? alm.listing.dataset.tabOnload : '';
			alm.addons.tabs_resturl = alm.listing.dataset.tabsRestUrl ? alm.listing.dataset.tabsRestUrl : '';

			// Locate active template (deeplinks)
			if (alm.addons.tab_onload !== '') {
				let tabNav = document.querySelector(`.alm-tab-nav li [data-tab-url=${alm.addons.tab_onload}]`);
				alm.addons.tab_template = tabNav ? tabNav.dataset.tabTemplate : alm.addons.tab_template;
				alm.listing.dataset.tabOnload = ''; // Clear tabOnload param
				// Set selected tab
				if (tabNav) {
					let activeTab = document.querySelector(`.alm-tab-nav li .active`);
					if (activeTab) {
						activeTab.classList.remove('active');
					}
				}
			}
		} else {
			alm.addons.tabs = false;
		}
		/* End Tabs  */

		/* REST API */
		if (alm.extensions.restapi === 'true') {
			alm.extensions.restapi = true;
			alm.extensions.restapi_debug = alm.extensions.restapi_debug === undefined ? false : alm.extensions.restapi_debug;
			alm.extensions.restapi = alm.extensions.restapi_template_id === '' ? false : alm.extensions.restapi;
		} else {
			alm.extensions.restapi = false;
		}
		/* End REST API  */

		/* Preloaded */
		if (alm.addons.preloaded === 'true') {
			// Preloaded Amount
			alm.addons.preloaded_amount = alm.addons.preloaded_amount === undefined ? alm.posts_per_page : alm.addons.preloaded_amount;
			// Disable ALM if total_posts is less than or equal to preloaded_amount
			if (alm.localize && alm.localize.total_posts) {
				if (parseInt(alm.localize.total_posts) <= parseInt(alm.addons.preloaded_amount)) {
					alm.addons.preloaded_total_posts = alm.localize.total_posts;
					alm.disable_ajax = true;
				}
			}
		} else {
			alm.addons.preloaded = 'false';
		}
		/* End Preloaded  */

		/* SEO */
		alm.addons.seo = alm.addons.seo === undefined ? false : alm.addons.seo;
		alm.addons.seo = alm.addons.seo === 'true' ? true : alm.addons.seo;

		if (alm.addons.seo) {
			alm.addons.seo_permalink = alm.listing.dataset.seoPermalink;
			alm.addons.seo_pageview = alm.listing.dataset.seoPageview;
			alm.addons.seo_trailing_slash = alm.listing.dataset.seoTrailingSlash === 'false' ? '' : '/';
			alm.addons.seo_leading_slash = alm.listing.dataset.seoLeadingSlash === 'true' ? '/' : '';
		}
		alm.start_page = alm.listing.dataset.seoStartPage;

		if (alm.start_page) {
			alm.addons.seo_scroll = alm.listing.dataset.seoScroll;
			alm.addons.seo_scrolltop = alm.listing.dataset.seoScrolltop;
			alm.addons.seo_controls = alm.listing.dataset.seoControls;
			alm.isPaged = false;
			if (alm.start_page > 1) {
				alm.isPaged = true; // Is this a paged page > 1 ?
				alm.posts_per_page = alm.start_page * alm.posts_per_page;
			}
			if (alm.addons.paging) {
				// If paging, reset posts_per_page
				alm.posts_per_page = alm.orginal_posts_per_page;
			}
		} else {
			alm.start_page = 1;
		}
		/* End SEO  */

		/* Nextpage */
		if (alm.addons.nextpage === 'true') {
			alm.addons.nextpage = true;
			alm.posts_per_page = 1;

			if (alm.addons.nextpage_urls === undefined) {
				alm.addons.nextpage_urls = 'true';
			}
			if (alm.addons.nextpage_scroll === undefined) {
				alm.addons.nextpage_scroll = 'false:30';
			}
			if (alm.addons.nextpage_pageviews === undefined) {
				alm.addons.nextpage_pageviews = 'true';
			}
			if (alm.addons.nextpage_post_id === undefined) {
				alm.addons.nextpage = false;
				alm.addons.nextpage_post_id = null;
			}
			if (alm.addons.nextpage_startpage === undefined) {
				alm.addons.nextpage_startpage = 1;
			}
			if (alm.addons.nextpage_startpage > 1) {
				alm.isPaged = true;
			}
			alm.addons.nextpage_postTitle = alm.listing.dataset.nextpagePostTitle;
		} else {
			alm.addons.nextpage = false;
		}
		/* End Nextpage  */

		/* Single Post */
		if (alm.addons.single_post === 'true') {
			alm.addons.single_post = true;
			alm.addons.single_post_permalink = '';
			alm.addons.single_post_title = '';
			alm.addons.single_post_slug = '';
			alm.addons.single_post_title_template = alm.listing.dataset.singlePostTitleTemplate;
			alm.addons.single_post_siteTitle = alm.listing.dataset.singlePostSiteTitle;
			alm.addons.single_post_siteTagline = alm.listing.dataset.singlePostSiteTagline;
			alm.addons.single_post_pageview = alm.listing.dataset.singlePostPageview;
			alm.addons.single_post_scroll = alm.listing.dataset.singlePostScroll;
			alm.addons.single_post_scroll_speed = alm.listing.dataset.singlePostScrollSpeed;
			alm.addons.single_post_scroll_top = alm.listing.dataset.singlePostScrolltop;
			alm.addons.single_post_controls = alm.listing.dataset.singlePostControls;
		} else {
			alm.addons.single_post = false;
		}
		if (alm.addons.single_post && alm.addons.single_post_id === undefined) {
			alm.addons.single_post_id = '';
			alm.addons.single_post_init_id = '';
		}
		/* End Single Post */

		/* Pause */
		if (alm.pause === undefined || (alm.addons.seo && alm.start_page > 1)) {
			// SEO only
			alm.pause = false;
		}
		if (alm.addons.preloaded === 'true' && alm.addons.seo && alm.start_page > 0) {
			// SEO + Preloaded
			alm.pause = false;
		}
		if (alm.addons.filters && alm.addons.filters_startpage > 0) {
			// Filters
			alm.pause = false;
		}
		if (alm.addons.preloaded === 'true' && alm.addons.paging) {
			alm.pause = true;
		}

		/* Repeater and Theme Repeater */
		alm.repeater = alm.repeater === undefined ? 'default' : alm.repeater;
		alm.theme_repeater = alm.theme_repeater === undefined ? false : alm.theme_repeater;

		/* Max Pages (while scrolling) */
		alm.max_pages = alm.max_pages === undefined || alm.max_pages === 0 ? 9999 : alm.max_pages;

		/* Scroll Distance */
		alm.scroll_distance = alm.scroll_distance === undefined ? 100 : alm.scroll_distance;
		alm.scroll_distance_perc = false;
		if (alm.scroll_distance.toString().indexOf('%') == -1) {
			// Standard scroll_distance
			alm.scroll_distance = parseInt(alm.scroll_distance);
		} else {
			// Percentage scroll_distance
			alm.scroll_distance_perc = true;
			alm.scroll_distance_orig = parseInt(alm.scroll_distance);
			alm.scroll_distance = getScrollPercentage(alm);
		}

		/* Scroll Container */
		alm.scroll_container = alm.scroll_container === undefined ? '' : alm.scroll_container;

		/* Scroll Direction */
		alm.scroll_direction = alm.scroll_direction === undefined ? 'vertical' : alm.scroll_direction;

		/* Transition */
		alm.transition = alm.transition === undefined ? 'fade' : alm.transition;

		/* Transition Container Class */
		alm.tcc = alm.tcc === undefined ? '' : alm.tcc;

		/* Masonry */
		if (alm.transition === 'masonry') {
			alm = almMasonryConfig(alm);
		}

		/* Scroll */
		if (alm.listing.dataset.scroll === undefined) {
			alm.scroll = true;
		} else if (alm.listing.dataset.scroll === 'false') {
			alm.scroll = false;
		} else {
			alm.scroll = true;
		}

		/* Transition Container */
		alm.transition_container = alm.transition_container === undefined || alm.transition_container === 'true' ? true : false;

		/* Button Labels */
		alm.button_label = alm.button_label === undefined ? 'Load More' : alm.button_label;
		alm.button_loading_label = alm.button_loading_label === undefined ? false : alm.button_loading_label;
		alm.button_done_label = alm.button_done_label === undefined ? false : alm.button_done_label;

		/* Paging */
		if (alm.addons.paging) {
			alm.main.classList.add('loading'); // add loading class to main container
		} else {
			let almChildren = el.childNodes; // Get child nodes of instance [nodeList]
			if (almChildren) {
				let almChildArray = Array.prototype.slice.call(almChildren); // Convert nodeList to array

				// Filter array to find the `.alm-btn-wrap` div
				let btnWrap = almChildArray.filter(function (element) {
					if (!element.classList) {
						// If not element (#text node)
						return false;
					}
					return element.classList.contains('alm-btn-wrap');
				});
				alm.button = btnWrap ? btnWrap[0].querySelector('.alm-load-more-btn') : container.querySelector('.alm-btn-wrap .alm-load-more-btn');
			} else {
				alm.button = container.querySelector('.alm-btn-wrap .alm-load-more-btn');
			}

			// Reset button state
			alm.button.disabled = false;
			alm.button.style.display = '';
		}

		// Results Text
		// Render "Showing x of y results" text.
		// If woocommerce, get the default woocommerce results block
		if (alm.integration.woocommerce) {
			alm.resultsText = document.querySelectorAll('.woocommerce-result-count');
			if (alm.resultsText.length < 1) {
				alm.resultsText = document.querySelectorAll('.alm-results-text');
			}
		} else {
			alm.resultsText = document.querySelectorAll('.alm-results-text');
		}
		if (alm.resultsText) {
			alm.resultsText.forEach(function (results) {
				results.setAttribute('aria-live', 'polite');
				results.setAttribute('aria-atomic', 'true');
			});
		} else {
			alm.resultsText = false;
		}

		// Table of Contents
		// Render 1, 2, 3 etc. when pages are loaded
		alm.tableofcontents = document.querySelector('.alm-toc');
		if (alm.tableofcontents) {
			alm.tableofcontents.setAttribute('aria-live', 'polite');
			alm.tableofcontents.setAttribute('aria-atomic', 'true');
		} else {
			alm.tableofcontents = false;
		}

		/**
		 * The function to get posts via Ajax.
		 *
		 * @since 2.0.0
		 */
		alm.AjaxLoadMore.loadPosts = function () {
			if (typeof almOnChange === 'function') {
				window.almOnChange(alm);
			}

			// Check for ajax blocker.
			if (alm.disable_ajax) {
				return;
			}

			alm.loading = true;
			showPlaceholder(alm);

			// Add `.alm-loading` class to container.
			alm.main.classList.add('alm-loading');

			// Add loading styles to buttons.
			if (!alm.addons.paging) {
				if (alm.rel === 'prev') {
					alm.buttonPrev.classList.add('loading');
				} else {
					alm.button.classList.add('loading');
					if (alm.button_loading_label !== false) {
						alm.button.innerHTML = alm.button_loading_label;
					}
				}
			}

			if (alm.addons.cache === 'true' && !alm.addons.cache_logged_in) {
				// Cache
				let cache_page = getCacheUrl(alm);
				if (cache_page) {
					// Load `.html` page
					axios
						.get(cache_page)
						.then((response) => {
							// Exists
							alm.AjaxLoadMore.success(response.data, true);
						})
						.catch(function (error) {
							// Error || Page does not yet exist
							console.log(error);
							alm.AjaxLoadMore.ajax();
						});
				} else {
					// Standard ALM query
					alm.AjaxLoadMore.ajax();
				}
			} else {
				// Standard ALM query
				alm.AjaxLoadMore.ajax();
			}
		};

		/**
		 * The core Ajax Load More Ajax function.
		 *
		 * @param {string} queryType The type of Ajax request (standard/totalposts).
		 * @since 2.6.0
		 */
		alm.AjaxLoadMore.ajax = function (queryType = 'standard') {
			// Default ALM action
			let action = 'alm_get_posts';

			// ACF Params
			alm.acf_array = '';
			if (alm.extensions.acf) {
				// Custom query for the Repeater / Gallery / Flexible Content field types
				if (alm.extensions.acf_field_type !== 'relationship') {
					action = 'alm_acf';
				}
				alm.acf_array = {
					acf: 'true',
					post_id: alm.extensions.acf_post_id,
					field_type: alm.extensions.acf_field_type,
					field_name: alm.extensions.acf_field_name,
					parent_field_name: alm.extensions.acf_parent_field_name,
				};
			}

			// Term Query Params
			alm.term_query_array = '';
			if (alm.extensions.term_query) {
				action = 'alm_get_terms';
				alm.term_query_array = {
					term_query: 'true',
					taxonomy: alm.extensions.term_query_taxonomy,
					hide_empty: alm.extensions.term_query_hide_empty,
					number: alm.extensions.term_query_number,
				};
			}

			// Nextpage Params
			alm.nextpage_array = '';
			if (alm.addons.nextpage) {
				action = 'alm_nextpage';
				alm.nextpage_array = {
					nextpage: 'true',
					urls: alm.addons.nextpage_urls,
					scroll: alm.addons.nextpage_scroll,
					pageviews: alm.addons.nextpage_pageviews,
					post_id: alm.addons.nextpage_post_id,
					startpage: alm.addons.nextpage_startpage,
					nested: alm.nested,
				};
			}

			// Previous Post Params
			alm.single_post_array = '';
			if (alm.addons.single_post) {
				alm.single_post_array = {
					single_post: 'true',
					id: alm.addons.single_post_id,
					slug: alm.addons.single_post_slug,
				};
			}

			// Comment Params
			alm.comments_array = '';
			if (alm.addons.comments === 'true') {
				action = 'alm_comments';
				alm.posts_per_page = alm.addons.comments_per_page;
				alm.comments_array = {
					comments: 'true',
					post_id: alm.addons.comments_post_id,
					per_page: alm.addons.comments_per_page,
					type: alm.addons.comments_type,
					style: alm.addons.comments_style,
					template: alm.addons.comments_template,
					callback: alm.addons.comments_callback,
				};
			}

			// Users Params
			alm.users_array = '';
			if (alm.addons.users) {
				action = 'alm_users';
				alm.users_array = {
					users: 'true',
					role: alm.listing.dataset.usersRole,
					include: alm.listing.dataset.usersInclude,
					exclude: alm.listing.dataset.usersExclude,
					per_page: alm.posts_per_page,
					order: alm.listing.dataset.usersOrder,
					orderby: alm.listing.dataset.usersOrderby,
				};
			}

			// CTA Params
			alm.cta_array = '';
			if (alm.addons.cta === 'true') {
				alm.cta_array = {
					cta: 'true',
					cta_position: alm.addons.cta_position,
					cta_repeater: alm.addons.cta_repeater,
					cta_theme_repeater: alm.addons.cta_theme_repeater,
				};
			}

			// REST API
			if (alm.extensions.restapi) {
				alm.AjaxLoadMore.restapi(alm, action, queryType);
			}
			// Tabs
			else if (alm.addons.tabs) {
				alm.AjaxLoadMore.tabs(alm);
			}
			// Standard ALM
			else {
				alm.AjaxLoadMore.adminajax(alm, action, queryType);
			}
		};

		/**
		 * Send request to the admin-ajax.php
		 *
		 * @param {object} alm The Ajax Load More object.
		 * @param {string} action The Ajax action.
		 * @param {string} queryType The type of Ajax request (standard/totalposts).
		 * @since 5.0.0
		 */
		alm.AjaxLoadMore.adminajax = function (alm, action, queryType) {
			// Axios Interceptor for nested data objects
			axios.interceptors.request.use((config) => {
				config.paramsSerializer = (params) => {
					// Qs is already included in the Axios package
					return qs.stringify(params, {
						arrayFormat: 'brackets',
						encode: false,
					});
				};
				return config;
			});

			// Get Ajax URL
			let ajaxURL = alm_localize.ajaxurl;

			// Get data params
			let params = queryParams.almGetAjaxParams(alm, action, queryType); // [./helpers/queryParams.js

			// Single Posts Add-on
			// If has `single_post_target`, adjust the Ajax URL to the post URL.
			if (alm.addons.single_post && alm.addons.single_post_target) {
				ajaxURL = `${alm.addons.single_post_permalink}?id=${alm.addons.single_post_id}&alm_page=${parseInt(alm.page) + 1}`;
				params = '';
			}

			// WooCommerce Add-on
			if (alm.addons.woocommerce) {
				ajaxURL = getButtonURL(alm, alm.rel);
				params = '';
			}

			// Elementor Add-on
			if (alm.addons.elementor && alm.addons.elementor_type && alm.addons.elementor_type === 'posts') {
				ajaxURL = getButtonURL(alm, alm.rel);
				params = '';
			}

			// Send HTTP request via axios
			axios
				.get(ajaxURL, { params })
				.then(function (response) {
					// Success
					let data = '';

					if (alm.addons.single_post && alm.addons.single_post_target) {
						// Single Posts
						data = singlePostHTML(response, alm.addons.single_post_target);
						createCacheFile(alm, data.html, 'single');
					} else if (alm.addons.woocommerce) {
						// WooCommerce
						data = wooGetContent(response, alm);
						createCacheFile(alm, data.html, 'woocommerce');
					} else if (alm.addons.elementor) {
						// Elementor
						data = elementorGetContent(response, alm);
						createCacheFile(alm, data.html, 'elementor');
					} else {
						// Get data from response
						data = response.data;
					}

					// Standard Query
					if (queryType === 'standard') {
						alm.AjaxLoadMore.success(data, false);
					} else if (queryType === 'totalpages' && alm.addons.paging && alm.addons.nextpage) {
						// Next Page and Paging
						if (typeof almBuildPagination === 'function') {
							window.almBuildPagination(data.totalpages, alm);
							alm.totalpages = data.totalpages;
						}
					} else if (queryType === 'totalposts' && alm.addons.paging) {
						// Paging
						if (typeof almBuildPagination === 'function') {
							window.almBuildPagination(data.totalposts, alm);
						}
					}
				})
				.catch(function (error) {
					// Error
					alm.AjaxLoadMore.error(error, 'adminajax');
				});
		};

		/**
		 * Ajax Load More Tab functionality.
		 *
		 * @param {object} alm The Ajax Load More object.
		 * @since 5.2.0
		 */
		alm.AjaxLoadMore.tabs = function (alm) {
			let alm_rest_url = `${alm.addons.tabs_resturl}ajaxloadmore/tab`;

			let params = {
				post_id: alm.post_id,
				template: alm.addons.tab_template,
			};

			// Axios Interceptor for nested data objects
			axios.interceptors.request.use((config) => {
				config.paramsSerializer = (params) => {
					// Qs is already included in the Axios package
					return qs.stringify(params, {
						arrayFormat: 'brackets',
						encode: false,
					});
				};
				return config;
			});

			// Send Ajax request
			axios
				.get(alm_rest_url, { params })
				.then(function (response) {
					// Success
					let results = response.data; // Get data from response
					let html = results.html;

					// Create object to pass to success()
					let obj = {
						html: html,
						meta: {
							postcount: 1,
							totalposts: 1,
						},
					};
					alm.AjaxLoadMore.success(obj, false); // Send data

					// Callback to Tabs add-on
					if (typeof almTabLoaded === 'function') {
						window.almTabLoaded(alm);
					}
				})
				.catch(function (error) {
					// Error
					alm.AjaxLoadMore.error(error, 'restapi');
				});
		};

		/**
		 * Send request to the WP REST API
		 *
		 * @param {object} alm The Ajax Load More object.
		 * @param {string} action The Ajax action.
		 * @param {string} queryType The type of Ajax request (standard/totalposts).
		 * @since 5.0.0
		 */
		alm.AjaxLoadMore.restapi = function (alm, action, queryType) {
			let alm_rest_template = wp.template(alm.extensions.restapi_template_id);
			let alm_rest_url = `${alm.extensions.restapi_base_url}/${alm.extensions.restapi_namespace}/${alm.extensions.restapi_endpoint}`;
			let params = queryParams.almGetRestParams(alm); // [./helpers/queryParams.js]

			// Axios Interceptor for nested data objects
			axios.interceptors.request.use((config) => {
				config.paramsSerializer = (params) => {
					// Qs is already included in the Axios package
					return qs.stringify(params, {
						arrayFormat: 'brackets',
						encode: false,
					});
				};
				return config;
			});

			// Send Ajax request
			axios
				.get(alm_rest_url, { params })
				.then(function (response) {
					// Success
					let results = response.data; // Get data from response
					let data = '';
					let html = results.html;
					let meta = results.meta;
					let postcount = meta && meta.postcount ? meta.postcount : 0;
					let totalposts = meta && meta.totalposts ? meta.totalposts : 0;

					// loop results to get data from each
					for (let i = 0; i < html.length; i++) {
						let result = html[i];
						if (alm.restapi_debug === 'true') {
							// If debug
							console.log(result);
						}
						data += alm_rest_template(result);
					}

					// Create object to pass to success()
					let obj = {
						html: data,
						meta: {
							postcount: postcount,
							totalposts: totalposts,
						},
					};
					alm.AjaxLoadMore.success(obj, false); // Send data
				})
				.catch(function (error) {
					// Error
					alm.AjaxLoadMore.error(error, 'restapi');
				});
		};

		// If pagination enabled, run totalposts query
		if (alm.addons.paging) {
			if (alm.addons.nextpage) {
				alm.AjaxLoadMore.ajax('totalpages'); // Create paging menu and query for total pages
			} else {
				alm.AjaxLoadMore.ajax('totalposts'); // Create paging menu and query for total posts
			}
		}

		/**
		 * Success function after loading data.
		 *
		 * @param {object} data The results of the Ajax request.
		 * @param {boolean} is_cache Are results of the Ajax request coming from cache?
		 * @since 2.6.0
		 */
		alm.AjaxLoadMore.success = function (data, is_cache) {
			if (alm.addons.single_post) {
				// Get previous page data
				alm.AjaxLoadMore.getSinglePost();
			}

			let isPaged = false;

			// Create `.alm-reveal` element
			//let reveal = document.createElement('div');
			let reveal = alm.container_type === 'table' ? document.createElement('tbody') : document.createElement('div');
			alm.el = reveal;
			reveal.style.opacity = 0;
			reveal.style.height = 0;
			reveal.style.outline = 'none';

			// Paging container
			let pagingContent = alm.listing.querySelector('.alm-paging-content');

			let html, meta, total;

			if (is_cache) {
				// If Cache, do not look for json data as we won't be querying the DB.
				html = data;
			} else {
				// Standard ALM query results
				html = data.html;
				meta = data.meta;
				total = meta ? parseInt(meta.postcount) : parseInt(alm.posts_per_page);

				let totalposts = typeof meta !== 'undefined' ? meta.totalposts : alm.posts_per_page * 5;
				alm.totalposts = alm.addons.preloaded === 'true' ? totalposts - alm.addons.preloaded_amount : totalposts;
				alm.posts = alm.addons.paging ? total : alm.posts + total;
				alm.debug = meta.debug ? meta.debug : '';

				if (!meta) {
					// Display warning if `meta` is missing.
					console.warn(
						'Ajax Load More: Unable to access `meta` object in Ajax response. There may be an issue in your Repeater Template or another hook causing interference.'
					);
				}
			}

			// Set alm.html as plain text return
			alm.html = html;

			// If cache, get the length of the html object
			total = is_cache ? almDomParser(html).length : total;

			// First Run Only
			if (alm.init) {
				// Set Meta
				if (meta) {
					alm.main.dataset.totalPosts = meta.totalposts ? meta.totalposts : 0;
				}
				// Paging
				if (alm.addons.paging && total > 0) {
					// Add paging containers and content
					alm.AjaxLoadMore.pagingInit(html, 'alm-reveal');
				}
				// ALM Empty
				if (total === 0) {
					if (alm.addons.paging) {
						if (typeof almPagingEmpty === 'function') {
							window.almPagingEmpty(alm);
						}
					}
					if (typeof almEmpty === 'function') {
						window.almEmpty(alm);
					}
					if (alm.no_results) {
						setTimeout(function () {
							almNoResults(alm.content, alm.no_results);
						}, alm.speed + 10);
					}
				}

				// isPaged
				if (alm.isPaged) {
					// Reset the posts_per_page parameter
					alm.posts_per_page = alm.addons.users ? alm.listing.dataset.usersPerPage : alm.listing.dataset.postsPerPage; // Users
					alm.posts_per_page = alm.addons.nextpage ? 1 : alm.posts_per_page; // NextPage

					// SEO add-on
					alm.page = alm.start_page ? alm.start_page - 1 : alm.page; // Set new page #

					// Filters add-on
					if (alm.addons.filters) {
						if (alm.addons.filters_startpage > 0) {
							alm.page = alm.addons.filters_startpage - 1; // Set new page #
							alm.posts_per_page = alm.listing.dataset.postsPerPage; // Reset `filters-startpage` data after the first run
						}
					}
				}
			}

			/**
			 * Display alm_debug results
			 */

			almDebug(alm);

			/**
			 * Set localized variables and Results Text
			 */

			(async () => {
				await setLocalizedVars(alm);
			})();

			/**
			 * Render results
			 */

			if (total > 0) {
				// We have results!

				if (!alm.addons.paging) {
					// Single Posts.
					if (alm.addons.single_post) {
						reveal.setAttribute('class', `alm-reveal alm-single-post post-${alm.addons.single_post_id}${alm.tcc ? ` ${alm.tcc}` : ''}`);
						reveal.dataset.url = alm.addons.single_post_permalink;
						if (alm.addons.single_post_target) {
							reveal.dataset.page = parseInt(alm.page) + 1;
						} else {
							reveal.dataset.page = alm.page;
						}
						reveal.dataset.id = alm.addons.single_post_id;
						reveal.dataset.title = alm.addons.single_post_title;
						reveal.innerHTML = alm.html;

						// Single Post Preview
						if (alm.addons.single_post_preview && alm.addons.single_post_preview_data && typeof almSinglePostCreatePreview === 'function') {
							const singlePreview = window.almSinglePostCreatePreview(reveal, alm.addons.single_post_id, alm.addons.single_post_preview_data);
							reveal.replaceChildren(singlePreview ? singlePreview : reveal);
						}
					} else {
						if (!alm.transition_container) {
							// No transition container
							alm.el = alm.html;
							reveal = alm.container_type === 'table' ? tableWrap(alm.html) : stripEmptyNodes(almDomParser(alm.html, 'text/html'));
						} else {
							// Standard container
							let pagenum;
							let querystring = window.location.search;
							let seo_class = alm.addons.seo ? ' alm-seo' : '';
							let filters_class = alm.addons.filters ? ' alm-filters' : '';
							let preloaded_class = alm.is_preloaded ? ' alm-preloaded' : '';

							// Init, SEO and Filter Paged
							if (alm.init && (alm.start_page > 1 || alm.addons.filters_startpage > 0)) {
								// loop through items and break into separate .alm-reveal divs for paging

								let return_data = [];
								let container_array = [];
								let posts_per_page = parseInt(alm.posts_per_page);
								let pages = Math.ceil(total / posts_per_page);
								isPaged = true;

								// Call to Actions
								if (alm.addons.cta === 'true') {
									posts_per_page = posts_per_page + 1; // Add 1 to posts_per_page for CTAs
									pages = Math.ceil(total / posts_per_page); // Update pages let with new posts_per_page
									total = pages + total; // Get new total w/ CTAs added
								}

								// Parse returned HTML and strip empty nodes
								let data = stripEmptyNodes(almDomParser(alm.html, 'text/html'));

								// Slice data array into individual pages (array)
								for (let i = 0; i < total; i += posts_per_page) {
									return_data.push(data.slice(i, posts_per_page + i));
								}

								// Loop return_data array to build .alm-reveal containers
								for (let k = 0; k < return_data.length; k++) {
									let p = alm.addons.preloaded === 'true' ? 1 : 0; // Add 1 page if items are preloaded.
									let alm_reveal = document.createElement('div');

									if (k > 0 || alm.addons.preloaded === 'true') {
										pagenum = k + 1 + p; // > Paged

										if (alm.addons.seo) {
											// SEO
											alm_reveal = createSEOAttributes(alm, alm_reveal, querystring, seo_class, pagenum);
										}

										if (alm.addons.filters) {
											// Filters
											alm_reveal.setAttribute('class', 'alm-reveal' + filters_class + alm.tcc);
											alm_reveal.dataset.url = alm.canonical_url + buildFilterURL(alm, querystring, pagenum);
											alm_reveal.dataset.page = pagenum;
										}
									} else {
										// First Page
										if (alm.addons.seo) {
											// SEO
											alm_reveal = createSEOAttributes(alm, alm_reveal, querystring, seo_class, 1);
										}
										if (alm.addons.filters) {
											// Filters
											alm_reveal.setAttribute('class', 'alm-reveal' + filters_class + preloaded_class + alm.tcc);
											alm_reveal.dataset.url = alm.canonical_url + buildFilterURL(alm, querystring, 0);
											alm_reveal.dataset.page = '1';
										}
									}

									// Append children to `.alm-reveal` element
									almAppendChildren(alm_reveal, return_data[k]);

									// Run srcSet polyfill
									srcsetPolyfill(alm_reveal, alm.ua);

									// Push alm_reveal elements into container_array
									container_array.push(alm_reveal);
								}

								// Set opacity and height of .alm-listing div to allow for fadein.
								alm.listing.style.opacity = 0;
								alm.listing.style.height = 0;

								// Append container_array to `.alm-listing`
								almAppendChildren(alm.listing, container_array);

								reveal = alm.listing;
								alm.el = reveal;
							}
							// End Init & SEO
							else {
								// Preloaded OR SEO (and Paged)
								if ((alm.addons.seo && alm.page > 0) || alm.addons.preloaded === 'true') {
									let p2 = alm.addons.preloaded === 'true' ? 1 : 0; // Add 1 page if items are preloaded.

									// SEO [Paged]
									pagenum = alm.page + 1 + p2;

									if (alm.addons.seo) {
										// SEO
										reveal = createSEOAttributes(alm, reveal, querystring, seo_class, pagenum);
									} else if (alm.addons.filters) {
										// Filters
										reveal.setAttribute('class', 'alm-reveal' + filters_class + alm.tcc);
										reveal.dataset.url = alm.canonical_url + buildFilterURL(alm, querystring, pagenum);
										reveal.dataset.page = pagenum;
									} else {
										// Basic ALM
										reveal.setAttribute('class', 'alm-reveal' + alm.tcc);
									}
								} else if (alm.addons.filters) {
									// Filters
									reveal.setAttribute('class', 'alm-reveal' + filters_class + alm.tcc);
									reveal.dataset.url = alm.canonical_url + buildFilterURL(alm, querystring, parseInt(alm.page) + 1);
									reveal.dataset.page = parseInt(alm.page) + 1;
								} else {
									if (alm.addons.seo) {
										// SEO [Page 1]
										reveal = createSEOAttributes(alm, reveal, querystring, seo_class, 1);
									} else {
										// Basic ALM
										reveal.setAttribute('class', 'alm-reveal' + alm.tcc);
									}
								}

								reveal.innerHTML = alm.html;
							}
						}
					}

					// WooCommerce Add-on
					if (alm.addons.woocommerce) {
						(async function () {
							await woocommerce(reveal, alm, data.pageTitle);
							woocommerceLoaded(alm);
						})().catch((e) => {
							console.log('Ajax Load More: There was an error loading woocommerce products.', e);
						});

						alm.init = false;
						return; // Exit
					}

					// Elementor Add-on
					if (alm.addons.elementor) {
						(async function () {
							await elementor(reveal, alm, data.pageTitle);
							elementorLoaded(alm);
						})().catch((e) => {
							console.log('Ajax Load More: There was an error loading Elementor items.', e);
						});

						alm.init = false;
						return; // Exit
					}

					// Append `reveal` div to ALM Listing container
					// Do not append when transtion == masonry OR init and !preloaded
					if (alm.transition !== 'masonry' || (alm.init && alm.addons.preloaded !== 'true')) {
						if (!isPaged) {
							if (!alm.transition_container) {
								// No transition container.
								if (alm.images_loaded === 'true') {
									imagesLoaded(reveal, function () {
										almAppendChildren(alm.listing, reveal);

										// Run srcSet polyfill
										srcsetPolyfill(alm.listing, alm.ua);
									});
								} else {
									almAppendChildren(alm.listing, reveal);

									// Run srcSet polyfill.
									srcsetPolyfill(alm.listing, alm.ua);
								}
							} else {
								// Standard container.
								alm.listing.appendChild(reveal);
							}
						}
					}

					/**
					 * Transitions
					 */

					// Masonry
					if (alm.transition === 'masonry') {
						alm.el = alm.listing;

						// Wrap almMasonry in anonymous async/await function
						(async function () {
							await almMasonry(alm, alm.init, alm_is_filtering);
							alm.masonry.init = false;

							alm.AjaxLoadMore.triggerWindowResize();
							alm.AjaxLoadMore.transitionEnd();

							if (typeof almComplete === 'function') {
								window.almComplete(alm);
							}

							// Lazy load images if necessary.
							lazyImages(alm);
						})().catch((e) => {
							console.log('There was an error with ALM Masonry');
						});
					}

					// None
					else if (alm.transition === 'none' && alm.transition_container) {
						if (alm.images_loaded === 'true') {
							imagesLoaded(reveal, function () {
								almFadeIn(reveal, 0);
								alm.AjaxLoadMore.transitionEnd();
							});
						} else {
							almFadeIn(reveal, 0);
							alm.AjaxLoadMore.transitionEnd();
						}
					}

					// Default (Fade)
					else {
						if (alm.images_loaded === 'true') {
							imagesLoaded(reveal, function () {
								if (alm.transition_container) {
									almFadeIn(reveal, alm.speed);
								}
								alm.AjaxLoadMore.transitionEnd();
							});
						} else {
							if (alm.transition_container) {
								almFadeIn(reveal, alm.speed);
							}
							alm.AjaxLoadMore.transitionEnd();
						}
					}

					// TABS - Trigger almTabsSetHeight callback in Tabs add-on
					if (alm.addons.tabs && typeof almTabsSetHeight === 'function') {
						imagesLoaded(reveal, function () {
							almFadeIn(alm.listing, alm.speed);
							setTimeout(function () {
								window.almTabsSetHeight(alm);
							}, alm.speed);
						});
					}
				} else {
					// Paging
					if (!alm.init) {
						if (pagingContent) {
							almFadeOut(pagingContent, alm.speed);
							pagingContent.style.outline = 'none';
							alm.main.classList.remove('alm-loading');

							setTimeout(function () {
								pagingContent.style.opacity = 0;
								pagingContent.innerHTML = alm.html;

								imagesLoaded(pagingContent, function () {
									// Delay for effect
									alm.AjaxLoadMore.triggerAddons(alm);
									almFadeIn(pagingContent, alm.speed);

									// Remove opacity on element to fix CSS transition
									setTimeout(function () {
										pagingContent.style.opacity = '';

										// Insert Script
										insertScript.init(pagingContent);
									}, parseInt(alm.speed) + 10);

									// Paging addon
									if (typeof almOnPagingComplete === 'function') {
										window.almOnPagingComplete(alm);
									}
								});
							}, parseInt(alm.speed) + 25);
						}
					} else {
						setTimeout(function () {
							alm.main.classList.remove('alm-loading');
							alm.AjaxLoadMore.triggerAddons(alm);
						}, alm.speed);
					}
					// End Paging
				}

				// ALM Loaded, run complete callbacks
				imagesLoaded(reveal, function () {
					// Nested
					alm.AjaxLoadMore.nested(reveal);

					// Insert Script
					insertScript.init(alm.el);

					// Trigger almComplete
					if (typeof almComplete === 'function' && alm.transition !== 'masonry') {
						window.almComplete(alm);
					}

					// Lazy load images if necessary
					lazyImages(alm);

					// Filters Add-on Complete
					if (alm_is_filtering && alm.addons.filters) {
						if (typeof almFiltersAddonComplete === 'function') {
							// Filters Add-on
							window.almFiltersAddonComplete(el);
						}
					}
					alm_is_filtering = false;

					// Tabs Complete
					if (alm.addons.tabs) {
						// Tabs Complete
						if (typeof almTabsComplete === 'function') {
							// Standard Filtering
							window.almTabsComplete();
						}
					}

					// ALM Done
					if (!alm.addons.cache) {
						// Not Cache & Single Post
						if (alm.posts >= alm.totalposts && !alm.addons.single_post) {
							alm.AjaxLoadMore.triggerDone();
						}
					} else {
						// Cache
						if (alm.addons.nextpage && alm.localize) {
							// Nextpage
							if (parseInt(alm.localize.page) === parseInt(alm.localize.total_posts)) {
								alm.AjaxLoadMore.triggerDone();
							}
						} else {
							if (total < parseInt(alm.posts_per_page)) {
								alm.AjaxLoadMore.triggerDone();
							}
						}
					}
					// End ALM Done
				});
				// End ALM Loaded

				// Filters onLoad
				if (typeof almFiltersOnload === 'function' && alm.init) {
					window.almFiltersOnload(alm);
				}
			} else {
				/**
				 * No results from Ajax
				 */

				alm.AjaxLoadMore.noresults();
			}

			// Destroy After
			if (alm.destroy_after !== undefined && alm.destroy_after !== '') {
				let currentPage = alm.page + 1; // Add 1 because alm.page starts at 0
				currentPage = alm.addons.preloaded === 'true' ? currentPage++ : currentPage; // Add 1 for preloaded
				if (currentPage == alm.destroy_after) {
					// Disable ALM if page = alm.destroy_after val
					alm.AjaxLoadMore.destroyed();
				}
			}

			/**
			 * Display Table of Contents
			 */

			tableOfContents(alm, alm.init);

			/**
			 * Set Focus for A11y
			 */

			if (alm.transition !== 'masonry') {
				setFocus(alm, reveal, total, alm_is_filtering);
			}

			// Remove filtering class
			if (alm.main.classList.contains('alm-is-filtering')) {
				alm.main.classList.remove('alm-is-filtering');
			}

			// Set init flag
			alm.init = false;
		};

		/**
		 * Function runs when no results are returned.
		 *
		 * @since 5.3.1
		 */
		alm.AjaxLoadMore.noresults = function () {
			if (!alm.addons.paging) {
				// Add .done class, reset btn text
				setTimeout(function () {
					alm.button.classList.remove('loading');
					alm.button.classList.add('done');
				}, alm.speed);
				alm.AjaxLoadMore.resetBtnText();
			}

			// Trigger almComplete
			if (typeof almComplete === 'function' && alm.transition !== 'masonry') {
				window.almComplete(alm);
			}

			// Filters Add-on Complete
			if (alm_is_filtering && alm.addons.filters) {
				if (typeof almFiltersAddonComplete === 'function') {
					// Filters Add-on
					almFiltersAddonComplete(el);
				}
				alm_is_filtering = false;
			}

			// Tabs Complete
			if (alm.addons.tabs) {
				// Tabs Complete
				if (typeof almTabsComplete === 'function') {
					// Standard Filtering
					almTabsComplete();
				}
			}

			// Masonry, clear `alm-listing` height
			if (alm.transition === 'masonry') {
				alm.content.style.height = 'auto';
			}

			alm.AjaxLoadMore.triggerDone(); // ALM Done
		};

		/**
		 * pagingPreloadedInit
		 * First run for Paging + Preloaded add-ons
		 * Moves preloaded content into ajax container
		 *
		 * @param {data} Results of the Ajax request
		 * @since 2.11.3
		 */
		alm.AjaxLoadMore.pagingPreloadedInit = function (data) {
			data = data == null ? '' : data; // Check for null data object

			// Add paging containers and content
			alm.AjaxLoadMore.pagingInit(data, 'alm-reveal');

			if (data === '') {
				if (typeof almPagingEmpty === 'function') {
					window.almPagingEmpty(alm);
				}
				if (typeof almEmpty === 'function') {
					window.almEmpty(alm);
				}
				if (alm.no_results) {
					almNoResults(alm.content, alm.no_results);
				}
			}
		};

		/**
		 * pagingNextpageInit
		 * First run for Paging + Next Page add-ons
		 * Moves .alm-nextpage content into ajax container
		 *
		 * @param {data} Results of Ajax request
		 * @since 2.14.0
		 */
		alm.AjaxLoadMore.pagingNextpageInit = function (data) {
			data = data == null ? '' : data; // Check for null data object

			// Add paging containers and content
			alm.AjaxLoadMore.pagingInit(data, 'alm-reveal alm-nextpage');

			// Set up Nextpage Vars
			if (typeof almSetNextPageVars === 'function') {
				window.almSetNextPageVars(alm); // Next Page Add-on
			}
		};

		/**
		 * pagingInit
		 * First run for Paging + (Preloaded & Next Page) add-ons. Create required containers.
		 *
		 * @param {data} Ajax results
		 * @param {classes} added classes
		 * @since 5.0
		 */
		alm.AjaxLoadMore.pagingInit = function (data, classes = 'alm-reveal') {
			data = data == null ? '' : data; // Check for null data object

			// Create `alm-reveal` container
			let reveal = document.createElement('div');
			reveal.setAttribute('class', classes);

			// Create `alm-paging-loading` container
			let content = document.createElement('div');
			content.setAttribute('class', 'alm-paging-content' + alm.tcc);
			content.innerHTML = data;
			reveal.appendChild(content);

			// Create `alm-paging-content` container
			let loader = document.createElement('div');
			loader.setAttribute('class', 'alm-paging-loading');
			reveal.appendChild(loader);

			// Add div to container
			alm.listing.appendChild(reveal);

			// Get/Set height of .alm-listing div
			let styles = window.getComputedStyle(alm.listing);
			let pTop = parseInt(styles.getPropertyValue('padding-top').replace('px', ''));
			let pBtm = parseInt(styles.getPropertyValue('padding-bottom').replace('px', ''));
			let h = reveal.offsetHeight;

			// Set initial `.alm-listing` height
			alm.listing.style.height = h + pTop + pBtm + 'px';

			// Insert Script
			insertScript.init(reveal);

			// Reset button text
			alm.AjaxLoadMore.resetBtnText();

			// Delay reveal of paging to avoid positioning issues
			setTimeout(function () {
				if (typeof almFadePageControls === 'function') {
					window.almFadePageControls(alm.btnWrap);
				}
				if (typeof almOnWindowResize === 'function') {
					window.almOnWindowResize(alm);
				}
				// Remove loading class from main container
				alm.main.classList.remove('loading');
			}, alm.speed);
		};

		/**
		 *	nested
		 *	Automatically trigger nested ALM instances (Requies `.alm-reveal` container
		 *
		 * @param {object} instance
		 * @since 5.0
		 */
		alm.AjaxLoadMore.nested = function (reveal) {
			if (!reveal || !alm.transition_container) {
				return false; // Exit if not `transition_container`
			}
			let nested = reveal.querySelectorAll('.ajax-load-more-wrap'); // Get all instances
			if (nested) {
				nested.forEach(function (element) {
					window.almInit(element);
				});
			}
		};

		/**
		 *  Get the Single Posts post ID via ajax.
		 *
		 *  @since 2.7.4
		 */
		if (alm.addons.single_post_id) {
			alm.fetchingPreviousPost = false;
			alm.addons.single_post_init = true;
		}

		alm.AjaxLoadMore.getSinglePost = function () {
			let action = 'alm_get_single';

			if (alm.fetchingPreviousPost) {
				return false;
			}
			alm.fetchingPreviousPost = true;

			// Get Ajax URL.
			let ajaxURL = alm_localize.ajaxurl;

			// Get data params
			let params = {
				id: alm.addons.single_post_id,
				initial_id: alm.addons.single_post_init_id,
				order: alm.addons.single_post_order,
				taxonomy: alm.addons.single_post_taxonomy,
				excluded_terms: alm.addons.single_post_excluded_terms,
				post_type: alm.post_type,
				init: alm.addons.single_post_init,
				action: action,
			};

			// Send HTTP request via Axios
			axios
				.get(ajaxURL, { params })
				.then(function (response) {
					// Success
					let data = response.data; // Get data from response

					if (data.has_previous_post) {
						alm.listing.dataset.singlePostId = data.prev_id; // Update single-post-id on instance
						alm.addons.single_post_id = data.prev_id;
						alm.addons.single_post_permalink = data.prev_permalink;
						alm.addons.single_post_title = data.prev_title;
						alm.addons.single_post_slug = data.prev_slug;
					} else {
						if (!data.has_previous_post) {
							alm.AjaxLoadMore.triggerDone();
						}
					}
					if (typeof window.almSetSinglePost === 'function') {
						window.almSetSinglePost(alm, data.current_id, data.permalink, data.title);
					}
					alm.fetchingPreviousPost = false;
					alm.addons.single_post_init = false;
				})
				.catch(function (error) {
					// Error
					alm.AjaxLoadMore.error(error, 'getSinglePost');
					alm.fetchingPreviousPost = false;
				});
		};

		/**
		 * Triggers various add-on functions (if available) after load complete.
		 *
		 * @since 2.14.0
		 */
		alm.AjaxLoadMore.triggerAddons = function (alm) {
			if (typeof almSetNextPage === 'function' && alm.addons.nextpage) {
				// Next Page
				window.almSetNextPage(alm);
			}
			if (typeof almSEO === 'function' && alm.addons.seo) {
				// SEO
				window.almSEO(alm, false);
			}
			if (typeof almWooCommerce === 'function' && alm.addons.woocommerce) {
				// WooCommerce
				window.almWooCommerce(alm);
			}
			if (typeof almElementor === 'function' && alm.addons.elementor) {
				// Elementor
				window.almElementor(alm);
			}
		};

		/**
		 * Fires a set of actions and functions when ALM has no other posts to load.
		 *
		 * @since 2.11.3
		 */
		alm.AjaxLoadMore.triggerDone = function () {
			alm.loading = false;
			alm.finished = true;
			hidePlaceholder(alm);

			if (!alm.addons.paging) {
				// Update button text
				if (alm.button_done_label !== false) {
					setTimeout(function () {
						alm.button.innerHTML = alm.button_done_label;
					}, 75);
				}

				alm.button.classList.add('done');
				alm.button.removeAttribute('rel');
				alm.button.disabled = true;
			}

			// almDone
			if (typeof almDone === 'function') {
				// Delay done until animations complete
				setTimeout(function () {
					window.almDone(alm);
				}, alm.speed + 10);
			}
		};

		/**
		 * Fires a set of actions once ALm Previous hits the first page.
		 *
		 * @since 5.5.0
		 */
		alm.AjaxLoadMore.triggerDonePrev = function () {
			alm.loading = false;
			hidePlaceholder(alm);

			if (!alm.addons.paging) {
				// Update button text
				// if (alm.button_done_label !== false) {
				// 	setTimeout(function () {
				// 		alm.button.innerHTML = alm.button_done_label;
				// 	}, 75);
				// }

				alm.buttonPrev.classList.add('done');
				alm.buttonPrev.removeAttribute('rel');
				alm.buttonPrev.disabled = true;
			}

			// almDonePrev
			if (typeof almDonePrev === 'function') {
				// Delay done until animations complete
				setTimeout(function () {
					window.almDonePrev(alm);
				}, alm.speed + 10);
			}
		};

		/**
		 * Resets the loading button text after loading has completed.
		 *
		 * @since 2.8.4
		 */
		alm.AjaxLoadMore.resetBtnText = function () {
			if (alm.button_loading_label !== false && !alm.addons.paging) {
				alm.button.innerHTML = alm.button_label;
			}
		};

		/**
		 * Error function after failed data attempt.
		 *
		 * @since 2.6.0
		 */
		alm.AjaxLoadMore.error = function (error, location = null) {
			alm.loading = false;
			if (!alm.addons.paging) {
				alm.button.classList.remove('loading');
				alm.AjaxLoadMore.resetBtnText();
			}

			console.log('Error: ', error);
			if (error.response) {
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				//console.log(error.response.data);
				//console.log(error.response.status);
				//console.log(error.response.headers);
				console.log('Error Msg: ', error.message);
			} else if (error.request) {
				// The request was made but no response was received
				// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
				// http.ClientRequest in node.js
				console.log(error.request);
			} else {
				// Something happened in setting up the request that triggered an Error
				console.log('Error Msg: ', error.message);
			}

			if (location) {
				console.log('ALM Error started in ' + location);
			}

			if (error.config) {
				console.log('ALM Error Debug: ', error.config);
			}
		};

		/**
		 * Button click handler to load posts.
		 *
		 * @param {Object} e The target button element.
		 * @since 4.2.0
		 */
		alm.AjaxLoadMore.click = function (e) {
			let button = e.target || e.currentTarget;
			alm.rel = 'next';
			if (alm.pause === 'true') {
				alm.pause = false;
				alm.pause_override = false;
				alm.AjaxLoadMore.loadPosts();
			}
			if (!alm.loading && !alm.finished && !button.classList.contains('done')) {
				alm.loading = true;
				alm.page++;
				alm.AjaxLoadMore.loadPosts();
			}
			button.blur(); // Remove button focus
		};

		/**
		 * Button click handler for previous load more.
		 *
		 * @param {Object} e The target button element.
		 * @since 5.5.0
		 */
		alm.AjaxLoadMore.prevClick = function (e) {
			let button = e.target || e.currentTarget;
			e.preventDefault();
			if (!alm.loading && !button.classList.contains('done')) {
				alm.loading = true;
				alm.pagePrev--;
				alm.rel = 'prev';
				alm.AjaxLoadMore.loadPosts();
				button.blur(); // Remove button focus
			}
		};

		/**
		 * Set the Load Previous button to alm object.
		 *
		 * @param {HTMLElement} button The button element.
		 * @since 5.5.0
		 */
		alm.AjaxLoadMore.setPreviousButton = function (button) {
			alm.pagePrev = alm.page;
			alm.buttonPrev = button;
		};

		/**
		 * Load More button click event handler.
		 *
		 * @since 1.0.0
		 */
		if (!alm.addons.paging && !alm.fetchingPreviousPost) {
			alm.button.onclick = alm.AjaxLoadMore.click;
		}

		/**
		 * Window resize functions for Paging, Scroll Distance Percentage, Tabs etc.
		 *
		 * @since 2.1.2
		 * @updated 5.2
		 */
		if (alm.addons.paging || alm.addons.tabs || alm.scroll_distance_perc || alm.scroll_direction === 'horizontal') {
			let resize;
			alm.window.onresize = function () {
				clearTimeout(resize);
				resize = setTimeout(function (e) {
					if (alm.addons.tabs) {
						// Tabs
						if (typeof almOnTabsWindowResize === 'function') {
							window.almOnTabsWindowResize(alm);
						}
					}
					if (alm.addons.paging) {
						// Paging
						if (typeof almOnWindowResize === 'function') {
							window.almOnWindowResize(alm);
						}
					}
					if (alm.scroll_distance_perc) {
						alm.scroll_distance = getScrollPercentage(alm);
					}
					if (alm.scroll_direction === 'horizontal') {
						alm.AjaxLoadMore.horizontal();
					}
				}, alm.speed);
			};
		}

		/**
		 * Check to see if element is visible before loading posts.
		 *
		 * @since 2.1.2
		 */
		alm.AjaxLoadMore.isVisible = function () {
			// Check for a width and height to determine visibility
			alm.visible = alm.main.clientWidth > 0 && alm.main.clientHeight > 0 ? true : false;
			return alm.visible;
		};

		/**
		 * Trigger a window resize browser function.
		 *
		 * @since 5.3.1
		 */
		alm.AjaxLoadMore.triggerWindowResize = function () {
			if (typeof Event === 'function') {
				// modern browsers
				window.dispatchEvent(new Event('resize'));
			} else {
				//This will be executed on old browsers and especially IE
				let resizeEvent = window.document.createEvent('UIEvents');
				resizeEvent.initUIEvent('resize', true, false, window, 0);
				window.dispatchEvent(resizeEvent);
			}
		};

		/**
		 * Load posts as user scrolls the page.
		 *
		 * @since 1.0
		 * @updated 4.2.0
		 */
		alm.AjaxLoadMore.scroll = function () {
			if (alm.timer) {
				clearTimeout(alm.timer);
			}

			alm.timer = setTimeout(function () {
				if (alm.AjaxLoadMore.isVisible() && !alm.fetchingPreviousPost) {
					let trigger = alm.trigger.getBoundingClientRect();
					let btnPos = Math.round(trigger.top - alm.window.innerHeight) + alm.scroll_distance;
					let scrollTrigger = btnPos <= 0 ? true : false;

					// Scroll Container
					if (alm.window !== window) {
						let scrollHeight = alm.main.offsetHeight; // ALM height
						let scrollWidth = alm.main.offsetWidth; // ALM Width
						let scrollPosition = '';

						if (alm.scroll_direction === 'horizontal') {
							// Left/Right
							alm.AjaxLoadMore.horizontal();
							scrollPosition = Math.round(alm.window.scrollLeft + alm.window.offsetWidth - alm.scroll_distance); // How far user has scrolled
							scrollTrigger = scrollWidth <= scrollPosition ? true : false;
						} else {
							// Up/Down
							scrollPosition = Math.round(alm.window.scrollTop + alm.window.offsetHeight - alm.scroll_distance); // How far user has scrolled
							scrollTrigger = scrollHeight <= scrollPosition ? true : false;
						}
					}

					// If Pause && Pause Override
					if (
						!alm.loading &&
						!alm.finished &&
						scrollTrigger &&
						alm.page < alm.max_pages - 1 &&
						alm.proceed &&
						alm.pause === 'true' &&
						alm.pause_override === 'true'
					) {
						alm.button.click();
					}

					// Standard Scroll
					else {
						if (!alm.loading && !alm.finished && scrollTrigger && alm.page < alm.max_pages - 1 && alm.proceed && alm.pause !== 'true') {
							alm.button.click();
						}
					}
				}
			}, 25);
		};

		/**
		 * Add scroll eventlisteners, only when needed.
		 *
		 * @since 5.2.0
		 */
		alm.AjaxLoadMore.scrollSetup = function () {
			if (alm.scroll && !alm.addons.paging) {
				if (alm.scroll_container !== '') {
					// Scroll Container
					alm.window = document.querySelector(alm.scroll_container) ? document.querySelector(alm.scroll_container) : alm.window;
					setTimeout(function () {
						// Delay to allow for ALM container to resize on load.
						alm.AjaxLoadMore.horizontal();
					}, 500);
				}
				alm.window.addEventListener('scroll', alm.AjaxLoadMore.scroll); // Scroll
				alm.window.addEventListener('touchstart', alm.AjaxLoadMore.scroll); // Touch Devices
				alm.window.addEventListener('wheel', function (e) {
					// Mousewheel
					let direction = Math.sign(e.deltaY);
					if (direction > 0) {
						alm.AjaxLoadMore.scroll();
					}
				});
				alm.window.addEventListener('keyup', function (e) {
					// End, Page Down
					let code = e.key ? e.key : e.code;
					switch (code) {
						case 35:
						case 34:
							alm.AjaxLoadMore.scroll();
							break;
					}
				});
			}
		};

		/**
		 * Configure horizontal scroll settings.
		 *
		 * @since 5.3.6
		 */
		alm.AjaxLoadMore.horizontal = function () {
			if (alm.scroll_direction === 'horizontal') {
				alm.main.style.width = `${alm.listing.offsetWidth}px`;
			}
		};

		/**
		 * Destroy Ajax Load More functionality.
		 *
		 * @since 3.4.2
		 */
		alm.AjaxLoadMore.destroyed = function () {
			alm.disable_ajax = true;
			if (!alm.addons.paging) {
				alm.button.style.display = 'none';
				alm.AjaxLoadMore.triggerDone();
				if (typeof almDestroyed === 'function') {
					window.almDestroyed(alm);
				}
			}
		};

		/**
		 * Set variables after loading transiton completes.
		 *
		 * @since 3.5
		 */
		alm.AjaxLoadMore.transitionEnd = function () {
			setTimeout(function () {
				alm.AjaxLoadMore.resetBtnText();
				alm.main.classList.remove('alm-loading');
				// Loading button
				if (alm.rel === 'prev') {
					alm.buttonPrev.classList.remove('loading');
				} else {
					alm.button.classList.remove('loading');
				}
				alm.AjaxLoadMore.triggerAddons(alm);
				if (!alm.addons.paging) {
					setTimeout(function () {
						alm.loading = false; // Delay to prevent loading to fast
					}, alm.speed * 3);
				}
			}, 50);
			hidePlaceholder(alm);
		};

		/**
		 * Set individual localized variable.
		 *
		 * @param {string} name
		 * @param {string} value
		 * @since 4.1
		 */
		alm.AjaxLoadMore.setLocalizedVar = function (name = '', value = '') {
			if (alm.localize && name !== '' && value !== '') {
				alm.localize[name] = value.toString(); // Set ALM localize var
				window[alm.master_id + '_vars'][name] = value.toString(); // Update global window obj vars
			}
		};

		/**
		 * Init Ajax load More functionality and add-ons.
		 *
		 * @since 2.0
		 */
		alm.AjaxLoadMore.init = function () {
			// Preloaded and destroy_after is 1
			if (alm.addons.preloaded === 'true' && alm.destroy_after == 1) {
				alm.AjaxLoadMore.destroyed();
			}

			if (!alm.addons.paging && !alm.addons.single_post) {
				if (alm.disable_ajax) {
					alm.finished = true;
					alm.button.classList.add('done');
				} else {
					// Set button label.
					alm.button.innerHTML = alm.button_label;
					// If Pause.
					if (alm.pause === 'true') {
						alm.loading = false;
					} else {
						alm.AjaxLoadMore.loadPosts();
					}
				}
			}

			// Single Post Add-on
			if (alm.addons.single_post) {
				alm.AjaxLoadMore.getSinglePost(); // Set next post on load
				alm.loading = false;

				// Trigger done if custom query and no posts to render
				if (alm.addons.single_post_query && alm.addons.single_post_order === '') {
					alm.AjaxLoadMore.triggerDone();
				}

				// Display Table of Contents
				tableOfContents(alm, true, true);
			}

			// Preloaded + SEO && !Paging
			if (alm.addons.preloaded === 'true' && alm.addons.seo && !alm.addons.paging) {
				// Delay for scripts to load
				setTimeout(function () {
					if (typeof almSEO === 'function' && alm.start_page < 1) {
						window.almSEO(alm, true);
					}
				}, alm.speed);
			}

			// Preloaded && !Paging
			if (alm.addons.preloaded === 'true' && !alm.addons.paging) {
				// Delay for scripts to load
				setTimeout(function () {
					// triggerDone
					if (alm.addons.preloaded_total_posts <= parseInt(alm.addons.preloaded_amount)) {
						alm.AjaxLoadMore.triggerDone();
					}
					// almEmpty
					if (alm.addons.preloaded_total_posts == 0) {
						if (typeof almEmpty === 'function') {
							window.almEmpty(alm);
						}
						if (alm.no_results) {
							almNoResults(alm.content, alm.no_results);
						}
					}
				}, alm.speed);
			}

			// Preloaded Add-on ONLY
			if (alm.addons.preloaded === 'true') {
				if (alm.resultsText) {
					resultsText.almInitResultsText(alm, 'preloaded');
				}

				// Display Table of Contents
				tableOfContents(alm, alm.init, true);
			}

			// Next Page Add-on
			if (alm.addons.nextpage) {
				// Check that posts remain on load
				if (alm.listing.querySelector('.alm-nextpage') && !alm.addons.paging) {
					let nextpage_pages = alm.listing.querySelectorAll('.alm-nextpage'); // All Next Page Items

					if (nextpage_pages) {
						let nextpage_first = nextpage_pages[0];
						let nextpage_total = nextpage_first.dataset.totalPosts ? parseInt(nextpage_first.dataset.totalPosts) : alm.localize.total_posts;

						// Disable if last page loaded
						if (nextpage_pages.length === nextpage_total || parseInt(nextpage_first.dataset.id) === nextpage_total) {
							alm.AjaxLoadMore.triggerDone();
						}
					}
				}

				// Results Text.
				if (alm.resultsText) {
					resultsText.almInitResultsText(alm, 'nextpage');
				}

				// Display Table of Contents
				tableOfContents(alm, alm.init, true);
			}

			// WooCommerce Add-on.
			if (alm.addons.woocommerce) {
				wooInit(alm);

				// Trigger `Done` if `paged is less than `pages`.
				if (alm.addons.woocommerce_settings.paged >= parseInt(alm.addons.woocommerce_settings.pages)) {
					alm.AjaxLoadMore.triggerDone();
				}
			}

			// Elementor Add-on.
			if (alm.addons.elementor && alm.addons.elementor_type && alm.addons.elementor_type === 'posts') {
				elementorInit(alm);

				// Trigger `Done` if `elementor_next_page_url` is empty
				if (alm.addons.elementor_next_page_url === '') {
					alm.AjaxLoadMore.triggerDone();
				}
			}

			// Window Load (Masonry + Preloaded).
			alm.window.addEventListener('load', function () {
				if (alm.transition === 'masonry' && alm.addons.preloaded === 'true') {
					// Wrap almMasonry in anonymous async/await function
					(async function () {
						await almMasonry(alm, true, false);
						alm.masonry.init = false;
					})().catch((e) => {
						console.log('There was an error with ALM Masonry');
					});
				}
				if (typeof almOnLoad === 'function') {
					window.almOnLoad(alm);
				}
			});
		};

		/**
		 * Update Current Page.
		 * Callback function triggered from paging add-on.
		 *
		 * @since 2.7.0
		 */
		window.almUpdateCurrentPage = function (current, obj, alm) {
			alm.page = current;
			alm.page = alm.addons.nextpage && !alm.addons.paging ? alm.page - 1 : alm.page; // Next Page add-on

			let data = '';
			let target = '';

			if (alm.addons.paging_init && alm.addons.preloaded === 'true') {
				// Paging + Preloaded Firstrun
				target = alm.listing.querySelector('.alm-reveal') || alm.listing.querySelector('.alm-nextpage');
				if (target) {
					data = target.innerHTML; // Get content
					target.parentNode.removeChild(target); // Remove target
					alm.addons.preloaded_amount = 0; // Reset preloaded
					alm.AjaxLoadMore.pagingPreloadedInit(data);
				}
				alm.addons.paging_init = false;
				alm.init = false;
			} else if (alm.addons.paging_init && alm.addons.nextpage) {
				// Paging + Next Page on firstrun
				target = alm.listing.querySelector('.alm-reveal') || alm.listing.querySelector('.alm-nextpage');
				if (target) {
					data = target.innerHTML; // Get content
					target.parentNode.removeChild(target); // Remove target
					alm.AjaxLoadMore.pagingNextpageInit(data);
				}
				alm.addons.paging_init = false;
				alm.init = false;
			} else {
				// Standard Paging
				alm.AjaxLoadMore.loadPosts();
			}
		};

		/**
		 * Get the parent ALM container.
		 *
		 * @since 2.7.0
		 * @return element
		 */
		window.almGetParentContainer = function () {
			return alm.listing;
		};

		/**
		 * Returns the current ALM obj.
		 *
		 * @param {string} specific obj
		 * @since 2.7.0
		 * @return object
		 */
		window.almGetObj = function (obj = '') {
			if (obj !== '') {
				return alm[obj]; // Return specific param
			} else {
				return alm; // Return the entire alm object
			}
		};

		/**
		 * Trigger ajaxloadmore from any element on page.
		 *
		 * @since 2.12.0
		 */
		window.almTriggerClick = function () {
			alm.button.click();
		};

		// Flag to prevent loading of posts on initial page load.
		setTimeout(function () {
			alm.proceed = true;
			alm.AjaxLoadMore.scrollSetup();
		}, 500);

		// Init Ajax Load More
		alm.AjaxLoadMore.init();
	};

	// End ajaxloadmore

	/**
	 *  Initiate instance of Ajax load More
	 *
	 *  @since 5.0
	 */
	window.almInit = function (el, id = 0) {
		new ajaxloadmore(el, id);
	};

	/**
	 * Initiate Ajax load More if div is present on screen
	 *
	 * @since 2.1.2
	 */
	let alm_instances = document.querySelectorAll('.ajax-load-more-wrap');
	if (alm_instances.length) {
		[...alm_instances].forEach((alm, index) => {
			new ajaxloadmore(alm, index);
		});
	}
})();

/**
 * Filter an Ajax Load More instance.
 *
 * @since 5.0
 * @param {*} transition
 * @param {*} speed
 * @param {*} data
 */
let filter = function (transition = 'fade', speed = '200', data = '') {
	if (!transition || !speed || !data) {
		return false;
	}
	alm_is_filtering = true;
	almFilter(transition, speed, data, 'filter');
};
export { filter };

/**
 * Reset an Ajax Load More instance.
 *
 * @since 5.3.8
 * @param {*} target
 */
let reset = function (props = {}) {
	let data = {};
	alm_is_filtering = true;

	if (props && props.target) {
		data = {
			target: target,
		};
	}

	if (props && props.type === 'woocommerce') {
		// WooCommerce
		(async function () {
			let instance = document.querySelector('.ajax-load-more-wrap .alm-listing[data-woo="true"]'); // Get ALM instance
			let settings = await wooReset(); // Get WooCommerce `settings` via Ajax
			if (settings) {
				instance.dataset.wooSettings = settings; // Update data atts
				almFilter('fade', '100', data, 'filter');
			}
		})().catch(() => {
			console.warn('Ajax Load More: There was an resetting the Ajax Load More instance.');
		});
	} else {
		// Standard ALM
		almFilter('fade', '200', data, 'filter');
	}
};
export { reset };

/**
 * Tabbed content for Ajax Load More instance.
 *
 * @since 5.2
 * @param {*} data
 * @param {*} url
 */
let tab = function (data = '', url = false) {
	let transition = 'fade';
	let speed = alm_localize.speed ? parseInt(alm_localize.speed) : 200;

	if (!data) {
		return false;
	}

	alm_is_filtering = true;
	almFilter(transition, speed, data, 'tab');
};
export { tab };

/**
 * Track Page Views in Google Analytics.
 *
 * @since 5.0
 * @param {*} path
 */
let tracking = function (path) {
	setTimeout(function () {
		// Delay to allow for state change.
		path = path.replace(/\/\//g, '/'); // Replace instance of a double backslash.

		if (typeof gtag === 'function') {
			// Gtag GA Tracking
			gtag('event', 'page_view', {
				page_title: document.title,
				page_location: window.location.href,
				page_path: window.location.pathname,
			});
			if (alm_localize.ga_debug) {
				console.log('Pageview sent to Google Analytics (gtag)');
			}
		}

		if (typeof ga === 'function') {
			// Deprecated GA Tracking
			ga('set', 'page', path);
			ga('send', 'pageview');
			if (alm_localize.ga_debug) {
				console.log('Pageview sent to Google Analytics (ga)');
			}
		}

		if (typeof __gaTracker === 'function') {
			// Monster Insights
			__gaTracker('set', 'page', path);
			__gaTracker('send', 'pageview');
			if (alm_localize.ga_debug) {
				console.log('Pageview sent to Google Analytics (__gaTracker)');
			}
		}

		// Dispatch global Analytics callback
		if (typeof almAnalytics === 'function') {
			window.almAnalytics(path);
		}
	}, 250);
};
export { tracking };

/**
 * Trigger Ajax Load More from other events.
 *
 * @since 5.0
 * @param {*} el
 */
let start = function (el) {
	if (!el) {
		return false;
	}
	window.almInit(el);
};
export { start };

/**
 *  Scroll window to position (global function).
 *
 *  @since 5.0
 *  @param {*} position
 */
let almScroll = function (position) {
	if (!position) {
		return false;
	}
	window.scrollTo({
		top: position,
		behavior: 'smooth',
	});
};
export { almScroll };

/**
 *  Get the current top/left coordinates of an element relative to the document.
 *
 *  @since 5.0
 *  @param {*} el
 */
let getOffset = function (el = null) {
	if (!el) {
		return false;
	}
	let rect = el.getBoundingClientRect(),
		scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
		scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
};
export { getOffset };

/**
 *  ALM Render (in progress)
 *
 *  @since 5.0
 */
let render = function (el, options = null) {
	if (!el) {
		return false;
	}
	// console.log(el, options);
};
export { render };
