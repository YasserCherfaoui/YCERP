<?php
/**
 * Plugin Name: Simple WooCommerce Referral Tracker
 * Plugin URI: https://github.com/YasserCherfaoui/
 * Description: Simple referral system that captures referral codes from URL and saves to order meta
 * Version: 1.0.0
 * Author: Yasser Cherfaoui
 * License: GPL v2 or later
 * Requires at least: 5.0
 * Tested up to: 6.3
 * WC requires at least: 5.0
 * WC tested up to: 8.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Check if WooCommerce is active
if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
    add_action('admin_notices', function() {
        echo '<div class="notice notice-error"><p>Simple WooCommerce Referral Tracker requires WooCommerce to be installed and active.</p></div>';
    });
    return;
}

class SimpleWooCommerceReferralTracker {
    
    private $cookie_name = 'wc_referral_code';
    private $cookie_duration = 30; // days
    
    public function __construct() {
        // Use plugins_loaded to ensure WooCommerce is fully loaded
        add_action('plugins_loaded', array($this, 'init'));
    }
    
    /**
     * Initialize the plugin after all plugins are loaded
     */
    public function init() {
        if (!class_exists('WooCommerce')) {
            return;
        }
        
        // Hook into WordPress - use template_redirect for better timing
        add_action('template_redirect', array($this, 'capture_referral_code'), 1);
        
        // WooCommerce hooks with higher priority
        add_action('woocommerce_checkout_create_order', array($this, 'save_referral_to_order'), 5, 2);
        add_action('woocommerce_checkout_order_processed', array($this, 'save_referral_to_processed_order'), 5, 3);
        add_action('woocommerce_thankyou', array($this, 'clear_referral_cookie'), 20);
        
        // Admin hooks
        add_action('woocommerce_admin_order_data_after_billing_address', array($this, 'display_referral_in_admin'));
        
        // Add to checkout fields for debugging
        add_action('woocommerce_after_order_notes', array($this, 'add_referral_field_to_checkout'));
        add_action('woocommerce_checkout_update_order_meta', array($this, 'save_referral_checkout_field'));
    }
    
    /**
     * Capture referral code from URL parameter - improved version
     */
    public function capture_referral_code() {
        // Only run on frontend
        if (is_admin() || wp_doing_ajax()) {
            return;
        }
        
        // Check for referral parameter
        if (isset($_GET['ref']) && !empty($_GET['ref'])) {
            $referral_code = sanitize_text_field(trim($_GET['ref']));
            
            // Enhanced validation
            if ($this->is_valid_referral_code($referral_code)) {
                $this->store_referral_code($referral_code);
                
                // Redirect to clean URL only if not already processing
                if (!isset($_POST['woocommerce_checkout_place_order']) && 
                    !is_cart() && 
                    !is_checkout() && 
                    !isset($_GET['wc-ajax'])) {
                    
                    $clean_url = remove_query_arg('ref');
                    if ($clean_url !== $_SERVER['REQUEST_URI']) {
                        wp_safe_redirect($clean_url, 302);
                        exit;
                    }
                }
            }
        }
    }
    
    /**
     * Validate referral code
     */
    private function is_valid_referral_code($code) {
        // Basic validation
        return (strlen($code) > 0 && 
                strlen($code) <= 50 && 
                preg_match('/^[a-zA-Z0-9_-]+$/', $code));
    }
    
    /**
     * Store referral code in multiple ways
     */
    private function store_referral_code($referral_code) {
        $cookie_duration_seconds = $this->cookie_duration * 24 * 60 * 60;
        
        // Store in cookie with better parameters
        $cookie_set = setcookie(
            $this->cookie_name, 
            $referral_code, 
            time() + $cookie_duration_seconds, 
            COOKIEPATH ?: '/', 
            COOKIE_DOMAIN ?: '', 
            is_ssl(), 
            true
        );
        
        // Also set in $_COOKIE immediately for same-request access
        $_COOKIE[$this->cookie_name] = $referral_code;
        
        // Start session safely and store there too
        if (!session_id()) {
            @session_start();
        }
        $_SESSION[$this->cookie_name] = $referral_code;
        
        // Store in WooCommerce session if available
        if (function_exists('WC') && WC()->session) {
            WC()->session->set('referral_code', $referral_code);
        }
        
        // Store in user meta if logged in
        if (is_user_logged_in()) {
            update_user_meta(get_current_user_id(), '_temp_referral_code', $referral_code);
        }
    }
    
    /**
     * Get stored referral code - check multiple sources
     */
    private function get_stored_referral_code() {
        $referral_code = null;
        
        // Check WooCommerce session first (most reliable)
        if (function_exists('WC') && WC()->session) {
            $referral_code = WC()->session->get('referral_code');
            if ($referral_code) {
                return sanitize_text_field($referral_code);
            }
        }
        
        // Check cookie
        if (isset($_COOKIE[$this->cookie_name])) {
            $referral_code = sanitize_text_field($_COOKIE[$this->cookie_name]);
            if ($referral_code) {
                return $referral_code;
            }
        }
        
        // Check session
        if (!session_id()) {
            @session_start();
        }
        if (isset($_SESSION[$this->cookie_name])) {
            $referral_code = sanitize_text_field($_SESSION[$this->cookie_name]);
            if ($referral_code) {
                return $referral_code;
            }
        }
        
        // Check user meta if logged in
        if (is_user_logged_in()) {
            $referral_code = get_user_meta(get_current_user_id(), '_temp_referral_code', true);
            if ($referral_code) {
                return sanitize_text_field($referral_code);
            }
        }
        
        // Check POST data (from hidden field)
        if (isset($_POST['referral_code']) && !empty($_POST['referral_code'])) {
            return sanitize_text_field($_POST['referral_code']);
        }
        
        return null;
    }
    
    /**
     * Add hidden referral field to checkout
     */
    public function add_referral_field_to_checkout($checkout) {
        $referral_code = $this->get_stored_referral_code();
        
        if ($referral_code) {
            echo '<input type="hidden" name="referral_code" value="' . esc_attr($referral_code) . '">';
            
            // Debug info (remove in production)
            if (defined('WP_DEBUG') && WP_DEBUG) {
                echo '<!-- Referral Code Found: ' . esc_html($referral_code) . ' -->';
            }
        }
    }
    
    /**
     * Save referral code to order meta - primary method
     */
    public function save_referral_to_order($order, $data) {
        $referral_code = $this->get_stored_referral_code();
        
        if ($referral_code) {
            $this->add_referral_to_order($order, $referral_code);
        }
    }
    
    /**
     * Save referral code to processed order - backup method
     */
    public function save_referral_to_processed_order($order_id, $posted_data, $order) {
        // Check if referral already saved
        if ($order->get_meta('_referral_code')) {
            return;
        }
        
        $referral_code = $this->get_stored_referral_code();
        
        if ($referral_code) {
            $this->add_referral_to_order($order, $referral_code);
        }
    }
    
    /**
     * Save referral from checkout field - third backup method
     */
    public function save_referral_checkout_field($order_id) {
        if (isset($_POST['referral_code']) && !empty($_POST['referral_code'])) {
            $order = wc_get_order($order_id);
            if ($order && !$order->get_meta('_referral_code')) {
                $referral_code = sanitize_text_field($_POST['referral_code']);
                $this->add_referral_to_order($order, $referral_code);
            }
        }
    }
    
    /**
     * Add referral data to order
     */
    private function add_referral_to_order($order, $referral_code) {
        if (empty($referral_code)) {
            return;
        }
        
        // Save referral code to order meta
        $order->update_meta_data('_referral_code', $referral_code);
        
        // Save timestamp when referral was applied
        $order->update_meta_data('_referral_applied_date', current_time('mysql'));
        
        // Add order note
        $order->add_order_note('Referral code applied: ' . $referral_code);
        
        // Save the order to ensure meta is persisted
        $order->save();
        
        // Log for debugging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Referral code saved to order ' . $order->get_id() . ': ' . $referral_code);
        }
    }
    
    /**
     * Clear referral cookie after successful order
     */
    public function clear_referral_cookie($order_id) {
        // Clear cookie
        setcookie($this->cookie_name, '', time() - 3600, COOKIEPATH ?: '/', COOKIE_DOMAIN ?: '');
        unset($_COOKIE[$this->cookie_name]);
        
        // Clear session
        if (!session_id()) {
            @session_start();
        }
        if (isset($_SESSION[$this->cookie_name])) {
            unset($_SESSION[$this->cookie_name]);
        }
        
        // Clear WooCommerce session
        if (function_exists('WC') && WC()->session) {
            WC()->session->__unset('referral_code');
        }
        
        // Clear user meta if logged in
        if (is_user_logged_in()) {
            delete_user_meta(get_current_user_id(), '_temp_referral_code');
        }
    }
    
    /**
     * Display referral code in admin order page
     */
    public function display_referral_in_admin($order) {
        $referral_code = $order->get_meta('_referral_code');
        $referral_date = $order->get_meta('_referral_applied_date');
        
        if ($referral_code) {
            echo '<div class="address">';
            echo '<p><strong>🎯 Referral Code:</strong> <span style="background: #e7f3ff; padding: 2px 6px; border-radius: 3px;">' . esc_html($referral_code) . '</span></p>';
            if ($referral_date) {
                echo '<p><strong>Applied:</strong> ' . esc_html(date('Y-m-d H:i:s', strtotime($referral_date))) . '</p>';
            }
            echo '</div>';
        }
    }
}

// Initialize the plugin
new SimpleWooCommerceReferralTracker();

// Helper functions for accessing referral data

/**
 * Get referral code from an order
 * @param int $order_id
 * @return string|null
 */
function wc_get_order_referral_code($order_id) {
    $order = wc_get_order($order_id);
    if ($order) {
        return $order->get_meta('_referral_code');
    }
    return null;
}

/**
 * Check if order has referral code
 * @param int $order_id
 * @return bool
 */
function wc_order_has_referral($order_id) {
    return !empty(wc_get_order_referral_code($order_id));
}

/**
 * Get all orders with referral codes
 * @param array $args Additional WC_Order_Query arguments
 * @return array
 */
function wc_get_orders_with_referrals($args = array()) {
    $default_args = array(
        'meta_key' => '_referral_code',
        'meta_compare' => 'EXISTS',
        'return' => 'objects'
    );
    
    $args = wp_parse_args($args, $default_args);
    
    return wc_get_orders($args);
}