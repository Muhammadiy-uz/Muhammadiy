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
define( 'DB_NAME', 'mu' );

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
define( 'AUTH_KEY',         'Fiyqz[Ao8Wr/^I(JV#<.P_Un<tK&{g^b@eTtZ6c68}ES#-wqxFcsa0u*;+Bgbzod' );
define( 'SECURE_AUTH_KEY',  '-#7b$&gr|]v@w/!NoGb6B%2I3Mm)3A9eS)1Nz)|(|?!*/~A_<R!x2q]Mm>IJgZ`u' );
define( 'LOGGED_IN_KEY',    '?R_m!)S4m5|:6JUMf@Uf[LuU92as$|HfUg=sT*OEh.rbY(i2Ck;lbiy.4w(#mdW^' );
define( 'NONCE_KEY',        '~^el:IsbW:#|yQ*@Rn@j6UC[O+bT;bkwOglmd_rpGzx1NP0UP>lb&MS8}tl,LVQK' );
define( 'AUTH_SALT',        'hA!b{u;!B<,CKrXkDP4?j+cz3@uI3|}RC0%u!uo7fB,Rf|;LngVh02(+f_+pJ@o:' );
define( 'SECURE_AUTH_SALT', 'h8 X-AeY$8W#.#xqtw*%7tv<lij1n5w6tG|`+V%]sw^remIwIL%r:< e_)Wsk~*B' );
define( 'LOGGED_IN_SALT',   '&25ORwK|enf[Etg~nTRQGi.,FqsDu(y60<k_-936OwL-v/7:K:u-W7<0.A(;[jBF' );
define( 'NONCE_SALT',       '*9q=bAx6jV W^!WKeI#^Fmw3(61Q$5jN.Lq1M)R(52)g]~A&_%%OkiVQ=Y;B2r^0' );

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
