<?php
echo "<h1 style='color: green;'>✅ ¡Conexión funcionando!</h1>";

// Incluir archivo de conexión
require_once 'config/db.php';

try {
    // Probar consulta
    $stmt = $conn->query("SELECT COUNT(*) as total FROM USUARIOS");
    $result = $stmt->fetch();
    
    echo "<p style='color: green; font-size: 20px;'>✅ Conectado a la base de datos 'poi_classhub'</p>";
    echo "<p style='font-size: 18px;'>👥 Total de usuarios: <strong>" . $result['total'] . "</strong></p>";
    
    // Mostrar todas las tablas
    $stmt = $conn->query("SHOW TABLES");
    $tablas = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "<h3>📊 Tablas disponibles:</h3>";
    echo "<ul>";
    foreach ($tablas as $tabla) {
        echo "<li>$tabla</li>";
    }
    echo "</ul>";
    
    echo "<hr>";
    echo "<p style='color: blue;'>🎉 ¡Todo está listo! Ahora puedes conectar tus páginas HTML a la base de datos.</p>";
    
} catch(PDOException $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>