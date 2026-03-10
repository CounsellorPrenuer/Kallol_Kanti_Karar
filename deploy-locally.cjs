const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const rootDir = process.cwd();
const outDir = path.join(rootDir, 'out');

/**
 * Recursively copy a directory or file
 */
function copySync(src, dest) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(child => {
            copySync(path.join(src, child), path.join(dest, child));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

/**
 * Recursively remove a directory or file
 */
function removeSync(p) {
    if (fs.existsSync(p)) {
        const stats = fs.statSync(p);
        if (stats.isDirectory()) {
            fs.readdirSync(p).forEach(child => {
                removeSync(path.join(p, child));
            });
            // In Node.js < 14.14.0, use rmdirSync. In newer, rmSync is better.
            try {
                if (fs.rmSync) {
                    fs.rmSync(p, { recursive: true, force: true });
                } else {
                    fs.rmdirSync(p, { recursive: true });
                }
            } catch (err) {
                // Fallback for older environments
                if (fs.existsSync(p)) fs.rmdirSync(p);
            }
        } else {
            fs.unlinkSync(p);
        }
    }
}

async function deploy() {
    console.log('🚀 Starting Purely Static deployment to root...');

    try {
        // 1. Build the project
        console.log('📦 Building project...');
        execSync('npm run build', { stdio: 'inherit' });

        if (!fs.existsSync(outDir)) {
            throw new Error('Build failed: "out" directory not found.');
        }

        // 2. Clear old static assets (folder-based routes)
        console.log('🧹 Cleaning old root assets...');
        const staticFolders = ['_next', 'about', 'contact', 'services', 'home', '404'];
        staticFolders.forEach(folder => {
            const p = path.join(rootDir, folder);
            if (fs.existsSync(p)) {
                removeSync(p);
            }
        });

        // 3. Move contents from out/ to root
        console.log('🚚 Moving build artifacts to root...');
        const buildFiles = fs.readdirSync(outDir);

        for (const file of buildFiles) {
            const src = path.join(outDir, file);
            const dest = path.join(rootDir, file);

            if (file === 'out') continue;

            if (fs.existsSync(dest)) {
                removeSync(dest);
            }
            copySync(src, dest);
        }

        console.log('✅ Success! Build artifacts moved to root.');

        // 4. Manual user instruction for push
        console.log('\n📢 FINAL STEPS:');
        console.log('1. git add .');
        console.log('2. git commit -m "Deploy static site only"');
        console.log('3. git push origin main');

    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

deploy();
