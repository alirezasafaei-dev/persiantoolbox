<?php
/**
 * Plugin Name: جعبه ابزار فارسی — ابزارک
 * Plugin URI: https://persiantoolbox.ir/developers
 * Description: افزودن ابزارک جعبه ابزار فارسی به وب‌سایت وردپرسی شما
 * Version: 1.0.0
 * Author: PersianToolbox
 * Author URI: https://persiantoolbox.ir
 * License: GPL v2 or later
 * Text Domain: persiantoolbox-widget
 */

defined('ABSPATH') || exit;

define('PTB_WIDGET_VERSION', '1.0.0');
define('PTB_WIDGET_URL', 'https://persiantoolbox.ir/widget.js');

class PersianToolbox_Widget {
  private static $instance = null;

  public static function get_instance() {
    if (null === self::$instance) self::$instance = new self();
    return self::$instance;
  }

  private function __construct() {
    add_action('wp_footer', [$this, 'inject_widget']);
    add_action('admin_menu', [$this, 'add_admin_menu']);
    add_action('admin_init', [$this, 'register_settings']);
    add_filter('plugin_action_links_' . plugin_basename(__FILE__), [$this, 'action_links']);
  }

  public function get_option($key, $default = '') {
    $opts = get_option('ptb_widget_settings', []);
    return isset($opts[$key]) ? $opts[$key] : $default;
  }

  public function inject_widget() {
    $enabled = $this->get_option('enabled', '1');
    if ('0' === $enabled) return;

    $theme = esc_attr($this->get_option('theme', 'auto'));
    $pos = esc_attr($this->get_option('position', 'bl'));

    echo '<!-- جعبه ابزار فارسی -->' . "\n";
    echo '<script src="' . PTB_WIDGET_URL . '" data-theme="' . $theme . '" data-position="' . $pos . '"></script>' . "\n";
  }

  public function add_admin_menu() {
    add_options_page(
      'جعبه ابزار فارسی',
      'جعبه ابزار فارسی',
      'manage_options',
      'persiantoolbox-widget',
      [$this, 'settings_page']
    );
  }

  public function register_settings() {
    register_setting('ptb_widget_settings_group', 'ptb_widget_settings', [$this, 'sanitize']);
  }

  public function sanitize($input) {
    return [
      'enabled' => isset($input['enabled']) ? '1' : '0',
      'theme' => in_array($input['theme'] ?? '', ['auto', 'light', 'dark']) ? $input['theme'] : 'auto',
      'position' => in_array($input['position'] ?? '', ['bl', 'br']) ? $input['position'] : 'bl',
    ];
  }

  public function settings_page() {
    $enabled = $this->get_option('enabled', '1');
    $theme = $this->get_option('theme', 'auto');
    $position = $this->get_option('position', 'bl');
?>
<div class="wrap">
  <h1><?php echo esc_html__('تنظیمات جعبه ابزار فارسی', 'persiantoolbox-widget'); ?></h1>
  <form method="post" action="options.php">
    <?php settings_fields('ptb_widget_settings_group'); ?>
    <table class="form-table">
      <tr>
        <th scope="row"><?php _e('فعال/غیرفعال', 'persiantoolbox-widget'); ?></th>
        <td>
          <label>
            <input type="checkbox" name="ptb_widget_settings[enabled]" value="1" <?php checked('1', $enabled); ?>>
            <?php _e('نمایش ابزارک در وب‌سایت', 'persiantoolbox-widget'); ?>
          </label>
        </td>
      </tr>
      <tr>
        <th scope="row"><?php _e('پوسته', 'persiantoolbox-widget'); ?></th>
        <td>
          <select name="ptb_widget_settings[theme]">
            <option value="auto" <?php selected('auto', $theme); ?>><?php _e('خودکار (بر اساس سیستم)', 'persiantoolbox-widget'); ?></option>
            <option value="light" <?php selected('light', $theme); ?>><?php _e('روشن', 'persiantoolbox-widget'); ?></option>
            <option value="dark" <?php selected('dark', $theme); ?>><?php _e('تاریک', 'persiantoolbox-widget'); ?></option>
          </select>
        </td>
      </tr>
      <tr>
        <th scope="row"><?php _e('موقعیت', 'persiantoolbox-widget'); ?></th>
        <td>
          <select name="ptb_widget_settings[position]">
            <option value="bl" <?php selected('bl', $position); ?>><?php _e('پایین چپ', 'persiantoolbox-widget'); ?></option>
            <option value="br" <?php selected('br', $position); ?>><?php _e('پایین راست', 'persiantoolbox-widget'); ?></option>
          </select>
        </td>
      </tr>
    </table>
    <?php submit_button(); ?>
  </form>
  <hr>
  <p><strong><?php _e('راهنمای سریع', 'persiantoolbox-widget'); ?></strong></p>
  <ol>
    <li><?php _e('تنظیمات مورد نظر را انتخاب کنید.', 'persiantoolbox-widget'); ?></li>
    <li><?php _e('ذخیره کنید.', 'persiantoolbox-widget'); ?></li>
    <li><?php _e('ابزارک به صورت خودکار در تمام صفحات نمایش داده می‌شود.', 'persiantoolbox-widget'); ?></li>
    <li><?php printf(__('برای اطلاعات بیشتر: <a href="%s" target="_blank">persiantoolbox.ir</a>', 'persiantoolbox-widget'), 'https://persiantoolbox.ir'); ?></li>
  </ol>
</div>
<?php
  }

  public function action_links($links) {
    $settings_link = '<a href="' . admin_url('options-general.php?page=persiantoolbox-widget') . '">' . __('تنظیمات', 'persiantoolbox-widget') . '</a>';
    array_unshift($links, $settings_link);
    return $links;
  }
}

PersianToolbox_Widget::get_instance();
