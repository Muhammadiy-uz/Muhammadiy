<?php
/**
 * Основные параметры WordPress.
 *
 * Скрипт для создания wp-config.php использует этот файл в процессе установки.
 * Необязательно использовать веб-интерфейс, можно скопировать файл в "wp-config.php"
 * и заполнить значения вручную.
 *
 * Этот файл содержит следующие параметры:
 *
 * * Настройки MySQL
 * * Секретные ключи
 * * Префикс таблиц базы данных
 * * ABSPATH
 *
 * @link https://ru.wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Параметры MySQL: Эту информацию можно получить у вашего хостинг-провайдера ** //
/** Имя базы данных для WordPress */
define( 'DB_NAME', 'mk' );

/** Имя пользователя MySQL */
define( 'DB_USER', 'root' );

/** Пароль к базе данных MySQL */
define( 'DB_PASSWORD', '' );

/** Имя сервера MySQL */
define( 'DB_HOST', 'localhost' );

/** Кодировка базы данных для создания таблиц. */
define( 'DB_CHARSET', 'utf8mb4' );

/** Схема сопоставления. Не меняйте, если не уверены. */
define( 'DB_COLLATE', '' );

/**#@+
 * Уникальные ключи и соли для аутентификации.
 *
 * Смените значение каждой константы на уникальную фразу. Можно сгенерировать их с помощью
 * {@link https://api.wordpress.org/secret-key/1.1/salt/ сервиса ключей на WordPress.org}.
 *
 * Можно изменить их, чтобы сделать существующие файлы cookies недействительными.
 * Пользователям потребуется авторизоваться снова.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'dzYh#~riH|t+9Ov#kS$B-:FNGjN{I*2qj[_)HKMn0SUOf;:U/:~FEKxTCw8vSvOy' );
define( 'SECURE_AUTH_KEY',  '|z#1,rm5+|v`jfgnN1-{!KTS-Y+z~p <7je,_?&{JP~GT`#>;?GG*2j9juo8LiWZ' );
define( 'LOGGED_IN_KEY',    '4@2/?si@C@hznHsR)tyqpcB8tmu0=X6_e!abl@XACcIC/Ck]d}c5Bw} I}c Ge1|' );
define( 'NONCE_KEY',        'lmm*B]! <ST/o@laJ+uL 0s`T}bDciVX6tXuO,KqHkDc50zt;VHw[u 23o8tF@<6' );
define( 'AUTH_SALT',        'J>K$Sm{Dh#tUi1~fM;8;2C>yPHg-U1](Q?6ZnB+w~Z_@qQou/2cEwDqAdWKZ` fU' );
define( 'SECURE_AUTH_SALT', 'PqTg]>G`66Sjt!-?riI4Yk%|<,jQr/]=R%?R7`-Hq%&Y?D~7#`O.CK4V5?H[Rt;#' );
define( 'LOGGED_IN_SALT',   '@Wi{$x|+Q~yX2qAcArapr~~[Yfph-]pr14Hg=KS;J(7nrU+o@gBLtb<I<Jq;jD9|' );
define( 'NONCE_SALT',       ':IIT D)aio60qMB_>%9>=SNmL<5uzX5p(f*ia[tZN#evu$mHcesDR`WC8kiSS[U2' );

/**#@-*/

/**
 * Префикс таблиц в базе данных WordPress.
 *
 * Можно установить несколько сайтов в одну базу данных, если использовать
 * разные префиксы. Пожалуйста, указывайте только цифры, буквы и знак подчеркивания.
 */
$table_prefix = 'wp_';

/**
 * Для разработчиков: Режим отладки WordPress.
 *
 * Измените это значение на true, чтобы включить отображение уведомлений при разработке.
 * Разработчикам плагинов и тем настоятельно рекомендуется использовать WP_DEBUG
 * в своём рабочем окружении.
 *
 * Информацию о других отладочных константах можно найти в документации.
 *
 * @link https://ru.wordpress.org/support/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* Произвольные значения добавляйте между этой строкой и надписью "дальше не редактируем". */



/* Это всё, дальше не редактируем. Успехов! */

/** Абсолютный путь к директории WordPress. */
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/' );
}

/** Инициализирует переменные WordPress и подключает файлы. */
require_once ABSPATH . 'wp-settings.php';
