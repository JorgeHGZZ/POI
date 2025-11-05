<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['usuario_id'])) {
            obtenerGruposDeUsuario($_GET['usuario_id']);
        } elseif(isset($_GET['grupo_id'])) {
            obtenerDetallesGrupo($_GET['grupo_id']);
        }
        break;
    
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        crearGrupo($data);
        break;
    
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        agregarMiembros($data);
        break;
    
    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        eliminarGrupo($data['grupo_id']);
        break;
}

function crearGrupo($data) {
    global $conn;
    
    try {
        if(!isset($data['nombre']) || !isset($data['creador_id']) || !isset($data['miembros'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Faltan datos requeridos (nombre, creador_id, miembros)'
            ]);
            return;
        }
        
        $nombre = trim($data['nombre']);
        $creador_id = $data['creador_id'];
        $miembros = $data['miembros'];
        $tipo = isset($data['tipo']) ? $data['tipo'] : 'grupal';
        
        if(empty($nombre)) {
            echo json_encode([
                'success' => false,
                'message' => 'El nombre del grupo no puede estar vacío'
            ]);
            return;
        }
        
        if($tipo == 'grupal') {
            if(!in_array($creador_id, $miembros)) {
                array_unshift($miembros, $creador_id);
            }
            
            if(count($miembros) < 3) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Los grupos deben tener mínimo 3 integrantes',
                    'miembros_actuales' => count($miembros),
                    'miembros_requeridos' => 3
                ]);
                return;
            }
        }
        
        if($tipo == 'privado') {
            if(count($miembros) != 2) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Los chats privados solo pueden tener 2 integrantes',
                    'miembros_actuales' => count($miembros)
                ]);
                return;
            }
            
            $stmt = $conn->prepare("
                SELECT g.id 
                FROM grupos g
                INNER JOIN grupo_miembros gm1 ON g.id = gm1.grupo_id
                INNER JOIN grupo_miembros gm2 ON g.id = gm2.grupo_id
                WHERE g.tipo = 'privado'
                AND gm1.usuario_id = ?
                AND gm2.usuario_id = ?
                AND gm1.usuario_id != gm2.usuario_id
            ");
            $stmt->execute([$miembros[0], $miembros[1]]);
            
            if($stmt->fetch()) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Ya existe un chat privado entre estos usuarios'
                ]);
                return;
            }
        }
        
        $placeholders = str_repeat('?,', count($miembros) - 1) . '?';
        $stmt = $conn->prepare("SELECT COUNT(*) as total FROM usuarios WHERE id IN ($placeholders)");
        $stmt->execute($miembros);
        $result = $stmt->fetch();
        
        if($result['total'] != count($miembros)) {
            echo json_encode([
                'success' => false,
                'message' => 'Uno o más usuarios no existen en la base de datos'
            ]);
            return;
        }
        
        $conn->beginTransaction();
        
        $stmt = $conn->prepare("
            INSERT INTO grupos (nombre, tipo, creado_por, created_at) 
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([$nombre, $tipo, $creador_id]);
        $grupo_id = $conn->lastInsertId();
        
        $stmt = $conn->prepare("
            INSERT INTO grupo_miembros (grupo_id, usuario_id, fecha_union) 
            VALUES (?, ?, NOW())
        ");
        
        foreach($miembros as $usuario_id) {
            $stmt->execute([$grupo_id, $usuario_id]);
        }
        
        $conn->commit();
        
        $stmt = $conn->prepare("
            SELECT g.*, 
                   u.nombre_usuario as creador_nombre,
                   COUNT(gm.usuario_id) as total_miembros
            FROM grupos g
            LEFT JOIN usuarios u ON g.creado_por = u.id
            LEFT JOIN grupo_miembros gm ON g.id = gm.grupo_id
            WHERE g.id = ?
            GROUP BY g.id
        ");
        $stmt->execute([$grupo_id]);
        $grupo = $stmt->fetch();
        
        echo json_encode([
            'success' => true,
            'message' => 'Grupo creado exitosamente',
            'grupo' => $grupo
        ]);
        
    } catch(PDOException $e) {
        if($conn->inTransaction()) {
            $conn->rollBack();
        }
        echo json_encode([
            'success' => false,
            'message' => 'Error al crear grupo: ' . $e->getMessage()
        ]);
    }
}

function obtenerGruposDeUsuario($usuario_id) {
    global $conn;
    
    try {
        $stmt = $conn->prepare("
            SELECT g.*, 
                   u.nombre_usuario as creador_nombre,
                   COUNT(DISTINCT gm.usuario_id) as total_miembros,
                   (SELECT COUNT(*) 
                    FROM mensajes m 
                    WHERE m.grupo_id = g.id 
                    AND m.leido = 0 
                    AND m.remitente_id != ?) as mensajes_no_leidos
            FROM grupos g
            INNER JOIN grupo_miembros gm_user ON g.id = gm_user.grupo_id AND gm_user.usuario_id = ?
            LEFT JOIN usuarios u ON g.creado_por = u.id
            LEFT JOIN grupo_miembros gm ON g.id = gm.grupo_id
            GROUP BY g.id, u.nombre_usuario
            ORDER BY g.created_at DESC
        ");
        $stmt->execute([$usuario_id, $usuario_id]);
        $grupos = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'grupos' => $grupos
        ]);
        
    } catch(PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener grupos: ' . $e->getMessage()
        ]);
    }
}

