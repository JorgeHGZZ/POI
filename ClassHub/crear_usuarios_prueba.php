<?php
header('Content-Type: application/json');
require_once 'config/db.php';

try {
    // Datos de usuarios de prueba
    $usuarios = [
        ['email' => 'usuario1@test.com', 'nombre_usuario' => 'Juan Pérez', 'password' => password_hash('123456', PASSWORD_DEFAULT)],
        ['email' => 'usuario2@test.com', 'nombre_usuario' => 'María García', 'password' => password_hash('123456', PASSWORD_DEFAULT)],
        ['email' => 'usuario3@test.com', 'nombre_usuario' => 'Carlos López', 'password' => password_hash('123456', PASSWORD_DEFAULT)],
        ['email' => 'usuario4@test.com', 'nombre_usuario' => 'Ana Martínez', 'password' => password_hash('123456', PASSWORD_DEFAULT)],
        ['email' => 'usuario5@test.com', 'nombre_usuario' => 'Luis Rodríguez', 'password' => password_hash('123456', PASSWORD_DEFAULT)]
    ];
    
    $stmt = $conn->prepare("
        INSERT INTO usuarios (email, nombre_usuario, password, estado_conexion) 
        VALUES (?, ?, ?, 'offline')
        ON DUPLICATE KEY UPDATE nombre_usuario = VALUES(nombre_usuario)
    ");
    
    $creados = [];
    foreach($usuarios as $usuario) {
        $stmt->execute([$usuario['email'], $usuario['nombre_usuario'], $usuario['password']]);
        $creados[] = [
            'email' => $usuario['email'],
            'nombre' => $usuario['nombre_usuario']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'message' => count($creados) . ' usuarios creados/actualizados',
        'usuarios' => $creados
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>