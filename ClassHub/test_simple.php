<?php
header('Content-Type: text/html; charset=utf-8');
require_once 'config/db.php';

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test de Grupos - POI ClassHub</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 { 
            color: #667eea; 
            margin-bottom: 30px;
            text-align: center;
            font-size: 2em;
        }
        h2 { 
            color: #444; 
            margin: 25px 0 15px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
        }
        h3 { 
            color: #666; 
            margin: 15px 0 10px 0;
        }
        table { 
            width: 100%;
            border-collapse: collapse; 
            margin: 15px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        th, td { 
            padding: 12px; 
            border: 1px solid #e0e0e0;
            text-align: left;
        }
        th { 
            background: #667eea; 
            color: white;
            font-weight: 600;
        }
        tr:nth-child(even) {
            background: #f5f5f5;
        }
        .success {
            background: #e8f5e9;
            padding: 15px;
            border-left: 4px solid #4caf50;
            margin: 10px 0;
            border-radius: 4px;
        }
        .error {
            background: #ffebee;
            padding: 20px;
            border-left: 4px solid #f44336;
            margin: 10px 0;
            border-radius: 4px;
        }
        .info {
            background: #e3f2fd;
            padding: 15px;
            border-left: 4px solid #2196f3;
            margin: 10px 0;
            border-radius: 4px;
        }
        .warning {
            background: #fff3e0;
            padding: 15px;
            border-left: 4px solid #ff9800;
            margin: 10px 0;
            border-radius: 4px;
        }
        pre {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            border: 1px solid #e0e0e0;
        }
        code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        hr {
            border: none;
            border-top: 2px solid #e0e0e0;
            margin: 30px 0;
        }
        .step {
            background: #f9f9f9;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Test de API de Grupos</h1>
        
        <?php
        try {
            // Datos de prueba
            $nombre = "Grupo Copa Mundial 2026";
            $tipo = "grupal";
            $creador_id = 1;
            $miembros = [1, 2, 3];
            
            echo '<div class="step">';
            echo "<h2>📋 Paso 1: Verificando estructura de tablas</h2>";
            
            // Ver estructura de grupos
            echo "<h3>Tabla: <code>grupos</code></h3>";
            $stmt = $conn->query("SHOW COLUMNS FROM grupos");
            echo "<table><thead><tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Default</th></tr></thead><tbody>";
            $columnasGrupos = [];
            while($col = $stmt->fetch()) {
                $columnasGrupos[] = $col['Field'];
                echo "<tr>";
                echo "<td><strong>{$col['Field']}</strong></td>";
                echo "<td>{$col['Type']}</td>";
                echo "<td>{$col['Null']}</td>";
                echo "<td>" . ($col['Default'] ?? 'NULL') . "</td>";
                echo "</tr>";
            }
            echo "</tbody></table>";
            
            // Ver estructura de grupo_miembros
            echo "<h3>Tabla: <code>grupo_miembros</code></h3>";
            $stmt = $conn->query("SHOW COLUMNS FROM grupo_miembros");
            echo "<table><thead><tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Default</th></tr></thead><tbody>";
            $columnasGM = [];
            while($col = $stmt->fetch()) {
                $columnasGM[] = $col['Field'];
                echo "<tr>";
                echo "<td><strong>{$col['Field']}</strong></td>";
                echo "<td>{$col['Type']}</td>";
                echo "<td>{$col['Null']}</td>";
                echo "<td>" . ($col['Default'] ?? 'NULL') . "</td>";
                echo "</tr>";
            }
            echo "</tbody></table>";
            echo '</div>';
            
            // Verificar usuarios de prueba
            echo '<div class="step">';
            echo "<h2>👥 Paso 1.5: Verificando usuarios de prueba</h2>";
            $stmt = $conn->query("SELECT id, nombre_usuario, email FROM usuarios LIMIT 5");
            $usuarios = $stmt->fetchAll();
            
            if(count($usuarios) == 0) {
                echo '<div class="warning">';
                echo "<p><strong>⚠️ Advertencia:</strong> No hay usuarios en la base de datos. Creando usuarios de prueba...</p>";
                echo '</div>';
                
                // Crear usuarios de prueba
                $usuariosPrueba = [
                    ['usuario1', 'usuario1@classhub.com', password_hash('123456', PASSWORD_DEFAULT)],
                    ['usuario2', 'usuario2@classhub.com', password_hash('123456', PASSWORD_DEFAULT)],
                    ['usuario3', 'usuario3@classhub.com', password_hash('123456', PASSWORD_DEFAULT)]
                ];
                
                $stmt = $conn->prepare("INSERT INTO usuarios (nombre_usuario, email, password) VALUES (?, ?, ?)");
                foreach($usuariosPrueba as $u) {
                    $stmt->execute($u);
                }
                
                echo '<div class="success">';
                echo "<p>✅ Se crearon 3 usuarios de prueba</p>";
                echo '</div>';
                
                // Recargar usuarios
                $stmt = $conn->query("SELECT id, nombre_usuario, email FROM usuarios LIMIT 5");
                $usuarios = $stmt->fetchAll();
            }
            
            echo "<h3>Usuarios disponibles:</h3>";
            echo "<table><thead><tr><th>ID</th><th>Usuario</th><th>Email</th></tr></thead><tbody>";
            foreach($usuarios as $u) {
                echo "<tr><td>{$u['id']}</td><td>{$u['nombre_usuario']}</td><td>{$u['email']}</td></tr>";
            }
            echo "</tbody></table>";
            echo '</div>';
            
            echo '<div class="step">';
            echo "<h2>🔧 Paso 2: Creando grupo de prueba</h2>";
            
            // Iniciar transacción
            $conn->beginTransaction();
            
            // Verificar qué columnas usar
            $tieneDescripcion = in_array('descripcion', $columnasGrupos);
            $tieneFotoGrupo = in_array('foto_grupo', $columnasGrupos);
            
            // Construir SQL dinámico
            $camposGrupo = ['nombre', 'tipo', 'creado_por'];
            $valoresGrupo = [$nombre, $tipo, $creador_id];
            
            if($tieneDescripcion) {
                $camposGrupo[] = 'descripcion';
                $valoresGrupo[] = 'Grupo de prueba para el simulador de Copa Mundial FIFA 2026';
            }
            
            if($tieneFotoGrupo) {
                $camposGrupo[] = 'foto_grupo';
                $valoresGrupo[] = 'grupo_default.png';
            }
            
            $placeholders = str_repeat('?,', count($camposGrupo) - 1) . '?';
            $campos = implode(', ', $camposGrupo);
            
            $sqlGrupo = "INSERT INTO grupos ($campos) VALUES ($placeholders)";
            
            echo '<div class="info">';
            echo "<p><strong>SQL a ejecutar:</strong></p>";
            echo "<code>$sqlGrupo</code>";
            echo "<p><strong>Valores:</strong> " . implode(', ', array_map(function($v) { return "'" . $v . "'"; }, $valoresGrupo)) . "</p>";
            echo '</div>';
            
            $stmt = $conn->prepare($sqlGrupo);
            $stmt->execute($valoresGrupo);
            $grupo_id = $conn->lastInsertId();
            
            echo '<div class="success">';
            echo "<p>✅ <strong>Grupo creado exitosamente</strong></p>";
            echo "<p>ID del grupo: <strong>$grupo_id</strong></p>";
            echo "<p>Nombre: <strong>$nombre</strong></p>";
            echo "<p>Tipo: <strong>$tipo</strong></p>";
            echo '</div>';
            echo '</div>';
            
            echo '<div class="step">';
            echo "<h2>👥 Paso 3: Agregando miembros al grupo</h2>";
            
            // Detectar el nombre correcto de la columna timestamp
            $columnaTimestamp = 'unido_en';
            if(in_array('fecha_union', $columnasGM)) {
                $columnaTimestamp = 'fecha_union';
            } elseif(in_array('created_at', $columnasGM)) {
                $columnaTimestamp = 'created_at';
            }
            
            echo '<div class="info">';
            echo "<p>Columna de timestamp detectada: <code>$columnaTimestamp</code></p>";
            echo '</div>';
            
            // Verificar si hay columna 'rol'
            $tieneRol = in_array('rol', $columnasGM);
            
            $camposMiembro = ['grupo_id', 'usuario_id', $columnaTimestamp];
            if($tieneRol) {
                $camposMiembro[] = 'rol';
            }
            
            $placeholdersMiembro = str_repeat('?,', count($camposMiembro) - 1) . '?';
            $camposMiembroStr = implode(', ', $camposMiembro);
            
            $sqlMiembro = "INSERT INTO grupo_miembros ($camposMiembroStr) VALUES ($placeholdersMiembro)";
            
            echo '<div class="info">';
            echo "<p><strong>SQL para miembros:</strong></p>";
            echo "<code>$sqlMiembro</code>";
            echo '</div>';
            
            $stmt = $conn->prepare($sqlMiembro);
            
            foreach($miembros as $index => $usuario_id) {
                $valores = [$grupo_id, $usuario_id, date('Y-m-d H:i:s')];
                
                if($tieneRol) {
                    $rol = ($usuario_id == $creador_id) ? 'admin' : 'miembro';
                    $valores[] = $rol;
                }
                
                $stmt->execute($valores);
                
                echo '<div class="success">';
                echo "<p>✅ Usuario ID <strong>$usuario_id</strong> agregado al grupo";
                if($tieneRol && $usuario_id == $creador_id) {
                    echo " (como <strong>admin</strong>)";
                }
                echo "</p>";
                echo '</div>';
            }
            
            $conn->commit();
            echo '</div>';
            
            echo '<hr>';
            
            echo '<div class="step" style="background: #e8f5e9;">';
            echo "<h2 style='color: #2e7d32;'>🎉 ¡ÉXITO! Grupo creado correctamente</h2>";
            
            // Mostrar resultado del grupo
            $stmt = $conn->prepare("SELECT * FROM grupos WHERE id = ?");
            $stmt->execute([$grupo_id]);
            $grupo = $stmt->fetch();
            
            echo "<h3>📊 Datos del grupo:</h3>";
            echo "<table><thead><tr><th>Campo</th><th>Valor</th></tr></thead><tbody>";
            foreach($grupo as $key => $value) {
                if(!is_numeric($key)) {
                    echo "<tr><td><strong>$key</strong></td><td>$value</td></tr>";
                }
            }
            echo "</tbody></table>";
            
            // Mostrar miembros
            $stmt = $conn->prepare("
                SELECT gm.*, u.nombre_usuario, u.email 
                FROM grupo_miembros gm
                JOIN usuarios u ON gm.usuario_id = u.id
                WHERE gm.grupo_id = ?
            ");
            $stmt->execute([$grupo_id]);
            $miembros_bd = $stmt->fetchAll();
            
            echo "<h3>👥 Miembros del grupo (" . count($miembros_bd) . "):</h3>";
            echo "<table><thead><tr><th>ID</th><th>Usuario</th><th>Email</th>";
            if($tieneRol) echo "<th>Rol</th>";
            echo "<th>Unión</th></tr></thead><tbody>";
            foreach($miembros_bd as $m) {
                echo "<tr>";
                echo "<td>{$m['usuario_id']}</td>";
                echo "<td>{$m['nombre_usuario']}</td>";
                echo "<td>{$m['email']}</td>";
                if($tieneRol) echo "<td>{$m['rol']}</td>";
                echo "<td>{$m[$columnaTimestamp]}</td>";
                echo "</tr>";
            }
            echo "</tbody></table>";
            echo '</div>';
            
            echo '<div class="info" style="margin-top: 20px;">';
            echo "<h3>✨ Próximos pasos:</h3>";
            echo "<ol>";
            echo "<li>El grupo ha sido creado exitosamente en la base de datos</li>";
            echo "<li>Puedes probar la API de grupos con este ID: <strong>$grupo_id</strong></li>";
            echo "<li>Los usuarios pueden empezar a enviar mensajes al grupo</li>";
            echo "</ol>";
            echo '</div>';
            
        } catch(PDOException $e) {
            if($conn->inTransaction()) {
                $conn->rollBack();
            }
            
            echo '<div class="error">';
            echo "<h2 style='color: #c62828;'>❌ Error en la ejecución</h2>";
            echo "<p><strong>Mensaje:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
            echo "<p><strong>Código:</strong> " . $e->getCode() . "</p>";
            echo "<p><strong>Archivo:</strong> " . $e->getFile() . "</p>";
            echo "<p><strong>Línea:</strong> " . $e->getLine() . "</p>";
            
            echo "<h3>Stack Trace:</h3>";
            echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
            echo '</div>';
            
            echo '<div class="warning">';
            echo "<h3>💡 Posibles soluciones:</h3>";
            echo "<ul>";
            echo "<li>Verifica que todas las tablas existan en la base de datos</li>";
            echo "<li>Asegúrate de que las columnas necesarias estén creadas</li>";
            echo "<li>Revisa que el archivo <code>config/db.php</code> tenga la conexión correcta</li>";
            echo "<li>Verifica que los usuarios de prueba existan en la tabla usuarios</li>";
            echo "</ul>";
            echo '</div>';
        }
        ?>
    </div>
</body>
</html>