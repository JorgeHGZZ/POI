<?php

define('DB_HOST', 'localhost');
define('DB_NAME', 'poi_classhub');
define('DB_USER', 'root');
define('DB_PASS', ''); 
define('DB_CHARSET', 'utf8mb4');

try {

    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    
    $conn = new PDO($dsn, DB_USER, DB_PASS, $options);
    
} catch(PDOException $e) {
    // Manejo de errores
    error_log("Error de conexión: " . $e->getMessage());
    die("Error de conexión: SQLSTATE[HY000] [1049] Unknown database '" . DB_NAME . "'");
}
?>