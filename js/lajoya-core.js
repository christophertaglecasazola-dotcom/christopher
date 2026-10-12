/* ============================================================
   LA JOYA · CORE — datos + helpers + UI base
   Expone window.LJ = { data, store, ui, ... }
   ============================================================ */
(function(){
  "use strict";

  /* ---------- DATOS DEL DISTRITO ---------- */
  const DATA = {
    categorias: [
      {id:'comida',nombre:'Comida & Gastronomía',icon:'🍴'},
      {id:'mercados',nombre:'Mercados & Abarrotes',icon:'🛒'},
      {id:'agricola',nombre:'Productos agrícolas',icon:'🌾'},
      {id:'servicios',nombre:'Servicios',icon:'🔧'},
      {id:'salud',nombre:'Salud & Farmacia',icon:'💊'},
      {id:'transporte',nombre:'Transporte',icon:'🚕'},
      {id:'turismo',nombre:'Turismo & Ocio',icon:'🏨'},
      {id:'ferreteria',nombre:'Ferretería',icon:'🔨'},
      {id:'moda',nombre:'Moda & Calzado',icon:'👕'},
      {id:'tech',nombre:'Tecnología',icon:'📱'}
    ],
   productos: [
     {id: 'p1', nombre: 'Qeso fresco de la zona', cat: 'mercados', negocio: 'Quesería La Joya', zona: 'Centro', precio: 14, oferta: true, precioOld: 18, rating: 4.7, vendidos: 340, stock: 12, img: 'https://loremflickr.com/600/600/fresh,cheese', desc: 'Queso fresco artesanal hecho con leche de vacas del valle. Textura cremosa, ideal para el desayuno con pan y mermelada.'},
     {id: 'p2', nombre: 'Páprika molida 500g', cat: 'agricola', negocio: 'Agroexportadora La Yarada', zona: 'La Yarada', precio: 22, rating: 4.9, vendidos: 510, stock: 8, img: 'https://loremflickr.com/600/600/paprika,powder', desc: 'Páprika seleccionada y molida en el valle de La Joya. Color intenso y aroma ahumado, exportación a EE.UU. y Europa.'},
     {id: 'p3', nombre: 'Cebolla roja 10kg', cat: 'agricola', negocio: 'Agroexportadora La Yarada', zona: 'La Yarada', precio: 35, oferta: true, precioOld: 42, rating: 4.6, vendidos: 180, stock: 0, img: 'https://loremflickr.com/600/600/red,onions', desc: 'Cebolla roja arequipeña por saco de 10kg. Cosecha del día, ideal para restaurantes y comercios.'},
     {id: 'p4', nombre: 'Chicharrón joyano 1kg', cat: 'comida', negocio: 'Picantería La Supe', zona: 'Cruce La Joya', precio: 48, rating: 4.8, vendidos: 220, stock: 6, img: 'https://loremflickr.com/600/600/pork,crackling', desc: 'Cerdo frito en manteca con mote, sarza y camote. La receta tradicional de La Joya.'},
     {id: 'p5', nombre: 'Pan chuta artesanal', cat: 'comida', negocio: 'Panadería El Trigo', zona: 'Centro', precio: 8, rating: 4.5, vendidos: 890, stock: 24, img: 'https://loremflickr.com/600/600/bread,bakery', desc: 'Pan grande de fermentación lenta con anís y pasas. Acompaña el desayuno de cientos de familias joyanas.'},
     {id: 'p6', nombre: 'Rocoto relleno x4', cat: 'comida', negocio: 'Parada 48', zona: 'Jr. Constitución', precio: 25, rating: 4.7, vendidos: 430, stock: 18, img: 'https://loremflickr.com/600/600/stuffed,red,pepper', desc: 'Cuatro rocotos rellenos de carne molida, huevo y queso, horneados en horno de leña. El clásico arequipeño.'},
     {id: 'p7', nombre: 'Alfalfa fardo 30kg', cat: 'agricola', negocio: 'Fundo San Martín', zona: 'Pampa Siguas', precio: 30, rating: 4.4, vendidos: 90, stock: 15, img: 'https://loremflickr.com/600/600/alfalfa,hay', desc: 'Fardo de alfalfa fresca del valle. Nutrición completa para ganado vacuno y caballar.'},
     {id: 'p8', nombre: 'Miel de abeja 1L', cat: 'agricola', negocio: 'Apiario La Florida', zona: 'La Florida', precio: 35, oferta: true, precioOld: 42, rating: 4.9, vendidos: 150, stock: 10, img: 'https://loremflickr.com/600/600/honey,jar', desc: 'Miel pura de flores del desierto y del valle. Endulzante natural sin aditivos.'},
     {id: 'p9', nombre: 'Manjar blanco 500g', cat: 'comida', negocio: 'Panadería El Trigo', zona: 'Centro', precio: 18, rating: 4.6, vendidos: 260, stock: 14, img: 'https://loremflickr.com/600/600/caramel,milk,dessert', desc: 'Manjar blanco casero hecho con leche de vaca del valle. Cremoso, sin preservantes.'},
     {id: 'p10', nombre: 'Cerveza artesanal IPA 6pack', cat: 'comida', negocio: 'Cervecería Joya', zona: 'Centro', precio: 55, rating: 4.5, vendidos: 120, stock: 9, img: 'https://loremflickr.com/600/600/craft,beer,bottles', desc: 'Cerveza IPA artesanal con lúpulo fresco. Pack de 6 botellas de 330ml.'},
     {id: 'p11', nombre: 'Aceite de oliva 500ml', cat: 'agricola', negocio: 'Olivar del Valle', zona: 'La Yarada', precio: 45, rating: 4.8, vendidos: 95, stock: 7, img: 'https://loremflickr.com/600/600/olive,oil,bottle', desc: 'Aceite de oliva extra virgen prensado en frío. Olivos centenarios del valle.'},
     {id: 'p12', nombre: 'Polera "Soy de La Joya"', cat: 'moda', negocio: 'Imprenta Creativa', zona: 'Centro', precio: 28, oferta: true, precioOld: 35, rating: 4.3, vendidos: 65, stock: 32, img: 'https://loremflickr.com/600/600/tshirt,cotton', desc: 'Polera de algodón con diseño "Soy de La Joya". Tallas S a XL.'},
     {id: 'p13', nombre: 'Carga de gas 10kg', cat: 'servicios', negocio: 'Gas La Joya', zona: 'Centro', precio: 55, rating: 4.4, vendidos: 780, stock: 50, img: 'https://loremflickr.com/600/600/lpg,gas,cylinder', desc: 'Cilindro de gas GLP de 10kg con delivery a domicilio en todo el distrito.'},
     {id: 'p14', nombre: 'Kit desinfección 5L', cat: 'salud', negocio: 'Botica La Salud', zona: 'Centro', precio: 32, rating: 4.5, vendidos: 340, stock: 22, img: 'https://loremflickr.com/600/600/disinfectant,cleaning', desc: 'Alcohol, lejía y jabón antibacterial en presentación familiar de 5 litros.'},
     {id: 'p15', nombre: 'Tablet Android 10"', cat: 'tech', negocio: 'TecnoJoya', zona: 'Cruce La Joya', precio: 480, rating: 4.2, vendidos: 18, stock: 5, img: 'https://loremflickr.com/600/600/android,tablet', desc: 'Tablet de 10 pulgadas con Android 13, 4GB RAM y 64GB almacenamiento. Ideal para clases virtuales.'},
     {id: 'p16', nombre: 'Memoria USB 64GB', cat: 'tech', negocio: 'TecnoJoya', zona: 'Cruce La Joya', precio: 35, oferta: true, precioOld: 45, rating: 4.6, vendidos: 210, stock: 40, img: 'https://loremflickr.com/600/600/usb,flash,drive', desc: 'Memoria USB de 64GB, USB 3.0, resistente y rápida.'},
     {id: 'p17', nombre: 'Martillo carpintero', cat: 'ferreteria', negocio: 'Ferretería El Clavo', zona: 'Centro', precio: 22, rating: 4.7, vendidos: 130, stock: 16, img: 'https://loremflickr.com/600/600/carpenter,hammer', desc: 'Martillo de carpintero con mango de fibra antideslizante. Cabeza de acero forjado.'},
     {id: 'p18', nombre: 'Cemento Atlas 42.5kg', cat: 'ferreteria', negocio: 'Ferretería El Clavo', zona: 'Centro', precio: 28, rating: 4.4, vendidos: 560, stock: 120, img: 'https://loremflickr.com/600/600/cement,bag', desc: 'Bolsa de cemento Portland tipo I de 42.5kg. Para construcciones en albañilería.'},
     {id: 'p19', nombre: 'Sandboard alquiler día', cat: 'turismo', negocio: 'Arenales Tour', zona: 'Dunas', precio: 35, rating: 4.8, vendidos: 240, stock: 8, img: 'https://loremflickr.com/600/600/sandboarding,desert', desc: 'Alquiler de tabla de sandboard por día completa. Incluye instrucción básica y guía a las dunas.'},
     {id: 'p20', nombre: 'Tour Oasis + Cataratas', cat: 'turismo', negocio: 'Arenales Tour', zona: 'Dunas', precio: 65, oferta: true, precioOld: 80, rating: 4.9, vendidos: 175, stock: 6, img: 'https://loremflickr.com/600/600/oasis,waterfall,desert', desc: 'Tour de medio día al Oasis de La Joya y Cataratas de La Cano. Incluye transporte y snack.'},
     {id: 'p21', nombre: 'Peluquería corte + barba', cat: 'servicios', negocio: 'Barbería El Corte', zona: 'Centro', precio: 25, rating: 4.6, vendidos: 680, stock: 5, img: 'https://loremflickr.com/600/600/barber,haircut', desc: 'Corte de cabello moderno y arreglo de barba. Atención con cita previa o en el local.'},
     {id: 'p22', nombre: 'Zapatos escolares par', cat: 'moda', negocio: 'Calzado La Joya', zona: 'Centro', precio: 65, rating: 4.4, vendidos: 90, stock: 24, img: 'https://loremflickr.com/600/600/school,leather,shoes', desc: 'Zapatos escolares de cuero legítimo. Plantilla acolchada. Tallas 28 a 38.'},
     {id: 'p23', nombre: 'Empanadas x docena', cat: 'comida', negocio: 'Parada 48', zona: 'Jr. Constitución', precio: 18, rating: 4.7, vendidos: 420, stock: 30, img: 'https://loremflickr.com/600/600/baked,empanadas', desc: 'Docena de empanadas de carne, pollo o queso. Masa casera, horneadas al momento.'},
     {id: 'p24', nombre: 'Leche fresca 3L', cat: 'agricola', negocio: 'Fundo San Martín', zona: 'Pampa Siguas', precio: 15, rating: 4.5, vendidos: 230, stock: 18, img: 'https://loremflickr.com/600/600/fresh,milk,bottle', desc: 'Leche fresca de vaca, ordeñada el mismo día. Sin aditivos ni conservantes.'}
   ],
   
   negocios: [
     {id: 'b1', nombre: 'Quesería La Joya', cat: 'mercados', desc: 'Quesos frescos y maduros artesanales, leche directa del fundo.', zona: 'Centro', dir: 'Jr. Tacna 210', tel: '960469669', wa: '51960469669', horario: 'L–S 7:00–18:00 · D 7:00–13:00', rating: 4.7, lat: -16.3436, lng: -71.8439, cover: 'https://loremflickr.com/800/450/cheese,dairy', fb: 'https://facebook.com', ig: 'https://instagram.com'},
     {id: 'b2', nombre: 'Agroexportadora La Yarada', cat: 'agricola', desc: 'Páprika, cebolla y ajíes exportados a EE.UU. y Europa.', zona: 'La Yarada', dir: 'Carretera La Yarada km 2', tel: '960469669', wa: '51960469669', horario: 'L–V 8:00–17:00', rating: 4.9, lat: -16.3712, lng: -71.8923, cover: 'https://loremflickr.com/800/450/agriculture,pepper,onions'},
     {id: 'b3', nombre: 'Picantería La Supe', cat: 'comida', desc: 'Chicharrón, adobo y chicharrones joyanos. La sazón del sur.', zona: 'Cruce La Joya', dir: 'Av. Panamericana 145', tel: '960469669', wa: '51960469669', horario: 'L–D 8:00–22:00', rating: 4.8, lat: -16.3389, lng: -71.8521, cover: 'https://loremflickr.com/800/450/peruvian,restaurant,food'},
     {id: 'b4', nombre: 'Panadería El Trigo', cat: 'comida', desc: 'Pan chuta, pan francés y repostería artesanal del valle.', zona: 'Centro', dir: 'Jr. Arequipa 340', tel: '960469669', wa: '51960469669', horario: 'L–S 5:00–20:00 · D 5:00–13:00', rating: 4.5, lat: -16.3421, lng: -71.8456, cover: 'https://loremflickr.com/800/450/bakery,bread'},
     {id: 'b5', nombre: 'Parada 48', cat: 'comida', desc: 'Menús caseros, rocoto relleno, empanadas y la mejor causa joyana.', zona: 'Jr. Constitución', dir: 'Jr. Constitución 48', tel: '960469669', wa: '51960469669', horario: 'L–S 8:00–18:00', rating: 4.7, lat: -16.3456, lng: -71.8478, cover: 'https://loremflickr.com/800/450/peruvian,food,restaurant'},
     {id: 'b6', nombre: 'Fundo San Martín', cat: 'agricola', desc: 'Leche fresca, alfalfa, maíz y derivados lácteos del valle.', zona: 'Pampa Siguas', dir: 'Fundo San Martín s/n', tel: '960469669', wa: '51960469669', horario: 'L–D 6:00–17:00', rating: 4.4, lat: -16.3578, lng: -71.8612, cover: 'https://loremflickr.com/800/450/dairy,farm,cows'},
     {id: 'b7', nombre: 'Apiario La Florida', cat: 'agricola', desc: 'Miel, polen, propóleo y jalea real de flores del desierto.', zona: 'La Florida', dir: 'La Florida Mz. C-12', tel: '960469669', wa: '51960469669', horario: 'L–S 8:00–17:00', rating: 4.9, lat: -16.3612, lng: -71.8334, cover: 'https://loremflickr.com/800/450/beekeeping,honey'},
     {id: 'b8', nombre: 'Cervecería Joya', cat: 'comida', desc: 'Cerveza artesanal IPA, Stout y Honey. Tap room y tours.', zona: 'Centro', dir: 'Jr. Lima 280', tel: '960469669', wa: '51960469669', horario: 'M–S 16:00–23:00', rating: 4.5, lat: -16.3402, lng: -71.8467, cover: 'https://loremflickr.com/800/450/craft,brewery,beer'},
     {id: 'b9', nombre: 'Olivar del Valle', cat: 'agricola', desc: 'Aceite de oliva extra virgen prensado en frío de olivos centenarios.', zona: 'La Yarada', dir: 'La Yarada Sur 1450', tel: '960469669', wa: '51960469669', horario: 'L–V 8:00–16:00', rating: 4.8, lat: -16.3721, lng: -71.8934, cover: 'https://loremflickr.com/800/450/olive,grove,oil'},
     {id: 'b10', nombre: 'Gas La Joya', cat: 'servicios', desc: 'Venta y distribución de gas GLP con delivery a todo el distrito.', zona: 'Centro', dir: 'Av. Panamericana 110', tel: '960469669', wa: '51960469669', horario: 'L–D 7:00–21:00', rating: 4.4, lat: -16.3411, lng: -71.8422, cover: 'https://loremflickr.com/800/450/gas,cylinders'},
     {id: 'b11', nombre: 'Botica La Salud', cat: 'salud', desc: 'Medicamentos, productos de higiene y atención farmacéutica.', zona: 'Centro', dir: 'Jr. Junín 220', tel: '960469669', wa: '51960469669', horario: 'L–S 8:00–22:00 · D 8:00–14:00', rating: 4.5, lat: -16.3425, lng: -71.8433, cover: 'https://loremflickr.com/800/450/pharmacy,store'},
     {id: 'b12', nombre: 'TecnoJoya', cat: 'tech', desc: 'Tablets, celulares, accesorios y soporte técnico. Pago en cuotas.', zona: 'Cruce La Joya', dir: 'Cruce La Joya 50', tel: '960469669', wa: '51960469669', horario: 'L–S 9:00–20:00 · D 10:00–14:00', rating: 4.2, lat: -16.3395, lng: -71.8512, cover: 'https://loremflickr.com/800/450/electronics,computer,shop'},
     {id: 'b13', nombre: 'Ferretería El Clavo', cat: 'ferreteria', desc: 'Materiales de construcción, herramientas y ferretería en general.', zona: 'Centro', dir: 'Jr. Callao 145', tel: '960469669', wa: '51960469669', horario: 'L–S 8:00–19:00 · D 8:00–13:00', rating: 4.4, lat: -16.3417, lng: -71.8458, cover: 'https://loremflickr.com/800/450/hardware,tools,store'},
     {id: 'b14', nombre: 'Arenales Tour', cat: 'turismo', desc: 'Sandboard, tours en 4x4 y visitas a las cataratas y el oasis.', zona: 'Dunas', dir: 'Cruce La Joya 145', tel: '960469669', wa: '51960469669', horario: 'L–D 7:00–20:00', rating: 4.9, lat: -16.3289, lng: -71.8623, cover: 'https://loremflickr.com/800/450/sandboarding,desert'},
     {id: 'b15', nombre: 'Barbería El Corte', cat: 'servicios', desc: 'Cortes modernos, arreglo de barba y tratamientos capilares.', zona: 'Centro', dir: 'Jr. Moquegua 88', tel: '960469669', wa: '51960469669', horario: 'L–S 9:00–20:00 · D 9:00–14:00', rating: 4.6, lat: -16.3433, lng: -71.8444, cover: 'https://loremflickr.com/800/450/barbershop,interior'},
     {id: 'b16', nombre: 'Calzado La Joya', cat: 'moda', desc: 'Zapatos escolares, de vestir y de seguridad. Calzado nacional.', zona: 'Centro', dir: 'Jr. Lima 145', tel: '960469669', wa: '51960469669', horario: 'L–S 9:00–19:00', rating: 4.4, lat: -16.3422, lng: -71.8461, cover: 'https://loremflickr.com/800/450/shoe,store'},
     {id: 'b17', nombre: 'Imprenta Creativa', cat: 'servicios', desc: 'Poleras, tarjetas, banners y merchandising personalizado.', zona: 'Centro', dir: 'Jr. Tacna 50', tel: '960469669', wa: '51960469669', horario: 'L–S 9:00–19:00', rating: 4.3, lat: -16.3429, lng: -71.8451, cover: 'https://loremflickr.com/800/450/printing,screenprinting'},
     {id: 'b18', nombre: 'Moto Taxi La Joya Express', cat: 'transporte', desc: 'Mototaxi y motocicleta para reparto urbano y tours cortos.', zona: 'Cruce La Joya', dir: 'Cruce La Joya s/n', tel: '960469669', wa: '51960469669', horario: 'L–D 5:00–23:00', rating: 4.3, lat: -16.3392, lng: -71.8525, cover: 'https://loremflickr.com/800/450/motorcycle,delivery'},
     {id: 'b19', nombre: 'Hostal El Oasis', cat: 'turismo', desc: 'Habitaciones con desayuno, excursiones a las dunas incluidas.', zona: 'Dunas', dir: 'Km 12 Panamericana Sur', tel: '960469669', wa: '51960469669', horario: 'Recepción 24h', rating: 4.6, lat: -16.3298, lng: -71.8654, cover: 'https://loremflickr.com/800/450/hostel,hotel,room'},
     {id: 'b20', nombre: 'Clinica Dental Sorriso', cat: 'salud', desc: 'Atención odontológica integral, ortodoncia y estética dental.', zona: 'Centro', dir: 'Jr. Arequipa 198', tel: '960469669', wa: '51960469669', horario: 'L–S 9:00–20:00', rating: 4.7, lat: -16.3418, lng: -71.8455, cover: 'https://loremflickr.com/800/450/dental,clinic'}
   ],
    lugares: [
      {id:'l1',nombre:'El Oasis de La Joya',cat:'Naturaleza',lat:-16.3461,lng:-71.8592,desc:'Paraje desértico con afloramiento de aguas subterráneas.'},
      {id:'l2',nombre:'Dunas de La Joya',cat:'Aventura',lat:-16.3289,lng:-71.8623,desc:'Dunas ideales para sandboard y 4x4.'},
      {id:'l3',nombre:'Cataratas de La Cano',cat:'Naturaleza',lat:-16.3589,lng:-71.8821,desc:'Cascada en medio del desierto.'},
      {id:'l4',nombre:'Parada 48',cat:'Sabor local',lat:-16.3456,lng:-71.8478,desc:'Comida tradicional joyana.'},
      {id:'l5',nombre:'Cruce de La Joya',cat:'Comercio',lat:-16.3389,lng:-71.8521,desc:'Centro neurálgico del distrito.'},
      {id:'l6',nombre:'Piscinas campestres',cat:'Familia',lat:-16.3612,lng:-71.8334,desc:'Balnearios de agua templada con parrillas.'}
    ],
    empleos: [
      {id:'j1',titulo:'Chofer de reparto',cat:'transporte',empresa:'Gas La Joya',salario:1500,tipo:'Tiempo completo',zona:'Centro',desc:'Licencia A-IIIB. Recorrido por todo el distrito. Combustible a cargo de la empresa.'},
      {id:'j2',titulo:'Vendedora de mostrador',cat:'comercio',empresa:'Botica La Salud',salario:1300,tipo:'Tiempo completo',zona:'Centro',desc:'Atención al público, manejo de caja y stock. Experiencia mínima 6 meses.'},
      {id:'j3',titulo:'Operario agrícola',cat:'agricultura',empresa:'Agroexportadora La Yarada',salario:1800,tipo:'Temporada',zona:'La Yarada',desc:'Cosecha y selección de páprika y cebolla. Alimentación incluida.'},
      {id:'j4',titulo:'Cocinera',cat:'servicios',empresa:'Picantería La Supe',salario:1600,tipo:'Tiempo completo',zona:'Cruce La Joya',desc:'Cocina criolla arequipeña. Experiencia en picantería.'},
      {id:'j5',titulo:'Asistente administrativo CAS',cat:'estado',empresa:'Municipalidad Distrital de La Joya',salario:2500,tipo:'CAS 6 meses',zona:'Plaza de Armas',desc:'Profesional en administración o afines. Convocatoria CAS 2025.'},
      {id:'j6',titulo:'Mototaxista',cat:'transporte',empresa:'Moto Taxi Express',salario:1400,tipo:'Tiempo completo',zona:'Cruce La Joya',desc:'Moto propia o de la empresa. Permiso municipal al día.'},
      {id:'j7',titulo:'Barbero',cat:'servicios',empresa:'Barbería El Corte',salario:1700,tipo:'Tiempo completo',zona:'Centro',desc:'Experiencia comprobada. Comisiones por servicio adicional.'},
      {id:'j8',titulo:'Técnico en celulares',cat:'servicios',empresa:'TecnoJoya',salario:1900,tipo:'Tiempo completo',zona:'Cruce La Joya',desc:'Reparación de celulares y tablets. Conocimiento de microsoldadura.'},
      {id:'j9',titulo:'Guía turístico',cat:'turismo',empresa:'Arenales Tour',salario:2000,tipo:'Temporada',zona:'Dunas',desc:'Bilingüe español-inglés preferente. Curso de guía turístico.'},
      {id:'j10',titulo:'Panadero',cat:'comercio',empresa:'Panadería El Trigo',salario:1500,tipo:'Tiempo completo',zona:'Centro',desc:'Experiencia en masas y fermentación. Turnos rotativos.'},
      {id:'j11',titulo:'Promotor de ventas',cat:'comercio',empresa:'Imprenta Creativa',salario:1400,tipo:'Tiempo completo',zona:'Centro',desc:'Visitas a negocios del distrito. Comisiones por venta.'},
      {id:'j12',titulo:'Inspector SERVIR',cat:'estado',empresa:'Municipalidad Distrital de La Joya',salario:2800,tipo:'CAS 3 meses',zona:'Plaza de Armas',desc:'Apoyo en módulo SERVIR sábados. Conocimientos en trámites.'}
    ],
    transporte: {
      puntos: [
        {id:'arequipa',nombre:'Arequipa Centro',lat:-16.3989,lng:-71.5350},
        {id:'cruce',nombre:'Cruce La Joya',lat:-16.3389,lng:-71.8521},
        {id:'yarada',nombre:'La Yarada',lat:-16.3712,lng:-71.8923},
        {id:'siguas',nombre:'Pampa Siguas',lat:-16.3578,lng:-71.8612},
        {id:'majes',nombre:'Majes',lat:-16.2518,lng:-72.0250},
        {id:'villa',nombre:'Villa El Pedregal',lat:-16.2725,lng:-71.9425}
      ],
      tipos: [
        {id:'bus',nombre:'Bus interprovincial',icon:'🚌',factor:1,velocidad:55},
        {id:'minivan',nombre:'Minivan',icon:'🚐',factor:1.5,velocidad:60},
        {id:'mototaxi',nombre:'Mototaxi',icon:'🛺',factor:2.2,velocidad:35},
        {id:'colectivo',nombre:'Colectivo',icon:'🚗',factor:1.8,velocidad:65}
      ],
      base: 4.50
    },
    integraciones: [
      {id:'i1',nombre:'OpenStreetMap',estado:'ok',label:'Conectado',funcion:'Mapa interactivo del distrito',accion:'Recargar mapa'},
      {id:'i2',nombre:'Open-Meteo API',estado:'ok',label:'Conectado',funcion:'Clima del valle en vivo',accion:'Actualizar clima'},
      {id:'i3',nombre:'WhatsApp Business',estado:'sandbox',label:'Sandbox',funcion:'Pedidos directos al negocio',accion:'Configurar'},
      {id:'i4',nombre:'Culqi Pagos',estado:'sandbox',label:'Sandbox',funcion:'Pagos con tarjeta (demo)',accion:'Probar pago'},
      {id:'i5',nombre:'Niubiz',estado:'demo',label:'Demo',funcion:'Pasarela de pago Visa/Mastercard',accion:'Configurar'},
      {id:'i6',nombre:'Plin / Yape',estado:'demo',label:'Demo',funcion:'Pago con QR simple',accion:'Generar QR'},
      {id:'i7',nombre:'SUNAT RUC',estado:'ok',label:'Conectado',funcion:'Validación de RUC de negocios',accion:'Validar RUC'},
      {id:'i8',nombre:'RENIEC',estado:'demo',label:'Demo',funcion:'Validación de DNI del comprador',accion:'Validar DNI'},
      {id:'i9',nombre:'Correo Peru',estado:'sandbox',label:'Sandbox',funcion:'Envíos nacionales',accion:'Cotizar envío'},
      {id:'i10',nombre:'SENATI / CEPROSEL',estado:'ok',label:'Conectado',funcion:'Cursos y certificaciones',accion:'Ver cursos'}
    ],
    agenda: [
      {dia:'12',mes:'OCT',titulo:'Feria dominical de productores',desc:'Plaza de Armas · 6:00 a. m.'},
      {dia:'18',mes:'OCT',titulo:'Campaña de esterilización gratuita',desc:'Plaza de Armas · 9:00 a. m.'},
      {dia:'25',mes:'OCT',titulo:'Concierto de aniversario',desc:'Plaza de Armas · 7:00 p. m.'},
      {dia:'01',mes:'NOV',titulo:'Inscripciones liga fútbol 7',desc:'Oficina municipal · 8:00 a. m.'},
      {dia:'10',mes:'NOV',titulo:'Expo Joya agroexportadora',desc:'Fundo San Martín · 9:00 a. m.'}
    ],
    monedas: [
      {code:'PEN',flag:'🇵🇪',symbol:'S/',name:'Sol peruano',rate:1},
      {code:'USD',flag:'🇺🇸',symbol:'$',name:'Dólar',rate:0.27},
      {code:'EUR',flag:'🇪🇺',symbol:'€',name:'Euro',rate:0.25},
      {code:'BRL',flag:'🇧🇷',symbol:'R$',name:'Real',rate:1.32},
      {code:'CLP',flag:'🇨🇱',symbol:'$',name:'Peso chileno',rate:240},
      {code:'ARS',flag:'🇦🇷',symbol:'$',name:'Peso arg.',rate:280}
    ]
  };

  /* ---------- STORAGE ---------- */
  const store = {
    get(key,def){
      try{
        const v = localStorage.getItem('lj_'+key);
        return v ? JSON.parse(v) : def;
      }catch(e){ return def; }
    },
    set(key,val){
      try{ localStorage.setItem('lj_'+key, JSON.stringify(val)); }
      catch(e){}
    },
    del(key){ try{ localStorage.removeItem('lj_'+key); }catch(e){} }
  };

  /* ---------- HELPERS ---------- */
  const $ = (sel,ctx=document)=>ctx.querySelector(sel);
  const $$ = (sel,ctx=document)=>Array.from(ctx.querySelectorAll(sel));
  const fmt = (n) => new Intl.NumberFormat('es-PE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
  const money = (pen,currency=store.get('currency','PEN'))=>{
    const cur = DATA.monedas.find(m=>m.code===currency) || DATA.monedas[0];
    return cur.symbol+' '+fmt(pen*cur.rate);
  };
  const esc = (s)=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const qs = ()=> new URLSearchParams(location.search);
  const star = (r)=>'★'.repeat(Math.round(r))+'☆'.repeat(5-Math.round(r));
  const debounce = (fn,ms=200)=>{
    let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn.apply(null,a),ms); };
  };

  /* ---------- TOAST ---------- */
  function toast(msg,type='info'){
    const box = $('#toasts'); if(!box) return;
    const t = document.createElement('div');
    t.className = 'toast '+type;
    const icons = {ok:'✓',err:'!',info:'ℹ'};
    t.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="${type==='err'?'M15 9l-6 6M9 9l6 6':'M9 12l2 2 4-4'}"/></svg><span>${esc(msg)}</span>`;
    box.appendChild(t);
    setTimeout(()=>{ t.classList.add('out'); setTimeout(()=>t.remove(),350); },3500);
  }

  /* ---------- MODAL ---------- */
  function openModal(id){
    const m = $('#'+id); if(!m) return;
    m.classList.add('open'); document.body.style.overflow='hidden';
  }
  function closeModal(id){
    const m = (typeof id==='string') ? $('#'+id) : (id.closest ? id.closest('.modal') : null);
    if(!m) return;
    m.classList.remove('open');
    if(!$$('.modal.open').length) document.body.style.overflow='';
  }
  function closeAllModals(){ $$('.modal.open').forEach(m=>m.classList.remove('open')); document.body.style.overflow=''; }

  /* ---------- CONFIRM ---------- */
  let confirmCb = null;
  function confirm(msg,cb){
    $('#cfMsg').textContent = msg;
    confirmCb = cb;
    openModal('mdConfirm');
  }

  /* ---------- POPOVER ---------- */
  function initPopovers(){
    document.addEventListener('click',(e)=>{
      const trg = e.target.closest('.pop-wrap > .hu-item, .pop-wrap > .hc-all, .pop-wrap > .hc-more');
      if(trg){
        e.preventDefault();
        const pop = trg.parentElement.querySelector('.pop');
        const wasOpen = pop.classList.contains('show');
        $$('.pop.show').forEach(p=>p.classList.remove('show'));
        if(!wasOpen) pop.classList.add('show');
        return;
      }
      if(!e.target.closest('.pop')){
        $$('.pop.show').forEach(p=>p.classList.remove('show'));
      }
    });
  }

  /* ---------- PRELOADER / SCROLL ---------- */
  function initPreloader(){
    const pl = $('#preloader');
    if(pl){
      setTimeout(()=>pl.classList.add('done'),800);
      setTimeout(()=>pl.remove(),1400);
    }
    const sb = $('#scrollbar');
    const header = $('#siteHeader');
    const onScroll = ()=>{
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max>0 ? (h.scrollTop/max)*100 : 0;
      if(sb) sb.style.width = p+'%';
      if(header) header.classList.toggle('scrolled', window.scrollY>10);
    };
    window.addEventListener('scroll',onScroll,{passive:true});
    onScroll();
  }

  /* ---------- REVEAL ON SCROLL ---------- */
  function initReveal(){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    },{threshold:0.12, rootMargin:'0px 0px -60px 0px'});
    $$('.reveal').forEach(el=>io.observe(el));
  }

  /* ---------- MOBILE MENU ---------- */
  function initMobileMenu(){
    const menu = $('#mobileMenu');
    document.addEventListener('click',(e)=>{
      if(e.target.closest('[data-action="menu-open"]')){
        menu.classList.add('open'); document.body.classList.add('menu-open');
      }else if(e.target.closest('[data-action="menu-close"]') || (e.target.closest('#mobileMenu a') && !e.target.closest('button'))){
        menu.classList.remove('open'); document.body.classList.remove('menu-open');
      }
    });
  }

  /* ---------- HEADER SEARCH / PREDICTIVE ---------- */
  function initHeaderSearch(){
    const input = $('#hSearch');
    const drop = $('#gsDrop');
    if(!input || !drop) return;
    const onInput = debounce(()=>{
      const q = input.value.trim().toLowerCase();
      if(q.length<2){ drop.hidden=true; return; }
      const prods = DATA.productos.filter(p=>(p.nombre+' '+p.negocio).toLowerCase().includes(q)).slice(0,4);
      const bizs = DATA.negocios.filter(b=>(b.nombre+' '+b.cat).toLowerCase().includes(q)).slice(0,3);
      const jobs = DATA.empleos.filter(j=>(j.titulo+' '+j.empresa).toLowerCase().includes(q)).slice(0,2);
      if(!prods.length && !bizs.length && !jobs.length){
        drop.innerHTML = '<div class="gs-empty">Sin resultados para "'+esc(q)+'"</div>';
      }else{
        drop.innerHTML = ''
          + prods.map(p=>`<a data-action="open-product" data-id="${p.id}"><b>${esc(p.nombre)}</b><small>Producto · ${money(p.precio)}</small></a>`).join('')
          + bizs.map(b=>`<a data-action="open-business" data-id="${b.id}"><b>${esc(b.nombre)}</b><small>Negocio · ${b.cat}</small></a>`).join('')
          + jobs.map(j=>`<a data-action="open-job" data-id="${j.id}"><b>${esc(j.titulo)}</b><small>Empleo · ${j.empresa}</small></a>`).join('');
      }
      drop.hidden=false;
    },180);
    input.addEventListener('input',onInput);
    $('#hSearchForm').addEventListener('submit',(e)=>{
      e.preventDefault();
      const q = input.value.trim();
      if(!q) return;
      drop.hidden=true;
      LJ.commerce.search(q);
    });
    drop.addEventListener('click',(e)=>{
      const a = e.target.closest('a[data-action]'); if(!a) return;
      const act = a.dataset.action; const id = a.dataset.id;
      drop.hidden=true; input.value='';
      if(act==='open-product') LJ.commerce.openProduct(id);
      else if(act==='open-business') LJ.commerce.openBusiness(id);
      else if(act==='open-job') LJ.commerce.openJob(id);
    });
  }

  /* ---------- CLIMA (Open-Meteo) ---------- */
  async function initWeather(){
    const chip = $('#weatherChip'); if(!chip) return;
    try{
      // La Joya coords aprox
      const lat=-16.34, lng=-71.85;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&timezone=America/Lima`;
      const res = await fetch(url);
      const data = await res.json();
      if(data && data.current){
        const t = Math.round(data.current.temperature_2m);
        const code = data.current.weather_code;
        const icon = code<3?'☀️':code<50?'🌤':code<70?'☁️':code<90?'🌧':'⛈';
        chip.innerHTML = `${icon} ${t}°C · Clima en La Joya, Arequipa`;
      }else throw new Error('No data');
    }catch(e){
      chip.innerHTML = '☀️ 22°C · Clima en La Joya, Arequipa';
    }
  }

  /* ---------- ATENCIÓN HORARIO ---------- */
  function initAttention(){
    const status = $('#atnStatus');
    const text = $('#atnText');
    if(!status || !text) return;
    const now = new Date();
    const h = now.getHours();
    const d = now.getDay(); // 0=D, 6=S
    let open = false, label='';
    if(d>=1 && d<=5){ open = h>=8 && h<16; label = open?'Abierto ahora':'Cerrado por hoy'; }
    else if(d===6){ open = h>=8 && h<13; label = open?'Abierto · módulo SERVIR':'Cerrado · regresa lunes'; }
    else { label='Cerrado · feria dominical'; }
    if(open){ status.classList.remove('closed'); text.textContent = label+' · ventanas de atención'; }
    else { status.classList.add('closed'); text.textContent = label; }
  }

  /* ---------- AGENDA ---------- */
  function renderAgenda(){
    const list = $('#agendaList'); if(!list) return;
    list.innerHTML = DATA.agenda.map(a=>`
      <div class="agenda-item">
        <div class="agenda-date"><b>${a.dia}</b><span>${a.mes}</span></div>
        <div class="agenda-body"><b>${esc(a.titulo)}</b><span>${esc(a.desc)}</span></div>
      </div>
    `).join('');
  }

  /* ---------- CARRUSEL ---------- */
  function initCarousel(){
    const vp = $('#carViewport');
    const track = $('#carTrack');
    const prev = $('#carPrev');
    const next = $('#carNext');
    const count = $('#carCount');
    const bar = $('#carBar');
    const dots = $('#carDots');
    if(!vp || !track) return;
    const slides = $$('article',track);
    const total = slides.length;
    if(dots){
      dots.innerHTML = slides.map((_,i)=>`<button data-i="${i}" class="${i===0?'on':''}" role="tab" aria-label="Ir a la parada ${i+1}"></button>`).join('');
    }
    const goTo = (i)=>{
      i = Math.max(0,Math.min(total-1,i));
      const w = slides[i].offsetWidth + 20;
      vp.scrollTo({left: i*w, behavior:'smooth'});
      update(i);
    };
    const update = (i)=>{
      if(count) count.innerHTML = String(i+1).padStart(2,'0')+' <small>/ '+String(total).padStart(2,'0')+'</small>';
      if(bar) bar.style.width = (((i+1)/total)*100)+'%';
      if(dots) $$('button',dots).forEach((b,k)=>b.classList.toggle('on',k===i));
    };
    if(prev) prev.addEventListener('click',()=>{ const i=Math.round(vp.scrollLeft/(slides[0].offsetWidth+20)); goTo(i-1); });
    if(next) next.addEventListener('click',()=>{ const i=Math.round(vp.scrollLeft/(slides[0].offsetWidth+20)); goTo(i+1); });
    if(dots) dots.addEventListener('click',(e)=>{ const b=e.target.closest('button[data-i]'); if(b) goTo(parseInt(b.dataset.i)); });
    let t;
    vp.addEventListener('scroll',()=>{
      clearTimeout(t);
      t = setTimeout(()=>{
        const i = Math.round(vp.scrollLeft/(slides[0].offsetWidth+20));
        update(Math.max(0,Math.min(total-1,i)));
      },80);
    });
    update(0);
  }

  /* ---------- LEAFLET MAP ---------- */
  let mapInstance = null;
  let markersLayer = null;
  function initMap(){
    const el = $('#map');
    const fallback = $('#mapFallback');
    if(!el) return;
    if(typeof L === 'undefined'){
      el.hidden = true; fallback.hidden=false; return;
    }
    try{
      mapInstance = L.map(el,{scrollWheelZoom:false}).setView([-16.3436,-71.8521],13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution:'© OpenStreetMap',
        maxZoom:19
      }).addTo(mapInstance);
      markersLayer = L.layerGroup().addTo(mapInstance);
      renderMapMarkers('todos');
    }catch(e){
      el.hidden = true; fallback.hidden=false;
    }
    setTimeout(()=>{ if(mapInstance) mapInstance.invalidateSize(); },300);
  }
  function renderMapMarkers(filter){
    if(!mapInstance || !markersLayer) return;
    markersLayer.clearLayers();
    const catMap = {comida:'comida',tiendas:'mercados',servicios:'servicios',farmacias:'salud',transporte:'transporte',turismo:'turismo'};
    let points = [];
    if(filter==='cerca'){
      // demo: imagina que el usuario está cerca del centro
      points = DATA.negocios.filter(b=>{
        const dx=b.lat-(-16.3436), dy=b.lng-(-71.8521);
        return Math.sqrt(dx*dx+dy*dy) < 0.015;
      });
      if(points.length===0) points = DATA.negocios.slice(0,6);
    }else if(filter==='todos'){
      points = DATA.negocios.slice();
    }else{
      points = DATA.negocios.filter(b=>b.cat===catMap[filter]);
    }
    // agregar lugares
    const lugares = DATA.lugares.filter(l=>filter==='todos'||filter==='turismo');
    lugares.forEach(l=>{
      const m = L.marker([l.lat,l.lng]).addTo(markersLayer);
      m.bindPopup(`<b>${esc(l.nombre)}</b><span class="pp-cat">${esc(l.cat)}</span><span class="pp-addr">${esc(l.desc)}</span>`);
    });
    const icons = {
      comida:'🍴',mercados:'🛒',agricola:'🌾',servicios:'🔧',salud:'💊',
      transporte:'🚕',turismo:'🏨',ferreteria:'🔨',moda:'👕',tech:'📱'
    };
    points.forEach(b=>{
      const ic = icons[b.cat]||'📍';
      const m = L.marker([b.lat,b.lng]).addTo(markersLayer);
      m.bindPopup(`
        <b>${esc(b.nombre)}</b>
        <span class="pp-cat">${esc(b.cat)}</span>
        <span class="pp-addr">📍 ${esc(b.dir)}</span>
        <a class="pp-link" data-action="open-business" data-id="${b.id}" href="#">Ver ficha →</a>
      `);
    });
    LJ._mapMarkers = points;
  }
  function initMapChips(){
    const row = $('#mapChips'); if(!row) return;
    row.addEventListener('click',(e)=>{
      const b = e.target.closest('button[data-f]'); if(!b) return;
      $$('button',row).forEach(x=>x.classList.remove('on'));
      b.classList.add('on');
      renderMapMarkers(b.dataset.f);
    });
  }

  /* ---------- TRANSPORTE ---------- */
  function initTransporte(){
    const fromSel = $('#trFrom');
    const toSel = $('#trTo');
    const typesBox = $('#trTypes');
    const goBtn = $('#trGo');
    const result = $('#trResult');
    const list = $('#trList');
    if(!fromSel || !toSel) return;
    // Llenar selects
    fromSel.innerHTML = DATA.transporte.puntos.map(p=>`<option value="${p.id}">${esc(p.nombre)}</option>`).join('');
    toSel.innerHTML = DATA.transporte.puntos.map(p=>`<option value="${p.id}">${esc(p.nombre)}</option>`).join('');
    toSel.value = 'cruce';
    // Tipos
    typesBox.innerHTML = DATA.transporte.tipos.map((t,i)=>`
      <button class="tr-type ${i===0?'on':''}" data-id="${t.id}">${t.icon} ${esc(t.nombre)}</button>
    `).join('');
    let selType = DATA.transporte.tipos[0].id;
    typesBox.addEventListener('click',(e)=>{
      const b = e.target.closest('.tr-type'); if(!b) return;
      $$('.tr-type',typesBox).forEach(x=>x.classList.remove('on'));
      b.classList.add('on'); selType = b.dataset.id;
    });
    // Tarifas vigentes
    const tarifasBase = [
      {ruta:'Arequipa → La Joya',bus:'S/ 8',colectivo:'S/ 12',minivan:'S/ 15'},
      {ruta:'La Joya → La Yarada',bus:'S/ 3',colectivo:'S/ 5',minivan:'S/ 6'},
      {ruta:'La Joya → Majes',bus:'S/ 10',colectivo:'S/ 15',minivan:'S/ 18'},
      {ruta:'La Joya → Villa El Pedregal',bus:'S/ 6',colectivo:'S/ 9',minivan:'S/ 11'}
    ];
    list.innerHTML = tarifasBase.map(t=>`
      <div class="tr-fare">
        <div><b style="font-family:var(--ff-serif);color:var(--paper)">${esc(t.ruta)}</b>
          <small>Bus ${t.bus} · Colectivo ${t.colectivo} · Minivan ${t.minivan}</small>
        </div>
        <b>${t.bus.split(' ')[1]||'S/ 3'}</b>
      </div>
    `).join('');
    // Calcular
    goBtn.addEventListener('click',()=>{
      const from = DATA.transporte.puntos.find(p=>p.id===fromSel.value);
      const to = DATA.transporte.puntos.find(p=>p.id===toSel.value);
      const tipo = DATA.transporte.tipos.find(t=>t.id===selType);
      if(from.id===to.id){ toast('Elige destinos distintos','err'); return; }
      const dx = from.lat-to.lat, dy = from.lng-to.lng;
      const km = Math.sqrt(dx*dx+dy*dy)*111;
      const precio = (DATA.transporte.base + km*0.45) * tipo.factor;
      const tiempo = Math.round((km / tipo.velocidad) * 60);
      result.innerHTML = `
        <div class="tr-row"><span>Tramo</span><b>${esc(from.nombre)} → ${esc(to.nombre)}</b></div>
        <div class="tr-row"><span>Tipo</span><b>${tipo.icon} ${esc(tipo.nombre)}</b></div>
        <div class="tr-row"><span>Distancia</span><b>${km.toFixed(1)} km</b></div>
        <div class="tr-row"><span>Tiempo estimado</span><b>${tiempo} min</b></div>
        <div class="tr-row"><span>Precio referencial</span><b>${money(precio)}</b></div>
      `;
      result.classList.add('show');
    });
  }

  /* ---------- INTEGRACIONES ---------- */
  function renderIntegraciones(){
    const body = $('#intBody'); if(!body) return;
    body.innerHTML = DATA.integraciones.map(i=>`
      <tr>
        <td><b>${esc(i.nombre)}</b></td>
        <td><span class="int-status ${i.estado}">${i.label}</span></td>
        <td>${esc(i.funcion)}</td>
        <td><button class="f-link" data-action="integration-action" data-id="${i.id}">${esc(i.accion)}</button></td>
      </tr>
    `).join('');
    body.addEventListener('click',(e)=>{
      const b = e.target.closest('[data-action="integration-action"]'); if(!b) return;
      const i = DATA.integraciones.find(x=>x.id===b.dataset.id);
      if(!i) return;
      if(i.estado==='ok') toast(i.nombre+': '+i.label+' ✓','ok');
      else if(i.estado==='sandbox') toast('Sandbox de '+i.nombre+' listo · conecta tu API key para activar','info');
      else toast(i.nombre+' en modo demo — solicitar acceso al admin','info');
    });
  }

  /* ---------- DER (modelo de datos) ---------- */
  function renderDER(){
    const grid = $('#derGrid'); if(!grid) return;
    const entities = [
      {n:'Usuario',c:['id','nombre','email','rol','teléfono']},
      {n:'Negocio',c:['id','nombre','rubro','teléfono','ubicación']},
      {n:'Producto',c:['id','negocio_id','nombre','precio','stock']},
      {n:'Pedido',c:['id','usuario_id','total','estado','fecha']},
      {n:'PedidoItem',c:['id','pedido_id','producto_id','cantidad']},
      {n:'Pago',c:['id','pedido_id','monto','método','estado']},
      {n:'Empleo',c:['id','negocio_id','puesto','salario','tipo']},
      {n:'Postulación',c:['id','empleo_id','usuario_id','fecha']}
    ];
    grid.innerHTML = entities.map(e=>`
      <div class="der-card">
        <b>${esc(e.n)}</b>
        <ul>${e.c.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>
      </div>
    `).join('');
  }

  /* ---------- MONEDA ---------- */
  function initCurrency(){
    const btn = $('#curBtn');
    const pop = $('#curPop');
    const list = $('#curList');
    const flag = $('#curFlag');
    const label = $('#curLabel');
    if(!btn || !pop || !list) return;
    list.innerHTML = DATA.monedas.map(m=>`
      <div class="cur-row" data-code="${m.code}">
        <span class="cur-flag">${m.flag}</span>
        <span><b>${m.code}</b> · ${m.name}</span>
        <small>${m.symbol}</small>
      </div>
    `).join('');
    const updateUI = ()=>{
      const cur = store.get('currency','PEN');
      const m = DATA.monedas.find(x=>x.code===cur) || DATA.monedas[0];
      if(flag) flag.textContent = m.flag;
      if(label) label.textContent = m.code+' ▾';
    };
    updateUI();
    list.addEventListener('click',(e)=>{
      const r = e.target.closest('.cur-row'); if(!r) return;
      store.set('currency', r.dataset.code);
      updateUI();
      pop.classList.remove('show');
      LJ.commerce.renderCatalog();
      LJ.commerce.renderCartMini();
      LJ.commerce.renderCartFull();
      toast('Moneda cambiada a '+r.dataset.code,'ok');
    });
  }

  /* ---------- NEWSLETTER + APP ---------- */
  function initNewsletter(){
    const form = $('#newsForm'); if(!form) return;
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const email = $('#newsEmail').value.trim();
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ toast('Email inválido','err'); return; }
      toast('¡Suscrito al boletín de La Joya!','ok');
      form.reset();
    });
    const appBtn = $('#appSend');
    if(appBtn) appBtn.addEventListener('click',()=>{
      toast('Te enviaremos el enlace de la app por SMS (demo)','info');
    });
  }

  /* ---------- LEGAL ---------- */
  const LEGAL_DOCS = {
    priv:{title:'Política de privacidad',body:`
      <p>La Municipalidad Distrital de La Joya respeta tu privacidad. Esta plataforma demostrativa almacena datos exclusivamente en tu navegador mediante localStorage. No enviamos información personal a servidores externos.</p>
      <h4>Datos que almacenamos localmente</h4>
      <p>Tu carrito de compras, favoritos, sesión demo y preferencias como la moneda seleccionada. Puedes borrarlos en cualquier momento limpiando el almacenamiento del navegador.</p>
      <h4>Datos enviados a terceros</h4>
      <p>Las APIs de mapas (OpenStreetMap) y clima (Open-Meteo) reciben solo coordenadas geográficas del distrito, sin datos personales identificables.</p>
      <h4>Contacto</h4>
      <p>Para consultas de privacidad escríbenos a hola@lajoya.gob.pe o visítanos en Plaza de Armas s/n, La Joya.</p>
    `},
    terms:{title:'Términos de servicio',body:`
      <p>Al usar este portal aceptas las siguientes condiciones de uso de la plataforma demostrativa del distrito de La Joya.</p>
      <h4>1. Naturaleza demostrativa</h4>
      <p>Esta es una plataforma de demostración. Las transacciones, pedidos y postulaciones no son reales. Los precios y tarifas son referenciales y pueden no coincidir con la oferta actual de cada negocio.</p>
      <h4>2. Registro de negocios</h4>
      <p>Los negocios publicados son verificados por la municipalidad en máximo 48 horas. En modo demo, los registros quedan en tu navegador y no se publican al público general.</p>
      <h4>3. Pagos</h4>
      <p>Los pagos se procesan a través de pasarelas sandbox (Culqi, Niubiz) o pagos demo con QR. No se realizan cobros reales.</p>
      <h4>4. Responsabilidad</h4>
      <p>La municipalidad no se responsabiliza por transacciones realizadas directamente entre usuarios y negocios fuera de la plataforma.</p>
    `},
    sec:{title:'Seguridad',body:`
      <p>La seguridad de tus datos es prioritaria. Implementamos las siguientes medidas en la plataforma.</p>
      <h4>Almacenamiento local</h4>
      <p>Tus datos de sesión y preferencias se guardan solo en tu navegador. No usamos cookies de seguimiento.</p>
      <h4>Claves demo</h4>
      <p>Las contraseñas que crees en modo demo no viajan por internet. Te recomendamos no usar contraseñas reales.</p>
      <h4>APIs públicas</h4>
      <p>Solo consumimos APIs públicas abiertas (OpenStreetMap, Open-Meteo, SUNAT RUC). No se exponen claves privadas en el frontend.</p>
      <h4>Reporte de vulnerabilidades</h4>
      <p>Si detectas un problema de seguridad, repórtalo a seguridad@lajoya.gob.pe.</p>
    `},
    cookies:{title:'Cookies y datos locales',body:`
      <p>Este portal no utiliza cookies de seguimiento. En su lugar, empleamos localStorage del navegador para guardar tus preferencias.</p>
      <h4>¿Qué guardamos?</h4>
      <p>Carrito de compras, lista de favoritos, sesión demo, moneda seleccionada y la aceptación de esta política de datos locales.</p>
      <h4>¿Cómo borrarlos?</h4>
      <p>Puedes borrar todos los datos desde el menú de tu navegador → Borrar datos de navegación → Datos de sitios. También puedes usar el botón "Cerrar sesión" para borrar tu sesión demo.</p>
      <h4>¿Por qué los usamos?</h4>
      <p>Para recordar tu carrito entre visitas, mantener tu moneda preferida y no volver a preguntarte por la política de cookies cada vez que entras.</p>
    `}
  };
  function initLegal(){
    document.addEventListener('click',(e)=>{
      const b = e.target.closest('[data-action="legal"]'); if(!b) return;
      const doc = LEGAL_DOCS[b.dataset.doc]; if(!doc) return;
      $('#legalBody').innerHTML = `<h3>${doc.title}</h3>${doc.body}`;
      openModal('mdLegal');
    });
  }

  /* ---------- SOCIAL ---------- */
  function initSocial(){
    document.addEventListener('click',(e)=>{
      const b = e.target.closest('[data-action="social"]'); if(!b) return;
      e.preventDefault();
      toast('Abriendo '+b.dataset.net+' (demo)…','info');
    });
  }

  /* ---------- TO TOP ---------- */
  function initToTop(){
    document.addEventListener('click',(e)=>{
      const b = e.target.closest('[data-action="to-top"]'); if(!b) return;
      window.scrollTo({top:0,behavior:'smooth'});
    });
  }

  /* ---------- CLOSE MODAL HANDLERS ---------- */
  function initModalClose(){
    document.addEventListener('click',(e)=>{
      if(e.target.matches('[data-close]') || e.target.closest('[data-close]')){
        const modal = e.target.closest('.modal'); if(modal) closeModal(modal.id);
      }
    });
    document.addEventListener('keydown',(e)=>{
      if(e.key==='Escape') closeAllModals();
    });
    // confirm buttons
    document.addEventListener('click',(e)=>{
      if(e.target.matches('[data-action="confirm-yes"]')){
        closeModal('mdConfirm');
        if(confirmCb) confirmCb(true); confirmCb=null;
      }else if(e.target.matches('[data-action="confirm-no"]')){
        closeModal('mdConfirm');
        if(confirmCb) confirmCb(false); confirmCb=null;
      }
    });
  }

  /* ---------- EXPORT ---------- */
  window.LJ = {
    DATA, store, $, $$, fmt, money, esc, star, toast,
    openModal, closeModal, closeAllModals, confirm,
    initTransporte, renderIntegraciones, renderDER, initMap, renderMapMarkers,
    initWeather, initAttention, renderAgenda, initCarousel,
    initHeaderSearch, initMobileMenu, initPreloader, initReveal,
    initPopovers, initMapChips, initCurrency, initNewsletter, initLegal, initSocial,
    initToTop, initModalClose, LEGAL_DOCS,
    getMap(){ return mapInstance; }
  };

  /* ---------- AUTO INIT (cosas que no dependen de commerce/app) ---------- */
  document.addEventListener('DOMContentLoaded',()=>{
    LJ.initPreloader();
    LJ.initReveal();
    LJ.initMobileMenu();
    LJ.initHeaderSearch();
    LJ.initWeather();
    LJ.initAttention();
    LJ.renderAgenda();
    LJ.initCarousel();
    LJ.initMap();
    LJ.initMapChips();
    LJ.initTransporte();
    LJ.renderIntegraciones();
    LJ.renderDER();
    LJ.initCurrency();
    LJ.initNewsletter();
    LJ.initLegal();
    LJ.initSocial();
    LJ.initToTop();
    LJ.initModalClose();
    LJ.initPopovers();
  });

})();
