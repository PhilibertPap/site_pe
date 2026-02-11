const fs = require('fs-extra');
const path = require('path');
const mustache = require('mustache');

async function build() {
    try {
        console.log("🔨 Build en cours...");

        // Chemins
        const templatePath = path.join(__dirname, 'src', 'templates', 'index.mustache');
        const dataPath = path.join(__dirname, 'src', 'data', 'site.json');
        const outputDir = path.join(__dirname, 'public');
        const outputFile = path.join(outputDir, 'index.html');

        // Lire template
        const template = await fs.readFile(templatePath, 'utf8');

        // Lire data
        const data = await fs.readJson(dataPath);

        // Générer HTML
        const rendered = mustache.render(template, data);

        // Créer dossier public si absent
        await fs.ensureDir(outputDir);

        // Écrire fichier final
        await fs.writeFile(outputFile, rendered);

        // Copier CSS
        await fs.copy(
            path.join(__dirname, 'src', 'css'),
            path.join(outputDir, 'css')
        );

        console.log("✅ Build terminé avec succès.");
    } catch (error) {
        console.error("❌ Erreur de build :", error);
    }
}

build();
