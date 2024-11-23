const { Builder, By, Key, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

// Crea la carpeta de screenshots si no existe
const screenshotDir = path.join(__dirname, 'screenshot');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
}

// Crea la carpeta para los reportes HTML si no existe
const reportDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir);
}

// Función para tomar capturas de pantalla
async function takeScreenshot(driver, filename) {
    const image = await driver.takeScreenshot();
    fs.writeFileSync(path.join(screenshotDir, filename), image, 'base64');
}

// Función para generar el reporte HTML
function generateReport(results) {
    let htmlContent = `
    <html>
    <head>
        <title>Reporte de Prueba Automatizada</title>
        <style>
            body { font-family: Arial, sans-serif; }
            h1 { color: #333; }
            h2 { color: #444; }
            .step { margin-bottom: 20px; }
            img { max-width: 600px; height: auto; border: 1px solid #ccc; }
        </style>
    </head>
    <body>
        <h1>Reporte de Prueba Automatizada - Facebook Login</h1>
        <h2>Resumen de la Prueba</h2>
        <p>Status: ${results.status}</p>
        <p>Fecha: ${new Date().toLocaleString()}</p>
        
        <h2>Pasos de la Prueba</h2>`;

    // Agregar los pasos al reporte
    results.steps.forEach(step => {
        htmlContent += `
        <div class="step">
            <h3>${step.description}</h3>
            <img src="/screenshot/${step.screenshot}" alt="${step.description}">
        </div>`;
    });

    htmlContent += `
    </body>
    </html>`;

    // Escribir el archivo HTML
    fs.writeFileSync(path.join(reportDir, 'login_test_report.html'), htmlContent);
}

(async function loginTest() {
    let driver = await new Builder().forBrowser('chrome').build();
    let results = {
        status: 'Fallido',
        steps: []
    };

    try {
        // Navegar a la página de inicio de sesión de Facebook
        await driver.get('https://www.facebook.com/');
        await takeScreenshot(driver, 'page_loaded.png');
        results.steps.push({ description: 'Página cargada', screenshot: 'page_loaded.png' });

        // Ingresar el correo electrónico
        await driver.findElement(By.id('email')).sendKeys('jeffcopin03@gmail.com');
        await takeScreenshot(driver, 'email_entered.png');
        results.steps.push({ description: 'Correo electrónico ingresado', screenshot: 'email_entered.png' });

        // Ingresar la contraseña
        await driver.findElement(By.id('pass')).sendKeys('1230654ronal');
        await takeScreenshot(driver, 'password_entered.png');
        results.steps.push({ description: 'Contraseña ingresada', screenshot: 'password_entered.png' });

        // Presionar Enter para iniciar sesión
        await driver.findElement(By.id('pass')).sendKeys(Key.RETURN);

        // Esperar hasta que el título de la página cambie a "Facebook"
        await driver.wait(until.titleContains('Facebook'), 10000);

        // Captura de pantalla después de iniciar sesión
        await takeScreenshot(driver, 'logged_in.png');
        results.steps.push({ description: 'Sesion iniciada', screenshot: 'logged_in.png' });

        results.status = 'Completada con éxito';
        console.log('Prueba de inicio de sesión completada con éxito.');
    } catch (error) {
        results.status = 'Error';
        console.error('Error durante la prueba:', error);
    } finally {
        await driver.quit();
        // Generar el reporte HTML
        generateReport(results);
    }
})();
