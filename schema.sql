-- ============================================================
-- LA JOYA · Portal del distrito
-- Esquema MySQL completo + datos seed
-- Compatible con MySQL 5.7+ / MariaDB 10.3+
-- ============================================================

CREATE DATABASE IF NOT EXISTS lajoya
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE lajoya;

-- ============================================================
-- TABLAS
-- ============================================================

-- Categorías de productos/negocios
CREATE TABLE IF NOT EXISTS categorias (
  id VARCHAR(40) PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  icon VARCHAR(10) DEFAULT '📍',
  orden INT DEFAULT 0
) ENGINE=InnoDB;

-- Usuarios (vecinos + negocios)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  pass VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  rol ENUM('vecino','negocio','admin') DEFAULT 'vecino',
  biz_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB;

-- Negocios
CREATE TABLE IF NOT EXISTS negocios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  cat VARCHAR(40) NOT NULL,
  descripcion TEXT,
  zona VARCHAR(80),
  direccion VARCHAR(180),
  telefono VARCHAR(20),
  whatsapp VARCHAR(20),
  email VARCHAR(120),
  horario VARCHAR(150),
  rating DECIMAL(2,1) DEFAULT 5.0,
  lat DECIMAL(10,6),
  lng DECIMAL(10,6),
  cover VARCHAR(255),
  fb VARCHAR(255),
  ig VARCHAR(255),
  owner_id INT NULL,
  status ENUM('pendiente','aprobado','rechazado') DEFAULT 'aprobado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cat (cat),
  INDEX idx_zona (zona),
  FOREIGN KEY (owner_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Productos
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(80) UNIQUE,
  nombre VARCHAR(180) NOT NULL,
  cat VARCHAR(40) NOT NULL,
  negocio_id INT NOT NULL,
  descripcion TEXT,
  zona VARCHAR(80),
  precio DECIMAL(10,2) NOT NULL,
  precio_old DECIMAL(10,2) NULL,
  oferta TINYINT(1) DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 5.0,
  vendidos INT DEFAULT 0,
  stock INT DEFAULT 0,
  img VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cat (cat),
  INDEX idx_negocio (negocio_id),
  INDEX idx_oferta (oferta),
  FOREIGN KEY (negocio_id) REFERENCES negocios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE,
  usuario_id INT NULL,
  total DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  descuento DECIMAL(10,2) DEFAULT 0,
  envio DECIMAL(10,2) DEFAULT 0,
  metodo_envio ENUM('delivery','pickup') DEFAULT 'delivery',
  metodo_pago ENUM('card','yape','cash') DEFAULT 'card',
  nombre_cliente VARCHAR(120),
  telefono_cliente VARCHAR(20),
  direccion_cliente VARCHAR(255),
  ciudad VARCHAR(80),
  referencia VARCHAR(255),
  status ENUM('pend','paid','shipped','delivered','cancel') DEFAULT 'pend',
  webhook_sent TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Items por pedido
CREATE TABLE IF NOT EXISTS pedido_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio_unit DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Cupones
CREATE TABLE IF NOT EXISTS cupones (
  code VARCHAR(20) PRIMARY KEY,
  pct DECIMAL(4,2) NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  usados INT DEFAULT 0,
  max_usos INT DEFAULT 1000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Favoritos
CREATE TABLE IF NOT EXISTS favoritos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  producto_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_fav (usuario_id, producto_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Empleos
CREATE TABLE IF NOT EXISTS empleos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  cat VARCHAR(40) NOT NULL,
  empresa VARCHAR(120) NOT NULL,
  negocio_id INT NULL,
  salario DECIMAL(10,2) NOT NULL,
  tipo VARCHAR(60),
  zona VARCHAR(80),
  descripcion TEXT,
  estado ENUM('activa','cerrada') DEFAULT 'activa',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (negocio_id) REFERENCES negocios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Postulaciones
CREATE TABLE IF NOT EXISTS postulaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empleo_id INT NOT NULL,
  usuario_id INT NULL,
  nombre VARCHAR(120) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  mensaje TEXT,
  status ENUM('enviada','revisada','aceptada','rechazada') DEFAULT 'enviada',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empleo_id) REFERENCES empleos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Webhooks log
CREATE TABLE IF NOT EXISTS webhooks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evento VARCHAR(80) NOT NULL,
  payload TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_evento (evento)
) ENGINE=InnoDB;

-- Lugares / turismo
CREATE TABLE IF NOT EXISTS lugares (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  cat VARCHAR(60),
  descripcion TEXT,
  lat DECIMAL(10,6),
  lng DECIMAL(10,6),
  img VARCHAR(255)
) ENGINE=InnoDB;

-- Transporte: puntos y tipos
CREATE TABLE IF NOT EXISTS transporte_puntos (
  id VARCHAR(40) PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  lat DECIMAL(10,6),
  lng DECIMAL(10,6)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transporte_tipos (
  id VARCHAR(40) PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL,
  icon VARCHAR(10),
  factor DECIMAL(4,2) DEFAULT 1.0,
  velocidad INT DEFAULT 50
) ENGINE=InnoDB;

-- Integraciones
CREATE TABLE IF NOT EXISTS integraciones (
  id VARCHAR(40) PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  estado ENUM('ok','sandbox','demo') DEFAULT 'demo',
  funcion VARCHAR(180),
  accion VARCHAR(80)
) ENGINE=InnoDB;

-- Agenda distrital
CREATE TABLE IF NOT EXISTS agenda (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dia VARCHAR(4) NOT NULL,
  mes VARCHAR(4) NOT NULL,
  titulo VARCHAR(180) NOT NULL,
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

-- Mensajes de contacto
CREATE TABLE IF NOT EXISTS mensajes_contacto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL,
  mensaje TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Newsletter
CREATE TABLE IF NOT EXISTS newsletter (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(120) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Sesiones (para tokens simples)
CREATE TABLE IF NOT EXISTS sesiones (
  token VARCHAR(64) PRIMARY KEY,
  usuario_id INT NOT NULL,
  expires DATETIME NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- DATOS SEED
-- ============================================================

INSERT INTO categorias (id, nombre, icon, orden) VALUES
('comida','Comida & Gastronomía','🍴',1),
('mercados','Mercados & Abarrotes','🛒',2),
('agricola','Productos agrícolas','🌾',3),
('servicios','Servicios','🔧',4),
('salud','Salud & Farmacia','💊',5),
('transporte','Transporte','🚕',6),
('turismo','Turismo & Ocio','🏨',7),
('ferreteria','Ferretería','🔨',8),
('moda','Moda & Calzado','👕',9),
('tech','Tecnología','📱',10);

-- Contraseña demo: demo123 (hash bcrypt cost=10)
-- Hash generado con: password_hash('demo123', PASSWORD_BCRYPT)
INSERT INTO usuarios (id, nombre, email, pass, telefono, rol) VALUES
(1, 'Vecino Demo', 'vecino@lajoya.pe', '$2y$10$Q5b9vQ7sZ3h7JjYwUQ8yMeV6tWzO7y0oLZQ9sXQ1kP0sW9v6rK0iK', '954000000', 'vecino'),
(2, 'Negocio Demo', 'negocio@lajoya.pe', '$2y$10$Q5b9vQ7sZ3h7JjYwUQ8yMeV6tWzO7y0oLZQ9sXQ1kP0sW9v6rK0iK', '954111111', 'negocio'),
(3, 'Admin La Joya', 'admin@lajoya.pe', '$2y$10$Q5b9vQ7sZ3h7JjYwUQ8yMeV6tWzO7y0oLZQ9sXQ1kP0sW9v6rK0iK', '954000001', 'admin');

INSERT INTO negocios (id, nombre, cat, descripcion, zona, direccion, telefono, whatsapp, email, horario, rating, lat, lng, cover) VALUES
(1,'Quesería La Joya','mercados','Quesos frescos y maduros artesanales, leche directa del fundo.','Centro','Jr. Tacna 210','954123678','51954123678','queseria@lajoya.pe','L–S 7:00–18:00 · D 7:00–13:00',4.7,-16.3436,-71.8439,'https://picsum.photos/seed/lj-b1/800/450.jpg'),
(2,'Agroexportadora La Yarada','agricola','Páprika, cebolla y ajíes exportados a EE.UU. y Europa.','La Yarada','Carretera La Yarada km 2','954789123','51954789123','ventas@layarada.pe','L–V 8:00–17:00',4.9,-16.3712,-71.8923,'https://picsum.photos/seed/lj-b2/800/450.jpg'),
(3,'Picantería La Supe','comida','Chicharrón, adobo y chicharrones joyanos. La sazón del sur.','Cruce La Joya','Av. Panamericana 145','954345678','51954345678','sup@lajoya.pe','L–D 8:00–22:00',4.8,-16.3389,-71.8521,'https://picsum.photos/seed/lj-b3/800/450.jpg'),
(4,'Panadería El Trigo','comida','Pan chuta, pan francés y repostería artesanal del valle.','Centro','Jr. Arequipa 340','954567890','51954567890','trigo@lajoya.pe','L–S 5:00–20:00 · D 5:00–13:00',4.5,-16.3421,-71.8456,'https://picsum.photos/seed/lj-b4/800/450.jpg'),
(5,'Parada 48','comida','Menús caseros, rocoto relleno, empanadas y la mejor causa joyana.','Jr. Constitución','Jr. Constitución 48','954876543','51954876543','parada48@lajoya.pe','L–S 8:00–18:00',4.7,-16.3456,-71.8478,'https://picsum.photos/seed/lj-b5/800/450.jpg'),
(6,'Fundo San Martín','agricola','Leche fresca, alfalfa, maíz y derivados lácteos del valle.','Pampa Siguas','Fundo San Martín s/n','954321098','51954321098','fundo@lajoya.pe','L–D 6:00–17:00',4.4,-16.3578,-71.8612,'https://picsum.photos/seed/lj-b6/800/450.jpg'),
(7,'Apiario La Florida','agricola','Miel, polen, propóleo y jalea real de flores del desierto.','La Florida','La Florida Mz. C-12','954112233','51954112233','miel@lajoya.pe','L–S 8:00–17:00',4.9,-16.3612,-71.8334,'https://picsum.photos/seed/lj-b7/800/450.jpg'),
(8,'Cervecería Joya','comida','Cerveza artesanal IPA, Stout y Honey. Tap room y tours.','Centro','Jr. Lima 280','954998877','51954998877','beer@joya.pe','M–S 16:00–23:00',4.5,-16.3402,-71.8467,'https://picsum.photos/seed/lj-b8/800/450.jpg'),
(9,'Olivar del Valle','agricola','Aceite de oliva extra virgen prensado en frío de olivos centenarios.','La Yarada','La Yarada Sur 1450','954445566','51954445566','olivar@lajoya.pe','L–V 8:00–16:00',4.8,-16.3721,-71.8934,'https://picsum.photos/seed/lj-b9/800/450.jpg'),
(10,'Gas La Joya','servicios','Venta y distribución de gas GLP con delivery a todo el distrito.','Centro','Av. Panamericana 110','954000111','51954000111','gas@lajoya.pe','L–D 7:00–21:00',4.4,-16.3411,-71.8422,'https://picsum.photos/seed/lj-b10/800/450.jpg'),
(11,'Botica La Salud','salud','Medicamentos, productos de higiene y atención farmacéutica.','Centro','Jr. Junín 220','954222333','51954222333','salud@lajoya.pe','L–S 8:00–22:00 · D 8:00–14:00',4.5,-16.3425,-71.8433,'https://picsum.photos/seed/lj-b11/800/450.jpg'),
(12,'TecnoJoya','tech','Tablets, celulares, accesorios y soporte técnico. Pago en cuotas.','Cruce La Joya','Cruce La Joya 50','954333444','51954333444','ventas@tecnojoya.pe','L–S 9:00–20:00 · D 10:00–14:00',4.2,-16.3395,-71.8512,'https://picsum.photos/seed/lj-b12/800/450.jpg'),
(13,'Ferretería El Clavo','ferreteria','Materiales de construcción, herramientas y ferretería en general.','Centro','Jr. Callao 145','954444555','51954444555','clavo@lajoya.pe','L–S 8:00–19:00 · D 8:00–13:00',4.4,-16.3417,-71.8458,'https://picsum.photos/seed/lj-b13/800/450.jpg'),
(14,'Arenales Tour','turismo','Sandboard, tours en 4x4 y visitas a las cataratas y el oasis.','Dunas','Cruce La Joya 145','954555666','51954555666','tour@arenales.pe','L–D 7:00–20:00',4.9,-16.3289,-71.8623,'https://picsum.photos/seed/lj-b14/800/450.jpg'),
(15,'Barbería El Corte','servicios','Cortes modernos, arreglo de barba y tratamientos capilares.','Centro','Jr. Moquegua 88','954666777','51954666777','corte@lajoya.pe','L–S 9:00–20:00 · D 9:00–14:00',4.6,-16.3433,-71.8444,'https://picsum.photos/seed/lj-b15/800/450.jpg'),
(16,'Calzado La Joya','moda','Zapatos escolares, de vestir y de seguridad. Calzado nacional.','Centro','Jr. Lima 145','954777888','51954777888','calzado@lajoya.pe','L–S 9:00–19:00',4.4,-16.3422,-71.8461,'https://picsum.photos/seed/lj-b16/800/450.jpg'),
(17,'Imprenta Creativa','servicios','Poleras, tarjetas, banners y merchandising personalizado.','Centro','Jr. Tacna 50','954888999','51954888999','creativa@lajoya.pe','L–S 9:00–19:00',4.3,-16.3429,-71.8451,'https://picsum.photos/seed/lj-b17/800/450.jpg'),
(18,'Moto Taxi La Joya Express','transporte','Mototaxi y motocicleta para reparto urbano y tours cortos.','Cruce La Joya','Cruce La Joya s/n','954999000','51954999000','moto@lajoya.pe','L–D 5:00–23:00',4.3,-16.3392,-71.8525,'https://picsum.photos/seed/lj-b18/800/450.jpg'),
(19,'Hostal El Oasis','turismo','Habitaciones con desayuno, excursiones a las dunas incluidas.','Dunas','Km 12 Panamericana Sur','954111222','51954111222','hostal@oasis.pe','Recepción 24h',4.6,-16.3298,-71.8654,'https://picsum.photos/seed/lj-b19/800/450.jpg'),
(20,'Clínica Dental Sorriso','salud','Atención odontológica integral, ortodoncia y estética dental.','Centro','Jr. Arequipa 198','954333222','51954333222','dental@sorriso.pe','L–S 9:00–20:00',4.7,-16.3418,-71.8455,'https://picsum.photos/seed/lj-b20/800/450.jpg');

-- Vincular negocio demo con Quesería La Joya
UPDATE usuarios SET biz_id = 1 WHERE id = 2;

INSERT INTO productos (id, slug, nombre, cat, negocio_id, descripcion, zona, precio, precio_old, oferta, rating, vendidos, stock, img) VALUES
(1,'queso-fresco','Queso fresco de la zona','mercados',1,'Queso fresco artesanal hecho con leche de vacas del valle. Textura cremosa, ideal para el desayuno con pan y mermelada.','Centro',14.00,18.00,1,4.7,340,12,'https://picsum.photos/seed/lj-queso/600/600.jpg'),
(2,'paprika-molida','Páprika molida 500g','agricola',2,'Páprika seleccionada y molida en el valle de La Joya. Color intenso y aroma ahumado, exportación a EE.UU. y Europa.','La Yarada',22.00,NULL,0,4.9,510,8,'https://picsum.photos/seed/lj-paprika/600/600.jpg'),
(3,'cebolla-roja','Cebolla roja 10kg','agricola',2,'Cebolla roja arequipeña por saco de 10kg. Cosecha del día, ideal para restaurantes y comercios.','La Yarada',35.00,42.00,1,4.6,180,0,'https://picsum.photos/seed/lj-cebolla/600/600.jpg'),
(4,'chicharron','Chicharrón joyano 1kg','comida',3,'Cerdo frito en manteca con mote, sarza y camote. La receta tradicional de La Joya.','Cruce La Joya',48.00,NULL,0,4.8,220,6,'https://picsum.photos/seed/lj-chicharron/600/600.jpg'),
(5,'pan-chuta','Pan chuta artesanal','comida',4,'Pan grande de fermentación lenta con anís y pasas. Acompaña el desayuno de cientos de familias joyanas.','Centro',8.00,NULL,0,4.5,890,24,'https://picsum.photos/seed/lj-pan/600/600.jpg'),
(6,'rocoto-relleno','Rocoto relleno x4','comida',5,'Cuatro rocotos rellenos de carne molida, huevo y queso, horneados en horno de leña. El clásico arequipeño.','Jr. Constitución',25.00,NULL,0,4.7,430,18,'https://picsum.photos/seed/lj-rocoto/600/600.jpg'),
(7,'alfalfa','Alfalfa fardo 30kg','agricola',6,'Fardo de alfalfa fresca del valle. Nutrición completa para ganado vacuno y caballar.','Pampa Siguas',30.00,NULL,0,4.4,90,15,'https://picsum.photos/seed/lj-alfalfa/600/600.jpg'),
(8,'miel-abeja','Miel de abeja 1L','agricola',7,'Miel pura de flores del desierto y del valle. Endulzante natural sin aditivos.','La Florida',35.00,42.00,1,4.9,150,10,'https://picsum.photos/seed/lj-miel/600/600.jpg'),
(9,'manjar-blanco','Manjar blanco 500g','comida',4,'Manjar blanco casero hecho con leche de vaca del valle. Cremoso, sin preservantes.','Centro',18.00,NULL,0,4.6,260,14,'https://picsum.photos/seed/lj-manjar/600/600.jpg'),
(10,'cerveza-ipa','Cerveza artesanal IPA 6pack','comida',8,'Cerveza IPA artesanal con lúpulo fresco. Pack de 6 botellas de 330ml.','Centro',55.00,NULL,0,4.5,120,9,'https://picsum.photos/seed/lj-cerveza/600/600.jpg'),
(11,'aceite-oliva','Aceite de oliva 500ml','agricola',9,'Aceite de oliva extra virgen prensado en frío. Olivos centenarios del valle.','La Yarada',45.00,NULL,0,4.8,95,7,'https://picsum.photos/seed/lj-aceite/600/600.jpg'),
(12,'polera-soy','Polera "Soy de La Joya"','moda',17,'Polera de algodón con diseño "Soy de La Joya". Tallas S a XL.','Centro',28.00,35.00,1,4.3,65,32,'https://picsum.photos/seed/lj-polera/600/600.jpg'),
(13,'gas-10kg','Carga de gas 10kg','servicios',10,'Cilindro de gas GLP de 10kg con delivery a domicilio en todo el distrito.','Centro',55.00,NULL,0,4.4,780,50,'https://picsum.photos/seed/lj-gas/600/600.jpg'),
(14,'kit-desinfeccion','Kit desinfección 5L','salud',11,'Alcohol, lejía y jabón antibacterial en presentación familiar de 5 litros.','Centro',32.00,NULL,0,4.5,340,22,'https://picsum.photos/seed/lj-desinf/600/600.jpg'),
(15,'tablet-android','Tablet Android 10"','tech',12,'Tablet de 10 pulgadas con Android 13, 4GB RAM y 64GB almacenamiento. Ideal para clases virtuales.','Cruce La Joya',480.00,NULL,0,4.2,18,5,'https://picsum.photos/seed/lj-tablet/600/600.jpg'),
(16,'usb-64gb','Memoria USB 64GB','tech',12,'Memoria USB de 64GB, USB 3.0, resistente y rápida.','Cruce La Joya',35.00,45.00,1,4.6,210,40,'https://picsum.photos/seed/lj-usb/600/600.jpg'),
(17,'martillo','Martillo carpintero','ferreteria',13,'Martillo de carpintero con mango de fibra antideslizante. Cabeza de acero forjado.','Centro',22.00,NULL,0,4.7,130,16,'https://picsum.photos/seed/lj-martillo/600/600.jpg'),
(18,'cemento','Cemento Atlas 42.5kg','ferreteria',13,'Bolsa de cemento Portland tipo I de 42.5kg. Para construcciones en albañilería.','Centro',28.00,NULL,0,4.4,560,120,'https://picsum.photos/seed/lj-cemento/600/600.jpg'),
(19,'sandboard','Sandboard alquiler día','turismo',14,'Alquiler de tabla de sandboard por día completa. Incluye instrucción básica y guía a las dunas.','Dunas',35.00,NULL,0,4.8,240,8,'https://picsum.photos/seed/lj-sandboard/600/600.jpg'),
(20,'tour-oasis','Tour Oasis + Cataratas','turismo',14,'Tour de medio día al Oasis de La Joya y Cataratas de La Cano. Incluye transporte y snack.','Dunas',65.00,80.00,1,4.9,175,6,'https://picsum.photos/seed/lj-tour/600/600.jpg'),
(21,'corte-barba','Peluquería corte + barba','servicios',15,'Corte de cabello moderno y arreglo de barba. Atención con cita previa o en el local.','Centro',25.00,NULL,0,4.6,680,5,'https://picsum.photos/seed/lj-barber/600/600.jpg'),
(22,'zapatos-escolares','Zapatos escolares par','moda',16,'Zapatos escolares de cuero legítimo. Plantilla acolchada. Tallas 28 a 38.','Centro',65.00,NULL,0,4.4,90,24,'https://picsum.photos/seed/lj-zapatos/600/600.jpg'),
(23,'empanadas-docena','Empanadas x docena','comida',5,'Docena de empanadas de carne, pollo o queso. Masa casera, horneadas al momento.','Jr. Constitución',18.00,NULL,0,4.7,420,30,'https://picsum.photos/seed/lj-empanada/600/600.jpg'),
(24,'leche-fresca','Leche fresca 3L','agricola',6,'Leche fresca de vaca, ordeñada el mismo día. Sin aditivos ni conservantes.','Pampa Siguas',15.00,NULL,0,4.5,230,18,'https://picsum.photos/seed/lj-leche/600/600.jpg');

INSERT INTO empleos (id, titulo, cat, empresa, negocio_id, salario, tipo, zona, descripcion) VALUES
(1,'Chofer de reparto','transporte','Gas La Joya',10,1500,'Tiempo completo','Centro','Licencia A-IIIB. Recorrido por todo el distrito. Combustible a cargo de la empresa.'),
(2,'Vendedora de mostrador','comercio','Botica La Salud',11,1300,'Tiempo completo','Centro','Atención al público, manejo de caja y stock. Experiencia mínima 6 meses.'),
(3,'Operario agrícola','agricultura','Agroexportadora La Yarada',2,1800,'Temporada','La Yarada','Cosecha y selección de páprika y cebolla. Alimentación incluida.'),
(4,'Cocinera','servicios','Picantería La Supe',3,1600,'Tiempo completo','Cruce La Joya','Cocina criolla arequipeña. Experiencia en picantería.'),
(5,'Asistente administrativo CAS','estado','Municipalidad Distrital de La Joya',NULL,2500,'CAS 6 meses','Plaza de Armas','Profesional en administración o afines. Convocatoria CAS 2025.'),
(6,'Mototaxista','transporte','Moto Taxi Express',18,1400,'Tiempo completo','Cruce La Joya','Moto propia o de la empresa. Permiso municipal al día.'),
(7,'Barbero','servicios','Barbería El Corte',15,1700,'Tiempo completo','Centro','Experiencia comprobada. Comisiones por servicio adicional.'),
(8,'Técnico en celulares','servicios','TecnoJoya',12,1900,'Tiempo completo','Cruce La Joya','Reparación de celulares y tablets. Conocimiento de microsoldadura.'),
(9,'Guía turístico','turismo','Arenales Tour',14,2000,'Temporada','Dunas','Bilingüe español-inglés preferente. Curso de guía turístico.'),
(10,'Panadero','comercio','Panadería El Trigo',4,1500,'Tiempo completo','Centro','Experiencia en masas y fermentación. Turnos rotativos.'),
(11,'Promotor de ventas','comercio','Imprenta Creativa',17,1400,'Tiempo completo','Centro','Visitas a negocios del distrito. Comisiones por venta.'),
(12,'Inspector SERVIR','estado','Municipalidad Distrital de La Joya',NULL,2800,'CAS 3 meses','Plaza de Armas','Apoyo en módulo SERVIR sábados. Conocimientos en trámites.');

INSERT INTO lugares (id, nombre, cat, descripcion, lat, lng, img) VALUES
(1,'El Oasis de La Joya','Naturaleza','Paraje desértico con afloramiento de aguas subterráneas.',-16.3461,-71.8592,'https://picsum.photos/seed/lj-oasis/900/600.jpg'),
(2,'Dunas de La Joya','Aventura','Dunas ideales para sandboard y 4x4.',-16.3289,-71.8623,'https://picsum.photos/seed/lj-dunas/900/600.jpg'),
(3,'Cataratas de La Cano','Naturaleza','Cascada en medio del desierto.',-16.3589,-71.8821,'https://picsum.photos/seed/lj-cano/900/600.jpg'),
(4,'Parada 48','Sabor local','Comida tradicional joyana.',-16.3456,-71.8478,'https://picsum.photos/seed/lj-p48/900/600.jpg'),
(5,'Cruce de La Joya','Comercio','Centro neurálgico del distrito.',-16.3389,-71.8521,'https://picsum.photos/seed/lj-plaza/900/600.jpg'),
(6,'Piscinas campestres','Familia','Balnearios de agua templada con parrillas.',-16.3612,-71.8334,'https://picsum.photos/seed/lj-piscinas/900/600.jpg');

INSERT INTO transporte_puntos (id, nombre, lat, lng) VALUES
('arequipa','Arequipa Centro',-16.3989,-71.5350),
('cruce','Cruce La Joya',-16.3389,-71.8521),
('yarada','La Yarada',-16.3712,-71.8923),
('siguas','Pampa Siguas',-16.3578,-71.8612),
('majes','Majes',-16.2518,-72.0250),
('villa','Villa El Pedregal',-16.2725,-71.9425);

INSERT INTO transporte_tipos (id, nombre, icon, factor, velocidad) VALUES
('bus','Bus interprovincial','🚌',1.0,55),
('minivan','Minivan','🚐',1.5,60),
('mototaxi','Mototaxi','🛺',2.2,35),
('colectivo','Colectivo','🚗',1.8,65);

INSERT INTO integraciones (id, nombre, estado, funcion, accion) VALUES
('i1','OpenStreetMap','ok','Mapa interactivo del distrito','Recargar mapa'),
('i2','Open-Meteo API','ok','Clima del valle en vivo','Actualizar clima'),
('i3','WhatsApp Business','sandbox','Pedidos directos al negocio','Configurar'),
('i4','Culqi Pagos','sandbox','Pagos con tarjeta (demo)','Probar pago'),
('i5','Niubiz','demo','Pasarela de pago Visa/Mastercard','Configurar'),
('i6','Plin / Yape','demo','Pago con QR simple','Generar QR'),
('i7','SUNAT RUC','ok','Validación de RUC de negocios','Validar RUC'),
('i8','RENIEC','demo','Validación de DNI del comprador','Validar DNI'),
('i9','Correo Peru','sandbox','Envíos nacionales','Cotizar envío'),
('i10','SENATI / CEPROSEL','ok','Cursos y certificaciones','Ver cursos');

INSERT INTO cupones (code, pct, activo) VALUES
('JOYA10',0.10,1),
('JOYA20',0.20,1),
('BIENVENIDA',0.15,1);

INSERT INTO agenda (dia, mes, titulo, descripcion) VALUES
('12','OCT','Feria dominical de productores','Plaza de Armas · 6:00 a. m.'),
('18','OCT','Campaña de esterilización gratuita','Plaza de Armas · 9:00 a. m.'),
('25','OCT','Concierto de aniversario','Plaza de Armas · 7:00 p. m.'),
('01','NOV','Inscripciones liga fútbol 7','Oficina municipal · 8:00 a. m.'),
('10','NOV','Expo Joya agroexportadora','Fundo San Martín · 9:00 a. m.');

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
