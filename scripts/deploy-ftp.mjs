import * as ftp from 'basic-ftp';
import * as path from 'path';
import * as fs from 'fs';

async function deploy() {
  const server = process.env.FTP_SERVER || process.env.FTP_HOST;
  const user = process.env.FTP_USERNAME || process.env.FTP_USER;
  const password = process.env.FTP_PASSWORD;
  const port = parseInt(process.env.FTP_PORT || '21', 10);
  const preferredDir = process.env.FTP_SERVER_DIR || '';

  console.log('----------------------------------------------------');
  console.log('🚀 Iniciando despliegue automatizado a Hostinger...');
  console.log(`📡 Servidor: ${server || '[NO CONFIGURADO]'}`);
  console.log(`👤 Usuario: ${user || '[NO CONFIGURADO]'}`);
  console.log(`🔌 Puerto: ${port}`);
  console.log('----------------------------------------------------');

  if (!server || !user || !password) {
    console.error('❌ ERROR FATAL: Faltan credenciales de FTP (FTP_SERVER/FTP_HOST, FTP_USERNAME/FTP_USER, FTP_PASSWORD).');
    process.exit(1);
  }

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    console.error('❌ ERROR: La carpeta dist/ no existe. Ejecuta "npm run build" antes de desplegar.');
    process.exit(1);
  }

  const client = new ftp.Client(600000); // 10 min timeout
  client.ftp.verbose = true;

  // Intentar primero con TLS/FTPS (loose) y si falla, fallback a FTP estándar
  const connectionModes = [
    { name: 'FTPS (TLS explícito)', secure: 'explicit', secureOptions: { rejectUnauthorized: false } },
    { name: 'FTP estándar (sin TLS)', secure: false, secureOptions: { rejectUnauthorized: false } }
  ];

  let connected = false;

  for (const mode of connectionModes) {
    try {
      console.log(`🔄 Probando conexión mediante ${mode.name}...`);
      await client.access({
        host: server,
        user: user,
        password: password,
        port: port,
        secure: mode.secure,
        secureOptions: mode.secureOptions
      });
      console.log(`✅ Conexión establecida exitosamente usando ${mode.name}`);
      connected = true;
      break;
    } catch (err) {
      console.warn(`⚠️ No se pudo conectar con ${mode.name}: ${err.message}`);
      client.close();
    }
  }

  if (!connected) {
    console.error('❌ No se pudo establecer conexión con el servidor FTP de Hostinger. Verifica host, usuario y contraseña.');
    process.exit(1);
  }

  try {
    const currentWorkingDir = await client.pwd();
    console.log(`📂 Directorio inicial en el servidor: ${currentWorkingDir}`);

    const rootList = await client.list();
    const rootItems = rootList.map(item => item.name);
    console.log(`📄 Contenido encontrado en la raíz FTP: [${rootItems.join(', ')}]`);

    // Detección inteligente de la ruta de destino
    let targetDir = '';

    if (preferredDir && preferredDir.trim() !== '') {
      targetDir = preferredDir.trim().replace(/^\/+/, ''); // Quitar barra inicial
      console.log(`🎯 Usando ruta configurada manualmente: ${targetDir}`);
    } else {
      // Búsqueda de rutas habituales en Hostinger
      const candidates = [
        'domains/unke.com.ar/public_html/elgalpon',
        'public_html/elgalpon',
        'domains/elgalponfd.com.ar/public_html',
        'public_html',
        ''
      ];

      for (const candidate of candidates) {
        if (!candidate) {
          targetDir = '';
          break;
        }

        try {
          await client.cd(candidate);
          targetDir = candidate;
          console.log(`✨ Ruta detectada automáticamente en Hostinger: ${targetDir}`);
          await client.cd(currentWorkingDir); // Volver al inicio
          break;
        } catch (e) {
          // Intentar el siguiente candidato
        }
      }
    }

    if (targetDir) {
      console.log(`📁 Navegando/creando directorio destino: ${targetDir}`);
      await client.ensureDir(targetDir);
    }

    const finalDir = await client.pwd();
    console.log(`📍 Directorio final de despliegue: ${finalDir}`);

    console.log(`📤 Subiendo archivos compilados desde ${distDir} hacia Hostinger...`);
    await client.uploadFromDir(distDir);

    console.log('----------------------------------------------------');
    console.log('🎉 ¡DESPLIEGUE A HOSTINGER COMPLETADO CON ÉXITO!');
    console.log('----------------------------------------------------');
  } catch (uploadErr) {
    console.error(`❌ Error durante la sincronización de archivos: ${uploadErr.message}`);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy().catch(err => {
  console.error('❌ Error no controlado en despliegue:', err);
  process.exit(1);
});