function obtenerDetallesGrupo($grupo_id) {
    global $conn;
    
    try {
        $stmt = $conn->prepare("
            SELECT g.*, 
                   u.nombre_usuario as creador_nombre,
                   u.email as creador_email
            FROM grupos g
            LEFT JOIN usuarios u ON g.creado_por = u.id
            WHERE g.id = ?
        ");
        $stmt->execute([$grupo_id]);
        $grupo = $stmt->fetch();
        
        if(!$grupo) {
            echo json_encode([
                'success' => false,
                'message' => 'Grupo no encontrado'
            ]);
            return;
        }
        
        $stmt = $conn->prepare("
            SELECT u.id, 
                   u.nombre_usuario as nombre, 
                   u.email, 
                   u.estado_conexion, 
                   gm.fecha_union
            FROM grupo_miembros gm
            INNER JOIN usuarios u ON gm.usuario_id = u.id
            WHERE gm.grupo_id = ?
            ORDER BY gm.fecha_union ASC
        ");
        $stmt->execute([$grupo_id]);
        $miembros = $stmt->fetchAll();
        
        $grupo['miembros'] = $miembros;
        $grupo['total_miembros'] = count($miembros);
        
        echo json_encode([
            'success' => true,
            'grupo' => $grupo
        ]);
        
    } catch(PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener detalles: ' . $e->getMessage()
        ]);
    }
}

function agregarMiembros($data) {
    global $conn;
    
    try {
        if(!isset($data['grupo_id']) || !isset($data['nuevos_miembros'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Faltan datos (grupo_id, nuevos_miembros)'
            ]);
            return;
        }
        
        $grupo_id = $data['grupo_id'];
        $nuevos_miembros = $data['nuevos_miembros'];
        
        $stmt = $conn->prepare("SELECT tipo FROM grupos WHERE id = ?");
        $stmt->execute([$grupo_id]);
        $grupo = $stmt->fetch();
        
        if(!$grupo) {
            echo json_encode([
                'success' => false,
                'message' => 'Grupo no encontrado'
            ]);
            return;
        }
        
        if($grupo['tipo'] == 'privado') {
            echo json_encode([
                'success' => false,
                'message' => 'No se pueden agregar miembros a chats privados'
            ]);
            return;
        }
        
        $conn->beginTransaction();
        
        $stmt = $conn->prepare("
            INSERT IGNORE INTO grupo_miembros (grupo_id, usuario_id, fecha_union) 
            VALUES (?, ?, NOW())
        ");
        
        $agregados = 0;
        foreach($nuevos_miembros as $usuario_id) {
            $stmt->execute([$grupo_id, $usuario_id]);
            $agregados += $stmt->rowCount();
        }
        
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => "$agregados miembro(s) agregado(s) exitosamente"
        ]);
        
    } catch(PDOException $e) {
        if($conn->inTransaction()) {
            $conn->rollBack();
        }
        echo json_encode([
            'success' => false,
            'message' => 'Error al agregar miembros: ' . $e->getMessage()
        ]);
    }
}

function eliminarGrupo($grupo_id) {
    global $conn;
    
    try {
        $stmt = $conn->prepare("DELETE FROM grupos WHERE id = ?");
        $stmt->execute([$grupo_id]);
        
        if($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Grupo eliminado exitosamente'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Grupo no encontrado'
            ]);
        }
        
    } catch(PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al eliminar grupo: ' . $e->getMessage()
        ]);
    }
}
?>